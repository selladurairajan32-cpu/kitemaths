import type { ExplainScript } from "@/engine/explainScript";
import { add } from "@/maths/fraction";

/**
 * D-041 pilot, rewritten for D-043 as a teacher would teach it: a pizza story, a question with time to think, the
 * common mistake, same-size slices, counting together, the rule, a "your turn" and a recap. One script for all three
 * ways to learn: the film is rendered and voiced from `film` (tools/films), Step through plays `story`, and Try it
 * follows the same moves by hand. Captions are what the screen shows; `say` is what Emma says, with teaching pauses.
 * Every number is checked against the fraction maths in the script's test.
 */

/** What the Step through picture shows for a beat. */
export type FracStage = "hook" | "mistake" | "slices" | "cut" | "count" | "combine" | "rule";
export interface FracScene {
  stage: FracStage;
}

const sum = add({ n: 1, d: 3 }, { n: 1, d: 4 });
export const ANSWER = `{${sum.n}/${sum.d}}`;

export const ADD_DIFFERENT_SCRIPT: ExplainScript<FracScene> = {
  topicId: "fractions-2",
  concept: "add-different",
  title: "Adding fractions with different denominators",
  story: [
    {
      id: "match",
      title: "Same size slices",
      beats: [
        {
          id: "hook",
          caption: "Sam ate {1/3} of a pizza. Zara ate {1/4} of the same pizza. How much did they eat altogether?",
          say: "Sam ate one third of a pizza. Zara ate one quarter of the same pizza. How much did they eat altogether? [think]",
          ms: 10600,
          scene: { stage: "hook" },
        },
        {
          id: "mistake",
          caption: "Lots of people say {2/7}. But {2/7} is smaller than {1/3} on its own, so it can't be right.",
          say: "Lots of people say two sevenths. But wait. [pause] Two sevenths is smaller than one third on its own! So that can't be right, can it?",
          ms: 11400,
          scene: { stage: "mistake" },
        },
        {
          id: "slices",
          caption: "Look at the slices. A third is a big slice and a quarter is a smaller slice. They're different sizes.",
          say: "Look at the slices. A third is a big slice. A quarter is a smaller slice. They're different sizes, so we can't count them together. Not yet!",
          ms: 10800,
          scene: { stage: "slices" },
        },
        {
          id: "cut",
          caption: "Let's cut both pizzas into slices of the same size. 3 × 4 = 12, so we cut them into twelfths.",
          say: "Here's the trick. Let's cut both pizzas into slices of the same size. Three times four is twelve. So we cut them into twelfths.",
          ms: 10800,
          scene: { stage: "cut" },
        },
        {
          id: "count",
          caption: "Count with me: {1/3} is 4 twelfths, and {1/4} is 3 twelfths.",
          say: "Count with me. One third is one, two, three, four twelfths. [pause] And one quarter is one, two, three twelfths.",
          ms: 11000,
          scene: { stage: "count" },
        },
      ],
      checkpoint: { prompt: "One third is how many twelfths?", answer: 4, hint: "Each third is cut into 4 slices. Count the shaded slices.", replayBeat: 4, worked: "Each third is cut into 4 slices, so one third is 4 twelfths: {1/3} = {4/12}." },
    },
    {
      id: "add",
      title: "Add them",
      beats: [
        {
          id: "combine",
          caption: `Now the slices match: 4 twelfths + 3 twelfths = 7 twelfths. So {1/3} + {1/4} = ${ANSWER}.`,
          say: "Now the slices match. Four twelfths, plus three twelfths, makes seven twelfths. [pause] So one third plus one quarter is seven twelfths. Brilliant!",
          ms: 12400,
          scene: { stage: "combine" },
        },
        {
          id: "rule",
          caption: "The rule: make the slices the same size first, then add the tops. The bottom number stays the same.",
          say: "So here's the rule. Make the slices the same size first. Then add the tops. [pause] The bottom number stays the same.",
          ms: 10200,
          scene: { stage: "rule" },
        },
      ],
      checkpoint: { prompt: "{1/2} + {1/3} is how many sixths?", answer: 5, hint: "One half is 3 sixths. One third is 2 sixths.", replayBeat: 0, worked: "{1/2} = {3/6} and {1/3} = {2/6}, so {1/2} + {1/3} = {5/6}: 5 sixths." },
    },
  ],
  film: {
    cues: [
      { id: "hook", text: "Sam ate one third of a pizza. Zara ate one quarter of the same pizza. How much did they eat altogether?", s: 9 },
      { id: "predict", text: "What do you think? Have a go in your head.", say: "What do you think? Have a go in your head. [think]", s: 6.5 },
      { id: "mistake", text: "Lots of people say two sevenths. But two sevenths is smaller than one third on its own! That can't be right.", say: "Lots of people say two sevenths. But wait. [pause] Two sevenths is smaller than one third on its own! That can't be right, can it?", s: 10.5 },
      { id: "slices", text: "Look at the slices. A third is a big slice. A quarter is a smaller slice. They're different sizes, so we can't count them together yet.", say: "Look at the slices. A third is a big slice. A quarter is a smaller slice. They're different sizes, so we can't count them together. Not yet!", s: 10 },
      { id: "trick", text: "Here's the trick: cut both pizzas into slices of the same size. Three times four is twelve, so let's cut them into twelfths.", say: "Here's the trick. Let's cut both pizzas into slices of the same size. [pause] Three times four is twelve. So let's cut them into twelfths.", s: 10.5 },
      { id: "count", text: "Count with me. One third is one, two, three, four twelfths. One quarter is one, two, three twelfths.", say: "Count with me. One third is one, two, three, four twelfths. [pause] And one quarter is one, two, three twelfths.", s: 10.5 },
      { id: "add", text: "Now the slices match. Four twelfths plus three twelfths makes seven twelfths. So one third plus one quarter is seven twelfths!", say: "Now the slices match. Four twelfths, plus three twelfths, makes seven twelfths. [pause] So one third plus one quarter is seven twelfths. Brilliant!", s: 11.5 },
      { id: "rule", text: "Here's the rule: make the slices the same size first, then add the tops. The bottom number stays the same.", say: "So here's the rule. Make the slices the same size first. Then add the tops. [pause] The bottom number stays the same.", s: 9.5 },
      { id: "your-turn", text: "Your turn: what is one sixth plus one third? One third is two sixths. One sixth plus two sixths is three sixths, which is the same as one half.", say: "Your turn. What is one sixth plus one third? [think] One third is two sixths. One sixth plus two sixths is three sixths. [pause] And three sixths is the same as one half. Well done!", s: 17 },
      { id: "recap", text: "Remember: same size slices, add the tops, and check your answer makes sense.", say: "Remember. Same size slices. Add the tops. And check your answer makes sense. Great work!", s: 8 },
    ],
    chapters: [
      { title: "The question", cue: "hook" },
      { title: "Same size?", cue: "slices" },
      { title: "Common denominator", cue: "trick" },
      { title: "Convert", cue: "count" },
      { title: "Add", cue: "add" },
      { title: "Simplify", cue: "your-turn" },
    ],
  },
};
