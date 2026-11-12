import { defineTopic, genFor, int, pick, withExtras, withHints } from "@/topics/kit/define";
import { multiplyJourneyExtra } from "./multiplyJourney";
import { addDifferentExtra, ADD_DIFFERENT } from "./different";
import { fractions2Extra } from "./extra";
import type { ChooseOption, Template } from "@/topics/kit/types";
import { gcd, toMixed } from "@/maths/fraction";

/** Fractions 2: simplest form, mixed numbers, adding and subtracting (same, related and different denominators), multiplying by a whole. */

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

const f = (n: number, d: number) => `{${n}/${d}}`;
/** A fraction in its simplest form, written as a mixed number when it is more than one (maths: toMixed). */
function best(n: number, d: number): string {
  const m = toMixed({ n, d });
  if (m.n === 0) return `${m.whole}`;
  if (m.whole > 0) return `${m.whole} ${f(m.n, m.d)}`;
  return f(m.n, m.d);
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

const baseTemplates: Template[] = [
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

  /* D-037 (Phase B): a stretch question for every skill. */
  {
    key: "f2-simplify-stretch",
    skill: S.simplify,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const [a, b] = pick(r, [[1, 2], [2, 3], [3, 4], [2, 5], [3, 5], [5, 6]]) as [number, number];
      const ks = [2, 3, 4, 5].sort(() => r() - 0.5).slice(0, 3);
      const odd = { text: f(a * ks[0]! + 1, b * ks[0]!) };
      return {
        kind: "choose",
        prompt: `Three of these are equal to **${f(a, b)}**. Which one is **not**?`,
        options: [odd, ...ks.map((k) => ({ text: f(a * k, b * k), feedback: `That one is equal: divide the top and bottom by ${k} to get ${f(a, b)}.` }))],
        answer: 0,
        hint: `Simplify each one. Which doesn't become ${f(a, b)}?`,
        explanation: `${f(a * ks[0]! + 1, b * ks[0]!)} can't be simplified to ${f(a, b)}, so it is the odd one out.`,
      };
    },
  },
  {
    key: "f2-mixed-stretch",
    skill: S.mixed,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const d = pick(r, [3, 4, 5]);
      const w = int(r, 1, 3);
      const values = [w * d + 1, w * d + d - 1, (w + 1) * d + 1].sort(() => r() - 0.5);
      const big = Math.max(...values);
      const shown = values.map((n, i) => (i % 2 === 0 ? best(n, d) : f(n, d)));
      const right = shown[values.indexOf(big)]!;
      return {
        kind: "choose",
        prompt: `Which amount is the **biggest**?`,
        options: [{ text: right }, ...shown.filter((x) => x !== right).map((x) => ({ text: x, misconception: M.mixed, feedback: "Write them all the same way first, as mixed numbers or all as improper fractions." }))],
        answer: 0,
        hint: `Write each amount as ${PART[d] ?? `parts of ${d}`}.`,
        explanation: `As ${PART[d] ?? "parts"}: ${values.map((n) => f(n, d)).join(", ")}. The biggest is **${right}**.`,
      };
    },
  },
  {
    key: "f2-add-same-stretch",
    skill: S.addSame,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const d = pick(r, [7, 8, 9, 10, 12]);
      const a = int(r, 1, Math.floor(d / 3));
      const b = int(r, 1, Math.floor(d / 3));
      const left = d - a - b;
      return {
        kind: "choose",
        prompt: `A pizza is cut into **${d} equal slices**. Mia eats **${f(a, d)}** and Tom eats **${f(b, d)}**. What fraction of the pizza is **left**?`,
        visual: { kind: "fraction", parts: d, shaded: a + b, shape: "circle" },
        options: opts(best(left, d), left / d, [
          { text: best(a + b, d), value: (a + b) / d, feedback: "That's how much they ate. Take it away from the whole pizza." },
          { text: f(left, d * 2), value: left / (d * 2), misconception: M.addDen, feedback: "The slices are still the same size: keep the bottom number." },
          { text: f(d - a, d), value: (d - a) / d, feedback: "Take away both Mia's and Tom's slices." },
        ]),
        answer: 0,
        hint: `The whole pizza is ${f(d, d)}. Take away the slices they ate.`,
        explanation: `${f(d, d)} − ${f(a, d)} − ${f(b, d)} = **${best(left, d)}**.`,
      };
    },
  },
  {
    key: "f2-related-stretch",
    skill: S.addRelated,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const [d1, d2, d3] = pick(r, [[2, 4, 8], [3, 6, 12], [2, 6, 12], [5, 10, 20]]) as [number, number, number];
      const n = d3 / d1 + d3 / d2 + 1;
      return {
        kind: "choose",
        prompt: `Work out **${f(1, d1)} + ${f(1, d2)} + ${f(1, d3)}**.`,
        options: opts(best(n, d3), n / d3, [
          { text: f(3, d1 + d2 + d3), value: 3 / (d1 + d2 + d3), misconception: M.addDen, feedback: "Don't add the bottoms. Make every part the same size first." },
          { text: f(3, d3), value: 3 / d3, misconception: M.noCommon, feedback: `${f(1, d1)} and ${f(1, d2)} are bigger than ${f(1, d3)}: change them into ${PART[d3] ?? "the smallest parts"} first.` },
          { text: best(n + 1, d3), value: (n + 1) / d3, feedback: "Count the parts again after changing them." },
        ]),
        answer: 0,
        hint: `Change every fraction into ${PART[d3] ?? `parts of ${d3}`}.`,
        explanation: `${f(d3 / d1, d3)} + ${f(d3 / d2, d3)} + ${f(1, d3)} = **${best(n, d3)}**.`,
      };
    },
  },
  {
    key: "f2-multiply-stretch",
    skill: S.multiply,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const total = 12 * int(r, 2, 6);
      const pets = (total * 3) / 4;
      const dogs = pets / 3;
      return {
        kind: "number",
        prompt: `There are **${total} children**. **${f(3, 4)}** of them have a pet. **${f(1, 3)}** of the children with a pet have a dog. How many children have a dog?`,
        answer: dogs,
        traps: [
          { value: pets, feedback: "That's the children with a pet. Now find a third of them." },
          { value: total / 3, feedback: `A third of the children **with a pet**, not of all ${total}.` },
        ],
        hint: `First find ${f(3, 4)} of ${total}.`,
        explanation: `${f(3, 4)} of ${total} = ${pets}, and ${f(1, 3)} of ${pets} = **${dogs}**.`,
      };
    },
  },
];

