# CUR-003 — Instructional lesson template

| | |
|---|---|
| **Backlog item** | CUR-003: create the instructional lesson template (P0, R0) |
| **Status** | **ACCEPTED (D-023)** for its R0 specification scope. Schema additions and the fresh-example rule are R1. |
| **Date** | 4 November 2026; corrected 5 November 2026 ([correction report](../reports/R0-step2-correction-report.md)) |
| **Acceptance criterion** | A reusable template supports objective, prerequisite check, explanation, representation, worked example, guided activity, independent practice, reflection, mastery check and next step. |
| **Scope (D-012, RC-005)** | <ul><li>**Defined now:** the template, its rules, and the schema that supports all ten elements.</li><li>**R1:** the schema change in `src/lessons/types.ts` and player support for the three new step types, because those need UI work.</li><li>Today's lessons are checked against the template below.</li></ul> |

---

## 1. The template

A lesson teaches **one skill** (today's model: `Skill.lessonId`, one to one). It runs in this order:

| # | Element | Purpose | Required? | Today's schema (`src/lessons/types.ts`) | Proposed (R1) |
|---|---|---|---|---|---|
| 1 | **Objective** | Says in child language what they'll be able to do | Required | `objectives: string[]` (every lesson has them) | Unchanged. Also add `skills: SkillId[]` so a lesson can name the skills it teaches. |
| 2 | **Prerequisite check** | 1–2 quick questions on the prerequisite skills (CUR-002 graph). A miss offers "best after" help; it never blocks. A question **before teaching** is allowed only as an explicitly labelled, **optional prior-knowledge check**, with no penalty and no effect on progression (Q-2, D-016). | Required when the lesson has prerequisites | **Gap.** Only the island-level warm-up (`PlacementKit`) exists. | Step type `prereq-check` `{ questionIds, optional: true }`. Skipped when prerequisites are already satisfied. Not recorded as lesson evidence. |
| 3 | **Explanation** | Teaches the idea in short, plain sentences | Required | `explain` step: `title`, `body[]`, `tip?` | Unchanged. `tip` becomes a distinct content type (UX-004). |
| 4 | **Representation** | A concrete or pictorial model **before** any symbol-only work (CPA, CUR-002 §6) | Required, before the first independent question | `explain.visual`, `worked.visual`, `lab` steps | Unchanged. Enforced by a test for Fractions. |
| 5 | **Worked example** | Teacher models the whole method. Labelled "Worked example" or "Watch how" (D-020). | Required for procedural skills; optional for purely conceptual ones | `worked` step with `support: "full"` | Unchanged |
| 6 | **Guided activity** | The child does part, with support that fades ("Let's do it together"; lab challenges) | Required | `worked` with `support: "faded"` and `blank`s; `lab` steps | Unchanged. Fading rules in §2. |
| 7 | **Independent practice** | **Fresh** examples, no scaffolding, marked by the engine. The first attempt with no hint is the independent evidence (CUR-002 §4.1). | Required: at least 2 items | `check` steps (`questionId`) in the lesson, plus the island's practice sessions | Unchanged. Items must be genuinely different from the worked example, not just carry a new id (rule 4, MIS-005). |
| 8 | **Reflection** | One brief chance to notice or explain: "What changed? Why?" It can be a sentence frame, a choice or a spoken reflection. **Typed prose is never required, and reflection is never a mastery gate** (Q-3, D-017). A fuller reflection comes at the end of a lesson group. | Required (brief) | **Gap.** One Fractions explain step plays this role. | Step type `reflect` `{ prompt, mode: "frame" \| "choice" \| "spoken", frames?: string[] }`. Not marked; recorded as activity only. |
| 9 | **Mastery check** | **Lesson evidence** under one independence contract (CUR-002 §4.2): first attempt, no hint, not a revealed item, fresh examples. In a short single-skill lesson, the final independent questions provide it. When several skills need evidence, a separate `mastery-check` step does (Q-1, D-015). **Neither awards skill mastery**, which needs the further evidence MAST-001 defines. | Required | **Gap at lesson level.** The island-level big challenge exists (`AssessmentKit`). | Step type `mastery-check` `{ questionIds }`, with at least one question per skill. The evidence rules are the same as for final questions. |
| 10 | **Next step** | Tells the child what comes next and why: the next lesson, practice first, or "best after" | Required | **Gap at lesson level.** `recommendNext` (`src/engine/journey.ts`) decides island-wide. | Lesson field `nextStep?: { lessonId \| "practice" }` as a hint. The engine still decides, using the CUR-002 rules. |

### Proposed schema (R1, additive: existing lessons stay valid)

```ts
export interface Lesson<V = unknown, L = unknown> {
  id: string;
  title: string;
  phase: Phase;
  summary: string;
  minutes: number;
  objectives: string[];
  steps: LessonStep<V, L>[];
  /** New, optional: the skills this lesson teaches and the ones it builds on (CUR-002 graph). */
  skills?: SkillId[];
  prerequisites?: SkillId[];
  /** New, optional: a suggestion; the engine's CUR-002 rules have the final say. */
  nextStep?: { lessonId: string } | "practice";
}

export type LessonStep<V = unknown, L = unknown> =
  | /* existing: explain, worked, check, lab */ ...
  | { type: "prereq-check"; title: string; questionIds: string[]; optional: true } // element 2: never evidence
  | { type: "reflect"; title: string; prompt: string; mode: "frame" | "choice" | "spoken"; frames?: string[] } // element 8
  | { type: "mastery-check"; title: string; questionIds: string[] };                // element 9: lesson evidence only
```

**R1 must do all of these together, so the app never meets a step it can't render:**
- add the three step types to `LessonPlayer` and the step-gating rules;
- update `content.test.ts` (lesson integrity) and `kit/define.ts`;
- add template-conformance tests;
- make the CUR-002 evidence rules count `mastery-check` and final-question results the same way (CUR-002 §4.2);
- build the bounded freshness rule (§2, rule 4) with its verification cases.

## 2. Rules for writing a lesson

1. **Order:** objective → prerequisite check → explanation **with** a representation → worked example → guided activity
   → independent practice → reflection → mastery check → next step. Explanations and examples may alternate for a
   two-part idea (as in `amounts`), but **no independent question comes before the first model**.
2. **Fading** (FR-010):
   - Each core skill goes from full support, to faded (some steps blank), to independent.
   - A blank's `hint` is the first rung of support; `worked` is the last.
   - Hints are optional. A child who answers correctly is never made to see a hint.
3. **One idea per explain step:**
   - at most 3 short paragraphs;
   - key words in **bold** (rule and key-fact styling in UX-004);
   - the picture referred to in the text.
4. **Fresh examples for independent work** (DEF-026; implementation and tests in R1, under CUR-003 and MIS-005).
   - **A new question id is not a new example.** Generated `g:` ids only identify a template, difficulty and seed. Two
     ids can produce the same numbers and picture as the worked example, so the id alone guarantees nothing.
   - **What "different" means:** an independent item must differ from every example the lesson demonstrated in its
     **surface signature**: the operands (for example 3/4 and 12), the model (bar, circle, number line, counters) and
     the partition (5 equal parts). It may share the skill and the method; that's the point.
   - **Where freshness is required:** check, mastery-check and prerequisite-check items, and practice items marked as
     transfer items (CUR-002 §4.1). Guided steps may reuse the demonstrated numbers on purpose.
   - **How a generator finds a fresh item** (deterministic and bounded):
     1. Generate from the requested template with the item's seed.
     2. If the signature matches a demonstrated example, re-seed deterministically: `seed + 1`, `seed + 2` … up to **K**
        tries. K is a named constant set when this is built; 8 is proposed.
     3. If still no fresh item, try the island's **other templates with the same skill, difficulty and interaction**,
        in a fixed order, each with up to K re-seeds.
     4. If all are exhausted, stop with an explicit **`FreshnessExhausted` authoring error** that names the lesson,
        skill and template. Never loop without limit, and never silently reuse the demonstrated example.
   - **Verification cases (R1 tests):**
     - the same inputs always give the same item (determinism);
     - no independent item's signature equals a demonstrated example's, across many seeds for every lesson;
     - a collision is resolved by re-seeding;
     - a template that can only produce the demonstrated example falls back to another template;
     - when no template can produce a fresh item, `FreshnessExhausted` is raised and no item is returned;
     - re-seeding never changes the skill, difficulty or interaction.
5. **Read-aloud friendly:**
   - every step's text must make sense spoken (`src/lib/speech.ts`);
   - fractions are written `{n/d}`, so speech reads "three fifths".
6. **Length:** a lesson takes 5–12 minutes (`minutes`), with 2–4 independent items.
7. **Profiles.** The same template with different emphasis:

   | Profile | Use | Differences |
   |---|---|---|
   | **Concept** | Default; Fractions R1 | All ten elements |
   | **Lab** | Exploration | The guided activity is lab challenges. Independent practice comes from the island practice session. Mastery evidence comes from lab challenges plus practice (CUR-002 §4). |
   | **Fluency** | Times Tables, R2 | Short explanation, then a fact family; the independent practice is untimed first, with timed practice only after accuracy (TT-010, MM-011) |
   | **Strategy** | Mental Maths, R3 | Adds *when to use it*, *why it works*, *when it doesn't*, and a compare-the-method item (MM-002, MM-009) |

## 3. How today's lessons conform

Generated from `TOPICS` on 4 Nov. "—" means the element isn't present. Prerequisite check, reflection, mastery check
and next step can't be present yet: they're schema gaps (§1), not authoring mistakes.

### Fractions (R1)

| Lesson | Objective | Prerequisite check | Explanation | Representation before first check | Worked example (full) | Guided activity (faded worked / lab / blanks) | Independent practice (check steps) | Reflection | Mastery check | Next step |
|---|---|---|---|---|---|---|---|---|---|---|
| Wholes and equal parts (`wholes`) | Yes | — | Yes | Yes | — | — | 2 | — | — (island-level) | — (engine) |
| Numerator and denominator (`naming`) | Yes | — | Yes | Yes | Yes | Yes | 3 | — | — (island-level) | — (engine) |
| The Fraction Lab (`lab`) | Yes | — | Yes | Yes | — | Yes | 0 | Partial (explain step) | — (island-level) | — (engine) |
| Comparing fractions (`comparing`) | Yes | — | Yes | Yes | Yes | Yes | 2 | — | — (island-level) | — (engine) |
| Equivalent fractions (`equivalent`) | Yes | — | Yes | Yes | Yes | Yes | 2 | — | — (island-level) | — (engine) |
| Fractions on a number line (`number-line`) | Yes | — | Yes | Yes | Yes | — | 2 | — | — (island-level) | — (engine) |
| Fractions of amounts (`amounts`) | Yes | — | Yes | Yes | Yes | Yes | 4 | — | — (island-level) | — (engine) |
| Explaining your thinking (`reasoning`) | Yes | — | Yes | Yes | Yes | — | 2 | — | — (island-level) | — (engine) |

**Findings for R1 authoring** (also listed in CUR-002 §6):
- `wholes` has no worked or guided step. Add a "Watch me: is it fair?" worked step and a guided one.
- `number-line` and `reasoning` have no guided (faded) step before their independent checks.
- `naming` asks a check question before its worked examples. **Move it after the worked example in R1** (Q-2, D-016). It may stay early only as a labelled, optional prior-knowledge check with no consequence.
- `lab` has no independent check in the lesson. That's acceptable under the lab profile, but its evidence isn't recorded
  today (CUR-002 §4).
- No lesson has a prerequisite check, reflection, mastery check or next step (schema gaps).

### Unaccepted preview islands (D-001)

**18 islands, 85 lessons:**

| Element | Lessons that have it |
|---|---:|
| Objective | 85 of 85 |
| Explanation | 67 of 85 |
| Representation before the first check | 69 of 85 |
| Worked example (full) | 22 of 85 |
| Guided (faded or blanks) | 16 of 85 |
| Independent check steps | 85 of 85 |

These numbers matter for R4. They are not part of R1 acceptance. 63 of the 85 preview lessons have no full worked
example, and 16 have no picture before their first check.

## 4. Decisions (5 Nov)

The questions raised on 4 Nov were decided by the Product Owner on 5 Nov.

| ID | Decision | Record |
|---|---|---|
| Q-1 | Short single-skill lessons use their final independent questions. A separate mastery-check step is used when several skills need evidence. Both follow the same independence contract, and neither awards skill mastery. | D-015 |
| Q-2 | `naming`: move the early question after the worked example in R1. A question before teaching is acceptable only as a labelled, optional prior-knowledge check with no penalty or progression effect. | D-016 |
| Q-3 | One brief reflection per lesson: a sentence frame, a choice or spoken. No typed prose and no mastery gate. A fuller reflection at the end of a lesson group. | D-017 |
