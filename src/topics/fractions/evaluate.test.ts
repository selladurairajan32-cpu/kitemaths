import { describe, expect, it } from "vitest";
import { diagnoseCompare, diagnoseFractionOf, diagnoseMissingNumber, diagnoseNamedFraction } from "./diagnose";
import { equivalenceNote, evaluate, inputProblem, isResponseComplete } from "./evaluate";
import { checkChallenge, type LabSnapshot } from "./lab";
import { frac } from "./math";
import { M } from "./misconceptions";
import { questionById } from "./questions";

describe("misconception diagnosis", () => {
  it("spots a swapped numerator and denominator", () => {
    expect(diagnoseNamedFraction(frac(4, 1), { total: 4, counted: 1 })).toEqual([M.SWAP]);
  });

  it("spots part-to-part thinking, and stays honest when a miscount is also possible", () => {
    // 1 shaded of 4: "1/3" could be part-to-part OR an off-by-one count.
    expect(diagnoseNamedFraction(frac(1, 3), { total: 4, counted: 1 })).toEqual([M.PART_PART, M.MISCOUNT]);
    // 3 shaded of 5: "3/2" can only be part-to-part.
    expect(diagnoseNamedFraction(frac(3, 2), { total: 5, counted: 3 })).toEqual([M.PART_PART]);
  });

  it("spots counting marks instead of gaps", () => {
    expect(diagnoseNamedFraction(frac(2, 6), { total: 5, counted: 2 })).toEqual([M.MISCOUNT]);
  });

  it("does not claim a misconception for unexplained answers or equivalent answers", () => {
    expect(diagnoseNamedFraction(frac(3, 4), { total: 4, counted: 1 })).toEqual([]);
    expect(diagnoseNamedFraction(frac(1, 2), { total: 4, counted: 2 })).toEqual([]);
  });

  it("spots 'bigger denominator means bigger' only when it explains the answer", () => {
    expect(diagnoseCompare(frac(1, 3), frac(1, 5), "<")).toEqual([M.BIGGER_DEN]);
    expect(diagnoseCompare(frac(1, 6), frac(1, 3), ">")).toEqual([M.BIGGER_DEN]);
    expect(diagnoseCompare(frac(1, 3), frac(1, 5), "=")).toEqual([]);
    expect(diagnoseCompare(frac(2, 5), frac(4, 5), ">")).toEqual([]);
    expect(diagnoseCompare(frac(1, 3), frac(1, 5), ">")).toEqual([]);
  });

  it("spots finding one part only, and dividing by the numerator", () => {
    expect(diagnoseFractionOf(frac(3, 4), 12, 3)).toEqual([M.UNIT_ONLY]);
    expect(diagnoseFractionOf(frac(3, 4), 12, 4)).toEqual([M.SWAP]);
    expect(diagnoseFractionOf(frac(1, 4), 12, 4)).toEqual([]);
    expect(diagnoseFractionOf(frac(3, 4), 12, 10)).toEqual([]);
  });

  it("spots additive equivalence", () => {
    expect(diagnoseMissingNumber(frac(1, 2), { d: 8 }, 7)).toEqual([M.ADDITIVE]);
    expect(diagnoseMissingNumber(frac(2, 5), { n: 4 }, 7)).toEqual([M.ADDITIVE]);
    expect(diagnoseMissingNumber(frac(6, 8), { n: 3 }, 5)).toEqual([M.ADDITIVE]);
    expect(diagnoseMissingNumber(frac(1, 2), { d: 8 }, 3)).toEqual([]);
  });
});

