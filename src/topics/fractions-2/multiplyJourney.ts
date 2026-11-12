import { multiply, type Fraction } from "@/maths/fraction";
import { pick, withAnswer, type TopicExtra } from "@/topics/kit/define";
import type { ChooseOption, Template } from "@/topics/kit/types";
import { timesQuestion } from "./extra";

/**
 * D-050: question makers for the "multiplying fractions" topic journey (`fractions-2.multiply-fractions`): fractions of
 * fractions in real life, and a reasoning question on the belief that multiplying always makes a number bigger.
 */

const T = "fractions-2";
export const TIMES = `${T}.multiply-fractions`;
/** New: believing that multiplying always makes the answer bigger. */
export const TIMES_BIGGER = `${T}.times-makes-bigger`;
const f = (x: Fraction) => `{${x.n}/${x.d}}`;

/** Pairs a × b of proper fractions whose product needs no simplifying beyond what the kit's options handle. */
const PAIRS: [Fraction, Fraction][] = [
  [{ n: 1, d: 2 }, { n: 1, d: 3 }],
  [{ n: 1, d: 2 }, { n: 3, d: 4 }],
  [{ n: 2, d: 3 }, { n: 1, d: 4 }],
  [{ n: 1, d: 3 }, { n: 3, d: 5 }],
  [{ n: 3, d: 4 }, { n: 2, d: 5 }],
  [{ n: 1, d: 4 }, { n: 2, d: 3 }],
];

const templates: Template[] = [
  {
    key: "f2-ff-apply",
    skill: TIMES,
    difficulties: [2, 3],
    make: (r, { difficulty }) => {
      const [a, b] = pick(r, difficulty === 3 ? PAIRS.slice(3) : PAIRS.slice(0, 3));
      const [who, thing] = pick(r, [["Sam", "chocolate bar"], ["Priya", "pizza"], ["Jack", "cake"]]);
      const prompt = pick(r, [
        `**${f(b)}** of a ${thing} is left. ${who} eats **${f(a)}** of what is left. What fraction of the **whole** ${thing} does ${who} eat?`,
        `A garden is **${f(b)}** grass. **${f(a)}** of the grass has daisies on it. What fraction of the **whole** garden has daisies?`,
      ]);
      return { ...timesQuestion(r, a, b, prompt), hint: `"${f(a)} of" means × ${f(a)}. Work out ${f(a)} × ${f(b)}.` };
    },
  },
  {
    key: "f2-ff-why",
    skill: TIMES,
    difficulties: [2],
    make: (r) => {
      const [a, b] = pick(r, PAIRS);
      const right = multiply(a, b);
      const who = pick(r, ["Zoe", "Ali", "Grace", "Finn"]);
      const correct: ChooseOption = { text: `× ${f(a)} means ${f(a)} of it, which is less than all of it. So the answer is smaller: ${f(right)}.` };
      const { options, answer } = withAnswer(r, correct, [
        { text: "They are right: multiplying always makes a number bigger.", misconception: TIMES_BIGGER, feedback: `That's true for whole numbers bigger than 1. Multiplying by ${f(a)} takes ${f(a)} of it, which is less.` },
        { text: `Add the fractions instead: ${f(a)} + ${f(b)}.`, feedback: "Adding is a different question. Here we want a fraction of a fraction." },
        { text: "Multiplying fractions gives the same as the bigger fraction.", feedback: `Check: ${f(a)} × ${f(b)} = ${f(right)}, which is less than both.` },
      ]);
      return {
        kind: "choose" as const,
        prompt: `${who} says **${f(a)} × ${f(b)} must be bigger than ${f(b)}**, because multiplying makes things bigger. Why is ${who} wrong?`,
        options,
        answer,
        hint: `What does "× ${f(a)}" mean? Think "${f(a)} of".`,
        hints: [`${f(a)} of ${f(b)}: is that more or less than ${f(b)}?`],
        explanation: `× ${f(a)} means ${f(a)} of it. ${f(a)} × ${f(b)} = **${f(right)}**, which is less than ${f(b)}.`,
      };
    },
  },
];

export const multiplyJourneyExtra: TopicExtra = {
  skills: [],
  lessons: [],
  lessonIcons: {},
  templates,
  misconceptions: [
    {
      id: TIMES_BIGGER,
      name: "Multiplying always makes it bigger",
      possibleCause: "You might be thinking that multiplying always makes an answer bigger.",
      description: "Expects a product of fractions to be bigger than the fractions, as with whole numbers.",
      explanation: ["Multiplying by a fraction less than 1 takes a part of the number.", "So {1/2} × {1/3} is half of a third: {1/6}, which is smaller."],
      skills: [TIMES],
      followUpTemplates: ["f2-frac-of-frac"],
    },
  ],
  placement: [],
};
