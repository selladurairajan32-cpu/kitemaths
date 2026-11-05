# R0 step-2 correction report

| | |
|---|---|
| **Date** | 5 November 2026 |
| **Branch** | `claude/pensive-pasteur-bs5979`. Development only: no pull request, no merge, no deployment (D-002). |
| **Reviewed commit** | `6050e3c` (step 2). Step-1 baseline: `8f7408d`. |
| **Review disposition** | ARCH-001, CUR-002, CUR-003, UX-002, UX-003 and UX-004 were set to QA FAILED (D-014). |
| **Correction commits** | <ul><li>`f0f2ecd`: review record and Q-1 to Q-7.</li><li>`8910dff`: architecture guard.</li><li>`6a42662`: contrast.</li><li>`48f7925`: curriculum rules.</li><li>The commit that adds this report: verification tooling, results, status.</li></ul> |
| **Requested decision** | Independent retest of the five items returned to READY FOR QA. UX-003 stays QA FAILED (D-021). |

**Nothing here is self-accepted.** Every check below is a local run by the delivery engineer:
- no GitHub Actions run exists for this branch, because the workflow runs only on pull requests and on pushes to `main`;
- the browser checks are reproducible with the scripts in [`../verification/`](../verification/README.md), but have
  not yet been independently reproduced.

## 1. Findings, corrections and evidence

| Finding | Correction | Evidence |
|---|---|---|
| **DEF-022, contrast** (UX-002/003/004): white "Challenge" on gold 2.45:1; white "Watch me" on teal 4.29:1; small denominators on tints 4.12–4.37:1. The test accepted 4:1 and missed white-on-colour labels. | <ul><li>New label backgrounds: `--color-example-strong` (white 7.86:1) and `--color-challenge-strong` (white 7.12:1). The `-edge` colours are never behind text.</li><li>On tinted panels, fraction digits use `--color-den-strong` (at least 5.93:1) through an opt-in `tint` prop on `RichText` and `FractionNotation`. It is off by default, so screens are unchanged.</li><li>UX-004 §2.3 lists **52 supported pairings** with size, weight, kind, the minimum (4.5:1 normal text, 3:1 large text and icons) and the 7:1 product target for content ink.</li></ul> | <ul><li>`src/design-tokens.test.ts` recomputes every ratio from `globals.css` without rounding. It checks the minimum follows from size and weight, and reads fraction-digit sizes from `FractionNotation` (inline 16.56px, sm 16px).</li><li>**Mutation checks:** setting the ribbon back to the old gold fails the test (2.45 < 4.5); changing the inline fraction size fails the size test. Both were reverted.</li><li>**Browser audit** of computed colours (`specimen-audit.cjs`): at `6050e3c`, 11 elements below the minimum, matching the review; at `48f7925`, 270 elements checked, **0 below the minimum**.</li></ul> |
| **DEF-023, architecture guard** (ARCH-001): side-effect UI import, dynamic React import and `window.localStorage` in an engine file all passed. | <ul><li>`src/architecture/analyse.ts` uses the TypeScript compiler and the project's module resolution. It covers static, side-effect, type-only, re-export, `import =`, `import()` and `require()` imports, including relative traversal and `@/`.</li><li>Unresolved and non-literal module names fail.</li><li>An explicit list of browser and network globals is found by symbol origin, so it is scope-aware. That includes `globalThis.X`, `globalThis["X"]` and computed access. Node-typed `fetch` is found too. Standard APIs are never flagged.</li><li>`.tsx` files in pure layers are checked by behaviour.</li></ul> | <ul><li>15 bad fixtures, each failing for the expected reason, and 5 good fixtures that pass. Covered: comments, strings, property names, local shadowing, a shadow plus a real global, a pure `.tsx` file.</li><li>The reviewer's probe, copied into `src/engine/`, fails A1 on all three faults, then was removed.</li><li>The stronger check found **two existing couplings the old one missed**, recorded as **K-6** (the registry imports the Fractions composition root) and **K-7** (place-value digit maths imported from a UI file). They are not added to the documented allowlist. K-7 is removed by ARCH-003 in step 3.</li></ul> |
| **DEF-024, evidence and mastery** (CUR-002/003): answers given after hints or retries counted; a lab rule allowed one practice answer. | <ul><li>CUR-002 §3–§4 separates activity completion, supported evidence, independent evidence and skill mastery. This is a conceptual distinction, not a state machine.</li><li>An attempt table covers first attempts, hints, retries and reveals: "an answer to the revealed item cannot count as independent evidence"; a later fresh transfer item can.</li><li>One independence contract for final questions and a mastery-check step (Q-1). Lesson evidence never awards mastery.</li><li>Mastery thresholds stay with MAST-001; today's constants are listed as adjustable.</li><li>A later needs-review result overrides placement.</li><li>A table says which state drives recommendations, prerequisites, map labels and rewards.</li></ul> | <ul><li>Specification: CUR-002 §3–§4.</li><li>Planned R1 test cases `TC-CUR-002.3.2` to `.3.5`.</li></ul> |
| **DEF-025, lab recommendation gap** (CUR-002) | <ul><li>Rule 3b sends a completed-but-unevidenced lesson to **targeted practice** on its skill. For the lab, that is `fractions.represent`.</li><li>After an assisted or wrong answer: targeted support, then a fresh independent question.</li><li>**No attempt limit and no automatic progression.** Manual navigation stays open and awards nothing.</li></ul> | CUR-002 §5.1, with a Given/When/Then acceptance scenario (planned R1 test `TC-CUR-002.3.3`) |
| **DEF-026, freshness claim** (CUR-003) | <ul><li>The `g:` claim is removed. A new id is not a new example.</li><li>Freshness is defined by a surface signature: operands, model and partition.</li><li>Generation is deterministic and bounded: at most K re-seeds, then other templates with the same skill, difficulty and interaction, then a `FreshnessExhausted` authoring error. It never loops and never reuses the demonstrated example.</li><li>Verification cases are listed.</li></ul> | CUR-003 §2, rule 4; planned R1 test `TC-CUR-003.1.5` (CUR-003, MIS-005) |
| **Ratchet limit** (UX-002) | A hex-*occurrence* ratchet is added (baseline 101), because counting files let values be added inside existing files. The remaining limit is documented: a count can't stop one value being swapped for another. | UX-002 §4; the ratchet test |

