# UX-006: motion and interaction language

| | |
|---|---|
| **Backlog item** | UX-006: motion and interaction language (P1, R1) |
| **Status** | READY FOR QA (R1, D-026). Not accepted. |
| **Checked by** | `src/design-tokens.test.ts` ("uses only the documented motion timings…"), component tests run with animations skipped (`src/test/setup.ts`) |

## 1. Timings and easing

Every animation uses one of these. Easing is `easeOut` (things arrive and settle) unless it is a spring for a reward.

| Role | Duration | Used for | What it communicates |
|---|---|---|---|
| Quick state change | 0.15–0.18 s | Feedback panel swap, step change in a lesson, segmented control | "This changed" |
| Standard state change | 0.2–0.25 s | A fraction's numbers changing, the number-line marker landing, shading a part, moving to the next question | A mathematical change: the value is now this |
| Emphasis | 0.35–0.4 s | Star count going up, the gentle shake on a wrong answer | "You earned this" / "not yet" |
| Build-up | 0.6–0.8 s | A picture being split into parts in a lesson; the kite rising on the home scene as progress grows | How the whole is split; progress |
| Celebration | 1.1–1.3 s | Confetti and the level-up badge after a right answer | Success; never blocks the next action |
| Ambient | 5 s | Kip's sway, **off by default** since R1 | (Decoration: only where a screen opts in) |

## 2. Rules

1. **Animation explains a change.** Each one in the table names what it communicates. Kip's idle sway was decoration, so it is now off by default.
2. **Nothing depends on animation.** Every task can be completed with animations off: the component tests run with all animations skipped and still complete every flow they cover; content and controls are in place before any animation ends.
3. **Reduced motion is respected.** `MotionConfig reducedMotion="user"` wraps the app (`AppShell.tsx`), components that move content check `useReducedMotion()`, and `globals.css` cuts CSS animations and transitions to 0.01 ms under `prefers-reduced-motion: reduce`.
4. **New timings** must be added to this table and to the test's allowed list.
