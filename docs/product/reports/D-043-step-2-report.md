# D-043 step 2 report: a teaching voice, pizza pictures and the topic journey

| | |
|---|---|
| **Decision** | D-043 (12 Nov 2026): a teaching flow, not a page. Step 1 was choosing a voice; the Product Owner chose **Emma**. |
| **Changes** | CH-087 to CH-090 in `DECISIONS.md` |
| **Status** | READY FOR QA. **Nothing is accepted. Not deployed** (D-040 sign-in rule; deployment only on request). |
| **Date** | 12 November 2026 |

## 1. What the Product Owner reported, and what changed

| Reported | Now |
|---|---|
| "The voice reads; it doesn't teach." | Emma (Kokoro-82M, Apache-2.0) speaks scripts written as a teacher teaches one child: a real situation, a question and **time to think**, the common mistake, discovery, the rule, a **"your turn"** and a recap. |
| "The whole page is one long scroll." | **One stage on screen at a time.** Notes moved into a panel. On desktop, each stage is about one screen tall (1.0 to 1.2 screens); on a phone it is 1.5 to 1.7. |
| "The flow is not good for learning." | A **topic journey**: ① Learn → ② Practise → ③ Apply → ④ Check → ⑤ Complete. Stages unlock in order and can be revisited, and progress is saved. |

## 2. The journey (`/t/fractions-2/learn/add-different`, `/t/ratio-algebra/learn/ratio`)

- **Learn.** The player is on the left and "Choose how you want to learn" is on the right.
  - The three cards (Watch, Step through, Try it) show times, and Kip appears beside them.
  - On a phone, the cards come first, in one row.
  - Fractions are taught with **pizzas**:
    - the film shows Sam's ⅓ and Zara's ¼, with "Think!" bubbles during the thinking pauses;
    - Step through recuts both pizzas into twelfths, counts the slices and moves them onto one pizza, with a bar model;
    - in Try it, the child cuts with "pizza cutters" until the slices match, then drags the slices onto one pizza.
- **Practise.** Seven questions, one at a time, at three levels: **Guided** (hints offered), **Build skill** and
  **Challenge**.
  - **Method** and **Why** buttons are to hand.
  - Each question shows its strand tag.
  - It uses the island's own question makers, marking, hints and misconception follow-ups.
  - Answers count as practice, so mastery updates.
- **Apply.** Three real-life problems: ribbons, juice, gardens, pizza and "what is left".
- **Check understanding.** The existing MAST-001 recheck: new questions, no hints, results at the end. The mastery rule
  is unchanged.
- **Complete.**
  - The island's own mastery level (for example "Developing" or "Mastered") and the recent practice score.
  - A **Concept / Application / Reasoning** breakdown, counting answers in this journey that were right first time
    without a hint.
  - Stars earned.
  - Then the next topic. After a wrong check, the button is "Practise the tricky bit" instead.
- **Every stage:** a breadcrumb, a Year badge, a journey bar, a Notes panel, and one button that leads on.

**New questions for this:**
- fractions real-life problems (application);
- "Ben says ⅓ + ¼ = 2/7. Why is he wrong?" (reasoning).

Both are checked against a BigInt oracle. Ratio has concept and application questions; a ratio reasoning question is
still to come.

## 3. Checks (developer evidence, not independent QA)

**Commands:** `npm test` (all passing), `npm run lint`, typegen with `tsc`, and `npm run build`.

**New tests:**
- journey stage rules and the strand summary;
- saving and loading journeys (older saves load without them);
- the teaching arc of the script (it asks before it tells, with a thinking pause and a turn for the child);
- the new question makers;
- the journey screen: the bar and locks, Learn unlocking Practise, levels with Method and Why, a counted answer, Notes,
  the check starting, Complete reading the mastery engine, and resuming.

**Browser:** `verification/journey.cjs`, on a production build at 390, 768 and 1280px:
- `/explain` redirects to the journey;
- the film is 103 s, Emma's voice is fetched while Step through plays, and Try it finishes;
- the whole journey was done by pointer, answering as a child might. Hints, answer reveals and misconception follow-ups
  were all used;
- Check gives a result, and Complete shows the level and the strands;
- a reload resumes the journey;
- 0 axe violations at every stage, and 0 console errors;
- no sideways scroll, 320px included;
- reduced motion works.

**Ratio 3D regression:** `ratio-3d.cjs` passes. WebGL works, the chapters and drag work, Try it works by keyboard,
the Notes tabs work, it runs at 59 fps with 4× CPU throttling, and the home page loads no 3D code.

**Fixed after the browser check:**
- On a phone, the journey button stacked over the question's own Check bar.
- A nested landmark, and a skipped heading level.
- A washed-out film poster.
- The Method steps had no numbers.

## 4. Limits

- **Voice:** nobody has listened to Emma except the Product Owner's sample choice. A speech-recognition check heard
  "twelfths" and "sevenths" correctly.
- **Real-world testing:** no screen reader, real devices or children.
- **Check length:** the Check stage is the existing 2-question recheck. The concept images showed about 8 questions;
  making it longer would change MAST-001, which needs a Product Owner decision.
- **Next (step 3):** the kid pages in the image style: navigation (Home, Topics, Practice, Tests, Progress), Home with
  Continue Learning, a Topics grid, and Progress.
