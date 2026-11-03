import type { SkillId } from "@/engine/types";
import { addSubtract } from "@/topics/add-subtract";
import { areaPerimeter } from "@/topics/area-perimeter";
import { chartsData } from "@/topics/charts-data";
import { coordinates } from "@/topics/coordinates";
import { decimals } from "@/topics/decimals";
import { fractions2 } from "@/topics/fractions-2";
import { defineTopic, genFor, pick, templatesOf } from "@/topics/kit/define";
import type { KitQuestion, Template } from "@/topics/kit/types";
import { money } from "@/topics/money";
import { multiplyDivide } from "@/topics/multiply-divide";
import { negative } from "@/topics/negative";
import { percentages } from "@/topics/percentages";
import { placeValue } from "@/topics/place-value";
import { problemSolving } from "@/topics/problem-solving";
import { ratioAlgebra } from "@/topics/ratio-algebra";
import { rounding } from "@/topics/rounding";
import { shapesAngles } from "@/topics/shapes-angles";
import { time } from "@/topics/time";
import { timesTables } from "@/topics/times-tables";

/**
 * Mock exams: 11+ style mixed practice. Each area borrows the harder question makers from the islands it
 * covers, so a mock question is a real island question asked in exam conditions. The lessons teach exam
 * technique; the big challenge is a 12-question mini mock.
 */

const T = "mock-exams";
const gen = genFor(T);
const S = { number: `${T}.number`, calc: `${T}.calculation`, fdp: `${T}.fdp`, measure: `${T}.measures`, shape: `${T}.shape-data`, reasoning: `${T}.reasoning` };

type Body = ReturnType<Template["make"]>;
/** Misconceptions belong to the island that found them, so a borrowed question keeps the feedback but not the tag. */
function untag(body: Body): Body {
  const q = body as KitQuestion;
  if (q.kind === "choose") return { ...q, options: q.options.map((o) => ({ text: o.text, feedback: o.feedback })) } as Body;
  return { ...q, traps: q.traps?.map((t) => ({ value: t.value, feedback: t.feedback })) } as Body;
}

/** A mock question maker that borrows a level 2 or 3 question from one of these islands. */
function borrow(key: string, skill: SkillId, islands: { id: string }[]): Template {
  return {
    key,
    skill,
    difficulties: [2, 3],
    make: (r, base) => {
      const island = pick(r, islands);
      const makers = templatesOf(island.id).filter((t) => t.difficulties.some((d) => d >= 2));
      const t = pick(r, makers);
      const d = t.difficulties.includes(base.difficulty) ? base.difficulty : t.difficulties[t.difficulties.length - 1];
      return untag(t.make(r, { ...base, difficulty: d }));
    },
  };
}

const templates: Template[] = [
  borrow("mx-number", S.number, [placeValue, rounding, negative]),
  borrow("mx-calc", S.calc, [addSubtract, timesTables, multiplyDivide]),
  borrow("mx-fdp", S.fdp, [fractions2, decimals, percentages]),
  borrow("mx-measure", S.measure, [money, time, areaPerimeter]),
  borrow("mx-shape", S.shape, [shapesAngles, coordinates, chartsData]),
  borrow("mx-reasoning", S.reasoning, [ratioAlgebra, problemSolving]),
];

