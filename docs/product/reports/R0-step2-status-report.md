# R0 status report: sprint step 2 (CUR-002, CUR-003, UX-002, UX-003, UX-004, ARCH-001)

| | |
|---|---|
| **Date** | 4 November 2026 |
| **Branch** | `claude/pensive-pasteur-bs5979`, development only. Nothing merged to `main`; nothing deployed (D-002). |
| **Authorised by** | Product Owner, when accepting GOV-002, GOV-003 and UX-001 (D-011, D-012) |
| **Backlog goal and gate** | "Agree learning architecture, design system and lesson template". Gate: "PO / educational QA approves design and learning model". |
| **Requested decision** | <ul><li>Review the six items against their acceptance criteria. Accept them, or return them as QA FAILED with reasons.</li><li>Answer the educational QA questions (§5).</li><li>Authorise step 3, or not.</li></ul> |

## 1. Task status

| Item | Title | QA status now | What was delivered | Commit |
|---|---|---|---|---|
| ARCH-001 | Modular learning architecture | **READY FOR QA** | [Architecture definition](../architecture/ARCH-001-architecture.md); `src/architecture.test.ts` (6 layer-rule tests) | `a24f66b` |
| CUR-002 | Learning progression model | **READY FOR QA** | [Progression model](../curriculum/CUR-002-progression-model.md); prerequisite graph as data (`src/curriculum/prerequisites.ts`) with 6 tests | `ef7534c` |
| CUR-003 | Instructional lesson template | **READY FOR QA** | [Lesson template](../curriculum/CUR-003-lesson-template.md) with a conformance review of the 8 Fractions lessons | `c2c1252` |
| UX-002 | Visual design system | **READY FOR QA** | [Design tokens](../design/UX-002-design-tokens.md); new tokens in `globals.css`; `src/design-tokens.test.ts` (7 tests) | `4431ae0` |
| UX-003 | Typography and maths readability | **READY FOR QA** | [Typography](../design/UX-003-typography.md); text-scaling check; 4 new defects | `4431ae0` |
| UX-004 | Content differentiation | **READY FOR QA** | [Content types](../design/UX-004-content-differentiation.md); ten treatments on the specimen | `4431ae0` |

Also in this step:
- the record of your acceptance (`52b92a3`);
- the status, decisions and traceability updates (the final commit of this step).

Every other backlog item stays SPECIFIED. Nothing was moved to ACCEPTED by the delivery engineer.

**Implemented is not accepted.** These six items are specifications plus additive foundations (D-012).
- The tokens, the prerequisite graph and the lesson schema proposal are **not yet used by any child-facing screen**.
- Wiring them in is R1 work, listed at the end of each specification.

## 2. Evidence against each acceptance criterion

### ARCH-001: modular learning architecture

| Criterion | Evidence | Result |
|---|---|---|
| AC1. Presentation, lesson content, question definitions, maths logic, validation, progress, assessment and feedback are separated | <ul><li>[ARCH-001 §1–§2](../architecture/ARCH-001-architecture.md): each layer and where it lives, plus allowed import directions.</li><li>Tests A1–A5 (`src/architecture.test.ts`) enforce that the engine, maths, Fractions content, lesson schema and curriculum data contain no UI code. All pass.</li><li>A6 pins the four content-contract files that still import React types. They can't grow.</li></ul> | Met for the core layers. Known coupling K-1 to K-5 is listed with an R1 fix (`TC-ARCH-001.1.7` is `partial`). |
| AC2. Supports adding Times Tables and Mental Maths without rewriting the Fractions engine | <ul><li>ARCH-001 §3: the plug-in contract.</li><li>ARCH-001 §6: where Times Tables (facts, timed sessions, review) and Mental Maths (strategy-choice questions, strategy measures) plug in.</li><li>Registry tests show islands sharing the engine without changing it.</li></ul> | Met as a design. It is proved for real when R2 builds Times Tables. |

### CUR-002: learning progression model

