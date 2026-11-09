import { defineTopic, genFor, int, pick } from "@/topics/kit/define";
import { num } from "@/topics/kit/evaluate";
import type { Template } from "@/topics/kit/types";
import { factors } from "@/maths/integer";

/** Multiply and divide: by 10, 100 and 1,000, short and long multiplication, division with remainders, factors. */

const T = "multiply-divide";
const gen = genFor(T);
const S = { tens: `${T}.ten-hundred`, short: `${T}.short-mult`, long: `${T}.long-mult`, div: `${T}.division`, factors: `${T}.factors` };
const M = { zeros: `${T}.zeros`, carry: `${T}.no-carry`, tensPlace: `${T}.tens-place`, remainder: `${T}.remainder`, factorEnds: `${T}.factor-pairs` };

/** Each digit times m, keeping only the ones digit (no carrying). */
function noCarryProduct(n: number, m: number) {
  return Number(String(n).split("").map((d) => (Number(d) * m) % 10).join(""));
}

const templates: Template[] = [
  {
    key: "md-10",
    skill: S.tens,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const by = difficulty === 1 ? pick(r, [10, 100]) : difficulty === 2 ? pick(r, [10, 100]) : 1000;
      const divide = difficulty === 2 || (difficulty === 3 && r() < 0.5);
      if (divide) {
        const answer = difficulty === 3 ? int(r, 2, 99) : int(r, 3, 99);
        const n = answer * by;
        return {
          kind: "number",
          prompt: `**${num(n)} ÷ ${num(by)} = ?**`,
          visual: { kind: "pv-chart", value: n, columns: n >= 10000 ? ["TTh", "Th", "H", "T", "O"] : ["Th", "H", "T", "O"] },
          answer,
          traps: [{ value: n / (by === 10 ? 100 : 10), misconception: M.zeros, feedback: `Dividing by ${num(by)} moves every digit ${by === 10 ? "one place" : by === 100 ? "two places" : "three places"} to the right.` }, { value: n * by, misconception: M.zeros, feedback: "Dividing makes the number smaller." }].filter((t) => Number.isInteger(t.value) && t.value !== answer),
          hint: `Each digit moves ${by === 10 ? "one" : by === 100 ? "two" : "three"} place${by === 10 ? "" : "s"} to the right.`,
          explanation: `${num(n)} ÷ ${num(by)} = **${num(answer)}**.`,
        };
      }
      const n = difficulty === 1 ? int(r, 12, 99) : int(r, 12, 999);
      const answer = n * by;
      return {
        kind: "number",
        prompt: `**${num(n)} × ${num(by)} = ?**`,
        answer,
        traps: [by === 10 ? { value: n * 100, misconception: M.zeros, feedback: "× 10 moves each digit one place to the left: one zero fills the ones." } : { value: n * (by / 10), misconception: M.zeros, feedback: `× ${num(by)} moves each digit ${by === 100 ? "two" : "three"} places to the left.` }],
        hint: `Every digit moves ${by === 10 ? "one place" : by === 100 ? "two places" : "three places"} to the left. Zeros fill the empty places.`,
        explanation: `${num(n)} × ${num(by)} = **${num(answer)}**.`,
      };
    },
  },
  {
    key: "md-short",
    skill: S.short,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const m = int(r, 3, 9);
      const n = difficulty === 1 ? int(r, 13, 49) : difficulty === 2 ? int(r, 102, 489) : int(r, 1012, 4899);
      const answer = n * m;
      const wrong = noCarryProduct(n, m);
      return {
        kind: "number",
        prompt: `Work out **${num(n)} × ${m}**.`,
        answer,
        traps: wrong !== answer ? [{ value: wrong, misconception: M.carry, feedback: "When a column makes 10 or more, carry the tens into the next column." }] : [],
        hint: "Multiply the ones first. Carry anything over 9 into the next column.",
        explanation: `${num(n)} × ${m} = **${num(answer)}**.`,
      };
    },
  },
  {
    key: "md-partition",
    skill: S.short,
    difficulties: [1, 2],
    make: (r, { difficulty }) => {
      const tens = int(r, 2, 9) * 10;
      const ones = int(r, 2, 9);
      const m = int(r, 3, difficulty === 1 ? 6 : 9);
      const n = tens + ones;
      return {
        kind: "number",
        prompt: `Use partitioning: **${n} × ${m} = ${tens} × ${m} + ${ones} × ${m}**. What is ${n} × ${m}?`,
        visual: { kind: "bar", total: `${n} × ${m}`, parts: [{ label: `${tens} × ${m} = ${tens * m}`, size: tens, tone: "brand" }, { label: `${ones} × ${m} = ${ones * m}`, size: Math.max(ones, tens / 3), tone: "num" }] },
        answer: n * m,
        traps: [{ value: tens * m + ones, misconception: M.carry, feedback: `Multiply the ones part too: ${ones} × ${m} = ${ones * m}.` }],
        hint: `${tens} × ${m} = ${tens * m}. Then ${ones} × ${m}. Add them.`,
        explanation: `${tens * m} + ${ones * m} = **${n * m}**.`,
      };
    },
  },
  {
    key: "md-long",
    skill: S.long,
    difficulties: [2, 3],
    make: (r, { difficulty }) => {
      const a = difficulty === 2 ? int(r, 12, 49) : int(r, 102, 389);
      const b = int(r, 12, difficulty === 2 ? 39 : 29);
      const tens = Math.floor(b / 10);
      const ones = b % 10;
      const answer = a * b;
      const forgot = a * ones + a * tens;
      return {
        kind: "number",
        prompt: `Work out **${num(a)} × ${b}**.`,
        visual: { kind: "bar", total: `${num(a)} × ${b}`, parts: [{ label: `${num(a)} × ${tens * 10}`, size: tens * 10, tone: "brand" }, { label: `${num(a)} × ${ones}`, size: Math.max(ones, 3), tone: "num" }] },
        answer,
        traps: forgot !== answer ? [{ value: forgot, misconception: M.tensPlace, feedback: `The ${tens} in ${b} is ${tens} tens, so multiply by ${tens * 10}, not ${tens}.` }] : [],
        hint: `Split ${b} into ${tens * 10} and ${ones}. Multiply ${num(a)} by each, then add.`,
        explanation: `${num(a)} × ${tens * 10} = ${num(a * tens * 10)} and ${num(a)} × ${ones} = ${num(a * ones)}; together **${num(answer)}**.`,
      };
    },
  },
  {
    key: "md-div",
    skill: S.div,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const d = int(r, 2, difficulty === 1 ? 5 : 9);
      if (difficulty === 3) {
        const q = int(r, 12, 39);
        const rem = int(r, 1, d - 1);
        const n = q * d + rem;
        const options = [
          { text: `${q} r ${rem}` },
          { text: `${q - 1} r ${rem + d}`, misconception: M.remainder, feedback: `A remainder of ${rem + d} is ${d} or more: another group of ${d} fits.` },
          { text: `${q + 1} r ${rem}`, feedback: `${q + 1} × ${d} = ${(q + 1) * d}, which is more than ${n}.` },
          { text: `${q} r ${d - rem}`, feedback: `${q} × ${d} = ${q * d}, and ${n} − ${q * d} = ${rem}.` },
        ].filter((o, i, all) => all.findIndex((x) => x.text === o.text) === i);
        return {
          kind: "choose",
          prompt: `**${n} ÷ ${d} = ?**`,
          options,
          answer: 0,
          hint: `How many ${d}s fit into ${n}? Whatever is left over is the remainder, and it must be less than ${d}.`,
          explanation: `${q} × ${d} = ${q * d}, with ${rem} left over: **${q} r ${rem}**.`,
        };
      }
      const q = difficulty === 1 ? int(r, 11, 25) : int(r, 21, 99);
      const n = q * d;
      return {
        kind: "number",
        prompt: `**${num(n)} ÷ ${d} = ?**`,
        visual: difficulty === 1 && q <= 12 ? { kind: "groups", groups: d, each: q, label: `${n} shared into ${d} equal groups` } : undefined,
        answer: q,
        traps: [{ value: n * d, misconception: M.zeros, feedback: "Dividing shares the number out, so the answer is smaller." }],
        hint: `Use your ${d} times table: how many ${d}s make ${num(n)}? Try the tens first.`,
        explanation: `${q} × ${d} = ${num(n)}, so ${num(n)} ÷ ${d} = **${q}**.`,
      };
    },
  },
  {
    key: "md-share",
    skill: S.div,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const d = int(r, 3, 8);
      if (difficulty === 3) {
        const n = int(r, 4, 12) * d + int(r, 1, d - 1);
        const need = Math.ceil(n / d);
        return {
          kind: "number",
          prompt: `Eggs come in boxes of **${d}**. How many boxes do you need for **${n} eggs**?`,
          answer: need,
          traps: [{ value: need - 1, misconception: M.remainder, feedback: `${need - 1} boxes hold ${(need - 1) * d} eggs. The leftover eggs need one more box.` }],
          hint: `${n} ÷ ${d} has a remainder. Do the leftover eggs need a box?`,
          explanation: `${n} ÷ ${d} = ${Math.floor(n / d)} r ${n % d}, and the ${n % d} leftover eggs need another box: **${need}**.`,
        };
      }
      const q = difficulty === 1 ? int(r, 3, 12) : int(r, 12, 30);
      const n = q * d;
      return {
        kind: "number",
        prompt: `**${n} sweets** are shared equally between **${d} children**. How many does each child get?`,
        visual: difficulty === 1 ? { kind: "groups", groups: d, each: q, label: `${n} sweets in ${d} equal shares` } : undefined,
        answer: q,
        traps: [{ value: n - d, feedback: "Sharing equally means dividing, not taking away." }],
        hint: `Divide ${n} by ${d}.`,
        explanation: `${n} ÷ ${d} = **${q}** each.`,
      };
    },
  },
  {
    key: "md-factor",
    skill: S.factors,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      if (difficulty === 2) {
        const m = int(r, 3, 9);
        const right = m * int(r, 3, 12);
        const wrong = [right + 1, right + m - 1 === right ? right + 2 : right + m - 1, right - 2].filter((x) => x % m !== 0);
        return {
          kind: "choose",
          prompt: `Which number is a **multiple of ${m}**?`,
          options: [{ text: num(right) }, ...[...new Set(wrong)].slice(0, 3).map((x) => ({ text: num(x), feedback: `${num(x)} isn't in the ${m} times table.` }))],
          answer: 0,
          hint: `Multiples of ${m} are the answers in the ${m} times table.`,
          explanation: `${num(right)} = ${m} × ${right / m}, so **${num(right)}** is a multiple of ${m}.`,
        };
      }
      const n = pick(r, difficulty === 1 ? [12, 18, 20, 24, 30] : [36, 42, 48, 56, 60, 72]);
      const fs = factors(n).filter((x) => x > 1 && x < n);
      const right = pick(r, fs);
      const wrong: number[] = [];
      for (let x = 4; wrong.length < 3 && x < n; x++) if (n % x !== 0 && x !== right && r() < 0.5) wrong.push(x);
      for (let x = 5; wrong.length < 3; x++) if (n % x !== 0 && !wrong.includes(x)) wrong.push(x);
      return {
        kind: "choose",
        prompt: `Which number is a **factor of ${n}**?`,
        options: [{ text: num(right) }, ...wrong.map((x) => ({ text: num(x), feedback: `${n} ÷ ${x} doesn't divide exactly.` }))],
        answer: 0,
        hint: `A factor divides ${n} exactly, with nothing left over.`,
        explanation: `${n} ÷ ${right} = ${n / right}, so **${right}** is a factor of ${n}.`,
      };
    },
  },
  {
    key: "md-factor-count",
    skill: S.factors,
    difficulties: [2, 3],
    make: (r, { difficulty }) => {
      const n = pick(r, difficulty === 2 ? [6, 8, 10, 12, 15, 16, 18, 20] : [24, 28, 30, 36, 40, 45]);
      const count = factors(n).length;
      return {
        kind: "number",
        prompt: `How many **factors** does **${n}** have?`,
        answer: count,
        traps: [{ value: count - 2, misconception: M.factorEnds, feedback: `Don't forget 1 and ${n} itself: they are factors too.` }].filter((t) => t.value > 0),
        hint: `Find factor pairs: 1 × ${n}, 2 × …, and stop when they meet in the middle.`,
        explanation: `The factors of ${n} are ${factors(n).join(", ")}: **${count}** factors.`,
      };
    },
  },
];

