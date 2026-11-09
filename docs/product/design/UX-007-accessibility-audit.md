# R1 accessibility and responsive pass (UX-007, UX-008, QA-005)

| | |
|---|---|
| **Backlog items** | UX-007 accessibility baseline; UX-008 responsive visual QA; QA-005 accessibility and responsive test pass (P1, R1) |
| **Status** | READY FOR QA (R1, D-026). **Developer evidence**, run on a local production build on 9 Nov 2026. Not independently reproduced. Not accepted. |
| **Scripts** | [`r1-quality-pass.cjs`](../verification/r1-quality-pass.cjs), [`text-scaling.cjs`](../verification/text-scaling.cjs), [`journey-e2e.cjs`](../verification/journey-e2e.cjs), [`r1-step4-checks.cjs`](../verification/r1-step4-checks.cjs) |
| **Results** | [`verification/results/r1/`](../verification/results/r1/): `quality-pass/summary.txt` and `results.json`, 55 screenshots in `quality-pass/screens/`, text-scaling and journey results |

## 1. What was checked

11 screens (home, world map, island map, a lesson explanation, a guided worked example, a practice question, the lab, the mastery check, grown-ups, the report, badges) at **320, 375, 430, 768 and 1280px**, with a saved learner so screens show real states.

| Check | Method | Result |
|---|---|---|
| Sideways scroll | Page width against the viewport | None |
| Clipped text | Any text cut off by `overflow` or an ellipsis | None (one practice title at 320px was found and fixed) |
| Overlapping controls | Every pair of tappable controls in the same layer | None |
| Touch targets | Every button, control link, input and shape part at least **44×44 px** (product target for children; WCAG 2.5.8 asks for 24) | None under 44 (the logo, sound and read-aloud buttons, back links, grown-ups tabs and switches were raised to 44) |
| WCAG 2.1 A and AA rules | axe-core 4.10 at 375 and 1280px | **0 violations** on all 11 screens |
| Keyboard | Tab through up to 40 controls on home, a worked example, the lab and practice; each must show a focus indicator | Every focused control showed one |
| Text scaling | Root text at 200% at 390, 768 and 1280px; 320px reflow (UX-003 AC3) | No sideways scroll or clipped text on the 8 tested pages, except the internal design specimen at 768px |
| Reduced motion | `prefers-reduced-motion: reduce` emulated | Preference detected; CSS transitions cut to 0.01 ms; motion library set to follow it |
| Non-colour feedback | Component tests | Shaded parts carry a tick; added parts a plus; taken-away parts a cross; right and wrong answers are stated in words |
| Labels and names | Component tests and axe | Every lab control and question control has an accessible name |

## 2. Known limitations (UX-007 AC3)

- **No screen reader run.** VoiceOver, TalkBack or NVDA have not been used. axe checks names and roles, not how a screen reader reads fractions and pictures.
- **No real devices.** Touch, drag on the number line and the phone keyboard were tested with emulation and jsdom only.
- **No testing with children** or with grown-ups.
- **The internal design specimen** (`/design-specimen`, 404 in production) overflows by 24px at 768px with 200% text.
- **Preview islands** (the 18 islands other than Fractions) were not part of this pass beyond the shared shell and one island map.
- **Colour contrast** is checked by axe on rendered pages and by `design-tokens.test.ts` for the token pairings; images (the 3D pictures) are not checked.
- The checks are a developer's evidence; QA should re-run them independently (the scripts are in the repo).

## 3. Failures found and fixed in this pass (QA-005 AC2)

| Found | Fix | Retest |
|---|---|---|
| Controls under 44px: logo link, sound button, read-aloud button, island back link, "Finish with practice" link, grown-ups tabs and switches, "Full report" link, icon-only grown-ups link, "Play the warm-up" link | Raised to at least 44px tall and wide | Same script, after the fix: none |
| Practice title cut off at 320px | No longer truncated | Same script: none |
| A focused practice session ended with no summary (DEF-039, found by the journey test) | The summary shows for focused sessions too | `journey-e2e.cjs`: passes |
