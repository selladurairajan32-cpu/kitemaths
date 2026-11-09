# R0 review-2 correction report

| | |
|---|---|
| **Date** | 6 November 2026 |
| **Branch** | `claude/pensive-pasteur-bs5979`. Development only: no pull request, no merge, no deployment (D-002). |
| **Reviewed commit** | `0b45d12639b5ebd2416ea9e6d4f1233dc3127171` |
| **Final code commit** | `d8ae9c0` (the commit that follows adds records, results and this report only) |
| **Requested decision** | Independent retest of ARCH-001, ARCH-002, ARCH-003, QA-001 and UX-004, now READY FOR QA. Nothing is self-accepted (D-022). |

## 1. Evidence sources

| Source | What it covers |
|---|---|
| **Independent QA** | The reproductions of DEF-029 to DEF-036 on `0b45d12`, and the acceptances recorded in D-023 |
| **Developer local checks** | `npm test`, lint, typegen, `tsc`, build, the regression tests, the probes below. All run by the delivery engineer on this branch. |
| **Developer browser evidence** | Screen comparison, specimen audit, text scaling, production exclusion: scripts in [`../verification/`](../verification/README.md), results in `results/review2/`. Not independently reproduced. |
| **Not run** | A hosted GitHub Actions run (the workflow triggers on pull requests and pushes to `main`); independent reproduction of the browser checks; real devices and screen readers; testing with children |

## 2. Recorded status (D-023)

| Item | Status | Scope |
|---|---|---|
| CUR-002, CUR-003 | **ACCEPTED** | R0 specification scope. Implementation is R1. |
| UX-002 | **ACCEPTED** | **R0 token and specification scope only.** Screen migration (AC2) and DEF-009 stay open for R1; planned R1 tests stay planned; browser and visual tests keep their actual status (developer browser evidence, not independently passed). It does not mean existing screens meet all UX-002 requirements. |
| ARCH-001, ARCH-002, ARCH-003, QA-001, UX-004 | **READY FOR QA** | After correction, below |
| UX-003 | **QA FAILED** | AC3 unresolved (DEF-018 to DEF-021) |

## 3. Findings, corrections and regression tests

