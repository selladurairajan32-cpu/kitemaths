import { defineTopic, genFor, int, pick } from "@/topics/kit/define";
import { num } from "@/topics/kit/evaluate";
import type { ChooseOption, KitVisual, Template } from "@/topics/kit/types";

/** Percentages: what a percent is, percentages as fractions and decimals, percentages of amounts, and problems. */

const T = "percentages";
const gen = genFor(T);
const S = { meaning: `${T}.meaning`, convert: `${T}.convert`, amounts: `${T}.of-amounts`, problems: `${T}.problems` };
const M = { denominator: `${T}.percent-as-denominator`, place: `${T}.decimal-slip`, divide: `${T}.divide-by-percent`, discount: `${T}.forgot-to-take-off`, whole: `${T}.whole-is-100` };

/** Percentages children learn as fractions, in simplest form. */
const AS_FRACTION: Record<number, string> = { 1: "{1/100}", 10: "{1/10}", 20: "{1/5}", 25: "{1/4}", 30: "{3/10}", 40: "{2/5}", 50: "{1/2}", 60: "{3/5}", 70: "{7/10}", 75: "{3/4}", 80: "{4/5}", 90: "{9/10}" };

function unique(right: string, wrong: ChooseOption[]): ChooseOption[] {
  const out: ChooseOption[] = [{ text: right }];
  for (const w of wrong) if (!out.some((o) => o.text === w.text)) out.push(w);
  return out.slice(0, 4);
}

/** A bar split into tenths or quarters, with the parts we want coloured. */
function percentBar(p: number, amount?: number): KitVisual {
  const quarters = p % 25 === 0 && p % 10 !== 0;
  const n = quarters ? 4 : 10;
  const each = 100 / n;
  const take = Math.round(p / each);
  return {
    kind: "bar",
    // Ten parts are too narrow on a phone for labels, so the note says what each is worth.
    parts: Array.from({ length: n }, (_, i) => ({ label: quarters ? `${each}%` : "", tone: i < take ? "num" : "plain" })),
    total: amount === undefined ? "100%" : `100% = ${num(amount)}`,
    note: quarters ? undefined : "Each part is 10%",
  };
}

/** How to build p% of an amount from halves, quarters, 10% and 5%. */
function howTo(p: number, amount: number): string {
  const answer = (amount * p) / 100;
  if (p === 50 || p === 25 || p === 75) return `${p}% of ${num(amount)} = ${AS_FRACTION[p]} of ${num(amount)} = **${num(answer)}**.`;
  if (p === 1) return `1% is one hundredth: ${num(amount)} ÷ 100 = **${num(answer)}**.`;
  const ten = amount / 10;
  const tens = Math.floor(p / 10);
  if (p % 10 === 0) return `10% of ${num(amount)} is ${num(ten)}, so ${p}% is ${tens} × ${num(ten)} = **${num(answer)}**.`;
  const five = amount / 20;
  if (tens === 0) return `10% of ${num(amount)} is ${num(ten)}, so 5% is half of that: **${num(answer)}**.`;
  return `10% of ${num(amount)} is ${num(ten)}, so ${tens * 10}% is ${num(ten * tens)}. 5% is half of 10%: ${num(five)}. ${p}% = ${num(ten * tens)} + ${num(five)} = **${num(answer)}**.`;
}

