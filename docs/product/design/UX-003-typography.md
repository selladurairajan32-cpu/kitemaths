# UX-003 — Typography and mathematical readability

| | |
|---|---|
| **Backlog item** | UX-003: define typography and mathematical readability (P0, R0) |
| **Status** | **QA FAILED** (D-014, D-021): AC3 is not met by today's screens (DEF-018 to DEF-021). The contrast findings (DEF-022) are corrected. The specification is returned for review separately from acceptance of the item. |
| **Date** | 4 November 2026; corrected 5 November 2026 ([correction report](../reports/R0-step2-correction-report.md)) |
| **Acceptance criteria** | <ol><li>Font family, type scale, line length, line height, weights and hierarchy are specified for headings, explanations, labels, question text, hints, results and maths notation.</li><li>Fractions, superscripts, symbols and long calculations remain legible at all supported sizes.</li><li>Text scaling does not break layouts.</li></ol> |
| **Deliverables** | <ul><li>This specification.</li><li>The type tokens in `src/app/globals.css`.</li><li>The checks in `src/design-tokens.test.ts`.</li><li>The specimen `/design-specimen` and its screenshots in [`evidence/`](evidence/).</li><li>The text-scaling check results (§7).</li></ul> |
| **Scope (D-012, D-013)** | Specified and tokenised now. Screens adopt the tokens in R1 (UX-002 §5). |

The UX-001 benchmark measured Kite Maths' large prompt sizes and generous line spacing as a strength (UX-001 §4–§5, §8). This
specification keeps them and makes them systematic.

---

## 1. Font family and weights

- **Nunito** is the only font. It is loaded with `next/font` in `src/app/layout.tsx`.
  - It has soft, rounded letters with open shapes, and clear `1`, `l` and `I`.
  - It was the owner's choice, and the benchmark measured it as readable.
  - Fallbacks: `ui-rounded`, `ui-sans-serif`, `system-ui`.
- **Weights:**

  | Weight | Use |
  |---|---|
  | 500 (medium) | Body and explanation text (the body default) |
  | 600 (semibold) | Labels, notation digits |
  | 700 (bold) | Emphasis inside panels |
  | 800 (extrabold) | Headings, question prompts, panel labels, button text, `**bold**` key words |

  Never use weights below 500: thin strokes break up at small sizes and on low-quality screens.
- **Numbers** use tabular figures everywhere. This is already set on `body`, so columns and changing digits line up.

## 2. Type scale

Each token sets size and line height together. Tailwind utility: `text-<role>`.

| Token | Size / line height | Weight | Role |
|---|---|---|---|
| `--text-display-1` | 48px / 1.1 | 800 | Home hero on desktop |
| `--text-display-2` | 42px / 1.15 | 800 | Screen hero on desktop |
| `--text-heading-1` | 34px / 1.2 | 800 | Screen title; any hero on phone |
| `--text-heading-2` | 26px / 1.25 | 800 | Section title; screen title on phone |
| `--text-prompt` | 28px / 1.35 | 800 | Question prompt on desktop (as today) |
| `--text-prompt-sm` | 24px / 1.35 | 800 | Question prompt on phone (as today) |
| `--text-title` | 20px / 1.35 | 800 | Card and panel titles; feedback headline |
| `--text-body-lg` | 19px / 1.6 | 500 | Lesson explanations |
| `--text-body` | 18px / 1.6 | 500 | All other reading text (the `body` default) |
| `--text-label` | 15px / 1.4 | 600–800 | Labels, meta, chips, small buttons. **The minimum.** |

**Rules:**
- **Nothing is smaller than 15px.** This includes chips, captions, chart labels and superscripts. The two exceptions
  today are DEF-010, fixed in R1.
- **Phone sizes step down one level.** For example, display-1 on desktop becomes heading-1 on phone, and prompt becomes
  prompt-sm. Text is never scaled by viewport width (`vw`), because that breaks text scaling (§7).
- **16px is not on the scale.** Today's `text-base` uses become label or body in R1, by role.

## 3. Hierarchy by role

