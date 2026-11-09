<!--
  DOCUMENT CONTROL — added when the backlog was imported. Everything below the line is the
  Product Owner's backlog text, version 1.0, unchanged.
-->

> **Product backlog, version 1.0 (source of truth for scope and acceptance criteria).**
> Supplied by the Product Owner on 3 November 2026 as `11-plus-maths-platform-product-backlog_1.md`
> (SHA-256 starts `ff61d8d0266f0a7c`). Stored here unchanged.
>
> - **Item status** (QA status and implementation evidence) is kept in [`STATUS.md`](STATUS.md), not in this text.
> - **Decisions, clarifications and changes** to this text are recorded in [`DECISIONS.md`](DECISIONS.md). Any edit to
>   this file needs a matching entry in its change history.
> - **Traceability** from each item to its tests is in [`traceability/`](traceability/).

---

# 11+ Maths Learning Platform — Product Backlog

**Document owner:** Product Owner / Business Analyst / Educational QA  
**Delivery engineer:** Claude Code  
**Product:** UK 11+ Maths Learning Platform  
**Initial release:** Interactive Fractions Prototype  
**Curriculum context:** England, Years 3–6, with configurable 11+ exam preparation  
**Status:** Proposed backlog — ready for repository discovery and technical refinement  
**Deployment constraint:** Local development / preview only. Do not deploy to production.

---

## 1. Product vision

Build a premium, interactive Maths learning platform that helps children move from foundational understanding to confident, accurate and efficient mathematical problem-solving for Key Stage 2 and 11+ entrance examinations.

The product should bring together five connected capabilities:

1. **Concept mastery:** Children understand why mathematics works, using appropriate visual models and guided explanations.
2. **Times-table fluency:** Children build secure multiplication and related division facts up to 12 × 12, with automatic recall and connected understanding.
3. **Mental Maths and strategy fluency:** Children learn to recognise number structure, choose efficient methods, calculate mentally and explain why a shortcut works.
4. **11+ application:** Children apply skills to unfamiliar, multi-step and time-constrained questions, with exam formats configured to the relevant school or consortium.
5. **World-class learning experience:** A distinctive, polished, highly readable and accessible interface with purposeful animation and exceptionally clear content hierarchy.

The product is not a question bank with a decorative dashboard. It is a teaching and learning system.

### Product learning cycle

**DIAGNOSE → EXPLAIN → VISUALISE → EXPLORE → GUIDED PRACTICE → INDEPENDENT PRACTICE → APPLY → REVIEW → MASTER**

For speed-oriented skills, use a separate progression:

**UNDERSTAND → BUILD ACCURACY → DEVELOP RECALL → RECOGNISE PATTERNS → SELECT AN EFFICIENT METHOD → IMPROVE SPEED**

Speed must never be rewarded at the expense of accuracy, understanding or confidence.

---

## 2. Product principles and non-negotiable decisions

### 2.1 Educational principles

- Teach before testing.
- Progression is based on secure understanding, not the number of completed screens.
- A correct answer does not automatically prove understanding.
- Use concrete and visual representations where they clarify a concept; gradually reduce scaffolding when the learner is ready.
- Teach connections between facts, procedures and concepts.
- Teach children to choose between methods, not merely memorise one procedure.
- Misconception feedback must be based on observable response patterns. Do not claim to know a child's thinking from one wrong answer.
- Vedic Maths and other shortcut systems are candidate strategy sources, not automatically endorsed curriculum. Each technique must be mathematically proved, age-appropriate, bounded by its prerequisites and tested for accuracy and practical usefulness.
- Avoid unsupported promises such as “solve every question instantly” or “always faster than other students”. The measurable goal is improved accuracy, fluency, flexibility and appropriate speed.

### 2.2 Product and UX principles

- Aim for a best-in-market experience, not a clone of an existing learning platform.
- Benchmark leading competitors, but do not confuse feature quantity with learning quality.
- Typography, readability, mathematical notation, content differentiation and visual hierarchy are core product requirements.
- Every animation must explain, guide, confirm or give meaningful feedback. No animation for decoration alone.
- Design intentionally for desktop, tablet and mobile.
- Make touch targets generous and keyboard use complete.
- Support reduced motion, clear focus states, suitable contrast and scalable text.
- Avoid generic AI dashboards, excessive gradients, visual clutter, giant empty cards and childish decoration.

### 2.3 Scope decisions

**First build:** A complete, working Fractions learning prototype. It validates the reusable lesson, visualisation, practice, feedback, progress and assessment architecture.

**Included in the platform roadmap:** Times Tables and Mental Maths as first-class learning areas. They must be considered in the shared architecture from the beginning, but should not be bolted into the first Fractions release in a way that delays or weakens the prototype.

**Later expansion:** Full Year 3–6 Maths curriculum, exam-specific 11+ practice, parent reporting and personalised study plans.

**Not in the first release:** Production accounts, payments, subscriptions, AI tutor API calls, social features, public leaderboards, production deployment or a complete 11+ exam platform.

---

## 3. Curriculum and product research baseline

The curriculum map must follow the England national curriculum as the baseline, then add clearly labelled 11+ extension content. Do not describe all 11+ exams as having one uniform syllabus or format.

### 3.1 Year 3–6 maths progression to map

The detailed curriculum map is a product task, but the initial coverage should include:

