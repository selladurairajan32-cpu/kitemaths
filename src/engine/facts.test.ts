import { describe, expect, it } from "vitest";
import {
  allFacts,
  classifyAnswer,
  diagnosticSample,
  factAnswer,
  factKey,
  factPrompt,
  factReport,
  factStates,
  FACT_SECURE_STREAK,
  MTC,
  mtcCorrect,
  mtcForm,
  planSession,
  recommendedTable,
  REVIEW_INTERVAL_DAYS,
  statusOf,
  tableSummary,
} from "./facts";
import type { FactRef, ItemResult } from "./types";

/** R2 times-table fact engine. Oracles are hand-worked tables and the published MTC limits, not the functions under test. */

const DAY = 86_400_000;
let clock = 0;
function answer(a: number, b: number, ok: boolean, extra: Partial<ItemResult> = {}): ItemResult {
  clock += 1000;
  return {
    questionId: `fact:${a}x${b}`, skill: "times-tables.x", context: "practice", correct: ok, firstTry: ok, attempts: 1, hintsUsed: 0,
    misconceptions: [], fact: { a, b, form: "mul" }, at: clock, ...extra,
  };
}

describe("facts (TT-004, TT-008)", () => {
  it("lists the 66 facts from 2 × 2 to 12 × 12 once each, as unordered pairs", () => {
    // Hand count: pairs a ≤ b with a, b in 2..12 = 11 + 10 + … + 1 = 66.
    const facts = allFacts();
    expect(facts.length).toBe(66);
    expect(new Set(facts.map((f) => factKey(f.a, f.b))).size).toBe(66);
    expect(factKey(8, 7)).toBe(factKey(7, 8));
  });

  it("asks every form with exact answers, true signs and the missing number in the right place (TT-008)", () => {
    // Hand-worked for 7 and 8 (product 56).
    const cases: [FactRef["form"], string, number][] = [
      ["mul", "7 × 8 = ?", 56],
      ["missing-factor", "7 × ? = 56", 8],
      ["div-quotient", "56 ÷ 7 = ?", 8],
      ["div-divisor", "56 ÷ ? = 8", 7],
      ["div-dividend", "? ÷ 7 = 8", 56],
    ];
    for (const [form, prompt, ans] of cases) {
      expect(factPrompt({ a: 7, b: 8, form })).toBe(prompt);
      expect(factAnswer({ a: 7, b: 8, form })).toBe(ans);
    }
  });
});

describe("telling recall gaps from input mistakes (TT-005 AC2)", () => {
  const f: FactRef = { a: 7, b: 8, form: "mul" };
  it.each([
    [56, "right"],
    [65, "slip"], // digits swapped
    [566, "slip"], // a digit doubled
    [5, "slip"], // a digit dropped
    [63, "neighbour"], // 7 × 9
    [49, "neighbour"], // 7 × 7
    [64, "neighbour"], // 8 × 8
    [15, "added"], // 7 + 8
    [54, "wrong"], // 6 × 9: not a slip or a neighbour of 7 × 8
    [null, "wrong"],
  ] as const)("7 × 8 answered %s is %s", (given, kind) => {
    expect(classifyAnswer(f, given)).toBe(kind);
  });
  it("never calls a one-digit answer's mistake a slip", () => {
    // 2 × 3 = 6: a single digit can't be swapped or dropped, so 7 (not 2 + 3, not a neighbour: 4, 8, 3, 9) is a real miss.
    expect(classifyAnswer({ a: 2, b: 3, form: "mul" }, 7)).toBe("wrong");
  });
});

