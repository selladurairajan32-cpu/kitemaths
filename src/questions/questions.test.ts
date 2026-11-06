import { describe, expect, it } from "vitest";
import { TOPICS } from "@/topics";
import { genId, templatesOf } from "@/topics/kit/define";
import { FOLLOWUP_QUESTIONS, LESSON_QUESTIONS, PRACTICE_QUESTIONS } from "@/topics/fractions/questions";
import type { FractionQuestion } from "@/topics/fractions/types";
import { fromFractionQuestion, fromKitQuestion, type KitQuestionLike } from "./adapt";
import { fitsDecimals, numericMatches, roundHalfAwayFromZero } from "./compare";
import { INTERACTIONS, type Interaction, type NumericComparison } from "./schema";
import { validateQuestion } from "./validate";

/**
 * ARCH-002: the typed question schema (spec: docs/product/architecture/ARCH-002-question-schema.md).
 * A valid fixture for every interaction, invalid fixtures that must fail with a useful path, and every existing
 * question converted through the adapters and validated. Nothing here is wired into the app.
 */

const base = {
  id: "demo.q-1",
  skill: "fractions.compare",
  level: "unverified" as const,
  difficulty: 2 as const,
  prompt: "Choose the correct sign.",
  explanation: "Fifths are smaller than thirds.",
  hints: ["Which pieces are bigger?"],
  misconceptions: [] as string[],
  scoring: { marks: 1 },
};
const opt = (id: string, text: string, extra: Record<string, unknown> = {}) => ({ id, text, ...extra });

const VALID: Record<Interaction, Record<string, unknown>> = {
  "choose-one": { ...base, misconceptions: ["fractions.bigger-denominator"], interaction: "choose-one", options: [opt("a", "{1/5}"), opt("b", "{1/3}", { misconception: "fractions.bigger-denominator" })], correctId: "a" },
  "multi-select": { ...base, interaction: "multi-select", options: [opt("p1", "Picture 1"), opt("p2", "Picture 2"), opt("p3", "Picture 3")], correctIds: ["p1", "p3"], scoring: { marks: 2, partialCredit: "per-part" } },
  "number-entry": { ...base, interaction: "number-entry", answer: 2.5, validation: { comparison: { kind: "round", places: 3 }, maxDecimals: 1, allowNegative: false }, unit: "cm", traps: [{ value: 25, misconception: "decimals.place", feedback: "Check the point." }], misconceptions: ["decimals.place"] },
  "fraction-entry": { ...base, interaction: "fraction-entry", answer: { n: 3, d: 4 }, validation: { acceptEquivalent: true }, ask: "shaded", traps: [{ value: { n: 4, d: 3 } }], model: { kind: "partition", shape: "bar", parts: 4, shaded: [0, 1, 2] } },
  compare: { ...base, interaction: "compare", left: { n: 1, d: 5 }, right: { n: 1, d: 3 }, answer: "<" },
  shade: { ...base, interaction: "shade", target: { n: 2, d: 3 }, validation: { acceptEquivalent: true }, model: { kind: "partition", shape: "circle", parts: 6 } },
  "number-line-place": { ...base, interaction: "number-line-place", intervals: 8, target: { n: 3, d: 4 } },
  match: { ...base, interaction: "match", rows: [{ id: "r1", text: "Picture 1" }, { id: "r2", text: "Picture 2" }], choices: [{ id: "c1", text: "{1/2}" }, { id: "c2", text: "{1/4}" }, { id: "c3", text: "{3/4}" }], pairs: { r1: "c3", r2: "c1" } },
  "missing-number": { ...base, interaction: "missing-number", left: { n: 2, d: 3 }, right: { n: null, d: 12 }, answer: 8 },
  "fraction-of": { ...base, interaction: "fraction-of", fraction: { n: 3, d: 4 }, amount: 12, answer: 9, unit: "sweets", traps: [{ value: 3 }] },
  "explain-frame": { ...base, interaction: "explain-frame", frame: ["Sam is", { slot: "decide", options: [opt("right", "right"), opt("wrong", "wrong")], answerId: "wrong" }, "because there are", { slot: "parts", options: [opt("p4", "4"), opt("p5", "5")], answerId: "p5" }, "parts."] },
  counterexample: { ...base, interaction: "counterexample", predicate: { id: "bigger-numerator-is-bigger", params: { maxDenominator: 12 } } },
};

