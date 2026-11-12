import type { Strand } from "@/engine/topicJourney";
import type { Difficulty } from "./types";

/**
 * D-043: the topic journeys, as plain data. Each concept with an explanation (`explanationIndex.ts`) is learned in five
 * stages: Learn (watch, step through or try it) → Practise → Apply → Check understanding → Complete. Questions come
 * from the island's own question makers, so marking, hints and mastery are the island's. `strands` tags each maker as
 * concept, application or reasoning, for the breakdown at the end.
 */

export type PractiseLevel = "guided" | "build" | "challenge";
export interface JourneyQuestion {
  key: string;
  difficulty: Difficulty;
  level?: PractiseLevel;
}

export interface JourneyDef {
  topicId: string;
  concept: string;
  /** The island skill this journey teaches and checks. */
  skill: string;
  year: number;
  title: string;
  /** Rough time for each way to learn, shown on the cards. */
  minutes: { watch: string; step: string; try: string };
  practise: JourneyQuestion[];
  apply: JourneyQuestion[];
  strands: Record<string, Strand>;
  /** The method, step by step, for the Method button. */
  method: string[];
  /** Why the method works, for the Why button. */
  why: string;
  /** D-046: the one idea to take away, beside the player (RichText). */
  keyIdea: string;
  /** D-046: the common mistake to watch out for, in the child's words (RichText). */
  misconception: string;
  /** D-046: the 3D picture for this concept on Home (a name in public/3d). */
  pic: string;
  /** D-046: three short notes for the strip under Learn (the full method is behind the Method button). */
  keyNotes: string[];
  /** D-046: the key idea as a bar model: `cells` equal parts, the first `blue` then `orange` filled, and a caption. */
  keyBar: { cells: number; blue: number; orange: number; caption: string };
}

