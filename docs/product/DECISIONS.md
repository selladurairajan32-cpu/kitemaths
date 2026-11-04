# Decisions, requirement clarifications and change history

This file is the record of product decisions and of any change to the meaning or scope of the
backlog ([`backlog.md`](backlog.md)). It records decisions only. The rules for proposing and
approving changes are a separate backlog item, **GOV-004**, which is not yet authorised; until then
each entry names who decided.

**Entry types**
- **D-nnn: decision.** A product choice, with its reason, its impact and who owns it.
- **RC-nnn: requirement clarification.** How an ambiguous requirement is being read. The backlog text
  doesn't change.
- **CH-nnn: change history.** A change to a product document.

---

## Decisions

| ID | Date | Decision | Reason | Impact | Owner |
|---|---|---|---|---|---|
| D-000 | 3 Nov 2026 | *(Context, not a choice.)* Production (https://kitemaths.vercel.app) was deployed from `main` through pull requests #2 and #3, at the owner's request, **before** backlog v1.0 arrived. | Recorded for traceability. | The backlog's constraint "Do not deploy to production" applies from receipt onward (D-002). The live site reflects `main` at `bbf210a`. | Product Owner |
| D-001 | 3 Nov 2026 | Keep the 18 non-Fractions islands live as **unaccepted previews**. Each must pass the backlog's quality gates in its own release (R2–R5). | They were already built and live. Hiding them would not improve R1. | R1 acceptance covers Fractions and the shared screens only. Defects on other islands are logged, and block R1 only where they touch Fractions or shared screens. | Product Owner |
| D-002 | 3 Nov 2026 | **Preview only.** Nothing merges to `main` or deploys to production unless the Product Owner asks explicitly. | Backlog deployment constraint. | All work stays on the development branch `claude/pensive-pasteur-bs5979` and its Vercel preview. | Product Owner |
| D-003 | 3 Nov 2026 | Gate R0. GOV-001 first, then wait for review. | Backlog section 13. | No other R0 item starts without authorisation. | Product Owner |
| D-004 | 3 Nov 2026 | Log the home-page issues found on 3 Nov as defects and fix them in R1, not R0. | Keep R0 to specification and foundations. | DEF-001 to DEF-008 in the GOV-001 audit, section 12. | Product Owner |
| D-005 | 3 Nov 2026 | **GOV-001 accepted.** | Product Owner review of [`GOV-001-repository-audit.md`](GOV-001-repository-audit.md). | GOV-001 status is ACCEPTED. | Product Owner |
| D-006 | 3 Nov 2026 | **Authorised next:** GOV-002, GOV-003 and UX-001, under these constraints: <ul><li>preserve the architecture, with no rewrites;</li><li>no new product features;</li><li>no production deploy;</li><li>development branch only;</li><li>document every decision;</li><li>keep "implemented" separate from "QA-accepted";</li><li>include Times Tables and Mental Maths in the architecture and traceability;</li><li>base competitor claims on research.</li></ul> | Product Owner instruction. | These are the boundaries for D-007 to D-010. | Product Owner |
| D-007 | 3 Nov 2026 | **Source of truth is `docs/product/`.** <ul><li>The backlog is stored as v1.0, unchanged, in `backlog.md`.</li><li>Item status lives in `STATUS.md`.</li><li>Decisions live here.</li><li>Traceability lives in `traceability/`.</li></ul> `docs/ROADMAP.md` and `docs/DESIGN.md` remain background and reference material, and their banners say so. | <ul><li>Keeps the Product Owner's text intact.</li><li>Keeps status separate from scope.</li><li>Leaves one place to look.</li></ul> | <ul><li>Where documents conflict, `docs/product/` wins.</li><li>The README points here.</li></ul> | Delivery engineer (Claude Code), under D-006 |
| D-008 | 3 Nov 2026 | **Traceability format.** <ul><li>Two CSV files: `requirements.csv` and `test-cases.csv`.</li><li>An automated checker, `src/traceability.test.ts`, runs with `npm test` and in CI.</li></ul> | <ul><li>CSV is readable on GitHub and easy to diff.</li><li>The checker stops the matrix going stale. It fails if a backlog item is missing, or if a P0/P1 item has no test case.</li><li>It also fails if a referenced automated test no longer exists.</li></ul> | <ul><li>It adds QA tooling, not a product feature.</li><li>A test removed or renamed without updating the matrix turns CI red.</li></ul> | Delivery engineer, under D-006 |
| D-009 | 3 Nov 2026 | **Two separate status dimensions.** <ul><li>*QA status* uses the backlog's workflow (section 9).</li><li>*Implementation evidence* records what code already exists: Implemented, Partial or Not implemented.</li><li>Every item without acceptance starts at **SPECIFIED**: backlog v1.0 gives each one acceptance criteria, but none has been refined against the Definition of Ready yet.</li></ul> | The Product Owner asked to distinguish implemented from QA-accepted (D-006). | <ul><li>Existing code never counts as accepted.</li><li>"Implemented" means "code exists" and nothing more.</li></ul> | Delivery engineer, under D-006 |
| D-010 | 3 Nov 2026 | **Competitor benchmark method (UX-001).** <ul><li>Use public evidence only: public pages measured in a real browser, official help and accessibility pages, app-store listings, and public lesson or question pages where they exist.</li><li>No paid subscriptions.</li><li>Nothing that needs a learner login.</li></ul> | The constraints allow no purchases or sign-ups on the owner's behalf, and claims must rest on evidence. | Any screen we could not reach is marked **not observed**, never guessed. A paid or school trial is listed as a follow-up for the Product Owner. | Delivery engineer, under D-006 |
| D-011 | 4 Nov 2026 | **GOV-002, GOV-003 and UX-001 accepted.** | Product Owner review of the deliverables and [`reports/R0-step1-status-report.md`](reports/R0-step1-status-report.md). | All three items are ACCEPTED, and their test cases are marked `accepted`. | Product Owner |
| D-012 | 4 Nov 2026 | **Sprint step 2 authorised:** CUR-002, CUR-003, UX-002, UX-003, UX-004 and ARCH-001. **Scope:** <ul><li>specifications;</li><li>additive foundations only: new design tokens in `globals.css`, and the prerequisite graph as validated data that the app doesn't yet use;</li><li>an internal design specimen page, hidden in production, with screenshots for review.</li></ul> No existing screen may change how it looks or behaves. | <ul><li>Product Owner choices made on 4 Nov.</li><li>The backlog's step-2 QA gate: "PO / educational QA approves design and learning model".</li></ul> | <ul><li>Moving screens onto tokens, fixing visual defects, and wiring the prerequisite graph into the app all happen in R1.</li><li>The D-006 constraints still apply.</li></ul> | Product Owner |

## Requirement clarifications

| ID | Date | Requirement | Reading adopted | Why |
|---|---|---|---|---|
| RC-001 | 3 Nov 2026 | GOV-003: "Each P0/P1 backlog item maps to acceptance criteria and one or more test cases" | <ul><li>Every one of the 97 backlog items is listed in `requirements.csv`.</li><li>Every P0/P1 item has at least one test case for each acceptance criterion.</li><li>Every P2–P4 item, including all Times Tables and Mental Maths items, has at least one **planned** test case, so it is traceable before it is built.</li></ul> | <ul><li>The Product Owner asked for "complete" traceability.</li><li>The Product Owner asked to include Times Tables and Mental Maths.</li></ul> |
| RC-002 | 3 Nov 2026 | GOV-001: "Do not change files" | Read as: no change to application code or configuration. The audit document itself was added. | Already applied and accepted (D-005). |
| RC-003 | 3 Nov 2026 | GOV-002: "later changes are reflected consistently" | Consistency is enforced by `src/traceability.test.ts`: <ul><li>every backlog ID appears once in `requirements.csv` and once in `STATUS.md`;</li><li>status values are valid;</li><li>an ACCEPTED item must cite a decision.</li></ul> | Makes the rule checkable rather than a promise. |
| RC-004 | 3 Nov 2026 | UX-001: "Review Atom Learning and relevant maths / times-table products" | <ul><li>Atom Learning is the main competitor.</li><li>Relevant comparators cover each area we will build: times-table fluency (R2), adaptive practice, mental maths, interactive concept teaching, and 11+ preparation (R5).</li><li>Kite Maths is scored on the same rubric, so no comparison is one-sided.</li></ul> | The Product Owner listed the dimensions to study. Scoring ourselves the same way avoids unsupported "best in market" claims. |

## Change history

| ID | Date | Document | Change | Linked |
|---|---|---|---|---|
| CH-001 | 3 Nov 2026 | `GOV-001-repository-audit.md` | Created. | GOV-001 |
| CH-002 | 3 Nov 2026 | `GOV-001-repository-audit.md` | Status changed from READY FOR QA to ACCEPTED. | D-005 |
| CH-003 | 3 Nov 2026 | `backlog.md` | Backlog v1.0 imported unchanged, under a document-control header. | D-007 |
| CH-004 | 3 Nov 2026 | `README.md`, `STATUS.md`, `DECISIONS.md` (product) | Created as the source-of-truth set. | GOV-002, D-007, D-009 |
| CH-005 | 3 Nov 2026 | Root `README.md`, `docs/ROADMAP.md`, `docs/DESIGN.md` | <ul><li>README updated so it no longer says Fractions is the only island, and now points to `docs/product/`.</li><li>ROADMAP and DESIGN given banners saying what they are now and where the source of truth is.</li><li>No other content changed.</li></ul> | GOV-002, DEF-017 (documentation part) |
| CH-006 | 3 Nov 2026 | `traceability/*`, `src/traceability.test.ts` | Traceability matrix and checker created. | GOV-003, D-008, RC-001 |
| CH-007 | 3 Nov 2026 | `benchmark/UX-001-competitor-benchmark.md`, `benchmark/evidence/*` | Competitor benchmark and its evidence created. | UX-001, D-010, RC-004 |
| CH-008 | 3 Nov 2026 | `reports/R0-step1-status-report.md` | Status report for GOV-002, GOV-003 and UX-001 created. | D-006 |
| CH-009 | 4 Nov 2026 | `STATUS.md`, `traceability/test-cases.csv` | GOV-002, GOV-003 and UX-001 set to ACCEPTED, and their review cases set to `accepted`. | D-011 |
