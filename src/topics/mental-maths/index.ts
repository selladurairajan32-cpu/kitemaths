import { fittingStrategies, fmt, problemText, solve, STRATEGIES, strategyById, type Family, type Problem, type Strategy } from "@/maths/strategies";
import { defineTopic, genFor, int, pick } from "@/topics/kit/define";
import type { Difficulty, KitVisual, Rng, Template } from "@/topics/kit/types";

/**
 * Mental maths and strategy intelligence (R3: MM-002 to MM-007, MM-010). Every question and worked solution comes from
 * the checked strategy catalogue (src/maths/strategies.ts, MM-001), and every lesson follows the strategy template
 * (MM-002): when to use it, why it works, a guided attempt, an independent transfer question, and when not to use it.
 */

const T = "mental-maths";
const gen = genFor(T);
export const MM_SKILLS = {
  bonds: `${T}.bridge-compensate`,
  doubling: `${T}.double-halve`,
  special: `${T}.special-multipliers`,
  factors: `${T}.partition-factors`,
  squares: `${T}.squares`,
  fdp: `${T}.percent-fraction`,
  choose: `${T}.choose-method`,
} as const;
const S = MM_SKILLS;
const M = { early: `${T}.stopped-early`, wrongWay: `${T}.adjusted-wrong-way` };

/** Which island skill each strategy is taught in. */
const SKILL_OF: Record<string, string> = {
  "bridge-10": S.bonds, "partition-add": S.bonds, "compensate-add": S.bonds, "compensate-sub": S.bonds, "count-up": S.bonds,
  "near-double": S.doubling, "double-halve": S.doubling, "halve-twice": S.doubling,
  "times-5": S.special, "times-50": S.special, "times-25": S.special, "times-9": S.special, "times-99": S.special, "times-11": S.special,
  "partition-mult": S.factors, factorise: S.factors, "divide-by-factors": S.factors, "near-hundred": S.factors,
  "square-ending-5": S.squares, "next-square": S.squares,
  "ten-percent": S.fdp, "five-percent": S.fdp, "quarter-percent": S.fdp, "fraction-of": S.fdp,
};
export const skillOfStrategy = (id: string) => SKILL_OF[id];

/** Candidate inputs for a strategy at a difficulty; the first that fits is used, so every question suits its method. */
function candidate(s: Strategy, r: Rng, d: Difficulty): number[] {
  const big = d === 1 ? 1 : d === 2 ? 3 : 9;
  switch (s.op) {
    case "+":
      if (s.id === "near-double") {
        const a = int(r, 6, 20 * big + 10);
        return [a, a + 1];
      }
      if (s.id === "bridge-10") return [int(r, 11, 60 * big), int(r, 3, 9)];
      if (s.id === "compensate-add") return [int(r, 12, 90 * big), pick(r, [19, 29, 39, 49, 59, 98, 99, 198, 199].filter((x) => x < 60 * big + 50))];
      return [int(r, 11, 99), int(r, 11, 99)];
    case "−":
      if (s.id === "count-up") {
        const b = int(r, 101, 300 * big);
        return [b + int(r, 20, 150), b];
      }
      return [int(r, 60, 120 * big + 60), pick(r, [19, 29, 39, 48, 49, 98, 99].filter((x) => x < 60 * big + 40))];
    case "×": {
      const fixed: Record<string, number> = { "times-5": 5, "times-50": 50, "times-25": 25, "times-9": 9, "times-99": 99, "times-11": 11 };
      if (s.id in fixed) return [s.id === "times-25" ? 4 * int(r, 3, 6 * big + 3) : int(r, 12, 30 * big + 20), fixed[s.id]];
      if (s.id === "near-hundred") return [int(r, 90, 99), int(r, 90, 99)];
      if (s.id === "double-halve") return [2 * int(r, 2, 9 * big), pick(r, [5, 15, 25, 35, 45])];
      if (s.id === "factorise") return [int(r, 11, 25 * big), pick(r, [12, 15, 16, 18])];
      return [int(r, 11, 99), pick(r, [2, 3, 4, 6, 7, 8])];
    }
    case "÷":
      if (s.id === "halve-twice") return [4 * int(r, 3, 25 * big), 4];
      return ((b) => [b * int(r, 2, 12 * big), b])(pick(r, [12, 15, 16, 18, 24]));
    case "²":
      return s.id === "square-ending-5" ? [10 * int(r, 1, d === 1 ? 4 : 9) + 5] : [10 * int(r, 1, d === 1 ? 5 : 9) + 1];
    case "% of":
      if (s.id === "five-percent") return [5, 20 * int(r, 2, 15 * big)];
      if (s.id === "quarter-percent") return [pick(r, [25, 50]), 4 * int(r, 3, 25 * big)];
      return [10 * int(r, 1, d === 1 ? 1 : 9), 10 * int(r, 2, 30 * big)];
    case "fraction of": {
      const den = pick(r, d === 1 ? [2, 3, 4, 5] : [3, 4, 5, 6, 8, 10]);
      return [int(r, 1, den - 1), den, den * int(r, 2, 10 * big)];
    }
  }
}

