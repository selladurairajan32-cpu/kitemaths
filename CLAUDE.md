# Kite Maths: project memory

UK KS2 + 11+ maths web app. Next.js 16.4.3, React 19, Tailwind v4, vitest. Read `AGENTS.md` first: this Next.js has
breaking changes, so read the relevant guide in `node_modules/next/dist/docs/` before writing Next-specific code.
(`AGENTS.md` is rewritten by `next dev`; don't edit it.)

## Working rules (from the Product Owner, D-002, D-006, D-012)

- **Development branch only:** `claude/pensive-pasteur-bs5979`. No pull request, merge or deployment unless the Product
  Owner explicitly asks. Production is https://kitemaths.vercel.app (`main` at `bbf210a`); do not touch it.
- **No change to existing child-facing screens** (appearance or behaviour) unless an item says so. Screen migration, the
  accessibility layout fixes and wiring new specs into the app are R1 work.
- **Preserve the architecture; no broad rewrites.** Additive foundations and behaviour-preserving extraction only.
- **Implemented is not accepted.** Only the Product Owner sets ACCEPTED, citing a decision in `DECISIONS.md`. Corrected
  items go to READY FOR QA, never ACCEPTED (D-022). Record decisions and requirement changes.
- **Never create a PR** unless asked. Commit messages end with the attribution lines the session gives. Put no model
  identifier in code or docs.
- Prefer separate, focused commits (corrections apart from new work). Don't claim a check passed if it wasn't run;
  keep developer evidence separate from independent QA evidence.

## Source of truth: `docs/product/`

| File | Holds |
|---|---|
| `backlog.md` | Backlog v1.0: 97 items, 270 acceptance criteria (unchanged) |
| `STATUS.md` | QA status vs implementation evidence per item; defect register (DEF-nnn) |
| `DECISIONS.md` | D- decisions, RC- requirement clarifications, CH- change history |
| `traceability/` | `requirements.csv`, `test-cases.csv`, README with coverage; checked by `src/traceability.test.ts` |
| `architecture/`, `curriculum/`, `design/` | ARCH-001/002/003, CUR-002/003, UX-002/003/004 specifications |
| `reports/` | Status and correction reports per round |
| `verification/` | Reproducible browser and comparison scripts, with results |

Test-case rule: every test file must be referenced by a test case; automated references must exist (`file::title`);
only accepted items may have `accepted` cases. Update `test-cases.csv` in the same commit as any test change.

## State (6 Nov 2026)

`docs/product/STATUS.md` is the authoritative status register; check it for current statuses and counts rather than
relying on this summary. Last recorded decision: D-025.

- **Accepted** (each for the scope recorded in `STATUS.md`): GOV-001/002/003, UX-001, CUR-002, CUR-003, UX-002 (R0 token
  and spec scope only), ARCH-001, UX-004 (R0 spec and specimen scope), and the three step-3 items ARCH-002, ARCH-003 and
  QA-001 (delivered R0 scope).
- **QA FAILED:** UX-003 only (AC3 text scaling; DEF-018 to DEF-021 are R1).
- **Open R1 obligations (all preserved):** DEF-009, DEF-010, DEF-027, DEF-028; couplings K-1 to K-6 (ARCH-001 §4);
  FR-011 AC3 (lessons complete on traversal); wiring the specs into the app.
- **DEF-038 is NOT fixed:** the kit's `same()` and the new comparison contract still differ. It is an open R1 integration
  prerequisite (`TC-ARCH-002.1.13`): resolve it before any marking goes through the question schema.
- **Evidence limits:** browser checks, production exclusion and the generated-question comparison are developer evidence
  from 6 Nov, not independently reproduced; no hosted CI run exists for this branch.

## Code layout and guarded rules

- `src/engine` (pure learning engine), `src/maths` (pure maths: fractions, integers, place value), `src/lessons`
  (schema), `src/curriculum` (prerequisite graph, unused by the app), `src/questions` (typed question schema, validator,
  adapters; unused by the app), `src/topics/<island>` (content; Fractions is R1, 18 other islands are unaccepted
  previews), `src/topics/kit` (shared island kit), `src/components`, `src/app`.
- **`src/architecture.test.ts` enforces layer rules** with the TypeScript compiler (`src/architecture/analyse.ts`):
  a dependency matrix per pure layer, a transitive runtime-import check, and a ban on browser and network globals,
  including destructuring or aliasing `globalThis`. Fixtures are in `src/architecture/fixtures/` (excluded from tsconfig
  and ESLint). Never widen the allowlists; they may only shrink.
- **`src/design-tokens.test.ts`:** every text/background pairing in UX-004 §2.3 is recomputed without rounding (4.5:1
  normal text, 3:1 large text and graphics, 7:1 product target for content ink). Ratchets cap one-off `text-[…]` sizes and
  hex colours. Don't add violet tokens (D-013).
- **Maths contracts** (`ARCH-003-maths.md`): safe integers only in the checked functions; overflow throws `RangeError`;
  Euclidean `divmod`; mixed numbers carry an authoritative sign. Existing unchecked functions keep their behaviour.
- **Numeric comparison** (`src/questions/compare.ts`): exact, round half away from zero (only where scaling is exact),
  tolerance inclusive. **No epsilon anywhere in the contract.**
- Tests use independent oracles (BigInt, hand-worked tables), never the function under test.

## Commands (CI runs these four)

```bash
npm test
npm run lint
npx next typegen && npx tsc --noEmit -p .   # typegen first: PageProps/LayoutProps are generated
npm run build
```

Browser checks (need a production build serving on a port and Playwright's Chromium): see
`docs/product/verification/README.md`. A zero-pixel difference means "no differences in the tested screens and states",
and the first capture can show a 24-pixel header-strip flicker that also appears between two captures of the same build.
The design specimen `/design-specimen` is internal: 404 and `noindex` in a `VERCEL_ENV=production` build.

## Gotchas

- Turbopack won't follow a symlinked `node_modules`: a baseline worktree needs its own `npm ci`.
- JSX text doesn't process ` `; use `&nbsp;`.
- tsconfig targets ES2017: no BigInt literals (`1n`); use `BigInt(1)`.
- Temp probes go in the git-ignored `src/tmp/` and must be deleted afterwards. Don't use `git checkout --` to revert a
  probe if you have other uncommitted edits.
