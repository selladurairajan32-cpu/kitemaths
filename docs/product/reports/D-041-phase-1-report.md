# D-041 Phase 1 report: three ways to learn every explanation

| | |
|---|---|
| **Decision** | D-041 (12 Nov 2026): every topic explanation offers three ways to learn (Watch, Step through, Try it), and the child chooses. Free tools and free tiers only. The redesign is replanned around it (Phases 1 to 5). |
| **Changes** | CH-082 to CH-085 in `DECISIONS.md` |
| **Status** | READY FOR QA. **Nothing is accepted. Not deployed:** production waits until everything, including sign-in, works end to end (D-040, D-041). |
| **Date** | 12 November 2026 |

## 1. What was built

**One page per concept, three ways in.** Three big cards sit at the top of the page:

| Way | What the child gets |
|---|---|
| **Watch** | A narrated film of about a minute. Captions are on by default. Chapter buttons jump to a part, and a transcript follows the film. Nothing plays until the child presses play. |
| **Step through** | An animated picture for each step, with its caption and a recorded voice. It has playback controls and a chapter checkpoint after each chapter. The voice can be switched off, and a Step view shows all the steps at once. |
| **Try it** | A hands-on activity, on springs, with a keyboard or tap equivalent for every move. |

- **Remembered choice:** the page opens the child's last choice next time. A link can open a chosen way (`#watch`,
  `#step`, `#try`).
- **Kip's offer:** after two wrong answers in one way, Kip offers the others.
- **Same ending:** every way ends with the same key notes, takeaway and island question, marked by the island.

**Pilot: adding fractions with different denominators** (`/t/fractions-2/explain/add-different`).
- **Watch:** the film shows the common 2/7 mistake, two pictures, cutting into twelfths, counting, and 7/12.
- **Step through:** the same story in 2.5D, in two chapters. The checkpoints ask "one third is how many twelfths?" and
  "1/2 + 1/3 is how many sixths?".
- **Try it:** the child cuts the third into rows and the quarter into columns until the pieces match, then drags the
  seven twelfths into one whole.

**A new lesson behind it.** fractions-2 *Different denominators* covers adding and subtracting when neither denominator
is a multiple of the other (for example 1/3 + 1/4 and 3/4 − 1/6).
- It has five question makers, including a stretch word problem.
- It uses the two existing misconceptions: adding the bottoms, and adding before the pieces match.
- Y6.FRAC.3 was mapped *partial*, covered only by `add-related`. It now names both skills but **stays partial**,
  because mixed numbers in addition and subtraction are still not taught.

**Ratio, retrofitted.** The ratio page uses the same shell:
- Watch is a new film;
- Step through is the existing 3D story, now voiced;
- Try it is the existing sweets activity.

Step by step, the real-life example and the key notes moved to a "More about ratio" section.

**One script per concept.** The step captions, the film cues and the voice lines all come from one TypeScript script
(`engine/explainScript.ts`), so the wording never disagrees between the three ways. A check confirms that every line has
time to be spoken.

## 2. The film and voice pipeline (free)

`tools/films/` (see its README):
1. A test exports each script.
2. `build.py` renders the Manim scene, timed by that script.
3. It records every line with a Piper neural voice and refuses any line that is longer than its time.
4. It mixes the voice onto the film and writes the film, its poster and one voice file per step.

None of this runs in CI or ships in the app bundle. A test fails if any film, poster or step voice is missing.

| Concept | Film | Size | Step voices |
|---|---|---|---|
| Adding fractions with different denominators | 59.2 s | 2.1 MB | 7 |
| Ratio | 56.5 s | 2.2 MB | 9 |

**Voices.** Only voices whose training data allows commercial use are included:

| Voice | Licence | Note |
|---|---|---|
| Cori | Public domain recordings | The default |
| Alba | CC BY 4.0 | Credit the dataset |
| A VCTK male voice | CC BY 4.0 | Credit the dataset |

Samples of each are written by `build.py --samples`, for the Product Owner to choose from. Voices with non-commercial,
share-alike or unclear terms are excluded.

**Hosting.** Films are served from `public/films` for now. The player reads `NEXT_PUBLIC_FILMS_BASE_URL`, so they can
move to a free storage bucket later without code changes.

## 3. Checks (developer evidence, not independent QA)

**The four CI commands:**
- `npm test`;
- `npm run lint`;
- typegen with `tsc`;
- `npm run build`.

**New unit tests:**
- the script checks;
- the new lesson's answers against a BigInt oracle;
- the pilot's numbers;
- every script exported and its media present.

**New component tests:** the three ways, the remembered choice, the voice switch, Kip's offer, Try it by keyboard, and
the final question.

**Browser:** `verification/explain-modes.cjs` on a production build, at 390, 768 and 1280px (results in
`verification/results/d041-p1/`):
- **Watch:** the film loads (59.2 s, 8 captions showing, no autoplay). A chapter button jumps to the right place and
  plays.
- **Step through:** the stage changes between beats, voices are fetched while playing, and both checkpoints pass.
- **Try it:** the pieces match by keyboard; four pieces were placed by real pointer drags and the rest by tap.
- **Remembered choice:** the choice persists after a reload.
- **Accessibility and errors:** 0 axe violations in every way, and 0 console errors.
- **Layout:** no sideways scroll at any width, including 320px.
- **Reduced motion:** the stage still draws, and Try it finishes by tap.
- **Performance:** 49 frames a second while the pieces fly together at phone width with 4× CPU throttling.
- **Ratio film:** 56.5 s with 8 captions.

**Ratio 3D regression:** `ratio-3d.cjs` (results in `results/d041-ratio/`):
- WebGL draws and the table turns by drag;
- all chapters pass;
- Try it works by keyboard;
- 0 axe violations;
- reduced motion shows the 2.5D picture;
- 60 fps;
- the home page loads no 3D code.

**Corrections from the checks:**
- **Spoken signs:** the pipeline showed that the time check did not count signs said aloud (plus, equals, divided by,
  to). They are now counted, and the ratio beats were lengthened to fit.
- **Try it accessibility:** the browser check found a fraction denominator on the green message at 4.31:1, and a label
  on an element with no role. The message is now in words, and the tray is a labelled group.
- **Try it layout:** the empty tray is now hidden once every piece is placed.

## 4. Limits and what's next

- **Not tested with real people or devices:** no screen reader, real devices or children; nobody has listened to the
  voices except through automated duration and level checks.
- **Voice choice:** the voice is the Product Owner's choice. Cori is the default until then. Changing it means one
  `build.py` run per concept.
- **Mixed numbers:** these are still not taught, so Y6.FRAC.3 stays partial.
- **Next, per the replan:**
  - Phase 2: kid pages in the new style, showing which ways each topic has;
  - Phase 3: the ten hardest concepts, in batches of four;
  - Phase 4: the public homepage and the dashboards;
  - Phase 5: Supabase accounts, then one production launch.
