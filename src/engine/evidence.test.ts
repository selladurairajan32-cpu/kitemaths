import { describe, expect, it } from "vitest";
import { FRACTIONS_SKILL_PREREQUISITES } from "@/curriculum/prerequisites";
import { FRACTIONS_TOPIC } from "@/topics/fractions";
import { evidenceQuestionIds, isIndependentEvidence, lessonEvidence, prerequisiteSatisfied, unmetPrerequisites } from "./evidence";
import { lessonsEvidenced, phaseStatuses, recommendNext } from "./journey";
import { completeLabChallenge, completeLesson, createTopicLearner, finishAssessment, finishPlacement, goToStep, recordResult, startAssessment, startPlacement } from "./progress";
import type { ItemResult } from "./types";

/**
 * FR-011 and CUR-002 §4–§5: lessons are completed by independent evidence, not by reaching the end; prerequisites are
 * explained, soft locks. Expected values are worked out by hand from the lesson definitions and the CUR-002 tables.
 */

const TOPIC = { ...FRACTIONS_TOPIC, skillPrerequisites: FRACTIONS_SKILL_PREREQUISITES };
let clock = 100;
const placed = (s: ReturnType<typeof createTopicLearner>, ids: string[]) => finishPlacement(startPlacement(s, []), ids, 1);
function answer(partial: Partial<ItemResult> & Pick<ItemResult, "skill" | "questionId">): ItemResult {
  clock += 1;
  return { context: "lesson", correct: true, firstTry: true, attempts: 1, hintsUsed: 0, misconceptions: [], at: clock, ...partial };
}

describe("lesson evidence (FR-011 AC3, CUR-002 §4)", () => {
  it("uses only a lesson's final checks as its evidence questions", () => {
    // From src/topics/fractions/lessons.ts: "naming" has a check before its worked examples that is not evidence.
    expect(evidenceQuestionIds(TOPIC.lessons.find((l) => l.id === "naming")!)).toEqual(["fractions.ls-naming-1", "fractions.ls-naming-2"]);
    expect(evidenceQuestionIds(TOPIC.lessons.find((l) => l.id === "amounts")!)).toEqual(["fractions.ls-amounts-4", "fractions.ls-amounts-3"]);
    expect(evidenceQuestionIds(TOPIC.lessons.find((l) => l.id === "lab")!)).toEqual([]);
    expect(evidenceQuestionIds({ id: "x", steps: [{ type: "check", questionId: "a" }, { type: "explain" }] })).toEqual([]);
  });

  it("counts only right-first-time, unhinted answers as independent", () => {
    const base = { skill: "s", questionId: "q" };
    expect(isIndependentEvidence(answer(base))).toBe(true);
    expect(isIndependentEvidence(answer({ ...base, hintsUsed: 1 }))).toBe(false);
    expect(isIndependentEvidence(answer({ ...base, firstTry: false, attempts: 2 }))).toBe(false);
    expect(isIndependentEvidence(answer({ ...base, correct: false, firstTry: false }))).toBe(false);
  });

  it("does not complete a lesson by reaching its end", () => {
    let s = completeLesson(createTopicLearner(), "wholes", 1);
    expect(lessonEvidence(TOPIC, s, "wholes")).toMatchObject({ status: "needs-evidence", activityCompleted: true, via: null });
    expect(lessonsEvidenced(TOPIC, s)).toBe(0);
    // A hinted answer to one check, a clean answer to the other: still not evidenced.
    s = recordResult(s, answer({ skill: "fractions.equal-parts", questionId: "fractions.ls-wholes-1", hintsUsed: 1 }));
    s = recordResult(s, answer({ skill: "fractions.equal-parts", questionId: "fractions.ls-wholes-2" }));
    expect(lessonEvidence(TOPIC, s, "wholes").status).toBe("needs-evidence");
    s = recordResult(s, answer({ skill: "fractions.equal-parts", questionId: "fractions.ls-wholes-1" }));
    expect(lessonEvidence(TOPIC, s, "wholes")).toMatchObject({ status: "evidenced", via: "lesson-check" });
  });

  it("shows started and unstarted lessons separately", () => {
    const s = goToStep(createTopicLearner(), "naming", 2);
    expect(lessonEvidence(TOPIC, s, "naming").status).toBe("in-progress");
    expect(lessonEvidence(TOPIC, s, "comparing").status).toBe("not-started");
  });

  it("counts placement, and lets a later needs-review result override earlier evidence (§4.4)", () => {
    let s = placed(createTopicLearner(), ["wholes"]);
    expect(lessonEvidence(TOPIC, s, "wholes")).toMatchObject({ status: "evidenced", via: "placement" });
    s = startAssessment(s, ["x"]);
    s = finishAssessment(s, [answer({ skill: "fractions.equal-parts", questionId: "fractions.as-1", context: "assessment", correct: false, firstTry: false })], 900);
    expect(lessonEvidence(TOPIC, s, "wholes").status).toBe("needs-review");
    expect(prerequisiteSatisfied(TOPIC, s, "fractions.equal-parts")).toBe(false);
  });

  it("marks the island's phases done by evidence, not by visits", () => {
    let s = createTopicLearner();
    for (const l of TOPIC.lessons) s = completeLesson(s, l.id, 1);
    expect(phaseStatuses(TOPIC, s)[0]).toEqual({ phase: "Understand", status: "current" });
  });
});

