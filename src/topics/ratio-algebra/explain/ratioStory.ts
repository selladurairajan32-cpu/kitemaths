import type { ExplainScript } from "@/engine/explainScript";
import type { Chapter } from "@/engine/story";
import { scaleAmount, shareInRatio } from "@/maths/ratio";

/**
 * D-040: the ratio and proportion explanation as three chapters of beats. Each beat's `scene` says what the 3D stage
 * (and its 2D fallback) draws; each `caption` says the same thing in words. Every number comes from `maths/ratio.ts`.
 */

export type RatioScene =
  /** Groups of `a` blue and `b` orange cubes on the table; `count` shows a running total under each colour. */
  | { kind: "groups"; groups: number; a: number; b: number; count?: boolean }
  /** Sharing `total` sweets in a : b, in stages: a pile, sorted into groups of a + b, poured into two jars, then a bar. */
  | { kind: "share"; total: number; a: number; b: number; stage: "pile" | "groups" | "jars" | "bar" }
  /** A recipe for `people`, scaled from a base of 4. */
  | { kind: "recipe"; people: number; eggs: number; milk: number }
  /** Try it: `dealt` groups of a + b taken from a pile of `total` and dealt into two jars. */
  | { kind: "deal"; total: number; a: number; b: number; dealt: number };

export const RATIO = { a: 2, b: 3, total: 35 } as const;
export const RECIPE = { base: 4, eggs: 2, milk: 300 } as const;

const share = shareInRatio(RATIO.total, [RATIO.a, RATIO.b]);
const recipe = (people: number): RatioScene => ({ kind: "recipe", people, eggs: scaleAmount(RECIPE.eggs, RECIPE.base, people), milk: scaleAmount(RECIPE.milk, RECIPE.base, people) });
const six = recipe(6);

export const RATIO_STORY: Chapter<RatioScene>[] = [
  {
    id: "for-every",
    title: "For every",
    beats: [
      { id: "one-group", caption: "2 blue cubes and 3 orange cubes make one group. The ratio is 2 : 3: for every 2 blue, there are 3 orange.", say: "Two blue cubes and three orange cubes make one group. So the ratio is two to three. [pause] For every two blue, there are three orange.", ms: 10100, scene: { kind: "groups", groups: 1, a: RATIO.a, b: RATIO.b } },
      { id: "two-groups", caption: "Add another group. Now there are 4 blue and 6 orange, still 2 : 3.", say: "Let's add another group. Now there are four blue and six orange. Still two to three!", ms: 6700, scene: { kind: "groups", groups: 2, a: RATIO.a, b: RATIO.b, count: true } },
      { id: "three-groups", caption: "Three groups: 6 blue and 9 orange. However many groups, every group has 2 blue and 3 orange.", say: "Three groups. Six blue and nine orange. [pause] However many groups there are, every group has two blue and three orange.", ms: 8800, scene: { kind: "groups", groups: 3, a: RATIO.a, b: RATIO.b, count: true } },
    ],
    checkpoint: { prompt: "In the ratio 2 : 3, how many orange cubes go with 6 blue cubes?", answer: 9, hint: "6 blue is 3 groups of 2. Each group has 3 orange.", replayBeat: 2, worked: "6 blue is 3 groups of 2, and each group has 3 orange: 3 × 3 = 9 orange." },
  },
  {
    id: "sharing",
    title: "Sharing",
    beats: [
      { id: "pile", caption: `Share ${RATIO.total} sweets in the ratio 2 : 3.`, say: "Now let's share 35 sweets in the ratio two to three. [think]", ms: 7200, scene: { kind: "share", total: RATIO.total, a: RATIO.a, b: RATIO.b, stage: "pile" } },
      { id: "groups", caption: `Each group takes 2 + 3 = ${share.partCount} sweets. ${RATIO.total} ÷ ${share.partCount} = ${share.onePart} groups, so one part is ${share.onePart}.`, say: "Each group takes two plus three. That's five sweets. Thirty five divided by five is seven. So one part is seven.", ms: 9000, scene: { kind: "share", total: RATIO.total, a: RATIO.a, b: RATIO.b, stage: "groups" } },
      { id: "jars", caption: `Blue gets 2 parts: 2 × ${share.onePart} = ${share.shares[0]}. Orange gets 3 parts: 3 × ${share.onePart} = ${share.shares[1]}.`, say: "Blue gets two parts. Two times seven is fourteen. [pause] Orange gets three parts. Three times seven is twenty one.", ms: 9200, scene: { kind: "share", total: RATIO.total, a: RATIO.a, b: RATIO.b, stage: "jars" } },
      { id: "bar", caption: `As a bar: 5 equal parts of ${share.onePart}. ${share.shares[0]} + ${share.shares[1]} = ${RATIO.total}, so nothing is left over.`, say: "As a bar, that's five equal parts of seven. Fourteen plus twenty one is thirty five. Nothing is left over!", ms: 7800, scene: { kind: "share", total: RATIO.total, a: RATIO.a, b: RATIO.b, stage: "bar" } },
    ],
    checkpoint: { prompt: "Share 20 sweets in the ratio 3 : 1. How many are in the bigger share?", answer: 15, hint: "First add the parts: 3 + 1 = 4. Then find one part: 20 ÷ 4.", replayBeat: 1, worked: "3 + 1 = 4 parts. 20 ÷ 4 = 5 in one part. The bigger share is 3 parts: 3 × 5 = 15." },
  },
  {
    id: "scaling",
    title: "Scaling",
    beats: [
      { id: "recipe-4", caption: `Pancakes for ${RECIPE.base} people need ${RECIPE.eggs} eggs and ${RECIPE.milk} ml of milk.`, say: "Pancakes for four people need two eggs and three hundred millilitres of milk.", ms: 5200, scene: recipe(RECIPE.base) },
      { id: "recipe-6", caption: `For 6 people, that is 1.5 times as many: ${six.kind === "recipe" ? six.eggs : 0} eggs and ${six.kind === "recipe" ? six.milk : 0} ml of milk. Every amount scales by the same number.`, say: "For six people, we need one and a half times as much. Three eggs, and four hundred and fifty millilitres of milk. [pause] Every amount scales by the same number.", ms: 11400, scene: six },
    ],
    checkpoint: { prompt: `Pancakes for ${RECIPE.base} people need ${RECIPE.milk} ml of milk. How much milk is needed for 8 people, in ml?`, answer: scaleAmount(RECIPE.milk, RECIPE.base, 8), unit: "ml", hint: "8 people is twice as many as 4 people.", replayBeat: 1, worked: `8 is 2 × 4, so double everything: 2 × ${RECIPE.milk} = ${scaleAmount(RECIPE.milk, RECIPE.base, 8)} ml.` },
  },
];

