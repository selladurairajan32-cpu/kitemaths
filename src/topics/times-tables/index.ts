import { defineTopic, genFor, int, pick } from "@/topics/kit/define";
import type { Difficulty, Rng, Template } from "@/topics/kit/types";

/** Times tables up to 12 × 12, learned by family with the patterns that make them stick, plus division facts. */

const T = "times-tables";
const gen = genFor(T);
const S = { easy: `${T}.two-five-ten`, doubling: `${T}.three-four-eight`, tricky: `${T}.six-seven-nine`, big: `${T}.eleven-twelve`, division: `${T}.division-facts` };
const M = { added: `${T}.added-not-multiplied`, step: `${T}.one-step-out`, divMult: `${T}.multiplied-not-divided` };

const FAMILIES: Record<string, { skill: string; tables: number[] }> = {
  easy: { skill: S.easy, tables: [2, 5, 10] },
  doubling: { skill: S.doubling, tables: [3, 4, 8] },
  tricky: { skill: S.tricky, tables: [6, 7, 9] },
  big: { skill: S.big, tables: [11, 12] },
};
const upTo = (d: Difficulty) => (d === 1 ? 5 : d === 2 ? 10 : 12);

function factTraps(a: number, b: number) {
  const right = a * b;
  return [
    { value: a + b, misconception: M.added, feedback: `That's ${a} add ${b}. Times means ${b} lots of ${a}.` },
    { value: a * (b + 1), misconception: M.step, feedback: `That's ${b + 1} lots of ${a}: one step too far.` },
    { value: a * (b - 1), misconception: M.step, feedback: `That's ${b - 1} lots of ${a}: one step short.` },
  ].filter((t, i, all) => t.value !== right && t.value > 0 && all.findIndex((x) => x.value === t.value) === i);
}

function factTemplate(family: string): Template {
  const f = FAMILIES[family];
  return {
    key: `tt-${family}`,
    skill: f.skill,
    difficulties: [1, 2, 3],
    make: (r: Rng, { difficulty }) => {
      const table = pick(r, f.tables);
      const b = int(r, 2, upTo(difficulty));
      const [x, y] = difficulty === 3 && r() < 0.5 ? [b, table] : [table, b];
      return {
        kind: "number",
        prompt: `**${x} × ${y} = ?**`,
        answer: x * y,
        traps: factTraps(table, b),
        hint: `Count in ${table}s, ${b} times. Or use a fact you know and adjust.`,
        explanation: `${x} × ${y} = **${x * y}**.`,
      };
    },
  };
}

function rowTemplate(family: string): Template {
  const f = FAMILIES[family];
  return {
    key: `tt-${family}-row`,
    skill: f.skill,
    difficulties: [1, 2],
    make: (r: Rng, { difficulty }) => {
      const table = pick(r, f.tables);
      const gap = int(r, 2, difficulty === 1 ? 6 : 11);
      return {
        kind: "number",
        prompt: `Counting in **${table}s**. What number is missing?`,
        visual: { kind: "times-row", table, upTo: difficulty === 1 ? 6 : 12, gap },
        answer: table * gap,
        traps: factTraps(table, gap).filter((t) => t.misconception === M.step),
        hint: `Add ${table} to the number before the gap.`,
        explanation: `${gap} × ${table} = **${table * gap}**.`,
      };
    },
  };
}

function missingTemplate(family: string): Template {
  const f = FAMILIES[family];
  return {
    key: `tt-${family}-missing`,
    skill: f.skill,
    difficulties: [2, 3],
    make: (r: Rng, { difficulty }) => {
      const table = pick(r, f.tables);
      const b = int(r, 2, upTo(difficulty));
      return {
        kind: "number",
        prompt: `**? × ${table} = ${table * b}**`,
        answer: b,
        traps: [b - 1, b + 1].filter((x) => x > 0).map((x) => ({ value: x, misconception: M.step, feedback: `${x} × ${table} = ${x * table}, not ${table * b}.` })),
        hint: `How many ${table}s make ${table * b}?`,
        explanation: `**${b}** × ${table} = ${table * b}.`,
      };
    },
  };
}

