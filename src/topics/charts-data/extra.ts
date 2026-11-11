import { simplify } from "@/maths/fraction";
import { genFor, int, pick, withAnswer, type TopicExtra } from "@/topics/kit/define";
import type { ChooseOption, Rng, Template } from "@/topics/kit/types";

/**
 * D-037: pie charts (Y6.STAT.1). Mode, median and range, and probability, are optional 11+ extensions: they are not in
 * the primary national curriculum (the mean is, and is taught in this island's "mean" lesson).
 */

const T = "charts-data";
const gen = genFor(T);
const S = { pie: `${T}.pie-charts`, averages: `${T}.averages`, probability: `${T}.probability` };
const M = { degrees: `${T}.degrees-as-count`, unsorted: `${T}.median-unsorted`, ratio: `${T}.probability-ratio` };
const fs = (n: number, d: number) => { const s = simplify({ n, d }); return `{${s.n}/${s.d}}`; };

const ACTIVITIES = ["Walk", "Car", "Bus", "Cycle", "Scooter"];

/** Slice angles that are multiples of `unit` degrees and add up to 360. */
function slices(r: Rng, unit: number, count: number): number[] {
  for (;;) {
    const cuts = Array.from({ length: count - 1 }, () => unit * int(r, 1, 360 / unit - 1)).sort((a, b) => a - b);
    const parts = [...cuts, 360].map((c, i, all) => c - (i ? all[i - 1] : 0));
    if (parts.every((p) => p >= unit) && new Set(cuts).size === cuts.length) return parts;
  }
}

