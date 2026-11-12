import { add, subtract, toMixed, type Fraction } from "@/maths/fraction";
import { lcm } from "@/maths/integer";
import { genFor, int, pick, withAnswer, type TopicExtra } from "@/topics/kit/define";
import type { ChooseOption, Rng, Template } from "@/topics/kit/types";

/**
 * D-041: adding and subtracting fractions with different denominators that are not multiples of each other
 * (Y6.FRAC.3, which `add-related` only partly covered). Cut both into the same size pieces (a common multiple of the
 * denominators), then add or take away the tops. Mixed numbers stay with the `mixed` lesson.
 */

const T = "fractions-2";
const gen = genFor(T);
export const ADD_DIFFERENT = `${T}.add-different`;
/** The misconceptions already defined in `index.ts`: adding the bottoms, and adding before the parts match. */
const M = { addDen: `${T}.add-denominators`, noCommon: `${T}.no-common-denominator` };

const NAME: Record<number, string> = { 2: "halves", 3: "thirds", 4: "quarters", 5: "fifths", 6: "sixths", 8: "eighths", 10: "tenths" };
const PART: Record<number, string> = { 6: "sixths", 10: "tenths", 12: "twelfths", 15: "fifteenths", 20: "twentieths", 24: "twenty-fourths" };
const f = (x: Fraction) => `{${x.n}/${x.d}}`;
/** Simplest form, as a mixed number when it is more than one. */
function best(x: Fraction): string {
  const m = toMixed(x);
  if (m.n === 0) return `${m.whole}`;
  return m.whole > 0 ? `${m.whole} {${m.n}/${m.d}}` : `{${m.n}/${m.d}}`;
}
/** Exact equality of two fractions (cross-multiplication of small integers). */
const same = (a: Fraction, b: Fraction) => a.n * b.d === b.n * a.d;

/** Denominator pairs that are not multiples of each other. Easier pairs have a common denominator equal to their product. */
const PAIRS: Record<2 | 3, [number, number][]> = {
  2: [[2, 3], [3, 4], [2, 5], [3, 5], [4, 5]],
  3: [[4, 6], [6, 8], [4, 10], [3, 4], [2, 5], [5, 6]],
};

function pair(r: Rng, difficulty: 2 | 3): { a: Fraction; b: Fraction; d: number } {
  const [p, q] = pick(r, PAIRS[difficulty]);
  return { a: { n: int(r, 1, p - 1), d: p }, b: { n: int(r, 1, q - 1), d: q }, d: lcm(p, q) };
}

/** The right answer and wrong ones; a wrong option is dropped if its text repeats or it is worth the right amount. */
function options(r: Rng, right: Fraction, wrong: { x: Fraction; misconception?: string; feedback: string }[]) {
  const rightText = best(right);
  const seen = new Set([rightText]);
  const out: ChooseOption[] = [];
  for (const w of wrong) {
    if (w.x.n <= 0 || same(w.x, right)) continue;
    const text = best(w.x);
    if (seen.has(text)) continue;
    seen.add(text);
    out.push({ text, ...(w.misconception ? { misconception: w.misconception } : {}), feedback: w.feedback });
  }
  return withAnswer(r, { text: rightText } as ChooseOption, out.slice(0, 3));
}

/** The worked answer for a ± b: change both into the common pieces, then combine the tops. */
function steps(a: Fraction, b: Fraction, d: number, sign: "+" | "−") {
  const an = a.n * (d / a.d);
  const bn = b.n * (d / b.d);
  const top = sign === "+" ? an + bn : an - bn;
  return { an, bn, top, text: `${f(a)} = ${f({ n: an, d })} and ${f(b)} = ${f({ n: bn, d })}. ${f({ n: an, d })} ${sign} ${f({ n: bn, d })} = ${f({ n: top, d })}` };
}