const templates: Template[] = [
  {
    key: "pc-grid",
    skill: S.meaning,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const shaded = difficulty === 1 ? int(r, 1, 9) * 10 : int(r, 11, 89);
      const notShaded = difficulty === 3;
      const answer = notShaded ? 100 - shaded : shaded;
      return {
        kind: "number",
        prompt: notShaded ? "What percentage of the square is **not** shaded?" : "What percentage of the square is shaded?",
        visual: { kind: "grid100", shaded },
        answer,
        unit: "%",
        traps: [
          { value: notShaded ? shaded : 100 - shaded, misconception: notShaded ? M.whole : undefined, feedback: notShaded ? "That's the shaded part. The whole square is 100%." : "That's the part that isn't shaded." },
          ...(answer % 10 === 0 ? [{ value: answer / 10, misconception: M.place, feedback: "Count small squares: each one is 1%." }] : []),
        ].filter((t) => t.value !== answer),
        hint: notShaded ? "The whole square is 100%. Take away the shaded part." : "There are 100 small squares. Each one is 1%.",
        explanation: notShaded ? `${shaded}% is shaded, so 100% − ${shaded}% = **${answer}%** is not.` : `${shaded} out of 100 squares: **${shaded}%**.`,
      };
    },
  },
  {
    key: "pc-fraction",
    skill: S.convert,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const pool = difficulty === 1 ? [50, 25, 10] : difficulty === 2 ? [75, 20, 1, 10, 25] : [40, 60, 30, 70, 80, 90];
      const p = pick(r, pool);
      const frac = AS_FRACTION[p];
      if (r() < 0.5) {
        // Fraction → percentage.
        const den = Number(frac.slice(frac.indexOf("/") + 1, -1));
        const top = Number(frac.slice(1, frac.indexOf("/")));
        return {
          kind: "number",
          prompt: `Write **${frac}** as a percentage.`,
          visual: difficulty < 3 ? percentBar(p) : undefined,
          answer: p,
          unit: "%",
          traps: [{ value: den, misconception: M.denominator, feedback: `${frac} isn't ${den}%. Make it out of 100: ${frac} = {${(top * 100) / den}/100}.` }, { value: top, misconception: M.denominator, feedback: "Make the fraction out of 100 first." }].filter((t) => t.value !== p),
          hint: `Make it out of 100. What do you multiply ${den} by to get 100?`,
          explanation: `${frac} = {${p}/100} = **${p}%**.`,
        };
      }
      const others = Object.entries(AS_FRACTION).filter(([k]) => Number(k) !== p);
      return {
        kind: "choose",
        prompt: `Which fraction is the same as **${p}%**?`,
        options: unique(frac, [
          { text: p === 1 ? "{1/10}" : `{1/${p}}`, misconception: M.denominator, feedback: `${p}% means ${p} out of 100, not 1 out of ${p}.` },
          { text: `{${p}/10}`, misconception: M.place, feedback: "Per cent means out of 100." },
          ...others.map(([, t]) => ({ text: t, feedback: "That's a different amount. Write the percentage out of 100, then simplify." })).slice(int(r, 0, others.length - 3)),
        ]),
        answer: 0,
        hint: `${p}% means ${p} out of 100: {${p}/100}. Can you simplify it?`,
        explanation: `${p}% = {${p}/100} = **${frac}**.`,
      };
    },
  },
  {
    key: "pc-decimal",
    skill: S.convert,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const toPercent = difficulty === 1 || (difficulty === 3 && r() < 0.5);
      // Level 3 uses the tricky ones: 0.4 is 40%, and 7% is 0.07.
      const p = difficulty === 3 ? (r() < 0.5 ? int(r, 1, 9) : int(r, 1, 9) * 10) : int(r, 11, 99);
      const d = p / 100;
      if (toPercent) {
        return {
          kind: "number",
          prompt: `Write **${num(d)}** as a percentage.`,
          answer: p,
          unit: "%",
          traps: [
            { value: p / 10, misconception: M.place, feedback: "Multiply by 100: the digits move two places." },
            { value: d, misconception: M.place, feedback: "To change a decimal to a percentage, multiply by 100." },
          ].filter((t) => Math.abs(t.value - p) > 1e-9),
          hint: "Multiply by 100: digits move two places to the left.",
          explanation: `${num(d)} × 100 = **${p}%**.`,
        };
      }
      return {
        kind: "number",
        prompt: `Write **${p}%** as a decimal.`,
        answer: d,
        decimals: 2,
        traps: [
          { value: p / 10, misconception: M.place, feedback: "Divide by 100: the digits move two places to the right." },
          { value: p, misconception: M.place, feedback: "Per cent means out of 100, so divide by 100." },
        ],
        hint: "Divide by 100: digits move two places to the right.",
        explanation: `${p}% = {${p}/100} = **${num(d)}**.`,
      };
    },
  },
  {
    key: "pc-of-amount",
    skill: S.amounts,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const p = pick(r, difficulty === 1 ? [50, 10, 25] : difficulty === 2 ? [20, 30, 75, 5, 40] : [15, 35, 60, 45, 1, 90]);
      // An amount that gives a whole-number answer.
      const step = p === 1 ? 100 : p % 25 === 0 ? 4 : p % 10 === 0 ? 10 : 20;
      const amount = step * int(r, difficulty === 1 ? 2 : 3, p === 1 ? 9 : difficulty === 3 ? 30 : 20);
      const answer = (amount * p) / 100;
      const byPercent = amount / p;
      return {
        kind: "number",
        prompt: `What is **${p}% of ${num(amount)}**?`,
        visual: difficulty < 3 && p >= 10 ? percentBar(p, amount) : undefined,
        answer,
        traps: [
          ...(Number.isInteger(byPercent) && byPercent !== answer ? [{ value: byPercent, misconception: M.divide, feedback: `Don't divide by ${p}. Find 10% (÷ 10) or 1% (÷ 100) first, then build up.` }] : []),
          ...(amount - answer !== answer ? [{ value: amount - answer, feedback: `That's the other ${100 - p}%.` }] : []),
        ],
        hint: p === 50 ? "50% is half." : p === 25 ? "25% is a quarter: halve, then halve again." : p === 75 ? "Find 25%, then times by 3." : p === 1 ? "1% is one hundredth: ÷ 100." : "Find 10% first (÷ 10), then build up.",
        explanation: howTo(p, amount),
      };
    },
  },
  {
    key: "pc-sale",
    skill: S.problems,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const p = pick(r, difficulty === 1 ? [50, 10, 25] : difficulty === 2 ? [20, 30, 40] : [15, 35, 5]);
      const step = p % 25 === 0 ? 4 : p % 10 === 0 ? 10 : 20;
      const price = step * int(r, 2, difficulty === 3 ? 12 : 10);
      const off = (price * p) / 100;
      const item = pick(r, ["coat", "bike", "game", "pair of trainers", "scooter", "tent"]);
      const up = difficulty === 3 && r() < 0.4;
      const answer = up ? price + off : price - off;
      return {
        kind: "number",
        prompt: up ? `A **${item}** costs **£${price}**. The price goes up by **${p}%**. What is the new price?` : `A **${item}** costs **£${price}**. In a sale it is **${p}% off**. What is the sale price?`,
        visual: difficulty === 1 ? percentBar(p, price) : undefined,
        answer,
        unit: "£",
        traps: [
          { value: off, misconception: M.discount, feedback: up ? `£${off} is the increase. Add it to the old price.` : `£${off} is how much you save. Take it off the price.` },
          { value: up ? price - off : price + off, feedback: up ? "Goes up means add." : "Off means take away." },
        ].filter((t) => t.value !== answer),
        hint: `Find ${p}% of £${price} first, then ${up ? "add it on" : "take it off"}.`,
        explanation: `${p}% of £${price} is £${num(off)}. £${price} ${up ? "+" : "−"} £${num(off)} = **£${num(answer)}**.`,
      };
    },
  },
  {
    key: "pc-rest",
    skill: S.problems,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const parts = difficulty === 1 ? 1 : 2;
      // Level 3 uses awkward numbers: 100% − 23% − 38%.
      const a = difficulty === 3 ? int(r, 12, 39) : int(r, 3, 7) * 5;
      const b = parts === 2 ? (difficulty === 3 ? int(r, 12, 39) : int(r, 3, 8) * 5) : 0;
      const answer = 100 - a - b;
      const place = pick(r, [
        { intro: "In a class,", a: "of the children walk to school", b: "come by car", rest: "come by bus", q: "What percentage come by bus?" },
        { intro: "In a garden,", a: "of the ground is grass", b: "is flowers", rest: "is a pond", q: "What percentage is the pond?" },
        { intro: "In a survey,", a: "of children chose football", b: "chose swimming", rest: "chose tennis", q: "What percentage chose tennis?" },
        { intro: "On a farm,", a: "of the animals are sheep", b: "are cows", rest: "are hens", q: "What percentage are hens?" },
      ]);
      return {
        kind: "number",
        prompt: b ? `${place.intro} **${a}%** ${place.a}, **${b}%** ${place.b} and the rest ${place.rest}. ${place.q}` : `${place.intro} **${a}%** ${place.a} and the rest ${place.rest}. ${place.q}`,
        visual: { kind: "bar", parts: [{ label: `${a}%`, size: a, tone: "brand" }, ...(b ? [{ label: `${b}%`, size: b, tone: "ok" as const }] : []), { label: "?", size: answer, tone: "num" }], total: "100%" },
        answer,
        unit: "%",
        traps: [{ value: a + b, misconception: M.whole, feedback: "That's the parts you know. The whole is 100%: take them away from 100." }, ...(parts === 2 ? [{ value: 100 - a, misconception: M.whole, feedback: `Take away both parts: ${a}% and ${b}%.` }] : [])].filter((t, i, all) => t.value !== answer && all.findIndex((u) => u.value === t.value) === i),
        hint: "Everything together makes 100%.",
        explanation: `100% − ${a}%${b ? ` − ${b}%` : ""} = **${answer}%**.`,
      };
    },
  },
  {
    key: "pc-biggest",
    skill: S.problems,
    difficulties: [2, 3],
    make: (r) => {
      // Four different amounts, each written a different way. Which is the biggest?
      const pool = [10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90];
      const chosen: number[] = [];
      while (chosen.length < 4) {
        const p = pick(r, pool);
        if (!chosen.includes(p)) chosen.push(p);
      }
      const forms = [(p: number) => `${p}%`, (p: number) => num(p / 100), (p: number) => AS_FRACTION[p], (p: number) => `${p + int(r, 1, 4)}%`];
      const shown = chosen.map((p, i) => ({ value: i === 3 ? Number(forms[3](p).slice(0, -1)) : p, text: i === 3 ? forms[3](p) : forms[i](p) }));
      const best = shown.reduce((m, s) => (s.value > m.value ? s : m));
      return {
        kind: "choose",
        prompt: "Which is the **biggest**?",
        options: [best, ...shown.filter((s) => s !== best)].map((s) => ({ text: s.text, feedback: s === best ? undefined : "Change them all to percentages, then compare." })),
        answer: 0,
        hint: "Change each one into a percentage first.",
        explanation: `As percentages: ${shown.map((s) => `${s.text} = ${s.value}%`).join(", ")}. The biggest is **${best.text}**.`,
      };
    },
  },
];

