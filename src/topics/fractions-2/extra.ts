import { divide, multiply, simplify, type Fraction } from "@/maths/fraction";
import { genFor, int, pick, withAnswer, type TopicExtra } from "@/topics/kit/define";
import type { ChooseOption, Rng, Template } from "@/topics/kit/types";

/** D-037: multiplying pairs of proper fractions (Y6.FRAC.4) and dividing a proper fraction by a whole number (Y6.FRAC.5). */

const T = "fractions-2";
const gen = genFor(T);
const S = { times: `${T}.multiply-fractions`, divide: `${T}.divide-whole` };
const M = { addAcross: `${T}.times-adds`, divideTimes: `${T}.divide-multiplies`, notSimplest: `${T}.not-simplest` };

const f = (x: Fraction) => `{${x.n}/${x.d}}`;
const fs = (n: number, d: number) => f(simplify({ n, d }));
const same = (a: Fraction, b: Fraction) => a.n * b.d === b.n * a.d;

/** A proper fraction with a denominator from 2 to `maxD`. */
function proper(r: Rng, maxD: number): Fraction {
  const d = int(r, 2, maxD);
  return { n: int(r, 1, d - 1), d };
}

/** Options for a fraction answer: the right one in simplest form, then wrong ones, none equal to it in value or text. */
function fractionOptions(r: Rng, right: Fraction, unsimplified: Fraction, wrong: { x: Fraction; misconception?: string; feedback: string }[]) {
  const rightText = f(simplify(right));
  const out: ChooseOption[] = [];
  const seen = new Set([rightText]);
  if (f(unsimplified) !== rightText) {
    out.push({ text: f(unsimplified), misconception: M.notSimplest, feedback: "That is the right amount, but not in its simplest form. Divide the top and bottom by a common factor." });
    seen.add(f(unsimplified));
  }
  for (const w of wrong) {
    const text = fs(w.x.n, w.x.d);
    if (seen.has(text) || same(w.x, right) || w.x.n <= 0) continue;
    seen.add(text);
    out.push({ text, ...(w.misconception ? { misconception: w.misconception } : {}), feedback: w.feedback });
  }
  return withAnswer(r, { text: rightText } as ChooseOption, out.slice(0, 3));
}

const timesSteps = (a: Fraction, b: Fraction) => {
  const raw = { n: a.n * b.n, d: a.d * b.d };
  const s = simplify(raw);
  return `Tops: ${a.n} × ${b.n} = ${raw.n}. Bottoms: ${a.d} × ${b.d} = ${raw.d}. So ${f(a)} × ${f(b)} = ${f(raw)}${s.d !== raw.d ? `, which simplifies to ${f(s)}` : ""}`;
};
const divideSteps = (a: Fraction, k: number) => {
  const raw = { n: a.n, d: a.d * k };
  const s = simplify(raw);
  return `Keep the top, ${a.n}. Bottom: ${a.d} × ${k} = ${raw.d}. So ${f(a)} ÷ ${k} = ${f(raw)}${s.d !== raw.d ? `, which simplifies to ${f(s)}` : ""}`;
};

function timesQuestion(r: Rng, a: Fraction, b: Fraction, prompt: string) {
  const raw = { n: a.n * b.n, d: a.d * b.d };
  const right = multiply(a, b);
  const { options, answer } = fractionOptions(r, right, raw, [
    { x: { n: a.n + b.n, d: a.d + b.d }, misconception: M.addAcross, feedback: "Multiplying fractions multiplies the tops and multiplies the bottoms; it doesn't add them." },
    { x: { n: a.n * b.n, d: a.d }, feedback: "Multiply the bottoms too." },
    { x: { n: a.n * b.d, d: a.d * b.n }, feedback: "That divides instead of multiplying. Multiply top × top and bottom × bottom." },
    { x: { n: a.n * b.n + 1, d: a.d * b.d }, feedback: "Check the top: multiply the two tops." },
  ]);
  return {
    kind: "choose" as const,
    prompt: `${prompt} Give the answer in its simplest form.`,
    options,
    answer,
    hint: "Multiply the tops, then multiply the bottoms.",
    hints: [`Top: ${a.n} × ${b.n} = ${a.n * b.n}. Bottom: ${a.d} × ${b.d} = ${a.d * b.d}.`, "Then simplify: divide the top and bottom by their biggest common factor."],
    explanation: `${timesSteps(a, b)}. The answer is **${f(right)}**.`,
  };
}