const templates: Template[] = [
  {
    key: "cd-pie-read",
    skill: S.pie,
    difficulties: [1, 2],
    make: (r, { difficulty }) => {
      const unit = difficulty === 1 ? 90 : 30;
      const parts = slices(r, unit, difficulty === 1 ? 3 : 4);
      const total = (360 / unit) * int(r, 2, difficulty === 1 ? 10 : 5);
      const i = int(r, 0, parts.length - 1);
      const answer = (parts[i] * total) / 360;
      return {
        kind: "number",
        prompt: `The pie chart shows how **${total} children** get to school. How many children travel by **${ACTIVITIES[i].toLowerCase()}**?`,
        visual: { kind: "pie", slices: parts.map((p, k) => ({ label: `${ACTIVITIES[k]}: ${p}°`, value: p })), total: `${total} children` },
        answer,
        traps: [{ value: parts[i], misconception: M.degrees, feedback: `${parts[i]}° is the size of the slice, not the number of children.` }].filter((t) => t.value !== answer),
        hint: "What fraction of the whole circle is that slice?",
        hints: [`The slice is ${parts[i]}° out of 360°: ${fs(parts[i], 360)} of the circle.`, `${fs(parts[i], 360)} of ${total}.`],
        explanation: `${parts[i]}° out of 360° is ${fs(parts[i], 360)} of the circle. ${fs(parts[i], 360)} of ${total} = **${answer}** children.`,
      };
    },
  },
  {
    key: "cd-pie-angle",
    skill: S.pie,
    difficulties: [2, 3],
    make: (r, { difficulty }) => {
      const total = pick(r, difficulty === 2 ? [12, 18, 20, 36] : [24, 30, 40, 45, 60]);
      const per = 360 / total;
      const count = int(r, 1, total - 1);
      return {
        kind: "number",
        prompt: `A pie chart shows the favourite fruit of **${total} pupils**. **${count}** chose apples. What is the angle of the apples slice?`,
        answer: count * per,
        unit: "°",
        traps: [{ value: count, misconception: M.degrees, feedback: "The slice's angle isn't the number of pupils. Each pupil gets 360° ÷ the total." }, ...(Number.isInteger(360 / count) && 360 / count !== count * per ? [{ value: 360 / count, feedback: `Each pupil gets 360 ÷ ${total} = ${per}°.` }] : [])].filter((t) => t.value !== count * per),
        hint: "The whole circle, 360°, stands for all the pupils.",
        hints: [`Each pupil is 360° ÷ ${total} = ${per}°.`, `${count} pupils: ${count} × ${per}°.`],
        explanation: `360° ÷ ${total} = ${per}° for each pupil. ${count} × ${per}° = **${count * per}°**.`,
      };
    },
  },
  {
    key: "cd-pie-stretch",
    skill: S.pie,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const a = 4 * int(r, 5, 15);
      const b = a * pick(r, [2, 3]);
      const frac = pick(r, [{ n: 1, d: 4, deg: 90 }, { n: 1, d: 2, deg: 180 }]);
      return {
        kind: "number",
        prompt: `Two pie charts show football fans. Pie chart A is about **${a}** children and pie chart B is about **${b}** children. In both, football is a **${frac.deg}°** slice. How many **more** children choose football in B than in A?`,
        answer: ((b - a) * frac.n) / frac.d,
        traps: [{ value: 0, feedback: "The slices are the same size, but the totals are different, so the numbers are different." }],
        hint: "The same angle means the same fraction, not the same number.",
        hints: [`${frac.deg}° is ${fs(frac.deg, 360)} of the circle.`, `A: ${fs(frac.deg, 360)} of ${a} = ${(a * frac.n) / frac.d}. B: ${fs(frac.deg, 360)} of ${b} = ${(b * frac.n) / frac.d}.`],
        explanation: `${frac.deg}° is ${fs(frac.deg, 360)}. A: ${(a * frac.n) / frac.d}, B: ${(b * frac.n) / frac.d}. Difference: **${((b - a) * frac.n) / frac.d}**.`,
      };
    },
  },
  {
    key: "cd-median",
    skill: S.averages,
    difficulties: [1, 2],
    make: (r, { difficulty }) => {
      const n = difficulty === 1 ? 5 : 7;
      let values: number[] = [];
      do values = Array.from({ length: n }, () => int(r, 1, difficulty === 1 ? 20 : 60));
      while (new Set(values).size < n || values[(n - 1) / 2] === [...values].sort((a, b) => a - b)[(n - 1) / 2]);
      const sorted = [...values].sort((a, b) => a - b);
      const median = sorted[(n - 1) / 2];
      return {
        kind: "number",
        prompt: `Find the **median** of these numbers: **${values.join(", ")}**.`,
        answer: median,
        traps: [{ value: values[(n - 1) / 2], misconception: M.unsorted, feedback: "Put the numbers in order first, then find the middle one." }],
        hint: "The median is the middle number once they are in order.",
        hints: [`In order: ${sorted.join(", ")}.`, `There are ${n} numbers, so the middle one is number ${(n + 1) / 2}.`],
        explanation: `In order: ${sorted.join(", ")}. The middle one is **${median}**.`,
      };
    },
  },
  {
    key: "cd-mode-range",
    skill: S.averages,
    difficulties: [1, 2],
    make: (r, { difficulty }) => {
      const base = Array.from({ length: difficulty === 1 ? 5 : 7 }, () => int(r, 2, difficulty === 1 ? 15 : 40));
      const unique = [...new Set(base)];
      if (r() < 0.5 && unique.length >= 3) {
        const mode = unique[0];
        const values = [...unique.slice(1), mode, mode, mode].sort(() => r() - 0.5);
        return {
          kind: "number",
          prompt: `Find the **mode** of these numbers: **${values.join(", ")}**.`,
          answer: mode,
          traps: [{ value: values.length, feedback: "The mode is the number that appears most often, not how many numbers there are." }].filter((t) => t.value !== mode),
          hint: "The mode is the most common number.",
          hints: ["Count how many times each number appears.", `${mode} appears 3 times.`],
          explanation: `${mode} appears 3 times, more than any other number, so the mode is **${mode}**.`,
        };
      }
      const values = base;
      const [lo, hi] = [Math.min(...values), Math.max(...values)];
      const answer = hi - lo;
      return {
        kind: "number",
        prompt: `Find the **range** of these numbers: **${values.join(", ")}**.`,
        answer,
        traps: [{ value: hi, feedback: "The range is the biggest take away the smallest." }, { value: values[values.length - 1] - values[0], feedback: "Use the biggest and smallest numbers, not the first and last." }].filter((t) => t.value !== answer && t.value >= 0),
        hint: "Range = biggest − smallest.",
        hints: [`The biggest is ${hi} and the smallest is ${lo}.`, `${hi} − ${lo}.`],
        explanation: `Biggest ${hi}, smallest ${lo}: ${hi} − ${lo} = **${answer}**.`,
      };
    },
  },
  {
    key: "cd-averages-stretch",
    skill: S.averages,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      // Six numbers whose two middle numbers add to an even total, so the median is whole.
      let values: number[] = [];
      let sorted: number[] = [];
      do {
        values = Array.from({ length: 6 }, () => int(r, 1, 50));
        sorted = [...values].sort((a, b) => a - b);
      } while (new Set(values).size < 6 || (sorted[2] + sorted[3]) % 2 !== 0);
      const median = (sorted[2] + sorted[3]) / 2;
      return {
        kind: "number",
        prompt: `Find the **median** of these six numbers: **${values.join(", ")}**.`,
        answer: median,
        traps: [{ value: sorted[2], misconception: M.unsorted, feedback: "With six numbers there are two middle ones. The median is halfway between them." }, { value: sorted[3], feedback: "With six numbers there are two middle ones. The median is halfway between them." }].filter((t) => t.value !== median),
        hint: "Put them in order. With an even count there are two middle numbers.",
        hints: [`In order: ${sorted.join(", ")}. The middle two are ${sorted[2]} and ${sorted[3]}.`, `Halfway between: (${sorted[2]} + ${sorted[3]}) ÷ 2.`],
        explanation: `In order: ${sorted.join(", ")}. The middle two are ${sorted[2]} and ${sorted[3]}; halfway is (${sorted[2]} + ${sorted[3]}) ÷ 2 = **${median}**.`,
      };
    },
  },
  {
    key: "cd-prob-word",
    skill: S.probability,
    difficulties: [1],
    make: (r) => {
      const red = int(r, 0, 10);
      const blue = 10 - red;
      const word = red === 0 ? "Impossible" : red === 10 ? "Certain" : red === 5 ? "Even chance" : red < 5 ? "Unlikely" : "Likely";
      const words = ["Impossible", "Unlikely", "Even chance", "Likely", "Certain"];
      return {
        kind: "choose",
        prompt: `A bag has **${red} red** and **${blue} blue** counters. You pick one without looking. How likely is it to be **red**?`,
        options: words.map((w) => (w === word ? { text: w } : { text: w, feedback: `There are ${red} red out of 10. Compare that with half (5 out of 10).` })),
        answer: words.indexOf(word),
        fixedOrder: true,
        hint: "Compare the red counters with half of all the counters.",
        hints: ["None red is impossible; all red is certain; half red is an even chance.", `${red} out of 10 is ${red < 5 ? "less" : red > 5 ? "more" : "exactly"} than half.`],
        explanation: `${red} out of 10 counters are red, so picking red is **${word.toLowerCase()}**.`,
      };
    },
  },
  {
    key: "cd-prob-fraction",
    skill: S.probability,
    difficulties: [2],
    make: (r) => {
      // Different numbers of each colour, so the chance of blue is always a different wrong option.
      const red = int(r, 1, 7);
      const blue = (red + int(r, 1, 6) - 1) % 7 + 1;
      const total = red + blue;
      const right = fs(red, total);
      const wrong: ChooseOption[] = [
        { text: fs(red, blue), misconception: M.ratio, feedback: `Compare red with all the counters (${total}), not with the blue ones.` },
        { text: fs(blue, total), feedback: "That is the chance of blue." },
        { text: `{1/${total}}`, feedback: `There are ${red} red counters, so ${red} ways to pick red.` },
      ].filter((w, i, all) => w.text !== right && all.findIndex((x) => x.text === w.text) === i && !/^\{(\d+)\/1\}$/.test(w.text) && !/^\{1\/1\}$/.test(w.text));
      const { options, answer } = withAnswer(r, { text: right } as ChooseOption, wrong);
      return {
        kind: "choose",
        prompt: `A bag has **${red} red** and **${blue} blue** counters. What is the probability of picking **red**?`,
        options,
        answer,
        hint: "Probability = the number of ways it can happen ÷ the number of things altogether.",
        hints: [`There are ${red} red counters and ${total} counters altogether.`, `${red} out of ${total}, simplified if you can.`],
        explanation: `${red} red out of ${total} counters: the probability is **${right}**.`,
      };
    },
  },
  {
    key: "cd-prob-stretch",
    skill: S.probability,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const sections = pick(r, [4, 5, 8, 10]);
      const red = int(r, 1, sections - 1);
      const spins = sections * int(r, 3, 12);
      const expected = (spins / sections) * red;
      return {
        kind: "number",
        prompt: `A spinner has **${sections} equal sections**; **${red}** are red. It is spun **${spins} times**. About how many times would you **expect** it to land on red?`,
        answer: expected,
        traps: [{ value: red, feedback: `${red} is the number of red sections. Find ${fs(red, sections)} of ${spins} spins.` }, { value: spins / sections, feedback: `That is for one red section. There are ${red}.` }].filter((t) => t.value !== expected),
        hint: "What fraction of the spinner is red?",
        hints: [`Red is ${fs(red, sections)} of the spinner.`, `${fs(red, sections)} of ${spins}: ${spins} ÷ ${sections} × ${red}.`],
        explanation: `Red is ${fs(red, sections)} of the spinner. ${spins} ÷ ${sections} = ${spins / sections}, × ${red} = **${expected}** times. In real spins it could be a few more or fewer.`,
      };
    },
  },
];

