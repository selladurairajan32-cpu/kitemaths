# ANIM-001: Animated explanations (pattern and pilot)

| | |
|---|---|
| **Decisions** | D-035 (pilot authorised on Long multiplication) and D-036 (version 2: animation that explains, base-ten blocks, one story in three chapters) |
| **Status** | Pilot v2 built, READY FOR QA. Not accepted. Not deployed to production; the branch preview updates on each push. |
| **Requirements served** | UX-006 (motion language), CUR-002 AC2 (concrete to abstract), MIS-004 AC1 (a different representation after a slip), UX-007 (accessibility). The pilot is not a backlog item of its own. |
| **Pilot** | Long multiplication (`multiply-divide`, lesson `long`): step 2 "Watch how it works" and step 3 "Try it yourself" |

## 1. Why version 2

The Product Owner found that version 1 didn't explain anything:
- **Movement:** it was mostly fades and slides, and long captions did the explaining.
- **Screen:** there were three tabs, a four-button player, step dots, a slider and a try-it all on one page.

Version 2 follows one rule: **each movement is the reason.** Ten ones *become* a ten. Ten rods *become* a hundred. The
digits *step* one place left. Each part of the rectangle *is* a part of the sum.

## 2. What the child sees

**Watch how it works: one story, three chapters**

The child presses one big **Next** button. **Watch again** and **Back** are smaller. Kip says one short line (12 words
or fewer), and the child can have it read aloud.

| Chapter | Steps (23 × 14) | The child's move |
|---|---|---|
| **Blocks** (concrete) | One row of 23: 2 tens rods and 3 ones cubes · the row stamps down 14 times · the rows split into 10 and 4 · in the 10 rows, each column of ten rods joins into a hundred and each column of ten cubes into a ten (230) · everything sorted into hundreds, tens and ones, where 12 tens become 1 hundred and 2 tens (322) | **Swap 10 ones for a ten**: the 12 cubes wobble ("too many!"). The child taps them, or the button, and ten of them slide into a line and join into a rod: 9 tens and 2 ones = 92. |
| **Picture** (area model) | The blocks become a 23 × 14 rectangle of squares, the same size, so it is visibly the same thing · four pieces drift apart and fill while their numbers count up: 200, 30, 80, 12 · each row's pieces join and their numbers add: 230 and 92 | **Cut off 10 rows**: the child drags the scissors, or uses the arrow keys. A wrong cut gets a nudge and a "Cut at 10 rows for me" button. Then 23 is cut into 20 \| 3 for them. |
| **Numbers** (column method) | Set out in H, T, O columns · 3 × 4: twelve ones appear as dots, ten of them bundle and fly up as the carried 1, the other 2 become the digit · 2 × 4 = 8 tens, and the carried 1 drops in to make 9 · add the rows, with the carry flying into the hundreds | **Fill the gap**: for × 10, 23's digits step one place left and leave the ones place empty. The child drags the 0 into the gap, or taps it. |

- **Colour links the chapters.** Everything for "× 4" is orange: the 4 rows of blocks, the bottom row of the
  rectangle, the 92 row and its carry. Everything for "× 10" is blue.
- **Chapter strip.** The strip at the top shows where the child is. Tapping a chapter is how to see it another way.
- **Try it yourself** is a separate lesson step. The child works out 34 × 12 one part at a time, in big type, with Kip's
  specific nudge after a slip. **Show me again** replays the matching step for 23 × 14:
  - a missing 0 replays the digits stepping left;
  - a row slip replays the carry;
  - a sum slip replays adding the rows.
- **In practice,** the tens-place slip on a long-multiplication question shows the × 10 step under the feedback.
- The lesson's existing worked example and checks are unchanged.

## 3. How it is built (reusable)

