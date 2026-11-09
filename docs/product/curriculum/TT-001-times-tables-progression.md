# TT-001: Times-tables curriculum and progression

| | |
|---|---|
| **Backlog items** | TT-001 (this progression), and the design behind TT-002 to TT-012 (R2) |
| **Status** | READY FOR QA (D-032). Not accepted. §5 lists proposed thresholds for Product Owner review. |
| **Date** | 9 November 2026 |
| **Acceptance criteria (TT-001)** | <ol><li>Progression covers 2–12 tables, relevant prior number facts, multiplication/division fact families and a year-appropriate sequence.</li><li>Curriculum expectations and the England Year 4 MTC are clearly distinguished from optional extension.</li></ol> |
| **Sources** | DfE, *National curriculum in England: mathematics programmes of study* (statements as stored in [`evidence/dfe-maths-pos-y2-y6.json`](evidence/dfe-maths-pos-y2-y6.json), retrieved 6 Nov 2026). STA, *Multiplication tables check assessment framework* (extract in [`evidence/mtc-framework-extract.md`](evidence/mtc-framework-extract.md), retrieved 9 Nov 2026). |

---

## 1. Three kinds of expectation, kept apart (AC2)

| Kind | What it is | Where it appears in the app |
|---|---|---|
| **Curriculum expectation** (statutory programme of study) | Y2.MD.1: recall and use × and ÷ facts for the 2, 5 and 10 tables. Y3.MD.1: the 3, 4 and 8 tables. Y4.MD.1: recall × and ÷ facts for tables up to 12 × 12. Y2.MD.3 and Y4.MD.3: commutativity. Y2.MD.4: arrays and repeated addition. Y4.MD.5: the distributive law and integer scaling. | The lessons, practice, facts area and diagnostic |
| **Year 4 multiplication tables check** (a statutory assessment, not a curriculum statement) | Statutory since 2021/22 for eligible Year 4 pupils in maintained schools, special schools and academies in England. 25 questions of the form n1 × n2, 6 seconds each, a 3-second pause, items from the 2 to 12 tables within published limits. "Not intended as a diagnostic tool." | Only the **timed practice**, which is labelled every time as a practice simulation, not the official check, and is kept out of fact status and skill mastery |
| **Optional extension** | None is built. Facts beyond 12 × 12 (squares to 15 × 15, the 13 to 20 tables) are not in the statutory curriculum. Whether particular 11+ papers expect them is not verified, and this document makes no claim about it. | Not in the app |

## 2. Prior number facts

Before the facts area, a child needs:
- counting in steps of 2, 3, 5 and 10 (Year 2) and in 4s, 8s, 50s and 100s (Y3.NPV.1);
- doubling and halving, which the 4s and 8s lesson uses;
- adding a small number, for "a fact you know, plus one more" hints.

The island's warm-up checks one question per lesson and can start a child later in the sequence (FR-001). The facts
diagnostic (TT-005) personalises which table to learn next.

## 3. The sequence (AC1)

Lessons, in island order:

| Order | Lesson | Purpose (phase) | Years | Curriculum |
|---|---|---|---|---|
| 1 | Groups, jumps and scaling | Understand | 2–4 | Y2.MD.4, Y4.MD.5 (scaling) |
| 2 | 2s, 5s and 10s | Understand | 2 | Y2.MD.1 |
| 3 | 3s, 4s and 8s | Visualise | 3 | Y3.MD.1 |
| 4 | Turn it round, split it up | Explain | 2–4 | Y2.MD.3, Y4.MD.3, Y4.MD.5 |
| 5 | 6s, 7s and 9s | Explore | 4 | Y4.MD.1 |
| 6 | 11s and 12s | Practise | 4 | Y4.MD.1 |
| 7 | Division facts | Apply | 2–4 | Y2.MD.1, Y3.MD.1, Y4.MD.1 (division facts) |
| 8 | Sharing, grouping and fact families | Apply | 2–4 | Y2.MD.2 (writing × and ÷ statements), Y4.MD.1 |

