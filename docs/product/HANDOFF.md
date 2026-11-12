# Handoff: where Kite Maths stands (12 Nov 2026)

Read this first in a new session, after `CLAUDE.md` and `AGENTS.md`. `STATUS.md` and `DECISIONS.md` are authoritative.

## Branches and production

| | Commit | What it holds |
|---|---|---|
| `claude/clever-cori-42fmz0` | same as `main` | **Latest work: D-043 step 3, the kid pages.** Start new work from here. |
| `main` (production, https://kitemaths.vercel.app) | `0d1852c` + this record | Everything up to D-046 phase 2, deployed on request (D-049, CH-100): the restyled journeys and kid pages are live. |
| `claude/practical-knuth-9126wx` | `ada819a` | Everything up to D-043 step 2. |

- A new session gets its own `claude/…` branch from the platform. Base it on `claude/practical-knuth-9126wx`
  (`git fetch origin claude/practical-knuth-9126wx && git checkout -b <new-branch> FETCH_HEAD`), or ask the Product Owner.
- **No deployment, merge or PR without an explicit request.** The D-040 rule stands: production waits until sign-in works
  end to end; D-042, D-044, D-045, D-047 and D-049 were one-offs. A deployment means fast-forwarding `main` after CI is green, then running
  `verification/live-check.cjs` and recording a CH entry. The session's network must allow `kitemaths.vercel.app` (the
  personal environment "kitemaths" does).

## Where the redesign is (D-040 → D-041 → D-043)

**Done, READY FOR QA, nothing accepted:**
- **Topic journey** at `/t/[topic]/learn/[concept]`: Learn (Watch, Step through, Try it) → Practise → Apply → Check (the
  unchanged MAST-001 recheck) → Complete. It exists for two concepts: `fractions-2/add-different` and `ratio-algebra/ratio`.
  `/explain/…` redirects to it.
- **Emma's teaching voice** (Kokoro), teacher scripts with `[pause]` and `[think]`, and pizza visuals for fractions.
- Report: `reports/D-043-step-2-report.md`.

- **Kid pages (step 3)**, built, READY FOR QA, deployed on request (D-045, CH-094): navigation Home · Topics · Practice · Tests · Progress with a
  level bar; Home with Continue Learning and today's plan; `/topics`, `/practice` (now a hub), `/tests`, `/progress`
  (mastery ring and topic bars). Report: `reports/D-043-step-3-report.md` (CH-092, CH-093).

- **D-046 phase 1** (built, READY FOR QA, deployed on request, D-047, CH-097): the two journeys in the sky-and-glass look of the concept
  images; stars are called XP; 2D pizzas kept (the Product Owner's choice). Report: `reports/D-046-phase-1-report.md`
  (CH-095, CH-096).
- **D-046 phase 2** (built, READY FOR QA, deployed on request, D-049, CH-100; D-048): the same look on Home, Topics, Practice, Tests and
  Progress; yellow Check answer in every question. Report: `reports/D-046-phase-2-report.md` (CH-098, CH-099).

- **D-050 batch 1** (built, READY FOR QA, not deployed): journeys for comparing decimals, percentages of amounts,
  multiplying fractions and remainders in real life (six journeys in all). Report: `reports/D-050-batch-1-report.md`
  (CH-101 to CH-103). Pattern for a new concept: makers in `<island>/journey.ts`; `<island>/explain/<x>Script.ts`,
  `<X>Stage.tsx`, `<X>Try.tsx`, `<X>Page.tsx`; entries in `kit/journeys.ts`, `kit/explanationIndex.ts`,
  `kit/explanations.tsx`, `kit/explainScripts.ts`; a scene in `tools/films/scenes/`; then the film steps below.

**Next (D-043 plan, in order):**
1. **The ten hardest concepts on the journey** (4 done in batch 1; 6 to go), in batches of 4. Each one needs:
   - a script;
   - a Manim scene;
   - `build.py`;
   - Learn, Try it and Notes components;
   - a `kit/journeys.ts` entry.
2. **Public homepage and parent dashboard.**
3. **Supabase accounts** (parent logins, children as profiles), then one production launch.

**Open questions for the Product Owner:**
- XP: keep stars with a level bar, or call them XP? Should today's plan tick items off? Keep `/practice` as a hub?
- Lengthen the Check stage (the concept images show about 8 questions; it is 2 today, and changing it changes MAST-001)?
- A reasoning question for ratio.

## How the pieces fit

| Piece | Where |
|---|---|
| Journey stages and rules (pure) | `src/engine/topicJourney.ts`; progress saved as `LearnerState.journeys` |
| Journey data per concept (skill, questions per level, strands, method and why) | `src/topics/kit/journeys.ts` |
| Journey screens | `src/components/journey/` (`JourneyScreen`, `LearnStage`, `stages`) |
| Learn and Notes per concept | `src/topics/kit/explanations.tsx` → `src/topics/<island>/explain/` |
| One script per concept (film cues, story beats, voice lines) | `engine/explainScript.ts`; scripts listed in `kit/explainScripts.ts` |
| Kid pages (Topics, Practice, Tests, Progress) and their numbers | `src/components/screens/*Screen.tsx`, `kid/Overview.tsx`; pure `engine/overview.ts`, `topics/overview.ts` |
| Films and voices | `tools/films/` (README); media in `public/films/<concept>/` and `public/voice/<concept>/` |

## Making films and voices in a fresh container

The voices, models and Python environment are not in git. Set them up again:

```bash
apt-get install -y ffmpeg libpango1.0-dev pkg-config
python3 -m venv /tmp/filmenv && /tmp/filmenv/bin/pip install -r tools/films/requirements.txt
UPDATE_DOCS=1 npx vitest run src/topics/kit/explainScripts.test.ts      # export the scripts
/tmp/filmenv/bin/python tools/films/build.py add-different --measure   # line lengths against the script
/tmp/filmenv/bin/python tools/films/build.py add-different             # film, poster, step voices
```

Voice models (Kokoro about 350 MB) download into `tools/films/voices/` on first use (git-ignored). The default voice is
Emma (`bf_emma`), chosen by the Product Owner.

## Checks before every push

```bash
npm test
npm run lint
npx next typegen && npx tsc --noEmit -p .
npm run build
```

Browser checks (production build on a port; Playwright's Chromium is preinstalled):
- `node docs/product/verification/journey.cjs <out> 3123`
- `node docs/product/verification/ratio-3d.cjs <out> 3123`
- `node docs/product/verification/kid-pages.cjs <out> 3123`
- `node docs/product/verification/journeys-batch1.cjs <out> 3123` (the four batch 1 journeys)
- `node docs/product/verification/journey-look.cjs <out>` (screenshots of every journey stage, for the Product Owner)

Stop old servers with `pkill -f next-server`: the server renames itself, and a stale one serves the old build.

## Working habits that kept this tidy
- Every test file is referenced in `traceability/test-cases.csv` (`file::exact test title`), updated in the same commit.
- Record decisions (D-), changes (CH-) and status in `DECISIONS.md` and `STATUS.md`; a report per round in `reports/`.
- Developer evidence is not QA evidence. Never mark anything ACCEPTED; only the Product Owner does, citing a decision.