function divideQuestion(r: Rng, a: Fraction, k: number, prompt: string) {
  const raw = { n: a.n, d: a.d * k };
  const right = divide(a, { n: k, d: 1 });
  const { options, answer } = fractionOptions(r, right, raw, [
    { x: { n: a.n * k, d: a.d }, misconception: M.divideTimes, feedback: "That multiplies. Dividing into more parts makes each part smaller." },
    { x: { n: a.n, d: a.d + k }, feedback: "Multiply the bottom by the number you divide by; don't add it." },
    { x: { n: a.n * k, d: a.d * k }, feedback: "That is the same as the fraction you started with: it hasn't been divided." },
    { x: { n: a.n, d: a.d * k + 1 }, feedback: `Check the bottom: ${a.d} × ${k}.` },
  ]);
  return {
    kind: "choose" as const,
    prompt: `${prompt} Give the answer in its simplest form.`,
    options,
    answer,
    hint: "Dividing by a whole number splits each part into that many smaller parts.",
    hints: [`Keep the top. Multiply the bottom by ${k}: ${a.d} × ${k} = ${a.d * k}.`, "Then simplify if you can."],
    explanation: `${divideSteps(a, k)}. The answer is **${f(right)}**.`,
  };
}

const templates: Template[] = [
  {
    key: "f2-frac-times",
    skill: S.times,
    difficulties: [2, 3],
    make: (r, { difficulty }) => {
      const a = proper(r, difficulty === 2 ? 5 : 9);
      const b = proper(r, difficulty === 2 ? 5 : 9);
      return timesQuestion(r, a, b, `Work out **${f(a)} × ${f(b)}**.`);
    },
  },
  {
    key: "f2-frac-of-frac",
    skill: S.times,
    difficulties: [2],
    make: (r) => {
      const a = { n: 1, d: int(r, 2, 5) };
      const b = proper(r, 6);
      return { ...timesQuestion(r, a, b, `What is **${f(a)} of ${f(b)}**?`), hint: "\"Of\" means multiply.", visual: { kind: "fraction" as const, parts: b.d, shaded: b.n, label: f(b).replace(/[{}]/g, "") } };
    },
  },
  {
    key: "f2-frac-times-stretch",
    skill: S.times,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const a = pick(r, [{ n: 3, d: 4 }, { n: 2, d: 3 }, { n: 4, d: 5 }, { n: 5, d: 6 }]);
      const b = pick(r, [{ n: 1, d: 2 }, { n: 2, d: 3 }, { n: 3, d: 4 }, { n: 3, d: 5 }]);
      return timesQuestion(r, a, b, `${f(a)} of a garden is grass. ${f(b)} of the grass has daisies in it. What fraction of the **whole garden** has daisies?`);
    },
  },
  {
    key: "f2-div-whole",
    skill: S.divide,
    difficulties: [2, 3],
    make: (r, { difficulty }) => {
      const a = proper(r, difficulty === 2 ? 5 : 9);
      const k = int(r, 2, difficulty === 2 ? 4 : 6);
      return divideQuestion(r, a, k, `Work out **${f(a)} ÷ ${k}**.`);
    },
  },
  {
    key: "f2-div-share",
    skill: S.divide,
    difficulties: [2],
    make: (r) => {
      const a = pick(r, [{ n: 1, d: 2 }, { n: 1, d: 3 }, { n: 1, d: 4 }, { n: 2, d: 3 }, { n: 3, d: 4 }]);
      const k = int(r, 2, 4);
      return { ...divideQuestion(r, a, k, `${f(a)} of a pizza is left. ${k} children share it equally. What fraction of the **whole pizza** does each child get?`), visual: { kind: "fraction" as const, parts: a.d, shaded: a.n, shape: "circle" as const } };
    },
  },
  {
    key: "f2-div-stretch",
    skill: S.divide,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const a = pick(r, [{ n: 4, d: 5 }, { n: 3, d: 4 }, { n: 2, d: 3 }, { n: 5, d: 8 }]);
      const k = pick(r, [2, 3, 4, 6]);
      return divideQuestion(r, a, k, `A ribbon is ${f(a)} of a metre long. It is cut into **${k} equal pieces**. What fraction of a metre is each piece?`);
    },
  },
];

