# D-043 step 3 report: the kid pages

| | |
|---|---|
| **Decision** | D-043 (12 Nov 2026), step 3: kid pages in the concept-image style. The flow matters, not the exact UI. |
| **Changes** | CH-092 (pages), CH-093 (browser check) in `DECISIONS.md` |
| **Status** | READY FOR QA. **Nothing is accepted.** Deployed to production on 12 Nov 2026 at the Product Owner's request (D-045, CH-094): 28 of 28 live checks pass. |
| **Date** | 12 November 2026 |

## 1. What changed for the child

| Page | Address | What it shows |
|---|---|---|
| Navigation | every kid page | **Home · Topics · Practice · Tests · Progress**: in the header from 1024px, at the bottom on phones. The header keeps stars and streak and adds the **level with a bar** to the next level (from 1280px; from 640px below the tablet header). |
| Home | `/` | **Continue learning**: the topic journey worked in last, at its step (a 5-part bar and "Step 3 of 5: Apply"); with none open, the next step on the island, as before. Then Kip's one message, stars, streak and today's goal, **today's plan**, **Learn a new idea with Emma** (the journeys, with their progress), and the next lessons on the island. |
| Topics | `/topics` | Every topic in a grid, filtered by world or by the child's year (on by default when a year is set). Each card: picture, years, a bar of its skills by status, skills mastered and lessons done, "You are here" and "Learn with Emma" tags. Links to the world map. |
| Practice | `/practice` | Practise the current topic (one button; "Carry on" if a session is open), skills to look at again, quick practice (times-table facts, mental maths, problem solving) and every started topic. |
| Tests | `/tests` | Rechecks (practise first, or recheck when ready), each started topic's big challenge with its last result, and practice mocks with the last score. |
| Progress | `/progress` | A **mastery ring** (mastered, nearly there, learning, look again, not started) over the started topics and the current one; level, streak and badges; a **bar per topic**. |

Removed from view, not deleted: the Map, Lab and Badges tabs (the world map is linked from Topics, labs from each island,
badges from Progress and the header) and the "More to do" buttons on Home. `/journey`, `/lab`, `/badges` still work.

## 2. How the numbers are made

- Skill statuses come from `skillMastery` (MAST-001) and lessons done from lesson evidence (CUR-002 §4). **No new
  thresholds.** "Nearly there" means secure in practice or passed a check; "Learning" means developing.
- The ring's percentage is skills mastered ÷ skills in the counted topics.
- Continue Learning picks the unfinished journey with the latest activity: its start, or the child's last answer on its
  skill after that. No new saved field.
- Today's plan is day 1 of the PARENT-003 weekly plan, rebuilt from the evidence each visit. It cannot tick items off.
- Pure logic is in `engine/overview.ts` (tested against hand-worked cases) and `topics/overview.ts`.

## 3. Evidence (developer evidence, not QA)

- `npm test` (638 tests, 70 files), `npm run lint`, type check and `npm run build` pass. New tests:
  `engine/overview.test.ts` (4) and `components/screens/KidPages.test.tsx` (6), in `traceability/test-cases.csv`
  (MAST-003 AC1, UX-005 AC1).
- `node docs/product/verification/kid-pages.cjs <out> 3123` on a production build, results in
  `verification/results/d043-kid-pages/` (screenshots at 390 and 1280px, `report.json`): a new learner and a learner with
  the fractions journey at Apply, five pages at 320, 390, 768 and 1280px. **0 console errors, 0 axe violations (whole
  page, both navigations), no sideways scroll.** Each tab opens its page and is marked current; Continue Learning opens
  `/t/fractions-2/learn/add-different`.
- Found and fixed during the check: the header wrapped onto two rows at 1280px. It is now one row from 768 to 1440px.
- Not checked: screen readers, real devices, children.

## 4. Questions for the Product Owner

1. **XP.** The header shows the level and a bar of stars to the next level; stars stay the only currency. Should it say
   "XP" instead of stars everywhere, or is the level bar enough?
2. **Today's plan** does not know what the child has done today. Should plan items tick off (that needs a new saved
   record), or stay as suggestions?
3. **Practice tab.** It used to jump straight into the current topic's practice; now it is a hub with that as the first
   button. Keep the hub?
4. Still open from step 2: lengthen the Check stage (about 8 questions in the images, 2 today; changes MAST-001)? A
   reasoning question for ratio?

## 5. Next (D-043 plan)

The next item in `HANDOFF.md`: the ten hardest concepts on the journey, in batches of 4.
