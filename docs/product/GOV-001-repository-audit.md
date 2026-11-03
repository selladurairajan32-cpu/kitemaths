# GOV-001 — Repository audit

| | |
|---|---|
| **Backlog item** | GOV-001 — Inspect the existing repository (P0, R0, size S) |
| **Status** | READY FOR QA. This audit is waiting for Product Owner review. |
| **Date** | 3 November 2026 |
| **Code audited** | `main` at `bbf210a`. Branch `claude/pensive-pasteur-bs5979` at `1c14d24` has the same tree. |
| **Live site** | https://kitemaths.vercel.app (deployed from `main` on 3 Nov, before the backlog arrived) |
| **Method** | Read-only inspection of the source. CI's four checks run locally. A production click-through at 390px and 1280px on 3 Nov. Each finding cites a file, a command or a dated observation. |
| **Changes made** | None to the app. This file is the only addition. |

---

## 1. Summary

**Kite Maths is a working Next.js app for KS2 and 11+ maths.** It already has much more than the backlog's first release
expects.

| Area | What exists |
|---|---|
| Content | 19 playable islands across 6 worlds: 93 lessons and 93 skills |
| Learning engine | Pure TypeScript: mastery, adaptive practice, misconception recovery, rechecks, a warm-up (placement), rewards |
| Fractions island | A hand-built island with 13 question kinds and an interactive lab |
| Other 18 islands | Built from a shared "island kit" with two answer types (choose and type a number) and about 25 drawn picture kinds |
| Persistence | Progress is saved in the browser (localStorage) with versioning and migration. There are no accounts. |

**How this compares with the backlog.**
- The backlog plans a Fractions-only prototype first (R1), then Times Tables (R2), Mental Maths (R3) and the wider
  curriculum (R4).
- The repo already contains R4/R5-style breadth: every island, including Times tables and Mock exams.
- That content has **not** passed the backlog's quality gates:
  - no teacher review;
  - no prerequisite graph;
  - lessons count as complete when a child steps through them, not on evidence;
  - no end-to-end tests.
- Owner decision, 3 Nov (section 13): the non-Fractions islands stay live as **unaccepted previews**.

**Checks run on 3 Nov** (the same four steps as CI, `.github/workflows/ci.yml`; Node 22.23.4, npm 10.9.9):

| Check | Command | Result |
|---|---|---|
| Unit and content tests | `npm test` | **Pass:** 9 files, 181 tests |
| Lint | `npm run lint` | **Pass:** 0 problems |
| Type check | `npx next typegen && npx tsc --noEmit -p .` | **Pass** |
| Production build | `npm run build` | **Pass:** 913 static pages generated |
| CI on `main` | GitHub Actions run 41714084366 | **Pass** at `bbf210a` |

**Top risks.**
1. No prerequisite graph. "Lesson complete" is recorded when the child steps through a lesson, not on evidence
   (backlog CUR-002, FR-011, MAST-001).
2. Question definitions are checked only by tests, never when the app runs (ARCH-002).
3. A misconception follow-up starts after a **single** tagged wrong answer (MIS-003 asks for a pattern).
4. No component, end-to-end or accessibility tests exist in the repo (QA-002, QA-003, QA-005).
5. Production was deployed even though the backlog says "do not deploy to production". The owner asked for it on 3 Nov,
   before the backlog arrived. From now on, work goes to the preview only.

---

## 2. Stack and build commands

| Item | Value | Source |
|---|---|---|
| Framework | Next.js **16.4.3** (App Router). `cacheComponents: true`, `partialPrefetching: true`. Route types come from `next typegen`. | `package.json`, `next.config.ts` |
| UI | React 19.3, Tailwind CSS v4 (tokens in `@theme static`), `motion` 14 | `package.json`, `src/app/globals.css` |
| Language | TypeScript 5, `strict: true`, path alias `@/*` → `src/*` | `tsconfig.json` |
| Tests | Vitest 5. Runs `src/**/*.test.ts` only, so no `.tsx` component tests. | `vitest.config.mts` |
| Lint | ESLint 9 with `eslint-config-next` (core-web-vitals and TypeScript). Ignores `.claude/**`. | `eslint.config.mjs` |
| Hosting | Vercel. A preview per branch; production from `main`. | Vercel bot on the PRs |

**Scripts:**

| Command | What it runs |
|---|---|
| `npm run dev` | `next dev` |
| `npm run build` | `next build` |
| `npm start` | `next start` |
| `npm run lint` | `eslint` |
| `npm test` | `vitest run` |

**CI** (`.github/workflows/ci.yml`): runs on pull requests and on pushes to `main`. Steps:
`npm ci` → `npm test` → `npm run lint` → `npx next typegen && npx tsc --noEmit -p .` → `npm run build`.
There is no browser (Playwright) step and no deploy step.

