# D-038 build report: the last 7 untaught KS2 objectives

| | |
|---|---|
| **Decision** | D-038 (11 Nov 2026): "Build the remaining 7 untaught objectives too". Y6.GPS.1 is taught by recognition only (the Product Owner's choice). Deploy once CI passes. |
| **Changes** | CH-070 to CH-072 in `DECISIONS.md`; deployment recorded separately |
| **Status** | Every item touched stays **READY FOR QA**. **Nothing is accepted.** |
| **Date** | 11 November 2026 |

## 1. What was built

Each new skill follows the D-037 shape:
- a lesson with an explanation of at least 40 words and a picture;
- a "watch me" worked example;
- a "together" example whose blank has a misconception trap;
- two checks;
- three or more question makers, one of them a stretch question;
- at least two fading hints;
- its own misconceptions.

| Objective | New skill | Island |
|---|---|---|
| Y5.FRAC.7: thousandths | Thousandths | Decimals |
| Y6.FRAC.8: decimal × whole number | Decimals × whole numbers | Decimals |
| Y6.FRAC.9: division with answers to 2 decimal places | Dividing to decimals | Decimals |
| Y6.ALG.4: two unknowns | Two unknowns | Ratio and algebra |
| Y6.MEAS.6: area of triangles and parallelograms | Triangles and parallelograms | Area and perimeter |
| Y3.GPS.4: horizontal, vertical, parallel and perpendicular lines | Lines | Shapes and angles |
| Y6.GPS.1: drawing shapes to given sizes | Drawing to size (**recognition only: partial**) | Shapes and angles |

- **New pure maths:** `src/maths/decimal.ts` gives exact scaled-integer decimals (multiply by a whole number, and
  written division to a set number of places). It is tested against BigInt and hand-worked values, so no decimal answer
  depends on floating-point arithmetic.
- **New kit pictures:**
  - base and perpendicular height (a triangle or parallelogram);
  - labelled lines on a grid;
  - a triangle drawn to scale from two sides and the angle between them.

**Curriculum coverage** (CUR-001, 171 statutory objectives; desk judgement):

| | After D-037 | After D-038 |
|---|---:|---:|
| Addressed | 91 | 97 |
| Partial | 73 | 74 |
| Not addressed | 7 | 0 |

## 2. Checks run (developer evidence)

| Check | Result |
|---|---|
| `npm test` | 557 passed, 0 failed |
| `npm run lint` | 0 problems |
| `npx next typegen && npx tsc --noEmit -p .` | passed |
| `npm run build` | passed |
| `new-topics.cjs` (25 lessons and 3 mock set-ups, 390 and 1280px) | 56 shots, 0 axe violations, 0 console errors, 0 sideways overflow |
| `text-scaling.cjs` | 8 pages: overflow 0, clipped 0 |

The results are in `verification/results/d038/`.

**Corrections found by the browser check and fixed (CH-073):**
- the parallelogram's slanted-side label was clipped;
- a triangle side label sat on its line;
- the thousandths table wrapped its headings on a phone.

**Deployment (CH-074):** `main` was fast-forwarded to `02d023b` after CI passed. The live check
(`verification/live-check.cjs`) made 12 loads (6 pages at 2 widths): all returned 200 with the expected content and no
console errors. Deploying is not acceptance.

## 3. Limits
- **Y6.GPS.1 is partial.** The child checks drawings and works out angles, but does not draw. Drawing needs an on-screen
  ruler and protractor, which is not built.
- **"Addressed" means a skill and lesson exist.** It does not mean every child has mastered the objective. The coverage
  is desk judgement, and the CUR-004 independent review has not been done.
- **No review yet.** No teacher or independent QA has reviewed the new content. There was no screen reader, no real
  devices and no children.
