import { defineTopic, genFor, int, pick } from "@/topics/kit/define";
import type { Difficulty, Rng, Template } from "@/topics/kit/types";

/** Times tables up to 12 × 12, learned by family with the patterns that make them stick, plus division facts. */

const T = "times-tables";
const gen = genFor(T);
const S = {
  easy: `${T}.two-five-ten`, doubling: `${T}.three-four-eight`, tricky: `${T}.six-seven-nine`, big: `${T}.eleven-twelve`, division: `${T}.division-facts`,
  // R2 (TT-002, TT-003): what multiplying means, the laws that link facts, and division as sharing and grouping.
  meaning: `${T}.meaning`, laws: `${T}.laws`, families: `${T}.fact-families`,
};
const M = { added: `${T}.added-not-multiplied`, step: `${T}.one-step-out`, divMult: `${T}.multiplied-not-divided` };
/** For the fact screens (R2), which record answers against these skills and misconceptions. */
export const TT_SKILLS = S;
export const TT_MISCONCEPTIONS = M;

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

/** TT-002: multiplication as equal groups, repeated addition, jumps on a number line and scaling. */
const meaningTemplates: Template[] = [
  {
    key: "tt-groups",
    skill: S.meaning,
    difficulties: [1, 2],
    make: (r, { difficulty }) => {
      const groups = int(r, 2, difficulty === 1 ? 5 : 8);
      const each = int(r, 2, difficulty === 1 ? 5 : 9);
      return {
        kind: "number",
        prompt: `**${groups} groups of ${each}**. How many altogether?`,
        visual: { kind: "groups", groups, each, label: `${groups} groups of ${each}` },
        answer: groups * each,
        traps: [{ value: groups + each, misconception: M.added, feedback: `That's ${groups} add ${each}. There are ${groups} groups, with ${each} in each.` }].filter((t) => t.value !== groups * each),
        hint: `Count in ${each}s, once for each group.`,
        explanation: `${groups} groups of ${each} is ${groups} × ${each} = **${groups * each}**.`,
      };
    },
  },
  {
    key: "tt-repeat",
    skill: S.meaning,
    difficulties: [1, 2],
    make: (r, { difficulty }) => {
      const n = int(r, 3, difficulty === 1 ? 5 : 7);
      const v = int(r, 2, difficulty === 1 ? 5 : 9);
      const sum = Array.from({ length: n }, () => v).join(" + ");
      return {
        kind: "choose",
        prompt: `Which is the same as **${sum}**?`,
        options: [
          { text: `${n} × ${v}` },
          { text: `${n} + ${v}`, misconception: M.added, feedback: `${n} + ${v} adds the two numbers once. The sum has ${n} lots of ${v}.` },
          { text: `${v} × ${v}`, feedback: `That's ${v} lots of ${v}. Count how many ${v}s are added: ${n}.` },
          { text: `${n + 1} × ${v}`, misconception: M.step, feedback: `Count again: there are ${n} lots of ${v}, not ${n + 1}.` },
        ].filter((o, i, all) => all.findIndex((x) => x.text === o.text) === i),
        answer: 0,
        hint: `Count how many ${v}s are added together.`,
        explanation: `${n} lots of ${v} is **${n} × ${v}** = ${n * v}.`,
      };
    },
  },
  {
    key: "tt-jumps",
    skill: S.meaning,
    difficulties: [2, 3],
    make: (r, { difficulty }) => {
      const step = int(r, 2, difficulty === 2 ? 5 : 9);
      const n = int(r, 3, difficulty === 2 ? 6 : 9);
      return {
        kind: "number",
        prompt: `Kip jumps along the number line in **${step}s**, starting at 0. Where does Kip land after **${n} jumps**?`,
        visual: {
          kind: "line", min: 0, max: step * n, step,
          jumps: Array.from({ length: n }, (_, i) => ({ from: i * step, to: (i + 1) * step })),
          unknown: step * n,
        },
        answer: step * n,
        traps: [
          { value: step + n, misconception: M.added, feedback: `That adds ${step} and ${n}. Each of the ${n} jumps is ${step} long.` },
          { value: step * (n - 1), misconception: M.step, feedback: `That's ${n - 1} jumps. Count all ${n}.` },
        ].filter((t) => t.value !== step * n),
        hint: `Each jump adds ${step}. Count ${n} jumps of ${step}.`,
        explanation: `${n} jumps of ${step} is ${n} × ${step} = **${step * n}**.`,
      };
    },
  },
  {
    key: "tt-scale",
    skill: S.meaning,
    difficulties: [2, 3],
    make: (r, { difficulty }) => {
      const base = int(r, 2, difficulty === 2 ? 6 : 12);
      const times = int(r, 2, difficulty === 2 ? 5 : 9);
      const thing = pick(r, [["ribbon", "cm"], ["path", "m"], ["snake", "cm"], ["rope", "m"]] as const);
      return {
        kind: "number",
        prompt: `A red ${thing[0]} is **${base} ${thing[1]}** long. A blue ${thing[0]} is **${times} times as long**. How long is the blue ${thing[0]}, in ${thing[1]}?`,
        visual: { kind: "bar", parts: Array.from({ length: times }, () => ({ label: `${base} ${thing[1]}`, size: 1, tone: "brand" as const })), total: `${times} × ${base} ${thing[1]}`, note: `red: ${base} ${thing[1]}` },
        answer: base * times,
        traps: [{ value: base + times, misconception: M.added, feedback: `${times} times as long means ${times} lots of ${base}, not ${times} more.` }].filter((t) => t.value !== base * times),
        hint: `${times} times as long means ${times} lots of the red one.`,
        explanation: `${times} × ${base} = **${times * base}** ${thing[1]}.`,
      };
    },
  },
];

