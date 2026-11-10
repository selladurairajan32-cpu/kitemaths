# Status register

This is the **only** place where backlog item status is recorded. The items, their scope and their
acceptance criteria are in [`backlog.md`](backlog.md); how statuses work is explained in
[`README.md`](README.md#status-definitions). `src/traceability.test.ts` checks that every backlog item
is listed here exactly once with valid values (RC-003).

**Last updated:** 9 November 2026: R1 deployed to production at the Product Owner's request (D-027); deploying is not acceptance. Earlier the same day: R1 steps 10–11 delivered (`673d57c`); all R1 items are READY FOR QA except MAST-001 (BLOCKED on a decision); [R1 release acceptance report](reports/R1-release-acceptance-report.md). Earlier the same day: R1 steps 8–9 delivered (`0109bd1`): PRACT-001 to PRACT-008 and MIS-001 to MIS-005 READY FOR QA. Earlier the same day: R1 steps 5–7 delivered (`000ef13`): FR-002 to FR-009 and LAB-001 to LAB-007 READY FOR QA. Earlier the same day: R1 authorised in sequence (D-026). Step 4 delivered: FR-011, ARCH-004 and UX-005 READY FOR QA, UX-003 READY FOR RETEST, DEF-002 to DEF-021 fixed except DEF-001 (awaiting retest). Earlier, 6 November: GOV-004, CUR-001 and QA-004 delivered and READY FOR QA, with the step-4 handoff and the [R0 readiness report](reports/R0-readiness-report.md). Earlier the same day: QA decision on `112eeb3` recorded (D-025): ARCH-002 accepted for R0 scope, DEF-037 closed, DEF-038 documentation verified with the behaviour still open for R1. Earlier the same day: retest of `702743a` recorded (D-024): DEF-029 to DEF-036 closed; ARCH-001, ARCH-003, QA-001 and UX-004 accepted for their scopes; ARCH-002 QA FAILED (DEF-037, DEF-038), then corrected and READY FOR QA ([report](reports/R0-review3-correction-report.md)). Earlier the same day: independent review of `0b45d12` recorded (D-023): CUR-002 and CUR-003 accepted for R0 specification scope, UX-002 accepted for R0 token and specification scope only. ARCH-001, ARCH-002, ARCH-003, QA-001 and UX-004 corrected and READY FOR QA ([correction report](reports/R0-review2-correction-report.md)). Earlier, 5 November: sprint step 3 delivered (ARCH-002, ARCH-003, QA-001 READY FOR QA, [step-3 report](reports/R0-step3-status-report.md)). Before that, the same day: step-2 corrections delivered ([correction report](reports/R0-step2-correction-report.md)). Five items are READY FOR QA again (D-022); UX-003 stays QA FAILED (D-021). Earlier the same day: the independent review set six items to QA FAILED (D-014), and Q-1 to Q-7 were decided (D-015 to D-021). 4 November: sprint step 2 delivered for review. CUR-002, CUR-003, UX-002, UX-003, UX-004 and ARCH-001 are READY FOR QA ([status report](reports/R0-step2-status-report.md)). Earlier the same day: GOV-002, GOV-003 and UX-001 accepted (D-011); step 2 authorised (D-012).

## Read this first: implemented is not accepted

Each item has two separate statuses (D-009).

- **QA status** follows the backlog's workflow: NOT STARTED → SPECIFIED → READY FOR DEVELOPMENT →
  IN DEVELOPMENT → READY FOR QA → QA FAILED / READY FOR RETEST → ACCEPTED, or BLOCKED.
  - **Only the Product Owner moves an item to ACCEPTED**, and every acceptance must cite a decision in
    [`DECISIONS.md`](DECISIONS.md).
- **Implementation** records what code already exists, with evidence.
  - It says nothing about quality or acceptance.
  - "Implemented" means "code exists", not "works correctly" or "accepted".
  - Most of it was built before backlog v1.0 arrived and has never been QA-reviewed against it.

## Summary

**QA status:** SPECIFIED: 84, QA FAILED: 1, ACCEPTED: 12.

- **Twelve** items are ACCEPTED: GOV-001 (D-005); GOV-002, GOV-003 and UX-001 (D-011); CUR-002, CUR-003 and UX-002 (D-023,
  R0 specification or token scope); ARCH-001, ARCH-003, QA-001 and UX-004 (D-024, delivered R0 scope; UX-004 for
  specification and specimen scope); and ARCH-002 (D-025, delivered R0 schema, validator and adapter scope). Their R1
  obligations and the browser-evidence limitations are unchanged.
- **UX-003 stays QA FAILED** (AC3 unmet, D-021). It is the only item in QA FAILED.
- **Open R1 prerequisite:** the kit-marking difference (DEF-038) is **not fixed** and is tracked as `TC-ARCH-002.1.13`.
- Every other item is SPECIFIED: it has acceptance criteria in backlog v1.0 but hasn't been refined to
  the Definition of Ready (D-009).

**Implementation evidence by epic:**

| Epic | Items | Implemented | Partial | Not implemented |
|---|---:|---:|---:|---:|
| GOV | 4 | 3 | 1 | 0 |
| CUR | 4 | 0 | 4 | 0 |
| UX | 8 | 1 | 7 | 0 |
| ARCH | 5 | 1 | 4 | 0 |
| FR | 11 | 7 | 4 | 0 |
| LAB | 7 | 4 | 3 | 0 |
| PRACT | 8 | 6 | 2 | 0 |
| MIS | 5 | 0 | 5 | 0 |
| MAST | 5 | 3 | 2 | 0 |
| TT | 12 | 0 | 7 | 5 |
| MM | 12 | 0 | 4 | 8 |
| EXAM | 6 | 0 | 2 | 4 |
| PARENT | 3 | 0 | 2 | 1 |
| QA | 7 | 1 | 3 | 3 |
| **Total** | **97** | **26** | **50** | **21** |

The 18 non-Fractions islands are live as **unaccepted previews** (D-001). Their content appears below
only where it is evidence for a backlog item: Times Tables, Mental Maths, 11+ and Parent.

## Register

### GOV — Product governance

| ID | Title | Pri | Rel | QA status | Implementation | Evidence and notes |
|---|---|---|---|---|---|---|
| GOV-001 | Inspect the existing repository | P0 | R0 | ACCEPTED (D-005) | Implemented | Delivered: [GOV-001 audit](GOV-001-repository-audit.md). |
| GOV-002 | Establish the product source of truth | P0 | R0 | ACCEPTED (D-011) | Implemented | Delivered 3 Nov: `docs/product/` source-of-truth set (this file, README, DECISIONS, backlog v1.0). |
| GOV-003 | Create requirements traceability | P0 | R0 | ACCEPTED (D-011) | Implemented | Delivered 3 Nov: `traceability/` CSVs + `src/traceability.test.ts` checker. |
| GOV-004 | Define change-control rules | P0 | R0 | READY FOR QA | Partial | **Delivered 6 Nov, awaiting review; not self-accepted (D-022).** [Change-control rules](GOV-004-change-control.md): what is material, the reason/impact/owner/decision record, how records stay consistent, roles (only the Product Owner accepts), the no-silent-reinterpretation rule, and where deferrals and exceptions stay visible. Uses the existing decision log; no new register. Checked by `src/governance.test.ts`. |

### CUR — Curriculum and instructional design

| ID | Title | Pri | Rel | QA status | Implementation | Evidence and notes |
|---|---|---|---|---|---|---|
| CUR-001 | Build the Year 3–6 curriculum map | P0 | R0 | READY FOR QA | Partial | **Delivered 6 Nov, awaiting review; not self-accepted (D-022).** [Curriculum map](curriculum/CUR-001-curriculum-map.md): 171 Year 3–6 statutory objectives quoted verbatim from the DfE programme of study (retrieved 6 Nov 2026) with year, strand, prerequisites, outcome, vocabulary, examples, proposed mastery-evidence kind, island/skill mapping, coverage and gaps; 6 unsourced 11+ extension candidates kept apart; Fractions R1 dependencies marked. Coverage is desk judgement from skill and lesson descriptions. No single official 11+ specification exists. Thresholds stay with MAST-001. Checked by `src/curriculum/map.test.ts`. No island or screen changed. |
| CUR-002 | Define the learning progression model | P0 | R0 | ACCEPTED (D-023) | Partial | QA FAILED at `6050e3c` (D-014); corrected 5 Nov. [Progression model](curriculum/CUR-002-progression-model.md) §3–§5: the evidence concepts, the attempt table, one independence contract, precedence, which state drives what, and the lab path with no auto-advance (DEF-024, DEF-025). The graph is data with 6 tests. **Not yet used by the app** (R1). |
| CUR-003 | Create the instructional lesson template | P0 | R0 | ACCEPTED (D-023) | Partial | QA FAILED at `6050e3c` (D-014); corrected 5 Nov. [Lesson template](curriculum/CUR-003-lesson-template.md) with Q-1 to Q-3 and the bounded fresh-example rule (DEF-026). Schema additions are R1 (RC-005). |
| CUR-004 | Review all Fractions content for mathematical validity | P1 | R1 | READY FOR QA | Partial | **R1 steps 10–11 (D-026, `673d57c`), awaiting review.** [Review pack](curriculum/CUR-004-review-pack.md) generated from the content for the **independent** reviewer; automated checks cover arithmetic, partitions and picture-answer agreement. The independent review is the QA step and has not been done. |

### UX — Design system and experience

| ID | Title | Pri | Rel | QA status | Implementation | Evidence and notes |
|---|---|---|---|---|---|---|
| UX-001 | Competitor UX benchmark | P0 | R0 | ACCEPTED (D-011) | Implemented | Delivered 3 Nov: [benchmark](benchmark/UX-001-competitor-benchmark.md). |
| UX-002 | Create the visual design system | P0 | R0 | ACCEPTED (D-023) | Partial | **Accepted for R0 token and specification scope only (D-023).** Screen migration (AC2) and DEF-009 stay open for R1; planned R1 tests stay planned; browser and visual tests keep their actual status (developer browser evidence, not independently passed). Existing screens do not yet meet all UX-002 requirements. QA FAILED at `6050e3c` (D-014); corrected 5 Nov. [Design tokens](design/UX-002-design-tokens.md); label-background tokens; 52 checked pairings; a hex-occurrence ratchet (DEF-022). Screens are not yet migrated (R1, RC-006); DEF-009 is open. |
| UX-003 | Define typography and mathematical readability | P0 | R0 | READY FOR RETEST | Partial | **Fixed in R1 step 4 (D-026), awaiting independent retest.** DEF-018 to DEF-021 fixed: no sideways scroll or clipped text on the 8 tested pages at 200% text (390, 768, 1280px) and at 320px, except the internal design specimen at 768px (a worked-example panel, 24px). Developer evidence (`verification/text-scaling.cjs`). Was QA FAILED (D-021). |
| UX-004 | Establish content differentiation rules | P0 | R0 | ACCEPTED (D-024) | Partial | **Accepted for R0 specification and specimen scope (D-024).** Screen migration, usability testing with children and browser-evidence independence stay R1/unchanged. **Review 2 corrected 6 Nov (DEF-036):** comparison rule states same positive numerator, positive denominators, same-sized wholes. QA FAILED at `6050e3c` (D-014); corrected 5 Nov. [Content types](design/UX-004-content-differentiation.md): corrected contrast, Q-6 wording, and supported pairings in §2.3 (DEF-022). Screens still share one treatment for hint, tip, notice and retry (R1). Child usability is not shown by the specimen (R1 testing). |
| UX-005 | Build responsive application shell and navigation | P1 | R1 | READY FOR QA | Implemented | **R1 step 4 (D-026), awaiting review.** Working navigation to home, map, island journey, lessons, practice and the grown-ups report at 390, 768 and 1280px; no placeholder Lab tab (DEF-005); hubs open the current island (DEF-014); mock-ups no longer public (DEF-016); header and tabs reflow at 200% text (DEF-018). Developer browser evidence (`verification/r1-step4-checks.cjs`), not independently reproduced. Tablet layout is the phone/desktop layout at 768px; no separate tablet design review yet. |
| UX-006 | Motion and interaction language | P1 | R1 | READY FOR QA | Implemented | **R1 steps 10–11 (D-026, `673d57c`), awaiting review.** [Motion table](design/UX-006-motion.md): every timing names what it communicates; a test allows only documented timings; reduced motion respected; Kip's decorative sway off by default; component tests complete every flow with animations off. |
| UX-007 | Accessibility baseline | P1 | R1 | READY FOR QA | Implemented | **R1 steps 10–11 (D-026, `673d57c`), awaiting review.** [Accessibility audit](design/UX-007-accessibility-audit.md): axe-core WCAG 2.1 A/AA 0 violations on 11 screens; visible focus on every tabbed control; all controls at least 44 px; non-colour cues. Limitations listed (no screen reader, no real devices, no children testing). Developer evidence. |
| UX-008 | Responsive visual QA | P1 | R1 | READY FOR QA | Implemented | **R1 steps 10–11 (D-026, `673d57c`), awaiting review.** 11 main screens at 320, 375, 430, 768 and 1280 px: no sideways scroll, clipped text or overlapping controls; 55 screenshots kept in `verification/results/r1/`. Developer evidence. |

### ARCH — Learning architecture

| ID | Title | Pri | Rel | QA status | Implementation | Evidence and notes |
|---|---|---|---|---|---|---|
| ARCH-001 | Define modular learning architecture | P0 | R0 | ACCEPTED (D-024) | Partial | **Accepted for delivered R0 scope (D-024).** Couplings K-1 to K-6 stay R1. **Review 2 corrected 6 Nov (DEF-030, DEF-031):** global-object escape detection, a layer matrix with a transitive check, 22 bad and 11 good fixtures. Documented allowlists unchanged. QA FAILED at `6050e3c` (D-014); corrected 5 Nov. [Architecture](architecture/ARCH-001-architecture.md). The guard is rebuilt on the TypeScript compiler (`src/architecture/analyse.ts`). 15 bad and 5 good fixtures; the reviewer's probe fails (DEF-023). Couplings K-1 to K-7 stay for R1; K-6 and K-7 were found by the new guard. |
| ARCH-002 | Define a typed question schema | P0 | R0 | ACCEPTED (D-025) | Partial | **Accepted for delivered R0 schema, validator and adapter scope (D-025).** The behavioural difference between the kit's `same()` and the new comparator is **not fixed**: it stays an R1 integration prerequisite (`TC-ARCH-002.1.13`), and the schema is not used for marking. Using definitions in the app and DEF-028 stay R1.**QA FAILED on retest (D-024):** DEF-037 (rounding comparison loses precision or overflows) and DEF-038 (the claim that adapters reproduce existing kit marking is wrong). **Review 2 corrected 6 Nov (DEF-032 to DEF-035):** nested trap fields, one numeric comparison contract (no fixed allowance), duplicate fraction traps, explicit `ask` for model checks. DEF-028 exception narrowed. Limitations: `ask` absent means unchecked; fraction-text options and match pictures aren't checked against models. Delivered 5 Nov (step 3): [question schema](architecture/ARCH-002-question-schema.md): `src/questions/` schema, runtime validator and adapters for 12 interactions. Valid and invalid fixtures for each; all existing Fractions and kit questions validate apart from DEF-028. **Not yet used by the app.** |
| ARCH-003 | Build pure mathematical logic modules | P0 | R0 | ACCEPTED (D-024) | Partial | **Accepted for delivered R0 scope (D-024).** DEF-027 and K-1 to K-6 stay R1. **Review 2 corrected 6 Nov (DEF-029):** exact Euclidean `divmod`, BigInt-oracle regression tests. Delivered 5 Nov (step 3): [pure maths](architecture/ARCH-003-maths.md): checked fraction arithmetic, mixed numbers, partitions, integers, place value. Duplicates replaced; 51,098 generated questions identical before and after. K-7 fixed. Existing unchecked functions keep their behaviour (DEF-027). |
| ARCH-004 | Implement prototype progress persistence | P1 | R1 | READY FOR QA | Implemented | **R1 step 4 (D-026), awaiting review.** Load and save in `src/lib/persist.ts`, tested with an in-memory storage: refresh and restart, versioned schema, corrupt or missing data, blocked storage, v1 migration, and no personal data beyond an optional first name, year and avatar. Developer browser check of a reload. |
| ARCH-005 | Build a reusable event and attempt model | P1 | R1 | READY FOR QA | Implemented | **R1 steps 10–11 (D-026, `673d57c`), awaiting review.** Each answer records question, skill, response, correctness, attempts, hints, first try, time and duration (practice, lessons, checks, rechecks); misconceptions are stored as possible signals, not diagnoses. |

### FR — Fractions learning journey

| ID | Title | Pri | Rel | QA status | Implementation | Evidence and notes |
|---|---|---|---|---|---|---|
| FR-001 | Fractions diagnostic and entry path | P1 | R1 | READY FOR QA | Implemented | **R1 steps 10–11 (D-026, `673d57c`), awaiting review.** The warm-up (equal parts first, then naming, no timer, stops after two misses) now ends with a choice of start: the suggested lesson or the beginning (RC-008). Placement never counts towards mastery and any lesson can be replayed. |
| FR-002 | Teach whole and equal parts | P1 | R1 | READY FOR QA | Implemented | **R1 steps 5–7 (D-026, `000ef13`), awaiting review.** Lesson `wholes` shows fair and unfair divisions and says why unequal pieces are not quarters; equal-parts questions always mix equal and unequal shapes (`journey-content.test.ts`). Independent educational review of the content is CUR-004 (not done). |
| FR-003 | Teach numerator and denominator | P1 | R1 | READY FOR QA | Implemented | **R1 steps 5–7 (D-026, `000ef13`), awaiting review.** Lesson `naming` introduces both terms with the anatomy picture; a test checks that no lesson, hint, feedback or misconception text reverses the terms. Independent educational review of the content is CUR-004 (not done). |
| FR-004 | Fractions of shapes and sets | P1 | R1 | READY FOR QA | Implemented | **R1 steps 5–7 (D-026, `000ef13`), awaiting review.** Bars, circles and grids, and discrete sets (counters); answers checked by count and amount; thousands of generated questions validated. Independent educational review of the content is CUR-004 (not done). |
| FR-005 | Compare simple fractions visually | P1 | R1 | READY FOR QA | Implemented | **R1 steps 5–7 (D-026, `000ef13`), awaiting review.** Lesson `comparing` explains why bigger denominators mean smaller pieces (fraction wall); comparison marking is exact, including equivalent pairs. Independent educational review of the content is CUR-004 (not done). |
| FR-006 | Explore equivalent fractions | P1 | R1 | READY FOR QA | Implemented | **R1 steps 5–7 (D-026, `000ef13`), awaiting review.** Lesson `equivalent` links × top and bottom to split parts with picture rows; equivalence checked exactly. Independent educational review of the content is CUR-004 (not done). |
| FR-007 | Fractions on a number line | P1 | R1 | READY FOR QA | Implemented | **R1 steps 5–7 (D-026, `000ef13`), awaiting review.** Every number line has 2 to 12 equal gaps from 0 to 1, points on marks, 0 and 1 labelled; place and read questions; the lab now has a number line too. Independent educational review of the content is CUR-004 (not done). |
| FR-008 | Find simple fractions of quantities | P1 | R1 | READY FOR QA | Implemented | **R1 steps 5–7 (D-026, `000ef13`), awaiting review.** Lesson `amounts` shares into denominator groups then counts numerator groups; whole-number results first; counters agree with the answer. Independent educational review of the content is CUR-004 (not done). |
| FR-009 | Add and subtract fractions with same denominator | P1 | R1 | READY FOR QA | Implemented | **R1 steps 5–7 (D-026, `000ef13`), awaiting review.** **New** lesson `adding` in the R1 Fractions island: why the denominator stays the same, a watched and a guided example, two checks; skill `fractions.add-same` with practice, follow-ups, check items (2 per form), a generator and a placement item. Pictures show the operation (parts added, or crossed out) and always agree with the symbols (tested over 600 items). Independent educational review of the content is CUR-004 (not done). |
| FR-010 | Fractions guided examples and fading support | P1 | R1 | READY FOR QA | Implemented | **R1 steps 10–11 (D-026, `673d57c`), awaiting review.** Core skills (RC-010) each have watch me → together (a guided step with a hint) → an independent check; the number-line lesson gained a guided example. Hints are always available on request and stop appearing automatically once a skill is secure. |
| FR-011 | Fractions learning journey screen | P1 | R1 | READY FOR QA | Implemented | **R1 step 4 (D-026), awaiting review.** Lessons complete on independent evidence, not visits (CUR-002 §4, `src/engine/evidence.ts`); the island map and journey detail show status, skill outcome, prerequisites and the next recommended step; prerequisites are explained soft locks (RC-009). Existing completions keep their stars and show as finished until evidence exists (RC-008 Q-A). |

### LAB — Interactive laboratory

| ID | Title | Pri | Rel | QA status | Implementation | Evidence and notes |
|---|---|---|---|---|---|---|
| LAB-001 | Build fraction model data engine | P1 | R1 | READY FOR QA | Implemented | **R1 steps 5–7 (D-026, `000ef13`), awaiting review.** One pure lab state (`labState.ts`); every number, picture and word is derived from it. 20,000 random changes keep them in agreement. |
| LAB-002 | Equal partition controls | P1 | R1 | READY FOR QA | Implemented | **R1 steps 5–7 (D-026, `000ef13`), awaiting review.** 1 to 12 equal parts; other values are refused, not approximated; part labels follow. |
| LAB-003 | Select and shade parts | P1 | R1 | READY FOR QA | Implemented | **R1 steps 5–7 (D-026, `000ef13`), awaiting review.** Pointer and keyboard shading tested in jsdom; numerator updates at once; repeated taps toggle predictably. Touch on real devices not tested yet. |
| LAB-004 | Multiple visual models | P1 | R1 | READY FOR QA | Implemented | **R1 steps 5–7 (D-026, `000ef13`), awaiting review.** Bar and circle; switching keeps the same fraction. |
| LAB-005 | Compare two fractions | P1 | R1 | READY FOR QA | Implemented | **R1 steps 5–7 (D-026, `000ef13`), awaiting review.** Two models compared by the maths engine; equivalent fractions are equal. |
| LAB-006 | Number-line interaction | P1 | R1 | READY FOR QA | Implemented | **R1 steps 5–7 (D-026, `000ef13`), awaiting review.** **New** number-line mode in the lab: drag, tap and keyboard, snapping to marks; question number lines can also be dragged. Touch on real devices not tested yet. |
| LAB-007 | Laboratory accessibility and input QA | P1 | R1 | READY FOR QA | Implemented | **R1 steps 5–7 (D-026, `000ef13`), awaiting review.** Every control has an accessible name (tested); shaded parts carry a tick as well as colour; keyboard tested. Touch and a reduced-motion browser run are not done yet (QA-005). |

### PRACT — Practice and question engine

| ID | Title | Pri | Rel | QA status | Implementation | Evidence and notes |
|---|---|---|---|---|---|---|
| PRACT-001 | Build deterministic question renderer and validator | P1 | R1 | READY FOR QA | Implemented | **R1 steps 8–9 (D-026, `0109bd1`), awaiting review.** Deterministic questions marked by pure maths; malformed definitions are now rejected at run time (the practice pool goes through the ARCH-002 validator); boundary fixtures. Marking itself stays in the Fractions evaluator (DEF-038 gate). |
| PRACT-002 | Multiple-choice and selection questions | P1 | R1 | READY FOR QA | Implemented | **R1 steps 8–9 (D-026, `0109bd1`), awaiting review.** Selected state, submit and feedback tested in the rendered player; every tagged distractor is verified wrong. |
| PRACT-003 | Shade-the-fraction questions | P1 | R1 | READY FOR QA | Implemented | **R1 steps 8–9 (D-026, `0109bd1`), awaiting review.** Every shade question asks for a fraction on equal parts that can be shaded exactly; keyboard selection tested. Touch on devices not tested. |
| PRACT-004 | Diagram-to-fraction matching | P1 | R1 | READY FOR QA | Implemented | **R1 steps 8–9 (D-026, `0109bd1`), awaiting review.** Each matching picture shows exactly its own answer and no two answers are equivalent; matching by keyboard tested. Touch on devices not tested. |
| PRACT-005 | Equal / unequal partition identification | P1 | R1 | READY FOR QA | Implemented | **R1 steps 8–9 (D-026, `0109bd1`), awaiting review.** Equal and unequal shapes always mixed; explanations state the reason; unequal parts never marked as equal. |
| PRACT-006 | Number-line and quantity questions | P1 | R1 | READY FOR QA | Implemented | **R1 steps 8–9 (D-026, `0109bd1`), awaiting review.** Number-line and fraction-of marking agree with the lab model for every mark from 2 to 12 gaps; generated values always valid. |
| PRACT-007 | Question difficulty and variation rules | P1 | R1 | READY FOR QA | Implemented | **R1 steps 8–9 (D-026, `0109bd1`), awaiting review.** [Variation and difficulty dimensions](curriculum/PRACT-007-question-variation.md) documented for every template and checked; every skill varies in form and representation; no repeats in a session. |
| PRACT-008 | Feedback and retry behaviour | P1 | R1 | READY FOR QA | Implemented | **R1 steps 8–9 (D-026, `0109bd1`), awaiting review.** Confirmation explains why; a tagged wrong answer gets a hedged diagnosis and a guided follow-up before any reveal; retries recorded; a word check on feedback. Tone review is CUR-004. |

### MIS — Misconception detection and recovery

| ID | Title | Pri | Rel | QA status | Implementation | Evidence and notes |
|---|---|---|---|---|---|---|
| MIS-001 | Define misconception catalogue | P1 | R1 | READY FOR QA | Implemented | **R1 steps 8–9 (D-026, `0109bd1`), awaiting review.** [Catalogue](curriculum/MIS-001-misconception-catalogue.md) of 8 possible misconceptions (the 5 required, plus one-part-only, additive equivalence, added denominators), each with example evidence, alternative explanations and a recovery activity. Generated from the content and kept in step by a test. |
| MIS-002 | Tag questions and distractors | P1 | R1 | READY FOR QA | Implemented | **R1 steps 8–9 (D-026, `0109bd1`), awaiting review.** Distractor-to-misconception map generated in the catalogue (§2); every tagged answer is checked wrong by the evaluator. |
| MIS-003 | Pattern-based misconception signals | P1 | R1 | READY FOR QA | Implemented | **R1 steps 8–9 (D-026, `0109bd1`), awaiting review.** A diagnosis needs a specific tagged answer (a generic mistake gets a hint); one answer is "possible", repeated answers "likely"; the evidence is the stored answers. |
| MIS-004 | Targeted recovery sequence | P1 | R1 | READY FOR QA | Implemented | **R1 steps 8–9 (D-026, `0109bd1`), awaiting review.** Recovery: a different explanation and picture, a guided follow-up, then a transfer question (new question, same skill, different form where possible). The solution is revealed only after the last attempt. |
| MIS-005 | Verify understanding after recovery | P1 | R1 | READY FOR QA | Implemented | **R1 steps 8–9 (D-026, `0109bd1`), awaiting review.** Recovery is judged on new questions answered first time; repeating the original question never counts; unresolved ones stay visible to grown-ups. |

### MAST — Assessment, mastery and progress

| ID | Title | Pri | Rel | QA status | Implementation | Evidence and notes |
|---|---|---|---|---|---|---|
| MAST-001 | Define skill mastery model | P1 | R1 | BLOCKED | Partial | **R1 steps 10–11 (D-026, `673d57c`), awaiting review.** [Mastery model](curriculum/MAST-001-mastery-model.md) documented: accuracy (secure) and independent application (mastered) are coded with adjustable named thresholds, unchanged (RC-008 Q-B). **Varied examples is not a coded criterion**: a Product Owner decision on the proposed `SECURE_MIN_FORMS = 2` is needed (MAST-001 §4). |
| MAST-002 | Build independent Fractions assessment | P1 | R1 | READY FOR QA | Implemented | **R1 steps 10–11 (D-026, `673d57c`), awaiting review.** Two parallel forms sample all five areas with every skill twice (now 18 items each, including adding and subtracting); items are unfamiliar (not in practice, lessons or follow-ups); no hints; the report gives skill-level evidence. |
| MAST-003 | Build progress dashboard | P1 | R1 | READY FOR QA | Implemented | **R1 steps 10–11 (D-026, `673d57c`), awaiting review.** The grown-ups overview shows lessons done (by evidence), secure, mastered and needs-review skills and the next activity, all derived from recorded attempts (component test compares every number with the engine). An island picker shows any island worked on (DEF-012). |
| MAST-004 | Build mastery results screen | P1 | R1 | READY FOR QA | Implemented | **R1 steps 10–11 (D-026, `673d57c`), awaiting review.** Results report strengths, next steps, ideas to watch (tentative), and per-skill status; a test checks no ability labels. Whether it is understandable to children and parents needs user review. |
| MAST-005 | Persistence and recovery testing | P1 | R1 | READY FOR QA | Implemented | **R1 steps 10–11 (D-026, `673d57c`), awaiting review.** Refresh and restart restore progress (persist tests); duplicate and interrupted attempts are handled; reset asks first, can be cancelled, and clears saved progress (component test). |

### TT — Times Tables (future, R2)

| ID | Title | Pri | Rel | QA status | Implementation | Evidence and notes |
|---|---|---|---|---|---|---|
| TT-001 | Create the Times Tables curriculum and progression | P2 | R2 | READY FOR QA | Implemented | **R2, D-032 step B, awaiting review; not accepted.** [TT-001 progression](curriculum/TT-001-times-tables-progression.md): curriculum, the Year 4 MTC and extension kept apart with sources; prior facts; lesson and table order; proposed fact thresholds (§5) for review. |
| TT-002 | Build conceptual multiplication lessons | P2 | R2 | READY FOR QA | Implemented | **R2, D-032 step B, awaiting review; not accepted.** 3 new skills and lessons on the times-tables island: groups, repeated addition, number-line jumps and scaling (`groups-and-jumps`); commutativity and the distributive law (`turn-and-split`). |
| TT-003 | Build division and inverse-fact lessons | P2 | R2 | READY FOR QA | Implemented | **R2, D-032 step B, awaiting review; not accepted.** `share-and-group`: sharing and grouping, fact families, and choosing the explanation of the inverse; division forms in fact practice. |
| TT-004 | Build table-by-table learning paths | P2 | R2 | READY FOR QA | Implemented | **R2, D-032 step B, awaiting review; not accepted.** Facts hub (`/t/times-tables/facts`): table-by-table paths in curriculum order, the 66-fact grid (known, growing, not yet, new), next table from the evidence. |
| TT-005 | Build an all-facts diagnostic | P2 | R2 | READY FOR QA | Implemented | **R2, D-032 step B, awaiting review; not accepted.** 25-fact diagnostic sampling every table; typing slips classed apart and asked again; framed as a starting point, not a label. |
| TT-006 | Build targeted fact practice | P2 | R2 | READY FOR QA | Implemented | **R2, D-032 step B, awaiting review; not accepted.** `planSession`: weak facts first, a known fact every 4th question, new facts paced; known after 3 recalls in a row. |
| TT-007 | Build times-table visual explorer | P2 | R2 | READY FOR QA | Implemented | **R2, D-032 step B, awaiting review; not accepted.** Explorer (`/t/times-tables/facts/explore`): 12 × 12 grid, array, number-line jumps, fact family and multiples highlight. |
| TT-008 | Build division fact recall practice | P2 | R2 | READY FOR QA | Implemented | **R2, D-032 step B, awaiting review; not accepted.** Missing dividend, divisor, quotient and factor forms, asked once the multiplication is recalled; exact integer answers. |
| TT-009 | Build MTC-style timed simulator | P2 | R2 | READY FOR QA | Implemented | **R2, D-032 step B, awaiting review; not accepted.** Timed practice built to the STA framework (25 questions, 6 s, 3 s pause, Table 1 and 2 limits), 3 unscored warm-ups, facts to revisit; labelled a practice simulation; kept out of fact status and skill mastery (context `timed`). |
| TT-010 | Build untimed confidence mode | P2 | R2 | READY FOR QA | Implemented | **R2, D-032 step B, awaiting review; not accepted.** Untimed mode: no clock, hint button, unlimited retries, "Show me"; summary counts facts, not speed. |
| TT-011 | Build times-table mastery reporting | P2 | R2 | READY FOR QA | Implemented | **R2, D-032 step B, awaiting review; not accepted.** Grown-up report (`/parent/facts`): per-fact accuracy, last-three consistency, division answers, timed answers in their own column, slips, recommended practice; no comparisons. |
| TT-012 | Build spaced review and practice scheduling | P2 | R2 | READY FOR QA | Implemented | **R2, D-032 step B, awaiting review; not accepted.** Leitner review boxes (0, 1, 2, 4, 7, 14 days), deterministic sessions, child-chosen length (5, 10, 20). |

### MM — Mental Maths (future, R3)

| ID | Title | Pri | Rel | QA status | Implementation | Evidence and notes |
|---|---|---|---|---|---|---|
| MM-001 | Research and validate a mental-strategy catalogue | P2 | R3 | READY FOR QA | Implemented | **R3, D-032 step C, awaiting review; not accepted.** [Catalogue](curriculum/MM-001-strategy-catalogue.md), generated from `src/maths/strategies.ts`: 24 strategies with justification, unsuitable cases, prerequisites and ages; every step BigInt-checked; no speed claims. |
| MM-002 | Build strategy learning template | P2 | R3 | READY FOR QA | Implemented | **R3, D-032 step C, awaiting review; not accepted.** Every Mental maths lesson has when to use it, why it works, a guided attempt, an independent transfer question and when not to use it (enforced by a test). |
| MM-003 | Teach number bonds, partitioning and place-value strategies | P2 | R3 | READY FOR QA | Implemented | **R3, D-032 step C, awaiting review; not accepted.** Bridge through 10, partition and recombine, round and adjust (adding and subtracting), count up through the hundred. |
| MM-004 | Teach doubling, halving and near-doubles | P2 | R3 | READY FOR QA | Implemented | **R3, D-032 step C, awaiting review; not accepted.** Near doubles, double one and halve the other, halve twice; linked to dividing and fractions. |
| MM-005 | Teach multiplication and division strategies | P2 | R3 | READY FOR QA | Implemented | **R3, D-032 step C, awaiting review; not accepted.** ×5, ×9, ×11, ×25, ×50, ×99; partitioning, factorising (associativity), dividing by factors, multiplying near 100. |
| MM-006 | Teach squares and number-pattern strategies | P2 | R3 | READY FOR QA | Implemented | **R3, D-032 step C, awaiting review; not accepted.** Squares to 12², squaring numbers ending in 5 with its boundary, next square from the last. |
| MM-007 | Teach fraction, decimal and percentage shortcuts | P2 | R3 | READY FOR QA | Implemented | **R3, D-032 step C, awaiting review; not accepted.** 10%, 5%, 25% and 50% of amounts, fractions of amounts, each with why it works. |
| MM-008 | Evaluate Vedic Maths candidate techniques | P2 | R3 | READY FOR QA | Implemented | **R3, D-032 step C, awaiting review; not accepted.** [Evaluation](curriculum/MM-008-vedic-evaluation.md): 2 techniques accepted with proofs, 3 left out with reasons; no historical or speed claims. Needs educational review. |
| MM-009 | Build compare-the-method activity | P2 | R3 | READY FOR QA | Implemented | **R3, D-032 step C, awaiting review; not accepted.** Methods lab, compare: a standard method, an efficient alternative and sometimes a method with one wrong step; any working method accepted. |
| MM-010 | Build strategy-selection challenges | P2 | R3 | READY FOR QA | Implemented | **R3, D-032 step C, awaiting review; not accepted.** Methods lab, choose and say why; and choose-a-method questions in island practice. Scored on validity and reason. |
| MM-011 | Build accuracy-first timed practice | P2 | R3 | READY FOR QA | Implemented | **R3, D-032 step C, awaiting review; not accepted.** One-minute challenge, open after 10 untimed answers at 80%+; accuracy first; compared only with the child's own runs. |
| MM-012 | Build mental-strategy mastery analytics | P2 | R3 | READY FOR QA | Implemented | **R3, D-032 step C, awaiting review; not accepted.** `/parent/strategies`: accuracy, method choice, independence, hints and time as separate columns; warns when speed hides lower accuracy; weakest skills recommended. |

### EXAM — 11+ preparation (future, R5)

| ID | Title | Pri | Rel | QA status | Implementation | Evidence and notes |
|---|---|---|---|---|---|---|
| EXAM-001 | Define exam-profile data model | P3 | R5 | READY FOR QA | Implemented | **R5, D-032 step D, awaiting review; not accepted.** [Profile model](exams/EXAM-001-002-profiles-and-verification.md) (`src/engine/examProfile.ts`): every fact verified with its source or explicitly unknown; no defaults. Only a general practice profile ships; no real school data added. |
| EXAM-002 | Build exam-format research and verification workflow | P3 | R5 | READY FOR QA | Implemented | **R5, D-032 step D, awaiting review; not accepted.** Validation refuses a fact sourced from another school; dated change log; official-source workflow documented. |
| EXAM-003 | Create 11+ question taxonomy | P3 | R5 | READY FOR QA | Implemented | **R5, D-032 step D, awaiting review; not accepted.** `src/topics/mock-exams/taxonomy.ts`: skill (with the borrowed origin), reasoning, representation, difficulty, format and profile; curriculum and exam-practice kept apart. |
| EXAM-004 | Build multi-step and unfamiliar problem practice | P3 | R5 | READY FOR QA | Implemented | **R5, D-032 step D, awaiting review; not accepted.** "Unfamiliar problems" skill and lesson on Mock exams: estimation, patterns, interpretation, multi-step, working backwards, method choice; explanations show reasoning. |
| EXAM-005 | Build timed section and mock-test engine | P3 | R5 | READY FOR QA | Implemented | **R5, D-032 step D, awaiting review; not accepted.** Practice mock (`/t/mock-exams/mock`): question count, section time, review rule and format; attempts stored for review; verified profile settings used where they exist; labelled practice on every screen. |
| EXAM-006 | Build post-test analysis | P3 | R5 | READY FOR QA | Implemented | **R5, D-032 step D, awaiting review; not accepted.** Analysis: time pressure, format, careless, knowledge gap, or unclear where evidence doesn't decide; revision plan with practice links; states it predicts no score or admission. |

### PARENT — Parent experience (future, R5)

| ID | Title | Pri | Rel | QA status | Implementation | Evidence and notes |
|---|---|---|---|---|---|---|
| PARENT-001 | Define learner profile and year group | P3 | R5 | READY FOR QA | Implemented | **R5, D-032 step D, awaiting review; not accepted.** Year group in the profile; weekly-plan workload in settings (optional fields, so saved data is unchanged); changes keep progress; "What Kite Maths stores" on the Overview. |
| PARENT-002 | Build parent progress summary | P3 | R5 | READY FOR QA | Implemented | **R5, D-032 step D, awaiting review; not accepted.** Overview "last 7 days": days active, answers, minutes on questions (where recorded, and what isn't counted), islands, skills needing support; weekly comparison on the Full report. |
| PARENT-003 | Build weekly learning plan | P3 | R5 | READY FOR QA | Implemented | **R5, D-032 step D, awaiting review; not accepted.** `/parent/plan`: days and minutes chosen by the grown-up; review, new learning, times tables, mental maths and problem solving from the evidence, each with its reason; estimates stated. |

### QA — Quality engineering

| ID | Title | Pri | Rel | QA status | Implementation | Evidence and notes |
|---|---|---|---|---|---|---|
| QA-001 | Build mathematical unit-test suite | P0 | R0/R1 | ACCEPTED (D-024) | Implemented | **Accepted for delivered R0 scope (D-024).** Regression tests for DEF-027 stay R1. **Review 2 corrected 6 Nov (DEF-029):** BigInt-oracle cases at the safe-integer extremes. Delivered 5 Nov (step 3): `src/maths/maths.test.ts` (hand-worked tables, boundaries, invalid inputs, overflow, BigInt oracle) and `src/topics/fractions/representations.test.ts` (pictures agree with answers, per interaction). |
| QA-002 | Build component and integration tests | P1 | R1 | READY FOR QA | Implemented | **R1 steps 10–11 (D-026, `673d57c`), awaiting review.** Component and integration tests in jsdom (Testing Library): lab, question player, lesson player with persistence, warm-up result, grown-ups, results; they run in CI with the unit tests. |
| QA-003 | Build end-to-end learning journey tests | P1 | R1 | READY FOR QA | Implemented | **R1 steps 10–11 (D-026, `673d57c`), awaiting review.** `verification/journey-e2e.cjs`: dashboard → lesson with a mistake and recovery → practice session → mastery check → results, plus a link and placeholder check (58 links). 18 checks pass. Runs against a production build, not in CI. Found and fixed DEF-039. |
| QA-004 | Create defect register and triage rules | P0 | R0 | READY FOR QA | Partial | **Delivered 6 Nov, awaiting review; not self-accepted (D-022).** [Defect register and triage rules](QA-004-defect-register.md): all 38 defects in [`traceability/defects.csv`](traceability/defects.csv) with severity, priority, steps, expected/actual, evidence, tested commit, owner, fix and retest status, release impact and deferral; this file's index agrees with it (`src/defects.test.ts`). 9 closed on independent verification; 5 fixed with closure not confirmed (DEF-022 to DEF-026); no approved release deferral exists. DEF-001 to DEF-017 priorities were assigned in this round. |
| QA-005 | Accessibility and responsive test pass | P1 | R1 | READY FOR QA | Implemented | **R1 steps 10–11 (D-026, `673d57c`), awaiting review.** Keyboard, focus, contrast, text scaling, reduced motion and five widths executed; failures logged and retested (UX-007 audit §3). Touch only by emulation. |
| QA-006 | Regression test suite | P1 | R1 | READY FOR QA | Implemented | **R1 steps 10–11 (D-026, `673d57c`), awaiting review.** [Regression rules](verification/QA-006-regression.md); CI now runs on pushes to `claude/**` as well as `main`. Browser scripts are documented local commands. |
| QA-007 | Release acceptance report | P1 | R1 | READY FOR QA | Implemented | **R1, awaiting review.** [R1 release acceptance report](reports/R1-release-acceptance-report.md): features, tests executed, results, unresolved defects, limitations; final acceptance decision left to the Product Owner. |

## Defect index

The defect register is [`traceability/defects.csv`](traceability/defects.csv), shown with the triage rules in [QA-004](QA-004-defect-register.md). This table is an index of it and must agree with it (`src/defects.test.ts`). Fix and retest detail is in the register, not here. An item's acceptance does not close a defect.

| Defect | Severity | State | Affects |
|---|---|---|---|
| DEF-001 | Medium | Open | UX-005; MAST-003 |
| DEF-002 | Medium | Fixed, closure not confirmed | UX-005; MAST-003 |
| DEF-003 | Medium | Fixed, closure not confirmed | UX-005; MAST-003 |
| DEF-004 | Medium | Fixed, closure not confirmed | UX-005; MAST-003 |
| DEF-005 | High | Fixed, closure not confirmed | UX-005 AC3 |
| DEF-006 | Low | Fixed, closure not confirmed | UX-005; MAST-003 |
| DEF-007 | Low | Fixed, closure not confirmed | UX-005; MAST-003 |
| DEF-008 | Low | Fixed, closure not confirmed | No specific acceptance criterion (copy accuracy) |
| DEF-009 | Medium | Fixed, closure not confirmed | UX-002; UX-004 |
| DEF-010 | Medium | Fixed, closure not confirmed | UX-003 |
| DEF-011 | Medium | Fixed, closure not confirmed | FR-001; FR-011; CUR-002 |
| DEF-012 | Medium | Fixed, closure not confirmed | MAST-003; PARENT-002 |
| DEF-013 | Medium | Fixed, closure not confirmed | FR-011; CUR-002 |
| DEF-014 | Low | Fixed, closure not confirmed | No specific acceptance criterion (redirects) |
| DEF-015 | Medium | Fixed, closure not confirmed | UX-007 |
| DEF-016 | Low | Fixed, closure not confirmed | No specific acceptance criterion (public preview pages) |
| DEF-017 | Low | Fixed, closure not confirmed | GOV-002 |
| DEF-018 | Medium | Fixed, closure not confirmed | UX-003 AC3; UX-005; UX-007 |
| DEF-019 | Medium | Fixed, closure not confirmed | UX-003 AC3; FR-001 |
| DEF-020 | Medium | Fixed, closure not confirmed | UX-003 AC3; PARENT |
| DEF-021 | Low | Fixed, closure not confirmed | UX-003 AC3 |
| DEF-022 | High | Fixed, closure not confirmed | UX-002; UX-003; UX-004 |
| DEF-023 | High | Fixed, closure not confirmed | ARCH-001 |
| DEF-024 | High | Fixed, closure not confirmed | CUR-002 AC3; CUR-003 |
| DEF-025 | Medium | Fixed, closure not confirmed | CUR-002 |
| DEF-026 | Medium | Fixed, closure not confirmed | CUR-003 |
| DEF-027 | Low | Open | ARCH-003 |
| DEF-028 | Low | Fixed, closure not confirmed | ARCH-002 |
| DEF-029 | High | Closed (verified) | ARCH-003; QA-001 |
| DEF-030 | High | Closed (verified) | ARCH-001 |
| DEF-031 | High | Closed (verified) | ARCH-001 |
| DEF-032 | Medium | Closed (verified) | ARCH-002 |
| DEF-033 | Medium | Closed (verified) | ARCH-002 |
| DEF-034 | Medium | Closed (verified) | ARCH-002 |
| DEF-035 | Medium | Closed (verified) | ARCH-002 |
| DEF-036 | Low | Closed (verified) | UX-004 |
| DEF-037 | Medium | Closed (verified) | ARCH-002 |
| DEF-038 | Medium | Partly fixed (behaviour open) | ARCH-002 |
| DEF-039 | Medium | Fixed, closure not confirmed | PRACT-008; FR-011; UX-005 |
