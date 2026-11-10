import { defineTopic, genFor, int, pick, withHints } from "@/topics/kit/define";
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

const baseTemplates: Template[] = [
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
  /* D-037 (Phase B): two more question makers per skill (one a stretch question), and a stretch for problems. */
  {
    key: "mn-fewest-coins",
    skill: S.coins,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const amount = difficulty === 1 ? pick(r, [7, 12, 15, 25, 30]) : difficulty === 2 ? pick(r, [37, 48, 63, 76, 85]) : pick(r, [93, 99, 88, 79]);
      let left = amount;
      let coins = 0;
      for (const c of [...COINS].reverse()) while (left >= c) { left -= c; coins++; }
      return {
        kind: "number",
        prompt: `What is the **fewest** number of coins that make **${amount}p**?`,
        answer: coins,
        traps: [{ value: coins + 1, misconception: M.count, feedback: "Start with the biggest coin that fits, and use it as many times as you can." }],
        hint: "Use the biggest coin that fits first, then the next biggest.",
        explanation: `Biggest coins first gives **${coins}** coins.`,
      };
    },
  },
  {
    key: "mn-coins-stretch",
    skill: S.coins,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const target = pick(r, [10, 20]);
      const ways = target === 10 ? 11 : 41;
      return {
        kind: "number",
        prompt: `How many different ways can you make **${target}p** using only **1p, 2p and 5p** coins? (Order doesn't matter.)`,
        answer: target === 10 ? 10 : 29,
        traps: [{ value: ways, feedback: "Be systematic: start with the most 5p coins, then fewer, and count the 2p and 1p ways each time." }],
        hint: "Start with as many 5p coins as possible. For each number of 5ps, count the ways to make the rest with 2p and 1p.",
        explanation: target === 10 ? "Two 5ps: 1 way. One 5p: 5p left makes 3 ways (2+2+1, 2+1+1+1, 1×5). No 5p: 10p makes 6 ways. Total **10**." : "Four 5ps: 1. Three: 3. Two: 6. One: 8. None: 11. Total **29**.",
      };
    },
  },
  {
    key: "mn-convert-word",
    skill: S.convert,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const p = difficulty === 1 ? int(r, 110, 990) : int(r, 1001, 2999);
      const toPence = r() < 0.5;
      return toPence
        ? {
            kind: "number",
            prompt: `A ticket costs **${pounds(p)}**. How many **pence** is that?`,
            unit: "p",
            answer: p,
            traps: [{ value: Number(String(p).replace(/0/, "")), misconception: M.zero, feedback: "Keep every digit, including zeros: £1 is 100p." }].filter((t) => t.value !== p),
            hint: "£1 = 100p. Write the pounds and pence digits together.",
            explanation: `${pounds(p)} = **${p}p**.`,
          }
        : {
            kind: "number",
            prompt: `A jar holds **${p}p**. How much is that in **pounds**?`,
            unit: "£",
            answer: p / 100,
            decimals: 2,
            traps: [{ value: p / 10, misconception: M.units, feedback: "There are 100 pence in a pound: divide by 100." }],
            hint: "Divide by 100: the last two digits are the pence.",
            explanation: `${p}p = **${pounds(p)}**.`,
          };
    },
  },
  {
    key: "mn-convert-stretch",
    skill: S.convert,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const v0 = int(r, 300, 360);
      const v1 = v0 + int(r, 5, 60);
      const v2 = v1 + int(r, 5, 60);
      const vals = [v1, v2, v0].sort(() => r() - 0.5);
      const shown = vals.map((v, i) => (i === 1 ? `${v}p` : pounds(v)));
      const maxI = vals.indexOf(Math.max(...vals));
      return {
        kind: "choose",
        prompt: `Which amount is the **most**: ${shown.map((s) => `**${s}**`).join(", ")}?`,
        options: [{ text: shown[maxI]! }, ...shown.filter((_, i) => i !== maxI).map((t) => ({ text: t, misconception: M.units, feedback: "Change them all into pence first, then compare." }))],
        answer: 0,
        hint: "Write every amount in pence.",
        explanation: `In pence: ${vals.join("p, ")}p. The most is **${shown[maxI]}**.`,
      };
    },
  },
  {
    key: "mn-total-coins",
    skill: S.totals,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const items = shop(r, 2, difficulty === 1 ? 15 : 60, difficulty === 1 ? 90 : 399);
      const n = difficulty === 3 ? 3 : 2;
      const total = items[0]!.cost * (n - 1) + items[1]!.cost;
      return {
        kind: "number",
        prompt: `You buy **${n - 1} × ${items[0]!.name.replace(/^an? /, "")}** at ${price(items[0]!.cost)} each and **${items[1]!.name}** at ${price(items[1]!.cost)}. What is the total, in pence?`,
        unit: "p",
        answer: total,
        traps: [{ value: items[0]!.cost + items[1]!.cost, misconception: M.one, feedback: `You bought ${n - 1} of the first item: multiply its price first.` }].filter((t) => t.value !== total),
        hint: "Work out the cost of each kind of item, then add.",
        explanation: `${n - 1} × ${items[0]!.cost}p + ${items[1]!.cost}p = **${total}p**.`,
      };
    },
  },
  {
    key: "mn-totals-stretch",
    skill: S.totals,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const budget = pick(r, [500, 1000]);
      const items = shop(r, 3, 120, budget / 2);
      const total = items.reduce((s, x) => s + x.cost, 0);
      const fits = total <= budget;
      return {
        kind: "choose",
        prompt: `You have **${price(budget)}**. Can you buy ${items.map((x) => `${x.name} (${price(x.cost)})`).join(", ")}?`,
        options: [
          { text: fits ? `Yes, with ${price(budget - total)} left` : `No, you are ${price(total - budget)} short` },
          { text: fits ? `No, you are ${price(total - budget + 100)} short` : `Yes, with ${price(Math.abs(budget - total))} left`, feedback: `Add the three prices: ${price(total)}.` },
          { text: fits ? `Yes, with ${price(budget - total + 50)} left` : `No, you are ${price(total - budget + 50)} short`, feedback: "Check your adding carefully." },
        ],
        answer: 0,
        hint: "Add the three prices, then compare with what you have.",
        explanation: `Total ${price(total)}. ${fits ? `That leaves **${price(budget - total)}**.` : `That is **${price(total - budget)}** more than you have.`}`,
      };
    },
  },
  {
    key: "mn-change-coins",
    skill: S.change,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const pay = difficulty === 1 ? 100 : difficulty === 2 ? 200 : 500;
      const cost = int(r, Math.floor(pay / 10), Math.floor(pay / 5) * 4) ;
      const change = pay - cost;
      return {
        kind: "number",
        prompt: `Something costs **${price(cost)}**. You pay with **${price(pay)}**. How much change, in pence?`,
        unit: "p",
        answer: change,
        traps: [{ value: pay + cost, misconception: M.change, feedback: "Change is what's left: take the cost away from what you paid." }],
        hint: `Count up from ${price(cost)} to ${price(pay)}.`,
        explanation: `${pay}p − ${cost}p = **${change}p**.`,
      };
    },
  },
  {
    key: "mn-change-stretch",
    skill: S.change,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const a = int(r, 25, 95) * 5;
      const b = int(r, 20, 80) * 5;
      const pay = a + b > 1000 ? 2000 : 1000;
      return {
        kind: "number",
        prompt: `Ravi buys a book for **${price(a)}** and a pen for **${price(b)}**. He pays with a **${price(pay)}** note. How much change does he get, in pence?`,
        unit: "p",
        answer: pay - a - b,
        traps: [{ value: pay - a, misconception: M.change, feedback: "Take both prices away." }, { value: a + b, misconception: M.change, feedback: "That's what he spent. Change is what's left from the note." }].filter((t) => t.value !== pay - a - b),
        hint: "Add the two prices first, then take that from the note.",
        explanation: `${a}p + ${b}p = ${a + b}p; ${pay}p − ${a + b}p = **${pay - a - b}p**.`,
      };
    },
  },
  {
    key: "mn-problems-stretch",
    skill: S.problems,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const each = int(r, 30, 60);
      const packPrice = each * 6 - int(r, 1, 4) * 10;
      const singles = 6 * each;
      return {
        kind: "number",
        prompt: `Cupcakes cost **${each}p** each, or **${price(packPrice)}** for a pack of 6. How much do you **save**, in pence, by buying a pack instead of 6 single cupcakes?`,
        unit: "p",
        answer: singles - packPrice,
        traps: [{ value: singles, feedback: "That's the cost of 6 singles. Now take away the pack price." }, { value: packPrice - each, misconception: M.one, feedback: "Compare 6 singles with one pack." }].filter((t) => t.value !== singles - packPrice),
        hint: `Work out 6 × ${each}p first.`,
        explanation: `6 × ${each}p = ${singles}p; ${singles}p − ${packPrice}p = **${singles - packPrice}p** saved.`,
      };
    },
  },
];

