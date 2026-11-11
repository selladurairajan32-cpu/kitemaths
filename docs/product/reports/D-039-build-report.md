# D-039 build report: an on-screen drawing tool for Y6.GPS.1

| | |
|---|---|
| **Decision** | D-039 (11 Nov 2026): "Build the drawing tool for Y6.GPS.1 too". Deploy once CI passes. |
| **Changes** | CH-075 onwards in `DECISIONS.md` |
| **Status** | Every item touched stays **READY FOR QA**. **Nothing is accepted.** |
| **Date** | 11 November 2026 |

## 1. What was built

The **"Draw it yourself"** lab step sits in the Shapes and angles lesson "Drawing to size"
(`src/topics/shapes-angles/explain/ConstructLab.tsx`). The child draws two triangles, each from two sides and the angle
between them, one stage at a time:

| Stage | What the child does | Snap |
|---|---|---|
| 1. Ruler | Drag the end of the base along a ruler | half-centimetres, 1 to 9 cm |
| 2. Protractor | Turn a line round a protractor at the left end | whole degrees, 10° to 170° |
| 3. Ruler on the new line | Drag along it to the second length | half-centimetres, 1 to 7 cm |
| 4. Join | Join the two ends | — |

The finished triangle shows its third side, worked out by the law of cosines (`src/maths/geometry.ts`).

**Controls:**
- Every handle is a named slider with its value read out, such as "6 centimetres" or "50 degrees".
- It works with a mouse, touch or the keyboard: arrows move one step, Shift with an arrow moves ten, and Enter checks.

**Help:**
- A wrong check says what was drawn and what is needed, for example "That's 3 cm. You need 6 cm."
- After two misses, "Do this step for me" appears.

**Coverage:** Y6.GPS.1 moves from partial to **addressed**. Statutory objectives: addressed 98, partial 73, not
addressed 0 (desk judgement).

## 2. Checks run (developer evidence)
The results are recorded in section 4 once they have run.

## 3. Limits
- **Drawing is on screen,** with tools that snap to half-centimetres and whole degrees. It is not pencil-and-paper
  accuracy, and it doesn't teach holding a real protractor.
- **Only triangles** from two sides and the included angle are drawn. Other constructions, such as a triangle from two
  angles and a side, or quadrilaterals, are not built.
- **No independent QA, screen reader, real devices or children.** Keyboard and pointer use are tested in jsdom and in a
  browser script only.
