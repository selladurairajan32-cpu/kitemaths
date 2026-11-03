# Kite Maths · Fractions adventure (prototype)

A playful maths adventure for Years 3–6, guided by **Kip the kite**. This release is a **fractions foundations module** — fractions of one whole, equal parts, comparing, equivalence, number lines from 0 to 1 and fractions of amounts. It is a first step towards 11+ preparation, **not** complete 11+ coverage.

Learning follows **Understand → Visualise → Explore → Practise → Explain → Apply → Master**: eight guided lessons, a Fraction Lab, adaptive practice with misconception recovery, an independent mastery check with two parallel forms, and short per-skill rechecks.

## What children see

- **Warm-up placement** (`/start`): name, school year, then up to 8 questions (one per lesson). Lessons answered correctly before the first gap are skipped; two misses in a row ends it early. Children can also start from the beginning.
- **Kid home**: Kip's greeting, the next adventure, stars and level, a daily streak, a 10-question daily goal, the sky path and play tiles.
- **Adventure map**, **Practice arena**, **Fraction Lab** and **Badges** (trophy room).
- **Focus mode**: lessons, practice sessions, the warm-up and checks hide navigation and keep the main button pinned to the bottom of a phone screen.
- **Read aloud**: every question and explanation has a speaker button (browser speech, UK voice when available). Grown-ups can switch on automatic reading.
- **Rewards**: stars for every answer (3 first time, 2 with help, 1 for trying), bonus stars for lessons, lab challenges and the big challenge; levels; streaks; badges; confetti and sounds (synthesised, can be muted). Rewards are *derived* from history, never stored, so they can't be double-awarded.

## What grown-ups see

`/parent` (behind a simple "grown-ups only" multiplication question): the detailed overview, skills evidence, ideas being worked on, settings (name, year, sound, auto read-aloud) and reset. `/parent/journey` has the detailed journey and `/results` the full report with every answer.

## Questions that never run out

Alongside the hand-written bank, every skill has **seeded question generators** at three difficulty levels (`src/topics/fractions/generate.ts`). A generated question's id (`g:<template>:<level>:<seed>`) is enough to rebuild it exactly, so it can be saved and reloaded. Practice uses the hand-written questions first, then a fresh generated batch each session that skips anything the learner has already seen. Tests check thousands of generated questions with the same rules as the hand-written bank.

## Running

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # unit tests (maths, validation, diagnosis, content integrity, engine)
npm run lint
npm run build
```

Progress is saved in this browser only (`localStorage`, key `kite-maths:v2`); there are no accounts or cross-device sync yet. Saves from before islands existed (`kite-maths:fractions:v1`) are migrated on first load and the old key is kept untouched as a backup; data that can't be read is copied to a backup key before starting fresh. **Reset progress** in the grown-ups' area asks for confirmation.

## Routes

The app is a map of **worlds** and **islands** (topics). Each island lives under `/t/<topic>`; today the only island is `fractions`. The plan for the rest is in [`docs/ROADMAP.md`](docs/ROADMAP.md).

| Route | Screen |
| --- | --- |
| `/` | Kid home: next adventure on the active island, stars, streak, daily goal |
| `/journey` | World map: every world and island (playable or coming soon) |
| `/badges` | Trophy room: badges, stars and level across all islands |
| `/t/:topic` | Island map: lessons, practice milestone, the big challenge, skills |
| `/t/:topic/start` | Warm-up placement for the island |
| `/t/:topic/lesson` · `/lesson/:lessonId` · `/lesson/:lessonId/:step` | Lessons in focus mode |
| `/t/:topic/lab` | Free-play lab, if the island has one |
| `/t/:topic/practice` · `/practice/:skill` | Practice arena: adaptive mixed practice, or one skill |
| `/t/:topic/check` | The big challenge (mastery check), alternating forms A and B |
| `/t/:topic/recheck/:skill` | Two-question independent recheck for one skill |
| `/parent` · `/parent/journey` | Grown-ups: overview, settings, detailed journey |
| `/results` (`#review`) | Grown-ups: strengths, evidence per skill, ideas to watch, full answer review |

Links from before islands existed (`/lesson/...`, `/practice/...`, `/assessment/...`) redirect permanently to the fractions island. `/practice`, `/lab` and `/start` currently open the first island.

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

Each future island reuses the engine: teach with representations, model a method, guide, then check a new instance independently. To add one, build a `TopicModule` like `src/topics/fractions/module.tsx`, list it in `src/topics/index.ts`, and give its world-map entry a `topicId` in `src/topics/worlds.ts`. `src/topics/registry.test.ts` checks the ids and shows a second island working alongside fractions.

## Architecture

Every skill, question and misconception id is namespaced by its island (`fractions.compare`, `fractions.nm-1`, `g:fractions.nm-choose:2:123`), so islands never clash and any id leads back to its island. Results are shared across islands; each island keeps its own lessons, practice session, checks and placement.

```
src/engine/                Topic-agnostic teaching engine (pure TypeScript)
  types.ts                 Skills, questions, results, misconception definitions
  recovery.ts              Misconception recovery state machine (inline hints, diagnosis, follow-up, reveal)
  adaptive.ts              Deterministic adaptive question selection
  mastery.ts               Evidence policy and cautious misconception reporting
  progress.ts              Versioned learner state (per-island progress + shared results), idempotent recording
  journey.ts               Topic definition contract, phases, activity progress, recommendations
  random.ts                Seeded shuffles (stable option order per attempt)
  rewards.ts               Stars, levels, streaks, daily goal and badges, derived from history
src/topics/                Island registry (index.ts), module contract (types.ts), world map (worlds.ts),
                           topic context for the UI, active-island choice
src/topics/fractions/      The fractions island: content, marking, generators, and its own UI (ui/)
  module.tsx               Plugs the island into the app: question kit, visuals, lab, assessment, placement
  math.ts                  Re-exports src/maths/fraction.ts (exact fraction arithmetic, shared)
  diagnose.ts              Rule-based misconception diagnosis
  evaluate.ts              Marking for every question type, input validation, equivalence notes
  questions.ts             Practice, lesson, follow-up questions and assessment forms A/B
  lessons.ts               Lesson steps (explain, worked with supported blanks, lab, check)
  misconceptions.ts        Misconception catalogue and follow-up links
  lab.ts                   Fraction Lab challenges, checks and feedback
  generate.ts              Seeded question generators for every skill and level
  placement.ts             Warm-up plan and where-to-start rules
src/lessons/types.ts       Lesson structure shared by every island
src/components/            Shared maths pictures, question/lesson players, screens (read the island from context)
  kid/                     Kip the kite, celebrations, read-aloud button, rewards HUD, child-facing wording
src/lib/                   localStorage store + v1 migration, route helpers, speech and sound
```
