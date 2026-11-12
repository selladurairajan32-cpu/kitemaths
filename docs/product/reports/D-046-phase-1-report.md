# D-046 phase 1 report: the two journeys in the sky-and-glass look

| | |
|---|---|
| **Decision** | D-046 (12 Nov 2026): fine-tune the two topic journeys first, in the look and feel of the concept images (similar, not copied). |
| **Changes** | CH-095 (look and feel), CH-096 (checks) in `DECISIONS.md` |
| **Status** | READY FOR QA. **Nothing is accepted.** Not deployed. |
| **Date** | 12 November 2026 |

## 1. What the Product Owner decided along the way

- A free 3D child as the guide (Microsoft Fluent 3D, MIT), with Kip the kite kept as the logo and helper.
- The reward is called **XP**: the same numbers and rules as stars.
- The menu stays Home, Topics, Practice, Tests, Progress.
- Journeys first; the same look on Home, Topics, Practice, Tests and Progress comes next (phase 2).
- **Pizzas stay 2D.** A photo-like and then a toy-style 3D pizza were started and dropped at the Product Owner's
  request ("2D what we showed before itself is fine"): no 3D pizza assets were kept, and the films are unchanged.

## 2. What changed for the child

| Where | Now |
|---|---|
| Every kid page | A soft sky with clouds and green hills; a floating glass header with pill tabs, an **XP pill**, the streak, and the avatar wearing the level as a ring and a number. Glass bottom bar on phones. |
| Journey header | Breadcrumb (Home › Topics › topic › concept), title and year, **Reduced motion** switch (stops animations and transitions in the app, as the device setting does) and **Notes**. |
| Journey bar | Learn, Practise, Apply, Check, Complete, each with a 3D picture, joined by lines that turn green; ticks when done, locks when not open yet. |
| Learn | Three big cards across the top (Watch, Step through, Try it) with 3D pictures and times; the lesson on glass; the **Key idea** beside it (words and a bar model). Watch: the video with **Chapters** beside it (times, the one playing marked) and a **Captions** button. Under it: the guide with a speech bubble, **Up next**, **Watch out** (the common mistake), **Key notes**, and a yellow **Practise this**. |
| Practise and Apply | Numbered circles that tick as questions are done, the question on glass, Method and Why in a side panel with the guide. |
| Check | The same MAST-001 recheck, on glass, with **How we check your understanding** (Concept, Application, Reasoning) beside it. |
| Complete | Trophy and sparkles, a ring with the recent practice score, the level badge, XP earned, bars for Concept, Application and Reasoning, and yellow **Next topic**. |

Behaviour, marking, mastery and the questions are unchanged. Screenshots: `verification/results/d046-look/`
(each stage at 1280 and 390px, both concepts, Home).

## 3. A rule that changed and needs confirming

UX-002 (accepted) included a guard that the stylesheet has **no gradients** and no frosted glass. The sky and the
glass panels of the concept images need both. The guard is **narrowed, not removed**: violet is still banned, and
gradients and frosted glass may appear only in the named `.sky-*` and `.glass*` styles; no component may add its own
(`src/design.test.ts`). `docs/DESIGN.md` says the same. **Please confirm this change to an accepted rule.**

## 4. Evidence (developer evidence, not QA)

- `npm test` (640 tests, 71 files), `npm run lint`, type check and `npm run build` pass. New test file
  `src/topics/kit/journeys.test.ts` (the Key idea numbers against hand-worked answers); the narrowed palette test was
  renamed in `traceability/test-cases.csv`.
- Browser checks on a production build (results in `verification/results/`):
  - `d046-journey/`: the whole fractions journey at 390, 768 and 1280px by pointer: **0 axe violations at every
    stage, 0 console errors, no sideways scroll** (320px too); film, Step through voice and Try it work; resume and
    reduced motion work. The first run found 3 contrast failures and a landmark problem; both fixed (CH-096).
  - `d046-kid-pages/`: Home, Topics, Practice, Tests, Progress at 320 to 1280px: 0 axe violations, 0 errors.
  - `d046-ratio/`: the ratio journey's WebGL stage draws; 0 axe violations.
- Not checked: screen readers, real devices, children.

## 5. Questions for the Product Owner

1. Confirm the narrowed palette rule (section 3).
2. The answer box's **Check** button inside questions is still the app's blue one (it is shared by every practice
   screen). Make it the yellow "Check answer" of the concept images everywhere, in phase 2?
3. Still open: lengthen the Check stage (about 8 questions in the images, 2 today; changes MAST-001)? A reasoning
   question for ratio?

## 6. Next

Phase 2: the same look on Home (Continue Learning with the guide), Topics, Practice, Tests and Progress.
