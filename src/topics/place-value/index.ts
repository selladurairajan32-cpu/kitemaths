import { defineTopic, genFor, int, pick, withHints } from "@/topics/kit/define";
import { num } from "@/topics/kit/evaluate";
import type { PlaceColumn, Template, Rng } from "@/topics/kit/types";
import { PLACE, digitIn } from "@/maths/place-value";
import { numberWords } from "@/topics/kit/words";

/** Place value: what each digit is worth, reading and writing big numbers, partitioning, comparing. */

const T = "place-value";
const gen = genFor(T);
const S = {
  digit: `${T}.digit-value`,
  words: `${T}.read-write`,
  part: `${T}.partition`,
  compare: `${T}.compare-order`,
  more: `${T}.more-less`,
};
const M = {
  face: `${T}.face-value`,
  zero: `${T}.zero-holder`,
  concat: `${T}.concat`,
  length: `${T}.length`,
  column: `${T}.wrong-column`,
};

const COLUMNS: PlaceColumn[] = ["M", "HTh", "TTh", "Th", "H", "T", "O"];
const NAME: Record<PlaceColumn, string> = { M: "millions", HTh: "hundred thousands", TTh: "ten thousands", Th: "thousands", H: "hundreds", T: "tens", O: "ones", t: "tenths", h: "hundredths" };
const columnsFor = (n: number) => COLUMNS.slice(COLUMNS.length - Math.max(3, String(n).length));

/** A number with `digits` digits and no zero in the first place. */
function numberWith(r: Rng, digits: number, allowZeros = true): number {
  let s = String(int(r, 1, 9));
  for (let i = 1; i < digits; i++) s += String(allowZeros ? int(r, 0, 9) : int(r, 1, 9));
  return Number(s);
}

