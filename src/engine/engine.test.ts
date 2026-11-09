import { describe, expect, it } from "vitest";
import { FRACTIONS_TOPIC, followUpFor } from "@/topics/fractions";
import { MISCONCEPTIONS, M } from "@/topics/fractions/misconceptions";
import { PRACTICE_QUESTIONS } from "@/topics/fractions/questions";
import { SKILL_ORDER } from "@/topics/fractions/skills";
import { REVIEW_EVERY, selectNextQuestion, targetDifficulty } from "./adaptive";
import { activityProgress, isPracticeMilestoneMet, phaseStatuses, recommendNext } from "./journey";
import { misconceptionReports, readyForRecheck, skillMastery } from "./mastery";
import {
  completeLesson,
  createInitialState,
  createTopicLearner,
  finishAssessment,
  dismissPracticeSummary,
  finishPracticeQuestion,
  finishRecheck,
  goToStep,
  hydrateState,
  hydrateTopic,
  inTopic,
  recordResult,
  startAssessment,
  startPracticeSession,
  startRecheck,
  topicLearner,
} from "./progress";
import { hashString, seededShuffle } from "./random";
import { initialRecovery, isFinished, recoveryReducer, recoverySummary } from "./recovery";
import type { ItemResult } from "./types";

let clock = 0;
function result(partial: Partial<ItemResult> & Pick<ItemResult, "skill">): ItemResult {
  clock += 1;
  return {
    questionId: `q${clock}`,
    context: "practice",
    correct: true,
    firstTry: true,
    attempts: 1,
    hintsUsed: 0,
    misconceptions: [],
    difficulty: 1,
    at: clock,
    ...partial,
  };
}

const options = { followUpFor: (s: string[]) => followUpFor(s) };
const wrong = (misconceptions: string[] = []) => ({ type: "submit" as const, evaluation: { correct: false, misconceptions } });
const right = { type: "submit" as const, evaluation: { correct: true, misconceptions: [] } };

describe("misconception recovery flow", () => {
  it("records a clean first-try success", () => {
    const s = recoveryReducer(initialRecovery, right, options);
    expect(s.stage).toBe("correct");
    expect(recoverySummary(s)).toMatchObject({ correct: true, firstTry: true, attempts: 1, hintsUsed: 0 });
  });

  it("diagnoses, explains, asks a follow-up, then lets the child retry without revealing", () => {
    let s = recoveryReducer(initialRecovery, wrong([M.SWAP]), options);
    expect(s.stage).toBe("diagnose");
    expect(s.suspected).toEqual([M.SWAP]);
    expect(s.followUpId).toBe("fractions.fu-swap-1");
    s = recoveryReducer(s, { type: "continue" }, options);
    expect(s.stage).toBe("followup");
    s = recoveryReducer(s, { type: "followup-submit", evaluation: { correct: true, misconceptions: [] } }, options);
    expect(s.stage).toBe("followup-review");
    expect(s.followUpCorrect).toBe(true);
    s = recoveryReducer(s, { type: "continue" }, options);
    expect(s.stage).toBe("answering");
    s = recoveryReducer(s, right, options);
    expect(isFinished(s)).toBe(true);
    expect(recoverySummary(s)).toMatchObject({ correct: true, firstTry: false, attempts: 2, misconceptions: [M.SWAP] });
  });

  it("shows a hint beside the still-editable question when no misconception is clear", () => {
    const s = recoveryReducer(initialRecovery, wrong(), options);
    expect(s).toMatchObject({ stage: "answering", hintVisible: true, retrying: true, hintsUsed: 1, attempts: 1 });
  });

  it("keeps the question editable when a hint is requested, and counts it once", () => {
    let s = recoveryReducer(initialRecovery, { type: "request-hint" }, options);
    expect(s).toMatchObject({ stage: "answering", hintVisible: true, hintsUsed: 1 });
    s = recoveryReducer(s, { type: "request-hint" }, options);
    expect(s.hintsUsed).toBe(1);
    s = recoveryReducer(s, wrong(), options);
    expect(s.hintsUsed).toBe(1);
  });

  it("reveals the worked answer after the final attempt", () => {
    let s = recoveryReducer(initialRecovery, wrong(), options);
    s = recoveryReducer(s, wrong([M.SWAP]), options);
    expect(s.stage).toBe("revealed");
    expect(recoverySummary(s).correct).toBe(false);
  });

  it("counts a voluntary hint as support", () => {
    let s = recoveryReducer(initialRecovery, { type: "request-hint" }, options);
    s = recoveryReducer(s, right, options);
    expect(recoverySummary(s)).toMatchObject({ correct: true, firstTry: false, hintsUsed: 1 });
  });

  it("picks a different follow-up when the first has been used", () => {
    expect(followUpFor([M.SWAP], ["fractions.fu-swap-1"])).toBe("fractions.fu-swap-2");
    expect(followUpFor(["unknown"])).toBeNull();
  });
});

