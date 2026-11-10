import { defineTopic, genFor, int, pick, withHints } from "@/topics/kit/define";
import { num } from "@/topics/kit/evaluate";
import type { Rng, Template } from "@/topics/kit/types";

/** Add and subtract: mental strategies, column methods, inverses and word problems. */

const T = "add-subtract";
const gen = genFor(T);
const S = { mental: `${T}.mental`, add: `${T}.column-add`, sub: `${T}.column-sub`, inverse: `${T}.inverse`, problems: `${T}.problems` };
const M = { bond: `${T}.bond-each-digit`, adjust: `${T}.adjust-wrong`, carry: `${T}.no-carry`, smaller: `${T}.smaller-from-larger`, inverse: `${T}.wrong-operation` };

const digits = (n: number, len: number) => String(n).padStart(len, "0").split("").map(Number);
/** Each column added with no carrying. */
function noCarrySum(a: number, b: number) {
  const len = Math.max(String(a).length, String(b).length);
  const da = digits(a, len);
  const db = digits(b, len);
  return Number(da.map((x, i) => (x + db[i]) % 10).join(""));
}
/** Each column's smaller digit taken from its larger one. */
function smallerFromLarger(a: number, b: number) {
  const len = String(a).length;
  const da = digits(a, len);
  const db = digits(b, len);
  return Number(da.map((x, i) => Math.abs(x - db[i])).join(""));
}
const hasCarry = (a: number, b: number) => noCarrySum(a, b) !== a + b;
const hasExchange = (a: number, b: number) => smallerFromLarger(a, b) !== a - b;

function withCarry(r: Rng, lenA: number, lenB: number): [number, number] {
  for (;;) {
    const a = int(r, 10 ** (lenA - 1), 10 ** lenA - 1);
    const b = int(r, 10 ** (lenB - 1), 10 ** lenB - 1);
    if (hasCarry(a, b)) return [a, b];
  }
}
function withExchange(r: Rng, len: number, zeros = false): [number, number] {
  for (;;) {
    const a = zeros ? int(r, 1, 9) * 10 ** (len - 1) + int(r, 0, 9) : int(r, 10 ** (len - 1) + 10, 10 ** len - 1);
    const b = int(r, 10 ** (len - 2), a - 1);
    if (hasExchange(a, b) && a - b > 0) return [a, b];
  }
}

