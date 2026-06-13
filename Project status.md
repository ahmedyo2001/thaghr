# Thaghr — Project Status

> ثغر — Find the gap. Fill it.

This document summarizes what's been built so far, how the system works, and what's left to do.

---

## Live sites

- **Thaghr**: `https://ahmedyo2001.github.io/thaghr`
- **Case for Islam**: `https://ahmedyo2001.github.io/Case_for_Islam`

---

## Architecture overview

```
Supabase (database)
   │
   ├── projects table ──────► index.html (live site, fetches on page load)
   │                              │
   │                              └── Submission form writes here too
   │                                  (into pending_submissions)
   │
   └── pending_submissions table ◄── public submission form

GitHub Actions (daily-sync.yml, runs daily at 3am UTC + manual trigger)
   │
   ├── Reads all approved projects from Supabase
   ├── For each project repo:
   │     ├── Fetches open issues from GitHub API
   │     ├── Filters to issues labeled "good first issue" / "help wanted" / etc.
   │     ├── Sends each issue to Qwen3.6 Flash (via OpenRouter) for:
   │     │     - plain-English summary
   │     │     - time estimate (15 / 60 / ongoing)
   │     │     - relevant skill tags (frontend/backend/ml/design/writing/translation)
   │     ├── Fetches repo's last commit date
   │     └── Writes tasks[], time_options[], last_commit back to Supabase
```

---

## Database schema (Supabase)

### `projects` table
| Column | Type | Description |
|---|---|---|
| `id` | uuid | Primary key |
| `name` | text | Project name |
| `description` | text | Manually written project description |
| `repo_url` | text | GitHub repo URL |
| `skills` | text[] | Project-level skill tags (manually set) |
| `time_options` | text[] | Union of all task time estimates — set by daily sync |
| `tasks` | jsonb | Array of `{title, url, time, label, skills}` — filled by daily sync |
| `last_commit` | timestamptz | Last push date — filled by daily sync |
| `badge` | text | `'active'` \| `'new'` \| `'research'` |
| `approved` | boolean | Must be `true` to show on site |

### `pending_submissions` table
Community-submitted projects awaiting review. Public can `insert` (via the submission form); only manual review moves a row into `projects`.

---

## Frontend (`index.html`)

**Filters:**
- Skill (frontend, backend, ML, design, writing, translation)
- Time available (15 min, 1 hour, ongoing)
- Repo activity ("All repos" / "Active only" — hides repos with no commit in 180+ days)

**Each project card shows:**
- Name, description, badge (Active/New/Research)
- Project-level skill tags
- A list of open tasks (from `tasks[]`), each showing:
  - AI-generated plain-English summary
  - Original GitHub label (e.g. "good first issue")
  - Time estimate badge
  - Task-level skill tags (added once "the skills thing" was wired up)
  - Links directly to the GitHub issue
- "Last updated Xd/mo/y ago" freshness badge
- Link to the repo

**Submission modal:**
- Form writes directly to `pending_submissions` in Supabase
- Fields: name, description, repo URL, skills needed, optional email

---

## Daily sync script (`scripts/sync-tasks.js`)

- Runs via `.github/workflows/daily-sync.yml`
- Secrets used: `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `OPENROUTER_API_KEY`, `GITHUB_TOKEN` (auto-provided)
- LLM model: `qwen/qwen3.6-flash` (paid, ~$0.0015/day at current volume — $2.53 credit lasts years)
- Falls back to label-based time estimates if the LLM call ever fails

---

## What's done

- [x] Case for Islam — animated GORAP argument tree, dark theme, live on GitHub Pages
- [x] Thaghr — project directory with filters, live on GitHub Pages
- [x] Supabase backend set up with RLS policies
- [x] Submission form (writes to `pending_submissions`)
- [x] Daily GitHub Actions sync — fetches issues, AI-classifies, updates Supabase
- [x] Freshness badges + "Active only" filter
- [x] Task-level skill tags wired up

---

## What's left

- [ ] **Admin approval flow** — currently `pending_submissions` requires manual review and manual copy into `projects`. (This is itself an open issue on the Thaghr repo — "Build a simple admin page to approve pending project submissions")
- [ ] **Add more projects** — currently only Case for Islam + Thaghr are listed. Need to research and add 5-10 more verified active Islamic OS repos
- [ ] **Case for Islam content** — GORAP argument tree still has placeholder arguments; needs real sourced content per section
- [ ] **"Report broken link" feature** — open issue on Thaghr repo, not yet built
- [ ] **Share both projects** — get the word out to friends/community for real contributions

---

## Useful links

- Supabase project: `https://vismlemfppwgujjwvkcv.supabase.co`
- OpenRouter model used: [qwen/qwen3.6-flash](https://openrouter.ai/qwen/qwen3.6-flash)
- GitHub Actions logs: Actions tab on the `thaghr` repo

---

*"The best of people are those most beneficial to others." — Prophet Muhammad ﷺ*