**Rule for contributors** (`AGENTS.md`): Next 16 differs from earlier versions. Read the guide in
`node_modules/next/dist/docs/` before writing Next-specific code.

**Not present:** accounts or a backend, analytics, error tracking, feature flags, payments.

---

## 3. Routes and navigation

| Route | Screen (`src/components/screens/*`) | Notes |
|---|---|---|
| `/` | `KidHomeScreen` | Child home. It shows one "active" island (DEF-001 to DEF-007). |
| `/journey` | `WorldMapScreen` | 6 worlds, 19 islands |
| `/badges` | `BadgesScreen` | Stars, levels and badges ("Kites") |
| `/parent`, `/parent/journey`, `/results` | `ParentScreen`, `JourneyScreen`, `ResultsScreen` | Behind `ParentGate`, a times-table question. It is a speed bump, not security. These pages cover the active island only (DEF-012). |
| `/t/[topic]` | `SkyMapScreen` | Island map |
| `/t/[topic]/start` | `PlacementScreen` | Warm-up (DEF-011) |
| `/t/[topic]/lesson[/…]` | `LessonStudioScreen` → `LessonPlayer` | Lesson steps |
| `/t/[topic]/practice[/skill]` | `PracticeScreen` | 10-question adaptive sessions |
| `/t/[topic]/check` | `AssessmentScreen` | The "big challenge" (independent check, forms A and B) |
| `/t/[topic]/recheck/[skill]` | `RecheckScreen` | 2-question recheck |
| `/t/[topic]/lab` | `FreeLabScreen` | **Placeholder on 18 of 19 islands** (DEF-005) |

**Redirects** (`next.config.ts`):
- Old fractions-only URLs (`/lesson…`, `/practice/:skill`, `/assessment…`) redirect permanently to `/t/fractions/…`.
- `/practice`, `/lab` and `/start` redirect temporarily to Fractions.
  - In-app links use island-scoped routes, so children don't hit this. A typed or bookmarked URL does.
- `/sky` and `/crystal` serve design-preview pages from `public/preview/`, which are publicly reachable (DEF-016).

**Navigation:**
- Main tabs: Home, Map, Practice, Lab, Kites, plus Grown-ups. Defined in `KID_NAV` in `src/components/ui/AppShell.tsx`.
- Practice and Lab open the island the child is in, or else the active island.
- Lessons, practice, checks and the warm-up use a phone "focus mode" that hides the tabs.

---

## 4. Component structure

| Folder | Role |
|---|---|
| `src/app/` | Routes, root layout (Nunito, `lang="en-GB"`), global tokens |
| `src/components/ui/` | App shell and navigation, Button, Icons, ParentGate, Progress badges, Screen helpers |
| `src/components/kid/` | Kip (mascot), KipSays (speech bubble), ScreenHero, Hud, Celebrate, ReadAloud, child-facing text |
| `src/components/paper/` | Pictures: `Pic` (Fluent 3D, MIT), `PaperIcon`, drawn kite, sky scene |
| `src/components/lesson/` | LessonPlayer, WorkedExample |
| `src/components/questions/` | QuestionPlayer (prompt, hint, feedback sheet), AttemptRunner, shared answer inputs |
| `src/components/math/` | FractionNotation, NumberLine, RichText (`**bold**` and `{n/d}` fractions) |
| `src/components/screens/` | One screen per route |
| `src/engine/` | **Pure** learning engine: types, progress, mastery, adaptive, recovery, journey, rewards, random |
| `src/maths/fraction.ts` | **Pure** fraction maths |
| `src/lessons/types.ts` | Lesson and step types |
| `src/topics/` | Island registry (`index.ts`), worlds (`worlds.ts`), the `TopicModule` contract (`types.ts`), the active-island rule (`recommend.ts`) |
| `src/topics/fractions/` | Hand-built Fractions island. Content, marking and diagnosis are pure `.ts`; the UI is in `ui/` and `module.tsx`. |
| `src/topics/kit/` | Island kit: `defineTopic`, types, marking (`evaluate.ts`), number box (`Input.tsx`), pictures (`visuals*.tsx`) |
| `src/topics/<island>/index.ts` | One file per kit island: skills, lessons, question templates, misconceptions, placement |
| `src/lib/` | Storage (`store.ts`), v1→v2 migration, routes, sound, speech |

---

## 5. Design system as built

The design system is "Crystal" (`docs/DESIGN.md`, `src/app/globals.css`).

**Tokens** (`@theme static`):

