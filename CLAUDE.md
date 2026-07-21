@AGENTS.md

## Project

Web dashboard for the VVER TÜBİTAK 2204-A project: an AI-based decision support system
for VVER-1000 reactor operation (anomaly detection + fault classification + SHAP
explainability), built on IAEA/MEPhI Enrico TSO simulator data. Mentor: Ferhat (chemistry
teacher); students: Ömer Faruk and Beren (10th grade, beginners). Target: TÜBİTAK 2204-A
Software category, January 2027 deadline. This repo is the web deliverable — originally
planned as a Streamlit demo, now a full Next.js + Supabase + Vercel stack chosen for
scale with simulator data volume.

## Infrastructure

- GitHub: https://github.com/VVER-AI/vver-tubitak (account/org: VVER-AI)
- Production: https://vver-tubitak.vercel.app (Vercel project `vver-aii/vver-tubitak`)
- Supabase project: ref `bowsildqipdjnhwpnjay`, region eu-central-1, org `pgeabdocsojhszlvilfe`
  (Free tier)
- GitHub Actions secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`,
  `SUPABASE_DB_PASSWORD`

## Workflow

Commit and push changes to GitHub automatically as part of normal iteration on this
project (no need to ask before each push). Deploys are handled by GitHub Actions, not the
Vercel GitHub App/Git integration (that App's install requires a one-click browser
authorization only the human can grant, and no browser-automation tool was available when
this was set up):

- `.github/workflows/deploy.yml` — on every push to `main`, pulls Vercel production env,
  builds, and deploys to production via the Vercel CLI (`VERCEL_TOKEN` auth).
- `.github/workflows/supabase-backup.yml` — daily at 03:00 UTC (+ manual
  `workflow_dispatch`), dumps the Supabase DB via `pg_dump` inside a `postgres:17` Docker
  container (the Ubuntu runner's apt `pg_dump` is v16 and refuses v17 servers) and commits
  the dump to a dedicated `backups` branch, 30-day retention. Added because the Free-tier
  Supabase project has no built-in automated backups.

Gotchas hit once already, don't repeat:
- Any `NEXT_PUBLIC_*` env var in Vercel must be added with `--no-sensitive`
  (`vercel env add NAME production --no-sensitive --value "..."`). Vercel's default
  "Sensitive" type can't be read back by `vercel env pull`/CI builds — it silently bakes
  the literal string `[SENSITIVE]` into the build instead of the real value, which caused
  a production 500 ("Invalid supabaseUrl") the first time.
- `gh` needs the `workflow` scope to push changes under `.github/workflows/`
  (`gh auth refresh -s workflow` if pushes get rejected with a scope error).
- Any Actions job that needs to `git push` (e.g. the backup workflow) needs
  `permissions: contents: write` set explicitly — the default `GITHUB_TOKEN` is read-only.
- `vercel tokens add` fails with 403 when run under a CLI/OAuth login session — new Vercel
  tokens can only be created from the dashboard (https://vercel.com/account/tokens).
- Supabase CLI has no non-interactive browser login in this environment; use a personal
  access token from https://supabase.com/dashboard/account/tokens as
  `SUPABASE_ACCESS_TOKEN` instead of `supabase login`.

## Next up

Design the Supabase schema for reactor scenarios / simulator time-series data, then wire
`vver_parser.py`'s output into it. See the `project-vver-tubitak` memory (outside this
repo, in the assistant's home-directory memory store) for the full ML architecture plan
(autoencoder + classifier + SHAP) and dataset plan (8 scenario files: 4 steady-state, 4
labeled faults).
