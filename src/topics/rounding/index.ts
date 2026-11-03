import { defineTopic, genFor, int, pick } from "@/topics/kit/define";
import { num } from "@/topics/kit/evaluate";
import type { Template } from "@/topics/kit/types";

/** Rounding and estimating: to the nearest 10, 100, 1,000 and beyond, and sensible estimates. */

const T = "rounding";
const gen = genFor(T);
const S = { ten: `${T}.nearest-10`, hundred: `${T}.nearest-100-1000`, big: `${T}.big-numbers`, estimate: `${T}.estimate` };
const M = { down: `${T}.always-down`, half: `${T}.half-down`, place: `${T}.wrong-place`, exact: `${T}.exact-not-estimate` };

/** Round half up, the way UK schools teach it. */
export const roundTo = (n: number, p: number) => Math.floor(n / p + 0.5) * p;
const PLACE_WORD: Record<number, string> = { 10: "ten", 100: "hundred", 1000: "thousand", 10000: "ten thousand", 100000: "hundred thousand" };

function roundingTraps(n: number, p: number) {
  const right = roundTo(n, p);
  const down = Math.floor(n / p) * p;
  const up = down + p;
  const halfway = n % p === p / 2;
  const traps = [];
  if (down !== right) traps.push({ value: down, misconception: halfway ? M.half : M.down, feedback: halfway ? `${num(n)} is exactly halfway. Halfway always rounds **up**.` : `${num(n)} is nearer to ${num(up)} than to ${num(down)}.` });
  if (up !== right) traps.push({ value: up, feedback: `${num(n)} is nearer to ${num(down)}.` });
  const smaller = p / 10;
  if (smaller >= 10) {
    const wrong = roundTo(n, smaller);
    if (wrong !== right && !traps.some((t) => t.value === wrong)) traps.push({ value: wrong, misconception: M.place, feedback: `That is ${num(n)} to the nearest ${PLACE_WORD[smaller]}. We need the nearest ${PLACE_WORD[p]}.` });
  }
  return traps;
}

