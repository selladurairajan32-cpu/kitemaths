import { romanParts, toRoman } from "@/maths/roman";
import { genFor, int, withAnswer, type TopicExtra } from "@/topics/kit/define";
import type { Rng, Template } from "@/topics/kit/types";

/** D-037: Roman numerals (Y4.NPV.9 to 100, Y5.NPV.6 to 1,000 and years). */

const T = "place-value";
const gen = genFor(T);
const SKILL = `${T}.roman`;
const M = { additive: `${T}.roman-additive`, order: `${T}.roman-order` };
const fmt = (n: number) => n.toLocaleString("en-GB");

/** A number up to `max` with a 4 or a 9 in it, so it needs a "one less than" pair such as IV or XC. */
function tricky(r: Rng, max: number): number {
  for (;;) {
    const n = int(r, 4, max);
    if (/[49]/.test(String(n))) return n;
  }
}

/** Written without any "one less than" pairs: 4 as IIII, 90 as LXXXX. */
function additive(n: number): string {
  return toRoman(n).replace(/CM|CD|XC|XL|IX|IV/g, (p) => ({ CM: "DCCCC", CD: "CCCC", XC: "LXXXX", XL: "XXXX", IX: "VIIII", IV: "IIII" })[p as "CM"]);
}
/** The smaller symbol put after the bigger one by mistake: IV as VI. */
const swapped = (n: number) => toRoman(n).replace(/CM|CD|XC|XL|IX|IV/g, (p) => p[1] + p[0]);

const howTo = (n: number) => romanParts(n).map((p) => `${fmt(p.value)} = ${p.numeral}`).join(", ");

const templates: Template[] = [
  {
    key: "pv-roman-read",
    skill: SKILL,
    difficulties: [1, 2],
    make: (r, { difficulty }) => {
      const n = tricky(r, difficulty === 1 ? 100 : 1000);
      const rn = toRoman(n);
      // Reading every symbol as "add" (IV as 6, XC as 110) is the common slip; work that value out by adding.
      const allAdded = [...rn].reduce((a, c) => a + ({ I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 } as Record<string, number>)[c], 0);
      return {
        kind: "number",
        prompt: `What number is **${rn}**?`,
        answer: n,
        traps: allAdded !== n ? [{ value: allAdded, misconception: M.order, feedback: "A smaller symbol before a bigger one means take it away: IV is 5 − 1 = 4." }] : [],
        hint: "Split it into parts: thousands, hundreds, tens, then ones.",
        hints: ["A smaller symbol just before a bigger one is taken away: IX is 9, XC is 90.", `The parts: ${howTo(n)}.`],
        explanation: `${howTo(n)}. Altogether: **${fmt(n)}**.`,
      };
    },
  },
  {
    key: "pv-roman-write",
    skill: SKILL,
    difficulties: [1, 2],
    make: (r, { difficulty }) => {
      const n = tricky(r, difficulty === 1 ? 100 : 1000);
      const right = toRoman(n);
      const wrong: { text: string; misconception?: string; feedback: string }[] = [
        { text: additive(n), misconception: M.additive, feedback: "Roman numerals never use four of the same symbol in a row: 4 is IV, not IIII." },
        { text: swapped(n), misconception: M.order, feedback: "The smaller symbol goes first when it is taken away: 4 is IV, and VI is 6." },
        { text: toRoman(n + 10 <= 1000 ? n + 10 : n - 10), feedback: "Check the tens: that one is 10 out." },
        { text: toRoman(n > 1 ? n - 1 : n + 1), feedback: "Check the ones: that one is 1 out." },
      ].filter((w, i, all) => w.text !== right && all.findIndex((x) => x.text === w.text) === i).slice(0, 3);
      const { options, answer } = withAnswer(r, { text: right, feedback: "" }, wrong);
      return {
        kind: "choose",
        prompt: `Which is **${fmt(n)}** in Roman numerals?`,
        options: options.map((o) => (o.text === right ? { text: o.text } : o)),
        answer,
        hint: "Write it in parts, biggest first.",
        hints: ["4s and 9s use a smaller symbol before a bigger one: IV, IX, XL, XC, CD, CM.", `The parts: ${howTo(n)}.`],
        explanation: `${howTo(n)}, so ${fmt(n)} is **${right}**.`,
      };
    },
  },
  {
    key: "pv-roman-year",
    skill: SKILL,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const year = int(r, 1066, 1999);
      const now = 2026;
      return {
        kind: "number",
        prompt: `A stone above a school door says it was built in **${toRoman(year)}**. How many years before ${now} was that?`,
        answer: now - year,
        traps: [{ value: year, feedback: "That is the year it was built. Now take it from 2026." }],
        hint: "First change the Roman numeral into a number.",
        hints: [`The parts: ${howTo(year)}, so it was built in ${year}.`, `Then work out ${now} − ${year}.`],
        explanation: `${toRoman(year)}: ${howTo(year)}, so ${year}. Then ${now} − ${year} = **${now - year}** years.`,
      };
    },
  },
];