| Group | Tokens |
|---|---|
| Ground and ink | paper `#f6f8fd`, surface `#fff`, sunk, raised; ink `#1b2559`, ink-2 (7.4:1), muted (5.6:1); line, line-strong |
| Brand | brand `#2563eb`, brand-strong, brand-soft, on-brand |
| Picture tiles | tile-blue, tile-orange, tile-yellow, tile-green, tile-pink, tile-sky |
| Fraction colours | num (coral numerator), den (blue denominator), each with -strong and -soft |
| Status | ok, warn, each with -bright and -soft |
| Drawing | sun, sky, leaf, fire, kite-red |
| Shape and depth | `--radius-card` 24px, `--shadow-card`, `--shadow-lift` |

There is **no spacing scale and no type-scale token.**

**Type:**
- Nunito only (`src/app/layout.tsx`).
- Body text is 18px, weight 500, line height 1.6, with tabular numbers.
- Headings use `.display` (weight 800).
- `DESIGN.md` sets a 15px minimum. Two places break it (DEF-010).
- Most sizes are one-off `rem` values rather than a named scale. `text-[0.9375rem]` alone appears about 180 times.

**Shared components:**

| Component | Variants and use |
|---|---|
| `Button` | primary, secondary, ghost, ink. Heights 48, 56 or 60px. |
| `ScreenHero` | The panel at the top of each screen |
| `KipSays` | white, sun or sky tone, with optional read-aloud |
| Answer tiles | `inputs.tsx` and `kit/Input.tsx` |
| Fractions | `FractionNotation`: stacked, coral numerator over blue denominator |

**How content types look today.** This is the input for UX-004 (content differentiation).

| Content | Treatment |
|---|---|
| Teaching text | White card, 18px ink-2 text; any picture sits on a `raised` panel |
| Question prompt | 24–28px extra-bold ink heading in a white card, with read-aloud |
| Worked example | "Watch me" chip (blue) or "Let's do it together" chip (**unstyled, DEF-009**), numbered steps, green conclusion |
| Hint | Warm `warn-soft` panel with a bulb |
| Tip | Warm `warn-soft` KipSays bubble |
| Input problem | Warm `warn-soft` text |
| Correct feedback | Green bottom sheet with a celebration picture |
| Revealed answer | White sheet with Kip |

Tip, hint, input problem and the hint on a worked-example blank all share the same warm panel, so a child can't tell
them apart by look. This feeds UX-004.

**Motion** (`motion`, with `MotionConfig reducedMotion="user"` plus a CSS reduced-motion block):
- step fade;
- wrong-answer shake;
- feedback sheet slide-up;
- worked-step reveal;
- fraction digit roll;
- confetti;
- Kip sway;
- card hover lift.

`DESIGN.md`'s rule that motion is "feedback only" is looser than this list. Kip's sway and the hover lift are decorative.

**Accessibility signals present:**
- skip link;
- landmarks and `aria-label`s;
- a global 3px focus ring;
- polite live regions for feedback;
- script-driven focus on new steps;
- read-aloud with a UK voice;
- mute;
- no timers;
- touch targets of 44–60px. The two exceptions are 40px: the sound toggle and the medium read-aloud button.

Gaps:
- number boxes remove the focus ring (DEF-015);
- no text-size or spacing settings;
- no automated accessibility checks.

---

## 6. Learning architecture as built

**Layers.**
- `src/engine/*` and `src/maths/*` are pure, with no React imports.
- Fractions content, marking, diagnosis and placement (`src/topics/fractions/*.ts`) are pure.
- Coupling to note for ARCH-001:
  - `src/topics/types.ts` mixes React component types into the island contract.
  - `src/topics/kit/define.ts` imports the kit's React input and picture components. So every kit island's content file
    pulls in UI code.
  - Some assessment logic lives in screen files: `independentResults()` in `AssessmentScreen.tsx` and `recheckPlan()` in
    `RecheckScreen.tsx`.

**Adding an island.** Either:
- hand-build a `TopicModule`, as `src/topics/fractions/module.tsx` does; or
- call `defineTopic(spec)`. It generates a practice bank, A/B check forms (2 items per skill), follow-ups and a
  placement plan.

Then register the island in `src/topics/index.ts` and `src/topics/worlds.ts`. Ids are namespaced `<island>.…`, enforced
by `registry.test.ts`.

**Question schema** (ARCH-002).
- `QuestionBase` (`src/engine/types.ts`): `id`, `skill`, `difficulty` (1–3), `prompt`, `hint` (a single string),
  `explanation`.
- Fractions has 13 `kind`s, including shade, equal-parts, match, compare, number-line-place, fraction-of, explain-frame
  and counterexample.
- Kit questions are either `choose` (options, each with a misconception tag and feedback) or `number` (an answer, plus
  "traps" for likely wrong answers, each with a misconception tag and feedback).
- **Missing:**
  - year or level on each question;
  - scoring metadata;
  - a ladder of hints;
  - a content version;
  - **runtime validation** that rejects a malformed definition.