const baseTemplates: Template[] = [
  {
    key: "pv-blocks",
    skill: S.digit,
    difficulties: [1],
    make: (r) => {
      const h = int(r, 1, 4);
      const t = int(r, 0, 9);
      const o = int(r, 0, 9);
      const n = h * 100 + t * 10 + o;
      return {
        kind: "number",
        prompt: "What number do these blocks make?",
        visual: { kind: "blocks", hundreds: h, tens: t, ones: o },
        answer: n,
        traps: t === 0 ? [{ value: h * 10 + o, misconception: M.zero, feedback: "There are no tens, so the tens place needs a **0** to hold it." }] : [],
        hint: "Count the hundreds squares, then the tens rods, then the ones cubes.",
        explanation: `${h} hundreds, ${t} tens and ${o} ones make **${num(n)}**.`,
      };
    },
  },
  {
    key: "pv-digit-value",
    skill: S.digit,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const len = difficulty === 1 ? 3 : difficulty === 2 ? int(r, 4, 5) : int(r, 6, 7);
      const n = numberWith(r, len, false);
      const cols = columnsFor(n);
      const col = pick(r, cols.slice(0, cols.length - 1));
      const d = digitIn(n, col)!;
      const value = d * PLACE[col];
      const others = [...new Set([d, d * 10, d * 100, d * 1000, d * 10000].filter((x) => x !== value))].slice(0, 3);
      const options = [value, ...others].map((x) => ({
        text: num(x),
        misconception: x === d ? M.face : undefined,
        feedback: x === d ? `The ${d} is in the ${NAME[col]} column, so it is worth more than ${d}.` : `Look again at which column the ${d} is in.`,
      }));
      return {
        kind: "choose",
        prompt: `What is the **${d}** worth in **${num(n)}**?`,
        visual: difficulty < 3 ? { kind: "pv-chart", value: n, columns: cols, highlight: col } : undefined,
        options,
        answer: 0,
        hint: `Find the ${d}. Which column is it in?`,
        explanation: `The ${d} is in the ${NAME[col]} column, so it is worth **${num(value)}**.`,
      };
    },
  },
  {
    key: "pv-which-digit",
    skill: S.digit,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const len = difficulty === 1 ? 3 : difficulty === 2 ? 4 : int(r, 5, 6);
      const n = numberWith(r, len, false);
      const cols = columnsFor(n);
      const col = pick(r, cols);
      const d = digitIn(n, col)!;
      const i = cols.indexOf(col);
      const neighbours = [cols[i - 1], cols[i + 1]].filter(Boolean).map((c) => digitIn(n, c!)!).filter((x) => x !== d);
      return {
        kind: "number",
        prompt: `Which digit is in the **${NAME[col]}** place in **${num(n)}**?`,
        answer: d,
        traps: neighbours.map((x) => ({ value: x, feedback: "That digit is in the next column along. Count the columns from the ones." })),
        hint: "Start at the ones (the last digit) and count the columns to the left.",
        explanation: `In ${num(n)}, the ${NAME[col]} digit is **${d}**.`,
      };
    },
  },
  {
    key: "pv-words-to-num",
    skill: S.words,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      // Numbers with a zero inside, so the placeholder matters.
      const n =
        difficulty === 1
          ? int(r, 1, 9) * 100 + int(r, 1, 9)
          : difficulty === 2
            ? int(r, 1, 9) * 1000 + pick(r, [0, int(r, 1, 9) * 100]) + int(r, 1, 9) * 10 * pick(r, [0, 1]) + int(r, 1, 9)
            : int(r, 10, 99) * 1000 + int(r, 0, 9) * 100 + int(r, 1, 99);
      const thousands = Math.floor(n / 1000);
      const rest = n % 1000;
      const traps = [
        { value: Number(String(n).replace(/0/g, "")), misconception: M.zero, feedback: "You left out a zero. Each empty column needs a **0** to hold its place." },
        ...(thousands ? [{ value: Number(`${thousands}000${rest}`), misconception: M.concat, feedback: `Not quite: ${num(thousands * 1000)} and ${rest} join into one number, they don't sit side by side.` }] : []),
      ].filter((t) => t.value !== n);
      return {
        kind: "number",
        prompt: `Write this number in digits: **${numberWords(n)}**`,
        answer: n,
        traps,
        hint: "Write the thousands first, then fill hundreds, tens and ones. Put a 0 in any empty column.",
        explanation: `${numberWords(n)[0].toUpperCase()}${numberWords(n).slice(1)} is **${num(n)}**.`,
      };
    },
  },
  {
    key: "pv-num-to-words",
    skill: S.words,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const n = difficulty === 1 ? int(r, 1, 9) * 100 + int(r, 1, 9) : difficulty === 2 ? int(r, 1, 9) * 1000 + int(r, 0, 9) * 10 + int(r, 1, 9) : int(r, 10, 99) * 1000 + int(r, 1, 9) * 100 + int(r, 1, 9);
      const swapped = Number(String(n).replace(/0(\d)$/, "$10"));
      const wrong = [...new Set([swapped, n * 10, Math.floor(n / 10)].filter((x) => x !== n && x > 0))].slice(0, 3);
      return {
        kind: "choose",
        prompt: `Which words say **${num(n)}**?`,
        options: [
          { text: numberWords(n) },
          ...wrong.map((x) => ({ text: numberWords(x), misconception: x === swapped ? M.zero : undefined, feedback: `Those words say ${num(x)}.` })),
        ],
        answer: 0,
        hint: "Read the thousands first, then the hundreds, then the tens and ones.",
        explanation: `${num(n)} is **${numberWords(n)}**.`,
      };
    },
  },
  {
    key: "pv-partition",
    skill: S.part,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const len = difficulty === 1 ? 3 : difficulty === 2 ? 4 : 5;
      const n = numberWith(r, len, false);
      const cols = columnsFor(n);
      const parts = cols.map((c) => digitIn(n, c)! * PLACE[c]);
      const gap = int(r, 0, parts.length - 2);
      const shown = parts.map((p, i) => (i === gap ? "?" : num(p))).join(" + ");
      const d = digitIn(n, cols[gap])!;
      return {
        kind: "number",
        prompt: `**${num(n)} = ${shown}**. What is the missing part?`,
        visual: difficulty === 1 ? { kind: "bar", total: num(n), parts: parts.map((p, i) => ({ label: i === gap ? "?" : num(p), size: 1 })) } : undefined,
        answer: parts[gap],
        traps: [{ value: d, misconception: M.face, feedback: `The ${d} is in the ${NAME[cols[gap]]} column, so this part is worth more than ${d}.` }],
        hint: `Which column is missing? Its digit is ${d}.`,
        explanation: `${num(n)} has ${d} in the ${NAME[cols[gap]]} column, which is **${num(parts[gap])}**.`,
      };
    },
  },
  {
    key: "pv-partition-missing",
    skill: S.part,
    difficulties: [2, 3],
    make: (r, { difficulty }) => {
      const th = int(r, 1, 9);
      const h = int(r, 1, 9);
      const o = int(r, 1, 9);
      const big = difficulty === 3 ? int(r, 1, 9) * 10000 : 0;
      const n = big + th * 1000 + h * 100 + o;
      const terms = [big, th * 1000, h * 100, o].filter(Boolean).map(num).join(" + ");
      return {
        kind: "number",
        prompt: `What is **${terms}**?`,
        answer: n,
        traps: [{ value: Number(String(n).replace(/0/g, "")), misconception: M.zero, feedback: "There are no tens, so the tens column needs a **0**." }],
        hint: "Write each part in its column. Any empty column gets a 0.",
        explanation: `${terms} = **${num(n)}**. The 0 holds the tens place.`,
      };
    },
  },
  {
    key: "pv-compare",
    skill: S.compare,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      let a: number;
      let b: number;
      if (difficulty === 3) {
        // Different lengths: the trap is to compare the first digits.
        a = numberWith(r, 4, false);
        b = int(r, Math.floor(a / 1000) + 1, 9) * 100 + int(r, 0, 99);
        if (r() < 0.5) [a, b] = [b, a];
      } else {
        a = numberWith(r, difficulty === 1 ? 3 : 4, false);
        b = r() < 0.15 ? a : Number(String(a).split("").reverse().join(""));
        if (b === a && r() < 0.5) b = a + pick(r, [10, 100]);
      }
      const sign = a > b ? ">" : a < b ? "<" : "=";
      const longFirst = String(a).length !== String(b).length;
      const firstDigitWins = Number(String(a)[0]) > Number(String(b)[0]) ? ">" : "<";
      return {
        kind: "choose",
        prompt: `Which sign goes in the gap? **${num(a)} ___ ${num(b)}**`,
        options: [
          { text: "<", misconception: longFirst && firstDigitWins === "<" ? M.length : undefined, feedback: longFirst ? "Count the digits first: the number with more digits is bigger." : "Compare the biggest columns first." },
          { text: "=", feedback: "The two numbers aren't the same." },
          { text: ">", misconception: longFirst && firstDigitWins === ">" ? M.length : undefined, feedback: longFirst ? "Count the digits first: the number with more digits is bigger." : "Compare the biggest columns first." },
        ],
        answer: sign === "<" ? 0 : sign === "=" ? 1 : 2,
        fixedOrder: true,
        hint: "Count the digits. If they match, compare the biggest column first.",
        explanation: `**${num(a)} ${sign} ${num(b)}**.`,
      };
    },
  },
  {
    key: "pv-order",
    skill: S.compare,
    difficulties: [2, 3],
    make: (r, { difficulty }) => {
      const base = numberWith(r, difficulty === 2 ? 4 : 5, false);
      const set = [...new Set([base, Number(String(base).split("").reverse().join("")), base + pick(r, [100, 1000, 10]), Math.floor(base / 10)])];
      while (set.length < 4) set.push(base + set.length * 7);
      const biggest = Math.max(...set);
      const four = set.slice(0, 4);
      return {
        kind: "choose",
        prompt: "Which number is the **largest**?",
        options: four.map((x) => ({ text: num(x), misconception: String(x).length < String(biggest).length && String(x)[0] > String(biggest)[0] ? M.length : undefined, feedback: `${num(x)} is smaller than ${num(biggest)}.` })),
        answer: four.indexOf(biggest),
        hint: "First look for the number with the most digits.",
        explanation: `**${num(biggest)}** is the largest.`,
      };
    },
  },
  {
    key: "pv-more-less",
    skill: S.more,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const step = difficulty === 1 ? pick(r, [10, 100]) : difficulty === 2 ? pick(r, [100, 1000]) : pick(r, [1000, 10000]);
      const n = difficulty === 3 ? int(r, 1, 9) * 10000 + 9000 + int(r, 0, 999) : difficulty === 2 ? int(r, 1, 9) * 1000 + 900 + int(r, 0, 99) : int(r, 100, 989);
      const more = r() < 0.6 || n - step < 0;
      const answer = more ? n + step : n - step;
      const wrongStep = step === 10 ? 100 : step / 10;
      return {
        kind: "number",
        prompt: `What is **${num(step)} ${more ? "more" : "less"}** than **${num(n)}**?`,
        visual: difficulty === 1 ? { kind: "line", min: Math.floor(Math.min(n, answer) / step) * step - step, max: Math.ceil(Math.max(n, answer) / step) * step + step, step, points: [{ value: n, label: num(n), tone: "brand" }], jumps: [{ from: n, to: answer, label: `${more ? "+" : "−"}${num(step)}` }] } : undefined,
        answer,
        traps: [{ value: more ? n + wrongStep : n - wrongStep, misconception: M.column, feedback: `That changes the wrong column. ${num(step)} ${more ? "more" : "less"} changes the ${step === 10 ? "tens" : step === 100 ? "hundreds" : step === 1000 ? "thousands" : "ten thousands"} digit.` }],
        hint: `Which column does ${num(step)} change? ${more ? "Add" : "Take away"} one there. Watch for a 9 that rolls over!`,
        explanation: `${num(n)} ${more ? "+" : "−"} ${num(step)} = **${num(answer)}**.`,
      };
    },
  },
  /* D-037 (Phase B): a stretch question for every skill, and a second question maker for more and less. */
  {
    key: "pv-digit-stretch",
    skill: S.digit,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const d = int(r, 1, 7);
      const digits = [d, (d + int(r, 1, 2)) % 10, d, (d + 3) % 10];
      const n = Number(digits.join(""));
      const big = digits[0]! * 1000;
      const small = digits[2]! * 10;
      return {
        kind: "number",
        prompt: `In **${num(n)}**, the digit ${digits[0]} appears twice. How many **times bigger** is the value of the first ${digits[0]} than the second?`,
        answer: big / small,
        traps: [{ value: 1, misconception: M.face, feedback: "The digits look the same, but their columns give them different values." }, { value: 2, misconception: M.column, feedback: `Compare their values: ${num(big)} and ${small}.` }],
        hint: `What is each ${digits[0]} worth? One is in the thousands column, one in the tens.`,
        explanation: `${num(big)} ÷ ${small} = **${big / small}**: each column is 10 times the one to its right.`,
      };
    },
  },
  {
    key: "pv-words-stretch",
    skill: S.words,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const th = int(r, 2, 99);
      const ones = int(r, 1, 9) * pick(r, [1, 10]);
      const n = th * 1000 + ones;
      const wrong = Number(`${th}${ones}`);
      return {
        kind: "choose",
        prompt: `Which number is **${numberWords(n)}**?`,
        options: [{ text: num(n) }, { text: num(wrong), misconception: M.zero, feedback: "There are no hundreds, so zeros must hold the empty places." }, { text: num(th * 1000 + ones * 10), misconception: M.zero, feedback: "Check how many zeros hold the empty places." }, { text: num(th * 100 + ones), misconception: M.column, feedback: `${numberWords(th)} thousand means ${num(th * 1000)}.` }].filter((o, i, all) => all.findIndex((x) => x.text === o.text) === i),
        answer: 0,
        hint: "Write the thousands first, then make sure there are three digits after the comma.",
        explanation: `${numberWords(n)} is **${num(n)}**.`,
      };
    },
  },
  {
    key: "pv-partition-stretch",
    skill: S.part,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const h = int(r, 2, 8);
      const t = int(r, 11, 19);
      const o = int(r, 2, 9);
      const n = h * 100 + t * 10 + o;
      return {
        kind: "number",
        prompt: `**${h} hundreds + ${t} tens + ${o} ones** is the same as which number?`,
        answer: n,
        traps: [{ value: Number(`${h}${t}${o}`), misconception: M.concat, feedback: `${t} tens is ${t * 10}, which is more than 100. Don't just write the digits side by side.` }],
        hint: `${t} tens is ${t * 10}. Add the parts together.`,
        explanation: `${h * 100} + ${t * 10} + ${o} = **${num(n)}**.`,
      };
    },
  },
  {
    key: "pv-compare-stretch",
    skill: S.compare,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const pool = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      const uniq: number[] = [];
      while (uniq.length < 4) uniq.push(pool.splice(int(r, 0, pool.length - 1), 1)[0]!);
      const desc = [...uniq].sort((a, b) => b - a);
      const largest = Number(desc.join(""));
      return {
        kind: "number",
        prompt: `Use each of the digits **${uniq.join(", ")}** once. What is the **largest** number you can make?`,
        answer: largest,
        traps: [{ value: Number([...desc].reverse().join("")), feedback: "That's the smallest. Put the biggest digit in the biggest column." }, { value: Number(uniq.join("")), misconception: M.column, feedback: "Order the digits from biggest to smallest." }].filter((t) => t.value !== largest),
        hint: "The biggest digit goes in the thousands column.",
        explanation: `Biggest digit first: **${num(largest)}**.`,
      };
    },
  },
  {
    key: "pv-more-less-word",
    skill: S.more,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const step = difficulty === 1 ? pick(r, [10, 100]) : pick(r, [100, 1000]);
      const more = r() < 0.5;
      // Taking away never goes below zero: the starting number is always bigger than the step.
      const n = difficulty === 3 ? int(r, 20, 99) * 100 - step + int(r, 1, 9) * 10 : int(r, step + 20, 9800);
      const answer = more ? n + step : n - step;
      return {
        kind: "number",
        prompt: more ? `A school has **${num(n)} books**. It buys **${num(step)} more**. How many books does it have now?` : `A stadium has **${num(n)} seats**. **${num(step)}** are taken out. How many seats are left?`,
        answer,
        traps: [{ value: more ? n - step : n + step, feedback: more ? "Buying more means the number goes up." : "Taking seats out means the number goes down." }],
        hint: `${num(step)} ${more ? "more" : "less"} changes the ${step === 10 ? "tens" : step === 100 ? "hundreds" : "thousands"} digit.`,
        explanation: `${num(n)} ${more ? "+" : "−"} ${num(step)} = **${num(answer)}**.`,
      };
    },
  },
  {
    key: "pv-more-stretch",
    skill: S.more,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const n = int(r, 1, 8) * 1000 + 900 + int(r, 50, 99);
      return {
        kind: "number",
        prompt: `What is **1,000 more** than **${num(n)}**, then **100 more** than that?`,
        answer: n + 1100,
        traps: [{ value: n + 1000, feedback: "Do both steps: 1,000 more, then 100 more." }, { value: n + 100, feedback: "Do both steps: 1,000 more, then 100 more." }],
        hint: "The hundreds digit is 9: adding 100 makes it roll over into the thousands.",
        explanation: `${num(n)} + 1,000 = ${num(n + 1000)}; + 100 = **${num(n + 1100)}**.`,
      };
    },
  },
];