export const romanNumerals: TopicExtra = {
  skills: [{ id: SKILL, title: "Roman numerals", description: "Read and write Roman numerals to 1,000, and years.", lessonId: "roman" }],
  lessonIcons: { roman: "book" },
  lessons: [
    {
      id: "roman",
      title: "Roman numerals",
      phase: "Apply",
      summary: "Seven letters, added up, with one trick for 4s and 9s.",
      minutes: 8,
      objectives: ["Read Roman numerals to 1,000", "Write numbers and years in Roman numerals"],
      steps: [
        {
          type: "explain",
          title: "Seven symbols",
          body: [
            "The Romans used seven letters for numbers: **I = 1, V = 5, X = 10, L = 50, C = 100, D = 500, M = 1,000**. There is no zero and no place value: you add the symbols up, biggest first. **XVI** is 10 + 5 + 1 = 16.",
            "One trick: a smaller symbol just **before** a bigger one is taken away. **IV** is 5 − 1 = 4, **IX** is 9, **XL** is 40, **XC** is 90, **CD** is 400 and **CM** is 900. That is why you never see four of the same symbol in a row.",
          ],
          visual: { kind: "table", head: ["Symbol", "Value"], rows: [["I", "1"], ["V", "5"], ["X", "10"], ["L", "50"], ["C", "100"], ["D", "500"], ["M", "1,000"]] },
          tip: "Split a number into thousands, hundreds, tens and ones, and write each part.",
        },
        {
          type: "worked",
          title: "Watch me: write 1,984",
          support: "full",
          problem: "Write **1,984** in Roman numerals.",
          steps: [{ text: "Split it: 1,000 + 900 + 80 + 4." }, { text: "1,000 = **M**, 900 = **CM**, 80 = **LXXX**, 4 = **IV**." }],
          conclusion: "1,984 is **MCMLXXXIV**.",
        },
        {
          type: "worked",
          title: "Let's do it together",
          support: "faded",
          problem: "What number is **XLIV**?",
          steps: [
            { text: "XL is a smaller symbol before a bigger one: 50 − 10 = 40." },
            { text: "IV is 5 − 1 = 4.", blank: { prompt: "So XLIV is?", answer: 44, hint: "40 + 4.", traps: [{ value: 66, misconception: M.order, feedback: "X before L means take it away: XL is 40, not 60. And IV is 4." }], worked: "40 + 4 = **44**." } },
          ],
          conclusion: "XLIV is **44**.",
        },
        { type: "check", title: "Your turn", questionId: gen("pv-roman-read", 1, 3) },
        { type: "check", title: "One more", questionId: gen("pv-roman-write", 1, 5) },
      ],
    },
  ],
  templates,
  misconceptions: [
    {
      id: M.additive,
      name: "Four symbols in a row",
      possibleCause: "You might have written 4 as IIII, adding instead of taking away.",
      description: "Writes 4s and 9s by repeating symbols (IIII, VIIII) instead of using a smaller symbol before a bigger one.",
      explanation: ["Roman numerals never repeat a symbol four times.", "4 is IV (5 − 1) and 9 is IX (10 − 1); the same works for 40, 90, 400 and 900."],
      skills: [SKILL],
      followUpTemplates: ["pv-roman-write"],
    },
    {
      id: M.order,
      name: "Smaller before bigger means add",
      possibleCause: "You might have added a smaller symbol that comes before a bigger one.",
      description: "Reads IV as 6 or XC as 110: treats a smaller symbol before a bigger one as added, or writes the pair the wrong way round.",
      explanation: ["A smaller symbol before a bigger one is taken away: IV is 4.", "A smaller symbol after a bigger one is added: VI is 6."],
      skills: [SKILL],
      followUpTemplates: ["pv-roman-read"],
    },
  ],
  placement: [{ lessonId: "roman", template: "pv-roman-read" }],
};
