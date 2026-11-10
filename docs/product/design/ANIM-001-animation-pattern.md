# ANIM-001: Animated explanations (pattern and pilot)

| | |
|---|---|
| **Decision** | D-035 (Product Owner brief "World-class interactive maths animations", 10 Nov 2026; pilot lesson chosen by the Product Owner: Multiply & divide, written method) |
| **Status** | Pilot built, READY FOR QA. Not accepted. Not deployed. |
| **Requirements served** | UX-006 (motion language), CUR-002 AC2 (concrete to abstract), MIS-004 AC1 (a different representation after a slip), UX-007 (accessibility). The pilot is not a backlog item of its own. |
| **Pilot** | Long multiplication (`multiply-divide`, lesson `long`, step 2 "See it three ways") |

## 1. What every animated explanation gives a child

| Mode | In the pilot |
|---|---|
| **Three ways to see it**, switchable at any time | **In real life**: 14 rows of 23 chairs in a hall, split into 10 rows and 4 rows. **Picture it**: an area model, 20 + 3 by 10 + 4. **Step by step**: the column method with carries and the placeholder zero. The order is concrete, pictorial, abstract. |
| **Watch and learn** | Each method plays as 5 short steps with a caption. |
| **Back, Play or Pause, Next step, Watch again** | The child controls every step. Nothing moves until they press a button. Arrow keys move between steps. |
| **Try it yourself** | A slider splits the 14 rows any way the child likes, showing the total is always 322. Then the child works out 34 × 12 row by row. |
| **Explain it differently** | Offered after every wrong try-it answer; it switches to the next method and goes back to step 1. In practice, the tens-place slip on a long-multiplication question shows the same three methods under the feedback. |
| **Practise** | The lesson's existing checks, unchanged. |

**The link between the methods is colour.** Everything for "× 4" is orange in all three methods: the chairs, the
area-model row and the written row. Everything for "× 10" is blue. That colour link is what shows why the column
method works.

## 2. How it is built (reusable, topic-independent)

| Part | File | Job |
|---|---|---|
| Motion tokens | `src/components/explain/motionTokens.ts` | One spring, one appear timing, one stagger and one step time for every topic. `motionOr` removes movement when reduced motion is on. |
| Stepper | `src/components/explain/stepper.ts` | Pure reducer for step and Play state, unit-tested. |
| Player | `src/components/explain/ExplainerPlayer.tsx` | Scene, caption (announced through `aria-live`), step dots and controls. Every control has a visible text label and a touch target of at least 44px. |
| Method tabs | `src/components/explain/MethodSwitcher.tsx` | An ARIA tablist; arrows, Home and End move between tabs. |
| Try it | `src/components/explain/TryIt.tsx` | Parts worked one at a time, with feedback specific to known slips and a hint otherwise. |
| Explainer | `src/components/explain/Explainer.tsx` | Puts the parts together. A topic supplies only its methods (captions and scenes) and its try-it parts. |
| Kit registry | `src/topics/kit/explainers.tsx` | Maps a lab step's `explainer` name, or a misconception id, to a component loaded only when shown (`next/dynamic`). Island content stays free of UI imports, so the architecture rules are unchanged. |
| Maths model | `src/maths/long-multiplication.ts` | Gives the parts, cells, rows, carries and sum. Every scene and caption reads from it, so the pictures can't disagree with the maths. It uses checked arithmetic (ARCH-003). |
| Pilot scenes | `src/topics/multiply-divide/explain/` | `scenes.tsx` (three SVG scenes), `captions.ts` (words made from the model), `SplitExplorer.tsx`, `LongMultiplicationLab.tsx` |

**No new dependency.** It uses `motion` 14.9.0, which was already installed, plus SVG, CSS and React. The brief mentions
Motion's "AI Kit"; I didn't add it or check it, because the pilot needed nothing beyond the installed library.

## 3. Rules every new scene must follow

1. **Each movement shows something about the maths:** a split, a regroup, a carry, a zero moving into place. No
   decorative movement, and no fade used as the explanation.
2. **Movement happens only when the child changes step or method,** never on an ordinary re-render.
3. **Reduced motion means the same content, shown at once.** Use `motionOr(reduce, …)` and `initial={reduce ? false : …}`.
4. **Every step has a caption that explains it without the picture.** The caption is the accessible version.
5. **All numbers come from one pure maths model,** tested against an independent oracle (BigInt or hand-worked tables).
6. **Use design tokens only:** no hex colours and no one-off `text-[…]` sizes. Size SVG text in user units with
   `fontSize`, so it scales with the drawing.
7. **Every drag has a keyboard and button equivalent.** For example, a native range input with − and + buttons.
8. **Keep it readable on a phone at 390px:** labels sit on the picture, not in wide margins.

## 4. Adding an explainer to another lesson

1. Put the maths in a pure model under `src/maths`, with tests.
2. Write `captions.ts` (one caption per step for each method) and the scenes, each taking `{ step }`.
3. Make a lab component that returns `<Explainer methods=… tryIt=… />`, and register it in `src/topics/kit/explainers.tsx`.
4. Add a lab step to the lesson: `{ type: "lab", explainer, numbers, challenges }`.
5. Add tests and test cases, then run `docs/product/verification/anim-pilot.cjs`, adapted to the new lesson.

## 5. Recommended rollout (for the Product Owner to decide)

Each step reuses the framework. Only the scenes and captions are new.

1. **Short multiplication and division** (same island): grouping in a real context, place-value counters, then the
   short method.
2. **Fractions:** equivalent fractions (pizza cut again, bars lining up, × the same number top and bottom) and
   adding (chocolate pieces, bars, numerators added). The Fractions island already has a lab and models to reuse.
3. **Times tables:** arrays and number-line jumps (TT-002, TT-007).
4. **Place value:** exchanging, and × or ÷ by 10, 100 and 1,000 (digits sliding).
5. **Area and perimeter.**
6. **The other islands,** in order of how much 11+ papers lean on them (this order needs the 11+ format research in
   D-034).

## 6. Evidence and limits

- **Tests:**
  - `src/maths/long-multiplication.test.ts`: BigInt and hand-worked oracles across hundreds of pairs.
  - `src/components/explain/stepper.test.ts`.
  - `src/topics/multiply-divide/explain/LongMultiplicationLab.test.tsx`: captions, wiring, controls, keyboard,
    try-it feedback, completion, the remedy, and axe-core in jsdom without colour contrast.
- **Browser run:** `docs/product/verification/anim-pilot.cjs`, with results in `verification/results/anim-pilot/`.
  - 58 screenshots at 390, 768 and 1280px: every method at every step, try-it feedback and done, and area-model
    frames.
  - Axe-core in Chromium found no violations at any width.
  - A keyboard-only run completed the lab.
  - With reduced motion, the final state showed at once, with no running animations.
  - No console errors.
- **Limits:**
  - These are developer runs only. No children, screen reader or real devices were used.
  - The pictures are drawn to read clearly, not to scale; the area model says so on screen.
  - The practice remedy uses the pilot's numbers (23 × 14), not the numbers of the question answered.
