import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { fittingStrategies, flawedSteps, fmt, problemText, solve, standardSteps, STRATEGIES, strategyWorks, type Problem, type Step, type Strategy } from "./strategies";

/**
 * MM-001: no strategy is taught without a justification and independently checked examples. The oracle is BigInt
 * arithmetic on each step and on the whole problem, never the catalogue's own `solve`.
 */

const B = (n: number) => BigInt(n);
/** Independently recompute one step: exact for +, −, ×; for ÷, the step must divide exactly. */
function stepHolds(s: Step): boolean {
  if (!Number.isSafeInteger(s.left) || !Number.isSafeInteger(s.right) || !Number.isSafeInteger(s.value)) return false;
  switch (s.op) {
    case "+":
      return B(s.left) + B(s.right) === B(s.value);
    case "−":
      return B(s.left) - B(s.right) === B(s.value);
    case "×":
      return B(s.left) * B(s.right) === B(s.value);
    case "÷":
      return s.right !== 0 && B(s.value) * B(s.right) === B(s.left);
  }
}
/** The whole problem's answer, in BigInt, or null if it isn't a whole number. */
function oracle(op: Strategy["op"], nums: number[]): bigint | null {
  const [x, y, z] = nums.map(B);
  switch (op) {
    case "+":
      return x + y;
    case "−":
      return x - y;
    case "×":
      return x * y;
    case "÷":
      return x % y === BigInt(0) ? x / y : null;
    case "% of":
      return (x * y) % BigInt(100) === BigInt(0) ? (x * y) / BigInt(100) : null;
    case "²":
      return x * x;
    case "fraction of":
      return (x * z) % y === BigInt(0) ? (x * z) / y : null;
  }
}

function checkAll(s: Strategy, nums: number[]) {
  const steps = s.steps(nums);
  expect(steps.length, `${s.id} ${nums}`).toBeGreaterThan(0);
  for (const st of steps) expect(stepHolds(st), `${s.id} ${nums}: ${st.text}`).toBe(true);
  const want = oracle(s.op, nums);
  expect(want, `${s.id} ${nums} has a whole-number answer`).not.toBeNull();
  expect(B(steps[steps.length - 1].value), `${s.id} ${nums}`).toBe(want);
}

/** Candidate inputs for each kind of problem, wide enough to reach every strategy's boundary. */
function candidates(op: Strategy["op"]): number[][] {
  const out: number[][] = [];
  if (op === "+" || op === "−" || op === "×" || op === "÷")
    for (let a = 2; a <= 1100; a += a < 120 ? 1 : 7) for (const b of [2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 15, 16, 18, 19, 24, 25, 28, 29, 36, 39, 47, 50, 98, 99, 151, 199, 287, 395, 968]) out.push([a, b]);
  if (op === "×") for (let a = 88; a <= 100; a++) for (let b = 88; b <= 100; b++) out.push([a, b]);
  if (op === "²") for (let a = 1; a <= 120; a++) out.push([a]);
  if (op === "% of") for (const p of [5, 10, 20, 25, 30, 50, 70, 90, 15]) for (let a = 10; a <= 2000; a += 10) out.push([p, a]);
  if (op === "fraction of") for (let d = 2; d <= 12; d++) for (let n = 1; n < d; n++) for (let a = d; a <= 240; a += d) out.push([n, d, a]);
  return out;
}