export const JOURNEYS: JourneyDef[] = [
  {
    topicId: "fractions-2",
    concept: "add-different",
    skill: "fractions-2.add-different",
    year: 6,
    title: "Add fractions with different denominators",
    minutes: { watch: "about 2 min", step: "3–5 min", try: "3–5 min" },
    practise: [
      { key: "f2-diff-common", difficulty: 1, level: "guided" },
      { key: "f2-diff-denominator", difficulty: 1, level: "guided" },
      { key: "f2-add-diff", difficulty: 2, level: "build" },
      { key: "f2-diff-why", difficulty: 2, level: "build" },
      { key: "f2-diff-subtract", difficulty: 2, level: "build" },
      { key: "f2-add-diff", difficulty: 3, level: "challenge" },
      { key: "f2-diff-subtract", difficulty: 3, level: "challenge" },
    ],
    apply: [
      { key: "f2-diff-apply", difficulty: 2 },
      { key: "f2-add-diff-stretch", difficulty: 3 },
      { key: "f2-diff-apply", difficulty: 3 },
    ],
    strands: {
      "f2-diff-common": "concept",
      "f2-diff-denominator": "concept",
      "f2-add-diff": "concept",
      "f2-diff-subtract": "concept",
      "f2-diff-apply": "application",
      "f2-add-diff-stretch": "application",
      "f2-diff-why": "reasoning",
    },
    method: ["Find a number both denominators go into (multiply them if nothing smaller works).", "Change each fraction: multiply its top and bottom by the same number.", "Add or take away the tops. Keep the bottom.", "Simplify if you can, and check it makes sense."],
    keyIdea: "Make the slices the same size, then add the tops. {1/3} = {4/12} and {1/4} = {3/12}, so together they make {7/12}.",
    pic: "pizza",
    keyNotes: ["Find a common denominator", "Change each fraction to match", "Add the tops, keep the bottom"],
    keyBar: { cells: 12, blue: 4, orange: 3, caption: "{4/12} + {3/12} = {7/12}" },
    misconception: "Never add the bottoms: {1/3} + {1/4} is not {2/7}. The bottom number says how big the slices are.",
    why: "The bottom number says how big the slices are. You can only count slices together when they are the same size, so you cut both into the same size slices first.",
  },
  {
    topicId: "ratio-algebra",
    concept: "ratio",
    skill: "ratio-algebra.ratio",
    year: 6,
    title: "Ratio and proportion: sharing in a ratio",
    minutes: { watch: "about 1 min", step: "4–6 min", try: "3–5 min" },
    practise: [
      { key: "ra-ratio-for-every", difficulty: 1, level: "guided" },
      { key: "ra-ratio", difficulty: 1, level: "guided" },
      { key: "ra-ratio", difficulty: 2, level: "build" },
      { key: "ra-ratio-for-every", difficulty: 2, level: "build" },
      { key: "ra-ratio", difficulty: 2, level: "build" },
      { key: "ra-ratio", difficulty: 3, level: "challenge" },
      { key: "ra-ratio-for-every", difficulty: 3, level: "challenge" },
    ],
    apply: [
      { key: "ra-ratio-stretch", difficulty: 3 },
      { key: "ra-ratio", difficulty: 3 },
      { key: "ra-ratio-stretch", difficulty: 3 },
    ],
    strands: { "ra-ratio-for-every": "concept", "ra-ratio": "concept", "ra-ratio-stretch": "application" },
    method: ["Add the parts of the ratio to find how many in one group.", "Divide the total by that to find one part.", "Multiply one part by each number in the ratio.", "Check: the shares add up to the total."],
    keyIdea: "Add the parts to find the groups: 2 + 3 = 5. Share the total into those equal parts, then give each colour its parts.",
    pic: "ratio",
    keyNotes: ["Add the parts: 2 + 3 = 5", "Divide the total by 5", "Multiply by each colour's parts"],
    keyBar: { cells: 5, blue: 2, orange: 3, caption: "5 equal parts of 7: blue 2 × 7 = 14, orange 3 × 7 = 21" },
    misconception: "2 : 3 doesn't mean 2 out of 3. It means 2 for every 3, so one group is 5.",
    why: "Every group has the same mix, like 2 blue and 3 orange. Dividing tells you how many groups fit, and each share is that many groups of its own part.",
  },
  // D-050: the first batch of the ten hardest concepts.
  {
    topicId: "decimals",
    concept: "compare-decimals",
    skill: "decimals.compare-round",
    year: 5,
    title: "Comparing decimals",
    minutes: { watch: "about 2 min", step: "3–5 min", try: "3–5 min" },
    practise: [
      { key: "dc-compare", difficulty: 1, level: "guided" },
      { key: "dc-compare", difficulty: 1, level: "guided" },
      { key: "dc-compare", difficulty: 2, level: "build" },
      { key: "dc-compare-why", difficulty: 2, level: "build" },
      { key: "dc-compare", difficulty: 2, level: "build" },
      { key: "dc-compare", difficulty: 3, level: "challenge" },
      { key: "dc-order-stretch", difficulty: 3, level: "challenge" },
    ],
    apply: [
      { key: "dc-compare-apply", difficulty: 2 },
      { key: "dc-compare-apply", difficulty: 3 },
      { key: "dc-compare-apply", difficulty: 2 },
    ],
    strands: { "dc-compare": "concept", "dc-order-stretch": "concept", "dc-compare-apply": "application", "dc-compare-why": "reasoning" },
    method: ["Line up the decimal points.", "Fill any gaps with zeros, so both have the same number of places.", "Compare from the left: the whole numbers, then the tenths, then the hundredths.", "The first place that is different tells you which is bigger."],
    why: "Each place is worth ten times the place to its right, so the tenths matter more than all the hundredths together. 0.4 is 40 hundredths, more than 35 hundredths, even though 35 looks bigger than 4.",
    keyIdea: "A longer decimal isn't always bigger. 0.4 = 0.40, which is 40 hundredths: more than 0.35.",
    pic: "decimal",
    keyNotes: ["Line up the points", "Fill gaps with zeros", "Compare the tenths first"],
    keyBar: { cells: 10, blue: 4, orange: 0, caption: "0.4 = 4 tenths = 40 hundredths" },
    misconception: "More digits doesn't mean bigger: 0.35 is not bigger than 0.4, because 35 hundredths is less than 40.",
  },
  {
    topicId: "percentages",
    concept: "percent-of-amount",
    skill: "percentages.of-amounts",
    year: 6,
    title: "Percentages of amounts",
    minutes: { watch: "about 2 min", step: "3–5 min", try: "3–5 min" },
    practise: [
      { key: "pc-of-amount", difficulty: 1, level: "guided" },
      { key: "pc-of-amount", difficulty: 1, level: "guided" },
      { key: "pc-of-amount", difficulty: 2, level: "build" },
      { key: "pc-amount-why", difficulty: 2, level: "build" },
      { key: "pc-of-amount", difficulty: 2, level: "build" },
      { key: "pc-of-amount", difficulty: 3, level: "challenge" },
      { key: "pc-amount-stretch", difficulty: 3, level: "challenge" },
    ],
    apply: [
      { key: "pc-amount-word", difficulty: 2 },
      { key: "pc-amount-word", difficulty: 3 },
      { key: "pc-amount-word", difficulty: 3 },
    ],
    strands: { "pc-of-amount": "concept", "pc-amount-stretch": "concept", "pc-amount-word": "application", "pc-amount-why": "reasoning" },
    method: ["Find 10%: divide the amount by 10.", "Build the percentage from 10% parts: 30% is 3 × 10%.", "Use halves: 5% is half of 10%, 50% is half of the whole.", "Add the parts together, and check the answer is less than the whole."],
    why: "Per cent means out of every hundred, so 10% is one tenth of the amount. Every percentage is made of tenths and halves of tenths, so you can build it from 10%.",
    keyIdea: "Per cent means out of every hundred. Find 10% by dividing by 10, then build the percentage you need.",
    pic: "coin",
    keyNotes: ["10%: divide by 10", "5% is half of 10%", "Build it: 35% = 30% + 5%"],
    keyBar: { cells: 10, blue: 3, orange: 0, caption: "Each part is 10% of £80 = £8, so 30% = £24" },
    misconception: "Don't divide by the percentage: 35% of 80 is not 80 ÷ 35. That gives about 2, far too small.",
  },
  {
    topicId: "fractions-2",
    concept: "multiply-fractions",
    skill: "fractions-2.multiply-fractions",
    year: 6,
    title: "Multiplying fractions",
    minutes: { watch: "about 2 min", step: "3–5 min", try: "3–5 min" },
    practise: [
      { key: "f2-frac-of-frac", difficulty: 2, level: "guided" },
      { key: "f2-frac-times", difficulty: 2, level: "guided" },
      { key: "f2-frac-of-frac", difficulty: 2, level: "build" },
      { key: "f2-ff-why", difficulty: 2, level: "build" },
      { key: "f2-frac-times", difficulty: 2, level: "build" },
      { key: "f2-frac-times", difficulty: 3, level: "challenge" },
      { key: "f2-frac-times-stretch", difficulty: 3, level: "challenge" },
    ],
    apply: [
      { key: "f2-ff-apply", difficulty: 2 },
      { key: "f2-ff-apply", difficulty: 3 },
      { key: "f2-ff-apply", difficulty: 3 },
    ],
    strands: { "f2-frac-of-frac": "concept", "f2-frac-times": "concept", "f2-frac-times-stretch": "concept", "f2-ff-apply": "application", "f2-ff-why": "reasoning" },
    method: ["Read × as \"of\": {1/2} × {1/3} is {1/2} of {1/3}.", "Multiply the tops.", "Multiply the bottoms.", "Simplify if you can, and check the answer is smaller than both fractions."],
    why: "Cutting into halves one way and thirds the other cuts the whole into 2 × 3 = 6 pieces, so the bottoms multiply. Taking 1 of each takes 1 × 1 piece, so the tops multiply.",
    keyIdea: "Times a fraction means a fraction of it. Multiply the tops, multiply the bottoms: {1/2} × {1/3} = {1/6}.",
    pic: "fraction-bar",
    keyNotes: ["× means \"of\"", "Tops × tops, bottoms × bottoms", "The answer is smaller"],
    keyBar: { cells: 6, blue: 1, orange: 2, caption: "{1/3} of the half is 1 piece of 6: {1/6}" },
    misconception: "Multiplying doesn't always make it bigger: {1/2} × {1/3} is {1/6}, smaller than both.",
  },
  {
    topicId: "multiply-divide",
    concept: "remainders",
    skill: "multiply-divide.division",
    year: 5,
    title: "Remainders in real life",
    minutes: { watch: "about 2 min", step: "3–5 min", try: "3–5 min" },
    practise: [
      { key: "md-div", difficulty: 1, level: "guided" },
      { key: "md-share", difficulty: 1, level: "guided" },
      { key: "md-div", difficulty: 2, level: "build" },
      { key: "md-rem-why", difficulty: 2, level: "build" },
      { key: "md-share", difficulty: 2, level: "build" },
      { key: "md-div", difficulty: 3, level: "challenge" },
      { key: "md-div-stretch", difficulty: 3, level: "challenge" },
    ],
    apply: [
      { key: "md-rem-apply", difficulty: 2 },
      { key: "md-rem-apply", difficulty: 3 },
      { key: "md-share", difficulty: 3 },
    ],
    strands: { "md-div": "concept", "md-div-stretch": "concept", "md-share": "application", "md-rem-apply": "application", "md-rem-why": "reasoning" },
    method: ["Divide: how many full groups fit, and what is left over?", "Read the story again: what does the remainder mean?", "Round up if the leftovers still need a place; round down if only full groups count.", "If it asks what is left over, the remainder is the answer."],
    why: "A remainder is the part that doesn't make a full group. Whether it needs another group depends on the story: children still need a seat, but loose pens don't make a pack.",
    keyIdea: "Divide, then ask what the remainder means in the story: round up, round down, or the remainder is the answer.",
    pic: "divide",
    keyNotes: ["Divide first", "Need a place? Round up", "Only full ones? Round down"],
    keyBar: { cells: 5, blue: 4, orange: 1, caption: "4 full minibuses + 1 more for the 2 left over = 5" },
    misconception: "Don't stop at the whole number: 50 ÷ 12 = 4 r 2, but 50 children need 5 minibuses.",
  },
];

export const journeyFor = (topicId: string, concept: string) => JOURNEYS.find((j) => j.topicId === topicId && j.concept === concept);