describe("mastery", () => {
  it("needs several strong recent results before a skill is secure", () => {
    const one = [result({ skill: "fractions.compare" })];
    expect(skillMastery("fractions.compare", one).status).toBe("developing");
    const three = [...one, result({ skill: "fractions.compare" }), result({ skill: "fractions.compare" })];
    expect(skillMastery("fractions.compare", three).status).toBe("secure");
    const shaky = [...three, result({ skill: "fractions.compare", correct: false, firstTry: false }), result({ skill: "fractions.compare", correct: false, firstTry: false })];
    expect(skillMastery("fractions.compare", shaky).status).toBe("developing");
  });

  it("uses the latest independent evidence, and practice cannot clear a needs-review", () => {
    const at = 1000;
    const results = [
      result({ skill: "fractions.compare" }),
      { ...result({ skill: "fractions.compare", context: "assessment" }), at },
      { ...result({ skill: "fractions.compare", context: "assessment", correct: false, firstTry: false }), at },
    ];
    expect(skillMastery("fractions.compare", results).status).toBe("needs-review");
    const practised = [...results, ...[1, 2, 3].map(() => ({ ...result({ skill: "fractions.compare" }), at: 1100 + clock }))];
    expect(skillMastery("fractions.compare", practised).status).toBe("needs-review");
    expect(readyForRecheck(skillMastery("fractions.compare", practised))).toBe(true);
  });

  it("does not award mastery from a single correct item", () => {
    const one = [{ ...result({ skill: "fractions.represent", context: "assessment" }), at: 3000 }];
    expect(skillMastery("fractions.represent", one).status).toBe("passed-check");
  });

  it("awards mastery only for two or more independent items plus secure practice", () => {
    const practice = [1, 2, 3].map(() => result({ skill: "fractions.name" }));
    const twoRight = [4000, 4000].map((at) => ({ ...result({ skill: "fractions.name", context: "recheck" }), at }));
    expect(skillMastery("fractions.name", twoRight).status).toBe("passed-check");
    expect(skillMastery("fractions.name", [...practice, ...twoRight]).status).toBe("mastered");
  });

  it("lets a later recheck replace older check evidence", () => {
    const wrongCheck = [5000, 5000].map((at, i) => ({ ...result({ skill: "fractions.name", context: "assessment", correct: i === 0, firstTry: i === 0 }), at }));
    const practice = [1, 2, 3].map(() => ({ ...result({ skill: "fractions.name" }), at: 5100 + clock }));
    const recheck = [6000, 6000].map((at) => ({ ...result({ skill: "fractions.name", context: "recheck" }), at }));
    expect(skillMastery("fractions.name", [...wrongCheck, ...practice]).status).toBe("needs-review");
    expect(skillMastery("fractions.name", [...wrongCheck, ...practice, ...recheck]).status).toBe("mastered");
  });

  it("reports one wrong answer as only a possible misconception", () => {
    const results = [result({ skill: "fractions.name", correct: false, firstTry: false, misconceptions: [M.SWAP] })];
    const [report] = misconceptionReports(results, MISCONCEPTIONS);
    expect(report).toMatchObject({ id: M.SWAP, confidence: "possible", state: "watching", timesSeen: 1 });
  });

  it("needs repeated evidence for 'likely' and later clean work for 'resolved'", () => {
    const results = [
      result({ skill: "fractions.name", correct: false, firstTry: false, misconceptions: [M.SWAP] }),
      result({ skill: "fractions.name", correct: false, firstTry: false, misconceptions: [M.SWAP] }),
    ];
    expect(misconceptionReports(results, MISCONCEPTIONS)[0].confidence).toBe("likely");
    const improving = [...results, result({ skill: "fractions.name", context: "followup", targets: M.SWAP })];
    expect(misconceptionReports(improving, MISCONCEPTIONS)[0].state).toBe("improving");
    const resolved = [...improving, result({ skill: "fractions.name" }), result({ skill: "fractions.represent" })];
    expect(misconceptionReports(resolved, MISCONCEPTIONS)[0].state).toBe("resolved");
  });
});