describe("question validation", () => {
  it("validates choose-fraction answers with tagged distractors", () => {
    const q = questionById("nm-1");
    expect(evaluate(q, { kind: "choose-fraction", choice: frac(1, 4) })).toEqual({ correct: true, misconceptions: [] });
    expect(evaluate(q, { kind: "choose-fraction", choice: frac(4, 1) }).misconceptions).toEqual([M.SWAP]);
    expect(evaluate(q, { kind: "choose-fraction", choice: frac(1, 3) }).misconceptions).toContain(M.PART_PART);
    expect(evaluate(q, { kind: "choose-fraction", choice: frac(3, 4) })).toEqual({ correct: false, misconceptions: [] });
  });

  it("accepts equivalent written fractions and explains why", () => {
    const q = questionById("nm-4");
    expect(q.kind).toBe("choose-fraction");
    const w = questionById("nm-5");
    const exact = evaluate(w, { kind: "write-fraction", value: frac(5, 6) });
    expect(exact.correct).toBe(true);
    expect(exact.feedback).toBeUndefined();
    const nm8 = questionById("nm-8");
    expect(evaluate(nm8, { kind: "write-fraction", value: frac(7, 10) }).correct).toBe(true);
    expect(evaluate(nm8, { kind: "write-fraction", value: frac(3, 10) }).correct).toBe(false);
    const half = evaluate(questionById("as-2"), { kind: "write-fraction", value: frac(4, 10) });
    expect(half.correct).toBe(true);
    expect(half.feedback).toMatch(/equivalent/);
  });

  it("treats a zero denominator as an input problem, not a misconception", () => {
    const q = questionById("nm-5");
    expect(inputProblem(q, { kind: "write-fraction", value: frac(5, 0) })).toMatch(/can't be 0/);
    expect(inputProblem(q, { kind: "write-fraction", value: frac(5, 6) })).toBeNull();
    expect(evaluate(q, { kind: "write-fraction", value: frac(5, 0) }).misconceptions).toEqual([]);
  });

  it("accepts whole and zero fractions where they are the true value", () => {
    const shadeAll = { ...questionById("rp-1"), id: "tmp", target: frac(3, 3) } as ReturnType<typeof questionById>;
    expect(evaluate(shadeAll, { kind: "shade", shaded: [0, 1, 2] }).correct).toBe(true);
  });

  it("validates built explanations slot by slot and links wrong choices to misconceptions", () => {
    const q = questionById("ls-reason-1");
    const right = { verdict: "wrong", total: "8", shaded: "3", fraction: "3/8" };
    expect(evaluate(q, { kind: "explain-frame", slots: right }).correct).toBe(true);
    const pp = evaluate(q, { kind: "explain-frame", slots: { ...right, total: "5", fraction: "3/5" } });
    expect(pp).toMatchObject({ correct: false, misconceptions: [M.PART_PART] });
    expect(isResponseComplete(q, { kind: "explain-frame", slots: { verdict: "wrong" } })).toBe(false);
  });

  it("checks counterexamples mathematically, with guidance for near misses", () => {
    const q = questionById("ls-reason-2");
    expect(evaluate(q, { kind: "counterexample", a: frac(1, 3), b: frac(3, 4) }).correct).toBe(true);
    expect(evaluate(q, { kind: "counterexample", a: frac(1, 2), b: frac(2, 4) }).correct).toBe(true);
    const agrees = evaluate(q, { kind: "counterexample", a: frac(1, 3), b: frac(1, 5) });
    expect(agrees.correct).toBe(false);
    expect(agrees.feedback).toMatch(/agrees with the claim/);
    expect(evaluate(q, { kind: "counterexample", a: frac(1, 5), b: frac(4, 5) }).feedback).toMatch(/bigger denominator/);
    const kim = questionById("rs-8");
    expect(evaluate(kim, { kind: "counterexample", a: frac(1, 2), b: frac(2, 8) }).correct).toBe(true);
    expect(evaluate(kim, { kind: "counterexample", a: frac(1, 2), b: frac(2, 3) }).correct).toBe(false);
  });

  it("explains why an equivalent written answer is accepted", () => {
    expect(equivalenceNote(frac(4, 10), frac(2, 5))).toMatch(/multiplying the top and bottom of \{2\/5\} by 2/);
    expect(equivalenceNote(frac(2, 5), frac(2, 5))).toBeUndefined();
  });

  it("handles two-step word problems with traps for each single step", () => {
    const q = questionById("ls-amounts-4");
    expect(evaluate(q, { kind: "number", value: 25 }).correct).toBe(true);
    expect(evaluate(q, { kind: "number", value: 15 }).feedback).toMatch(/only the brown/);
  });

  it("accepts any shading of the right amount, including equivalent amounts", () => {
    const q = questionById("rp-5"); // 1/2 of 8 parts
    expect(evaluate(q, { kind: "shade", shaded: [0, 2, 5, 7] }).correct).toBe(true);
    expect(evaluate(q, { kind: "shade", shaded: [0] }).correct).toBe(false);
    const q2 = questionById("rp-2"); // 3/4 of a circle of 4
    expect(evaluate(q2, { kind: "shade", shaded: [0, 1, 2, 3] }).misconceptions).toEqual([M.SWAP]);
  });

  it("flags unequal shapes chosen as equal parts", () => {
    const q = questionById("ep-1");
    expect(evaluate(q, { kind: "equal-parts", selected: ["a", "c"] }).correct).toBe(true);
    expect(evaluate(q, { kind: "equal-parts", selected: ["a", "b", "c"] }).misconceptions).toEqual([M.UNEQUAL]);
    expect(evaluate(q, { kind: "equal-parts", selected: ["a"] })).toEqual({ correct: false, misconceptions: [] });
  });

  it("validates matching row by row", () => {
    const q = questionById("nm-6");
    const right = { a: frac(1, 4), b: frac(2, 3), c: frac(3, 5) };
    expect(evaluate(q, { kind: "match", pairs: right }).correct).toBe(true);
    const wrong = evaluate(q, { kind: "match", pairs: { ...right, b: frac(3, 5), c: frac(2, 3) } });
    expect(wrong.correct).toBe(false);
  });

  it("validates number line placement by value, not by position label", () => {
    const q = questionById("nl-5"); // 1/2 on eighths
    expect(evaluate(q, { kind: "number-line-place", index: 4 }).correct).toBe(true);
    expect(evaluate(q, { kind: "number-line-place", index: 1 }).correct).toBe(false);
  });

  it("uses question-specific traps for word problems", () => {
    const q = questionById("fo-7");
    const e = evaluate(q, { kind: "number", value: 12 });
    expect(e.correct).toBe(false);
    expect(e.misconceptions).toEqual([]);
    expect(e.feedback).toMatch(/spends/);
    expect(evaluate(q, { kind: "number", value: 6 }).correct).toBe(true);
  });

  it("diagnoses fraction-of answers", () => {
    const q = questionById("fo-4");
    expect(evaluate(q, { kind: "fraction-of", value: 9 }).correct).toBe(true);
    expect(evaluate(q, { kind: "fraction-of", value: 3 }).misconceptions).toEqual([M.UNIT_ONLY]);
  });

  it("validates comparison symbols", () => {
    const q = questionById("cp-3");
    expect(evaluate(q, { kind: "compare", symbol: ">" }).correct).toBe(true);
    expect(evaluate(q, { kind: "compare", symbol: "<" }).misconceptions).toEqual([M.BIGGER_DEN]);
  });

  it("refuses a response of the wrong kind", () => {
    expect(() => evaluate(questionById("cp-3"), { kind: "number", value: 1 })).toThrow();
  });
});

describe("lab challenges", () => {
  const base: LabSnapshot = {
    build: frac(0, 4),
    compareTop: frac(0, 4),
    compareBottom: frac(0, 4),
    equivalentBase: frac(1, 2),
    equivalentResult: frac(1, 2),
  };

  it("checks build challenges by amount and part count", () => {
    const check = { kind: "make" as const, target: frac(1, 2), parts: 8 };
    expect(checkChallenge(check, { ...base, build: frac(4, 8) })).toBe(true);
    expect(checkChallenge(check, { ...base, build: frac(1, 2) })).toBe(false);
    expect(checkChallenge({ kind: "bigger-than", than: frac(1, 2), parts: 5 }, { ...base, build: frac(3, 5) })).toBe(true);
    expect(checkChallenge({ kind: "bigger-than", than: frac(1, 2), parts: 5 }, { ...base, build: frac(2, 5) })).toBe(false);
  });

  it("checks compare and equivalence challenges exactly", () => {
    expect(
      checkChallenge({ kind: "compare", a: frac(1, 3), b: frac(1, 5) }, { ...base, compareTop: frac(1, 3), compareBottom: frac(1, 5) }),
    ).toBe(true);
    expect(
      checkChallenge({ kind: "compare", a: frac(1, 3), b: frac(1, 5) }, { ...base, compareTop: frac(2, 6), compareBottom: frac(1, 5) }),
    ).toBe(false);
    const eq = { kind: "equivalent" as const, to: frac(2, 3), parts: 6 };
    expect(checkChallenge(eq, { ...base, equivalentBase: frac(2, 3), equivalentResult: frac(4, 6) })).toBe(true);
    expect(checkChallenge(eq, { ...base, equivalentBase: frac(2, 3), equivalentResult: frac(2, 3) })).toBe(false);
  });
});
