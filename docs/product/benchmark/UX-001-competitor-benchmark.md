# UX-001 — Competitor UX benchmark

| | |
|---|---|
| **Backlog item** | UX-001: competitor UX benchmark (P0, R0) |
| **Status** | READY FOR QA, waiting for Product Owner review |
| **Research date** | 3 November 2026. Every observation below is dated that day unless it says otherwise. |
| **Method** | Public evidence only (D-010, RC-004): <ul><li>public pages measured in a real browser (Chromium through Playwright, at 1280px and 390px);</li><li>public practice and exercise screens;</li><li>official help-centre, accessibility and government pages;</li><li>App Store listings;</li><li>a school-published guide with product screenshots.</li></ul> We used no paid accounts and no learner logins. |
| **Rule** | No claim that any product, including ours, is "best in market". Every rating cites evidence, and anything we couldn't see is marked **not observed**. |

---

## 1. Summary

**Who we looked at.**
- Atom Learning, the main 11+ competitor.
- Times-table fluency products: Times Tables Rock Stars, DoodleTables, and the official DfE check as the reference format.
- Adaptive practice platforms: IXL, DoodleMaths, Mathletics.
- A free concept-teaching benchmark: Khan Academy.
- An interaction-quality benchmark: Polypad virtual manipulatives.
- Kite Maths itself, scored on the same rubric.

**What we found**

1. **Atom Learning's strength is the 11+ journey and the parent view, not in-question teaching.**
   - Atom shows a weekly plan aimed at a target school, subject "islands" per week, unlimited timed mocks, and a parent
     dashboard that compares the child with successful applicants to their target school (E-01, E-02, E-04, E-06).
   - When a child is stuck on a question, help comes from a separate panel offering a video, a help sheet, or "Skip to
     answer explanation". The question screen itself is plain multiple choice (E-04, observed on an English question).
   - Atom documents **no built-in accessibility settings**; its SEND article sends families to Windows or Mac system
     settings (E-05).
2. **Times-table products measure fluency mainly as speed.**
   - TT Rock Stars builds its fact heatmap from response time only. It needs 10 answers per fact, and a fact goes "green"
     at 4 seconds or faster (E-07). Accuracy is not part of the heatmap.
   - TT Rock Stars has the richest documented in-product accessibility options of any product here: a dyslexia-friendly
     font, a huge font, declutter, a colour-blind mode, read-aloud questions and spoken answers (E-08).
   - The official multiplication tables check (25 questions, 6 seconds each, 3-second gap) defines nine access
     arrangements, including colour contrast, font size and an audio version (E-11).
3. **Interactive maths quality varies widely.**
   - Khan Academy's exercises are typographically careful, with typeset fractions, and had zero automated accessibility
     findings on the rules tested.
   - IXL's practice pages are dense, with many small controls (21 of 34 under 24px on a phone) and many automated contrast
     findings (E-17, E-21).
   - Polypad shows how good free manipulatives can be (E-23).
4. **Kite Maths already competes on readability and touch-friendliness** on its learning screens:
   - question prompts are 24–28px, teaching text 18px with 1.6 line spacing;
   - 1 small target per screen;
   - zero automated accessibility findings (E-24).

   **But it is behind on:**
   - the parent view;
   - timed fluency modes;
   - mock exams;
   - accessibility *settings*;
   - content volume;
   - native apps.

   Its likely differentiators are **concept teaching inside the flow** (explain → worked example → check, with interactive
   fraction models) and **misconception-aware recovery**. Both are only claims until R1 acceptance proves them.

---

## 2. Scope, evidence types and limits

**Competitor set and why** (RC-004)

| Product | Why it is relevant | Backlog link |
|---|---|---|
| **Atom Learning** | Named in the backlog; the leading UK 11+ platform | Whole product, especially EXAM and PARENT |
| **Times Tables Rock Stars** | The best-known UK times-table product in schools | TT-001 to TT-012 |
| **DoodleMaths / DoodleTables** | Adaptive KS1–KS2 practice with a tables app | PRACT, TT |
| **Mathletics** | Gamified KS2 practice used by schools | PRACT, MAST |
| **IXL** | Adaptive skill practice; public practice pages let us measure real learning screens | PRACT, MAST, UX |
| **Khan Academy** | Free concept teaching with public exercises; declared accessibility standard | FR, PRACT, UX-007 |
| **Polypad** (Amplify / Mathigon) | Free virtual manipulatives; benchmark for interaction quality | LAB |
| **DfE multiplication tables check** | Not a competitor; the official format R2 must simulate | TT-009, UX-007 |
| **Kite Maths** | Scored with the same rubric, so no comparison is one-sided | All |

**Evidence types**

| Type | Meaning |
|---|---|
| **O** | Observed: we saw or measured the real product screen. |
| **D** | Documented: the vendor's own help, accessibility or official page. |
| **M** | Marketing: the vendor's sales pages, including measurements of those pages. |
| **S** | Secondary: school guides, App Store listings, third parties. |