const templates = withHints(baseTemplates, {
  "pv-blocks": () => ["Count the hundreds squares, the tens sticks, then the ones cubes.", "Write each count in its own column."],
  "pv-digit-value": () => ["Find which column the digit is in.", "The digit's value is the digit times that column: 4 in the hundreds is 400."],
  "pv-which-digit": () => ["Read the columns from the right: ones, tens, hundreds, thousands…", "Point to the column named in the question."],
  "pv-words-to-num": () => ["Write the thousands, then the hundreds, tens and ones.", "If a column has nothing, write a zero to hold its place."],
  "pv-num-to-words": () => ["Read the digits before the comma as thousands.", "Then read the last three digits as a normal number."],
  "pv-partition": () => ["Each digit is worth its column's value.", "Add or write the parts: thousands + hundreds + tens + ones."],
  "pv-partition-missing": () => ["Add the parts you know.", "Take that away from the whole number to find the missing part."],
  "pv-compare": () => ["More digits means a bigger number.", "If they have the same number of digits, compare from the left."],
  "pv-order": () => ["Line the numbers up by their columns.", "Compare the biggest column first."],
  "pv-more-less": () => ["Only one column changes, unless a 9 rolls over.", "10 changes the tens, 100 changes the hundreds, 1,000 changes the thousands."],
  "pv-digit-stretch": () => ["Write the value of each digit.", "Divide the bigger value by the smaller one."],
  "pv-words-stretch": () => ["After the thousands there are always three more digits.", "Use zeros for the hundreds and tens if the words don't mention them."],
  "pv-partition-stretch": () => ["More than 9 tens makes extra hundreds.", "Add the hundreds, the tens and the ones as values."],
  "pv-compare-stretch": () => ["Put the digits in order, biggest first.", "The biggest digit goes in the biggest column."],
  "pv-more-less-word": () => ["More means add; fewer or taken out means take away.", "Change the right column."],
  "pv-more-stretch": () => ["Add 1,000 first.", "Then add 100: watch the hundreds roll over."],
});

