import { decimalText, divideToPlaces, multiplyByWhole, toNumber } from "@/maths/decimal";
import { genFor, int, pick, withAnswer, type TopicExtra } from "@/topics/kit/define";
import type { ChooseOption, Rng, Template } from "@/topics/kit/types";

/**
 * D-038: thousandths (Y5.FRAC.7), multiplying decimals by whole numbers (Y6.FRAC.8) and written division with answers
 * to 2 decimal places (Y6.FRAC.9). All decimal answers come from exact scaled arithmetic (`maths/decimal.ts`).
 */

const T = "decimals";
const gen = genFor(T);
const S = { th: `${T}.thousandths`, mul: `${T}.multiply-decimals`, div: `${T}.divide-decimals` };
const M = { thPlace: `${T}.thousandths-place`, lostPoint: `${T}.lost-point`, remainder: `${T}.remainder-as-decimal`, longer: `${T}.longer-is-bigger` };
const PLACE = ["tenths", "hundredths", "thousandths"] as const;
const d3 = (units: number) => decimalText({ units, places: 3 });
const d2 = (units: number) => decimalText({ units, places: 2 });
/** A plain decimal, with no trailing zeros: 2.10 → 2.1. */
const dn = (units: number, places: number) => String(toNumber({ units, places }));

/** A number with 3 decimal places and no zero digits, such as 4.256. */
function threePlaces(r: Rng): number {
  return int(r, 1, 9) * 1000 + int(r, 1, 9) * 100 + int(r, 1, 9) * 10 + int(r, 1, 9);
}

