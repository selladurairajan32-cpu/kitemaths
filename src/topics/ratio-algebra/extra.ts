import { genFor, int, withAnswer, type TopicExtra } from "@/topics/kit/define";
import type { ChooseOption, Template } from "@/topics/kit/types";

/** D-038: pairs of numbers that satisfy an equation with two unknowns (Y6.ALG.4). */

const T = "ratio-algebra";
const gen = genFor(T);
const SKILL = `${T}.two-unknowns`;
const M = { coefficient: `${T}.ignores-coefficient` };

const templates: Template[] = [
  {
    key: "ra-pair-find",
    skill: SKILL,
    difficulties: [1, 2],
    make: (r, { difficulty }) => {
      const k = difficulty === 1 ? 1 : int(r, 2, 4);
      const a = int(r, 1, 6);
      const b = int(r, 1, 15);
      const n = k * a + b;
      const lhs = k === 1 ? "a + b" : `${k}a + b`;
      return {
        kind: "number",
        prompt: `**${lhs} = ${n}** and **a = ${a}**. What is **b**?`,
        answer: b,
        traps: [{ value: n + a * k, feedback: `Take ${k === 1 ? "a" : `${k}a`} away from ${n}, don't add it.` }, ...(k > 1 ? [{ value: n - a, misconception: M.coefficient, feedback: `${k}a means ${k} × a: ${k} × ${a} = ${k * a}.` }] : [])].filter((t) => t.value !== b),
        hint: k === 1 ? `Put a = ${a} in: ${a} + b = ${n}.` : `${k}a means ${k} × a = ${k} × ${a}.`,
        hints: [k === 1 ? `What adds to ${a} to make ${n}?` : `${k} × ${a} = ${k * a}, so ${k * a} + b = ${n}.`, `b = ${n} − ${k * a}.`],
        explanation: `${k === 1 ? "" : `${k} × ${a} = ${k * a}. `}${k * a} + b = ${n}, so b = ${n} − ${k * a} = **${b}**.`,
      };
    },
  },
  {
    key: "ra-pair-which",
    skill: SKILL,
    difficulties: [2],
    make: (r) => {
      const k = int(r, 2, 5);
      const a = int(r, 1, 5);
      const b = int(r, 1, 12);
      const n = k * a + b;
      const fits = (x: number, y: number) => k * x + y === n;
      const candidates: [number, number, string][] = [
        [a, n - a, `${a} + ${n - a} = ${n}, but ${k}a means ${k} × ${a}.`],
        [b, a, "Swapped round: check a first, then b."],
        [a + 1, b, `${k} × ${a + 1} + ${b} = ${k * (a + 1) + b}, not ${n}.`],
        [a, b + 1, `${k} × ${a} + ${b + 1} = ${n + 1}, not ${n}.`],
      ];
      const wrong: ChooseOption[] = candidates
        .filter(([x, y]) => !fits(x, y) && y >= 0)
        .filter((c, i, all) => all.findIndex((d) => d[0] === c[0] && d[1] === c[1]) === i)
        .slice(0, 3)
        .map(([x, y, why], i) => ({ text: `a = ${x}, b = ${y}`, ...(i === 0 ? { misconception: M.coefficient } : {}), feedback: why }));
      const { options, answer } = withAnswer(r, { text: `a = ${a}, b = ${b}` } as ChooseOption, wrong);
      return {
        kind: "choose",
        prompt: `Which pair of numbers fits **${k}a + b = ${n}**?`,
        options,
        answer,
        hint: "Put each pair into the equation and check.",
        hints: [`${k}a means ${k} × a.`, `For a = ${a}: ${k} × ${a} = ${k * a}, so b must be ${n} − ${k * a}.`],
        explanation: `${k} × ${a} + ${b} = ${k * a} + ${b} = ${n}, so **a = ${a}, b = ${b}** fits.`,
      };
    },
  },
  {
    key: "ra-pair-count",
    skill: SKILL,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const n = int(r, 9, 21);
      const count = Math.floor((n - 1) / 2);
      return {
        kind: "number",
        prompt: `**a** and **b** are whole numbers, both at least 1, and **2a + b = ${n}**. How many different pairs are there?`,
        answer: count,
        traps: [{ value: n - 1, misconception: M.coefficient, feedback: "That would be for a + b. Here a is doubled, so a can only go up to about half." }],
        hint: "Try a = 1, then a = 2, and so on. When does b stop being at least 1?",
        hints: [`a = 1 gives b = ${n - 2}; a = 2 gives b = ${n - 4}.`, `b must be at least 1, so 2a can be at most ${n - 1}: a goes up to ${count}.`],
        explanation: `a can be 1 to ${count} (2 × ${count} = ${2 * count}, leaving b = ${n - 2 * count}). That is **${count}** pairs.`,
      };
    },
  },
];