const templates = withHints(baseTemplates, {
  "f2-simplify": () => ["Try dividing both numbers by 2, then 3, then 5.", "Keep going until no number (except 1) divides both."],
  "f2-equivalent": () => ["Whatever you do to the bottom, do the same to the top.", "Work out what the bottom was multiplied by, then multiply the top by that too."],
  "f2-to-mixed": () => ["How many whole groups of the bottom number fit into the top?", "The number of wholes comes first; what's left over goes on top of the same bottom number."],
  "f2-to-improper": () => ["Each whole has as many parts as the bottom number.", "Multiply the wholes by the bottom number, then add the top."],
  "f2-add-same": () => ["Same-size parts: add the tops.", "Keep the bottom the same, then simplify if you can."],
  "f2-sub-same": () => ["Same-size parts: take away the tops.", "One whole is the bottom number over itself, like 5 fifths."],
  "f2-add-related": () => ["Make the parts the same size first.", "Change the fraction with the smaller bottom number so both match, then add the tops."],
  "f2-common": () => ["Multiply the top and bottom by the same number.", "What do you multiply the smaller bottom number by to get the bigger one?"],
  "f2-times-whole": () => ["Lots of a fraction: multiply the top only.", "The parts stay the same size, so the bottom number doesn't change. Then turn it into a mixed number."],
  "f2-of-amount": () => ["Divide by the bottom number to find one part.", "Then multiply by the top number."],
  "f2-simplify-stretch": () => ["Divide the top and bottom of each one by the same number.", "Three of them become the same fraction. The odd one out doesn't."],
  "f2-mixed-stretch": () => ["Change the mixed numbers into improper fractions.", "Now compare the tops: the bottoms are the same."],
  "f2-add-same-stretch": () => ["Add what they ate first.", "Then take that away from the whole pizza."],
  "f2-related-stretch": () => ["Use the biggest bottom number for every fraction.", "Then add the tops."],
  "f2-multiply-stretch": () => ["Find how many have a pet first: divide by 4, multiply by 3.", "Then find a third of that number."],
});

