import { defineTopic, genFor, int, pick } from "@/topics/kit/define";
import { num } from "@/topics/kit/evaluate";
import type { ChooseOption, Template } from "@/topics/kit/types";

/** Decimals: tenths and hundredths, decimals as fractions, comparing and rounding, adding and subtracting, × and ÷ by 10 and 100. */

const T = "decimals";
const gen = genFor(T);
const S = { place: `${T}.tenths-hundredths`, fractions: `${T}.as-fractions`, compare: `${T}.compare-round`, addSub: `${T}.add-subtract`, tens: `${T}.times-ten` };
const M = { longer: `${T}.longer-is-bigger`, place: `${T}.wrong-place`, align: `${T}.not-lined-up`, digits: `${T}.digits-as-whole`, roundWhole: `${T}.rounding-decimals` };

/** Exact decimal arithmetic in hundredths, so 0.1 + 0.2 is 0.3. */
const h = (x: number) => Math.round(x * 100);
const fromH = (n: number) => n / 100;

function unique(right: string, wrong: ChooseOption[]): ChooseOption[] {
  const out: ChooseOption[] = [{ text: right }];
  for (const w of wrong) if (!out.some((o) => o.text === w.text)) out.push(w);
  return out.slice(0, 4);
}

const templates: Template[] = [
  {
    key: "dc-grid",
    skill: S.place,
    difficulties: [1, 2],
    make: (r, { difficulty }) => {
      const shaded = difficulty === 1 ? int(r, 1, 9) * 10 : int(r, 11, 99);
      const answer = fromH(shaded);
      return {
        kind: "number",
        prompt: "The whole square is **1**. What decimal is shaded?",
        visual: { kind: "grid100", shaded },
        answer,
        decimals: 2,
        traps: [{ value: shaded, misconception: M.digits, feedback: "The whole square is 1, so the shaded part is less than 1: it is hundredths." }, ...(shaded % 10 === 0 ? [] : [{ value: fromH(shaded) * 10, misconception: M.place, feedback: "Each small square is one hundredth: 0.01." }])].filter((t) => Math.abs(t.value - answer) > 1e-9),
        hint: "Each row of ten squares is one tenth (0.1). Each small square is one hundredth (0.01).",
        explanation: `${shaded} hundredths = **${num(answer)}**.`,
      };
    },
  },
  {
    key: "dc-digit-value",
    skill: S.place,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const whole = int(r, 1, difficulty === 3 ? 99 : 9);
      const t = int(r, 1, 9);
      const hd = int(r, 1, 9);
      const n = whole + t / 10 + hd / 100;
      const askTenths = difficulty === 1 || r() < 0.5;
      const d = askTenths ? t : hd;
      const right = askTenths ? `${d} tenths` : `${d} hundredths`;
      return {
        kind: "choose",
        prompt: `In **${n.toFixed(2)}**, what is the **${d}** worth?`,
        visual: difficulty < 3 ? { kind: "pv-chart", value: n, columns: whole >= 10 ? ["T", "O", "t", "h"] : ["O", "t", "h"], highlight: askTenths ? "t" : "h" } : undefined,
        options: unique(right, [
          { text: `${d} ones`, misconception: M.digits, feedback: "It's after the decimal point, so it's worth less than one." },
          { text: askTenths ? `${d} hundredths` : `${d} tenths`, misconception: M.place, feedback: "The first place after the point is tenths, the second is hundredths." },
          { text: `${d} tens`, misconception: M.digits, feedback: "Tens are before the decimal point." },
        ]),
        answer: 0,
        hint: "After the decimal point: first tenths, then hundredths.",
        explanation: `The ${d} is in the ${askTenths ? "tenths" : "hundredths"} place: **${right}** (${askTenths ? `0.${d}` : `0.0${d}`}).`,
      };
    },
  },
  {
    key: "dc-to-fraction",
    skill: S.fractions,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      if (difficulty === 3) {
        const KNOWN = [["0.5", "{1/2}", "{5/100}"], ["0.25", "{1/4}", "{25/10}"], ["0.75", "{3/4}", "{75/10}"], ["0.2", "{1/5}", "{2/100}"], ["0.4", "{2/5}", "{4/100}"]] as const;
        const [dec, frac, slip] = pick(r, KNOWN);
        const others = ["{1/2}", "{1/4}", "{3/4}", "{1/5}", "{1/3}"].filter((x) => x !== frac);
        return {
          kind: "choose",
          prompt: `Which fraction is the same as **${dec}**?`,
          options: unique(frac, [
            { text: slip, misconception: M.place, feedback: "Count the decimal places: one place is tenths, two places are hundredths." },
            ...others.slice(0, 2).map((t) => ({ text: t, feedback: "That's a different amount. Write the decimal as tenths or hundredths first, then simplify." })),
          ]),
          answer: 0,
          hint: "Write it as tenths or hundredths, then simplify.",
          explanation: `${dec} = **${frac}**.`,
        };
      }
      const tenths = difficulty === 1;
      let n = tenths ? int(r, 2, 9) : int(r, 11, 99);
      if (!tenths && n % 10 === 0) n += 1;
      const dec = `0.${n}`;
      const right = tenths ? `{${n}/10}` : `{${n}/100}`;
      return {
        kind: "choose",
        prompt: `Write **${dec}** as a fraction.`,
        options: unique(right, [
          { text: tenths ? `{${n}/100}` : `{${n}/10}`, misconception: M.place, feedback: tenths ? "One decimal place means tenths." : "Two decimal places means hundredths." },
          { text: `{1/${n}}`, misconception: M.digits, feedback: "The digits after the point tell you how many tenths or hundredths." },
          { text: `{${n}/1000}`, misconception: M.place, feedback: "Count the decimal places." },
        ]),
        answer: 0,
        hint: tenths ? "One place after the point is tenths." : "Two places after the point are hundredths.",
        explanation: `${dec} = **${right}**.`,
      };
    },
  },
  {
    key: "dc-from-fraction",
    skill: S.fractions,
    difficulties: [1, 2],
    make: (r, { difficulty }) => {
      const den = difficulty === 1 ? 10 : 100;
      const n = difficulty === 1 ? int(r, 1, 9) : int(r, 11, 99);
      const answer = n / den;
      return {
        kind: "number",
        prompt: `Write **{${n}/${den}}** as a decimal.`,
        answer,
        decimals: 2,
        traps: [{ value: n / (den === 10 ? 100 : 10), misconception: M.place, feedback: den === 10 ? "Tenths: one place after the decimal point." : "Hundredths: two places after the decimal point." }, { value: n, misconception: M.digits, feedback: "It's a fraction of one, so it's less than 1." }].filter((t) => Math.abs(t.value - answer) > 1e-9),
        hint: den === 10 ? `${n} tenths: write ${n} in the first place after the point.` : `${n} hundredths: it fills two places after the point.`,
        explanation: `{${n}/${den}} = **${num(answer)}**.`,
      };
    },
  },
  {
    key: "dc-compare",
    skill: S.compare,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      // Level 1: tenths only. Levels 2 and 3 set the trap: the number with more digits looks bigger (0.45 vs 0.7).
      const whole = difficulty === 3 ? int(r, 1, 9) : 0;
      let a: number;
      let b: number;
      if (difficulty === 1) {
        const ta = int(r, 1, 9);
        const tb = (ta + int(r, 1, 8)) % 10 || 5;
        a = whole + ta / 10;
        b = whole + (tb === ta ? (ta % 9) + 1 : tb) / 10;
      } else {
        const ta = int(r, 2, 9);
        a = whole + ta / 10;
        b = whole + fromH(int(r, 1, ta - 1) * 10 + int(r, 1, 9));
      }
      const [x, y] = r() < 0.5 ? [a, b] : [b, a];
      const xs = num(x);
      const ys = num(y);
      const sign = x > y ? ">" : "<";
      const trap = difficulty > 1;
      return {
        kind: "choose",
        prompt: `Which sign goes in the gap? **${xs} ___ ${ys}**`,
        options: [
          { text: "<", misconception: trap && sign === ">" ? M.longer : undefined, feedback: "Compare the tenths first, then the hundredths." },
          { text: ">", misconception: trap && sign === "<" ? M.longer : undefined, feedback: "Compare the tenths first, then the hundredths." },
        ],
        answer: sign === "<" ? 0 : 1,
        fixedOrder: true,
        hint: "Line up the decimal points. Compare the tenths first. Add a zero if it helps: 0.7 is 0.70.",
        explanation: `${xs} is ${sign === ">" ? "greater" : "less"} than ${ys}, so **${xs} ${sign} ${ys}**.`,
      };
    },
  },
  {
    key: "dc-round",
    skill: S.compare,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const toWhole = difficulty < 3;
      const hundredths = int(r, 1, 98);
      const n = toWhole ? int(r, 1, 30) + int(r, 1, 9) / 10 : int(r, 1, 9) + fromH(hundredths % 10 === 0 ? hundredths + 1 : hundredths);
      const answer = toWhole ? Math.floor(n + 0.5) : Math.floor(n * 10 + 0.5 + 1e-9) / 10;
      const wrong = toWhole ? Math.floor(n) : Math.floor(n * 10) / 10;
      return {
        kind: "number",
        prompt: toWhole ? `Round **${num(n)}** to the nearest **whole number**.` : `Round **${n.toFixed(2)}** to **one decimal place**.`,
        visual: difficulty === 1 ? { kind: "line", min: Math.floor(n), max: Math.floor(n) + 1, step: 0.1, labelEvery: 10, points: [{ value: n, label: num(n), tone: "num" }] } : undefined,
        answer,
        decimals: toWhole ? undefined : 1,
        traps: wrong !== answer ? [{ value: wrong, misconception: M.roundWhole, feedback: toWhole ? "Look at the tenths: 5 or more rounds up." : "Look at the hundredths: 5 or more rounds up." }] : [{ value: answer + (toWhole ? 1 : 0.1), feedback: toWhole ? "The tenths digit is less than 5, so round down." : "The hundredths digit is less than 5, so round down." }],
        hint: toWhole ? "Look at the tenths digit." : "Look at the hundredths digit.",
        explanation: `${toWhole ? num(n) : n.toFixed(2)} rounds to **${num(answer)}**.`,
      };
    },
  },
  {
    key: "dc-add",
    skill: S.addSub,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const tenthsOnly = difficulty === 1;
      let x = tenthsOnly ? int(r, 11, 49) / 10 : fromH(int(r, 101, 999));
      // Level 3 mixes places (3.45 + 2.8), where lining up the digits instead of the points goes wrong.
      let y = tenthsOnly ? int(r, 11, 49) / 10 : difficulty === 2 ? fromH(int(r, 101, 999)) : int(r, 11, 99) / 10;
      if (difficulty === 3 && h(y) % 100 === 0) y = fromH(h(y) + 10);
      const subtract = difficulty > 1 && r() < 0.5;
      if (subtract && y > x) [x, y] = [y, x];
      const answer = subtract ? fromH(h(x) - h(y)) : fromH(h(x) + h(y));
      const slipped = difficulty === 3 ? fromH(subtract ? h(x) - h(y) / 10 : h(x) + h(y) / 10) : null;
      const xs = num(x);
      const ys = num(y);
      return {
        kind: "number",
        prompt: `Work out **${xs} ${subtract ? "−" : "+"} ${ys}**.`,
        answer,
        decimals: 2,
        traps: slipped !== null && Math.abs(slipped - answer) > 1e-9 ? [{ value: slipped, misconception: M.align, feedback: "Line up the decimal points before you add or subtract." }] : [],
        hint: "Line up the decimal points, then work column by column. Fill gaps with 0.",
        explanation: `${xs} ${subtract ? "−" : "+"} ${ys} = **${num(answer)}**.`,
      };
    },
  },
  {
    key: "dc-money",
    skill: S.addSub,
    difficulties: [1, 2],
    make: (r, { difficulty }) => {
      const a = fromH(int(r, 150, 850));
      if (difficulty === 2) {
        const note = a > 5 ? 10 : pick(r, [5, 10]);
        const change = fromH(note * 100 - h(a));
        return {
          kind: "number",
          prompt: `A cinema ticket costs **£${a.toFixed(2)}**. You pay with a **£${note}** note. How much change do you get?`,
          answer: change,
          unit: "£",
          decimals: 2,
          traps: [{ value: fromH(note * 100 + h(a)), feedback: "Change means take the cost away from what you paid." }],
          hint: `Count up from £${a.toFixed(2)} to £${note}, or work out £${note}.00 − £${a.toFixed(2)}.`,
          explanation: `£${note}.00 − £${a.toFixed(2)} = **£${change.toFixed(2)}**.`,
        };
      }
      const b = fromH(int(r, 120, h(a) - 20));
      const total = fromH(h(a) + h(b));
      return {
        kind: "number",
        prompt: `A book costs **£${a.toFixed(2)}** and a pen costs **£${b.toFixed(2)}**. How much do they cost together?`,
        answer: total,
        unit: "£",
        decimals: 2,
        traps: [{ value: fromH(h(a) - h(b)), feedback: "Together means add." }],
        hint: "Line up the decimal points and add. Pounds stay with pounds, pence with pence.",
        explanation: `£${a.toFixed(2)} + £${b.toFixed(2)} = **£${total.toFixed(2)}**.`,
      };
    },
  },
  {
    key: "dc-times-ten",
    skill: S.tens,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const by = difficulty === 1 ? 10 : pick(r, [10, 100]);
      const divide = difficulty === 3 || (difficulty === 2 && r() < 0.5);
      const raw = divide ? int(r, 2, 99) : difficulty === 1 ? int(r, 11, 99) : int(r, 101, 999);
      const n = divide ? raw : (raw % 10 === 0 ? raw + 1 : raw) / (difficulty === 1 ? 10 : 100);
      const answer = divide ? fromH(Math.round((n * 100) / by)) : Math.round(n * by * 100) / 100;
      const wrongBy = by === 10 ? 100 : 10;
      const traps = [
        { value: divide ? n / wrongBy : Math.round(n * wrongBy * 100) / 100, misconception: M.place, feedback: `${divide ? "÷" : "×"} ${by} moves each digit ${by === 10 ? "one place" : "two places"}.` },
        { value: divide ? n * by : n / by, misconception: M.place, feedback: divide ? "Dividing makes the number smaller." : "Multiplying makes the number bigger." },
      ];
      return {
        kind: "number",
        prompt: `**${num(n)} ${divide ? "÷" : "×"} ${by} = ?**`,
        visual: { kind: "pv-chart", value: n, columns: ["H", "T", "O", "t", "h"] },
        answer,
        decimals: 3,
        traps: traps.filter((t) => Math.abs(t.value - answer) > 1e-9),
        hint: `${divide ? "÷" : "×"} ${by}: every digit moves ${by === 10 ? "one place" : "two places"} to the ${divide ? "right" : "left"}.`,
        explanation: `${num(n)} ${divide ? "÷" : "×"} ${by} = **${num(answer)}**.`,
      };
    },
  },
];

