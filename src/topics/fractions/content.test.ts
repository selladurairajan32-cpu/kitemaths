import { describe, expect, it } from "vitest";
import { countedParts, evaluate, numericAnswer } from "./evaluate";
import { LAB_LIMITS } from "./lab";
import { LESSONS } from "./lessons";
import { equivalent, isEqualPartition, sameFraction } from "./math";
import { MISCONCEPTIONS } from "./misconceptions";
import {
  ALL_QUESTIONS,
  ASSESSMENT_AREAS,
  ASSESSMENT_FORMS,
  ASSESSMENT_QUESTIONS,
  PRACTICE_QUESTIONS,
  questionById,
} from "./questions";
import { SKILLS } from "./skills";
import type { Diagram } from "./types";
import { diagramParts, diagramSizes } from "./types";

function checkDiagram(d: Diagram, label: string) {
  const parts = diagramParts(d);
  expect(parts, label).toBeGreaterThan(0);
  if (d.shape === "line") {
    if (d.point !== undefined) expect(d.point).toBeLessThanOrEqual(d.intervals);
    return;
  }
  const shaded = d.shaded ?? [];
  expect(new Set(shaded).size, `${label} duplicate shading`).toBe(shaded.length);
  shaded.forEach((i) => expect(i, label).toBeLessThan(parts));
  if ((d.shape === "bar" || d.shape === "circle") && d.sizes) {
    expect(d.sizes.length, `${label} sizes`).toBe(parts);
  }
}

describe("question bank integrity", () => {
  it("has unique ids and known skills", () => {
    const ids = ALL_QUESTIONS.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
    const skills = new Set(SKILLS.map((s) => s.id));
    ALL_QUESTIONS.forEach((q) => expect(skills.has(q.skill), q.id).toBe(true));
  });

  it("gives every question a mathematically correct answer", () => {
    for (const q of ALL_QUESTIONS) {
      expect(q.explanation.length, q.id).toBeGreaterThan(0);
      switch (q.kind) {
        case "choose-fraction": {
          checkDiagram(q.diagram, q.id);
          const { total, counted } = countedParts(q.diagram, q.ask);
          expect(sameFraction(q.answer, { n: counted, d: total }), q.id).toBe(true);
          expect(q.options.filter((o) => sameFraction(o, q.answer)).length, q.id).toBe(1);
          const keys = q.options.map((o) => `${o.n}/${o.d}`);
          expect(new Set(keys).size, q.id).toBe(keys.length);
          q.options
            .filter((o) => !sameFraction(o, q.answer))
            .forEach((o) => expect(equivalent(o, q.answer), `${q.id} equivalent distractor`).toBe(false));
          break;
        }
        case "write-fraction": {
          checkDiagram(q.diagram, q.id);
          const { total, counted } = countedParts(q.diagram, q.ask);
          expect(sameFraction(q.answer, { n: counted, d: total }), q.id).toBe(true);
          break;
        }
        case "choose": {
          if (q.diagram) checkDiagram(q.diagram, q.id);
          const ids = q.options.map((o) => o.id);
          expect(new Set(ids).size, q.id).toBe(ids.length);
          expect(ids, q.id).toContain(q.answer);
          expect(q.options.find((o) => o.id === q.answer)?.misconception, q.id).toBeUndefined();
          break;
        }
        case "shade": {
          checkDiagram(q.diagram, q.id);
          expect((q.target.n * diagramParts(q.diagram)) % q.target.d, q.id).toBe(0);
          break;
        }
        case "equal-parts": {
          const equalIds = q.items
            .filter((it) => isEqualPartition(diagramSizes(it.diagram)))
            .map((it) => it.id);
          expect([...q.answer].sort(), q.id).toEqual(equalIds.sort());
          break;
        }
        case "match": {
          q.rows.forEach((row) => {
            checkDiagram(row.diagram, q.id);
            const { total, counted } = countedParts(row.diagram);
            expect(sameFraction(row.answer, { n: counted, d: total }), q.id).toBe(true);
            expect(q.choices.filter((c) => sameFraction(c, row.answer)).length, q.id).toBe(1);
          });
          expect(q.choices.length, q.id).toBe(q.rows.length);
          break;
        }
        case "number-line-place": {
          const idx = (q.target.n * q.intervals) / q.target.d;
          expect(Number.isInteger(idx), q.id).toBe(true);
          expect(idx, q.id).toBeGreaterThan(0);
          expect(idx, q.id).toBeLessThanOrEqual(q.intervals);
          break;
        }
        case "fraction-of":
        case "missing-number":
        case "number": {
          const v = numericAnswer(q);
          expect(v, q.id).not.toBeNull();
          expect(Number.isInteger(v), q.id).toBe(true);
          if ("traps" in q && q.traps) {
            q.traps.forEach((t) => expect(t.value, q.id).not.toBe(v));
          }
          break;
        }
        case "compare":
          break;
        case "explain-frame": {
          const slots = q.frame.filter((p) => typeof p !== "string");
          expect(slots.length, q.id).toBeGreaterThan(0);
          expect(new Set(slots.map((p) => (typeof p === "string" ? "" : p.slot))).size, q.id).toBe(slots.length);
          for (const p of slots) {
            if (typeof p === "string") continue;
            const ids = p.options.map((o) => o.id);
            expect(new Set(ids).size, q.id).toBe(ids.length);
            expect(ids, q.id).toContain(p.answer);
            expect(p.options.find((o) => o.id === p.answer)?.misconception, `${q.id} correct option tagged`).toBeUndefined();
          }
          break;
        }
        case "counterexample": {
          let found = false;
          for (let ad = 1; ad <= q.maxDenominator && !found; ad++)
            for (let an = 1; an <= ad && !found; an++)
              for (let bd = 1; bd <= q.maxDenominator && !found; bd++)
                for (let bn = 1; bn <= bd && !found; bn++)
                  found = evaluate(q, { kind: "counterexample", a: { n: an, d: ad }, b: { n: bn, d: bd } }).correct;
          expect(found, `${q.id} has a reachable counterexample`).toBe(true);
          break;
        }
      }
    }
  });

  it("covers every skill in practice, at three difficulty levels where possible", () => {
    for (const s of SKILLS) {
      const qs = PRACTICE_QUESTIONS.filter((q) => q.skill === s.id);
      expect(qs.length, s.id).toBeGreaterThanOrEqual(4);
      expect(new Set(qs.map((q) => q.difficulty)).size, s.id).toBeGreaterThanOrEqual(2);
    }
  });

  it("each assessment form covers every skill at least twice and every area, without hints", () => {
    const practiceIds = new Set(PRACTICE_QUESTIONS.map((q) => q.id));
    for (const form of Object.values(ASSESSMENT_FORMS)) {
      for (const sk of SKILLS) expect(form.filter((q) => q.skill === sk.id).length, sk.id).toBeGreaterThanOrEqual(2);
      const areas = new Set(form.map((q) => q.area));
      ASSESSMENT_AREAS.forEach((a) => expect(areas.has(a), a).toBe(true));
      form.forEach((q) => expect(practiceIds.has(q.id)).toBe(false));
    }
    expect(ASSESSMENT_QUESTIONS.length).toBe(ASSESSMENT_FORMS.A.length + ASSESSMENT_FORMS.B.length);
  });

  it("assessment forms are parallel: same skills, areas, kinds and difficulty in the same order", () => {
    const sig = (qs: typeof ASSESSMENT_FORMS.A) => qs.map((q) => `${q.area}|${q.skill}|${q.kind}|${q.difficulty}`);
    expect(sig(ASSESSMENT_FORMS.B)).toEqual(sig(ASSESSMENT_FORMS.A));
    const content = (q: (typeof ASSESSMENT_FORMS.A)[number]) =>
      JSON.stringify({ ...q, id: undefined, area: undefined, explanation: undefined, hint: undefined });
    const seen = new Set(ASSESSMENT_FORMS.A.map(content));
    ASSESSMENT_FORMS.B.forEach((q) => expect(seen.has(content(q)), q.id).toBe(false));
  });

  it("links every misconception to real follow-up questions", () => {
    for (const m of MISCONCEPTIONS) {
      expect(m.followUps.length, m.id).toBeGreaterThan(0);
      m.followUps.forEach((id) => expect(() => questionById(id), id).not.toThrow());
    }
  });
});