const baseTemplates: Template[] = [
  {
    key: "as-bonds",
    skill: S.mental,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const target = difficulty === 1 ? 100 : 1000;
      const a = difficulty === 1 ? int(r, 1, 9) * 10 + int(r, 1, 9) : difficulty === 2 ? int(r, 11, 99) * 10 : int(r, 101, 899);
      const answer = target - a;
      const s = String(a);
      const eachToTen = Number(s.split("").map((d) => (10 - Number(d)) % 10).join(""));
      return {
        kind: "number",
        prompt: `**${num(a)} + ? = ${num(target)}**`,
        visual: { kind: "bar", total: num(target), parts: [{ label: num(a), size: a, tone: "brand" }, { label: "?", size: answer, tone: "num" }] },
        answer,
        traps: eachToTen !== answer ? [{ value: eachToTen, misconception: M.bond, feedback: `Check it: ${num(a)} + ${num(eachToTen)} = ${num(a + eachToTen)}, not ${num(target)}. The ones make 10, so the tens make one less ten.` }] : [],
        hint: difficulty === 1 ? `Make the next ten first, then count on in tens to ${target}.` : `Count on from ${num(a)} to the next hundred, then to ${num(target)}.`,
        explanation: `${num(a)} + **${num(answer)}** = ${num(target)}.`,
      };
    },
  },
  {
    key: "as-mental",
    skill: S.mental,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const near = difficulty === 1 ? pick(r, [9, 19, 29, 39]) : pick(r, [99, 199, 299]);
      const a = difficulty === 1 ? int(r, 21, 69) : int(r, 310, 880);
      const subtract = difficulty === 3;
      const round = near + 1;
      const answer = subtract ? a - near : a + near;
      return {
        kind: "number",
        prompt: `Work out **${num(a)} ${subtract ? "−" : "+"} ${near}** in your head.`,
        visual: difficulty === 1 ? { kind: "line", min: Math.floor(a / 10) * 10, max: Math.ceil((a + round) / 10) * 10, step: 1, labelEvery: 10, points: [{ value: a, label: num(a), tone: "brand" }], jumps: [{ from: a, to: a + round, label: `+${round}` }, { from: a + round, to: answer, label: "−1" }] } : undefined,
        answer,
        traps: [
          { value: subtract ? a - round : a + round, misconception: M.adjust, feedback: `${near} is 1 less than ${round}, so after ${subtract ? "taking away" : "adding"} ${round}, ${subtract ? "add 1 back" : "take 1 away"}.` },
          { value: subtract ? a - round - 1 : a + round + 1, misconception: M.adjust, feedback: `Adjust the other way: ${subtract ? "add 1 back" : "take 1 away"}.` },
        ],
        hint: `${near} is nearly ${round}. ${subtract ? "Take away" : "Add"} ${round}, then adjust by 1.`,
        explanation: `${num(a)} ${subtract ? "−" : "+"} ${round} = ${num(subtract ? a - round : a + round)}, then ${subtract ? "+ 1" : "− 1"} = **${num(answer)}**.`,
      };
    },
  },
  {
    key: "as-col-add",
    skill: S.add,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const [a, b] = difficulty === 1 ? withCarry(r, 3, 2) : difficulty === 2 ? withCarry(r, 3, 3) : withCarry(r, 4, 4);
      return {
        kind: "number",
        prompt: `Work out **${num(a)} + ${num(b)}**.`,
        visual: { kind: "column", op: "+", a, b },
        answer: a + b,
        traps: [{ value: noCarrySum(a, b), misconception: M.carry, feedback: "When a column makes 10 or more, carry the ten into the next column." }],
        hint: "Start with the ones. If a column makes 10 or more, write the ones digit and carry 1 to the next column.",
        explanation: `${num(a)} + ${num(b)} = **${num(a + b)}**.`,
      };
    },
  },
  {
    key: "as-add-word",
    skill: S.add,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const [a, b] = difficulty === 3 ? withCarry(r, 4, 3) : withCarry(r, 3, difficulty === 1 ? 2 : 3);
      const [thing, where] = pick(r, [["tickets", "the school fair"], ["books", "the library"], ["steps", "the walk"], ["visitors", "the museum"]] as const);
      return {
        kind: "number",
        prompt: `On Saturday, ${where} had **${num(a)} ${thing}**. On Sunday it had **${num(b)}**. How many ${thing} altogether?`,
        visual: { kind: "bar", total: "?", parts: [{ label: num(a), size: a, tone: "brand" }, { label: num(b), size: b, tone: "num" }] },
        answer: a + b,
        traps: [{ value: noCarrySum(a, b), misconception: M.carry, feedback: "Don't forget to carry when a column makes 10 or more." }, ...(a - b > 0 ? [{ value: a - b, misconception: M.inverse, feedback: "Altogether means add the two amounts." }] : [])],
        hint: "Altogether means add. Write the numbers in columns.",
        explanation: `${num(a)} + ${num(b)} = **${num(a + b)}** ${thing}.`,
      };
    },
  },
  {
    key: "as-col-sub",
    skill: S.sub,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const [a, b] = difficulty === 1 ? withExchange(r, 2) : difficulty === 2 ? withExchange(r, 3) : withExchange(r, 4, true);
      return {
        kind: "number",
        prompt: `Work out **${num(a)} − ${num(b)}**.`,
        visual: { kind: "column", op: "−", a, b },
        answer: a - b,
        traps: [{ value: smallerFromLarger(a, b), misconception: M.smaller, feedback: "When the top digit is smaller, exchange: take 1 from the next column and make it 10 more." }],
        hint: difficulty === 3 ? "There are zeros on top. Exchange from the first column that has something to give." : "Start with the ones. If the top digit is smaller, exchange 1 ten for 10 ones.",
        explanation: `${num(a)} − ${num(b)} = **${num(a - b)}**.`,
      };
    },
  },
  {
    key: "as-sub-word",
    skill: S.sub,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const [a, b] = difficulty === 1 ? withExchange(r, 2) : difficulty === 2 ? withExchange(r, 3) : withExchange(r, 4);
      const [who, thing] = pick(r, [["Maya", "stickers"], ["Leo", "points"], ["The farm", "eggs"], ["Ravi", "marbles"]] as const);
      return {
        kind: "number",
        prompt: `${who} had **${num(a)} ${thing}** and gave away **${num(b)}**. How many are left?`,
        visual: { kind: "bar", total: num(a), parts: [{ label: num(b), size: b, tone: "num" }, { label: "?", size: a - b, tone: "brand" }] },
        answer: a - b,
        traps: [{ value: smallerFromLarger(a, b), misconception: M.smaller, feedback: "Exchange when the top digit is smaller." }, { value: a + b, misconception: M.inverse, feedback: "Gave away means the amount gets smaller: subtract." }],
        hint: "Gave away means take away. Write the bigger number on top.",
        explanation: `${num(a)} − ${num(b)} = **${num(a - b)}** ${thing}.`,
      };
    },
  },
  {
    key: "as-missing",
    skill: S.inverse,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      if (difficulty === 1) {
        const x = int(r, 12, 48);
        const b = int(r, 11, 39);
        return {
          kind: "number",
          prompt: `**? + ${b} = ${x + b}**`,
          answer: x,
          traps: [{ value: x + 2 * b, misconception: M.inverse, feedback: `The missing number plus ${b} makes ${x + b}, so it must be smaller than ${x + b}. Subtract.` }],
          hint: `What add ${b} makes ${x + b}? Use the inverse: ${x + b} − ${b}.`,
          explanation: `${x + b} − ${b} = **${x}**, and ${x} + ${b} = ${x + b}.`,
        };
      }
      if (difficulty === 2) {
        const x = int(r, 400, 900);
        const b = int(r, 110, x - 50);
        return {
          kind: "number",
          prompt: `**? − ${num(b)} = ${num(x - b)}**`,
          answer: x,
          traps: [{ value: x - 2 * b, misconception: M.inverse, feedback: `Something take away ${num(b)} leaves ${num(x - b)}, so it must be bigger. Add them.` }],
          hint: `Use the inverse: add ${num(b)} back on to ${num(x - b)}.`,
          explanation: `${num(x - b)} + ${num(b)} = **${num(x)}**.`,
        };
      }
      const a = int(r, 500, 980);
      const x = int(r, 120, a - 100);
      return {
        kind: "number",
        prompt: `**${num(a)} − ? = ${num(a - x)}**`,
        answer: x,
        traps: [{ value: a + (a - x), misconception: M.inverse, feedback: "The missing number is the part taken away: it is smaller than the first number." }],
        hint: `What is the difference between ${num(a)} and ${num(a - x)}?`,
        explanation: `${num(a)} − ${num(a - x)} = **${num(x)}**.`,
      };
    },
  },
  {
    key: "as-check",
    skill: S.inverse,
    difficulties: [2, 3],
    make: (r) => {
      const a = int(r, 400, 950);
      let b = int(r, 120, a - 80);
      if (a - b === b) b += 7; // keep the answer and the part taken away different, so no two options match
      const d = a - b;
      return {
        kind: "choose",
        prompt: `Which calculation checks **${num(a)} − ${num(b)} = ${num(d)}**?`,
        options: [
          { text: `${num(d)} + ${num(b)}` },
          { text: `${num(a)} + ${num(b)}`, misconception: M.inverse, feedback: "Adding to the first number makes it bigger still. Add the answer and the part taken away." },
          { text: `${num(d)} − ${num(b)}`, misconception: M.inverse, feedback: "The inverse of subtracting is adding." },
          { text: `${num(a)} + ${num(d)}`, feedback: "That doesn't get you back to the start." },
        ],
        answer: 0,
        hint: "Subtraction undoes addition. Add the answer to the number you took away.",
        explanation: `${num(d)} + ${num(b)} = ${num(a)}, so **${num(d)} + ${num(b)}** checks it.`,
      };
    },
  },
  {
    key: "as-word",
    skill: S.problems,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      if (difficulty === 3) {
        const total = pick(r, [500, 1000]);
        const x = int(r, 120, total / 2 - 20);
        const y = int(r, 110, total / 2 - 30);
        return {
          kind: "number",
          prompt: `Ella has **£${num(total)}**. She spends **£${num(x)}** on a bike and **£${num(y)}** on a helmet. How much does she have left?`,
          visual: { kind: "bar", total: `£${num(total)}`, parts: [{ label: `£${num(x)}`, size: x, tone: "num" }, { label: `£${num(y)}`, size: y, tone: "num" }, { label: "?", size: total - x - y, tone: "brand" }] },
          answer: total - x - y,
          unit: "£",
          traps: [{ value: total - x, feedback: `That's after the bike. Take away the helmet too.` }, { value: x + y, misconception: M.inverse, feedback: "That's how much she spent. Take it away from what she had." }].filter((t) => t.value !== total - x - y),
          hint: "Add what she spent, then take it away from what she had.",
          explanation: `£${num(x)} + £${num(y)} = £${num(x + y)}; £${num(total)} − £${num(x + y)} = **£${num(total - x - y)}**.`,
        };
      }
      const a = difficulty === 1 ? int(r, 40, 95) : int(r, 300, 900);
      const b = difficulty === 1 ? int(r, 12, a - 10) : int(r, 120, a - 40);
      const [p, q, unit] = pick(r, [["Class 4", "Class 3", "house points"], ["The red team", "the blue team", "points"], ["The oak tree", "the apple tree", "birds"]] as const);
      return {
        kind: "number",
        prompt: `${p} has **${num(a)}** ${unit}. ${q[0].toUpperCase() + q.slice(1)} has **${num(b)}**. How many more does ${p.toLowerCase().startsWith("the") ? p.toLowerCase() : p} have?`,
        visual: { kind: "bar", parts: [{ label: num(b), size: b, tone: "brand" }, { label: "? more", size: a - b, tone: "num" }], total: num(a) },
        answer: a - b,
        traps: [{ value: a + b, misconception: M.inverse, feedback: "How many more means find the difference: subtract." }],
        hint: "How many more means find the difference: the bigger take away the smaller.",
        explanation: `${num(a)} − ${num(b)} = **${num(a - b)}** more.`,
      };
    },
  },
  /* D-037 (Phase B): a stretch question for every skill, and a second word-problem maker. */
  {
    key: "as-mental-stretch",
    skill: S.mental,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const a = int(r, 3, 9) * 100 + int(r, 51, 98);
      const b = int(r, 1, 4) * 100 - int(r, 1, 4);
      const answer = a + b;
      const round = Math.ceil(b / 100) * 100;
      return {
        kind: "number",
        prompt: `Work it out in your head: **${num(a)} + ${num(b)}**.`,
        answer,
        traps: [{ value: a + round + (round - b), misconception: M.adjust, feedback: `You added ${round}, which is ${round - b} too many, so take ${round - b} away, not add it.` }],
        hint: `${num(b)} is close to ${round}. Add ${round}, then adjust.`,
        explanation: `${num(a)} + ${round} = ${num(a + round)}, then − ${round - b} = **${num(answer)}**.`,
      };
    },
  },
  {
    key: "as-add-stretch",
    skill: S.add,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const [a, b] = withCarry(r, 4, 4);
      const sum = a + b;
      const da = String(a).split("");
      const hide = int(r, 1, 3);
      const shown = da.map((d, i) => (i === hide ? "?" : d)).join("");
      return {
        kind: "number",
        prompt: `A digit is missing: **${shown} + ${num(b)} = ${num(sum)}**. What is the missing digit?`,
        answer: Number(da[hide]),
        traps: [{ value: (Number(da[hide]) + 1) % 10, misconception: M.carry, feedback: "Remember any carried digit from the column to the right." }].filter((t) => t.value !== Number(da[hide])),
        hint: `Work it out backwards: ${num(sum)} − ${num(b)}.`,
        explanation: `${num(sum)} − ${num(b)} = ${num(a)}, so the missing digit is **${da[hide]}**.`,
      };
    },
  },
  {
    key: "as-sub-stretch",
    skill: S.sub,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const [a, b] = withExchange(r, 4, true);
      const right = a - b;
      const wrong = smallerFromLarger(a, b);
      return {
        kind: "choose",
        prompt: `Ella worked out **${num(a)} − ${num(b)} = ${num(wrong)}**. Which statement is true?`,
        options: [
          { text: `Ella is wrong: the answer is ${num(right)}` },
          { text: "Ella is right", misconception: M.smaller, feedback: `Check with addition: ${num(wrong)} + ${num(b)} isn't ${num(a)}.` },
          { text: `Ella is wrong: the answer is ${num(right + 100)}`, feedback: "Check your exchanges across the zeros." },
        ],
        answer: 0,
        hint: `Check by adding: does ${num(wrong)} + ${num(b)} make ${num(a)}?`,
        explanation: `Ella took the smaller digit from the larger in each column. Exchanging properly gives **${num(right)}**.`,
      };
    },
  },
  {
    key: "as-inverse-stretch",
    skill: S.inverse,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const a = int(r, 120, 480);
      const b = int(r, 120, 480);
      const c = a + b + int(r, 50, 300);
      const missing = c - a - b;
      return {
        kind: "number",
        prompt: `**${a} + ? + ${b} = ${c}**. What is the missing number?`,
        answer: missing,
        traps: [{ value: c - a, misconception: M.inverse, feedback: `Take away both numbers you know: ${a} and ${b}.` }, { value: c + a + b, misconception: M.inverse, feedback: "Subtraction undoes addition: take the known numbers away." }],
        hint: `Add the numbers you know, then take that from ${c}.`,
        explanation: `${a} + ${b} = ${a + b}, and ${c} − ${a + b} = **${missing}**.`,
      };
    },
  },
  {
    key: "as-difference",
    skill: S.problems,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const x = difficulty === 1 ? int(r, 20, 99) : int(r, 900, 2999);
      const y = int(r, Math.floor(x / 3), x - 5);
      const mountain = r() < 0.5;
      return {
        kind: "number",
        prompt: mountain ? `A mountain is **${num(x)} m** high and a hill is **${num(y)} m** high. How much higher is the mountain?` : `One school raised **£${num(x)}**. Another raised **£${num(y)}**. How much more did the first school raise?`,
        unit: mountain ? "m" : "£",
        answer: x - y,
        traps: [{ value: x + y, misconception: M.inverse, feedback: "'How much more' means find the difference: subtract." }],
        hint: "'How much more' or 'how much higher' means find the difference.",
        explanation: `${num(x)} − ${num(y)} = **${num(x - y)}**.`,
      };
    },
  },
  {
    key: "as-problems-stretch",
    skill: S.problems,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const start = int(r, 300, 900);
      const off = int(r, 40, 150);
      const on = int(r, 30, 120);
      const off2 = int(r, 20, 90);
      const end = start - off + on - off2;
      return {
        kind: "number",
        prompt: `A train leaves with **${start}** people. At the first stop **${off}** get off and **${on}** get on. At the second stop **${off2}** get off. How many people are on the train now?`,
        answer: end,
        traps: [{ value: start - off + on, misconception: M.inverse, feedback: "Don't forget the second stop." }, { value: start - off - on - off2, misconception: M.inverse, feedback: "People getting on make the number go up." }],
        hint: "Take one stop at a time, writing down the number after each change.",
        explanation: `${start} − ${off} + ${on} = ${start - off + on}; − ${off2} = **${end}**.`,
      };
    },
  },
];

