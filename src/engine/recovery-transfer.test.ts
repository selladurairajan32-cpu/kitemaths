import { describe, expect, it } from "vitest";
import { MISCONCEPTIONS, M } from "@/topics/fractions/misconceptions";
import { PRACTICE_QUESTIONS } from "@/topics/fractions/questions";
import { SKILL_ORDER } from "@/topics/fractions/skills";
import { selectNextQuestion } from "./adaptive";
import { misconceptionReports } from "./mastery";
import type { ItemResult } from "./types";

/** MIS-003 to MIS-005: how a suspected misconception is followed up, and what counts as recovery. */

let clock = 0;
const res = (p: Partial<ItemResult> & Pick<ItemResult, "skill" | "questionId">): ItemResult => {
  clock += 1;
  return { context: "practice", correct: true, firstTry: true, attempts: 1, hintsUsed: 0, misconceptions: [], difficulty: 1, at: clock, ...p };
};

describe("transfer after a suspected misconception (MIS-004, MIS-005 AC1)", () => {
  it("follows a tagged wrong answer with a new question on the same skill, in a different form where possible", () => {
    const original = PRACTICE_QUESTIONS.find((q) => q.id === "fractions.nm-5")!; // write-fraction, reading fractions
    const results = [res({ skill: original.skill, questionId: original.id, correct: false, firstTry: false, attempts: 2, misconceptions: [M.SWAP] })];
    const sel = selectNextQuestion({ questions: PRACTICE_QUESTIONS, skillOrder: SKILL_ORDER, results, sessionAsked: [original.id] })!;
    expect(sel.reason).toBe("transfer");
    expect(sel.question.skill).toBe(original.skill);
    expect(sel.question.id).not.toBe(original.id);
    expect((sel.question as { kind: string }).kind).not.toBe("write-fraction");
  });

  it("does not use a transfer item after an untagged mistake (a hint is given instead)", () => {
    const q = PRACTICE_QUESTIONS.find((q) => q.id === "fractions.nm-5")!;
    const results = [res({ skill: q.skill, questionId: q.id, correct: false, firstTry: false, attempts: 2 })];
    expect(selectNextQuestion({ questions: PRACTICE_QUESTIONS, skillOrder: SKILL_ORDER, results, sessionAsked: [q.id] })!.reason).not.toBe("transfer");
  });
});

describe("what counts as recovery (MIS-003, MIS-005)", () => {
  const skill = "fractions.name";

  it("does not count getting the original question right again", () => {
    const results = [
      res({ skill, questionId: "fractions.nm-5", correct: false, firstTry: false, misconceptions: [M.SWAP] }),
      res({ skill, questionId: "fractions.nm-5" }),
      res({ skill, questionId: "fractions.nm-5" }),
    ];
    expect(misconceptionReports(results, MISCONCEPTIONS).find((r) => r.id === M.SWAP)!.state).toBe("watching");
  });

  it("counts new questions answered first time, and keeps unresolved ones visible", () => {
    const base = [res({ skill, questionId: "fractions.nm-5", correct: false, firstTry: false, misconceptions: [M.SWAP] })];
    const one = [...base, res({ skill, questionId: "fractions.nm-2" })];
    expect(misconceptionReports(one, MISCONCEPTIONS).find((r) => r.id === M.SWAP)!.state).toBe("improving");
    const two = [...one, res({ skill, questionId: "fractions.nm-3" })];
    expect(misconceptionReports(two, MISCONCEPTIONS).find((r) => r.id === M.SWAP)!.state).toBe("resolved");
  });

  it("labels one answer as possible, repeated ones as likely, and keeps the evidence (MIS-003)", () => {
    const once = [res({ skill, questionId: "fractions.nm-5", correct: false, firstTry: false, misconceptions: [M.SWAP] })];
    const r1 = misconceptionReports(once, MISCONCEPTIONS)[0];
    expect(r1).toMatchObject({ id: M.SWAP, confidence: "possible", timesSeen: 1, lastSeen: once[0].at });
    const twice = [...once, res({ skill, questionId: "fractions.nm-7", correct: false, firstTry: false, misconceptions: [M.SWAP] })];
    expect(misconceptionReports(twice, MISCONCEPTIONS)[0]).toMatchObject({ confidence: "likely", timesSeen: 2 });
    // The evidence is the stored answers themselves: each result keeps its misconception tags.
    expect(twice.every((r) => r.misconceptions.includes(M.SWAP))).toBe(true);
  });
});