export const fractions2 = defineTopic(withExtras({
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
          body: ["**{6/8}** and **{3/4}** cover exactly the same amount. {3/4} uses fewer, bigger pieces.", "To simplify, divide the top **and** the bottom by the same number: 6 ÷ 2 = 3, 8 ÷ 2 = 4.", "Never take the same amount off the top and the bottom: that changes the size of the fraction."],
          visual: { kind: "fraction", parts: 8, shaded: 6, label: "6 of 8 is the same as 3 of 4" },
          tip: "Simplest form: nothing else divides both the top and the bottom.",
        },
        {
          type: "worked",
          title: "Watch me: simplify {18/24}",
          support: "full",
          problem: "Simplify **{18/24}**.",
          visual: { kind: "fraction", parts: 24, shaded: 18 },
          steps: [
            { text: "Both numbers are even, so divide by 2: {18/24} = {9/12}." },
            { text: "9 and 12 are both in the 3 times table, so divide by 3: {9/12} = {3/4}." },
            { text: "Nothing divides both 3 and 4 except 1, so we stop." },
          ],
          conclusion: "{18/24} = **{3/4}**. Dividing by 6 straight away gives the same answer.",
        },
        {
          type: "worked",
          title: "Let's do it together",
          support: "faded",
          problem: "Simplify **{12/16}**.",
          steps: [
            { text: "Both 12 and 16 are in the 4 times table." },
            { text: "12 ÷ 4 = 3.", blank: { prompt: "What is 16 ÷ 4?", answer: 4, hint: "4 × 4 = 16", traps: [{ value: 12, misconception: M.subtract, feedback: "That takes 4 away. Divide the bottom by 4, just like the top." }], worked: "16 ÷ 4 = **4**." } },
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
          body: ["**{11/4}** means 11 quarters. Four quarters make a whole, so 11 quarters is **2 wholes and 3 quarters**: **2 {3/4}**.", "A fraction whose top is bigger than its bottom is called **improper**. A whole number with a fraction, like 2 {3/4}, is a **mixed number**. They are two ways of writing the same amount."],
          visual: { kind: "fraction", parts: 4, shaded: 11, wholes: 3, shape: "circle" },
          tip: "Divide the top by the bottom: the answer is the wholes, the remainder is the new top.",
        },
        {
          type: "worked",
          title: "Watch me: {17/5} as a mixed number",
          support: "full",
          problem: "Write **{17/5}** as a mixed number.",
          visual: { kind: "fraction", parts: 5, shaded: 17, wholes: 4 },
          steps: [
            { text: "5 fifths make a whole. How many fives fit into 17? **3**, which uses 15 fifths." },
            { text: "17 − 15 = **2** fifths are left over." },
          ],
          conclusion: "{17/5} = **3 {2/5}**.",
        },
        {
          type: "worked",
          title: "Let's go the other way",
          support: "faded",
          problem: "**2 {3/5}** as fifths",
          steps: [
            { text: "Each whole is 5 fifths." },
            { text: "2 wholes are 10 fifths.", blank: { prompt: "Add the 3 extra fifths: how many fifths?", answer: 13, hint: "10 + 3", traps: [{ value: 10, misconception: M.mixed, feedback: "That's just the 2 wholes. Add the 3 extra fifths too." }, { value: 6, misconception: M.mixed, feedback: "Each whole is 5 fifths, not 1: 2 wholes are 10 fifths." }], worked: "**13** fifths." } },
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
          body: ["**{2/7} + {3/7}**: 2 sevenths and 3 sevenths make **5 sevenths**: {5/7}.", "The bottom stays 7: the parts are still sevenths. The bottom number tells you the size of the parts, and adding doesn't change their size.", "Taking away works the same way: {6/7} − {2/7} = {4/7}."],
          visual: { kind: "fraction", parts: 7, shaded: 5 },
          tip: "Never add the bottoms: 2 sevenths + 3 sevenths aren't 5 fourteenths!",
        },
        {
          type: "worked",
          title: "Watch me: 1 − {3/8}",
          support: "full",
          problem: "**1 − {3/8}**",
          visual: { kind: "fraction", parts: 8, shaded: 5 },
          steps: [{ text: "One whole is **8 eighths**: {8/8}." }, { text: "{8/8} − {3/8} = {5/8}: take away the tops, keep the bottom." }],
          conclusion: "1 − {3/8} = **{5/8}**.",
        },
        {
          type: "worked",
          title: "Together: {2/9} + {5/9}",
          support: "faded",
          problem: "**{2/9} + {5/9}**",
          steps: [
            { text: "Add the tops: 2 + 5 = **7**." },
            { text: "Now the bottom number.", blank: { prompt: "What is the bottom number?", answer: 9, hint: "Are the parts still ninths?", traps: [{ value: 18, misconception: M.addDen, feedback: "The parts are still ninths, so the bottom stays 9. Don't add the bottoms." }], worked: "**9**: the answer is {7/9}." } },
          ],
          conclusion: "{2/9} + {5/9} = **{7/9}**.",
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
          type: "explain",
          title: "Make the parts match",
          body: ["You can only add parts that are the **same size**. A half and a quarter are different sizes, so first turn the half into quarters: {1/2} = {2/4}.", "Then add the quarters: {2/4} + {1/4} = **{3/4}**. Change the fraction with the smaller bottom number, by multiplying its top and bottom by the same number."],
          visual: { kind: "fraction", parts: 4, shaded: 2, label: "One half is two quarters" },
        },
        {
          type: "worked",
          title: "Watch me: a half plus a quarter",
          support: "full",
          problem: "**{1/2} + {1/4}**",
          visual: { kind: "fraction", parts: 4, shaded: 3, label: "2 quarters + 1 quarter" },
          steps: [{ text: "Halves and quarters are different sizes." }, { text: "One half is the same as **2 quarters**: {1/2} = {2/4}." }, { text: "{2/4} + {1/4} = **{3/4}**." }],
          conclusion: "{1/2} + {1/4} = **{3/4}**.",
        },
        {
          type: "worked",
          title: "Together: {1/3} + {1/6}",
          support: "faded",
          problem: "**{1/3} + {1/6}**",
          steps: [
            { text: "Sixths are smaller than thirds. Change the third into sixths: multiply the top and bottom by 2.", blank: { prompt: "{1/3} is how many sixths?", answer: 2, hint: "1 × 2", traps: [{ value: 1, misconception: M.noCommon, feedback: "A third is bigger than a sixth: one third is 2 sixths." }], worked: "{1/3} = **{2/6}**." } },
            { text: "{2/6} + {1/6} = {3/6}, which simplifies to {1/2}." },
          ],
          conclusion: "{1/3} + {1/6} = **{1/2}**.",
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
          body: ["**{3/5} × 4** means 4 lots of 3 fifths: **12 fifths**. That is {12/5} = **2 {2/5}**.", "The parts stay fifths, so only the top is multiplied.", "To find a fraction **of** an amount, like {2/5} of 30, divide by the bottom to find one part (30 ÷ 5 = 6), then multiply by the top (6 × 2 = 12)."],
          visual: { kind: "fraction", parts: 5, shaded: 12, wholes: 3 },
        },
        {
          type: "worked",
          title: "Watch me: {2/5} of 30",
          support: "full",
          problem: "**{2/5} of 30**",
          visual: { kind: "bar", total: "30", parts: [{ label: "6", tone: "brand" }, { label: "6", tone: "brand" }, { label: "6", tone: "plain" }, { label: "6", tone: "plain" }, { label: "6", tone: "plain" }] },
          steps: [{ text: "Split 30 into 5 equal parts: 30 ÷ 5 = **6** in each." }, { text: "Two of those parts: 6 × 2 = **12**." }],
          conclusion: "{2/5} of 30 = **12**.",
        },
        {
          type: "worked",
          title: "Together: 4 × {2/9}",
          support: "faded",
          problem: "**4 × {2/9}**",
          steps: [
            { text: "4 lots of 2 ninths: 4 × 2 = **8** ninths." },
            { text: "Now the bottom number.", blank: { prompt: "What is the bottom number?", answer: 9, hint: "Are the parts still ninths?", traps: [{ value: 36, misconception: M.timesBoth, feedback: "Only the top is multiplied: the parts are still ninths." }], worked: "**9**: 4 × {2/9} = {8/9}." } },
          ],
          conclusion: "4 × {2/9} = **{8/9}**.",
        },
        { type: "check", title: "Your turn", questionId: gen("f2-of-amount", 1, 4) },
        { type: "check", title: "One more", questionId: gen("f2-times-whole", 2, 7) },
      ],
    },
  ],
  templates,
  misconceptions: [
    { id: M.addDen, name: "Adding the denominators", possibleCause: "It looks like the bottom numbers were added too.", description: "Writes 2/7 + 3/7 = 5/14.", explanation: ["The bottom number is the size of the parts.", "Adding sevenths gives sevenths: 2/7 + 3/7 = 5/7."], skills: [S.addSame, S.addRelated, ADD_DIFFERENT], followUpTemplates: ["f2-add-same", "f2-add-related", "f2-add-diff"] },
    { id: M.notSimplest, name: "Not simplified all the way", possibleCause: "It looks like the fraction could be simplified a bit more.", description: "Stops at an equivalent fraction that isn't the simplest, e.g. 4/8 for 1/2.", explanation: ["Keep dividing while a number divides both.", "4/8 → 2/4 → 1/2."], skills: [S.simplify], followUpTemplates: ["f2-simplify"] },
    { id: M.subtract, name: "Taking the same away from top and bottom", possibleCause: "It looks like the same number was taken off the top and the bottom.", description: "Thinks 6/8 = 5/7 or 4/6.", explanation: ["Taking away changes the size of a fraction.", "Equivalent fractions multiply or divide both by the same number."], skills: [S.simplify], followUpTemplates: ["f2-simplify", "f2-equivalent"] },
    { id: M.noCommon, name: "Adding before the parts match", possibleCause: "It looks like the fractions were added before the parts were the same size.", description: "Adds 1/2 + 1/4 as 2/4.", explanation: ["Change 1/2 into quarters first: 2/4.", "Then 2/4 + 1/4 = 3/4."], skills: [S.addRelated, ADD_DIFFERENT], followUpTemplates: ["f2-common", "f2-add-related", "f2-diff-common"] },
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
}, fractions2Extra, addDifferentExtra, multiplyJourneyExtra));