describe("fact status and review (TT-006 AC3, TT-012)", () => {
  it("marks a fact known only after three recalls in a row", () => {
    expect(FACT_SECURE_STREAK).toBe(3);
    const h = (pattern: boolean[]) => pattern.map((ok) => answer(7, 8, ok));
    expect(statusOf([])).toBe("unseen");
    expect(statusOf(h([true, true]))).toBe("developing");
    expect(statusOf(h([true, true, true]))).toBe("known");
    expect(statusOf(h([true, true, true, false]))).toBe("developing");
    expect(statusOf(h([false, false, false]))).toBe("not-yet");
    // Right after a hint is not a recall.
    expect(statusOf([answer(7, 8, true), answer(7, 8, true), answer(7, 8, true, { hintsUsed: 1 })])).toBe("developing");
  });

  it("judges recall from untimed answers only: a timed miss doesn't undo a known fact", () => {
    const rs = [answer(7, 8, true), answer(7, 8, true), answer(7, 8, true), answer(7, 8, false, { timed: true, context: "timed" })];
    expect(factStates(rs).find((s) => s.key === "7x8")!.status).toBe("known");
  });

  it("ignores slips when judging recall", () => {
    const rs = [answer(7, 8, true), answer(7, 8, true), answer(7, 8, false, { slip: true }), answer(7, 8, true)];
    expect(factStates(rs).find((s) => s.key === "7x8")!.status).toBe("known");
  });

  it("moves a fact up one review box per recall and back to box 1 after a miss, then schedules it by the box", () => {
    // Hand replay: recall → 1, recall → 2, miss → 1, recall → 2. Due = last answer + REVIEW_INTERVAL_DAYS[2] days.
    const rs = [answer(3, 4, true), answer(3, 4, true), answer(3, 4, false), answer(3, 4, true)];
    const s = factStates(rs).find((x) => x.key === "3x4")!;
    expect(s.box).toBe(2);
    expect(s.dueAt).toBe(rs[3].at + REVIEW_INTERVAL_DAYS[2] * DAY);
  });

  it("summarises each table and recommends the first table in the order that isn't fully known (TT-004)", () => {
    const states = factStates([]);
    expect(tableSummary(states, 7)).toEqual({ unseen: 11, "not-yet": 0, developing: 0, known: 0 });
    expect(recommendedTable(states)).toBe(2);
    // Every 2s fact known: the recommendation moves on to the 10s.
    const twos: ItemResult[] = [];
    for (let b = 2; b <= 12; b++) for (let i = 0; i < FACT_SECURE_STREAK; i++) twos.push(answer(2, b, true));
    expect(recommendedTable(factStates(twos))).toBe(10);
  });
});

describe("planned practice sessions (TT-006, TT-012)", () => {
  const now = 100 * DAY;
  const known = (a: number, b: number) => Array.from({ length: FACT_SECURE_STREAK }, () => answer(a, b, true, { at: 1 }));
  const results = [
    ...known(6, 7), // known, due long ago
    answer(3, 4, false, { at: 2 }), // not yet
    answer(2, 5, true, { at: 3 }), // developing
    answer(9, 9, false, { at: 4 }), // not yet
  ];

  it("puts weak facts first, keeps retrieving a known fact every fourth question, and adds a few new facts", () => {
    const plan = planSession(results, now, 6, { seed: "s" });
    const keys = plan.map((f) => factKey(f.a, f.b));
    // Weak facts: not-yet first (oldest first: 3×4, 9×9), then developing (2×5); slot 4 is the known 6×7.
    expect(keys.slice(0, 4)).toEqual(["3x4", "9x9", "2x5", "6x7"]);
    expect(keys.length).toBe(6);
    expect(new Set(keys).size).toBe(6);
  });

  it("is deterministic and respects the length and a chosen table", () => {
    expect(planSession(results, now, 6, { seed: "s" })).toEqual(planSession(results, now, 6, { seed: "s" }));
    const sevens = planSession(results, now, 5, { table: 7, seed: "s" });
    expect(sevens.length).toBe(5);
    for (const f of sevens) expect([f.a, f.b]).toContain(7);
  });

  it("asks a division or missing-number form only once the multiplication has been recalled (TT-008)", () => {
    const fresh = planSession([], now, 10, { seed: "x" });
    expect(fresh.every((f) => f.form === "mul")).toBe(true);
    // In a 7s session the known 6 × 7 takes the fourth slot; across seeds it is sometimes asked as an inverse form.
    const forms = Array.from({ length: 30 }, (_, i) => planSession(known(6, 7), now + i, 4, { table: 7, seed: `k${i}` }).find((f) => factKey(f.a, f.b) === "6x7")!.form);
    expect(forms.some((f) => f !== "mul")).toBe(true);
    expect(forms.some((f) => f === "mul")).toBe(true);
  });
});