/** Each invalid fixture: the change to a valid one, and the error path it must report. */
const INVALID: Record<Interaction, [string, (q: Record<string, unknown>) => Record<string, unknown>, RegExp][]> = {
  "choose-one": [
    ["correct id not an option", (q) => ({ ...q, correctId: "z" }), /^correctId$/],
    ["duplicate option ids", (q) => ({ ...q, options: [opt("a", "{1/5}"), opt("a", "{1/3}")] }), /^options\[1\]\.id$/],
    ["duplicate option text", (q) => ({ ...q, options: [opt("a", "{1/5}"), opt("b", "{1/5}")] }), /^options\[1\]\.text$/],
    ["one option only", (q) => ({ ...q, options: [opt("a", "{1/5}")] }), /^options$/],
    ["misconception not declared", (q) => ({ ...q, misconceptions: [] }), /^options\[1\]\.misconception$/],
    ["correct option tagged as a misconception", (q) => ({ ...q, correctId: "b" }), /^correctId$/],
  ],
  "multi-select": [
    ["correct id not an option", (q) => ({ ...q, correctIds: ["p1", "p9"] }), /^correctIds\[1\]$/],
    ["repeated correct id", (q) => ({ ...q, correctIds: ["p1", "p1"] }), /^correctIds$/],
    ["no correct ids", (q) => ({ ...q, correctIds: [] }), /^correctIds$/],
  ],
  "number-entry": [
    ["answer has too many decimals", (q) => ({ ...q, answer: 2.55 }), /^answer$/],
    ["negative answer not allowed", (q) => ({ ...q, answer: -2 }), /^answer$/],
    ["trap equals the answer", (q) => ({ ...q, traps: [{ value: 2.5 }] }), /^traps\[0\]\.value$/],
    ["unknown comparison", (q) => ({ ...q, validation: { comparison: { kind: "close" }, maxDecimals: 1, allowNegative: false } }), /^validation\.comparison$/],
    ["options don't belong to number entry", (q) => ({ ...q, options: [opt("a", "1"), opt("b", "2")] }), /^options$/],
    // Review 2 (DEF-032, DEF-033): QA's cases verbatim, then the adjacent ones.
    ["trap feedback is not a string (QA a)", (q) => ({ ...q, traps: [{ value: 25, feedback: 123 }] }), /^traps\[0\]\.feedback$/],
    ["trap misconception is an object (QA a)", (q) => ({ ...q, traps: [{ value: 25, misconception: { bad: true } }] }), /^traps\[0\]\.misconception$/],
    ["trap is not an object", (q) => ({ ...q, traps: ["25"] }), /^traps\[0\]$/],
    ["trap the tolerance would mark correct (QA b: 9.5 for 10 ± 1)", (q) => ({ ...q, answer: 10, validation: { comparison: { kind: "tolerance", absolute: 1 }, maxDecimals: 1, allowNegative: false }, traps: [{ value: 9.5 }], misconceptions: [] }), /^traps\[0\]\.value$/],
    ["trap exactly on the tolerance boundary is marked correct", (q) => ({ ...q, answer: 10, validation: { comparison: { kind: "tolerance", absolute: 0.5 }, maxDecimals: 1, allowNegative: false }, traps: [{ value: 9.5 }], misconceptions: [] }), /^traps\[0\]\.value$/],
    ["trap the rounding would mark correct (QA c: 2.51 for 2.5 at 1 place)", (q) => ({ ...q, answer: 2.5, validation: { comparison: { kind: "round", places: 1 }, maxDecimals: 2, allowNegative: false }, traps: [{ value: 2.51 }], misconceptions: [] }), /^traps\[0\]\.value$/],
    ["negative trap the rounding would mark correct (−3 for −2.5 at 0 places)", (q) => ({ ...q, answer: -2.5, validation: { comparison: { kind: "round", places: 0 }, maxDecimals: 1, allowNegative: true }, traps: [{ value: -3 }], misconceptions: [] }), /^traps\[0\]\.value$/],
    ["two traps overlap under the declared comparison", (q) => ({ ...q, validation: { comparison: { kind: "round", places: 3 }, maxDecimals: 4, allowNegative: false }, traps: [{ value: 30 }, { value: 30.0004 }], misconceptions: [] }), /^traps\[1\]\.value$/],
    ["two traps are exactly equal", (q) => ({ ...q, traps: [{ value: 30 }, { value: 30 }], misconceptions: [] }), /^traps\[1\]\.value$/],
  ],
  "fraction-entry": [
    ["zero denominator", (q) => ({ ...q, answer: { n: 3, d: 0 } }), /^answer\.d$/],
    ["non-integer numerator", (q) => ({ ...q, answer: { n: 1.5, d: 4 } }), /^answer\.n$/],
    ["equivalent trap would be marked right", (q) => ({ ...q, traps: [{ value: { n: 6, d: 8 } }] }), /^traps\[0\]\.value$/],
    ["missing acceptEquivalent", (q) => ({ ...q, validation: {} }), /^validation\.acceptEquivalent$/],
    // Review 2 (DEF-032, DEF-034, DEF-035)
    ["trap feedback is not a string", (q) => ({ ...q, traps: [{ value: { n: 4, d: 3 }, feedback: 5 }] }), /^traps\[0\]\.feedback$/],
    ["duplicate traps (QA d: 1/3 twice)", (q) => ({ ...q, answer: { n: 1, d: 2 }, traps: [{ value: { n: 1, d: 3 } }, { value: { n: 1, d: 3 } }], model: undefined, ask: undefined }), /^traps\[1\]\.value$/],
    ["equivalent traps while equivalent answers are accepted (1/3 and 2/6)", (q) => ({ ...q, answer: { n: 1, d: 2 }, traps: [{ value: { n: 1, d: 3 } }, { value: { n: 2, d: 6 } }], model: undefined, ask: undefined }), /^traps\[1\]\.value$/],
    ["answer disagrees with the shaded part of the model", (q) => ({ ...q, answer: { n: 1, d: 4 } }), /^answer$/],
    ["answer disagrees with the unshaded part of the model", (q) => ({ ...q, ask: "unshaded" }), /^answer$/],
    ["ask given without a model with shaded parts", (q) => ({ ...q, model: undefined }), /^ask$/],
    ["ask marked on a partition", (q) => ({ ...q, ask: "marked" }), /^ask$/],
    ["ask marked disagrees with the marked point", (q) => ({ ...q, ask: "marked", answer: { n: 1, d: 2 }, model: { kind: "number-line", min: 0, max: 1, intervals: 8, point: 3 } }), /^answer$/],
    ["ask on a model with unequal parts", (q) => ({ ...q, model: { kind: "partition", shape: "bar", parts: 4, sizes: [1, 1, 2, 1], shaded: [0, 1, 2] } }), /^model\.sizes$/],
    ["unknown ask", (q) => ({ ...q, ask: "half" }), /^ask$/],
  ],
  compare: [
    ["wrong sign for the numbers", (q) => ({ ...q, answer: ">" }), /^answer$/],
    ["not a sign", (q) => ({ ...q, answer: "≤" }), /^answer$/],
  ],
  shade: [
    ["target not a whole number of parts", (q) => ({ ...q, target: { n: 1, d: 4 } }), /^target$/],
    ["no model to shade", (q) => ({ ...q, model: undefined }), /^model$/],
    ["unequal parts", (q) => ({ ...q, model: { kind: "partition", shape: "bar", parts: 3, sizes: [1, 1, 2] } }), /^model\.sizes$/],
  ],
  "number-line-place": [
    ["target between ticks", (q) => ({ ...q, intervals: 5 }), /^target$/],
    ["target beyond 1", (q) => ({ ...q, target: { n: 5, d: 4 } }), /^target$/],
    // Review 2 (DEF-035): QA's case, verbatim: 8 gaps, target 3/8, model with 4 gaps.
    ["model has a different number of gaps (QA e)", (q) => ({ ...q, intervals: 8, target: { n: 3, d: 8 }, model: { kind: "number-line", min: 0, max: 1, intervals: 4 } }), /^model\.intervals$/],
    ["target is not on the model's ticks (QA e)", (q) => ({ ...q, intervals: 8, target: { n: 3, d: 8 }, model: { kind: "number-line", min: 0, max: 1, intervals: 4 } }), /^target$/],
    ["model is not a number line", (q) => ({ ...q, model: { kind: "partition", shape: "bar", parts: 8 } }), /^model$/],
  ],
  match: [
    ["pair to an unknown choice", (q) => ({ ...q, pairs: { r1: "c3", r2: "c9" } }), /^pairs\.r2$/],
    ["row without a pair", (q) => ({ ...q, pairs: { r1: "c3" } }), /^pairs\.r2$/],
    ["two choices with the same text", (q) => ({ ...q, choices: [{ id: "c1", text: "{1/2}" }, { id: "c2", text: "{1/2}" }, { id: "c3", text: "{3/4}" }] }), /^choices\[1\]\.text$/],
    ["pair for an unknown row", (q) => ({ ...q, pairs: { r1: "c3", r2: "c1", r3: "c2" } }), /^pairs\.r3$/],
  ],
  "missing-number": [
    ["answer doesn't make them equal", (q) => ({ ...q, answer: 9 }), /^answer$/],
    ["two gaps", (q) => ({ ...q, right: { n: null, d: null } }), /^right$/],
  ],
  "fraction-of": [
    ["answer wrong for the numbers", (q) => ({ ...q, answer: 8 }), /^answer$/],
    ["not a whole number of the amount", (q) => ({ ...q, amount: 10, answer: 7 }), /^fraction$/],
    ["duplicate traps", (q) => ({ ...q, traps: [{ value: 3 }, { value: 3 }] }), /^traps\[1\]\.value$/],
    ["trap feedback is not a string", (q) => ({ ...q, traps: [{ value: 3, feedback: ["no"] }] }), /^traps\[0\]\.feedback$/],
    ["trap equals the answer", (q) => ({ ...q, traps: [{ value: 9 }] }), /^traps\[0\]\.value$/],
  ],
  "explain-frame": [
    ["answer not one of the slot's options", (q) => ({ ...q, frame: ["Sam is", { slot: "decide", options: [opt("right", "right"), opt("wrong", "wrong")], answerId: "maybe" }] }), /^frame\[1\]\.answerId$/],
    ["duplicate slot", (q) => ({ ...q, frame: [{ slot: "s", options: [opt("a", "a"), opt("b", "b")], answerId: "a" }, { slot: "s", options: [opt("a", "a"), opt("b", "b")], answerId: "b" }] }), /^frame\[1\]\.slot$/],
    ["no slots", (q) => ({ ...q, frame: ["just text"] }), /^frame$/],
  ],
  counterexample: [
    ["unknown claim", (q) => ({ ...q, predicate: { id: "every-fraction-is-small", params: { maxDenominator: 12 } } }), /^predicate\.id$/],
    ["bound too small for any counterexample", (q) => ({ ...q, predicate: { id: "bigger-numerator-is-bigger", params: { maxDenominator: 2 } } }), /^predicate\.params\.maxDenominator$/],
    ["code instead of a named predicate", (q) => ({ ...q, predicate: { id: "bigger-numerator-is-bigger", params: { maxDenominator: 12 }, test: () => true } }), /^$|^predicate\.test$/],
  ],
};

