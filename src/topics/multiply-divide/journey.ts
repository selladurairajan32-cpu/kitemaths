import { int, pick, withAnswer, type TopicExtra } from "@/topics/kit/define";
import type { ChooseOption, Template } from "@/topics/kit/types";

/**
 * D-050: question makers for the "remainders in real life" topic journey (`multiply-divide.division`). The remainder
 * means something different in each story: round **up** when the leftovers still need a place (minibuses, boxes),
 * round **down** when only full groups count (packs made, things bought), or the remainder **is** the answer (left over).
 */

const T = "multiply-divide";
export const DIVISION = `${T}.division`;
/** Defined in `index.ts`: a remainder that is too big, or ignored. */
const REM = `${T}.remainder`;

type Kind = "up" | "down" | "left";
/** A story for n ÷ d where the answer is q + 1 (up), q (down) or the remainder (left). */
function story(r: () => number, kind: Kind, n: number, d: number): string {
  if (kind === "up")
    return pick(r, [
      `**${n} children** are going on a trip. Each minibus holds **${d}** children. How many minibuses are needed so that everyone can go?`,
      `A baker has **${n} cupcakes** to pack in boxes of **${d}**. How many boxes are needed for all the cupcakes?`,
    ]);
  if (kind === "down")
    return pick(r, [
      `Pencils come in packs of **${d}**. Mr Shah has **${n} pencils**. How many **full packs** can he make?`,
      `A comic costs **£${d}**. Ella has **£${n}**. How many comics can she buy?`,
    ]);
  return `**${n} stickers** are shared equally between **${d}** friends. Each friend gets as many as possible. How many stickers are **left over**?`;
}

const templates: Template[] = [
  {
    key: "md-rem-apply",
    skill: DIVISION,
    difficulties: [2, 3],
    make: (r, { difficulty }) => {
      const kind = pick<Kind>(r, ["up", "down", "left"]);
      const d = int(r, difficulty === 2 ? 4 : 6, difficulty === 2 ? 9 : 15);
      const q = int(r, 3, difficulty === 2 ? 9 : 14);
      const rem = int(r, 1, d - 1);
      const n = q * d + rem;
      const answer = kind === "up" ? q + 1 : kind === "down" ? q : rem;
      const traps =
        kind === "up"
          ? [{ value: q, misconception: REM, feedback: `${q} would leave ${rem} without a place. They need one more.` }]
          : kind === "down"
            ? [{ value: q + 1, misconception: REM, feedback: `There aren't enough for ${q + 1}: the last ${rem} don't make a full one.` }]
            : [{ value: q, feedback: `${q} is how many each friend gets. The question asks how many are left over.` }];
      return {
        kind: "number" as const,
        prompt: story(r, kind, n, d),
        answer,
        traps: traps.filter((t) => t.value !== answer),
        hint: `Work out ${n} ÷ ${d}. Then ask: what does the remainder mean here?`,
        hints: [`${n} ÷ ${d} = ${q} r ${rem}.`, kind === "up" ? "The leftovers still need a place: round up." : kind === "down" ? "Only full ones count: round down." : "The remainder is the answer."],
        explanation: `${n} ÷ ${d} = ${q} r ${rem}. ${kind === "up" ? `${q} are full and the last ${rem} need one more: **${q + 1}**.` : kind === "down" ? `Only ${q} are full; ${rem} aren't enough for another: **${q}**.` : `Each friend gets ${q}, and **${rem}** are left over.`}`,
      };
    },
  },
  {
    key: "md-rem-why",
    skill: DIVISION,
    difficulties: [2],
    make: (r) => {
      const d = pick(r, [8, 10, 12, 15]);
      const q = int(r, 3, 6);
      const rem = int(r, 1, d - 1);
      const n = q * d + rem;
      const who = pick(r, ["Kai", "Nina", "Theo", "Aisha"]);
      const correct: ChooseOption = { text: `The ${rem} children left over need a seat too, so they need ${q + 1} minibuses.` };
      const { options, answer } = withAnswer(r, correct, [
        { text: `They are right: ${n} ÷ ${d} = ${q} r ${rem}, so ${q} minibuses.`, misconception: REM, feedback: `${q} minibuses seat ${q * d}. The other ${rem} children would be left behind.` },
        { text: `They need ${q + rem} minibuses: one for each child left over.`, feedback: `The ${rem} children can all share one more minibus.` },
        { text: "You can't divide when there is a remainder.", feedback: `You can: ${n} ÷ ${d} = ${q} r ${rem}. Then think about what the remainder means.` },
      ]);
      return {
        kind: "choose" as const,
        prompt: `**${n} children** go on a trip in minibuses that hold **${d}**. ${who} says they need **${q} minibuses**, because ${n} ÷ ${d} = ${q} r ${rem}. Why is ${who} wrong?`,
        options,
        answer,
        hint: "What happens to the children in the remainder?",
        hints: [`${q} minibuses seat ${q} × ${d} = ${q * d}. Is that everyone?`],
        explanation: `${n} ÷ ${d} = ${q} r ${rem}. ${q} full minibuses seat ${q * d}, and the last ${rem} children need one more: **${q + 1}** minibuses.`,
      };
    },
  },
];

export const remainderJourneyExtra: TopicExtra = { skills: [], lessons: [], lessonIcons: {}, templates, misconceptions: [], placement: [] };