export const chartsDataExtra: TopicExtra = {
  skills: [
    { id: S.pie, title: "Pie charts", description: "Read and work out the slices of a pie chart.", lessonId: "pie" },
    { id: S.averages, title: "Mode, median and range (11+ extension)", description: "Optional, beyond the national curriculum: the most common, the middle, and the spread.", lessonId: "averages" },
    { id: S.probability, title: "Probability (11+ extension)", description: "Optional, beyond the national curriculum: how likely something is, as words and fractions.", lessonId: "probability" },
  ],
  lessonIcons: { pie: "pizza", averages: "chart", probability: "dice" },
  lessons: [
    {
      id: "pie",
      title: "Pie charts",
      phase: "Visualise",
      summary: "The whole circle, 360°, is everything; each slice is a fraction of it.",
      minutes: 8,
      objectives: ["Read a pie chart as fractions of a total", "Work out the angle of a slice"],
      steps: [
        {
          type: "explain",
          title: "Slices of 360°",
          body: [
            "A **pie chart** shows how a whole is shared out. The whole circle is **360°** and stands for everyone asked. In this chart of 40 children, the walking slice is 180°, half the circle, so **20 children** walk.",
            "To find how many a slice stands for, work out its **fraction of 360°**, then find that fraction of the total. To draw a slice, go the other way: each person gets **360° ÷ the total**.",
          ],
          visual: { kind: "pie", slices: [{ label: "Walk: 180°", value: 180 }, { label: "Car: 90°", value: 90 }, { label: "Bus: 90°", value: 90 }], total: "40 children" },
          tip: "A right angle in the middle is a quarter of everyone.",
        },
        {
          type: "worked",
          title: "Watch me: a 120° slice",
          support: "full",
          problem: "A pie chart shows **60 people**. How many does a **120°** slice stand for?",
          steps: [{ text: "120° out of 360° is {1/3} of the circle." }, { text: "{1/3} of 60 = 20." }],
          conclusion: "The slice stands for **20 people**.",
        },
        {
          type: "worked",
          title: "Let's do it together",
          support: "faded",
          problem: "A pie chart shows **36 pupils**. **9** chose swimming. What angle is the swimming slice?",
          steps: [
            { text: "Each pupil gets 360° ÷ 36 = 10°." },
            { text: "9 pupils chose swimming.", blank: { prompt: "Angle in degrees?", answer: 90, hint: "9 × 10°.", traps: [{ value: 9, misconception: M.degrees, feedback: "9 is the number of pupils. Each pupil is 10°: 9 × 10°." }], worked: "9 × 10° = **90**°." } },
          ],
          conclusion: "The swimming slice is **90°**.",
        },
        { type: "check", title: "Your turn", questionId: gen("cd-pie-read", 1, 3) },
        { type: "check", title: "One more", questionId: gen("cd-pie-angle", 2, 5) },
      ],
    },
    {
      id: "averages",
      title: "Mode, median and range (11+ extension)",
      phase: "Explore",
      summary: "Optional, beyond the national curriculum: the most common, the middle, and the spread.",
      minutes: 8,
      objectives: ["Find the mode and the median", "Find the range"],
      steps: [
        {
          type: "explain",
          title: "Three more ways to sum up numbers",
          body: [
            "This lesson is an **optional 11+ extension**: the mean is in the national curriculum, but some 11+ papers also ask for these. The **mode** is the number that appears **most often**. The **median** is the **middle** number once the numbers are **in order**.",
            "The **range** is the **biggest take away the smallest**: it shows how spread out the numbers are. For 3, 7, 7, 9, 14: the mode is 7, the median is 7, and the range is 14 − 3 = 11.",
          ],
          visual: { kind: "table", head: ["For 3, 7, 7, 9, 14", "Answer"], rows: [["Mode (most often)", "7"], ["Median (middle)", "7"], ["Range (biggest − smallest)", "11"]] },
          tip: "Always put the numbers in order before finding the median.",
        },
        {
          type: "worked",
          title: "Watch me: the median of 12, 5, 9, 20, 6",
          support: "full",
          problem: "Find the **median** of 12, 5, 9, 20, 6.",
          steps: [{ text: "In order: 5, 6, 9, 12, 20." }, { text: "5 numbers, so the middle is the 3rd one: 9." }],
          conclusion: "The median is **9**.",
        },
        {
          type: "worked",
          title: "Let's do it together",
          support: "faded",
          problem: "Find the **range** of 18, 4, 11, 25, 9.",
          steps: [{ text: "The biggest is 25 and the smallest is 4.", blank: { prompt: "Range?", answer: 21, hint: "25 − 4.", traps: [{ value: 7, feedback: "Use the biggest and smallest, not the first and last: 25 − 4." }], worked: "25 − 4 = **21**." } }],
          conclusion: "The range is **21**.",
        },
        { type: "check", title: "Your turn", questionId: gen("cd-median", 1, 3) },
        { type: "check", title: "One more", questionId: gen("cd-mode-range", 1, 5) },
      ],
    },
    {
      id: "probability",
      title: "Probability (11+ extension)",
      phase: "Apply",
      summary: "Optional, beyond the national curriculum: how likely, from impossible to certain.",
      minutes: 8,
      objectives: ["Describe how likely something is in words", "Write a probability as a fraction"],
      steps: [
        {
          type: "explain",
          title: "From impossible to certain",
          body: [
            "This lesson is an **optional 11+ extension**: probability isn't in the primary national curriculum, but some 11+ papers include it. **Probability** says how likely something is: **impossible**, **unlikely**, **even chance**, **likely** or **certain**.",
            "As a fraction: the number of ways it can happen **out of** the number of things altogether. A bag with 3 red and 5 blue counters has 8 counters, so the probability of red is **{3/8}**. It is not {3/5}: compare red with all the counters, not with the blue ones.",
          ],
          visual: { kind: "pie", slices: [{ label: "Red: 3", value: 3 }, { label: "Blue: 5", value: 5 }], total: "8 counters" },
          tip: "Probability 0 is impossible and 1 is certain.",
        },
        {
          type: "worked",
          title: "Watch me: a fair dice",
          support: "full",
          problem: "What is the probability of rolling an **even number** on a fair 1 to 6 dice?",
          steps: [{ text: "The even numbers are 2, 4 and 6: 3 ways." }, { text: "There are 6 numbers altogether: {3/6} = {1/2}." }],
          conclusion: "The probability is **{1/2}**: an even chance.",
        },
        {
          type: "worked",
          title: "Let's do it together",
          support: "faded",
          problem: "A spinner has **4** equal sections; **1** is green. It is spun **20** times. About how many greens would you expect?",
          steps: [{ text: "Green is {1/4} of the spinner.", blank: { prompt: "About how many greens?", answer: 5, hint: "{1/4} of 20.", traps: [{ value: 1, feedback: "1 is the number of green sections. Find {1/4} of 20 spins." }], worked: "{1/4} of 20 = **5**." } }],
          conclusion: "Expect about **5** greens.",
        },
        { type: "check", title: "Your turn", questionId: gen("cd-prob-word", 1, 3) },
        { type: "check", title: "One more", questionId: gen("cd-prob-fraction", 2, 5) },
      ],
    },
  ],
  templates,
  misconceptions: [
    {
      id: M.degrees,
      name: "Degrees read as a count",
      possibleCause: "You might have read the slice's angle as the number of people.",
      description: "Gives a pie chart slice's angle in degrees as the number it stands for, or the reverse.",
      explanation: ["The whole circle (360°) stands for the whole total.", "A slice stands for its fraction of 360° of the total."],
      skills: [S.pie],
      followUpTemplates: ["cd-pie-read", "cd-pie-angle"],
    },
    {
      id: M.unsorted,
      name: "Median without ordering",
      possibleCause: "You might have taken the middle number before putting them in order.",
      description: "Gives the middle number of an unordered list as the median.",
      explanation: ["Put the numbers in order first.", "With an even count, the median is halfway between the two middle numbers."],
      skills: [S.averages],
      followUpTemplates: ["cd-median"],
    },
    {
      id: M.ratio,
      name: "Probability compares the two colours",
      possibleCause: "You might have compared red with blue instead of with all the counters.",
      description: "Writes the probability of red as red ÷ blue (a ratio) instead of red ÷ total.",
      explanation: ["Probability = ways it can happen ÷ everything that could happen.", "3 red and 5 blue: 3 out of 8, not 3 out of 5."],
      skills: [S.probability],
      followUpTemplates: ["cd-prob-fraction"],
    },
  ],
  placement: [
    { lessonId: "pie", template: "cd-pie-read" },
    { lessonId: "averages", template: "cd-median" },
    { lessonId: "probability", template: "cd-prob-word" },
  ],
};