describe("adaptive practice", () => {
  const select = (results: ItemResult[], sessionAsked: string[] = [], focusSkill: string | null = null) =>
    selectNextQuestion({ questions: PRACTICE_QUESTIONS, skillOrder: SKILL_ORDER, results, sessionAsked, focusSkill });

  it("starts with the first skill at the easiest level", () => {
    const s = select([]);
    expect(s?.question.skill).toBe("fractions.equal-parts");
    expect(s?.question.difficulty).toBe(1);
  });

  it("is deterministic", () => {
    expect(select([])?.question.id).toBe(select([])?.question.id);
  });

  it("steps difficulty up after two first-try successes and down after a miss", () => {
    const up = [result({ skill: "fractions.name", difficulty: 1 }), result({ skill: "fractions.name", difficulty: 1 })];
    expect(targetDifficulty("fractions.name", up)).toBe(2);
    const down = [...up, result({ skill: "fractions.name", difficulty: 2, correct: false, firstTry: false })];
    expect(targetDifficulty("fractions.name", down)).toBe(1);
  });

  it("moves on once a skill is secure and never repeats within a session", () => {
    const secure = [1, 2, 3].map(() => result({ skill: "fractions.equal-parts" }));
    const s = select(secure, ["fractions.nm-1"]);
    expect(s?.question.skill).toBe("fractions.name");
    expect(s?.question.id).not.toBe("fractions.nm-1");
  });

  it("interleaves review of secure skills", () => {
    const secure = [1, 2, 3].map(() => result({ skill: "fractions.equal-parts" }));
    const asked = Array.from({ length: REVIEW_EVERY - 1 }, (_, i) => `x${i}`);
    const s = select(secure, asked);
    expect(s?.reason).toBe("review");
    expect(s?.question.skill).toBe("fractions.equal-parts");
  });

  it("honours a chosen focus skill", () => {
    expect(select([], [], "fractions.fraction-of")?.question.skill).toBe("fractions.fraction-of");
  });

  it("returns null once everything has been asked", () => {
    expect(select([], PRACTICE_QUESTIONS.map((q) => q.id))).toBeNull();
  });

  it("simulates a confident learner progressing through every skill with rising difficulty", () => {
    const results: ItemResult[] = [];
    const order: string[] = [];
    for (let session = 0; session < 6; session++) {
      const asked: string[] = [];
      for (let i = 0; i < 10; i++) {
        const s = select(results, asked);
        if (!s) break;
        asked.push(s.question.id);
        order.push(s.question.skill);
        results.push(result({ skill: s.question.skill, questionId: s.question.id, difficulty: s.question.difficulty }));
      }
    }
    for (const skill of SKILL_ORDER) expect(skillMastery(skill, results).status).toBe("secure");
    const firstSeen = SKILL_ORDER.map((s) => order.indexOf(s));
    expect([...firstSeen].sort((a, b) => a - b)).toEqual(firstSeen);
    const nameDifficulties = results.filter((r) => r.skill === "fractions.name").map((r) => r.difficulty);
    expect(Math.max(...(nameDifficulties as number[]))).toBeGreaterThan(1);
  });

  it("keeps a struggling learner on the skill they find hard", () => {
    const results: ItemResult[] = [];
    const asked: string[] = [];
    const pool = PRACTICE_QUESTIONS.filter((q) => q.skill === "fractions.equal-parts").length;
    for (let i = 0; i < pool; i++) {
      const s = select(results, asked)!;
      asked.push(s.question.id);
      const wrong = s.question.skill === "fractions.equal-parts";
      results.push(result({ skill: s.question.skill, questionId: s.question.id, correct: !wrong, firstTry: !wrong }));
    }
    expect(results.every((r) => r.skill === "fractions.equal-parts")).toBe(true);
    expect(skillMastery("fractions.equal-parts", results).status).toBe("developing");
  });
});