| Area | Year 3–4 foundations | Year 5–6 progression |
|---|---|---|
| Number and place value | Place value, ordering, rounding, negative numbers through zero, Roman numerals | Larger numbers, negative numbers, powers of 10 and decimal place value |
| Addition and subtraction | Mental and written methods, inverse operations, problem solving | Larger and multi-step calculations, estimation and checking |
| Multiplication and division | Tables facts, arrays, partitioning, written methods, factors and multiples | Larger-number methods, factors, multiples, primes, square/cube numbers and problems |
| Times tables | Recall and relationships across tables; secure 12 × 12 by end of Year 4 | Maintain automatic recall and use facts in fractions, ratio, area and multi-step problems |
| Fractions | Unit/non-unit fractions, equal parts, fractions of sets, equivalence, same-denominator operations | Compare, simplify, mixed/improper fractions, unlike denominators, multiply/divide fractions and fractions of quantities |
| Decimals and percentages | Tenths, hundredths, decimal equivalents and place value | Compare/order decimals, decimal operations, percentages and fraction-decimal-percentage links |
| Ratio and proportion | Informal multiplicative reasoning and scaling | Ratio notation, scaling, proportion and multi-step applications appropriate to age and exam level |
| Measurement | Length, mass, capacity, time, money, perimeter and area foundations | Conversions, area, perimeter, volume and compound problems |
| Geometry | Shapes, angles, symmetry, position and direction | Properties, angles, coordinates, translation/reflection and volume/shape reasoning |
| Statistics | Tables, charts, pictograms and interpretation | Line graphs, timetables, averages and interpreting data |
| Reasoning | Explain, represent, identify patterns and solve contextual problems | Multi-step, non-routine and unfamiliar problems with method selection |

The curriculum content and year allocation must be checked against the current official programme of study before lesson authoring.

### 3.2 Times-table baseline

- England's national curriculum expects pupils to have memorised multiplication tables up to and including 12 × 12 by the end of Year 4.
- The Year 4 Multiplication Tables Check (MTC) is an on-screen check of 25 questions. The standard check allows six seconds per question, with a three-second pause between questions.
- The MTC measures fluent recall of multiplication facts; it is not a test of broad mathematical problem-solving. The product must therefore have both a recall-practice mode and a separate conceptual / application mode.
- Teach multiplication and division as connected facts, not isolated times-table chants.

### 3.3 Mathematical fluency baseline

Fluency is broader than raw speed. The platform should measure and teach:

1. Recall and automaticity.
2. Procedural accuracy and confidence.
3. Flexibility and adaptability — choosing an appropriate method and connecting facts across contexts.

### 3.4 Competitor benchmark baseline

Atom Learning currently promotes personalised revision plans, curriculum coverage, progress tracking, printable papers, mock tests, instant marking and large learning-resource libraries. These are market expectations to understand, not sufficient differentiation by themselves.

Our intended differentiation is the depth and quality of interactive concept teaching, accurate visual mathematical models, explicit strategy-selection coaching, useful misconception recovery, connected times-table and mental-maths learning, and a superior interface craft standard.

Benchmark at least Atom Learning and relevant times-table / maths practice products before finalising the design direction. Record observed strengths and weaknesses with evidence; do not make unsupported claims that the product is already better.

---

## 4. Prioritisation and release roadmap

Priority meanings:

- **P0 — Critical foundation:** Required to begin safely or unblock the first release.
- **P1 — First Fractions prototype:** Required for the first complete demonstrable product.
- **P2 — Next learning release:** Times Tables and Mental Maths foundations.
- **P3 — Platform expansion:** Full curriculum, exam readiness and family features.
- **P4 — Later / optional:** Enhancements that should not delay core learning quality.

| Release | Focus | Exit outcome |
|---|---|---|
| R0 | Repository discovery, product specification, design system, architecture and curriculum validation | Agreed build plan and quality gates |
| R1 | Fractions prototype | Child can learn, explore, practise, recover from common errors and complete a meaningful mastery check |
| R2 | Times Tables and multiplication/division fluency | Child can build understanding and recall across facts up to 12 × 12, with targeted practice and MTC-style simulation |
| R3 | Mental Maths and strategy intelligence | Child can learn, compare and select efficient calculation strategies, with accuracy-first speed progression |
| R4 | Year 3–6 curriculum expansion | Reusable learning engine supports more maths strands and year-level progressions |
| R5 | 11+ preparation and personalisation | Exam-profile-aware practice, mock assessments and parent-facing progress insights |

**Important sequencing:** Build reusable foundations in R0/R1 that support R2 and R3. Do not build every R2/R3 feature into the first Fractions release.

---

# 5. Product backlog

## EPIC GOV — Product governance and repository discovery

### GOV-001 — Inspect the existing repository
- **Priority:** P0 | **Release:** R0 | **Size:** S
- **User story:** As the product owner, I need the existing application and tooling understood before implementation so that work fits the current project rather than damaging it.
- **Work:** Inspect package scripts, framework, routes, current components, styling, tests, persistence, build workflow and repository conventions. Identify what already works and what must be preserved.
- **Acceptance criteria:** A concise repository audit exists; existing framework is reused unless a documented technical reason justifies a change; no unrelated project files are modified; no production deployment occurs.

### GOV-002 — Establish the product source of truth
- **Priority:** P0 | **Release:** R0 | **Size:** S
- **User story:** As the team, we need one version-controlled source of product scope, acceptance criteria and decisions.
- **Acceptance criteria:** Product vision, scope, backlog IDs, definitions of status and priority, key decisions and change history are recorded in the repository; later changes are reflected consistently.

### GOV-003 — Create requirements traceability
- **Priority:** P0 | **Release:** R0 | **Size:** M
- **User story:** As QA, I need every implemented feature linked to a requirement and a test.
- **Acceptance criteria:** Each P0/P1 backlog item maps to acceptance criteria and one or more test cases; every delivered feature can be traced from requirement to implementation and test evidence.

### GOV-004 — Define change-control rules
- **Priority:** P0 | **Release:** R0 | **Size:** S
- **Acceptance criteria:** Any material scope, curriculum, UX or architecture change has a reason, impact, owner and decision; Claude Code does not silently reinterpret a requirement.

## EPIC CUR — Curriculum and instructional design

### CUR-001 — Build the Year 3–6 curriculum map
- **Priority:** P0 | **Release:** R0 | **Size:** M
- **User story:** As a parent and learner, I need learning content aligned with England's curriculum and suitable 11+ extension clearly distinguished.
- **Acceptance criteria:** Each objective has year group, strand, prerequisite, expected knowledge, key vocabulary, examples, mastery evidence and source; statutory curriculum and optional 11+ extension are labelled separately; year allocation is verified against official sources.

### CUR-002 — Define the learning progression model
- **Priority:** P0 | **Release:** R0 | **Size:** M
- **Acceptance criteria:** Prerequisites form an explicit dependency graph; lessons progress from concrete / visual to abstract where appropriate; students are not advanced solely because they have clicked through a lesson.

