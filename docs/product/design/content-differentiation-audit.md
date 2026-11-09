# Content differentiation audit

| | |
|---|---|
| **Requested by** | Product Owner, 9 November 2026 (D-028) |
| **Status** | Implemented on the development branch: CH-042 (facts) and CH-043 (differentiation). Not accepted; nothing in this audit changes an item's status. |
| **Not to be confused with** | [UX-004](UX-004-content-differentiation.md), which defines how *content types* inside a lesson look (hint, rule, worked example…). This audit is about *pages*: what each page says and whether it says something different from the others. |

---

## 1. Method

1. **Mapped the app with the Graphify code graph** of this repository: which route renders which screen, who calls the shared
   copy helpers (`kidNext` has one caller, Home; `badgesFor` feeds Home and Badges), and which tests cover them.
2. **Read every screen's copy in the source**, and checked each factual claim against the engine that produces it
   (star rules in `rewards.ts`, question choice in `adaptive.ts`, recommendations in `journey.ts`, streaks, badges).
3. **Rendered every changed page in a production build** with Playwright: 8 pages × 2 learner states (brand-new, and the
   seeded learner from `src/test/seed.ts`) × 2 widths (390px, 1280px). Before and after, I checked the visible text,
   horizontal overflow and console errors.

The constraints were: no removed features, no business-logic changes, no redesign, no invented facts. Where a
fix needs one of those, it is a **recommendation** in §6, not a change.

---

## 2. What each page is for

One question per page. The last column is what the page must *not* repeat, because another page owns it.

| Page | Route | For | The question it answers | Content only this page has | Owned elsewhere |
|---|---|---|---|---|---|
| Home | `/` | Child | **What should I do right now?** | The one next step and why; today's goal; streak; the badges closest to winning | The full collection (Badges); what each lesson teaches (island map) |
| World map | `/journey` | Child | **Where can I go?** | Every island, **what each covers**, progress per island | Lesson detail (island map) |
| Island map | `/t/<island>` | Child | **What's on this island, and what will each stop teach me?** | The island's scope; each lesson's outcome ("You'll learn"), "best after" advice, skill labels | Daily habit (Home) |
| Practice | `/t/<island>/practice` | Child | **Which skill do I practise?** | Per-skill choice and a 10-question session | — |
| Badges | `/badges` | Child | **What have I collected, and how do I win the rest?** | The whole collection with how to win each badge | "What to aim for next" (Home) |
| Warm-up | `/t/<island>/start` | Child | **Where should I start?** | Placement and a free choice of start | — |
| Overview | `/parent` | Grown-up | **How is my child doing, and what happens next?** | The recommendation; a summary of progress; settings; the module's scope | The evidence behind labels (Full report) |
| Journey detail | `/parent/journey` | Grown-up | **How does each lesson count as done, and what does it build on?** | Per-lesson evidence source, prerequisites, what the phase tags mean | Skill labels (Overview, Full report) |
| Full report | `/results` | Grown-up | **What is the evidence?** | The rules behind each label; the score by area; a question-by-question review; misunderstandings with their evidence | The summary (Overview) |

---

## 3. Duplication found, and what was done

