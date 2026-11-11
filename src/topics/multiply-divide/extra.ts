import { divmod } from "@/maths/integer";
import { isPrime, primeFactors } from "@/maths/primes";
import { genFor, int, pick, withAnswer, type TopicExtra } from "@/topics/kit/define";
import type { Template } from "@/topics/kit/types";

/**
 * D-037: long division (Y6.ASMD.2), primes and prime factors (Y5.MD.2, Y5.MD.3), square and cube numbers (Y5.MD.6) and
 * the order of operations (Y6.ASMD.6).
 */

const T = "multiply-divide";
const gen = genFor(T);
const S = { ldiv: `${T}.long-division`, primes: `${T}.primes`, powers: `${T}.squares-cubes`, order: `${T}.order-ops` };
const M = { roundUp: `${T}.remainder-round`, oddPrime: `${T}.odd-prime`, powerTimes: `${T}.power-times`, leftRight: `${T}.left-to-right` };
const fmt = (n: number) => n.toLocaleString("en-GB");

/** The written steps of long division, one per digit brought down: what was divided, how many times, what was left. */
function divisionSteps(n: number, d: number): { part: number; times: number; left: number }[] {
  const steps: { part: number; times: number; left: number }[] = [];
  let carry = 0;
  for (const ch of String(n)) {
    const part = carry * 10 + Number(ch);
    const { q, r } = divmod(part, d);
    if (steps.length || q > 0) steps.push({ part, times: q, left: r });
    carry = r;
  }
  return steps;
}
const stepText = (n: number, d: number) => divisionSteps(n, d).map((s) => `${fmt(s.part)} ÷ ${d} = ${s.times} r ${s.left}`).join("; ");

/** Odd numbers that are not prime but look as if they might be. */
const ODD_COMPOSITES = [9, 15, 21, 25, 27, 33, 35, 39, 45, 49, 51, 55, 57, 63, 65, 69, 75, 77, 81, 85, 87, 91, 93, 95, 99];