- Integrity is checked only by tests: `fractions/content.test.ts` (over 3,000 generated items) and `kit/kit.test.ts`
  (each kit island, 40 seeds).

**Pure maths** (ARCH-003). `src/maths/fraction.ts` provides:
- `gcd`, `simplify`, `equivalent` (exact cross-multiplication), `compare`;
- `fractionOfAmount`, `missingNumerator`, `missingDenominator`;
- `parseFraction`, `isEqualPartition`, `toWords`.

**Missing:**
- adding, subtracting, multiplying and dividing fractions;
- mixed and improper conversion;
- LCM.

The kit islands do their arithmetic inside their question templates. For example, `gcd` is written again in
`fractions-2` and `ratio-algebra`.

**Lesson template** (CUR-003).
- `src/lessons/types.ts`: a lesson has a title, phase, summary, minutes, objectives and steps.
- Step types: `explain`, `worked` (support `full` or `faded`, with blanks for the child to fill), `check` and `lab`.
- **Missing:**
  - prerequisites on a lesson;
  - a reflection step type;
  - a mastery-check step type;
  - a year group.

**Progression** (CUR-002).
- There is **no prerequisite graph** for skills, lessons or islands.
- `recommendNext` (`src/engine/journey.ts`) picks, in order:
  1. a recheck in progress;
  2. the first unfinished lesson, in list order;
  3. practice up to a milestone (8 results, and at least half the skills secure);
  4. the big challenge;
  5. review.
- `activeTopic` (`src/topics/recommend.ts`) moves to the next island by its `order` field. That number restarts in each
  world, so the "next island" jumps between worlds (DEF-013).

**Lesson completion.** `LessonPlayer` records a lesson as complete when the child reaches the last step.
- A check step counts as done even if its answer was finally revealed.
- Worked-example blanks are required but never recorded.
- So completion means the child stepped through the lesson, not that they showed they learned it (FR-011 and MAST-001
  ask for evidence).

**Mastery** (`src/engine/mastery.ts`).
- Each answer scores:
  - 1 = right first try, no hint;
  - 0.5 = right with help;
  - 0 = wrong.
- **Secure:** at least 3 of the last 5 lesson/practice answers on the skill, averaging 0.75 or more.
- **Mastered:** secure, plus at least 2 independent (check or recheck) items, all right.
- Any wrong independent item moves the skill to **needs review**.
- The thresholds are named constants: `SECURE_MIN_EVIDENCE`, `SECURE_THRESHOLD`, `MASTERY_MIN_INDEPENDENT`.

**Misconceptions** (`src/engine/recovery.ts`, `mastery.ts`, `fractions/diagnose.ts`).
- One tagged wrong answer leads to a diagnosis message, then a follow-up question, then a retry.
- Reports call 1 sighting "possible" and 2 or more "likely".
- After that, a misconception is watched, then improving, then resolved, based on later clean answers.
- MIS-003 wants the follow-up to start from a pattern, not one answer.

**Attempt record** (`ItemResult`, `src/engine/types.ts`).
- Records: question id, skill, context, difficulty, correct, first try, attempts, hints used, misconceptions, and the
  time it was completed.
- **Missing:** the child's actual response (only check and recheck keep it), how long it took, and per-attempt history
  (ARCH-005).

**Warm-up (placement).**
- One question per lesson; it stops after 2 misses in a row.
- It skips every lesson before the first wrong answer.
- It works per island and at lesson level.

---

## 7. Persistence

- Storage is localStorage key `kite-maths:v2`, `STATE_VERSION = 2` (`src/lib/store.ts`, `src/engine/progress.ts`).
- Old v1 data (`kite-maths:fractions:v1`) is migrated by `migrateV1` (`src/lib/migrate.ts`, 6 tests). The original is
  kept.
- **Corrupt or incompatible data:** the raw text is copied to a timestamped backup key and the child starts fresh,
  with a notice. If storage is unavailable, the app runs without saving and shows a notice.
- Other tabs are kept in sync through the browser's `storage` event.
- **Gaps:**
  - The version check is an exact match, with no chain for future migrations.
  - Individual results aren't validated on load.
  - There's no export or import.
  - Progress lives in one browser on one device (no accounts).
  - `store.ts` has no tests.

---

## 8. Tests and quality gates