const templates: Template[] = [
  {
    key: "dc-th-digit",
    skill: S.th,
    difficulties: [1, 2],
    make: (r, { difficulty }) => {
      const units = threePlaces(r);
      const p = difficulty === 1 ? 2 : int(r, 0, 2);
      const digit = Number(String(units)[p + 1]);
      const value = digit * 10 ** (2 - p);
      const answer = toNumber({ units: value, places: 3 });
      return {
        kind: "number",
        prompt: `What is the **${digit}** worth in **${d3(units)}**?`,
        answer,
        decimals: 3,
        traps: [{ value: digit, misconception: M.thPlace, feedback: `The ${digit} is after the decimal point, so it is worth less than 1.` }, ...[0, 1, 2].filter((q) => q !== p).map((q) => ({ value: toNumber({ units: digit * 10 ** (2 - q), places: 3 }), misconception: M.thPlace, feedback: `Count the places after the point: the ${digit} is in the ${PLACE[p]} place.` }))],
        hint: "After the point the places are tenths, hundredths, then thousandths.",
        hints: [`The ${digit} is ${p + 1} place${p ? "s" : ""} after the point: the ${PLACE[p]} place.`, `${digit} ${PLACE[p]} = ${digit}/${10 ** (p + 1)}.`],
        explanation: `The ${digit} is in the **${PLACE[p]}** place, so it is worth ${digit} ${PLACE[p]} = **${String(answer)}**.`,
      };
    },
  },
  {
    key: "dc-th-fraction",
    skill: S.th,
    difficulties: [1, 2],
    make: (r, { difficulty }) => {
      const n = difficulty === 1 ? int(r, 1, 9) : int(r, 11, 99);
      const answer = toNumber({ units: n, places: 3 });
      return {
        kind: "number",
        prompt: `Write **{${n}/1000}** as a decimal.`,
        answer,
        decimals: 3,
        traps: [{ value: toNumber({ units: n, places: 2 }), misconception: M.thPlace, feedback: "That is hundredths. Thousandths need three places after the point." }, { value: toNumber({ units: n, places: 1 }), misconception: M.thPlace, feedback: "That is tenths. Thousandths need three places after the point." }].filter((t) => t.value !== answer),
        hint: "Thousandths fill three places after the decimal point.",
        hints: [n < 10 ? "Fill the tenths and hundredths with zeros first." : "Fill the tenths with a zero first.", `${n} thousandths = ${d3(n)}.`],
        explanation: `${n} thousandths fills three places after the point: **${d3(n)}**.`,
      };
    },
  },
  {
    key: "dc-th-order",
    skill: S.th,
    difficulties: [2, 3],
    make: (r, { difficulty }) => {
      // Four different numbers between 0 and 1 with 1, 2, 3 and 3 decimal places (values in thousandths).
      let values: number[] = [];
      do values = [int(r, 1, 9) * 100, int(r, 1, 99) * 10, int(r, 1, 99) * 10 + int(r, 1, 9), int(r, 1, 99) * 10 + int(r, 1, 9)];
      while (new Set(values).size < 4 || values[1] % 100 === 0);
      const texts = values.map((v) => dn(v, 3));
      const best = Math.max(...values);
      const wrong: ChooseOption[] = texts.filter((_, i) => values[i] !== best).map((x) => ({ text: x, misconception: x.length > texts[values.indexOf(best)].length ? M.longer : undefined, feedback: "Compare the tenths first, then the hundredths, then the thousandths." }));
      const { options, answer } = withAnswer(r, { text: texts[values.indexOf(best)] } as ChooseOption, wrong.slice(0, difficulty === 2 ? 2 : 3));
      return {
        kind: "choose",
        prompt: "Which number is the **largest**?",
        options,
        answer,
        hint: "More digits doesn't mean bigger. Compare the tenths first.",
        hints: ["Write them all with three places: 0.5 is 0.500.", "Then compare them like whole numbers of thousandths."],
        explanation: `As thousandths: ${texts.map((x, i) => `${x} = ${values[i]}`).join(", ")}. The largest is **${texts[values.indexOf(best)]}**.`,
      };
    },
  },
  {
    key: "dc-th-stretch",
    skill: S.th,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const units = int(r, 2, 9) * 100 + pick(r, [5, 25, 50, 75]);
      return {
        kind: "number",
        prompt: `How many **thousandths** make **${dn(units, 3)}**?`,
        answer: units,
        traps: [{ value: Math.round(units / 10), misconception: M.thPlace, feedback: "That counts hundredths. Each hundredth is 10 thousandths." }].filter((t) => Number.isInteger(units / 10) && t.value !== units),
        hint: "Write it with three places after the point.",
        hints: [`${dn(units, 3)} = ${d3(units)}.`, "Read the digits after the point as one whole number of thousandths."],
        explanation: `${dn(units, 3)} = ${d3(units)}, which is **${units}** thousandths.`,
      };
    },
  },
  {
    key: "dc-mul",
    skill: S.mul,
    difficulties: [1, 2],
    make: (r, { difficulty }) => {
      const places = difficulty === 1 ? 1 : 2;
      const units = places === 1 ? int(r, 2, 9) : int(r, 11, 99);
      const k = int(r, 2, 9);
      const prod = multiplyByWhole({ units, places }, k);
      const answer = toNumber(prod);
      return {
        kind: "number",
        prompt: `Work out **${dn(units, places)} × ${k}**.`,
        answer,
        decimals: 2,
        traps: [{ value: units * k, misconception: M.lostPoint, feedback: "Put the decimal point back: the answer has the same number of decimal places as the decimal you started with." }, { value: toNumber({ units: units * k, places: places + 1 }), misconception: M.lostPoint, feedback: `Count the places: ${dn(units, places)} has ${places} decimal place${places === 1 ? "" : "s"}.` }].filter((t) => t.value !== answer),
        hint: `Think of ${dn(units, places)} as ${units} ${places === 1 ? "tenths" : "hundredths"}.`,
        hints: [`${units} × ${k} = ${units * k}.`, `${units * k} ${places === 1 ? "tenths" : "hundredths"} = ${decimalText(prod)}.`],
        explanation: `${dn(units, places)} is ${units} ${places === 1 ? "tenths" : "hundredths"}. ${units} × ${k} = ${units * k}, so the answer is ${units * k} ${places === 1 ? "tenths" : "hundredths"} = **${decimalText(prod)}**.`,
      };
    },
  },
  {
    key: "dc-mul-money",
    skill: S.mul,
    difficulties: [2],
    make: (r) => {
      const pence = int(r, 105, 495);
      const k = int(r, 3, 8);
      const total = pence * k;
      const item = pick(r, ["pen", "notebook", "drink", "ruler"]);
      return {
        kind: "number",
        prompt: `A ${item} costs **£${d2(pence)}**. How much do **${k}** cost?`,
        answer: toNumber({ units: total, places: 2 }),
        unit: "£",
        decimals: 2,
        traps: [{ value: total, misconception: M.lostPoint, feedback: "That is the total in pence. Write it in pounds: divide by 100." }, { value: toNumber({ units: total, places: 3 }), misconception: M.lostPoint, feedback: "Money has 2 decimal places: pounds and pence." }],
        hint: `Change £${d2(pence)} into pence first.`,
        hints: [`£${d2(pence)} = ${pence}p. ${pence} × ${k} = ${total}p.`, `${total}p in pounds is £${d2(total)}.`],
        explanation: `£${d2(pence)} = ${pence}p. ${pence} × ${k} = ${total}p = **£${d2(total)}**.`,
      };
    },
  },
  {
    key: "dc-mul-stretch",
    skill: S.mul,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const bottle = pick(r, [25, 35, 45, 55, 65, 75]);
      const k = int(r, 3, 7);
      const bucket = pick(r, [5, 6, 8]);
      const poured = bottle * k;
      const left = bucket * 100 - poured;
      return {
        kind: "number",
        prompt: `A bucket holds **${bucket} litres**. **${k}** bottles of **${dn(bottle, 2)} litres** are poured in. How many **more litres** fill the bucket?`,
        answer: toNumber({ units: left, places: 2 }),
        unit: "l",
        decimals: 2,
        traps: poured !== left ? [{ value: toNumber({ units: poured, places: 2 }), feedback: "That is how much was poured in. Take it from what the bucket holds." }] : [],
        hint: "First find how much was poured in.",
        hints: [`${dn(bottle, 2)} × ${k} = ${decimalText(multiplyByWhole({ units: bottle, places: 2 }, k))} litres.`, `Then ${bucket} − ${decimalText(multiplyByWhole({ units: bottle, places: 2 }, k))}.`],
        explanation: `Poured in: ${dn(bottle, 2)} × ${k} = ${decimalText(multiplyByWhole({ units: bottle, places: 2 }, k))} l. More needed: ${bucket} − ${decimalText(multiplyByWhole({ units: bottle, places: 2 }, k))} = **${decimalText({ units: left, places: 2 })} l**.`,
      };
    },
  },
  {
    key: "dc-div",
    skill: S.div,
    difficulties: [2, 3],
    make: (r, { difficulty }) => {
      const d = pick(r, difficulty === 2 ? [2, 4, 5] : [4, 8, 20, 25]);
      let n = 0;
      let q = divideToPlaces(1, 1, 2);
      do {
        n = int(r, d + 1, difficulty === 2 ? 40 : 99);
        q = divideToPlaces(n, d, 2);
      } while (n % d === 0 || !q.exact);
      const whole = Math.floor(n / d);
      const rem = n - whole * d;
      const remSlip = Number(`${whole}.${rem}`);
      return {
        kind: "number",
        prompt: `Work out **${n} ÷ ${d}**. Give the answer as a decimal.`,
        answer: toNumber(q),
        decimals: 2,
        traps: remSlip !== toNumber(q) ? [{ value: remSlip, misconception: M.remainder, feedback: `${whole} remainder ${rem} is not ${remSlip}: the remainder ${rem} still has to be divided by ${d}.` }] : [],
        hint: `${n} ÷ ${d} = ${whole} remainder ${rem}. Keep dividing past the decimal point.`,
        hints: [`Write ${n} as ${n}.00 and carry the ${rem} over as ${rem * 10} tenths.`, `${rem} ÷ ${d} = ${decimalText(divideToPlaces(rem, d, 2))}, so add that to ${whole}.`],
        explanation: `${n} ÷ ${d} = ${whole} remainder ${rem}. The ${rem} left over is ${rem} ÷ ${d} = ${decimalText(divideToPlaces(rem, d, 2))}. So ${n} ÷ ${d} = **${decimalText(q)}**.`,
      };
    },
  },
  {
    key: "dc-div-share",
    skill: S.div,
    difficulties: [2],
    make: (r) => {
      const d = pick(r, [4, 5, 8]);
      let pounds = 0;
      do pounds = int(r, d + 1, 50);
      while (pounds % d === 0 || !divideToPlaces(pounds, d, 2).exact);
      const each = divideToPlaces(pounds, d, 2);
      return {
        kind: "number",
        prompt: `**£${pounds}** is shared equally between **${d} friends**. How much does each friend get?`,
        answer: toNumber(each),
        unit: "£",
        decimals: 2,
        traps: [{ value: Math.floor(pounds / d), feedback: "Don't stop at the whole pounds: share the pounds left over as pence too." }],
        hint: `Work out ${pounds} ÷ ${d}.`,
        hints: [`${pounds} ÷ ${d} = ${Math.floor(pounds / d)} remainder ${pounds % d}.`, `Share the £${pounds % d} left over as pence: ${(pounds % d) * 100}p ÷ ${d}.`],
        explanation: `${pounds} ÷ ${d} = ${Math.floor(pounds / d)} remainder ${pounds % d}; £${pounds % d} is ${(pounds % d) * 100}p, and ${(pounds % d) * 100} ÷ ${d} = ${((pounds % d) * 100) / d}p. Each gets **£${decimalText({ units: each.units * 10 ** (2 - each.places), places: 2 })}**.`,
      };
    },
  },
  {
    key: "dc-div-stretch",
    skill: S.div,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      let scores: number[] = [];
      let mean = divideToPlaces(1, 1, 2);
      do {
        scores = Array.from({ length: 4 }, () => int(r, 3, 20));
        mean = divideToPlaces(scores.reduce((a, b) => a + b, 0), 4, 2);
      } while (mean.places === 0);
      const total = scores.reduce((a, b) => a + b, 0);
      return {
        kind: "number",
        prompt: `Four children score **${scores.join(", ")}** in a game. What is the **mean** score? Give it as a decimal.`,
        answer: toNumber(mean),
        decimals: 2,
        traps: [{ value: Number(`${Math.floor(total / 4)}.${total % 4}`), misconception: M.remainder, feedback: `The remainder ${total % 4} still has to be divided by 4.` }, { value: total, feedback: "That is the total. Share it between the 4 children." }].filter((t) => t.value !== toNumber(mean)),
        hint: "Mean = total ÷ how many.",
        hints: [`Total: ${scores.join(" + ")} = ${total}.`, `${total} ÷ 4 = ${Math.floor(total / 4)} remainder ${total % 4}. Keep dividing past the point.`],
        explanation: `Total ${total}. ${total} ÷ 4 = **${decimalText(mean)}**.`,
      };
    },
  },
];

