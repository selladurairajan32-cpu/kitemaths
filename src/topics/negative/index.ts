import { defineTopic, genFor, int, pick } from "@/topics/kit/define";
import { num } from "@/topics/kit/evaluate";
import type { Template } from "@/topics/kit/types";

/** Negative numbers: below zero on thermometers and number lines, ordering, counting through zero, differences. */

const T = "negative";
const gen = genFor(T);
const S = { read: `${T}.read`, order: `${T}.order`, count: `${T}.count-through-zero`, diff: `${T}.difference` };
const M = { sign: `${T}.lost-sign`, bigger: `${T}.bigger-digit-bigger`, diff: `${T}.difference-digits`, wayround: `${T}.wrong-direction` };

const deg = (n: number) => `${num(n)}°C`;

const templates: Template[] = [
  {
    key: "ng-thermo",
    skill: S.read,
    difficulties: [1, 2],
    make: (r, { difficulty }) => {
      const step = difficulty === 1 ? 2 : 5;
      const min = difficulty === 1 ? -10 : -20;
      const max = difficulty === 1 ? 10 : 20;
      const value = pick(r, Array.from({ length: (0 - min) / step }, (_, i) => min + i * step));
      return {
        kind: "number",
        prompt: "What temperature does the thermometer show?",
        visual: { kind: "thermo", min, max, value, step },
        answer: value,
        unit: "°C",
        negative: true,
        traps: [{ value: -value, misconception: M.sign, feedback: "The reading is **below zero**, so it needs a minus sign." }],
        hint: "Is the red line above or below 0? Below zero means a minus number.",
        explanation: `The thermometer shows **${deg(value)}**: ${num(-value)} degrees below zero.`,
      };
    },
  },
  {
    key: "ng-line",
    skill: S.read,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const step = difficulty === 3 ? 5 : 1;
      const min = difficulty === 1 ? -5 : difficulty === 2 ? -10 : -50;
      const max = difficulty === 1 ? 5 : difficulty === 2 ? 5 : 20;
      const value = pick(r, Array.from({ length: Math.round((0 - min) / step) }, (_, i) => min + i * step));
      return {
        kind: "number",
        prompt: "What number is the arrow pointing to?",
        visual: { kind: "line", min, max, step, labelEvery: difficulty === 3 ? 2 : difficulty === 2 ? 5 : 1, unknown: value },
        answer: value,
        negative: true,
        traps: [{ value: -value, misconception: M.sign, feedback: "It is to the **left** of zero, so it is a negative number." }],
        hint: "Count the jumps from zero. Left of zero is minus.",
        explanation: `The arrow points to **${num(value)}**.`,
      };
    },
  },
  {
    key: "ng-compare",
    skill: S.order,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      let a = -int(r, 1, difficulty === 1 ? 9 : 20);
      let b = difficulty === 1 && r() < 0.4 ? int(r, 0, 9) : -int(r, 1, difficulty === 1 ? 9 : 20);
      if (a === b) b -= 2;
      if (r() < 0.5) [a, b] = [b, a];
      const sign = a > b ? ">" : "<";
      const bothNeg = a < 0 && b < 0;
      return {
        kind: "choose",
        prompt: `Which sign goes in the gap? **${num(a)} ___ ${num(b)}**`,
        visual: { kind: "line", min: Math.min(a, b, 0) - 2, max: Math.max(a, b, 0) + 2, step: 1, labelEvery: Math.max(a, b, 0) - Math.min(a, b, 0) > 14 ? 5 : 1, points: [{ value: a, label: num(a), tone: "brand" }, { value: b, label: num(b), tone: "num" }] },
        options: [
          { text: "<", misconception: bothNeg && sign === ">" ? M.bigger : undefined, feedback: "On a number line, the number further **right** is bigger." },
          { text: ">", misconception: bothNeg && sign === "<" ? M.bigger : undefined, feedback: "On a number line, the number further **right** is bigger." },
        ],
        answer: sign === "<" ? 0 : 1,
        fixedOrder: true,
        hint: "Find both numbers on the line. The one further right is bigger.",
        explanation: `${num(a)} is ${a > b ? "to the right of" : "to the left of"} ${num(b)}, so **${num(a)} ${sign} ${num(b)}**.`,
      };
    },
  },
  {
    key: "ng-coldest",
    skill: S.order,
    difficulties: [2, 3],
    make: (r) => {
      const set = new Set<number>();
      while (set.size < 4) set.add(int(r, -15, 12));
      const temps = [...set];
      const coldest = Math.min(...temps);
      const furthestDigit = temps.filter((t) => t < 0).sort((x, y) => y - x)[0];
      return {
        kind: "choose",
        prompt: "Which temperature is the **coldest**?",
        options: temps.map((t) => ({ text: deg(t), misconception: t === furthestDigit && t !== coldest ? M.bigger : undefined, feedback: `${deg(t)} is warmer than ${deg(coldest)}.` })),
        answer: temps.indexOf(coldest),
        hint: "The coldest is the lowest: the furthest below zero.",
        explanation: `**${deg(coldest)}** is the coldest.`,
      };
    },
  },
  {
    key: "ng-count",
    skill: S.count,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const start = difficulty === 3 ? -int(r, 2, 12) : int(r, 1, difficulty === 1 ? 6 : 15);
      const change = difficulty === 3 ? int(r, 3, 20) : start + int(r, 1, difficulty === 1 ? 5 : 12);
      const rises = difficulty === 3;
      const answer = rises ? start + change : start - change;
      return {
        kind: "number",
        prompt: rises
          ? `It is **${deg(start)}**. The temperature rises by **${change} degrees**. What is it now?`
          : `It is **${deg(start)}**. The temperature falls by **${change} degrees**. What is it now?`,
        visual: { kind: "line", min: Math.min(start, answer) - 1, max: Math.max(start, answer) + 1, step: 1, labelEvery: Math.abs(change) > 12 ? 5 : 1, points: [{ value: start, label: num(start), tone: "brand" }], jumps: [{ from: start, to: answer, label: `${rises ? "+" : "−"}${change}` }] },
        answer,
        unit: "°C",
        negative: true,
        traps: [
          ...(answer !== 0 ? [{ value: -answer, misconception: M.sign, feedback: answer < 0 ? "It went below zero, so the answer needs a minus sign." : "It went above zero, so the answer is positive." }] : []),
          { value: rises ? start - change : start + change, misconception: M.wayround, feedback: rises ? "Rising means going **up**, to the right on the line." : "Falling means going **down**, to the left on the line." },
        ].filter((t) => t.value !== answer),
        hint: rises ? `Count up ${Math.abs(start)} to reach zero, then keep going.` : `Count down ${start} to reach zero, then keep going below.`,
        explanation: `${deg(start)} ${rises ? "+" : "−"} ${change} = **${deg(answer)}**.`,
      };
    },
  },
  {
    key: "ng-diff",
    skill: S.diff,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const low = -int(r, 1, difficulty === 1 ? 6 : 15);
      const high = difficulty === 3 && r() < 0.4 ? -int(r, 0, -low - 1) : int(r, 1, difficulty === 1 ? 8 : 20);
      const answer = high - low;
      const wrong = Math.abs(Math.abs(high) - Math.abs(low));
      return {
        kind: "number",
        prompt: `In the morning it was **${deg(low)}**. In the afternoon it was **${deg(high)}**. How many degrees warmer was the afternoon?`,
        visual: difficulty === 1 ? { kind: "line", min: low - 1, max: high + 1, step: 1, labelEvery: answer > 12 ? 5 : 1, points: [{ value: low, label: num(low), tone: "brand" }, { value: high, label: num(high), tone: "num" }] } : undefined,
        answer,
        unit: "degrees",
        traps: wrong !== answer ? [{ value: wrong, misconception: M.diff, feedback: `Count up from ${deg(low)} to zero first (${-low}), then on to ${deg(high)}.` }] : [],
        hint: `Count up from ${deg(low)} to 0, then from 0 to ${deg(high)}, and add the two jumps.`,
        explanation: high >= 0 ? `${-low} degrees up to zero, then ${high} more: **${answer} degrees**.` : `From ${deg(low)} up to ${deg(high)} is **${answer} degrees**.`,
      };
    },
  },
];

