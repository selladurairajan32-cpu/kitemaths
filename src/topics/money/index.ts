import { defineTopic, genFor, int, pick } from "@/topics/kit/define";
import type { Template } from "@/topics/kit/types";

/** Money: coins and notes, pounds and pence, adding up, change, and money problems. All sums are done in pence. */

const T = "money";
const gen = genFor(T);
const S = { coins: `${T}.coins`, convert: `${T}.pounds-pence`, totals: `${T}.totals`, change: `${T}.change`, problems: `${T}.problems` };
const M = { units: `${T}.pounds-and-pence-mixed`, zero: `${T}.missing-zero`, count: `${T}.counting-coins`, change: `${T}.change-added`, one: `${T}.priced-one` };

/** 345 → "£3.45", 300 → "£3", 45 → "45p". */
function price(p: number): string {
  if (p < 100) return `${p}p`;
  return p % 100 === 0 ? `£${p / 100}` : `£${(p / 100).toFixed(2)}`;
}
/** 345 → "£3.45" always in pounds. */
const pounds = (p: number) => `£${(p / 100).toFixed(2)}`;
const COINS = [1, 2, 5, 10, 20, 50];
/** Things to buy, each with a believable price range in pence. */
const ITEMS: [name: string, lo: number, hi: number][] = [
  ["a pencil", 15, 80],
  ["a rubber", 15, 60],
  ["an apple", 20, 60],
  ["a banana", 15, 45],
  ["a sticker sheet", 20, 90],
  ["a ruler", 40, 150],
  ["a drink", 60, 180],
  ["a notebook", 80, 250],
  ["a comic", 150, 395],
  ["a sandwich", 180, 395],
  ["a book", 299, 899],
  ["a kite", 450, 999],
  ["a lunchbox", 350, 799],
  ["a football", 599, 1499],
  ["a board game", 899, 1899],
];
const capital = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
/** n different items priced between lo and hi pence (prices in 5p steps unless `exact`). */
function shop(r: () => number, n: number, lo: number, hi: number, exact = false): { name: string; cost: number }[] {
  const left = ITEMS.filter(([, a, b]) => b >= lo && a <= hi);
  return Array.from({ length: n }, () => {
    const [name, a, b] = left.splice(Math.floor(r() * left.length), 1)[0];
    const from = Math.max(a, lo);
    const to = Math.min(b, hi);
    return { name, cost: exact ? int(r, from, to) : int(r, Math.ceil(from / 5), Math.floor(to / 5)) * 5 };
  });
}