/** Numbers a strategy suits, from a seeded generator (also used by the strategy activities, MM-009 to MM-011). */
export function fitFor(s: Strategy, r: Rng, d: Difficulty): number[] {
  for (let i = 0; i < 200; i++) {
    const nums = candidate(s, r, d);
    if (s.fits(nums)) return nums;
  }
  return s.examples[0];
}

const explain = (s: Strategy, p: Problem) => `${s.steps(p.nums).map((x) => x.text).join(". ")}. So ${problemText(p)} = **${fmt(solve(p))}**.`;

/** MM-003 to MM-007: work out a problem chosen to suit one strategy; the hint names it, the explanation shows its steps. */
function strategyTemplate(s: Strategy): Template {
  return {
    key: `mm-${s.id}`,
    skill: SKILL_OF[s.id],
    difficulties: s.years[1] - s.years[0] >= 2 ? [1, 2, 3] : [2, 3],
    make: (r, { difficulty }) => {
      const p: Problem = { op: s.op, nums: fitFor(s, r, difficulty) };
      const steps = s.steps(p.nums);
      const answer = solve(p);
      const first = steps[0].value;
      const wrongWay = s.id.startsWith("compensate") ? steps[0].value + (s.id === "compensate-add" ? 1 : -1) * steps[1].right : null;
      return {
        kind: "number",
        prompt: `Work out **${problemText(p)}** in your head.`,
        answer,
        traps: [
          ...(steps.length > 1 && first !== answer ? [{ value: first, misconception: M.early, feedback: `That's after the first step (${steps[0].text}). Keep going.` }] : []),
          ...(wrongWay !== null && wrongWay !== answer ? [{ value: wrongWay, misconception: M.wrongWay, feedback: s.id === "compensate-add" ? "You added too much, so take the extra away." : "You took away too much, so give the extra back." }] : []),
        ].filter((t, i, all) => all.findIndex((x) => x.value === t.value) === i),
        hint: `Try “${s.name}”. ${s.when}`,
        explanation: explain(s, p),
      };
    },
  };
}

/** Square numbers to 12², the facts the square patterns build on (MM-006). */
const squareRecall: Template = {
  key: "mm-square-recall",
  skill: S.squares,
  difficulties: [1, 2, 3],
  make: (r, { difficulty }) => {
    const n = int(r, 2, difficulty === 1 ? 6 : difficulty === 2 ? 9 : 12);
    return {
      kind: "number",
      prompt: `What is **${n}²**?`,
      answer: n * n,
      traps: [{ value: 2 * n, feedback: `${n}² means ${n} × ${n}, not ${n} × 2.` }].filter((t) => t.value !== n * n),
      hint: `${n}² means ${n} × ${n}.`,
      explanation: `${n}² = ${n} × ${n} = **${n * n}**.`,
    };
  },
};

/**
 * MM-010: choose the suitable strategy and its reason. The right option is the strategy the numbers were chosen for;
 * every other option is a method these numbers don't suit, with the catalogue's reason why.
 */
