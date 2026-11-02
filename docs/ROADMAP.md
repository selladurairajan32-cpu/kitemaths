# Kite Maths — roadmap for the full KS2 + 11+ platform

## Context

Kite Maths is live (kitemaths.vercel.app) with one module, **Fractions foundations**, plus the kid-friendly design, Kip, rewards, placement, read-aloud and generated questions.

**Strategy (from you):**
- Build an **Atom Learning-class 11+ platform**.
- Do **maths first** (KS2 Years 3–6 → 11+ maths) and release it live and **free** while it grows.
- Then add verbal reasoning, non-verbal reasoning and English.
- Then launch a **subscription at about ¼ of Atom's price**, with more features than Atom.

**Decisions made:**
- UK KS2 + 11+.
- Families at home first; tutor and teacher tools later.
- **Accounts early.**
- **AI tutor ("Ask Kip") is in.**

What exists and is reusable:
- **Topic-agnostic engine** (`src/engine/`, no imports from `topics/`): mistake recovery (`recovery.ts`), adaptive selection (`adaptive.ts`), mastery evidence (`mastery.ts`), recommendations (`journey.ts`, `TopicDefinition`), rewards derived from history (`rewards.ts`), seeded randomness (`random.ts`).
- **Patterns proven in fractions**: generators rebuildable from their id (`topics/fractions/generate.ts`), misconception catalogue and follow-ups, "watch me → together → your turn" lessons, A/B mastery forms, placement plan, content tests over every question (`content.test.ts`).

What blocks scaling today:
- About 25 UI files import `FRACTIONS_TOPIC` or `topics/fractions/*` directly.
- Learner state (`engine/progress.ts`) holds only one topic. Its storage key is `kite-maths:fractions:v1`.
- Question kinds are one fractions-only union (`topics/fractions/types.ts`), with marking and input in big switches (`evaluate.ts`, `QuestionInput.tsx`).
- Public routes have no topic in them (`/lesson/:id`, `/practice/:skill`).

## How Kite will beat Atom (maths scope)

| Atom offers (their own published claims) | Kite plan |
|---|---|
| Adaptive questions | ✅ already; plus **why-you-were-wrong diagnosis + targeted follow-ups** (Atom marks and explains) |
| Unlimited school-specific mocks, online and paper | Phase 5: target-school setup, timed online papers in that exam's format, **printable papers** |
| Photograph-and-mark paper tests | Phase 5: photo marking with AI, which also **comments on the working**, not just the answers |
| Weekly plan built around target school | Phases 2 + 5: Today's mission + countdown plan to exam day |
| Parent tracking, standardised age scores (SAS) | ✅ parent area; strand readiness now; **SAS once enough children have used it to calibrate fairly** |
| — | **Extra:** Ask Kip AI tutor, hands-on manipulatives and lab, read-aloud, game design with Kip, never-ending generated practice, honest "mastered" evidence, **support for children who find maths hard** (automatic gap-finding, alternative explanations), **Speed Lab** (Vedic and world shortcuts, taught with understanding) |

**Price target ~¼ of Atom**, kept affordable by:
- generated content (low cost to write);
- serverless hosting (Vercel + Supabase);
- AI with daily caps and prompt caching;
- no human tutors.

Check Atom's current price before setting ours.

## Every child can learn: support for children who find maths hard

These are built into the engine and required of every island, not an add-on mode. The aim is that a child who is behind, anxious, dyslexic, dyscalculic, has ADHD or has English as an additional language (EAL) makes steady progress.

- **Concrete → pictorial → abstract** in every lesson: hands-on objects (blocks, counters, bars) first, then pictures, then symbols. A "Show me with blocks" button is always available.
- **Automatic step-down**: after two misses on a skill, the engine follows the prerequisite graph backwards, finds the gap and teaches that first, then climbs back up. This is the "gap finder".
- **Base Camp**: catch-up foundations from KS1 (number sense, counting, number bonds to 10/20, place value basics). It is only for filling gaps, so a struggling Year 5 isn't stuck.
- **Explain it another way**: each skill has 2–3 different models (bar, number line, money, story). After a miss, Kip switches model instead of repeating the same explanation louder.
- **Smaller steps and high success**: adaptive difficulty aims for ~80% success, worked examples fade slowly, and there is one idea per screen.
- **Helper tools that fade**: a multiplication grid, number line and hundred square are allowed early, then gradually removed as mastery grows.
- **Word-problem unpacker**: highlight the numbers, find the question, act it out, then build a bar model. This is a big help for weak readers and is key for the 11+.
- **Reading and attention support**:
  - read-aloud everywhere (✅ exists);
  - larger text and extra line spacing;
  - dyslexia-friendly settings and colour overlays;
  - no timers by default (timers only in Speed Lab and exam mode, with a calm mode);
  - 5-minute micro-sessions and short brain breaks.