const templates: Template[] = [
  {
    key: "mn-count",
    skill: S.coins,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const n = difficulty === 1 ? int(r, 3, 4) : int(r, 4, 6);
      const pool = difficulty === 1 ? COINS : [...COINS, 100, 200];
      let pence = Array.from({ length: n }, () => pick(r, pool));
      if (difficulty === 3) pence = [pick(r, [500, 1000, 2000]), ...pence];
      if (difficulty === 1) pence.sort((a, b) => b - a);
      const total = pence.reduce((a, b) => a + b, 0);
      const inPence = total < 100;
      return {
        kind: "number",
        prompt: inPence ? "How much money is here, in pence?" : "How much money is here?",
        visual: { kind: "coins", pence },
        answer: inPence ? total : total / 100,
        unit: inPence ? "p" : "£",
        decimals: inPence ? undefined : 2,
        traps: [
          ...(pence.length !== (inPence ? total : total / 100) ? [{ value: pence.length, misconception: M.count, feedback: "Add up what each coin is worth, not how many coins there are." }] : []),
          ...(!inPence ? [{ value: total, misconception: M.units, feedback: `${total}p is the right amount, but the box wants pounds: ${pounds(total)}.` }] : []),
        ],
        hint: "Start with the biggest coin or note, then count on.",
        explanation: `${pence.map(price).join(" + ")} = **${price(total)}**.`,
      };
    },
  },
  {
    key: "mn-convert",
    skill: S.convert,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const toPence = r() < 0.5;
      // Level 3 has a zero in the tenths of a pound: £4.05, 307p.
      const p = difficulty === 1 ? int(r, 2, 9) * 100 : difficulty === 2 ? int(r, 1, 9) * 100 + int(r, 11, 99) : int(r, 1, 9) * 100 + int(r, 1, 9);
      if (toPence) {
        return {
          kind: "number",
          prompt: `How many pence is **${price(p)}**?`,
          answer: p,
          unit: "p",
          traps: [
            ...(difficulty === 1 ? [{ value: p / 10, misconception: M.units, feedback: "£1 is 100p, not 10p." }] : []),
            ...(difficulty === 3 ? [{ value: Math.floor(p / 100) * 10 + (p % 100), misconception: M.zero, feedback: `The 0 matters: ${price(p)} has 0 tens of pence, so it's ${p}p.` }] : []),
          ].filter((t) => t.value !== p),
          hint: "£1 = 100p. Pounds become hundreds of pence.",
          explanation: `${price(p)} = **${p}p**.`,
        };
      }
      return {
        kind: "number",
        prompt: `Write **${p}p** in pounds.`,
        answer: p / 100,
        unit: "£",
        decimals: 2,
        traps: [
          { value: p / 10, misconception: M.units, feedback: "Divide by 100: two places, so 100p = £1." },
          { value: p, misconception: M.units, feedback: "That's still pence. Write it in pounds, with a decimal point." },
          ...(difficulty === 3 ? [{ value: Math.floor(p / 100) + (p % 100) / 10, misconception: M.zero, feedback: `${p}p is ${pounds(p)}: the pence need two places after the point.` }] : []),
        ].filter((t) => Math.abs(t.value - p / 100) > 1e-9),
        hint: "100p = £1. Pence fill the two places after the point.",
        explanation: `${p}p = **${pounds(p)}**.`,
      };
    },
  },
  {
    key: "mn-total",
    skill: S.totals,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const count = difficulty === 3 ? 3 : 2;
      const bought = difficulty === 1 ? shop(r, count, 15, 45) : shop(r, count, 20, 395);
      const names = bought.map((b) => b.name);
      const prices = bought.map((b) => b.cost);
      const total = prices.reduce((a, b) => a + b, 0);
      const inPence = total < 100;
      const list = names.map((n, i) => `${i === 0 ? capital(n) : n} costs **${price(prices[i])}**`);
      return {
        kind: "number",
        prompt: `${list.slice(0, -1).join(", ")} and ${list[list.length - 1]}. How much is that altogether?`,
        answer: inPence ? total : total / 100,
        unit: inPence ? "p" : "£",
        decimals: inPence ? undefined : 2,
        traps: inPence ? [] : [{ value: total, misconception: M.units, feedback: `${total}p is right, but write it in pounds: ${pounds(total)}.` }],
        hint: "Add the pence first. Every 100p makes £1.",
        explanation: `${prices.map(price).join(" + ")} = **${inPence ? price(total) : pounds(total)}**.`,
      };
    },
  },
  {
    key: "mn-change",
    skill: S.change,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const paid = difficulty === 1 ? 100 : difficulty === 2 ? pick(r, [500, 1000]) : 2000;
      const [{ name, cost }] = difficulty === 1 ? shop(r, 1, 15, 95) : difficulty === 2 ? shop(r, 1, 100, paid - 10) : shop(r, 1, 300, 1899, true);
      const change = paid - cost;
      const inPence = paid === 100;
      return {
        kind: "number",
        prompt: `${capital(name)} costs **${price(cost)}**. You pay with ${inPence ? "a **£1** coin" : `a **${price(paid)}** note`}. How much change do you get?`,
        visual: inPence ? { kind: "coins", pence: [100] } : { kind: "coins", pence: [paid] },
        answer: inPence ? change : change / 100,
        unit: inPence ? "p" : "£",
        decimals: inPence ? undefined : 2,
        traps: [
          { value: inPence ? cost : cost / 100, misconception: M.change, feedback: "That's what it costs. The change is what you get back." },
          { value: inPence ? paid + cost : (paid + cost) / 100, misconception: M.change, feedback: "Change means take the cost away from what you paid." },
        ].filter((t) => Math.abs(t.value - (inPence ? change : change / 100)) > 1e-9),
        hint: `Count up from ${price(cost)} to ${price(paid)}.`,
        explanation: `${price(paid)} − ${price(cost)} = **${inPence ? price(change) : pounds(change)}**.`,
      };
    },
  },
  {
    key: "mn-multiply",
    skill: S.problems,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      if (difficulty === 3 && r() < 0.5) {
        // Sharing a bill equally.
        const people = int(r, 2, 5);
        const each = int(r, 21, 99) * 5;
        const total = each * people;
        return {
          kind: "number",
          prompt: `**${people}** friends share a bill of **${pounds(total)}** equally. How much does each person pay?`,
          answer: each / 100,
          unit: "£",
          decimals: 2,
          hint: `Change it to pence: ${total}p ÷ ${people}.`,
          explanation: `${total}p ÷ ${people} = ${each}p = **${pounds(each)}**.`,
        };
      }
      const n = int(r, 3, difficulty === 1 ? 5 : 9);
      const each = difficulty === 1 ? int(r, 2, 9) * 5 : int(r, 11, 99) * 5;
      const total = n * each;
      const item = pick(r, ["pencil", "sticker pack", "bun", "badge", "ticket", "marble bag"]);
      const inPence = total < 100;
      const as = (p: number) => (inPence ? p : p / 100);
      return {
        kind: "number",
        prompt: `One ${item} costs **${price(each)}**. How much do **${n}** ${item}s cost?`,
        answer: as(total),
        unit: inPence ? "p" : "£",
        decimals: inPence ? undefined : 2,
        traps: [
          { value: as(each), misconception: M.one, feedback: `That's the price of one. You need ${n} of them.` },
          ...(inPence ? [] : [{ value: total, misconception: M.units, feedback: `${total}p is right, but write it in pounds: ${pounds(total)}.` }]),
        ].filter((t) => Math.abs(t.value - as(total)) > 1e-9),
        hint: inPence ? `${n} × ${each}p.` : `${n} × ${each}p. Then change pence to pounds.`,
        explanation: inPence ? `${n} × ${each}p = **${total}p**.` : `${n} × ${each}p = ${total}p = **${pounds(total)}**.`,
      };
    },
  },
  {
    key: "mn-best",
    skill: S.problems,
    difficulties: [2, 3],
    make: (r) => {
      const item = pick(r, ["apples", "pens", "stickers", "biscuits", "balloons"]);
      const a = int(r, 2, 6);
      let b = int(r, 2, 8);
      if (a === b) b += 2;
      const ua = int(r, 4, 12) * 5;
      let ub = int(r, 4, 12) * 5;
      if (ua === ub) ub += 5;
      const better = ua < ub ? 0 : 1;
      return {
        kind: "choose",
        prompt: `Which is better value? **Pack A:** ${a} ${item} for **${price(a * ua)}**. **Pack B:** ${b} ${item} for **${price(b * ub)}**.`,
        options: [
          { text: "Pack A", feedback: better === 0 ? undefined : `Pack A is ${ua}p for each one; Pack B is ${ub}p. Compare the price of one.` },
          { text: "Pack B", feedback: better === 1 ? undefined : `Pack B is ${ub}p for each one; Pack A is ${ua}p. Compare the price of one.` },
        ],
        answer: better,
        fixedOrder: true,
        hint: "Find the price of one in each pack.",
        explanation: `Pack A: ${price(a * ua)} ÷ ${a} = ${ua}p each. Pack B: ${price(b * ub)} ÷ ${b} = ${ub}p each. **Pack ${better === 0 ? "A" : "B"}** is better value.`,
      };
    },
  },
];