### CUR-003 — Create the instructional lesson template
- **Priority:** P0 | **Release:** R0 | **Size:** S
- **Acceptance criteria:** Reusable template supports objective, prerequisite check, explanation, representation, worked example, guided activity, independent practice, reflection, mastery check and next step.

### CUR-004 — Review all Fractions content for mathematical validity
- **Priority:** P1 | **Release:** R1 | **Size:** M
- **Acceptance criteria:** Every authored fraction example, visual, question, distractor and explanation is independently checked; no ambiguous question or incorrect representation is accepted.

## EPIC UX — World-class design system and experience

### UX-001 — Competitor UX benchmark
- **Priority:** P0 | **Release:** R0 | **Size:** M
- **User story:** As product owner, I need a grounded view of the current market before approving the design direction.
- **Work:** Review Atom Learning and relevant maths / times-table products. Examine lesson screens, question interactions, typography, feedback, navigation, accessibility, mobile behaviour, progress and parent experience.
- **Acceptance criteria:** Evidence-based benchmark lists strengths, weaknesses, expected baseline features and specific opportunities for differentiation; no unsupported “best in market” claim is used.

### UX-002 — Create the visual design system
- **Priority:** P0 | **Release:** R0 | **Size:** M
- **Acceptance criteria:** Design tokens define colour, typography, spacing, layout widths, borders, elevation, radii, icon rules, focus states, disabled states, validation states and interaction feedback; styles are implemented as reusable tokens rather than isolated values.

### UX-003 — Define typography and mathematical readability
- **Priority:** P0 | **Release:** R0 | **Size:** M
- **Acceptance criteria:** Font family, type scale, line length, line height, weights and hierarchy are specified for headings, explanations, labels, question text, hints, results and maths notation; fractions, superscripts, symbols and long calculations remain legible at all supported sizes; text scaling does not break layouts.

### UX-004 — Establish content differentiation rules
- **Priority:** P0 | **Release:** R0 | **Size:** S
- **Acceptance criteria:** Teaching, examples, rules, question prompts, hints, feedback, misconceptions, worked solutions and challenge content have clearly distinguishable visual treatments; the child can identify the task and next action immediately.

### UX-005 — Build responsive application shell and navigation
- **Priority:** P1 | **Release:** R1 | **Size:** M
- **Acceptance criteria:** Dashboard, learning journey, lesson, practice and results are reachable through working navigation; desktop, tablet and mobile layouts are intentionally designed; no dead links or placeholder destinations.

### UX-006 — Motion and interaction language
- **Priority:** P1 | **Release:** R1 | **Size:** M
- **Acceptance criteria:** Animation timing and easing are consistent; animation communicates a mathematical change or interaction state; users can complete all tasks without relying on animation; reduced-motion preference is respected.

### UX-007 — Accessibility baseline
- **Priority:** P1 | **Release:** R1 | **Size:** M
- **Acceptance criteria:** Keyboard navigation, visible focus, semantic controls, labels, sufficient contrast, non-colour-only feedback, accessible names and reduced-motion behaviour are checked; touch targets are appropriate for children; known limitations are documented.

### UX-008 — Responsive visual QA
- **Priority:** P1 | **Release:** R1 | **Size:** M
- **Acceptance criteria:** Main flows are checked at representative small-mobile, large-mobile, tablet and desktop widths; no clipped equations, overlapping controls, horizontal overflow or unreadable text; screenshots are retained as evidence.

## EPIC ARCH — Reusable learning architecture

### ARCH-001 — Define modular learning architecture
- **Priority:** P0 | **Release:** R0 | **Size:** M
- **Acceptance criteria:** Presentation, lesson content, question definitions, mathematical logic, validation, progress, assessment and feedback are separated; the architecture supports adding Tables and Mental Maths without rewriting the Fractions engine.

### ARCH-002 — Define a typed question schema
- **Priority:** P0 | **Release:** R0 | **Size:** M
- **Acceptance criteria:** Questions can declare skill, year/level, difficulty, prompt, interaction type, correct answer, distractors, validation, explanation, hints, misconception tags and scoring metadata; invalid definitions fail validation.

### ARCH-003 — Build pure mathematical logic modules
- **Priority:** P0 | **Release:** R0 | **Size:** M
- **Acceptance criteria:** Core calculations and validators are pure functions independent of UI; edge cases are covered by unit tests; UI never becomes the source of mathematical truth.

### ARCH-004 — Implement prototype progress persistence
- **Priority:** P1 | **Release:** R1 | **Size:** S
- **Acceptance criteria:** Learner progress survives refresh and normal browser restart; data schema is versioned or safely resettable; corrupted or missing data fails gracefully; no personal data is unnecessarily collected.

### ARCH-005 — Build a reusable event and attempt model
- **Priority:** P1 | **Release:** R1 | **Size:** M
- **Acceptance criteria:** Records question ID, skill, response, correctness, attempt count, hints, timestamp and optional duration; events distinguish first attempt from retries; data supports progress and misconception analysis without assuming a diagnosis.

## EPIC FR — Fractions learning journey (first complete product release)

### FR-001 — Fractions diagnostic and entry path
- **Priority:** P1 | **Release:** R1 | **Size:** M
- **User story:** As a learner, I need the platform to establish what I already understand before it chooses where I should begin.
- **Acceptance criteria:** Short, low-pressure prerequisite check covers whole, equal parts and simple fraction recognition; learner can choose a supported starting point; one wrong answer does not permanently label the learner.

### FR-002 — Teach whole and equal parts
- **Priority:** P1 | **Release:** R1 | **Size:** M
- **Acceptance criteria:** Child can distinguish a whole, a part, equal partition and unequal partition; visual examples include valid and invalid divisions; explanation explicitly states why unequal pieces cannot be counted as equal fractional parts of that whole.

### FR-003 — Teach numerator and denominator
- **Priority:** P1 | **Release:** R1 | **Size:** M
- **Acceptance criteria:** Numerator and denominator are introduced with accurate language and synchronised diagrams; learner can identify each part in symbolic and visual form; feedback does not reverse the terms.

