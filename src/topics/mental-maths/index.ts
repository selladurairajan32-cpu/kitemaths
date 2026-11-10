import { fittingStrategies, fmt, problemText, solve, STRATEGIES, strategyById, type Family, type Problem, type Strategy } from "@/maths/strategies";
import { defineTopic, genFor, int, pick, withHints } from "@/topics/kit/define";
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
  /** D-033: an optional 11+ extension, outside the national curriculum. */
  crosswise: `${T}.crosswise-extension`,
} as const;
const S = MM_SKILLS;
const M = { early: `${T}.stopped-early`, wrongWay: `${T}.adjusted-wrong-way` };

/** Which island skill each strategy is taught in. */
const SKILL_OF: Record<string, string> = {
  "bridge-10": S.bonds, "partition-add": S.bonds, "compensate-add": S.bonds, "compensate-sub": S.bonds, "count-up": S.bonds,
  "near-double": S.doubling, "double-halve": S.doubling, "halve-twice": S.doubling,
  "times-5": S.special, "times-50": S.special, "times-25": S.special, "times-9": S.special, "times-99": S.special, "times-11": S.special,
  "partition-mult": S.factors, factorise: S.factors, "divide-by-factors": S.factors, "near-hundred": S.factors, crosswise: S.crosswise,
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
      if (s.id === "crosswise") return [int(r, 11, 99), int(r, 11, d === 2 ? 49 : 99)];
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

/** D-033 extension: the crosswise total on its own, the step that makes the method work. */
const crossTemplate: Template = {
  key: "mm-crosswise-cross",
  skill: S.crosswise,
  difficulties: [2, 3],
  make: (r) => {
    const x = int(r, 11, 99);
    const y = int(r, 11, 99);
    const [a, b, c, d] = [Math.floor(x / 10), x % 10, Math.floor(y / 10), y % 10];
    const cross = a * d + b * c;
    return {
      kind: "number",
      prompt: `In **${x} × ${y}**, what is the crosswise total, **${a} × ${d} + ${b} × ${c}**?`,
      answer: cross,
      traps: [{ value: a * c + b * d, feedback: "That's the vertical products. Crosswise pairs each tens digit with the other number's ones digit." }].filter((t) => t.value !== cross),
      hint: `Tens of one number times ones of the other, both ways: ${a} × ${d} and ${b} × ${c}.`,
      explanation: `${a} × ${d} = ${a * d} and ${b} × ${c} = ${b * c}, so the crosswise total is **${cross}**. It counts tens, so it is worth ${cross * 10}.`,
    };
  },
};

const baseTemplates: Template[] = [
  ...STRATEGIES.map(strategyTemplate),
  crossTemplate,
  squareRecall,
  chooseTemplate("bonds", "mm-choose-bonds"),
  chooseTemplate("multiply", "mm-choose-multiply"),
  chooseTemplate("doubling", "mm-choose-doubling"),
  chooseTemplate("fdp", "mm-choose-fdp"),
  /* D-037 (Phase B): a stretch question for every skill. */
  {
    key: "mm-bonds-stretch",
    skill: S.bonds,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const a = int(r, 2, 7) * 1000 - int(r, 1, 3);
      const b = int(r, 1201, 4899);
      const up = Math.ceil(a / 1000) * 1000;
      return {
        kind: "number",
        prompt: `Work it out in your head: **${fmt(a)} + ${fmt(b)}**.`,
        answer: a + b,
        traps: [{ value: up + b + (up - a), misconception: M.wrongWay, feedback: `${fmt(up)} is ${up - a} more than ${fmt(a)}, so take ${up - a} away at the end.` }, { value: up + b, misconception: M.early, feedback: "Don't forget to adjust." }],
        hint: `${fmt(a)} is nearly ${fmt(up)}. Add ${fmt(up)}, then adjust.`,
        explanation: `${fmt(up)} + ${fmt(b)} = ${fmt(up + b)}, then − ${up - a} = **${fmt(a + b)}**.`,
      };
    },
  },
  {
    key: "mm-doubling-stretch",
    skill: S.doubling,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const k = int(r, 3, 9);
      const a = 4 * k;
      return {
        kind: "number",
        prompt: `Use doubling and halving: **${a} × 25**.`,
        answer: a * 25,
        traps: [{ value: (a / 2) * 25, misconception: M.early, feedback: "Halve one number and double the other each time, until it's easy: keep going." }],
        hint: `Halve ${a} and double 25: ${a / 2} × 50. Do it again: ${a / 4} × 100.`,
        explanation: `${a} × 25 = ${a / 2} × 50 = ${k} × 100 = **${fmt(a * 25)}**.`,
      };
    },
  },
  {
    key: "mm-special-stretch",
    skill: S.special,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const a = int(r, 13, 89);
      return {
        kind: "number",
        prompt: `Work out **${a} × 999** in your head.`,
        answer: a * 999,
        traps: [{ value: a * 1000 + a, misconception: M.wrongWay, feedback: `999 is 1 less than 1,000, so take one ${a} away, don't add it.` }, { value: a * 1000, misconception: M.early, feedback: `Now take away one ${a}.` }],
        hint: `999 is 1,000 − 1. Work out ${a} × 1,000, then take away ${a}.`,
        explanation: `${a} × 1,000 = ${fmt(a * 1000)}; − ${a} = **${fmt(a * 999)}**.`,
      };
    },
  },
  {
    key: "mm-factors-stretch",
    skill: S.factors,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const [a, b] = pick(r, [[18, 35], [16, 45], [14, 25], [12, 75], [24, 15]]) as [number, number];
      return {
        kind: "number",
        prompt: `Use factors to work out **${a} × ${b}** in your head.`,
        answer: a * b,
        traps: [{ value: a * b + b, feedback: "Check your factor steps: multiply by each factor in turn." }],
        hint: `Split ${a} into factors so that one of them pairs nicely with ${b}.`,
        explanation: `${a} × ${b} = **${fmt(a * b)}**, for example ${a} × ${b} = ${a / 2} × ${b * 2}.`,
      };
    },
  },
  {
    key: "mm-squares-stretch",
    skill: S.squares,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const t = int(r, 3, 9);
      const n = 10 * t + 5;
      return {
        kind: "number",
        prompt: `Work out **${n}²** (${n} × ${n}) in your head.`,
        answer: n * n,
        traps: [{ value: t * t * 100 + 25, misconception: M.early, feedback: `Multiply ${t} by the next number up, ${t + 1}, not by itself.` }],
        hint: `For a number ending in 5: multiply the tens digit (${t}) by the next number (${t + 1}), then write 25 after it.`,
        explanation: `${t} × ${t + 1} = ${t * (t + 1)}, then 25: **${fmt(n * n)}**.`,
      };
    },
  },
  {
    key: "mm-fdp-stretch",
    skill: S.fdp,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const total = 20 * int(r, 6, 20);
      const pct = pick(r, [35, 45, 15, 65]);
      const answer = (total * pct) / 100;
      return {
        kind: "number",
        prompt: `Work out **${pct}% of ${total}** in your head.`,
        answer,
        traps: [{ value: total / 10, misconception: M.early, feedback: "That's only 10%. Build up the rest from 10% and 5%." }],
        hint: `Find 10% (${total / 10}) and 5% (${total / 20}), then build ${pct}%.`,
        explanation: `${pct}% = ${Math.floor(pct / 10)} × 10% + 5% = ${Math.floor(pct / 10) * (total / 10)} + ${total / 20} = **${answer}**.`,
      };
    },
  },
  {
    key: "mm-choose-stretch",
    skill: S.choose,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const a = int(r, 23, 87);
      const set = pick(r, [
        { q: `${a} × 99`, right: "Multiply by 100, then take one away: 99 is one less than 100", wrong: [["Doubling and halving: one number is even", "halving 99 doesn't make it easier."], ["Bridging through ten: one number is near a ten", "bridging is for adding and subtracting, not multiplying."]] },
        { q: `${a * 4} × 25`, right: "Doubling and halving: 4 × 25 makes 100", wrong: [["Round and adjust: 25 is near 20", "rounding 25 to 20 makes extra work."], ["Count on: the numbers are close together", "counting on is for subtracting nearby numbers."]] },
        { q: `${a} + 198`, right: "Round and adjust: 198 is two less than 200", wrong: [["Doubling: 198 is nearly double 100", "doubling doesn't help with adding these numbers."], ["Partition into factors: 198 is even", "factors help with multiplying, not adding."]] },
      ]);
      return {
        kind: "choose",
        prompt: `Which is the **quickest correct** way to work out **${set.q}** in your head?`,
        options: [{ text: set.right }, ...set.wrong.map(([t, why]) => ({ text: t!, feedback: `Not here: ${why}` }))],
        answer: 0,
        hint: "Look at the numbers first: is one near a hundred, or does one pair nicely to make 100?",
        explanation: `**${set.right}** is quickest and always right for ${set.q}.`,
      };
    },
  },
  {
    key: "mm-crosswise-stretch",
    skill: S.crosswise,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const a = int(r, 2, 9);
      const b = int(r, 1, 9);
      const c = int(r, 2, 9);
      const d = int(r, 1, 9);
      const x = 10 * a + b;
      const y = 10 * c + d;
      const cross = a * d + b * c;
      return {
        kind: "number",
        prompt: `Use vertically and crosswise: **${x} × ${y}**.`,
        answer: x * y,
        traps: [{ value: 100 * a * c + b * d, misconception: M.early, feedback: `Don't forget the crosswise step: ${a} × ${d} + ${b} × ${c} = ${cross} tens.` }],
        hint: `Vertically: ${a} × ${c} hundreds and ${b} × ${d} ones. Crosswise: ${a} × ${d} + ${b} × ${c} tens.`,
        explanation: `${a * c} hundreds + ${cross} tens + ${b * d} ones = **${fmt(x * y)}**.`,
      };
    },
  },
];

