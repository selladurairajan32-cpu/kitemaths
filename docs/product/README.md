# Product documentation: the single source of truth

This folder is the source of truth for **what we are building, how far it has got, and how we know**
(GOV-002, D-007). When anything else in the repository disagrees with it (the root README,
`docs/ROADMAP.md`, `docs/DESIGN.md`, comments), this folder wins and the other document is out of date.

## Document map

| Document | Answers | Owner | Change rule |
|---|---|---|---|
| [`backlog.md`](backlog.md) | Vision, scope, every backlog item, priorities, releases, acceptance criteria, Definition of Ready and Done, defect severities (backlog v1.0, stored unchanged) | Product Owner | Edit only through a decision in `DECISIONS.md`, with a change-history entry |
| [`STATUS.md`](STATUS.md) | Where each item stands: QA status, and implementation evidence kept separate from it | Delivery engineer proposes; only the Product Owner sets ACCEPTED | Update in the same commit as the work |
| [`DECISIONS.md`](DECISIONS.md) | Decisions (D-), requirement clarifications (RC-), change history (CH-) | Product Owner (decisions); delivery engineer (records) | Append only; never rewrite a past entry |
| [`traceability/`](traceability/) | Requirement → acceptance criterion → test case → test file → result | Delivery engineer | Kept consistent by `src/traceability.test.ts` |
| [`GOV-001-repository-audit.md`](GOV-001-repository-audit.md) | What the repository was on 3 Nov 2026, plus the provisional defect list | — | ACCEPTED (D-005); a point-in-time record, not updated |
| [`benchmark/UX-001-competitor-benchmark.md`](benchmark/UX-001-competitor-benchmark.md) | How competitors compare, with evidence | — | Re-run if the market changes |
| [`reports/`](reports/) | One status report per delivery, with the evidence for Product Owner review | — | New file per delivery |

**Background material (not the source of truth):**
- `docs/ROADMAP.md` is the original strategy and roadmap, written before backlog v1.0. It's useful for
  the long-term vision; where it conflicts with the backlog, the backlog wins.
- `docs/DESIGN.md` describes the current design system ("Crystal"). It stays the design reference until
  UX-002, UX-003 and UX-004 replace it. Its known drift is tracked as defects (DEF-009, DEF-010).

## Priorities and releases

The definitions are copied from backlog v1.0, section 4.

| Priority | Meaning |
|---|---|
| P0 | Critical foundation: needed to begin safely or unblock the first release |
| P1 | First Fractions prototype |
| P2 | Next learning release: Times Tables and Mental Maths foundations |
| P3 | Platform expansion: full curriculum, exam readiness and family features |
| P4 | Later or optional |

| Release | Focus |
|---|---|
| R0 | Discovery, specification, design system, architecture, curriculum validation |
| R1 | Fractions prototype |
| R2 | Times Tables and multiplication/division fluency |
| R3 | Mental Maths and strategy intelligence |
| R4 | Year 3–6 curriculum expansion |
| R5 | 11+ preparation and personalisation |

## Status definitions

Every backlog item has **two separate statuses** (D-009). They answer different questions and must
never be merged.

### 1. QA status: "has it been accepted?"

This is the backlog's own workflow (section 9):

```
NOT STARTED → SPECIFIED → READY FOR DEVELOPMENT → IN DEVELOPMENT → READY FOR QA
            → QA FAILED / READY FOR RETEST → ACCEPTED            (BLOCKED at any point)
```

| QA status | Meaning here |
|---|---|
| NOT STARTED | Not yet described. |
| SPECIFIED | It has acceptance criteria in the backlog, but hasn't been refined against the Definition of Ready (backlog section 7). All items start here (D-009). |
| READY FOR DEVELOPMENT | It meets the Definition of Ready and is authorised by the Product Owner. |
| IN DEVELOPMENT | Being built on the development branch. |
| READY FOR QA | Delivered with evidence; waiting for Product Owner or educational QA review. |
| QA FAILED / READY FOR RETEST | Review found problems / fixes are waiting for re-review. |
| ACCEPTED | The Product Owner accepted it against the Definition of Done (backlog section 8). It **must cite a decision** (D-nnn). |
| BLOCKED | A dependency or decision stops progress. |

### 2. Implementation evidence: "does code for it exist?"