/** TT-002: commutativity and the distributive law, linked to facts the child knows. */
const lawTemplates: Template[] = [
  {
    key: "tt-commute",
    skill: S.laws,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const a = int(r, 2, upTo(difficulty));
      const b = int(r, 3, 12);
      return {
        kind: "number",
        prompt: `**${a} × ${b} = ${a * b}**. What is **${b} × ${a}**?`,
        visual: difficulty === 1 && a * b <= 60 ? { kind: "array", rows: a, cols: b } : undefined,
        answer: a * b,
        traps: [{ value: a * b + a, misconception: M.step, feedback: `Turning it round doesn't change the answer: ${b} × ${a} is still ${a * b}.` }, { value: a + b, misconception: M.added, feedback: "That adds the numbers. Times in either order gives the same answer." }].filter((t) => t.value !== a * b),
        hint: "Turn the array round: the number of dots stays the same.",
        explanation: `Multiplying works in either order, so ${b} × ${a} = **${a * b}**.`,
      };
    },
  },
  {
    key: "tt-split",
    skill: S.laws,
    difficulties: [2, 3],
    make: (r, { difficulty }) => {
      const a = int(r, 6, difficulty === 2 ? 9 : 12);
      const b = int(r, 3, 9);
      const known = a <= 9 ? 5 : 10;
      return {
        kind: "number",
        prompt: `**${a} × ${b}** is the same as **${known} × ${b} + ? × ${b}**. What is the missing number?`,
        visual: { kind: "bar", total: `${a} × ${b}`, parts: [{ label: `${known} × ${b}`, size: known, tone: "brand" }, { label: `? × ${b}`, size: a - known, tone: "num" }] },
        answer: a - known,
        traps: [{ value: a, feedback: `That would make ${known + a} lots of ${b}. Split ${a} into ${known} and what?` }, { value: b, feedback: `Split the ${a}, not the ${b}: ${a} = ${known} + ?` }].filter((t, i, all) => t.value !== a - known && all.findIndex((x) => x.value === t.value) === i),
        hint: `${a} = ${known} + ?`,
        explanation: `${a} = ${known} + ${a - known}, so ${a} × ${b} = ${known} × ${b} + **${a - known}** × ${b}.`,
      };
    },
  },
  {
    key: "tt-split-total",
    skill: S.laws,
    difficulties: [2, 3],
    make: (r, { difficulty }) => {
      const b = int(r, 3, 9);
      const a = difficulty === 2 ? int(r, 6, 9) : pick(r, [11, 12]);
      const known = a <= 9 ? 5 : 10;
      const rest = a - known;
      return {
        kind: "number",
        prompt: `Use **${known} × ${b} = ${known * b}** and **${rest} × ${b} = ${rest * b}**. What is **${a} × ${b}**?`,
        answer: a * b,
        traps: [{ value: known * b + rest, misconception: M.added, feedback: `Add the two parts: ${known * b} + ${rest * b}.` }, { value: known * b * rest, feedback: `Add the two parts, don't multiply them: ${known * b} + ${rest * b}.` }].filter((t, i, all) => t.value !== a * b && all.findIndex((x) => x.value === t.value) === i),
        hint: `${a} lots of ${b} is ${known} lots plus ${rest} lots.`,
        explanation: `${known * b} + ${rest * b} = **${a * b}**, so ${a} × ${b} = ${a * b}.`,
      };
    },
  },
];

