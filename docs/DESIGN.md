# Kite Maths design system v3: "Crystal"

> **Current design reference. Not yet the accepted design system.**
> - This describes the design as built ("Crystal").
> - The backlog's design-system items (UX-002 tokens, UX-003 typography, UX-004 content
>   differentiation) will replace or confirm it.
> - Known drift from the code is tracked as defects: undefined violet classes (DEF-009), and text below
>   the 15px minimum (DEF-010).
> - Hero sizes and the "feedback only" motion rule differ from the code; see GOV-001 §5.
> - The status of each design item is in [`docs/product/STATUS.md`](product/STATUS.md).


Chosen by the owner after several rounds: clean and calm, easy to read, with the fun of a children's game.
The references were the Rohi Kids case study (white pages, 3D cartoon pictures, soft cards) and kindergarten
themes (rounded, bright, friendly).

## The idea in one line

A calm white base, and all the colour and fun carried by **3D pictures** and the game parts
(stars, streaks, Kip, badges, celebrations).

## Type

One font, **Nunito** (`src/app/layout.tsx`): soft rounded letters with open shapes, easy and pleasant for
young readers.

| Use | Size | Weight |
|---|---|---|
| Hero title | 34px phone, 48px desktop | 800 |
| Section title | 26px phone, 34px desktop | 800 |
| Card title | 18–21px | 800 |
| Reading text | 17–19px, line height 1.6 | 500 |
| Labels and meta | 15px | 600–700 |

Nothing on a screen is smaller than 15px.

## Colour

Tokens live in `src/app/globals.css` (`@theme static`, so every token exists as a CSS variable).

| Token | Value | Use |
|---|---|---|
| `paper` | `#f6f8fd` | Page ground |
| `surface` | `#ffffff` | Cards |
| `ink` | `#1b2559` | Titles |
| `ink-2` | `#4a5578` | Reading text (7.4:1) |
| `muted` | `#5d6785` | Labels (5.6:1) |
| `brand` | `#2563eb` | The one action colour (white text 5.2:1) |
| `tile-*` | blue, orange, yellow, green, pink, sky pastels | Tiles behind 3D pictures |
| `num` / `den` | coral / blue | Fraction numerator and denominator |
| `ok`, `warn` | green, amber | Right answers and hints |

No gradients and no violet (`src/design.test.ts` checks).

## Shape and depth

- **Cards:** white, 24px corners, a 1px `line` border and a soft shadow (`--shadow-card`; `--shadow-lift` on hover).
- **Hero panels:** soft blue (`#edf3ff`) with 32px corners.
- **Buttons:** pills. The primary is blue with a darker 3px bottom edge that sinks when pressed. Secondary
  buttons are white with a border.
- **3D pictures:** sit on 16–28px rounded pastel tiles.

## Pictures

- **3D pictures:** Microsoft Fluent Emoji 3D, MIT licence, in `public/3d` with the licence file.
  - `Pic` (`src/components/paper/Pic.tsx`) draws one by name.
  - `PaperIcon` shows the 3D picture whenever one exists, so every icon in the app uses it.
  - The home page credits the set.
- **Kip** (`src/components/kid/Kip.tsx`) is the 3D kite with a face drawn on the sail (happy, cheer, think and oops
  moods).
- **Fraction diagrams** stay drawn (bars, circles, number lines), with ink outlines and the coral and blue data
  colours.

## Shared pieces

- `ScreenHero` (`src/components/kid/ScreenHero.tsx`): the top of every kids' screen. A soft blue panel with Kip or a
  3D picture, a title, one line and the actions.
- The shell (`AppShell`, `Hud`): a white top bar with the 3D-kite logo, soft blue active links, and star and fire
  chips. On phones, a bottom tab bar.
- The question player: the question on a white card, rounded answer tiles, a warm hint panel, and a green
  celebration sheet with a 3D party popper and the stars won.

## Motion

Feedback only: Kip's gentle sway, the confetti burst, stars popping in. Everything is still under reduced motion.