const errorsOf = (x: unknown) => {
  const r = validateQuestion(x);
  return r.ok ? [] : r.errors;
};

describe("question schema (ARCH-002)", () => {
  it("has a valid fixture for every interaction, and each one validates", () => {
    expect(Object.keys(VALID).sort()).toEqual([...INTERACTIONS].sort());
    for (const [k, q] of Object.entries(VALID)) expect(errorsOf(q), k).toEqual([]);
  });

  it("survives a JSON round trip: definitions are plain data", () => {
    for (const q of Object.values(VALID)) expect(errorsOf(JSON.parse(JSON.stringify(q)))).toEqual([]);
  });

  it("rejects invalid definitions for every interaction, naming the field at fault", () => {
    expect(Object.keys(INVALID).sort()).toEqual([...INTERACTIONS].sort());
    for (const [k, cases] of Object.entries(INVALID) as [Interaction, (typeof INVALID)[Interaction]][]) {
      expect(cases.length, k).toBeGreaterThanOrEqual(2);
      for (const [what, change, path] of cases) {
        const errors = errorsOf(change({ ...VALID[k] }));
        expect(errors.some((e) => path.test(e.path)), `${k}: ${what} → ${JSON.stringify(errors)}`).toBe(true);
        for (const e of errors) expect(e.message.length, `${k}: ${what}`).toBeGreaterThan(5);
      }
    }
  });

  it("rejects bad common fields: id, level, difficulty, hints, scoring and unknown interactions", () => {
    const q = VALID.compare;
    const cases: [Record<string, unknown>, RegExp][] = [
      [{ ...q, id: "has space" }, /^id$/],
      [{ ...q, level: { years: [] } }, /^level$/],
      [{ ...q, level: { years: [4, 4] } }, /^level\.years$/],
      [{ ...q, level: undefined }, /^level$/],
      [{ ...q, difficulty: 4 }, /^difficulty$/],
      [{ ...q, hints: "Look closely" }, /^hints$/],
      [{ ...q, hints: [""] }, /^hints\[0\]$/],
      [{ ...q, scoring: { marks: 0 } }, /^scoring\.marks$/],
      [{ ...q, scoring: { marks: 1, partialCredit: "per-part" } }, /^scoring\.partialCredit$/],
      [{ ...q, interaction: "drag-and-drop" }, /^interaction$/],
      [{ ...q, prompt: "" }, /^prompt$/],
      [{ ...q, extra: 1 }, /^extra$/],
    ];
    for (const [bad, path] of cases) {
      const errors = errorsOf(bad);
      expect(errors.some((e) => path.test(e.path)), `${JSON.stringify(bad).slice(0, 80)} → ${JSON.stringify(errors)}`).toBe(true);
    }
    expect(errorsOf(null)).toHaveLength(1);
    expect(errorsOf({ ...q, scoring: { marks: 1 }, explanation: undefined }).some((e) => e.path === "explanation")).toBe(true);
  });

  it("validates every existing Fractions question through the adapter", () => {
    const fractions = TOPICS.find((t) => t.id === "fractions")!;
    const all = new Map<string, FractionQuestion>();
    for (const q of [...PRACTICE_QUESTIONS, ...LESSON_QUESTIONS, ...FOLLOWUP_QUESTIONS, ...(fractions.practiceQuestions as FractionQuestion[]), ...(fractions.assessmentQuestions as FractionQuestion[])]) all.set(q.id, q);
    expect(all.size).toBeGreaterThan(50);
    const problems: string[] = [];
    for (const q of all.values()) {
      const r = validateQuestion(fromFractionQuestion(q, { level: "unverified" }));
      if (!r.ok) problems.push(`${q.id}: ${JSON.stringify(r.errors)}`);
    }
    expect(problems).toEqual([]);
  });

  it("validates every kit island's questions through the adapter, across seeds; the only failures are the known duplicate traps (DEF-028)", () => {
    const problems: string[] = [];
    const duplicateTraps = new Set<string>();
    let n = 0;
    for (const t of TOPICS.filter((t) => t.id !== "fractions")) {
      const qs = [...t.practiceQuestions, ...t.assessmentQuestions];
      for (const tpl of templatesOf(t.id)) for (const d of tpl.difficulties) for (let s = 0; s < 20; s++) qs.push(t.questionById(genId(t.id, tpl.key, d, s)));
      for (const q of qs) {
        n++;
        const adapted = fromKitQuestion(q as unknown as KitQuestionLike, { level: "unverified" });
        const r = validateQuestion(adapted);
        if (r.ok) continue;
        // DEF-028: some generators emit two traps with the same value, so the second trap's feedback is unreachable.
        // The schema rightly rejects that; it is recorded as a content defect on the preview islands, not hidden.
        // The exception is exactly this: a number-entry question, the trap-value path, and this message. Nothing else.
        const other = r.errors.filter((e) => !(adapted.interaction === "number-entry" && /^traps\[\d+\]\.value$/.test(e.path) && e.message === "repeats another trap"));
        if (other.length) problems.push(`${q.id}: ${JSON.stringify(other)}`);
        else duplicateTraps.add(q.id.split(":")[1]);
      }
    }
    expect(n).toBeGreaterThan(5000);
    expect(problems.slice(0, 10)).toEqual([]);
    // Ratchet: the templates with duplicate traps found on 5 Nov (seeds 0–149). The set may only shrink.
    const KNOWN = ["place-value.pv-which-digit", "add-subtract.as-add-word", "add-subtract.as-sub-word", "add-subtract.as-word", "area-perimeter.ap-count", "area-perimeter.ap-compound", "shapes-angles.sa-props", "ratio-algebra.ra-missing", "problem-solving.ps-measure", "problem-solving.ps-sum-diff", "problem-solving.ps-counting", "mock-exams.mx-number", "mock-exams.mx-shape", "mock-exams.mx-reasoning"];
    expect([...duplicateTraps].filter((t) => !KNOWN.includes(t))).toEqual([]);
  });

  it("never invents a year mapping: the caller's level is used, and unverified is explicit", () => {
    const q = PRACTICE_QUESTIONS[0];
    expect(fromFractionQuestion(q, { level: "unverified" }).level).toBe("unverified");
    expect(fromFractionQuestion(q, { level: { years: [3, 4] } }).level).toEqual({ years: [3, 4] });
  });
});

