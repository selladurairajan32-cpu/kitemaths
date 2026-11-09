# QA-006: regression suite

| | |
|---|---|
| **Backlog item** | QA-006: regression test suite (P1, R1) |
| **Status** | READY FOR QA (R1, D-026). Not accepted. |

## 1. What runs, and where

| Layer | Command | Runs in CI | What it covers |
|---|---|---|---|
| Unit, content and documents | `npm test` (vitest project `unit`) | Yes | Maths, engine, evidence and recommendations, content correctness, curriculum map, traceability, defects, governance, design tokens, architecture rules |
| Component and integration | `npm test` (vitest project `component`, jsdom) | Yes | Lab, question player, lesson player, warm-up result, grown-ups overview, results, reset |
| Lint and types | `npm run lint`; `npx next typegen && npx tsc --noEmit -p .` | Yes | |
| Build | `npm run build` | Yes | |
| End-to-end journey | `node docs/product/verification/journey-e2e.cjs <out>` against `npx next start -p 3123` | No (needs a running build) | Dashboard → lesson with a mistake and recovery → practice → mastery check → results; dead links; placeholder text |
| Accessibility and responsive | `node docs/product/verification/r1-quality-pass.cjs <out>`, `text-scaling.cjs` | No | §UX-007 audit |
| Shell and journey | `node docs/product/verification/r1-step4-checks.cjs <out>` | No | Navigation, hubs, evidence status on the map, persistence after reload |

**CI now runs on every push to `claude/**` branches** as well as `main` and pull requests (`.github/workflows/ci.yml`), so development commits get a hosted run.

## 2. Rules

1. **After any fix, re-run everything above**, including the browser scripts, before handing over. Previously accepted flows (the R0 foundations) are covered by the unit suite, which runs in CI.
2. **No test is skipped, disabled or quarantined to get green.** A failing test is either fixed or recorded as a defect (QA-004) with a decision; it is never waived without a `D-` decision (GOV-004).
3. **Ratchets only tighten** (architecture allowlists, one-off sizes and colours, motion timings).
4. Browser scripts report "not run" honestly: a script that was not run is not reported as passed (QA-007 AC2).