### FR-004 — Fractions of shapes and sets
- **Priority:** P1 | **Release:** R1 | **Size:** M
- **Acceptance criteria:** Activities cover continuous models (shapes / bars) and discrete sets (objects); selected numerator counts selected parts and denominator counts total equal parts or total objects as appropriate; all generated examples have valid answers.

### FR-005 — Compare simple fractions visually
- **Priority:** P1 | **Release:** R1 | **Size:** M
- **Acceptance criteria:** Child compares unit fractions and fractions with the same denominator using accurate models; explanations address why a larger denominator can mean smaller equal parts; answer validation covers equivalent and non-equivalent examples.

### FR-006 — Explore equivalent fractions
- **Priority:** P1 | **Release:** R1 | **Size:** M
- **Acceptance criteria:** Child can see equivalent amounts represented with different partitions; multiplication of numerator and denominator by the same non-zero whole number is explained with a visual connection; examples are checked by simplification or cross-multiplication logic as appropriate.

### FR-007 — Fractions on a number line
- **Priority:** P1 | **Release:** R1 | **Size:** M
- **Acceptance criteria:** Number line is split into equal intervals; endpoints and interval counts are correct; learner can place and identify simple fractions; zero, one and fractions between them are unambiguous.

### FR-008 — Find simple fractions of quantities
- **Priority:** P1 | **Release:** R1 | **Size:** M
- **Acceptance criteria:** Activities teach sharing into denominator equal groups then selecting numerator groups; examples include whole-number results first; the method and visual grouping agree with the numerical answer.

### FR-009 — Add and subtract fractions with same denominator
- **Priority:** P1 | **Release:** R1 | **Size:** M
- **Acceptance criteria:** Lesson explains why denominators remain the same when adding/subtracting like parts; questions include valid results within one whole at introductory level; representations match the symbolic operation.

### FR-010 — Fractions guided examples and fading support
- **Priority:** P1 | **Release:** R1 | **Size:** M
- **Acceptance criteria:** Each selected core skill has worked example, guided attempt, scaffolded hint and independent question; hints reduce gradually and can be requested; a student is not forced to use a hint after demonstrating understanding.

### FR-011 — Fractions learning journey screen
- **Priority:** P1 | **Release:** R1 | **Size:** S
- **Acceptance criteria:** Lessons display prerequisites, current status, skill outcomes and next recommended lesson; locked states explain why a prerequisite is needed; completed status is based on mastery evidence, not page visits.

## EPIC LAB — Interactive mathematical laboratory

### LAB-001 — Build fraction model data engine
- **Priority:** P1 | **Release:** R1 | **Size:** M
- **Acceptance criteria:** A single mathematical state drives fraction notation, selected parts, total parts and visual representation; no independently editable UI state can cause the model and displayed answer to disagree.

### LAB-002 — Equal partition controls
- **Priority:** P1 | **Release:** R1 | **Size:** M
- **Acceptance criteria:** Child can change supported denominator values; generated partitions are geometrically equal; unsupported values are unavailable rather than approximated incorrectly; partition labels update correctly.

### LAB-003 — Select and shade parts
- **Priority:** P1 | **Release:** R1 | **Size:** M
- **Acceptance criteria:** Child can shade/unshade individual sections using mouse, touch and keyboard; numerator updates immediately; selected state has accessible feedback; repeated taps behave predictably.

### LAB-004 — Multiple visual models
- **Priority:** P1 | **Release:** R1 | **Size:** L
- **Acceptance criteria:** At least fraction bars and a second shape representation are implemented; each uses mathematically correct equal partitions; changing one model updates the common fraction state where appropriate.

### LAB-005 — Compare two fractions
- **Priority:** P1 | **Release:** R1 | **Size:** M
- **Acceptance criteria:** Two synchronised models can be displayed; comparison result is computed by the maths engine; equivalent fractions are recognised as equal; visual and symbolic outputs agree.

### LAB-006 — Number-line interaction
- **Priority:** P1 | **Release:** R1 | **Size:** M
- **Acceptance criteria:** Learner can drag or keyboard-position a marker; snapping uses valid interval locations; touch interaction is reliable; keyboard alternative is available.

### LAB-007 — Laboratory accessibility and input QA
- **Priority:** P1 | **Release:** R1 | **Size:** M
- **Acceptance criteria:** Every laboratory action has a keyboard alternative and accessible name; selection is not communicated by colour alone; touch and pointer behaviour are tested; reduced motion is respected.

## EPIC PRACT — Practice and question engine

### PRACT-001 — Build deterministic question renderer and validator
- **Priority:** P1 | **Release:** R1 | **Size:** M
- **Acceptance criteria:** Same question definition produces consistent prompt, interaction and validation; correct answers are evaluated by pure maths logic; malformed questions are rejected; test fixtures cover boundary cases.

### PRACT-002 — Multiple-choice and selection questions
- **Priority:** P1 | **Release:** R1 | **Size:** S
- **Acceptance criteria:** Supports single-answer selection, clear selected state, submit and feedback; distractors correspond to plausible errors and are themselves verified as incorrect.

### PRACT-003 — Shade-the-fraction questions
- **Priority:** P1 | **Release:** R1 | **Size:** M
- **Acceptance criteria:** Question asks for a fraction to shade; visual partitions are valid; child can select sections; validation checks selected count and the intended model.

### PRACT-004 — Diagram-to-fraction matching
- **Priority:** P1 | **Release:** R1 | **Size:** M
- **Acceptance criteria:** Supports matching diagrams to notation; diagram labels are not ambiguous; matching can be completed with touch, pointer and keyboard.

### PRACT-005 — Equal / unequal partition identification
- **Priority:** P1 | **Release:** R1 | **Size:** S
- **Acceptance criteria:** Includes balanced examples with equal and unequal partitions; explanations make the mathematical reason explicit; the system does not mark arbitrary unequal sectors as valid equal parts.

### PRACT-006 — Number-line and quantity questions
- **Priority:** P1 | **Release:** R1 | **Size:** M
- **Acceptance criteria:** Number-line placement and fraction-of-quantity activities use the same validated mathematics as the lesson laboratory; generated values always have well-defined answers.

