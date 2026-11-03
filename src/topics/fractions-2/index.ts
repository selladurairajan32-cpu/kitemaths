import { defineTopic, genFor, int, pick } from "@/topics/kit/define";
import type { ChooseOption, Template } from "@/topics/kit/types";

/** Fractions 2: simplest form, mixed numbers, adding and subtracting, related denominators, multiplying by a whole. */

const T = "fractions-2";
const gen = genFor(T);
const S = { simplify: `${T}.simplify`, mixed: `${T}.mixed-numbers`, addSame: `${T}.add-same`, addRelated: `${T}.add-related`, multiply: `${T}.multiply` };
const M = {
  addDen: `${T}.add-denominators`,
  notSimplest: `${T}.not-simplest`,
  subtract: `${T}.subtract-top-and-bottom`,
  noCommon: `${T}.no-common-denominator`,
  mixed: `${T}.mixed-conversion`,
  timesBoth: `${T}.times-both`,
};

const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : Math.abs(a));
const f = (n: number, d: number) => `{${n}/${d}}`;
/** A fraction in its simplest form, written as a mixed number when it is more than one. */
function best(n: number, d: number): string {
  const g = gcd(n, d);
  const [a, b] = [n / g, d / g];
  if (b === 1) return `${a}`;
  if (a > b) return `${Math.floor(a / b)} ${f(a % b, b)}`;
  return f(a, b);
}
const PART: Record<number, string> = { 2: "halves", 3: "thirds", 4: "quarters", 5: "fifths", 6: "sixths", 7: "sevenths", 8: "eighths", 9: "ninths", 10: "tenths", 12: "twelfths", 15: "fifteenths", 16: "sixteenths", 20: "twentieths" };

type Wrong = ChooseOption & { value: number; allowSame?: boolean };
/**
 * Options with the right one first. A wrong option is dropped if its text repeats, or if it is secretly
 * worth the same as the right answer (so a correct answer is never marked wrong), unless it is meant to be
 * equal but not simplest (allowSame).
 */
function opts(right: string, rightValue: number, wrong: Wrong[]): ChooseOption[] {
  const out: ChooseOption[] = [{ text: right }];
  for (const { value, allowSame, ...w } of wrong) {
    if (out.some((o) => o.text === w.text)) continue;
    if (!allowSame && Math.abs(value - rightValue) < 1e-9) continue;
    out.push(w);
  }
  return out.slice(0, 4);
}

