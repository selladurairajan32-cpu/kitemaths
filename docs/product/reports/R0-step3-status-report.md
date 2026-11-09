# R0 status report: sprint step 3 (ARCH-002, ARCH-003, QA-001)

| | |
|---|---|
| **Date** | 5 November 2026 |
| **Branch** | `claude/pensive-pasteur-bs5979`. Development only: no pull request, no merge, no deployment (D-002). |
| **Authorised by** | D-012 (step 2) and the Product Owner's instruction of 5 Nov to continue with step 3 after the step-2 corrections |
| **Commits** | <ul><li>`e970f8b`: ARCH-003 and QA-001.</li><li>`d100ff1`: ARCH-002.</li><li>The commit that adds this report: status, traceability, results.</li></ul> The step-2 corrections are a separate group, `f0f2ecd` to `2a33cad` ([correction report](R0-step2-correction-report.md)). |
| **Requested decision** | Independent QA of ARCH-002, ARCH-003 and QA-001. All three are READY FOR QA; none is self-accepted. |

## 1. Delivery against each acceptance criterion

### ARCH-003: pure mathematical modules

| Criterion | Evidence | Result |
|---|---|---|
| AC1. Core calculations and validators are pure functions independent of UI | <ul><li>`src/maths/fraction.ts`, `integer.ts` and `place-value.ts`.</li><li>Rule A2 (rebuilt guard) passes: maths depends only on maths and uses no browser or network globals.</li><li>The domain spec ([ARCH-003](../architecture/ARCH-003-maths.md)) was written first. It covers safe integers, overflow, NaN and Infinity, mixed-number sign, Euclidean divmod and partitions.</li></ul> | Met for the new functions. The existing functions keep their unchecked behaviour (§5 of the spec, DEF-027). |
| AC2. Edge cases are covered by unit tests | `src/maths/maths.test.ts` covers: zero and negative denominators, non-integers, NaN, Infinity, division by zero, overflow (including a value just below 2^53 that must stay exact), invalid mixed numbers, and empty, duplicate, out-of-range and unequal partitions | Met |
| AC3. The UI never becomes the source of mathematical truth | <ul><li>K-7 fixed: place-value digit maths moved out of the UI file `kit/visuals.tsx` into `src/maths/place-value.ts`, and A6's list shrank.</li><li>The duplicated `gcd`, `best()` and `factors` in three islands were replaced by the maths modules.</li><li>`representations.test.ts` checks that pictures agree with answers.</li></ul> | Met for the duplicates found. The remaining coupling (K-1 to K-6) is R1. |

**Behaviour preserved.**
- `compare-generated-questions.mjs` regenerated every practice and assessment question, and every kit template ×
  difficulty × 150 seeds (51,098 questions, with answer texts), at `6050e3c` and at `d100ff1`. **None differ.**
- A deliberate one-character change to `best()` was detected (18 differing), which shows the comparison is sensitive. It
  was reverted.
- The screen comparison found **no differences in the 38 tested screens and states**, including the place-value island
  and lesson.

### QA-001: maths unit tests

| Criterion | Evidence |
|---|---|
| AC1. Fraction arithmetic, equality, simplification, comparison, part-of-quantity, partition mapping and core arithmetic | <ul><li>**Hand-worked tables** for add, subtract, multiply, divide, simplify, equivalence, compare, fraction of an amount, mixed numbers, factors, lcm, divmod, place value and partition mapping.</li><li>**A 2,000-case seeded check** against an independent BigInt oracle written in the test. It never uses the function under test.</li><li>**`representations.test.ts`**, per interaction: name the fraction (shaded or unshaded count over equal parts); shade (target is a whole number of parts); compare (cross-multiplication); number line (target on a tick, only that tick right); equal parts (unequal pictures rejected); match; fraction of an amount; missing number; counterexample (hand-picked breaking and fitting pairs); explain frame.</li></ul> |
| AC2. Boundary and invalid-input cases | See ARCH-003 AC2. Each throws a `RangeError` with a message naming the input. |

