# Kite Maths design system v2: "Paper-kite sky"

The interface follows the taste-skill (`.claude/skills/design-taste-frontend`, from
[Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill)). Kids' screens and the grown-ups'
area are **app screens** in its terms (`references/app-screens.md`). Its lint and inspector are the
quality gate (see "Checking a change" below).

## The idea

**The kite is the fraction.** The Kite Maths kite has four triangle panels: quarters. Kites carry the
whole interface:

- An island's lessons hang on a kite string, and each lesson stop is a paper kite whose panels fill as
  you work through it.
- Badges are kites you collect on a shelf, each with its own paper pattern.
- On the home screen your kite climbs the sky as you move through a level.

## Type

One face: **Lexend**, made for reading fluency. Sentence case everywhere, tabular figures on every
number.

| Size | Use |
| --- | --- |
| 14px | meta: counts, captions, the step you're on |
| 18px | body on kids' screens (16px in the grown-ups' area) |
| 24px | section headings, the question prompt on phones |
| 32px | screen titles (`h1`), the question prompt on wide screens |
| 40px | the one headline figure on a screen |

Display type (`.display`) is 700 with -0.03em tracking and 1.1 leading. Headlines stay within two
lines at every width (about five words).

## Colour

Tokens live in `src/app/globals.css` (`@theme`).

| Role | Token | Value |
| --- | --- | --- |
| Ground (the sky) | `paper` | `#eaf4fd` |
| Surface (paper) | `surface` | `#ffffff` |
| Tone steps | `sunk` / `raised` | `#dcebf8` / `#f4f9fe` |
| Ink and text tiers | `ink` / `ink-2` / `muted` | `#13203a` / `#2e3a52` / `#56627b` (5.5:1 on the ground) |
| The one accent | `brand` | kite red `#d6283a`: the primary action on a kids' screen, and your own kite |
| Numerator, shaded parts | `num` | coral `#f4623a` (text: `num-strong`) |
| Denominator, all parts | `den` | blue `#2f6fd8` (text: `den-strong`) |
| Right / not yet | `ok` / `warn` | green `#1e6b44` on `#e2f5ea`; amber `#8a5300` on `#fff1d2` |
| Paper colours | `kite-red`, `sun`, `sky`, `leaf` | only on kites, Kip and drawn pictures |

No violet or indigo, no cream-with-terracotta, no gradients.

## Shape and surface

- **Controls are fully round** (buttons, chips, the segmented year picker).
- **Surfaces are square** (4px). A panel is paper on the sky, separated by tone: no border, no
  shadow.
- **Answer tiles** are square paper. They get a 2px ink outline only when selected.
- Only things that float (the feedback sheet, menus) carry a shadow.

## Pictures

- `components/paper/PaperIcon.tsx`: about 45 drawn icons on a 48px grid, ink outline plus flat paper
  colours. They replace every emoji.
- `components/paper/PaperKite.tsx`: the four-panel kite, with a fill count, a pattern and a solid or
  dashed (not reached yet) outline.
- `components/paper/SkyScene.tsx`: the home picture. Kip flies on a string, and his height is the
  progress through the level.
- `components/kid/Kip.tsx`: Kip in the same cut-paper style.
- Small interface icons (nav, inline actions) are the plain outline set in `components/ui/Icons.tsx`,
  at 16–20px in ink. They never sit in tinted squares.

## Banned everywhere

- emoji, gradients, glass and backdrop blur, resting shadows, glows;
- eyebrow labels, tiny uppercase tracked labels, pill badges above headings;
- rows of identical cards (except real collections such as the kite shelf);
- hover-lift on cards, bounce easing, entrance and stagger animations, looping pulses;
- the accent colour on navigation chrome;
- copy tells: "Let's go!", "Amazing!", "Get started", "unlock", heavy em dashes in interface copy.

## Named exceptions (kids' screens only)

Each exception exists for young learners and is declared to the inspector with `--allow` when it
trips a rule.

1. **Flat colour fields.** The sky ground and the world bands on the world map are whole fields of
   flat colour.
2. **Drawn pictures at size.** The paper icon set at 32–64px, Kip, kites and the sky scene stand in
   for small grey outline icons.
3. **Tactile press.** The primary button and answer tiles have a 3px darker bottom edge, drawn as a
   border, that sinks when pressed.
4. **Feedback motion only.** Kip's idle sway, the paper-ribbon burst on a right answer, stars
   arriving in the counter, and Kip climbing on the home picture. Transform and opacity only, all off
   under `prefers-reduced-motion`. Nothing performs an entrance.
5. **Young-reader sizing.** 18px body text and touch targets of at least 48px.
6. **Kip's speech bubble.** A flat tone shape with no border.

The grown-ups' area (`/parent`, `/results`) has no exceptions. It follows the app-screen rules to the
letter: near-black primary, quiet 1px borders, label-over-value figures in one divided container.

## Checking a change

The inspector needs Chrome. In the cloud container it runs as root, so point `CHROME_PATH` at a wrapper
that adds `--no-sandbox` (for example a two-line script that runs
`/opt/pw-browsers/chromium-*/chrome-linux64/chrome --no-sandbox "$@"`). Then, from the repo root,
against a production build (`npm run build && npx next start -p 3123`):

```bash
node .claude/skills/design-taste-frontend/scripts/lint.mjs --app src
```

```bash
node .claude/skills/design-taste-frontend/scripts/inspect.mjs --app http://localhost:3123/ --out .taste-skill/after/home
```

Fix every FAIL. Each WARN is either fixed or matched to a named exception above. `src/design.test.ts`
checks the rules that need no browser: no emoji, every icon name exists, every badge has a kite
pattern, and no gradients or violet in the stylesheet.
