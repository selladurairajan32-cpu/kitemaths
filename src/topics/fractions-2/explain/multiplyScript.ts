import type { ExplainScript } from "@/engine/explainScript";
import { multiply } from "@/maths/fraction";

/**
 * D-050: multiplying fractions, taught as a teacher would: a chocolate bar (half is left; Mo eats a third of what is
 * left) with time to think, the "multiplying makes it bigger" mistake, the bar cut into halves one way and thirds the
 * other, the overlap (one sixth), multiply the tops and the bottoms, why the answer is smaller, a turn for the child and
 * a recap. One script for all three ways to learn; the numbers come from the fraction maths and are checked by hand.
 */

export type MultiplyStage = "hook" | "half" | "third" | "count" | "rule" | "smaller";
export interface MultiplyScene {
  stage: MultiplyStage;
}

const product = multiply({ n: 1, d: 2 }, { n: 1, d: 3 });
export const PRODUCT = `{${product.n}/${product.d}}`;

export const MULTIPLY_SCRIPT: ExplainScript<MultiplyScene> = {
  topicId: "fractions-2",
  concept: "multiply-fractions",
  title: "Multiplying fractions",
  story: [
    {
      id: "of",
      title: "A fraction of a fraction",
      beats: [
        {
          id: "hook",
          caption: "Half a chocolate bar is left. Mo eats {1/3} of what's left. How much of the whole bar does Mo eat?",
          say: "Half a chocolate bar is left. Mo eats one third of what's left. How much of the whole bar does Mo eat? [think]",
          ms: 11500,
          scene: { stage: "hook" },
        },
        {
          id: "half",
          caption: "Here is the whole bar. Half of it is left: shade one of the two halves.",
          say: "Here's the whole bar. Half of it is left. [pause] So we shade one of the two halves.",
          ms: 9000,
          scene: { stage: "half" },
        },
        {
          id: "third",
          caption: "Now cut the bar into thirds the other way. {1/3} of the half is one small piece.",
          say: "Now cut the bar into thirds, the other way. [pause] One third of the half is just one small piece.",
          ms: 9500,
          scene: { stage: "third" },
        },
      ],
      checkpoint: { prompt: "How many small pieces is the whole bar cut into now?", answer: 6, hint: "2 halves one way, 3 thirds the other: 2 × 3.", replayBeat: 2, worked: "2 halves × 3 thirds = **6** small pieces." },
    },
    {
      id: "times",
      title: "Tops and bottoms",
      beats: [
        {
          id: "count",
          caption: `The whole bar is 2 × 3 = 6 pieces. Mo eats 1 of them: ${PRODUCT} of the bar.`,
          say: "The whole bar is now two times three. Six pieces. [pause] Mo eats one of them. One sixth of the bar!",
          ms: 10500,
          scene: { stage: "count" },
        },
        {
          id: "rule",
          caption: `So {1/2} × {1/3} = ${PRODUCT}. Multiply the tops: 1 × 1 = 1. Multiply the bottoms: 2 × 3 = 6.`,
          say: "So one half times one third is one sixth. [pause] Multiply the tops. One times one is one. Multiply the bottoms. Two times three is six.",
          ms: 13500,
          scene: { stage: "rule" },
        },
        {
          id: "smaller",
          caption: `${PRODUCT} is smaller than {1/2} and smaller than {1/3}. Multiplying by a fraction less than 1 makes it smaller.`,
          say: "And look. One sixth is smaller than a half, and smaller than a third. [pause] Multiplying by a fraction less than one makes it smaller.",
          ms: 12500,
          scene: { stage: "smaller" },
        },
      ],
      checkpoint: { prompt: "{1/2} × {3/4} is how many eighths?", answer: 3, hint: "Tops: 1 × 3. Bottoms: 2 × 4.", replayBeat: 1, worked: "1 × 3 = 3 and 2 × 4 = 8, so {1/2} × {3/4} = {3/8}: **3** eighths." },
    },
  ],
  film: {
    cues: [
      { id: "hook", text: "Half a chocolate bar is left. Mo eats one third of what's left. How much of the whole bar does Mo eat?", s: 8.5 },
      { id: "predict", text: "What do you think? Have a go in your head.", say: "What do you think? Have a go in your head. [think]", s: 6.5 },
      { id: "mistake", text: "Some people think multiplying always makes things bigger. But a third of a half must be less than a half!", say: "Some people think multiplying always makes things bigger. [pause] But a third of a half must be less than a half!", s: 9.5 },
      { id: "half", text: "Here's the whole bar. Half of it is left, so we shade one of the two halves.", say: "Here's the whole bar. Half of it is left. [pause] So we shade one of the two halves.", s: 8 },
      { id: "third", text: "Now cut the bar into thirds the other way. One third of the half is just one small piece.", say: "Now cut the bar into thirds, the other way. [pause] One third of the half is just one small piece.", s: 8.5 },
      { id: "count", text: "The whole bar is now two times three: six pieces. Mo eats one of them. One sixth!", say: "The whole bar is now two times three. Six pieces. [pause] Mo eats one of them. One sixth!", s: 9 },
      { id: "rule", text: "So one half times one third is one sixth. Multiply the tops, one times one. Multiply the bottoms, two times three.", say: "So one half times one third is one sixth. [pause] Multiply the tops. One times one. Multiply the bottoms. Two times three.", s: 10.5 },
      { id: "smaller", text: "One sixth is smaller than both. Multiplying by a fraction less than one makes it smaller.", say: "One sixth is smaller than both! [pause] Multiplying by a fraction less than one makes it smaller.", s: 8.5 },
      { id: "your-turn", text: "Your turn: what is two thirds times one quarter? Two times one is two. Three times four is twelve. Two twelfths, which is one sixth.", say: "Your turn. What is two thirds times one quarter? [think] Two times one is two. Three times four is twelve. [pause] Two twelfths. And that's the same as one sixth. Well done!", s: 17.5 },
      { id: "recap", text: "Remember: times a fraction means a fraction of it. Multiply the tops, multiply the bottoms.", say: "Remember. Times a fraction means a fraction of it. Multiply the tops. Multiply the bottoms. Great work!", s: 8 },
    ],
    chapters: [
      { title: "The question", cue: "hook" },
      { title: "Always bigger?", cue: "mistake" },
      { title: "Halves", cue: "half" },
      { title: "Thirds", cue: "third" },
      { title: "Tops and bottoms", cue: "rule" },
      { title: "Your turn", cue: "your-turn" },
    ],
  },
};