function addQuestion(r: Rng, a: Fraction, b: Fraction, d: number, prompt: string) {
  const right = add(a, b);
  const s = steps(a, b, d, "+");
  const { options: opts, answer } = options(r, right, [
    { x: { n: a.n + b.n, d: a.d + b.d }, misconception: M.addDen, feedback: "That adds the bottoms too. The bottom says how big the pieces are: make them the same size first." },
    { x: { n: a.n + b.n, d }, misconception: M.noCommon, feedback: `The pieces must match first: ${f(a)} is ${s.an} ${PART[d] ?? "pieces"}, not ${a.n}.` },
    { x: { n: s.top + 1, d }, feedback: `Check the tops: ${s.an} + ${s.bn}.` },
    { x: { n: Math.max(1, s.top - 1), d }, feedback: `Check the tops: ${s.an} + ${s.bn}.` },
  ]);
  return {
    kind: "choose" as const,
    prompt,
    options: opts,
    answer,
    hint: `Cut both into ${PART[d] ?? `pieces of ${d}`}: ${d} is in both the ${a.d} and the ${b.d} times tables.`,
    hints: [`${f(a)} = ${f({ n: s.an, d })} and ${f(b)} = ${f({ n: s.bn, d })}.`, "Now add the tops. The bottom stays the same."],
    explanation: `${s.text}, so the answer is **${best(right)}**.`,
  };
}

/** Two fractions, the first bigger (never equal), so taking away gives a positive answer. */
function biggerFirst(r: Rng, difficulty: 2 | 3) {
  let { a, b, d } = pair(r, difficulty);
  while (a.n * b.d === b.n * a.d) ({ a, b, d } = pair(r, difficulty));
  if (a.n * b.d < b.n * a.d) [a, b] = [b, a];
  return { a, b, d };
}

function subtractQuestion(r: Rng, a: Fraction, b: Fraction, d: number, prompt: string) {
  const right = subtract(a, b);
  const s = steps(a, b, d, "−");
  const { options: opts, answer } = options(r, right, [
    { x: { n: Math.abs(a.n - b.n) || 1, d: Math.abs(a.d - b.d) || 1 }, misconception: M.addDen, feedback: "That takes away the bottoms too. Make the pieces the same size first." },
    { x: { n: Math.abs(a.n - b.n) || 1, d }, misconception: M.noCommon, feedback: `Change both into ${PART[d] ?? "the same pieces"} first: ${f(a)} = ${f({ n: s.an, d })}.` },
    { x: { n: s.top + 1, d }, feedback: `Check the tops: ${s.an} − ${s.bn}.` },
    { x: { n: s.an + s.bn, d }, feedback: "That adds. Take away the second fraction." },
  ]);
  return {
    kind: "choose" as const,
    prompt,
    options: opts,
    answer,
    hint: `Cut both into ${PART[d] ?? `pieces of ${d}`} first.`,
    hints: [`${f(a)} = ${f({ n: s.an, d })} and ${f(b)} = ${f({ n: s.bn, d })}.`, "Now take away the tops. The bottom stays the same."],
    explanation: `${s.text}, so the answer is **${best(right)}**.`,
  };
}