export const multiplyDivide = defineTopic({
  id: T,
  title: "Multiply and divide",
  subtitle: "Multiply and divide by 10, 100 and 1,000, short and long multiplication, division and factors",
  world: "calc",
  years: [4, 5, 6],
  order: 3,
  icon: "divide",
  skills: [
    { id: S.tens, title: "× and ÷ by 10, 100, 1,000", description: "Move digits left to multiply and right to divide by 10, 100 and 1,000.", lessonId: "ten-hundred" },
    { id: S.short, title: "Short multiplication", description: "Multiply numbers up to 4 digits by a single digit.", lessonId: "short" },
    { id: S.long, title: "Long multiplication", description: "Multiply by a 2-digit number by splitting it into tens and ones.", lessonId: "long" },
    { id: S.div, title: "Division and remainders", description: "Divide by a single digit, and decide what to do with a remainder.", lessonId: "divide" },
    { id: S.factors, title: "Factors and multiples", description: "Find factors and multiples, and count the factors of a number.", lessonId: "factors" },
  ],
  lessonIcons: { "ten-hundred": "place-value", short: "times", long: "rocket", divide: "divide", factors: "puzzle" },
  lessons: [
    {
      id: "ten-hundred",
      title: "× and ÷ by 10, 100 and 1,000",
      phase: "Understand",
      summary: "The digits move; zeros hold the empty places.",
      minutes: 6,
      objectives: ["Multiply and divide by 10, 100 and 1,000"],
      steps: [
        {
          type: "explain",
          title: "Digits slide along",
          body: ["**× 10** moves every digit one place to the **left**: 34 × 10 = **340**. A zero fills the empty ones place.", "**÷ 10** moves every digit one place to the **right**: 340 ÷ 10 = **34**."],
          visual: { kind: "pv-chart", value: 340, columns: ["Th", "H", "T", "O"] },
          tip: "× 100 moves two places, × 1,000 moves three.",
        },
        { type: "check", title: "Your turn", questionId: gen("md-10", 1, 3) },
        { type: "check", title: "One more", questionId: gen("md-10", 2, 7) },
      ],
    },
    {
      id: "short",
      title: "Short multiplication",
      phase: "Visualise",
      summary: "Split the number, multiply each part, add them up.",
      minutes: 7,
      objectives: ["Multiply by partitioning", "Use short multiplication with carrying"],
      steps: [
        {
          type: "explain",
          title: "Split it up",
          body: ["**47 × 6** = 40 × 6 + 7 × 6 = 240 + 42 = **282**."],
          visual: { kind: "bar", total: "47 × 6", parts: [{ label: "40 × 6 = 240", size: 40, tone: "brand" }, { label: "7 × 6 = 42", size: 14, tone: "num" }] },
        },
        {
          type: "worked",
          title: "Let's do it together",
          support: "faded",
          problem: "**243 × 4**",
          steps: [
            { text: "Ones: 3 × 4 = 12. Write 2, carry 1." },
            { text: "Tens: 4 × 4 = 16, plus the carried 1.", blank: { prompt: "How many tens?", answer: 17, hint: "16 + 1", worked: "**17**: write 7, carry 1." } },
            { text: "Hundreds: 2 × 4 = 8, plus 1 = 9." },
          ],
          conclusion: "243 × 4 = **972**.",
        },
        { type: "check", title: "Your turn", questionId: gen("md-partition", 1, 5) },
        { type: "check", title: "One more", questionId: gen("md-short", 2, 8) },
      ],
    },
    {
      id: "long",
      title: "Long multiplication",
      phase: "Explore",
      summary: "Multiply by the tens, multiply by the ones, add.",
      minutes: 8,
      objectives: ["Multiply by a 2-digit number"],
      steps: [
        {
          type: "worked",
          title: "Watch me: 23 × 14",
          support: "full",
          problem: "**23 × 14**",
          visual: { kind: "bar", total: "23 × 14", parts: [{ label: "23 × 10 = 230", size: 10, tone: "brand" }, { label: "23 × 4 = 92", size: 4, tone: "num" }] },
          steps: [{ text: "14 is **10 + 4**." }, { text: "23 × 10 = **230**, and 23 × 4 = **92**." }, { text: "230 + 92 = **322**." }],
          conclusion: "23 × 14 = **322**.",
        },
        { type: "check", title: "Your turn", questionId: gen("md-long", 2, 4) },
        { type: "check", title: "One more", questionId: gen("md-long", 3, 9) },
      ],
    },
    {
      id: "divide",
      title: "Division and remainders",
      phase: "Practise",
      summary: "Share or group, and decide what a remainder means.",
      minutes: 8,
      objectives: ["Divide by a single digit", "Interpret remainders in a problem"],
      steps: [
        {
          type: "explain",
          title: "Equal groups",
          body: ["**15 ÷ 3** shares 15 into 3 equal groups: **5** in each."],
          visual: { kind: "groups", groups: 3, each: 5, label: "15 in 3 equal groups" },
        },
        {
          type: "explain",
          title: "Left over",
          body: ["**17 ÷ 3** = 5 groups of 3 is 15, with **2 left over**. We write **5 r 2**.", "In a problem, think about the leftovers: 17 eggs in boxes of 3 need **6** boxes, because the last 2 eggs still need a box."],
          tip: "A remainder is always smaller than the number you divide by.",
        },
        { type: "check", title: "Your turn", questionId: gen("md-div", 1, 2) },
        { type: "check", title: "One more", questionId: gen("md-share", 3, 6) },
      ],
    },
    {
      id: "factors",
      title: "Factors and multiples",
      phase: "Apply",
      summary: "Factors go into a number; multiples are in its times table.",
      minutes: 7,
      objectives: ["Find the factors of a number", "Recognise multiples"],
      steps: [
        {
          type: "explain",
          title: "Factor pairs",
          body: ["The factors of **12** come in pairs: **1 × 12, 2 × 6, 3 × 4**. So 12 has 6 factors: 1, 2, 3, 4, 6 and 12.", "The **multiples** of 4 are 4, 8, 12, 16…: the 4 times table."],
          visual: { kind: "array", rows: 3, cols: 4 },
        },
        { type: "check", title: "Your turn", questionId: gen("md-factor", 1, 4) },
        { type: "check", title: "One more", questionId: gen("md-factor-count", 2, 8) },
      ],
    },
  ],
  templates,
  misconceptions: [
    { id: M.zeros, name: "Moving digits the wrong way or too far", possibleCause: "It looks like the digits moved the wrong number of places, or the wrong way.", description: "Writes 34 × 100 = 340, or divides when multiplying.", explanation: ["× 10 moves digits one place left; × 100 moves them two.", "÷ moves them right, so the number gets smaller."], skills: [S.tens, S.div], followUpTemplates: ["md-10"] },
    { id: M.carry, name: "Forgetting to carry", possibleCause: "It looks like a carried ten went missing.", description: "Writes only the ones digit of each column product.", explanation: ["3 × 4 = 12: write 2 and carry 1.", "Add the carried 1 after multiplying the next column."], skills: [S.short], followUpTemplates: ["md-short", "md-partition"] },
    { id: M.tensPlace, name: "Treating the tens digit as ones", possibleCause: "It looks like the tens digit was multiplied as if it were ones.", description: "Works out 23 × 14 as 23 × 1 + 23 × 4.", explanation: ["The 1 in 14 is 1 ten.", "So multiply by 10, not 1: 230 + 92 = 322."], skills: [S.long], followUpTemplates: ["md-long"] },
    { id: M.remainder, name: "A remainder that is too big, or ignored", possibleCause: "It looks like the remainder wasn't handled quite right.", description: "Leaves a remainder bigger than the divisor, or ignores leftovers in a problem.", explanation: ["The remainder must be smaller than the number you divide by.", "In a problem, decide if the leftovers need one more group."], skills: [S.div], followUpTemplates: ["md-div", "md-share"] },
    { id: M.factorEnds, name: "Forgetting 1 and the number itself", possibleCause: "It looks like 1 and the number itself were left out.", description: "Counts the factors of 12 as 4, missing 1 and 12.", explanation: ["Every number has 1 and itself as factors.", "12: 1, 2, 3, 4, 6 and 12."], skills: [S.factors], followUpTemplates: ["md-factor-count"] },
  ],
  placement: [
    { lessonId: "ten-hundred", template: "md-10" },
    { lessonId: "short", template: "md-short" },
    { lessonId: "long", template: "md-long" },
    { lessonId: "divide", template: "md-div" },
    { lessonId: "factors", template: "md-factor" },
  ],
});
