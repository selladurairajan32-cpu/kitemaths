# D-046 phase 2 report: the kid pages in the sky-and-glass look

| | |
|---|---|
| **Decision** | D-048 (12 Nov 2026): "go ahead with phase 2"; the narrowed palette rule is confirmed; the Check button inside questions becomes the yellow "Check answer" everywhere. |
| **Changes** | CH-098 (look and feel), CH-099 (checks) in `DECISIONS.md` |
| **Status** | READY FOR QA. **Nothing is accepted.** Not deployed. |
| **Date** | 12 November 2026 |

## 1. What changed for the child

| Page | Now |
|---|---|
| Home | "Hi Sam!" with the waving guide, the streak and today's goal; a **level ring** card (level, title, XP to the next level). **Continue learning** on glass: the concept's 3D picture, the learning path (Learn, Practise, Apply, Check, Complete as 3D pictures, the current one ringed, ticks on done ones), a progress bar ("2 of 5 steps") and a yellow **Continue**. Then Kip's one message, today's plan, Learn a new idea with Emma and the next lessons, on glass. The stars strip went: its numbers are in the greeting and the level card. |
| Topics | The guide in the hero; blue filter pills; glass cards with an arrow, years, the skills bar, skills mastered and lessons done. |
| Practice, Tests | Glass hero and glass cards. |
| Progress | Glass panel with the mastery ring and key; a **percentage beside each topic bar**; a "How well do you really understand?" card with the guide and **Take a check**. |
| Every question | The answer button is the yellow **Check answer** ("Check again" after a try). |
| Other screens with a screen hero (world map, badges, practice, facts, strategies) | The hero is glass, so they sit in the new look too. |

Numbers, rules and marking are unchanged. Screenshots: `verification/results/d048-kid-pages/` (every kid page for a new
learner and for one with a journey in progress, 390 and 1280px) and `verification/results/d048-look/` (the journey).

## 2. Evidence (developer evidence, not QA)

- `npm test` (640 tests), `npm run lint`, type check and `npm run build` pass.
- Kid pages at 320, 390, 768 and 1280px: 0 axe violations, 0 console errors, no sideways scroll; every tab opens its
  page and is marked current.
- The whole fractions journey at 390, 768 and 1280px: 0 axe violations at every stage, 0 errors, resume works.
- Not checked: screen readers, real devices, children.

## 3. Open

- Still open from D-043: lengthen the Check stage (about 8 questions in the images, 2 today; changes MAST-001)? A
  reasoning question for ratio?
- Next in the plan: the ten hardest concepts on the journey (in batches of 4), then the public homepage and the parent
  dashboard, then Supabase accounts.
