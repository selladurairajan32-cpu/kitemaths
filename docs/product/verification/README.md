# Verification tooling

These are reusable scripts for the checks that need a real browser or two builds, plus concise results. They are kept so
an independent reviewer can rerun them. Unit tests run in `npm test`. These scripts don't: they need a running
production build and Playwright's Chromium.

All results here are **local runs by the delivery engineer**. They are not GitHub Actions runs: the CI workflow runs on
pull requests and on pushes to `main` only, so it has not run on the development branch (D-014).

| Script | What it checks | How to run |
|---|---|---|
| `capture-screens.cjs` | Captures 38 existing screens and states for the no-visible-change comparison. The setup is described below the table. | `node docs/product/verification/capture-screens.cjs <outDir> <port>` |
| `pixel-diff.py` | Compares two capture folders pixel by pixel (Pillow) | `python3 docs/product/verification/pixel-diff.py <baseline> <head>` |
| `specimen-audit.cjs` | Contrast and layout of the design specimen; see below | `node docs/product/verification/specimen-audit.cjs <outDir> [baseUrl]` |
| `text-scaling.cjs` | UX-003 AC3: sideways scroll and clipped text on 8 pages at 200% text, browser-zoom width (640px) and 320px reflow | `node docs/product/verification/text-scaling.cjs <outDir> 200%` |
| `anim-pilot.cjs` | ANIM-001 pilot v2: all 14 steps at 390, 768 and 1280px with each task done by real pointer drags, the try-it with Show me again, a keyboard-only run, reduced motion, axe-core and console errors | `node docs/product/verification/anim-pilot.cjs <outDir> <port>` |
| `new-topics.cjs` | D-037 Phase C: the first step of all 18 new lessons and the practice mock (ISEB profile, answer sheet, 2 timed sections, two-part questions) at 390 and 1280px, with axe-core, console errors and sideways overflow | `node docs/product/verification/new-topics.cjs <outDir> <port>` |
| `live-check.cjs` | D-037 deployment: five pages on the live site at 390 and 1280px, with cache-busting loads, HTTP status, a content check per page and console errors | `node docs/product/verification/live-check.cjs <outDir>` |
| `draw-tool.cjs` | D-039 (Y6.GPS.1): the drawing lab by real pointer drags at 390 and 1280px, by keyboard only and with reduced motion; axe-core at every stage and console errors | `node docs/product/verification/draw-tool.cjs <outDir> <port>` |
| `compare-generated-questions.mjs` | ARCH-003: every generated question is identical before and after the maths extraction (step 3) | see the script header |

**`capture-screens.cjs` setup.** It captures 19 screens and states at both 1280×900 and 390×844, in Chromium, with
reduced motion and a device scale of 1. They are:
- home, world map, island, warm-up start, a lesson explanation, practice, lab, the big challenge, a kit island, a kit
  lesson and badges;
- a seeded learner's lab step, worked examples (full and faded), a question, its hint and wrong-answer feedback;
- grown-ups and results.

**`specimen-audit.cjs` checks:**
- **Contrast from the colours the browser actually applied.** For every text element and badge icon it reads:
  - the computed foreground colour;
  - the effective opaque background;
  - the font size and weight.
  It then applies WCAG minimums: 4.5:1 for normal text, 3:1 for large text and icons. Ratios are never rounded.
- **Specimen content overflow** at 1280px and 390px, at 100% and 200% text, and at 320px. This is kept separate from
  page overflow caused by the shared header (DEF-018).

## How a comparison is run

1. **Baseline.** Check out the baseline commit in a separate worktree (`git worktree add <dir> <sha>`), then run
   `npm ci`. A symlinked `node_modules` doesn't work: Turbopack won't resolve outside the worktree. Build it with
   `npm run build` and serve it with `npx next start -p 3124`.
2. **Head.** Build and serve the head commit on port 3123.
3. **Capture both and compare.** Run `capture-screens.cjs` against each, then `pixel-diff.py`.

**What a result of 0 means.** It means *no differences in the tested screens and states*. It does not prove that every
possible screen, state or behaviour is unchanged.

## Results

`results/d039/` holds the runs on 11 Nov 2026 for D-039: the drawing lab drawn by pointer at both widths and by keyboard
with exact values, 0 axe violations, 0 console errors, no animations under reduced motion (`draw-tool/report.json`);
new-topics and text-scaling clean.

`results/d038-live/` holds the production check on 11 Nov 2026 after the D-038 deployment (`main` at `02d023b`): 12 page loads, all 200 with the expected content, 0 console errors.

