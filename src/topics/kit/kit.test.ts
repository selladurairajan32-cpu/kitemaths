import { describe, expect, it } from "vitest";
import { TOPICS } from "@/topics";
import type { KitQuestion } from "./types";

/** Every island built with the kit: its question makers, challenge, warm-up and lessons hold up. */
const KIT_TOPICS = TOPICS.filter((t) => t.id !== "fractions");

describe.each(KIT_TOPICS.map((t) => [t.id, t] as const))("kit island %s", (_id, topic) => {
  const pools = Array.from({ length: 40 }, (_, i) => topic.practicePool(`seed-${i}`, [])).flat() as unknown as KitQuestion[];

  it("makes plenty of fresh questions for every skill", () => {
    for (const s of topic.skills) expect(pools.filter((q) => q.skill === s.id).length, s.id).toBeGreaterThan(20);
  });

  it("makes well-formed questions that mark their own answer right and every trap wrong", () => {
    for (const q of pools) {
      expect(q.prompt.trim(), q.id).not.toBe("");
      expect(q.hint.trim(), q.id).not.toBe("");
      expect(q.explanation.trim(), q.id).not.toBe("");
      expect(topic.questionById(q.id), q.id).toEqual(q);
      if (q.kind === "choose") {
        expect(q.options.length, q.id).toBeGreaterThanOrEqual(2);
        expect(q.answer, q.id).toBeGreaterThanOrEqual(0);
        expect(q.answer, q.id).toBeLessThan(q.options.length);
        const texts = q.options.map((o) => o.text);
        expect(new Set(texts).size, `${q.id}: ${texts.join(" | ")}`).toBe(texts.length);
        expect(topic.questions.evaluate(q, { kind: "choose", choice: q.answer } as never).correct, q.id).toBe(true);
        q.options.forEach((_, i) => i !== q.answer && expect(topic.questions.evaluate(q, { kind: "choose", choice: i } as never).correct, q.id).toBe(false));
      } else {
        expect(Number.isFinite(q.answer), q.id).toBe(true);
        expect(Number.isInteger(q.answer), `${q.id} answer ${q.answer}`).toBe(true);
        expect(topic.questions.evaluate(q, { kind: "number", value: q.answer } as never).correct, q.id).toBe(true);
        for (const t of q.traps ?? []) {
          expect(t.value, `${q.id} trap equals the answer`).not.toBe(q.answer);
          expect(topic.questions.evaluate(q, { kind: "number", value: t.value } as never).correct, q.id).toBe(false);
        }
      }
      expect(topic.questions.answerText(q).trim(), q.id).not.toBe("");
    }
  });

  it("asks every skill twice in each form of the big challenge", () => {
    for (const form of Object.values(topic.assessment.forms)) {
      for (const s of topic.skills) expect(form.filter((q) => q.skill === s.id).length, s.id).toBe(2);
    }
  });

  it("has a warm-up question per lesson and real check questions in every lesson", () => {
    expect(topic.placement?.plan.map((p) => p.lessonId)).toEqual(topic.lessons.map((l) => l.id));
    for (const l of topic.lessons) {
      const checks = l.steps.filter((s) => s.type === "check");
      expect(checks.length, l.id).toBeGreaterThan(0);
      checks.forEach((c) => c.type === "check" && expect(topic.questionById(c.questionId).id).toBe(c.questionId));
    }
  });
});