describe("lesson integrity", () => {
  it("references real questions and achievable challenges", () => {
    for (const lesson of LESSONS) {
      expect(lesson.steps.length, lesson.id).toBeGreaterThan(0);
      for (const step of lesson.steps) {
        if (step.type === "check") {
          expect(() => questionById(step.questionId), step.questionId).not.toThrow();
        }
        if (step.type === "worked") {
          step.steps.forEach((s) => {
            if (!s.blank) return;
            expect(Number.isInteger(s.blank.answer)).toBe(true);
            expect(s.blank.hint.length).toBeGreaterThan(0);
            expect(s.blank.worked).toContain(String(s.blank.answer));
            s.blank.traps?.forEach((t) => expect(t.value).not.toBe(s.blank!.answer));
          });
        }
        if (step.type === "lab") {
          for (const c of step.challenges) {
            expect(c.mode).toBe(step.mode);
            const check = c.check;
            if (check.kind === "make" && check.parts) {
              expect((check.target.n * check.parts) % check.target.d, c.id).toBe(0);
              expect(check.parts).toBeLessThanOrEqual(LAB_LIMITS.maxParts);
            }
            if (check.kind === "equivalent") {
              const factor = check.parts / check.to.d;
              expect(Number.isInteger(factor), c.id).toBe(true);
              expect(factor, c.id).toBeLessThanOrEqual(LAB_LIMITS.maxSplit);
            }
            if (check.kind === "compare") {
              expect(check.a.d).toBeLessThanOrEqual(LAB_LIMITS.maxParts);
              expect(check.b.d).toBeLessThanOrEqual(LAB_LIMITS.maxParts);
            }
          }
        }
      }
    }
  });

  it("follows the teaching sequence: explain before checking in every lesson", () => {
    for (const lesson of LESSONS) {
      const firstCheck = lesson.steps.findIndex((s) => s.type === "check");
      const firstTeach = lesson.steps.findIndex((s) => s.type !== "check");
      expect(firstTeach, lesson.id).toBeLessThan(firstCheck === -1 ? Infinity : firstCheck);
    }
  });
});