export const decimalsExtra: TopicExtra = {
  skills: [
    { id: S.th, title: "Thousandths", description: "Read, write and order decimals with three places.", lessonId: "thousandths" },
    { id: S.mul, title: "Decimals × whole numbers", description: "Multiply a decimal with up to 2 places by a whole number.", lessonId: "multiply-decimals" },
    { id: S.div, title: "Dividing to decimals", description: "Keep dividing past the point, so answers can have 2 decimal places.", lessonId: "divide-decimals" },
  ],
  lessonIcons: { thousandths: "decimal", "multiply-decimals": "times", "divide-decimals": "divide" },
  lessons: [
    {
      id: "thousandths",
      title: "Thousandths",
      phase: "Understand",
      summary: "One more place after the point: each thousandth is a tenth of a hundredth.",
      minutes: 8,
      objectives: ["Know the value of each digit up to thousandths", "Write thousandths as decimals and order them"],
      steps: [
        {
          type: "explain",
          title: "Three places after the point",
          body: [
            "Split a hundredth into ten equal parts and each part is a **thousandth**: {1/1000}, written **0.001**. In **2.456** the 4 is worth 4 tenths, the 5 is 5 hundredths and the 6 is **6 thousandths**.",
            "So {7/1000} is **0.007**: zeros hold the tenths and hundredths places. To compare decimals, line up the points and compare the tenths first. 0.5 is bigger than 0.456, even though 0.456 has more digits.",
          ],
          visual: { kind: "table", head: ["Digit in 2.456", "Worth"], rows: [["2", "2 ones"], ["4", "4 tenths = 0.4"], ["5", "5 hundredths = 0.05"], ["6", "6 thousandths = 0.006"]] },
          tip: "Write numbers with the same number of places to compare them: 0.5 = 0.500.",
        },
        {
          type: "worked",
          title: "Watch me: {43/1000} as a decimal",
          support: "full",
          problem: "Write **{43/1000}** as a decimal.",
          steps: [{ text: "Thousandths fill three places after the point." }, { text: "43 has two digits, so a zero goes in the tenths place: 0.043." }],
          conclusion: "{43/1000} = **0.043**.",
        },
        {
          type: "worked",
          title: "Let's do it together",
          support: "faded",
          problem: "How many thousandths make **0.045**?",
          steps: [{ text: "Read the three digits after the point as one number.", blank: { prompt: "How many thousandths?", answer: 45, hint: "0.045 = 45 thousandths.", traps: [{ value: 450, misconception: M.thPlace, feedback: "Count the places: 0.045 has a zero in the tenths place, so it is 45 thousandths." }], worked: "0.045 is **45** thousandths." } }],
          conclusion: "0.045 is **45 thousandths**.",
        },
        { type: "check", title: "Your turn", questionId: gen("dc-th-digit", 1, 3) },
        { type: "check", title: "One more", questionId: gen("dc-th-fraction", 1, 5) },
      ],
    },
    {
      id: "multiply-decimals",
      title: "Decimals × whole numbers",
      phase: "Practise",
      summary: "Multiply as whole numbers, then put the point back in the same place.",
      minutes: 8,
      objectives: ["Multiply a decimal by a whole number", "Use it for money and measures"],
      steps: [
        {
          type: "explain",
          title: "Count in hundredths",
          body: [
            "**0.35** is 35 hundredths. So **0.35 × 6** is 35 hundredths × 6 = **210 hundredths**, which is **2.10**, or 2.1. Multiply the digits as a whole number, then give the answer the same number of decimal places as the decimal.",
            "Check with an estimate: 0.35 is about a third, and a third of 6 is 2, so 2.1 makes sense. With money, change to pence first: £1.35 × 4 = 135p × 4 = 540p = £5.40.",
          ],
          visual: { kind: "grid100", shaded: 35 },
          tip: "Estimate first, so a lost decimal point stands out.",
        },
        {
          type: "worked",
          title: "Watch me: 0.8 × 7",
          support: "full",
          problem: "Work out **0.8 × 7**.",
          steps: [{ text: "0.8 is 8 tenths. 8 × 7 = 56." }, { text: "56 tenths = 5.6." }],
          conclusion: "0.8 × 7 = **5.6**.",
        },
        {
          type: "worked",
          title: "Let's do it together",
          support: "faded",
          problem: "Work out **0.35 × 6**.",
          steps: [
            { text: "0.35 is 35 hundredths.", blank: { prompt: "35 × 6 = ?", answer: 210, hint: "30 × 6 + 5 × 6.", traps: [{ value: 180, feedback: "Don't forget the 5: 30 × 6 = 180 and 5 × 6 = 30." }], worked: "35 × 6 = **210**." } },
            { text: "210 hundredths = 2.10 = 2.1." },
          ],
          conclusion: "0.35 × 6 = **2.1**.",
        },
        { type: "check", title: "Your turn", questionId: gen("dc-mul", 1, 3) },
        { type: "check", title: "One more", questionId: gen("dc-mul", 2, 5) },
      ],
    },
    {
      id: "divide-decimals",
      title: "Dividing to decimals",
      phase: "Apply",
      summary: "Don't stop at the remainder: carry on past the decimal point.",
      minutes: 9,
      objectives: ["Divide with answers to 2 decimal places", "Share money exactly"],
      steps: [
        {
          type: "explain",
          title: "Past the point",
          body: [
            "**7 ÷ 4** is 1 remainder 3. But the remainder can be shared too. Write 7 as **7.00**: the 3 left over becomes **30 tenths**, and 30 ÷ 4 = 7 tenths with 2 tenths left. Those 2 tenths are **20 hundredths**, and 20 ÷ 4 = 5 hundredths.",
            "So **7 ÷ 4 = 1.75**. A remainder of 3 is **not** 0.3: it still has to be divided by 4. Sharing £7 between 4 people gives £1.75 each.",
          ],
          visual: { kind: "bar", parts: [{ label: "1.75", tone: "brand" }, { label: "1.75", tone: "brand" }, { label: "1.75", tone: "brand" }, { label: "1.75", tone: "brand" }], total: "7" },
          tip: "Add zeros after the decimal point and keep dividing.",
        },
        {
          type: "worked",
          title: "Watch me: 9 ÷ 2",
          support: "full",
          problem: "Work out **9 ÷ 2** as a decimal.",
          steps: [{ text: "9 ÷ 2 = 4 remainder 1." }, { text: "1 is 10 tenths, and 10 ÷ 2 = 5 tenths." }],
          conclusion: "9 ÷ 2 = **4.5**.",
        },
        {
          type: "worked",
          title: "Let's do it together",
          support: "faded",
          problem: "Work out **13 ÷ 4** as a decimal.",
          steps: [
            { text: "13 ÷ 4 = 3 remainder 1. The 1 is 10 tenths: 10 ÷ 4 = 2 tenths, with 2 tenths left." },
            { text: "2 tenths is 20 hundredths.", blank: { prompt: "20 ÷ 4 = ? hundredths", answer: 5, hint: "4 × 5 = 20.", traps: [{ value: 1, misconception: M.remainder, feedback: "Keep dividing: 20 hundredths ÷ 4 = 5 hundredths." }], worked: "20 ÷ 4 = **5** hundredths, so 13 ÷ 4 = 3.25." } },
          ],
          conclusion: "13 ÷ 4 = **3.25**.",
        },
        { type: "check", title: "Your turn", questionId: gen("dc-div", 2, 3) },
        { type: "check", title: "One more", questionId: gen("dc-div-share", 2, 5) },
      ],
    },
  ],
  templates,
  misconceptions: [
    {
      id: M.thPlace,
      name: "Thousandths in the wrong place",
      possibleCause: "You might have put the digits in the tenths or hundredths place instead of the thousandths.",
      description: "Writes 7 thousandths as 0.7 or 0.07, or reads a thousandths digit as tenths or hundredths.",
      explanation: ["Thousandths fill three places after the point.", "Zeros hold the empty places: 7 thousandths = 0.007."],
      skills: [S.th],
      followUpTemplates: ["dc-th-fraction", "dc-th-digit"],
    },
    {
      id: M.lostPoint,
      name: "Lost the decimal point",
      possibleCause: "You might have multiplied the digits and forgotten to put the point back.",
      description: "Multiplies a decimal by a whole number and gives the answer without (or with a misplaced) decimal point.",
      explanation: ["Multiply the digits as a whole number of tenths or hundredths.", "Then the answer has the same number of decimal places: 35 hundredths × 6 = 210 hundredths = 2.1."],
      skills: [S.mul],
      followUpTemplates: ["dc-mul"],
    },
    {
      id: M.remainder,
      name: "Remainder written as a decimal",
      possibleCause: "You might have written the remainder after the decimal point.",
      description: "Writes 7 ÷ 4 = 1 r 3 as 1.3 instead of dividing the remainder too (1.75).",
      explanation: ["A remainder is still to be shared.", "Carry it on as tenths and hundredths: 3 = 30 tenths, and 30 ÷ 4 = 7 tenths with 2 left."],
      skills: [S.div],
      followUpTemplates: ["dc-div"],
    },
  ],
  placement: [
    { lessonId: "thousandths", template: "dc-th-digit" },
    { lessonId: "multiply-decimals", template: "dc-mul" },
    { lessonId: "divide-decimals", template: "dc-div" },
  ],
};
