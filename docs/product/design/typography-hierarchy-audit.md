# Typography and visual hierarchy audit

| | |
|---|---|
| **Requested by** | Product Owner, 9 November 2026 (D-030), after the [content audit](content-differentiation-audit.md) |
| **Status** | Implemented on the development branch: CH-046 (type scale and hierarchy) and CH-047 (reflow at 200% text, DEF-020). Not accepted. UX-003 stays QA FAILED until AC3 is independently retested (D-021). |
| **Measured against** | [UX-003](UX-003-typography.md), the project's own type specification: the scale, weights, the 15px minimum, one heading-1 per screen, and the reflow rules in §7. Also [UX-004](UX-004-content-differentiation.md) §2.2: the question prompt is the largest text in its card. |

---

## 1. Method

1. **Source inventory.** I counted every text size in every `.tsx` file: one-off `text-[…]` values, Tailwind's
   default steps, and the UX-003 tokens.
2. **Rendered measurement.** A production build, opened in Playwright with the seeded learner from `src/test/seed.ts`, at
   1280px and 390px. On 10 screens I recorded each h1–h3 with its computed size and weight, every font size that
   carries visible text, any text under 15px, and the number of h1s.
3. **The `design-taste-frontend` app-screen inspector**, for an independent reading (§5), and its app-screen critique
   questions, applied to the screenshots.
4. **Graphify** to list the screens behind each shared component I changed. `ScreenHero` is used by Badges, the Lab,
   the Practice intro, the island map and the world map. `AttemptRunner` is used by the big challenge and the recheck.
5. **Text scaling.** The UX-003 §7 method: the root font size set to 200% at 390px, measuring sideways scroll. I ran it
   on the previous build too, to tell old faults from new ones.

---

## 2. Findings

| # | Where | What was wrong | Rule | Now |
|---|---|---|---|---|
| T1 | Overview, Journey detail, Full report | **Section titles were body-sized:** 18px at weight 600, the same size as the reading text under them. Only weight told them apart. | UX-003 §2: card and panel titles use `title` (20px, 800) | 20px at 800 |
| T2 | Full report, Overview | **Inverted hierarchy:** statistics at 24–30px were larger than every section title (18px). On a phone, the last three figures on the report were the biggest text on the page. | App-screen critique Q1: the largest figure answers the screen's question | The mastery-check score is the largest figure (34px, heading-1, as UX-003 §3 asks for scores). The other statistics are 26px (heading-2), still above the 20px section titles, which they belong to. |
| T3 | Overview | **Two equal titles:** the page h1 and the module name (an h2) were both 36px (30px on a phone). | UX-003 §3: one heading-1 per screen | h1 34/26px; module name 26/20px |
| T4 | Journey detail, Full report | Page titles at **weight 600**; every other title in the app is 800 | UX-003 §1: headings 800 | 800 |
| T5 | All grown-up titles | 30px and 36px are **not on the scale** | UX-003 §2 | heading-1 (34px) on desktop, heading-2 (26px) on a phone |
| T6 | Big challenge intro | **No h1**: the title was an h2 (36px), so the screen had no top-level heading | UX-003 §3; WCAG 1.3.1 | An h1. After a finish the celebration above already holds the h1, so the intro title becomes an h2 in that state only. |
| T7 | Big challenge and recheck questions | **The prompt was weaker where the child works alone:** 20–24px at 600, while lessons and practice set prompts at 24–28px at 800 | UX-003 §3 and UX-004 §2.2: prompt tokens, weight 800, largest in the card | `prompt-sm` / `prompt` at 800 everywhere a child answers |
| T8 | 30 files | **113 hand-coded `text-[0.9375rem]`** (15px), the label size written out instead of the `label` token. They inherited the body's 1.6 line height instead of the label's 1.4. | UX-003 §2; UX-002 (tokens, not isolated values) | `text-label` |
| T9 | Home, world map, cards | Off-scale sizes: 16px (UX-003: "16px is not on the scale"), 24px and 30px world titles, 32px phone heroes | UX-003 §2 | Moved by role: meta to `label`, reading lines to `body`, world titles to `heading-2`, heroes to `heading-1` on a phone |
| T10 | Island map, Home lesson cards | **Lesson titles at 18px**, the body size, inside cards whose titles UX-003 sets at 20px | UX-003 §2 | `title` (20px). On Home, 18px on a phone and 20px from tablet up, as before. |
| T11 | Overview, Journey detail, Full report | **Sideways scroll at 200% text** (29, 125 and 90px) with a learner who has check results. **DEF-020 is recorded as fixed** but still reproduced in this state: the longer rows and review buttons only appear after a check. | UX-003 §7, AC3; WCAG 1.4.10 | 0px on all three (CH-047). Measured identically on the previous build, so not caused by this round. |

