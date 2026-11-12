import { int, pick, withAnswer, type TopicExtra } from "@/topics/kit/define";
import type { ChooseOption, Template } from "@/topics/kit/types";

/**
 * D-050: question makers for the "comparing decimals" topic journey (`decimals.compare-round`): a reasoning question
 * ("why is this wrong?") on the "longer is bigger" mistake, and comparisons in real life. Amounts are whole numbers of
 * hundredths, written out here, so no decimal is ever made by floating-point arithmetic.
 */

const T = "decimals";
export const COMPARE = `${T}.compare-round`;
/** Defined in `index.ts`: thinking the decimal with more digits is bigger. */
const LONGER = `${T}.longer-is-bigger`;

/** 35 → "0.35", 40 → "0.4", 240 → "2.4", 205 → "2.05": hundredths as a decimal, without a trailing zero. */
export function fromHundredths(h: number): string {
  const whole = Math.floor(h / 100);
  const rest = h % 100;
  if (rest === 0) return String(whole);
  return rest % 10 === 0 ? `${whole}.${rest / 10}` : `${whole}.${String(rest).padStart(2, "0")}`;
}

/** 40 → "0.40", 1240 → "12.40": hundredths with exactly two places, for comparing. */
export const twoPlaces = (h: number) => `${Math.floor(h / 100)}.${String(h % 100).padStart(2, "0")}`;

/** A pair where the shorter decimal is bigger: t tenths against a two-place decimal below it (0.4 and 0.35). */
export function trapPair(r: () => number, whole: number) {
  const t = int(r, 2, 9);
  const short = whole * 100 + t * 10;
  const long = whole * 100 + int(r, 1, t - 1) * 10 + int(r, 1, 9);
  return { short, long };
}

const templates: Template[] = [
  {
    key: "dc-compare-why",
    skill: COMPARE,
    difficulties: [2],
    make: (r) => {
      const { short, long } = trapPair(r, 0);
      const s = fromHundredths(short);
      const l = fromHundredths(long);
      const who = pick(r, ["Mia", "Josh", "Ava", "Omar"]);
      const correct: ChooseOption = { text: `${s} is the same as ${twoPlaces(short)}, and ${short} hundredths is more than ${long} hundredths.` };
      const { options, answer } = withAnswer(r, correct, [
        { text: "They are right: the number with more digits is bigger.", misconception: LONGER, feedback: `More digits doesn't mean bigger. Write both with two places: ${twoPlaces(short)} and ${l}.` },
        { text: `${l} and ${s} are the same size.`, feedback: `Compare the tenths first: ${s} has ${short / 10} tenths and ${l} has ${Math.floor(long / 10)}.` },
        { text: "You can't compare decimals that have a different number of digits.", feedback: `You can: write them with the same number of places, ${twoPlaces(short)} and ${l}.` },
      ]);
      return {
        kind: "choose" as const,
        prompt: `${who} says **${l} is bigger than ${s}**, because ${long} is bigger than ${short / 10}. Why is ${who} wrong?`,
        options,
        answer,
        hint: "Compare the tenths first.",
        hints: [`Write ${s} with two places: ${twoPlaces(short)}.`],
        explanation: `${s} = ${twoPlaces(short)}, which is ${short} hundredths. ${l} is ${long} hundredths. So **${s} is bigger**.`,
      };
    },
  },
  {
    key: "dc-compare-apply",
    skill: COMPARE,
    difficulties: [2, 3],
    make: (r, { difficulty }) => {
      if (difficulty === 3) {
        // Three race times; the fastest is the smallest. The shortest-looking time is not the fastest.
        const { short, long } = trapPair(r, int(r, 10, 14));
        const third = short + int(r, 1, 9);
        const runners = [
          { name: "Kai", t: short },
          { name: "Lily", t: long },
          { name: "Noah", t: third },
        ];
        for (let i = runners.length - 1; i > 0; i--) {
          const j = Math.floor(r() * (i + 1));
          [runners[i], runners[j]] = [runners[j]!, runners[i]!];
        }
        const fastest = runners.find((x) => x.t === long)!.name;
        const { options, answer } = withAnswer(
          r,
          { text: fastest } as ChooseOption,
          runners.filter((x) => x.t !== long).map((x) => ({ text: x.name, ...(x.t === short ? { misconception: LONGER } : {}), feedback: `${fromHundredths(x.t)} is ${twoPlaces(x.t)}: more than ${fromHundredths(long)}.` })),
        );
        return {
          kind: "choose" as const,
          prompt: `Race times in seconds: ${runners.map((x) => `${x.name} **${fromHundredths(x.t)}**`).join(", ")}. Who was **fastest**?`,
          options,
          answer,
          hint: "The fastest runner has the smallest time. Write every time with two decimal places.",
          hints: [`For example, ${fromHundredths(short)} is ${twoPlaces(short)}.`, "Compare the whole seconds, then the tenths, then the hundredths."],
          explanation: `With two places: ${runners.map((x) => `${x.name} ${twoPlaces(x.t)}`).join(", ")}. The smallest time is **${fastest}**'s.`,
        };
      }
      const { short, long } = trapPair(r, int(r, 1, 3));
      const [a, b] = pick(r, [["Amy", "Ben"], ["Zara", "Tom"], ["Ella", "Sam"]]);
      const shortFirst = r() < 0.5;
      const [first, second] = shortFirst ? [short, long] : [long, short];
      const winner = shortFirst ? a : b;
      const loser = shortFirst ? b : a;
      const { options, answer } = withAnswer(r, { text: winner } as ChooseOption, [{ text: loser, misconception: LONGER, feedback: `${fromHundredths(long)} has more digits, but ${fromHundredths(short)} = ${twoPlaces(short)}, which is bigger.` }]);
      return {
        kind: "choose" as const,
        prompt: `In the long jump, ${a} jumped **${fromHundredths(first)} m** and ${b} jumped **${fromHundredths(second)} m**. Who jumped **further**?`,
        options,
        answer,
        hint: "Compare the whole metres, then the tenths.",
        hints: [`Write both with two places: ${twoPlaces(first)} and ${twoPlaces(second)}.`],
        explanation: `${fromHundredths(short)} m = ${twoPlaces(short)} m, which is more than ${fromHundredths(long)} m, so **${winner}** jumped further.`,
      };
    },
  },
];

export const compareJourneyExtra: TopicExtra = { skills: [], lessons: [], lessonIcons: {}, templates, misconceptions: [], placement: [] };