describe("learner progress", () => {
  it("survives corrupt or outdated saved data", () => {
    expect(hydrateState(null)).toEqual(createInitialState());
    expect(hydrateState("nonsense")).toEqual(createInitialState());
    expect(hydrateState({ version: 0, results: [1] })).toEqual(createInitialState());
    const saved = inTopic(createInitialState(), "fractions", (t) => goToStep(recordResult(t, result({ skill: "fractions.name" })), "wholes", 2));
    expect(hydrateState(JSON.parse(JSON.stringify(saved)))).toEqual(saved);
    expect(hydrateState({ version: 2, results: "bad", topics: { fractions: { lessons: [] } } })).toMatchObject({ results: [], topics: { fractions: { lessons: {} } } });
  });

  it("keeps each topic's progress separate but shares results", () => {
    let s = inTopic(createInitialState(), "fractions", (t) => goToStep(recordResult(t, result({ skill: "fractions.name" })), "wholes", 2));
    s = inTopic(s, "other", (t) => recordResult(t, result({ skill: "other.count" })));
    expect(s.results).toHaveLength(2);
    expect(s.topics.fractions.lessons.wholes.step).toBe(2);
    expect(topicLearner(s, "other").lessons).toEqual({});
    expect(s.currentTopicId).toBe("other");
    expect(inTopic(s, "fractions", (t) => t)).toBe(s);
  });

  it("records each episode once, even if submitted twice", () => {
    const r = { ...result({ skill: "fractions.name" }), id: "ep-1" };
    let s = startPracticeSession(createTopicLearner(), null, 1);
    s = finishPracticeQuestion(s, r);
    s = finishPracticeQuestion(s, r);
    s = recordResult(s, r);
    expect(s.results).toHaveLength(1);
    expect(s.practice.sessionResults).toBe(1);
  });

  it("keeps the last completed check when a retake starts, and migrates older saves", () => {
    let s = startAssessment(createTopicLearner(), ["as-1"], "A", 11, 11);
    s = finishAssessment(s, [{ ...result({ skill: "fractions.equal-parts", context: "assessment" }), at: 20 }], 20);
    s = startAssessment(s, ["bs-1"], "B", 30, 30);
    expect(s.assessment.status).toBe("in-progress");
    expect(s.assessment.last).toMatchObject({ form: "A", order: ["as-1"], completedAt: 20 });
    const old = { version: 1, assessment: { status: "complete", order: ["as-1"], responses: {}, evaluations: {}, index: 0, completedAt: 5, timesCompleted: 1 } };
    expect(hydrateTopic(old, true).assessment.last).toMatchObject({ order: ["as-1"], completedAt: 5 });
  });

  it("stores a finished recheck separately and clears the active one", () => {
    let s = startRecheck(createTopicLearner(), "fractions.compare", ["bs-5", "bs-6"], "B", 3, 3);
    s = finishRecheck(s, [{ ...result({ skill: "fractions.compare", context: "recheck" }), at: 9 }], 9);
    expect(s.recheck).toBeNull();
    expect(s.rechecks["fractions.compare"]).toMatchObject({ form: "B", completedAt: 9 });
  });

  it("dismisses an old practice summary so it is not shown again", () => {
    const s = dismissPracticeSummary({ ...createTopicLearner(), practice: { ...createTopicLearner().practice, startedAt: 5, sessionResults: 10 } });
    expect(s.practice.startedAt).toBeNull();
  });

  it("tracks lesson position and furthest step", () => {
    let s = goToStep(createTopicLearner(), "wholes", 3);
    s = goToStep(s, "wholes", 1);
    expect(s.lessons.wholes).toMatchObject({ step: 1, furthestStep: 3, completed: false });
  });
});