describe("mental-strategy catalogue (MM-001)", () => {
  it("gives every strategy a reason it works, when to use it, when not to, prerequisites and an age range", () => {
    for (const s of STRATEGIES) {
      for (const f of [s.name, s.when, s.why, s.unsuitable]) expect(f.trim().length, s.id).toBeGreaterThan(10);
      expect(s.prerequisites.length, s.id).toBeGreaterThan(0);
      expect(s.years[0] <= s.years[1] && s.years[0] >= 2 && s.years[1] <= 6, s.id).toBe(true);
    }
    expect(new Set(STRATEGIES.map((s) => s.id)).size).toBe(STRATEGIES.length);
  });

  it("checks every step of every hand-picked example independently", () => {
    for (const s of STRATEGIES) for (const ex of s.examples) {
      expect(s.fits(ex), `${s.id} example ${ex} fits`).toBe(true);
      checkAll(s, ex);
    }
  });

  it("is right for every input it says it fits, across thousands of cases", () => {
    let checked = 0;
    for (const s of STRATEGIES) {
      let own = 0;
      for (const nums of candidates(s.op)) {
        if (!s.fits(nums)) continue;
        checkAll(s, nums);
        own++;
      }
      expect(own, `${s.id} was exercised`).toBeGreaterThan(2);
      checked += own;
    }
    expect(checked).toBeGreaterThan(5000);
  });

  it("teaches the boundaries: each strategy refuses the inputs it is unsuitable for", () => {
    const refuses = (id: string, nums: number[]) => expect(STRATEGIES.find((s) => s.id === id)!.fits(nums), `${id} ${nums}`).toBe(false);
    refuses("square-ending-5", [34]); // only numbers ending in 5
    refuses("near-hundred", [85, 97]); // only near 100
    refuses("bridge-10", [32, 5]); // no ten crossed
    refuses("double-halve", [15, 25]); // both odd
    refuses("times-25", [18, 25]); // a quarter of 1,800 is whole, but 18 isn't a multiple of 4: taught as unsuitable
    refuses("factorise", [14, 13]); // 13 is prime
    refuses("fraction-of", [2, 3, 20]); // 20 doesn't divide by 3
  });

  it("only cites curriculum objectives that exist in the map", () => {
    const csv = readFileSync(join(process.cwd(), "docs/product/curriculum/curriculum-map.csv"), "utf8");
    const ids = new Set(csv.split("\n").slice(1).map((l) => l.split(",")[0]));
    for (const s of STRATEGIES) for (const p of s.prerequisites) expect(ids.has(p), `${s.id} cites ${p}`).toBe(true);
  });

  it("makes no claim about speed (MM-001 AC2)", () => {
    for (const s of STRATEGIES) expect(`${s.name} ${s.when} ${s.why} ${s.unsuitable}`, s.id).not.toMatch(/\b(fast|faster|quick|quicker|speed|seconds|instantly|lightning)\b/i);
  });

  it("includes only the Vedic techniques accepted in MM-008, each with a proof", () => {
    expect(STRATEGIES.filter((s) => s.vedic).map((s) => s.id).sort()).toEqual(["near-hundred", "square-ending-5"]);
  });

  it("judges a method valid only when it fits and its steps reach the exact answer (MM-009)", () => {
    const p: Problem = { op: "×", nums: [46, 99] };
    expect(fittingStrategies(p).map((s) => s.id)).toContain("times-99");
    expect(strategyWorks(STRATEGIES.find((s) => s.id === "times-99")!, p)).toBe(true);
    expect(strategyWorks(STRATEGIES.find((s) => s.id === "times-9")!, p)).toBe(false);
  });

  it("checks the standard method's steps too, for every example and input a strategy fits (MM-009)", () => {
    let n = 0;
    for (const st of STRATEGIES) for (const nums of [...st.examples, ...candidates(st.op).filter((x) => st.fits(x)).slice(0, 300)]) {
      const steps = standardSteps({ op: st.op, nums });
      if (!steps) continue;
      for (const x of steps) expect(stepHolds(x), `standard ${st.op} ${nums}: ${x.text}`).toBe(true);
      expect(B(steps[steps.length - 1].value), `standard ${st.op} ${nums}`).toBe(oracle(st.op, nums));
      n++;
    }
    expect(n).toBeGreaterThan(1000);
  });

  it("breaks exactly one step of a flawed method, so its answer is wrong (MM-009)", () => {
    for (const st of STRATEGIES) for (const nums of st.examples) {
      const f = flawedSteps(st.steps(nums));
      if (!f) continue;
      const right = solve({ op: st.op, nums });
      expect(f.steps[f.steps.length - 1].value, `${st.id} ${nums}`).not.toBe(right);
      // Only the broken step is false; every other step is a true calculation on the numbers shown.
      f.steps.forEach((x, i) => expect(stepHolds(x), `${st.id} ${nums} step ${i}`).toBe(true));
      expect(f.steps[f.broken].op).not.toBe(st.steps(nums)[f.broken].op);
    }
  });

  it("keeps the MM-001 catalogue document in step with the catalogue", () => {
    const FAMILY = { bonds: "Number bonds, partitioning and place value (MM-003)", doubling: "Doubling, halving and near-doubles (MM-004)", multiply: "Multiplication and division (MM-005)", squares: "Squares and number patterns (MM-006)", fdp: "Fraction, decimal and percentage shortcuts (MM-007)" } as const;
    const lines = [
      "# MM-001: Mental-strategy catalogue",
      "",
      "<!-- Generated from src/maths/strategies.ts by src/maths/strategies.test.ts. Edit the catalogue, then run",
      "     UPDATE_DOCS=1 npx vitest run src/maths/strategies.test.ts -->",
      "",
      "| | |",
      "|---|---|",
      "| **Backlog item** | MM-001: research and validate a mental-strategy catalogue (R3) |",
      "| **Status** | READY FOR QA (D-032). Not accepted. |",
      "| **Acceptance criteria** | <ol><li>No strategy is taught without a mathematical justification and independently checked examples.</li><li>Claims about speed are not made without measured evidence.</li><li>Vedic techniques are included only where accurate, understandable and useful for the learner.</li></ol> |",
      `| **Size** | ${STRATEGIES.length} strategies in 5 families. |`,
      "",
      "## How each strategy is checked (AC1)",
      "",
      "- Every strategy states **why it works**, as a mathematical argument (the distributive law, associativity, place value, an algebraic identity), and **when not to use it**.",
      "- Every worked step is one operation (`left op right = value`). `src/maths/strategies.test.ts` recomputes **every step** of every hand-picked example, and of every input in a wide generated range that the strategy says it fits (more than 5,000 cases), with BigInt arithmetic, and checks the last step against an independent BigInt answer.",
      "- Each strategy refuses the inputs it is unsuitable for, and the tests check the boundaries (for example, the square-ending-in-5 method refuses 34).",
      "- Prerequisites are objective ids from the curriculum map (CUR-001); the tests reject any id that isn't in the map.",
      "",
      "## Speed (AC2)",
      "",
      "No strategy, lesson or screen claims that a method is faster. The tests reject the words *fast*, *quick*, *speed* and *seconds* in the catalogue. No speed has been measured, so none is claimed. The one-minute challenge (MM-011) reports a child's own accuracy and answers against their own previous runs only.",
      "",
      "## Vedic techniques (AC3)",
      "",
      `Accepted after evaluation in [MM-008](MM-008-vedic-evaluation.md): ${STRATEGIES.filter((x) => x.vedic).map((x) => `**${x.name}**`).join(" and ")}. Others were evaluated and left out.`,
      "",
    ];
    for (const fam of Object.keys(FAMILY) as (keyof typeof FAMILY)[]) {
      lines.push(`## ${FAMILY[fam]}`, "");
      for (const st of STRATEGIES.filter((x) => x.family === fam)) {
        const ex = st.examples[0];
        const p = { op: st.op, nums: ex };
        lines.push(
          `### ${st.name}${st.vedic ? " (Vedic, accepted in MM-008)" : ""}`,
          "",
          `- **When:** ${st.when}`,
          `- **Why it works:** ${st.why}`,
          `- **Not suitable:** ${st.unsuitable}`,
          `- **Prerequisites:** ${st.prerequisites.join(", ")}. **Years:** ${st.years[0] === st.years[1] ? st.years[0] : `${st.years[0]} to ${st.years[1]}`}.`,
          `- **Worked example:** ${problemText(p)}: ${st.steps(ex).map((x) => x.text).join("; ")}. Answer **${fmt(solve(p))}**.`,
          `- **Checked examples:** ${st.examples.map((e) => problemText({ op: st.op, nums: e })).join(", ")}.`,
          "",
        );
      }
    }
    const body = lines.join("\n");
    const file = join(process.cwd(), "docs/product/curriculum/MM-001-strategy-catalogue.md");
    if (process.env.UPDATE_DOCS) writeFileSync(file, body);
    expect(readFileSync(file, "utf8")).toBe(body);
  });
});