- **EAL**: a picture glossary of maths words. Translated key vocabulary later.
- **Growth, not comparison**: effort earns stars (✅), there are no public leaderboards, progress is shown against the child's own past ("twice as fast as last week"), and mistakes are framed as learning (✅ tone).
- **Ask Kip with endless patience**: hints step by step, never a full solution unless asked.
- **Parent coaching**: per topic, "how this is taught in UK schools" (column methods, bus-stop division) with a short guide on helping at home.
- **Accessibility**: WCAG 2.2 AA, keyboard and screen-reader support (partly ✅), and fast on old tablets and slow internet.

## Speed Lab: mental maths and the world's best shortcuts

A dojo-style bonus world, with belts from white to black. Every trick follows the same order: **see why it works** (an animated visual proof) → **know when to use it** (strategy-choice questions: "which trick is fastest here?") → **build speed** (beat your own record, never other children). It is unlocked only after the matching standard method is secure.

- **Mental strategies (UK, Singapore, Japan)**:
  - make-ten / bridging through 10 (8+5 = 8+2+3);
  - near doubles;
  - compensation (49+36 = 50+35);
  - partitioning;
  - doubling and halving (25×16 = 50×8 = 100×4);
  - ×5 = ×10÷2, ×25 = ×100÷4, ×9 = ×10−1, ×99;
  - derived facts and times-table patterns.
- **Vedic maths**:
  - "All from 9 and the last from 10" (1000 − 357);
  - base method for numbers near 10/100 (98×97, 104×103);
  - squaring numbers ending in 5 (35² = 3×4 | 25);
  - same tens with units adding to 10 (43×47);
  - ×11 by adding neighbouring digits;
  - vertically-and-crosswise 2-digit × 2-digit;
  - digit sums / casting out nines to **check answers**.
- **World methods**:
  - Japanese line (stick) multiplication;
  - lattice (Gelosia) multiplication;
  - Russian peasant (doubling and halving);
  - Trachtenberg rules (×11, ×12, ×5);
  - Korean Chisanbop finger counting;
  - soroban (Japanese abacus) simulator with visualised mental calculation (anzan);
  - finger tricks for the 9 times table.
- **11+ speed toolkit**:
  - divisibility rules (2–11);
  - % building blocks (10%, 1%) and "x% of y = y% of x" (8% of 50 = 50% of 8);
  - key fraction/decimal/% equivalents;
  - squares to 15², cubes to 5³, primes to 100;
  - estimate first, then sanity-check.
- **Games**:
  - times-tables arcade;
  - daily 2-minute sprint;
  - personal-best streaks;
  - a "trick or standard?" choice game;
  - a calm mode with no timer.

## Robustness and quality

- **Automatic checks on every pull request** (GitHub Actions): tests, lint, type check, build and a Playwright smoke test. The repo has none today; only Vercel previews run.
- **Error tracking and uptime alerts** (e.g. Sentry). Database backups and point-in-time restore (Supabase).
- **Feature flags and gradual rollouts** for new worlds and AI features. Content is versioned so a fix doesn't break saved progress.
- **Performance budget**: each island's code loads only when needed, images and sounds are light, and old tablets and 3G are tested.
- **Content quality**: generator tests across thousands of seeds (✅ pattern), teacher review before release, and an in-app "report a problem with this question" button.
- **Learning analytics**: per-question difficulty and drop-off, which explanations and follow-ups fix which misconceptions, and how often step-downs lead to recovery. This data drives content fixes.

## Content map