const templates = withHints(baseTemplates, {
  "as-bonds": () => ["The ones must make 10, so the tens make 9 tens.", "Find the ones first, then the tens."],
  "as-mental": () => ["Round one number to a friendly ten or hundred.", "Then adjust by the amount you rounded."],
  "as-col-add": () => ["Line up the columns: ones under ones.", "Add from the right. If a column makes 10 or more, carry the ten into the next column."],
  "as-add-word": () => ["Altogether or total means add.", "Use column addition and carry when you need to."],
  "as-col-sub": () => ["Always take the bottom digit from the top digit.", "If the top digit is smaller, exchange from the next column."],
  "as-sub-word": () => ["Left, fewer or difference means subtract.", "Use column subtraction and exchange when you need to."],
  "as-missing": () => ["Use the opposite operation.", "Addition undoes subtraction; subtraction undoes addition."],
  "as-check": () => ["Check a subtraction with an addition.", "Add the answer to the number taken away: you should get the first number."],
  "as-word": () => ["Draw a bar model: the whole and the parts.", "Which part is missing? That tells you whether to add or subtract."],
  "as-mental-stretch": () => ["Round the second number up to a hundred.", "You added too much, so take the extra away."],
  "as-add-stretch": () => ["Work backwards with subtraction.", "Compare your answer with the number with a missing digit."],
  "as-sub-stretch": () => ["Check with an addition.", "Look for a column where the top digit was smaller."],
  "as-inverse-stretch": () => ["Add the two numbers you know.", "Take that total away from the answer."],
  "as-difference": () => ["Difference means subtract.", "Take the smaller number from the bigger one."],
  "as-problems-stretch": () => ["Write down the number on the train after each change.", "Getting off: subtract. Getting on: add."],
});