/** D-041: the ratio explanation for all three ways to learn: the story above for Step through, and the film's cues. */
export const RATIO_SCRIPT: ExplainScript<RatioScene> = {
  topicId: "ratio-algebra",
  concept: "ratio",
  title: "Ratio and proportion: sharing in a ratio",
  story: RATIO_STORY,
  film: {
    cues: [
      { id: "intro", text: "What does a ratio like 2 to 3 mean? Let's find out together.", say: "Hello! What does a ratio like two to three mean? [pause] Let's find out together.", s: 7 },
      { id: "group", text: "2 blue cubes and 3 orange cubes make one group. For every 2 blue, there are 3 orange.", say: "Here are two blue cubes and three orange cubes. That's one group. [pause] For every two blue, there are three orange.", s: 10 },
      { id: "more", text: "Add more groups: 4 blue and 6 orange, then 6 blue and 9 orange. Every group is still 2 to 3.", say: "Let's add more groups. Four blue and six orange. Then six blue and nine orange. [pause] Every group is still two to three.", s: 11 },
      { id: "share", text: `Now share ${RATIO.total} sweets in the ratio 2 to 3. How would you do it?`, say: `Now, here are ${RATIO.total} sweets. How would you share them in the ratio two to three? [think]`, s: 9 },
      { id: "parts", text: `Each group takes 2 plus 3, which is ${share.partCount} sweets. ${RATIO.total} divided by ${share.partCount} is ${share.onePart}, so there are ${share.onePart} groups.`, say: `Each group takes two plus three. That's ${share.partCount} sweets. [pause] ${RATIO.total} divided by ${share.partCount} is ${share.onePart}. So there are ${share.onePart} groups.`, s: 11 },
      { id: "jars", text: `Blue gets 2 parts: 2 times ${share.onePart} is ${share.shares[0]}. Orange gets 3 parts: 3 times ${share.onePart} is ${share.shares[1]}.`, say: `Blue gets two from every group. Two times ${share.onePart} is ${share.shares[0]}. [pause] Orange gets three from every group. Three times ${share.onePart} is ${share.shares[1]}.`, s: 11 },
      { id: "check", text: `${share.shares[0]} plus ${share.shares[1]} is ${RATIO.total}, so nothing is left over.`, say: `Let's check. ${share.shares[0]} plus ${share.shares[1]} is ${RATIO.total}. Nothing is left over. Brilliant!`, s: 7 },
      { id: "remember", text: "Remember: add the parts, divide to find one part, then multiply for each share.", say: "Remember. Add the parts. Divide to find one part. Then multiply for each share. Great work!", s: 8.5 },
    ],
    chapters: [
      { title: "For every", cue: "intro" },
      { title: "Sharing", cue: "share" },
      { title: "One part", cue: "parts" },
      { title: "Remember", cue: "remember" },
    ],
  },
};