| Finding | Correction | Regression tests |
|---|---|---|
| **DEF-029** `divmod(2, MAX_SAFE_INTEGER)` gave `{ q: 1.1e-16, r: 1 }` | The quotient is built from `a % b` (exact in JS), so every intermediate value stays safe. Negative zero is normalised. | `src/maths/maths.test.ts`: the reproduced case; every pair of safe-integer extremes against a BigInt oracle (both divisor signs, negative and zero dividends, divisors larger than the dividend); the definition in BigInt; 3,000 seeded cases; gcd, lcm, checked add and multiply, and `toMixed` at the extremes. **The new tests failed before the fix.** |
| **DEF-030** guard missed `const { localStorage: store } = globalThis` | `globalThis` and `self` may only be the object of a member access. Destructuring, aliases, `Reflect.get(globalThis, …)` and spreads fail, naming the captured capability. Local shadowing and destructuring `document` from an ordinary object are fine. | `src/architecture.test.ts`; fixtures `bad/destructure-global.ts`, `alias-global.ts`, `reflect-global.ts`, `shadow-param-plus-destructure.ts`; positives `local-globalthis-param.ts`, `destructure-nonglobal.ts`, `typeof-globalthis.ts` |
| **DEF-031** guard missed `import "@/lib/store"` from `src/questions` | A layer matrix per import edge (below) and a transitive check over runtime imports that prints the chain | Fixtures `bad/as-questions/import-lib-store.ts` (QA's probe), `runtime-from-fractions.ts`, `indirect-via-helper.ts`; a dedicated test: **the transitive check alone detects the helper case**, with no direct rule broken and the helper not scanned on its own |
| **DEF-032** nested trap fields not validated (`feedback: 123`, object `misconception`) | A shared trap checker for number-entry, fraction-entry and fraction-of | `src/questions/questions.test.ts`, `INVALID` cases with paths `traps[0].feedback` and `traps[0].misconception` |
| **DEF-033** traps the declared comparison would mark correct | One comparison contract, `numericMatches` (exact; round half away from zero; tolerance inclusive, **no fixed allowance**), used for every answer and trap check. Overlapping traps are rejected. The typeable-decimals check no longer uses an epsilon. | QA's cases b and c verbatim, negatives, overlaps; "numeric comparison contract": exactly at, just inside and just outside the boundary; a 1e-12 tolerance must not accept 2e-12; rounding of negatives |
| **DEF-034** duplicate fraction traps accepted | Duplicates rejected; equivalent traps too when equivalent answers are accepted; fraction-of duplicates; duplicate match choice texts | QA's case d verbatim, plus the adjacent cases |
| **DEF-035** no model consistency check | Explicit optional `ask` (`shaded`, `unshaded`, `marked`) on `fraction-entry`; checked only where stated. `number-line-place` models must be the same line with the target on its ticks. | QA's case e verbatim (paths `model.intervals` and `target`); `ask` tests; the limitation test below |
| **DEF-036** specimen said "same numerator (not zero)" | Now: same positive numerator, positive denominators, same-sized wholes (specimen, UX-004, and a note in the step-2 correction report) | `src/design-tokens.test.ts`: "states the comparison rule's domain…" |

**The layer matrix.** The type-only column lists layers allowed **in addition**, as types only. A type-only import may
go to the runtime column ∪ the type-only column, so a same-layer type import is always allowed.

| Layer | Runtime imports | Additional type-only imports |
|---|---|---|
| engine | engine | none |
| maths | maths | none |
| lessons | lessons | engine |
| curriculum | curriculum | engine, lessons |
| questions | questions, maths | engine, lessons, fractions-content |
| fractions-content | fractions-content, engine, maths | lessons |

Same-layer type imports are covered by good fixtures (`type-only-engine.ts`, `as-maths/type-only-same-layer.ts`).

## 4. Decisions on scope, as they were applied

- **No fixed epsilon.** Tolerance is inclusive and adds no allowance. The rounding rule, including negatives, and the
  floating-point caveat are in ARCH-002 §3.1.
- **Representation meaning is explicit.** The validator never chooses whichever reading makes an answer pass. Adapters
  set `ask` from the existing data's own meaning (`countedParts`). Where `ask` is absent the answer is **not checked
  against the model**. That is a recorded limitation, and a test shows the same answer fails once `ask` says "shaded".
- **No blanket bans.** Pre-shaded models for `shade` and pre-marked number lines are allowed as scaffolding (tested).
- **Not checked, recorded as limitations** (the data doesn't carry the meaning): `choose-one` options that are fractions
  written as text, and `match` row pictures against their paired choices.
- **No automatic exemptions.**
  - The stronger validator was run over 50,959 generated and authored definitions (every kit template × difficulty × 150
    seeds, and every Fractions question), with no exception filter.
  - It found **no new failures**: only the same 152 questions in 14 templates (DEF-028).
  - The DEF-028 exception is narrowed to a `number-entry` question, the trap-value path and exactly "repeats another
    trap". No new exception list was created.

## 5. Probes

| Probe | Result |
|---|---|
| QA's two probe files, copied into `src/engine` and `src/questions` | Both fail (A1 and A7): the destructure, then the matrix and the `lib/store` → `window` chain. Removed. |
| The new validator tests run against the **old** validator | 8 fail; they pass on the new one. The old file was restored. |
| The new `divmod` tests before the fix | Failed; pass after |

All probe files were removed; `git status` was clean apart from the intended changes.

## 6. Checks run (developer, local, at `d8ae9c0`)

| Check | Result |
|---|---|
| `npm test` | 16 files, **265 tests, all pass** |
| `npm run lint` | Pass |
| `npx next typegen` then `npx tsc --noEmit -p .` | Pass |
| `npm run build` | Pass |
| Production exclusion (`VERCEL_ENV=production`) | `/design-specimen` → 404 with `noindex`; `/` → 200 |
| **38 unchanged child-facing screens and states** vs the pinned `6050e3c` baseline (fresh worktree, `npm ci`) | Run 1: 24 differing pixels in one screen's header strip. Two captures of the baseline alone also differed by the same pixels, so this is noise. Run 2: **no differences in the tested screens and states.** Both runs are kept, and no baseline was replaced. |
| **The specimen**, separately (it changed on purpose) | Not part of any zero-difference claim. Evidence regenerated. Audit: 272 elements, 0 below the contrast minimum; no content overflow at 1280, 390, 200% text or 320px (page overflow is the shared header, DEF-018). |
| Generated-question comparison `6050e3c` vs `d8ae9c0` | 51,098 questions, 0 differ (`divmod` has no production caller) |

Results: [`../verification/results/review2/`](../verification/results/review2/).

## 7. Outstanding R1 defects and limits

- UX-003 AC3: DEF-018 to DEF-021 (fix and retest early in R1). DEF-009 and DEF-010.
- DEF-027 (existing unchecked fraction functions outside their domain) and DEF-028 (duplicate traps in 14 preview-island
  templates). The generators are not changed here.
- Coupling K-1 to K-6; FR-011 AC3 (`TC-FR-011.3.1` failing); UX-005 AC3.
- Wiring the evidence rules, recommendations, the lesson schema additions, the question schema and the tokens into the
  app (R1).
- Limits of this evidence: no hosted CI, no independent browser reproduction, no children testing.
