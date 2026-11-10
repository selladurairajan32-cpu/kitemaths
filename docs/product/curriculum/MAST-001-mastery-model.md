# MAST-001: skill mastery model (Fractions, R1)

| | |
|---|---|
| **Backlog item** | MAST-001: define skill mastery model (P1, R1) |
| **Status** | **BLOCKED on a Product Owner decision** (the variety criterion, §4). Everything else is documented and tested. Not accepted. |
| **Source** | `src/engine/mastery.ts` (statuses and thresholds), `src/engine/journey.ts` (milestones), `src/engine/evidence.ts` (lesson evidence). These are today's engine settings, documented as the **proposed** policy (RC-008 Q-B): none was changed for R1. |

## 1. What a child's answers count as

| Answer | Score in the recent-evidence average |
|---|---|
| Right first time, no hint | 1 |
| Right with help (a hint, a retry, a follow-up) | ½ |
| Not right | 0 |

Only **lesson and practice** answers feed the average. **Independent** evidence comes only from the mastery check and rechecks, which have no hints. Warm-up answers never count towards mastery.

## 2. Statuses, per skill

| Status | Rule | Constant (adjustable) |
|---|---|---|
| Not started | No lesson or practice answers | — |
| Developing | Some answers, not yet secure | — |
| **Secure** (accuracy) | At least `SECURE_MIN_EVIDENCE` of the last `RECENT_WINDOW` lesson or practice answers, averaging at least `SECURE_THRESHOLD` | 3, 5, 0.75 |
| Passed check | Every item for the skill in the latest independent check was right, but the skill is not yet secure, or fewer than `MASTERY_MIN_INDEPENDENT` items | — |
| **Mastered** (independent application) | Secure **and** at least `MASTERY_MIN_INDEPENDENT` independent items, all right, in the latest check | 2 |
| Needs review | Any item for the skill in the latest independent check was wrong. Practice alone cannot clear it; a recheck can. | — |

A recheck is offered when, since the check, at least 3 practice answers average at least 0.75.

## 3. What mastery is not (AC2)

- **One correct answer** never makes a skill secure (3 answers are needed) or mastered (2 independent items plus secure practice).
- **One completed quiz** never awards mastery: the check alone gives "passed check" unless practice is also secure.
- **Finishing a lesson** awards no mastery (CUR-002, FR-011). Stars reward activity only.

These rules are tested in `src/engine/engine.test.ts` ("does not award mastery from a single correct item", "awards mastery only for two or more independent items plus secure practice").

## 4. Varied examples (AC1): decided (D-033)

A skill is **secure** only if its recent right answers cover at least **2 question forms** (`SECURE_MIN_FORMS = 2`
in `src/engine/mastery.ts`), as well as the accuracy rule in §2.

- **A form** is a kind of question (`src/engine/forms.ts`): on kit islands, each question maker; on Fractions, the
  question's kind and picture (for example `shade:circle` or `compare`). Each answer records its form.
- **Skills with fewer forms.** A skill is never asked for more forms than its questions offer. On 10 Nov 2026, 48 of
  105 skills, all on preview islands, had one question maker; a test ratchets that number so it can only fall. Every
  Fractions skill offers two or more.
- **Older answers.** The rule applies once at least 2 recent answers record a form, so progress saved before forms
  were recorded keeps its status.

## 5. Adjusting thresholds (AC3)

The constants above are named exports in `src/engine/mastery.ts`. Changing one changes every island at once and needs a `D-` decision (GOV-004 §2). Tests fix today's values so a change is deliberate.
