# Status register

This is the **only** place where backlog item status is recorded. The items, their scope and their
acceptance criteria are in [`backlog.md`](backlog.md); how statuses work is explained in
[`README.md`](README.md#status-definitions). `src/traceability.test.ts` checks that every backlog item
is listed here exactly once with valid values (RC-003).

**Last updated:** 9 November 2026: R1 authorised in sequence (D-026). Step 4 delivered: FR-011, ARCH-004 and UX-005 READY FOR QA, UX-003 READY FOR RETEST, DEF-002 to DEF-021 fixed except DEF-001 (awaiting retest). Earlier, 6 November: GOV-004, CUR-001 and QA-004 delivered and READY FOR QA, with the step-4 handoff and the [R0 readiness report](reports/R0-readiness-report.md). Earlier the same day: QA decision on `112eeb3` recorded (D-025): ARCH-002 accepted for R0 scope, DEF-037 closed, DEF-038 documentation verified with the behaviour still open for R1. Earlier the same day: retest of `702743a` recorded (D-024): DEF-029 to DEF-036 closed; ARCH-001, ARCH-003, QA-001 and UX-004 accepted for their scopes; ARCH-002 QA FAILED (DEF-037, DEF-038), then corrected and READY FOR QA ([report](reports/R0-review3-correction-report.md)). Earlier the same day: independent review of `0b45d12` recorded (D-023): CUR-002 and CUR-003 accepted for R0 specification scope, UX-002 accepted for R0 token and specification scope only. ARCH-001, ARCH-002, ARCH-003, QA-001 and UX-004 corrected and READY FOR QA ([correction report](reports/R0-review2-correction-report.md)). Earlier, 5 November: sprint step 3 delivered (ARCH-002, ARCH-003, QA-001 READY FOR QA, [step-3 report](reports/R0-step3-status-report.md)). Before that, the same day: step-2 corrections delivered ([correction report](reports/R0-step2-correction-report.md)). Five items are READY FOR QA again (D-022); UX-003 stays QA FAILED (D-021). Earlier the same day: the independent review set six items to QA FAILED (D-014), and Q-1 to Q-7 were decided (D-015 to D-021). 4 November: sprint step 2 delivered for review. CUR-002, CUR-003, UX-002, UX-003, UX-004 and ARCH-001 are READY FOR QA ([status report](reports/R0-step2-status-report.md)). Earlier the same day: GOV-002, GOV-003 and UX-001 accepted (D-011); step 2 authorised (D-012).

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
| CUR-004 | Review all Fractions content for mathematical validity | P1 | R1 | SPECIFIED | Partial | Automated maths-correctness checks (`content.test.ts`); no independent educational review. |

### UX — Design system and experience

| ID | Title | Pri | Rel | QA status | Implementation | Evidence and notes |
|---|---|---|---|---|---|---|
| UX-001 | Competitor UX benchmark | P0 | R0 | ACCEPTED (D-011) | Implemented | Delivered 3 Nov: [benchmark](benchmark/UX-001-competitor-benchmark.md). |
| UX-002 | Create the visual design system | P0 | R0 | ACCEPTED (D-023) | Partial | **Accepted for R0 token and specification scope only (D-023).** Screen migration (AC2) and DEF-009 stay open for R1; planned R1 tests stay planned; browser and visual tests keep their actual status (developer browser evidence, not independently passed). Existing screens do not yet meet all UX-002 requirements. QA FAILED at `6050e3c` (D-014); corrected 5 Nov. [Design tokens](design/UX-002-design-tokens.md); label-background tokens; 52 checked pairings; a hex-occurrence ratchet (DEF-022). Screens are not yet migrated (R1, RC-006); DEF-009 is open. |
| UX-003 | Define typography and mathematical readability | P0 | R0 | READY FOR RETEST | Partial | **Fixed in R1 step 4 (D-026), awaiting independent retest.** DEF-018 to DEF-021 fixed: no sideways scroll or clipped text on the 8 tested pages at 200% text (390, 768, 1280px) and at 320px, except the internal design specimen at 768px (a worked-example panel, 24px). Developer evidence (`verification/text-scaling.cjs`). Was QA FAILED (D-021). |
| UX-004 | Establish content differentiation rules | P0 | R0 | ACCEPTED (D-024) | Partial | **Accepted for R0 specification and specimen scope (D-024).** Screen migration, usability testing with children and browser-evidence independence stay R1/unchanged. **Review 2 corrected 6 Nov (DEF-036):** comparison rule states same positive numerator, positive denominators, same-sized wholes. QA FAILED at `6050e3c` (D-014); corrected 5 Nov. [Content types](design/UX-004-content-differentiation.md): corrected contrast, Q-6 wording, and supported pairings in §2.3 (DEF-022). Screens still share one treatment for hint, tip, notice and retry (R1). Child usability is not shown by the specimen (R1 testing). |
| UX-005 | Build responsive application shell and navigation | P1 | R1 | READY FOR QA | Implemented | **R1 step 4 (D-026), awaiting review.** Working navigation to home, map, island journey, lessons, practice and the grown-ups report at 390, 768 and 1280px; no placeholder Lab tab (DEF-005); hubs open the current island (DEF-014); mock-ups no longer public (DEF-016); header and tabs reflow at 200% text (DEF-018). Developer browser evidence (`verification/r1-step4-checks.cjs`), not independently reproduced. Tablet layout is the phone/desktop layout at 768px; no separate tablet design review yet. |
| UX-006 | Motion and interaction language | P1 | R1 | SPECIFIED | Partial | Reduced motion respected (`MotionConfig`, CSS); some decorative motion; no documented timing/easing. |
| UX-007 | Accessibility baseline | P1 | R1 | SPECIFIED | Partial | Skip link, focus ring, labels, read-aloud; number boxes lose focus ring (DEF-015); no audit. |
| UX-008 | Responsive visual QA | P1 | R1 | SPECIFIED | Partial | Ad hoc Playwright checks at 390/1280px (3 Nov); not tablet/small-mobile; not in repo. |

### ARCH — Learning architecture

| ID | Title | Pri | Rel | QA status | Implementation | Evidence and notes |
|---|---|---|---|---|---|---|
| ARCH-001 | Define modular learning architecture | P0 | R0 | ACCEPTED (D-024) | Partial | **Accepted for delivered R0 scope (D-024).** Couplings K-1 to K-6 stay R1. **Review 2 corrected 6 Nov (DEF-030, DEF-031):** global-object escape detection, a layer matrix with a transitive check, 22 bad and 11 good fixtures. Documented allowlists unchanged. QA FAILED at `6050e3c` (D-014); corrected 5 Nov. [Architecture](architecture/ARCH-001-architecture.md). The guard is rebuilt on the TypeScript compiler (`src/architecture/analyse.ts`). 15 bad and 5 good fixtures; the reviewer's probe fails (DEF-023). Couplings K-1 to K-7 stay for R1; K-6 and K-7 were found by the new guard. |
| ARCH-002 | Define a typed question schema | P0 | R0 | ACCEPTED (D-025) | Partial | **Accepted for delivered R0 schema, validator and adapter scope (D-025).** The behavioural difference between the kit's `same()` and the new comparator is **not fixed**: it stays an R1 integration prerequisite (`TC-ARCH-002.1.13`), and the schema is not used for marking. Using definitions in the app and DEF-028 stay R1.**QA FAILED on retest (D-024):** DEF-037 (rounding comparison loses precision or overflows) and DEF-038 (the claim that adapters reproduce existing kit marking is wrong). **Review 2 corrected 6 Nov (DEF-032 to DEF-035):** nested trap fields, one numeric comparison contract (no fixed allowance), duplicate fraction traps, explicit `ask` for model checks. DEF-028 exception narrowed. Limitations: `ask` absent means unchecked; fraction-text options and match pictures aren't checked against models. Delivered 5 Nov (step 3): [question schema](architecture/ARCH-002-question-schema.md): `src/questions/` schema, runtime validator and adapters for 12 interactions. Valid and invalid fixtures for each; all existing Fractions and kit questions validate apart from DEF-028. **Not yet used by the app.** |
| ARCH-003 | Build pure mathematical logic modules | P0 | R0 | ACCEPTED (D-024) | Partial | **Accepted for delivered R0 scope (D-024).** DEF-027 and K-1 to K-6 stay R1. **Review 2 corrected 6 Nov (DEF-029):** exact Euclidean `divmod`, BigInt-oracle regression tests. Delivered 5 Nov (step 3): [pure maths](architecture/ARCH-003-maths.md): checked fraction arithmetic, mixed numbers, partitions, integers, place value. Duplicates replaced; 51,098 generated questions identical before and after. K-7 fixed. Existing unchecked functions keep their behaviour (DEF-027). |
| ARCH-004 | Implement prototype progress persistence | P1 | R1 | READY FOR QA | Implemented | **R1 step 4 (D-026), awaiting review.** Load and save in `src/lib/persist.ts`, tested with an in-memory storage: refresh and restart, versioned schema, corrupt or missing data, blocked storage, v1 migration, and no personal data beyond an optional first name, year and avatar. Developer browser check of a reload. |
| ARCH-005 | Build a reusable event and attempt model | P1 | R1 | SPECIFIED | Partial | `ItemResult` records attempts, hints, first try, time; no response or duration. |

### FR — Fractions learning journey

| ID | Title | Pri | Rel | QA status | Implementation | Evidence and notes |
|---|---|---|---|---|---|---|
| FR-001 | Fractions diagnostic and entry path | P1 | R1 | SPECIFIED | Partial | Fractions warm-up (`fractions/placement.ts`); only 'Start from the beginning' as a choice. |
| FR-002 | Teach whole and equal parts | P1 | R1 | SPECIFIED | Implemented | Lesson `wholes`, kind `equal-parts`, `isEqualPartition`. |
| FR-003 | Teach numerator and denominator | P1 | R1 | SPECIFIED | Implemented | Lesson `naming`, coloured numerator/denominator, `FractionNotation`. |
| FR-004 | Fractions of shapes and sets | P1 | R1 | SPECIFIED | Implemented | Shape and set questions (`fractions/questions.ts`, `generate.ts`). |
| FR-005 | Compare simple fractions visually | P1 | R1 | SPECIFIED | Implemented | Lesson `comparing`, kind `compare`, `compare()`. |
| FR-006 | Explore equivalent fractions | P1 | R1 | SPECIFIED | Implemented | Lesson `equivalent`, `equivalent()`, lab equivalence mode. |
| FR-007 | Fractions on a number line | P1 | R1 | SPECIFIED | Implemented | Lesson `number-line`, kind `number-line-place`, `NumberLine` (tap/keys). |
| FR-008 | Find simple fractions of quantities | P1 | R1 | SPECIFIED | Implemented | Lesson `amounts`, `fractionOfAmount` (whole results only). |
| FR-009 | Add and subtract fractions with same denominator | P1 | R1 | SPECIFIED | Partial | Only in the unaccepted Fractions 2 preview (`fractions-2`, skill `add-same`). |
| FR-010 | Fractions guided examples and fading support | P1 | R1 | SPECIFIED | Partial | Worked steps full/faded exist; single hint string, no gradual reduction. |
| FR-011 | Fractions learning journey screen | P1 | R1 | READY FOR QA | Implemented | **R1 step 4 (D-026), awaiting review.** Lessons complete on independent evidence, not visits (CUR-002 §4, `src/engine/evidence.ts`); the island map and journey detail show status, skill outcome, prerequisites and the next recommended step; prerequisites are explained soft locks (RC-009). Existing completions keep their stars and show as finished until evidence exists (RC-008 Q-A). |

### LAB — Interactive laboratory

| ID | Title | Pri | Rel | QA status | Implementation | Evidence and notes |
|---|---|---|---|---|---|---|
| LAB-001 | Build fraction model data engine | P1 | R1 | SPECIFIED | Partial | One state per lab mode drives shape + notation; not shared across modes (`FractionLab.tsx`). |
| LAB-002 | Equal partition controls | P1 | R1 | SPECIFIED | Implemented | Denominators up to 12, equal partitions (`fractions/lab.ts`). |
| LAB-003 | Select and shade parts | P1 | R1 | SPECIFIED | Implemented | Shading by mouse/touch/keyboard (`FractionShape.tsx`, `role=checkbox`). |
| LAB-004 | Multiple visual models | P1 | R1 | SPECIFIED | Implemented | Bar and circle models (`FractionShape`). |
| LAB-005 | Compare two fractions | P1 | R1 | SPECIFIED | Implemented | Lab compare mode computed by `compare()`. |
| LAB-006 | Number-line interaction | P1 | R1 | SPECIFIED | Partial | Number line by tap/arrow keys in questions; no drag; no number line in the lab. |
| LAB-007 | Laboratory accessibility and input QA | P1 | R1 | SPECIFIED | Partial | Keyboard and labels present; lab accessibility not tested. |

### PRACT — Practice and question engine

| ID | Title | Pri | Rel | QA status | Implementation | Evidence and notes |
|---|---|---|---|---|---|---|
| PRACT-001 | Build deterministic question renderer and validator | P1 | R1 | SPECIFIED | Partial | Deterministic seeded questions, pure marking; malformed definitions not rejected at runtime. |
| PRACT-002 | Multiple-choice and selection questions | P1 | R1 | SPECIFIED | Implemented | Choice questions with tagged distractors. |
| PRACT-003 | Shade-the-fraction questions | P1 | R1 | SPECIFIED | Implemented | Kind `shade`, validated by amount. |
| PRACT-004 | Diagram-to-fraction matching | P1 | R1 | SPECIFIED | Implemented | Kind `match`, validated row by row. |
| PRACT-005 | Equal / unequal partition identification | P1 | R1 | SPECIFIED | Implemented | Kind `equal-parts`, unequal flagged. |
| PRACT-006 | Number-line and quantity questions | P1 | R1 | SPECIFIED | Implemented | Number-line and fraction-of questions use `src/maths/fraction.ts`. |
| PRACT-007 | Question difficulty and variation rules | P1 | R1 | SPECIFIED | Partial | Variety and no-repeat rules in practice; difficulty dimensions not documented. |
| PRACT-008 | Feedback and retry behaviour | P1 | R1 | SPECIFIED | Implemented | Hint → retry → reveal flow (`src/engine/recovery.ts`). |

### MIS — Misconception detection and recovery

| ID | Title | Pri | Rel | QA status | Implementation | Evidence and notes |
|---|---|---|---|---|---|---|
| MIS-001 | Define misconception catalogue | P1 | R1 | SPECIFIED | Partial | 7 fraction misconceptions (`fractions/misconceptions.ts`); alternative explanations not documented per entry. |
| MIS-002 | Tag questions and distractors | P1 | R1 | SPECIFIED | Partial | Options/traps tagged; mapping tested but not documented. |
| MIS-003 | Pattern-based misconception signals | P1 | R1 | SPECIFIED | Partial | Reports 'possible'/'likely', but recovery fires after one tagged answer. |
| MIS-004 | Targeted recovery sequence | P1 | R1 | SPECIFIED | Partial | Diagnosis → follow-up → retry; no explicit transfer question. |
| MIS-005 | Verify understanding after recovery | P1 | R1 | SPECIFIED | Partial | Rechecks use new items; resolution tracking exists; 'unresolved' display not reviewed. |

### MAST — Assessment, mastery and progress

| ID | Title | Pri | Rel | QA status | Implementation | Evidence and notes |
|---|---|---|---|---|---|---|
| MAST-001 | Define skill mastery model | P1 | R1 | SPECIFIED | Partial | Thresholds coded and tested (`src/engine/mastery.ts`); not documented for the PO. |
| MAST-002 | Build independent Fractions assessment | P1 | R1 | SPECIFIED | Implemented | A/B check forms, no hints (`fractions/questions.ts`). |
| MAST-003 | Build progress dashboard | P1 | R1 | SPECIFIED | Implemented | Grown-ups overview from recorded attempts (active island only). |
| MAST-004 | Build mastery results screen | P1 | R1 | SPECIFIED | Implemented | `ResultsScreen` strengths/developing/ideas to watch. |
| MAST-005 | Persistence and recovery testing | P1 | R1 | SPECIFIED | Partial | Dedup and retake rules tested; refresh/reset not tested end-to-end. |

### TT — Times Tables (future, R2)

| ID | Title | Pri | Rel | QA status | Implementation | Evidence and notes |
|---|---|---|---|---|---|---|
| TT-001 | Create the Times Tables curriculum and progression | P2 | R2 | SPECIFIED | Partial | Unaccepted Times tables preview: 5 lessons grouped by families (`src/topics/times-tables`); no MTC distinction. |
| TT-002 | Build conceptual multiplication lessons | P2 | R2 | SPECIFIED | Partial | Preview uses arrays and doubling; no number-line/scaling or distributive lesson. |
| TT-003 | Build division and inverse-fact lessons | P2 | R2 | SPECIFIED | Partial | Preview 'Division facts' lesson with fact families. |
| TT-004 | Build table-by-table learning paths | P2 | R2 | SPECIFIED | Partial | Preview groups tables into 5 skills; no per-fact known/developing view. |
| TT-005 | Build an all-facts diagnostic | P2 | R2 | SPECIFIED | Not implemented | No all-facts diagnostic. |
| TT-006 | Build targeted fact practice | P2 | R2 | SPECIFIED | Partial | Adaptive practice per skill, not per fact. |
| TT-007 | Build times-table visual explorer | P2 | R2 | SPECIFIED | Not implemented | No interactive grid explorer (a static times-row picture exists). |
| TT-008 | Build division fact recall practice | P2 | R2 | SPECIFIED | Partial | Preview division templates (`tt-div`, `tt-div-family`). |
| TT-009 | Build MTC-style timed simulator | P2 | R2 | SPECIFIED | Not implemented | No timed MTC-style mode. |
| TT-010 | Build untimed confidence mode | P2 | R2 | SPECIFIED | Partial | All practice is untimed; no dedicated confidence mode. |
| TT-011 | Build times-table mastery reporting | P2 | R2 | SPECIFIED | Not implemented | No per-fact reporting. |
| TT-012 | Build spaced review and practice scheduling | P2 | R2 | SPECIFIED | Not implemented | No spaced review scheduling. |

### MM — Mental Maths (future, R3)

| ID | Title | Pri | Rel | QA status | Implementation | Evidence and notes |
|---|---|---|---|---|---|---|
| MM-001 | Research and validate a mental-strategy catalogue | P2 | R3 | SPECIFIED | Not implemented | No strategy catalogue. |
| MM-002 | Build strategy learning template | P2 | R3 | SPECIFIED | Not implemented | No strategy lesson template. |
| MM-003 | Teach number bonds, partitioning and place-value strategies | P2 | R3 | SPECIFIED | Partial | Add and subtract preview lesson 'Quick sums in your head' (bonds, round-and-adjust); not a strategy lesson. |
| MM-004 | Teach doubling, halving and near-doubles | P2 | R3 | SPECIFIED | Partial | Times tables preview uses doubling for 4s and 8s; no doubling/halving strategy lesson. |
| MM-005 | Teach multiplication and division strategies | P2 | R3 | SPECIFIED | Partial | Multiply and divide preview 'Split it up' partitioning; no strategy catalogue. |
| MM-006 | Teach squares and number-pattern strategies | P2 | R3 | SPECIFIED | Not implemented | No squares/pattern strategies. |
| MM-007 | Teach fraction, decimal and percentage shortcuts | P2 | R3 | SPECIFIED | Partial | Percentages preview teaches 10% build-up and FDP equivalents; not as strategy lessons. |
| MM-008 | Evaluate Vedic Maths candidate techniques | P2 | R3 | SPECIFIED | Not implemented | No Vedic evaluation. |
| MM-009 | Build compare-the-method activity | P2 | R3 | SPECIFIED | Not implemented | No compare-the-method activity. |
| MM-010 | Build strategy-selection challenges | P2 | R3 | SPECIFIED | Not implemented | No strategy-selection challenges. |
| MM-011 | Build accuracy-first timed practice | P2 | R3 | SPECIFIED | Not implemented | No timed practice. |
| MM-012 | Build mental-strategy mastery analytics | P2 | R3 | SPECIFIED | Not implemented | No strategy analytics. |

### EXAM — 11+ preparation (future, R5)

| ID | Title | Pri | Rel | QA status | Implementation | Evidence and notes |
|---|---|---|---|---|---|---|
| EXAM-001 | Define exam-profile data model | P3 | R5 | SPECIFIED | Not implemented | No exam-profile model. |
| EXAM-002 | Build exam-format research and verification workflow | P3 | R5 | SPECIFIED | Not implemented | No verification workflow. |
| EXAM-003 | Create 11+ question taxonomy | P3 | R5 | SPECIFIED | Not implemented | No 11+ taxonomy (skills + difficulty only). |
| EXAM-004 | Build multi-step and unfamiliar problem practice | P3 | R5 | SPECIFIED | Partial | Problem solving preview island (two-step, working backwards, bar models). |
| EXAM-005 | Build timed section and mock-test engine | P3 | R5 | SPECIFIED | Partial | Mock exams preview: 12 untimed mixed questions; no timing or configuration. |
| EXAM-006 | Build post-test analysis | P3 | R5 | SPECIFIED | Not implemented | No post-test analysis. |

### PARENT — Parent experience (future, R5)

| ID | Title | Pri | Rel | QA status | Implementation | Evidence and notes |
|---|---|---|---|---|---|---|
| PARENT-001 | Define learner profile and year group | P3 | R5 | SPECIFIED | Partial | Name and year stored (`LearnerProfile`); year not used. |
| PARENT-002 | Build parent progress summary | P3 | R5 | SPECIFIED | Partial | Grown-ups overview and report, active island only. |
| PARENT-003 | Build weekly learning plan | P3 | R5 | SPECIFIED | Not implemented | No weekly plan. |

### QA — Quality engineering

| ID | Title | Pri | Rel | QA status | Implementation | Evidence and notes |
|---|---|---|---|---|---|---|
| QA-001 | Build mathematical unit-test suite | P0 | R0/R1 | ACCEPTED (D-024) | Implemented | **Accepted for delivered R0 scope (D-024).** Regression tests for DEF-027 stay R1. **Review 2 corrected 6 Nov (DEF-029):** BigInt-oracle cases at the safe-integer extremes. Delivered 5 Nov (step 3): `src/maths/maths.test.ts` (hand-worked tables, boundaries, invalid inputs, overflow, BigInt oracle) and `src/topics/fractions/representations.test.ts` (pictures agree with answers, per interaction). |
| QA-002 | Build component and integration tests | P1 | R1 | SPECIFIED | Not implemented | No component or integration tests (`vitest` runs `.ts` only). |
| QA-003 | Build end-to-end learning journey tests | P1 | R1 | SPECIFIED | Not implemented | No end-to-end journey test in the repo. |
| QA-004 | Create defect register and triage rules | P0 | R0 | READY FOR QA | Partial | **Delivered 6 Nov, awaiting review; not self-accepted (D-022).** [Defect register and triage rules](QA-004-defect-register.md): all 38 defects in [`traceability/defects.csv`](traceability/defects.csv) with severity, priority, steps, expected/actual, evidence, tested commit, owner, fix and retest status, release impact and deferral; this file's index agrees with it (`src/defects.test.ts`). 9 closed on independent verification; 5 fixed with closure not confirmed (DEF-022 to DEF-026); no approved release deferral exists. DEF-001 to DEF-017 priorities were assigned in this round. |
| QA-005 | Accessibility and responsive test pass | P1 | R1 | SPECIFIED | Partial | Ad hoc manual checks only. |
| QA-006 | Regression test suite | P1 | R1 | SPECIFIED | Partial | CI runs tests/lint/types/build; no flow regression suite. |
| QA-007 | Release acceptance report | P1 | R1 | SPECIFIED | Not implemented | No release acceptance report yet. |

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
| DEF-028 | Low | Open | ARCH-002 |
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
