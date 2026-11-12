# Kite Maths: project memory

UK KS2 + 11+ maths web app. Next.js 16.4.3, React 19, Tailwind v4, vitest. Read `AGENTS.md` first: this Next.js has
breaking changes, so read the relevant guide in `node_modules/next/dist/docs/` before writing Next-specific code.
(`AGENTS.md` is rewritten by `next dev`; don't edit it.)

## Working rules (from the Product Owner, D-002, D-006, D-012)

- **Development branch only:** `claude/pensive-pasteur-bs5979`. No pull request, merge or deployment unless the Product
  Owner explicitly asks. Production is https://kitemaths.vercel.app (Vercel deploys `main`). R1 was merged to `main` and deployed on 9 Nov 2026 at the Product Owner's explicit request (D-027), the content differentiation changes the same day (D-029), the typography changes (D-031), the D-037 build (CH-069), the D-038 build (CH-074) and the D-039 build (CH-077); any further deployment still needs an explicit request.
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
| `reports/` | Status and correction reports per round, `R0-readiness-report.md`, `R0-step4-handoff.md` |
| `verification/` | Reproducible browser and comparison scripts, with results |

Test-case rule: every test file must be referenced by a test case; automated references must exist (`file::title`);
only accepted items may have `accepted` cases. Update `test-cases.csv` in the same commit as any test change.

## State (12 Nov 2026)

`docs/product/STATUS.md` is the authoritative status register; check it rather than this summary. Last recorded
decision: D-041 (every explanation offers three ways to learn and the child chooses: Watch a narrated film, Step through
with a recorded voice, Try it by hand; shell in `src/components/explain/modes/`, one script per concept
(`engine/explainScript.ts`, listed in `kit/explainScripts.ts`); pilot `/t/fractions-2/explain/add-different` with a new
lesson `fractions-2/different.ts` (Y6.FRAC.3 still partial); ratio page retrofitted; films and voices made by
`tools/films/build.py` (Manim + Piper, free; media in `public/films`, `public/voice`; after changing a script run
`UPDATE_DOCS=1 npx vitest run src/topics/kit/explainScripts.test.ts`, then `build.py <concept>`); free tiers only;
replan: Phase 2 kid pages, 3 ten hardest concepts, 4 homepage and dashboards, 5 Supabase then one launch; CH-082 to
CH-085; report `docs/product/reports/D-041-phase-1-report.md`; READY FOR QA, not deployed). D-040 (premium redesign from reference images; Phase 1 built: a WebGL 3D ratio explanation page at
`/t/ratio-algebra/explain/ratio`, three.js + React Three Fiber in `ratio-algebra/explain/RatioStage3D.tsx` with a 2.5D
SVG fallback, story machine `engine/story.ts`, registry `kit/explanationIndex.ts` + `kit/explanations.tsx`; CH-078 to
CH-081; later phases: kid pages, public homepage and dashboards, Supabase accounts; **no production deployment until
sign-in works end to end**; report `docs/product/reports/D-040-phase-1-report.md`; READY FOR QA). D-039 (on-screen ruler-and-protractor drawing tool for Y6.GPS.1, `shapes-angles/explain/ConstructLab.tsx`,
kit lab `triangle-construct`, `maths/geometry.ts`; Y6.GPS.1 addressed; CH-075; report
`docs/product/reports/D-039-build-report.md`; READY FOR QA, nothing accepted; deployed 11 Nov, CH-077). D-038 (the last 7 untaught Year 3–6 objectives built: thousandths, decimal × and ÷, two unknowns,
triangle and parallelogram area, lines, drawing to size (recognition only, partial); no statutory objective is
untaught; `maths/decimal.ts` for exact decimals; CH-070 to CH-072; report `docs/product/reports/D-038-build-report.md`;
READY FOR QA, nothing accepted; deployed to production 11 Nov, CH-074). D-037 (Product Owner: "do all": UI clarity, depth on every island, 11+ coverage, then deploy; CH-062 to CH-068;
report `docs/product/reports/D-037-build-report.md`; kit lessons guarded by `src/topics/kit/depth.test.ts`; new islands add
content through `withExtras` and `<island>/extra.ts`; new Measures island; exam profiles ISEB/GL/CSSE/SEAG quote official
pages, the rest unknown; READY FOR QA, nothing accepted; deployed to production 11 Nov at the Product Owner's request, CH-069). D-036 (animated explanations v2: blocks, picture and numbers with a child move in each, `Stage` in
`src/components/explain/`, ANIM-001; CH-061; not deployed). D-035 (pilot authorised; CH-060). D-034 (inspection answers: UI clarity, then depth, then 11+ with format research; simplify Home; planned). D-033 (Product Owner answers: MAST-001 2 forms, RC-008 to RC-010 confirmed, DEF-001/027/038 fixed, crosswise
11+ extension, deploy; CH-056 to CH-058). D-032 (build every pending item: R2, R3, R5, audit recommendations, DEF-028; CH-050 to CH-054;
report `docs/product/reports/D-032-build-report.md`; 83 items READY FOR QA, none accepted, not deployed). D-030 (typography and hierarchy audit, CH-046 to CH-048, in
`docs/product/design/typography-hierarchy-audit.md`; one-off text sizes ratchet now 24; deployed to production, D-031). D-029 (content
changes deployed to production; not accepted). D-028 (content differentiation audit and copy changes, CH-042 to CH-044; audit in
`docs/product/design/content-differentiation-audit.md`, recommendations R1 to R10 await decisions). D-027: R1 deployed
to production; not accepted. Clarifications to RC-010.

- **Accepted** (R0, each for the scope in `STATUS.md`): GOV-001/002/003, UX-001, CUR-002, CUR-003, UX-002, ARCH-001,
  UX-004, ARCH-002, ARCH-003, QA-001. Nothing in R1 is accepted.
- **R1 (D-026) delivered, steps 4 to 11:** every R1 item is READY FOR QA except **MAST-001 (BLOCKED:** the
  varied-examples criterion needs a decision). UX-003 is READY FOR RETEST. GOV-004, CUR-001, QA-004 still READY FOR QA.
  Report: `docs/product/reports/R1-release-acceptance-report.md`.
- **Child-facing screens may now change** where an R1 item requires it (D-026 lifts D-012 for R1 only).
- **RC-008 to RC-010** are proposed readings awaiting confirmation (step-4 answers; soft prerequisites; core skills and
  fading hints). Mastery thresholds were not changed (RC-008 Q-B).
- **Defects:** register `docs/product/traceability/defects.csv` (39). DEF-002 to DEF-026 (not DEF-001) and DEF-039 are
  fixed but not independently retested; High ones (DEF-022/023/024) block acceptance until retested. DEF-001, 027, 028
  open. **DEF-038 is NOT fixed**: marking stays in the kit; resolve before any marking uses the question schema.
- **Evidence limits:** browser, end-to-end and accessibility runs are developer evidence (scripts and results in
  `docs/product/verification/`); no screen reader, real devices or children; CUR-004 independent review not done.
  CI now runs on pushes to `claude/**`.

## Code layout and guarded rules

- Component tests: `*.test.tsx` run in jsdom (vitest project `component`, setup `src/test/setup.ts`, animations
  skipped). Docs generated from content (`MIS-001` catalogue, `CUR-004` pack) are refreshed with
  `UPDATE_DOCS=1 npx vitest run <test>`.
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