const templates: Template[] = [
  {
    key: "rd-10",
    skill: S.ten,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const raw = difficulty === 1 ? int(r, 11, 99) : difficulty === 2 ? int(r, 101, 999) : pick(r, [int(r, 1001, 9999), int(r, 1, 99) * 10 + 5, 995]);
      const n = raw % 10 === 0 ? raw + int(r, 1, 9) : raw; // already a ten would be nothing to round
      const right = roundTo(n, 10);
      const down = Math.floor(n / 10) * 10;
      return {
        kind: "number",
        prompt: `Round **${num(n)}** to the nearest **10**.`,
        visual: difficulty < 3 ? { kind: "line", min: down, max: down + 10, step: 1, labelEvery: 5, points: [{ value: n, label: num(n), tone: "num" }] } : undefined,
        answer: right,
        traps: roundingTraps(n, 10),
        hint: `${num(n)} is between ${num(down)} and ${num(down + 10)}. Which is it nearer to? Look at the ones digit: 5 or more rounds up.`,
        explanation: `The ones digit is ${n % 10}, so ${num(n)} rounds ${right > n ? "up" : "down"} to **${num(right)}**.`,
      };
    },
  },
  {
    key: "rd-which",
    skill: S.ten,
    difficulties: [1, 2],
    make: (r, { difficulty }) => {
      const target = difficulty === 1 ? int(r, 2, 9) * 10 : int(r, 11, 99) * 10;
      const right = target + int(r, -5, 4);
      const options = [right, target + 5, target - 6, target + 11].map((x) => ({
        text: num(x),
        misconception: x === target + 5 ? M.half : undefined,
        feedback: `${num(x)} rounds to ${num(roundTo(x, 10))}.`,
      }));
      return {
        kind: "choose",
        prompt: `Which number rounds to **${num(target)}** to the nearest 10?`,
        options,
        answer: 0,
        hint: `Numbers from ${num(target - 5)} up to ${num(target + 4)} round to ${num(target)}.`,
        explanation: `**${num(right)}** rounds to ${num(target)}. ${num(target + 5)} is halfway, so it rounds up to ${num(target + 10)}.`,
      };
    },
  },
  {
    key: "rd-100",
    skill: S.hundred,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const p = difficulty === 1 ? 100 : pick(r, [100, 1000]);
      const raw = difficulty === 1 ? int(r, 110, 990) : difficulty === 2 ? int(r, 1010, 9990) : pick(r, [9000 + int(r, 950, 999), int(r, 10, 99) * 1000 + 500, int(r, 1001, 9999)]);
      const n = raw % p === 0 ? raw + int(r, 1, 9) * (p / 10) : raw;
      const right = roundTo(n, p);
      const down = Math.floor(n / p) * p;
      return {
        kind: "number",
        prompt: `Round **${num(n)}** to the nearest **${num(p)}**.`,
        visual: difficulty === 1 ? { kind: "line", min: down, max: down + p, step: p / 10, labelEvery: 5, points: [{ value: n, label: num(n), tone: "num" }] } : undefined,
        answer: right,
        traps: roundingTraps(n, p),
        hint: `Look at the digit just right of the ${PLACE_WORD[p]}s: 5 or more rounds up.`,
        explanation: `${num(n)} to the nearest ${num(p)} is **${num(right)}**.`,
      };
    },
  },
  {
    key: "rd-big",
    skill: S.big,
    difficulties: [2, 3],
    make: (r, { difficulty }) => {
      const p = difficulty === 2 ? 10000 : pick(r, [10000, 100000]);
      const n = difficulty === 2 ? int(r, 10001, 99999) : int(r, 100001, 999999);
      const right = roundTo(n, p);
      return {
        kind: "number",
        prompt: `Round **${num(n)}** to the nearest **${num(p)}**.`,
        answer: right,
        traps: roundingTraps(n, p),
        hint: `Find the ${PLACE_WORD[p]}s digit, then look at the digit to its right.`,
        explanation: `${num(n)} to the nearest ${num(p)} is **${num(right)}**.`,
      };
    },
  },
  {
    key: "rd-big-choose",
    skill: S.big,
    difficulties: [2, 3],
    make: (r) => {
      const n = int(r, 100001, 999999);
      const right = roundTo(n, 1000);
      const wrong = [roundTo(n, 10000), roundTo(n, 100), Math.floor(n / 1000) * 1000 === right ? right + 1000 : Math.floor(n / 1000) * 1000].filter((x) => x !== right);
      const unique = [...new Set(wrong)];
      for (let k = 1; unique.length < 3; k++) for (const c of [right + k * 1000, right - k * 1000]) if (unique.length < 3 && c > 0 && c !== right && !unique.includes(c)) unique.push(c);
      return {
        kind: "choose",
        prompt: `What is **${num(n)}** to the nearest **1,000**?`,
        options: [{ text: num(right) }, ...unique.slice(0, 3).map((x) => ({ text: num(x), misconception: x === roundTo(n, 10000) || x === roundTo(n, 100) ? M.place : M.down, feedback: `That isn't ${num(n)} to the nearest 1,000.` }))],
        answer: 0,
        hint: "Find the thousands digit, then look at the hundreds digit.",
        explanation: `${num(n)} to the nearest 1,000 is **${num(right)}**.`,
      };
    },
  },
  {
    key: "rd-estimate",
    skill: S.estimate,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      if (difficulty === 3) {
        const a = int(r, 2, 9) * 10 + pick(r, [-1, 1, -2, 2]);
        const b = int(r, 2, 9) * 10 + pick(r, [-1, 1]);
        const right = roundTo(a, 10) * roundTo(b, 10);
        return {
          kind: "number",
          prompt: `Estimate **${a} × ${b}** by rounding each number to the nearest 10.`,
          answer: right,
          traps: [{ value: a * b, misconception: M.exact, feedback: "That is the exact answer. To estimate, round each number first, then multiply." }],
          hint: `${a} is about ${roundTo(a, 10)} and ${b} is about ${roundTo(b, 10)}.`,
          explanation: `${roundTo(a, 10)} × ${roundTo(b, 10)} = **${num(right)}**, so ${a} × ${b} is about ${num(right)}.`,
        };
      }
      const p = difficulty === 1 ? 10 : 100;
      const a = difficulty === 1 ? int(r, 11, 89) : int(r, 110, 890);
      const b = difficulty === 1 ? int(r, 11, 89) : int(r, 110, 890);
      const add = r() < 0.6 || a < b;
      const right = add ? roundTo(a, p) + roundTo(b, p) : roundTo(a, p) - roundTo(b, p);
      const exact = add ? a + b : a - b;
      return {
        kind: "number",
        prompt: `Estimate **${num(a)} ${add ? "+" : "−"} ${num(b)}** by rounding each number to the nearest ${num(p)}.`,
        answer: right,
        traps: exact !== right ? [{ value: exact, misconception: M.exact, feedback: "That is the exact answer. To estimate, round each number first." }] : [],
        hint: `${num(a)} is about ${num(roundTo(a, p))} and ${num(b)} is about ${num(roundTo(b, p))}.`,
        explanation: `${num(roundTo(a, p))} ${add ? "+" : "−"} ${num(roundTo(b, p))} = **${num(right)}**.`,
      };
    },
  },
  {
    key: "rd-sensible",
    skill: S.estimate,
    difficulties: [2, 3],
    make: (r) => {
      const a = int(r, 2, 8) * 100 + pick(r, [-2, -1, 1, 3]);
      const b = int(r, 2, 8) * 100 + pick(r, [-3, 2, 4]);
      const exact = a + b;
      const est = roundTo(a, 100) + roundTo(b, 100);
      return {
        kind: "choose",
        prompt: `Sam worked out **${num(a)} + ${num(b)}**. Which answer is sensible?`,
        options: [
          { text: num(exact) },
          { text: num(exact + 1000), feedback: `Estimate first: about ${num(est)}. This is far too big.` },
          { text: num(Math.max(1, exact - 900)), feedback: `Estimate first: about ${num(est)}. This is far too small.` },
          { text: num(exact * 10), misconception: M.place, feedback: "That has an extra zero: it is ten times too big." },
        ],
        answer: 0,
        hint: `Round both numbers to the nearest hundred and add: about ${num(est)}.`,
        explanation: `${num(a)} + ${num(b)} is about ${num(est)}, so **${num(exact)}** is sensible.`,
      };
    },
  },
];