## 2. Product decisions recorded (D-015 to D-021)

| Q | Decision | Where applied |
|---|---|---|
| Q-1 | Final independent questions for short single-skill lessons; a mastery-check step when several skills need evidence. One independence contract; neither awards mastery. | CUR-002 §4.2, CUR-003 element 9 |
| Q-2 | Move `naming`'s early question after the worked example in R1. A question before teaching is allowed only as a labelled, optional prior-knowledge check with no consequence. | CUR-003 element 2, §3; CUR-002 §6 |
| Q-3 | One brief reflection per lesson (a frame, a choice or spoken). No typed prose, never a mastery gate. A fuller reflection at the end of a group. | CUR-003 element 8 and the schema |
| Q-4 | Keep `number-line` after the Explore lessons and `reasoning` after `amounts`. **Checked against the content:** `number-line` uses only lessons 1–2; `reasoning` uses lessons 2, 4 and 5 and not `amounts`. | CUR-002 §6 |
| Q-5 | "Best after" for fractions of quantities only. Support is given in the lesson, and children are never sent to an activity that doesn't exist yet. Foundational Fractions never depends on the whole Times tables island. | CUR-002 §2.2 |
| Q-6 | Direction approved; contrast corrected. "Optional challenge"; "Worked example". The comparison rule is restricted to a non-zero numerator and same-sized wholes. Agreed misconception wording. | UX-004 §2, the specimen |
| Q-7 | UX-003 stays QA FAILED while AC3 is unmet. Approval of the specification is separate from acceptance of the item. | UX-003 header and §7, `STATUS.md` |

## 3. Status after correction

| Item | QA status | Remaining R1 work (not part of these corrections) |
|---|---|---|
| ARCH-001 | READY FOR QA (D-022) | Couplings K-1 to K-6. K-7 is removed in step 3. |
| CUR-002 | READY FOR QA (D-022) | Wire the evidence rules and recommendations into the app (FR-011, MAST-001). Today lessons still complete on traversal (`TC-FR-011.3.1` failing). |
| CUR-003 | READY FOR QA (D-022) | The schema additions and player support (RC-005); the fresh-example generator; reordering `naming`. |
| UX-002 | READY FOR QA (D-022) | Migrate screens to the tokens (RC-006); DEF-009. |
| UX-003 | **QA FAILED (D-021)** | AC3: DEF-018 to DEF-021, fix and retest early in R1; DEF-010. |
| UX-004 | READY FOR QA (D-022) | Migrate screens to the content types; lesson usability testing with children. |

**What the specimen does not show.** It shows the visual treatments and their contrast. It does **not** show that
children can use them, or that they identify the task and the next action. That needs lesson usability testing with
children in R1 (UX-004 §4).

## 4. Checks run (local, on this branch)

| Check | Result |
|---|---|
| `npm test` | 13 files, 215 tests, all pass. Includes 10 architecture tests (up from 6) and 9 design-token tests (up from 7). |
| `npm run lint` | Pass |
| `npx next typegen` then `npx tsc --noEmit -p .` | Pass |
| `npm run build` | Pass at `48f7925` |
| Production exclusion | Built with `VERCEL_ENV=production` at `48f7925`: `/design-specimen` → 404 with `noindex`; `/` → 200 |
| Screen comparison | Baseline `6050e3c` (worktree, `npm ci`, production build) vs head `48f7925`. 38 screens and states at 1280 and 390, Chromium, reduced motion. **No differences in the tested screens and states.** This does not prove every possible state is unchanged. |
| Specimen audit | Contrast as in §1. The specimen's own content has no sideways overflow at 1280 and 390, at 100% and 200% text, or at 320px. Page overflow at 200% text and at 320px comes from the shared header only (DEF-018). |
| Text scaling (existing screens) | Unchanged from 4 Nov: DEF-018 to DEF-021 remain |

Results: [`../verification/results/step2-correction/`](../verification/results/step2-correction/). Updated specimen
screenshots: [`../design/evidence/screens/`](../design/evidence/screens/).

**Not run:**
- a hosted CI run (the workflow doesn't trigger on this branch);
- screen-reader and real-device testing;
- usability testing with children.

**Probes removed:** the engine probe, and the two mutation edits (the ribbon colour and the inline fraction size).
`git status` was clean apart from the intended changes.