describe("numeric comparison contract (ARCH-002 §3): one rule for answers and traps, no hidden allowance", () => {
  const tol = (absolute: number): NumericComparison => ({ kind: "tolerance", absolute });
  const round = (places: number): NumericComparison => ({ kind: "round", places });

  it("tolerance is inclusive: exactly at the boundary matches, just inside matches, just outside does not", () => {
    // 10 ± 0.5: 9.5 and 10.5 are exactly representable, so the boundary is exact.
    expect(numericMatches(tol(0.5), 10, 9.5)).toBe(true); // exactly at
    expect(numericMatches(tol(0.5), 10, 10.5)).toBe(true);
    expect(numericMatches(tol(0.5), 10, 9.5000001)).toBe(true); // just inside
    expect(numericMatches(tol(0.5), 10, 9.4999999)).toBe(false); // just outside
    expect(numericMatches(tol(0.5), 10, 10.5000001)).toBe(false);
  });

  it("adds no fixed allowance: very small tolerances keep their stated boundary", () => {
    // Answer 0 keeps the arithmetic exact. With a hidden 1e-9 allowance, 2e-12 would wrongly match a 1e-12 tolerance.
    expect(numericMatches(tol(1e-12), 0, 1e-12)).toBe(true); // exactly at
    expect(numericMatches(tol(1e-12), 0, 0.5e-12)).toBe(true); // inside
    expect(numericMatches(tol(1e-12), 0, 2e-12)).toBe(false); // outside
    expect(numericMatches(tol(1e-12), 0, -1e-12)).toBe(true);
    expect(numericMatches(tol(1e-12), 0, -2e-12)).toBe(false);
  });

  it("exact means identical", () => {
    expect(numericMatches({ kind: "exact" }, 2.5, 2.5)).toBe(true);
    expect(numericMatches({ kind: "exact" }, 2.5, 2.5000000001)).toBe(false);
    expect(numericMatches({ kind: "exact" }, 0, -0)).toBe(true);
  });

  it("rounds half away from zero, including negative values (hand-worked)", () => {
    expect([2.5, -2.5, 0.5, -0.5, 1.4, -1.4, 0, -0].map(roundHalfAwayFromZero)).toEqual([3, -3, 1, -1, 1, -1, 0, 0]);
    expect(Object.is(roundHalfAwayFromZero(-0.2), 0)).toBe(true); // never negative zero
    expect(numericMatches(round(0), 2.5, 3)).toBe(true);
    expect(numericMatches(round(0), 2.5, 2)).toBe(false);
    expect(numericMatches(round(0), -2.5, -3)).toBe(true); // −2.5 rounds to −3, not −2
    expect(numericMatches(round(0), -2.5, -2)).toBe(false);
    expect(numericMatches(round(1), 2.5, 2.51)).toBe(true);
    expect(numericMatches(round(1), 2.5, 2.56)).toBe(false); // 2.56 → 2.6
    expect(numericMatches(round(1), -0.25, -0.3)).toBe(true); // −0.25 → −0.3
    expect(numericMatches(round(1), -0.25, -0.2)).toBe(false);
    expect(numericMatches(round(2), 1.005, 1.0)).toBe(true); // the double 1.005 is 1.00499999999999989…, so it rounds to 1.00
  });

  it("checks typeable decimals exactly", () => {
    expect(fitsDecimals(2.5, 1)).toBe(true);
    expect(fitsDecimals(2.55, 1)).toBe(false);
    expect(fitsDecimals(-0.25, 2)).toBe(true);
    expect(fitsDecimals(0.1 + 0.2, 1)).toBe(false); // 0.30000000000000004 can't be typed
    expect(fitsDecimals(12, 0)).toBe(true);
  });

  it("is used consistently: the validator judges traps by the same function as answers", () => {
    const q = (comparison: NumericComparison, trap: number) => ({ ...VALID["number-entry"], answer: 10, validation: { comparison, maxDecimals: 6, allowNegative: false }, traps: [{ value: trap }], misconceptions: [] });
    for (const [cmp, trap] of [[tol(0.5), 9.5], [tol(0.5), 9.5000001], [round(0), 10.4], [{ kind: "exact" } as NumericComparison, 10]] as const) {
      expect(numericMatches(cmp, 10, trap)).toBe(true);
      expect(errorsOf(q(cmp, trap)).some((e) => e.path === "traps[0].value"), `${cmp.kind} ${trap}`).toBe(true);
    }
    for (const [cmp, trap] of [[tol(0.5), 9.4999999], [round(0), 10.6], [{ kind: "exact" } as NumericComparison, 10.0000001]] as const) {
      expect(numericMatches(cmp, 10, trap)).toBe(false);
      expect(errorsOf(q(cmp, trap)), `${cmp.kind} ${trap}`).toEqual([]);
    }
  });
});