const templates: Template[] = [
  {
    key: "f2-add-diff",
    skill: ADD_DIFFERENT,
    difficulties: [2, 3],
    make: (r, { difficulty }) => {
      const { a, b, d } = pair(r, difficulty === 3 ? 3 : 2);
      return { ...addQuestion(r, a, b, d, `Work out **${f(a)} + ${f(b)}**. Give the answer in its simplest form.`), visual: { kind: "fraction" as const, parts: d, shaded: steps(a, b, d, "+").top % d || d, label: `${PART[d] ?? `${d} parts`}` } };
    },
  },
  {
    key: "f2-diff-common",
    skill: ADD_DIFFERENT,
    difficulties: [1, 2],
    make: (r, { difficulty }) => {
      const { a, b, d } = pair(r, difficulty === 1 ? 2 : 3);
      const an = a.n * (d / a.d);
      return {
        kind: "number" as const,
        prompt: `To add **${f(a)}** and **${f(b)}**, we cut both into ${PART[d] ?? `${d} equal pieces`}. How many ${PART[d] ?? "pieces"} is ${f(a)}?`,
        answer: an,
        traps: [{ value: a.n, misconception: M.noCommon, feedback: `Each ${a.d === 2 ? "half" : "piece"} is cut into ${d / a.d}, so multiply the top by ${d / a.d}.` }].filter((t) => t.value !== an),
        hint: `${a.d} × ${d / a.d} = ${d}.`,
        hints: [`Multiply the top by the same number: ${a.n} × ${d / a.d}.`],
        explanation: `${f(a)} = ${f({ n: an, d })}: **${an}** ${PART[d] ?? "pieces"}.`,
      };
    },
  },
  {
    key: "f2-diff-denominator",
    skill: ADD_DIFFERENT,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const [p, q] = pick(r, PAIRS[difficulty === 3 ? 3 : 2]);
      const d = lcm(p, q);
      const traps = [
        { value: p + q, misconception: M.addDen, feedback: `Adding ${p} and ${q} doesn't make pieces that fit both. Look for a number in both times tables.` },
        ...(p * q !== d ? [{ value: p * q, feedback: `${p * q} works, but there is a smaller one in both the ${p} and the ${q} times tables.` }] : []),
      ].filter((t) => t.value !== d);
      return {
        kind: "number" as const,
        prompt: `To add a fraction in **${NAME[p]}** and one in **${NAME[q]}**, what is the **smallest** denominator both can be changed into?`,
        answer: d,
        traps,
        hint: `Count up in ${Math.max(p, q)}s until you reach a number in the ${Math.min(p, q)} times table.`,
        hints: [`The ${p} times table: ${p}, ${p * 2}, ${p * 3}, … The ${q} times table: ${q}, ${q * 2}, ${q * 3}, …`],
        explanation: `**${d}** is the smallest number in both the ${p} and the ${q} times tables.`,
      };
    },
  },
  {
    key: "f2-diff-subtract",
    skill: ADD_DIFFERENT,
    difficulties: [2, 3],
    make: (r, { difficulty }) => {
      const { a, b, d } = biggerFirst(r, difficulty === 3 ? 3 : 2);
      return subtractQuestion(r, a, b, d, `Work out **${f(a)} − ${f(b)}**. Give the answer in its simplest form.`);
    },
  },
  {
    key: "f2-diff-apply",
    skill: ADD_DIFFERENT,
    difficulties: [2, 3],
    make: (r, { difficulty }) => {
      if (difficulty === 3) {
        const { a, b, d } = biggerFirst(r, 3);
        const [who, thing] = pick(r, [["Amy", "cake"], ["Kofi", "pizza"], ["Lena", "chocolate bar"]]);
        return { ...subtractQuestion(r, a, b, d, `${who} has ${f(a)} of a ${thing}. ${who} gives ${f(b)} of the whole ${thing} to a friend. What fraction of the ${thing} is left?`), hint: `Take away: ${f(a)} − ${f(b)}. Cut both into ${PART[d] ?? "the same pieces"} first.` };
      }
      const { a, b, d } = pair(r, 2);
      const prompt = pick(r, [
        `A ribbon is cut into two pieces: one is ${f(a)} of a metre and the other is ${f(b)} of a metre. How long was the ribbon, in metres?`,
        `A jug has ${f(a)} of a litre of juice in it. Ben pours in another ${f(b)} of a litre. How much juice is in the jug now, in litres?`,
        `${f(a)} of a garden is grass and ${f(b)} is flowers. What fraction of the garden is grass or flowers?`,
      ]);
      return addQuestion(r, a, b, d, prompt);
    },
  },
  {
    key: "f2-diff-why",
    skill: ADD_DIFFERENT,
    difficulties: [2],
    make: (r) => {
      const { a, b, d } = pair(r, 2);
      const right = add(a, b);
      const wrongSum = { n: a.n + b.n, d: a.d + b.d };
      const correct: ChooseOption = { text: `The slices are different sizes. He must change both into ${PART[d] ?? "the same size pieces"} before adding the tops.` };
      const { options: opts, answer } = withAnswer(r, correct, [
        { text: "He is right: add the tops and add the bottoms.", misconception: M.addDen, feedback: `Check: ${f(wrongSum)} is smaller than ${f(a.n * b.d > b.n * a.d ? a : b)} on its own, so adding can't give it.` },
        { text: "He should have multiplied the tops and the bottoms.", feedback: "Multiplying finds a fraction of a fraction. Here we are adding two amounts." },
        { text: "He should have taken the bottoms away from each other.", feedback: "The bottom number is the size of the pieces. We make the sizes match, not take them away." },
      ]);
      return {
        kind: "choose" as const,
        prompt: `Ben says **${f(a)} + ${f(b)} = ${f(wrongSum)}**. Why is he wrong?`,
        options: opts,
        answer,
        hint: "What does the bottom number of a fraction tell you?",
        hints: [`Is ${f(wrongSum)} bigger than ${f(a)}? Adding should make more.`],
        explanation: `The pieces must match first: ${steps(a, b, d, "+").text}, so ${f(a)} + ${f(b)} = **${best(right)}**, not ${f(wrongSum)}.`,
      };
    },
  },
  {
    key: "f2-add-diff-stretch",
    skill: ADD_DIFFERENT,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const [a, b] = pick(r, [
        [{ n: 1, d: 3 }, { n: 1, d: 4 }],
        [{ n: 2, d: 5 }, { n: 1, d: 3 }],
        [{ n: 1, d: 4 }, { n: 1, d: 6 }],
        [{ n: 3, d: 8 }, { n: 1, d: 6 }],
      ] as [Fraction, Fraction][]);
      const who = pick(r, [["Sam", "Mia"], ["Ravi", "Zoe"], ["Leo", "Ama"]]);
      const d = lcm(a.d, b.d);
      const q = addQuestion(r, a, b, d, `${who[0]} eats ${f(a)} of a pizza and ${who[1]} eats ${f(b)} of the **same** pizza. What fraction of the pizza have they eaten altogether?`);
      return { ...q, hints: [...q.hints, `Check: is your answer bigger than ${f(a)}? It must be.`] };
    },
  },
];

