import { describe, expect, it } from "vitest";
import { TOPICS, topicById } from "@/topics";
import type { KitQuestion } from "@/topics/kit/types";
import { MOCK_SKILLS } from "./index";
import { asMultipleChoice, tagQuestion } from "./taxonomy";

/** R5 content: the question taxonomy (EXAM-003) and multi-step, unfamiliar problem practice (EXAM-004). */

const mock = topicById("mock-exams")!;
const pool = mock.practiceQuestions as KitQuestion[];
const allSkills = new Set(TOPICS.flatMap((t) => t.skills.map((s) => s.id)));

describe("11+ question taxonomy (EXAM-003)", () => {
  it("tags every question on every island by skill, reasoning, representation, difficulty, format and profile", () => {
    let n = 0;
    for (const t of TOPICS.filter((x) => x.id !== "fractions")) {
      for (const q of t.practiceQuestions as KitQuestion[]) {
        const tags = tagQuestion(q);
        expect(allSkills.has(tags.curriculumSkill), `${q.id}: ${tags.curriculumSkill}`).toBe(true);
        expect([1, 2, 3]).toContain(tags.difficulty);
        expect(tags.format).toBe(q.kind === "choose" ? "multiple-choice" : "number-entry");
        expect(tags.reasoning && tags.representation).toBeTruthy();
        n++;
      }
    }
    expect(n).toBeGreaterThan(1000);
  });

  it("keeps curriculum questions and exam-practice questions apart", () => {
    const island = (topicById("times-tables")!.practiceQuestions as KitQuestion[])[0];
    expect(tagQuestion(island)).toMatchObject({ style: "curriculum", profiles: [] });
    for (const q of pool) {
      const tags = tagQuestion(q);
      expect(tags.style, q.id).toBe("exam-practice");
      expect(tags.profiles, q.id).toEqual(["general"]);
      // A borrowed question names the island skill it practises, not just the mock area.
      if (q.origin) expect(allSkills.has(q.origin) && !q.origin.startsWith("mock-exams."), q.id).toBe(true);
    }
  });
});

describe("multi-step and unfamiliar problems (EXAM-004)", () => {
  it("covers multi-step arithmetic, word problems, interpretation, working backwards, estimation, patterns and method choice", () => {
    const types = new Set(pool.filter((q) => q.skill === MOCK_SKILLS.problems).map((q) => tagQuestion(q).reasoning));
    expect([...types].sort()).toEqual(["estimation", "interpretation", "method-selection", "multi-step", "pattern", "working-backwards"]);
    expect(pool.filter((q) => q.skill === MOCK_SKILLS.problems && tagQuestion(q).representation === "word").length).toBeGreaterThan(5);
  });

  it("explains the reasoning, not only the final answer", () => {
    for (const q of pool.filter((x) => x.skill === MOCK_SKILLS.problems && ["estimation", "interpretation", "multi-step", "pattern"].includes(tagQuestion(x).reasoning))) {
      // At least two statements, with numbers worked in between, before the bold answer.
      expect(q.explanation.split(/[.:]\s/).length, q.id).toBeGreaterThanOrEqual(2);
      expect(q.explanation, q.id).toMatch(/\*\*[^*]+\*\*/);
    }
  });
});

describe("multiple-choice versions for mocks (EXAM-005)", () => {
  it("turn every number question into 2 to 4 different options in order, with exactly the right answer marked right", () => {
    let n = 0;
    for (const q of pool) {
      if (q.kind !== "number") continue;
      const mc = asMultipleChoice(q);
      const texts = mc.options.map((o) => o.text);
      expect(new Set(texts).size, q.id).toBe(texts.length);
      expect(texts.length >= 2 && texts.length <= 4, q.id).toBe(true);
      mc.options.forEach((_, i) => expect(mock.questions.evaluate(mc, { kind: "choose", choice: i } as never).correct, `${q.id} option ${i}`).toBe(i === mc.answer));
      n++;
    }
    expect(n).toBeGreaterThan(20);
  });
});
