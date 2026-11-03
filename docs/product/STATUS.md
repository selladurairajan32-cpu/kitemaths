# Status register

This is the **only** place where backlog item status is recorded. The items, their scope and their
acceptance criteria are in [`backlog.md`](backlog.md); how statuses work is explained in
[`README.md`](README.md#status-definitions). `src/traceability.test.ts` checks that every backlog item
is listed here exactly once with valid values (RC-003).

**Last updated:** 3 November 2026, after delivering GOV-002, GOV-003 and UX-001 for review.

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

**QA status:** SPECIFIED: 93, READY FOR QA: 3, ACCEPTED: 1.

- Exactly **one** item is ACCEPTED: GOV-001.
- Three are READY FOR QA, delivered on 3 Nov: GOV-002, GOV-003 and UX-001.
- Every other item is SPECIFIED: it has acceptance criteria in backlog v1.0 but hasn't been refined to
  the Definition of Ready (D-009).

**Implementation evidence by epic:**

| Epic | Items | Implemented | Partial | Not implemented |
|---|---:|---:|---:|---:|
| GOV | 4 | 3 | 1 | 0 |
| CUR | 4 | 0 | 3 | 1 |
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
| QA | 7 | 0 | 4 | 3 |
| **Total** | **97** | **25** | **50** | **22** |

The 18 non-Fractions islands are live as **unaccepted previews** (D-001). Their content appears below
only where it is evidence for a backlog item: Times Tables, Mental Maths, 11+ and Parent.

## Register

### GOV — Product governance

| ID | Title | Pri | Rel | QA status | Implementation | Evidence and notes |
|---|---|---|---|---|---|---|
| GOV-001 | Inspect the existing repository | P0 | R0 | ACCEPTED (D-005) | Implemented | Delivered: [GOV-001 audit](GOV-001-repository-audit.md). |
| GOV-002 | Establish the product source of truth | P0 | R0 | READY FOR QA | Implemented | Delivered 3 Nov: `docs/product/` source-of-truth set (this file, README, DECISIONS, backlog v1.0). |
| GOV-003 | Create requirements traceability | P0 | R0 | READY FOR QA | Implemented | Delivered 3 Nov: `traceability/` CSVs + `src/traceability.test.ts` checker. |
| GOV-004 | Define change-control rules | P0 | R0 | SPECIFIED | Partial | Decision log exists ([DECISIONS.md](DECISIONS.md)); change-control *rules* not yet defined. |

### CUR — Curriculum and instructional design

| ID | Title | Pri | Rel | QA status | Implementation | Evidence and notes |
|---|---|---|---|---|---|---|
| CUR-001 | Build the Year 3–6 curriculum map | P0 | R0 | SPECIFIED | Partial | Worlds/islands with `years` in `src/topics/worlds.ts` and each island; no objective-level map, prerequisites or DfE source check. |
| CUR-002 | Define the learning progression model | P0 | R0 | SPECIFIED | Not implemented | No prerequisite graph; `recommendNext` is linear (`src/engine/journey.ts`). |
| CUR-003 | Create the instructional lesson template | P0 | R0 | SPECIFIED | Partial | `src/lessons/types.ts` (explain, worked full/faded, check, lab); no prerequisites, reflection or mastery-check step. |
| CUR-004 | Review all Fractions content for mathematical validity | P1 | R1 | SPECIFIED | Partial | Automated maths-correctness checks (`content.test.ts`); no independent educational review. |

### UX — Design system and experience

| ID | Title | Pri | Rel | QA status | Implementation | Evidence and notes |
|---|---|---|---|---|---|---|
| UX-001 | Competitor UX benchmark | P0 | R0 | READY FOR QA | Implemented | Delivered 3 Nov: [benchmark](benchmark/UX-001-competitor-benchmark.md). |
| UX-002 | Create the visual design system | P0 | R0 | SPECIFIED | Partial | Colour/radius/shadow tokens in `src/app/globals.css`; no spacing or state tokens; undefined violet classes (DEF-009). |
| UX-003 | Define typography and mathematical readability | P0 | R0 | SPECIFIED | Partial | Nunito + size table in `docs/DESIGN.md`; sizes not tokenised; text below 15px (DEF-010). |
| UX-004 | Establish content differentiation rules | P0 | R0 | SPECIFIED | Partial | Prompt/teaching/feedback distinct; hint, tip and input problem share one treatment (audit §5). |
| UX-005 | Build responsive application shell and navigation | P1 | R1 | SPECIFIED | Partial | Shell and navigation work on phone/desktop; Lab tab is a placeholder on 18 islands (DEF-005). |
| UX-006 | Motion and interaction language | P1 | R1 | SPECIFIED | Partial | Reduced motion respected (`MotionConfig`, CSS); some decorative motion; no documented timing/easing. |
| UX-007 | Accessibility baseline | P1 | R1 | SPECIFIED | Partial | Skip link, focus ring, labels, read-aloud; number boxes lose focus ring (DEF-015); no audit. |
| UX-008 | Responsive visual QA | P1 | R1 | SPECIFIED | Partial | Ad hoc Playwright checks at 390/1280px (3 Nov); not tablet/small-mobile; not in repo. |

### ARCH — Learning architecture

| ID | Title | Pri | Rel | QA status | Implementation | Evidence and notes |
|---|---|---|---|---|---|---|
| ARCH-001 | Define modular learning architecture | P0 | R0 | SPECIFIED | Partial | Pure engine + maths; React types in content contract (`src/topics/types.ts`, `kit/define.ts`). |
| ARCH-002 | Define a typed question schema | P0 | R0 | SPECIFIED | Partial | Typed schemas exist; no runtime validation; no year/scoring/hint-ladder fields. |
| ARCH-003 | Build pure mathematical logic modules | P0 | R0 | SPECIFIED | Partial | `src/maths/fraction.ts` pure + tested; no fraction operations; inline maths in kit islands. |
| ARCH-004 | Implement prototype progress persistence | P1 | R1 | SPECIFIED | Implemented | localStorage `kite-maths:v2`, versioned, v1 migration, corrupt-data backup (`src/lib/store.ts`). Store itself untested. |
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
| FR-011 | Fractions learning journey screen | P1 | R1 | SPECIFIED | Partial | `SkyMapScreen`/`JourneyScreen` show status and next; no prerequisites; completion by traversal. |

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
| QA-001 | Build mathematical unit-test suite | P0 | R0/R1 | SPECIFIED | Partial | 9 fraction-maths tests (`src/topics/fractions/math.test.ts`); no operations, few invalid-input cases. |
| QA-002 | Build component and integration tests | P1 | R1 | SPECIFIED | Not implemented | No component or integration tests (`vitest` runs `.ts` only). |
| QA-003 | Build end-to-end learning journey tests | P1 | R1 | SPECIFIED | Not implemented | No end-to-end journey test in the repo. |
| QA-004 | Create defect register and triage rules | P0 | R0 | SPECIFIED | Partial | Provisional defect list DEF-001…017 in the GOV-001 audit §12. |
| QA-005 | Accessibility and responsive test pass | P1 | R1 | SPECIFIED | Partial | Ad hoc manual checks only. |
| QA-006 | Regression test suite | P1 | R1 | SPECIFIED | Partial | CI runs tests/lint/types/build; no flow regression suite. |
| QA-007 | Release acceptance report | P1 | R1 | SPECIFIED | Not implemented | No release acceptance report yet. |

## Open defects affecting status

The provisional defect list is in [GOV-001 audit §12](GOV-001-repository-audit.md#12-defects-found-provisional).

| Defect | Severity | Affects |
|---|---|---|
| DEF-001 to DEF-004, DEF-006, DEF-007 | Medium/Low | Home screen (UX-005, MAST-003) |
| DEF-005 | **High** | UX-005: placeholder destination |
| DEF-009 | Medium | UX-002, UX-004: unstyled status chip and badge |
| DEF-010 | Medium | UX-003: text below 15px |
| DEF-011, DEF-013 | Medium | FR-001, FR-011, CUR-002 |
| DEF-012 | Medium | MAST-003, PARENT-002 |
| DEF-015 | Medium | UX-007: focus visibility |
| DEF-008, DEF-014, DEF-016 | Low | Copy, redirects, public preview pages |
| DEF-017 | Low | README part fixed under GOV-002 (CH-005); site metadata in `src/app/layout.tsx` still open (code change, R1) |

These move into the formal register when QA-004 is authorised.