const templates: Template[] = [
  // Long division.
  {
    key: "md-ldiv",
    skill: S.ldiv,
    difficulties: [2, 3],
    make: (r, { difficulty }) => {
      const d = int(r, 12, difficulty === 2 ? 25 : 48);
      const q = int(r, difficulty === 2 ? 11 : 21, difficulty === 2 ? 60 : 99);
      const n = d * q;
      return {
        kind: "number",
        prompt: `Work out **${fmt(n)} ÷ ${d}**.`,
        answer: q,
        traps: [{ value: Math.floor(q / 10), feedback: "That is only the first step. Bring the next digit down and keep dividing." }, { value: q * 10, feedback: "Check the place of each digit in the answer: estimate first." }].filter((t) => t.value !== q),
        hint: `Estimate first: about how many ${d}s make ${fmt(n)}?`,
        hints: [`Divide a little at a time, from the left: ${stepText(n, d)}.`, `Check: ${q} × ${d} should make ${fmt(n)}.`],
        explanation: `${stepText(n, d)}. So ${fmt(n)} ÷ ${d} = **${q}**. Check: ${q} × ${d} = ${fmt(n)}.`,
      };
    },
  },
  {
    key: "md-ldiv-rem",
    skill: S.ldiv,
    difficulties: [2, 3],
    make: (r, { difficulty }) => {
      const d = int(r, 12, difficulty === 2 ? 25 : 48);
      const q = int(r, 11, difficulty === 2 ? 40 : 90);
      const rem = int(r, 1, d - 1);
      const n = d * q + rem;
      return {
        kind: "number",
        prompt: `**${fmt(n)} ÷ ${d}** = ${q} remainder **?**`,
        answer: rem,
        traps: [{ value: d - rem, feedback: `The remainder is what is left over: ${fmt(n)} − ${q} × ${d}.` }].filter((t) => t.value !== rem),
        hint: `Work out ${q} × ${d} first.`,
        hints: [`${q} × ${d} = ${fmt(q * d)}. What is left from ${fmt(n)}?`, "The remainder must be smaller than the number you divide by."],
        explanation: `${q} × ${d} = ${fmt(q * d)}, and ${fmt(n)} − ${fmt(q * d)} = **${rem}**. It is less than ${d}, so it is the remainder.`,
      };
    },
  },
  {
    key: "md-ldiv-word",
    skill: S.ldiv,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const d = pick(r, [12, 15, 16, 24, 25, 36]);
      const full = int(r, 14, 60);
      const n = d * full + int(r, 1, d - 1);
      return {
        kind: "number",
        prompt: `A factory packs **${fmt(n)} eggs** into boxes of **${d}**. How many boxes does it need so that every egg is packed?`,
        answer: full + 1,
        traps: [{ value: full, misconception: M.roundUp, feedback: "Those boxes are full, but some eggs are left over. They need one more box." }],
        hint: `Divide ${fmt(n)} by ${d}.`,
        hints: [`${fmt(n)} ÷ ${d} = ${full} remainder ${n - d * full}.`, "The eggs left over still need a box: round up."],
        explanation: `${fmt(n)} ÷ ${d} = ${full} remainder ${n - d * full}. ${full} boxes are full and the last ${n - d * full} eggs need one more: **${full + 1}** boxes.`,
      };
    },
  },
  // Primes.
  {
    key: "md-prime-which",
    skill: S.primes,
    difficulties: [1, 2],
    make: (r, { difficulty }) => {
      const max = difficulty === 1 ? 50 : 100;
      const primes = Array.from({ length: max - 10 }, (_, i) => i + 11).filter(isPrime);
      const right = pick(r, primes);
      const pool = ODD_COMPOSITES.filter((x) => x <= max);
      const wrong: number[] = [];
      while (wrong.length < 3) {
        const x = pick(r, pool);
        if (!wrong.includes(x)) wrong.push(x);
      }
      const { options, answer } = withAnswer(r, right, wrong);
      const factorPair = (x: number) => { const p = primeFactors(x)[0]; return `${x} = ${p} × ${x / p}`; };
      return {
        kind: "choose",
        prompt: "Which of these is a **prime number**?",
        options: options.map((x) => (x === right ? { text: String(x) } : { text: String(x), misconception: M.oddPrime, feedback: `${factorPair(x)}, so it has more than two factors.` })),
        answer,
        hint: "A prime number has exactly two factors: 1 and itself.",
        hints: ["Try dividing each number by 3, 5 and 7.", "Odd numbers can still have factors: 21 = 3 × 7."],
        explanation: `${wrong.map(factorPair).join(", ")}. **${right}** can only be divided by 1 and ${right}, so it is prime.`,
      };
    },
  },
  {
    key: "md-prime-factors",
    skill: S.primes,
    difficulties: [2, 3],
    make: (r, { difficulty }) => {
      let n = 0;
      do n = int(r, 12, difficulty === 2 ? 100 : 300);
      while (isPrime(n) || primeFactors(n).length < 3);
      const pf = primeFactors(n);
      const biggest = pf[pf.length - 1];
      return {
        kind: "number",
        prompt: `Write **${n}** as a product of prime numbers. What is its **largest prime factor**?`,
        answer: biggest,
        traps: [{ value: n / pf[0], feedback: `${n / pf[0]} is a factor, but it is not prime: keep splitting it.` }].filter((t) => t.value !== biggest),
        hint: `Start by dividing ${n} by the smallest prime that goes into it.`,
        hints: [`Keep dividing by primes until every part is prime: ${n} = ${pf[0]} × ${n / pf[0]}, and so on.`, `${n} = ${pf.join(" × ")}.`],
        explanation: `${n} = ${pf.join(" × ")}. Every part is prime, and the largest is **${biggest}**.`,
      };
    },
  },
  {
    key: "md-prime-stretch",
    skill: S.primes,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      // Primes in the same ten have different last digits, so a decade and a digit sum pick exactly one.
      const p = pick(r, Array.from({ length: 80 }, (_, i) => i + 20).filter(isPrime));
      const lo = Math.floor(p / 10) * 10;
      const sum = String(p).split("").reduce((a, c) => a + Number(c), 0);
      const others = Array.from({ length: 10 }, (_, i) => lo + i).filter((x) => isPrime(x) && x !== p);
      return {
        kind: "number",
        prompt: `I am a **prime number** between **${lo}** and **${lo + 9}**. My digits add up to **${sum}**. What number am I?`,
        answer: p,
        traps: others.map((x) => ({ value: x, feedback: `${x} is prime, but its digits add up to ${String(x).split("").reduce((a, c) => a + Number(c), 0)}.` })),
        hint: `List the primes from ${lo} to ${lo + 9}.`,
        hints: [`The primes there: ${[p, ...others].sort((a, b) => a - b).join(", ")}.`, "Add the digits of each one."],
        explanation: `The primes from ${lo} to ${lo + 9} are ${[p, ...others].sort((a, b) => a - b).join(", ")}. Only **${p}** has digits adding up to ${sum}.`,
      };
    },
  },
  // Square and cube numbers.
  {
    key: "md-square",
    skill: S.powers,
    difficulties: [1, 2],
    make: (r, { difficulty }) => {
      const a = difficulty === 1 ? int(r, 3, 10) : int(r, 11, 15);
      return {
        kind: "number",
        prompt: `What is **${a}²**?`,
        answer: a * a,
        traps: [{ value: 2 * a, misconception: M.powerTimes, feedback: `${a}² means ${a} × ${a}, not ${a} × 2.` }],
        hint: `The small 2 means "times itself": ${a} × ${a}.`,
        hints: ["Picture a square of dots with the same number in each row and column.", `${a} × ${a}.`],
        explanation: `${a}² = ${a} × ${a} = **${a * a}**.`,
      };
    },
  },
  {
    key: "md-cube",
    skill: S.powers,
    difficulties: [2, 3],
    make: (r, { difficulty }) => {
      const a = difficulty === 2 ? int(r, 2, 5) : int(r, 6, 10);
      return {
        kind: "number",
        prompt: `What is **${a}³**?`,
        answer: a ** 3,
        traps: [{ value: 3 * a, misconception: M.powerTimes, feedback: `${a}³ means ${a} × ${a} × ${a}, not ${a} × 3.` }, { value: a * a, feedback: `That is ${a}². A cube multiplies by ${a} once more.` }],
        hint: `The small 3 means ${a} × ${a} × ${a}.`,
        hints: [`First ${a} × ${a} = ${a * a}.`, `Then ${a * a} × ${a}.`],
        explanation: `${a}³ = ${a} × ${a} × ${a} = ${a * a} × ${a} = **${a ** 3}**.`,
      };
    },
  },
  {
    key: "md-powers-stretch",
    skill: S.powers,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const a = int(r, 4, 12);
      const b = int(r, 2, 5);
      return {
        kind: "number",
        prompt: `Work out **${a}² + ${b}³**.`,
        answer: a * a + b ** 3,
        traps: [{ value: 2 * a + 3 * b, misconception: M.powerTimes, feedback: "² and ³ mean multiply the number by itself, not by 2 or 3." }],
        hint: "Work out each part on its own first.",
        hints: [`${a}² = ${a * a}.`, `${b}³ = ${b ** 3}. Now add.`],
        explanation: `${a}² = ${a * a} and ${b}³ = ${b ** 3}. ${a * a} + ${b ** 3} = **${a * a + b ** 3}**.`,
      };
    },
  },
  // Order of operations.
  {
    key: "md-order",
    skill: S.order,
    difficulties: [1, 2],
    make: (r, { difficulty }) => {
      const [a, b, c] = [int(r, 2, 20), int(r, 2, 9), int(r, 2, 9)];
      if (difficulty === 1) {
        return {
          kind: "number",
          prompt: `Work out **${a} + ${b} × ${c}**.`,
          answer: a + b * c,
          traps: [{ value: (a + b) * c, misconception: M.leftRight, feedback: `Multiply before you add: ${b} × ${c} first.` }],
          hint: "Multiplying comes before adding.",
          hints: [`${b} × ${c} = ${b * c}.`, `Then ${a} + ${b * c}.`],
          explanation: `Multiply first: ${b} × ${c} = ${b * c}. Then ${a} + ${b * c} = **${a + b * c}**.`,
        };
      }
      const big = b * c + int(r, 5, 30);
      return {
        kind: "number",
        prompt: `Work out **${big} − ${b} × ${c}**.`,
        answer: big - b * c,
        traps: [{ value: (big - b) * c, misconception: M.leftRight, feedback: `Multiply before you take away: ${b} × ${c} first.` }],
        hint: "Multiplying comes before taking away.",
        hints: [`${b} × ${c} = ${b * c}.`, `Then ${big} − ${b * c}.`],
        explanation: `Multiply first: ${b} × ${c} = ${b * c}. Then ${big} − ${b * c} = **${big - b * c}**.`,
      };
    },
  },
  {
    key: "md-brackets",
    skill: S.order,
    difficulties: [2],
    make: (r) => {
      const [a, b, c] = [int(r, 2, 12), int(r, 2, 12), int(r, 2, 9)];
      return {
        kind: "number",
        prompt: `Work out **(${a} + ${b}) × ${c}**.`,
        answer: (a + b) * c,
        traps: [{ value: a + b * c, misconception: M.leftRight, feedback: "Brackets come first: add inside them, then multiply." }],
        hint: "Work out the brackets first.",
        hints: [`${a} + ${b} = ${a + b}.`, `Then ${a + b} × ${c}.`],
        explanation: `Brackets first: ${a} + ${b} = ${a + b}. Then ${a + b} × ${c} = **${(a + b) * c}**.`,
      };
    },
  },
  {
    key: "md-order-stretch",
    skill: S.order,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const e = int(r, 2, 6);
      const d = e * int(r, 2, 9);
      const [a, b, c] = [int(r, 10, 40), int(r, 2, 9), int(r, 2, 9)];
      const answer = a + b * c - d / e;
      const leftToRight = ((a + b) * c - d) / e;
      return {
        kind: "number",
        prompt: `Work out **${a} + ${b} × ${c} − ${d} ÷ ${e}**.`,
        answer,
        traps: Number.isInteger(leftToRight) && leftToRight !== answer && leftToRight >= 0 ? [{ value: leftToRight, misconception: M.leftRight, feedback: "That works from left to right. Multiply and divide first, then add and take away." }] : [],
        hint: "Find the × and the ÷ parts first.",
        hints: [`${b} × ${c} = ${b * c} and ${d} ÷ ${e} = ${d / e}.`, `Now ${a} + ${b * c} − ${d / e}, from left to right.`],
        explanation: `Multiply and divide first: ${b} × ${c} = ${b * c}, ${d} ÷ ${e} = ${d / e}. Then ${a} + ${b * c} − ${d / e} = **${answer}**.`,
      };
    },
  },
];

