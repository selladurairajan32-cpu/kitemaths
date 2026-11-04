# CUR-003 — Instructional lesson template

| | |
|---|---|
| **Backlog item** | CUR-003: create the instructional lesson template (P0, R0) |
| **Status** | READY FOR QA, waiting for Product Owner and educational QA review |
| **Date** | 4 November 2026 |
| **Acceptance criterion** | A reusable template supports objective, prerequisite check, explanation, representation, worked example, guided activity, independent practice, reflection, mastery check and next step. |
| **Scope (D-012, RC-005)** | <ul><li>**Defined now:** the template, its rules, and the schema that supports all ten elements.</li><li>**R1:** the schema change in `src/lessons/types.ts` and player support for the three new step types, because those need UI work.</li><li>Today's lessons are checked against the template below.</li></ul> |

---

## 1. The template

A lesson teaches **one skill** (today's model: `Skill.lessonId`, one to one). It runs in this order:

| # | Element | Purpose | Required? | Today's schema (`src/lessons/types.ts`) | Proposed (R1) |
|---|---|---|---|---|---|
| 1 | **Objective** | Says in child language what they'll be able to do | Required | `objectives: string[]` (every lesson has them) | Unchanged. Also add `skills: SkillId[]` so a lesson can name the skills it teaches. |
| 2 | **Prerequisite check** | 1–2 quick questions on the prerequisite skills (CUR-002 graph). A miss offers "best after" help; it never blocks. | Required when the lesson has prerequisites | **Gap.** Only the island-level warm-up (`PlacementKit`) exists. | Step type `prereq-check` `{ questionIds }`. Skipped when prerequisites are already secure. |
| 3 | **Explanation** | Teaches the idea in short, plain sentences | Required | `explain` step: `title`, `body[]`, `tip?` | Unchanged. `tip` becomes a distinct content type (UX-004). |
| 4 | **Representation** | A concrete or pictorial model **before** any symbol-only work (CPA, CUR-002 §6) | Required, before the first independent question | `explain.visual`, `worked.visual`, `lab` steps | Unchanged. Enforced by a test for Fractions. |
| 5 | **Worked example** | Teacher models the whole method ("Watch me") | Required for procedural skills; optional for purely conceptual ones | `worked` step with `support: "full"` | Unchanged |
| 6 | **Guided activity** | The child does part, with support that fades ("Let's do it together"; lab challenges) | Required | `worked` with `support: "faded"` and `blank`s; `lab` steps | Unchanged. Fading rules in §2. |
| 7 | **Independent practice** | New examples, no scaffolding, marked by the engine | Required: at least 2 items | `check` steps (`questionId`) in the lesson, plus the island's practice sessions | Unchanged. Items must be *new*, not the worked example again (MIS-005). |
| 8 | **Reflection** | The child notices or explains something: "What changed? Why?" Sentence frames, not free writing. | Required (short) | **Gap.** One Fractions explain step plays this role. | Step type `reflect` `{ prompt, frames?: string[] }`. Not marked; recorded as completed. |
| 9 | **Mastery check** | Evidence that the lesson's skill is in place: lesson checks answered without a reveal (CUR-002 §4), and later the island's independent check | Required | **Gap at lesson level.** The island-level big challenge exists (`AssessmentKit`). | Step type `mastery-check` `{ questionIds }` (independent, no hints, recorded as `lesson` evidence), *or* a rule that counts the lesson's last checks as the mastery evidence. Educational QA to choose (Q-1). |
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
  | { type: "prereq-check"; title: string; questionIds: string[] }      // element 2
  | { type: "reflect"; title: string; prompt: string; frames?: string[] } // element 8
  | { type: "mastery-check"; title: string; questionIds: string[] };     // element 9
```

**R1 must do all of these together, so the app never meets a step it can't render:**
- add the three step types to `LessonPlayer` and the step-gating rules;
- update `content.test.ts` (lesson integrity) and `kit/define.ts`;
- add template-conformance tests;
- make the CUR-002 evidence rules count `mastery-check` results.

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
4. **New examples for independent work:** check and mastery questions must not repeat the worked example's numbers or
   picture. Generated items (`g:` ids) satisfy this.
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
- `naming` asks a check question before its worked examples. Reorder unless educational QA prefers an early check (Q-2).
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

## 4. Questions for educational QA

| ID | Question | Recommendation |
|---|---|---|
| Q-1 | Lesson mastery: a separate `mastery-check` step, or count the lesson's last independent checks? | Count the last checks for short lessons. Use a `mastery-check` step when the lesson has more than one skill. |
| Q-2 | `naming`: keep the early check (a quick "notice" question) or move it after the worked examples? | Move it after, to follow rule 1. |
| Q-3 | Reflection: mandatory in every lesson, or only at the end of each cluster of lessons? | Every lesson, very short: one sentence frame. |