| Role | Token | Colour | Notes |
|---|---|---|---|
| **Headings** | display-1/2 (heroes), heading-1 (screen), heading-2 (section) | `--color-ink` | One heading-1 per screen. Headings are short; they don't wrap past two lines on phone. |
| **Explanations** | body-lg | `--color-ink-2`; key words `**bold**` in `--color-ink` | At most 3 short paragraphs per step (CUR-003 rule 3), within the reading width |
| **Labels and meta** | label | `--color-muted` (5.6:1), or the content type's ink | Sentence case. Uppercase only for content-type labels, with letter spacing. |
| **Question text** | prompt (desktop), prompt-sm (phone) | `--color-ink` | The largest text in the question card, always first in reading order (UX-004 AC2) |
| **Hints** | body | `--color-hint-ink` | "Hint:" label in 800. One idea per hint. |
| **Results and feedback** | title for the headline ("Correct!", "Not yet"); body for the explanation; heading-1 for big numbers (scores, stars) | The content type's ink | Numbers are never the only feedback; a sentence says what they mean. |
| **Maths notation** | Follows the text it sits in (§6) | Numerator `--color-num-strong`, denominator `--color-den` | |

## 4. Line length

- Reading text is no wider than `--container-reading` (640px), about 65 characters at 18px.
- Lessons and questions sit in `--container-lesson` (720px). Explanation text within them still keeps the reading width.
- On a phone, the 16px side gutters give about 40 characters a line at 18px. That's comfortable for this age group.

## 5. Line height and spacing

- Line height comes from the token: 1.1–1.25 for headings, 1.35 for prompts and titles, 1.6 for reading text, and 1.4 for
  labels.
- **Line height must allow stacked fractions inside a line of text** (§6). A body line of 1.6 × 18px = 28.8px.
  `FractionNotation` at the inline size is about 2em tall, so `RichText` lines that contain a fraction grow taller.
  That is intended: it's the only way to keep the digits at a readable size.
- Paragraphs are separated by 0.5–0.75em (`space-y-2` / `space-y-3`), never by blank lines.

## 6. Maths notation (AC2)

| Element | Rule | How it's built |
|---|---|---|
| **Fractions in reading text** | Stacked, never `3/5` written with a slash. The numerator is coral (`--color-num-strong`), the denominator blue (`--color-den`), and the bar ink. | `RichText` with `{3/5}` markup renders `FractionNotation size="inline"` at 0.92em of the surrounding text |
| **Fractions on their own** | One of four sizes: `sm` (16px), `md` (24px), `lg` (36px) or `xl` (60px) | `FractionNotation size=…` |
| **Fractions in tight one-line places** (option labels, step lists, chips) | Compact form `3/8`, with the same two colours and the digits at the text's full size | `RichText compact` |
| **Smallest fraction digits** | Inline fractions only in body-size text or larger. At 18px they're about 16.6px; at label size they'd be 13.8px, so label text uses the compact form. | Rule for R1 authoring and review |
| **Fraction digits on coloured panels** | At least 4.5:1 at their rendered size: inline digits are 16.56px and `sm` digits 16px, so both count as normal text. Large sizes (`md` and up, 24px or more) need 3:1. On tinted panels the denominator uses `--color-den-strong`. Every pairing is listed in UX-004 §2.3 and checked by `src/design-tokens.test.ts` (DEF-022). | `tint` on `RichText` / `FractionNotation` |
| **Operators** | True minus `−` (U+2212), never a hyphen; `×` and `÷`, never `x`, `*` or `/`. A space either side of `=`, `<`, `>`, `+`, `−`, `×` and `÷`. | Content convention; `num()` in `src/topics/kit/evaluate.ts` already writes `−5` |
| **Numbers** | UK style: `12,345`, `0.75`, `£3.50`. Tabular figures. | `num()` (`toLocaleString("en-GB")`) in `kit/evaluate.ts` |
| **Superscripts** (squares, powers) | Never below 15px: `text-label` inside body text. Never use Unicode superscript characters (²), which render too small in Nunito. | `<sup className="text-label">` |
| **Long calculations** | One step per line. Each step after the first starts with `=`, so the signs line up. A step too wide for the screen wraps only before an operator, with a hanging indent; an operator never separates from its number. | Each step is its own block; a non-breaking space joins an operator to its number |
| **Column methods** | A grid with right-aligned digits in place-value columns, and the operator in its own column | The kit's `column` visual (`src/topics/kit/types.ts`) |
| **Read aloud** | Every notation has a spoken form: "three fifths", "minus", "squared" | `FractionNotation` `sr-only` text; `src/lib/speech.ts` |

**Legible at all supported sizes.** The specimen (`/design-specimen`, §8) renders every size above, inline fractions in
reading text, the compact form, operators, a superscript and two long calculations. Screenshots at 390px and 1280px
are in [`evidence/`](evidence/). Its maths section also passes the 200% text-scaling check (§7).

## 7. Text scaling (AC3)