const templates: Template[] = [
  factTemplate("easy"),
  rowTemplate("easy"),
  {
    key: "tt-array",
    skill: S.easy,
    difficulties: [1, 2],
    make: (r, { difficulty }) => {
      const rows = pick(r, difficulty === 1 ? [2, 5] : [2, 5, 10]);
      const cols = int(r, 2, difficulty === 1 ? 5 : 9);
      return {
        kind: "number",
        prompt: `How many dots? **${rows} rows of ${cols}**`,
        visual: { kind: "array", rows, cols },
        answer: rows * cols,
        traps: [{ value: rows + cols, misconception: M.added, feedback: `There are ${rows} rows with ${cols} in each: that's ${rows} × ${cols}.` }].filter((t) => t.value !== rows * cols),
        hint: `Count in ${cols}s, one row at a time.`,
        explanation: `${rows} × ${cols} = **${rows * cols}** dots.`,
      };
    },
  },
  factTemplate("doubling"),
  rowTemplate("doubling"),
  factTemplate("tricky"),
  missingTemplate("tricky"),
  factTemplate("big"),
  missingTemplate("big"),
  {
    key: "tt-div",
    skill: S.division,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const table = pick(r, difficulty === 1 ? [2, 5, 10] : difficulty === 2 ? [3, 4, 6, 8] : [7, 9, 11, 12]);
      const b = int(r, 2, difficulty === 1 ? 10 : 12);
      const total = table * b;
      return {
        kind: "number",
        prompt: `**${total} ÷ ${table} = ?**`,
        visual: difficulty === 1 && b <= 6 ? { kind: "groups", groups: b, each: table, label: `${total} shared into groups of ${table}` } : undefined,
        answer: b,
        traps: [{ value: total * table, misconception: M.divMult, feedback: "That's multiplying. Divide means how many groups of " + table + " make " + total + "." }, ...(b > 2 ? [{ value: b - 1, misconception: M.step, feedback: `${b - 1} lots of ${table} is ${(b - 1) * table}, not ${total}.` }] : [])],
        hint: `Think: what times ${table} makes ${total}?`,
        explanation: `${b} × ${table} = ${total}, so ${total} ÷ ${table} = **${b}**.`,
      };
    },
  },
  {
    key: "tt-div-family",
    skill: S.division,
    difficulties: [2, 3],
    make: (r) => {
      const a = int(r, 3, 12);
      const b = int(r, 3, 12);
      const total = a * b;
      return {
        kind: "choose",
        prompt: `**${a} × ${b} = ${total}**. Which of these is also true?`,
        options: [
          { text: `${total} ÷ ${a} = ${b}` },
          { text: `${total} ÷ ${b} = ${b}`, feedback: `${total} ÷ ${b} gives ${a}, not ${b}.` },
          { text: `${a} ÷ ${b} = ${total}`, misconception: M.divMult, feedback: "Start with the big number when you divide." },
          { text: `${total} × ${a} = ${b}`, misconception: M.divMult, feedback: "Multiplying makes it bigger. To undo times, divide." },
        ].filter((o, i, all) => all.findIndex((x) => x.text === o.text) === i),
        answer: 0,
        hint: "Division undoes multiplication: start with the answer and divide by one of the numbers.",
        explanation: `If ${a} × ${b} = ${total}, then **${total} ÷ ${a} = ${b}** and ${total} ÷ ${b} = ${a}.`,
      };
    },
  },
];

