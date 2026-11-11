# D-037 build report: UI clarity, lesson depth and 11+ coverage

| | |
|---|---|
| **Decision** | D-037 (10 Nov 2026): the Product Owner said "Go ahead and do all": UI clarity, then depth on all islands (11+-heavy ones first), then 11+ coverage with format research from official sources, then deploy to production. |
| **Changes** | CH-062 to CH-068 in `DECISIONS.md` |
| **Branch** | `claude/practical-knuth-9126wx` (commits `09750df` to `e1bb43a`) |
| **Status** | Every item touched stays **READY FOR QA** (UX-003 stays READY FOR RETEST). **Nothing is accepted.** Deploying is not acceptance. |
| **Date** | 11 November 2026 |

## 1. What was built

### Phase A: UI clarity (CH-062)
- **Readability:**
  - darker secondary text (`ink-2`, `muted`);
  - stronger card edges and shadows;
  - body weight 600;
  - the UX-004 §2.3 contrast pairs were recomputed.
- **Home:** one "Continue" button, one Kip message, a single stats strip, "Up next", and small links to everything else.
- **Island map:** stops show a title, status and one button.
- **One name for each thing:** [`design/glossary.md`](../design/glossary.md) (Kites, Challenge, Mental maths).
- **Shorter child copy:** the full no-prediction statement moved under "For grown-ups".
- **Visible labels:** "Exit" and "Grown-ups" now show as text. The parent navigation stays one row at 200% text.
- **Bug fix:** a raw `{2/7}` caption now draws as a fraction.

### Phase B: lesson depth on every island (CH-063, CH-064)
- **Fading hints:** each question has at least two hints, shown one at a time with "Another hint".
- **Every kit lesson** has:
  - a picture before its first check;
  - a "watch me" worked example;
  - a "together" example whose blank has a misconception trap;
  - at least 40 words of explanation.
- **Every skill** has at least three question makers, one of them a stretch question.
- **Guards:**
  - `src/topics/kit/depth.test.ts` enforces all of this;
  - its not-yet list is empty and may not grow;
  - the single-form ratchet went from 48 to 6, and all 6 are mock-exam skills.

### Phase C: 11+ coverage (CH-065 to CH-068)

**Format research** used official pages only, read on 10 Nov 2026 and quoted in
[`exams/evidence/official-sources-2026-11-10.md`](../exams/evidence/official-sources-2026-11-10.md). Four profiles were
added; everything a page doesn't state is **unknown**:

| Profile | Verified facts |
|---|---|
| ISEB | multiple choice, online; mathematics 40 minutes |
| GL Assessment | multiple-choice layout |
| CSSE | English and Mathematics; mathematics 60 minutes |
| SEAG | two papers, English (or Gaeilge) and Mathematics |

- **Unknown for every test:** calculators.
- **No profile:** CEM (its official page couldn't be read) and AQE.

**Mock formats:** all three are practice formats, never claimed as a test's own:
- a 5-option answer sheet, lettered (A) to (E);
- two-part written questions that share a story, 1 mark each;
- up to 4 short timed sections, each with its own clock and no going back.

The test selector shows each fact with its source and date.

**Missing KS2 topics:** 18 new skills, each with a lesson in the Phase B shape.

| Island | New skills |
|---|---|
| Place value | Roman numerals |
| Multiply and divide | long division, prime numbers, square and cube numbers, order of operations |
| Fractions 2 | fraction × fraction, fraction ÷ whole number |
| **Measures** (new island) | converting units, miles and km, volume of cuboids, speed (labelled optional 11+ extension) |
| Shapes and angles | symmetry, nets, parts of a circle, estimating angles |
| Charts and data | pie charts, mode/median/range and probability (both labelled optional 11+ extensions) |

- **New pure maths:** Roman numerals and primes, tested against hand-worked tables.
- **New kit pictures:** pie chart, cuboid, net, symmetry grid and circle.

**Curriculum coverage** (CUR-001, 171 statutory objectives; desk judgement):

| | Before | After |
|---|---:|---:|
| Addressed | 79 | 91 |
| Partial | 66 | 73 |
| Not addressed | 26 | 7 |

- **Still not taught:** Y3.GPS.4, Y5.FRAC.7, Y6.FRAC.8, Y6.FRAC.9, Y6.ALG.4, Y6.MEAS.6 and Y6.GPS.1.
- **New 11+ extension rows:** E11.7 to E11.9.

## 2. Checks run (developer evidence)

| Check | Result |
|---|---|
| `npm test` | 554 passed, 0 failed (11 Nov 2026) |
| `npm run lint` | 0 problems |
| `npx next typegen && npx tsc --noEmit -p .` | passed |
| `npm run build` | passed |
| `capture-screens.cjs` | 38 shots, 0 console errors |
| `text-scaling.cjs` | 8 pages: sideways overflow 0, clipped text 0, in every condition |
| `anim-pilot.cjs` | 14 steps at 3 widths; every drag worked; keyboard-only run finished; reduced motion: 0 running animations; 0 axe violations; 0 console errors |
| `new-topics.cjs` (new) | 18 new lessons and 3 mock set-ups at 390 and 1280px: 42 shots, 0 axe violations, 0 console errors, 0 sideways overflow |

The results are in `verification/results/d037-final/` and `verification/results/d037-ui/`.

**Corrections found by these checks and fixed (CH-068):**
- answer-sheet questions that were already multiple choice weren't lettered;
- a clipped cuboid label;
- a radius label crossing the circle's edge;
- one-row tables that wrapped digits on a phone.

**A process slip, recorded honestly:** commit `34e56f7` was pushed while one new component test failed. Its assertion
depended on the randomly drawn paper. `e1bb43a` fixed the test, and the full suite passed again.

## 3. Limits and what was not verified

- **No independent QA.** Every check above is developer evidence. There was no screen reader, no real devices and no
  children.
- **Exam facts were read once by the developer.** They can change each admissions round and need re-reading before
  each one.
- **Curriculum coverage is desk judgement.** The independent review (CUR-004) has not been done.
- **New content has not been reviewed** by a teacher or curriculum expert. The 11+ extension topics are labelled
  optional; whether any named test needs them is unverified.
- **The symmetry grid shows reflections and asks for counts.** Drawing the reflection (Y4.GPS.4) needs an interaction
  that isn't built.
- **No pixel comparison** was made against the earlier screens, because D-037 changes child-facing screens on purpose.
- **Defects:** no defect status changed. DEF-001, DEF-027, DEF-028 and DEF-038 remain "fixed, closure not confirmed"
  in the STATUS.md defect index, awaiting independent retest.
- **Deployment (CH-069):** `main` was fast-forwarded to `4cfd95e` after CI passed, and Vercel served it within about two
  minutes. The live check (`verification/live-check.cjs`) loaded five pages at two widths: all returned 200 with the
  expected content and no console errors. Deploying is not acceptance.