Facts are learned **table by table** in this order: 2, 10, 5, then 3, 4, 8, then 6, 9, 7, 11, 12 (`TABLE_ORDER` in
`src/engine/facts.ts`). That is the curriculum's year order, with each year's tables ordered so that each builds on the
last: the 10s from the 2s and 5s, the 4s and 8s by doubling, the 9s as 10s minus one lot.

## 4. Facts and fact families

- **A fact** is an unordered pair from 2 × 2 to 12 × 12, 66 in all. 7 × 8, 8 × 7, 56 ÷ 7 and 56 ÷ 8 are one fact: the
  island teaches commutativity and the inverse, so knowing one form is evidence for the family.
- **Forms asked** (TT-008): the product (7 × 8 = ?), a missing factor (7 × ? = 56), and the three division forms
  (56 ÷ 7 = ?, 56 ÷ ? = 8, ? ÷ 7 = 8). Division forms appear only once the multiplication has been recalled.
- **Answers** are whole numbers checked exactly.
- **Typing slips** (digits swapped, doubled or dropped) are classed apart and never count as a recall gap (TT-005 AC2).

## 5. Proposed thresholds (for Product Owner review)

These are new product rules for facts. They don't change MAST-001 skill mastery.

| Rule | Value | Why |
|---|---|---|
| A fact is **known** after | 3 untimed answers in a row, right first time without a hint | TT-006 AC3: "repeated correct recall". One right answer can be a guess; three in a row is a pattern. |
| **Developing** | at least one recall among the last 3 | Shows progress without calling the fact known |
| **Review intervals** (Leitner boxes 0–5) | 0, 1, 2, 4, 7 and 14 days; up one box per recall, back to box 1 after a miss | TT-012 AC1, AC2: the interval responds to recall and errors; known facts come back |
| **Retrieval of known facts** | every 4th question in a planned session | TT-006 AC1: practise weak facts while still retrieving secure ones |
| **New facts per mixed session** | at most 3 when other facts need practice, otherwise as many as fill the session; a chosen table may introduce all of its facts | TT-012 AC3: a manageable load |
| **Session length** | the child chooses 5, 10 or 20 | TT-012 AC3: adjustable |
| **Diagnostic** | 25 facts: 2 from every table 2–12, plus 3 from the 6, 7, 8, 9 and 12 tables (the check's "most difficult" tables) | TT-005 AC1: every table sampled; AC3: one answer never decides a fact |

## 6. Where each R2 item lives

| Item | Code | Tests |
|---|---|---|
| TT-002, TT-003 | `src/topics/times-tables/index.ts` (3 new skills, 11 templates, 3 lessons) | `src/topics/times-tables/times-tables.test.ts`, `src/topics/kit/kit.test.ts` |
| TT-004 to TT-006, TT-008, TT-012 | `src/engine/facts.ts` (pure), `src/topics/times-tables/facts.ts`, `FactsScreens.tsx`, `FactSession.tsx`, `FactGrid.tsx` | `src/engine/facts.test.ts`, `src/components/screens/Facts.test.tsx` |
| TT-007 | `FactExplorerScreen.tsx` | `Facts.test.tsx` |
| TT-009 | `mtcForm`, `mtcPractice`, `MTC` in `facts.ts`; timed mode in `FactSession.tsx` | `facts.test.ts` (the published limits, across 60 forms), `Facts.test.tsx` (6 s and 3 s timing) |
| TT-010 | Untimed mode in `FactSession.tsx` | `Facts.test.tsx` |
| TT-011 | `factReport` in `facts.ts`; `FactReportScreen.tsx` at `/parent/facts` | `facts.test.ts`, `Facts.test.tsx` |

**Limits.** This is developer evidence. The thresholds in §5 are proposals. The timed practice copies the published format,
but not the official check's software, item pool or access arrangements.