const templates: Template[] = [
  {
    key: "f2-simplify",
    skill: S.simplify,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      let a = 1;
      let b = 2;
      do {
        b = int(r, 2, difficulty === 1 ? 5 : 9);
        a = int(r, 1, b - 1);
      } while (gcd(a, b) !== 1);
      const k = difficulty === 1 ? int(r, 2, 3) : difficulty === 2 ? int(r, 2, 4) : pick(r, [4, 6, 8]);
      const [n, d] = [a * k, b * k];
      const half = k % 2 === 0 && k > 2 ? f(a * (k / 2), b * (k / 2)) : null;
      return {
        kind: "choose",
        prompt: `Write **${f(n, d)}** in its simplest form.`,
        visual: { kind: "fraction", parts: d, shaded: n },
        options: opts(f(a, b), a / b, [
          ...(half ? [{ text: half, value: a / b, allowSame: true, misconception: M.notSimplest, feedback: "That is equal, but it can be simplified more. Keep dividing until nothing else divides both." }] : []),
          { text: f(n - 1, d - 1), value: (n - 1) / (d - 1), misconception: M.subtract, feedback: "Taking the same amount off the top and bottom changes the size. Divide both by the same number instead." },
          { text: f(a, d), value: a / d, feedback: "Divide the top **and** the bottom by the same number." },
          { text: f(n, b), value: n / b, feedback: "Divide the top **and** the bottom by the same number." },
        ]),
        answer: 0,
        hint: `What is the biggest number that divides both ${n} and ${d}?`,
        explanation: `Divide the top and bottom by ${k}: ${f(n, d)} = **${f(a, b)}**.`,
      };
    },
  },
  {
    key: "f2-equivalent",
    skill: S.simplify,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const b = pick(r, difficulty === 1 ? [2, 3, 4, 5] : [3, 4, 5, 6]);
      const a = int(r, 1, b - 1);
      const k = int(r, 2, difficulty === 3 ? 5 : 3);
      const d = b * k;
      return {
        kind: "number",
        prompt: `**${f(a, b)}** is the same as how many **${PART[d] ?? `${d}ths`}**?`,
        visual: difficulty === 1 ? { kind: "fraction", parts: b, shaded: a, label: `${f(a, b).replace(/[{}]/g, "")}` } : undefined,
        answer: a * k,
        traps: [{ value: a + (d - b), misconception: M.subtract, feedback: `Multiply, don't add: the bottom was multiplied by ${k}, so multiply the top by ${k} too.` }].filter((t) => t.value !== a * k),
        hint: `${b} × ${k} = ${d}. Do the same to the top.`,
        explanation: `${f(a, b)} = ${f(a * k, d)}: **${a * k}** ${PART[d] ?? `${d}ths`}.`,
      };
    },
  },
  {
    key: "f2-to-mixed",
    skill: S.mixed,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const d = int(r, 2, difficulty === 1 ? 5 : 9);
      const whole = int(r, 1, difficulty === 3 ? 4 : 2);
      const rem = int(r, 1, d - 1);
      const n = whole * d + rem;
      return {
        kind: "choose",
        prompt: `Write **${f(n, d)}** as a mixed number.`,
        visual: difficulty === 1 ? { kind: "fraction", parts: d, shaded: n, wholes: whole + 1, shape: "circle" } : undefined,
        options: opts(`${whole} ${f(rem, d)}`, n / d, [
          { text: `${whole + 1} ${f(rem, d)}`, value: whole + 1 + rem / d, misconception: M.mixed, feedback: `${whole + 1} wholes would be ${(whole + 1) * d} ${PART[d]}, more than ${n}.` },
          { text: `${rem} ${f(whole, d)}`, value: rem + whole / d, misconception: M.mixed, feedback: "The whole number goes first: how many wholes are there?" },
          { text: `${whole} ${f(d - rem, d)}`, value: whole + (d - rem) / d, misconception: M.mixed, feedback: `After ${whole} whole${whole > 1 ? "s" : ""}, there are ${rem} ${PART[d]} left, not ${d - rem}.` },
          { text: `${n - d} ${f(1, d)}`, value: n - d + 1 / d, misconception: M.mixed, feedback: `How many groups of ${d} ${PART[d]} make a whole?` },
        ]),
        answer: 0,
        hint: `${d} ${PART[d]} make one whole. How many wholes fit into ${n} ${PART[d]}, and how many are left?`,
        explanation: `${n} ÷ ${d} = ${whole} remainder ${rem}, so ${f(n, d)} = **${whole} ${f(rem, d)}**.`,
      };
    },
  },
  {
    key: "f2-to-improper",
    skill: S.mixed,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const d = int(r, 2, difficulty === 1 ? 5 : 9);
      const whole = int(r, 1, difficulty === 3 ? 5 : 3);
      const rem = int(r, 1, d - 1);
      const n = whole * d + rem;
      return {
        kind: "number",
        prompt: `**${whole} ${f(rem, d)}** is how many **${PART[d]}**?`,
        visual: difficulty === 1 ? { kind: "fraction", parts: d, shaded: n, wholes: whole + 1 } : undefined,
        answer: n,
        traps: [
          { value: whole * rem, misconception: M.mixed, feedback: `Each whole is ${d} ${PART[d]}: multiply the wholes by ${d}, then add the ${rem}.` },
          { value: whole + rem, misconception: M.mixed, feedback: `Each whole is ${d} ${PART[d]}, not 1.` },
        ].filter((t, i, all) => t.value !== n && all.findIndex((x) => x.value === t.value) === i),
        hint: `${whole} whole${whole > 1 ? "s" : ""} = ${whole} × ${d} ${PART[d]}. Then add ${rem} more.`,
        explanation: `${whole} × ${d} + ${rem} = **${n}** ${PART[d]}, so ${whole} ${f(rem, d)} = ${f(n, d)}.`,
      };
    },
  },
  {
    key: "f2-add-same",
    skill: S.addSame,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const d = int(r, 4, difficulty === 1 ? 8 : 12);
      if (difficulty === 3) {
        const a = int(r, 1, d - 1);
        return {
          kind: "choose",
          prompt: `**1 − ${f(a, d)} = ?**`,
          visual: { kind: "fraction", parts: d, shaded: d, label: "1 whole" },
          options: opts(best(d - a, d), (d - a) / d, [
            { text: f(a, d), value: a / d, feedback: `That's the part taken away. 1 whole is ${f(d, d)}: take away ${a} ${PART[d] ?? "parts"}.` },
            { text: f(d - a, 1 + d), value: (d - a) / (d + 1), misconception: M.addDen, feedback: "The size of the parts doesn't change when you subtract." },
            { text: f(d - a + 1, d), value: (d - a + 1) / d, feedback: `Write 1 as ${f(d, d)}, then take away ${a}.` },
            { text: f(d - a - 1 > 0 ? d - a - 1 : d + 1, d), value: (d - a - 1 > 0 ? d - a - 1 : d + 1) / d, feedback: `Write 1 as ${f(d, d)}, then take away ${a}.` },
          ]),
          answer: 0,
          hint: `1 whole is ${f(d, d)}.`,
          explanation: `${f(d, d)} − ${f(a, d)} = **${best(d - a, d)}**.`,
        };
      }
      const a = int(r, 1, d - 2);
      const b = int(r, 1, d - 1 - a);
      return {
        kind: "choose",
        prompt: `**${f(a, d)} + ${f(b, d)} = ?**`,
        visual: difficulty === 1 ? { kind: "fraction", parts: d, shaded: a + b } : undefined,
        options: opts(f(a + b, d), (a + b) / d, [
          { text: f(a + b, 2 * d), value: (a + b) / (2 * d), misconception: M.addDen, feedback: "When the parts are the same size, add the tops only. The bottom stays the same." },
          { text: f(a * b, d), value: (a * b) / d, feedback: "Add the tops, don't multiply them." },
          { text: f(Math.abs(a - b) || a + b + 1, d), value: (Math.abs(a - b) || a + b + 1) / d, feedback: "Add the tops." },
          { text: f(a + b + 1, d), value: (a + b + 1) / d, feedback: "Count the parts again." },
        ]),
        answer: 0,
        hint: `The parts are all ${PART[d] ?? "the same size"}. How many are there altogether?`,
        explanation: `${a} + ${b} = ${a + b}, so **${f(a + b, d)}**.`,
      };
    },
  },
  {
    key: "f2-sub-same",
    skill: S.addSame,
    difficulties: [1, 2],
    make: (r, { difficulty }) => {
      const d = int(r, 5, difficulty === 1 ? 9 : 12);
      const a = int(r, 3, d - 1);
      const b = int(r, 1, a - 1);
      return {
        kind: "number",
        prompt: `**${f(a, d)} − ${f(b, d)}** is how many **${PART[d] ?? "parts"}**?`,
        answer: a - b,
        traps: [{ value: a + b, feedback: "Take away: the answer is smaller." }],
        hint: `${a} ${PART[d]} take away ${b} ${PART[d]}.`,
        explanation: `${a} − ${b} = **${a - b}**, so ${f(a, d)} − ${f(b, d)} = ${f(a - b, d)}.`,
      };
    },
  },
  {
    key: "f2-add-related",
    skill: S.addRelated,
    difficulties: [2, 3],
    make: (r, { difficulty }) => {
      const small = pick(r, [2, 3, 4, 5]);
      const k = pick(r, difficulty === 2 ? [2] : [2, 3]);
      const big = small * k;
      const a = int(r, 1, small - 1);
      const b = int(r, 1, big - 1 - a * k > 0 ? big - 1 - a * k : 1);
      const total = a * k + b;
      return {
        kind: "choose",
        prompt: `**${f(a, small)} + ${f(b, big)} = ?**`,
        visual: { kind: "fraction", parts: big, shaded: total, label: `${a * k} + ${b} ${PART[big] ?? "parts"}` },
        options: opts(best(total, big), total / big, [
          { text: f(a + b, small + big), value: (a + b) / (small + big), misconception: M.addDen, feedback: "The parts are different sizes. Make the bottoms the same first, then add the tops." },
          { text: f(a + b, big), value: (a + b) / big, misconception: M.noCommon, feedback: `Change ${f(a, small)} into ${PART[big]} first: it is ${f(a * k, big)}.` },
          { text: best(total + 1, big), value: (total + 1) / big, feedback: `Check: ${f(a * k, big)} + ${f(b, big)}.` },
          { text: best(total - 1, big), value: (total - 1) / big, feedback: `Check: ${f(a * k, big)} + ${f(b, big)}.` },
        ]),
        answer: 0,
        hint: `Change ${f(a, small)} into ${PART[big] ?? "the smaller parts"}: multiply the top and bottom by ${k}.`,
        explanation: `${f(a, small)} = ${f(a * k, big)}, and ${f(a * k, big)} + ${f(b, big)} = **${best(total, big)}**.`,
      };
    },
  },
  {
    key: "f2-common",
    skill: S.addRelated,
    difficulties: [1, 2],
    make: (r) => {
      const small = pick(r, [2, 3, 4, 5]);
      const k = pick(r, [2, 3]);
      const big = small * k;
      const a = int(r, 1, small - 1);
      return {
        kind: "number",
        prompt: `To add **${f(a, small)}** and **${f(1, big)}**, we change ${f(a, small)} into ${PART[big] ?? "smaller parts"}. How many ${PART[big] ?? "parts"} is ${f(a, small)}?`,
        answer: a * k,
        traps: [{ value: a, misconception: M.noCommon, feedback: `Each ${PART[small]?.replace(/s$/, "") ?? "part"} is ${k} ${PART[big]}, so multiply by ${k}.` }].filter((t) => t.value !== a * k),
        hint: `${small} × ${k} = ${big}. Multiply the top by ${k} too.`,
        explanation: `${f(a, small)} = ${f(a * k, big)}: **${a * k}** ${PART[big]}.`,
      };
    },
  },
  {
    key: "f2-times-whole",
    skill: S.multiply,
    difficulties: [2, 3],
    make: (r, { difficulty }) => {
      const d = int(r, 3, 8);
      const a = int(r, 1, d - 1);
      const w = int(r, 2, difficulty === 2 ? 4 : 7);
      return {
        kind: "choose",
        prompt: `**${f(a, d)} × ${w} = ?**`,
        visual: difficulty === 2 ? { kind: "fraction", parts: d, shaded: a * w, wholes: Math.ceil((a * w) / d) } : undefined,
        options: opts(best(a * w, d), (a * w) / d, [
          { text: f(a * w, d * w), value: a / d, misconception: M.timesBoth, feedback: `${w} lots of ${f(a, d)}: the parts stay ${PART[d]}, so only the top is multiplied.` },
          { text: f(a, d * w), value: a / (d * w), misconception: M.timesBoth, feedback: "Multiplying by a whole number makes more parts, not smaller ones." },
          { text: f(a + w, d), value: (a + w) / d, feedback: "Times means lots of: multiply the top, don't add." },
          { text: best(a * w + 1, d), value: (a * w + 1) / d, feedback: `Check: ${w} × ${a} ${PART[d]}.` },
        ]),
        answer: 0,
        hint: `${w} lots of ${a} ${PART[d]} is ${w} × ${a} ${PART[d]}.`,
        explanation: `${a} × ${w} = ${a * w} ${PART[d]} = **${best(a * w, d)}**.`,
      };
    },
  },
  {
    key: "f2-of-amount",
    skill: S.multiply,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const d = pick(r, difficulty === 1 ? [2, 4, 5, 10] : [3, 4, 5, 6, 8]);
      const a = difficulty === 1 ? 1 : int(r, 2, d - 1);
      const each = int(r, 2, difficulty === 3 ? 25 : 10);
      const amount = d * each;
      return {
        kind: "number",
        prompt: `What is **${f(a, d)} of ${amount}**?`,
        visual: difficulty === 1 ? { kind: "bar", total: String(amount), parts: Array.from({ length: d }, (_, i) => ({ label: String(each), tone: i < a ? ("num" as const) : ("plain" as const) })) } : undefined,
        answer: a * each,
        traps: [{ value: each, feedback: `That is ${f(1, d)}. You need ${a} of those parts.` }, { value: amount * a, misconception: M.timesBoth, feedback: `Divide by ${d} first, then multiply by ${a}.` }].filter((t) => t.value !== a * each),
        hint: `Find ${f(1, d)} first: ${amount} ÷ ${d}. Then multiply by ${a}.`,
        explanation: `${amount} ÷ ${d} = ${each}, and ${each} × ${a} = **${a * each}**.`,
      };
    },
  },
];