export const addSubtract = defineTopic({
  id: T,
  title: "Add and subtract",
  subtitle: "Mental strategies, column methods, checking with the inverse and word problems",
  world: "calc",
  years: [3, 4, 5, 6],
  order: 1,
  icon: "plus",
  skills: [
    { id: S.mental, title: "Mental adding and subtracting", description: "Number bonds to 100 and 1,000, and adding near multiples like 29 or 199.", lessonId: "mental" },
    { id: S.add, title: "Column addition", description: "Add numbers up to 4 digits in columns, carrying when a column makes 10 or more.", lessonId: "column-add" },
    { id: S.sub, title: "Column subtraction", description: "Subtract in columns, exchanging when the top digit is smaller, even across zeros.", lessonId: "column-sub" },
    { id: S.inverse, title: "Missing numbers and checking", description: "Use the inverse to find missing numbers and check answers.", lessonId: "missing" },
    { id: S.problems, title: "Word problems", description: "Choose the right operation and use a bar model for one- and two-step problems.", lessonId: "problems" },
  ],
  lessonIcons: { mental: "bulb", "column-add": "plus", "column-sub": "puzzle", missing: "magnifier", problems: "books" },
  lessons: [
    {
      id: "mental",
      title: "Quick sums in your head",
      phase: "Understand",
      summary: "Number bonds and the round-then-adjust trick.",
      minutes: 7,
      objectives: ["Know number bonds to 100 and 1,000", "Add and subtract near multiples by adjusting"],
      steps: [
        {
          type: "explain",
          title: "Bonds to 100",
          body: ["**37 + 63 = 100**. The ones make a ten (7 + 3), so the tens only need to make 9 tens (3 + 6).", "Number bonds help with mental sums. To add 99 or 98, add 100 and then take away the extra 1 or 2. To take away 99, take away 100 and add 1 back."],
          visual: { kind: "bar", total: "100", parts: [{ label: "37", size: 37, tone: "brand" }, { label: "63", size: 63, tone: "num" }] },
          tip: "Ones make 10, tens make 9.",
        },
        {
          type: "worked",
          title: "Watch me: round, then adjust",
          support: "full",
          problem: "**46 + 29**",
          visual: { kind: "line", min: 40, max: 80, step: 1, labelEvery: 10, points: [{ value: 46, label: "46", tone: "brand" }], jumps: [{ from: 46, to: 76, label: "+30" }, { from: 76, to: 75, label: "−1" }] },
          steps: [{ text: "29 is nearly **30**." }, { text: "46 + 30 = **76**." }, { text: "I added 1 too many, so take 1 away: **75**." }],
          conclusion: "46 + 29 = **75**.",
        },
        {
          type: "worked",
          title: "Together: 46 + ? = 100",
          support: "faded",
          problem: "**46 + ? = 100**",
          steps: [
            { text: "The ones need to make 10: 6 + **4** = 10." },
            { text: "Then the tens make 9 tens: 4 tens + 5 tens = 9 tens.", blank: { prompt: "So the missing number is?", answer: 54, hint: "5 tens and 4 ones", traps: [{ value: 64, misconception: M.bond, feedback: "Each digit making 10 gives too much: the ones make a ten, so the tens only need to make 9 tens." }], worked: "**54**." } },
          ],
          conclusion: "46 + **54** = 100.",
        },
        { type: "check", title: "Your turn", questionId: gen("as-bonds", 1, 3) },
        { type: "check", title: "One more", questionId: gen("as-mental", 1, 6) },
      ],
    },
    {
      id: "column-add",
      title: "Column addition",
      phase: "Visualise",
      summary: "Line up the columns, start with the ones, carry the tens.",
      minutes: 7,
      objectives: ["Add numbers in columns", "Carry when a column makes 10 or more"],
      steps: [
        {
          type: "explain",
          title: "Line up the columns",
          body: ["Write the numbers so the ones are under the ones, the tens under the tens. Then add **from the right**.", "If a column adds up to 10 or more, write the ones digit and **carry** the ten into the next column, where it is added on.", "Estimate first so you can check: 468 + 357 is about 500 + 350 = 850."],
          visual: { kind: "column", op: "+", a: 358, b: 476 },
        },
        {
          type: "worked",
          title: "Let's do it together",
          support: "faded",
          problem: "**358 + 476**",
          visual: { kind: "column", op: "+", a: 358, b: 476 },
          steps: [
            { text: "Ones: 8 + 6 = 14. Write 4, carry 1 ten." },
            { text: "Tens: 5 + 7 + the carried 1.", blank: { prompt: "How many tens is that?", answer: 13, hint: "5 + 7 = 12, plus 1.", traps: [{ value: 12, misconception: M.carry, feedback: "Don't forget the 1 carried from the ones." }, { value: 2, misconception: M.carry, feedback: "Write 3 and carry the extra ten into the hundreds; the column makes 13 tens." }], worked: "**13** tens: write 3, carry 1 hundred." } },
            { text: "Hundreds: 3 + 4 + the carried 1 = 8." },
          ],
          conclusion: "358 + 476 = **834**.",
        },
        {
          type: "worked",
          title: "Watch me: 2,486 + 1,357",
          support: "full",
          problem: "**2,486 + 1,357**",
          visual: { kind: "column", op: "+", a: 2486, b: 1357, result: 3843 },
          steps: [{ text: "Ones: 6 + 7 = 13. Write 3, carry 1." }, { text: "Tens: 8 + 5 + 1 = 14. Write 4, carry 1." }, { text: "Hundreds: 4 + 3 + 1 = 8. Thousands: 2 + 1 = 3." }],
          conclusion: "2,486 + 1,357 = **3,843**. Check: about 2,500 + 1,400 = 3,900.",
        },
        { type: "check", title: "Your turn", questionId: gen("as-col-add", 1, 4) },
        { type: "check", title: "One more", questionId: gen("as-add-word", 2, 8) },
      ],
    },
    {
      id: "column-sub",
      title: "Column subtraction",
      phase: "Explore",
      summary: "When the top digit is smaller, exchange from the next column.",
      minutes: 8,
      objectives: ["Subtract in columns with exchanging", "Exchange across zeros"],
      steps: [
        {
          type: "explain",
          title: "Exchange, don't swap",
          body: ["In **52 − 17**, the ones are 2 − 7. You can't swap them to 7 − 2!", "Instead, **exchange** one ten for ten ones: 52 becomes 4 tens and 12 ones. Now 12 − 7 = 5, and 4 − 1 = 3: the answer is **35**."],
          visual: { kind: "column", op: "−", a: 52, b: 17, result: 35 },
          tip: "The top number always stays on top.",
        },
        {
          type: "worked",
          title: "Watch me exchange across zeros",
          support: "full",
          problem: "**4,003 − 1,267**",
          visual: { kind: "column", op: "−", a: 4003, b: 1267 },
          steps: [{ text: "Ones: 3 − 7. No tens or hundreds to give, so go to the thousands." }, { text: "4 thousands becomes 3 thousands, 9 hundreds, 9 tens and 13 ones." }, { text: "13 − 7 = 6, 9 − 6 = 3, 9 − 2 = 7, 3 − 1 = 2." }],
          conclusion: "4,003 − 1,267 = **2,736**.",
        },
        {
          type: "worked",
          title: "Together: 642 − 278",
          support: "faded",
          problem: "**642 − 278**",
          visual: { kind: "column", op: "−", a: 642, b: 278 },
          steps: [
            { text: "Ones: 2 − 8 can't be done, so exchange a ten: 4 tens become 3 tens, and the 2 ones become 12.", blank: { prompt: "12 − 8 = ?", answer: 4, hint: "12 − 8", traps: [{ value: 6, misconception: M.smaller, feedback: "8 − 2 takes the smaller digit from the larger. Exchange a ten instead: 12 − 8." }], worked: "**4** ones." } },
            { text: "Tens: 3 − 7 can't be done either, so exchange a hundred: 13 − 7 = 6. Hundreds: 5 − 2 = 3." },
          ],
          conclusion: "642 − 278 = **364**. Check: 364 + 278 = 642.",
        },
        { type: "check", title: "Your turn", questionId: gen("as-col-sub", 1, 5) },
        { type: "check", title: "One more", questionId: gen("as-col-sub", 2, 9) },
      ],
    },
    {
      id: "missing",
      title: "Missing numbers",
      phase: "Explain",
      summary: "Addition and subtraction undo each other.",
      minutes: 6,
      objectives: ["Find missing numbers using the inverse", "Check a subtraction with an addition"],
      steps: [
        {
          type: "explain",
          title: "Undo it",
          body: ["**? − 245 = 378**. Something take away 245 leaves 378, so the something is **378 + 245 = 623**.", "Addition undoes subtraction, and subtraction undoes addition.", "You can use this to check any answer: if 623 − 245 = 378, then 378 + 245 must make 623."],
          visual: { kind: "bar", total: "?", parts: [{ label: "245", size: 245, tone: "num" }, { label: "378", size: 378, tone: "brand" }] },
        },
        {
          type: "worked",
          title: "Watch me: 156 + ? = 400",
          support: "full",
          problem: "**156 + ? = 400**",
          visual: { kind: "bar", parts: [{ label: "156", tone: "brand", size: 156 }, { label: "?", tone: "num", size: 244 }], total: "400" },
          steps: [{ text: "The bar shows 400 split into 156 and a missing part." }, { text: "Missing part = whole − known part: 400 − 156 = **244**." }],
          conclusion: "The missing number is **244**. Check: 156 + 244 = 400.",
        },
        {
          type: "worked",
          title: "Together: ? − 128 = 315",
          support: "faded",
          problem: "**? − 128 = 315**",
          steps: [{ text: "Undo taking away 128 by adding it back.", blank: { prompt: "315 + 128 = ?", answer: 443, hint: "300 + 100, 15 + 28", traps: [{ value: 187, misconception: M.inverse, feedback: "Subtracting again doesn't undo a subtraction. Add 128 back." }], worked: "**443**." } }],
          conclusion: "The missing number is **443**.",
        },
        { type: "check", title: "Your turn", questionId: gen("as-missing", 1, 2) },
        { type: "check", title: "One more", questionId: gen("as-check", 2, 7) },
      ],
    },
    {
      id: "problems",
      title: "Word problems",
      phase: "Apply",
      summary: "Draw a bar model, then decide: add or subtract?",
      minutes: 8,
      objectives: ["Pick the right operation", "Solve two-step problems with a bar model"],
      steps: [
        {
          type: "explain",
          title: "Draw it first",
          body: ["*Altogether* and *in total* mean add. *How many more*, *how many left* and *difference* mean subtract.", "A **bar model** shows the whole and the parts, so you can see which one is missing. If the whole is missing, add the parts. If a part is missing, subtract."],
          visual: { kind: "bar", total: "£500", parts: [{ label: "£137", size: 137, tone: "num" }, { label: "£249", size: 249, tone: "num" }, { label: "?", size: 114, tone: "brand" }] },
        },
        {
          type: "worked",
          title: "Watch me: books in a library",
          support: "full",
          problem: "A library has **2,450** books. **385** are lent out. How many are left on the shelves?",
          visual: { kind: "bar", parts: [{ label: "lent: 385", tone: "num", size: 385 }, { label: "left: ?", tone: "brand", size: 2065 }], total: "2,450" },
          steps: [{ text: "The whole is 2,450, and one part (385) is lent out. The other part is missing." }, { text: "Missing part: 2,450 − 385 = **2,065**." }],
          conclusion: "**2,065** books are left.",
        },
        {
          type: "worked",
          title: "Together: two classes",
          support: "faded",
          problem: "One class collected **178** cans and another collected **246**. How many cans altogether?",
          steps: [{ text: "Both parts are known; the whole is missing, so add.", blank: { prompt: "178 + 246 = ?", answer: 424, hint: "Add the ones, then the tens, carrying.", traps: [{ value: 68, misconception: M.inverse, feedback: "'Altogether' means add the two amounts." }, { value: 314, misconception: M.carry, feedback: "Carry the tens and hundreds when a column makes 10 or more." }], worked: "**424** cans." } }],
          conclusion: "**424** cans altogether.",
        },
        { type: "check", title: "Your turn", questionId: gen("as-word", 1, 3) },
        { type: "check", title: "Two steps", questionId: gen("as-word", 3, 8) },
      ],
    },
  ],
  templates,
  misconceptions: [
    { id: M.bond, name: "Making each digit add to 10", possibleCause: "It looks like each digit was made up to 10.", description: "Says 37 + 73 = 100, making both the tens and the ones add to 10.", explanation: ["The ones make 10, which is one more ten.", "So the tens only need to make 9 tens: 37 + 63 = 100."], skills: [S.mental], followUpTemplates: ["as-bonds"] },
    { id: M.adjust, name: "Adjusting the wrong way", possibleCause: "It looks like the last step went the wrong way, or was missed.", description: "Adds 30 for 29 but forgets to take the extra 1 away.", explanation: ["29 is 30 − 1.", "46 + 30 = 76, then take away the extra 1: 75."], skills: [S.mental], followUpTemplates: ["as-mental"] },
    { id: M.carry, name: "Forgetting to carry", possibleCause: "It looks like a ten wasn't carried into the next column.", description: "Writes only the ones digit of a column total, losing the carried ten.", explanation: ["8 + 6 = 14: write 4 and carry 1 ten.", "Add the carried 1 into the next column."], skills: [S.add], followUpTemplates: ["as-col-add"] },
    { id: M.smaller, name: "Taking the smaller digit from the larger", possibleCause: "It looks like the digits were swapped in a column.", description: "Works out 52 − 17 as 45 by doing 7 − 2 in the ones.", explanation: ["The top number stays on top.", "If the top digit is smaller, exchange one from the next column."], skills: [S.sub], followUpTemplates: ["as-col-sub", "as-sub-word"] },
    { id: M.inverse, name: "Using the wrong operation", possibleCause: "It looks like you added when you needed to subtract, or the other way round.", description: "Picks the wrong operation for a missing number or a word problem.", explanation: ["If a part is missing, subtract from the whole.", "If the whole is missing, add the parts."], skills: [S.inverse, S.problems], followUpTemplates: ["as-missing", "as-word"] },
  ],
  placement: [
    { lessonId: "mental", template: "as-bonds" },
    { lessonId: "column-add", template: "as-col-add" },
    { lessonId: "column-sub", template: "as-col-sub" },
    { lessonId: "missing", template: "as-missing" },
    { lessonId: "problems", template: "as-word" },
  ],
});
