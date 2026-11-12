import { add, gcd, lcm, multiply, subtract, toMixed, type Fraction } from "@/maths/fraction";
import { pick, withAnswer, type TopicExtra } from "@/topics/kit/define";
import type { DeepLesson } from "@/topics/kit/deep";
import type { ChooseOption, KitChooseQuestion, KitNumberQuestion, Template } from "@/topics/kit/types";

/**
 * D-055: Fractions 2 written to grammar-school (11+) and GCSE Foundation standard, for the topic learning page.
 * Three sub-topics first (simplest form, different denominators, multiplying two fractions): an animated diagram,
 * the method and why it works, examples from core to GCSE, common mistakes and an exercise of exam-standard questions.
 * Every question comes from a hand-picked list, checked against hand-worked answers in `deep.test.ts`.
 */

const T = "fractions-2";
const S = { simplify: `${T}.simplify`, different: `${T}.add-different`, times: `${T}.multiply-fractions` };
const M = { addDen: `${T}.add-denominators`, notSimplest: `${T}.not-simplest`, subtract: `${T}.subtract-top-and-bottom`, noCommon: `${T}.no-common-denominator`, mixed: `${T}.mixed-conversion` };
const id = (key: string, seed = 1) => `g:${T}.${key}:3:${seed}`;

type F = [number, number];
const fr = ([n, d]: F): Fraction => ({ n, d });
const raw = ([n, d]: F) => `{${n}/${d}}`;
/** A fraction in simplest form, written as a mixed number when it is more than one. */
export function show(f: Fraction): string {
  const m = toMixed(f);
  const sign = m.sign < 0 ? "−" : "";
  if (m.n === 0) return `${sign}${m.whole}`;
  return m.whole > 0 ? `${sign}${m.whole} {${m.n}/${m.d}}` : `${sign}{${m.n}/${m.d}}`;
}
const mixed = (w: number, [n, d]: F): Fraction => ({ n: w * d + n, d });
const value = (f: Fraction) => f.n / f.d;

/** A choose question: the right answer goes in a place picked by the seed among up to three wrong ones (repeats dropped). */
function choose(r: () => number, body: { prompt: string; hint: string; hints: string[]; explanation: string }, right: string, wrong: ChooseOption[]): Omit<KitChooseQuestion, "id" | "skill" | "difficulty"> {
  const seen = new Set([right]);
  const unique = wrong.filter((w) => !seen.has(w.text) && seen.add(w.text));
  const { options, answer } = withAnswer<ChooseOption>(r, { text: right }, unique.slice(0, 3));
  return { kind: "choose", ...body, options, answer };
}

/* ---------- Simplest form ---------- */

function primes(n: number): string {
  const out: number[] = [];
  let x = n;
  for (let p = 2; x > 1; p++) {
    while (x % p === 0) {
      out.push(p);
      x /= p;
    }
  }
  return out.join(" × ");
}

/** [numerator, denominator, two equal-but-not-simplest fractions, one made by taking the same off top and bottom]. */
const BIG: [number, number, F, F, F][] = [
  [84, 126, [42, 63], [14, 21], [83, 125]],
  [72, 96, [36, 48], [18, 24], [71, 95]],
  [45, 60, [15, 20], [9, 12], [44, 59]],
  [56, 98, [28, 49], [8, 14], [55, 97]],
  [90, 150, [30, 50], [9, 15], [89, 149]],
];

/** a/b = ?/c, numerator wanted. */
const MISSING: [number, number, number][] = [
  [5, 12, 84],
  [4, 15, 105],
  [7, 18, 126],
  [3, 8, 56],
  [9, 16, 144],
];

const ORDER: F[][] = [
  [[2, 3], [5, 8], [7, 12]],
  [[3, 4], [5, 7], [7, 10]],
  [[4, 9], [5, 12], [3, 8]],
  [[5, 6], [7, 9], [11, 15]],
];

/** Between a and b: the right one, then three that are not between. */
const BETWEEN: [F, F, F, F[]][] = [
  [[2, 5], [1, 2], [9, 20], [[3, 10], [11, 20], [3, 5]]],
  [[1, 3], [1, 2], [5, 12], [[1, 4], [7, 12], [2, 3]]],
  [[3, 4], [4, 5], [31, 40], [[7, 10], [17, 20], [5, 6]]],
  [[5, 8], [2, 3], [31, 48], [[7, 12], [17, 24], [3, 4]]],
];

/** Of a whole, a part has a property: the fraction that does NOT, in simplest form. */
const NOT: [number, number, string, string][] = [
  [32, 12, "There are **32** pupils in a class. **12** of them walk to school.", "of the class does **not** walk to school"],
  [45, 18, "A bag holds **45** marbles. **18** of them are red.", "of the marbles are **not** red"],
  [60, 25, "A lesson lasts **60** minutes. **25** minutes are spent on fractions.", "of the lesson is **not** spent on fractions"],
];

/* ---------- Different denominators ---------- */

