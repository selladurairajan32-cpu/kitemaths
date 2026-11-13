# D-060: the lesson canvas pilot

13 November 2026. Developer report. Status: **READY FOR QA, not accepted.** Deployed to production on 13 November at the Product Owner's request, to try with a child (D-061, CH-115).

The Product Owner asked for the learning experience to be rethought from the ground up, starting with one complete
topic, so that the design can be judged on whether it improves learning. This is that pilot: **adding fractions with
different denominators** (`/t/fractions-2/learn/add-different`).

## What was wrong with the lesson screen

On a 1280 × 900 screen the older lesson gave the mathematics about a quarter of the space. Around it were the site
navigation, a breadcrumb, a title row, a five-stage bar, three mode cards, a Key idea panel and a strip of three more
cards. A child had to choose how to learn before seeing any maths, and each way to learn restarted the explanation.

## Design direction

1. **The concept is the screen.** No site navigation, side panels or cards. A thin trail of six phases, the maths, and
   one line of guidance with one button.
2. **Do before being told.** The child guesses, then acts on a model that answers back. Explanation comes third.
3. **One model all the way through.** Fraction bars appear in Discover, are cut by hand in Explore, explain the steps
   in Understand and are a tool beside the questions in Practise.
4. **Every movement shows maths.** Cut lines draw when a bar is cut; pieces drop into the joined bar one at a time, as
   they are counted. Nothing moves for decoration. Reduced motion jumps to the end state.
5. **Help fades by evidence.** Support is given, then offered, and returns after a wrong answer.
6. **Say what the answers show, in plain words.** No scores dressed up as certainty and no labels for the child.

It uses the existing tokens, type scale, data colours (blue and coral) and motion timings. No new dependency: SVG and
Motion. 3D was not used, because bars explain this better flat.

## The six phases

| Phase | What the child does | Why |
|---|---|---|
| Discover | Guesses 1/3 + 1/4 before any teaching, then sees the guess beside the real amount | The common wrong guess, 2/7, is visibly shorter than 1/3 alone. The child sees it cannot be right, instead of being told |
| Explore | Cuts two bars until the pieces match, then joins them; a second pair follows | The idea of a common denominator is found by hand. Guidance says where to look first and gives the cuts only after seven tries |
| Understand | Four steps, each as a picture (bars), a story (minutes on a clock) or numbers | Changing the view keeps the step. One question on a new fraction must be answered to go on |
| Practise | The island's seven questions, in three levels | Bars open at the first level, offered at the others, and open again after a wrong answer. Two clean answers in a row pass over the rest of that level's routine questions; the reasoning question and the hardest level are always asked |
| Apply | The island's three real-life problems | Unfamiliar wording |
| Prove it | The unchanged MAST-001 check: new questions, no hints | Independent evidence |
| Summary | What the answers show for the idea, real life, explaining and working alone, with the first guess to look back on | Honest and specific |

## What is unchanged

- Questions, marking, hints, misconception diagnosis and follow-up questions, stars, mastery rules and the check.
- Saved progress: the six phases sit on the five saved journey stages, so a journey already started carries on in the
  same place. Three optional fields were added to the saved journey (`learn`, `learnReached`, `guess`).
- The other five journeys and every other screen.

## Reusing it

A concept joins the canvas by supplying a `CanvasLesson` (`components/canvas/lesson.ts`: Discover, Explore, Understand,
an optional hands-on aid and a look-back sentence), an entry in `kit/canvasLessons.tsx` and `canvas: true` in
`kit/journeys.ts`. The frame, trail, dock, view switch, question phases and summary are shared.

## Evidence (developer, not QA)

- `npm test`, `npm run lint`, typecheck and `npm run build` pass.
- 17 new automated cases (TC-UX-006.1.66 to 1.82): phase rules, resuming an older save, the pacing rule, and the lesson
  walked in jsdom.
- `verification/lesson-canvas.cjs`: the whole lesson in Chromium at 1280 and 390px, answering badly on purpose. Both
  pass: no site navigation, no page errors, no sideways scroll, ending on the summary. Screenshots in
  `verification/results/d060-canvas/`.

## Not done, and limits

- **No child has used it.** Whether it improves learning is not known. That needs children, ideally a few who find
  fractions hard, watched without help.
- No screen reader or real-device run. Bars have text alternatives and every control is a button, but this is untested
  with assistive technology.
- The film and Emma's voice are not part of this lesson. They remain for the other journeys.
- Spaced review is not scheduled by the engine for topic skills, so the summary only suggests coming back.
- The check is two questions (MAST-001), which is thin evidence for "can do this"; lengthening it changes MAST-001 and
  needs a decision.
- An existing question maker (`f2-add-diff`) shows a bar with the answer already shaded. It was not changed here.
- Three older browser scripts (`journey.cjs`, `journey-look.cjs`, `journey-e2e.cjs`) expect the older layout for this
  concept.
- Home, Topics, Progress, the parent pages and the other lessons are not redesigned. That is the next step if the
  pilot is judged to work.