Content is organised as **Subject → World (strand) → Island (topic) → lessons and skills**. Every skill has year tags and prerequisites.
- **Maths** (build now):
  - Number & place value
  - Add & subtract
  - Multiply & divide (incl. **times-tables game**)
  - Fractions, decimals & % (Fractions foundations ✅)
  - Ratio & algebra
  - Measurement
  - Geometry
  - Statistics
  - **11+ Summit** (multi-step problems with bar models, reasoning, timed papers, mocks)
- **Later subjects**:
  - Verbal reasoning
  - Non-verbal reasoning (generated shape puzzles)
  - English (comprehension, spelling and grammar, writing marked with AI)

---

## Phase 0 — Multi-topic, multi-subject foundation (do first)

1. **Registry** `src/topics/index.ts`: `SUBJECTS`, `TOPICS`, `topicById()`.
   - Extend `TopicDefinition` (`src/engine/journey.ts`) with `subject`, `world`, `years`, `order`, `prerequisites`, `placementPlan`, `generators` and a `look` (moved from `components/kid/kidText.ts`).
   - Move `questionById`, `followUpFor`, `practicePool` and `lessonById` behind the topic.
2. **Global ids**: `fractions.compare`, `fractions.wholes`, `fractions.nm-1`, `g:fractions.nm-choose:2:123`. `generateFromId` and `questionById` route each id to its topic.
3. **Question-kind plug-ins**: each kind supplies `{ Input, evaluate, isComplete, answerText, responseText, inputProblem }`.
   - Shared kinds go in `src/questions/kinds/`: choose, multi-select, number with units, missing-number, match, order, frame, number-line.
   - Fraction kinds register from `topics/fractions/`. Move the existing code; don't rewrite it.
4. **Learner state v2** (`engine/progress.ts`, `lib/store.ts`): per-topic `topics[topicId] = { lessons, practice, assessment, recheck, rechecks, placement }`. Shared: `results`, `profile`, `settings`, `labChallenges`.
   - Add `migrateV1toV2()`, which reads `kite-maths:fractions:v1`, prefixes ids, writes `kite-maths:v2` and keeps a backup. The site is live, so no child may lose stars or progress.
5. **Topic-aware UI**: a `TopicProvider` context replaces direct `FRACTIONS_TOPIC` imports in screens and players.
   - Fraction visuals (`FractionShape`, `FractionNotation`, `RemedyVisual`, `FractionLab`, fraction parts of `Visuals.tsx`) move to `topics/fractions/ui/`.
6. **Routes**: `/t/[topic]` (island), `/t/[topic]/lesson/[lessonId]/[step]`, `/t/[topic]/practice/[skill]`, `/t/[topic]/check`, `/t/[topic]/recheck/[skill]`. A **world map** sits at `/journey`.
   - Add permanent redirects in `next.config.ts` from today's URLs.
7. **Cross-topic** `recommendNext` (prerequisites first), and stars and badges summed across topics.

8. **CI**: `.github/workflows/ci.yml` runs `npm test`, lint, `tsc` and build on every PR. Add error tracking.

**Done when**: fractions behaves as today, v1 progress migrates, old URLs redirect, CI is green, and a tiny second topic plugs in.

## Phase 1 — Family accounts, cloud saving, plans

- **Supabase** (Postgres, Auth, row-level security): parent sign-in (email magic link / Google) → **child profiles** (name, year, avatar, optional PIN), with a "Who's learning?" picker.
- **Data**:
  - `parents`, `children`;
  - `results` (append-only; the existing idempotent `ItemResult.id` makes syncing a simple union);
  - `child_state` (versioned JSON).
- Rewards stay derived, so they sync for free.
- **Offline first**: localStorage stays as a cache. Guest progress moves into the new child profile on sign-up.
- **Plans from day one**: `entitlements` per family (`free` now; `founding`, `premium` later) and feature flags read from it. Turning on payment later needs no data migration.
- Real parent login replaces the times-table gate, with per-child reports.
- **UK GDPR and Children's Code**: minimum child data, no ads or trackers, privacy notice, data export and delete, parental consent.
- `lib/store.ts` keeps the same `useLearner`/`updateLearner` API, with sync behind it. New `src/lib/supabase/*`, `src/app/(auth)/*` and `src/app/parent/children`.

## Phase 2 — Content engine and daily habit