Nothing anywhere renders under 15px, before or after. The DEF-010 minimum holds.

### Measured before and after (h1 / largest section title, desktop · phone)

| Screen | Before | After |
|---|---|---|
| Overview | h1 36/800 and an h2 36/600 · sections 18/600 | h1 34/800 · module 26/800 · sections 20/800 |
| Journey detail | h1 36/**600** · lesson titles 18/600 | h1 34/800 · lesson titles 20/800 |
| Full report | h1 36/**600** · sections 18/600 · figures 30 | h1 34/800 · sections 20/800 · score 34, figures 26 |
| Big challenge | **no h1** (h2 36) | h1 34/800 (26 on a phone) |
| Big challenge question | prompt 20–24/600 | prompt 24–28/800 |
| World map | world titles 30 (24 on a phone) | 26 at both widths |
| Hero screens (5) | h1 42 (32 on a phone) | h1 42 (34 on a phone, the heading-1 token) |

The source went from **144 one-off text sizes to 24**. The ratchet in `src/design-tokens.test.ts` drops from 224 to 24, so
they can't grow back.

---

## 3. What was deliberately not changed

| Item | Why |
|---|---|
| **Child headings stay large** (42–48px heroes) | The inspector warns that an app title should be 18–32px. That rule is for adult work tools. UX-001 measured the large child type as a strength, and UX-003 keeps it on purpose. |
| **Card shadows** (the inspector's one FAIL) | UX-002's elevation tokens are accepted (D-023). Changing them is a brand decision, not a hierarchy fix. |
| **Lesson and question internals:** the lesson step title (28/32px), feedback headlines (24/28px), number inputs and kit visuals (28/32px) | These sit inside the lesson flow that R1 QA and CUR-004 are reviewing. They need their own tokens (a lesson-title size, an answer-input size) agreed first. They are most of the 24 sizes that remain. |
| **Button text** (17px and 19px) | These sizes are set in the shared button component, where they belong. UX-002 should name them as control tokens before they change. |
| **The < = > answer symbols** in the report's answer review (30px) | Maths notation inside a control, not hierarchy |

---

## 4. Remaining work, by priority

| Priority | Work |
|---|---|
| P1 | Independent retest of DEF-020 (with a learner who has check results) and of UX-003 AC3 |
| P1 | Name the lesson-title and answer-input sizes as tokens, then move the lesson and question internals onto them (most of the 24 remaining one-off sizes) |
| P2 | Name the button text sizes as control tokens in UX-002 |
| P2 | Home hero lead text: 18px on a phone, 19px on desktop, written as one-off values. Both match tokens (`body`, `body-lg`). |
| P3 | Make the 200% text check an automated test (UX-008 / QA-005), with a seeded learner that has check results, so a state-dependent overflow like T11 can't hide again |

---

## 5. Evidence and its limits

- `npm test` (379 tests), lint, typecheck and the production build pass.
- Browser checks: 32 combinations of page, state and width, with no sideways scroll and no console errors. At 200% text,
  six screens scroll 0px sideways. The review buttons stay on one line at 1280, 768 and 390px.
- Inspector (island map, 1440/768/390): 1 FAIL (shadows, §3) and 3 WARNs (title size, §3; a capped content width; the
  phone tab label 13px from the edge). The grown-up pages could not be inspected with it, because it cannot pass the
  grown-ups gate. They were measured with the project's own script instead.
- **Developer evidence only.** No screen reader, real device or child. Type sizes were measured, not tested for
  comprehension.