export const fractions2 = defineTopic({
  id: T,
  title: "Fractions 2",
  subtitle: "Simplest form, mixed numbers, adding and subtracting, and multiplying fractions",
  world: "fdp",
  years: [4, 5, 6],
  order: 2,
  icon: "puzzle",
  skills: [
    { id: S.simplify, title: "Equivalent and simplest form", description: "Make equivalent fractions and simplify to the simplest form.", lessonId: "simplify" },
    { id: S.mixed, title: "Mixed numbers", description: "Change between mixed numbers and improper fractions.", lessonId: "mixed" },
    { id: S.addSame, title: "Add and subtract (same denominator)", description: "Add and subtract fractions with the same denominator, including from 1.", lessonId: "add-same" },
    { id: S.addRelated, title: "Add with related denominators", description: "Add fractions when one denominator is a multiple of the other.", lessonId: "add-related" },
    { id: S.multiply, title: "Multiply fractions", description: "Multiply a fraction by a whole number and find fractions of amounts.", lessonId: "multiply" },
  ],
  lessonIcons: { simplify: "puzzle", mixed: "pizza", "add-same": "plus", "add-related": "scales", multiply: "times" },
  lessons: [
    {
      id: "simplify",
      title: "Simplest form",
      phase: "Understand",
      summary: "Divide the top and bottom by the same number until you can't any more.",
      minutes: 7,
      objectives: ["Make equivalent fractions", "Write a fraction in its simplest form"],
      steps: [
        {
          type: "explain",
          title: "Same size, bigger pieces",
          body: ["**{6/8}** and **{3/4}** cover exactly the same amount. {3/4} uses fewer, bigger pieces.", "To simplify, divide the top **and** the bottom by the same number: 6 ÷ 2 = 3, 8 ÷ 2 = 4."],
          visual: { kind: "fraction", parts: 8, shaded: 6, label: "6 of 8 is the same as 3 of 4" },
          tip: "Simplest form: nothing else divides both the top and the bottom.",
        },
        {
          type: "worked",
          title: "Let's do it together",
          support: "faded",
          problem: "Simplify **{12/16}**.",
          steps: [
            { text: "Both 12 and 16 are in the 4 times table." },
            { text: "12 ÷ 4 = 3.", blank: { prompt: "What is 16 ÷ 4?", answer: 4, hint: "4 × 4 = 16", worked: "16 ÷ 4 = **4**." } },
            { text: "Nothing else divides 3 and 4, so we're done." },
          ],
          conclusion: "{12/16} = **{3/4}**.",
        },
        { type: "check", title: "Your turn", questionId: gen("f2-simplify", 1, 3) },
        { type: "check", title: "One more", questionId: gen("f2-equivalent", 2, 6) },
      ],
    },
    {
      id: "mixed",
      title: "Mixed numbers",
      phase: "Visualise",
      summary: "Wholes and a fraction, or one top-heavy fraction: two ways to write the same amount.",
      minutes: 7,
      objectives: ["Change an improper fraction into a mixed number", "Change a mixed number into an improper fraction"],
      steps: [
        {
          type: "explain",
          title: "More than one whole",
          body: ["**{11/4}** means 11 quarters. Four quarters make a whole, so 11 quarters is **2 wholes and 3 quarters**: **2 {3/4}**."],
          visual: { kind: "fraction", parts: 4, shaded: 11, wholes: 3, shape: "circle" },
          tip: "Divide the top by the bottom: the answer is the wholes, the remainder is the new top.",
        },
        {
          type: "worked",
          title: "Let's go the other way",
          support: "faded",
          problem: "**2 {3/5}** as fifths",
          steps: [
            { text: "Each whole is 5 fifths." },
            { text: "2 wholes are 10 fifths.", blank: { prompt: "Add the 3 extra fifths: how many fifths?", answer: 13, hint: "10 + 3", worked: "**13** fifths." } },
          ],
          conclusion: "2 {3/5} = **{13/5}**.",
        },
        { type: "check", title: "Your turn", questionId: gen("f2-to-mixed", 1, 4) },
        { type: "check", title: "One more", questionId: gen("f2-to-improper", 2, 7) },
      ],
    },
    {
      id: "add-same",
      title: "Adding same-size parts",
      phase: "Explore",
      summary: "When the parts are the same size, add the tops and keep the bottom.",
      minutes: 6,
      objectives: ["Add and subtract fractions with the same denominator", "Subtract a fraction from 1"],
      steps: [
        {
          type: "explain",
          title: "Count the parts",
          body: ["**{2/7} + {3/7}**: 2 sevenths and 3 sevenths make **5 sevenths**: {5/7}.", "The bottom stays 7: the parts are still sevenths."],
          visual: { kind: "fraction", parts: 7, shaded: 5 },
          tip: "Never add the bottoms: 2 sevenths + 3 sevenths aren't 5 fourteenths!",
        },
        { type: "check", title: "Your turn", questionId: gen("f2-add-same", 1, 2) },
        { type: "check", title: "One more", questionId: gen("f2-sub-same", 2, 9) },
      ],
    },
    {
      id: "add-related",
      title: "Different-size parts",
      phase: "Practise",
      summary: "Make the parts the same size first, then add.",
      minutes: 8,
      objectives: ["Add fractions where one denominator is a multiple of the other"],
      steps: [
        {
          type: "worked",
          title: "Watch me: a half plus a quarter",
          support: "full",
          problem: "**{1/2} + {1/4}**",
          visual: { kind: "fraction", parts: 4, shaded: 3, label: "2 quarters + 1 quarter" },
          steps: [{ text: "Halves and quarters are different sizes." }, { text: "One half is the same as **2 quarters**: {1/2} = {2/4}." }, { text: "{2/4} + {1/4} = **{3/4}**." }],
          conclusion: "{1/2} + {1/4} = **{3/4}**.",
        },
        { type: "check", title: "Your turn", questionId: gen("f2-common", 1, 5) },
        { type: "check", title: "One more", questionId: gen("f2-add-related", 2, 8) },
      ],
    },
    {
      id: "multiply",
      title: "Multiplying fractions",
      phase: "Apply",
      summary: "Lots of a fraction: multiply the top, keep the bottom.",
      minutes: 7,
      objectives: ["Multiply a fraction by a whole number", "Find a fraction of an amount"],
      steps: [
        {
          type: "explain",
          title: "Lots of",
          body: ["**{3/5} × 4** means 4 lots of 3 fifths: **12 fifths**. That is {12/5} = **2 {2/5}**.", "The parts stay fifths, so only the top is multiplied."],
          visual: { kind: "fraction", parts: 5, shaded: 12, wholes: 3 },
        },
        { type: "check", title: "Your turn", questionId: gen("f2-of-amount", 1, 4) },
        { type: "check", title: "One more", questionId: gen("f2-times-whole", 2, 7) },
      ],
    },
  ],
  templates,
  misconceptions: [
    { id: M.addDen, name: "Adding the denominators", possibleCause: "It looks like the bottom numbers were added too.", description: "Writes 2/7 + 3/7 = 5/14.", explanation: ["The bottom number is the size of the parts.", "Adding sevenths gives sevenths: 2/7 + 3/7 = 5/7."], skills: [S.addSame, S.addRelated], followUpTemplates: ["f2-add-same", "f2-add-related"] },
    { id: M.notSimplest, name: "Not simplified all the way", possibleCause: "It looks like the fraction could be simplified a bit more.", description: "Stops at an equivalent fraction that isn't the simplest, e.g. 4/8 for 1/2.", explanation: ["Keep dividing while a number divides both.", "4/8 → 2/4 → 1/2."], skills: [S.simplify], followUpTemplates: ["f2-simplify"] },
    { id: M.subtract, name: "Taking the same away from top and bottom", possibleCause: "It looks like the same number was taken off the top and the bottom.", description: "Thinks 6/8 = 5/7 or 4/6.", explanation: ["Taking away changes the size of a fraction.", "Equivalent fractions multiply or divide both by the same number."], skills: [S.simplify], followUpTemplates: ["f2-simplify", "f2-equivalent"] },
    { id: M.noCommon, name: "Adding before the parts match", possibleCause: "It looks like the fractions were added before the parts were the same size.", description: "Adds 1/2 + 1/4 as 2/4.", explanation: ["Change 1/2 into quarters first: 2/4.", "Then 2/4 + 1/4 = 3/4."], skills: [S.addRelated], followUpTemplates: ["f2-common", "f2-add-related"] },
    { id: M.mixed, name: "Mixing up wholes and parts", possibleCause: "It looks like the wholes and the leftover parts got mixed up.", description: "Converts 11/4 to 3 3/4, or 2 3/5 to 6/5.", explanation: ["Each whole is d parts.", "11 quarters: 2 wholes (8 quarters) and 3 quarters left = 2 3/4."], skills: [S.mixed], followUpTemplates: ["f2-to-mixed", "f2-to-improper"] },
    { id: M.timesBoth, name: "Multiplying the top and the bottom", possibleCause: "It looks like the bottom number was multiplied too.", description: "Works out 3/5 × 4 as 12/20.", explanation: ["4 lots of 3 fifths are 12 fifths.", "The parts stay fifths: 12/5."], skills: [S.multiply], followUpTemplates: ["f2-times-whole"] },
  ],
  placement: [
    { lessonId: "simplify", template: "f2-simplify" },
    { lessonId: "mixed", template: "f2-to-mixed" },
    { lessonId: "add-same", template: "f2-add-same" },
    { lessonId: "add-related", template: "f2-add-related" },
    { lessonId: "multiply", template: "f2-times-whole" },
  ],
});