describe("journey recommendations", () => {
  it("leads through lessons, then practice, then the mastery check", () => {
    let s = createTopicLearner();
    expect(recommendNext(FRACTIONS_TOPIC, s)).toMatchObject({ kind: "lesson", lessonId: "wholes", resume: false });
    s = goToStep(s, "wholes", 2);
    expect(recommendNext(FRACTIONS_TOPIC, s)).toMatchObject({ kind: "lesson", resume: true });
    for (const l of FRACTIONS_TOPIC.lessons) s = completeLesson(s, l.id, 1);
    // Traversal alone is not evidence (FR-011 AC3): practice on the first lesson's skill comes next.
    expect(recommendNext(FRACTIONS_TOPIC, s)).toMatchObject({ kind: "practice", focusSkill: "fractions.equal-parts" });
    // One independent practice answer per skill evidences each lesson (CUR-002 §4.1); then the milestone practice.
    for (const skill of SKILL_ORDER) s = recordResult(s, result({ skill }));
    expect(recommendNext(FRACTIONS_TOPIC, s)).toMatchObject({ kind: "practice", focusSkill: null });
    for (const skill of SKILL_ORDER.slice(0, Math.ceil(SKILL_ORDER.length / 2))) {
      for (let i = 0; i < 3; i++) s = recordResult(s, result({ skill }));
    }
    expect(isPracticeMilestoneMet(FRACTIONS_TOPIC, s)).toBe(true);
    expect(recommendNext(FRACTIONS_TOPIC, s).kind).toBe("assessment");
    s = startAssessment(s, ["as-1"]);
    expect(recommendNext(FRACTIONS_TOPIC, s)).toMatchObject({ kind: "assessment", resume: true });
    s = finishAssessment(s, [{ ...result({ skill: "fractions.compare", context: "assessment", correct: false, firstTry: false }), at: 5000 }], 5000);
    expect(recommendNext(FRACTIONS_TOPIC, s)).toMatchObject({ kind: "practice", focusSkill: "fractions.compare" });
    for (let i = 0; i < 3; i++) s = recordResult(s, { ...result({ skill: "fractions.compare" }), at: 6000 + i });
    expect(recommendNext(FRACTIONS_TOPIC, s)).toMatchObject({ kind: "recheck", skill: "fractions.compare", resume: false });
    s = startRecheck(s, "fractions.compare", ["bs-5", "bs-6"], "B", 1, 7000);
    expect(recommendNext(FRACTIONS_TOPIC, s)).toMatchObject({ kind: "recheck", resume: true });
  });

  it("keeps the mastery phase unfinished while a skill needs review, and labels activity separately", () => {
    let s = createTopicLearner();
    for (const l of FRACTIONS_TOPIC.lessons) s = completeLesson(s, l.id, 1);
    for (const skill of SKILL_ORDER) for (let i = 0; i < 3; i++) s = recordResult(s, result({ skill }));
    s = startAssessment(s, ["as-5"]);
    s = finishAssessment(s, [{ ...result({ skill: "fractions.compare", context: "assessment", correct: false, firstTry: false }), at: 9000 }], 9000);
    expect(activityProgress(FRACTIONS_TOPIC, s)).toBe(1);
    expect(phaseStatuses(FRACTIONS_TOPIC, s).find((p) => p.phase === "Master")?.status).not.toBe("done");
  });
});

describe("seeded option order", () => {
  it("is stable for the same key and varies between keys", () => {
    const items = ["a", "b", "c", "d", "e"];
    expect(seededShuffle(items, "k1")).toEqual(seededShuffle(items, "k1"));
    const orders = new Set(["k1", "k2", "k3", "k4", "k5", "k6"].map((k) => seededShuffle(items, k).join("")));
    expect(orders.size).toBeGreaterThan(1);
    expect([...seededShuffle(items, "k1")].sort()).toEqual(items);
    expect(hashString("abc")).toBe(hashString("abc"));
  });

  it("puts the correct option in different positions across items", () => {
    const firsts = PRACTICE_QUESTIONS.filter((q) => q.kind === "choose-fraction").map((q) => {
      if (q.kind !== "choose-fraction") return -1;
      return seededShuffle(q.options, `practice:1:${q.id}:options`).findIndex((o) => o.n === q.answer.n && o.d === q.answer.d);
    });
    expect(new Set(firsts).size).toBeGreaterThan(1);
  });
});
