import { genFor, int, type TopicExtra } from "@/topics/kit/define";
import type { Template } from "@/topics/kit/types";

/** D-038: area of parallelograms and triangles (Y6.MEAS.6), using the perpendicular height. */

const T = "area-perimeter";
const gen = genFor(T);
const SKILL = `${T}.triangles-parallelograms`;
const M = { noHalf: `${T}.triangle-no-half`, slant: `${T}.slant-as-height` };

const templates: Template[] = [
  {
    key: "ap-parallelogram",
    skill: SKILL,
    difficulties: [1, 2],
    make: (r, { difficulty }) => {
      const b = int(r, 4, 12);
      const h = int(r, 3, 9);
      const slant = h + int(r, 1, 3);
      return {
        kind: "number",
        prompt: "What is the **area** of this parallelogram?",
        visual: { kind: "base-height", shape: "parallelogram", base: `${b} cm`, height: `${h} cm`, ...(difficulty === 2 ? { slant: `${slant} cm` } : {}) },
        answer: b * h,
        unit: "cm²",
        traps: [...(difficulty === 2 ? [{ value: b * slant, misconception: M.slant, feedback: "Use the height at right angles to the base (the dashed line), not the slanted side." }] : []), { value: b + h, feedback: "Area multiplies the base by the height." }],
        hint: "Area of a parallelogram = base × height.",
        hints: ["Cut the triangle off one end and move it to the other: it becomes a rectangle.", `${b} × ${h}.`],
        explanation: `A parallelogram rearranges into a rectangle ${b} cm by ${h} cm: ${b} × ${h} = **${b * h} cm²**.`,
      };
    },
  },
  {
    key: "ap-triangle",
    skill: SKILL,
    difficulties: [1, 2],
    make: (r, { difficulty }) => {
      let b = 0;
      let h = 0;
      do [b, h] = [int(r, 4, 14), int(r, 3, 10)];
      while ((b * h) % 2 !== 0);
      const slant = h + int(r, 1, 4);
      const answer = (b * h) / 2;
      const slantArea = (b * slant) / 2;
      return {
        kind: "number",
        prompt: "What is the **area** of this triangle?",
        visual: { kind: "base-height", shape: "triangle", base: `${b} cm`, height: `${h} cm`, ...(difficulty === 2 ? { slant: `${slant} cm` } : {}) },
        answer,
        unit: "cm²",
        traps: [{ value: b * h, misconception: M.noHalf, feedback: "A triangle is half of a rectangle with the same base and height: halve it." }, ...(difficulty === 2 && Number.isInteger(slantArea) ? [{ value: slantArea, misconception: M.slant, feedback: "Use the height at right angles to the base (the dashed line), not the slanted side." }] : [])],
        hint: "Area of a triangle = base × height ÷ 2.",
        hints: ["A triangle is half of a rectangle with the same base and height.", `${b} × ${h} = ${b * h}, then halve it.`],
        explanation: `${b} × ${h} = ${b * h}, and the triangle is half of that: **${answer} cm²**.`,
      };
    },
  },
  {
    key: "ap-tri-stretch",
    skill: SKILL,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const b = int(r, 4, 12);
      const h = 2 * int(r, 2, 8);
      const area = (b * h) / 2;
      return {
        kind: "number",
        prompt: `A triangle has an area of **${area} cm²** and a base of **${b} cm**. What is its **perpendicular height**?`,
        answer: h,
        unit: "cm",
        traps: [{ value: area / b, misconception: M.noHalf, feedback: "The area is base × height ÷ 2, so double the area before dividing by the base." }].filter((t) => Number.isInteger(t.value) && t.value !== h),
        hint: "Area = base × height ÷ 2. Undo it step by step.",
        hints: [`Double the area: ${area} × 2 = ${area * 2}. That is base × height.`, `${area * 2} ÷ ${b} = the height.`],
        explanation: `${area} × 2 = ${area * 2} = base × height. ${area * 2} ÷ ${b} = **${h} cm**.`,
      };
    },
  },
];

export const areaExtra: TopicExtra = {
  skills: [{ id: SKILL, title: "Triangles and parallelograms", description: "Find their area from the base and the perpendicular height.", lessonId: "triangles" }],
  lessonIcons: { triangles: "area" },
  lessons: [
    {
      id: "triangles",
      title: "Triangles and parallelograms",
      phase: "Apply",
      summary: "Base × height for a parallelogram; half of it for a triangle.",
      minutes: 9,
      objectives: ["Find the area of a parallelogram", "Find the area of a triangle"],
      steps: [
        {
          type: "explain",
          title: "Cut and move",
          body: [
            "Cut the triangle off one end of a parallelogram and slide it to the other end: you get a **rectangle** with the same base and height. So the area of a parallelogram is **base × height**. The height is the **perpendicular** height (the dashed line), at right angles to the base, not the slanted side.",
            "Two identical triangles fit together to make a parallelogram, so a triangle is **half**: area = **base × height ÷ 2**. A triangle with a base of 8 cm and a height of 5 cm has an area of 8 × 5 ÷ 2 = **20 cm²**.",
          ],
          visual: { kind: "base-height", shape: "parallelogram", base: "8 cm", height: "5 cm", slant: "6 cm" },
          tip: "Find the dashed height line; ignore the slanted side.",
        },
        {
          type: "worked",
          title: "Watch me: a parallelogram",
          support: "full",
          problem: "Find the area of a parallelogram with a base of **9 cm** and a perpendicular height of **4 cm**.",
          visual: { kind: "base-height", shape: "parallelogram", base: "9 cm", height: "4 cm" },
          steps: [{ text: "Area = base × height." }, { text: "9 × 4 = 36." }],
          conclusion: "The area is **36 cm²**.",
        },
        {
          type: "worked",
          title: "Let's do it together",
          support: "faded",
          problem: "Find the area of a triangle with a base of **8 cm** and a height of **5 cm**.",
          visual: { kind: "base-height", shape: "triangle", base: "8 cm", height: "5 cm" },
          steps: [
            { text: "Base × height: 8 × 5 = 40." },
            { text: "A triangle is half of that.", blank: { prompt: "Area in cm²?", answer: 20, hint: "40 ÷ 2.", traps: [{ value: 40, misconception: M.noHalf, feedback: "That is the whole rectangle. The triangle is half of it." }], worked: "40 ÷ 2 = **20** cm²." } },
          ],
          conclusion: "The area is **20 cm²**.",
        },
        { type: "check", title: "Your turn", questionId: gen("ap-parallelogram", 1, 3) },
        { type: "check", title: "One more", questionId: gen("ap-triangle", 1, 5) },
      ],
    },
  ],
  templates,
  misconceptions: [
    {
      id: M.noHalf,
      name: "Triangle not halved",
      possibleCause: "You might have multiplied the base by the height and forgotten to halve it.",
      description: "Gives base × height as the area of a triangle.",
      explanation: ["Two identical triangles make a parallelogram.", "So a triangle's area is base × height ÷ 2."],
      skills: [SKILL],
      followUpTemplates: ["ap-triangle"],
    },
    {
      id: M.slant,
      name: "Slanted side used as the height",
      possibleCause: "You might have used the slanted side instead of the height at right angles to the base.",
      description: "Multiplies the base by a slanted side to find the area of a parallelogram or triangle.",
      explanation: ["The height must be perpendicular to the base: the dashed line.", "The slanted side is longer, so it gives too big an area."],
      skills: [SKILL],
      followUpTemplates: ["ap-parallelogram", "ap-triangle"],
    },
  ],
  placement: [{ lessonId: "triangles", template: "ap-triangle" }],
};