describe("model consistency says only what the definition states (ARCH-002, DEF-035)", () => {
  /** A fraction-entry definition with these changes; `undefined` removes a field (definitions are JSON, so no undefined values). */
  const entry = (extra: Record<string, unknown>) => {
    const q: Record<string, unknown> = { ...VALID["fraction-entry"], ...extra };
    delete q.traps;
    for (const [k, v] of Object.entries(q)) if (v === undefined) delete q[k];
    return q;
  };
  const bar = (shaded: number[]) => ({ kind: "partition", shape: "bar", parts: 4, shaded });

  it("accepts the answer for each explicitly asked quantity", () => {
    expect(errorsOf(entry({ ask: "shaded", model: bar([0, 1, 2]), answer: { n: 3, d: 4 } }))).toEqual([]);
    expect(errorsOf(entry({ ask: "unshaded", model: bar([0, 1, 2]), answer: { n: 1, d: 4 } }))).toEqual([]);
    expect(errorsOf(entry({ ask: "shaded", model: bar([0, 1, 2]), answer: { n: 6, d: 8 } }))).toEqual([]); // equivalent value
    expect(errorsOf(entry({ ask: "marked", model: { kind: "number-line", min: 0, max: 1, intervals: 8, point: 3 }, answer: { n: 3, d: 8 } }))).toEqual([]);
  });

  it("does not guess when `ask` is absent: the answer is simply not checked against the model (recorded limitation)", () => {
    // 1/4 is the unshaded part of this model, but nothing says that is what is asked, so the validator makes no claim.
    const q = entry({ ask: undefined, model: bar([0, 1, 2]), answer: { n: 1, d: 4 } });
    expect(errorsOf(q)).toEqual([]);
    // The same answer fails as soon as the definition says "shaded": the meaning is explicit, never chosen to make it pass.
    expect(errorsOf({ ...q, ask: "shaded" }).some((e) => e.path === "answer")).toBe(true);
  });

  it("allows scaffolding: a pre-shaded model for shade and a pre-marked number line for placement", () => {
    expect(errorsOf({ ...VALID.shade, model: { kind: "partition", shape: "circle", parts: 6, shaded: [0] } })).toEqual([]);
    expect(errorsOf({ ...VALID["number-line-place"], intervals: 8, target: { n: 3, d: 4 }, model: { kind: "number-line", min: 0, max: 1, intervals: 8, point: 2 } })).toEqual([]);
    expect(errorsOf({ ...VALID["number-line-place"], model: { kind: "number-line", min: 0, max: 1, intervals: 8 } })).toEqual([]);
  });

  it("adapters set `ask` from the existing data's meaning, and the existing write-fraction questions agree with it", () => {
    const asked = new Set<string>();
    for (const q of [...PRACTICE_QUESTIONS, ...LESSON_QUESTIONS, ...FOLLOWUP_QUESTIONS].filter((q) => q.kind === "write-fraction")) {
      const d = fromFractionQuestion(q, { level: "unverified" });
      expect(d.interaction).toBe("fraction-entry");
      if (d.interaction === "fraction-entry") asked.add(d.ask ?? "none");
      expect(errorsOf(d), q.id).toEqual([]);
    }
    expect([...asked].sort()).toEqual(expect.arrayContaining(["shaded"]));
  });
});