| Criterion | Evidence | Result |
|---|---|---|
| AC1. Prerequisites form an explicit dependency graph | <ul><li>`src/curriculum/prerequisites.ts` holds two graphs: Fractions at skill level, and all 19 islands at island level.</li><li>It also has planned nodes for Times Tables fluency (R2) and Mental Maths (R3).</li><li>Tests check: no cycles; complete coverage; only real ids; Times Tables and Mental Maths present.</li></ul> | Met. 4 tests pass. |
| AC2. Lessons progress from concrete or visual to abstract where appropriate | <ul><li>CUR-002 §6 sets the rule within each lesson and explains how phases work across lessons.</li><li>A test checks that every Fractions lesson shows a picture or the lab before its first question, and that every prerequisite is taught earlier.</li></ul> | Met for Fractions. Four deviations are listed for educational QA (§5). |
| AC3. Students are not advanced solely because they have clicked through a lesson | <ul><li>CUR-002 §4–§5 separate a *visited* lesson from an *evidenced* one.</li><li>The rules say what "evidenced" needs and how recommendations use it.</li></ul> | **Specified, not yet true in the app.** The app still completes lessons on traversal (FR-011 AC3 is `failing`). Wiring it in is R1. |

### CUR-003: instructional lesson template

| Criterion | Evidence | Result |
|---|---|---|
| A reusable template supports objective, prerequisite check, explanation, representation, worked example, guided activity, independent practice, reflection, mastery check and next step | <ul><li>CUR-003 §1 covers all ten elements: purpose, whether required, the mapping to today's schema, and an additive schema for the four missing ones.</li><li>§2 gives authoring rules and profiles for concept, lab, fluency (Times Tables) and strategy (Mental Maths) lessons.</li><li>§3 reviews the 8 Fractions lessons against the template, plus a summary for the 85 preview lessons.</li></ul> | Met as a specification. The schema change itself is R1 (RC-005). Authoring gaps found in `wholes`, `naming`, `number-line`, `reasoning` and `lab`. |

### UX-002: visual design system

| Criterion | Evidence | Result |
|---|---|---|
| AC1. Tokens define colour, typography, spacing, layout widths, borders, elevation, radii, icon rules, focus, disabled and validation states, and interaction feedback | <ul><li>UX-002 §2 has a section for each of the twelve areas.</li><li>The new tokens are in `src/app/globals.css`.</li><li>A test checks that every token named in the three specifications exists.</li><li>State colours meet contrast rules (tested).</li></ul> | Met. |
| AC2. Styles are implemented as reusable tokens rather than isolated values | <ul><li>Every value is a token.</li><li>A ratchet test fails if one-off text sizes (224) or `.tsx` files with hex colours (15) grow. It was shown failing at 225.</li><li>UX-002 §5 has a migration map for every one-off value.</li></ul> | Met for the token system (RC-006). Existing screens move to tokens in R1. |

### UX-003: typography and mathematical readability

| Criterion | Evidence | Result |
|---|---|---|
| AC1. Font, scale, line length, line height, weights and hierarchy for headings, explanations, labels, question text, hints, results and maths | <ul><li>UX-003 §1–§5.</li><li>Ten type tokens, each with a line height.</li><li>A test enforces the 15px minimum.</li></ul> | Met. |
| AC2. Fractions, superscripts, symbols and long calculations stay legible at all supported sizes | <ul><li>UX-003 §6 gives the notation rules.</li><li>The specimen renders every fraction size, inline and compact fractions, operators, a superscript, column addition and a long calculation, at 390px and 1280px, and at 200% text.</li><li>A test checks that fraction digits keep at least 4:1 contrast on every content background.</li></ul> | Met as a specification, and on the specimen. |
| AC3. Text scaling does not break layouts | <ul><li>Checked on 8 pages under three conditions (UX-003 §7).</li><li>Browser zoom to 200% passes.</li><li>200% text-only and 320px reflow **fail on existing screens.**</li></ul> | **Not met by today's screens.** New defects DEF-018 to DEF-021 (`TC-UX-003.3.1` is `failing`). The specimen, which follows the new rules, passes. |

### UX-004: content differentiation

