# R0 status report: GOV-002, GOV-003, UX-001

| | |
|---|---|
| **Date** | 3 November 2026 |
| **Branch** | `claude/pensive-pasteur-bs5979`, development only. Nothing merged to `main`; nothing deployed (D-002). |
| **Authorised by** | Product Owner, after accepting GOV-001 (D-005, D-006) |
| **Requested decision** | Review GOV-002, GOV-003 and UX-001 against their acceptance criteria. Accept them, or return them as QA FAILED with reasons. Then authorise the next group of tasks, or not. |

## 1. Task status

| Item | Title | QA status now | What was delivered | Commit |
|---|---|---|---|---|
| GOV-001 | Repository audit | **ACCEPTED** (D-005) | — (accepted earlier) | `a50507a` |
| GOV-002 | Product source of truth | **READY FOR QA** | `docs/product/` source-of-truth set; root README, ROADMAP and DESIGN now point to it | `9d45c3a` |
| GOV-003 | Requirement-to-test traceability | **READY FOR QA** | `docs/product/traceability/` (CSV matrix and guide) plus the `src/traceability.test.ts` checker | `34cbf60` |
| UX-001 | Competitor UX benchmark | **READY FOR QA** | `docs/product/benchmark/UX-001-competitor-benchmark.md` with 24 evidence items, measurements and screenshots | `28b5050` |

Every other backlog item stays **SPECIFIED** (D-009). Nothing was moved to ACCEPTED by the delivery engineer.

## 2. Evidence against each acceptance criterion

### GOV-002: establish the product source of truth

