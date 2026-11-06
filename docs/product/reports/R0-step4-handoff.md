# Step 4 handoff: proposed sequence for UX-005, FR-011 and ARCH-004

| | |
|---|---|
| **Date** | 6 November 2026 |
| **Status** | **Proposal only. Nothing here is implemented or authorised.** Step 4 starts only when the Product Owner authorises it and answers §4. |
| **Constraints that still hold** | Development branch only; no PR, merge or deployment (D-002). Existing child-facing screens change only where a step-4 item says so (D-012). Nothing is self-accepted (D-022). |
| **Inputs** | [STATUS](../STATUS.md), [defect register](../QA-004-defect-register.md), [CUR-002](../curriculum/CUR-002-progression-model.md), [CUR-001](../curriculum/CUR-001-curriculum-map.md), [ARCH-001](../architecture/ARCH-001-architecture.md), [ARCH-002](../architecture/ARCH-002-question-schema.md) |

## 1. What each item must achieve (backlog wording)

| Item | Acceptance criteria, summarised |
|---|---|
| **UX-005** | Dashboard, journey, lesson, practice and results reachable through working navigation; intentional desktop, tablet and phone layouts; no dead links or placeholders. |
| **FR-011** | Lessons show prerequisites, status, skill outcomes and next recommended lesson; locked states explain why; completed status is based on mastery evidence, not page visits. |
| **ARCH-004** | Progress survives refresh and restart; schema versioned or safely resettable; corrupt or missing data fails gracefully; no unnecessary personal data. |

## 2. Proposed order

The order follows the dependencies, not the item numbers. Each step ends in READY FOR QA.

| Step | Work | Why here | Needs first |
|---|---|---|---|
| **4.0** | Decisions in §4 recorded; MAST-001 policy written down | Marking, status and recommendations all depend on them. Without them FR-011 AC3 would encode a guess. | Product Owner |
| **4.1** | **ARCH-004: test and harden the existing store**, with no schema change yet. Tests for refresh, restart, missing, corrupt, wrong-version and v1 data. Write down the schema and the reset rule. | The store (`kite-maths:v2`) is live and children have progress in it. It is untested. Everything else reads from it. | None |
| **4.2** | **ARCH-004: additive evidence fields**, only if 4.0 approves the evidence model. A migration from v2, a backup before any write, and a test that a recorded v2 learner opens unchanged. | FR-011 AC3 needs evidence recorded per skill, which v2 does not hold. | 4.0, 4.1 |
| **4.3** | **UX-003 AC3 fixes (DEF-018 to DEF-021)** in the shared header and the screens named in the register, plus retest | UX-005 changes the same shell. Fixing text scaling inside the new layout avoids doing it twice. | D-021 (early R1) |
| **4.4** | **UX-005: responsive shell and working navigation.** Replace placeholders (DEF-005, the Lab tab on 18 islands) and the dead or misleading destinations in DEF-001 to DEF-004, DEF-006, DEF-007. | FR-011 sits inside the shell. | 4.3 |
| **4.5** | **FR-011: learning journey screen** driven by the CUR-002 progression graph and the CUR-001 R1 dependency rows. Prerequisite display, locked-state explanations, next recommended lesson. | Needs the shell (4.4) and the evidence fields (4.2). | 4.2, 4.4 |
| **4.6** | **FR-011 AC3: completion from evidence**, not traversal (`TC-FR-011.3.1`, currently failing). Wire the CUR-002 evidence rules. | The last step because it changes behaviour children see. | 4.0, 4.2, 4.5 |

Steps 4.1 and 4.3 are independent and could run in either order. Step 4.6 should not start until DEF-038 is resolved if any marking path moves to the question schema (§3).

## 3. Dependencies and risks

| Dependency | Effect on step 4 |
|---|---|
| **MAST-001** (mastery model) | Thresholds are coded in `src/engine/mastery.ts` but are not documented for the Product Owner. The CUR-001 map and CUR-002 deliberately state no thresholds. FR-011 AC3 and the recommendation rules need the policy approved first. |
| **CUR-002 evidence model** | Defines activity completed, supported evidence, independent evidence and skill mastery. It is accepted for specification scope only. Wiring is R1 (4.2, 4.6). |
| **DEF-038** | The kit's `same()` and the new comparison contract differ. **Resolve before any marking goes through the question schema** (`TC-ARCH-002.1.13`). Step 4 need not touch marking; if it does, this is a gate. |
| **UX-003 AC3, DEF-018 to DEF-021** | UX-003 is QA FAILED. Fixes belong with the shell work (4.3, 4.4). |
| **Couplings K-1 to K-6** | Part of the UI and store still reach into engine internals. Moving the store and journey code in step 4 may shrink the allowlists; they must never grow. |
| **Existing learner progress** | The live store is `kite-maths:v2` (`STATE_VERSION = 2`), migrated once from v1 with a backup. Any change must open an existing v2 record unchanged, keep a backup, and fail to a reset only with a message, never silently. Needs a fixture of a real v2 record taken from the current build. |
| **FR-011 AC3 and what counts as "completed"** | Today a lesson completes when a learner reaches the end. Changing that changes what children see and what stars they already have. See Q-A below. |
| **No hosted CI** | CI runs on pull requests and `main` only, so none of this has a hosted run on the branch. |

## 4. Decisions needed before step 4 starts

| # | Question | Why it matters | Recommended |
|---|---|---|---|
| Q-A | When the evidence rule changes, what happens to lessons that children already completed by traversal? | Without a rule, stars may disappear or lessons may re-lock | Keep existing completions and stars; record them as "completed before evidence tracking"; apply the new rule going forward |
| Q-B | Approve the mastery policy (accuracy, variety, independence) as MAST-001 will document it, and the numbers | CUR-001 and CUR-002 state none. The coded thresholds must be shown to the Product Owner. | Delivery engineer documents the coded thresholds as proposed; Product Owner adjusts; no change to thresholds in step 4 until approved |
| Q-C | Is the lab-only path to practice (CUR-002 §5) the approved recommendation, with no automatic progression after unsuccessful practice? | FR-011's "next recommended lesson" uses it | Yes, as written in CUR-002 |
| Q-D | UX-005: what are the intended tablet and phone layouts, and may the 18 preview islands show a clear "not yet available" state in place of placeholder tabs? | Needs a design call; D-001 keeps those islands unaccepted previews | Show an honest unavailable state; do not remove islands |
| Q-E | Does step 4 touch marking? | If yes, DEF-038 must be resolved first | No; leave marking in the kit |
| Q-F | Who retests step 4 independently, and on which devices? | Developer browser evidence is not independent | QA on a real phone and a desktop |

## 5. What step 4 does not do

It does not change the curriculum content, add islands, accept anything, merge or deploy. It does not change the thresholds, the question schema or the maths modules. Fractions R1 content items (FR-001 onwards) are separate.