| # | Where | What repeated | Done |
|---|---|---|---|
| D1 | Home badge shelf and Badges hero | The same heading ("Your badges") and the same line, word for word ("… won. Every badge is a little trophy for your learning."). Both showed earned badges first. | **Changed.** Home is now "Badges to win next": the closest unearned badges, **with how to win each one** (the description was only on the Badges page). The Badges page hero says it is the whole collection and how it is ordered. |
| D2 | Home hero, every lesson | Every lesson had the same line: "A short lesson with pictures, a puzzle and a quick question at the end." Every practice had the same line too. | **Changed.** The line is now the lesson's own summary ("Which fraction of the same whole is bigger — and a surprise about denominators."). For practice it says what the engine actually does: one skill, or weaker skills first with an occasional revisit (`adaptive.ts`). |
| D3 | Home footer and the streak card | Both said "Play today to keep it/your streak". | **Changed.** The footer now says something the card doesn't: one answer keeps a streak (`activeDays`), and how many questions remain to today's goal. |
| D4 | World map island cards | Every card had only a title and "n of m lessons". Nothing said what an island covers. | **Changed.** Each card shows the island's own description (`subtitle`), which already existed in the content. |
| D5 | Island map hero | "n of m stops done. Tap any stop to play!" is the same on every island. | **Changed.** Leads with the island's scope. |
| D6 | Overview "Skills in this module" and the Full report's skill table | The same list of skills with the same status badges, and nothing to say how the two pages differ. | **Reframed.** Now "Skills at a glance", with a line saying the report holds the evidence. The list stays, because it is useful at a glance. |
| D7 | Overview and Full report | The same "lesson & practice answers" and "right first time" figures. | **Kept, as a deliberate summary.** The report frames itself as "the evidence behind every label" and adds hints used. See R4. |
| D8 | Journey detail aside and the Overview phase strip | Both showed the seven phases. The aside also claimed "every topic follows the same path", which contradicts D-018. | **Changed.** The aside now explains what the tags mean and that they are not strict steps (facts: F5). |
| D9 | Home "More to explore" and the navigation bar | The same three destinations. | **Kept** (it helps a child who doesn't read the bar), with lines that now carry real information: the real star rule, and 19 islands in 6 worlds. |
| D10 | Home lesson grid and island map | Both list every lesson of the island. | **Not changed: needs a decision** (R1). |

---

## 4. Facts that were wrong, and terms that disagreed

All of these are fixed in CH-042, apart from F5 (§3, D8).

| # | Where | Was | Fact (source) | Now |
|---|---|---|---|---|
| F1 | Warm-up result | "You already know 2 of the 9 **topics**" | Placement counts lessons (`placement.plan`) | "… of the 9 lessons" |
| F2 | Home, Practice card | "Ten questions, **a star for each one**" | 3 stars right first time, 2 with help, 1 for trying (`starsForResult`) | "10 questions. Up to 3 stars each, for right first time." |
| F3 | Full report header | Always "Fractions foundations" | The report follows the chosen island | The island's own title |
| F4 | Overview, "About this module" | Described fractions for **every** island, and listed simplifying, mixed numbers, adding and FDP as "not built yet" | Fractions 2, Decimals and Percentages exist as previews (D-001) | The chosen island's own description; says which island is built first to the full standard and that the rest are previews; names the next islands in the same world |
| F5 | Journey detail | "Every topic follows the same path" | D-018: phase labels describe purpose, not a rising sequence | Explains the tags honestly |
| F6 | Streak card | "Play today to keep it" with a 0-day streak | There is nothing to keep | "Play today to start one" |
| F7 | Island map and Journey detail | Raw `{1/2}` markup in lesson summaries (Percentages island) | Summaries use the `RichText` fraction markup | Rendered as a fraction (read out as "one half") |

**One name per thing** (the glossary the copy now follows):

| Thing | Child pages | Grown-up pages | Was inconsistent |
|---|---|---|---|
| The badges page | Badges | — | The tab said "Kites"; the page, its title and the shelf said "badges"; a button said "See my kites" |
| The final assessment | The big challenge | Mastery check | A badge said "the big check" |
| The progress pages | — | Overview · Journey detail · Full report | The report's heading said "Mastery results" under a "Full report" tab |

The two names for the final assessment are deliberate: one for children, one for grown-ups. R8 suggests linking them once.

---

## 5. Voice

Grown-up pages had slipped into the child's voice ("Nothing to work on right now — great thinking!", "As you answer
questions, we'll … help you with them here", "questions on your own"). They now speak to the grown-up and stay factual,
saying what has and hasn't been seen.

Child pages still say "you" and "Kip". The Full report keeps some second-person lines on purpose: the backlog asks that
it be "understandable to a child and useful to a parent". The "makes no claims about ability" test still passes.

---

## 6. Recommendations not implemented

Each of these needs a Product Owner decision, new data, or a change beyond copy. Ordered by value.

| # | Recommendation | Why not done now |
|---|---|---|
| R1 | **Home: show only the next two or three lessons and the big challenge**, with "See the map" for the rest. The island map already lists every lesson, with more detail. | It removes visible content and changes the layout of the main screen. |
| R2 | **Stars and level appear four times** (header, Home stat card, Home hero art, Badges hero). Keep the header and Badges; give the Home slot to something only Home has. | It changes the layout. Needs a decision on what replaces it. |
| R3 | **"4 of 105 badges won"**: 105 includes a skill badge for every skill on all 19 islands, most of which the child has never opened. A large, mostly unreachable total can discourage. Count only islands the child has started, or show skill badges per island. | Changes the badge logic (`badgesFor`), which the reward tests cover. |
| R4 | **Full report: show change over time** (this week against last week, from the answer timestamps already stored), so it says something the Overview can't. | New analysis. Needs a definition agreed before anything is shown to parents. |
| R5 | **Journey detail: show each lesson's national curriculum year and objective.** The data exists in the CUR-001 curriculum map. It is real decision-support for parents. | Don't publish alignment claims until the independent content review (CUR-004) is done. |
| R6 | **Practice intro: say what "strong" means for this skill and how close the child is.** Today it is the same line for every skill. | Small, but touches the practice flow, which is part of R1 QA. |
| R7 | **Grown-up voice for "Recommended next".** The reason comes from the engine and speaks to the child ("You've finished the lesson…") but appears on the Overview. | The strings live in the pure engine (`journey.ts`) and are shared. Needs a parent-voice field, not a copy edit. |
| R8 | **Link the two names once:** on grown-up pages, "Mastery check (the 'big challenge' in your child's view)". | Quick win. Left for the PO to confirm the wording. |
| R9 | **Mixed practice has four names**: "Power-up practice" (island map), "Mixed challenge" (Practice), "Mixed practice" (Home), "Practise all the skills" (Overview). Pick one. | Quick win. Needs the PO to choose the name. |
| R10 | **No page explains Kite Maths to a new grown-up.** `/` is the child's dashboard. Nothing says what the app is, what is ready and what is a preview, or that progress stays in this browser, until you pass the grown-ups gate. | A new page is a new feature, so it needs a scope decision. |

### Information that is missing, and must not be invented

- **No evidence of learning outcomes.** Nothing measures whether children learn more with Kite Maths. No page should
  claim it, and none does.
- **No time-spent data.** Answers have timestamps, but sessions aren't timed, so "minutes practised" can't be reported.
- **Curriculum alignment is not independently reviewed** (CUR-004), so it isn't stated to parents (R5).
- **Progress is per browser.** There are no accounts or sync. The Overview says so, and R10 would say it earlier.

---

## 7. Implementation plan

| Priority | Work | State |
|---|---|---|
| P0 | Fix wrong facts and terms (F1–F7) | **Done** (CH-042, CH-043) |
| P0 | Give each page a distinct message and remove the word-for-word repeats (D1–D6, D8, D9) | **Done** (CH-043) |
| P1 | Quick wins: R8 (link the assessment names), R9 (one name for mixed practice), R6 (practice intro) | Needs the PO's wording |
| P1 | R1 and R2: Home shows only what Home owns | Needs a decision |
| P2 | R7: parent-voiced recommendation reasons | Engine field. Small and additive |
| P2 | R3: badge totals that reflect where the child has been | Logic change with tests |
| P3 | R4 (trend), R5 (curriculum objectives), R10 (grown-ups' introduction page) | Need data definitions, CUR-004, or a scope decision |

---

## 8. Evidence and its limits

- `npm test` (379 tests), `npm run lint`, `npx tsc --noEmit -p .` and `npm run build` pass on the branch head. The warm-up
  test now asserts "lessons" (TC-FR-001.2.1).
- Browser check: 32 combinations of page, state and width, with no horizontal overflow and no console errors. This is
  **developer evidence**, not independent QA. No screen reader, real device or child has seen these changes.
- The copy was checked against the engine code, not against children's understanding. Wording for 7 to 11-year-olds
  should be part of the usability testing already planned for R1.