const templates = withHints(baseTemplates, {
  ...Object.fromEntries(STRATEGIES.map((st) => [`mm-${st.id}`, () => [st.why, "Do one step at a time and write down each answer, then check it makes sense."]])),
  "mm-crosswise-cross": () => ["The crosswise step multiplies tens by ones, twice, and adds them.", "Those two answers are tens."],
  "mm-square-recall": () => ["A square number is a number times itself.", "Use a times-table fact: 7² is 7 × 7."],
  "mm-choose-bonds": () => ["Is one number close to a ten or a hundred?", "If so, round it, add, then adjust."],
  "mm-choose-multiply": () => ["Is one number near 10, 100 or 1,000, or a 5 or a 25?", "Pick the method with the fewest easy steps."],
  "mm-choose-doubling": () => ["Can you halve one number and double the other to make it easier?", "Doubling and halving works well with 5, 25 and 50."],
  "mm-choose-fdp": () => ["10% is dividing by 10; 50% is halving; 25% is halving twice.", "Pick the shortcut that fits the percentage."],
  "mm-bonds-stretch": () => ["Round the number that is nearly a thousand.", "You added too much, so take the extra away."],
  "mm-doubling-stretch": () => ["Halve the first number and double 25.", "Keep going until you are multiplying by 100."],
  "mm-special-stretch": () => ["999 is one less than 1,000.", "Multiply by 1,000, then take one lot away."],
  "mm-factors-stretch": () => ["Look for a factor that makes 10 or 100 with the other number.", "Halve one number and double the other."],
  "mm-squares-stretch": () => ["Tens digit × the next number up.", "Then write 25 on the end."],
  "mm-fdp-stretch": () => ["Find 10% and 5% first.", "Add the pieces you need."],
  "mm-choose-stretch": () => ["Every option must give the right answer.", "Choose the one with the fewest, easiest steps."],
  "mm-crosswise-stretch": () => ["Work out the hundreds, the crosswise tens and the ones.", "Add them up, carrying if you need to."],
});

