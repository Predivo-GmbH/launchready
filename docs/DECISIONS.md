# launchready Decision Log

> **Purpose:** capture WHY we chose something, at the moment we chose it, in the project it belongs to.
> Adopted 2026-08-24 (Roger: *"take all of them"*). This replaces the habit of leaving decisions in
> session memory, which is exactly why they get re-argued weeks later.
>
> **The rule (checklist Rule 37):** when an architectural decision, an approach change, or a
> cost-impacting agreement is made, write the row **before writing any code**. A decision IS a
> milestone. Do not wait for the implementation to finish.
>
> **Why HERE and not in memory:** the old convention lived in global memory files as
> `decision_*.md`. It quietly died: **27 notes exist and the newest is dated 2026-07-15**, while
> **241 memory files carry an August 2026 date** (both counted 2026-08-24). Nothing enforced it and
> nobody opening the project could see it. A file in the repo is visible to whoever opens the repo,
> survives context compaction, and travels with the code.

## How to write a row

- **One row per decision.** Short. If it needs more than a paragraph, link a doc.
- **Record the REJECTED option too.** A decision with no alternative was never a decision, and the
  rejected option is the half that stops the re-argument.
- **Never delete a row.** If a decision is reversed, add a NEW row that supersedes it and set the old
  row's status to `superseded by D-nnn`. The history is the value.
- **Date it.** Absolute dates only, never "last week".
- **Money, pricing, or anything customer-visible needs Roger's sign-off recorded in the row.**

## Decisions

| ID | Date | Decision | Why | Rejected alternative | Decided by | Status |
|---|---|---|---|---|---|---|
| D-001 | 2026-10-26 | Patch Next to 16.4.3, Sentry to 10.75.2 and Vitest/coverage to 4.1.12; refresh their lockfile dependencies within the existing major versions | The dependency alarm includes high and critical advisories. The updated lockfile's audit reports zero findings. npm 11 resolves the npm 10 Arborist peer-graph crash; the resulting lockfile is synchronized with npm 10 for CI compatibility | A forced audit fix or a Sentry major upgrade would expand the compatibility change beyond the repair | Codex, under Roger's instruction to finish the workboard repairs | active |

<!--
Example row, delete when the first real one is added:

| D-001 | 2026-08-24 | Transactional email goes through Postmark, not Supabase built-in | Supabase auth email hard-caps at 2/hour/user without custom SMTP, which broke 6+ projects | Supabase built-in SMTP (rate limit), SendGrid (no existing account) | Roger | active |
-->

## Superseded decisions
<!-- Move nothing here. This section is a pointer only: superseded rows STAY in the table above with
     their status changed, so the trail is readable top to bottom. -->