export const twoUnknowns: TopicExtra = {
  skills: [{ id: SKILL, title: "Two unknowns", description: "Find pairs of numbers that fit an equation like a + b = 10 or 2a + b = 12.", lessonId: "two-unknowns" }],
  lessonIcons: { "two-unknowns": "puzzle" },
  lessons: [
    {
      id: "two-unknowns",
      title: "Two unknowns",
      phase: "Explore",
      summary: "One equation, two letters, many answers: choose one, then find the other.",
      minutes: 8,
      objectives: ["Find b when you know a", "Find every whole-number pair that fits"],
      steps: [
        {
          type: "explain",
          title: "Many answers",
          body: [
            "**a + b = 10** has lots of answers: a = 1 and b = 9, a = 2 and b = 8, and so on. Choose a value for one letter, and the equation tells you the other. Listing them in order makes sure none are missed.",
            "In **2a + b = 12**, 2a means 2 × a. If a = 4, then 2 × 4 = 8, and 8 + b = 12, so b = 4. As a goes up by 1, b goes down by 2.",
          ],
          visual: { kind: "table", head: ["a", "b (a + b = 10)"], rows: [["1", "9"], ["2", "8"], ["3", "7"], ["4", "6"]] },
          tip: "Work through a = 1, 2, 3 … in order so you don't miss a pair.",
        },
        {
          type: "worked",
          title: "Watch me: 2a + b = 12",
          support: "full",
          problem: "**2a + b = 12** and **a = 4**. Find b.",
          steps: [{ text: "2a means 2 × 4 = 8." }, { text: "8 + b = 12, so b = 12 − 8 = 4." }],
          conclusion: "b = **4**.",
        },
        {
          type: "worked",
          title: "Let's do it together",
          support: "faded",
          problem: "**a + b = 10** and **a = 3**. Find b.",
          steps: [{ text: "3 + b = 10.", blank: { prompt: "b = ?", answer: 7, hint: "10 − 3.", traps: [{ value: 13, feedback: "Take 3 away from 10, don't add it." }], worked: "b = 10 − 3 = **7**." } }],
          conclusion: "b = **7**.",
        },
        { type: "check", title: "Your turn", questionId: gen("ra-pair-find", 1, 3) },
        { type: "check", title: "One more", questionId: gen("ra-pair-which", 2, 5) },
      ],
    },
  ],
  templates,
  misconceptions: [
    {
      id: M.coefficient,
      name: "2a read as a",
      possibleCause: "You might have used a instead of 2 × a.",
      description: "Ignores the number in front of a letter, treating 2a + b = 12 like a + b = 12.",
      explanation: ["A number next to a letter multiplies it: 2a = 2 × a.", "Work out 2a first, then find what is left for b."],
      skills: [SKILL],
      followUpTemplates: ["ra-pair-find", "ra-pair-which"],
    },
  ],
  placement: [{ lessonId: "two-unknowns", template: "ra-pair-find" }],
};