| Test file | Tests | Covers |
|---|---:|---|
| `src/topics/kit/kit.test.ts` | 72 | For each of the 18 kit islands: enough questions per skill; each question marks its own answer right and every trap wrong; 2 per skill per check form; warm-up and lesson checks resolve |
| `src/engine/engine.test.ts` | 34 | Recovery flow, mastery thresholds, adaptive selection, progress, journey recommendations, seeded shuffle |
| `src/topics/fractions/evaluate.test.ts` | 25 | Marking for each question kind, misconception diagnosis, lab challenges |
| `src/topics/fractions/content.test.ts` | 14 | Bank integrity, correct answers, parallel A/B forms, follow-ups, lesson rules, 3,000+ generated items |
| `src/engine/rewards.test.ts` | 10 | Stars, levels, streaks, daily goal, badges |
| `src/topics/fractions/math.test.ts` | 9 | gcd, simplify, equivalence, compare, fraction-of, missing numbers, parsing, equal partition |
| `src/topics/registry.test.ts` | 6 | Id namespacing, references, routing, world map |
| `src/lib/migrate.test.ts` | 6 | v1 → v2 migration |
| `src/design.test.ts` | 5 | No emoji, picture files and licence present, palette rules |
| **Total** | **181** | All pass (section 1) |

**Not tested in the repo:**
- React components;
- the storage layer;
- a full journey in a browser (end-to-end);
- accessibility;
- layouts at different screen sizes.

Browser checks so far were one-off Playwright scripts outside the repo, with screenshots inspected by eye on 3 Nov. They
are not repeatable evidence.

`design.test.ts` doesn't catch undefined utility classes (DEF-009) or hard-coded colours in components (about 13 files).

---

## 9. Current working features

These were observed on https://kitemaths.vercel.app on 3 Nov at 390px and 1280px. The pages checked loaded with no
console errors and no sideways scroll: home, the map, and a lesson step and a practice question on Decimals, Time,
Coordinates and Mock exams.

**A child can:**
- open the world map and any of the 19 islands;
- take lessons (explanation steps, worked examples with "Watch me" or "Let's do it together", and check questions);
- practise in 10-question adaptive sessions, mixed or for one skill, with generated questions;
- get hints, a misconception message and a follow-up question;
- take the big challenge (no hints; two parallel forms) and 2-question rechecks;
- take a warm-up on the first island;
- play in the Fraction Lab (Fractions only);
- earn stars, levels, a streak, a daily goal of 10 questions and badges;
- use read-aloud and mute;
- use the phone focus mode.

**A grown-up can:**
- pass the gate;
- see an overview, the journey and a full answer report (for the active island only);
- change the child's name, year group, sound and auto read-aloud;
- reset progress.

---

## 10. Technical constraints and risks

| # | Constraint or risk | Effect |
|---|---|---|
| R-1 | Progress is in one browser's localStorage, with no accounts | It can be lost when browser data is cleared, and there's no cross-device progress or parent login |
| R-2 | Next 16.4 behaviour (`cacheComponents`, `instant`, typegen route types) | Contributors must follow the bundled Next docs. CI must run `next typegen` before type checking (fixed 3 Nov). |
| R-3 | No prerequisite graph, and lessons complete by stepping through | Blocks CUR-002, FR-011 and MAST-001 as written |
| R-4 | No runtime question validation | A bad generated question can reach a child if tests miss it |
| R-5 | No teacher review of any content | CUR-004 is unmet. The 18 kit islands are especially exposed. |
| R-6 | Kit islands have 4–6 lessons and only two answer types | No plotting, drag, multi-part or written-reasoning questions outside Fractions |
| R-7 | Year groups aren't used. Each island's `years` and the profile's year are stored but nothing reads them. | Content isn't fitted to the child's year |
| R-8 | Curriculum gaps: no island yet for Roman numerals, primes, square and cube numbers, order of operations, volume, measure conversions, symmetry and reflection, nets or circles | Needed for CUR-001 and R4 |
| R-9 | Production deployed against the backlog's constraint | Owner decision recorded (section 13). Preview only from now on. |
| R-10 | Repo hygiene | `public/preview` design mock-ups are publicly served. A third-party design skill is committed under `.claude/` (now excluded from lint). The package name `elevenplus-maths` differs from the product name. |
| R-11 | Docs have drifted from the code | `README.md` says Fractions is the only island. `docs/ROADMAP.md` (milestones, "what blocks scaling", critical files) and `docs/DESIGN.md` (hero sizes, 15px minimum, motion) are partly out of date. The site title is still "Fractions adventure". GOV-002 should fix this. |

---

## 11. Fit against the backlog (R0 and R1, high level)

**Key:** Exists = meets the item's intent today. Partial = some of it exists. Missing = not present. Full
requirement-to-test traceability is GOV-003.

### R0 items