export const negative = defineTopic({
  id: T,
  title: "Negative numbers",
  subtitle: "Numbers below zero: thermometers, number lines, ordering and counting through zero",
  world: "number",
  years: [4, 5, 6],
  order: 3,
  icon: "thermometer",
  skills: [
    { id: S.read, title: "Reading below zero", description: "Read negative numbers on thermometers and number lines.", lessonId: "below-zero" },
    { id: S.order, title: "Comparing negatives", description: "Compare and order numbers that are below zero.", lessonId: "order" },
    { id: S.count, title: "Counting through zero", description: "Count on and back through zero, like temperatures rising and falling.", lessonId: "count" },
    { id: S.diff, title: "Differences across zero", description: "Find the difference between a negative and a positive number.", lessonId: "difference" },
  ],
  lessonIcons: { "below-zero": "thermometer", order: "scales", count: "rocket", difference: "sun" },
  lessons: [
    {
      id: "below-zero",
      title: "Below zero",
      phase: "Understand",
      summary: "Numbers can carry on below zero: we write them with a minus sign.",
      minutes: 6,
      objectives: ["Read negative numbers on a thermometer", "Find negative numbers on a number line"],
      steps: [
        {
          type: "explain",
          title: "Colder than zero",
          body: ["On a cold winter morning the temperature can drop **below zero**. Three degrees below zero is written **−3°C**: minus three."],
          visual: { kind: "thermo", min: -10, max: 10, value: -3, step: 2 },
          tip: "The minus sign tells you the number is below zero.",
        },
        {
          type: "explain",
          title: "The number line keeps going",
          body: ["Numbers to the **left** of zero are negative. **−1** is just left of zero, **−5** is further left."],
          visual: { kind: "line", min: -6, max: 6, step: 1, points: [{ value: -5, label: "−5", tone: "num" }, { value: -1, label: "−1", tone: "brand" }] },
        },
        { type: "check", title: "Your turn", questionId: gen("ng-thermo", 1, 4) },
        { type: "check", title: "One more", questionId: gen("ng-line", 1, 6) },
      ],
    },
    {
      id: "order",
      title: "Which is colder?",
      phase: "Visualise",
      summary: "Further left is smaller, even when the digit looks bigger.",
      minutes: 6,
      objectives: ["Compare negative numbers", "Order temperatures from coldest to warmest"],
      steps: [
        {
          type: "explain",
          title: "Bigger digit, smaller number",
          body: ["Is −7 bigger than −3? **No!** −7 is further left, so it is **smaller**: **−7 < −3**.", "−7°C is colder than −3°C."],
          visual: { kind: "line", min: -8, max: 1, step: 1, points: [{ value: -7, label: "−7", tone: "num" }, { value: -3, label: "−3", tone: "brand" }] },
          tip: "Think temperature: minus 7 degrees is colder than minus 3.",
        },
        { type: "check", title: "Your turn", questionId: gen("ng-compare", 1, 2) },
        { type: "check", title: "One more", questionId: gen("ng-coldest", 2, 5) },
      ],
    },
    {
      id: "count",
      title: "Counting through zero",
      phase: "Explore",
      summary: "Count down to zero, then keep going below.",
      minutes: 7,
      objectives: ["Count back through zero", "Count on from a negative number"],
      steps: [
        {
          type: "worked",
          title: "Watch me count through zero",
          support: "full",
          problem: "It is **4°C**. It falls by **7 degrees**. What is it now?",
          visual: { kind: "line", min: -4, max: 5, step: 1, points: [{ value: 4, label: "4", tone: "brand" }], jumps: [{ from: 4, to: -3, label: "−7" }] },
          steps: [{ text: "Count down 4 to reach zero." }, { text: "That used 4 of the 7. There are 3 more to go." }, { text: "3 below zero is **−3**." }],
          conclusion: "4°C − 7 = **−3°C**.",
        },
        {
          type: "worked",
          title: "Let's do it together",
          support: "faded",
          problem: "It is **−5°C**. It rises by **8 degrees**.",
          steps: [
            { text: "Count up 5 to reach zero." },
            { text: "That used 5 of the 8.", blank: { prompt: "How many more to go?", answer: 3, hint: "8 − 5", worked: "**3** more, so it is 3°C." } },
          ],
          conclusion: "−5°C + 8 = **3°C**.",
        },
        { type: "check", title: "Your turn", questionId: gen("ng-count", 1, 3) },
        { type: "check", title: "One more", questionId: gen("ng-count", 3, 9) },
      ],
    },
    {
      id: "difference",
      title: "How much warmer?",
      phase: "Apply",
      summary: "Jump to zero, then jump on: add the two jumps.",
      minutes: 6,
      objectives: ["Find the difference between a negative and a positive temperature"],
      steps: [
        {
          type: "explain",
          title: "Two jumps",
          body: ["From **−4°C** to **6°C**: 4 degrees up to zero, then 6 more. **4 + 6 = 10 degrees**."],
          visual: { kind: "line", min: -5, max: 7, step: 1, points: [{ value: -4, label: "−4", tone: "brand" }, { value: 6, label: "6", tone: "num" }], jumps: [{ from: -4, to: 0, label: "4" }, { from: 0, to: 6, label: "6" }] },
          tip: "Don't take 4 away from 6: across zero, the jumps add up.",
        },
        { type: "check", title: "Your turn", questionId: gen("ng-diff", 1, 5) },
        { type: "check", title: "One more", questionId: gen("ng-diff", 2, 8) },
      ],
    },
  ],
  templates,
  misconceptions: [
    { id: M.sign, name: "Losing the minus sign", possibleCause: "It looks like the minus sign went missing.", description: "Gives 3 instead of −3 for a number below zero.", explanation: ["Numbers below zero need a minus sign.", "Three below zero is −3."], skills: [S.read, S.count], followUpTemplates: ["ng-thermo", "ng-count"] },
    { id: M.bigger, name: "Thinking −7 is bigger than −3", possibleCause: "It looks like the bigger digit was taken as the bigger number.", description: "Treats −7 as greater than −3 because 7 > 3.", explanation: ["Below zero, the bigger the digit, the smaller the number.", "−7 is colder than −3, so −7 < −3."], skills: [S.order], followUpTemplates: ["ng-compare", "ng-coldest"] },
    { id: M.diff, name: "Subtracting digits across zero", possibleCause: "It looks like the two numbers were taken away instead of counting across zero.", description: "Says the difference between −4 and 6 is 2.", explanation: ["Count up to zero, then on.", "From −4 to 6 is 4 + 6 = 10."], skills: [S.diff], followUpTemplates: ["ng-diff"] },
    { id: M.wayround, name: "Going the wrong way", possibleCause: "It looks like you went up when it should go down, or the other way round.", description: "Adds when the temperature falls, or subtracts when it rises.", explanation: ["Rising means going up (right on the line).", "Falling means going down (left)."], skills: [S.count], followUpTemplates: ["ng-count"] },
  ],
  placement: [
    { lessonId: "below-zero", template: "ng-thermo" },
    { lessonId: "order", template: "ng-compare" },
    { lessonId: "count", template: "ng-count" },
    { lessonId: "difference", template: "ng-diff" },
  ],
});