export const timesTables = defineTopic({
  id: T,
  title: "Times tables",
  subtitle: "Every table to 12 × 12, learned in families with the patterns that make them stick",
  world: "calc",
  years: [2, 3, 4],
  order: 2,
  icon: "times",
  skills: [
    { id: S.easy, title: "2, 5 and 10 times tables", description: "Know the 2, 5 and 10 times tables and see them as arrays.", lessonId: "two-five-ten" },
    { id: S.doubling, title: "3, 4 and 8 times tables", description: "Know the 3s, and get the 4s and 8s by doubling.", lessonId: "three-four-eight" },
    { id: S.tricky, title: "6, 7 and 9 times tables", description: "Know the 6s, 7s and 9s, with tricks for the hard ones.", lessonId: "six-seven-nine" },
    { id: S.big, title: "11 and 12 times tables", description: "Know the 11s and 12s using patterns and partitioning.", lessonId: "eleven-twelve" },
    { id: S.division, title: "Division facts", description: "Use times tables to divide, and see fact families.", lessonId: "division-facts" },
  ],
  lessonIcons: { "two-five-ten": "star", "three-four-eight": "dice", "six-seven-nine": "bulb", "eleven-twelve": "trophy", "division-facts": "divide" },
  lessons: [
    {
      id: "two-five-ten",
      title: "2s, 5s and 10s",
      phase: "Understand",
      summary: "Times means groups of the same size.",
      minutes: 6,
      objectives: ["Know the 2, 5 and 10 times tables", "See multiplication as equal rows"],
      steps: [
        {
          type: "explain",
          title: "Rows of dots",
          body: ["**5 × 3** means 5 lots of 3, or 3 lots of 5. This array has **5 rows of 3**: 15 dots.", "Turn it round and it is 3 rows of 5: still 15. The order doesn't matter."],
          visual: { kind: "array", rows: 5, cols: 3 },
        },
        {
          type: "explain",
          title: "Spot the patterns",
          body: ["The **5s** always end in 5 or 0. The **10s** always end in 0.", "The **2s** are the even numbers: 2, 4, 6, 8, 10…"],
          visual: { kind: "times-row", table: 5, upTo: 10 },
          tip: "Count in 5s on your fingers, or think half of the 10s.",
        },
        { type: "check", title: "Your turn", questionId: gen("tt-array", 1, 3) },
        { type: "check", title: "One more", questionId: gen("tt-easy", 1, 7) },
      ],
    },
    {
      id: "three-four-eight",
      title: "3s, 4s and 8s",
      phase: "Visualise",
      summary: "The 4s are double the 2s, and the 8s are double the 4s.",
      minutes: 7,
      objectives: ["Know the 3, 4 and 8 times tables", "Double to get the 4s and 8s"],
      steps: [
        {
          type: "explain",
          title: "Double, double",
          body: ["**2 × 6 = 12**. Double it: **4 × 6 = 24**. Double again: **8 × 6 = 48**.", "If you know your 2s, you can always work out the 4s and 8s."],
          visual: { kind: "times-row", table: 4, upTo: 10 },
        },
        {
          type: "worked",
          title: "Let's do it together",
          support: "faded",
          problem: "**8 × 7**",
          steps: [
            { text: "2 × 7 = 14." },
            { text: "Double it for 4 × 7.", blank: { prompt: "What is 4 × 7?", answer: 28, hint: "Double 14.", worked: "4 × 7 = **28**." } },
            { text: "Double again for 8 × 7: 56." },
          ],
          conclusion: "8 × 7 = **56**.",
        },
        { type: "check", title: "Your turn", questionId: gen("tt-doubling", 1, 4) },
        { type: "check", title: "One more", questionId: gen("tt-doubling-row", 2, 8) },
      ],
    },
    {
      id: "six-seven-nine",
      title: "6s, 7s and 9s",
      phase: "Explore",
      summary: "Tricks for the tricky ones.",
      minutes: 8,
      objectives: ["Know the 6, 7 and 9 times tables", "Use a fact you know to find one you don't"],
      steps: [
        {
          type: "explain",
          title: "The 9s trick",
          body: ["**9 × n** is the same as **10 × n, take away n**. So 9 × 7 = 70 − 7 = **63**.", "The digits of the 9s always add up to 9: 18, 27, 36, 45…"],
          visual: { kind: "times-row", table: 9, upTo: 10 },
          tip: "Hold up 10 fingers and fold down the 7th: 6 on the left, 3 on the right. 63!",
        },
        {
          type: "explain",
          title: "Use a fact you know",
          body: ["Stuck on **6 × 7**? You know 5 × 7 = 35. Add one more 7: **42**.", "Stuck on **7 × 8**? Remember **5, 6, 7, 8**: 56 = 7 × 8."],
        },
        { type: "check", title: "Your turn", questionId: gen("tt-tricky", 2, 3) },
        { type: "check", title: "One more", questionId: gen("tt-tricky-missing", 2, 9) },
      ],
    },
    {
      id: "eleven-twelve",
      title: "11s and 12s",
      phase: "Practise",
      summary: "The 11s repeat the digit; the 12s are 10s plus 2s.",
      minutes: 7,
      objectives: ["Know the 11 and 12 times tables", "Partition to multiply by 12"],
      steps: [
        {
          type: "explain",
          title: "Patterns to the rescue",
          body: ["Up to 9, the **11s** just repeat the digit: 11 × 4 = **44**, 11 × 7 = **77**.", "**12 × n = 10 × n + 2 × n**. So 12 × 7 = 70 + 14 = **84**."],
          visual: { kind: "bar", total: "12 × 7", parts: [{ label: "10 × 7 = 70", size: 10, tone: "brand" }, { label: "2 × 7 = 14", size: 2.6, tone: "num" }] },
        },
        { type: "check", title: "Your turn", questionId: gen("tt-big", 1, 5) },
        { type: "check", title: "One more", questionId: gen("tt-big", 3, 8) },
      ],
    },
    {
      id: "division-facts",
      title: "Division facts",
      phase: "Apply",
      summary: "Every times fact gives you two division facts.",
      minutes: 7,
      objectives: ["Divide using times tables", "Write the fact family for a multiplication"],
      steps: [
        {
          type: "explain",
          title: "Undo the times",
          body: ["**6 × 4 = 24** means 24 can be split into 6 groups of 4. So **24 ÷ 6 = 4** and **24 ÷ 4 = 6**."],
          visual: { kind: "groups", groups: 6, each: 4, label: "24 in 6 groups of 4" },
          tip: "To divide, ask: what times this number makes the big one?",
        },
        { type: "check", title: "Your turn", questionId: gen("tt-div", 1, 6) },
        { type: "check", title: "One more", questionId: gen("tt-div-family", 2, 2) },
      ],
    },
  ],
  templates,
  misconceptions: [
    { id: M.added, name: "Adding instead of multiplying", possibleCause: "It looks like the numbers were added, not multiplied.", description: "Says 7 × 8 = 15.", explanation: ["Times means groups: 7 × 8 is 8 lots of 7.", "That is 56, much more than 7 + 8."], skills: [S.easy, S.doubling, S.tricky, S.big], followUpTemplates: ["tt-array", "tt-easy"] },
    { id: M.step, name: "One step out", possibleCause: "It looks like you counted one step too many or too few.", description: "Gives a neighbouring fact, e.g. 7 × 8 = 49 or 63.", explanation: ["Check against a fact you know for sure.", "7 × 8 is one more 7 than 7 × 7 = 49, so 56."], skills: [S.doubling, S.tricky, S.big, S.division], followUpTemplates: ["tt-doubling-row", "tt-tricky"] },
    { id: M.divMult, name: "Multiplying when dividing", possibleCause: "It looks like the numbers were multiplied instead of divided.", description: "Works out 24 ÷ 6 as 144.", explanation: ["Dividing shares or groups: the answer is smaller.", "24 ÷ 6 asks what times 6 makes 24: 4."], skills: [S.division, S.tricky, S.big], followUpTemplates: ["tt-div", "tt-div-family"] },
  ],
  placement: [
    { lessonId: "two-five-ten", template: "tt-easy" },
    { lessonId: "three-four-eight", template: "tt-doubling" },
    { lessonId: "six-seven-nine", template: "tt-tricky" },
    { lessonId: "eleven-twelve", template: "tt-big" },
    { lessonId: "division-facts", template: "tt-div" },
  ],
});