**Method** (4 Nov, production build of this branch, Playwright Chromium; script and raw results kept with the
evidence):
- **Pages:** home, world map, Fractions island, a lesson step, a question step, practice, grown-ups, and the specimen.
- **Three conditions, at 390px and 1280px:**
  1. **Text-only scaling to 200%.** The root font size is set to 200%, as a browser's "font size" setting does. This is
     the strictest test: layout widths in px stay fixed while the text doubles.
  2. **Browser zoom to 200%.** On a 1280px screen this is a 640px CSS viewport.
  3. **Reflow at 320px** (WCAG 1.4.10).
- **What it looks for:**
  - sideways scrolling (`scrollWidth` beyond the viewport);
  - clipped text (an element with hidden overflow, a clamp or an ellipsis whose content is larger than its box).

**Results:**

| Condition | Result | Where |
|---|---|---|
| Normal size (100%), 390 and 1280 | No sideways scroll. **Text cut off** on the island screen. | Lesson descriptions are clamped to two lines (`line-clamp-2`): 9 of 10 on phone, 4 on desktop (DEF-019) |
| Browser zoom 200% (640px) | **Passes** apart from the same island clamp | — |
| Reflow at 320px | **Fails on kid screens:** 25px sideways scroll | The header's stars-and-streak group doesn't fit (DEF-018). Lesson, question and grown-ups pass. |
| Text-only 200%, 390px | **Fails:** sideways scroll on every page | <ul><li>Header: 232px on kid screens, 123px in lessons (DEF-018).</li><li>The bottom tab labels run together.</li><li>Grown-ups cards overflow by 115px (DEF-020).</li><li>The lesson title is cut to an ellipsis (DEF-021).</li><li>The island hero clips its content (DEF-019).</li></ul> |
| Text-only 200%, 1280px | **Fails:** 684–686px sideways scroll on kid screens | The header and its navigation don't wrap or collapse (DEF-018). The lesson title is truncated (DEF-021). Lesson, question and grown-ups otherwise pass. |
| Specimen at 200%, both widths | Its own content passes | The only overflow is the shared app header (DEF-018) |

**New defects** (recorded in [`STATUS.md`](../STATUS.md#open-defects-affecting-status); fixed in R1, because fixing them
changes screens):

| Defect | Severity | What happens | Expected |
|---|---|---|---|
| DEF-018 | Medium | <ul><li>The app header doesn't adapt to narrow screens or larger text.</li><li>At 320px it scrolls sideways by 25px.</li><li>At 200% text it pushes the stars, streak and grown-ups link off-screen.</li><li>The bottom tab labels collide.</li></ul> | <ul><li>The header wraps or collapses (for example, the stars and streak move into a second row).</li><li>The tab labels stay legible.</li><li>No sideways scroll at 320px or at 200% text (UX-005, UX-007).</li></ul> |
| DEF-019 | Medium | Island lesson descriptions are cut to two lines even at normal size, and the island hero clips at 200% text | Descriptions show in full; nothing is hidden by a clamp |
| DEF-020 | Medium | Grown-ups cards overflow sideways on a phone at 200% text | Cards reflow within the screen |
| DEF-021 | Low | The lesson title in the lesson header is cut with an ellipsis at 200% text | The title wraps |

**What this means for AC3.**
- These layout rules prevent the failures in new work. The specimen follows them, and passes:
  - sizes in `rem` tokens, and no viewport-width text;
  - widths as maximums, not fixed sizes;
  - no clamps or ellipses on teaching text or titles;
  - rows of items wrap (`flex-wrap`), and flex or grid children that hold text get `min-w-0`;
  - a last-resort word break (`overflow-wrap: anywhere`), so a long word never forces sideways scroll;
  - column counts that should change with text size use rem-based tracks, such as
    `repeat(auto-fit, minmax(8rem, 1fr))`, because media queries don't respond to the browser's text-size setting.
- Existing screens don't meet AC3 yet. AC3 is met when DEF-018 to DEF-021 are fixed in R1 and this check passes as an
  automated test (planned: UX-008 / QA-005).
- **Decision (Q-7, D-021):** UX-003 stays QA FAILED while AC3 is unmet. DEF-018 to DEF-021 are fixed and retested early in R1. A linked defect does not turn the failed criterion into a pass. Approval of this specification is recorded separately from acceptance of the item.

## 8. Specimen

`/design-specimen` is an internal page. It is not linked from the app, it's marked `noindex`, and it is a 404 when built
for production (`VERCEL_ENV=production`). It shows the type scale, the content types, states, maths notation, radii,
elevation, widths and colours using only the new tokens. See [`evidence/`](evidence/) for the screenshots.