| Criterion | Evidence | Result |
|---|---|---|
| AC1. Teaching, examples, rules, prompts, hints, feedback, misconceptions, worked solutions and challenge content are clearly distinguishable | <ul><li>UX-004 §2 gives ten content types plus the prompt. Each has its own colour, icon, label and shape.</li><li>Ink is at least 7:1 on every background (tested).</li><li>On the specimen, the types stay distinct in greyscale.</li><li>§3 lists today's treatment of each type, with file references.</li></ul> | Met as a specification. Screens move to it in R1. Today hint, tip, notice and retry still share one look. |
| AC2. The child can identify the task and next action immediately | UX-004 §4 has five rules: one task, one primary action, a blocked action says why, feedback carries the next action, and panels never hide the task | Rules specified. Verification is planned for R1: a 5-second test with children, and a one-primary-button check. |

## 3. Checks actually run (4 Nov, on this branch)

| Check | Result |
|---|---|
| `npm test` | 13 files, **209 tests, all pass**. Includes the 19 new tests (architecture 6, prerequisites 6, design tokens 7) and the traceability checker (9). |
| `npm run lint` | Passes |
| `npx next typegen && npx tsc --noEmit -p .` | Passes |
| `npm run build` | Passes. `/design-specimen` is a static page. |
| **No visible change** (D-013) | <ul><li>Production builds of the step-1 commit and of this branch.</li><li>38 screenshots each: 15 screens plus lesson steps, a hint, wrong-answer feedback and grown-ups, at 390px and 1280px.</li><li>Pixel comparison: **0 differing pixels on all 38.**</li><li>The "before" set was captured twice to measure noise: 0 differences.</li><li>One "after" run showed a 24-pixel flicker in the header of one screen, in the same place as earlier timing noise. Repeat runs showed 0.</li><li>Report: [`pixdiff-before-after.txt`](../design/evidence/data/pixdiff-before-after.txt).</li></ul> |
| Specimen hidden in production | Built with `VERCEL_ENV=production`: `/design-specimen` returns **404** (home returns 200). The page also carries `noindex`. |
| Specimen health | Loads with no console errors; no sideways scroll at 390px or 1280px. At 200% text, its own content has no overflow at either width. |
| Ratchet works | A probe file with one extra one-off size made the test fail (225 > 224). The probe was then removed. |
| Text scaling | See UX-003 §7. Raw results: [`evidence/data/`](../design/evidence/data/). |
| `git diff 8f7408d -- src` | 6 files, **818 lines added, 0 removed**. No existing component, screen or lesson changed. `globals.css` has added lines only. |

## 4. Specimen screenshots

The full set is in [`design/evidence/screens/`](../design/evidence/screens/).

| What | Desktop (1280px) | Phone (390px) |
|---|---|---|
| Whole page | [specimen-desktop-full](../design/evidence/screens/specimen-desktop-full.jpg) | [specimen-phone-full](../design/evidence/screens/specimen-phone-full.jpg) |
| Type scale | [desktop](../design/evidence/screens/specimen-desktop-type.jpg) | [phone](../design/evidence/screens/specimen-phone-type.jpg) |
| Content types | [desktop](../design/evidence/screens/specimen-desktop-content.jpg) · [greyscale](../design/evidence/screens/specimen-desktop-content-greyscale.jpg) | [phone](../design/evidence/screens/specimen-phone-content.jpg) |
| States | [desktop](../design/evidence/screens/specimen-desktop-states.jpg) | [phone](../design/evidence/screens/specimen-phone-states.jpg) |
| Maths notation | [desktop](../design/evidence/screens/specimen-desktop-maths.jpg) · [200% text](../design/evidence/screens/specimen-desktop-maths-text200.jpg) | [phone](../design/evidence/screens/specimen-phone-maths.jpg) · [200% text](../design/evidence/screens/specimen-phone-maths-text200.jpg) |
| Scaling defects on today's screens | [island at 200%](../design/evidence/screens/text200-desktop-island.jpg) | [home at 200%](../design/evidence/screens/text200-phone-home.jpg) · [grown-ups at 200%](../design/evidence/screens/text200-phone-grown-ups.jpg) · [home at 320px](../design/evidence/screens/reflow320-home.jpg) |