### PRACT-007 — Question difficulty and variation rules
- **Priority:** P1 | **Release:** R1 | **Size:** M
- **Acceptance criteria:** Variation changes mathematical structure, representation and context rather than only changing numerals; difficulty dimensions are documented; duplicate questions are limited within a practice session.

### PRACT-008 — Feedback and retry behaviour
- **Priority:** P1 | **Release:** R1 | **Size:** M
- **Acceptance criteria:** Correct responses receive informative confirmation; incorrect responses receive a useful prompt or hint before full solution reveal; retries are recorded; feedback is respectful and age-appropriate.

## EPIC MIS — Misconception detection and recovery

### MIS-001 — Define misconception catalogue
- **Priority:** P1 | **Release:** R1 | **Size:** M
- **Acceptance criteria:** Catalogue includes numerator/denominator reversal, denominator-size misconception, unequal-partition error, part-to-part vs part-to-whole confusion and incorrect total-part counting; each entry has example evidence, alternative explanations and recovery activity.

### MIS-002 — Tag questions and distractors
- **Priority:** P1 | **Release:** R1 | **Size:** M
- **Acceptance criteria:** Misconception tags are attached only where an answer genuinely provides evidence; distractor-to-misconception mapping is documented and tested.

### MIS-003 — Pattern-based misconception signals
- **Priority:** P1 | **Release:** R1 | **Size:** M
- **Acceptance criteria:** Signal is raised from a repeated or sufficiently specific response pattern, not a single generic mistake; system labels it as a possible misconception; confidence and evidence are retained internally.

### MIS-004 — Targeted recovery sequence
- **Priority:** P1 | **Release:** R1 | **Size:** M
- **Acceptance criteria:** Recovery contains a different representation or explanation, a guided follow-up and a transfer question; solution is not revealed immediately unless the learner requests it or the designed support sequence requires it.

### MIS-005 — Verify understanding after recovery
- **Priority:** P1 | **Release:** R1 | **Size:** S
- **Acceptance criteria:** Learner answers new questions without the same scaffolding; recovery success is not inferred from repeating the original question; unresolved uncertainty remains visible in progress state.

## EPIC MAST — Assessment, mastery and progress

### MAST-001 — Define skill mastery model
- **Priority:** P1 | **Release:** R1 | **Size:** M
- **Acceptance criteria:** Each skill has explicit criteria covering accuracy, varied examples and independent application; mastery is not awarded by one correct answer or one completed quiz; thresholds are documented and adjustable.

### MAST-002 — Build independent Fractions assessment
- **Priority:** P1 | **Release:** R1 | **Size:** M
- **Acceptance criteria:** Assessment samples conceptual, representational, comparison, equivalence, quantity and reasoning skills; includes unfamiliar examples; hints are disabled or clearly recorded; scoring explains skill-level evidence.

### MAST-003 — Build progress dashboard
- **Priority:** P1 | **Release:** R1 | **Size:** M
- **Acceptance criteria:** Shows completed lessons, developing skills, mastered skills and next recommended activity; progress is derived from recorded attempts; no fake or decorative progress values.

### MAST-004 — Build mastery results screen
- **Priority:** P1 | **Release:** R1 | **Size:** M
- **Acceptance criteria:** Reports strengths, skills still developing, patterns of difficulty and recommended next steps; avoids unsupported labels or claims about ability; explanations are understandable to a child and useful to a parent.

### MAST-005 — Persistence and recovery testing
- **Priority:** P1 | **Release:** R1 | **Size:** S
- **Acceptance criteria:** Refreshing and returning to the app restores correct progress; duplicate or interrupted attempts do not corrupt mastery; reset behaviour is clear and testable.

## EPIC TT — Times Tables and multiplication/division fluency

**Release intent:** R2. The architecture and skill model must be designed in R0/R1 so this epic can be added without restructuring the application.

### TT-001 — Create the Times Tables curriculum and progression
- **Priority:** P2 | **Release:** R2 | **Size:** M
- **User story:** As a learner, I need a structured path to understand and recall multiplication and division facts up to 12 × 12.
- **Acceptance criteria:** Progression covers 2–12 tables, relevant prior number facts, multiplication/division fact families and year-appropriate sequence; curriculum expectations and the England Year 4 MTC are clearly distinguished from optional extension.

### TT-002 — Build conceptual multiplication lessons
- **Priority:** P2 | **Release:** R2 | **Size:** L
- **Acceptance criteria:** Teach multiplication through equal groups, arrays, repeated addition, number lines and scaling; show commutativity and distributive relationships; representations connect to symbolic facts.

### TT-003 — Build division and inverse-fact lessons
- **Priority:** P2 | **Release:** R2 | **Size:** M
- **Acceptance criteria:** Every relevant multiplication fact is connected to division facts; examples cover grouping and sharing; learner can identify a fact family and explain the relationship.

### TT-004 — Build table-by-table learning paths
- **Priority:** P2 | **Release:** R2 | **Size:** M
- **Acceptance criteria:** Tables can be learned and reviewed in a recommended progression; child can see known, developing and not-yet-secure facts; progression can be personalised based on diagnostic evidence.

### TT-005 — Build an all-facts diagnostic
- **Priority:** P2 | **Release:** R2 | **Size:** M
- **Acceptance criteria:** Diagnostic covers multiplication facts from 2×2 through 12×12 with suitable sampling; it distinguishes lack of recall from input mistakes where possible; it does not use one result as a permanent ability label.

### TT-006 — Build targeted fact practice
- **Priority:** P2 | **Release:** R2 | **Size:** M
- **Acceptance criteria:** Practice focuses on weak facts while continuing retrieval of secure facts; includes mixed and interleaved practice; repeated correct recall is required before a fact is marked secure.

### TT-007 — Build times-table visual explorer
- **Priority:** P2 | **Release:** R2 | **Size:** M
- **Acceptance criteria:** Interactive grid / array / number-line views reveal patterns and relationships; child can explore multiples and inverse facts; visuals remain correct for all supported values.

### TT-008 — Build division fact recall practice
- **Priority:** P2 | **Release:** R2 | **Size:** M
- **Acceptance criteria:** Questions include missing dividend, divisor or quotient forms; division facts are linked to related multiplication facts; validation checks exact arithmetic.