export const mockExams = defineTopic({
  id: T,
  title: "Mock exams",
  subtitle: "11+ style mixed questions from every island, and the exam skills to beat them",
  world: "summit",
  years: [5, 6],
  order: 3,
  icon: "exam",
  skills: [
    { id: S.number, title: "Number", description: "Place value, rounding and negative numbers, 11+ style.", lessonId: "estimate" },
    { id: S.calc, title: "Calculation", description: "Adding, subtracting, multiplying and dividing, 11+ style.", lessonId: "read" },
    { id: S.fdp, title: "Fractions, decimals and %", description: "Fractions, decimals and percentages, 11+ style.", lessonId: "same-amount" },
    { id: S.measure, title: "Measures", description: "Money, time, area and perimeter, 11+ style.", lessonId: "units" },
    { id: S.shape, title: "Shape and data", description: "Shapes, angles, coordinates, charts and tables, 11+ style.", lessonId: "diagrams" },
    { id: S.reasoning, title: "Reasoning", description: "Ratio, algebra and multi-step problems, 11+ style.", lessonId: "reasoning" },
  ],
  lessonIcons: { read: "book", estimate: "target", units: "ruler", "same-amount": "puzzle", diagrams: "chart", reasoning: "bulb" },
  lessons: [
    {
      id: "read",
      title: "Read it twice",
      phase: "Understand",
      summary: "Find the key words before you work anything out.",
      minutes: 6,
      objectives: ["Spot the key words in a question", "Answer the question that's asked"],
      steps: [
        {
          type: "explain",
          title: "Key words",
          body: ["**Altogether**, **total** and **sum** mean add. **Difference** and **how many more** mean take away.", "**Each** and **per** often mean multiply or divide. **Not** and **the rest** mean find the other part."],
          tip: "Read the last sentence again just before you answer: what does it actually ask for?",
        },
        { type: "check", title: "Try one", questionId: gen("mx-calc", 2, 3) },
        { type: "check", title: "And another", questionId: gen("mx-calc", 3, 8) },
      ],
    },
    {
      id: "estimate",
      title: "Estimate first",
      phase: "Visualise",
      summary: "A quick estimate catches silly answers.",
      minutes: 6,
      objectives: ["Estimate before you calculate", "Use the estimate to check"],
      steps: [
        {
          type: "explain",
          title: "Round, then check",
          body: ["Before 398 × 6, think: about **400 × 6 = 2,400**. An answer of 23,880 or 238 can't be right.", "In multiple choice, an estimate often rules out most of the options straight away."],
          tip: "Estimate, calculate, then compare. If they're far apart, look again.",
        },
        { type: "check", title: "Try one", questionId: gen("mx-number", 2, 4) },
        { type: "check", title: "And another", questionId: gen("mx-number", 3, 9) },
      ],
    },
    {
      id: "units",
      title: "Units and answers",
      phase: "Practise",
      summary: "Change to the same unit before you calculate.",
      minutes: 6,
      objectives: ["Use matching units", "Give the answer in the unit asked for"],
      steps: [
        {
          type: "explain",
          title: "Match the units",
          body: ["**1 m = 100 cm**, **£1 = 100p**, **1 hour = 60 minutes**, **1 kg = 1,000 g**.", "If one amount is in metres and one in centimetres, change them to the same unit first."],
          tip: "Check the unit next to the answer box before you type.",
        },
        { type: "check", title: "Try one", questionId: gen("mx-measure", 2, 2) },
        { type: "check", title: "And another", questionId: gen("mx-measure", 3, 5) },
      ],
    },
    {
      id: "same-amount",
      title: "Same amount, three ways",
      phase: "Explore",
      summary: "Fractions, decimals and percentages are the same amounts in different clothes.",
      minutes: 6,
      objectives: ["Switch between fractions, decimals and percentages"],
      steps: [
        {
          type: "explain",
          title: "Know the pairs",
          body: ["**{1/2} = 0.5 = 50%**, **{1/4} = 0.25 = 25%**, **{3/4} = 0.75 = 75%**, **{1/10} = 0.1 = 10%**, **{1/5} = 0.2 = 20%**.", "To compare a mix of them, change them all into the same form first."],
          visual: { kind: "grid100", shaded: 75 },
        },
        { type: "check", title: "Try one", questionId: gen("mx-fdp", 2, 6) },
        { type: "check", title: "And another", questionId: gen("mx-fdp", 3, 1) },
      ],
    },
    {
      id: "diagrams",
      title: "Use the picture",
      phase: "Apply",
      summary: "Read the scale, the key and the labels before you answer.",
      minutes: 6,
      objectives: ["Read charts, grids and diagrams carefully"],
      steps: [
        {
          type: "explain",
          title: "Look before you count",
          body: ["On a chart, check the **scale**: does it go up in 1s, 2s, 5s or 10s? On a pictogram, read the **key**.", "Diagrams in the 11+ are often **not drawn to scale**: use the numbers, not a ruler."],
          tip: "Put your finger on the picture as you read it.",
        },
        { type: "check", title: "Try one", questionId: gen("mx-shape", 2, 7) },
        { type: "check", title: "And another", questionId: gen("mx-shape", 3, 2) },
      ],
    },
    {
      id: "reasoning",
      title: "Show your thinking",
      phase: "Apply",
      summary: "Draw a bar, work backwards, and check your answer fits.",
      minutes: 7,
      objectives: ["Use bar models and working backwards in tricky problems"],
      steps: [
        {
          type: "explain",
          title: "Tools for tricky problems",
          body: ["Draw a **bar model** when amounts are compared or shared.", "**Work backwards** when you know the end and need the start. Then put your answer back into the question to check it fits."],
          visual: { kind: "bar", parts: [{ label: "?", tone: "num" }, { label: "?", tone: "brand" }, { label: "?", tone: "brand" }], total: "36" },
        },
        { type: "check", title: "Try one", questionId: gen("mx-reasoning", 2, 3) },
        { type: "check", title: "And another", questionId: gen("mx-reasoning", 3, 4) },
      ],
    },
  ],
  templates,
  misconceptions: [],
  placement: [
    { lessonId: "read", template: "mx-calc" },
    { lessonId: "estimate", template: "mx-number" },
    { lessonId: "units", template: "mx-measure" },
    { lessonId: "same-amount", template: "mx-fdp" },
    { lessonId: "diagrams", template: "mx-shape" },
    { lessonId: "reasoning", template: "mx-reasoning" },
  ],
});
