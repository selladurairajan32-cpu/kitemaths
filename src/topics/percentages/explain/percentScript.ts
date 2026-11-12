import type { ExplainScript } from "@/engine/explainScript";

/**
 * D-050: percentages of amounts, taught as a teacher would: a sale (35% off an £80 bike) with time to think, the "divide
 * by the percentage" mistake, the whole as a bar of ten 10% parts, 10% by dividing by 10, building 35% from 30% and 5%,
 * the rule, a turn for the child and a recap. One script for all three ways to learn; every number is checked by hand
 * in the script's test.
 */

export type PercentStage = "hook" | "mistake" | "bar" | "ten" | "build" | "rule";
export interface PercentScene {
  stage: PercentStage;
}

export const PERCENT_SCRIPT: ExplainScript<PercentScene> = {
  topicId: "percentages",
  concept: "percent-of-amount",
  title: "Percentages of amounts",
  story: [
    {
      id: "ten",
      title: "Find 10%",
      beats: [
        {
          id: "hook",
          caption: "A bike costs £80. In the sale it has 35% off. How much money is that?",
          say: "A bike costs eighty pounds. In the sale, it has thirty five percent off. How much money is that? [think]",
          ms: 11500,
          scene: { stage: "hook" },
        },
        {
          id: "mistake",
          caption: "Some people work out 80 ÷ 35. That's only about 2, far too small. Per cent means out of every hundred.",
          say: "Some people work out eighty divided by thirty five. That's only about two pounds. Far too small! [pause] Per cent means out of every hundred.",
          ms: 13000,
          scene: { stage: "mistake" },
        },
        {
          id: "bar",
          caption: "Draw the £80 as a bar: that's 100%. Cut it into ten equal parts. Each part is 10%.",
          say: "Let's draw the eighty pounds as a bar. That's one hundred percent. [pause] Cut it into ten equal parts. Each part is ten percent.",
          ms: 12000,
          scene: { stage: "bar" },
        },
        {
          id: "ten",
          caption: "10% of 80 is 80 ÷ 10 = 8. So each part is £8.",
          say: "Ten percent of eighty is eighty divided by ten. That's eight. [pause] So each part is eight pounds.",
          ms: 10000,
          scene: { stage: "ten" },
        },
      ],
      checkpoint: { prompt: "What is 10% of 60?", answer: 6, hint: "Divide by 10.", replayBeat: 3, worked: "10% means divide by 10: 60 ÷ 10 = **6**." },
    },
    {
      id: "build",
      title: "Build it",
      beats: [
        {
          id: "build",
          caption: "35% is three 10% parts and half a part. 30% is 3 × £8 = £24. 5% is half of £8, which is £4.",
          say: "Thirty five percent is three ten percent parts, and half a part. [pause] Thirty percent is three times eight. Twenty four pounds. And five percent is half of eight. Four pounds.",
          ms: 16500,
          scene: { stage: "build" },
        },
        {
          id: "total",
          caption: "£24 + £4 = £28. So 35% of £80 is £28 off.",
          say: "Twenty four plus four is twenty eight. [pause] So thirty five percent of eighty pounds is twenty eight pounds off!",
          ms: 11000,
          scene: { stage: "build" },
        },
        {
          id: "rule",
          caption: "The rule: find 10% by dividing by 10, then build the percentage you need from it.",
          say: "So here's the rule. Find ten percent by dividing by ten. [pause] Then build the percentage you need.",
          ms: 9500,
          scene: { stage: "rule" },
        },
      ],
      checkpoint: { prompt: "What is 20% of 50?", answer: 10, hint: "10% of 50 is 5. 20% is double that.", replayBeat: 0, worked: "10% of 50 is 5, so 20% is 2 × 5 = **10**." },
    },
  ],
  film: {
    cues: [
      { id: "hook", text: "A bike costs eighty pounds. In the sale, it has 35% off. How much money is that?", say: "A bike costs eighty pounds. In the sale, it has thirty five percent off. How much money is that?", s: 8 },
      { id: "predict", text: "What do you think? Have a go in your head.", say: "What do you think? Have a go in your head. [think]", s: 6.5 },
      { id: "mistake", text: "Some people divide eighty by thirty-five. That's only about two pounds. Far too small! Per cent means out of every hundred.", say: "Some people divide eighty by thirty five. That's only about two pounds. Far too small! [pause] Per cent means out of every hundred.", s: 11.5 },
      { id: "bar", text: "Let's draw the eighty pounds as a bar: one hundred percent. Cut it into ten equal parts. Each part is ten percent.", say: "Let's draw the eighty pounds as a bar. One hundred percent. [pause] Cut it into ten equal parts. Each part is ten percent.", s: 11 },
      { id: "ten", text: "Ten percent of eighty is eighty divided by ten. That's eight pounds in each part.", say: "Ten percent of eighty is eighty divided by ten. [pause] That's eight pounds in each part.", s: 8 },
      { id: "build", text: "Thirty-five percent is three parts and half a part. Three eights are twenty-four. Half of eight is four.", say: "Thirty five percent is three parts, and half a part. [pause] Three eights are twenty four. And half of eight is four.", s: 11 },
      { id: "total", text: "Twenty-four plus four is twenty-eight. So 35% of eighty pounds is twenty-eight pounds off!", say: "Twenty four plus four is twenty eight. [pause] So thirty five percent of eighty pounds is twenty eight pounds off!", s: 10 },
      { id: "rule", text: "The rule: find ten percent by dividing by ten. Then build the percentage you need.", say: "So here's the rule. Find ten percent by dividing by ten. [pause] Then build the percentage you need.", s: 8.5 },
      { id: "your-turn", text: "Your turn: what is 15% of sixty? Ten percent is six. Five percent is three. So fifteen percent is nine.", say: "Your turn. What is fifteen percent of sixty? [think] Ten percent is six. Five percent is half of that, three. [pause] So fifteen percent is nine. Well done!", s: 16 },
      { id: "recap", text: "Remember: per cent means out of every hundred. Find ten percent first.", say: "Remember. Per cent means out of every hundred. Find ten percent first. Great work!", s: 7 },
    ],
    chapters: [
      { title: "The question", cue: "hook" },
      { title: "Divide by 35?", cue: "mistake" },
      { title: "The bar", cue: "bar" },
      { title: "Find 10%", cue: "ten" },
      { title: "Build 35%", cue: "build" },
      { title: "Your turn", cue: "your-turn" },
    ],
  },
};