export const multiplyDivideExtra: TopicExtra = {
  skills: [
    { id: S.ldiv, title: "Long division", description: "Divide by a 2-digit number, and decide what to do with a remainder.", lessonId: "long-division" },
    { id: S.primes, title: "Prime numbers", description: "Spot primes to 100 and split numbers into prime factors.", lessonId: "primes" },
    { id: S.powers, title: "Square and cube numbers", description: "Work out squares and cubes, written with ² and ³.", lessonId: "squares-cubes" },
    { id: S.order, title: "Order of operations", description: "Brackets first, then × and ÷, then + and −.", lessonId: "order" },
  ],
  lessonIcons: { "long-division": "divide", primes: "magnifier", "squares-cubes": "shapes", order: "target" },
  lessons: [
    {
      id: "long-division",
      title: "Long division",
      phase: "Practise",
      summary: "Divide a little at a time, from the left, bringing the next digit down.",
      minutes: 9,
      objectives: ["Divide up to 4 digits by a 2-digit number", "Decide what a remainder means in a problem"],
      steps: [
        {
          type: "explain",
          title: "A little at a time",
          body: [
            "Long division is short division with the working written out. To work out **672 ÷ 16**, start at the left. 16 doesn't go into 6, so try **67**: 16 × 4 = 64, so it goes **4** times with **3** left over.",
            "Bring the next digit down next to the 3 to make **32**. 16 goes into 32 exactly **2** times. The answer is **42**. Always check by multiplying back: 42 × 16 = 672.",
          ],
          visual: { kind: "table", head: ["Divide", "Times", "Left over"], rows: [["67 ÷ 16", "4", "3"], ["32 ÷ 16", "2", "0"]] },
          tip: "Write the 16 times table down the side first: 16, 32, 48, 64, 80 …",
        },
        {
          type: "worked",
          title: "Watch me: 864 ÷ 24",
          support: "full",
          problem: "Work out **864 ÷ 24**.",
          steps: [{ text: "24 doesn't go into 8. 86 ÷ 24 = **3** (24 × 3 = 72), with 14 left." }, { text: "Bring down the 4 to make 144. 144 ÷ 24 = **6** exactly." }, { text: "Check: 36 × 24 = 864." }],
          conclusion: "864 ÷ 24 = **36**.",
        },
        {
          type: "worked",
          title: "Let's do it together",
          support: "faded",
          problem: "**500** children go on a trip. Each coach holds **48**. How many coaches are needed?",
          steps: [
            { text: "500 ÷ 48 = 10 remainder 20: ten coaches are full." },
            { text: "The 20 children left over still need a seat.", blank: { prompt: "How many coaches?", answer: 11, hint: "One more coach for the children left over.", traps: [{ value: 10, misconception: M.roundUp, feedback: "Ten coaches leave 20 children behind. They need one more." }], worked: "**11** coaches." } },
          ],
          conclusion: "**11** coaches are needed.",
        },
        { type: "check", title: "Your turn", questionId: gen("md-ldiv", 2, 3) },
        { type: "check", title: "One more", questionId: gen("md-ldiv-rem", 2, 5) },
      ],
    },
    {
      id: "primes",
      title: "Prime numbers",
      phase: "Explore",
      summary: "A prime has exactly two factors: 1 and itself.",
      minutes: 8,
      objectives: ["Know the primes up to 19 and find primes to 100", "Write a number as a product of primes"],
      steps: [
        {
          type: "explain",
          title: "Only one rectangle",
          body: [
            "A **prime number** has exactly two factors: 1 and itself. 7 counters only make one rectangle, a single row of 7, so 7 is prime. 12 counters make 1 × 12, 2 × 6 and 3 × 4, so 12 is **composite**.",
            "The primes to 20 are **2, 3, 5, 7, 11, 13, 17 and 19**. 1 is not prime: it has only one factor. 2 is the only even prime. Every composite number can be split into primes, such as 12 = 2 × 2 × 3.",
          ],
          visual: { kind: "array", rows: 1, cols: 7 },
          tip: "Odd doesn't mean prime: 9, 15, 21 and 91 all have other factors.",
        },
        {
          type: "worked",
          title: "Watch me: 60 as a product of primes",
          support: "full",
          problem: "Write **60** as a product of prime numbers.",
          steps: [{ text: "60 = 2 × 30." }, { text: "30 = 2 × 15, and 15 = 3 × 5." }, { text: "2, 2, 3 and 5 are all prime, so stop." }],
          conclusion: "60 = **2 × 2 × 3 × 5**.",
        },
        {
          type: "worked",
          title: "Let's do it together",
          support: "faded",
          problem: "Is **51** prime?",
          steps: [
            { text: "51 is odd, so 2 doesn't go. Try 3: the digits add to 6, so 3 goes in.", blank: { prompt: "51 ÷ 3 = ?", answer: 17, hint: "3 × 17.", traps: [{ value: 1, misconception: M.oddPrime, feedback: "51 isn't prime: 3 goes into it. 51 ÷ 3 = 17." }], worked: "51 ÷ 3 = **17**." } },
          ],
          conclusion: "51 = 3 × 17, so 51 is **not** prime.",
        },
        { type: "check", title: "Your turn", questionId: gen("md-prime-which", 1, 3) },
        { type: "check", title: "One more", questionId: gen("md-prime-factors", 2, 4) },
      ],
    },
    {
      id: "squares-cubes",
      title: "Square and cube numbers",
      phase: "Visualise",
      summary: "A square number makes a square; a cube number makes a cube.",
      minutes: 7,
      objectives: ["Work out square numbers, written with ²", "Work out cube numbers, written with ³"],
      steps: [
        {
          type: "explain",
          title: "Squares and cubes",
          body: [
            "**4²** (four squared) means 4 × 4 = 16: sixteen dots make a 4 by 4 square. The square numbers start 1, 4, 9, 16, 25, 36, 49, 64, 81, 100.",
            "**3³** (three cubed) means 3 × 3 × 3 = 27: twenty-seven small cubes build a 3 by 3 by 3 cube. The cube numbers start 1, 8, 27, 64, 125. The small number says how many times to use the number, not what to multiply by.",
          ],
          visual: { kind: "array", rows: 4, cols: 4 },
          tip: "4² is 4 × 4 = 16, never 4 × 2 = 8.",
        },
        {
          type: "explain",
          title: "Building a cube",
          body: ["A cube 3 small cubes long, 3 wide and 3 high uses 3 × 3 × 3 = **27** small cubes."],
          visual: { kind: "cuboid", l: 3, w: 3, h: 3, unit: "cubes", cubes: true },
        },
        {
          type: "worked",
          title: "Watch me: 5³",
          support: "full",
          problem: "Work out **5³**.",
          steps: [{ text: "5³ = 5 × 5 × 5." }, { text: "5 × 5 = 25, then 25 × 5 = 125." }],
          conclusion: "5³ = **125**.",
        },
        {
          type: "worked",
          title: "Let's do it together",
          support: "faded",
          problem: "Work out **9²**.",
          steps: [{ text: "9² means 9 × 9.", blank: { prompt: "9² = ?", answer: 81, hint: "9 × 9.", traps: [{ value: 18, misconception: M.powerTimes, feedback: "9² is 9 × 9, not 9 × 2." }], worked: "9 × 9 = **81**." } }],
          conclusion: "9² = **81**.",
        },
        { type: "check", title: "Your turn", questionId: gen("md-square", 1, 3) },
        { type: "check", title: "One more", questionId: gen("md-cube", 2, 5) },
      ],
    },
    {
      id: "order",
      title: "Order of operations",
      phase: "Apply",
      summary: "Brackets first, then × and ÷, then + and −.",
      minutes: 7,
      objectives: ["Use brackets first", "Multiply and divide before adding and taking away"],
      steps: [
        {
          type: "explain",
          title: "Which part first?",
          body: [
            "In **2 + 3 × 4**, multiply first: 3 × 4 = 12, then 2 + 12 = **14**. Working left to right gives 20, which is wrong. Everyone uses the same order, so a calculation has only one answer.",
            "The order is: **brackets** first, then **× and ÷**, then **+ and −**. Brackets change the order: **(2 + 3) × 4** = 5 × 4 = **20**. When two steps are at the same level, work from left to right.",
          ],
          visual: { kind: "table", head: ["First", "Then", "Last"], rows: [["( ) brackets", "× and ÷", "+ and −"]] },
          tip: "Underline the × and ÷ parts before you start.",
        },
        {
          type: "worked",
          title: "Watch me: 20 − 12 ÷ 4",
          support: "full",
          problem: "Work out **20 − 12 ÷ 4**.",
          steps: [{ text: "Divide first: 12 ÷ 4 = 3." }, { text: "Then 20 − 3 = 17." }],
          conclusion: "20 − 12 ÷ 4 = **17**.",
        },
        {
          type: "worked",
          title: "Let's do it together",
          support: "faded",
          problem: "Work out **(6 + 4) × 5**.",
          steps: [{ text: "Brackets first: 6 + 4 = 10.", blank: { prompt: "10 × 5 = ?", answer: 50, hint: "Multiply the bracket's answer by 5.", traps: [{ value: 26, misconception: M.leftRight, feedback: "Brackets come first: 6 + 4 = 10, then 10 × 5." }], worked: "10 × 5 = **50**." } }],
          conclusion: "(6 + 4) × 5 = **50**.",
        },
        { type: "check", title: "Your turn", questionId: gen("md-order", 1, 3) },
        { type: "check", title: "One more", questionId: gen("md-brackets", 2, 6) },
      ],
    },
  ],
  templates,
  misconceptions: [
    {
      id: M.roundUp,
      name: "Remainder left behind",
      possibleCause: "You might have given the full groups and forgotten the ones left over.",
      description: "In a 'how many are needed' problem, gives the whole-number part of the division and leaves the remainder without a group.",
      explanation: ["Ask what the remainder means in the story.", "If the leftovers still need a box or a seat, round up to one more."],
      skills: [S.ldiv],
      followUpTemplates: ["md-ldiv-word"],
    },
    {
      id: M.oddPrime,
      name: "Odd means prime",
      possibleCause: "You might have thought every odd number is prime.",
      description: "Chooses odd composite numbers such as 21, 51 or 91 as prime.",
      explanation: ["A prime has exactly two factors.", "Test odd numbers with 3, 5 and 7: 91 = 7 × 13."],
      skills: [S.primes],
      followUpTemplates: ["md-prime-which"],
    },
    {
      id: M.powerTimes,
      name: "Squared means times 2",
      possibleCause: "You might have multiplied by the small number instead of by the number itself.",
      description: "Reads 6² as 6 × 2 or 4³ as 4 × 3.",
      explanation: ["The small number says how many times the number is used.", "6² = 6 × 6 and 4³ = 4 × 4 × 4."],
      skills: [S.powers],
      followUpTemplates: ["md-square", "md-cube"],
    },
    {
      id: M.leftRight,
      name: "Always left to right",
      possibleCause: "You might have worked from left to right instead of multiplying first.",
      description: "Works a calculation strictly from left to right, ignoring brackets or the priority of × and ÷.",
      explanation: ["Brackets first, then × and ÷, then + and −.", "2 + 3 × 4 = 2 + 12 = 14."],
      skills: [S.order],
      followUpTemplates: ["md-order", "md-brackets"],
    },
  ],
  placement: [
    { lessonId: "long-division", template: "md-ldiv" },
    { lessonId: "primes", template: "md-prime-which" },
    { lessonId: "squares-cubes", template: "md-square" },
    { lessonId: "order", template: "md-order" },
  ],
};