| Criterion | Evidence | Result |
|---|---|---|
| AC1: "Product vision, scope, backlog IDs, definitions of status and priority, key decisions and change history are recorded in the repository" | <ul><li>[`backlog.md`](../backlog.md): vision, scope, all 97 IDs, stored unchanged; the body matches the upload byte for byte, checked with `diff` on 3 Nov.</li><li>[`README.md`](../README.md#status-definitions): status and priority definitions.</li><li>[`DECISIONS.md`](../DECISIONS.md): decisions D-000 to D-010, clarifications RC-001 to RC-004, change history CH-001 to CH-008.</li></ul> | Delivered; **needs your review** |
| AC2: "later changes are reflected consistently" | `src/traceability.test.ts` checks that: <ul><li>every backlog ID appears once in [`STATUS.md`](../STATUS.md) with valid values;</li><li>ACCEPTED always cites a recorded decision (RC-003);</li><li>the requirements match the backlog word for word.</li></ul> It runs with `npm test` and in CI. | **Passing** (see §3) |

### GOV-003: requirement-to-test traceability

| Criterion | Evidence | Result |
|---|---|---|
| AC1: "Each P0/P1 backlog item maps to acceptance criteria and one or more test cases" | <ul><li>[`requirements.csv`](../traceability/requirements.csv): all 97 items split into 270 acceptance criteria.</li><li>[`test-cases.csv`](../traceability/test-cases.csv): 322 test cases.</li><li>All **182** P0/P1 criteria have at least one test case.</li><li>All 33 P2–P4 items, including the 12 Times Tables and 12 Mental Maths items, have one (RC-001).</li></ul> | **Passing**: checker tests "gives every P0/P1 acceptance criterion at least one test case" and "gives every later-release item, including Times Tables and Mental Maths, at least one test case" |
| AC2: "every delivered feature can be traced from requirement to implementation and test evidence" | <ul><li>`STATUS.md` records implementation evidence per item.</li><li>135 test cases point at real automated tests (`file::test title`).</li><li>Every test file in `src/` traces to a requirement.</li><li>Coverage by epic and the test-file map are in [`traceability/README.md`](../traceability/README.md).</li></ul> | **Passing**: checker tests "points every automated test case at a test that exists" and "traces every test file in the repository to at least one requirement" |

**Coverage on 3 Nov.** Each criterion counts once, by its strongest evidence. Of the 270 criteria:

| Evidence | Criteria |
|---|---:|
| Accepted | 4 |
| Passing | 35 |
| Review pending | 3 |
| Partial | 53 |
| Failing | 2 |
| Planned | 173 |

**The two failing criteria are real gaps, not test faults:**
- UX-005 AC3: the Lab tab is a placeholder on 18 islands (DEF-005).
- FR-011 AC3: lessons complete when a child steps through them, not on evidence.

### UX-001: competitor UX benchmark

| Criterion | Evidence | Result |
|---|---|---|
| AC1: "Evidence-based benchmark lists strengths, weaknesses, expected baseline features and specific opportunities for differentiation" | Benchmark sections: <ul><li>§5: a rubric across all 9 dimensions you named, plus the parent experience, for 7 products and Kite Maths;</li><li>§6: the market baseline;</li><li>§7.1: differentiation opportunities;</li><li>§7.2: where Kite is behind;</li><li>§3: 24 dated evidence items;</li><li>§4: browser measurements;</li><li>`evidence/`: 18 screenshots, raw JSON, scripts.</li></ul> | Delivered; **needs your review** |
| AC2: "no unsupported 'best in market' claim is used" | <ul><li>The header rule forbids it.</li><li>Kite Maths is scored on the same rubric, including its weaknesses.</li><li>Differentiators are called "candidates" with the proof each still needs.</li><li>Anything behind a login is "Not observed".</li></ul> | Delivered; **needs your review** |

**Dimensions you asked for, and where they are covered:**

| Dimension | Where |
|---|---|
| Visual design | §5, row 1 |
| Typography | §5, row 2; §4.1 |
| Readability | §5, row 3; §4 |
| Content differentiation | §5, row 4 |
| Mathematical interactions | §5, row 5 |
| Animation quality | §5, row 6 |
| Accessibility | §5, row 7; §4.2 |
| Learning journeys | §5, row 8 |
| Mobile usability | §5, row 9; §4 |

## 3. Checks actually run (3 Nov, on this branch)

| Check | Command | Result |
|---|---|---|
| Unit, content and traceability tests | `npm test` | **Pass:** 10 files, 190 tests (181 existing + 9 traceability) |
| Lint (whole repo, as CI) | `npm run lint` | **Pass** |
| Type check (as CI) | `npx next typegen && npx tsc --noEmit -p .` | **Pass** |
| Production build | `npm run build` | **Pass:** 913 static pages |
| The checker can fail | Added an automated test case pointing at a test that doesn't exist | **Fails as expected:** "points every automated test case at a test that exists" |
| The checker can fail | Removed every test case for FR-002 AC1 (P1) | **Fails as expected:** "gives every P0/P1 acceptance criterion at least one test case" |
| Checker restored | Original files | **Pass:** 9 of 9 |
| Benchmark measurements | `evidence/data/measure-pass1.js.txt`, `measure-pass2.js.txt` (Playwright, Chromium, 1280px and 390px) | 24 page loads plus 24 question-level loads; results in `evidence/data/*.json` |

**Not tested:**
- No screen-reader or keyboard-only walkthrough of any product (benchmark follow-up F-3).
- No child usability sessions (F-2).
- Competitor screens behind a login (F-1).

## 4. Compliance with your constraints

| Constraint | How it was met |
|---|---|
| Preserve the architecture; no rewrites | No application module changed. Under `src/`, the only change against `main` is the new test file `src/traceability.test.ts`. |
| No new product features | <ul><li>Documentation.</li><li>One test file, as QA tooling (D-008).</li><li>Evidence assets.</li></ul> |
| No production deploy | Nothing merged to `main`; no pull request opened. The live site is unchanged at `bbf210a`. |
| Development branch only | All commits are on `claude/pensive-pasteur-bs5979`. |
| Document decisions and requirement changes | `DECISIONS.md`: D-005 to D-010, RC-001 to RC-004, CH-001 to CH-008. The backlog text is unchanged. |
| Keep implemented separate from QA-accepted | Two separate status columns in `STATUS.md` (D-009). One item is accepted; 25 are implemented but not accepted. |
| Include Times Tables and Mental Maths | <ul><li>`README.md` product map: where each sits in the architecture.</li><li>`STATUS.md`: implementation evidence.</li><li>Traceability: 65 test cases covering every TT and MM criterion.</li><li>Benchmark: TT Rock Stars, DoodleTables and the DfE check.</li></ul> |
| Evidence-based competitor claims | 24 dated evidence items with an evidence type each. Marketing is kept apart from observed product. "Not observed" is used wherever evidence is missing. |

## 5. Open items for you

1. **Decision on benchmark follow-up F-1:** trial or paid access to Atom, DoodleMaths, TT Rock Stars and Mathletics, to see
   their maths questions, feedback and animation. These involve sign-ups and possibly cost.
2. **Defects:** DEF-001 to DEF-017 from the GOV-001 audit remain open and unchanged, apart from the README part of DEF-017.
   They move into a formal register when QA-004 is authorised.
3. **Review request:** please accept GOV-002, GOV-003 and UX-001, or return any of them as QA FAILED with reasons.

## 6. Proposed next group (needs your authorisation)

This follows backlog section 6, sprint step 2. The benchmark's findings feed these directly (benchmark §8).

| Item | Focus |
|---|---|
| CUR-002 | Progression model and prerequisite graph |
| CUR-003 | Instructional lesson template: prerequisites, reflection, mastery check |
| UX-002 | Design tokens, including a type scale and state tokens; fixes the cause of DEF-009 |
| UX-003 | Typography and maths readability rules: the measured large-prompt strength becomes the standard |
| UX-004 | Content-differentiation rules: separate hint, tip, input problem and worked-example help |
| ARCH-001 | Architecture document, including Times Tables and Mental Maths plug-in points and keeping UI types out of content |

Nothing in this group will start until you authorise it.