To see the specimen live, run the branch (preview or locally) and open `/design-specimen`. It isn't linked from the app.

## 5. Questions for you and educational QA

| ID | Question | Recommendation | From |
|---|---|---|---|
| Q-1 | Lesson mastery: a separate `mastery-check` step, or count the lesson's last independent checks? | Count the last checks for short lessons; use a step when a lesson covers more than one skill | CUR-003 §4 |
| Q-2 | `naming` asks a question before its worked examples. Keep it or move it? | Move it after | CUR-003, CUR-002 §6 |
| Q-3 | Reflection in every lesson, or only at the end of a group of lessons? | Every lesson, one sentence frame | CUR-003 §4 |
| Q-4 | Confirm the phase order: `number-line` (Visualise) after three Explore lessons, and `reasoning` (Explain) after `amounts` (Apply) | Keep both | CUR-002 §6 |
| Q-5 | `fractions` needs Times Tables division facts only for fractions of amounts. Is "best after", without a lock, the right behaviour? | Yes (CUR-002 principle 2) | CUR-002 §2 |
| Q-6 | Content-type colours, icons and labels, as shown on the specimen. In particular: "Not yet" in calm blue (never red), and challenge in gold. | Accept as shown | UX-004 §2 |
| Q-7 | UX-003 AC3 isn't met by today's screens (DEF-018 to DEF-021). Accept the specification and track AC3 through the defects, or keep UX-003 open? | Accept the specification; fix the defects first in R1 | UX-003 §7 |

## 6. Compliance with your constraints

| Constraint | How it was kept |
|---|---|
| Preserve the architecture; no rewrites | No existing module changed. All `src/` changes are new files, or lines added to `globals.css`. |
| No new product features | The only new route is the internal specimen: unlinked, `noindex`, and a 404 in production builds. No child-facing behaviour changed (0-pixel comparison). |
| No production deploy; development branch only | Pushed to `claude/pensive-pasteur-bs5979` only. No pull request, no merge. |
| Document decisions and requirement changes | D-013, RC-005, RC-006, and CH-010 to CH-014 in [`DECISIONS.md`](../DECISIONS.md) |
| Keep implemented separate from accepted | All six items are READY FOR QA, with implementation evidence recorded separately in [`STATUS.md`](../STATUS.md). Each specification marks what is R1. |
| Include Times Tables and Mental Maths | <ul><li>Planned graph nodes for Times Tables (R2) and Mental Maths (R3), with a test.</li><li>ARCH-001 §6 plug-in points.</li><li>CUR-003 fluency and strategy lesson profiles.</li></ul> |

## 7. Open items

- **New defects:** DEF-018 (header overflow), DEF-019 (clamped lesson descriptions), DEF-020 (grown-ups cards at 200%),
  DEF-021 (truncated lesson title). Recorded in [`STATUS.md`](../STATUS.md#open-defects-affecting-status).
- **Still open from earlier:** DEF-009 (violet classes) and DEF-010 (text below 15px). Both are fixed by the R1 token
  migration (UX-002 §5).
- **R1 work defined in this step:**
  - connect the prerequisite graph and evidence rules (FR-011, MAST-001);
  - the lesson schema additions;
  - move screens to the tokens and content types;
  - fix architecture coupling K-1 to K-5.

## 8. Proposed next group: step 3 (needs your authorisation)

As the backlog orders it:

| Item | What it would deliver |
|---|---|
| **ARCH-002** Typed question schema | Year, scoring and hint-ladder fields; runtime validation of question data (a gap noted in ARCH-001) |
| **ARCH-003** Pure maths modules | Fraction operations as pure, tested functions; the inline maths in kit islands (K-4) moved into `src/maths` |
| **QA-001** Maths unit-test suite | Broad tests of the maths modules, including invalid inputs |

Like step 2, these would be additive and would not change screens, unless you decide otherwise.