export const percentages = defineTopic({
  id: T,
  title: "Percentages",
  subtitle: "Per cent means out of 100: percentages as fractions and decimals, percentages of amounts, sales and problems",
  world: "fdp",
  years: [5, 6],
  order: 4,
  icon: "percent",
  skills: [
    { id: S.meaning, title: "What a percent is", description: "Know that per cent means out of 100, and that the whole is 100%.", lessonId: "meaning" },
    { id: S.convert, title: "Percentages, fractions and decimals", description: "Change between percentages, fractions and decimals.", lessonId: "convert" },
    { id: S.amounts, title: "Percentages of amounts", description: "Find 50%, 25%, 10%, 5% and other percentages of an amount.", lessonId: "amounts" },
    { id: S.problems, title: "Percentage problems", description: "Solve sales, price rises and 'the rest' problems, and compare amounts.", lessonId: "problems" },
  ],
  lessonIcons: { meaning: "percent", convert: "puzzle", amounts: "coin", problems: "target" },
  lessons: [
    {
      id: "meaning",
      title: "What is a percent?",
      phase: "Understand",
      summary: "Per cent means out of 100.",
      minutes: 6,
      objectives: ["Know that per cent means out of 100", "Know that the whole is 100%"],
      steps: [
        {
          type: "explain",
          title: "Out of 100",
          body: ["**Per cent** means **out of 100**. This square has 100 small squares.", "**45** are shaded, so **45%** is shaded. The rest is **55%**, because the whole is **100%**."],
          visual: { kind: "grid100", shaded: 45 },
          tip: "45% + 55% = 100%: the whole thing.",
        },
        { type: "check", title: "Your turn", questionId: gen("pc-grid", 1, 3) },
        { type: "check", title: "One more", questionId: gen("pc-grid", 3, 8) },
      ],
    },
    {
      id: "convert",
      title: "Percent, fraction, decimal",
      phase: "Visualise",
      summary: "The same amount, three ways: 50% = {1/2} = 0.5.",
      minutes: 7,
      objectives: ["Write percentages as fractions and decimals", "Know the common ones by heart"],
      steps: [
        {
          type: "explain",
          title: "Three ways to say it",
          body: ["**25% = {25/100} = {1/4} = 0.25**.", "Learn these by heart: **50% = {1/2}**, **25% = {1/4}**, **75% = {3/4}**, **10% = {1/10}**, **20% = {1/5}**."],
          visual: { kind: "grid100", shaded: 25 },
        },
        {
          type: "explain",
          title: "Decimals and percentages",
          body: ["To change a decimal to a percentage, **× 100**: 0.37 = **37%**, and 0.4 = **40%**.", "To change a percentage to a decimal, **÷ 100**: 7% = **0.07**."],
          tip: "0.4 is 40%, not 4%.",
        },
        { type: "check", title: "Your turn", questionId: gen("pc-fraction", 1, 4) },
        { type: "check", title: "One more", questionId: gen("pc-decimal", 1, 6) },
      ],
    },
    {
      id: "amounts",
      title: "Percentages of amounts",
      phase: "Practise",
      summary: "Find 10% by dividing by 10, then build up.",
      minutes: 8,
      objectives: ["Find 50%, 25% and 10% of an amount", "Build other percentages from 10% and 5%"],
      steps: [
        {
          type: "worked",
          title: "Watch me: 30% of 80",
          support: "full",
          problem: "What is **30% of 80**?",
          visual: percentBar(30, 80),
          steps: [{ text: "10% is one tenth, so **80 ÷ 10 = 8**." }, { text: "30% is three lots of 10%: **3 × 8 = 24**." }],
          conclusion: "30% of 80 = **24**.",
        },
        {
          type: "worked",
          title: "Let's do it together",
          support: "faded",
          problem: "What is **15% of 60**?",
          steps: [
            { text: "10% of 60 is 6." },
            { text: "5% is half of 10%.", blank: { prompt: "What is 5% of 60?", answer: 3, hint: "Halve 6.", worked: "Half of 6 is **3**." } },
            { text: "15% = 10% + 5% = 6 + 3." },
          ],
          conclusion: "15% of 60 = **9**.",
        },
        { type: "check", title: "Your turn", questionId: gen("pc-of-amount", 1, 2) },
        { type: "check", title: "One more", questionId: gen("pc-of-amount", 2, 7) },
      ],
    },
    {
      id: "problems",
      title: "Sales and problems",
      phase: "Apply",
      summary: "Find the percentage, then decide: take it off, add it on, or find the rest.",
      minutes: 8,
      objectives: ["Work out sale prices", "Find the rest of a whole"],
      steps: [
        {
          type: "worked",
          title: "Watch me: 20% off",
          support: "full",
          problem: "A coat costs **£60**. In a sale it is **20% off**. What is the sale price?",
          steps: [{ text: "10% of £60 is **£6**, so 20% is **£12**." }, { text: "20% off means take £12 away: **£60 − £12**." }],
          conclusion: "The sale price is **£48**.",
        },
        { type: "check", title: "Your turn", questionId: gen("pc-sale", 1, 5) },
        { type: "check", title: "One more", questionId: gen("pc-rest", 2, 3) },
      ],
    },
  ],
  templates,
  misconceptions: [
    { id: M.denominator, name: "Percent as the bottom number", possibleCause: "It looks like the percentage was used as the denominator.", description: "Thinks 25% = {1/25}, or {1/5} = 5%.", explanation: ["Per cent means out of 100.", "25% = {25/100} = {1/4}."], skills: [S.convert], followUpTemplates: ["pc-fraction"] },
    { id: M.place, name: "Decimal and percent slip", possibleCause: "It looks like the digits moved the wrong number of places.", description: "Thinks 0.4 = 4%, or 7% = 0.7.", explanation: ["Decimal to percent: × 100.", "0.4 = 0.40 = 40%."], skills: [S.meaning, S.convert], followUpTemplates: ["pc-decimal", "pc-grid"] },
    { id: M.divide, name: "Dividing by the percentage", possibleCause: "It looks like the amount was divided by the percentage number.", description: "Works out 20% of 60 as 60 ÷ 20.", explanation: ["Find 10% first: divide by 10.", "Then build up: 20% is two lots of 10%."], skills: [S.amounts], followUpTemplates: ["pc-of-amount"] },
    { id: M.discount, name: "Forgetting to take it off", possibleCause: "It looks like the answer was the discount, not the new price.", description: "Says the sale price of a £60 coat at 20% off is £12.", explanation: ["£12 is how much you save.", "The sale price is £60 − £12 = £48."], skills: [S.problems], followUpTemplates: ["pc-sale"] },
    { id: M.whole, name: "Forgetting the whole is 100%", possibleCause: "It looks like the parts weren't taken away from 100%.", description: "Gives the known parts instead of the rest.", explanation: ["Everything together is 100%.", "The rest = 100% − the parts you know."], skills: [S.meaning, S.problems], followUpTemplates: ["pc-rest", "pc-grid"] },
  ],
  placement: [
    { lessonId: "meaning", template: "pc-grid" },
    { lessonId: "convert", template: "pc-fraction" },
    { lessonId: "amounts", template: "pc-of-amount" },
    { lessonId: "problems", template: "pc-sale" },
  ],
});
