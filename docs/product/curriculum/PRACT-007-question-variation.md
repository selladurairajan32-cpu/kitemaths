# PRACT-007: question variation and difficulty dimensions (Fractions)

| | |
|---|---|
| **Backlog item** | PRACT-007: question difficulty and variation rules (P1, R1) |
| **Status** | READY FOR QA (R1, D-026). Not accepted. |
| **Source** | `src/topics/fractions/generate.ts` (templates), `src/topics/fractions/questions.ts` (hand-written bank), `src/engine/adaptive.ts` (selection). Checked by `src/topics/fractions/practice-rules.test.ts`. |

## 1. What changes between questions

Variation changes the **mathematical structure**, the **representation** and the **context**, not only the numbers.

| Dimension | Values used |
|---|---|
| Structure | name a fraction; build or shade one; compare; find an equivalent; place on a line; find a fraction of an amount; add or take away; judge a claim |
| Representation | bar, circle, grid (area models); number line; counters (sets); symbols only |
| Ask | shaded or unshaded parts; missing numerator or denominator; marked point or value |
| Context | plain; a word problem with a person and an object (sharing, pizza, jugs) |
| Numbers | denominators from 2 to 12; unit fractions first |

## 2. Difficulty dimensions per template

| Template | Skill | Level 1 | Level 2 | Level 3 |
|---|---|---|---|---|
| `ep-pick` | Wholes and equal parts | Up to 4 parts per shape | Up to 6 parts | Up to 8 parts |
| `ep-yesno` | Wholes and equal parts | 2 to 4 parts | Up to 6 parts | Up to 6 parts, closer sizes |
| `nm-choose` | Reading fractions | Bar or circle, 2 to 6 parts, shading from the start | 4 to 9 parts, or a grid | 6 to 12 parts, shading scattered; sometimes asks for the unshaded part |
| `nm-write` | Reading fractions | (not used) | As level 2 above, written answer | As level 3 above, written answer |
| `nm-line` | Number line | (not used) | 3 to 6 gaps | 6 to 10 gaps |
| `rp-shade` | Showing fractions | Denominators up to 6 | Up to 10 | An equivalent amount on a shape with more parts (shade 3/4 of 8) |
| `cp-sign` | Comparing | Same denominator, with pictures | Same numerator (unit-fraction reasoning), with pictures | Mixed, no pictures |
| `eq-missing` | Equivalent fractions | × 2 or × 3, missing numerator | × 2 to × 5 | × 3 to × 6, missing top or bottom |
| `eq-choose` | Equivalent fractions | (not used) | Multipliers up to 4 | Up to 6 |
| `nl-place` | Number line | Denominators up to 5 | Up to 10 | Equivalent target on a finer line |
| `ad-sum` | Adding and subtracting | Add, result within one whole, denominators 3 to 8 | Take away, denominators up to 12 | Take away from one whole |
| `fo-amount` | Fractions of amounts | Unit fractions, small amounts | Non-unit, larger amounts | A word problem |
| `rs-claim` | Explaining and spotting mistakes | Denominator-size or part-to-part claims | Adds the "add to top and bottom" claim | Non-unit numerators |

## 3. Rules in selection

- **Difficulty adapts** per skill: up after two first-try answers in a row, down after a miss (`targetDifficulty`).
- **No repeats in a session**, and questions already seen are used last (`pickInSkill`).
- **Interleaving:** every 4th question revisits a secure skill.
- **Transfer after a suspected misconception:** a new question on the same skill, in a different form where one exists (MIS-004).
- **Malformed questions are dropped** before they can be shown (PRACT-001 AC3).