const templates = withHints(baseTemplates, {
  "mn-count": () => ["Start with the biggest coin or note.", "Count on with each smaller coin."],
  "mn-fewest-coins": () => ["Use the biggest coin that fits.", "Then make what's left with the next biggest coins."],
  "mn-coins-stretch": () => ["Make a list in order so you don't miss any.", "Start with the most 5p coins, then use fewer."],
  "mn-convert": () => ["£1 is 100p.", "Pounds to pence: multiply by 100. Pence to pounds: divide by 100."],
  "mn-convert-word": () => ["£1 = 100p.", "Keep any zeros: £4.05 is 405p."],
  "mn-convert-stretch": () => ["Change everything into pence.", "Then compare the numbers."],
  "mn-total": () => ["Add the pounds and the pence.", "If the pence make 100 or more, swap 100p for £1."],
  "mn-total-coins": () => ["Multiply first if you buy more than one of something.", "Then add everything."],
  "mn-totals-stretch": () => ["Add all three prices.", "Is the total more or less than what you have?"],
  "mn-change": () => ["Count up from the price to what you paid.", "Or take the price away from what you paid."],
  "mn-change-coins": () => ["Count up to the next pound, then on to what you paid.", "Change = paid − cost."],
  "mn-change-stretch": () => ["Find the total spent first.", "Then count up to the note."],
  "mn-multiply": () => ["Several of the same thing: multiply.", "Split the price into pounds and pence to multiply in your head."],
  "mn-best": () => ["Work out the price of one in each offer.", "The lower price for one is the better buy."],
  "mn-problems-stretch": () => ["Work out what 6 single cupcakes cost.", "Take away the pack price to find the saving."],
});

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
          body: ["Coins: **1p, 2p, 5p, 10p, 20p, 50p, £1 and £2**. Notes: **£5, £10 and £20**.", "To count money, start with the biggest and count on. Group coins that are the same: two 20p coins make 40p.", "A coin's size doesn't tell you its value: a 5p coin is smaller than a 1p coin."],
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
        {
          type: "worked",
          title: "Together: count these coins",
          support: "faded",
          problem: "How much money is here?",
          visual: { kind: "coins", pence: [100, 50, 10, 10, 1] },
          steps: [{ text: "£1 is 100p, then the 50p: **150p**.", blank: { prompt: "Add the two 10p coins and the 1p: how many pence?", answer: 171, hint: "150 + 10 + 10 + 1", traps: [{ value: 5, misconception: M.count, feedback: "Count the value of each coin, not how many coins there are." }], worked: "**171p**, which is £1.71." } }],
          conclusion: "There is **£1.71**.",
        },
        { type: "check", title: "Your turn", questionId: gen("mn-count", 1, 3) },
        { type: "check", title: "One more", questionId: gen("mn-fewest-coins", 1, 6) },
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
          body: ["**£1 = 100p**, so **£3.45 = 345p**.", "Careful with zeros: **£4.05 = 405p**, but **£4.50 = 450p**.", "Going the other way, divide by 100: the last two digits are the pence. 627p is **£6.27**, and 80p is **£0.80**."],
          visual: { kind: "pv-chart", value: 4.05, columns: ["O", "t", "h"] },
          tip: "Money always has two digits after the point: £4.50, not £4.5.",
        },
        {
          type: "worked",
          title: "Watch me: £7.08 in pence",
          support: "full",
          problem: "Write **£7.08** in pence.",
          visual: { kind: "pv-chart", value: 708, columns: ["H", "T", "O"] },
          steps: [{ text: "£7 is **700p**." }, { text: ".08 is **8p**. 700 + 8 = **708p**." }],
          conclusion: "£7.08 = **708p**. The zero holds the tens of pence.",
        },
        {
          type: "worked",
          title: "Together: £2.40 in pence",
          support: "faded",
          problem: "Write **£2.40** in pence.",
          steps: [{ text: "£2 is 200p, and .40 is 40p.", blank: { prompt: "How many pence?", answer: 240, hint: "200 + 40", traps: [{ value: 24, misconception: M.zero, feedback: "The 4 is 40p, not 4p: £2.40 is 240p." }], worked: "**240p**." } }],
          conclusion: "£2.40 = **240p**.",
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
          type: "explain",
          title: "Pounds, then pence",
          body: ["To add prices, add the pounds, then add the pence. If the pence come to 100 or more, swap 100p for £1.", "Or change everything into pence, add, and change back: £2.75 + £1.50 is 275p + 150p = 425p = £4.25. Line up the decimal points if you use columns."],
          visual: { kind: "coins", pence: [200, 50, 20, 5, 100, 50] },
        },
        {
          type: "worked",
          title: "Watch me add",
          support: "full",
          problem: "A comic costs **£2.75** and a drink costs **£1.50**. How much altogether?",
          steps: [{ text: "Pounds: £2 + £1 = **£3**." }, { text: "Pence: 75p + 50p = **125p**, which is **£1.25**." }, { text: "£3 + £1.25 = **£4.25**." }],
          conclusion: "Altogether: **£4.25**.",
        },
        {
          type: "worked",
          title: "Together: £1.65 + 85p",
          support: "faded",
          problem: "A sandwich costs **£1.65** and a drink costs **85p**. How much altogether?",
          steps: [{ text: "In pence: 165p + 85p.", blank: { prompt: "165 + 85 = ? (pence)", answer: 250, hint: "165 + 35 = 200, then 50 more.", traps: [{ value: 1015, misconception: M.units, feedback: "85p is 0.85 of a pound, not £8.50: add 165p and 85p." }], worked: "**250p**, which is £2.50." } }],
          conclusion: "Altogether: **£2.50**.",
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
          type: "explain",
          title: "Count up, like a shopkeeper",
          body: ["Change is what you get back when you pay more than the price. **Change = what you paid − the price.**", "An easy way is to count up from the price: first to the next 10p, then to the next pound, then to what you paid. Add up the jumps."],
          visual: { kind: "line", min: 360, max: 500, step: 10, labelEvery: 5, points: [{ value: 365, label: "£3.65", tone: "brand" }, { value: 500, label: "£5", tone: "num" }] },
        },
        {
          type: "worked",
          title: "Watch me count up",
          support: "full",
          problem: "A book costs **£3.65**. You pay with a **£5** note. How much change?",
          visual: { kind: "coins", pence: [100, 20, 10, 5] },
          steps: [{ text: "£3.65 + **5p** = £3.70." }, { text: "£3.70 + **30p** = £4." }, { text: "£4 + **£1** = £5." }, { text: "Add the jumps: £1 + 30p + 5p." }],
          conclusion: "The change is **£1.35**.",
        },
        {
          type: "worked",
          title: "Together: change from £2",
          support: "faded",
          problem: "A comic costs **£1.45**. You pay with a **£2** coin. How much change?",
          steps: [{ text: "Count up: 5p to £1.50, then 50p to £2.", blank: { prompt: "How many pence change?", answer: 55, hint: "5 + 50", traps: [{ value: 345, misconception: M.change, feedback: "That adds the price and the payment. Change is the difference: count up from £1.45 to £2." }], worked: "**55p**." } }],
          conclusion: "The change is **55p**.",
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
          type: "explain",
          title: "Many of the same",
          body: ["Buying several of the same thing means multiplying: 4 pencils at 35p cost 4 × 35p.", "To find the **better value**, work out the price of **one** in each offer, then compare. Sharing a bill equally means dividing."],
          visual: { kind: "bar", parts: [{ label: "35p", tone: "brand" }, { label: "35p", tone: "brand" }, { label: "35p", tone: "brand" }, { label: "35p", tone: "brand" }], total: "4 pencils" },
        },
        {
          type: "worked",
          title: "Watch me: which is better value?",
          support: "full",
          problem: "**3 apples for 90p**, or **5 apples for £1.40**: which is better value?",
          steps: [{ text: "Price of one in the first offer: 90p ÷ 3 = **30p**." }, { text: "Price of one in the second: 140p ÷ 5 = **28p**." }],
          conclusion: "**5 for £1.40** is better value: each apple is cheaper.",
        },
        {
          type: "worked",
          title: "Let's do it together",
          support: "faded",
          problem: "One pencil costs **35p**. How much do **4** pencils cost?",
          steps: [
            { text: "4 pencils: 4 × 35p.", blank: { prompt: "What is 4 × 35?", answer: 140, hint: "4 × 30 = 120 and 4 × 5 = 20.", traps: [{ value: 39, misconception: M.one, feedback: "4 pencils at 35p each means 4 × 35, not 35 + 4." }], worked: "4 × 35 = **140**." } },
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
