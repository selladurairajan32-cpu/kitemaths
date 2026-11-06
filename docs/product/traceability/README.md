# Traceability (GOV-003)

This folder traces every backlog requirement to its tests, so each delivered feature can be followed
from requirement to implementation and test evidence.

| File | What it holds |
|---|---|
| [`requirements.csv`](requirements.csv) | One row per acceptance criterion of every backlog item: `req_id`, `ac` (AC1, AC2…), epic, title, priority, release, and the criterion text exactly as in backlog v1.0. Each criterion is one clause of the item's "Acceptance criteria" sentence, split at semicolons. |
| [`test-cases.csv`](test-cases.csv) | One row per test case: `tc_id`, the criterion it verifies, `level`, `automation`, `status`, `test_ref`, notes. `test_ref` is `file::test title` for automated cases. |

## Status vocabulary for test cases

| Status | Meaning |
|---|---|
| `passing` | An automated test exists and passed in the latest run (or, for QA-006, a recorded CI run passed). It covers the criterion as written. |
| `partial` | Some evidence exists (an automated test or a manual check), but it doesn't cover the whole criterion. The notes say what's missing. |
| `failing` | Checked, and the criterion is currently **not met**. The notes link the defect. |
| `review-pending` | A deliverable exists and is waiting for Product Owner or educational QA review. |
| `accepted` | The Product Owner accepted it, citing a decision in `DECISIONS.md`. |
| `planned` | Defined, not yet built or run. `notes` gives the intended method. |

| Field | Values |
|---|---|
| `level` | `unit`, `content`, `component`, `e2e`, `visual-a11y-qa`, `document-review`, `content-review` |
| `automation` | `automated` (a test in the repo), `manual` (a human check with recorded evidence), `planned` |

A `passing` test case is **evidence, not acceptance**. Only the Product Owner accepts an item (see
[`../STATUS.md`](../STATUS.md)).

## Rules (enforced by `src/traceability.test.ts`, run by `npm test` and CI)

1. Every backlog item and every acceptance criterion appears in `requirements.csv`, word for word, with
   the right priority and release.
2. Every backlog item appears exactly once in `STATUS.md`, with a valid QA status and implementation
   state. ACCEPTED must cite an existing decision.
3. Every P0/P1 acceptance criterion has at least one test case.
4. Every P2–P4 item, including **all Times Tables (TT) and Mental Maths (MM) items**, has at least one
   test case (RC-001).
5. Test cases have unique ids, valid fields, and point at a real criterion. A `passing` case must be
   automated (or cite a CI run).
6. Every `automated` test case names a test file that exists and a test title found in that file.
7. Every test file in `src/` traces to at least one requirement.

On 3 Nov the checker was deliberately broken twice to show it fails: once with an automated reference
to a test that doesn't exist, and once with a P1 criterion left without a test case. Both times the
right check went red (see the status report).

## Coverage on 6 November 2026 (after the review-2 corrections)

Each criterion is counted once, by the strongest evidence any of its test cases has.

| Epic | Items | Criteria | Test cases | Automated | Accepted | Passing | Review pending | Partial | Failing | Planned |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| GOV | 4 | 10 | 13 | 6 | 5 | 3 | 0 | 0 | 0 | 2 |
| CUR | 4 | 9 | 23 | 8 | 4 | 0 | 0 | 1 | 0 | 4 |
| UX | 8 | 22 | 45 | 15 | 3 | 4 | 2 | 2 | 1 | 10 |
| ARCH | 5 | 14 | 63 | 55 | 0 | 11 | 0 | 1 | 0 | 2 |
| FR | 11 | 34 | 43 | 28 | 0 | 5 | 0 | 14 | 1 | 14 |
| LAB | 7 | 25 | 25 | 4 | 0 | 2 | 0 | 2 | 0 | 21 |
| PRACT | 8 | 25 | 34 | 24 | 0 | 9 | 0 | 6 | 0 | 10 |
| MIS | 5 | 12 | 16 | 15 | 0 | 4 | 0 | 7 | 0 | 1 |
| MAST | 5 | 16 | 28 | 24 | 0 | 6 | 0 | 6 | 0 | 4 |
| TT | 12 | 37 | 37 | 2 | 0 | 0 | 0 | 2 | 0 | 35 |
| MM | 12 | 28 | 28 | 0 | 0 | 0 | 0 | 0 | 0 | 28 |
| EXAM | 6 | 16 | 16 | 1 | 0 | 0 | 0 | 1 | 0 | 15 |
| PARENT | 3 | 7 | 7 | 0 | 0 | 0 | 0 | 0 | 0 | 7 |
| QA | 7 | 15 | 41 | 28 | 0 | 3 | 0 | 1 | 0 | 11 |
| **Total** | **97** | **270** | **419** | **210** | **12** | **47** | **2** | **43** | **2** | **164** |