### TT-009 — Build MTC-style timed simulator
- **Priority:** P2 | **Release:** R2 | **Size:** M
- **Acceptance criteria:** Practice mode offers a 25-question format, six-second response window and three-second between-question interval to reflect the published standard format; includes familiarisation questions; results identify facts to revisit; clearly labels itself as a practice simulation, not the official DfE check.

### TT-010 — Build untimed confidence mode
- **Priority:** P2 | **Release:** R2 | **Size:** S
- **Acceptance criteria:** Children can practise without a countdown; explanations and retry support remain available; speed scores are not shown as the only measure of success.

### TT-011 — Build times-table mastery reporting
- **Priority:** P2 | **Release:** R2 | **Size:** M
- **Acceptance criteria:** Report includes per-fact accuracy, recall consistency, inverse-fact understanding and recommended practice; timed performance is separated from conceptual understanding; no unsupported comparison with other pupils.

### TT-012 — Build spaced review and practice scheduling
- **Priority:** P2 | **Release:** R2 | **Size:** M
- **Acceptance criteria:** Review interval responds to demonstrated recall and errors; previously secure facts reappear periodically; practice load is manageable and adjustable; schedule is deterministic and testable.

## EPIC MM — Mental Maths and strategy intelligence

**Release intent:** R3. The product should teach mathematical flexibility, not sell shortcuts as magic tricks.

### MM-001 — Research and validate a mental-strategy catalogue
- **Priority:** P2 | **Release:** R3 | **Size:** L
- **Work:** Research and classify strategies from primary maths pedagogy, mental arithmetic, number sense and Vedic Maths. For each candidate strategy record its proof, prerequisites, valid range, examples, limitations, age suitability, likely use cases and comparison with standard methods.
- **Acceptance criteria:** No strategy is taught without a mathematical justification and independently checked examples; claims about speed are not made without measured evidence; Vedic techniques are included only where accurate, understandable and useful for the learner.

### MM-002 — Build strategy learning template
- **Priority:** P2 | **Release:** R3 | **Size:** M
- **Acceptance criteria:** Every strategy lesson includes when to use it, why it works, worked example, visual or place-value explanation where helpful, guided attempt, independent transfer question and situations where the strategy is unsuitable.

### MM-003 — Teach number bonds, partitioning and place-value strategies
- **Priority:** P2 | **Release:** R3 | **Size:** M
- **Acceptance criteria:** Covers bonds, partitioning, recombining, bridging through 10/100/1,000, compensation and place-value reasoning; each technique is mapped to prerequisite knowledge and age range.

### MM-004 — Teach doubling, halving and near-doubles
- **Priority:** P2 | **Release:** R3 | **Size:** S
- **Acceptance criteria:** Includes connected examples for multiplication, division and fractions; learner can explain when doubling one quantity and halving another preserves a product.

### MM-005 — Teach multiplication and division strategies
- **Priority:** P2 | **Release:** R3 | **Size:** L
- **Acceptance criteria:** Covers distributive partitioning, factorisation, commutativity, associativity, multiplying by 5/9/11/25/50/99 where appropriate, base-10/base-100 methods and division by factor relationships; all examples are proven and tested.

### MM-006 — Teach squares and number-pattern strategies
- **Priority:** P2 | **Release:** R3 | **Size:** M
- **Acceptance criteria:** Includes age-appropriate square-number patterns and validated methods such as squaring numbers ending in 5 where prerequisites are established; boundaries and exceptions are taught.

### MM-007 — Teach fraction, decimal and percentage shortcuts
- **Priority:** P2 | **Release:** R3 | **Size:** M
- **Acceptance criteria:** Covers common equivalences, finding simple percentages, fraction-of-quantity strategies and efficient conversions; learners understand why the method works and when it applies.

### MM-008 — Evaluate Vedic Maths candidate techniques
- **Priority:** P2 | **Release:** R3 | **Size:** M
- **Acceptance criteria:** Candidate techniques such as multiplication near powers of 10, vertically-and-crosswise multiplication and selected squaring methods are individually validated; only suitable techniques enter the learner curriculum; marketing claims and unsupported historical claims are excluded.

### MM-009 — Build compare-the-method activity
- **Priority:** P2 | **Release:** R3 | **Size:** M
- **Acceptance criteria:** Suitable questions present a standard method and one or more efficient alternatives; child can compare steps and select a valid strategy; the system accepts different mathematically valid methods where the question allows them.

### MM-010 — Build strategy-selection challenges
- **Priority:** P2 | **Release:** R3 | **Size:** M
- **Acceptance criteria:** Child identifies the most efficient suitable strategy for a question and gives a reason; scoring values mathematical validity and method choice, not speed alone.

### MM-011 — Build accuracy-first timed practice
- **Priority:** P2 | **Release:** R3 | **Size:** M
- **Acceptance criteria:** Timed challenges unlock or are recommended only after adequate untimed accuracy; feedback compares the learner with their own previous performance; no public ranking or shame-based messaging.

### MM-012 — Build mental-strategy mastery analytics
- **Priority:** P2 | **Release:** R3 | **Size:** M
- **Acceptance criteria:** Tracks accuracy, method choice, independence, hint use and time as separate measures; improvement in speed does not conceal declining accuracy; strategy weaknesses drive recommendations.

## EPIC EXAM — 11+ reasoning and examination preparation

### EXAM-001 — Define exam-profile data model
- **Priority:** P3 | **Release:** R5 | **Size:** M
- **Acceptance criteria:** School / consortium profiles can record verified subjects, provider, question formats, timing, calculators policy where officially known, admissions-cycle year and source date; unknown information remains explicitly unknown.

### EXAM-002 — Build exam-format research and verification workflow
- **Priority:** P3 | **Release:** R5 | **Size:** M
- **Acceptance criteria:** Exam format is sourced from current official school, council or consortium information wherever possible; provider format is not inferred from nearby schools; changes are date-stamped.