export const money = defineTopic({
  id: T,
  title: "Money",
  subtitle: "Coins and notes, pounds and pence, adding up, change and money problems",
  world: "measure",
  years: [3, 4, 5, 6],
  order: 1,
  icon: "coin",
  skills: [
    { id: S.coins, title: "Coins and notes", description: "Count coins and notes to find a total.", lessonId: "coins" },
    { id: S.convert, title: "Pounds and pence", description: "Change between pounds and pence, including amounts like £4.05.", lessonId: "pounds-pence" },
    { id: S.totals, title: "Adding up", description: "Add prices to find a total.", lessonId: "totals" },
    { id: S.change, title: "Giving change", description: "Work out change by counting up or taking away.", lessonId: "change" },
    { id: S.problems, title: "Money problems", description: "Multiply and share money, and find the better value.", lessonId: "problems" },
  ],
  lessonIcons: { coins: "coin", "pounds-pence": "place-value", totals: "plus", change: "recheck", problems: "bulb" },
  lessons: [
    {
      id: "coins",
      title: "Coins and notes",
      phase: "Understand",
      summary: "Count the biggest first, then count on.",
      minutes: 6,
      objectives: ["Know our coins and notes", "Count a set of coins"],
      steps: [
        {
          type: "explain",
          title: "Our coins and notes",
          body: ["Coins: **1p, 2p, 5p, 10p, 20p, 50p, £1 and £2**. Notes: **£5, £10 and £20**.", "To count money, start with the biggest and count on."],
          visual: { kind: "coins", pence: [200, 100, 50, 20, 10, 5, 2, 1] },
        },
        {
          type: "worked",
          title: "Watch me count",
          support: "full",
          problem: "How much money is here?",
          visual: { kind: "coins", pence: [50, 20, 20, 5, 2] },
          steps: [{ text: "Start with the biggest: **50p**." }, { text: "Count on the 20s: **70p, 90p**." }, { text: "Then 5p and 2p: **95p, 97p**." }],
          conclusion: "There is **97p**.",
        },
        { type: "check", title: "Your turn", questionId: gen("mn-count", 1, 3) },
      ],
    },
    {
      id: "pounds-pence",
      title: "Pounds and pence",
      phase: "Visualise",
      summary: "£1 = 100p. The pence fill two places after the point.",
      minutes: 6,
      objectives: ["Change pounds to pence and back", "Use a zero to hold a place"],
      steps: [
        {
          type: "explain",
          title: "100 pence in a pound",
          body: ["**£1 = 100p**, so **£3.45 = 345p**.", "Careful with zeros: **£4.05 = 405p**, but **£4.50 = 450p**."],
          visual: { kind: "pv-chart", value: 4.05, columns: ["O", "t", "h"] },
          tip: "Money always has two digits after the point: £4.50, not £4.5.",
        },
        { type: "check", title: "Your turn", questionId: gen("mn-convert", 2, 4) },
        { type: "check", title: "One more", questionId: gen("mn-convert", 3, 9) },
      ],
    },
    {
      id: "totals",
      title: "Adding up a bill",
      phase: "Practise",
      summary: "Add the pounds, add the pence, swap 100p for £1.",
      minutes: 7,
      objectives: ["Add two or three prices"],
      steps: [
        {
          type: "worked",
          title: "Watch me add",
          support: "full",
          problem: "A comic costs **£2.75** and a drink costs **£1.50**. How much altogether?",
          steps: [{ text: "Pounds: £2 + £1 = **£3**." }, { text: "Pence: 75p + 50p = **125p**, which is **£1.25**." }, { text: "£3 + £1.25 = **£4.25**." }],
          conclusion: "Altogether: **£4.25**.",
        },
        { type: "check", title: "Your turn", questionId: gen("mn-total", 1, 2) },
        { type: "check", title: "One more", questionId: gen("mn-total", 2, 6) },
      ],
    },
    {
      id: "change",
      title: "Giving change",
      phase: "Explore",
      summary: "Count up from the price to what you paid.",
      minutes: 7,
      objectives: ["Work out change by counting up"],
      steps: [
        {
          type: "worked",
          title: "Watch me count up",
          support: "full",
          problem: "A book costs **£3.65**. You pay with a **£5** note. How much change?",
          visual: { kind: "coins", pence: [100, 20, 10, 5] },
          steps: [{ text: "£3.65 + **5p** = £3.70." }, { text: "£3.70 + **30p** = £4." }, { text: "£4 + **£1** = £5." }, { text: "Add the jumps: £1 + 30p + 5p." }],
          conclusion: "The change is **£1.35**.",
        },
        { type: "check", title: "Your turn", questionId: gen("mn-change", 1, 5) },
        { type: "check", title: "One more", questionId: gen("mn-change", 2, 3) },
      ],
    },
    {
      id: "problems",
      title: "Money problems",
      phase: "Apply",
      summary: "Multiply for many, divide to share, and compare the price of one.",
      minutes: 8,
      objectives: ["Multiply and share money", "Find the better value"],
      steps: [
        {
          type: "worked",
          title: "Let's do it together",
          support: "faded",
          problem: "One pencil costs **35p**. How much do **4** pencils cost?",
          steps: [
            { text: "4 pencils: 4 × 35p.", blank: { prompt: "What is 4 × 35?", answer: 140, hint: "4 × 30 = 120 and 4 × 5 = 20.", worked: "4 × 35 = **140**." } },
            { text: "140p = £1.40." },
          ],
          conclusion: "4 pencils cost **£1.40**.",
        },
        { type: "check", title: "Your turn", questionId: gen("mn-multiply", 1, 4) },
        { type: "check", title: "One more", questionId: gen("mn-best", 2, 7) },
      ],
    },
  ],
  templates,
  misconceptions: [
    { id: M.units, name: "Mixing pounds and pence", possibleCause: "It looks like pounds and pence got mixed up.", description: "Writes 345p as £34.50, or £3 as 30p.", explanation: ["£1 = 100p.", "Pence fill two places after the decimal point."], skills: [S.coins, S.convert, S.totals, S.problems], followUpTemplates: ["mn-convert"] },
    { id: M.zero, name: "Missing the zero", possibleCause: "It looks like a zero holding a place was missed.", description: "Reads £4.05 as 45p or writes 307p as £3.7.", explanation: ["£4.05 has 0 tens of pence.", "So £4.05 = 405p, and 307p = £3.07."], skills: [S.convert], followUpTemplates: ["mn-convert"] },
    { id: M.count, name: "Counting coins, not value", possibleCause: "It looks like the coins were counted, not what they're worth.", description: "Says five coins make 5p.", explanation: ["Each coin has its own value.", "Add the values: biggest first."], skills: [S.coins], followUpTemplates: ["mn-count"] },
    { id: M.change, name: "Adding to find change", possibleCause: "It looks like the cost was added, not taken away.", description: "Gives the price, or price + money paid, as the change.", explanation: ["Change = what you paid − the cost.", "Count up from the cost to what you paid."], skills: [S.change], followUpTemplates: ["mn-change"] },
    { id: M.one, name: "Pricing just one", possibleCause: "It looks like only one item was priced.", description: "Gives the price of one when several are bought.", explanation: ["Several of the same: multiply.", "4 at 35p = 4 × 35p."], skills: [S.problems], followUpTemplates: ["mn-multiply"] },
  ],
  placement: [
    { lessonId: "coins", template: "mn-count" },
    { lessonId: "pounds-pence", template: "mn-convert" },
    { lessonId: "totals", template: "mn-total" },
    { lessonId: "change", template: "mn-change" },
    { lessonId: "problems", template: "mn-multiply" },
  ],
});