**How to read this:**
- Fractions logic (FR, PRACT, MIS, MAST) already has substantial automated evidence. Its **planned**
  cases are mostly interaction and visual checks (lab controls, touch and keyboard, layouts), which need
  component and end-to-end tests that the repo doesn't have yet (QA-002, QA-003).
- Times Tables, Mental Maths, 11+ and Parent are almost entirely **planned**, as expected for R2–R5.
  Their test cases exist now so they are traceable before they're built.
- Step 2 added 34 test cases for CUR-002, CUR-003, UX-002, UX-003, UX-004 and ARCH-001. 20 are automated and all
  pass; the rest are document and visual reviews waiting for the Product Owner, and planned R1 checks.
- The step-2 corrections (5 Nov) added 10 more: ARCH-001 fixture tests, contrast checks at real sizes, and planned R1
  tests for the evidence, lab-path and fresh-example rules.
- Sprint step 3 (5 Nov) added test cases for ARCH-002, ARCH-003 and QA-001, pointing at three new test files.
- "Accepted" counts the 7 criteria of the four accepted items.
- A criterion is counted under its strongest case, so UX-003 AC3 appears as "review pending" (its specification) even
  though its scaling check is `failing`. The failing cases are listed below.

**Criteria known to fail today:**
- `TC-UX-003.3.1` (UX-003 AC3): existing screens break at 200% text and at 320px (DEF-018 to DEF-021)
- `TC-UX-005.3.1` (UX-005 AC3): DEF-005: Lab tab is a placeholder on 18 islands
- `TC-FR-011.3.1` (FR-011 AC3): Completion is recorded on traversal, not mastery evidence (GOV-001 R-3)

## Test files and the requirements they cover

| Test file | Tests | Requirements it gives evidence for |
|---|---:|---|
| `src/architecture.test.ts` | 11 | ARCH-001 |
| `src/curriculum/prerequisites.test.ts` | 6 | CUR-002, CUR-003 |
| `src/design-tokens.test.ts` | 10 | UX-002, UX-003, UX-004 |
| `src/maths/maths.test.ts` | 20 | ARCH-003, QA-001 |
| `src/questions/questions.test.ts` | 17 | ARCH-002 |
| `src/design.test.ts` | 5 | UX-002, UX-003 |
| `src/engine/engine.test.ts` | 34 | ARCH-004, ARCH-005, FR-010, FR-011, MAST-001, MAST-002, MAST-003, MAST-004, MAST-005, MIS-003, MIS-004, MIS-005, PRACT-001, PRACT-007, PRACT-008 |
| `src/engine/rewards.test.ts` | 10 | FR-001, MAST-003 |
| `src/lib/migrate.test.ts` | 6 | ARCH-004, MAST-005, PRACT-001, QA-001 |
| `src/topics/fractions/content.test.ts` | 14 | ARCH-002, CUR-004, FR-004, FR-010, MAST-002, MIS-001, PRACT-001, PRACT-006, PRACT-007 |
| `src/topics/fractions/evaluate.test.ts` | 25 | ARCH-003, FR-002, FR-003, FR-004, FR-005, FR-006, FR-007, FR-008, LAB-005, MIS-001, MIS-002, PRACT-001, PRACT-002, PRACT-003, PRACT-004, PRACT-005, PRACT-006, QA-001 |
| `src/topics/fractions/representations.test.ts` | 11 | ARCH-003, QA-001 |
| `src/topics/fractions/math.test.ts` | 9 | ARCH-003, FR-002, FR-005, FR-006, FR-008, LAB-002, LAB-004, LAB-005, PRACT-005, PRACT-006, QA-001 |
| `src/topics/kit/kit.test.ts` | 72 | ARCH-001, ARCH-002, EXAM-005, PRACT-002, TT-003, TT-008 |
| `src/topics/registry.test.ts` | 6 | ARCH-001, ARCH-002 |
| `src/traceability.test.ts` | 9 | GOV-002, GOV-003 |

## Keeping it current

- **When you add, rename or remove a test:** update its `test_ref` rows in the same commit. Otherwise
  rules 6 and 7 fail.
- **When work changes what a criterion's evidence is:** update `status` and `notes`.
- **When the backlog text changes** (through `DECISIONS.md`): update `requirements.csv`. Rule 1 enforces
  this.