/** a + b with mixed numbers: [whole, fraction] each. */
const ADD_MIXED: [number, F, number, F][] = [
  [2, [3, 4], 1, [5, 6]],
  [1, [2, 3], 2, [3, 5]],
  [3, [5, 8], 1, [2, 3]],
  [2, [4, 5], 1, [1, 2]],
];
const SUB_MIXED: [number, F, number, F][] = [
  [3, [1, 5], 1, [2, 3]],
  [4, [1, 4], 2, [5, 6]],
  [5, [2, 7], 2, [1, 2]],
  [3, [1, 3], 1, [3, 4]],
];
const LEFT: [F, F, string][] = [
  [[1, 3], [2, 5], "Ali spends **{a}** of his pocket money on a game and **{b}** on a book."],
  [[1, 4], [3, 8], "Mia spends **{a}** of her Saturday at football and **{b}** at her gran's."],
  [[2, 7], [1, 3], "In a garden, **{a}** is lawn and **{b}** is vegetable beds."],
  [[1, 6], [3, 4], "A tank is drained. **{a}** of the water goes in the first hour and **{b}** in the second."],
];
const MISSING_ADD: [F, F][] = [
  [[1, 4], [5, 6]],
  [[1, 3], [7, 8]],
  [[2, 5], [9, 10]],
  [[1, 6], [7, 9]],
];

/* ---------- Multiplying fractions ---------- */

const TIMES_MIXED: [number, F, number, F][] = [
  [2, [1, 3], 1, [1, 2]],
  [1, [3, 4], 2, [2, 3]],
  [3, [1, 2], 1, [1, 5]],
  [2, [1, 4], 1, [1, 3]],
];
const OF_OF: [F, F, number][] = [
  [[3, 5], [2, 3], 45],
  [[3, 4], [2, 5], 60],
  [[5, 6], [3, 4], 48],
  [[2, 7], [7, 9], 63],
];
const REMAINDER: [F, F][] = [
  [[1, 4], [2, 3]],
  [[2, 5], [1, 3]],
  [[1, 6], [2, 5]],
  [[1, 5], [3, 8]],
];
const REVERSE: [F, number][] = [
  [[2, 3], 18],
  [[3, 5], 24],
  [[5, 8], 35],
  [[4, 7], 36],
];
const AREA: [F, F][] = [
  [[3, 4], [2, 3]],
  [[5, 6], [3, 5]],
  [[2, 5], [3, 4]],
  [[7, 8], [2, 3]],
];

const ONE: Fraction = { n: 1, d: 1 };

export const DEEP_ITEMS = { BIG, MISSING, ORDER, BETWEEN, NOT, ADD_MIXED, SUB_MIXED, LEFT, MISSING_ADD, TIMES_MIXED, OF_OF, REMAINDER, REVERSE, AREA };