describe("recommendations from evidence (CUR-002 §5)", () => {
  it("sends a child who finished a lesson without evidence to targeted practice, not back into the lesson", () => {
    const s = completeLesson(createTopicLearner(), "wholes", 1);
    expect(recommendNext(TOPIC, s)).toMatchObject({ kind: "practice", focusSkill: "fractions.equal-parts" });
  });

  it("moves on once a fresh practice question is answered independently, and never automatically otherwise", () => {
    let s = completeLesson(createTopicLearner(), "wholes", 1);
    for (let i = 0; i < 5; i++) s = recordResult(s, answer({ skill: "fractions.equal-parts", questionId: `g:fractions.p${i}`, context: "practice", hintsUsed: 1 }));
    expect(recommendNext(TOPIC, s)).toMatchObject({ kind: "practice", focusSkill: "fractions.equal-parts" });
    s = recordResult(s, answer({ skill: "fractions.equal-parts", questionId: "g:fractions.p9", context: "practice" }));
    expect(recommendNext(TOPIC, s)).toMatchObject({ kind: "lesson", lessonId: "naming", resume: false });
  });

  it("routes the lab to represent practice, then to comparing (TC-CUR-002.3.3)", () => {
    let s = placed(createTopicLearner(), ["wholes", "naming"]);
    for (const id of ["c1", "c2", "c3"]) s = completeLabChallenge(s, id);
    s = completeLesson(s, "lab", 2);
    // Given the lab challenges are finished and there is no independent evidence on represent:
    expect(recommendNext(TOPIC, s)).toMatchObject({ kind: "practice", focusSkill: "fractions.represent" });
    // An answer after a hint: still represent practice, not comparing, and the lab is not evidenced.
    s = recordResult(s, answer({ skill: "fractions.represent", questionId: "g:fractions.r1", context: "practice", hintsUsed: 1 }));
    expect(recommendNext(TOPIC, s)).toMatchObject({ kind: "practice", focusSkill: "fractions.represent" });
    expect(lessonEvidence(TOPIC, s, "lab").status).toBe("needs-evidence");
    // A fresh question right first time with no hint: the lab is evidenced and comparing comes next.
    s = recordResult(s, answer({ skill: "fractions.represent", questionId: "g:fractions.r2", context: "practice" }));
    expect(lessonEvidence(TOPIC, s, "lab")).toMatchObject({ status: "evidenced", via: "practice" });
    expect(recommendNext(TOPIC, s)).toMatchObject({ kind: "lesson", lessonId: "comparing" });
  });

  it("explains a soft prerequisite instead of blocking (FR-011 AC2)", () => {
    const s = createTopicLearner();
    // Comparing builds on naming and represent (CUR-002 §2.1). Neither is satisfied yet.
    expect(unmetPrerequisites(TOPIC, s, "comparing")).toEqual(["fractions.name", "fractions.represent"]);
    // Fraction-of also needs division facts from the times-tables island.
    expect(unmetPrerequisites(TOPIC, s, "amounts")).toEqual(["fractions.name", "times-tables.division-facts"]);
    expect(unmetPrerequisites(TOPIC, s, "wholes")).toEqual([]);
    const p = placed(s, ["wholes", "naming"]);
    expect(unmetPrerequisites(TOPIC, p, "comparing")).toEqual(["fractions.represent"]);
  });
});
