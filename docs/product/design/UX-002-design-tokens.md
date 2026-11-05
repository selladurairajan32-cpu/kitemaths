# UX-002 — Visual design system: design tokens

| | |
|---|---|
| **Backlog item** | UX-002: create the visual design system (P0, R0) |
| **Status** | QA FAILED at `6050e3c` (D-014); corrected on 5 Nov and returned for independent retest (D-022) |
| **Date** | 4 November 2026; corrected 5 November 2026 ([correction report](../reports/R0-step2-correction-report.md)) |
| **Acceptance criteria** | <ol><li>Design tokens define colour, typography, spacing, layout widths, borders, elevation, radii, icon rules, focus states, disabled states, validation states and interaction feedback.</li><li>Styles are implemented as reusable tokens rather than isolated values.</li></ol> |
| **Deliverables** | <ul><li>This specification.</li><li>The tokens in `src/app/globals.css` (`@theme static`).</li><li>The checks in `src/design-tokens.test.ts`.</li><li>The internal specimen page `/design-specimen` (not served in production) and its screenshots in [`evidence/`](evidence/).</li></ul> |
| **Scope (D-012, D-013, RC-006)** | <ul><li>**Now:** tokens are defined and checked; **no existing screen changes** (proved by a before/after pixel comparison).</li><li>**R1:** screens move from one-off values to the tokens (§5).</li><li>No `violet` token is added. The undefined violet classes (DEF-009) are fixed in R1.</li></ul> |

Related specifications: [UX-003 typography](UX-003-typography.md) and [UX-004 content types](UX-004-content-differentiation.md).

---

## 1. Rules

1. **Tokens are the only source of style values.**
   - New and changed UI uses token utilities (`text-label`, `bg-hint-soft`, `rounded-panel`, `max-w-reading`).
   - It does not use one-off values (`text-[0.9375rem]`, `rounded-[16px]`, `#c6ecd7`).
2. **Names describe a role, not a value.** Examples: `--color-hint-soft`, not "light yellow"; `--text-prompt`, not
   "28px". A value can then change in one place.
3. **The count of one-off values can only go down.**
   - `src/design-tokens.test.ts` fails if one-off text sizes or `.tsx` files with hex colours grow beyond the 4 Nov
     baseline (§4).
4. **Every token is a CSS variable.**
   - `@theme static` emits every token on `:root`, so SVG pictures and inline styles can use `var(--…)`.
5. **A change to a token's value is a design change.** It needs before/after screenshots and Product Owner review.

## 2. The tokens (AC1)

### 2.1 Colour

**Core colours.** These already exist and are unchanged.

| Group | Tokens | Use |
|---|---|---|
| Ground and surfaces | `--color-paper`, `--color-surface`, `--color-sunk`, `--color-raised` | Page ground, cards, tracks and chips, quiet panels |
| Ink | `--color-ink` (headings), `--color-ink-2` (body, 7.4:1), `--color-muted` (labels, 5.6:1) | Text |
| Lines | `--color-line` (card borders), `--color-line-strong` (control borders) | Borders |
| Action | `--color-brand`, `--color-brand-strong`, `--color-brand-soft`, `--color-on-brand` | The one action colour |
| Fraction data | `--color-num`, `--color-num-strong`, `--color-num-soft`; `--color-den`, `--color-den-strong`, `--color-den-soft` | Numerator (coral) and denominator (blue). Reserved for maths. |
| Status | `--color-ok`, `--color-ok-bright`, `--color-ok-soft`, `--color-warn`, `--color-warn-bright`, `--color-warn-soft` | Existing status colours. In R1 they are replaced by the state and content-type tokens below. |
| Picture colours | `--color-kite-red`, `--color-sun`, `--color-sky`, `--color-leaf`, `--color-fire` and their soft forms; `--color-tile-*` | Drawn pictures and 3D-picture tiles only |

**State colours (new).**