/** TT-003: division as sharing and as grouping, fact families, and why multiplying tells you the division. */
const familyTemplates: Template[] = [
  {
    key: "tt-share",
    skill: S.families,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const people = int(r, 2, difficulty === 1 ? 5 : difficulty === 2 ? 8 : 12);
      const each = int(r, 2, difficulty === 1 ? 5 : 12);
      const total = people * each;
      const thing = pick(r, ["sweets", "stickers", "marbles", "cards"]);
      return {
        kind: "number",
        prompt: `**${total} ${thing}** are shared equally between **${people} children**. How many does each child get?`,
        visual: difficulty === 1 ? { kind: "groups", groups: people, each, label: `${total} shared between ${people}` } : undefined,
        answer: each,
        traps: [{ value: total * people, misconception: M.divMult, feedback: `Sharing makes smaller amounts: ${total} ÷ ${people}.` }, { value: total - people, feedback: `Share, don't take away: ${total} ÷ ${people}.` }].filter((t, i, all) => t.value !== each && t.value > 0 && all.findIndex((x) => x.value === t.value) === i),
        hint: `What times ${people} makes ${total}?`,
        explanation: `Sharing ${total} between ${people}: ${total} ÷ ${people} = **${each}** each, because ${people} × ${each} = ${total}.`,
      };
    },
  },
  {
    key: "tt-group",
    skill: S.families,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const size = int(r, 2, difficulty === 1 ? 5 : difficulty === 2 ? 8 : 12);
      const bags = int(r, 2, difficulty === 1 ? 5 : 12);
      const total = size * bags;
      const thing = pick(r, ["eggs", "pencils", "apples", "beads"]);
      const box = pick(r, ["boxes", "packs", "bags", "jars"]);
      return {
        kind: "number",
        prompt: `**${total} ${thing}** are put into ${box} of **${size}**. How many ${box} are filled?`,
        visual: difficulty === 1 ? { kind: "groups", groups: bags, each: size, label: `${total} in groups of ${size}` } : undefined,
        answer: bags,
        traps: [{ value: total * size, misconception: M.divMult, feedback: `Grouping makes fewer, not more: how many ${size}s make ${total}?` }, { value: size, feedback: `${size} is how many go in each. How many ${box}?` }].filter((t, i, all) => t.value !== bags && all.findIndex((x) => x.value === t.value) === i),
        hint: `How many groups of ${size} make ${total}?`,
        explanation: `${total} ÷ ${size} = **${bags}** ${box}, because ${bags} × ${size} = ${total}.`,
      };
    },
  },
  {
    key: "tt-family-odd",
    skill: S.families,
    difficulties: [2, 3],
    make: (r, { difficulty }) => {
      const a = int(r, 3, difficulty === 2 ? 9 : 12);
      let b = int(r, 3, difficulty === 2 ? 9 : 12);
      if (b === a) b = a === 12 ? 11 : a + 1;
      const p = a * b;
      const odd = pick(r, [`${a} ÷ ${p} = ${b}`, `${p} × ${a} = ${b}`, `${p} ÷ ${a} = ${a}`]);
      const truths = [`${a} × ${b} = ${p}`, `${b} × ${a} = ${p}`, `${p} ÷ ${a} = ${b}`, `${p} ÷ ${b} = ${a}`];
      const shown = [odd, ...truths.slice(0, 3)];
      return {
        kind: "choose",
        prompt: `Which is **not** part of the fact family for **${a}, ${b} and ${p}**?`,
        options: shown.map((text, i) => (i === 0 ? { text } : { text, feedback: `${text} is true: it belongs to the family.` })),
        answer: 0,
        hint: `The family has two times facts and two division facts, always starting division with ${p}.`,
        explanation: `The family is ${truths.join(", ")}. **${odd}** is not true.`,
      };
    },
  },
  {
    key: "tt-family-why",
    skill: S.families,
    difficulties: [3],
    make: (r) => {
      const a = int(r, 3, 12);
      let b = int(r, 3, 12);
      if (b === a) b = a === 12 ? 11 : a + 1;
      const p = a * b;
      return {
        kind: "choose",
        prompt: `**${a} × ${b} = ${p}**. Why does that tell you **${p} ÷ ${b} = ${a}**?`,
        options: [
          { text: `${a} groups of ${b} make ${p}, so ${p} split into groups of ${b} makes ${a} groups.` },
          { text: `Because ${p} − ${b} = ${a}.`, feedback: `${p} − ${b} is ${p - b}. Division undoes multiplying, not adding.` },
          { text: `Because you always divide by the bigger number.`, feedback: `You can divide by either number in the family: ${p} ÷ ${a} = ${b} too.` },
          { text: `Because ${a} + ${b} = ${p}.`, misconception: M.added, feedback: `${a} + ${b} is ${a + b}. The family comes from ${a} × ${b}.` },
        ],
        answer: 0,
        hint: "Division undoes multiplication.",
        explanation: `Dividing undoes multiplying: ${a} groups of ${b} make ${p}, so ${p} ÷ ${b} = **${a}**.`,
      };
    },
  },
];