export const fractions2Extra: TopicExtra = {
  skills: [
    { id: S.times, title: "Fraction × fraction", description: "Multiply two proper fractions and simplify the answer.", lessonId: "times-fractions" },
    { id: S.divide, title: "Fraction ÷ whole number", description: "Divide a proper fraction by a whole number.", lessonId: "divide-fractions" },
  ],
  lessonIcons: { "times-fractions": "pizza", "divide-fractions": "fraction-bar" },
  lessons: [
    {
      id: "times-fractions",
      title: "Multiply two fractions",
      phase: "Explore",
      summary: "Multiply the tops, multiply the bottoms, then simplify.",
      minutes: 8,
      objectives: ["Multiply two proper fractions", "Write the answer in its simplest form"],
      steps: [
        {
          type: "explain",
          title: "Half of three quarters",
          body: [
            "**{1/2} × {3/4}** means half of three quarters. Cut a bar into quarters and shade 3. Now cut every quarter in half: there are **8** small parts, and half of the shaded part is **3** of them. So {1/2} × {3/4} = **{3/8}**.",
            "That is the rule: **multiply the tops** (1 × 3 = 3) and **multiply the bottoms** (2 × 4 = 8). Then simplify if you can. The answer is smaller than both fractions, because you are taking a part of a part.",
          ],
          visual: { kind: "fraction", parts: 8, shaded: 3, label: "3/8" },
          tip: "\"Of\" means multiply: {1/3} of {3/5} is {1/3} × {3/5}.",
        },
        {
          type: "worked",
          title: "Watch me: {2/3} × {3/4}",
          support: "full",
          problem: "Work out **{2/3} × {3/4}**.",
          steps: [{ text: "Tops: 2 × 3 = 6. Bottoms: 3 × 4 = 12. So {6/12}." }, { text: "6 and 12 share the factor 6: {6/12} = {1/2}." }],
          conclusion: "{2/3} × {3/4} = **{1/2}**.",
        },
        {
          type: "worked",
          title: "Let's do it together",
          support: "faded",
          problem: "Work out **{3/5} × {2/7}**.",
          steps: [
            { text: "Tops: 3 × 2 = 6." },
            { text: "Now the bottoms.", blank: { prompt: "5 × 7 = ?", answer: 35, hint: "Multiply the two bottoms.", traps: [{ value: 12, misconception: M.addAcross, feedback: "Multiply the bottoms, don't add them: 5 × 7." }], worked: "5 × 7 = **35**, so the answer is {6/35}." } },
          ],
          conclusion: "{3/5} × {2/7} = **{6/35}**.",
        },
        { type: "check", title: "Your turn", questionId: gen("f2-frac-times", 2, 3) },
        { type: "check", title: "One more", questionId: gen("f2-frac-of-frac", 2, 5) },
      ],
    },
    {
      id: "divide-fractions",
      title: "Divide a fraction by a whole number",
      phase: "Apply",
      summary: "Share each part out: keep the top, multiply the bottom.",
      minutes: 8,
      objectives: ["Divide a proper fraction by a whole number", "Use it to share a fraction equally"],
      steps: [
        {
          type: "explain",
          title: "Share it out",
          body: [
            "**{1/2} ÷ 3** means share half of something equally between 3. Cut the half into 3 pieces. Do the same to the other half and the whole has **6** pieces, so each share is **{1/6}**.",
            "The rule: **keep the top** and **multiply the bottom** by the whole number. {3/4} ÷ 2 = {3/8}. Dividing makes each share smaller, so the answer is always less than the fraction you started with.",
          ],
          visual: { kind: "fraction", parts: 6, shaded: 1, label: "1/6" },
          tip: "Dividing by 3 is the same as finding {1/3} of it.",
        },
        {
          type: "worked",
          title: "Watch me: {4/5} ÷ 2",
          support: "full",
          problem: "Work out **{4/5} ÷ 2**.",
          steps: [{ text: "Keep the top: 4. Multiply the bottom: 5 × 2 = 10. So {4/10}." }, { text: "Simplify: {4/10} = {2/5}." }],
          conclusion: "{4/5} ÷ 2 = **{2/5}**.",
        },
        {
          type: "worked",
          title: "Let's do it together",
          support: "faded",
          problem: "Work out **{2/3} ÷ 4**.",
          steps: [
            { text: "Keep the top: 2." },
            { text: "Multiply the bottom by 4.", blank: { prompt: "3 × 4 = ?", answer: 12, hint: "The bottom times the whole number.", traps: [{ value: 7, feedback: "Multiply the bottom by 4, don't add 4." }, { value: 3, misconception: M.divideTimes, feedback: "Dividing makes the parts smaller: the bottom gets bigger." }], worked: "3 × 4 = **12**: {2/12}, which simplifies to {1/6}." } },
          ],
          conclusion: "{2/3} ÷ 4 = **{1/6}**.",
        },
        { type: "check", title: "Your turn", questionId: gen("f2-div-whole", 2, 3) },
        { type: "check", title: "One more", questionId: gen("f2-div-share", 2, 5) },
      ],
    },
  ],
  templates,
  misconceptions: [
    {
      id: M.addAcross,
      name: "Multiplying adds across",
      possibleCause: "You might have added the tops and the bottoms instead of multiplying them.",
      description: "Multiplies two fractions by adding the tops and adding the bottoms.",
      explanation: ["Multiply top × top and bottom × bottom.", "{1/2} × {1/3} = {1/6}: half of a third is a sixth."],
      skills: [S.times],
      followUpTemplates: ["f2-frac-times"],
    },
    {
      id: M.divideTimes,
      name: "Dividing makes it bigger",
      possibleCause: "You might have multiplied the top by the whole number instead of dividing.",
      description: "Divides a fraction by a whole number by multiplying the top, so the answer grows.",
      explanation: ["Sharing a fraction makes each share smaller.", "Keep the top and multiply the bottom: {1/2} ÷ 3 = {1/6}."],
      skills: [S.divide],
      followUpTemplates: ["f2-div-whole"],
    },
  ],
  placement: [
    { lessonId: "times-fractions", template: "f2-frac-times" },
    { lessonId: "divide-fractions", template: "f2-div-whole" },
  ],
};
