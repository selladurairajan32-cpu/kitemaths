import { defineTopic, genFor, int, pick, withHints } from "@/topics/kit/define";
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

const baseTemplates: Template[] = [
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
  /* D-037 (Phase B): a stretch question for every skill. */
  {
    key: "tt-easy-stretch",
    skill: S.easy,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const k = int(r, 2, 8);
      return {
        kind: "number",
        prompt: `I am in the **2 times table**, the **5 times table** and the **10 times table**. I am between **${10 * k + 1}** and **${10 * k + 12}**. What number am I?`,
        answer: 10 * (k + 1),
        traps: [{ value: 10 * k + 5, feedback: "That is in the 5 times table, but not the 2s or 10s." }],
        hint: "Numbers in the 10 times table are also in the 2s and the 5s.",
        explanation: `The only multiple of 10 in that range is **${10 * (k + 1)}**.`,
      };
    },
  },
  {
    key: "tt-doubling-stretch",
    skill: S.doubling,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const n = int(r, 3, 9);
      return {
        kind: "number",
        prompt: `**4 × ${n} = ${4 * n}**. Use doubling to work out **16 × ${n}**.`,
        answer: 16 * n,
        traps: [{ value: 8 * n, misconception: M.step, feedback: `Double once gives 8 × ${n}. Double again for 16 × ${n}.` }, { value: 4 * n + 12, misconception: M.added, feedback: "16 is 4 doubled twice, so double the answer twice." }],
        hint: "16 is 4 doubled, and doubled again.",
        explanation: `4 × ${n} = ${4 * n}; 8 × ${n} = ${8 * n}; 16 × ${n} = **${16 * n}**.`,
      };
    },
  },
  {
    key: "tt-tricky-stretch",
    skill: S.tricky,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const rows = pick(r, [6, 7, 9]);
      const cols = pick(r, [6, 7, 8, 9]);
      const eaten = int(r, 3, 9);
      return {
        kind: "number",
        prompt: `A box holds **${rows} rows of ${cols} chocolates**. **${eaten}** are eaten. How many are left?`,
        visual: { kind: "array", rows, cols },
        answer: rows * cols - eaten,
        traps: [{ value: rows * cols, feedback: `That's the full box. Take away the ${eaten} eaten.` }, { value: rows + cols - eaten, misconception: M.added, feedback: "Rows of chocolates: multiply, don't add." }].filter((t) => t.value > 0),
        hint: `First find ${rows} × ${cols}.`,
        explanation: `${rows} × ${cols} = ${rows * cols}; ${rows * cols} − ${eaten} = **${rows * cols - eaten}**.`,
      };
    },
  },
  {
    key: "tt-big-stretch",
    skill: S.big,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const t = pick(r, [11, 12]);
      const n = int(r, 9, 12);
      return {
        kind: "number",
        prompt: `**${t} × ${n} = ${t * n}**. What is **${t} × ${n + 1}**?`,
        answer: t * (n + 1),
        traps: [{ value: t * n + 1, misconception: M.added, feedback: `One more lot of ${t}, not one more.` }],
        hint: `${t} × ${n + 1} is one more ${t} than ${t} × ${n}.`,
        explanation: `${t * n} + ${t} = **${t * (n + 1)}**.`,
      };
    },
  },
  {
    key: "tt-division-stretch",
    skill: S.division,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const kids = int(r, 3, 9);
      const each = 2 * int(r, 2, 6);
      return {
        kind: "number",
        prompt: `**${kids * each} stickers** are shared equally between **${kids} children**. Each child then shares their stickers equally with a friend. How many stickers does each friend get?`,
        answer: each / 2,
        traps: [{ value: each, misconception: M.step, feedback: "Each child shares again with a friend: halve it." }, { value: kids * each * kids, misconception: M.divMult, feedback: "Sharing means dividing." }],
        hint: `First work out ${kids * each} ÷ ${kids}.`,
        explanation: `${kids * each} ÷ ${kids} = ${each}; half of ${each} is **${each / 2}**.`,
      };
    },
  },
  {
    key: "tt-meaning-stretch",
    skill: S.meaning,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const [a, b] = pick(r, [[4, 6], [3, 8], [6, 2], [5, 4]]) as [number, number];
      const other = [[3, 8], [4, 6], [2, 6], [4, 5]].find(([x, y]) => x * y === a * b && !(x === a && y === b) && !(x === b && y === a)) ?? [a * b, 1];
      return {
        kind: "choose",
        prompt: `Which of these is **not** the same as **${a} × ${b}**?`,
        options: [
          { text: `${a} + ${b}`, misconception: M.added, feedback: "Adding the numbers isn't the same as multiplying them." },
          { text: Array.from({ length: a }, () => b).join(" + "), feedback: `${a} lots of ${b} is ${a} × ${b}.` },
          { text: Array.from({ length: b }, () => a).join(" + "), feedback: `${b} lots of ${a} is also ${a * b}.` },
          { text: `${other[0]} × ${other[1]}`, feedback: `${other[0]} × ${other[1]} is also ${a * b}.` },
        ],
        answer: 0,
        hint: `Work out each one. Which doesn't make ${a * b}?`,
        explanation: `${a} × ${b} = ${a * b}, but **${a} + ${b}** = ${a + b}.`,
      };
    },
  },
  {
    key: "tt-laws-stretch",
    skill: S.laws,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const a = int(r, 6, 9);
      const b = pick(r, [12, 13, 14, 15]);
      return {
        kind: "choose",
        prompt: `Which calculation gives the same answer as **${a} × ${b}**?`,
        options: [
          { text: `${a} × 10 + ${a} × ${b - 10}` },
          { text: `${a} × 10 + ${b - 10}`, misconception: M.added, feedback: `Multiply both parts by ${a}: the ${b - 10} as well as the 10.` },
          { text: `${a} + ${b}`, misconception: M.added, feedback: "Adding isn't the same as multiplying." },
          { text: `${a} × ${b - 10} × 10`, feedback: "Split the number into parts and add the two answers." },
        ],
        answer: 0,
        hint: `Split ${b} into 10 and ${b - 10}. Multiply each part by ${a}.`,
        explanation: `${a} × ${b} = ${a} × 10 + ${a} × ${b - 10} = ${a * 10} + ${a * (b - 10)} = **${a * b}**.`,
      };
    },
  },
  {
    key: "tt-families-stretch",
    skill: S.families,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const a = int(r, 3, 9);
      const b = int(r, 3, 9);
      return {
        kind: "number",
        prompt: `**${a} × ${b} = ${a * b}**. Use this to work out **${a * b * 10} ÷ ${a}**.`,
        answer: b * 10,
        traps: [{ value: b, feedback: `${a * b * 10} is 10 times ${a * b}, so the answer is 10 times bigger.` }, { value: a * b * 10 * a, misconception: M.divMult, feedback: "Divide, don't multiply." }],
        hint: `${a * b * 10} is ten times ${a * b}.`,
        explanation: `${a * b} ÷ ${a} = ${b}, so ${a * b * 10} ÷ ${a} = **${b * 10}**.`,
      };
    },
  },
];