| Item | Status | Evidence and gap |
|---|---|---|
| GOV-001 Repository audit | This document | — |
| GOV-002 Source of truth | Partial | `docs/ROADMAP.md` covers vision and plan, but uses no backlog IDs, has no status definitions and has drifted from the code |
| GOV-003 Traceability | Missing | No requirement-to-test map |
| GOV-004 Change control | Missing | ROADMAP has 4 undated "decisions made" |
| CUR-001 Year 3–6 curriculum map | Partial | `src/topics/worlds.ts` plus each island's `years`. No objectives, prerequisites or official-source check. Gaps in R-8. |
| CUR-002 Progression model | Missing | No dependency graph (section 6) |
| CUR-003 Lesson template | Partial | `src/lessons/types.ts`. No prerequisites, reflection or mastery-check step. |
| UX-001 Competitor benchmark | Partial | ROADMAP has an Atom feature table, but no evidence-based UX review |
| UX-002 Design system tokens | Partial | Colour, radius and shadow tokens exist. No spacing or type scale, and no state tokens (DEF-009). |
| UX-003 Typography and maths readability | Partial | Nunito and a size table in `DESIGN.md`. Sizes aren't tokenised; 15px minimum broken (DEF-010). |
| UX-004 Content differentiation | Partial | Prompt, teaching and feedback are distinct. Hint, tip and input problem look the same (section 5). |
| ARCH-001 Modular architecture | Partial | Pure engine and maths; UI coupling noted in section 6 |
| ARCH-002 Typed question schema | Partial | Types exist. No runtime validation; fields missing (section 6). |
| ARCH-003 Pure maths modules | Partial | `src/maths/fraction.ts` lacks fraction operations; other islands' maths is inline |
| QA-001 Maths unit tests | Partial | 9 fraction-maths tests, plus self-consistency tests for every island |
| QA-004 Defect register | Missing | Provisional list in section 12 |

### R1 items (Fractions prototype)

| Item | Status | Evidence and gap |
|---|---|---|
| FR-001 Diagnostic and entry | Partial | Fractions warm-up (`fractions/placement.ts`): one question per lesson, stopping after 2 misses in a row. The child can only choose "Start from the beginning" (`PlacementScreen.tsx:114`), not pick another starting lesson. |
| FR-002 Wholes and equal parts | Exists | Lesson `wholes` ("Fair or not fair?"), question kind `equal-parts`, `isEqualPartition` |
| FR-003 Numerator and denominator | Exists | Lesson `naming`, num/den colours, `FractionNotation` |
| FR-004 Shapes and sets | Exists | Shape and set (object) questions in `fractions/questions.ts` and `generate.ts`. Teacher review pending. |
| FR-005 Compare | Exists | Lesson `comparing`, kind `compare`, `compare()` |
| FR-006 Equivalence | Exists | Lesson `equivalent`, `equivalent()` (cross-multiplication), lab equivalence mode |
| FR-007 Number line | Exists | Lesson `number-line`, kind `number-line-place`, `NumberLine` (tap a tick or use arrow keys) |
| FR-008 Fractions of quantities | Exists | Lesson `amounts`, `fractionOfAmount` (whole results only) |
| FR-009 Add and subtract, same denominator | Partial | Not in Fractions foundations. It's in the unaccepted Fractions 2 island (`fractions-2`, skill `add-same`). |
| FR-010 Worked examples and fading | Partial | Worked steps (full or faded) exist. Hints are a single string, with no gradual reduction. |
| FR-011 Journey screen | Partial | `SkyMapScreen` and `JourneyScreen` show status and what's next. No prerequisites or locked-state reasons; completion isn't evidence-based. |
| LAB-001 to LAB-003 One model, partitions, shading | Partial | `FractionLab.tsx`: one state drives the shape and the notation within each mode. Shading works by mouse, touch and keyboard (`role="checkbox"`). The state isn't shared across modes. |
| LAB-004 Several models | Exists | Bar and circle shapes (`FractionShape`) |
| LAB-005 Compare two fractions | Exists | Lab compare mode, computed by `compare()` |
| LAB-006 Number-line interaction | Partial | Tap a tick or use arrow keys. No drag in the lab. |
| LAB-007 Lab accessibility QA | Missing | Not formally tested |
| PRACT-001 to PRACT-008 Question engine | Mostly exists | Deterministic seeded generation. Kinds: choose, shade, match, equal-parts, number line, fraction-of. Retries and hints. Variation rules (PRACT-007) aren't documented. |
| MIS-001 to MIS-002 Catalogue and tags | Exists | 7 Fractions misconceptions (`fractions/misconceptions.ts`). Options and traps are tagged. |
| MIS-003 Pattern-based signal | Partial | Reports say "possible" or "likely", but the follow-up fires after one answer |
| MIS-004 to MIS-005 Recovery and verify | Partial | A follow-up and a retry exist. Transfer questions and showing unresolved uncertainty need review. |
| MAST-001 Mastery model | Partial | Thresholds coded and tested (`mastery.ts`), but not documented for the Product Owner |
| MAST-002 to MAST-004 Assessment, dashboard, results | Exists | A/B check forms, parent dashboard and report (`ResultsScreen`). Only cover the active island. |
| MAST-005 Persistence testing | Partial | Migration tested; `store.ts` untested |
| UX-005 to UX-008, QA-002 to QA-007 | Partial or Missing | No component, end-to-end, accessibility or responsive tests in the repo |