**Requirement mapping:** every test title is mapped to its criterion in `traceability/test-cases.csv` (TC-ARCH-003.\*,
TC-QA-001.\*).

**Regression cases for known defects.** The existing functions' out-of-domain results (DEF-027) are **not** locked into
the tests as acceptance. They are recorded as a defect, with a planned R1 test case (TC-ARCH-003.2.7).

### ARCH-002: typed question schema

| Criterion | Evidence | Result |
|---|---|---|
| AC1. Skill, year/level, difficulty, prompt, interaction type, correct answer, distractors, validation, explanation, hints, misconception tags, scoring | <ul><li>`src/questions/schema.ts` is a JSON-serializable union over 12 interactions, each with its own answer, validation and scoring. Spec: [ARCH-002](../architecture/ARCH-002-question-schema.md) §2–§3.</li><li>Multi-select uses a unique id array with set semantics.</li><li>Counterexample is a named predicate with parameters.</li><li>Level is verified years or an explicit `"unverified"`; adapters never invent one.</li></ul> | Met as a contract. **Not yet used by the app** (no child-facing change). |
| AC2. Invalid definitions fail validation | <ul><li>`validateQuestion` returns every error with a path and message.</li><li>At least 2 invalid fixtures per interaction, each asserting its error path.</li><li>Common-field cases: bad id, level, difficulty, hints, scoring, partial credit on a single-answer interaction, unknown interaction, unknown field.</li></ul> | Met |

**Compatibility with existing data.** Every Fractions question validates through `fromFractionQuestion`. Every kit
question validates through `fromKitQuestion` (practice, assessment, and each template × difficulty × 20 seeds), apart
from DEF-028:
- 14 preview-island templates sometimes give two traps the same value, so the second trap's feedback can never show;
- the validator rejects them, as it should;
- the test tracks those templates with a list that may only shrink.

## 2. Checks run (local, on this branch, at `d100ff1`)

| Command or check | Result |
|---|---|
| `npm test` | **16 files, 247 tests, all pass** |
| `npm run lint` | Pass |
| `npx next typegen` | Pass |
| `npx tsc --noEmit -p .` | Pass |
| `npm run build` | Pass |
| Production exclusion (`VERCEL_ENV=production` build) | `/design-specimen` → 404 with `noindex`; `/` → 200 |
| Screen comparison: `6050e3c` vs `d100ff1`, 38 screens and states at 1280 and 390 | No differences in the tested screens and states |
| Specimen audit | 270 elements checked, 0 below the contrast minimum, no content overflow under 5 conditions |
| Generated-question comparison | 51,098 questions; 0 differ |

Results: [`../verification/results/step3/`](../verification/results/step3/).

**Not run:**
- a hosted GitHub Actions run (the workflow runs on pull requests and on pushes to `main` only);
- independent reproduction of the browser checks;
- testing with children.

**Mistakes caught and corrected during this step:**
- The first ARCH-003 commit had a TypeScript error (BigInt literals below ES2020) and an unused import. Both were fixed
  and the unpushed commit was amended before any push.
- A probe revert with `git checkout` briefly discarded an unrelated uncommitted edit. It was reapplied and verified.

**Probes removed:**
- the engine architecture probe;
- the contrast and size mutations;
- the `best()` mutation;
- the temporary `src/tmp/` probes.

The comparison tool removes its own temporary test file. `git status` is clean.

## 3. Status

| Item | QA status | Not yet done (later, authorised work) |
|---|---|---|
| ARCH-002 | READY FOR QA | Using definitions in the app; DEF-028 in the generators; year mappings (CUR-001) |
| ARCH-003 | READY FOR QA | DEF-027 (route existing functions through the checked ones); K-1 to K-6 |
| QA-001 | READY FOR QA | Regression tests for DEF-027 once fixed |

New defects: DEF-027 and DEF-028, both Low (see [`STATUS.md`](../STATUS.md#open-defects-affecting-status)).
