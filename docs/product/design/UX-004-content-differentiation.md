# UX-004 — Content differentiation rules

| | |
|---|---|
| **Backlog item** | UX-004: establish content differentiation rules (P0, R0) |
| **Status** | READY FOR QA (D-023): wording corrected 6 Nov (DEF-036), awaiting independent retest. |
| **Date** | 4 November 2026; corrected 5 November 2026 ([correction report](../reports/R0-step2-correction-report.md)) |
| **Acceptance criteria** | <ol><li>Teaching, examples, rules, question prompts, hints, feedback, misconceptions, worked solutions and challenge content have clearly distinguishable visual treatments.</li><li>The child can identify the task and next action immediately.</li></ol> |
| **Deliverables** | <ul><li>This specification.</li><li>The content-type tokens in `src/app/globals.css`.</li><li>The contrast checks in `src/design-tokens.test.ts`.</li><li>The treatments rendered on `/design-specimen`, with screenshots in [`evidence/`](evidence/).</li></ul> |
| **Scope (D-012, D-013)** | Specified, tokenised and shown on the specimen now. Screens adopt the treatments in R1 (§4). |

---

## 1. Rules

1. **Four cues, never colour alone** (WCAG 1.4.1). Every content type is identified by:
   - its **colour** (background, edge and ink tokens);
   - its **icon**: one per type, never shared;
   - a **label word**, such as "Hint" or "Key fact";
   - its **shape**: no panel, left bar, tab, speech bubble, dashed or double border, or badge.

   In greyscale, or for a child with a colour-vision difference, the icon, label and shape still tell the types apart.
2. **Readable on every background.**
   - Every supported text and graphic pairing meets the WCAG minimum for its **actual size and weight**:
     - 4.5:1 for normal text;
     - 3:1 for large text (at least 24px, or at least 18.67px at weight 700 or above) and for graphics such as badge
       icons.
     Labels are 15px, so they need 4.5:1. Fraction digits use their real rendered size (inline digits are
     0.92 × 18px = 16.56px), so they need 4.5:1 too.
   - On top of that minimum, each type's ink on its background meets the product **target of 7:1**.
   - White label text sits on the dark `-strong` backgrounds, not on the light `-edge` colours.
   - Fraction digits on a tinted panel use the darker denominator blue (`tint` on `RichText` and `FractionNotation`).
   - §2.3 lists every supported pairing. `src/design-tokens.test.ts` recomputes each ratio from `globals.css`, with no
     rounding (DEF-022).
3. **Fraction colours are reserved for maths.**
   - No content type uses coral (`--color-num`) or the fraction blue (`--color-den`) as its background.
   - That would hide fraction digits and blur the meaning of the colours.
4. **One loud thing at a time.**
   - A screen region shows at most one coloured panel that is asking for attention, such as a hint, feedback or a
     misconception.
   - Teaching text stays plain.
5. **Feedback is kind.**
   - "Not yet" is never red.
   - The incorrect state marks an answer with a cross badge (UX-002 §2.11).
   - The message around it uses the calm retry type.

## 2. The content types (AC1)

The backlog names nine kinds of content. They map to ten tokenised types, plus the question prompt, which is
distinguished by typography rather than a panel.

| Backlog term | Type |
|---|---|
| Teaching | `teach` |
| Examples | `example` |
| Rules | `rule` |
| Question prompts | Prompt (no panel: §2.2) |
| Hints | `hint`, and `tip` for Kip's lesson tips |
| Feedback | `success`, `retry`, and `notice` for answer-format messages |
| Misconceptions | `misconception` |
| Worked solutions | `example`, labelled "Worked example" or "Watch how" |
| Challenge content | `challenge` |

### 2.1 Treatments

Tokens: `--color-<type>-soft` (background), `--color-<type>-edge` (border or accent), `--color-<type>-ink` (label, icon
and text).