describe("all-facts diagnostic (TT-005)", () => {
  it("samples every table at least twice, with no fact twice, deterministically", () => {
    for (const seed of ["a", "b", "c", "d"]) {
      const d = diagnosticSample(seed);
      expect(d.length).toBe(25);
      expect(new Set(d.map((f) => factKey(f.a, f.b))).size).toBe(25);
      for (let t = 2; t <= 12; t++) expect(d.filter((f) => f.a === t || f.b === t).length).toBeGreaterThanOrEqual(2);
      expect(diagnosticSample(seed)).toEqual(d);
    }
  });
});

describe("timed simulator (TT-009)", () => {
  // Oracle: the Standards and Testing Agency's MTC assessment framework (updated 2022), Tables 1 and 2, typed from the source.
  const TABLE_1: Record<number, [number, number]> = { 2: [0, 2], 3: [1, 3], 4: [1, 3], 5: [1, 3], 6: [2, 4], 7: [2, 4], 8: [2, 4], 9: [2, 4], 10: [0, 2], 11: [1, 3], 12: [2, 4] };

  it("uses the published timings and length", () => {
    expect([MTC.length, MTC.answerMs, MTC.pauseMs]).toEqual([25, 6000, 3000]);
    expect(MTC.tableLimits).toEqual(TABLE_1);
  });

  it("builds every form within the published table, key-stage and duplicate limits", () => {
    for (let i = 0; i < 60; i++) {
      const form = mtcForm(`seed-${i}`);
      expect(form.length).toBe(25);
      expect(new Set(form.map((f) => `${f.a}x${f.b}`)).size).toBe(25);
      for (const [t, [lo, hi]] of Object.entries(TABLE_1)) {
        const n = form.filter((f) => f.a === Number(t)).length;
        expect(n, `table ${t}`).toBeGreaterThanOrEqual(lo);
        expect(n, `table ${t}`).toBeLessThanOrEqual(hi);
      }
      const ks1 = form.filter((f) => [2, 5, 10].includes(f.a)).length;
      expect(ks1).toBeGreaterThanOrEqual(3);
      expect(ks1).toBeLessThanOrEqual(7);
      for (const f of form) {
        expect(f.form).toBe("mul");
        expect(f.b).toBeGreaterThanOrEqual(2);
        expect(f.b).toBeLessThanOrEqual(12);
      }
    }
  });

  it("accepts an answer only within the 6-second window", () => {
    const f: FactRef = { a: 6, b: 7, form: "mul" };
    expect(mtcCorrect(f, 42, 6000)).toBe(true);
    expect(mtcCorrect(f, 42, 6001)).toBe(false);
    expect(mtcCorrect(f, 41, 1000)).toBe(false);
  });
});

describe("fact report (TT-011)", () => {
  it("separates timed from untimed, counts inverse forms and slips, and shows recent consistency", () => {
    const rs = [
      answer(6, 7, true),
      answer(6, 7, false),
      answer(7, 6, true, { fact: { a: 7, b: 6, form: "div-quotient" } }),
      answer(6, 7, false, { timed: true }),
      answer(6, 7, false, { slip: true }),
    ];
    const row = factReport(rs).find((r) => r.key === "6x7")!;
    // Hand count: untimed non-slip answers are 3 (2 right); one inverse (right); one timed (wrong); one slip.
    expect(row).toMatchObject({ attempts: 3, correct: 2, recent: [true, false, true], inverseAttempts: 1, inverseCorrect: 1, timedAttempts: 1, timedCorrect: 0, slips: 1 });
  });
});