const templates: Template[] = [
  {
    key: "f2x-simp-big",
    skill: S.simplify,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const [n, d, half, part, minus] = pick(r, BIG);
      const h = gcd(n, d);
      return choose(
        r,
        {
          prompt: `Write **{${n}/${d}}** in its simplest form.`,
          hint: `Find the highest common factor (HCF) of ${n} and ${d}.`,
          hints: [`As products of primes: ${n} = ${primes(n)} and ${d} = ${primes(d)}.`, `Take the primes they share: the HCF is ${h}. Divide the top and the bottom by ${h}.`],
          explanation: `HCF(${n}, ${d}) = ${h}. ${n} ÷ ${h} = ${n / h} and ${d} ÷ ${h} = ${d / h}, so **{${n / h}/${d / h}}**.`,
        },
        `{${n / h}/${d / h}}`,
        [
          { text: raw(half), misconception: M.notSimplest, feedback: `That is equal to {${n}/${d}}, but ${half[0]} and ${half[1]} still share a factor. Divide by the HCF in one go.` },
          { text: raw(part), misconception: M.notSimplest, feedback: `Equal, but not simplest: ${part[0]} and ${part[1]} still share a factor.` },
          { text: raw(minus), misconception: M.subtract, feedback: "Taking the same amount off the top and the bottom changes the size of a fraction. Divide both by the same number." },
        ],
      );
    },
  },
  {
    key: "f2x-missing",
    skill: S.simplify,
    difficulties: [3],
    stretch: true,
    make: (r): Omit<KitNumberQuestion, "id" | "skill" | "difficulty"> => {
      const [a, b, c] = pick(r, MISSING);
      const k = c / b;
      return {
        kind: "number",
        prompt: `**{${a}/${b}}** is written as an equivalent fraction with denominator **${c}**. What is its numerator?`,
        answer: a * k,
        hint: `What do you multiply ${b} by to make ${c}?`,
        hints: [`${b} × ${k} = ${c}.`, `Multiply the top by the same number: ${a} × ${k}.`],
        explanation: `${b} × ${k} = ${c}, so multiply the top by ${k} too: ${a} × ${k} = **${a * k}**. {${a}/${b}} = {${a * k}/${c}}.`,
        traps: [
          { value: c - (b - a), misconception: M.subtract, feedback: `Keeping the same gap between top and bottom doesn't keep the size. Multiply both by ${k}.` },
          { value: k, feedback: `${k} is what you multiply by. Now multiply the top by it.` },
        ],
      };
    },
  },
  {
    key: "f2x-order",
    skill: S.simplify,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const set = pick(r, ORDER);
      const sorted = [...set].sort((x, y) => x[0] * y[1] - y[0] * x[1]);
      const L = set.reduce((m, f) => lcm(m, f[1]), 1);
      const conv = set.map((f) => `${raw(f)} = {${(f[0] * L) / f[1]}/${L}}`).join(", ");
      return choose(
        r,
        {
          prompt: `Which of ${set.map(raw).join(", ")} is the **smallest**?`,
          hint: `Write them all with the same denominator: the lowest common multiple of ${set.map((f) => f[1]).join(", ")}.`,
          hints: [`The LCM is ${L}.`, `${conv}. Compare the tops.`],
          explanation: `With denominator ${L}: ${conv}. The smallest is **${raw(sorted[0])}**.`,
        },
        raw(sorted[0]),
        sorted.slice(1).map((f) => ({ text: raw(f), feedback: "Change them all to the same denominator before you compare: a bigger bottom number does not always mean a smaller fraction." })),
      );
    },
  },
  {
    key: "f2x-between",
    skill: S.simplify,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const [a, b, right, wrong] = pick(r, BETWEEN);
      const L = lcm(lcm(a[1], b[1]), right[1]);
      return choose(
        r,
        {
          prompt: `Which fraction lies **between** ${raw(a)} and ${raw(b)}?`,
          hint: "Write every fraction with the same denominator, then compare the tops.",
          hints: [`Try denominator ${L}: ${raw(a)} = {${(a[0] * L) / a[1]}/${L}} and ${raw(b)} = {${(b[0] * L) / b[1]}/${L}}.`, "Which option's top is between those two tops?"],
          explanation: `With denominator ${L}, ${raw(right)} = {${(right[0] * L) / right[1]}/${L}}, which is between {${(a[0] * L) / a[1]}/${L}} and {${(b[0] * L) / b[1]}/${L}}.`,
        },
        raw(right),
        wrong.map((f) => ({ text: raw(f), feedback: `${raw(f)} is ${value(fr(f)) < value(fr(a)) ? "smaller than" : "bigger than"} ${value(fr(f)) < value(fr(a)) ? raw(a) : raw(b)}. Use a common denominator to check.` })),
      );
    },
  },
  {
    key: "f2x-simp-word",
    skill: S.simplify,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const [whole, part, setup, ask] = pick(r, NOT);
      const rest = whole - part;
      const right = show({ n: rest, d: whole });
      return choose(
        r,
        {
          prompt: `${setup} What fraction ${ask}? Give your answer in its simplest form.`,
          hint: `First find how many do not: ${whole} − ${part}.`,
          hints: [`${rest} out of ${whole} is {${rest}/${whole}}.`, `Simplify: divide the top and bottom by ${gcd(rest, whole)}.`],
          explanation: `${whole} − ${part} = ${rest}, so {${rest}/${whole}} = **${right}**.`,
        },
        right,
        [
          { text: show({ n: part, d: whole }), feedback: "That is the fraction that **does**. The question asks for the ones that don't." },
          { text: `{${rest}/${whole}}`, misconception: M.notSimplest, feedback: "Right amount, but not in its simplest form." },
          { text: show({ n: part, d: rest }), feedback: `That compares one group with the other (${part} to ${rest}). A fraction compares a part with the **whole**, ${whole}.` },
        ],
      );
    },
  },
  {
    key: "f2x-add-mixed",
    skill: S.different,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const [w1, a, w2, b] = pick(r, ADD_MIXED);
      const L = lcm(a[1], b[1]);
      const tops = (a[0] * L) / a[1] + (b[0] * L) / b[1];
      const right = add(mixed(w1, a), mixed(w2, b));
      const fracSum = add(fr(a), fr(b));
      return choose(
        r,
        {
          prompt: `Work out **${w1} ${raw(a)} + ${w2} ${raw(b)}**. Give your answer as a mixed number.`,
          hint: "Add the wholes, then add the fractions using a common denominator.",
          hints: [`${w1} + ${w2} = ${w1 + w2}. The LCM of ${a[1]} and ${b[1]} is ${L}.`, `${raw(a)} + ${raw(b)} = {${tops}/${L}}, which is more than 1 whole.`],
          explanation: `${w1} + ${w2} = ${w1 + w2}; ${raw(a)} + ${raw(b)} = {${tops}/${L}} = ${show(fracSum)}. Altogether **${show(right)}**.`,
        },
        show(right),
        [
          { text: `${w1 + w2} {${a[0] + b[0]}/${a[1] + b[1]}}`, misconception: M.addDen, feedback: "The tops and the bottoms were both added. Change both fractions to the same denominator, then add only the tops." },
          { text: show(subtract(right, ONE)), misconception: M.mixed, feedback: `The fractions add to more than 1, so carry the extra whole: {${tops}/${L}} = ${show(fracSum)}.` },
          { text: show(add(right, ONE)), feedback: "One whole too many: check how many wholes there are." },
        ],
      );
    },
  },
  {
    key: "f2x-sub-mixed",
    skill: S.different,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const [w1, a, w2, b] = pick(r, SUB_MIXED);
      const A = mixed(w1, a);
      const B = mixed(w2, b);
      const right = subtract(A, B);
      const L = lcm(a[1], b[1]);
      const flipped = add({ n: w1 - w2, d: 1 }, subtract(fr(b), fr(a)));
      return choose(
        r,
        {
          prompt: `Work out **${w1} ${raw(a)} − ${w2} ${raw(b)}**.`,
          hint: `${raw(a)} is smaller than ${raw(b)}, so you can't take the fractions away on their own. Change both to improper fractions.`,
          hints: [`${w1} ${raw(a)} = {${A.n}/${A.d}} and ${w2} ${raw(b)} = {${B.n}/${B.d}}.`, `Use denominator ${L}: {${(A.n * L) / A.d}/${L}} − {${(B.n * L) / B.d}/${L}}.`],
          explanation: `{${A.n}/${A.d}} − {${B.n}/${B.d}} = {${(A.n * L) / A.d}/${L}} − {${(B.n * L) / B.d}/${L}} = {${(A.n * L) / A.d - (B.n * L) / B.d}/${L}} = **${show(right)}**.`,
        },
        show(right),
        [
          { text: show(flipped), misconception: M.mixed, feedback: `That takes ${raw(a)} from ${raw(b)} instead (the wrong way round). Borrow a whole, or use improper fractions.` },
          { text: show(add(right, ONE)), misconception: M.mixed, feedback: "When you borrow a whole to make the fraction bigger, take 1 off the wholes too." },
          { text: show(subtract(flipped, ONE)), feedback: "Check the fraction part: it was taken away the wrong way round." },
        ],
      );
    },
  },
  {
    key: "f2x-left",
    skill: S.different,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const [a, b, text] = pick(r, LEFT);
      const spent = add(fr(a), fr(b));
      const right = subtract(ONE, spent);
      const L = lcm(a[1], b[1]);
      const wrongAdd: Fraction = { n: a[0] + b[0], d: a[1] + b[1] };
      return choose(
        r,
        {
          prompt: `${text.replace("{a}", raw(a)).replace("{b}", raw(b))} What fraction is **left**?`,
          hint: "Add the two fractions, then take the total away from 1 whole.",
          hints: [`Use denominator ${L}: ${raw(a)} + ${raw(b)} = ${show(spent)}.`, `1 whole is {${L}/${L}}. Take ${show(spent)} away from it.`],
          explanation: `${raw(a)} + ${raw(b)} = ${show(spent)}, and 1 − ${show(spent)} = **${show(right)}**.`,
        },
        show(right),
        [
          { text: show(spent), feedback: "That is the part used up. The question asks what is **left**." },
          { text: show(subtract(ONE, wrongAdd)), misconception: M.addDen, feedback: "The tops and bottoms were added. Make the denominators the same first." },
          { text: show(wrongAdd), misconception: M.addDen, feedback: "Adding tops and bottoms doesn't work, and the question asks what is left." },
        ],
      );
    },
  },
  {
    key: "f2x-missing-add",
    skill: S.different,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const [a, total] = pick(r, MISSING_ADD);
      const right = subtract(fr(total), fr(a));
      const L = lcm(a[1], total[1]);
      return choose(
        r,
        {
          prompt: `What must be added to **${raw(a)}** to make **${raw(total)}**?`,
          hint: `Work backwards: ${raw(total)} − ${raw(a)}.`,
          hints: [`Use denominator ${L}: ${raw(total)} = {${(total[0] * L) / total[1]}/${L}} and ${raw(a)} = {${(a[0] * L) / a[1]}/${L}}.`, "Take the tops away."],
          explanation: `${raw(total)} − ${raw(a)} = {${(total[0] * L) / total[1]}/${L}} − {${(a[0] * L) / a[1]}/${L}} = **${show(right)}**.`,
        },
        show(right),
        [
          { text: show(add(fr(total), fr(a))), feedback: "That adds them. To find the missing part, take away." },
          { text: `{${total[0] - a[0]}/${total[1] - a[1]}}`, misconception: M.noCommon, feedback: "Taking away tops and bottoms separately doesn't work. Use a common denominator." },
          { text: show({ n: (total[0] * L) / total[1] - a[0], d: L }), misconception: M.noCommon, feedback: `Change ${raw(a)} to the same denominator too before you take it away.` },
        ],
      );
    },
  },
  {
    key: "f2x-times-mixed",
    skill: S.times,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const [w1, a, w2, b] = pick(r, TIMES_MIXED);
      const A = mixed(w1, a);
      const B = mixed(w2, b);
      const right = multiply(A, B);
      return choose(
        r,
        {
          prompt: `Work out **${w1} ${raw(a)} × ${w2} ${raw(b)}**.`,
          hint: "Change both mixed numbers into improper fractions first.",
          hints: [`${w1} ${raw(a)} = {${A.n}/${A.d}} and ${w2} ${raw(b)} = {${B.n}/${B.d}}.`, "Multiply the tops, multiply the bottoms, then simplify."],
          explanation: `{${A.n}/${A.d}} × {${B.n}/${B.d}} = {${A.n * B.n}/${A.d * B.d}} = **${show(right)}**.`,
        },
        show(right),
        [
          { text: show(add({ n: w1 * w2, d: 1 }, multiply(fr(a), fr(b)))), misconception: M.mixed, feedback: "Multiplying the wholes and the fractions separately misses two parts of the answer. Use improper fractions." },
          { text: show(add(A, B)), feedback: "That adds the two numbers. The question asks you to multiply." },
          { text: show(add({ n: w1 * w2, d: 1 }, add(fr(a), fr(b)))), misconception: M.mixed, feedback: "Change to improper fractions, then multiply tops and bottoms." },
        ],
      );
    },
  },
  {
    key: "f2x-of-of",
    skill: S.times,
    difficulties: [3],
    stretch: true,
    make: (r): Omit<KitNumberQuestion, "id" | "skill" | "difficulty"> => {
      const [a, b, n] = pick(r, OF_OF);
      const inner = (n / b[1]) * b[0];
      const answer = (inner / a[1]) * a[0];
      return {
        kind: "number",
        prompt: `Work out **${raw(a)} of ${raw(b)} of ${n}**.`,
        answer,
        hint: `Start from the right: find ${raw(b)} of ${n} first.`,
        hints: [`${raw(b)} of ${n}: ${n} ÷ ${b[1]} × ${b[0]} = ${inner}.`, `Now ${raw(a)} of ${inner}: ${inner} ÷ ${a[1]} × ${a[0]}.`],
        explanation: `${raw(b)} of ${n} = ${inner}, and ${raw(a)} of ${inner} = **${answer}**. (Or: ${raw(a)} × ${raw(b)} = ${show(multiply(fr(a), fr(b)))}, and ${show(multiply(fr(a), fr(b)))} of ${n} = ${answer}.)`,
        traps: [
          { value: inner, feedback: `${inner} is ${raw(b)} of ${n}. Now find ${raw(a)} of that.` },
          { value: (n / a[1]) * a[0], feedback: `That is ${raw(a)} of ${n}. You need ${raw(a)} of ${raw(b)} of ${n}.` },
        ],
      };
    },
  },
  {
    key: "f2x-remainder",
    skill: S.times,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const [a, b] = pick(r, REMAINDER);
      const rest = subtract(ONE, fr(a));
      const second = multiply(fr(b), rest);
      const right = subtract(rest, second);
      const wholeWrong = subtract(rest, fr(b));
      return choose(
        r,
        {
          prompt: `Ria spends **${raw(a)}** of her money on rent and **${raw(b)}** of the **remainder** on food. What fraction of her money is left?`,
          hint: `After rent, ${show(rest)} of her money remains. Food is ${raw(b)} **of that**.`,
          hints: [`Food: ${raw(b)} × ${show(rest)} = ${show(second)} of all her money.`, `Left: 1 − ${raw(a)} − ${show(second)}.`],
          explanation: `Remainder ${show(rest)}; food ${raw(b)} × ${show(rest)} = ${show(second)}; left 1 − ${raw(a)} − ${show(second)} = **${show(right)}**.`,
        },
        show(right),
        [
          { text: show(wholeWrong), feedback: `That takes ${raw(b)} of **all** the money. The food is ${raw(b)} of the remainder, ${show(rest)}.` },
          { text: show(second), feedback: "That is the fraction spent on food. What is left after rent **and** food?" },
          { text: show(rest), feedback: "That is what is left after rent only. Food comes out of it too." },
        ],
      );
    },
  },
  {
    key: "f2x-reverse",
    skill: S.times,
    difficulties: [3],
    stretch: true,
    make: (r): Omit<KitNumberQuestion, "id" | "skill" | "difficulty"> => {
      const [a, part] = pick(r, REVERSE);
      const one = part / a[0];
      const answer = one * a[1];
      return {
        kind: "number",
        prompt: `**${raw(a)}** of a number is **${part}**. What is the number?`,
        answer,
        hint: `${raw(a)} means ${a[0]} parts out of ${a[1]}. ${a[0]} parts are worth ${part}.`,
        hints: [`One part: ${part} ÷ ${a[0]} = ${one}.`, `The whole is ${a[1]} parts: ${one} × ${a[1]}.`],
        explanation: `${a[0]} parts = ${part}, so 1 part = ${one} and ${a[1]} parts = **${answer}**.`,
        traps: [
          { value: (part / a[1]) * a[0], feedback: `That finds ${raw(a)} **of** ${part}. Here ${part} is already the ${raw(a)}: work back to the whole.` },
          { value: one, feedback: `${one} is one part. The whole has ${a[1]} parts.` },
        ].filter((t) => Number.isInteger(t.value)),
      };
    },
  },
  {
    key: "f2x-area",
    skill: S.times,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const [a, b] = pick(r, AREA);
      const right = multiply(fr(a), fr(b));
      const sum = add(fr(a), fr(b));
      return choose(
        r,
        {
          prompt: `A rectangle is **${raw(a)} m** long and **${raw(b)} m** wide. What is its area, in m²?`,
          hint: "Area of a rectangle = length × width.",
          hints: [`${raw(a)} × ${raw(b)}: multiply the tops, multiply the bottoms.`, `{${a[0] * b[0]}/${a[1] * b[1]}}: now simplify.`],
          explanation: `${raw(a)} × ${raw(b)} = {${a[0] * b[0]}/${a[1] * b[1]}} = **${show(right)}** m².`,
        },
        show(right),
        [
          { text: show(sum), feedback: "That adds the length and the width. Area multiplies them." },
          { text: show(multiply({ n: 2, d: 1 }, sum)), feedback: "That is the perimeter (all the way round). Area is length × width." },
          { text: `{${a[0] * b[0]}/${a[1] + b[1]}}`, feedback: "Multiply the bottoms too, not add them." },
        ],
      );
    },
  },
];