- **Visual library** (`src/components/math/`, building on `NumberLine.tsx` / `FractionShape.tsx`): place-value chart, base-10 blocks, **bar models**, arrays, clocks, money, scales and rulers, protractor, coordinate grid, shapes and nets, charts.
- **Authoring kit**: each topic folder copies the fractions layout. Add a per-kind `checkQuestion()` run over thousands of seeds, and a dev-only `/dev/preview/[topic]`.
- **Spaced review** `src/engine/review.ts`: each skill gets a due date that grows after successes (1 → 3 → 7 → 21 days) and shrinks after mistakes.
- **Today's mission**: about 10 minutes mixing the next lesson step, due reviews and a times-tables warm-up.
- **Printable practice papers**: a PDF of generated questions with an answer key.
- **Placement per world** using prerequisites.
- **Learning-support engine** (see "Every child can learn"):
  - **step-down** through prerequisites in `adaptive.ts` and `journey.ts`;
  - **alternative explanations** per skill (a lesson-content field and a recovery-flow hook in `recovery.ts`);
  - **helper tools that fade** (a per-skill support level stored in learner state);
  - the **word-problem unpacker** and bar-model builder;
  - accessibility settings (text size, spacing, dyslexia mode, overlays, calm mode) in profile settings;
  - **Base Camp** foundations island.

## Phase 3 — "Ask Kip" AI tutor v1

