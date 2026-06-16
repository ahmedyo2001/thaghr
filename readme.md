# Thaghr — ثغر

> *Find the gap. Fill it.*

---

## What is this?

The Muslim ummah has millions of skilled people — developers, designers, writers, translators — who want to contribute to something meaningful but don't know where to start.

They search. They find abandoned repos, outdated lists, and dead links. They give up.

**Thaghr** solves this. It is a curated, verified platform that connects skilled Muslims to active open source Islamic projects — matched by skill and time available.

The name comes from the Arabic **ثغر** — a gap, a breach, a frontier that needs defending. The scholars of Islam used it to describe any gap in the ummah's defences that needed to be filled. Today, there are gaps in Islamic technology, knowledge, and infrastructure. Thaghr helps you find yours.

**Live site:** [ahmedyo2001.github.io/thaghr](https://ahmedyo2001.github.io/thaghr)

---

## How it works

1. You arrive and filter by your skill, time available, and repo activity
2. Thaghr shows you active Islamic projects that match
3. Each project lists real, currently-open tasks — pulled live from GitHub, summarized in plain English, with a time estimate and skill tags
4. You click a task, it takes you straight to the GitHub issue
5. You contribute — and the ummah moves forward

No digging through dead repos. No figuring out what skills a project needs. No wasted time.

Behind the scenes, a daily automated job re-checks every listed repo, pulls its open "good first issue" / "help wanted" tasks, uses AI to summarize and estimate effort, and checks how recently the repo was updated — so listings stay fresh without manual upkeep.

---

## Who can contribute to Thaghr itself?

Anyone. Thaghr is for all skills — not just developers:

| Skill | Example contribution |
|-------|---------------------|
| **Frontend / Backend** | Build features, fix bugs, improve performance |
| **Design** | UI/UX improvements, icons, visual identity |
| **Writing** | Project descriptions, documentation, blog posts |
| **Translation** | Make content accessible in more languages |
| **Research** | Find and verify active Islamic OS projects |
| **Testing** | QA, bug reports, user testing |

Thaghr's own open tasks are listed on the site itself — it's one of the projects you can filter for.


---

## Submitting a project

Use the "Submit a project" button on the site. Submissions go into a review queue and are checked before going live.

**We only list projects that are:**
- Actively maintained (recent commits)
- Open to external contributors
- Serving the Muslim community or da'wah
- Have at least one clear task a newcomer can pick up

---

## How the listings stay fresh

A scheduled job runs daily:

1. Reads every approved project from the database
2. Fetches each repo's open issues from GitHub
3. Filters to issues labeled `good first issue`, `help wanted`, etc.
4. Sends each one to an AI model to generate a short plain-English summary, a time estimate (15 min / 1 hour / ongoing), and relevant skill tags
5. Records the repo's last commit date
6. Updates the listing — all automatically, no manual editing needed

Repos with no recent activity are flagged, and the "Active only" filter hides anything stale.

---

## Project status

**Built (v0 + most of v1):**
- [x] Project listing page with skill, time, and activity filters
- [x] Project submission form
- [x] Daily automated sync of live GitHub tasks
- [x] AI-generated task summaries, time estimates, and skill tags
- [x] "Last updated" freshness indicators

**Still to do:**
- [ ] Admin review flow for submitted projects (currently manual)
- [ ] Expand to 8–10+ verified projects
- [ ] "Report broken link" feature for stale listings

---

## Roadmap

**v2 — Personalisation**
User profiles with skills and availability. Weekly digest: "Here's what you can contribute this week." Smarter matching over time.

**v3 — Community layer**
Contributors share completed work. Accountability partners. A live feed of Muslim contributions across the Islamic tech world. This turns a directory into a movement.

**v4 — Beyond code**
Designers, writers, translators, and testers all have a dedicated space. "I have 15 minutes and I speak Urdu" → here is exactly what you can do right now.

**Long-term vision:**
The central coordination layer for Islamic tech contributions globally — channelling Muslim skills toward meaningful work, and making every contribution visible and celebrated.

---

## The name

**ثغر** (thaghr) — historically referred to the frontier posts of the Islamic world: the gaps that needed defenders. Scholars and soldiers alike were called to fill the thaghr of their time.

The thaghr of our time is in technology, knowledge infrastructure, and digital da'wah. This platform exists to help the ummah find and fill it.

---

## License

MIT License — open for anyone to use, fork, and build upon.

---

*Built with the intention of benefiting the ummah.*
*"The best of people are those most beneficial to others." — Prophet Muhammad ﷺ*