/** The new question makers join the island (practice can use them too); no new skills or lessons. */
export const deepExtra: TopicExtra = { skills: [], lessons: [], lessonIcons: {}, templates, misconceptions: [], placement: [] };

export const FRACTIONS2_DEEP: DeepLesson[] = [
  {
    lessonId: "simplify",
    skill: S.simplify,
    hook: "A recipe needs **{18/24}** of a bag of flour. Is that more or less than **{3/4}** of a bag?",
    hookAnswer: "Neither: {18/24} = {3/4}. Divide the top and bottom by their HCF, 6, and you get exactly the same fraction.",
    scenes: [
      { diagram: { kind: "area", cols: 4, rows: 1, colShade: 3, colLabel: "{3/4}", readout: "3 of 4 pieces" }, caption: "This rectangle shows **{3/4}**: 4 equal pieces, 3 shaded." },
      { diagram: { kind: "area", cols: 4, rows: 2, colShade: 3, colLabel: "{3/4}", readout: "6 of 8 pieces" }, caption: "Cut every piece in half across. There are now **8** pieces and **6** are shaded: **{6/8}**. The shaded area hasn't changed." },
      { diagram: { kind: "area", cols: 4, rows: 3, colShade: 3, colLabel: "{3/4}", readout: "9 of 12 pieces" }, caption: "Cut into 3 rows instead: **12** pieces, **9** shaded. **{9/12}** is the same amount again." },
      { diagram: { kind: "area", cols: 4, rows: 6, colShade: 3, colLabel: "{3/4}", readout: "18 of 24 pieces" }, caption: "6 rows: **24** pieces, **18** shaded. So **{18/24}** = **{3/4}**. Multiplying the top and bottom by 6 just cut each piece into 6." },
      { diagram: { kind: "area", cols: 4, rows: 1, colShade: 3, colLabel: "{3/4}", readout: "3 of 4 pieces" }, caption: "**Simplifying** runs it backwards: divide the top and bottom by 6 and the cuts disappear. **{3/4}** can't go further: 3 and 4 share no factor but 1." },
    ],
    why: [
      "Multiplying the top and the bottom by the same number cuts every piece into that many smaller pieces. You get more pieces, but the same amount is shaded, so the fraction is **equivalent**.",
      "Dividing the top and the bottom by a **common factor** joins pieces back together. A fraction is in its **simplest form** when the top and bottom have no common factor except 1.",
    ],
    method: [
      "Find the **highest common factor** (HCF) of the top and the bottom. For big numbers, write each as a product of primes and multiply the primes they share.",
      "Divide the top and the bottom by the HCF.",
      "Check: if the new top and bottom still share a factor, you didn't use the highest one. Keep going.",
      "To **compare** fractions, write them with a common denominator (the LCM of the bottoms) and compare the tops.",
    ],
    keyIdea: "Do the same to the top and the bottom, multiply or divide, never add or subtract, and the fraction keeps its size.",
    examples: [
      { level: "Core", problem: "Simplify **{18/24}**.", steps: ["Factors of 18: 1, 2, 3, **6**, 9, 18. Factors of 24: 1, 2, 3, 4, **6**, 8, 12, 24.", "The HCF is 6.", "18 ÷ 6 = 3 and 24 ÷ 6 = 4."], answer: "{18/24} = **{3/4}**" },
      { level: "11+", problem: "**{5/8}** is equal to how many **fifty-sixths**?", steps: ["What turns 8 into 56? 8 × 7 = 56.", "Do the same to the top: 5 × 7 = 35."], answer: "{5/8} = **{35/56}**" },
      { level: "GCSE", problem: "Write **{84/126}** in its simplest form.", steps: ["84 = 2 × 2 × 3 × 7 and 126 = 2 × 3 × 3 × 7.", "Shared primes: 2, 3 and 7, so the HCF is 2 × 3 × 7 = 42.", "84 ÷ 42 = 2 and 126 ÷ 42 = 3."], answer: "{84/126} = **{2/3}**" },
      { level: "GCSE", problem: "Write **{2/3}**, **{5/8}** and **{7/12}** in order, smallest first.", steps: ["The LCM of 3, 8 and 12 is 24.", "{2/3} = {16/24}, {5/8} = {15/24}, {7/12} = {14/24}.", "Compare the tops: 14 < 15 < 16."], answer: "**{7/12}, {5/8}, {2/3}**" },
    ],
    mistakes: [
      { wrong: "{6/8} = {5/7}, by taking 1 off the top and the bottom.", right: "{6/8} = {3/4}, by dividing both by 2.", why: "Subtracting changes the size: {5/7} is less than {6/8}. Only multiplying or dividing both by the same number keeps it equal." },
      { wrong: "{12/16} simplifies to {6/8}. Done.", right: "{12/16} = **{3/4}**.", why: "6 and 8 still share 2. Dividing by the HCF (4) gets there in one step." },
      { wrong: "{1/8} is bigger than {1/6} because 8 is bigger than 6.", right: "{1/6} is bigger than {1/8}.", why: "The bottom number is how many pieces the whole is cut into. More pieces means smaller pieces." },
    ],
    exercise: [id("f2x-missing"), id("f2x-simp-big"), id("f2x-simp-word"), id("f2x-order"), id("f2x-between")],
    remember: ["Equivalent fractions: multiply or divide the top and the bottom by the same number.", "Simplest form: divide by the HCF of the top and the bottom.", "To compare or order fractions, give them a common denominator."],
  },
  {
    lessonId: "add-different",
    skill: S.different,
    hook: "Ali spends **{1/3}** of his pocket money on a game and **{2/5}** on a book. What fraction of his money is left?",
    hookAnswer: "{1/3} + {2/5} = {5/15} + {6/15} = {11/15}, so {4/15} of his money is left.",
    scenes: [
      { diagram: { kind: "bars", bars: [{ parts: 3, fill: [{ count: 1, tone: "num" }], label: "{1/3}" }, { parts: 5, fill: [{ count: 2, tone: "den" }], label: "{2/5}" }] }, caption: "Thirds and fifths are **different sizes**, so you can't count them together yet." },
      { diagram: { kind: "bars", bars: [{ parts: 15, coarse: 3, fill: [{ count: 5, tone: "num" }], label: "{5/15}" }, { parts: 15, coarse: 5, fill: [{ count: 6, tone: "den" }], label: "{6/15}" }] }, caption: "Cut both into **fifteenths**: 15 is the lowest common multiple of 3 and 5. **{1/3}** = **{5/15}** and **{2/5}** = **{6/15}**." },
      { diagram: { kind: "bars", bars: [{ parts: 15, coarse: 3, fill: [{ count: 5, tone: "num" }], label: "{5/15}" }, { parts: 15, coarse: 5, fill: [{ count: 6, tone: "den" }], label: "{6/15}" }, { parts: 15, fill: [{ count: 5, tone: "num" }, { count: 6, tone: "den" }], label: "{11/15}" }] }, caption: "Now the pieces match, so count them: 5 + 6 = **11** fifteenths. **{1/3}** + **{2/5}** = **{11/15}**." },
      { diagram: { kind: "bars", bars: [{ parts: 15, fill: [{ count: 5, tone: "num" }, { count: 6, tone: "den" }, { count: 4, tone: "ok" }], label: "{4/15} left" }] }, caption: "The whole is **{15/15}**. Take away the 11 used and **{4/15}** is left." },
    ],
    why: [
      "The bottom number says what **size** the pieces are. You can only add or take away pieces of the same size, just as you can't add 3 metres and 2 centimetres without changing one of them.",
      "Making the denominators the same is the same as cutting both wholes into equal, smaller pieces. Using the **lowest** common multiple keeps the numbers small.",
    ],
    method: [
      "Find the **lowest common multiple** (LCM) of the denominators.",
      "Change each fraction to that denominator: multiply its top and bottom by the same number.",
      "Add or subtract the **tops**; the bottom stays the same.",
      "Simplify, and change an improper answer to a mixed number.",
      "Mixed numbers: add the wholes and the fractions separately, carrying a whole if the fractions make more than 1. To subtract, it's safest to use **improper fractions**.",
    ],
    keyIdea: "Same-size pieces first: make the denominators equal, then add or take away the numerators only.",
    examples: [
      { level: "Core", problem: "**{3/4}** + **{1/6}**", steps: ["The LCM of 4 and 6 is 12.", "{3/4} = {9/12} and {1/6} = {2/12}.", "9 + 2 = 11."], answer: "**{11/12}**" },
      { level: "11+", problem: "**{5/6}** − **{3/8}**", steps: ["The LCM of 6 and 8 is 24.", "{5/6} = {20/24} and {3/8} = {9/24}.", "20 − 9 = 11."], answer: "**{11/24}**" },
      { level: "GCSE", problem: "**2 {3/4}** + **1 {5/6}**", steps: ["Wholes: 2 + 1 = 3.", "Fractions: {3/4} + {5/6} = {9/12} + {10/12} = {19/12} = 1 {7/12}.", "3 + 1 {7/12}."], answer: "**4 {7/12}**" },
      { level: "GCSE", problem: "**3 {1/5}** − **1 {2/3}**", steps: ["{1/5} is smaller than {2/3}, so use improper fractions: {16/5} − {5/3}.", "The LCM is 15: {48/15} − {25/15} = {23/15}.", "{23/15} = 1 {8/15}."], answer: "**1 {8/15}**" },
    ],
    mistakes: [
      { wrong: "{1/3} + {1/4} = {2/7}", right: "{1/3} + {1/4} = {4/12} + {3/12} = **{7/12}**", why: "{2/7} is less than {1/3}. Adding can't make the answer smaller than what you started with." },
      { wrong: "{1/3} = {1/12}, so {1/3} + {1/4} = {1/12} + {3/12}", right: "{1/3} = **{4/12}**", why: "Whatever the bottom is multiplied by, the top must be multiplied by too." },
      { wrong: "3 {1/5} − 1 {2/3} = 2 {7/15}, by taking {1/5} from {2/3}", right: "3 {1/5} − 1 {2/3} = **1 {8/15}**", why: "You must take {2/3} from {1/5}, which you can't do without borrowing a whole. Improper fractions avoid the trap." },
    ],
    exercise: [id("f2x-missing-add"), id("f2x-left"), id("f2x-add-mixed"), id("f2x-sub-mixed")],
    remember: ["Make the denominators the same (use the LCM), then add or subtract the tops.", "Simplify, and write improper answers as mixed numbers.", "For mixed numbers, carry a whole when adding; use improper fractions when subtracting."],
  },
  {
    lessonId: "times-fractions",
    skill: S.times,
    hook: "A garden is **{3/4}** grass. **{2/3}** of the grass has daisies on it. What fraction of the **whole** garden has daisies?",
    hookAnswer: "{2/3} of {3/4} = {2/3} × {3/4} = {6/12} = {1/2} of the garden.",
    scenes: [
      { diagram: { kind: "area", cols: 4, rows: 1, colShade: 3, colLabel: "{3/4}", readout: "grass: 3 of 4" }, caption: "The garden is cut into quarters. **{3/4}** of it is grass." },
      { diagram: { kind: "area", cols: 4, rows: 3, colShade: 3, colLabel: "{3/4}", readout: "12 pieces" }, caption: "To find **{2/3} of** the grass, cut the whole garden across into thirds. There are now 4 × 3 = **12** pieces." },
      { diagram: { kind: "area", cols: 4, rows: 3, colShade: 3, rowShade: 2, colLabel: "{3/4}", rowLabel: "{2/3}", readout: "6 of 12 pieces" }, caption: "Shade 2 of the 3 rows. The overlap, grass **and** daisies, is 3 × 2 = **6** pieces out of 12." },
      { diagram: { kind: "area", cols: 4, rows: 3, colShade: 3, rowShade: 2, colLabel: "{3/4}", rowLabel: "{2/3}", readout: "{6/12} = {1/2}" }, caption: "So **{2/3}** × **{3/4}** = **{6/12}** = **{1/2}**. Multiply the tops (pieces in the overlap) and the bottoms (pieces in the whole)." },
    ],
    why: [
      "**Of** means multiply: {2/3} of {3/4} is {2/3} × {3/4}.",
      "Cutting one way into 4 and the other way into 3 makes 4 × 3 = 12 pieces, which is why the bottoms multiply. The overlap is 3 columns by 2 rows, 3 × 2 = 6 pieces, which is why the tops multiply.",
      "A part of a part is smaller than either part, so multiplying two proper fractions always gives a **smaller** answer.",
    ],
    method: [
      "Change any mixed numbers into **improper fractions** first.",
      "**Cancel** a top with a bottom if they share a factor; it keeps the numbers small.",
      "Multiply the tops, then multiply the bottoms.",
      "Simplify, and write improper answers as mixed numbers.",
      "Going backwards: if {2/3} of a number is 18, then {1/3} is 9 and the whole is 27.",
    ],
    keyIdea: "Tops times tops, bottoms times bottoms. With mixed numbers, make them improper first.",
    examples: [
      { level: "Core", problem: "**{2/5}** × **{3/4}**", steps: ["Tops: 2 × 3 = 6. Bottoms: 5 × 4 = 20.", "{6/20}: divide both by 2."], answer: "**{3/10}**" },
      { level: "11+", problem: "Find **{3/5}** of **{2/3}** of **45**.", steps: ["{2/3} of 45: 45 ÷ 3 × 2 = 30.", "{3/5} of 30: 30 ÷ 5 × 3 = 18."], answer: "**18**" },
      { level: "GCSE", problem: "**2 {1/3}** × **1 {1/2}**", steps: ["Improper: {7/3} × {3/2}.", "Cancel the 3s: {7/1} × {1/2} = {7/2}.", "{7/2} = 3 {1/2}."], answer: "**3 {1/2}**" },
      { level: "GCSE", problem: "Ria spends **{1/4}** of her money on rent and **{2/3}** of the **remainder** on food. What fraction is left?", steps: ["After rent, {3/4} remains.", "Food: {2/3} × {3/4} = {1/2} of all her money.", "Left: 1 − {1/4} − {1/2} = {1/4}."], answer: "**{1/4}**" },
    ],
    mistakes: [
      { wrong: "2 {1/3} × 1 {1/2} = 2 {1/6}: wholes times wholes, fractions times fractions.", right: "{7/3} × {3/2} = **3 {1/2}**", why: "That misses 2 × {1/2} and {1/3} × 1. Improper fractions multiply everything with everything." },
      { wrong: "{2/3} × {3/4} must be bigger than {3/4}, because multiplying makes things bigger.", right: "{2/3} × {3/4} = **{1/2}**, smaller than both.", why: "Taking {2/3} **of** something gives less than all of it." },
      { wrong: "{2/3} of the remainder: 1 − {1/4} − {2/3} = {1/12}", right: "{2/3} × {3/4} = {1/2}, so {1/4} is left.", why: "The {2/3} is of what remains after rent, not of all the money." },
    ],
    exercise: [id("f2x-of-of"), id("f2x-area"), id("f2x-times-mixed"), id("f2x-reverse"), id("f2x-remainder")],
    remember: ["'Of' means multiply.", "Multiply the tops and the bottoms; cancel first to keep numbers small.", "Make mixed numbers improper before multiplying.", "Reverse problems: find one part, then the whole."],
  },
];
