import { defineTopic, genFor, int, pick, withHints } from "@/topics/kit/define";
import { num } from "@/topics/kit/evaluate";
import type { Template } from "@/topics/kit/types";

/** Negative numbers: below zero on thermometers and number lines, ordering, counting through zero, differences. */

const T = "negative";
const gen = genFor(T);
const S = { read: `${T}.read`, order: `${T}.order`, count: `${T}.count-through-zero`, diff: `${T}.difference` };
const M = { sign: `${T}.lost-sign`, bigger: `${T}.bigger-digit-bigger`, diff: `${T}.difference-digits`, wayround: `${T}.wrong-direction` };

const deg = (n: number) => `${num(n)}°C`;

const baseTemplates: Template[] = [
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
  /* D-037 (Phase B): a stretch question for every skill, and a second maker for counting and for differences. */
  {
    key: "ng-read-stretch",
    skill: S.read,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const a = -int(r, 3, 9);
      const top = a + 2 * int(r, 3, 8);
      const half = (a + top) / 2;
      return {
        kind: "number",
        prompt: `On a number line, which number is exactly **halfway** between **${num(a)}** and **${num(top)}**?`,
        visual: { kind: "line", min: a - 1, max: top + 1, step: 1, points: [{ value: a, label: num(a), tone: "num" }, { value: top, label: num(top), tone: "brand" }] },
        answer: half,
        negative: true,
        traps: [{ value: (Math.abs(a) + top) / 2, misconception: M.sign, feedback: "Count the steps between them, then go half of that from one end." }].filter((t) => t.value !== half && Number.isInteger(t.value)),
        hint: `How many steps are there from ${num(a)} to ${num(top)}? Go half of them.`,
        explanation: `There are ${top - a} steps; half is ${(top - a) / 2}. ${num(a)} + ${(top - a) / 2} = **${num(half)}**.`,
      };
    },
  },
  {
    key: "ng-order-stretch",
    skill: S.order,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const vals = [-int(r, 7, 12), -int(r, 1, 6), int(r, 0, 3), -int(r, 13, 20)];
      const asc = [...vals].sort((a, b) => a - b);
      const show = (l: number[]) => l.map(num).join(", ");
      const byDigits = [...vals].sort((a, b) => Math.abs(a) - Math.abs(b));
      return {
        kind: "choose",
        prompt: `Put these temperatures in order, **coldest first**: ${vals.map((v) => deg(v)).join(", ")}.`,
        options: [{ text: show(asc) }, { text: show(byDigits), misconception: M.bigger, feedback: "A bigger number after the minus sign means colder, not warmer." }, { text: show([...asc].reverse()), feedback: "That's warmest first." }].filter((o, i, all) => all.findIndex((x) => x.text === o.text) === i),
        answer: 0,
        hint: "On a number line, the coldest is furthest to the left.",
        explanation: `Coldest first: **${show(asc)}**.`,
      };
    },
  },
  {
    key: "ng-count-steps",
    skill: S.count,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const step = difficulty === 1 ? 1 : pick(r, [2, 5, 10]);
      const start = difficulty === 1 ? int(r, 1, 4) : step * int(r, 1, 3);
      const terms = [0, 1, 2, 3, 4].map((i) => start - i * step);
      return {
        kind: "number",
        prompt: `Count back in **${step}s**: **${terms.slice(0, 4).map(num).join(", ")}, ?**`,
        answer: terms[4]!,
        negative: true,
        traps: [{ value: Math.abs(terms[4]!), misconception: M.sign, feedback: "Once you pass zero, the numbers are negative: write the minus sign." }].filter((t) => t.value !== terms[4]),
        hint: `Take away ${step} from ${num(terms[3]!)}.`,
        explanation: `${num(terms[3]!)} − ${step} = **${num(terms[4]!)}**.`,
      };
    },
  },
  {
    key: "ng-count-stretch",
    skill: S.count,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const start = int(r, 2, 8);
      const fall = int(r, 6, 14);
      const rise = int(r, 2, 9);
      const end = start - fall + rise;
      return {
        kind: "number",
        prompt: `At noon it was **${deg(start)}**. By midnight it had fallen **${fall} degrees**. By 8 a.m. it had risen **${rise} degrees**. What was the temperature at 8 a.m.?`,
        unit: "°C",
        answer: end,
        negative: true,
        traps: [{ value: start - fall, feedback: "Don't stop at midnight: it rose again by 8 a.m." }, { value: Math.abs(start - fall) + rise, misconception: M.sign, feedback: "Midnight was below zero. Count up from there." }].filter((t) => t.value !== end),
        hint: "Find the midnight temperature first. Count through zero carefully.",
        explanation: `${start} − ${fall} = ${num(start - fall)}°C at midnight; + ${rise} = **${num(end)}°C**.`,
      };
    },
  },
  {
    key: "ng-diff-word",
    skill: S.diff,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const low = -int(r, 2, difficulty === 1 ? 6 : 15);
      const high = int(r, 1, difficulty === 1 ? 8 : 25);
      const cityA = pick(r, ["Moscow", "Oslo", "Helsinki"]);
      return {
        kind: "number",
        prompt: `In winter it is **${deg(low)}** in ${cityA} and **${deg(high)}** in London. How many degrees warmer is London?`,
        unit: "°C",
        answer: high - low,
        traps: [{ value: Math.abs(high + low), misconception: M.diff, feedback: `Count up to zero first (${Math.abs(low)} degrees), then on to ${high}: add the two jumps.` }].filter((t) => t.value !== high - low),
        hint: `From ${deg(low)} up to 0, then from 0 up to ${deg(high)}.`,
        explanation: `${Math.abs(low)} + ${high} = **${high - low} degrees**.`,
      };
    },
  },
  {
    key: "ng-diff-stretch",
    skill: S.diff,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const a = -int(r, 2, 9);
      const b = -int(r, 10, 20);
      return {
        kind: "number",
        prompt: `A freezer is at **${deg(b)}**. It warms up to **${deg(a)}**. By how many degrees did it warm up?`,
        unit: "°C",
        answer: a - b,
        traps: [{ value: Math.abs(a) + Math.abs(b), misconception: M.diff, feedback: "Both temperatures are below zero, so don't count through zero: just count up from one to the other." }],
        hint: `Both are negative. Count up from ${deg(b)} to ${deg(a)}.`,
        explanation: `From ${num(b)} to ${num(a)} is **${a - b} degrees**.`,
      };
    },
  },
];

