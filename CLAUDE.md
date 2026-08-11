# LaunchReady

Web product at `launchready.predivo.ch`. Supabase-backed.

## Stack
Next.js + React + TypeScript + Tailwind + Supabase (Postgres / Auth / edge functions). Repo: `Arivioo/launchready`, default branch `master`. Supabase `project_id = "launchready"`. Build output is a static export (`out/`).

## Dev
- Install: `npm install`
- Dev server: `npm run dev`
- Before pushing: `npm run lint` && `npm run test:coverage` && `npm run build`.

## Deploy (Metanet FTP, NEVER Vercel)
Canonical deploy standard: `C:\Business\Internal Projects\standards\deploy-standard.md` (copy config from `project-starter`, never hand-write).
- `deploy.yml` ships `launchready.predivo.ch`; `monitoring-cron.yml` runs a weekly monitor; keep-alive keeps Supabase warm; `test.yml` runs nightly.
- If/when this graduates to the staging-first standard (like BoatBuddy / Distribution-OS), add a `staging.launchready.predivo.ch` tier per the Valrano pattern (deploy-standard §4) before gating prod on it.
- Always name the environment (STAGING vs PRODUCTION) on every deploy.

## How we work (canonical, do not duplicate here)
- A-to-Z workflow: `C:\Business\Templates\1-Person AI Business Playbook\docs\ONE_PERSON_AI_BUSINESS_WORKFLOW.md`
- Design pipeline: `C:\Business\Templates\project-starter\docs\DESIGN_PIPELINE.md`
- Audit/QC: `C:\Business\Audits\audit-framework.md`
- Operating doctrine, gates, boundaries: global `~/.claude/CLAUDE.md` + the Pre-Action Checklist.
- Human QA gate: after any UI change, Playwright (desktop + mobile) + console + screenshot before "done".

## Project-specific
- Next.js (not Vite) is the one stack difference from most fleet products; build/export accordingly.
- Keep `docs/FEATURES.md` current when adding/removing features.
