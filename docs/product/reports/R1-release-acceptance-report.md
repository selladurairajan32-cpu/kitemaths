# R1 release acceptance report (QA-007)

| | |
|---|---|
| **Date** | 9 November 2026 |
| **Release** | R1, the Fractions prototype (backlog §6, steps 4 to 11), built under D-026 |
| **Branch** | `claude/pensive-pasteur-bs5979`. No pull request, merge or deployment (D-002). Production is unchanged. |
| **Final acceptance decision** | **Not made.** Only the Product Owner accepts (D-022). This report gives the evidence for that decision. |

## 1. Features delivered (none accepted yet)

| Step | Items | State |
|---|---|---|
| 4 | UX-005 shell and navigation, FR-011 evidence-based journey, ARCH-004 persistence; UX-003 AC3 fixes | READY FOR QA; UX-003 READY FOR RETEST |
| 5–7 | FR-002 to FR-009 (FR-009 is a **new** lesson), LAB-001 to LAB-007 (one lab state, a lab number line with drag) | READY FOR QA |
| 8 | PRACT-001 to PRACT-008 (run-time question validation, variation document) | READY FOR QA |
| 9 | MIS-001 to MIS-005 (catalogue, distractor map, transfer questions) | READY FOR QA |
| 10 | FR-001, FR-010, ARCH-005, MAST-002 to MAST-005 | READY FOR QA |
| 10 | **MAST-001** | **BLOCKED**: the varied-examples criterion needs a decision (MAST-001 §4) |
| 11 | UX-006 to UX-008, QA-002, QA-003, QA-005, QA-006, QA-007, CUR-004 (review pack) | READY FOR QA |

Accepted R0 items are unchanged. GOV-004, CUR-001 and QA-004 are still READY FOR QA from R0.

## 2. Tests actually executed

| Test | Where | Result | Kind of evidence |
|---|---|---|---|
| `npm test`: 34 files, **379 tests** (unit, content, documents, and component tests in jsdom) | Local, 9 Nov | All pass | Developer |
| `npm run lint`; `next typegen` + `tsc --noEmit` | Local, 9 Nov | Pass | Developer |
| `npm run build` | Local, 9 Nov | Pass | Developer |
| GitHub Actions CI (the four checks above) on the step 10–11 commit | Hosted | see §2.1 | Hosted CI |
| `journey-e2e.cjs`: full child journey, links, placeholders | Local production build | **18 / 18** | Developer browser |
| `r1-quality-pass.cjs`: 11 screens × 5 widths, axe, keyboard, targets | Local production build | All clean (summary in `verification/results/r1/quality-pass/`) | Developer browser |
| `text-scaling.cjs`: 200% text at 390/768/1280, 320 px reflow | Local production build | Clean except the internal specimen at 768 px | Developer browser |
| `r1-step4-checks.cjs`: navigation, hubs, evidence status, reload | Local production build | **42 / 42** | Developer browser |

### 2.1 Hosted CI

CI now runs on pushes to `claude/**` (QA-006). The run for the step 10–11 commit is recorded in `STATUS.md` once it finishes; see the run list for `ci.yml` on this branch.

### 2.2 Not tested ("not tested" is never reported as passed)

- **No independent QA** of any R1 item: everything above is the developer's own evidence.
- **No independent content review** (CUR-004): the review pack is ready; the review is not done.
- **No screen reader** (VoiceOver, TalkBack, NVDA) and **no real phones or tablets**: touch and drag were emulated.
- **No testing with children or parents**: whether wording and reports are understandable (MAST-004 AC3, FR-001 "low-pressure") is unverified.
- **Preview islands** (18 non-Fractions islands) were not tested beyond the shared shell.
- The end-to-end and browser scripts are **not in CI** (they need a running build).

## 3. Unresolved defects

From the [defect register](../QA-004-defect-register.md) (39 defects):

| State | Defects |
|---|---|
| Open | DEF-001 (Product Owner call: new learners start on Fractions), DEF-027 (unchecked fraction functions outside their domain), DEF-028 (duplicate traps in preview templates) |
| Fixed, not independently retested | DEF-002 to DEF-026 except DEF-001, and DEF-039. **DEF-022, DEF-023, DEF-024 are High**: they block acceptance until a retest is recorded (QA-004 AC2). |
| Partly fixed | DEF-038: kit marking still differs from the comparison contract. Marking was **not** moved to the question schema in R1, so it does not affect R1 behaviour; it remains a gate. |

No Critical defect is known. Backlog §6: "R1 is not accepted if … a critical/high defect remains open", so the High defects above need their retests first.

## 4. Known limitations

- Mastery's varied-examples criterion (MAST-001, BLOCKED).
- Coverage ratings in CUR-001 are desk judgement.
- Couplings K-1 to K-6 remain (ARCH-001).
- Learners' existing lesson completions now show as "finished" until there is evidence (RC-008 Q-A); stars are kept.
- The step-4 handoff questions were answered by RC-008 for confirmation.
- The internal design specimen overflows at 768 px with 200% text.

## 5. Decisions needed from the Product Owner

1. **MAST-001:** approve or reject `SECURE_MIN_FORMS = 2` (or another variety rule).
2. **Confirm RC-008 to RC-010** (step-4 answers, prerequisite rule, core skills and fading hints).
3. **DEF-001:** is starting every new child on Fractions a defect in the Fractions-first scope?
4. **Arrange independent QA** of the R1 items, the High-defect retests, and the CUR-004 content review.
5. **Final R1 acceptance decision**, after those, citing a `D-` record.