const templates = withHints(baseTemplates, {
  "tt-groups": () => ["Count how many groups, and how many in each.", "Groups × number in each group."],
  "tt-repeat": () => ["The same number added again and again is multiplication.", "Count how many times it is added."],
  "tt-jumps": () => ["Count the jumps and the size of each jump.", "Jumps × size of each jump."],
  "tt-scale": () => ["'Times as long' means multiply.", "Multiply the length by how many times bigger."],
  "tt-commute": () => ["You can multiply in either order.", "Turn it round to a fact you know."],
  "tt-split": () => ["Split one number into parts you know.", "Multiply each part, then add."],
  "tt-split-total": () => ["Work out each part.", "Add the parts together."],
  "tt-share": () => ["Sharing equally means dividing.", "How many does each one get?"],
  "tt-group": () => ["Grouping means dividing.", "How many groups of that size fit?"],
  "tt-family-odd": () => ["A fact family uses the same three numbers.", "Which fact uses a different number?"],
  "tt-family-why": () => ["Division undoes multiplication.", "If a × b = c, then c ÷ a = b."],
  "tt-easy": () => ["Count in 2s, 5s or 10s.", "The 5s end in 5 or 0; the 10s end in 0."],
  "tt-easy-row": () => ["Count up in that table.", "Each step adds the same amount."],
  "tt-array": () => ["Count the rows and the dots in each row.", "Rows × dots in a row."],
  "tt-doubling": () => ["Double your 2s to get the 4s.", "Double the 4s to get the 8s."],
  "tt-doubling-row": () => ["Each 4s answer is double the 2s answer.", "Each 8s answer is double the 4s answer."],
  "tt-tricky": () => ["Use a fact you know nearby, like 5 × or 10 ×.", "Add or take away one more lot."],
  "tt-tricky-missing": () => ["Count up in the table until you reach the answer.", "Or divide the answer by the number you know."],
  "tt-big": () => ["11s: up to 9, the digit repeats.", "12 × n = 10 × n + 2 × n."],
  "tt-big-missing": () => ["Count up in 11s or 12s.", "Or use 10 × and add on."],
  "tt-div": () => ["Think of the times fact.", "Which number times the divisor gives the answer?"],
  "tt-div-family": () => ["Use the three numbers of the fact family.", "Division undoes multiplication."],
  "tt-easy-stretch": () => ["Numbers in the 10s are also in the 2s and the 5s.", "Find the multiple of 10 in the range."],
  "tt-doubling-stretch": () => ["Double 4 × to get 8 ×.", "Double 8 × to get 16 ×."],
  "tt-tricky-stretch": () => ["Find how many chocolates in a full box.", "Take away the ones eaten."],
  "tt-big-stretch": () => ["One more lot of the table.", "Add the table number to the answer you know."],
  "tt-division-stretch": () => ["Share between the children first.", "Then halve each share."],
  "tt-meaning-stretch": () => ["Times can be repeated adding, either way round.", "Look for the one that adds the two numbers."],
  "tt-laws-stretch": () => ["Split the bigger number into 10 and the rest.", "Both parts must be multiplied."],
  "tt-families-stretch": () => ["Use the times fact backwards.", "Ten times bigger in, ten times bigger out."],
});

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
        {
          type: "worked",
          title: "Watch me: 5 bags of 4 apples",
          support: "full",
          problem: "**5 bags** with **4 apples** in each. How many apples?",
          visual: { kind: "groups", groups: 5, each: 4, label: "5 groups of 4" },
          steps: [{ text: "Every bag has the same number: 4. That makes it a multiplication." }, { text: "5 groups of 4: 4 + 4 + 4 + 4 + 4 = **20**, or 5 × 4 = **20**." }],
          conclusion: "There are **20** apples.",
        },
        {
          type: "worked",
          title: "Together: 3 jumps of 5",
          support: "faded",
          problem: "Jump in **5s** from 0, three times. Where do you land?",
          steps: [{ text: "Three jumps of 5 is 3 × 5.", blank: { prompt: "3 × 5 = ?", answer: 15, hint: "5, 10, 15", traps: [{ value: 8, misconception: M.added, feedback: "3 + 5 adds the numbers. Three jumps of 5 is 5 + 5 + 5." }], worked: "**15**." } }],
          conclusion: "You land on **15**.",
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
        {
          type: "worked",
          title: "Watch me: 7 × 5",
          support: "full",
          problem: "Work out **7 × 5**.",
          visual: { kind: "times-row", table: 5, upTo: 7 },
          steps: [{ text: "Count in 5s seven times: 5, 10, 15, 20, 25, 30, **35**." }, { text: "Check: the 5s end in 5 or 0, and 35 does." }],
          conclusion: "7 × 5 = **35**.",
        },
        {
          type: "worked",
          title: "Together: 6 × 10",
          support: "faded",
          problem: "Work out **6 × 10**.",
          steps: [{ text: "Count in 10s six times: 10, 20, 30…", blank: { prompt: "6 × 10 = ?", answer: 60, hint: "The 10s end in 0.", traps: [{ value: 16, misconception: M.added, feedback: "6 + 10 adds them. 6 lots of 10 is 60." }], worked: "**60**." } }],
          conclusion: "6 × 10 = **60**.",
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
          body: ["**2 × 6 = 12**. Double it: **4 × 6 = 24**. Double again: **8 × 6 = 48**.", "If you know your 2s, you can always work out the 4s and 8s.", "The 3s are a skip count too: 3, 6, 9, 12… and 3 × a number is double it plus one more."],
          visual: { kind: "times-row", table: 4, upTo: 10 },
        },
        {
          type: "worked",
          title: "Let's do it together",
          support: "faded",
          problem: "**8 × 7**",
          steps: [
            { text: "2 × 7 = 14." },
            { text: "Double it for 4 × 7.", blank: { prompt: "What is 4 × 7?", answer: 28, hint: "Double 14.", traps: [{ value: 16, misconception: M.added, feedback: "Double 14 is 28: 14 + 14." }], worked: "4 × 7 = **28**." } },
            { text: "Double again for 8 × 7: 56." },
          ],
          conclusion: "8 × 7 = **56**.",
        },
        {
          type: "worked",
          title: "Watch me: 8 × 9",
          support: "full",
          problem: "Work out **8 × 9** by doubling.",
          visual: { kind: "times-row", table: 8, upTo: 9 },
          steps: [{ text: "2 × 9 = **18**." }, { text: "Double: 4 × 9 = **36**. Double again: 8 × 9 = **72**." }],
          conclusion: "8 × 9 = **72**.",
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
            { text: "5 × 7 = 35.", blank: { prompt: "What is 3 × 7?", answer: 21, hint: "Count in 7s three times.", traps: [{ value: 10, misconception: M.added, feedback: "3 + 7 adds them. 3 lots of 7 is 21." }], worked: "3 × 7 = **21**." } },
            { text: "Add the parts: 35 + 21 = 56." },
          ],
          conclusion: "8 × 7 = **56**.",
        },
        {
          type: "worked",
          title: "Watch me: 4 × 9 or 9 × 4?",
          support: "full",
          problem: "Is **4 × 9** the same as **9 × 4**?",
          visual: { kind: "array", rows: 4, cols: 9 },
          steps: [{ text: "4 rows of 9 is 36 dots." }, { text: "Turn the array round: 9 rows of 4, still **36**." }],
          conclusion: "4 × 9 = 9 × 4 = **36**.",
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
        {
          type: "worked",
          title: "Watch me: 9 × 6",
          support: "full",
          problem: "Work out **9 × 6** with the 9s trick.",
          visual: { kind: "times-row", table: 9, upTo: 6 },
          steps: [{ text: "10 × 6 = **60**." }, { text: "9 × 6 is one 6 fewer: 60 − 6 = **54**." }],
          conclusion: "9 × 6 = **54**. Check: 5 + 4 = 9.",
        },
        {
          type: "worked",
          title: "Together: 6 × 8",
          support: "faded",
          problem: "Work out **6 × 8** from 5 × 8.",
          steps: [{ text: "5 × 8 = 40. Add one more 8.", blank: { prompt: "40 + 8 = ?", answer: 48, hint: "One more lot of 8", traps: [{ value: 46, misconception: M.step, feedback: "Add a whole 8, not 6." }], worked: "**48**." } }],
          conclusion: "6 × 8 = **48**.",
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
        {
          type: "worked",
          title: "Watch me: 12 × 8",
          support: "full",
          problem: "Work out **12 × 8**.",
          visual: { kind: "bar", total: "12 × 8", parts: [{ label: "10 × 8 = 80", size: 10, tone: "brand" }, { label: "2 × 8 = 16", size: 2, tone: "num" }] },
          steps: [{ text: "Split 12 into 10 and 2." }, { text: "10 × 8 = 80 and 2 × 8 = 16. 80 + 16 = **96**." }],
          conclusion: "12 × 8 = **96**.",
        },
        {
          type: "worked",
          title: "Together: 11 × 6",
          support: "faded",
          problem: "Work out **11 × 6**.",
          steps: [{ text: "Up to 9, the 11s repeat the digit.", blank: { prompt: "11 × 6 = ?", answer: 66, hint: "Repeat the 6.", traps: [{ value: 17, misconception: M.added, feedback: "11 + 6 adds them. 11 lots of 6 is 66." }], worked: "**66**." } }],
          conclusion: "11 × 6 = **66**.",
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
          body: ["**6 × 4 = 24** means 24 can be split into 6 groups of 4. So **24 ÷ 6 = 4** and **24 ÷ 4 = 6**.", "Every times fact gives you two division facts. When you divide, ask yourself: which number times the divisor makes the number I started with?"],
          visual: { kind: "groups", groups: 6, each: 4, label: "24 in 6 groups of 4" },
          tip: "To divide, ask: what times this number makes the big one?",
        },
        {
          type: "worked",
          title: "Watch me: 56 ÷ 7",
          support: "full",
          problem: "Work out **56 ÷ 7**.",
          visual: { kind: "groups", groups: 7, each: 8, label: "56 in 7 groups" },
          steps: [{ text: "Think: 7 × what = 56?" }, { text: "7 × 8 = 56, so 56 ÷ 7 = **8**." }],
          conclusion: "56 ÷ 7 = **8**.",
        },
        {
          type: "worked",
          title: "Together: 45 ÷ 5",
          support: "faded",
          problem: "Work out **45 ÷ 5**.",
          steps: [{ text: "5 × 9 = 45.", blank: { prompt: "45 ÷ 5 = ?", answer: 9, hint: "Which number times 5 is 45?", traps: [{ value: 225, misconception: M.divMult, feedback: "That multiplies. Division undoes multiplication: 45 ÷ 5 = 9." }], worked: "**9**." } }],
          conclusion: "45 ÷ 5 = **9**.",
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
        {
          type: "worked",
          title: "Watch me: one fact, four facts",
          support: "full",
          problem: "Write the fact family for **5, 6 and 30**.",
          visual: { kind: "array", rows: 5, cols: 6 },
          steps: [{ text: "5 × 6 = 30 and 6 × 5 = 30." }, { text: "30 ÷ 5 = 6 and 30 ÷ 6 = 5." }],
          conclusion: "Four facts from **5, 6 and 30**.",
        },
        {
          type: "worked",
          title: "Together: boxes of 4",
          support: "faded",
          problem: "**20 pens** go into boxes of **4**. How many boxes?",
          steps: [{ text: "Grouping: how many 4s make 20?", blank: { prompt: "20 ÷ 4 = ?", answer: 5, hint: "4 × 5 = 20", traps: [{ value: 80, misconception: M.divMult, feedback: "That multiplies. Grouping is dividing: 20 ÷ 4." }], worked: "**5** boxes." } }],
          conclusion: "You fill **5** boxes.",
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
