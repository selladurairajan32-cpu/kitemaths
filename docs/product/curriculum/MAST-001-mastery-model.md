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

## 4. Varied examples (AC1): decision needed

The backlog asks for criteria covering **accuracy, varied examples and independent application**. Accuracy (§2 Secure) and independent application (§2 Mastered) are coded. **Varied examples is not a coded criterion.** Practice does vary form and representation (PRACT-007), and the check uses unfamiliar items in several forms (MAST-002), so variety happens in practice, but the rule does not require it.

**Proposal for the Product Owner:** a skill is secure only if its recent evidence includes at least **2 different question forms** (for example a picture question and a symbols-only question). New constant `SECURE_MIN_FORMS = 2`. This would make some children's skills "developing" for longer. Changing a threshold is a material curriculum change (GOV-004), so it waits for a decision; until then MAST-001 stays BLOCKED.

## 5. Adjusting thresholds (AC3)

The constants above are named exports in `src/engine/mastery.ts`. Changing one changes every island at once and needs a `D-` decision (GOV-004 §2). Tests fix today's values so a change is deliberate.
