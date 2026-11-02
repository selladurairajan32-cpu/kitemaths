# Kite Maths · Fractions foundations (prototype)

An interactive maths tutor prototype for Years 3–6. This release is a **fractions foundations module** — fractions of one whole, equal parts, comparing, equivalence, number lines from 0 to 1 and fractions of amounts. It is a first step towards 11+ preparation, **not** complete 11+ coverage.

Learning follows **Understand → Visualise → Explore → Practise → Explain → Apply → Master**: eight guided lessons, a Fraction Lab, adaptive practice with misconception recovery, an independent mastery check with two parallel forms, and short per-skill rechecks.

## Running

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # unit tests (maths, validation, diagnosis, content integrity, engine)
npm run lint
npm run build
```

Progress is saved in this browser only (`localStorage`); there are no accounts or cross-device sync. Saved data from earlier versions is migrated on load; data that can't be read is copied to a backup key before starting fresh. **Reset progress** on the dashboard asks for confirmation.

## Routes

| Route | Screen |
| --- | --- |
| `/` | Dashboard: activities completed, skills secure/mastered, recommended next step |
| `/journey` | Lessons, practice milestone, mastery check, and any skills needing review |
| `/lesson` · `/lesson/:lessonId` · `/lesson/:lessonId/:step` | Lesson Studio (resumes, opens a lesson, or opens a step you've reached) |
| `/lab` | Free Fraction Lab (1–12 equal parts, fractions from 0 to one whole) |
| `/practice` · `/practice/:skill` | Adaptive mixed practice, or practice focused on one skill |
| `/assessment` | Mastery check: start, resume, or retake (alternates forms A and B) |
| `/assessment/recheck/:skill` | Two-question independent recheck for one skill |
| `/results` (`#review`) | Strengths, evidence per skill, ideas to watch, next steps, full answer review |

## Evidence policy

| Label | Rule |
| --- | --- |
| Developing | Some lesson/practice evidence, not yet secure |
| Secure in practice | ≥3 recent lesson/practice answers averaging ≥75% (right first time = 1, right with help = ½) |
| Passed check | Every item for the skill in the latest independent check was right, but not enough evidence for “mastered” |
| Mastered | Latest independent evidence has ≥2 items, all right, **and** practice is secure (“mastered for now”) |
| Needs review | An item in the latest independent evidence was wrong. Practice alone can't clear it; a later recheck can |

Misconceptions are reported as *possible* after one sighting and *likely* only after repeated evidence; they are marked *improving* or *resolved* from later correct work. Reasoning is assessed with sentence frames and learner-built counterexamples, not free written explanations.

## Extension path (not built)

1. Simplifying fractions and common factors
2. Improper fractions and mixed numbers (number lines beyond 1)
3. Adding and subtracting fractions (same, then related denominators)
4. Multiplying and dividing fractions
5. Fractions, decimals and percentages
6. Multi-step 11+ style problems mixing all of the above

Each future module should reuse the engine: teach with representations, model a method, guide, then check a new instance independently.

## Architecture

```
src/engine/                Topic-agnostic teaching engine (pure TypeScript)
  types.ts                 Skills, questions, results, misconception definitions
  recovery.ts              Misconception recovery state machine (inline hints, diagnosis, follow-up, reveal)
  adaptive.ts              Deterministic adaptive question selection
  mastery.ts               Evidence policy and cautious misconception reporting
  progress.ts              Versioned learner state, idempotent recording, attempts and rechecks
  journey.ts               Topic definition contract, activity progress, recommendations
  random.ts                Seeded shuffles (stable option order per attempt)
src/topics/fractions/      Fractions content and maths
  math.ts                  Exact fraction arithmetic (integer cross-multiplication)
  diagnose.ts              Rule-based misconception diagnosis
  evaluate.ts              Marking for every question type, input validation, equivalence notes
  questions.ts             Practice, lesson, follow-up questions and assessment forms A/B
  lessons.ts               Lesson steps (explain, worked with supported blanks, lab, check)
  misconceptions.ts        Misconception catalogue and follow-up links
  lab.ts                   Fraction Lab challenges, checks and feedback
src/components/            SVG maths components, question inputs and players, lesson player, screens
src/lib/                   localStorage store and stable route helpers
```
