import type { ExplainScript } from "@/engine/explainScript";

/**
 * D-050: remainders in real life, taught as a teacher would: a school trip (50 children, minibuses of 12) with time to
 * think, the division (4 r 2), the mistake of stopping at 4, rounding up because the 2 still need a seat, then a second
 * story (packs of 12 pens) where only full packs count, the remainder as the answer, the rule, a turn for the child and
 * a recap. One script for all three ways to learn; every number is checked by hand in the script's test.
 */

export type RemainderStage = "hook" | "divide" | "up" | "down" | "left" | "rule";
export interface RemainderScene {
  stage: RemainderStage;
}

export const REMAINDER_SCRIPT: ExplainScript<RemainderScene> = {
  topicId: "multiply-divide",
  concept: "remainders",
  title: "Remainders in real life",
  story: [
    {
      id: "trip",
      title: "The school trip",
      beats: [
        {
          id: "hook",
          caption: "50 children are going to the zoo. Each minibus holds 12 children. How many minibuses do they need?",
          say: "Fifty children are going to the zoo. Each minibus holds twelve children. How many minibuses do they need? [think]",
          ms: 11500,
          scene: { stage: "hook" },
        },
        {
          id: "divide",
          caption: "50 ÷ 12 = 4 remainder 2. Four minibuses are full, and 2 children are left over.",
          say: "Fifty divided by twelve is four, remainder two. [pause] Four minibuses are full. And two children are left over.",
          ms: 11000,
          scene: { stage: "divide" },
        },
        {
          id: "up",
          caption: "So is the answer 4? No! The 2 children can't stay behind. They need one more minibus: 5 minibuses.",
          say: "So is the answer four? No! The two children can't stay behind. [pause] They need one more minibus. Five minibuses!",
          ms: 11000,
          scene: { stage: "up" },
        },
      ],
      checkpoint: { prompt: "30 children go on a trip in minibuses of 8. How many minibuses do they need?", answer: 4, hint: "30 ÷ 8 = 3 remainder 6. Do the 6 children need a seat?", replayBeat: 2, worked: "30 ÷ 8 = 3 r 6. The 6 left over need a minibus too: **4** minibuses." },
    },
    {
      id: "meaning",
      title: "What does it mean?",
      beats: [
        {
          id: "down",
          caption: "A different story: pens come in packs of 12, and we have 50 pens. How many full packs? 4. The 2 extra pens aren't a pack, so round down.",
          say: "Now a different story. Pens come in packs of twelve, and we have fifty pens. How many full packs can we make? [pause] Four. The two extra pens aren't a full pack. So this time, we round down.",
          ms: 18000,
          scene: { stage: "down" },
        },
        {
          id: "left",
          caption: "And if the question asks how many pens are left over, the answer is the remainder: 2.",
          say: "And if the question asks how many pens are left over? [pause] Then the answer is the remainder. Two.",
          ms: 9500,
          scene: { stage: "left" },
        },
        {
          id: "rule",
          caption: "The rule: divide, then ask what the remainder means. Round up, round down, or the remainder is the answer.",
          say: "So here's the rule. Divide, then ask what the remainder means. [pause] Round up, round down, or the remainder is the answer.",
          ms: 12000,
          scene: { stage: "rule" },
        },
      ],
      checkpoint: { prompt: "A comic costs £3. Ella has £20. How many comics can she buy?", answer: 6, hint: "20 ÷ 3 = 6 remainder 2. Is £2 enough for another comic?", replayBeat: 0, worked: "20 ÷ 3 = 6 r 2. £2 isn't enough for another comic, so round down: **6** comics." },
    },
  ],
  film: {
    cues: [
      { id: "hook", text: "Fifty children are going to the zoo. Each minibus holds twelve. How many minibuses do they need?", s: 8 },
      { id: "predict", text: "What do you think? Have a go in your head.", say: "What do you think? Have a go in your head. [think]", s: 6.5 },
      { id: "divide", text: "Fifty divided by twelve is four, remainder two. Four minibuses are full, and two children are left over.", say: "Fifty divided by twelve is four, remainder two. [pause] Four minibuses are full. And two children are left over.", s: 10 },
      { id: "mistake", text: "Some people say four minibuses. But then two children stay behind!", say: "Some people say four minibuses. [pause] But then two children would stay behind!", s: 7 },
      { id: "up", text: "They need one more minibus. So the answer is five. We round up.", say: "They need one more minibus. [pause] So the answer is five. We round up.", s: 7 },
      { id: "down", text: "But in a different story, pens come in packs of twelve. With fifty pens, we can make four full packs. The two extra pens aren't a pack, so we round down.", say: "But here's a different story. Pens come in packs of twelve. With fifty pens, we can make four full packs. [pause] The two extra pens aren't a pack. So this time, we round down.", s: 15.5 },
      { id: "left", text: "And if the question asks how many are left over, the answer is the remainder: two.", say: "And if the question asks how many are left over? [pause] The answer is the remainder. Two.", s: 7.5 },
      { id: "rule", text: "The rule: divide, then ask what the remainder means. Round up, round down, or the remainder is the answer.", say: "So here's the rule. Divide, then ask what the remainder means. [pause] Round up, round down, or the remainder is the answer.", s: 10.5 },
      { id: "your-turn", text: "Your turn: 26 eggs go in boxes of 6. How many boxes are needed? Twenty-six divided by six is four, remainder two. The two eggs need a box too, so five boxes.", say: "Your turn. Twenty six eggs go in boxes of six. How many boxes are needed? [think] Twenty six divided by six is four, remainder two. [pause] The two eggs need a box too. So five boxes. Well done!", s: 18 },
      { id: "recap", text: "Remember: after you divide, think about what the remainder means in the story.", say: "Remember. After you divide, think about what the remainder means in the story. Great work!", s: 7 },
    ],
    chapters: [
      { title: "The question", cue: "hook" },
      { title: "Divide", cue: "divide" },
      { title: "Round up", cue: "mistake" },
      { title: "Round down", cue: "down" },
      { title: "Left over", cue: "left" },
      { title: "Your turn", cue: "your-turn" },
    ],
  },
};