const s = (id: string) => strategyById(id)!;

/**
 * The parts every strategy lesson has (MM-002), built from one catalogue entry: when to use it, why it works, a
 * "watch me" example (its second example, D-037) and a "together" example (its first) whose last blank catches the
 * common slip of stopping one step early.
 */
function strategySteps(id: string, visual?: KitVisual) {
  const st = s(id);
  const ex = st.examples[0];
  const p: Problem = { op: st.op, nums: ex };
  const steps = st.steps(ex);
  const watchEx = st.examples[1] ?? ex;
  const watchP: Problem = { op: st.op, nums: watchEx };
  const early = (i: number) => (i > 0 && steps[i - 1]!.value !== steps[i]!.value ? [{ value: steps[i - 1]!.value, misconception: M.early, feedback: "That's the answer to the step before. Do the last step too." }] : []);
  return [
    { type: "explain" as const, title: `When to use it: ${st.name.toLowerCase()}`, body: [st.when], ...(visual ? { visual } : {}) },
    { type: "explain" as const, title: "Why it works", body: [st.why] },
    {
      type: "worked" as const,
      title: `Watch me: ${problemText(watchP)}`,
      support: "full" as const,
      problem: `**${problemText(watchP)}**`,
      steps: st.steps(watchEx).map((x) => ({ text: x.text })),
      conclusion: `${problemText(watchP)} = **${fmt(solve(watchP))}**.`,
    },
    {
      type: "worked" as const,
      title: "Let's do it together",
      support: "faded" as const,
      problem: `**${problemText(p)}**`,
      steps: steps.map((x, i) =>
        i === steps.length - 1 && steps.length > 1
          ? { text: x.text.replace(/= [\d,]+/, "= ?"), blank: { prompt: `What is ${x.text.split(" = ")[0]}?`, answer: x.value, hint: "Use the step before.", traps: early(i), worked: x.text } }
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
    { id: S.crosswise, title: "Vertically and crosswise (11+ extension)", description: "An optional 11+ extension: multiply two two-digit numbers in one line. Not in the national curriculum.", lessonId: "crosswise-extension" },
  ],
  lessonIcons: { "bridge-compensate": "plus", "double-halve": "dice", "special-multipliers": "times", "partition-factors": "puzzle", "square-patterns": "shapes", "percent-fraction": "percent", "choose-method": "bulb", "crosswise-extension": "puzzle" },
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
        ...strategySteps("factorise", { kind: "array", rows: 4, cols: 9 }),
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
        {
          type: "worked" as const,
          title: "Together: 15% of 80",
          support: "faded" as const,
          problem: "**15% of 80**",
          steps: [
            { text: "10% of 80 is **8**, and 5% is half of that: **4**." },
            { text: "15% is 10% + 5%.", blank: { prompt: "8 + 4 = ?", answer: 12, hint: "Add the 10% and the 5%.", traps: [{ value: 8, misconception: M.early, feedback: "That's only 10%. Add the 5% too." }], worked: "**12**." } },
          ],
          conclusion: "15% of 80 = **12**.",
        },
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
        { type: "explain" as const, title: "When to use it: look before you calculate", body: ["Before you start, look at the numbers. Is one near a ten or a hundred? Is one a 5, 9, 25 or 99? Do they split into easy factors?"], visual: { kind: "line" as const, min: 90, max: 100, step: 1, labelEvery: 5, points: [{ value: 99, label: "99", tone: "brand" as const }, { value: 100, label: "100", tone: "num" as const }] } },
        { type: "explain" as const, title: "Why it works", body: ["Every method here gives the same answer, because each one is a true rule about numbers. Choosing well just means fewer, easier steps."] },
        {
          type: "worked" as const,
          title: "Watch me: 46 × 99",
          support: "full" as const,
          problem: "**46 × 99**",
          steps: [{ text: "99 is one less than 100: a special multiplier." }, { text: "46 × 100 = 4,600, then take away one 46: **4,554**." }, { text: "Partitioning would also work, but it takes more steps." }],
          conclusion: "46 × 99 = **4,554**.",
        },
        {
          type: "worked" as const,
          title: "Let's do it together",
          support: "faded" as const,
          problem: "**199 + 245**",
          steps: [
            { text: "199 is near 200: round, then adjust. 200 + 245 = **445**." },
            { text: "You added 1 too many, so take 1 away.", blank: { prompt: "445 − 1 = ?", answer: 444, hint: "Adjust by the 1 you added.", traps: [{ value: 446, misconception: M.wrongWay, feedback: "You added 1 too many, so take 1 away, don't add another." }, { value: 445, misconception: M.early, feedback: "Don't stop yet: adjust for the extra 1." }], worked: "**444**." } },
          ],
          conclusion: "199 + 245 = **444**.",
        },
        { type: "check" as const, title: "Your turn", questionId: gen("mm-choose-multiply", 2, 1) },
        { type: "explain" as const, title: "When not to use it", body: ["A special method is only for the numbers it suits. If no shortcut fits, a standard written method is always a good choice."] },
        { type: "check" as const, title: "One more", questionId: gen("mm-choose-bonds", 3, 2) },
      ],
    },
    {
      id: "crosswise-extension",
      title: "Vertically and crosswise (11+ extension)",
      phase: "Master",
      summary: "Optional, for 11+ practice: two-digit times two-digit in one line. Not in the national curriculum.",
      minutes: 10,
      objectives: ["Multiply two two-digit numbers vertically and crosswise", "Explain why it is the grid method in one line"],
      steps: [
        { type: "explain" as const, title: "This lesson is optional", body: ["Vertically and crosswise is an extra for 11+ practice. It isn't in the national curriculum, and the grid method or long multiplication always works instead."] },
        ...strategySteps("crosswise", { kind: "bar", total: "23 × 41", parts: [{ label: "20 × 40 = 800", size: 8, tone: "brand" }, { label: "crosses: 20 + 120 = 140", size: 1.4, tone: "num" }, { label: "3 × 1 = 3", size: 0.4, tone: "ok" }] }),
        { type: "check" as const, title: "Your turn", questionId: gen("mm-crosswise", 2, 2) },
        { type: "explain" as const, title: "When not to use it", body: [s("crosswise").unsuitable] },
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
    { lessonId: "crosswise-extension", template: "mm-crosswise" },
  ],
});