| Value | Meaning |
|---|---|
| Implemented | Code or a deliverable exists that addresses the item's intent. **Not a quality judgement and not acceptance.** |
| Partial | Some of the item exists. The evidence column says what is missing. |
| Not implemented | Nothing exists for it yet. |

Most implemented code predates backlog v1.0. It was never QA-reviewed against the backlog, so an item
can be **Implemented** and still only **SPECIFIED**. The 18 non-Fractions islands are live as
**unaccepted previews** (D-001).

## How to change things

1. **Scope or acceptance criteria change:**
   - record a decision (D-) or clarification (RC-) in `DECISIONS.md`;
   - edit `backlog.md`;
   - add a change-history (CH-) entry;
   - update `traceability/requirements.csv`.

   The checker fails if the requirements no longer match the backlog. (Formal change-control rules are
   GOV-004, which is not yet authorised.)
2. **Status changes:** edit `STATUS.md`, with evidence. Only the Product Owner sets ACCEPTED, citing a
   decision.
3. **Tests change:** update `traceability/test-cases.csv` in the same commit.
4. **Deployment:** preview only. Nothing goes to `main` or production without the Product Owner's
   explicit request (D-002).
5. **Checks** before any push: `npm test` (includes the traceability checker), `npm run lint`,
   `npx next typegen && npx tsc --noEmit -p .` and `npm run build`. These are CI's steps.

## Product map

This shows the learning areas and where they sit in the architecture. It is a *provisional* view, to be
formalised by ARCH-001 (not yet authorised). It describes structure only; nothing here is a new feature.

| Learning area | Backlog | Release | Today | Where it lives / will live |
|---|---|---|---|---|
| Concept mastery: Fractions | FR, LAB, PRACT, MIS, MAST | **R1** | Implemented, not accepted | `src/topics/fractions` (hand-built island), engine in `src/engine`, maths in `src/maths/fraction.ts` |
| Times Tables and ×/÷ fluency | TT-001 to TT-012 | R2 | Unaccepted preview island (`src/topics/times-tables`): 5 lessons, untimed | A dedicated **Times Tables area**, built from: <ul><li>**fact-level tracking**: an engine module alongside `ItemResult`, one record per fact such as 7×8, with recall consistency;</li><li>an **MTC-style timed session**: a new session type next to practice, with 25 questions, a 6-second window and a 3-second gap, labelled as practice;</li><li>**spaced review scheduling**: a pure, deterministic engine module;</li><li>a **visual explorer**: a new picture kind in the kit;</li><li>conceptual lessons reusing the lesson template.</li></ul> |
| Mental Maths and strategy intelligence | MM-001 to MM-012 | R3 | Not implemented. Strategy-like moments exist in previews (bonds and compensation, doubling, partitioning, 10% build-up). | A dedicated **Mental Maths area**, built from: <ul><li>a **strategy catalogue**: validated data, each strategy with its proof, prerequisites and limits;</li><li>a **strategy lesson** variant of the lesson template, covering when to use it, why it works and when not to;</li><li>a **strategy-choice question kind**: pick a method and give a reason, with several valid methods accepted;</li><li>**separate measures** for accuracy, method choice, independence, hints and time, so speed can never hide falling accuracy.</li></ul> |
| Curriculum islands (Years 3–6) | CUR-001, R4 items | R4 | 17 unaccepted preview islands | `defineTopic` island kit (`src/topics/kit`) plus the prerequisite graph (CUR-002) |
| 11+ application | EXAM-001 to EXAM-006 | R5 | Problem solving and Mock exams previews (untimed) | Exam-profile data, timed section engine, post-test analysis |
| Parent experience | PARENT-001 to PARENT-003 | R5 | Grown-ups area (active island only) | Profile, cross-island summary, weekly plan |

**Shared foundations that all areas reuse:**
- the `TopicModule` contract and island registry (`src/topics/types.ts`, `src/topics/index.ts`);
- the question-kind registry;
- the pure engine (mastery, adaptive, recovery, journey);
- versioned persistence (`src/lib/store.ts`).

Times Tables and Mental Maths plug in through the same contract, with new engine modules alongside the
existing ones rather than rewrites of the Fractions engine. Backlog ARCH-001 asks for exactly this.
