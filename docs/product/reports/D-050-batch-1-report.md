# D-050 batch 1 report: four hard concepts on the topic journey

| | |
|---|---|
| **Decision** | D-050 (12 Nov 2026): "go ahead with these four", from a proposal made in the session. |
| **Changes** | CH-101 (question makers), CH-102 (the four journeys), CH-103 (checks) in `DECISIONS.md` |
| **Status** | READY FOR QA. **Nothing is accepted.** Not deployed. |
| **Date** | 12 November 2026 |

## 1. The four concepts

| Concept | Year | The mistake it fixes | Story and picture | Film |
|---|---|---|---|---|
| Comparing decimals (`/t/decimals/learn/compare-decimals`) | 5 | "Longer is bigger": 0.35 > 0.4 | Two bean plants (0.4 m, 0.35 m); place-value columns; tenths first; 0.4 = 0.40; hundred squares | 106 s |
| Percentages of amounts (`/t/percentages/learn/percent-of-amount`) | 6 | 35% of 80 is 80 ÷ 35 | 35% off an £80 bike; ten 10% parts of £8; 30% + 5% = £24 + £4 = £28 | 97.5 s |
| Multiplying fractions (`/t/fractions-2/learn/multiply-fractions`) | 6 | Multiplying always makes it bigger | Half a chocolate bar left, Mo eats a third of it: 1 of 6 pieces; tops × tops, bottoms × bottoms; ⅙ is smaller than both | 94.5 s |
| Remainders in real life (`/t/multiply-divide/learn/remainders`) | 5 | Stopping at the whole number: 50 ÷ 12 = 4 r 2, so "4 minibuses" | 50 children need 5 minibuses (round up); 50 pens make 4 full packs (round down); 2 left over (the remainder) | 97 s |

Each journey has everything the pilots have:
- **Learn:** Watch (Emma's film with chapters and captions), Step through (the picture, a recorded voice per step, two
  checkpoints) and Try it by hand:
  - decimals: fill the gap with a zero, then pick the bigger of three pairs;
  - percentages: build 35%, 15% and 45% on the bar;
  - fractions: cut the bar into rows and take some;
  - remainders: add minibuses, make packs, share stickers.
- **Beside and under it:** a Key idea with its bar model, Watch out, Key notes, and Notes.
- **Practise, Apply and Check:** 7 Practise questions (Guided, Build skill, Challenge), 3 Apply questions and the
  MAST-001 Check, all from the island's own question makers, tagged Concept, Application or Reasoning.

Pictures are 2D, as the Product Owner chose (D-046). All four appear on Home ("Learn a new idea with Emma") and with a
"Learn with Emma" tag on the Topics page.

## 2. New question makers

| Island | New makers | What they ask |
|---|---|---|
| Decimals | `dc-compare-why`, `dc-compare-apply` | Why "0.35 is bigger than 0.4" is wrong; who jumped further; who was fastest |
| Percentages | `pc-amount-why` | Why "p% of n = n ÷ p" is wrong |
| Fractions 2 | `f2-ff-why`, `f2-ff-apply` | Why multiplying by a fraction makes it smaller; a fraction of what is left |
| Multiply and divide | `md-rem-why`, `md-rem-apply` | Why "4 minibuses" is wrong; round up, round down, or the remainder |

There is one new misconception, `fractions-2.times-makes-bigger`. Wrong options carry the misconception they show, so
follow-ups and the grown-ups' reports pick them up.

## 3. Evidence (developer evidence, not QA)

- `npm test` (650 tests, 73 files), `npm run lint`, type check and `npm run build` pass. New tests:
  - `topics/journeyMakers.test.ts` (6): each maker's answer is checked against numbers read back out of the question,
    worked out by hand rules, over 60 seeds;
  - `topics/hardConceptScripts.test.ts` (4): timings, film lengths added by hand, hand-worked checkpoint answers, and
    the teaching shape.
- Emma's recordings were measured against every line: all fit with room to spare. The films came out at exactly the
  script lengths.
- `verification/journeys-batch1.cjs` on a production build, both concepts' screenshots in `results/d050-journeys/`:
  - each journey at 390 and 1280px: the film loads at its length, Step through draws, Try it shows;
  - Practise shows a question with "Check answer", and Check starts;
  - **0 axe violations at every stage, 0 console errors, no sideways scroll.**
- The fractions pilot's full journey check still passes.
- Found and fixed while checking:
  - the multiplying Try it started with a row already taken;
  - the uncut chocolate bar showed seams;
  - two film layouts needed adjusting;
  - the first browser run measured contrast while the Check question was still fading in (fixed in the script, and
    confirmed on the settled page).
- Not checked: screen readers, real devices, children, or an independent teacher reading the scripts (as for CUR-004).

## 4. Questions for the Product Owner

1. The next six hard concepts. Suggested, as before: area against perimeter, missing numbers (simple algebra),
   equivalent fractions and simplifying, negative numbers, angles in shapes, converting units. Keep these, or swap any?
2. Still open from D-043: lengthen the Check stage (2 questions today)? A reasoning question for ratio?
