# Handoff: where Kite Maths stands (12 Nov 2026)

Read this first in a new session, after `CLAUDE.md` and `AGENTS.md`. `STATUS.md` and `DECISIONS.md` are authoritative.

## Branches and production

| | Commit | What it holds |
|---|---|---|
| `claude/practical-knuth-9126wx` | same as `main` | **Latest work.** Everything below, pushed. Start new work from here. |
| `main` (production, https://kitemaths.vercel.app) | `0fedc65` + this record | Everything up to D-043 step 2, deployed on request (D-044, CH-091): the journey is live. |

- A new session gets its own `claude/…` branch from the platform. Base it on `claude/practical-knuth-9126wx`
  (`git fetch origin claude/practical-knuth-9126wx && git checkout -b <new-branch> FETCH_HEAD`), or ask the Product Owner.
- **No deployment, merge or PR without an explicit request.** The D-040 rule stands: production waits until sign-in works
  end to end; D-042 and D-044 were one-offs. A deployment means fast-forwarding `main` after CI is green, then running
  `verification/live-check.cjs` and recording a CH entry.

## Where the redesign is (D-040 → D-041 → D-043)

**Done, READY FOR QA, nothing accepted:**
- **Topic journey** at `/t/[topic]/learn/[concept]`: Learn (Watch, Step through, Try it) → Practise → Apply → Check (the
  unchanged MAST-001 recheck) → Complete. It exists for two concepts: `fractions-2/add-different` and `ratio-algebra/ratio`.
  `/explain/…` redirects to it.
- **Emma's teaching voice** (Kokoro), teacher scripts with `[pause]` and `[think]`, and pizza visuals for fractions.
- Report: `reports/D-043-step-2-report.md`.

**Next (D-043 plan, in order):**
1. **Step 3, kid pages in the concept-image style.**
   - Navigation: Home · Topics · Practice · Tests · Progress, with XP.
   - Home: Continue Learning (the last journey and its step) and a learning plan.
   - A Topics grid with progress.
   - Progress: a mastery ring and topic bars.
   - The images the Product Owner sent are described in D-043. The flow matters, not the exact UI. No violet tokens.
2. **The ten hardest concepts on the journey,** in batches of 4. Each one needs:
   - a script;
   - a Manim scene;
   - `build.py`;
   - Learn, Try it and Notes components;
   - a `kit/journeys.ts` entry.
3. **Public homepage and parent dashboard.**
4. **Supabase accounts** (parent logins, children as profiles), then one production launch.

**Open questions for the Product Owner:**
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

Stop old servers with `pkill -f next-server`: the server renames itself, and a stale one serves the old build.

## Working habits that kept this tidy
- Every test file is referenced in `traceability/test-cases.csv` (`file::exact test title`), updated in the same commit.
- Record decisions (D-), changes (CH-) and status in `DECISIONS.md` and `STATUS.md`; a report per round in `reports/`.
- Developer evidence is not QA evidence. Never mark anything ACCEPTED; only the Product Owner does, citing a decision.
