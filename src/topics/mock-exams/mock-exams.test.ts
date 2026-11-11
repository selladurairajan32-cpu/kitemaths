import { describe, expect, it } from "vitest";
import { TOPICS, topicById } from "@/topics";
import type { KitQuestion } from "@/topics/kit/types";
import { genId } from "@/topics/kit/define";
import { MOCK_SKILLS } from "./index";
import { asAnswerSheet, asMultipleChoice, tagQuestion } from "./taxonomy";

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
    // Part (a) of a two-part question (D-037) is a one-step "apply" question; the six demands must all be there.
    expect([...types].sort()).toEqual(["apply", "estimation", "interpretation", "method-selection", "multi-step", "pattern", "working-backwards"]);
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

describe("answer sheets and two-part questions (D-037)", () => {
  it("gives an answer sheet up to five different options lettered (A) to (E) in order, with exactly the right one marked right", () => {
    let five = 0;
    for (const q of pool) {
      if (q.kind !== "number") continue;
      const mc = asMultipleChoice(q, 5);
      const texts = mc.options.map((o) => o.text);
      expect(new Set(texts).size, q.id).toBe(texts.length);
      expect(texts.length >= 2 && texts.length <= 5, q.id).toBe(true);
      texts.forEach((t, i) => expect(t.startsWith(`(${"ABCDE"[i]}) `), `${q.id}: ${t}`).toBe(true));
      mc.options.forEach((_, i) => expect(mock.questions.evaluate(mc, { kind: "choose", choice: i } as never).correct, `${q.id} option ${i}`).toBe(i === mc.answer));
      if (texts.length === 5) five++;
    }
    expect(five).toBeGreaterThan(20);
  });

  it("sets two linked parts that share one story, 1 mark each, with answers worked from the story's own numbers", () => {
    const num = (s: string) => Number(s.replace(/,/g, ""));
    const stories = new Set<string>();
    for (const d of [2, 3] as const) {
      for (let seed = 1; seed <= 40; seed++) {
        const [a, b] = ["a", "b"].map((p) => mock.questionById(genId("mock-exams", `mx-twopart-${p}`, d, seed)) as KitQuestion);
        const [storyA, storyB] = [a.prompt.split(" **(a)** ")[0], b.prompt.split(" **(b)** ")[0]];
        expect(storyB, `${d}:${seed}`).toBe(storyA);
        expect(a.prompt.endsWith("(1 mark)") && b.prompt.endsWith("(1 mark)")).toBe(true);
        if (a.kind !== "number" || b.kind !== "number") throw new Error("two-part questions are written answers");
        // Independent oracle: read the numbers back out of the story text and work the answers by hand.
        let m: RegExpExecArray | null;
        if ((m = /sandwiches for \*\*(\d+)p\*\* each and drinks for \*\*(\d+)p/.exec(storyA))) {
          const k = num(/\*\*(\d+) sandwiches\*\*/.exec(a.prompt)![1]);
          expect([a.answer, b.answer]).toEqual([num(m[1]) * k, 1000 - num(m[1]) * k - num(m[2])]);
          stories.add("cafe");
        } else if ((m = /\*\*([\d,]+) pupils\*\*\. Each coach holds \*\*(\d+)\*\*/.exec(storyA))) {
          const [p, s] = [num(m[1]), num(m[2])];
          expect([a.answer, b.answer]).toEqual([Math.ceil(p / s), Math.ceil(p / s) * s - p]);
          stories.add("coach");
        } else if ((m = /\*\*(\d+) m\*\* long and \*\*(\d+) m\*\* wide/.exec(storyA))) {
          const [l, w] = [num(m[1]), num(m[2])];
          const c = num(/costs \*\*£(\d+)\*\* a metre/.exec(b.prompt)![1]);
          expect([a.answer, b.answer]).toEqual([l * w, 2 * (l + w) * c]);
          stories.add("garden");
        } else throw new Error(`unrecognised story: ${storyA}`);
        expect(a.answer > 0 && b.answer >= 0).toBe(true);
      }
    }
    expect([...stories].sort()).toEqual(["cafe", "coach", "garden"]);
  });

  it("letters an already multiple-choice question for an answer sheet, keeping the same right option and the same order every time", () => {
    let n = 0;
    for (const q of pool) {
      if (q.kind !== "choose") continue;
      const sheet = asAnswerSheet(q);
      expect(sheet).toEqual(asAnswerSheet(q));
      expect(sheet.fixedOrder).toBe(true);
      sheet.options.forEach((o, i) => expect(o.text.startsWith(`(${"ABCDE"[i]}) `), `${q.id}: ${o.text}`).toBe(true));
      expect(sheet.options[sheet.answer]!.text.slice(4)).toBe(q.options[q.answer]!.text);
      expect(sheet.options.map((o) => o.text.slice(4)).sort()).toEqual(q.options.map((o) => o.text).sort());
      n++;
    }
    expect(n).toBeGreaterThan(10);
  });
});
