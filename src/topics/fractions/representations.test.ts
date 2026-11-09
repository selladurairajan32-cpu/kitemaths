import { describe, expect, it } from "vitest";
import { TOPICS } from "@/topics";
import { evaluate } from "./evaluate";
import { FOLLOWUP_QUESTIONS, LESSON_QUESTIONS, PRACTICE_QUESTIONS } from "./questions";
import type { Diagram, FractionQuestion } from "./types";

/**
 * QA-001 AC1 (partition mapping) and ARCH-003 AC3 (the UI is never the source of truth): every Fractions question's
 * picture agrees with its answer, checked interaction by interaction. The expected values come from small rules
 * written here (counting parts, cross-multiplying), not from the maths module; the marking (`evaluate`) is then checked
 * against them.
 */

const fractions = TOPICS.find((t) => t.id === "fractions")!;
const ALL = new Map<string, FractionQuestion>();
for (const q of [...PRACTICE_QUESTIONS, ...LESSON_QUESTIONS, ...FOLLOWUP_QUESTIONS, ...(fractions.practiceQuestions as FractionQuestion[]), ...(fractions.assessmentQuestions as FractionQuestion[])]) ALL.set(q.id, q);
const questions = [...ALL.values()];
const ofKind = <K extends FractionQuestion["kind"]>(k: K) => questions.filter((q): q is Extract<FractionQuestion, { kind: K }> => q.kind === k);

/** Number of parts in a picture, counted directly. */
function parts(d: Diagram): number {
  if (d.shape === "grid") return d.rows * d.cols;
  if (d.shape === "line") return d.intervals;
  return d.parts;
}
/** True when every part is the same size (no sizes given means equal parts). */
function equalParts(d: Diagram): boolean {
  if ((d.shape === "bar" || d.shape === "circle") && d.sizes) return d.sizes.every((s) => s === d.sizes![0]);
  return true;
}
const sameValue = (a: { n: number; d: number }, b: { n: number; d: number }) => a.n * b.d === b.n * a.d;