A **marketing page is not the product**. Measurements of marketing pages describe the brand's web craft, not the
child's learning screen.

**Limits.** Read the findings with these in mind.
- **Product screens behind a login were not observed:**
  - Atom maths questions;
  - TT Rock Stars games;
  - DoodleMaths;
  - Mathletics.

  For these products, typography, interactions and animation are **not observed** unless documented. Follow-up F-1 asks
  the Product Owner whether to buy trial access.
- **Automated accessibility checks** (axe-core) catch only part of WCAG. "0 findings" means none of the tested rules
  failed. It does not mean the product is accessible. There was no screen-reader or keyboard-only walkthrough (F-3).
- **Contrast** was measured on one representative text element per page.
- **Logged-out pages showed cookie notices and sign-up prompts.** We dismissed them where possible. Where they distorted a
  measurement, the table says so.
- **Wrong-answer feedback on IXL and Khan was not captured.** A sign-up overlay and custom answer controls blocked our
  logged-out attempts.
- **One date only.** Products change; re-run the scripts in `evidence/data/` before relying on numbers later.

---

## 3. Evidence register

| ID | Source | Type | Date | What it shows |
|---|---|---|---|---|
| E-01 | [atomlearning.com/llms.txt](https://atomlearning.com/llms.txt) | D | 3 Nov 2026 | Atom's own product summary: <ul><li>ages 7 to GCSE;</li><li>weekly exam plan, unlimited mocks, SAS tracking, photograph-and-mark papers;</li><li>11+ plans £39.99–£69.99/month;</li><li>partnered with 1,000+ schools, 350,000+ families (vendor claim).</li></ul> No statement on lesson format or accessibility. |
| E-02 | [atomlearning.com/11-plus](https://atomlearning.com/11-plus) | M | 3 Nov 2026 | <ul><li>"interactive resources, including video tutorials and simple helpsheets"</li><li>"3000+ flashcards, 2000+ helpsheets, 600+ videos"</li><li>live and on-demand lessons</li><li>"questions adapt to build confidence steadily"</li><li>mocks "replicate the format, timing, and conditions"</li><li>"around 2 hours a week", in 20–30 minute sessions</li><li>product images have empty alt text</li></ul> |
| E-03 | [atomlearning.com/atom-learning-vs/ixl](https://www.atomlearning.com/atom-learning-vs/ixl) | M | 3 Nov 2026 | Atom's own comparison with IXL. It credits IXL with adaptive learning, explanations after wrong answers, parent reports, and 10 free questions a day. It claims for itself mocks, an exam plan and target-school benchmarking. This is a competitor's claim. |
| E-04 | Scott Primary School, ["Parent user guide for Atom Learning"](https://scottprimary.co.uk/wp-content/uploads/2025/11/Parent-user-guide-for-Atom-Learning.pdf) (Nov 2025) — [screens](evidence/screens/) `E04-*` | S, with O screenshots | Published Nov 2025 | Real Atom School screens. <ul><li>**Dashboard:** to-do list; "exam prep plan" with "islands done this week" per subject.</li><li>**Question screen:** passage panel and A–E choices, "Question 3/5" progress bar, Hint and Check answer.</li><li>**Hint panel** ("Question help"): Watch Video, Read Helpsheet, "Skip to answer explanation", "Try your best to work it out first!".</li><li>**Guide text:** "The next question will adapt to be easier".</li></ul> The questions shown are English comprehension, not maths. |
| E-05 | [Atom Home: How can Atom Home support children with SEND?](https://resources.atomlearning.co.uk/en/knowledge/how-can-atom-home-support-with-accessibility) | D | 3 Nov 2026 | Read-aloud and colour overlays are reached through **Windows or Mac system settings**. No in-platform font size, dyslexia font, timer or screen-reader guidance. |
| E-06 | atomlearning.com/11-plus, measured; screens `E06-*` | M | 3 Nov 2026 | Product previews: <ul><li>parent "Track Georgie's exam preparation", with a comparison to "successful applicants" and "On track" labels;</li><li>child home "Hi Georgie!" with a monster avatar, 150 coins, and colour-coded subject tiles showing islands.</li></ul> Typography: Inter, body 14px on desktop and 12.8px on phone. Trustpilot widget showed 4.4/5 from 1,480 reviews. |
| E-07 | TT Rock Stars help: [Heatmaps](https://intercom.help/times-tables-rock-stars/en/articles/3871753-heatmaps-ttrs), [Fluency](https://intercom.help/times-tables-rock-stars/en/articles/4486394-fluency-ttrs) | D | 3 Nov 2026 | <ul><li>The heatmap is the average of a fact's last 10 response times.</li><li>Green means 4 seconds or faster, consistently.</li><li>Facts show only after 10 answers.</li><li>Jamming (the untimed mode) is excluded.</li><li>The teacher sets a "table target" speed, for example 5 seconds.</li><li>Accuracy isn't mentioned.</li></ul> |
| E-08 | [TT Rock Stars: Accessibility options](https://intercom.help/times-tables-rock-stars/en/articles/2652179-accessibility-options-ttrs) | D | 3 Nov 2026 | High-visibility login, colour schemes, Huge font, Lexie (dyslexia) font, large-print worksheets, Declutter mode (hides clock, scoring and number pad), Colourblind mode, browser screen-reader support, Hear Questions (Chrome desktop only), Speak Answers. |
| E-09 | [App Store: Times Tables Rock Stars](https://apps.apple.com/gb/app/times-tables-rock-stars/id973811326) | S | 3 Nov 2026 | <ul><li>4.6 stars from 139k UK ratings.</li><li>Free download; subscription required.</li><li>The App Store "Accessibility" section declares **no features**. Release notes mention questions read aloud.</li></ul> |
| E-10 | ttrockstars.com, measured; screen `E10-*` | M | 3 Nov 2026 | Rock-star cartoon brand ("Multiplication & division. Solved."). Open Sans 18px body; display font Boogaloo. |
| E-11 | [DfE: MTC administration guidance](https://www.gov.uk/government/publications/multiplication-tables-check-administration-guidance/multiplication-tables-check-administration-guidance) | D (official) | 3 Nov 2026 | <ul><li>3 practice questions, then 25 questions.</li><li>6 seconds per question, 3-second pause.</li><li>On-screen number pad or keyboard.</li><li>Access arrangements: colour contrast (5 schemes), font size, "Next" button between questions, remove number pad, input assistant, audio version, audible time alert.</li><li>No extra time.</li></ul> |
| E-12 | Doodle help: [What is DoodleMaths](https://help.doodlelearning.com/en/articles/5415855-what-is-doodlemaths), [DoodleTables](https://help.doodlelearning.com/en/articles/7019389-doodletables) | D | 3 Nov 2026 | <ul><li>Proxima™ work programme that updates "with every question answered".</li><li>DoodleTables has two stages: **Learn** ("how numbers relate") and the **60-Second Challenge** (recall), which is useful for the Year 4 check.</li></ul> |
| E-13 | [App Store: DoodleMaths](https://apps.apple.com/gb/app/doodlemaths-primary-maths/id598196680) | S | 3 Nov 2026 | <ul><li>4.1 stars from 6.9k UK ratings.</li><li>Placement questions, then a personalised programme; "visual explanations"; "10 minutes a day".</li><li>From £7.99 a month.</li><li>Accessibility section declares **no features**.</li></ul> |
| E-14 | doodlelearning.com/maths-app, measured; screen `E14-*` | M | 3 Nov 2026 | Bright cyan cartoon style; Nunito Sans 18px; 77 reduced-motion CSS rules. The page scrolled sideways at 1280px. |
| E-15 | Mathletics knowledge base: [student features](https://knowledgebase.mathletics.com/mathletics-student-features), [primary console map](https://knowledgebase.mathletics.com/student-console-basics/primary-student-console-map-and-feature-descriptions) | D (via search summaries) | 3 Nov 2026 | Points, certificates (Bronze to Legend), the Meritopia reward world, a "Show Me How" guide, themes. **We found no accessibility documentation.** |
| E-16 | mathletics.com/uk, measured; screen `E16-*` | M | 3 Nov 2026 | Space or game-world imagery; Open Sans 16px. Automated checks found missing image alt text (critical). |
| E-17 | IXL public practice: [Understand fractions: fraction bars](https://uk.ixl.com/maths/year-4/understand-fractions-fraction-bars), [Fractions of a group](https://uk.ixl.com/maths/year-4/fractions-of-a-group); screens `E17-*` | O | 3 Nov 2026 | Real practice screens: <ul><li>a "Time elapsed" clock always visible, plus "Questions answered" and "SmartScore out of 100";</li><li>"Learn with an example";</li><li>"Work it out / Not feeling ready yet?" links to easier skills;</li><li>fraction-bar construction with typed numerator and denominator boxes;</li><li>multiple choice with stacked fractions;</li><li>a "First time here?" sign-up overlay.</li></ul> |
| E-18 | IXL: [SmartScore guide](https://www.ixl.com/materials/SmartScore_Guide.pdf), [blog](https://blog.ixl.com/2020/11/11/ixl-smartscore-the-key-to-mastery-based-learning/) | D | 3 Nov 2026 | SmartScore runs 0–100, rising with right answers and falling with wrong ones. 80 is "proficiency", 100 is mastery, which can need up to 10 correct in a row. A third party describes a "Challenge Zone" above 90; not verified with IXL. |
| E-19 | [IXL blog: features for young learners](https://blog.ixl.com/?p=12811); [IXL Accommodations PDF](https://www.ixl.com/materials/us/IXL_Accommodations.pdf) | D (via search summaries) | 3 Nov 2026 | Read-aloud for questions up to 2nd grade (US), roughly UK Year 3, plus audio on maths explanations. We did not read the WCAG level of IXL's accessibility report. |
| E-20 | [Khan Academy accessibility statement](https://www.khanacademy.org/about/accessibility-statement), rendered in a browser | D | 3 Nov 2026 (statement updated 26 Aug 2026) | "we have adopted the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA as our baseline"; feedback by web form and email. |
| E-21 | Khan Academy public exercises: ["That's not fair"](https://www.khanacademy.org/math/arithmetic/fraction-arithmetic/x18ca194a:fractions-intro/e/that-s-not-fair-), [Fractions on the number line 1](https://www.khanacademy.org/math/arithmetic/fraction-arithmetic/x18ca194a:fractions-on-the-number-line/e/fractions_on_the_number_line_1); screens `E21-*` | O | 3 Nov 2026 | <ul><li>Clean exercise canvas with typeset fractions.</li><li>"Choose 1 answer", "Do 7 problems" progress dots, Skip and Check.</li><li>Interactive number line ("Move the dot to ¼… change the number of divisions").</li><li>Logged-out phone view: sign-up and teacher banners plus the cookie notice fill most of the first screen.</li><li>A keyboard probe of the number line was **not completed**: the page returned an error on retry.</li></ul> |
| E-22 | [Khan Academy: How do Mastery levels work?](https://support.khanacademy.org/hc/tr/articles/5548760867853) | D (via search summaries) | 3 Nov 2026 | Skills move through Not started → Attempted → Familiar → Proficient → Mastered. Course mastery counts only Proficient and Mastered. |
| E-23 | [polypad.amplify.com](https://polypad.amplify.com/), measured; screen `E23-*` | O (tool landing) | 3 Nov 2026 | A free "mathematical playground" of manipulatives: fraction bars, number lines, tiles, protractor, balance. 74 reduced-motion CSS rules; no targets under 24px. |
| E-24 | [kitemaths.vercel.app](https://kitemaths.vercel.app) (`main` at `bbf210a`), measured; screens `E24-*` | O | 3 Nov 2026 | Same rubric, same scripts. GOV-001 audit findings apply (DEF-001 to DEF-017). |

Raw data: `evidence/data/page-metrics-pass1.json` and `evidence/data/question-metrics-pass2.json`.
Scripts: `evidence/data/measure-pass1.js.txt` and `measure-pass2.js.txt`. Rename them to `.js` and run them with Node and
Playwright.

---

## 4. Measurements

### 4.1 Learning screens: the question itself

These measure the question prompt and its answer controls, not the page around them.

| Learning screen | Width | Prompt font | Prompt size | Line height | Weight | Prompt contrast | Answer/control text sizes | Targets under 24px |
|---|---|---|---|---|---|---|---|---|
| IXL (fractions of a group) | desktop | ixl-glyphs | 16px | 22.4px (1.4) | 400 | 21:1 | 14px, 15px, 16px | 23/49 |
| Khan Academy ("That's not fair") | desktop | Lato | 16px | 20px (1.25) | 400 | 15.5:1 | 12px, 13px, 14px, 16px, 20px | 12/42 |
| Khan Academy (number line) | desktop | Lato | 16px | 20px (1.25) | 700 | 15.5:1 | 13px, 14px, 16px, 20px | 12/44 |
| Kite Maths (lesson) | desktop | Nunito | 18px | 29.25px (1.62) | 500 | 7.3:1 | 16px, 18px, 19px | 1/13 |
| Kite Maths (question) | desktop | Nunito | 28px | 38.5px (1.38) | 800 | 14.4:1 | 18px, 19px | 1/8 |
| IXL (fractions of a group) | phone | ixl-glyphs | 16px | 22.4px (1.4) | 400 | 21:1 | 14px, 15px, 16px | 21/34 |
| Khan Academy ("That's not fair") | phone | Lato | 16px | 20px (1.25) | 400 | 15.5:1 | 12px, 13px, 14px | 2/22 |
| Khan Academy (number line) | phone | Lato | 16px | 20px (1.25) | 700 | 15.5:1 | 13px, 14px, 16px | 2/20 |
| Kite Maths (lesson) | phone | Nunito | 18px | 29.25px (1.62) | 500 | 7.3:1 | 18px, 19px | 1/7 |
| Kite Maths (question) | phone | Nunito | 24px | 33px (1.38) | 800 | 14.4:1 | 18px, 19px | 1/7 |

The IXL fraction-bars page is left out of this table: the prompt finder picked up the breadcrumb, not the question. Its
screenshot is `E17-ixl-fraction-bar-input-desktop.jpg`.

### 4.2 Whole pages

| Page | Type | Width | Main font | Body text (dominant) | Smallest text | Text under 14px | Body contrast | Reduced-motion CSS rules | Running animations | Sideways scroll | Targets under 24px | Automated accessibility findings (axe-core 4.10.2, WCAG 2.0–2.2 A/AA rules) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Atom Learning | Marketing | desktop | Inter | 14px | 14px | 0% | 11.8:1 | 0 (+1 unreadable sheets) | 3 | No | 25/71 | 2 rules (0 critical, 2 serious): color-contrast×18, link-name×4 |
| TT Rock Stars | Marketing | desktop | Open-Sans | 18px | 12px | 2% | 12.8:1 | 2 (+1 unreadable sheets) | 0 | No | 34/97 | 2 rules (1 critical, 1 serious): aria-allowed-attr×2, target-size×2 |
| DoodleMaths | Marketing | desktop | Nunito Sans | 18px | 14px | 0% | 10.4:1 | 77 (+2 unreadable sheets) | 0 | Yes | 13/76 | 2 rules (0 critical, 2 serious): color-contrast×5, link-name×3 |
| Mathletics | Marketing | desktop | Open Sans | 16px | 12px | 5% | 6.9:1 | 0 | 0 | No | 27/41 | 4 rules (1 critical, 3 serious): color-contrast×2, image-alt×3, link-name×4, target-size×4 |
| IXL (fraction bars) | Learning screen | desktop | Verdana | not meaningful¹ | 9px | 45% | not meaningful¹ | 1 | 0 | No | 29/51 | 5 rules (1 critical, 4 serious): aria-tooltip-name×1, button-name×1, color-contrast×30, list×3, listitem×6 |
| IXL (fractions of a group) | Learning screen | desktop | Verdana | 16px | 9px | 64% | 21:1 | 1 | 0 | No | 23/49 | 5 rules (1 critical, 4 serious): aria-tooltip-name×1, button-name×1, color-contrast×25, list×3, listitem×6 |
| Khan Academy ("That's not fair") | Learning screen | desktop | Lato | not meaningful¹ | 12px | 21% | not meaningful¹ | 0 (+5 unreadable sheets) | 0 | No | 12/42 | 0 |
| Khan Academy (number line) | Learning screen | desktop | Lato | not meaningful¹ | 12px | 21% | not meaningful¹ | 0 (+5 unreadable sheets) | 0 | No | 12/44 | 0 |
| Polypad | Tool | desktop | benton-sans | 18px | 9px | 37% | 10.8:1 | 74 | 0 | No | 0/31 | 2 rules (1 critical, 1 serious): color-contrast×26, image-alt×1 |
| Kite Maths (home) | Learning screen | desktop | Nunito | 18px | 15px | 0% | 6.9:1 | 1 | 2 | No | 1/28 | 0 |
| Kite Maths (lesson) | Learning screen | desktop | Nunito | 18px | 15px | 0% | 7.3:1 | 1 | 1 | No | 1/13 | 0 |
| Kite Maths (question) | Learning screen | desktop | Nunito | 28px | 15px | 0% | 14.4:1 | 1 | 0 | No | 1/8 | 0 |
| Atom Learning | Marketing | phone | Inter | 12.8px | 12.8px | 25% | 11.8:1 | 0 (+1 unreadable sheets) | 1 | No | 25/57 | 3 rules (0 critical, 3 serious): color-contrast×7, link-name×3, scrollable-region-focusable×1 |
| TT Rock Stars | Marketing | phone | Open-Sans | 14px | 11px | 3% | 12.8:1 | 2 (+1 unreadable sheets) | 0 | No | 34/80 | 3 rules (1 critical, 2 serious): aria-allowed-attr×2, color-contrast×1, target-size×8 |
| DoodleMaths | Marketing | phone | Nunito Sans | 18px | 16px | 0% | 10.4:1 | 77 (+2 unreadable sheets) | 0 | No | 11/59 | 2 rules (0 critical, 2 serious): color-contrast×4, link-name×3 |
| Mathletics | Marketing | phone | Open Sans | 16px | 12px | 4% | 17.6:1 | 0 | 0 | No | 28/37 | 3 rules (0 critical, 3 serious): color-contrast×3, link-name×4, target-size×4 |
| IXL (fraction bars) | Learning screen | phone | Verdana | not meaningful¹ | 9px | 34% | not meaningful¹ | 1 | 0 | No | 27/36 | 2 rules (1 critical, 1 serious): button-name×1, color-contrast×20 |
| IXL (fractions of a group) | Learning screen | phone | Verdana | 16px | 9px | 56% | 21:1 | 1 | 0 | No | 21/34 | 2 rules (1 critical, 1 serious): button-name×1, color-contrast×15 |
| Khan Academy ("That's not fair") | Learning screen | phone | Lato | not meaningful¹ | 12px | 15% | not meaningful¹ | 0 (+5 unreadable sheets) | 0 | No | 2/22 | 0 |
| Khan Academy (number line) | Learning screen | phone | Lato | not meaningful¹ | 12px | 16% | not meaningful¹ | 0 (+5 unreadable sheets) | 0 | No | 2/20 | 0 |
| Polypad | Tool | phone | benton-sans | 18px | 12px | 13% | 10.8:1 | 74 | 0 | No | 0/30 | 2 rules (1 critical, 1 serious): color-contrast×26, image-alt×1 |
| Kite Maths (home) | Learning screen | phone | Nunito | 18px | 15px | 0% | 6.6:1 | 1 | 2 | No | 1/27 | 0 |
| Kite Maths (lesson) | Learning screen | phone | Nunito | 18px | 15px | 0% | 7.3:1 | 1 | 1 | No | 1/7 | 0 |
| Kite Maths (question) | Learning screen | phone | Nunito | 24px | 15px | 0% | 14.4:1 | 1 | 0 | No | 1/7 | 0 |

¹ On the IXL fraction-bars page, "dominant body text" measured the drawing's table-cell separators. On the Khan pages it
measured the cookie notice. Use the question table above for those screens.

---

## 5. Rubric comparison

**Ratings:**

| Rating | Meaning |
|---|---|
| **Strong** | Evidence shows this done well. |
| **Mixed** | Real strengths and real problems. |
| **Weak** | Evidence shows a clear problem. |
| **Not observed** | We had no evidence of the product screen. |

The letters O, D, M and S give the evidence type (section 2). Kite Maths is scored with the same standard of evidence.

| Dimension | Atom Learning | TT Rock Stars | DoodleMaths | Mathletics | IXL | Khan Academy | Polypad | **Kite Maths** |
|---|---|---|---|---|---|---|---|---|
| **Visual design** | **Strong**: calm, uncluttered, consistent screens; the child layer adds an avatar and coins (O E-04, M E-06) | Not observed in product. The brand is loud, and a Declutter mode exists (M E-10, D E-08). | Not observed (M E-14) | Not observed (M E-16) | **Weak**: dense chrome, competing panels and overlays (O E-17) | **Strong** exercise canvas; logged-out banners crowd it (O E-21) | **Strong** (O E-23) | **Strong** on lesson and question screens (O E-24). Home has open defects (DEF-001 to DEF-009). |
| **Typography** | **Mixed**: answer text noticeably smaller than the passage text (O E-04); marketing body 14px, 12.8px on phone (M E-06) | Not observed. Huge font and Lexie font options (D E-08). | Not observed (M: Nunito Sans 18px) | Not observed (M: Open Sans 16px) | **Mixed**: 16px prompt; 14–15px controls; stacked fractions (O E-17) | **Mixed**: 16px prompt with tight 1.25 line height; excellent typeset fractions (O E-21) | n/a | **Strong**: 24–28px weight-800 prompts; 18px/1.62 teaching text; coloured stacked fractions (O E-24). Exceptions: DEF-010. |
| **Readability** | **Mixed**: 11.8:1 contrast, but 18 automated contrast findings on marketing (M) | Not observed | Not observed | Not observed | **Mixed**: 21:1 prompt, but 15–30 automated contrast findings on practice pages (O) | **Strong**: 15.5:1, 0 automated findings (O) | **Mixed**: 26 contrast findings (O) | **Strong**: 14.4:1 prompts, 7.3:1 teaching text, 0 automated findings (O) |
| **Content differentiation** (teaching vs task vs help vs feedback) | **Strong**: separate passage panel, question card and "Question help" panel; distinct Hint and Check buttons (O E-04) | Not observed | Not observed | Not observed | **Mixed**: the task is clear; stats sidebar; "Learn with an example". Feedback not observed (O E-17). | **Mixed**: clean task with a "Choose 1 answer" instruction; hints and feedback not observed (O E-21) | n/a | **Mixed**: prompt, teaching and feedback are distinct, but hint, tip and input-problem panels look alike (O, GOV-001 §5 → UX-004) |
| **Mathematical interactions** | Not observed for maths. The English screen is multiple choice (O E-04). | **Mixed**: typed recall on a number pad; spoken answers (D E-08). Recall only. | Not observed. Claims "a huge range of question styles" (D E-12). | Not observed | **Mixed**: fraction-bar building with typed fraction boxes; multiple choice with fractions (O E-17) | **Strong**: interactive number line with adjustable divisions (O E-21). Keyboard use not determined. | **Strong**: wide range of manipulatives, for exploration (O E-23) | **Strong for Fractions**: shading, equal parts, matching, number-line placement, lab with synchronised notation; keyboard shading (O, GOV-001). Kit islands have only choose and number. |
| **Animation quality** | Not observed in product. Marketing has fade-in previews, 3 running animations (M). | Not observed | Not observed | Not observed | Not observed (no motion on the question screen; feedback not reached) | Not observed (no motion on the exercise; feedback not reached) | n/a | **Mixed**: purposeful feedback motion, and reduced motion respected, but some decorative motion: Kip's sway, hover lift (O, GOV-001 §5) |
| **Accessibility** | **Weak**: no built-in settings documented; families sent to OS tools (D E-05) | **Strong options** documented (D E-08), but none declared on the App Store (S E-09) | Not established: none declared on the App Store (S E-13) | Not established: no documentation found (D E-15) | **Mixed**: read-aloud for younger grades (D E-19); a critical "button-name" finding plus contrast findings (O) | **Strong**: WCAG 2.1 AA baseline (D E-20) and 0 automated findings (O). Automated subset only. | **Mixed** (O) | **Mixed**: 0 automated findings, read-aloud, reduced motion, 15px minimum. No text-size or colour settings; number boxes lose the focus ring (DEF-015); no screen-reader test. |
| **Learning journey** | **Strong** for the 11+: target-school weekly plan, islands, to-do list, adaptive help, timed mocks (O E-04, M E-02) | **Strong** for recall fluency, but speed-centred (D E-07) | **Mixed**: placement, then a personalised programme, 10 minutes a day (D E-12, S E-13) | Not observed: points, certificates, reward world (D E-15) | **Mixed**: skill-by-skill SmartScore 0–100 with 80 as proficient; links to easier skills (O E-17, D E-18) | **Strong**: course → unit → lesson → exercise, with four mastery levels (O E-21, D E-22) | n/a (free exploration) | **Mixed**: islands; explain → worked example → check; adaptive practice; misconception follow-ups; independent check. No prerequisites; lessons complete by stepping through (O, GOV-001 R-3). |
| **Mobile usability** | **Mixed**: purpose-built mobile layouts shown (M E-06); marketing text 12.8px on phone | Native apps, 4.6 stars from 139k UK ratings (S E-09). Product not observed. | Native apps, 4.1 stars from 6.9k (S E-13) | App exists (D E-15) | **Weak**: 21 of 34 controls under 24px on the practice page (O) | **Mixed**: usable exercise; logged-out banners take most of the first screen (O) | **Strong** landing (0 small targets) | **Strong**: 1 of 7 controls under 24px, no sideways scroll, focus mode (O). Web only, no native app. |
| **Parent experience** | **Strong**: live dashboard with standardised age scores and target-school comparison (M E-02, E-06) | Heatmaps for teachers and families (D E-07) | Parent Dashboard and a parent app (D E-12, S) | Not observed | Analytics by skill (D E-03) | Not assessed | n/a | **Weak**: grown-ups area for the active island only (DEF-012) |

---

## 6. What the market treats as baseline

These came up across several competitors. Families and schools are likely to expect them. None of this is a feature
request: each would go through the backlog and the change rules.

| Expectation | Seen in | Kite today |
|---|---|---|
| Adaptive practice that changes difficulty from answers | Atom (E-02, E-04), IXL (E-18), Doodle (E-12) | Yes: adaptive practice on every island (not yet accepted) |
| Help when stuck: worked explanation, video or example | Atom (video, help sheet, explanation; E-04), IXL ("Learn with an example"; E-17), Doodle ("visual explanations"; E-13) | Yes: hints, misconception follow-ups, worked examples in lessons. No video. |
| Visible progress for the child | Atom (islands per week), IXL (SmartScore), Khan (mastery levels, "Do 7 problems") | Yes: stars, levels, lesson progress, skill statuses |
| A parent view | Atom (live, compared with target school), IXL, Doodle, TT Rock Stars | Partial: one island at a time (DEF-012; R5 PARENT-002) |
| Timed fluency modes and fact-level tracking | TT Rock Stars (E-07), DoodleTables 60-Second Challenge (E-12), DfE check (E-11) | No (R2: TT-006, TT-009, TT-011) |
| Timed mocks that match the exam | Atom (E-02) | No: the Mock exams preview is untimed (R5: EXAM-005) |
| Accessibility settings inside the product | TT Rock Stars (E-08), the DfE check (E-11) | Read-aloud and reduced motion only (UX-007) |
| Native mobile apps | TT Rock Stars, Doodle, Mathletics (S) | No: responsive web only |
| Rewards: avatars, coins, certificates | Atom (avatar, coins; E-06), TT Rock Stars (avatar shop; E-09), Mathletics (E-15) | Yes: stars, levels, streaks, badges, kites |

---

## 7. Where Kite Maths could differentiate, and where it is behind

### 7.1 Candidate differentiators

Each is grounded in evidence, but only a **candidate** until R1 acceptance tests it.

1. **Teaching inside the flow, not beside it.**
   - Atom's help is a side panel with a video, a help sheet or a skip to the answer (E-04). IXL links out to an example
     or an easier skill (E-17).
   - Kite teaches in the lesson itself: explanation → worked example with blanks to fill → check, using live fraction
     models.
   - *Proof needed:* FR-002 to FR-010 acceptance, plus a child usability test (F-2).
2. **Misconception-aware recovery.**
   - Public material from Atom and IXL describes explanations after wrong answers (E-03). We found no public description
     of either diagnosing a *specific* misconception.
   - Kite already tags likely wrong answers and runs a follow-up.
   - *Gap to close first:* recovery should start from a pattern, not a single answer (MIS-003), and add transfer
     questions (MIS-004). *Caveat:* we could not see competitors' in-product feedback (section 2), so this is
     unconfirmed.
3. **Accuracy-first fluency (R2/R3).**
   - TT Rock Stars measures fluency by speed only (E-07).
   - The backlog requires accuracy, recall consistency and time to be reported separately, with speed never hiding
     falling accuracy (TT-011, MM-011, MM-012).
   - Keeping a time-free mode is in line with TT Rock Stars' own untimed "Jamming" mode (E-07).
4. **Accessibility built in rather than delegated.**
   - Atom sends families to OS settings (E-05).
   - TT Rock Stars (E-08) and the DfE check (E-11) show that children's maths products can offer a font size option,
     colour schemes, a dyslexia-friendly font, read-aloud and decluttering.
   - Kite matches Khan on automated checks (0 findings), but has none of these settings yet (UX-007).
5. **Readable, touch-friendly learning screens.**
   - Kite's measured prompts (24–28px, 1.38 line height) and 1 small target per screen compare well with IXL (16px, 21 of
     34 small targets) and Khan (16px, 1.25 line height) on the screens we measured.
   - This advantage must survive as interactions grow: draggable number lines (LAB-006), fact grids (TT-007).
6. **Visible maths structure.**
   - Coloured numerator and denominator, live notation that tracks the picture, and interactive manipulatives in the
     lessons.
   - Polypad (E-23) shows how high the bar is for manipulative quality. Khan (E-21) sets it for maths typesetting.

### 7.2 Where Kite Maths is behind today

Recorded so nobody assumes otherwise.

| Area | Evidence | Backlog item |
|---|---|---|
| Parent insight, including target-school benchmarking | Atom (E-02, E-06) | PARENT-002, EXAM-006 |
| Timed mocks matching the exam | Atom (E-02) | EXAM-005 |
| Times-table fluency modes, per-fact heatmap, check simulator | TT Rock Stars (E-07), Doodle (E-12), DfE (E-11) | TT-006, TT-009, TT-011 |
| Content volume (videos, help sheets, question bank) | Atom: 600+ videos, 2,000+ help sheets (E-02); IXL Reception–Year 13 (E-03) | CUR-001, R4 |
| In-product accessibility settings | TT Rock Stars (E-08), DfE (E-11) | UX-007 |
| Native apps and offline use | TT Rock Stars, Doodle (S) | Not in the backlog |
| Content validated by teachers or educational QA | Atom says "built by teachers and assessment specialists" (E-01); not verified | CUR-004 |

---

## 8. Implications for the backlog

These are recommendations. Nothing changes without Product Owner authorisation.

| Backlog item | What the benchmark suggests |
|---|---|
| UX-002, UX-003 | Keep the large prompt sizes and generous line spacing; they are a measured strength. Make sizes tokens. Remove the sub-15px exceptions (DEF-010). |
| UX-004 | Give hints, tips, input problems and worked-example help distinct treatments. Atom's separate "Question help" panel (E-04) shows clear separation is achievable. |
| UX-006 | Keep motion to feedback and state changes; review Kip's sway and the hover lift. No competitor in-product motion was observed, so there's no external target yet. |
| UX-007 | Set the target at least at the level of the DfE check's arrangements (E-11) and TT Rock Stars' options (E-08): font size, colour schemes, read-aloud, declutter. Add a screen-reader pass (F-3). |
| MIS-003, MIS-004 | Strengthen the misconception differentiator before claiming it (section 7.1, item 2). |
| TT-009 | Copy the official format exactly: 3 practice questions, 25 questions, 6 seconds, 3-second gap, the access arrangements (E-11). Label it as practice. |
| TT-011, MM-012 | Report accuracy, consistency and time separately. Don't follow a speed-only heatmap (E-07). |
| EXAM-005, PARENT-002 | Atom's timed mocks and target-school parent view are the 11+ benchmark (E-02, E-06). |

---

## 9. Not observed, and follow-ups for the Product Owner

| ID | Follow-up | Why | Needs |
|---|---|---|---|
| F-1 | Trial access to Atom (5-day trial, E-03), DoodleMaths (7-day trial, E-13), TT Rock Stars and Mathletics, to observe maths questions, feedback and animation | Section 5 has many "Not observed" cells for these products | Product Owner decision: sign-ups and possible cost |
| F-2 | Usability sessions with children (Years 3–6) and parents, on Kite and one competitor | The backlog lists this as a risk mitigation; no screen measurement replaces it | Product Owner and educational QA, with safeguarding and consent |
| F-3 | Screen-reader and keyboard-only walkthroughs (NVDA or VoiceOver) of Kite, Khan and IXL learning screens | Automated checks cover only part of WCAG | Delivery engineer; can run under UX-007 or QA-005 |
| F-4 | Retry the Khan number-line keyboard probe, and capture wrong-answer feedback on IXL and Khan | Blocked on 3 Nov (E-21, section 2) | Delivery engineer; low effort |