function chooseTemplate(family: Family, key: string): Template {
  const members = STRATEGIES.filter((s) => s.family === family);
  return {
    key,
    skill: S.choose,
    difficulties: [2, 3],
    make: (r, { difficulty }) => {
      // Re-pick until at least one method of the same kind does not suit the numbers, so there is a real choice.
      let s = pick(r, members);
      let p: Problem = { op: s.op, nums: fitFor(s, r, difficulty) };
      let wrong: Strategy[] = [];
      for (let tries = 0; tries < 30; tries++) {
        s = pick(r, members);
        p = { op: s.op, nums: fitFor(s, r, difficulty) };
        const fitting = new Set(fittingStrategies(p).map((x) => x.id));
        wrong = STRATEGIES.filter((o) => o.op === s.op && !fitting.has(o.id)).slice(0, 3);
        if (wrong.length > 0) break;
      }
      return {
        kind: "choose",
        prompt: `Which method suits **${problemText(p)}**, and why?`,
        options: [
          { text: `${s.name}: ${s.when.charAt(0).toLowerCase()}${s.when.slice(1)}` },
          ...wrong.map((o) => ({ text: `${o.name}: ${o.when.charAt(0).toLowerCase()}${o.when.slice(1)}`, feedback: `Not here: ${o.unsuitable}` })),
        ],
        answer: 0,
        hint: "Look at the numbers first: is one near a ten or a hundred, a 5, a 9, or easy to split?",
        explanation: `**${s.name}** suits ${problemText(p)}: ${s.why} ${explain(s, p)}`,
      };
    },
  };
}

const templates: Template[] = [
  ...STRATEGIES.map(strategyTemplate),
  squareRecall,
  chooseTemplate("bonds", "mm-choose-bonds"),
  chooseTemplate("multiply", "mm-choose-multiply"),
  chooseTemplate("doubling", "mm-choose-doubling"),
  chooseTemplate("fdp", "mm-choose-fdp"),
];

const s = (id: string) => strategyById(id)!;

/** The five parts every strategy lesson has (MM-002), built from one catalogue entry and its first example. */
function strategySteps(id: string, visual?: KitVisual) {
  const st = s(id);
  const ex = st.examples[0];
  const p: Problem = { op: st.op, nums: ex };
  const steps = st.steps(ex);
  return [
    { type: "explain" as const, title: `When to use it: ${st.name.toLowerCase()}`, body: [st.when], ...(visual ? { visual } : {}) },
    { type: "explain" as const, title: "Why it works", body: [st.why] },
    {
      type: "worked" as const,
      title: "Let's do it together",
      support: "faded" as const,
      problem: `**${problemText(p)}**`,
      steps: steps.map((x, i) =>
        i === steps.length - 1 && steps.length > 1
          ? { text: x.text.replace(/= [\d,]+/, "= ?"), blank: { prompt: `What is ${x.text.split(" = ")[0]}?`, answer: x.value, hint: "Use the step before.", worked: x.text } }
          : { text: x.text },
      ),
      conclusion: `${problemText(p)} = **${fmt(solve(p))}**.`,
    },
  ];
}