| Type | Purpose | Colour | Icon | Label | Shape |
|---|---|---|---|---|---|
| `teach` | The explanation | `--color-teach-soft` (the white card), `--color-teach-ink` | none | none | Plain reading text: no panel |
| `rule` | A key fact or definition to remember | `--color-rule-soft`, `--color-rule-edge`, `--color-rule-ink` | Flag | "Key fact" | 6px left bar |
| `example` | A worked example or worked solution | `--color-example-soft`, `--color-example-edge`, `--color-example-ink` | Studio (board) | "Worked example" (or "Watch how"); "Let's do it together" for a guided example | Tab label on a solid `--color-example-strong` background; numbered steps; 2px border |
| `hint` | Help the child asked for | `--color-hint-soft`, `--color-hint-ink` | Bulb | "Hint" | Soft panel, no border |
| `tip` | Kip's friendly tip in a lesson | `--color-tip-soft`, `--color-tip-edge`, `--color-tip-ink` | Kite (Kip) | "Kip's tip" | Speech bubble (one square corner) |
| `notice` | A message about the answer's form, such as "Type a whole number" | `--color-notice-soft`, `--color-notice-edge`, `--color-notice-ink` | Info | (the message itself) | Small bar, thin border, control radius |
| `misconception` | Names a likely misunderstanding, kindly | `--color-misconception-soft`, `--color-misconception-edge`, `--color-misconception-ink` | Magnifier | "Look closer" | 2px dashed border |
| `success` | A right answer | `--color-success-soft`, `--color-success-edge`, `--color-success-ink` | Tick in a round badge | "Correct!" | 2px border; round badge |
| `retry` | An answer that isn't right yet | `--color-retry-soft`, `--color-retry-edge`, `--color-retry-ink` | Try-again arrow in a round badge | "Not yet" | 2px border; round badge |
| `challenge` | An optional stretch question | `--color-challenge-soft`, `--color-challenge-edge`, `--color-challenge-ink`; ribbon `--color-challenge-strong` | Star | "Optional challenge" | Double border with a ribbon label |

Every treatment is rendered on `/design-specimen` (screenshots: [`evidence/`](evidence/)).

**Wording on the specimen (D-020):**
- Comparison rules state their mathematical domain: "When two fractions have the same positive numerator and positive
  denominators, and the wholes are the same size, the fraction with the smaller denominator is bigger." The domain must
  say *positive*: "not zero" also allows negative numerators, for which the ordering reverses (DEF-036). The rule is for
  comparing parts of same-sized wholes; zero numerators (all equal to 0) and negative values are outside it.
- Misconception feedback says "When the same-sized whole is split into more equal parts, each part is smaller."
- Success feedback for a comparison names the same-sized whole.

The specimen shows the visual treatment. It does **not** show that children can use it. Lesson usability testing with
children is R1 (§4).

### 2.2 The question prompt

The prompt is the task. It is distinguished by **position and size**, not by a panel:
- it is the first thing in the white question card;
- it uses `--text-prompt` on desktop and `--text-prompt-sm` on phone, in weight 800 and `--color-ink`;
- it is the largest text in the card;
- the read-aloud button sits next to it.

Panels (hint, notice, feedback) only ever appear **below** the prompt and the answer area.

### 2.3 Supported colour pairings