export const rounding = defineTopic({
  id: T,
  title: "Rounding and estimating",
  subtitle: "Round to the nearest 10, 100, 1,000 and beyond, and estimate to check your answers",
  world: "number",
  years: [3, 4, 5, 6],
  order: 2,
  icon: "rounding",
  skills: [
    { id: S.ten, title: "Round to the nearest 10", description: "Round any number to the nearest ten, including halfway numbers.", lessonId: "ten" },
    { id: S.hundred, title: "Round to 100 and 1,000", description: "Round to the nearest hundred or thousand, even when a 9 rolls over.", lessonId: "hundred" },
    { id: S.big, title: "Round big numbers", description: "Round numbers up to a million to the nearest 1,000, 10,000 or 100,000.", lessonId: "big" },
    { id: S.estimate, title: "Estimate answers", description: "Round first to estimate, and check if an answer is sensible.", lessonId: "estimate" },
  ],
  lessonIcons: { ten: "rounding", hundred: "mountain", big: "rocket", estimate: "target" },
  lessons: [
    {
      id: "ten",
      title: "Nearest ten",
      phase: "Understand",
      summary: "Which ten is a number nearer to? Halfway goes up.",
      minutes: 6,
      objectives: ["Round a number to the nearest 10", "Round halfway numbers up"],
      steps: [
        {
          type: "explain",
          title: "Which ten is nearer?",
          body: ["**37** is between 30 and 40. It is only 3 away from 40, so **37 rounds to 40**."],
          visual: { kind: "line", min: 30, max: 40, step: 1, labelEvery: 5, points: [{ value: 37, label: "37", tone: "num" }] },
          tip: "Only the ones digit decides: 0 to 4 rounds down, 5 to 9 rounds up.",
        },
        {
          type: "explain",
          title: "Halfway goes up",
          body: ["**35** is exactly halfway between 30 and 40. The rule is: halfway always rounds **up**, so 35 rounds to **40**."],
          visual: { kind: "line", min: 30, max: 40, step: 1, labelEvery: 5, points: [{ value: 35, label: "35", tone: "brand" }] },
        },
        { type: "check", title: "Your turn", questionId: gen("rd-10", 1, 3) },
        { type: "check", title: "One more", questionId: gen("rd-which", 1, 6) },
      ],
    },
    {
      id: "hundred",
      title: "Nearest 100 and 1,000",
      phase: "Visualise",
      summary: "Look at the digit just to the right of the place you are rounding to.",
      minutes: 7,
      objectives: ["Round to the nearest 100 and 1,000", "Handle a 9 that rolls over"],
      steps: [
        {
          type: "explain",
          title: "Look one digit to the right",
          body: ["To round **4,762** to the nearest hundred, look at the **tens** digit: 6. That is 5 or more, so round up: **4,800**."],
          visual: { kind: "line", min: 4700, max: 4800, step: 10, labelEvery: 5, points: [{ value: 4762, label: "4,762", tone: "num" }] },
        },
        {
          type: "worked",
          title: "Let's do it together",
          support: "faded",
          problem: "Round **9,960** to the nearest hundred.",
          steps: [
            { text: "The hundreds digit is 9. The tens digit is 6, so we round up." },
            { text: "9 hundreds plus one more hundred is 10 hundreds: the 9 rolls over to 0 and the thousands go up.", blank: { prompt: "How many thousands now?", answer: 10, hint: "9 thousands, plus one more thousand from the rollover.", worked: "**10** thousands." } },
          ],
          conclusion: "9,960 to the nearest hundred is **10,000**.",
        },
        { type: "check", title: "Your turn", questionId: gen("rd-100", 1, 5) },
        { type: "check", title: "One more", questionId: gen("rd-100", 2, 8) },
      ],
    },
    {
      id: "big",
      title: "Rounding big numbers",
      phase: "Practise",
      summary: "The same rule works for any place, even hundred thousands.",
      minutes: 6,
      objectives: ["Round numbers up to a million", "Choose the right digit to look at"],
      steps: [
        {
          type: "explain",
          title: "Same rule, bigger numbers",
          body: ["Round **368,421** to the nearest 10,000: the ten-thousands digit is 6, and the digit to its right is 8. Round up: **370,000**."],
          visual: { kind: "pv-chart", value: 368421, columns: ["HTh", "TTh", "Th", "H", "T", "O"], highlight: "TTh" },
        },
        { type: "check", title: "Your turn", questionId: gen("rd-big", 2, 4) },
        { type: "check", title: "One more", questionId: gen("rd-big-choose", 2, 9) },
      ],
    },
    {
      id: "estimate",
      title: "Estimate first",
      phase: "Apply",
      summary: "Round the numbers to get a quick answer, then check the real one makes sense.",
      minutes: 7,
      objectives: ["Estimate sums, differences and products", "Spot answers that can't be right"],
      steps: [
        {
          type: "explain",
          title: "A quick answer in your head",
          body: ["**397 + 512** is about **400 + 500 = 900**. The exact answer, 909, is close, so it makes sense."],
          tip: "Estimating catches big mistakes, like a missing or extra zero.",
        },
        {
          type: "worked",
          title: "Watch me estimate",
          support: "full",
          problem: "Estimate **49 × 21**.",
          steps: [{ text: "49 is about **50**." }, { text: "21 is about **20**." }, { text: "50 × 20 = **1,000**." }],
          conclusion: "49 × 21 is about **1,000** (the exact answer is 1,029).",
        },
        { type: "check", title: "Your turn", questionId: gen("rd-estimate", 1, 2) },
        { type: "check", title: "One more", questionId: gen("rd-sensible", 2, 7) },
      ],
    },
  ],
  templates,
  misconceptions: [
    { id: M.down, name: "Always rounding down", possibleCause: "It looks like the number was rounded down when it was nearer the next one up.", description: "Cuts off the digits instead of rounding, e.g. 37 → 30.", explanation: ["Rounding finds the nearest one.", "37 is 3 away from 40 and 7 away from 30, so it rounds to 40."], skills: [S.ten, S.hundred, S.big], followUpTemplates: ["rd-10", "rd-100"] },
    { id: M.half, name: "Rounding halfway down", possibleCause: "It looks like a halfway number was rounded down.", description: "Rounds a 5 down, e.g. 45 → 40.", explanation: ["Halfway numbers always round up.", "45 rounds to 50."], skills: [S.ten, S.hundred], followUpTemplates: ["rd-which", "rd-10"] },
    { id: M.place, name: "Rounding to the wrong place", possibleCause: "It looks like the number was rounded to a different place.", description: "Rounds to the nearest 10 when asked for the nearest 100.", explanation: ["Find the place you're rounding to first.", "Then look only at the digit just to its right."], skills: [S.hundred, S.big, S.estimate], followUpTemplates: ["rd-100", "rd-big-choose"] },
    { id: M.exact, name: "Working out instead of estimating", possibleCause: "It looks like you worked out the exact answer instead of estimating.", description: "Calculates exactly rather than rounding first to estimate.", explanation: ["An estimate rounds each number first.", "397 + 512 is about 400 + 500 = 900."], skills: [S.estimate], followUpTemplates: ["rd-estimate"] },
  ],
  placement: [
    { lessonId: "ten", template: "rd-10" },
    { lessonId: "hundred", template: "rd-100" },
    { lessonId: "big", template: "rd-big" },
    { lessonId: "estimate", template: "rd-estimate" },
  ],
});