- A server-side Next route handler calls the Claude API. The key never reaches the browser. The model is set by an env var: a small fast model for hints, a larger one only for marking.
- **Button-driven, not open chat**:
  - "Why was I wrong?" (sends the question, the child's answer, the diagnosed misconception and the worked solution);
  - "Give me a smaller hint" (step by step, never just the answer);
  - "Check my explanation" (marks the sentence-frame or free-text reasoning).
- **Child safety**:
  - maths-only system prompt;
  - no child name or personal data sent;
  - output checks and length limits;
  - parent on/off toggle;
  - transcripts visible to parents.
- **Cost control while free**: a per-child daily cap, prompt caching of the shared instructions, the rule-based diagnosis tried first and AI only on request, and a cost dashboard. At build time, load the `claude-api` skill for current models and pricing.
- Later (Phase 5): **photo of written working** marked with vision.

## Phase 4 — Maths worlds (each released live when ready)

- **Wave A**: Place value & rounding; Add & subtract; **Times tables** (arcade game, timed, 12×12); Multiply & divide.
- **Wave B**: Fractions 2 (simplify, mixed, + − × ÷); Decimals; Percentages; FDP.
- **Wave C**: Money; Time; Measures & conversions; Perimeter, area, volume.
- **Wave D**: Shapes & nets; Angles; Coordinates & transformations; Charts & mean.
- **Wave E**: Ratio; Algebra; Factors, primes, squares, cubes; Negative numbers; Order of operations.

Per island: 6–10 lessons, generators at 3 levels for every skill, misconceptions with follow-ups, A/B checks, placement questions, content tests, and **UK maths-teacher review** before release.

**Every island must also meet the inclusive checklist**:
- a concrete → pictorial → abstract path;
- 2+ alternative explanations per skill;
- prerequisites tagged for step-down;
- helper tools defined;
- read-aloud text checked;
- a parent "how it's taught" note.

**Speed Lab** opens after Wave A, because it needs secure number facts. New belts are added as each wave lands: mental strategies and times tables first; Vedic and world methods after multiplication; the 11+ speed toolkit after Waves B and E.

## Phase 5 — 11+ maths exam mode

- **Setup**: target school and region → exam format (e.g. GL multiple choice, Kent Test, Bexley Quest, independent-school papers), from a maintained data file. Exam date → countdown weekly plan.
- **Strategy lessons**: bar models, working backwards, logic.
- **Hand-written, teacher-reviewed multi-step problem bank.**
- **Timed papers in each format**: online with a calm timer, or **printable**, with **AI photo marking** that comments on working.
- **Full mocks**: score, time per question, review, and a strand readiness report for parents. Standardised age scores come later, once enough children have used it to calibrate fairly.

## Phase 6 — Other subjects, then subscription

1. **Non-verbal reasoning**: generated shape-sequence, odd-one-out and matrix puzzles (reuses the generator approach).
2. **Verbal reasoning**: word and letter codes, analogies, word banks.
3. **English**: comprehension passages, spelling, punctuation and grammar, and AI-marked writing.
4. **Subscription**:
   - Stripe on top of `entitlements`.
   - "Founding family" pricing for early free users.
   - A target of ~¼ of Atom's price.
   - Move Vercel to a commercial (Pro) plan before charging.
5. **Later**: tutor and teacher dashboards; weekly parent email; item analytics.

## Milestones

| | Milestone | Free/live |
|---|---|---|
| M1 | Phase 0 foundation + CI + error tracking (users see no change) | live |
| M2 | Accounts + child profiles + sync + entitlements + accessibility settings | private beta with ~10 families (include children who find maths hard), then live |
| M3 | Visual library, learning-support engine (step-down, alternative explanations, fading helpers), Base Camp, Today's mission, spaced review, **Times tables** | live |
| M4 | Ask Kip v1 (capped) | live |
| M5 | Wave A (number core) + **Speed Lab** opens (mental strategies, times tables) | live, free |
| M6–M9 | Waves B → E, each adding Speed Lab belts (Vedic, world methods, 11+ toolkit) | live, free |
| M10 | 11+ maths exam mode and mocks | live, free = **full maths release** |
| M11+ | NVR → VR → English, then subscription | paid launch |

## Critical files

- Engine: `src/engine/journey.ts`, `progress.ts`, `rewards.ts`, `types.ts`; new `review.ts`.
- Storage and accounts: `src/lib/store.ts`; new `src/lib/supabase/*`, `src/app/(auth)/*`.
- Questions: `src/components/questions/QuestionInput.tsx`, `QuestionPlayer.tsx`, `AttemptRunner.tsx`, `src/topics/fractions/evaluate.ts` and `types.ts` → `src/questions/kinds/*`.
- Topics: new `src/topics/index.ts`; `src/topics/fractions/*`.
- AI tutor: new `src/app/api/kip/*` route handlers and `src/lib/tutor/*` (prompts, caps).
- Learning support: `src/engine/adaptive.ts` (step-down, ~80% success target), `src/engine/recovery.ts` (alternative-explanation hook), new `src/topics/base-camp/*`, new `src/components/math/BarModel.tsx` and the word-problem unpacker.
- Speed Lab: new `src/topics/speed-lab/*` (tricks as generators, each with a "why it works" visual and a test that it is correct).
- CI: new `.github/workflows/ci.yml`.
- UI and routes: `src/components/screens/*`, `src/components/ui/AppShell.tsx`, `src/app/*` → `src/app/t/[topic]/*`, `next.config.ts`.

## Verification

- **Every milestone**: `npm test`, `npm run lint` and `npm run build` pass. Then a Playwright click-through at 1280px and 390px (home → world map → island → lesson → practice → check) with no console errors. A Vercel preview per PR, and production on merge to `main`.
- **M1**:
  - A migration test on a real v1 saved-state fixture: stars, streak, lessons and mastery are identical afterwards.
  - Old URLs return 308.
  - A second topic is playable.
- **M2**:
  - Two devices for one child stay in sync; offline answers sync with no duplicates.
  - Guest progress moves into a new account.
  - Row-level security tests show a family can't read another family's data.
- **M4**:
  - Prompt tests on fixed mistakes: hints never reveal the answer outright and stay on maths.
  - Caps are enforced.
  - The cost per child per day is logged.
- **M3**:
  - Engine tests check that two misses trigger a step-down to the right prerequisite and a climb back after success.
  - Alternative explanations rotate.
  - Helper tools fade as the support level drops.
  - A Playwright run with large text and calm mode on at 390px.
- **Speed Lab**:
  - Every trick has a test that its method gives the correct answer across thousands of generated inputs (e.g. the base method equals real multiplication).
  - A "when to use it" question exists for each.
  - Timers are off in calm mode.
- **Beta with struggling learners**: track success rate per session (~80% target), step-down recovery rate and session completion. Fix content where children get stuck.
- **Content waves**: per-kind `checkQuestion()` across thousands of seeds, A/B form parity, teacher sign-off, inclusive checklist complete.