export const placeValue = defineTopic({
  id: T,
  title: "Place value",
  subtitle: "What every digit is worth: reading, writing, partitioning and comparing numbers up to a million",
  world: "number",
  years: [3, 4, 5, 6],
  order: 1,
  icon: "place-value",
  skills: [
    { id: S.digit, title: "What a digit is worth", description: "Say the value of any digit in a number up to a million.", lessonId: "digits" },
    { id: S.words, title: "Numbers in words and digits", description: "Read and write numbers in words and digits, with zeros in the right places.", lessonId: "read-write" },
    { id: S.part, title: "Partitioning", description: "Split numbers into thousands, hundreds, tens and ones, and put them back together.", lessonId: "partition" },
    { id: S.compare, title: "Comparing and ordering", description: "Use <, > and = and put numbers in order.", lessonId: "compare" },
    { id: S.more, title: "10, 100 and 1,000 more or less", description: "Find 10, 100, 1,000 or 10,000 more or less than a number.", lessonId: "more-less" },
  ],
  lessonIcons: { digits: "place-value", "read-write": "book", partition: "puzzle", compare: "scales", "more-less": "rocket" },
  lessons: [
    {
      id: "digits",
      title: "What is a digit worth?",
      phase: "Understand",
      summary: "The same digit is worth more or less depending on its column.",
      minutes: 6,
      objectives: ["Say what each digit in a number is worth", "Use hundreds, tens and ones to build a number"],
      steps: [
        {
          type: "explain",
          title: "Blocks make numbers",
          body: ["A **hundred** is ten tens. A **ten** is ten ones.", "These blocks show **2 hundreds, 3 tens and 4 ones**. Together they make **234**."],
          visual: { kind: "blocks", hundreds: 2, tens: 3, ones: 4 },
          tip: "Big blocks first: hundreds, then tens, then ones.",
        },
        {
          type: "explain",
          title: "Every column has a value",
          body: ["In **4,527**, the 5 is in the **hundreds** column, so it is worth **500**.", "Move a digit one column left and it is worth **ten times** as much."],
          visual: { kind: "pv-chart", value: 4527, columns: ["Th", "H", "T", "O"], highlight: "H" },
        },
        {
          type: "worked",
          title: "Watch me: what is the 6 worth?",
          support: "full",
          problem: "What is the **6** worth in **3,642**?",
          visual: { kind: "pv-chart", value: 3642, columns: ["Th", "H", "T", "O"], highlight: "H" },
          steps: [{ text: "Find the 6. It is the second digit." }, { text: "Count the columns from the right: ones, tens, **hundreds**." }, { text: "So the 6 means **6 hundreds**." }],
          conclusion: "The 6 in 3,642 is worth **600**.",
        },
        {
          type: "worked",
          title: "Together: what is the 7 worth?",
          support: "faded",
          problem: "What is the **7** worth in **4,732**?",
          visual: { kind: "pv-chart", value: 4732, columns: ["Th", "H", "T", "O"], highlight: "H" },
          steps: [{ text: "The 7 is in the **hundreds** column.", blank: { prompt: "What is the 7 worth?", answer: 700, hint: "7 hundreds", traps: [{ value: 7, misconception: M.face, feedback: "The digit is 7, but its value depends on its column: 7 hundreds." }, { value: 70, misconception: M.column, feedback: "Count the columns from the right: ones, tens, hundreds." }], worked: "**700**." } }],
          conclusion: "In 4,732 the 7 is worth **700**.",
        },
        { type: "check", title: "Your turn", questionId: gen("pv-blocks", 1, 4) },
        { type: "check", title: "One more", questionId: gen("pv-digit-value", 1, 7) },
      ],
    },
    {
      id: "read-write",
      title: "Big numbers in words",
      phase: "Visualise",
      summary: "Read numbers in chunks, and keep empty columns with a zero.",
      minutes: 7,
      objectives: ["Read and write numbers up to a million", "Use 0 to hold an empty place"],
      steps: [
        {
          type: "explain",
          title: "Read in chunks",
          body: ["The comma splits a big number into chunks of three. **45,302** is read as **forty-five thousand**, then **three hundred and two**."],
          visual: { kind: "pv-chart", value: 45302, columns: ["TTh", "Th", "H", "T", "O"] },
          tip: "Say the thousands chunk, say the word thousand, then read the rest.",
        },
        {
          type: "explain",
          title: "Zero holds the place",
          body: ["**Three thousand and forty-two** has no hundreds. We still need that column, so we write a **0** there: **3,042**.", "Without the zero it would say 342, a much smaller number."],
          visual: { kind: "pv-chart", value: 3042, columns: ["Th", "H", "T", "O"], highlight: "H" },
        },
        {
          type: "worked",
          title: "Watch me: read 30,407",
          support: "full",
          problem: "Read **30,407** aloud.",
          visual: { kind: "pv-chart", value: 30407, columns: ["TTh", "Th", "H", "T", "O"] },
          steps: [{ text: "Before the comma: **30** thousand." }, { text: "After the comma: **407**: four hundred and seven. The zero in the tens just holds the place." }],
          conclusion: "30,407 is **thirty thousand, four hundred and seven**.",
        },
        {
          type: "worked",
          title: "Let's do it together",
          support: "faded",
          problem: "Write **six thousand and fifty-one** in digits.",
          visual: { kind: "pv-chart", value: 6051, columns: ["Th", "H", "T", "O"], hideDigits: true },
          steps: [
            { text: "Six thousand: a 6 in the thousands column." },
            { text: "No hundreds, so the hundreds column gets a zero.", blank: { prompt: "Which digit goes in the hundreds column?", answer: 0, hint: "There are no hundreds in the words.", traps: [{ value: 5, misconception: M.zero, feedback: "The 5 is fifty: it goes in the tens. The hundreds column is empty, so it gets a 0." }], worked: "No hundreds, so we write **0**." } },
            { text: "Fifty-one: 5 tens and 1 one." },
          ],
          conclusion: "Six thousand and fifty-one is **6,051**.",
        },
        { type: "check", title: "Your turn", questionId: gen("pv-words-to-num", 1, 2) },
        { type: "check", title: "One more", questionId: gen("pv-num-to-words", 2, 7) },
      ],
    },
    {
      id: "partition",
      title: "Break numbers apart",
      phase: "Explore",
      summary: "Split a number into the value of each digit, then join the parts again.",
      minutes: 6,
      objectives: ["Partition a number into thousands, hundreds, tens and ones", "Rebuild a number from its parts"],
      steps: [
        {
          type: "explain",
          title: "One number, four parts",
          body: ["**3,456** is **3,000 + 400 + 50 + 6**. Each part is one digit's value.", "You can also partition in other ways: 3,456 is 34 hundreds and 56 ones, or 3,000 + 456. All these parts add back to the same number.", "A zero digit gives no part: 5,208 is 5,000 + 200 + 8."],
          visual: { kind: "bar", total: "3,456", parts: [{ label: "3,000", size: 3 }, { label: "400", size: 2 }, { label: "50", size: 1.4 }, { label: "6", size: 1 }] },
          tip: "Partitioning makes adding and subtracting in your head much easier.",
        },
        {
          type: "worked",
          title: "Watch me: partition 7,093",
          support: "full",
          problem: "Partition **7,093** into thousands, hundreds, tens and ones.",
          visual: { kind: "pv-chart", value: 7093, columns: ["Th", "H", "T", "O"] },
          steps: [{ text: "7 thousands = **7,000**. 0 hundreds = nothing." }, { text: "9 tens = **90**. 3 ones = **3**." }],
          conclusion: "7,093 = **7,000 + 90 + 3**.",
        },
        {
          type: "worked",
          title: "Let's do it together",
          support: "faded",
          problem: "**5,208 = 5,000 + ? + 8**",
          steps: [
            { text: "The digits are 5, 2, 0 and 8." },
            { text: "The 2 is in the hundreds column.", blank: { prompt: "What is the 2 worth?", answer: 200, hint: "It is in the hundreds column.", traps: [{ value: 20, misconception: M.column, feedback: "Count the columns from the right: the 2 is in the hundreds." }, { value: 2, misconception: M.face, feedback: "The digit is 2, but in the hundreds column it is worth 200." }], worked: "The 2 is worth **200**." } },
            { text: "There are no tens, so there is no tens part." },
          ],
          conclusion: "**5,208 = 5,000 + 200 + 8**.",
        },
        { type: "check", title: "Your turn", questionId: gen("pv-partition", 1, 4) },
        { type: "check", title: "Put it back together", questionId: gen("pv-partition-missing", 2, 8) },
      ],
    },
    {
      id: "compare",
      title: "Which is bigger?",
      phase: "Practise",
      summary: "Count the digits first, then compare from the biggest column.",
      minutes: 6,
      objectives: ["Compare numbers with <, > and =", "Order a set of numbers"],
      steps: [
        {
          type: "explain",
          title: "The crocodile eats the bigger number",
          body: ["**<** means *is less than* and **>** means *is greater than*. The open side always faces the bigger number.", "**899 < 1,200**, because 1,200 has more digits.", "If two numbers have the same number of digits, compare them column by column from the left. The first column that is different decides which is bigger."],
          visual: { kind: "pv-chart", value: 4381, columns: ["Th", "H", "T", "O"], highlight: "T" },
          tip: "More digits means bigger. Same number of digits? Compare the first column.",
        },
        {
          type: "worked",
          title: "Watch me compare",
          support: "full",
          problem: "Which is bigger, **4,381** or **4,318**?",
          steps: [{ text: "Both have 4 digits." }, { text: "Thousands: both 4. Hundreds: both 3." }, { text: "Tens: **8** is more than **1**." }],
          conclusion: "**4,381 > 4,318**.",
        },
        {
          type: "worked",
          title: "Together: 989 or 1,002?",
          support: "faded",
          problem: "Which is bigger: **989** or **1,002**?",
          steps: [{ text: "Count the digits first.", blank: { prompt: "How many digits does 1,002 have?", answer: 4, hint: "1, 0, 0, 2", traps: [{ value: 3, misconception: M.length, feedback: "Count again: 1,002 has a thousands digit, so it has 4 digits." }], worked: "**4** digits; 989 has only 3." } }],
          conclusion: "**1,002 > 989**: more digits means bigger, even though 989 has big digits.",
        },
        { type: "check", title: "Your turn", questionId: gen("pv-compare", 1, 3) },
        { type: "check", title: "One more", questionId: gen("pv-compare", 3, 6) },
      ],
    },
    {
      id: "more-less",
      title: "10, 100 and 1,000 more or less",
      phase: "Apply",
      summary: "Only one column changes, unless a 9 rolls over.",
      minutes: 7,
      objectives: ["Find 10, 100 or 1,000 more or less than a number", "Handle a 9 that rolls over"],
      steps: [
        {
          type: "explain",
          title: "Jump along the line",
          body: ["**100 more than 345** changes only the hundreds digit: **445**.", "10 more changes the tens digit, and 1,000 more changes the thousands digit. Less works the same way, going down."],
          visual: { kind: "line", min: 300, max: 500, step: 100, points: [{ value: 345, label: "345", tone: "brand" }, { value: 445, label: "445" }], jumps: [{ from: 345, to: 445, label: "+100" }] },
        },
        {
          type: "explain",
          title: "When a 9 rolls over",
          body: ["**100 more than 3,950**: the hundreds digit is 9, so it rolls over to 0 and the thousands go up by one. The answer is **4,050**."],
          tip: "Like a car's mileage counter, a 9 becomes 0 and the next column goes up.",
        },
        {
          type: "worked",
          title: "Watch me: 1,000 less than 6,250",
          support: "full",
          problem: "What is **1,000 less** than **6,250**?",
          visual: { kind: "line", min: 4000, max: 7000, step: 1000, points: [{ value: 6250, label: "6,250", tone: "brand" }, { value: 5250, label: "5,250" }], jumps: [{ from: 6250, to: 5250, label: "−1,000" }] },
          steps: [{ text: "1,000 less changes only the **thousands** digit." }, { text: "6 thousands become **5** thousands. The other digits stay." }],
          conclusion: "1,000 less than 6,250 is **5,250**.",
        },
        {
          type: "worked",
          title: "Together: 10 more than 2,995",
          support: "faded",
          problem: "What is **10 more** than **2,995**?",
          steps: [{ text: "The tens digit is 9, so it rolls over to 0, and the hundreds go up. The hundreds are 9 too, so they roll over as well.", blank: { prompt: "10 more than 2,995 = ?", answer: 3005, hint: "2,995 + 10", traps: [{ value: 2905, misconception: M.column, feedback: "The 9 tens roll over: the hundreds go up, and they roll over too." }, { value: 3995, misconception: M.column, feedback: "10 more only adds a ten, not a thousand." }], worked: "**3,005**." } }],
          conclusion: "10 more than 2,995 is **3,005**.",
        },
        { type: "check", title: "Your turn", questionId: gen("pv-more-less", 1, 5) },
        { type: "check", title: "One more", questionId: gen("pv-more-less", 2, 9) },
      ],
    },
  ],
  templates,
  misconceptions: [
    {
      id: M.face,
      name: "Reading the digit, not its value",
      possibleCause: "It looks like you used the digit on its own, not what its column makes it worth.",
      description: "Gives a digit's face value (the 6 in 3,642 is 6) instead of its place value (600).",
      explanation: ["A digit's value depends on its column.", "In 3,642, the 6 is in the hundreds column, so it is worth 600."],
      skills: [S.digit, S.part],
      followUpTemplates: ["pv-digit-value", "pv-partition"],
    },
    {
      id: M.zero,
      name: "Leaving out a placeholder zero",
      possibleCause: "It looks like a zero went missing, so the digits slid into the wrong columns.",
      description: "Drops a placeholder zero, e.g. writes three thousand and forty-two as 342.",
      explanation: ["An empty column still needs a digit: 0.", "Three thousand and forty-two is 3,042: 3 thousands, 0 hundreds, 4 tens, 2 ones."],
      skills: [S.words, S.part],
      followUpTemplates: ["pv-words-to-num", "pv-partition-missing"],
    },
    {
      id: M.concat,
      name: "Writing each part as it sounds",
      possibleCause: "It looks like the thousands and the rest were written side by side.",
      description: "Writes three thousand and forty-two as 300042, joining the parts instead of combining them.",
      explanation: ["Three thousand and forty-two means 3,000 + 42.", "The parts share columns, giving 3,042."],
      skills: [S.words],
      followUpTemplates: ["pv-words-to-num"],
    },
    {
      id: M.length,
      name: "Comparing first digits only",
      possibleCause: "It looks like you compared the first digits before counting how many digits each number has.",
      description: "Thinks 899 is bigger than 1,200 because 8 is bigger than 1.",
      explanation: ["Count the digits first: a 4-digit number is bigger than any 3-digit number.", "So 1,200 > 899."],
      skills: [S.compare],
      followUpTemplates: ["pv-compare"],
    },
    {
      id: M.column,
      name: "Changing the wrong column",
      possibleCause: "It looks like the wrong column changed.",
      description: "Adds 1,000 by changing the hundreds digit, e.g. 4,567 + 1,000 = 4,667.",
      explanation: ["1,000 more changes the thousands digit.", "4,567 + 1,000 = 5,567."],
      skills: [S.more],
      followUpTemplates: ["pv-more-less"],
    },
  ],
  placement: [
    { lessonId: "digits", template: "pv-digit-value" },
    { lessonId: "read-write", template: "pv-words-to-num" },
    { lessonId: "partition", template: "pv-partition" },
    { lessonId: "compare", template: "pv-compare" },
    { lessonId: "more-less", template: "pv-more-less" },
  ],
});