---

## 12. Defects found (provisional)

Severity follows backlog section 9. These move into the QA-004 defect register once QA-004 is authorised. All were
observed on 3 Nov.

| ID | Severity | Where | Steps to reproduce | Expected | Actual |
|---|---|---|---|---|---|
| DEF-001 | Medium (Product Owner call: matches the R1 Fractions-first scope) | `src/topics/index.ts` (`DEFAULT_TOPIC_ID = TOPICS[0]`) | Open `/` with empty storage | The child starts on the island chosen for their year or the start of the map | Every new child starts on Fractions foundations |
| DEF-002 | Medium | `KidHomeScreen.tsx` hero | Start any non-Fractions island, return home | Copy names the current island | "shows me which fraction lessons you already know" on every island |
| DEF-003 | Medium | `KidHomeScreen.tsx` (`brandNew` ignores lesson progress) | Do step 1 of a Decimals lesson, go home | Hero says "carry on" with that lesson | Hero says "Let's find your start! Play the warm-up", while the lesson card says "Step 2 of 4" |
| DEF-004 | Medium | `KidHomeScreen.tsx` | Open home | Other islands are visible or reachable from home | Only the active island is shown. The "World map" card text "and the ones on the way" is out of date. |
| DEF-005 | High (UX-005: no placeholder destinations) | `AppShell.tsx` Lab tab, `LessonStudioScreen.tsx:31` | Be on any island except Fractions, tap Lab | A working lab, or no Lab tab | "This island doesn't have a lab yet." |
| DEF-006 | Low | `KidHomeScreen.tsx` footer | New child, home | "Play today to start a streak" | "Come back tomorrow and start a streak!" |
| DEF-007 | Low | `KidHomeScreen.tsx` floating hero card | No next lesson | The island's own name | Says "Fractions island" whatever the island |
| DEF-008 | Low | `src/components/kid/kidText.ts` | Finish an island that has no lab | No mention of the lab | "…or build in the lab" |
| DEF-009 | Medium | `Progress.tsx:84`, `WorkedExample.tsx:112`, `RecheckScreen.tsx:98` | View a "Passed check" badge, a "Let's do it together" chip, or a recheck notice | A styled badge, chip or panel | `bg-violet-*` and `text-violet` aren't defined tokens, so they render with no colour |
| DEF-010 | Medium | `ParentScreen.tsx:106` (`text-[0.65rem]`, about 10px), `KidHomeScreen.tsx:153` (13px) | Grown-ups overview; home streak row | At least 15px (`DESIGN.md`) | 10px and 13px text |
| DEF-011 | Medium | `KidHomeScreen.tsx` (only link to `/start`) | Move to a second island | That island's warm-up can be offered | Warm-up only reachable by typing the URL |
| DEF-012 | Medium | `ParentScreen`, `JourneyScreen`, `ResultsScreen` | A child works on two islands | A grown-up can see each island | Only the active island is shown, with no picker |
| DEF-013 | Medium | `src/topics/recommend.ts` (`order` restarts in each world) | Finish an island | The next island follows the map | Jumps across worlds by per-world order number |
| DEF-014 | Low | `/practice`, `/lab`, `/start` redirects in `next.config.ts` | Type `/practice` | The current island's practice | Always Fractions (in-app links are fine) |
| DEF-015 | Medium (UX-007 visible focus) | `inputs.tsx:110`, `kit/Input.tsx:59` (`outline-none`) | Tab into a number box | A clear focus ring | Only the border colour changes |
| DEF-016 | Low | `public/preview`, `/sky` and `/crystal` | Visit `/sky` | No public mock-ups | Design mock-ups are public |
| DEF-017 | Low | `README.md`, `src/app/layout.tsx` metadata, `docs/ROADMAP.md` | Read them | They describe the current product | They say "Fractions adventure" and "only island is fractions" |

**Checked and not a defect:** the island map's "Power-up practice" stop. It looked like it pointed at Fractions, but the
screens use island-scoped links. Live check on 3 Nov: `/t/decimals` links to `/t/decimals/practice`.

---

## 13. Decisions recorded on 3 November 2026

These move into the GOV-004 decision log when it is authorised.

