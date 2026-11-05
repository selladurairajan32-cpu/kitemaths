import { describe, expect, it } from "vitest";
import { TOPICS } from "@/topics";
import { genId, templatesOf } from "@/topics/kit/define";
import { FOLLOWUP_QUESTIONS, LESSON_QUESTIONS, PRACTICE_QUESTIONS } from "@/topics/fractions/questions";
import type { FractionQuestion } from "@/topics/fractions/types";
import { fromFractionQuestion, fromKitQuestion, type KitQuestionLike } from "./adapt";
import { INTERACTIONS, type Interaction } from "./schema";
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
  "fraction-entry": { ...base, interaction: "fraction-entry", answer: { n: 3, d: 4 }, validation: { acceptEquivalent: true }, traps: [{ value: { n: 4, d: 3 } }], model: { kind: "partition", shape: "bar", parts: 4, shaded: [0, 1, 2] } },
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
  ],
  "fraction-entry": [
    ["zero denominator", (q) => ({ ...q, answer: { n: 3, d: 0 } }), /^answer\.d$/],
    ["non-integer numerator", (q) => ({ ...q, answer: { n: 1.5, d: 4 } }), /^answer\.n$/],
    ["equivalent trap would be marked right", (q) => ({ ...q, traps: [{ value: { n: 6, d: 8 } }] }), /^traps\[0\]\.value$/],
    ["missing acceptEquivalent", (q) => ({ ...q, validation: {} }), /^validation\.acceptEquivalent$/],
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
  ],
  match: [
    ["pair to an unknown choice", (q) => ({ ...q, pairs: { r1: "c3", r2: "c9" } }), /^pairs\.r2$/],
    ["row without a pair", (q) => ({ ...q, pairs: { r1: "c3" } }), /^pairs\.r2$/],
    ["pair for an unknown row", (q) => ({ ...q, pairs: { r1: "c3", r2: "c1", r3: "c2" } }), /^pairs\.r3$/],
  ],
  "missing-number": [
    ["answer doesn't make them equal", (q) => ({ ...q, answer: 9 }), /^answer$/],
    ["two gaps", (q) => ({ ...q, right: { n: null, d: null } }), /^right$/],
  ],
  "fraction-of": [
    ["answer wrong for the numbers", (q) => ({ ...q, answer: 8 }), /^answer$/],
    ["not a whole number of the amount", (q) => ({ ...q, amount: 10, answer: 7 }), /^fraction$/],
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
        const r = validateQuestion(fromKitQuestion(q as unknown as KitQuestionLike, { level: "unverified" }));
        if (r.ok) continue;
        // DEF-028: some generators emit two traps with the same value, so the second trap's feedback is unreachable.
        // The schema rightly rejects that; it is recorded as a content defect on the preview islands, not hidden.
        const other = r.errors.filter((e) => !(/^traps\[\d+\]\.value$/.test(e.path) && e.message === "repeats another trap"));
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