| Token | Value | Use |
|---|---|---|
| `--color-focus` | #2563eb | Keyboard focus ring (5.2:1 on white, 4.9:1 on the page) |
| `--color-selected` / `--color-selected-soft` | #1b2559 / #e8f0ff | A chosen answer before it is checked |
| `--color-disabled-ink` / `--color-disabled-soft` | #5d6785 / #edf2fa | Controls that can't be used yet |
| `--color-correct` / `--color-correct-edge` / `--color-correct-soft` | #167a4b / #22a565 / #e3f8ee | A right answer, marked |
| `--color-incorrect` / `--color-incorrect-edge` / `--color-incorrect-soft` | #a3361a / #f4623a / #fde5dc | A wrong answer, marked. Always shown with a cross badge and a text label, never by colour alone. |

**Label backgrounds for white text (added 5 Nov, DEF-022):**

| Token | Value | Use |
|---|---|---|
| `--color-on-strong` | #ffffff | Text and icons on a solid label or badge background |
| `--color-example-strong` | #0a5c53 | "Worked example" tab (white text 7.86:1) |
| `--color-challenge-strong` | #7a4f00 | "Optional challenge" ribbon (white text 7.12:1) |

The `-edge` colours are for borders and accents only, never behind text.

**Contrast rule:**
- Every supported text and graphic pairing meets the WCAG minimum **for its actual size and weight**: 4.5:1 for normal
  text, 3:1 for large text and graphics.