export const addDifferentExtra: TopicExtra = {
  skills: [{ id: ADD_DIFFERENT, title: "Add and subtract (different denominators)", description: "Add and take away fractions like 1/3 and 1/4 by cutting both into the same size pieces.", lessonId: "add-different" }],
  lessonIcons: { "add-different": "plus" },
  lessons: [
    {
      id: "add-different",
      title: "Different denominators",
      phase: "Apply",
      summary: "Cut both fractions into the same size pieces, then add or take away the tops.",
      minutes: 9,
      objectives: ["Find a denominator both fractions can change into", "Add and subtract fractions with different denominators", "Explain why the pieces must match first"],
      steps: [
        {
          type: "explain",
          title: "Make the pieces match",
          body: [
            "**{1/3} + {1/4}** is not {2/7}: {2/7} is smaller than {1/3} on its own, and adding can't make less.",
            "Thirds and quarters are different sizes, so we can't count them together yet. Cut both into pieces that fit each: 3 × 4 = **12**, so use **twelfths**.",
            "{1/3} = {4/12} and {1/4} = {3/12}. Now the pieces match: 4 twelfths + 3 twelfths = **{7/12}**.",
          ],
          visual: { kind: "fraction", parts: 12, shaded: 7, label: "4 twelfths + 3 twelfths" },
          tip: "The bottom number is the size of the pieces. Make the sizes the same, then add the tops.",
        },
        { type: "lab", title: "Watch it, step through it, or try it", body: [], explainer: "add-fractions-modes", numbers: [], challenges: [] },
        {
          type: "worked",
          title: "Watch me: {2/5} + {1/3}",
          support: "full",
          problem: "**{2/5} + {1/3}**",
          visual: { kind: "fraction", parts: 15, shaded: 11, label: "6 fifteenths + 5 fifteenths" },
          steps: [
            { text: "Fifths and thirds: 5 × 3 = **15**, so cut both into fifteenths." },
            { text: "{2/5} = {6/15} (multiply the top and bottom by 3). {1/3} = {5/15} (multiply by 5)." },
            { text: "{6/15} + {5/15} = **{11/15}**. Nothing divides both 11 and 15, so it is in its simplest form." },
          ],
          conclusion: "{2/5} + {1/3} = **{11/15}**.",
        },
        {
          type: "worked",
          title: "Together: {3/4} − {1/6}",
          support: "faded",
          problem: "**{3/4} − {1/6}**",
          steps: [
            { text: "Quarters and sixths: 12 is in both the 4 and the 6 times tables, so use twelfths." },
            {
              text: "Change {3/4} into twelfths.",
              blank: { prompt: "{3/4} is how many twelfths?", answer: 9, hint: "4 × 3 = 12, so multiply the top by 3 too.", traps: [{ value: 3, misconception: M.noCommon, feedback: "Each quarter is 3 twelfths, so 3 quarters are 9 twelfths." }], worked: "{3/4} = **{9/12}**." },
            },
            { text: "{1/6} = {2/12}. Then {9/12} − {2/12} = {7/12}." },
          ],
          conclusion: "{3/4} − {1/6} = **{7/12}**.",
        },
        { type: "check", title: "Your turn", questionId: gen("f2-diff-common", 1, 3) },
        { type: "check", title: "One more", questionId: gen("f2-add-diff", 2, 6) },
        { type: "check", title: "And take away", questionId: gen("f2-diff-subtract", 2, 4) },
      ],
    },
  ],
  templates,
  misconceptions: [],
  placement: [{ lessonId: "add-different", template: "f2-add-diff" }],
};
