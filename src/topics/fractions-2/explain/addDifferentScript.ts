import type { ExplainScript } from "@/engine/explainScript";
import { add } from "@/maths/fraction";

/**
 * D-041 pilot: adding fractions with different denominators, ⅓ + ¼ = 7/12, as one script for all three ways to learn.
 * The film is rendered and voiced from `film` (tools/films), Step through plays `story`, and Try it follows the same
 * moves by hand. Every number is checked against the fraction maths in the script's test.
 */

/** What the Step through picture shows for a beat. */
export type FracStage = "question" | "mistake" | "pictures" | "cut" | "count" | "combine" | "summary";
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
      title: "Make the pieces match",
      beats: [
        { id: "question", caption: "How do we add {1/3} and {1/4}?", ms: 4200, scene: { stage: "question" } },
        { id: "mistake", caption: "Adding the tops and the bottoms gives {2/7}. But {2/7} is smaller than {1/3} on its own, so that can't be right.", ms: 10400, scene: { stage: "mistake" } },
        { id: "pictures", caption: "Here is one third and one quarter. The shaded pieces are different sizes, so we can't count them together yet.", ms: 8600, scene: { stage: "pictures" } },
        { id: "cut", caption: "Cut both into the same size pieces: cut the third into 4 rows and the quarter into 3 columns.", ms: 7800, scene: { stage: "cut" } },
        { id: "count", caption: "Now each whole has 3 × 4 = 12 equal pieces. One third is 4 twelfths, and one quarter is 3 twelfths.", ms: 9200, scene: { stage: "count" } },
      ],
      checkpoint: { prompt: "One third is how many twelfths?", answer: 4, hint: "Cut each third into 4 rows: how many pieces are shaded?", replayBeat: 4, worked: "Each third is cut into 4 pieces, so one third is 4 twelfths: {1/3} = {4/12}." },
    },
    {
      id: "add",
      title: "Add them",
      beats: [
        { id: "combine", caption: `The pieces match, so put them together: 4 twelfths and 3 twelfths make 7 twelfths. {1/3} + {1/4} = ${ANSWER}.`, ms: 10200, scene: { stage: "combine" } },
        { id: "summary", caption: "Remember: make the pieces the same size first, then add the tops. The bottom stays the same.", ms: 7400, scene: { stage: "summary" } },
      ],
      checkpoint: { prompt: "{1/2} + {1/3} is how many sixths?", answer: 5, hint: "One half is 3 sixths. One third is 2 sixths.", replayBeat: 0, worked: "{1/2} = {3/6} and {1/3} = {2/6}, so {1/2} + {1/3} = {5/6}: 5 sixths." },
    },
  ],
  film: {
    cues: [
      { id: "question", text: "How do we add one third and one quarter?", s: 4.5 },
      { id: "mistake", text: "A common mistake: add the tops and add the bottoms to get two sevenths. That's wrong.", s: 7 },
      { id: "pictures", text: "Here is one third, and here is one quarter. The pieces are different sizes, so we can't just count them together.", s: 8.6 },
      { id: "cut", text: "The trick: cut both into the same size pieces. Cut the third into 4 rows, and the quarter into 3 columns.", s: 8.6 },
      { id: "twelve", text: "Now each whole has 3 times 4, which is 12 equal parts.", s: 5.5 },
      { id: "count", text: "Count the shaded parts. One third is four twelfths. One quarter is three twelfths.", s: 7.5 },
      { id: "add", text: "Now the pieces match, so we can add them: 4 twelfths and 3 twelfths make 7 twelfths.", s: 8.5 },
      { id: "remember", text: "Remember: make the denominators the same first, then add the numerators. One third plus one quarter is seven twelfths.", s: 9 },
    ],
    chapters: [
      { title: "The question", cue: "question" },
      { title: "The mistake", cue: "mistake" },
      { title: "Two pictures", cue: "pictures" },
      { title: "Cut into twelfths", cue: "cut" },
      { title: "Add them", cue: "add" },
      { title: "Remember", cue: "remember" },
    ],
  },
};
