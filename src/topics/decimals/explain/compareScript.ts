import type { ExplainScript } from "@/engine/explainScript";

/**
 * D-050: comparing decimals, taught as a teacher would: a real question (whose plant grew more, 0.4 m or 0.35 m?) with
 * time to think, the "longer is bigger" mistake, place-value columns, comparing the tenths first, filling the gap with a
 * zero (0.40 = 40 hundredths), a hundred square, the rule, a turn for the child and a recap. One script for all three
 * ways to learn. Every number is checked by hand in the script's test.
 */

export type CompareStage = "hook" | "columns" | "tenths" | "zero" | "grid" | "rule";
export interface CompareScene {
  stage: CompareStage;
}

export const COMPARE_SCRIPT: ExplainScript<CompareScene> = {
  topicId: "decimals",
  concept: "compare-decimals",
  title: "Comparing decimals",
  story: [
    {
      id: "places",
      title: "Look at the places",
      beats: [
        {
          id: "hook",
          caption: "Amy's bean plant grew 0.4 m. Ben's grew 0.35 m. Ben says his grew more, because 35 is bigger than 4. Is he right?",
          say: "Amy's bean plant grew nought point four metres. Ben's grew nought point three five metres. Ben says his grew more, because thirty five is bigger than four. Is he right? [think]",
          ms: 16000,
          scene: { stage: "hook" },
        },
        {
          id: "columns",
          caption: "Put both numbers in place-value columns. 0.4 has 4 tenths. 0.35 has 3 tenths and 5 hundredths.",
          say: "Let's put both numbers in place-value columns. Nought point four has four tenths. [pause] Nought point three five has three tenths, and five hundredths.",
          ms: 12000,
          scene: { stage: "columns" },
        },
        {
          id: "tenths",
          caption: "Compare the biggest place first: the tenths. 4 tenths is more than 3 tenths, so 0.4 is bigger.",
          say: "Always compare the biggest place first. That's the tenths. [pause] Four tenths is more than three tenths. So nought point four is bigger!",
          ms: 11500,
          scene: { stage: "tenths" },
        },
      ],
      checkpoint: { prompt: "Which is bigger: 0.7 or 0.65? Type the bigger number.", answer: 0.7, hint: "Compare the tenths first: 7 tenths or 6 tenths?", replayBeat: 2, worked: "0.7 has 7 tenths and 0.65 has 6 tenths, so **0.7** is bigger." },
    },
    {
      id: "zero",
      title: "Fill the gap",
      beats: [
        {
          id: "zero",
          caption: "A trick: give them the same number of places. 0.4 is the same as 0.40, which is 40 hundredths. 0.35 is 35 hundredths.",
          say: "Here's a trick. Give them the same number of places. Nought point four is the same as nought point four nought. That's forty hundredths. [pause] And nought point three five is thirty five hundredths.",
          ms: 16000,
          scene: { stage: "zero" },
        },
        {
          id: "grid",
          caption: "On a hundred square, 0.40 fills 40 squares and 0.35 fills 35. Amy's plant grew more.",
          say: "On a hundred square, nought point four fills forty squares. Nought point three five fills thirty five. [pause] So Amy's plant grew more!",
          ms: 12500,
          scene: { stage: "grid" },
        },
        {
          id: "rule",
          caption: "The rule: line up the decimal points, fill any gaps with zeros, then compare from the left.",
          say: "So here's the rule. Line up the decimal points. Fill any gaps with zeros. [pause] Then compare from the left.",
          ms: 10500,
          scene: { stage: "rule" },
        },
      ],
      checkpoint: { prompt: "Which is bigger: 0.5 or 0.48? Type the bigger number.", answer: 0.5, hint: "0.5 is the same as 0.50. Is that more than 0.48?", replayBeat: 0, worked: "0.5 = 0.50, which is 50 hundredths. 0.48 is 48 hundredths, so **0.5** is bigger." },
    },
  ],
  film: {
    cues: [
      { id: "hook", text: "Amy's bean plant grew 0.4 metres. Ben's grew 0.35 metres. Whose plant grew more?", say: "Amy's bean plant grew nought point four metres. Ben's grew nought point three five metres. Whose plant grew more?", s: 9 },
      { id: "predict", text: "What do you think? Have a go in your head.", say: "What do you think? Have a go in your head. [think]", s: 6.5 },
      { id: "mistake", text: "Ben says his grew more, because 35 is bigger than 4. But is a longer number always bigger?", say: "Ben says his grew more, because thirty five is bigger than four. [pause] But is a longer number always bigger?", s: 9.5 },
      { id: "columns", text: "Let's use place-value columns. 0.4 has 4 tenths. 0.35 has 3 tenths and 5 hundredths.", say: "Let's use place-value columns. Nought point four has four tenths. [pause] Nought point three five has three tenths, and five hundredths.", s: 11 },
      { id: "tenths", text: "Compare the biggest place first: the tenths. 4 tenths is more than 3 tenths. So 0.4 is bigger!", say: "Compare the biggest place first. That's the tenths. [pause] Four tenths is more than three tenths. So nought point four is bigger!", s: 10.5 },
      { id: "zero", text: "Here's a trick: fill the gap with a zero. 0.4 is the same as 0.40: forty hundredths. 0.35 is thirty-five hundredths.", say: "Here's a trick. Fill the gap with a zero. Nought point four is the same as nought point four nought. That's forty hundredths. [pause] Nought point three five is thirty five hundredths.", s: 14 },
      { id: "grid", text: "On a hundred square, 0.4 fills forty squares, and 0.35 fills thirty-five. Amy's plant grew more!", say: "On a hundred square, nought point four fills forty squares. And nought point three five fills thirty five. [pause] Amy's plant grew more!", s: 11 },
      { id: "rule", text: "The rule: line up the points, fill gaps with zeros, then compare from the left.", say: "So here's the rule. Line up the points. Fill gaps with zeros. [pause] Then compare from the left.", s: 8.5 },
      { id: "your-turn", text: "Your turn: which is bigger, 0.6 or 0.58? 0.6 is 0.60: sixty hundredths. That's more than fifty-eight hundredths, so 0.6 is bigger.", say: "Your turn. Which is bigger, nought point six, or nought point five eight? [think] Nought point six is nought point six nought. Sixty hundredths. [pause] That's more than fifty eight hundredths. So nought point six is bigger. Well done!", s: 18.5 },
      { id: "recap", text: "Remember: a longer decimal isn't always bigger. Compare the tenths first.", say: "Remember. A longer decimal isn't always bigger. Compare the tenths first. Great work!", s: 7.5 },
    ],
    chapters: [
      { title: "The question", cue: "hook" },
      { title: "Longer is bigger?", cue: "mistake" },
      { title: "Place value", cue: "columns" },
      { title: "Fill the gap", cue: "zero" },
      { title: "Hundred square", cue: "grid" },
      { title: "Your turn", cue: "your-turn" },
    ],
  },
};
