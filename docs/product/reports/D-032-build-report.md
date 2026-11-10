# D-032 build report: every pending item

| | |
|---|---|
| **Authority** | D-032 (Product Owner, 9 Nov 2026): build every pending item in one stretch; review, audit and QA afterwards |
| **Branch** | `claude/practical-knuth-9126wx` (not deployed) |
| **Result** | 83 items READY FOR QA, none accepted. All four CI commands pass. Browser checks pass at 390px and 1280px. This is **developer evidence only**. |

## 1. What was built

| Step | Items | Change record | Commit |
|---|---|---|---|
| A | Content audit recommendations R1 to R10 | CH-050 | `fd4953a` |
| B | R2 Times Tables, TT-001 to TT-012 | CH-051 | `a3a512a` |
| C | R3 Mental Maths, MM-001 to MM-012 | CH-052 | `571e9a5` |
| D | R5 exam preparation and parents, EXAM-001 to EXAM-006, PARENT-001 to PARENT-003 | CH-053 | `fdfcf45` |
| E | DEF-028 fixed | CH-054 | `ee316e2` |

New places in the app: `/t/times-tables/facts` (hub, practice, untimed, diagnostic, timed, explorer), the Mental maths
island and `/t/mental-maths/strategies` (compare, choose, one-minute challenge), `/t/mock-exams/mock`, and for grown-ups
`/parent/about`, `/parent/plan`, `/parent/facts` and `/parent/strategies`.

## 2. Facts that were checked, not assumed

- **The multiplication tables check format** (25 questions, 6 seconds, a 3-second pause, per-table and key-stage limits)
  was read from the Standards and Testing Agency's assessment framework on 9 Nov 2026 and is quoted in
  `curriculum/evidence/mtc-framework-extract.md`. Tests use those tables as their oracle.
- **The times-tables progression** cites the DfE programme of study statements already stored in the repository.
- **Every mental strategy step** is recomputed with BigInt in tests, across more than 5,000 cases.

## 3. Not invented

- **No real school's 11+ details.** None could be verified here, so the only exam profile is general practice, with
  every fact unknown (EXAM-001 doc §4).
- **No speed claims** for any strategy, and **no history** for the Vedic techniques (MM-008 §3).
- **No predictions** of scores, pass marks or admission (EXAM-006).
- **Practice-session minutes** in the weekly plan are labelled as estimates.

## 4. Decisions waiting for the Product Owner

| Topic | Where |
|---|---|
| Fact thresholds: known after 3 recalls; review intervals; new-fact pacing | TT-001 §5 |
| Timed mental-maths challenge opens at 10 untimed answers and 80% accuracy | MM-008 §4 |
| Vertically and crosswise as an optional 11+ extension | MM-008 §2 |
| Which schools' exam profiles to research and add | EXAM-001-002 doc §4 |
| MAST-001 varied-examples criterion (still BLOCKED); confirmation of RC-008 to RC-010 | STATUS, DECISIONS |
| DEF-001: start new children on the island for their year (would move them off Fractions, the R1 product) | defects.csv |
| DEF-027 and DEF-038: change behaviour that ARCH-003 and D-025 preserve | defects.csv |

## 5. Limits of this evidence

- Every check here was run by the developer: unit, content and component tests, builds, and Playwright browser runs. No
  independent QA, screen reader, real device or child has seen these features.
- The curriculum links and the strategy catalogue have not had the independent content review (CUR-004 style).
- Unknown Next.js routes answer 200 with the not-found page under partial prerendering (existing app-wide behaviour).