`results/d038/` holds the runs on 11 Nov 2026 for D-038, on a production build after the CH-073 corrections:
- **New topics and mock formats** (`new-topics.cjs`, now with the 7 D-038 lessons): 56 shots, 0 axe violations, 0 console
  errors, 0 sideways overflow (`new-topics/report.json`).
- **Text scaling:** 8 pages, sideways overflow 0 and clipped text 0 in every condition (`text-scaling/`).

`results/d037-live/` holds the production check on 11 Nov 2026 after the D-037 deployment (`main` at `4cfd95e`): 10 page loads, all 200 with the expected content, 0 console errors.

`results/d037-final/` holds the runs on 11 Nov 2026 for D-037, on a production build of the D-037 head:
- **Screen capture:** 38 shots, 0 console errors (`screens/`). No baseline comparison: D-037 changes child-facing
  screens on purpose.
- **Text scaling:** 8 pages, sideways overflow 0 and clipped text 0 in every condition (`text-scaling/`).
- **Animated pilot:** 14 steps at each width, every drag worked, keyboard-only run finished, reduced motion shows the end
  state with no running animations, 0 axe violations, 0 console errors (`anim-pilot/report.json`).
- **New topics and mock formats:** 42 shots, 0 axe violations, 0 console errors, 0 sideways overflow
  (`new-topics/report.json`).

`results/step2-correction/` holds the runs on 5 Nov 2026 for the step-2 corrections. Baseline `6050e3c`, head
`48f7925`:
- **Pixel comparison:** 38 screens and states; no differences in the tested screens and states.
- **Specimen audit at the baseline:** 11 elements below the minimum. This reproduces the independent review's
  findings:
  - "Challenge": 2.45:1;
  - "Watch me": 4.29:1;
  - small denominators: 4.18–4.32:1.
- **Specimen audit at head:** 270 elements checked, 0 below the minimum.
  - The lowest are the two badge icons (3.16:1 and 3.45:1, against a 3:1 icon minimum) and a 44px digit (4.78:1).
  - The specimen's own content has no overflow under any of the 5 conditions.
  - Page overflow comes from the shared header only (DEF-018).
- **Text scaling:** unchanged from 4 Nov, because existing screens were not changed. DEF-018 to DEF-021 remain.
- **Production build** (`VERCEL_ENV=production`): `/design-specimen` returns 404 with `noindex`, and `/` returns 200.

`results/step3/` holds the runs on 5 Nov 2026 for sprint step 3. Baseline `6050e3c`, head `d100ff1`:
- **Generated questions:** 51,098 (every practice and assessment question, and every kit template × difficulty × 150
  seeds, with answer texts); none differ.
- **Positive control:** a deliberate one-character change to `best()` in fractions-2 produced 18 differing questions, and
  was reverted.
- **Pixel comparison:** 38 screens and states; no differences in the tested screens and states. This includes the
  place-value island and lesson, which use the moved digit maths.
- **Specimen audit:** 270 elements checked, 0 below the minimum.
- **Production build:** `/design-specimen` returns 404.

`results/review2/` holds the runs on 6 Nov 2026 for review 2. Baseline `6050e3c` (a fresh worktree and `npm ci`), head
`d8ae9c0` (the final code commit):
- **The 38 unchanged child-facing screens and states** are compared against the baseline. The design specimen is **not**
  among them.
  - Run 1 showed 24 differing pixels in one screen, `desk-challenge`, in the header strip (x 1057–1191, y 14–20).
  - Two captures of the **baseline build alone** also differed by the same 24 pixels, so this is run-to-run noise.
  - Run 2, a fresh paired capture of both builds, showed **no differences in the tested screens and states**. Both runs
    are kept in `results/review2/`. No baseline screenshot was replaced to obtain a pass.
  - This does not prove that every possible screen or state is unchanged.
- **The specimen** changed on purpose (wording, DEF-036). Its evidence is regenerated separately
  (`design/evidence/screens/`) and is **not** part of any zero-difference claim. Its audit: 272 elements checked, 0 below
  the contrast minimum, no content overflow under 5 conditions; page overflow at 200% text and 320px comes from the
  shared header (DEF-018).
- **Generated questions:** 51,098 questions identical between `6050e3c` and `d8ae9c0` (the `divmod` change has no
  production caller).
- **Production build:** `/design-specimen` returns 404 with `noindex`; `/` returns 200.