const templates: Template[] = [
  ...meaningTemplates,
  ...lawTemplates,
  ...familyTemplates,
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
    { id: S.meaning, title: "What multiplying means", description: "See times as equal groups, repeated adding, jumps on a number line and scaling.", lessonId: "groups-and-jumps" },
    { id: S.laws, title: "Turn it round, split it up", description: "Multiply in either order, and split a fact into two you know.", lessonId: "turn-and-split" },
    { id: S.families, title: "Sharing, grouping and fact families", description: "Divide by sharing or grouping, and write the four facts in a family.", lessonId: "share-and-group" },
  ],
  lessonIcons: { "groups-and-jumps": "plus", "two-five-ten": "star", "three-four-eight": "dice", "turn-and-split": "puzzle", "six-seven-nine": "bulb", "eleven-twelve": "trophy", "division-facts": "divide", "share-and-group": "sweets" },
  lessons: [
    {
      id: "groups-and-jumps",
      title: "Groups, jumps and scaling",
      phase: "Understand",
      summary: "Times means equal groups: as adding, as jumps, as rows and as times as big.",
      minutes: 7,
      objectives: ["See multiplication as equal groups and repeated adding", "Use jumps on a number line and scaling for times"],
      steps: [
        {
          type: "explain",
          title: "Equal groups",
          body: ["**4 groups of 3** is 3 + 3 + 3 + 3 = 12. We write it **4 × 3 = 12**.", "Times only works when every group is the same size."],
          visual: { kind: "groups", groups: 4, each: 3, label: "4 groups of 3" },
        },
        {
          type: "explain",
          title: "Jumps on a number line",
          body: ["Jump in **3s** from 0, four times: 3, 6, 9, **12**. Four jumps of 3 is 4 × 3."],
          visual: { kind: "line", min: 0, max: 12, step: 3, jumps: [{ from: 0, to: 3 }, { from: 3, to: 6 }, { from: 6, to: 9 }, { from: 9, to: 12 }] },
        },
        {
          type: "explain",
          title: "Times as big",
          body: ["A ribbon **3 times as long** as a 4 cm ribbon is 3 lots of 4 cm: **12 cm**.", "Scaling is multiplying too."],
          visual: { kind: "bar", parts: [{ label: "4 cm", size: 1, tone: "brand" }, { label: "4 cm", size: 1, tone: "brand" }, { label: "4 cm", size: 1, tone: "brand" }], total: "3 × 4 cm = 12 cm" },
          tip: "Groups, adding, jumps and scaling are four ways of seeing the same fact.",
        },
        { type: "check", title: "Your turn", questionId: gen("tt-groups", 1, 2) },
        { type: "check", title: "One more", questionId: gen("tt-jumps", 2, 4) },
      ],
    },
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
      id: "turn-and-split",
      title: "Turn it round, split it up",
      phase: "Explain",
      summary: "Multiply in either order, and split a hard fact into two easy ones.",
      minutes: 8,
      objectives: ["Know that multiplying can be done in any order", "Split a fact into two facts you know and add them"],
      steps: [
        {
          type: "explain",
          title: "Turn it round",
          body: ["This array is **3 rows of 6**: 18 dots. Turn it round and it is **6 rows of 3**: still 18.", "So 3 × 6 = 6 × 3. If you know one, you know the other."],
          visual: { kind: "array", rows: 3, cols: 6 },
        },
        {
          type: "explain",
          title: "Split it up",
          body: ["**7 × 6** is 5 lots of 6 and 2 lots of 6: **30 + 12 = 42**.", "Split the number into parts you know, multiply each part, then add."],
          visual: { kind: "bar", total: "7 × 6", parts: [{ label: "5 × 6 = 30", size: 5, tone: "brand" }, { label: "2 × 6 = 12", size: 2, tone: "num" }] },
        },
        {
          type: "worked",
          title: "Let's do it together",
          support: "faded",
          problem: "**8 × 7**",
          steps: [
            { text: "Split 8 into 5 and 3." },
            { text: "5 × 7 = 35.", blank: { prompt: "What is 3 × 7?", answer: 21, hint: "Count in 7s three times.", worked: "3 × 7 = **21**." } },
            { text: "Add the parts: 35 + 21 = 56." },
          ],
          conclusion: "8 × 7 = **56**.",
        },
        { type: "check", title: "Your turn", questionId: gen("tt-commute", 1, 3) },
        { type: "check", title: "One more", questionId: gen("tt-split", 2, 5) },
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
    {
      id: "share-and-group",
      title: "Sharing, grouping and fact families",
      phase: "Apply",
      summary: "Two ways to divide, and the four facts every family gives you.",
      minutes: 8,
      objectives: ["Divide by sharing and by grouping", "Write and explain a fact family"],
      steps: [
        {
          type: "explain",
          title: "Sharing",
          body: ["**12 sweets shared between 3 children**: give one each, again and again. Each child gets **4**.", "12 ÷ 3 = 4."],
          visual: { kind: "groups", groups: 3, each: 4, label: "12 shared between 3" },
        },
        {
          type: "explain",
          title: "Grouping",
          body: ["**12 eggs in boxes of 3**: fill a box, then another. You fill **4** boxes.", "That's also 12 ÷ 3 = 4: the same division, a different question."],
          visual: { kind: "groups", groups: 4, each: 3, label: "12 in groups of 3" },
        },
        {
          type: "explain",
          title: "A fact family",
          body: ["**3, 4 and 12** make four facts: 3 × 4 = 12, 4 × 3 = 12, 12 ÷ 3 = 4 and 12 ÷ 4 = 3.", "Division undoes multiplication, so one fact gives you all four."],
          tip: "Division facts always start with the biggest number of the family.",
        },
        { type: "check", title: "Your turn", questionId: gen("tt-share", 1, 4) },
        { type: "check", title: "One more", questionId: gen("tt-family-why", 3, 1) },
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
    { lessonId: "groups-and-jumps", template: "tt-groups" },
    { lessonId: "two-five-ten", template: "tt-easy" },
    { lessonId: "three-four-eight", template: "tt-doubling" },
    { lessonId: "turn-and-split", template: "tt-commute" },
    { lessonId: "six-seven-nine", template: "tt-tricky" },
    { lessonId: "eleven-twelve", template: "tt-big" },
    { lessonId: "division-facts", template: "tt-div" },
    { lessonId: "share-and-group", template: "tt-group" },
  ],
});