describe("pictures agree with answers, per interaction (QA-001, ARCH-003)", () => {
  it("covers every Fractions interaction that has a picture or a numeric model", () => {
    const kinds = new Set(questions.map((q) => q.kind));
    for (const k of ["choose-fraction", "write-fraction", "shade", "compare", "number-line-place", "equal-parts", "match", "fraction-of", "missing-number", "counterexample", "explain-frame"]) {
      expect(kinds.has(k as FractionQuestion["kind"]), k).toBe(true);
    }
  });

  it("name the fraction: the shaded (or unshaded) count over the parts of an equal-part picture is the answer", () => {
    const qs = [...ofKind("choose-fraction"), ...ofKind("write-fraction")];
    expect(qs.length).toBeGreaterThan(10);
    for (const q of qs) {
      expect(equalParts(q.diagram), `${q.id}: a naming question needs equal parts`).toBe(true);
      const total = parts(q.diagram);
      const counted = q.diagram.shape === "line" ? (q.diagram.point ?? 0) : q.ask === "unshaded" ? total - (q.diagram.shaded?.length ?? 0) : (q.diagram.shaded?.length ?? 0);
      expect({ n: q.answer.n, d: q.answer.d }, q.id).toEqual({ n: counted, d: total });
      expect(evaluate(q, q.kind === "choose-fraction" ? { kind: q.kind, choice: q.answer } : { kind: q.kind, value: q.answer }).correct, q.id).toBe(true);
    }
  });

  it("shade: the target is a whole number of the picture's equal parts, and shading exactly that many is right", () => {
    for (const q of ofKind("shade")) {
      const total = parts(q.diagram);
      expect(equalParts(q.diagram), q.id).toBe(true);
      expect((q.target.n * total) % q.target.d, `${q.id}: ${q.target.n}/${q.target.d} of ${total} parts`).toBe(0);
      const count = (q.target.n * total) / q.target.d;
      expect(count).toBeLessThanOrEqual(total);
      expect(evaluate(q, { kind: "shade", shaded: Array.from({ length: count }, (_, i) => i) }).correct, q.id).toBe(true);
      if (count < total) expect(evaluate(q, { kind: "shade", shaded: Array.from({ length: count + 1 }, (_, i) => i) }).correct, q.id).toBe(false);
    }
  });

  it("compare: the right sign is the one cross-multiplication gives, and the others are wrong", () => {
    const qs = ofKind("compare");
    expect(qs.length).toBeGreaterThan(5);
    for (const q of qs) {
      const l = q.left.n * q.right.d;
      const r = q.right.n * q.left.d;
      const sign = l < r ? "<" : l > r ? ">" : "=";
      for (const s of ["<", "=", ">"] as const) expect(evaluate(q, { kind: "compare", symbol: s }).correct, `${q.id} ${s}`).toBe(s === sign);
    }
  });

  it("number line: the target sits on a tick of the scale, and only that tick is right", () => {
    for (const q of ofKind("number-line-place")) {
      expect((q.target.n * q.intervals) % q.target.d, `${q.id}: ${q.target.n}/${q.target.d} on ${q.intervals} gaps`).toBe(0);
      const index = (q.target.n * q.intervals) / q.target.d;
      expect(index).toBeGreaterThanOrEqual(0);
      expect(index).toBeLessThanOrEqual(q.intervals);
      expect(evaluate(q, { kind: "number-line-place", index }).correct, q.id).toBe(true);
      for (const other of [index - 1, index + 1].filter((i) => i >= 0 && i <= q.intervals)) {
        expect(evaluate(q, { kind: "number-line-place", index: other }).correct, `${q.id} at ${other}`).toBe(false);
      }
    }
  });

  it("equal parts: the answer is exactly the pictures whose parts are equal, and picking an unequal one is rejected", () => {
    const qs = ofKind("equal-parts");
    expect(qs.length).toBeGreaterThan(0);
    for (const q of qs) {
      const equal = q.items.filter((it) => equalParts(it.diagram)).map((it) => it.id).sort();
      expect([...q.answer].sort(), q.id).toEqual(equal);
      const unequal = q.items.find((it) => !equalParts(it.diagram));
      if (unequal) expect(evaluate(q, { kind: "equal-parts", selected: [...q.answer, unequal.id] }).correct, q.id).toBe(false);
    }
  });

  it("match: each row's picture shows its answer, and the answer is one of the choices", () => {
    for (const q of ofKind("match")) {
      for (const row of q.rows) {
        const total = parts(row.diagram);
        const counted = row.diagram.shape === "line" ? (row.diagram.point ?? 0) : (row.diagram.shaded?.length ?? 0);
        expect({ n: row.answer.n, d: row.answer.d }, `${q.id} ${row.id}`).toEqual({ n: counted, d: total });
        expect(q.choices.some((c) => c.n === row.answer.n && c.d === row.answer.d), `${q.id} ${row.id}`).toBe(true);
      }
    }
  });

  it("fraction of an amount: the answer is a whole number and the marking accepts exactly it", () => {
    for (const q of ofKind("fraction-of")) {
      expect((q.amount * q.fraction.n) % q.fraction.d, q.id).toBe(0);
      const answer = (q.amount * q.fraction.n) / q.fraction.d;
      expect(evaluate(q, { kind: "fraction-of", value: answer }).correct, q.id).toBe(true);
      expect(evaluate(q, { kind: "fraction-of", value: answer + 1 }).correct, q.id).toBe(false);
    }
  });

  it("missing number: filling the gap makes the two fractions equal", () => {
    for (const q of ofKind("missing-number")) {
      const findN = q.right.n === undefined;
      const fixed = findN ? q.right.d! : q.right.n!;
      // Search 1..144 by hand-rule (cross-multiplication) for the value that makes them equal.
      const fits = Array.from({ length: 144 }, (_, i) => i + 1).filter((v) => sameValue(q.left, findN ? { n: v, d: fixed } : { n: fixed, d: v }));
      expect(fits.length, q.id).toBe(1);
      expect(evaluate(q, { kind: "missing-number", value: fits[0] }).correct, q.id).toBe(true);
    }
  });

  it("counterexample: hand-picked pairs that break the claim are accepted, and pairs that fit it are not", () => {
    const cases = {
      // "A bigger denominator means a smaller fraction": 3/4 has the bigger denominator but is not smaller than 1/2.
      "bigger-denominator-is-smaller": { breaks: [{ n: 1, d: 2 }, { n: 3, d: 4 }], fits: [{ n: 1, d: 2 }, { n: 1, d: 4 }] },
      // "A bigger numerator means a bigger fraction": 2/8 has the bigger numerator but is smaller than 1/2.
      "bigger-numerator-is-bigger": { breaks: [{ n: 1, d: 2 }, { n: 2, d: 8 }], fits: [{ n: 1, d: 2 }, { n: 3, d: 4 }] },
    } as const;
    const qs = ofKind("counterexample");
    expect(qs.length).toBeGreaterThan(0);
    for (const q of qs) {
      expect(q.maxDenominator, q.id).toBeGreaterThanOrEqual(8);
      const c = cases[q.claim];
      expect(evaluate(q, { kind: "counterexample", a: c.breaks[0], b: c.breaks[1] }).correct, `${q.id} breaks`).toBe(true);
      expect(evaluate(q, { kind: "counterexample", a: c.fits[0], b: c.fits[1] }).correct, `${q.id} fits`).toBe(false);
    }
  });

  it("explain frame: every slot's answer is one of its options, all right answers pass, and one wrong slot fails", () => {
    for (const q of ofKind("explain-frame")) {
      const slots = q.frame.filter((p): p is Exclude<typeof p, string> => typeof p !== "string");
      expect(slots.length, q.id).toBeGreaterThan(0);
      const right: Record<string, string> = {};
      for (const s of slots) {
        expect(s.options.map((o) => o.id), `${q.id} ${s.slot}`).toContain(s.answer);
        expect(new Set(s.options.map((o) => o.id)).size, `${q.id} ${s.slot} unique options`).toBe(s.options.length);
        right[s.slot] = s.answer;
      }
      expect(evaluate(q, { kind: "explain-frame", slots: right }).correct, q.id).toBe(true);
      const first = slots[0];
      const wrong = first.options.find((o) => o.id !== first.answer)!;
      expect(evaluate(q, { kind: "explain-frame", slots: { ...right, [first.slot]: wrong.id } }).correct, q.id).toBe(false);
    }
  });
});
