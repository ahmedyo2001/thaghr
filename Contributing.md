# Contributing to Thaghr

Thank you for considering contributing — جزاك الله خيرا.

This guide covers how the project is structured, how to run it locally, and how to submit changes.

---

## Project structure

```
thaghr/
├── index.html                      # The entire site (HTML, CSS, JS in one file)
├── scripts/
│   └── sync-tasks.js               # Daily job: fetches GitHub issues, classifies with AI, updates Supabase
├── .github/
│   └── workflows/
│       └── daily-sync.yml          # Runs sync-tasks.js daily + on manual trigger
├── schema.sql                      # Database schema (for reference / fresh setup)
├── migration.sql                   # Schema changes applied after initial setup
└── README.md
```

---

## How it works

- **Frontend** (`index.html`) is a static page that reads project data directly from a Supabase database (public read access for approved projects).
- **Submission form** writes new project suggestions into a `pending_submissions` table for review.
- **Daily sync** (`scripts/sync-tasks.js`) runs via GitHub Actions once a day. It fetches open issues from each listed repo, summarizes them with an AI model, and updates the database.

You don't need your own Supabase project to work on the **frontend** — `index.html` already points at the live (read-only for you) database, so you'll see real data when testing locally.

For changes to **`sync-tasks.js`**, you'll need your own Supabase project + API keys to test safely (see below), since it writes data.

---

## Running locally

### Frontend changes (`index.html`)
No build step needed.

1. Fork and clone the repo
2. Open `index.html` directly in a browser (or use a local server like `python3 -m http.server`)
3. It will load live project data from Supabase automatically

### Sync script changes (`scripts/sync-tasks.js`)
1. Create your own free [Supabase](https://supabase.com) project
2. Run `schema.sql` and `migration.sql` in your project's SQL editor
3. Set environment variables locally:
   ```bash
   export SUPABASE_URL=your_project_url
   export SUPABASE_SECRET_KEY=your_secret_key
   export OPENROUTER_API_KEY=your_openrouter_key
   ```
4. Run: `node scripts/sync-tasks.js`

Do not run the sync script against the production database unless you know what you're doing — it writes/overwrites data.

---

## Making a contribution

1. **Find a task** — check the open issues on this repo, or browse Thaghr itself for tasks tagged for this project
2. **Fork** the repo and create a branch: `git checkout -b fix/short-description`
3. **Make your changes**
4. **Test** — make sure `index.html` still loads correctly and your change works as expected
5. **Commit** with a clear message describing what changed and why
6. **Open a Pull Request** against `main`, referencing the issue number (e.g. "Closes #4")

---

## Review process

- All PRs are reviewed by a maintainer before merging
- Small, focused PRs (one issue/feature at a time) are easier to review and merge quickly
- If your PR touches `sync-tasks.js` or the database schema, please describe what you tested and how

---

## Code style

- Keep `index.html` as a single self-contained file (no build tools/frameworks) — this keeps deployment to GitHub Pages simple
- Match the existing dark theme and CSS variable patterns already in the file
- Comment non-obvious logic, especially in `sync-tasks.js`

---

## Questions?

Open an issue, or reach out to the maintainer directly. All contributions, big or small, are appreciated.

*"The best of people are those most beneficial to others." — Prophet Muhammad ﷺ*