### EXAM-003 — Create 11+ question taxonomy
- **Priority:** P3 | **Release:** R5 | **Size:** M
- **Acceptance criteria:** Questions are tagged by curriculum skill, reasoning demand, representation, difficulty, format and relevant exam profile; curriculum questions and exam-specific styles are not conflated.

### EXAM-004 — Build multi-step and unfamiliar problem practice
- **Priority:** P3 | **Release:** R5 | **Size:** L
- **Acceptance criteria:** Includes multi-step arithmetic, word problems, interpretation, working backwards, estimation, pattern recognition and method selection; solutions explain reasoning, not only the final answer.

### EXAM-005 — Build timed section and mock-test engine
- **Priority:** P3 | **Release:** R5 | **Size:** L
- **Acceptance criteria:** Supports configurable question count, section timing, review rules and question format; stores attempts and review; is configurable by verified exam profile; clearly distinguishes practice material from official papers.

### EXAM-006 — Build post-test analysis
- **Priority:** P3 | **Release:** R5 | **Size:** M
- **Acceptance criteria:** Separates knowledge gaps, careless errors, timing pressure and question-format issues where evidence permits; provides actionable revision plan; does not claim to predict admission or an offer probability without a defensible model and data.

## EPIC PARENT — Learner profile and parent experience

### PARENT-001 — Define learner profile and year group
- **Priority:** P3 | **Release:** R5 | **Size:** M
- **Acceptance criteria:** Stores selected year group and learning preferences; profile changes do not erase progress; data collection is minimal and transparent.

### PARENT-002 — Build parent progress summary
- **Priority:** P3 | **Release:** R5 | **Size:** M
- **Acceptance criteria:** Shows time and activity summary, skill development, areas needing support and next recommendations; avoids unsupported rankings and deterministic predictions.

### PARENT-003 — Build weekly learning plan
- **Priority:** P3 | **Release:** R5 | **Size:** M
- **Acceptance criteria:** Recommends a manageable mix of new learning, spaced review, times tables, mental maths and application based on evidence; parent can understand and adjust workload.

## EPIC QA — Quality engineering and release readiness

### QA-001 — Build mathematical unit-test suite
- **Priority:** P0 | **Release:** R0/R1 | **Size:** M
- **Acceptance criteria:** Tests cover fraction arithmetic, equality, simplification, comparison, part-of-quantity calculations, partition mapping and all core arithmetic functions; boundary and invalid-input cases are included.

### QA-002 — Build component and integration tests
- **Priority:** P1 | **Release:** R1 | **Size:** M
- **Acceptance criteria:** Test key visual controls, question validation, lesson progression, hint behaviour, progress updates and persistence; tests assert synchronisation between visual models and mathematical state.

### QA-003 — Build end-to-end learning journey tests
- **Priority:** P1 | **Release:** R1 | **Size:** M
- **Acceptance criteria:** Automated test completes a full student journey from dashboard through lesson, practice, recovery and assessment; critical actions are not represented by non-functional decorative controls.

### QA-004 — Create defect register and triage rules
- **Priority:** P0 | **Release:** R0 | **Size:** S
- **Acceptance criteria:** Defects have ID, severity, priority, reproduction steps, expected/actual result, evidence, owner, fix and retest status; critical/high defects block acceptance.

### QA-005 — Accessibility and responsive test pass
- **Priority:** P1 | **Release:** R1 | **Size:** M
- **Acceptance criteria:** Keyboard, focus, contrast, text scaling, touch, reduced motion and supported screen-size checks are executed; failures are logged and retested.

### QA-006 — Regression test suite
- **Priority:** P1 | **Release:** R1 | **Size:** M
- **Acceptance criteria:** Previously accepted learning flows are retested after fixes; CI or documented local commands run reliably; test failures are not waived without an explicit decision.

### QA-007 — Release acceptance report
- **Priority:** P1 | **Release:** R1 | **Size:** S
- **Acceptance criteria:** Report lists accepted features, tests actually executed, results, unresolved defects, known limitations and final acceptance decision; “not tested” is never reported as “passed”.

---

## 6. First implementation sprint — recommended order

After repository discovery, the first build should proceed in these increments. Claude Code should receive one task or a small related group at a time.

| Order | Backlog IDs | Delivery objective | QA gate |
|---:|---|---|---|
| 1 | GOV-001, GOV-002, GOV-003, UX-001 | Understand repository, agree scope, document benchmark and traceability | PO accepts repository audit and scope |
| 2 | CUR-002, CUR-003, UX-002, UX-003, UX-004, ARCH-001 | Agree learning architecture, design system and lesson template | PO / educational QA approves design and learning model |
| 3 | ARCH-002, ARCH-003, QA-001 | Implement typed question model and pure tested maths functions | Mathematical unit tests pass |
| 4 | UX-005, FR-011, ARCH-004 | Build application shell, journey and persistence | Navigation and persistence checks pass |
| 5 | FR-002, FR-003, LAB-001, LAB-002, LAB-003 | Deliver whole, equal parts, numerator/denominator and interactive shading | Visual state and maths notation stay synchronised |
| 6 | FR-004, FR-005, FR-006, LAB-004, LAB-005 | Deliver shapes, sets, comparison and equivalence | Independent mathematical review passes |
| 7 | FR-007, FR-008, FR-009, LAB-006 | Deliver number line, fractions of quantities and same-denominator operations | Boundary and visual representation tests pass |
| 8 | PRACT-001 to PRACT-008 | Deliver a meaningful set of working practice interactions | Question and feedback tests pass |
| 9 | MIS-001 to MIS-005 | Deliver misconception signals and recovery flows | Pattern-based detection and transfer checks pass |
| 10 | FR-001, FR-010, MAST-001 to MAST-005 | Complete the student journey and independent assessment | Mastery and persistence evidence passes |
| 11 | UX-006 to UX-008, QA-002 to QA-007 | Refine motion, responsive layouts, accessibility and regression | R1 acceptance review |

**R1 is not accepted if any core learning screen is a placeholder, any key interaction is decorative only, a mathematical representation is wrong, or a critical/high defect remains open.**

---

## 7. Definition of Ready (DoR)

A task is Ready for Development only when:

