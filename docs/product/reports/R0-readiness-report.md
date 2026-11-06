# R0 readiness report

| | |
|---|---|
| **Date** | 6 November 2026 |
| **Branch** | `claude/pensive-pasteur-bs5979`. Development only: no pull request, merge or deployment (D-002). |
| **Scope of this round** | GOV-004, CUR-001, QA-004, and a step-4 handoff. Documentation, data and documentation checks only. **No application code or screen changed.** |
| **Status** | GOV-004, CUR-001 and QA-004 are **READY FOR QA**. Nothing is self-accepted (D-022). UX-003 stays QA FAILED. |

## 1. Deliverables

| Item | Deliverable | Checked by |
|---|---|---|
| **GOV-004** | [Change-control rules](../GOV-004-change-control.md): what is material, the reason/impact/owner/decision record, record consistency, roles, no silent reinterpretation, visible deferrals | `src/governance.test.ts` (5 tests) |
| **CUR-001** | [Curriculum map](../curriculum/CUR-001-curriculum-map.md) and [`curriculum-map.csv`](../curriculum/curriculum-map.csv): 171 Year 3–6 statutory objectives quoted verbatim from the DfE programme of study, with year, strand, prerequisites, outcome, vocabulary, examples, proposed mastery-evidence kind, island/skill mapping, coverage and gaps; 6 unsourced 11+ candidates kept apart; Fractions R1 dependencies marked. Sources: [`evidence/`](../curriculum/evidence/). | `src/curriculum/map.test.ts` (10 tests) |
| **QA-004** | [Defect register and triage rules](../QA-004-defect-register.md) over [`traceability/defects.csv`](../traceability/defects.csv): 38 defects, every required field; STATUS defect table is an index of it | `src/defects.test.ts` (9 tests) |
| Handoff | [Step 4 proposal](R0-step4-handoff.md) for UX-005, FR-011, ARCH-004 (proposal only) | linked-file check in `src/governance.test.ts` |
| Records | [STATUS](../STATUS.md), [DECISIONS](../DECISIONS.md) (RC-007, CH-033 to CH-035), [traceability](../traceability/README.md) | `src/traceability.test.ts` |

## 2. What the work shows

- **CUR-001.** Coverage by desk judgement: 75 objectives addressed, 69 partly, 27 not addressed. Five Year 3–6 fractions objectives and several more are marked as taught in Fractions R1; two multiplication/division objectives are marked as prerequisites. The map is the evidence for what R1 teaches and what it assumes.
- **QA-004.** 9 defects closed on independent verification (DEF-029 to DEF-037); 5 fixed with closure not confirmed (DEF-022 to DEF-026); DEF-038 partly fixed, with the behavioural difference still open; the rest open. No defect has an approved release deferral.
- **Island year labels** differ from the statutory year placement in places. The map lists them as review prompts, not defects.

## 3. Checks run (developer, local)

| Check | Result |
|---|---|
| `npm test` | 19 files, **300 tests, all pass** |
| Traceability checker (`src/traceability.test.ts`) | Pass. 97 items, 270 criteria, 452 test cases. |
| Link checks | `src/defects.test.ts`, `src/governance.test.ts` check evidence and document links; the generated pages are regenerated from their sources |
| `npm run lint`; `npx next typegen` then `npx tsc --noEmit -p .` | Pass (they include the three new test files) |
| `npm run build` | Not rerun: no application code changed (as instructed) |
| **Not run** | A hosted CI run; independent reproduction of the browser checks; independent re-extraction of the DfE text; review by a teacher |

## 4. Remaining gaps

| Gap | Where |
|---|---|
| Coverage ratings in CUR-001 are desk judgement from skill and lesson descriptions, not a content review | [CUR-001 §7](../curriculum/CUR-001-curriculum-map.md) |
| 27 Year 3–6 objectives have no island at all (mostly outside the Fractions-first scope) | CUR-001 §7 |
| No official 11+ specification; extension candidates are unsourced | RC-007 |
| MAST-001 thresholds are coded but not documented for the Product Owner | [Handoff §3](R0-step4-handoff.md) |
| DEF-022 to DEF-026 closure not recorded; DEF-011 to DEF-017 not triaged | [QA-004 §5](../QA-004-defect-register.md#5-decisions-needed) |
| DEF-038 behaviour; DEF-009, DEF-010, DEF-018 to DEF-021, DEF-027, DEF-028; K-1 to K-6; FR-011 AC3; wiring the specs into the app | [QA-004 §4](../QA-004-defect-register.md#4-r1-obligations-that-are-not-defect-rows) |
| No hosted CI run on this branch | `verification/README.md` |

## 5. Decisions needed from the Product Owner

1. **Review and accept (or return) GOV-004, CUR-001 and QA-004**, stating the scope of each.
2. **GOV-004:** confirm the definition of a material change, especially that thresholds and island year labels count as curriculum changes.
3. **CUR-001:** confirm RC-007 (DfE programme as the only year source; 11+ items unsourced candidates); decide which, if any, 11+ candidates enter a later release; decide what to do about island year labels that differ from the statutory placement.
4. **QA-004:** confirm closure of DEF-022 to DEF-026 or ask QA to retest; triage DEF-011 to DEF-017; decide DEF-001 (is the island list on Home a defect in the Fractions-first scope).
5. **Step 4:** answer Q-A to Q-F in the [handoff](R0-step4-handoff.md) and authorise a start.
6. **R0 close:** the remaining R0 items outside this round are recorded in [STATUS](../STATUS.md); UX-003 AC3 must still be resolved.
