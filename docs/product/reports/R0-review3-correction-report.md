# R0 retest correction report (ARCH-002)

| | |
|---|---|
| **Date** | 6 November 2026 |
| **Branch** | `claude/pensive-pasteur-bs5979`. Development only: no pull request, no merge, no deployment (D-002). |
| **Retested commit** | `702743a` (independent retest) |
| **Final code commit** | `5162804`; the commit after it adds records and this report only |
| **Requested decision** | Independent retest of ARCH-002, now READY FOR QA. Not self-accepted (D-022). |

## 1. Recorded (D-024)

- DEF-029 to DEF-036 are **closed as independently verified**.
- ARCH-001, ARCH-003 and QA-001 are ACCEPTED for delivered R0 scope; UX-004 for R0 specification and specimen scope.
  CUR-002, CUR-003 and UX-002 keep their scoped acceptances. UX-003 stays QA FAILED. Existing R1 obligations and the
  browser-evidence limitations are unchanged.
- The two new findings are recorded separately from the eight closed ones: **DEF-037** and **DEF-038**.

## 2. Findings, corrections and regression tests (`src/questions/questions.test.ts`)

| Finding | Correction | Regression tests |
|---|---|---|
| **DEF-037.** `numericMatches(round 1, MAX_SAFE_INTEGER, MAX_SAFE_INTEGER − 1)` returned true; `1e308` and `1.1e308` also, after both scaled to Infinity. The validator then rejected a distinct trap as correct. | The supported domain is defined: `|value × 10^places| ≤ MAX_SAFE_INTEGER`. `roundDomainError` reports a number outside it, `numericMatches` **throws a `RangeError`** instead of returning a lossy boolean, and the validator rejects the answer or trap with its path and the reason. Tolerance and exact are unchanged; **no epsilon** is added. | "rounding is only applied where scaling is exact": both of QA's examples and their negative counterparts; the exact domain boundary; distinct values at places 0 stay distinct; ordinary and negative rounding unchanged; the no-epsilon contract kept; validator paths (`answer`, `traps[0].value`); in-domain distinct values accepted and genuine collisions still rejected. **Written first and failing.** |
| **DEF-038.** The claim that adapters faithfully reproduce existing marking is wrong: kit `same()` rounds halves toward +∞ and has a 1e-9 allowance. Answer −5, response −5.0005: kit true, new false. | ARCH-002 §4 and the adapter comment now say so. **App behaviour is unchanged.** The difference is an **R1 integration prerequisite**: resolve it (move kit marking to the contract, or add an explicit legacy comparison kind) before any marking goes through the schema. No hidden epsilon is added to the contract. | "adapters do NOT reproduce existing kit marking exactly": the negative-tie example, the 1e-9 example, a 10,000-pair sweep in which every disagreement is explained by those two causes, agreement on ordinary values, and the adapter's declared comparison. A planned R1 test case records the prerequisite. |

**Real data.** The validator was re-run, with no exception filter, over 50,959 definitions. The result is unchanged: only
the existing 152 DEF-028 questions in 14 templates. The DEF-028 exception is the narrow one from the last round, and no
new exception list exists.

## 3. Checks run (developer, local, at `5162804`)

| Check | Result |
|---|---|
| `npm test` | 16 files, **276 tests, all pass** |
| `npm run lint` | Pass |
| `npx next typegen` then `npx tsc --noEmit -p .` | Pass |
| `npm run build` | Pass |

**Not re-run, because nothing they cover changed:** the screen comparison, the specimen audit, the production-exclusion
build and the generated-question comparison. The changes are confined to `src/questions/` (not used by the app), tests
and documents. The last results are in [`../verification/results/review2/`](../verification/results/review2/).

**Not run at all:** a hosted GitHub Actions run, independent reproduction of the browser checks, real devices and
screen readers, testing with children.

## 4. Outstanding

- **R1 prerequisite (DEF-038):** resolve the kit-marking difference before marking through the schema.
- DEF-028 (duplicate traps in 14 preview-island templates) and DEF-027; the R1 obligations of the accepted items; UX-003
  AC3 (DEF-018 to DEF-021).