- Content ink also meets the product target of 7:1.
- The full list is in [UX-004 §2.3](UX-004-content-differentiation.md#23-supported-colour-pairings), and
  `src/design-tokens.test.ts` checks every row.

**Content-type colours (new):** ten types × background, edge and ink, for example `--color-hint-soft`,
`--color-hint-edge` and `--color-hint-ink`. They are listed and justified in [UX-004 §2](UX-004-content-differentiation.md#2-the-content-types-ac1).

### 2.2 Typography

Ten role tokens, each setting size and line height together. Examples: `--text-prompt` with
`--text-prompt--line-height`, and `--text-label`. The full scale and rules are in
[UX-003 §2](UX-003-typography.md#2-type-scale). Nothing is below 15px.

### 2.3 Spacing

Tailwind's 4px spacing unit is kept unchanged, so `p-4` = 16px. Use only this subset:

| Step | px | Use |
|---|---:|---|
| 1, 1.5, 2 | 4, 6, 8 | Inside chips and between an icon and its label |
| 3, 4 | 12, 16 | Inside controls and between lines of a list |
| 5, 6 | 20, 24 | Inside panels and cards (phone) |
| 8 | 32 | Inside cards (desktop); between cards |
| 10, 12 | 40, 48 | Between screen sections |
| 16 | 64 | Above and below hero areas |

### 2.4 Layout widths

| Token | Value | Use |
|---|---|---|
| `--container-reading` | 40rem (640px) | Explanation text: about 65 characters a line at 18px |
| `--container-lesson` | 45rem (720px) | The lesson and question column |
| `--container-page` | 72rem (1152px) | Whole screens |

### 2.5 Borders

| Width | Colour | Use |
|---|---|---|
| 1px | `--color-line` | Cards and quiet dividers |
| 2px | `--color-line-strong` | Answer tiles, inputs and other controls |
| 3px bottom | darker shade of the control | The tactile press edge (`.press`) on the primary button and answer tiles only |
| 2px, 4px double or 6px left | the content type's `-edge` colour | Content-type shapes (UX-004) |

### 2.6 Radii

| Token | Value | Use |
|---|---|---|
| `--radius-control` | 16px | Buttons, inputs and inline notices |
| `--radius-tile` | 18px | Answer tiles and icon tiles |
| `--radius-panel` | 20px | Content-type panels inside cards |
| `--radius-card` | 24px | Cards (existing) |
| `--radius-hero` | 32px | Hero cards, map panels and the top of bottom sheets |
| `rounded-full` | — | Pills, badges and round buttons |

### 2.7 Elevation

| Token | Use |
|---|---|
| `--shadow-card` | Cards resting on the page (existing) |
| `--shadow-lift` | A card lifted by hover or selection (existing) |
| `--shadow-sheet` | The bottom feedback sheet, lit from below (new) |

Panels inside a card have no shadow; they are separated by tone.

### 2.8 Icons

- **Line icons** come from `src/components/ui/Icons.tsx`: a 24-unit grid, 1.9 stroke, round caps.
  - Use 20px by default, 16px inside label-size text and 24px in large buttons.
  - Icons take `currentColor`, so they inherit the ink of the text they sit with.
- **Meaning is never carried by an icon alone.**
  - Every icon that means something has a visible text label next to it, such as "Hint" or "Correct!".
  - Decorative icons are `aria-hidden`.
- **Pictures are illustrations, not labels.** This covers the paper icons and 3D pictures. The existing tests check
  every picture name exists, and that no emoji is used (`src/design.test.ts`).
- **One icon per content type** (UX-004). The same icon is never used for two types.

### 2.9 Focus states

- Keyboard focus shows a **3px `--color-focus` outline, offset 3px**. This is the global `:focus-visible` rule in
  `globals.css`.
- It must stay visible on every control, including the number boxes, where it is lost today (DEF-015, UX-007 in R1).
- Focus is never removed without a replacement. Script-focused headings (`tabindex="-1"`) are the documented exception.

### 2.10 Disabled states

- A disabled control uses `--color-disabled-soft` with `--color-disabled-ink` text, **not opacity**, so its text stays
  readable.
- It keeps its shape.
- Where possible, a short reason sits next to it. Today: "Answer to carry on".

### 2.11 Validation states

- **Selected:** a 2px `--color-selected` border on `--color-selected-soft`.
- **Correct:** a `--color-correct-edge` border, a `--color-correct-soft` fill and a round tick badge in `--color-correct`.
- **Incorrect:** a `--color-incorrect-edge` border, a `--color-incorrect-soft` fill and a round cross badge in
  `--color-incorrect`.
- **Missed** (the right answer the child didn't choose): a dashed `--color-correct-edge` border.
- Each state also has a text equivalent for screen readers, such as "(correct answer)", as in `inputs.tsx` today.

### 2.12 Interaction feedback

| Interaction | Feedback |
|---|---|
| Hover (pointer) | Tile background moves to `--color-raised`; cards lift to `--shadow-lift` |
| Press | The `.press` edge sinks by 2px |
| Select | Selected state (§2.11) |
| Check | Bottom sheet with a success or retry content type (UX-004) |

Motion timing and easing belong to UX-006 (R1). Reduced motion is always respected (`globals.css`, `MotionConfig`).

## 3. Naming

| Kind | Pattern | Tailwind utility |
|---|---|---|
| Colour | `--color-<role>`, with `-soft` (background), `-edge` (border or accent), `-ink` (text and icon) or `-strong` | `bg-hint-soft`, `border-hint-edge`, `text-hint-ink` |
| Type | `--text-<role>` and `--text-<role>--line-height` | `text-prompt` |
| Width | `--container-<role>` | `max-w-reading` |
| Radius | `--radius-<role>` | `rounded-panel` |
| Shadow | `--shadow-<role>` | `shadow-sheet` |

## 4. Implemented as reusable tokens (AC2)

**Already in place:**
- every token in §2 is defined once in `src/app/globals.css`;
- the existing core colours, `--radius-card`, `--shadow-card` and `--shadow-lift` are already used through utilities and
  `var(--…)`.

**What `src/design-tokens.test.ts` checks:**
- every token named in these three specs exists;
- each type role has a size and line height of at least 15px;
- the content types meet the contrast rules;
- the state colours are readable;
- no violet token is added;
- **a ratchet** on one-off values. Baselines: **224** one-off `text-[…]` sizes in `.tsx` files (4 Nov), **15** `.tsx`
  files containing hex colours (4 Nov), and **101** hex colour values in total (added 5 Nov). None may grow. R1 lowers the
  baselines as screens move to tokens.
  - **Limits of the ratchet** (independent review, 5 Nov). A count only stops the *number* of one-off values growing:
    - it can't stop one hex value or size being swapped for a different one;
    - before 5 Nov, counting *files* let new hex values be added inside files that already had one. The occurrence
      count closes that gap.
  - Review of changed lines is still needed. Full prevention comes when the R1 migration removes one-off values from
    screens, and a rule then forbids them outright.

**Not yet true, and why.**
- Existing screens still use one-off values.
- Moving them now would change how screens look, which D-012 rules out for step 2.
- The migration is R1 work (§5). Until then, AC2 is met for the token system itself and enforced against regression
  (RC-006).

## 5. R1 migration map

The counts are uses in `src/**/*.tsx` on 4 Nov. "By role" means that the right token depends on what the text is (UX-003
§3).

| Today | Count | Becomes |
|---|---:|---|
| `text-[0.9375rem]` | 183 | `text-label` |
| `text-[0.8125rem]`, `text-[0.65rem]` | 2 | `text-label` (this fixes DEF-010) |
| `text-base` (16px, off the scale) | 18 | `text-label` or `text-body`, by role |
| `text-lg`, `text-[1.0625rem]` | 44 | `text-body` |
| `text-[1.1875rem]` | 3 | `text-body-lg` |
| `text-xl`, `text-[1.375rem]` | 21 | `text-title` |
| `text-2xl`, `text-[1.5rem]` | 20 | `text-prompt-sm` or `text-heading-2`, by role |
| `text-[1.625rem]`, `text-[1.75rem]` | 8 | `text-heading-2` or `text-prompt`, by role |
| `text-3xl`, `text-[1.875rem]`, `text-[2rem]` | 27 | `text-heading-1` or `text-heading-2`, by role |
| `text-4xl`, `text-[2.125rem]` | 17 | `text-heading-1` |
| `text-[2.625rem]`, `text-[3rem]` | 3 | `text-display-2`, `text-display-1` |
| `text-[0.92em]` and `FractionNotation`'s own size table (one each of `text-base`, `text-2xl`, `text-4xl` and `text-6xl`, counted in the rows above) | 5 | Unchanged: these are maths sizes (UX-003 §6) |
| `rounded-[16px]` | 44 | `rounded-control` |
| `rounded-[18px]`, `rounded-[12px]`, `rounded-[14px]` | 13 | `rounded-tile` |
| `rounded-[20px]`, `rounded-[22px]` | 27 | `rounded-panel` |
| `rounded-[24px]`, `rounded-[var(--radius-card)]` | 20 | `rounded-card` |
| `rounded-[28px]`, `rounded-b-[28px]`, `rounded-[32px]` | 12 | `rounded-hero` (the 28px ones get 4px rounder: a visible change, reviewed in R1) |
| `shadow-[var(--shadow-card)]`, `shadow-[var(--shadow-lift)]` | 28 | `shadow-card`, `shadow-lift` (these utilities already work) |
| `shadow-[0_-14px_40px_…]` | 1 | `shadow-sheet` |
| `max-w-[640px]`, `max-w-[720px]`, `max-w-6xl` | 7 | `max-w-reading`, `max-w-lesson`, `max-w-page` |
| `border-[#c6ecd7]`, `bg-[#edf3ff]` | 2 | `border-correct-edge` or `border-success-edge`, and `bg-brand-soft` |
| Hex colours in the other 13 files: drawn pictures (`visuals.tsx`, `frame.tsx`, `Kip.tsx` and others), map scenery, and the `layout.tsx` theme colour | 13 files | The picture colour tokens through `var(--…)` |
| `bg-violet-soft`, `text-violet` (DEF-009) | 3 | A defined token chosen in R1, for example `selected` for "passed check". Never violet. |
| `bg-warn-soft`, shared by the hint, Kip's tip, input problems, worked-example hints, "not quite" feedback and two status chips | 11 | The `hint`, `tip`, `notice` and `retry` content types (UX-004 §3); the chips use state tokens |