| ID | Decision | Reason | Impact | Owner |
|---|---|---|---|---|
| D-001 | The 18 non-Fractions islands stay live as **unaccepted previews**. Each must pass the backlog's gates in its own release (R2–R5). | They are already built and live; hiding them wouldn't improve R1 | R1 acceptance covers Fractions only. Defects on other islands are logged but don't block R1 unless they affect Fractions or shared screens. | Product Owner |
| D-002 | **Preview only.** Nothing merges to `main` or deploys to production unless the Product Owner explicitly asks. | Backlog deployment constraint | Work stays on the branch and its Vercel preview. The live site stays as of `bbf210a`. | Product Owner |
| D-003 | R0 is gated. GOV-001 first, then wait for review. | Backlog section 13 | No other R0 item starts until this audit is accepted | Product Owner |
| D-004 | The home-page issues found on 3 Nov are logged as defects (DEF-001 to DEF-008) and fixed in R1, not R0 | Keep R0 to specification and foundations | They are listed in section 12 | Product Owner |
| D-000 (context) | Production was deployed on 3 Nov (pull requests #2 and #3) at the owner's request, before the backlog arrived | — | It explains R-9 | Product Owner |

---

## 14. Safest path to R1 (Fractions) and later releases

**Keep the existing framework and engine; don't rewrite.**
- The pure engine (`src/engine`), the fraction maths (`src/maths`) and the Fractions island (`src/topics/fractions`)
  already cover most FR, LAB, PRACT and MAST intent.
- The hardening below is additive: new modules, new tests, small changes to the engine.

**R1 hardening, in backlog order:**
1. **Pure maths and validation** (ARCH-002, ARCH-003, QA-001):
   - add fraction operations and mixed-number functions to `src/maths/fraction.ts`;
   - add a runtime `validateQuestion()` used by the island registry and tests;
   - add boundary tests.
2. **Progression** (CUR-002, FR-011):
   - add skill and lesson prerequisites to the lesson and skill types;
   - complete a lesson on evidence (for example, its check answered without a reveal);
   - explain locked states.
3. **Misconceptions** (MIS-003 to MIS-005):
   - start the recovery sequence from a pattern (2 or more matching signals, or one highly specific one);
   - add a transfer question after recovery;
   - keep "possible" wording.
4. **Attempts** (ARCH-005): store the response, duration and per-attempt history in `ItemResult`, as a versioned
   change to `kite-maths:v3` with a migration.
5. **Labs and practice:**
   - drag on the number line (LAB-006);
   - one shared fraction state across lab modes (LAB-001);
   - documented variation rules (PRACT-007);
   - a hint ladder (FR-010);
   - move same-denominator add and subtract into Fractions foundations, or link to it (FR-009).
6. **Quality** (QA-002, QA-003, QA-005, QA-006):
   - component tests (`.tsx` in Vitest);
   - a Playwright end-to-end journey (dashboard → lesson → practice → recovery → assessment) at 390, 768 and 1280px,
     with accessibility checks, run in CI;
   - fix DEF-001 to DEF-015 as R1 defects where they touch Fractions or shared screens.

**How the architecture takes Times Tables (R2) and Mental Maths (R3):**
- **Plug-in points already exist:** the `TopicModule` contract, the island registry, the kit, and question kinds that
  each island registers.
- **Times Tables needs:**
  - fact-level tracking (one skill per fact family, or a per-fact record alongside `ItemResult`);
  - an **MTC-style timed mode**: 25 questions, 6 seconds each, a 3-second gap, clearly labelled as practice;
  - spaced review.
  - Each is a new engine module plus a timed session screen. The existing `times-tables` island stays an unaccepted
    preview until then.
- **Mental Maths needs:**
  - a **strategy-choice** question kind (choose the method, with the reason);
  - separate measures for accuracy, method choice, independence and time, so speed can never hide falling accuracy;
  - a strategy-lesson template (when to use it, why it works, when not to).
  - These fit as a new question kind, new mastery dimensions and a lesson variant.
- **Change that helps every release:** keep React types out of the content contract (`src/topics/types.ts`,
  `kit/define.ts`). Content and its validation then stay pure and testable without the UI.

---

## 15. Proposed next steps (awaiting Product Owner authorisation)

These follow the backlog's sprint order (section 6) and need your OK. Nothing starts before then.

1. **GOV-002, GOV-003, UX-001.**
   - Put the backlog in the repo as the source of truth, with statuses.
   - Build a traceability matrix from requirements to tests.
   - Write an evidence-based benchmark of Atom Learning and times-table apps.
2. **CUR-002, CUR-003, UX-002, UX-003, UX-004, ARCH-001.**
   - Progression and prerequisite model.
   - Lesson template.
   - Tokens, type scale and content-differentiation rules.
   - Architecture doc.
3. **ARCH-002, ARCH-003, QA-001.**
   - Runtime question validation.
   - Pure maths functions.
   - Maths unit tests.
4. **CUR-001, GOV-004, QA-004.**
   - Year 3–6 curriculum map checked against the DfE programme of study.
   - Decision log and change-control rules.
   - Defect register, seeded from section 12.

**QA gate for this item:** the Product Owner accepts this audit and its scope (sprint step 1).