export const mentalMaths = defineTopic({
  id: T,
  title: "Mental maths",
  subtitle: "Bridge, compensate, double and halve, special multipliers, squares and percentage shortcuts, and choosing the right method",
  world: "calc",
  years: [3, 4, 5, 6],
  order: 4,
  icon: "bulb",
  skills: [
    { id: S.bonds, title: "Bridge and compensate", description: "Add and subtract in your head by bridging through tens, rounding and adjusting, and counting up.", lessonId: "bridge-compensate" },
    { id: S.doubling, title: "Double and halve", description: "Use near doubles, double one number and halve the other, and halve twice to divide by 4.", lessonId: "double-halve" },
    { id: S.special, title: "Times 5, 9, 11, 25, 50 and 99", description: "Multiply by these numbers using 10 and 100.", lessonId: "special-multipliers" },
    { id: S.factors, title: "Partition and factorise", description: "Split a number into parts or factors to multiply and divide, and multiply near 100.", lessonId: "partition-factors" },
    { id: S.squares, title: "Square patterns", description: "Know squares to 12², square numbers ending in 5, and step from one square to the next.", lessonId: "square-patterns" },
    { id: S.fdp, title: "Percent and fraction shortcuts", description: "Find 10%, 5%, 25% and 50% of an amount, and a fraction of an amount.", lessonId: "percent-fraction" },
    { id: S.choose, title: "Choosing a method", description: "Pick the method that suits the numbers, and say why.", lessonId: "choose-method" },
  ],
  lessonIcons: { "bridge-compensate": "plus", "double-halve": "dice", "special-multipliers": "times", "partition-factors": "puzzle", "square-patterns": "shapes", "percent-fraction": "percent", "choose-method": "bulb" },
  lessons: [
    {
      id: "bridge-compensate",
      title: "Bridge and compensate",
      phase: "Understand",
      summary: "Jump to the next ten, or round and adjust.",
      minutes: 8,
      objectives: ["Bridge through 10 and 100", "Round a number near a ten, then adjust"],
      steps: [
        ...strategySteps("bridge-10", { kind: "line", min: 40, max: 60, step: 1, labelEvery: 5, jumps: [{ from: 47, to: 50, label: "+3" }, { from: 50, to: 55, label: "+5" }] }),
        ...strategySteps("compensate-add").slice(0, 2),
        { type: "check" as const, title: "Your turn", questionId: gen("mm-compensate-add", 2, 3) },
        { type: "explain" as const, title: "When not to use it", body: [s("bridge-10").unsuitable, s("compensate-add").unsuitable] },
        { type: "check" as const, title: "One more", questionId: gen("mm-count-up", 2, 1) },
      ],
    },
    {
      id: "double-halve",
      title: "Double and halve",
      phase: "Visualise",
      summary: "Near doubles, and why doubling one number while halving the other keeps the answer.",
      minutes: 8,
      objectives: ["Use near doubles", "Explain why doubling one factor and halving the other keeps the product"],
      steps: [
        ...strategySteps("double-halve", { kind: "array", rows: 2, cols: 6 }),
        { type: "explain" as const, title: "The same idea for dividing and fractions", body: ["Dividing by 4 is halving twice: 64 ÷ 4 = 32 ÷ 2 = **16**.", "A quarter is half of a half: ¼ of 64 = half of 32 = **16**."] },
        { type: "check" as const, title: "Your turn", questionId: gen("mm-double-halve", 2, 2) },
        { type: "explain" as const, title: "When not to use it", body: [s("double-halve").unsuitable, s("near-double").unsuitable] },
        { type: "check" as const, title: "One more", questionId: gen("mm-halve-twice", 2, 5) },
      ],
    },
    {
      id: "special-multipliers",
      title: "Times 5, 9, 11, 25, 50 and 99",
      phase: "Explore",
      summary: "Use 10 and 100 to multiply by numbers next to them.",
      minutes: 9,
      objectives: ["Multiply by 5, 25 and 50 using 10 and 100", "Multiply by 9, 11 and 99 by adjusting one lot"],
      steps: [
        ...strategySteps("times-99", { kind: "bar", total: "37 × 99", parts: [{ label: "37 × 100 = 3,700", size: 10, tone: "brand" }, { label: "− 37", size: 1, tone: "num" }] }),
        { type: "explain" as const, title: "The same idea with 10", body: [s("times-9").why, s("times-5").why] },
        { type: "check" as const, title: "Your turn", questionId: gen("mm-times-9", 2, 4) },
        { type: "explain" as const, title: "When not to use it", body: [s("times-9").unsuitable, s("times-25").unsuitable] },
        { type: "check" as const, title: "One more", questionId: gen("mm-times-25", 2, 2) },
      ],
    },
    {
      id: "partition-factors",
      title: "Partition and factorise",
      phase: "Explore",
      summary: "Split numbers into parts or factors, and multiply numbers just below 100.",
      minutes: 9,
      objectives: ["Multiply by partitioning", "Multiply and divide using factors"],
      steps: [
        ...strategySteps("factorise"),
        { type: "explain" as const, title: "Dividing works the same way", body: [s("divide-by-factors").why] },
        { type: "check" as const, title: "Your turn", questionId: gen("mm-divide-by-factors", 2, 3) },
        { type: "explain" as const, title: "When not to use it", body: [s("factorise").unsuitable, s("near-hundred").unsuitable] },
        { type: "check" as const, title: "One more", questionId: gen("mm-partition-mult", 2, 6) },
      ],
    },
    {
      id: "square-patterns",
      title: "Square patterns",
      phase: "Explain",
      summary: "Square numbers, numbers ending in 5, and one square to the next.",
      minutes: 8,
      objectives: ["Know square numbers to 12²", "Square numbers ending in 5, and only those"],
      steps: [
        ...strategySteps("square-ending-5", { kind: "array", rows: 5, cols: 5 }),
        { type: "explain" as const, title: "From one square to the next", body: [s("next-square").why, "So 21² = 400 + 20 + 21 = **441**."] },
        { type: "check" as const, title: "Your turn", questionId: gen("mm-square-ending-5", 2, 4) },
        { type: "explain" as const, title: "When not to use it", body: [s("square-ending-5").unsuitable, "34² is not 3 × 4 then 25: the trick needs a 5 at the end."] },
        { type: "check" as const, title: "One more", questionId: gen("mm-next-square", 2, 1) },
      ],
    },
    {
      id: "percent-fraction",
      title: "Percent and fraction shortcuts",
      phase: "Apply",
      summary: "10% is a tenth, 5% is half of that, 25% is a quarter, and fractions of amounts.",
      minutes: 9,
      objectives: ["Find 10%, 5%, 25% and 50% of an amount", "Find a fraction of an amount"],
      steps: [
        ...strategySteps("ten-percent", { kind: "bar", total: "120", parts: Array.from({ length: 10 }, (_, i) => ({ label: i === 0 ? "10% = 12" : "12", size: 1, tone: i === 0 ? ("brand" as const) : ("plain" as const) })) }),
        { type: "explain" as const, title: "Other percentages and fractions", body: [s("five-percent").why, s("quarter-percent").why, s("fraction-of").why] },
        { type: "check" as const, title: "Your turn", questionId: gen("mm-fraction-of", 2, 2) },
        { type: "explain" as const, title: "When not to use it", body: [s("ten-percent").unsuitable, s("fraction-of").unsuitable] },
        { type: "check" as const, title: "One more", questionId: gen("mm-five-percent", 2, 3) },
      ],
    },
    {
      id: "choose-method",
      title: "Choose your method",
      phase: "Explain",
      summary: "Look at the numbers, then pick the method that suits them, and say why.",
      minutes: 7,
      objectives: ["Choose a method that suits the numbers", "Give a reason for the choice"],
      steps: [
        { type: "explain" as const, title: "When to use it: look before you calculate", body: ["Before you start, look at the numbers. Is one near a ten or a hundred? Is one a 5, 9, 25 or 99? Do they split into easy factors?"] },
        { type: "explain" as const, title: "Why it works", body: ["Every method here gives the same answer, because each one is a true rule about numbers. Choosing well just means fewer, easier steps."] },
        { type: "explain" as const, title: "Let's do it together", body: ["**46 × 99**: 99 is one less than 100, so 46 × 100 = 4,600, take away 46: **4,554**.", "Partitioning would also work, but takes more steps."] },
        { type: "check" as const, title: "Your turn", questionId: gen("mm-choose-multiply", 2, 1) },
        { type: "explain" as const, title: "When not to use it", body: ["A special method is only for the numbers it suits. If no shortcut fits, a standard written method is always a good choice."] },
        { type: "check" as const, title: "One more", questionId: gen("mm-choose-bonds", 3, 2) },
      ],
    },
  ],
  templates,
  misconceptions: [
    { id: M.early, name: "Stopping after the first step", possibleCause: "It looks like the method was started but not finished.", description: "Gives 4,600 for 46 × 99.", explanation: ["Each method has every step for a reason.", "After rounding or multiplying by 100, there is always an adjusting step."], skills: [S.bonds, S.special, S.factors, S.fdp, S.doubling, S.squares], followUpTemplates: ["mm-times-99", "mm-compensate-add"] },
    { id: M.wrongWay, name: "Adjusting the wrong way", possibleCause: "It looks like the extra was added on instead of taken off, or the other way round.", description: "Says 46 + 39 = 87.", explanation: ["If you rounded up, you added too much: take the extra away.", "If you took away too much, give the extra back."], skills: [S.bonds], followUpTemplates: ["mm-compensate-add", "mm-compensate-sub"] },
  ],
  placement: [
    { lessonId: "bridge-compensate", template: "mm-bridge-10" },
    { lessonId: "double-halve", template: "mm-double-halve" },
    { lessonId: "special-multipliers", template: "mm-times-5" },
    { lessonId: "partition-factors", template: "mm-partition-mult" },
    { lessonId: "square-patterns", template: "mm-square-recall" },
    { lessonId: "percent-fraction", template: "mm-ten-percent" },
    { lessonId: "choose-method", template: "mm-choose-multiply" },
  ],
});