const templates = withHints(baseTemplates, {
  "ng-thermo": () => ["Find zero on the thermometer.", "Below zero, the numbers are negative: count down from zero."],
  "ng-line": () => ["Zero is in the middle. Negatives are to the left.", "Count the steps from zero to the mark."],
  "ng-compare": () => ["On a number line, numbers get bigger to the right.", "−7 is further left than −3, so it is smaller."],
  "ng-coldest": () => ["The coldest temperature is the furthest left on the number line.", "A bigger number after the minus sign means colder."],
  "ng-count": () => ["Count in steps, going through zero.", "After zero, keep counting: −1, −2, −3…"],
  "ng-diff": () => ["Count the jump up to zero, then the jump from zero.", "Add the two jumps."],
  "ng-read-stretch": () => ["Count the steps between the two numbers.", "Go half that many steps from the lower number."],
  "ng-order-stretch": () => ["Draw a number line and place each temperature.", "Read them from left to right."],
  "ng-count-steps": () => ["Keep taking away the same amount.", "When you pass zero, the numbers become negative."],
  "ng-count-stretch": () => ["Work out the midnight temperature.", "Then count up from there."],
  "ng-diff-word": () => ["Count up from the cold city to zero.", "Then from zero to London's temperature. Add the jumps."],
  "ng-diff-stretch": () => ["Both numbers are negative, so you don't pass zero.", "Count up from the colder one to the warmer one."],
});

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
          body: ["Numbers to the **left** of zero are negative. **−1** is just left of zero, **−5** is further left.", "Positive numbers go right from zero and negative numbers go left. The minus sign matters: 5 and −5 are on opposite sides, the same distance from zero."],
          visual: { kind: "line", min: -6, max: 6, step: 1, points: [{ value: -5, label: "−5", tone: "num" }, { value: -1, label: "−1", tone: "brand" }] },
        },
        {
          type: "worked",
          title: "Watch me: read a thermometer",
          support: "full",
          problem: "What temperature does this thermometer show?",
          visual: { kind: "thermo", min: -10, max: 10, value: -6, step: 2 },
          steps: [{ text: "Find **0**. The liquid stops **below** it, so the temperature is negative." }, { text: "Count down from 0 in twos: −2, −4, **−6**." }],
          conclusion: "It shows **−6°C**.",
        },
        {
          type: "worked",
          title: "Together: falling below zero",
          support: "faded",
          problem: "It is **2°C**. The temperature falls **5 degrees**. How cold is it now?",
          visual: { kind: "line", min: -5, max: 5, step: 1, points: [{ value: 2, label: "2", tone: "brand" }], jumps: [{ from: 2, to: 0, label: "2" }, { from: 0, to: -3, label: "3" }] },
          steps: [
            { text: "2 degrees take it down to zero. That leaves 3 more to fall." },
            { text: "Going below zero gives a negative temperature.", blank: { prompt: "How many degrees below zero is it?", answer: 3, hint: "5 − 2", traps: [{ value: 7, misconception: M.wayround, feedback: "The temperature fell, so count down: 2 to zero, then 3 more." }], worked: "**3** below zero: **−3°C**." } },
          ],
          conclusion: "It is now **−3°C**.",
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
          body: ["Is −7 bigger than −3? **No!** −7 is further left, so it is **smaller**: **−7 < −3**.", "−7°C is colder than −3°C.", "Any positive number is bigger than any negative number, and zero is bigger than every negative number."],
          visual: { kind: "line", min: -8, max: 1, step: 1, points: [{ value: -7, label: "−7", tone: "num" }, { value: -3, label: "−3", tone: "brand" }] },
          tip: "Think temperature: minus 7 degrees is colder than minus 3.",
        },
        {
          type: "worked",
          title: "Watch me: order −2, 4, −8",
          support: "full",
          problem: "Put **−2, 4, −8** in order, smallest first.",
          visual: { kind: "line", min: -9, max: 5, step: 1, points: [{ value: -8, label: "−8", tone: "num" }, { value: -2, label: "−2", tone: "num" }, { value: 4, label: "4", tone: "brand" }] },
          steps: [{ text: "Place them on the number line." }, { text: "Read from left to right: **−8, −2, 4**." }],
          conclusion: "Smallest first: **−8, −2, 4**.",
        },
        {
          type: "worked",
          title: "Together: colder, −1°C or −9°C?",
          support: "faded",
          problem: "Which is colder: **−1°C** or **−9°C**?",
          steps: [{ text: "Colder means further left on the number line: further below zero.", blank: { prompt: "How many degrees below zero is the colder one?", answer: 9, hint: "Which is further from zero, below it?", traps: [{ value: 1, misconception: M.bigger, feedback: "−1 is just below zero. −9 is much further below, so it is colder." }], worked: "**9** below zero: **−9°C**." } }],
          conclusion: "**−9°C** is colder.",
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
          type: "explain",
          title: "Zero is just another stop",
          body: ["Counting through zero works like any other counting. Going down from 2: 2, 1, 0, −1, −2.", "Split a big jump at zero. From 4, going down 7: 4 steps take you to zero, then 3 more take you to −3."],
          visual: { kind: "line", min: -4, max: 5, step: 1, points: [{ value: 4, label: "4", tone: "brand" }, { value: -3, label: "−3", tone: "num" }], jumps: [{ from: 4, to: 0, label: "4" }, { from: 0, to: -3, label: "3" }] },
        },
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
            { text: "That used 5 of the 8.", blank: { prompt: "How many more to go?", answer: 3, hint: "8 − 5", traps: [{ value: 13, misconception: M.wayround, feedback: "You've used 5 of the 8 steps; 3 are left." }], worked: "**3** more, so it is 3°C." } },
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
          body: ["From **−4°C** to **6°C**: 4 degrees up to zero, then 6 more. **4 + 6 = 10 degrees**.", "When one temperature is below zero and the other is above it, split the jump at zero and add the two parts. If both are below zero, just count from one to the other."],
          visual: { kind: "line", min: -5, max: 7, step: 1, points: [{ value: -4, label: "−4", tone: "brand" }, { value: 6, label: "6", tone: "num" }], jumps: [{ from: -4, to: 0, label: "4" }, { from: 0, to: 6, label: "6" }] },
          tip: "Don't take 4 away from 6: across zero, the jumps add up.",
        },
        {
          type: "worked",
          title: "Watch me: −7°C to 5°C",
          support: "full",
          problem: "How much warmer is **5°C** than **−7°C**?",
          visual: { kind: "line", min: -8, max: 6, step: 1, points: [{ value: -7, label: "−7", tone: "num" }, { value: 5, label: "5", tone: "brand" }], jumps: [{ from: -7, to: 0, label: "7" }, { from: 0, to: 5, label: "5" }] },
          steps: [{ text: "Up to zero: **7** degrees." }, { text: "Zero to 5: **5** more. 7 + 5 = **12**." }],
          conclusion: "5°C is **12 degrees** warmer.",
        },
        {
          type: "worked",
          title: "Together: −3°C to 8°C",
          support: "faded",
          problem: "How many degrees from **−3°C** to **8°C**?",
          steps: [{ text: "3 up to zero, then 8 more.", blank: { prompt: "3 + 8 = ?", answer: 11, hint: "Add the two jumps.", traps: [{ value: 5, misconception: M.diff, feedback: "8 − 3 ignores the jump through zero. Add the two jumps: 3 + 8." }], worked: "**11** degrees." } }],
          conclusion: "It is **11 degrees** warmer.",
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
