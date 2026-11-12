import { pick, withAnswer, type TopicExtra } from "@/topics/kit/define";
import type { ChooseOption, Template } from "@/topics/kit/types";

/**
 * D-050: a reasoning question for the "percentages of amounts" topic journey (`percentages.of-amounts`): why dividing
 * by the percentage is wrong. Percentages are 5, 10, 20, 25 or 50, so every amount and every wrong answer is exact.
 */

const T = "percentages";
export const AMOUNTS = `${T}.of-amounts`;
/** Defined in `index.ts`: dividing the amount by the percentage. */
const DIVIDE = `${T}.divide-by-percent`;

/** A number of hundredths as a decimal: 320 → "3.2", 1200 → "12". */
const hundredths = (h: number) => {
  const w = Math.floor(h / 100);
  const rest = h % 100;
  return rest === 0 ? String(w) : rest % 10 === 0 ? `${w}.${rest / 10}` : `${w}.${String(rest).padStart(2, "0")}`;
};

/** How to find p% simply: from 10%, or as a fraction. */
const ROUTE: Record<number, (a: number) => string> = {
  5: (a) => `10% of ${a} is ${a / 10}, and 5% is half of that: ${a / 20}`,
  10: (a) => `10% means 10 out of every 100, so divide by 10: ${a / 10}`,
  20: (a) => `10% of ${a} is ${a / 10}, so 20% is double: ${a / 5}`,
  25: (a) => `25% is a quarter, so divide by 4: ${a / 4}`,
  50: (a) => `50% is a half, so divide by 2: ${a / 2}`,
};

const templates: Template[] = [
  {
    key: "pc-amount-why",
    skill: AMOUNTS,
    difficulties: [2],
    make: (r) => {
      const p = pick(r, [5, 10, 20, 25, 50]);
      const amount = pick(r, [40, 60, 80, 120, 160, 200]);
      const right = (p * amount) / 100;
      const wrongText = hundredths((amount * 100) / p);
      const who = pick(r, ["Leo", "Isla", "Max", "Ruby"]);
      const correct: ChooseOption = { text: `${p}% means ${p} out of every 100, not "divide by ${p}". ${ROUTE[p]!(amount)}.` };
      const { options, answer } = withAnswer(r, correct, [
        { text: `They are right: to find ${p}%, divide by ${p}.`, misconception: DIVIDE, feedback: `Dividing by ${p} gives ${wrongText}, which is far too small. ${p}% is ${p} out of every 100.` },
        { text: `They should multiply: ${amount} × ${p}.`, feedback: `${amount} × ${p} = ${amount * p}, which is more than the whole ${amount}. A percentage under 100 is less than the whole.` },
        { text: `They should take ${p} away from ${amount}.`, feedback: `${amount} − ${p} = ${amount - p}. Percent means out of every 100, not take away.` },
      ]);
      return {
        kind: "choose" as const,
        prompt: `${who} says **${p}% of ${amount} = ${amount} ÷ ${p} = ${wrongText}**. Why is ${who} wrong?`,
        options,
        answer,
        hint: "What does per cent mean?",
        hints: ["Start with 10%: divide by 10."],
        explanation: `${ROUTE[p]!(amount)}. So ${p}% of ${amount} is **${right}**, not ${wrongText}.`,
      };
    },
  },
];

export const amountsJourneyExtra: TopicExtra = { skills: [], lessons: [], lessonIcons: {}, templates, misconceptions: [], placement: [] };