export const decimals = defineTopic({
  id: T,
  title: "Decimals",
  subtitle: "Tenths and hundredths, decimals as fractions, comparing, rounding and calculating with decimals",
  world: "fdp",
  years: [4, 5, 6],
  order: 3,
  icon: "decimal",
  skills: [
    { id: S.place, title: "Tenths and hundredths", description: "Know what each digit after the decimal point is worth.", lessonId: "tenths" },
    { id: S.fractions, title: "Decimals and fractions", description: "Write tenths and hundredths as decimals, and decimals as fractions.", lessonId: "fractions" },
    { id: S.compare, title: "Compare and round", description: "Compare and order decimals, and round to the nearest whole or one decimal place.", lessonId: "compare" },
    { id: S.addSub, title: "Add and subtract decimals", description: "Add and subtract decimals by lining up the decimal points, including money.", lessonId: "add-sub" },
    { id: S.tens, title: "× and ÷ by 10 and 100", description: "Multiply and divide decimals by 10 and 100.", lessonId: "times-ten" },
  ],
  lessonIcons: { tenths: "decimal", fractions: "pizza", compare: "scales", "add-sub": "coin", "times-ten": "place-value" },
  lessons: [
    {
      id: "tenths",
      title: "Tenths and hundredths",
      phase: "Understand",
      summary: "Split one whole into 10, then 100 equal parts.",
      minutes: 7,
      objectives: ["Read tenths and hundredths", "Say what each decimal digit is worth"],
      steps: [
        {
          type: "explain",
          title: "Split the whole",
          body: ["This square is **one whole**. Each row is **one tenth: 0.1**. Each tiny square is **one hundredth: 0.01**.", "**37** small squares are shaded: that is **0.37**."],
          visual: { kind: "grid100", shaded: 37 },
        },
        {
          type: "explain",
          title: "Places after the point",
          body: ["In **4.37**, the 3 is **3 tenths** and the 7 is **7 hundredths**."],
          visual: { kind: "pv-chart", value: 4.37, columns: ["O", "t", "h"], highlight: "t" },
          tip: "The decimal point sits between the ones and the tenths.",
        },
        { type: "check", title: "Your turn", questionId: gen("dc-grid", 1, 3) },
        { type: "check", title: "One more", questionId: gen("dc-digit-value", 1, 6) },
      ],
    },
    {
      id: "fractions",
      title: "Decimals are fractions",
      phase: "Visualise",
      summary: "0.3 is three tenths; 0.25 is twenty-five hundredths, which is a quarter.",
      minutes: 7,
      objectives: ["Write decimals as fractions", "Know 0.5, 0.25 and 0.75 by heart"],
      steps: [
        {
          type: "explain",
          title: "Same amount, two ways",
          body: ["**0.3 = {3/10}**, and **0.25 = {25/100} = {1/4}**.", "Learn these by heart: **0.5 = {1/2}**, **0.25 = {1/4}**, **0.75 = {3/4}**."],
          visual: { kind: "grid100", shaded: 25 },
        },
        { type: "check", title: "Your turn", questionId: gen("dc-to-fraction", 1, 2) },
        { type: "check", title: "One more", questionId: gen("dc-from-fraction", 2, 9) },
      ],
    },
    {
      id: "compare",
      title: "Compare and round",
      phase: "Practise",
      summary: "Longer isn't bigger: compare the tenths first.",
      minutes: 7,
      objectives: ["Compare and order decimals", "Round decimals"],
      steps: [
        {
          type: "explain",
          title: "Which is bigger: 0.7 or 0.45?",
          body: ["It's tempting to say 0.45, because 45 is more than 7. But **0.7 is 0.70**: 70 hundredths, more than 45 hundredths.", "So **0.7 > 0.45**."],
          visual: { kind: "line", min: 0, max: 1, step: 0.1, labelEvery: 5, points: [{ value: 0.45, label: "0.45", tone: "brand" }, { value: 0.7, label: "0.7", tone: "num" }] },
          tip: "Line up the decimal points and compare the tenths first.",
        },
        { type: "check", title: "Your turn", questionId: gen("dc-compare", 2, 4) },
        { type: "check", title: "One more", questionId: gen("dc-round", 1, 7) },
      ],
    },
    {
      id: "add-sub",
      title: "Adding decimals",
      phase: "Explore",
      summary: "Line up the decimal points, then add as normal.",
      minutes: 7,
      objectives: ["Add and subtract decimals", "Add amounts of money"],
      steps: [
        {
          type: "worked",
          title: "Watch me line them up",
          support: "full",
          problem: "**3.45 + 2.8**",
          steps: [{ text: "Line up the points. Write 2.8 as **2.80** so both have hundredths." }, { text: "Hundredths: 5 + 0 = 5. Tenths: 4 + 8 = 12: write 2, carry 1." }, { text: "Ones: 3 + 2 + 1 = 6." }],
          conclusion: "3.45 + 2.8 = **6.25**.",
        },
        { type: "check", title: "Your turn", questionId: gen("dc-add", 1, 3) },
        { type: "check", title: "One more", questionId: gen("dc-money", 1, 8) },
      ],
    },
    {
      id: "times-ten",
      title: "× and ÷ by 10 and 100",
      phase: "Apply",
      summary: "The digits move; the decimal point stays still.",
      minutes: 6,
      objectives: ["Multiply and divide decimals by 10 and 100"],
      steps: [
        {
          type: "explain",
          title: "Digits move, the point stays",
          body: ["**3.6 × 10 = 36**: every digit moves one place to the left.", "**36 ÷ 100 = 0.36**: every digit moves two places to the right."],
          visual: { kind: "pv-chart", value: 0.36, columns: ["O", "t", "h"] },
        },
        { type: "check", title: "Your turn", questionId: gen("dc-times-ten", 1, 2) },
        { type: "check", title: "One more", questionId: gen("dc-times-ten", 3, 9) },
      ],
    },
  ],
  templates,
  misconceptions: [
    { id: M.longer, name: "Longer looks bigger", possibleCause: "It looks like the decimal with more digits was taken as bigger.", description: "Thinks 0.45 > 0.7 because 45 > 7.", explanation: ["Compare the tenths first.", "0.7 = 0.70, which is more than 0.45."], skills: [S.compare], followUpTemplates: ["dc-compare"] },
    { id: M.place, name: "Mixing up tenths and hundredths", possibleCause: "It looks like a digit landed in the wrong decimal place.", description: "Reads 0.07 as 7 tenths, or moves digits the wrong number of places.", explanation: ["First place after the point: tenths. Second: hundredths.", "× 10 moves digits one place; × 100 moves them two."], skills: [S.place, S.fractions, S.tens], followUpTemplates: ["dc-digit-value", "dc-times-ten"] },
    { id: M.align, name: "Not lining up the decimal points", possibleCause: "It looks like the numbers were added without lining up the points.", description: "Adds 3.45 + 2.8 as 3.73.", explanation: ["Line up the decimal points first.", "2.8 = 2.80, so tenths go under tenths."], skills: [S.addSub], followUpTemplates: ["dc-add"] },
    { id: M.digits, name: "Reading decimal digits as whole numbers", possibleCause: "It looks like the digits after the point were read as a whole number.", description: "Thinks 0.37 is 37, or the 7 in 4.37 is 7 ones.", explanation: ["Digits after the point are parts of one.", "0.37 is 37 hundredths: less than 1."], skills: [S.place, S.fractions], followUpTemplates: ["dc-grid", "dc-from-fraction"] },
    { id: M.roundWhole, name: "Rounding decimals down", possibleCause: "It looks like the decimal was cut off instead of rounded.", description: "Rounds 4.7 to 4.", explanation: ["Look at the next digit.", "4.7 is nearer 5 than 4."], skills: [S.compare], followUpTemplates: ["dc-round"] },
  ],
  placement: [
    { lessonId: "tenths", template: "dc-digit-value" },
    { lessonId: "fractions", template: "dc-to-fraction" },
    { lessonId: "compare", template: "dc-compare" },
    { lessonId: "add-sub", template: "dc-add" },
    { lessonId: "times-ten", template: "dc-times-ten" },
  ],
});
