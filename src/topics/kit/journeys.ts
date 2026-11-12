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
    why: "Every group has the same mix, like 2 blue and 3 orange. Dividing tells you how many groups fit, and each share is that many groups of its own part.",
  },
];

export const journeyFor = (topicId: string, concept: string) => JOURNEYS.find((j) => j.topicId === topicId && j.concept === concept);