Every foreground and background combination the content types, states and the specimen use. `src/design-tokens.test.ts`
reads this table and does four things:
- recomputes each ratio from the token values;
- checks that the **Minimum** column follows from the size, weight and kind (it isn't typed in by hand);
- checks each ratio meets its minimum and, where one is given, its **Target**;
- checks that the **Ratio** shown is the computed value cut to two decimals, never rounded up.

Minimum is the accessibility requirement. Target is the stronger product goal.

| Foreground | Background | Use | Size (px) | Weight | Kind | Minimum | Target | Ratio |
|---|---|---|---:|---:|---|---:|---:|---:|
| `--color-teach-ink` | `--color-teach-soft` | teach: label and text | 15 | 500 | text | 4.5:1 | 7:1 | 14.42:1 |
| `--color-rule-ink` | `--color-rule-soft` | rule: label and text | 15 | 500 | text | 4.5:1 | 7:1 | 7.61:1 |
| `--color-example-ink` | `--color-example-soft` | example: label and text | 15 | 500 | text | 4.5:1 | 7:1 | 8.11:1 |
| `--color-hint-ink` | `--color-hint-soft` | hint: label and text | 15 | 500 | text | 4.5:1 | 7:1 | 8.12:1 |
| `--color-tip-ink` | `--color-tip-soft` | tip: label and text | 15 | 500 | text | 4.5:1 | 7:1 | 7.06:1 |
| `--color-notice-ink` | `--color-notice-soft` | notice: label and text | 15 | 500 | text | 4.5:1 | 7:1 | 12.83:1 |
| `--color-misconception-ink` | `--color-misconception-soft` | misconception: label and text | 15 | 500 | text | 4.5:1 | 7:1 | 7.85:1 |
| `--color-success-ink` | `--color-success-soft` | success: label and text | 15 | 500 | text | 4.5:1 | 7:1 | 7.26:1 |
| `--color-retry-ink` | `--color-retry-soft` | retry: label and text | 15 | 500 | text | 4.5:1 | 7:1 | 7.83:1 |
| `--color-challenge-ink` | `--color-challenge-soft` | challenge: label and text | 15 | 500 | text | 4.5:1 | 7:1 | 13.91:1 |
| `--color-on-strong` | `--color-example-strong` | example: tab label | 15 | 800 | text | 4.5:1 | — | 7.86:1 |
| `--color-on-strong` | `--color-challenge-strong` | challenge: ribbon label | 15 | 800 | text | 4.5:1 | — | 7.12:1 |
| `--color-num-strong` | `--color-teach-soft` | teach: fraction digits (inline), numerator | 16.56 | 600 | text | 4.5:1 | — | 6.77:1 |
| `--color-den-strong` | `--color-teach-soft` | teach: fraction digits (inline), denominator with tint | 16.56 | 600 | text | 4.5:1 | — | 6.89:1 |
| `--color-num-strong` | `--color-rule-soft` | rule: fraction digits (inline), numerator | 16.56 | 600 | text | 4.5:1 | — | 5.91:1 |
| `--color-den-strong` | `--color-rule-soft` | rule: fraction digits (inline), denominator with tint | 16.56 | 600 | text | 4.5:1 | — | 6.02:1 |
| `--color-num-strong` | `--color-example-soft` | example: fraction digits (inline), numerator | 16.56 | 600 | text | 4.5:1 | — | 6.05:1 |
| `--color-den-strong` | `--color-example-soft` | example: fraction digits (inline), denominator with tint | 16.56 | 600 | text | 4.5:1 | — | 6.16:1 |
| `--color-num-strong` | `--color-hint-soft` | hint: fraction digits (inline), numerator | 16.56 | 600 | text | 4.5:1 | — | 6.18:1 |
| `--color-den-strong` | `--color-hint-soft` | hint: fraction digits (inline), denominator with tint | 16.56 | 600 | text | 4.5:1 | — | 6.29:1 |
| `--color-num-strong` | `--color-tip-soft` | tip: fraction digits (inline), numerator | 16.56 | 600 | text | 4.5:1 | — | 5.82:1 |
| `--color-den-strong` | `--color-tip-soft` | tip: fraction digits (inline), denominator with tint | 16.56 | 600 | text | 4.5:1 | — | 5.93:1 |
| `--color-num-strong` | `--color-notice-soft` | notice: fraction digits (inline), numerator | 16.56 | 600 | text | 4.5:1 | — | 6.02:1 |
| `--color-den-strong` | `--color-notice-soft` | notice: fraction digits (inline), denominator with tint | 16.56 | 600 | text | 4.5:1 | — | 6.13:1 |
| `--color-num-strong` | `--color-misconception-soft` | misconception: fraction digits (inline), numerator | 16.56 | 600 | text | 4.5:1 | — | 6.07:1 |
| `--color-den-strong` | `--color-misconception-soft` | misconception: fraction digits (inline), denominator with tint | 16.56 | 600 | text | 4.5:1 | — | 6.18:1 |
| `--color-num-strong` | `--color-success-soft` | success: fraction digits (inline), numerator | 16.56 | 600 | text | 4.5:1 | — | 6.10:1 |
| `--color-den-strong` | `--color-success-soft` | success: fraction digits (inline), denominator with tint | 16.56 | 600 | text | 4.5:1 | — | 6.21:1 |
| `--color-num-strong` | `--color-retry-soft` | retry: fraction digits (inline), numerator | 16.56 | 600 | text | 4.5:1 | — | 5.82:1 |
| `--color-den-strong` | `--color-retry-soft` | retry: fraction digits (inline), denominator with tint | 16.56 | 600 | text | 4.5:1 | — | 5.93:1 |
| `--color-num-strong` | `--color-challenge-soft` | challenge: fraction digits (inline), numerator | 16.56 | 600 | text | 4.5:1 | — | 6.53:1 |
| `--color-den-strong` | `--color-challenge-soft` | challenge: fraction digits (inline), denominator with tint | 16.56 | 600 | text | 4.5:1 | — | 6.65:1 |
| `--color-num-strong` | `--color-surface` | card: fraction digits (inline), numerator | 16.56 | 600 | text | 4.5:1 | — | 6.77:1 |
| `--color-den` | `--color-surface` | card: fraction digits (inline), denominator | 16.56 | 600 | text | 4.5:1 | — | 4.78:1 |
| `--color-den` | `--color-surface` | card: fraction digits (sm), denominator | 16 | 600 | text | 4.5:1 | — | 4.78:1 |
| `--color-den` | `--color-surface` | card: fraction digits (md), denominator | 24 | 600 | text | 3:1 | — | 4.78:1 |
| `--color-den-strong` | `--color-surface` | card: compact fraction digits (label), denominator | 15 | 600 | text | 4.5:1 | — | 6.89:1 |
| `--color-num-strong` | `--color-surface` | card: compact fraction digits (label), numerator | 15 | 600 | text | 4.5:1 | — | 6.77:1 |
| `--color-on-strong` | `--color-success-edge` | success: tick badge icon | 40 | 800 | graphic | 3:1 | — | 3.16:1 |
| `--color-on-strong` | `--color-retry-edge` | retry: try-again badge icon | 40 | 800 | graphic | 3:1 | — | 3.45:1 |
| `--color-on-strong` | `--color-correct` | correct: tick badge icon | 28 | 800 | graphic | 3:1 | — | 5.35:1 |
| `--color-on-strong` | `--color-incorrect` | incorrect: cross badge icon | 28 | 800 | graphic | 3:1 | — | 6.77:1 |
| `--color-correct` | `--color-correct-soft` | correct: tile label | 15 | 500 | text | 4.5:1 | — | 4.82:1 |
| `--color-incorrect` | `--color-incorrect-soft` | incorrect: tile label | 15 | 500 | text | 4.5:1 | — | 5.61:1 |
| `--color-selected` | `--color-selected-soft` | selected: tile label | 15 | 500 | text | 4.5:1 | — | 12.60:1 |
| `--color-disabled-ink` | `--color-disabled-soft` | disabled: tile and button label | 15 | 500 | text | 4.5:1 | — | 4.98:1 |
| `--color-ink` | `--color-surface` | card: headings and prompt | 18 | 500 | text | 4.5:1 | 7:1 | 14.42:1 |
| `--color-ink-2` | `--color-surface` | card: reading text | 18 | 600 | text | 4.5:1 | 7:1 | 9.55:1 |
| `--color-muted` | `--color-surface` | card: labels and meta | 15 | 600 | text | 4.5:1 | — | 7.37:1 |
| `--color-on-brand` | `--color-brand` | primary button label | 20 | 800 | text | 3:1 | — | 5.16:1 |
| `--color-focus` | `--color-surface` | focus ring on a card | 3 | 0 | graphic | 3:1 | — | 5.16:1 |
| `--color-focus` | `--color-paper` | focus ring on the page | 3 | 0 | graphic | 3:1 | — | 5.17:1 (page white since D-052; 4.86:1 before) |

## 3. Today, and the gaps (4 Nov)

| Type | Today | Gap |
|---|---|---|
| teach | `LessonPlayer.tsx:263`: plain `text-lg text-ink-2` in the white step card | Matches the rule. Becomes `text-body-lg` in `max-w-reading`. |
| rule | No treatment. Key facts are `**bold**` inside explanations. | **New** treatment |
| example | `WorkedExample.tsx`: "Watch me" chip in `den-soft` (fraction blue) and an **unstyled** violet chip for faded examples (`:112`, DEF-009); conclusion in `ok-soft` (`:158`) | Uses fraction blue for a content type; one chip has no colour; the conclusion looks like success feedback |
| hint | `QuestionPlayer.tsx:280`: bulb icon on `warn-soft` | Same background as the tip, input problems and worked-example hints |
| tip | `LessonPlayer.tsx:276` → `KipSays tone="sun"`: `warn-soft` (`Kip.tsx:96`) | Looks like a hint |
| notice | `QuestionPlayer.tsx:176, :278`, `AttemptRunner.tsx:73`, `PlacementScreen.tsx:184`, `Screen.tsx:47`: `warn-soft`, no icon; `LessonPlayer.tsx:241` step-redirect notice in `den-soft` | Looks like a hint; two different treatments |
| misconception | `QuestionPlayer.tsx:316`: "Not quite. Let's look closer." on a white feedback panel, with Kip thinking and a remedy picture | Distinct by Kip and wording only; no colour, icon or shape of its own |
| success | `QuestionPlayer.tsx:103`: `FinishSheet` on `ok-soft` with a hex border (`#c6ecd7`) and the party picture | Matches the intent. The hex value becomes a token. |
| retry | `QuestionPlayer.tsx:283`: "Not quite. Have another look." shown inside the hint panel; the follow-up result sheet on `warn-soft` (`:378`) | No treatment of its own: it merges into the hint |
| challenge | No content-level treatment. The "big challenge" is a whole screen. | **New** treatment, for CUR-003 stretch items |
| prompt | `QuestionPlayer.tsx:132`: 24/28px, 800, first in the card, read-aloud beside it | Matches §2.2; sizes become tokens |

**In short:**
- teaching, prompt and success are distinct today;
- hint, tip, notice and retry share one look (`warn-soft`);
- rule and challenge have no look at all;
- the faded worked-example chip is unstyled.

## 4. The task and the next action (AC2)

1. **One task per screen region.**
   - The prompt (§2.2) or the step title is the first heading in reading order, and focus moves to it on arrival. This
     already happens: `QuestionPlayer` focuses the prompt `h3`.
2. **One primary action.**
   - Each screen state has exactly one brand-blue primary button, labelled with a verb: "Check", "Continue", "Next
     question", "Try again".
   - Placement: bottom right on desktop; full width at the bottom on phone, where the thumb reaches.
   - Secondary actions (Back, Hint) are quiet text buttons.
3. **A blocked action says why.**
   - A disabled primary button uses the disabled state (UX-002 §2.10) with a reason beside it. Today: "Answer to carry
     on" in the lesson footer.
4. **Feedback carries the next action.**
   - The success and retry sheets contain the next button, so the child never has to look elsewhere. This is today's
     `FinishSheet` pattern.
5. **Panels never push the task off-screen on a phone.**
   - A hint opens below the answers.
   - Feedback is a bottom sheet that leaves the prompt visible above it, as in the before screenshots.

**How AC2 will be verified (R1):**
- a 5-second test with children of the target age group on the migrated question and lesson screens: "What do you have to
  do? What do you press next?";
- an automated check that each screen state has exactly one primary button (QA-002).

Both are planned test cases.

## 5. R1 migration

1. Add a small `ContentPanel` component (`type`, `label`, `icon`, `children`) that applies these treatments. It is the
   only place the classes are written.
2. Replace the shared `warn-soft` panels with `hint`, `tip`, `notice` and `retry` (UX-002 §5).
3. Move the worked-example chips to `example` (this fixes DEF-009's chip) and the conclusion to `example`, not success.
4. Give misconception feedback the `misconception` treatment, inside the existing feedback panel.
5. Add `rule` and `challenge` when CUR-003 content uses them.
6. Take before/after screenshots and get Product Owner review. This step *is* a visible change.
