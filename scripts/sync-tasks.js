// scripts/sync-tasks.js
//
// Runs once a day via GitHub Actions.
// For each project in Supabase:
//   1. Fetches open issues from its GitHub repo
//   2. Filters to issues labeled "good first issue" or "help wanted"
//   3. Sends each issue to an LLM (via OpenRouter) to get a plain-English
//      summary + time estimate + relevant skill tags
//   4. Writes the resulting "tasks" array back to the project's row in Supabase,
//      updates time_options to the union of all task time estimates,
//      and updates "skills" to the union of skills found across today's tasks
//      (so a project's skill tags reflect what it currently needs, not a
//      static manual label - if a project goes quiet with no issues today,
//      its previous skills are kept rather than wiped).
//
// If the LLM call fails for any issue, falls back to a label-based heuristic
// so the system degrades gracefully instead of breaking.

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const GITHUB_TOKEN = process.env.GH_TOKEN; // provided automatically by GitHub Actions

const sb = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY);

const TARGET_LABELS = ['good first issue', 'help wanted', 'good-first-issue', 'beginner-friendly', 'documentation'];

// Fallback heuristic if the LLM call fails - maps label name to a rough time estimate
const LABEL_TIME_FALLBACK = {
  'good first issue': '15',
  'good-first-issue': '15',
  'beginner-friendly': '15',
  'documentation': '15',
  'help wanted': '60',
};

// Extract "owner/repo" from a GitHub URL like https://github.com/owner/repo
function parseRepo(url) {
  try {
    const u = new URL(url);
    const parts = u.pathname.split('/').filter(Boolean);
    if (parts.length < 2) return null;
    return { owner: parts[0], repo: parts[1] };
  } catch {
    return null;
  }
}

// Fetch basic repo metadata (used to get the last commit/push date)
async function fetchRepoInfo(owner, repo) {
  const url = `https://api.github.com/repos/${owner}/${repo}`;
  const res = await fetch(url, {
    headers: {
      'Accept': 'application/vnd.github+json',
      ...(GITHUB_TOKEN ? { 'Authorization': `Bearer ${GITHUB_TOKEN}` } : {})
    }
  });
  if (!res.ok) {
    console.warn(`  GitHub repo info error for ${owner}/${repo}: ${res.status}`);
    return null;
  }
  const data = await res.json();
  return data.pushed_at || null; // ISO timestamp of last push to any branch
}

// Fetch open issues from GitHub for a given owner/repo
async function fetchIssues(owner, repo) {
  const url = `https://api.github.com/repos/${owner}/${repo}/issues?state=open&per_page=30`;
  const res = await fetch(url, {
    headers: {
      'Accept': 'application/vnd.github+json',
      ...(GITHUB_TOKEN ? { 'Authorization': `Bearer ${GITHUB_TOKEN}` } : {})
    }
  });
  if (!res.ok) {
    console.warn(`  GitHub API error for ${owner}/${repo}: ${res.status}`);
    return [];
  }
  const issues = await res.json();
  // Exclude pull requests (GitHub's issues endpoint includes PRs too)
  return issues.filter(i => !i.pull_request);
}

// Filter issues down to ones with a label we care about
function filterRelevantIssues(issues) {
  return issues.filter(issue =>
    issue.labels.some(l => TARGET_LABELS.includes((l.name || '').toLowerCase()))
  ).slice(0, 6); // cap per project to keep things manageable
}

// Ask the LLM (via OpenRouter) to summarize an issue and estimate effort
async function classifyIssue(issue, matchedLabel) {
  const prompt = `You are helping categorize a GitHub issue for a "find something to contribute to" website aimed at developers and contributors with varying skill levels and free time.

Issue title: "${issue.title}"
Issue body (may be empty): "${(issue.body || '').slice(0, 800)}"
GitHub label: "${matchedLabel}"

Respond with ONLY a JSON object, no other text, in this exact format:
{"summary": "<one short plain-English sentence describing the task, max 15 words>", "time": "<one of: 15, 60, ongoing>", "skills": ["<one or more of: frontend, backend, ml, design, writing, translation>"]}

"time" guide: 15 = a quick fix/typo/small change doable in ~15 minutes, 60 = a focused task doable in about an hour, ongoing = a larger feature or open-ended task.`;

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'qwen/qwen3.6-flash',
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!res.ok) throw new Error(`OpenRouter error ${res.status}`);

    const data = await res.json();
    const text = data.choices[0].message.content.trim();
    // Strip markdown code fences if the model added them anyway
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    return {
      summary: parsed.summary || issue.title,
      time: ['15', '60', 'ongoing'].includes(parsed.time) ? parsed.time : '60',
      skills: Array.isArray(parsed.skills) ? parsed.skills : []
    };
  } catch (err) {
    console.warn(`  LLM classification failed for issue #${issue.number}, using fallback:`, err.message);
    return {
      summary: issue.title,
      time: LABEL_TIME_FALLBACK[matchedLabel] || '60',
      skills: []
    };
  }
}

async function syncProject(project) {
  console.log(`Syncing: ${project.name}`);
  const parsed = parseRepo(project.repo_url);
  if (!parsed) {
    console.warn(`  Could not parse repo URL: ${project.repo_url}`);
    return;
  }

  const allIssues = await fetchIssues(parsed.owner, parsed.repo);
  const relevant = filterRelevantIssues(allIssues);
  const lastCommit = await fetchRepoInfo(parsed.owner, parsed.repo);

  if (relevant.length === 0) {
    console.log(`  No matching open issues found.`);
    // Still update last_commit even if there are no tasks to add
    if (lastCommit) {
      await sb.from('projects').update({ last_commit: lastCommit }).eq('id', project.id);
    }
    return;
  }

  const tasks = [];
  const timeSet = new Set();
  const skillSet = new Set();

  for (const issue of relevant) {
    const matchedLabel = (issue.labels.find(l => TARGET_LABELS.includes((l.name || '').toLowerCase())) || {}).name || 'help wanted';
    const result = await classifyIssue(issue, matchedLabel.toLowerCase());

    tasks.push({
      title: result.summary,
      url: issue.html_url,
      time: result.time,
      label: matchedLabel
    });
    timeSet.add(result.time);
    (result.skills || []).forEach(s => skillSet.add(s));

    // Avoid hitting OpenRouter's free-tier rate limit (20 requests/minute)
    await new Promise(r => setTimeout(r, 4000));
  }

  const time_options = Array.from(timeSet);
  // Dynamic skills = union of skills across today's open tasks.
  // If the LLM returned no skills at all (e.g. all calls failed), keep the
  // project's existing skills rather than wiping out its categorization.
  const skills = skillSet.size > 0 ? Array.from(skillSet) : project.skills;

  const { error } = await sb
    .from('projects')
    .update({ tasks, time_options, last_commit: lastCommit, skills })
    .eq('id', project.id);

  if (error) {
    console.error(`  Failed to update Supabase for ${project.name}:`, error.message);
  } else {
    console.log(`  Updated with ${tasks.length} task(s).`);
  }
}

async function main() {
  const { data: projects, error } = await sb.from('projects').select('*').eq('approved', true);
  if (error) {
    console.error('Failed to fetch projects:', error.message);
    process.exit(1);
  }

  console.log(`Found ${projects.length} approved project(s).`);

  for (const project of projects) {
    await syncProject(project);
    // Small delay to be polite to APIs and stay under free-tier rate limits
    await new Promise(r => setTimeout(r, 1500));
  }

  console.log('Done.');
}

main();