- The user problem and intended outcome are clear.
- Scope and exclusions are explicit.
- Prerequisites and dependencies are known.
- Expected interaction and state changes are described.
- Mathematical rules and valid inputs are defined where applicable.
- Acceptance criteria are observable and testable.
- UX and accessibility expectations are stated.
- Relevant curriculum references or content sources are identified.

## 8. Definition of Done (DoD)

A task can be marked Accepted only when:

- Implementation matches the approved requirement.
- Mathematical logic is independently validated where applicable.
- All acceptance criteria pass.
- Relevant automated tests are run and pass.
- Responsive and accessibility checks are completed where relevant.
- No critical or high-severity defect remains open.
- The actual result has been inspected, not merely described by the developer.
- Evidence is attached or recorded.
- Documentation and backlog status are updated.

---

## 9. Defect severity and acceptance rules

| Severity | Definition | Release rule |
|---|---|---|
| Critical | Incorrect mathematics, data corruption, core journey unusable, serious accessibility blocker or unsafe behaviour | Blocks release |
| High | Major teaching, validation, progression, interaction or persistence failure | Blocks release |
| Medium | Secondary feature incomplete or significant usability issue with a workaround | Must be triaged; release requires explicit PO decision |
| Low | Minor visual or polish defect | Can be scheduled after release if documented |

**QA statuses:** NOT STARTED → SPECIFIED → READY FOR DEVELOPMENT → IN DEVELOPMENT → READY FOR QA → QA FAILED / READY FOR RETEST → ACCEPTED. Use BLOCKED when a dependency or decision prevents progress.

---

## 10. Product success measures

Use measures that reflect learning quality rather than vanity metrics.

### Fractions prototype
- Percentage of learners completing the foundational journey.
- Accuracy on independent transfer questions.
- Reduction in repeated misconception patterns after recovery.
- Consistency across different visual representations.
- Ability to explain or select a valid strategy without hints.
- Completion and persistence reliability.

### Times Tables
- Fact-level accuracy and consistency.
- Recall across mixed tables, not only a rehearsed sequence.
- Multiplication-to-division transfer.
- Retention on later review sessions.
- MTC-style simulation performance, clearly separated from conceptual understanding.

### Mental Maths
- Accuracy before and after strategy instruction.
- Ability to identify appropriate strategy opportunities.
- Transfer to unfamiliar examples.
- Time change only when accuracy remains stable or improves.
- Ability to explain why the chosen strategy works.

### Product experience
- Task completion without help.
- Navigation success.
- Error and abandonment rates.
- Readability and accessibility test outcomes.
- Child and parent qualitative feedback.
- Performance and stability on supported devices.

Do not set arbitrary “top of market” targets without baseline research. Establish baselines, then define measurable improvement goals.

---

## 11. Risks and mitigations

| Risk | Why it matters | Mitigation |
|---|---|---|
| Visuals look correct but represent incorrect mathematics | A child may learn a false concept | Single source of mathematical truth; generated-model invariants; unit and visual QA |
| Speed training becomes rote pressure | Can undermine confidence and understanding | Accuracy-first progression; optional timing; separate recall from conceptual mastery |
| Vedic or other shortcuts are taught without boundaries | A method may be misapplied or overclaimed | Prove each method; list prerequisites and limits; compare with standard methods; independently review |
| “Adaptive” feedback overdiagnoses learners | One wrong answer is not proof of a misconception | Use response patterns, confidence levels and transfer questions; label signals as possible |
| 11+ is treated as one uniform exam | Content, provider and timings vary | Configurable, source-dated exam profiles; unknown values remain unknown |
| Interface prioritises novelty over clarity | Children may not understand what to do | Usability testing with children/parents; task-first hierarchy; purposeful motion only |
| Prototype scope expands too early | Core Fractions experience remains unfinished | R1 scope freeze; Tables and Mental Maths are planned as next releases, with reusable architecture now |
| Progress metrics reward activity instead of learning | Time spent and screen completion can mislead | Skill-level mastery evidence, independent transfer and spaced review |

---

## 12. Research references

These references inform the product baseline. Re-check official guidance when curriculum or assessment arrangements change.

1. **Department for Education — National curriculum in England: mathematics programmes of study.**  
   https://www.gov.uk/government/publications/national-curriculum-in-england-mathematics-programmes-of-study/national-curriculum-in-england-mathematics-programmes-of-study
2. **Department for Education — Multiplication tables check: administration guidance.**  
   https://www.gov.uk/government/publications/multiplication-tables-check-administration-guidance/multiplication-tables-check-administration-guidance
3. **Department for Education — Multiplication tables check: information for parents.**  
   https://www.gov.uk/government/publications/multiplication-tables-check-information-for-parents/multiplication-tables-check-information-for-parents-text-version--2
4. **Standards and Testing Agency — Multiplication tables check validity framework.**  
   https://www.gov.uk/government/publications/multiplication-tables-check-validity-framework/multiplication-tables-check-validity-framework
5. **NCETM — The Five Big Ideas at Primary: Fluency.**  
   https://www.ncetm.org.uk/features/the-five-big-ideas-at-primary-fluency/
6. **Education Endowment Foundation — Improving Mathematics in Key Stages 2 and 3.**  
   https://educationendowmentfoundation.org.uk/education-evidence/guidance-reports/maths-ks2-3
7. **Atom Learning — 11+ preparation product overview (competitor benchmark).**  
   https://www.atomlearning.com/11-plus
8. **Medway Council — Medway Test (example of a local 11+ format).**  
   https://www.medway.gov.uk/MedwayTest

---

## 13. First instruction to Claude Code

Do not start by implementing the entire backlog.

Start with **GOV-001 only**:

> Inspect the existing repository and report its framework, routes, component structure, design system, available tests, persistence approach, build commands, current working features and technical constraints. Do not change files, install packages, refactor or deploy. Identify the safest implementation path for the approved R1 Fractions prototype and explain how the architecture can later support Times Tables and Mental Maths.

The Product Owner reviews the repository audit before authorising the next task.

**Product acceptance authority:** Product Owner / Educational QA.  
**Implementation authority:** Claude Code.  
**Release rule:** No feature is accepted solely on the developer's statement that it is complete.