| Part | File | Job |
|---|---|---|
| Stage | `src/components/explain/Stage.tsx` | Chapter strip, scene, Kip's line (`KipSays`, read aloud), one big Next, Watch again and Back. A step with `task` holds Next until the scene reports the child's move, then Kip says `doneSay` and focus moves to Next. Also `Replay`: one step on its own, with its move already made. |
| Timeline | `src/components/explain/timeline.ts` | `usePhases`: a step's beats, one after another. `useInstant`: reduced motion (or animations off in tests) shows the last beat at once. |
| Counter | `src/components/explain/CountUp.tsx` | A number that rolls up to its value, in HTML or inside SVG text. |
| Base-ten blocks | `src/components/explain/BaseTen.tsx` | Cubes, rods (across or upright), flats, the ring that snaps in when ten join into one, `Arrive` and `Chip` |
| Try it | `src/components/explain/TryIt.tsx` | One part at a time, with a specific nudge and "Show me again". |
| Motion tokens and stepper | `motionTokens.ts`, `stepper.ts` | Shared spring, appear and stagger values; step navigation. |
| Kit registry | `src/topics/kit/explainers.tsx` | Maps a lab step's `explainer`, or a misconception id, to a component loaded only when shown (`next/dynamic`). Island content imports no UI. |
| Maths model | `src/maths/long-multiplication.ts` | Long multiplication (parts, cells, rows, carries, sum) plus `rowsAsBlocks`, `regroup` and `blocksValue`. Every block, carry and caption comes from it, and it uses checked arithmetic. |
| Pilot scenes | `src/topics/multiply-divide/explain/` | `BlocksScene`, `AreaScene` and `ColumnScene`; `captions.ts` (Kip's lines, made from the model); `LongMultiplicationLab.tsx` (watch step, try step, remedy) |

**No new dependency.** It uses `motion` 14.9.0, which was already installed, plus SVG, CSS and React.

**Scope.** The scenes draw a 2-digit number times 11 to 19 where the ones make a carry. Other numbers are refused with
`RangeError`, which the tests check.

## 4. Rules every new scene must follow

1. **The movement is the reason.** It must show something joining, splitting, regrouping or stepping. No decorative
   movement, and no fade used as the explanation.
2. **One idea per step, one button.** At most about 12 words from Kip; the numbers go in the picture.
3. **Each chapter has a move the child makes.** It needs a pointer way, a keyboard way and a button.
4. **Movement only after a press.** Reduced motion shows each step's end state at once (`useInstant`, `usePhases`).
5. **All numbers come from one pure maths model,** tested against an independent oracle.
6. **Use design tokens only:** no hex colours, and no `text-[…]` sizes (SVG text uses `fontSize`).
7. **Readable at 390px.** Labels sit on or under the picture, never in wide margins.

## 5. Adding an explainer to another lesson

1. Put the maths in `src/maths`, with tests.
2. Write the scenes, each taking `SceneProps` (`step`, `done`, `onTaskDone`). Build each step's beats with `usePhases`.
3. Write the chapter steps (`say`, `task`, `doneSay`) from the model.
4. Make the lab components and register them in `src/topics/kit/explainers.tsx`.
5. Add `{ type: "lab", explainer, numbers, challenges }` steps to the lesson.
6. Add tests and test cases, and adapt `docs/product/verification/anim-pilot.cjs`.

## 6. Recommended rollout (for the Product Owner to decide)

1. **Short multiplication and division** (same island): the blocks and carries are reused as they are.
2. **Place value:** exchanging, and × or ÷ by 10, 100 and 1,000. The place-value stepping from Chapter 3 is reused.
3. **Fractions:** equivalent fractions (a bar cut again, the pieces lining up) and adding.
4. **Times tables:** arrays built row by row (the stamping from Chapter 1).
5. **Area and perimeter.**
6. **The other islands,** in order of how much 11+ papers use them. This order needs the format research in D-034.

## 7. Evidence and limits

- **Tests:**
  - `src/maths/long-multiplication.test.ts`: BigInt and hand-worked oracles, including the blocks and regrouping.
  - `src/components/explain/timeline.test.tsx` and `stepper.test.ts`.
  - `src/topics/multiply-divide/explain/LongMultiplicationLab.test.tsx`: chapters, word limits, each task, keyboard
    use, focus after a task, try-it feedback and Show me again, the remedy, and axe-core in jsdom.
- **Browser run:** `docs/product/verification/anim-pilot.cjs`, with results in `verification/results/anim-pilot/`.
  - All 14 steps at 390, 768 and 1280px, with each task done by real pointer drags: the scissors and the 0 tile.
  - 92 screenshots, with "moving" frames caught mid-animation.
  - Axe-core found no violations at any width.
  - A keyboard-only run finished all 14 steps.
  - With reduced motion, the end state showed at once, with no running animations.
  - No console errors.
- **Limits:**
  - These are developer runs only. No children, screen reader or real devices were used.
  - The area-model pieces aren't to scale: the 3-wide strip is drawn wider so its number fits.
  - Show me again replays the watched numbers (23 × 14), not the numbers being practised.
