import { defineTopic, genFor, int, pick, withExtras, withHints } from "@/topics/kit/define";
import { twoUnknowns } from "./extra";
import type { ChooseOption, Template } from "@/topics/kit/types";
import { gcd } from "@/maths/fraction";

/** Ratio and algebra: ratio and sharing, scaling recipes, missing numbers and equations, formulas, and sequences. */

const T = "ratio-algebra";
const gen = genFor(T);
const S = { ratio: `${T}.ratio`, scale: `${T}.scaling`, equations: `${T}.equations`, formulas: `${T}.formulas`, sequences: `${T}.sequences` };
const M = { part: `${T}.ratio-parts`, add: `${T}.adding-not-scaling`, inverse: `${T}.wrong-inverse`, letters: `${T}.letter-next-to-number`, nth: `${T}.position-rule` };

function unique(right: string, wrong: ChooseOption[]): ChooseOption[] {
  const out: ChooseOption[] = [{ text: right }];
  for (const w of wrong) if (!out.some((o) => o.text === w.text)) out.push(w);
  return out.slice(0, 4);
}
const PAIRS = [
  ["Amy", "Ben"],
  ["Zara", "Leo"],
  ["Priya", "Sam"],
  ["Mia", "Noah"],
] as const;

const baseTemplates: Template[] = [
  {
    key: "ra-ratio",
    skill: S.ratio,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      if (difficulty === 1) {
        const a = int(r, 1, 4);
        let b = int(r, 2, 5);
        if (a === b) b += 1;
        const k = int(r, 2, 6);
        const [one, two] = pick(r, [["red beads", "blue beads"], ["cups of flour", "cups of milk"], ["boys", "girls"], ["cats", "dogs"]] as const);
        return {
          kind: "number",
          prompt: `For every **${a} ${one}** there are **${b} ${two}**. There are **${a * k} ${one}**. How many ${two} are there?`,
          visual: { kind: "bar", parts: [...Array.from({ length: a }, () => ({ label: "", tone: "brand" as const })), ...Array.from({ length: b }, () => ({ label: "", tone: "num" as const }))], note: `${a} ${one} : ${b} ${two}` },
          answer: b * k,
          traps: [{ value: a * k + (b - a), misconception: M.add, feedback: `Ratio means groups: ${a * k} is ${k} lots of ${a}, so you need ${k} lots of ${b}.` }, { value: a * k, misconception: M.part, feedback: "That's the other colour. Find how many groups there are first." }].filter((t) => t.value !== b * k),
          hint: `How many groups of ${a} are in ${a * k}? Each group comes with ${b} ${two}.`,
          explanation: `${a * k} ÷ ${a} = ${k} groups. ${k} × ${b} = **${b * k}**.`,
        };
      }
      if (difficulty === 2) {
        let a = int(r, 1, 5);
        let b = int(r, 2, 6);
        if (a === b) b += 1;
        if (gcd(a, b) > 1) a = 1;
        const k = int(r, 2, 9);
        const total = (a + b) * k;
        const [p, q] = pick(r, PAIRS);
        const askSecond = r() < 0.6;
        const answer = (askSecond ? b : a) * k;
        return {
          kind: "number",
          prompt: `${p} and ${q} share **${total} sweets** in the ratio **${a} : ${b}**. How many sweets does **${askSecond ? q : p}** get?`,
          visual: { kind: "bar", parts: [...Array.from({ length: a }, () => ({ label: p.charAt(0), tone: "brand" as const })), ...Array.from({ length: b }, () => ({ label: q.charAt(0), tone: "num" as const }))], total: `${total}` },
          answer,
          traps: [
            { value: (askSecond ? a : b) * k, misconception: M.part, feedback: `That's ${askSecond ? p : q}'s share. ${askSecond ? q : p} gets ${askSecond ? b : a} of the parts.` },
            ...(total % (askSecond ? b : a) === 0 ? [{ value: total / (askSecond ? b : a), misconception: M.part, feedback: `Divide by the total number of parts: ${a} + ${b} = ${a + b}.` }] : []),
          ].filter((t) => t.value !== answer),
          hint: `There are ${a} + ${b} = ${a + b} equal parts. Find one part first.`,
          explanation: `${a + b} parts make ${total}, so one part is ${total} ÷ ${a + b} = ${k}. ${askSecond ? q : p} has ${askSecond ? b : a} parts: **${answer}**.`,
        };
      }
      let a = int(r, 1, 5);
      let b = int(r, 2, 7);
      if (a === b) b += 1;
      const g = gcd(a, b);
      [a, b] = [a / g, b / g];
      const k = int(r, 2, 6);
      return {
        kind: "choose",
        prompt: `Write the ratio **${a * k} : ${b * k}** in its simplest form.`,
        options: unique(`${a} : ${b}`, [
          { text: `${b} : ${a}`, misconception: M.part, feedback: "Keep the numbers in the same order." },
          ...(k % 2 === 0 && k > 2 ? [{ text: `${(a * k) / 2} : ${(b * k) / 2}`, feedback: "That's the same ratio, but it can be simplified more." }] : [{ text: `${a * 2} : ${b * 2}`, feedback: "That's the same ratio, but not the simplest." }]),
          { text: `${a + 1} : ${b + 1}`, feedback: `Divide both numbers by the same number. Both divide by ${k}.` },
          { text: `${a * k - b * k > 0 ? a * k - b * k : b * k - a * k} : 1`, misconception: M.add, feedback: "Simplify by dividing both numbers, not taking away." },
        ]),
        answer: 0,
        hint: "What's the biggest number that divides into both?",
        explanation: `Both divide by ${k}: ${a * k} ÷ ${k} = ${a} and ${b * k} ÷ ${k} = ${b}. So **${a} : ${b}**.`,
      };
    },
  },
  {
    key: "ra-scale",
    skill: S.scale,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const [food, unit, per] = pick(r, [["flour", "g", 50], ["milk", "ml", 50], ["sugar", "g", 25], ["oats", "g", 20]] as const);
      const from = difficulty === 1 ? pick(r, [2, 4]) : difficulty === 2 ? pick(r, [2, 4, 6]) : pick(r, [3, 4, 5, 6]);
      const to = difficulty === 1 ? from * 2 : difficulty === 2 ? from + from / 2 : pick(r, [2, 7, 8, 9, 10].filter((x) => x !== from));
      const each = per * int(r, 1, 4);
      const amount = each * from;
      const answer = each * to;
      return {
        kind: "number",
        prompt: `A recipe for **${from} people** uses **${amount} ${unit}** of ${food}. How much ${food} is needed for **${to} people**?`,
        answer,
        unit,
        traps: [{ value: amount + (to - from), misconception: M.add, feedback: `More people means more of everything: scale up, don't just add ${to - from}.` }, { value: amount * to, feedback: `First find the amount for 1 person: ${amount} ÷ ${from}.` }].filter((t) => t.value !== answer),
        hint: difficulty === 1 ? `${to} people is double ${from}.` : `Find the amount for 1 person first: ${amount} ÷ ${from}.`,
        explanation: `For 1 person: ${amount} ÷ ${from} = ${each} ${unit}. For ${to} people: ${to} × ${each} = **${answer} ${unit}**.`,
      };
    },
  },
  {
    key: "ra-missing",
    skill: S.equations,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      if (difficulty === 1) {
        const op = pick(r, ["+", "−", "×"] as const);
        const n = op === "×" ? int(r, 2, 12) : int(r, 6, 60);
        const b = op === "×" ? int(r, 2, 12) : int(r, 4, 40);
        const result = op === "+" ? n + b : op === "−" ? n - b : n * b;
        if (op === "−" && result <= 0)
          return { kind: "number", prompt: `**___ + ${b} = ${n + b}**. What is the missing number?`, answer: n, traps: [{ value: n + b + b, misconception: M.inverse, feedback: "Undo + with −." }], hint: `${n + b} − ${b}.`, explanation: `${n + b} − ${b} = **${n}**.` };
        return {
          kind: "number",
          prompt: `**___ ${op} ${b} = ${result}**. What is the missing number?`,
          answer: n,
          traps: [{ value: op === "+" ? result + b : op === "−" ? result - b : result * b, misconception: M.inverse, feedback: `Undo ${op} with the inverse: ${op === "+" ? "−" : op === "−" ? "+" : "÷"}.` }].filter((t) => t.value !== n && t.value > 0),
          hint: `Use the inverse: ${result} ${op === "+" ? "−" : op === "−" ? "+" : "÷"} ${b}.`,
          explanation: `${result} ${op === "+" ? "−" : op === "−" ? "+" : "÷"} ${b} = **${n}**.`,
        };
      }
      const letter = pick(r, ["n", "x", "a", "y"]);
      const n = int(r, 2, 12);
      const k = int(r, 2, 9);
      if (difficulty === 2) {
        return {
          kind: "number",
          prompt: `**${k}${letter} = ${k * n}**. What is ${letter}?`,
          answer: n,
          traps: [{ value: k * n - k, misconception: M.inverse, feedback: `${k}${letter} means ${k} × ${letter}, so divide by ${k}.` }, { value: k * n * k, misconception: M.inverse, feedback: `Undo × ${k} by dividing by ${k}.` }].filter((t) => t.value !== n),
          hint: `${k}${letter} means ${k} × ${letter}. What times ${k} is ${k * n}?`,
          explanation: `${k * n} ÷ ${k} = **${n}**, so ${letter} = ${n}.`,
        };
      }
      const c = int(r, 1, 15);
      const total = k * n + c;
      return {
        kind: "number",
        prompt: `**${k}${letter} + ${c} = ${total}**. What is ${letter}?`,
        visual: { kind: "bar", parts: [...Array.from({ length: k }, () => ({ label: letter, tone: "brand" as const })), { label: `${c}`, tone: "num" as const, size: Math.max(1, Math.min(3, c / n)) }], total: `${total}` },
        answer: n,
        traps: [{ value: total - c, misconception: M.inverse, feedback: `That's ${k}${letter}. Now divide by ${k}.` }, ...((total + c) % k === 0 ? [{ value: (total + c) / k, misconception: M.inverse, feedback: `Undo + ${c} by taking away ${c}, not adding.` }] : [])].filter((t) => t.value !== n),
        hint: `First take away ${c}. Then divide by ${k}.`,
        explanation: `${total} − ${c} = ${total - c}. ${total - c} ÷ ${k} = **${n}**.`,
      };
    },
  },
  {
    key: "ra-formula",
    skill: S.formulas,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const a = int(r, 2, 9);
      if (difficulty === 1) {
        const b = int(r, 3, 20);
        return {
          kind: "number",
          prompt: `If **a = ${a}**, what is **a + ${b}**?`,
          answer: a + b,
          traps: [{ value: Number(`${a}${b}`), misconception: M.letters, feedback: `Swap a for ${a}: ${a} + ${b}.` }].filter((t) => t.value !== a + b),
          hint: `Put ${a} where the a is.`,
          explanation: `${a} + ${b} = **${a + b}**.`,
        };
      }
      if (difficulty === 2) {
        const k = int(r, 2, 9);
        const b = int(r, 1, 12);
        return {
          kind: "number",
          prompt: `If **a = ${a}**, what is **${k}a + ${b}**?`,
          answer: k * a + b,
          traps: [{ value: Number(`${k}${a}`) + b, misconception: M.letters, feedback: `${k}a means ${k} × a, not the digits ${k} and ${a} side by side.` }, { value: k + a + b, misconception: M.letters, feedback: `${k}a means ${k} × a.` }].filter((t) => t.value !== k * a + b),
          hint: `${k}a means ${k} × a = ${k} × ${a}.`,
          explanation: `${k} × ${a} + ${b} = ${k * a} + ${b} = **${k * a + b}**.`,
        };
      }
      const [what, fixed, rate, unitName] = pick(r, [["A taxi", 3, 2, "mile"], ["A bike hire", 5, 4, "hour"], ["A bowling game", 2, 3, "game"], ["A phone plan", 6, 1, "day"]] as const);
      const n = int(r, 3, 12);
      return {
        kind: "number",
        prompt: `${what} costs **£${fixed}** plus **£${rate}** for each ${unitName}. The cost in pounds is **C = ${rate}n + ${fixed}**, where n is the number of ${unitName}s. What is the cost for **${n} ${unitName}s**?`,
        answer: rate * n + fixed,
        unit: "£",
        traps: [{ value: rate * n, feedback: `Don't forget the £${fixed} on top.` }, { value: (rate + fixed) * n, misconception: M.letters, feedback: `Multiply only the £${rate} by ${n}, then add £${fixed} once.` }].filter((t) => t.value !== rate * n + fixed),
        hint: `Put n = ${n} into C = ${rate}n + ${fixed}.`,
        explanation: `C = ${rate} × ${n} + ${fixed} = ${rate * n} + ${fixed} = **£${rate * n + fixed}**.`,
      };
    },
  },
  {
    key: "ra-sequence",
    skill: S.sequences,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const step = difficulty === 1 ? int(r, 2, 9) * pick(r, [1, 1, -1]) : int(r, 3, 9);
      const start = difficulty === 1 && step < 0 ? int(r, 50, 90) : int(r, 1, 12);
      const terms = Array.from({ length: 5 }, (_, i) => start + i * step);
      if (difficulty === 1) {
        const next = start + 4 * step + step;
        return {
          kind: "number",
          prompt: `What comes next? **${terms.slice(1).join(", ")}, …**`,
          answer: next,
          traps: [{ value: start + 4 * step - step, feedback: `The numbers ${step > 0 ? "go up" : "go down"} by ${Math.abs(step)} each time.` }].filter((t) => t.value !== next),
          hint: "What do you add or take away each time?",
          explanation: `Each time ${step > 0 ? "add" : "take away"} ${Math.abs(step)}: ${start + 4 * step} ${step > 0 ? "+" : "−"} ${Math.abs(step)} = **${next}**.`,
        };
      }
      if (difficulty === 2) {
        const pos = pick(r, [10, 12, 15, 20]);
        const answer = start + (pos - 1) * step;
        return {
          kind: "number",
          prompt: `The sequence **${terms.slice(0, 4).join(", ")}, …** goes on in the same way. What is the **${pos}th** number?`,
          answer,
          traps: [{ value: pos * step, misconception: M.nth, feedback: `Start from the first number, ${start}, and add ${step} another ${pos - 1} times.` }, { value: start + pos * step, misconception: M.nth, feedback: `From the 1st to the ${pos}th number there are ${pos - 1} steps, not ${pos}.` }].filter((t) => t.value !== answer),
          hint: `From the 1st number to the ${pos}th there are ${pos - 1} jumps of ${step}.`,
          explanation: `${start} + ${pos - 1} × ${step} = ${start} + ${(pos - 1) * step} = **${answer}**.`,
        };
      }
      const k = int(r, 2, 9);
      const c = int(r, 1, 9) * pick(r, [1, -1]);
      const pos = pick(r, [10, 20, 25, 50, 100]);
      const answer = k * pos + c;
      const rule = `${k}n ${c > 0 ? "+" : "−"} ${Math.abs(c)}`;
      return {
        kind: "number",
        prompt: `The rule for the nth number of a sequence is **${rule}**. What is the **${pos}th** number?`,
        answer,
        traps: [{ value: Number(`${k}${pos}`) + c, misconception: M.letters, feedback: `${k}n means ${k} × n.` }, { value: k * pos, feedback: `Don't forget the ${c > 0 ? "+" : "−"} ${Math.abs(c)}.` }].filter((t) => t.value !== answer),
        hint: `Put n = ${pos} into ${rule}.`,
        explanation: `${k} × ${pos} ${c > 0 ? "+" : "−"} ${Math.abs(c)} = **${answer}**.`,
      };
    },
  },
  /* D-037 (Phase B): two more question makers per skill, one of them a stretch question. */
  {
    key: "ra-ratio-for-every",
    skill: S.ratio,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const a = int(r, 1, 4);
      let b = int(r, 2, 6);
      if (b === a) b += 1;
      const groups = difficulty === 1 ? int(r, 2, 5) : int(r, 4, 12);
      const [x, y] = pick(r, [["blue beads", "red beads"], ["cats", "dogs"], ["apples", "pears"]]);
      return {
        kind: "number",
        prompt: `For every **${a} ${x}** there are **${b} ${y}**. There are **${a * groups} ${x}**. How many ${y} are there?`,
        answer: b * groups,
        traps: [{ value: a * groups + (b - a), misconception: M.add, feedback: `Ratios scale by multiplying: there are ${groups} groups of ${a} ${x}, so ${groups} groups of ${b} ${y}.` }].filter((t) => t.value !== b * groups),
        hint: `How many groups of ${a} make ${a * groups}?`,
        explanation: `${a * groups} ÷ ${a} = ${groups} groups, and ${groups} × ${b} = **${b * groups}** ${y}.`,
      };
    },
  },
  {
    key: "ra-ratio-stretch",
    skill: S.ratio,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const [p, q] = pick(r, PAIRS);
      const a = int(r, 2, 5);
      const b = a + int(r, 1, 4);
      const part = int(r, 3, 12);
      const diff = (b - a) * part;
      return {
        kind: "number",
        prompt: `${p} and ${q} share some sweets in the ratio **${a} : ${b}**. ${q} gets **${diff} more** than ${p}. How many sweets are there **altogether**?`,
        answer: (a + b) * part,
        traps: [
          { value: b * part, misconception: M.part, feedback: `That's ${q}'s share. Add ${p}'s share too.` },
          { value: diff * (a + b), misconception: M.part, feedback: `The difference is ${b - a} parts, so one part is ${diff} ÷ ${b - a}.` },
        ].filter((t) => t.value !== (a + b) * part),
        hint: `The difference between the shares is ${b} − ${a} = ${b - a} parts.`,
        explanation: `${b - a} parts = ${diff}, so one part is ${part}. Altogether ${a + b} parts = **${(a + b) * part}**.`,
      };
    },
  },
  {
    key: "ra-scale-down",
    skill: S.scale,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const from = pick(r, difficulty === 1 ? [2, 4] : [6, 8, 12]);
      const to = from / 2;
      const each = int(r, 2, 9) * (difficulty === 3 ? 30 : 10);
      return {
        kind: "number",
        prompt: `A recipe for **${from} people** uses **${each * from} g** of rice. How much rice for **${to} people**?`,
        unit: "g",
        answer: each * to,
        traps: [{ value: each * from - (from - to), misconception: M.add, feedback: "Recipes scale by multiplying or dividing, not by taking away people." }],
        hint: `${to} is half of ${from}.`,
        explanation: `Half the people need half the rice: ${each * from} ÷ 2 = **${each * to} g**.`,
      };
    },
  },
  {
    key: "ra-scale-stretch",
    skill: S.scale,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const eggs = pick(r, [2, 3, 4]);
      const serves = pick(r, [4, 6]);
      const have = eggs * int(r, 3, 5) + int(r, 0, eggs - 1);
      const batches = Math.floor(have / eggs);
      return {
        kind: "number",
        prompt: `A pancake recipe needs **${eggs} eggs** and serves **${serves} people**. You have **${have} eggs**. What is the greatest number of people you can serve?`,
        answer: batches * serves,
        traps: [{ value: Math.round((have / eggs) * serves), feedback: "You can only make whole batches: you can't use part of an egg recipe here." }].filter((t) => t.value !== batches * serves),
        hint: `How many whole batches can you make with ${have} eggs?`,
        explanation: `${have} ÷ ${eggs} = ${batches} whole batches, and ${batches} × ${serves} = **${batches * serves}** people.`,
      };
    },
  },
  {
    key: "ra-think-of",
    skill: S.equations,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const n = int(r, 2, difficulty === 1 ? 12 : 25);
      const times = difficulty === 1 ? 1 : int(r, 2, 5);
      const add = int(r, 3, 20);
      const result = n * times + add;
      return {
        kind: "number",
        prompt: times === 1 ? `I think of a number and add **${add}**. The answer is **${result}**. What was my number?` : `I think of a number, multiply it by **${times}**, then add **${add}**. The answer is **${result}**. What was my number?`,
        answer: n,
        traps: [{ value: result + add, misconception: M.inverse, feedback: `Undo "add ${add}" by taking ${add} away.` }, ...(times > 1 ? [{ value: result - add, misconception: M.inverse, feedback: `Keep going: undo × ${times} by dividing.` }] : [])],
        hint: "Work backwards, undoing the last step first.",
        explanation: times === 1 ? `${result} − ${add} = **${n}**.` : `${result} − ${add} = ${result - add}, then ${result - add} ÷ ${times} = **${n}**.`,
      };
    },
  },
  {
    key: "ra-equations-stretch",
    skill: S.equations,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const pen = int(r, 2, 9);
      const book = pen + int(r, 3, 8);
      const total = 2 * pen + book;
      return {
        kind: "number",
        prompt: `A book costs **£${book - pen} more** than a pen. Two pens and a book cost **£${total}** altogether. How much is one pen?`,
        unit: "£",
        answer: pen,
        traps: [{ value: (total - (book - pen)) / 2, misconception: M.inverse, feedback: "Two pens and a book is three pens plus the extra amount." }].filter((t) => t.value !== pen && Number.isInteger(t.value)),
        hint: `The book is a pen plus £${book - pen}. So the total is 3 pens and £${book - pen}.`,
        explanation: `3 pens + £${book - pen} = £${total}, so 3 pens = £${total - (book - pen)} and one pen = **£${pen}**.`,
      };
    },
  },
  {
    key: "ra-formula-word",
    skill: S.formulas,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const per = int(r, 2, 6);
      const fixed = int(r, 3, 10);
      const h = int(r, 2, difficulty === 1 ? 5 : 9);
      return {
        kind: "number",
        prompt: `Bike hire costs **£${fixed}** plus **£${per}** for every hour. The cost in pounds is **C = ${fixed} + ${per}h**, where h is the number of hours. What is the cost for **${h} hours**?`,
        unit: "£",
        answer: fixed + per * h,
        traps: [{ value: (fixed + per) * h, feedback: `Multiply first: ${per} × ${h}, then add the £${fixed}.` }, { value: Number(`${per}${h}`) + fixed, misconception: M.letters, feedback: `${per}h means ${per} × h, not the digits ${per} and ${h} side by side.` }].filter((t) => t.value !== fixed + per * h),
        hint: `Put h = ${h} into the formula: ${fixed} + ${per} × ${h}.`,
        explanation: `${fixed} + ${per} × ${h} = ${fixed} + ${per * h} = **£${fixed + per * h}**.`,
      };
    },
  },
  {
    key: "ra-formulas-stretch",
    skill: S.formulas,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const a = int(r, 2, 6);
      const b = int(r, 2, 6);
      const right = 2 * a + 3 * b;
      return {
        kind: "choose",
        prompt: `If **a = ${a}** and **b = ${b}**, which expression is worth **${right}**?`,
        options: unique("2a + 3b", [
          { text: "3a + 2b", feedback: `3a + 2b = ${3 * a + 2 * b}.` },
          { text: "2(a + b)", feedback: `2(a + b) = ${2 * (a + b)}.` },
          { text: "a + b + 5", feedback: `a + b + 5 = ${a + b + 5}.` },
        ].filter((o) => !o.feedback.endsWith(`= ${right}.`))),
        answer: 0,
        hint: "Put the numbers into each expression and work it out.",
        explanation: `2a + 3b = 2 × ${a} + 3 × ${b} = **${right}**.`,
      };
    },
  },
  {
    key: "ra-sequence-next",
    skill: S.sequences,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const step = int(r, 2, 9) * (difficulty === 3 ? -1 : 1);
      const start = difficulty === 3 ? int(r, 60, 99) : int(r, 1, 20);
      const terms = [0, 1, 2, 3].map((i) => start + i * step);
      const missing = int(r, 1, 2);
      const shown = terms.map((t, i) => (i === missing ? "?" : String(t)));
      return {
        kind: "number",
        prompt: `What is the missing number? **${shown.join(", ")}**`,
        answer: terms[missing]!,
        traps: [{ value: terms[missing]! + step, feedback: `The sequence goes ${step > 0 ? "up" : "down"} by ${Math.abs(step)} each time.` }],
        hint: "What do you add or take away each time?",
        explanation: `The rule is ${step > 0 ? "+" : "−"}${Math.abs(step)}, so the missing number is **${terms[missing]}**.`,
      };
    },
  },
  {
    key: "ra-sequences-stretch",
    skill: S.sequences,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const step = int(r, 3, 7);
      const start = int(r, 1, step);
      const target = start + step * int(r, 8, 15);
      const position = (target - start) / step + 1;
      return {
        kind: "number",
        prompt: `A sequence starts **${start}, ${start + step}, ${start + 2 * step}, …** In which **position** is the number **${target}**?`,
        answer: position,
        traps: [{ value: position - 1, misconception: M.nth, feedback: "Count the first number as position 1: the jumps are one fewer than the position." }, { value: target / step, misconception: M.nth, feedback: "Take off the first number before counting the jumps." }].filter((t) => t.value !== position && Number.isInteger(t.value)),
        hint: `How many jumps of ${step} take you from ${start} to ${target}?`,
        explanation: `${target} − ${start} = ${target - start}, which is ${position - 1} jumps of ${step}. So ${target} is in position **${position}**.`,
      };
    },
  },
];

const templates = withHints(baseTemplates, {
  "ra-ratio": () => ["Add the parts of the ratio to find how many equal parts there are.", "Find one part by dividing, then multiply for each share."],
  "ra-ratio-for-every": () => ["Count how many groups there are.", "Each group has the same mix, so multiply."],
  "ra-ratio-stretch": () => ["The difference is a number of parts too.", "Find one part from the difference, then count all the parts."],
  "ra-scale": () => ["Find the amount for one first.", "Then multiply by how many you need."],
  "ra-scale-down": () => ["Fewer people need less, by dividing.", "Halve the amount when you halve the people."],
  "ra-scale-stretch": () => ["Each batch uses the same number of eggs.", "Count whole batches only, then multiply by the people each batch serves."],
  "ra-missing": () => ["Undo each step with the opposite operation.", "Undo the last thing that was done first."],
  "ra-think-of": () => ["Start from the answer and work backwards.", "Undo + with −, then × with ÷."],
  "ra-equations-stretch": () => ["Write the book as 'a pen and the extra'.", "Take the extra away from the total, then share between the pens."],
  "ra-formula": () => ["Swap each letter for its number.", "A number next to a letter means multiply. Multiply before you add."],
  "ra-formula-word": () => ["Put the hours into the formula.", "Do the multiplication first, then add."],
  "ra-formulas-stretch": () => ["Work out each expression with the numbers.", "Only one matches."],
  "ra-sequence": () => ["Find the step: how much it goes up each time.", "The nth number is the first number plus (n − 1) steps."],
  "ra-sequence-next": () => ["Find the difference between neighbours.", "Use the same difference to fill the gap."],
  "ra-sequences-stretch": () => ["Take the first number away from the target.", "Divide by the step to count jumps, then add 1 for the position."],
});

export const ratioAlgebra = defineTopic(withExtras({
  id: T,
  title: "Ratio and algebra",
  subtitle: "Ratio and sharing, scaling recipes, missing numbers, formulas and sequences",
  world: "summit",
  years: [5, 6],
  order: 1,
  icon: "ratio",
  skills: [
    { id: S.ratio, title: "Ratio", description: "Use ratios, share in a ratio and simplify ratios.", lessonId: "ratio" },
    { id: S.scale, title: "Scaling", description: "Scale recipes up and down.", lessonId: "scaling" },
    { id: S.equations, title: "Missing numbers", description: "Find missing numbers and solve simple equations.", lessonId: "equations" },
    { id: S.formulas, title: "Formulas", description: "Put numbers into formulas like 3a + 2.", lessonId: "formulas" },
    { id: S.sequences, title: "Sequences", description: "Continue sequences and find any term.", lessonId: "sequences" },
  ],
  lessonIcons: { ratio: "ratio", scaling: "pizza", equations: "puzzle", formulas: "lab", sequences: "rocket" },
  lessons: [
    {
      id: "ratio",
      title: "Ratio",
      phase: "Understand",
      summary: "For every 2 of these, there are 3 of those.",
      minutes: 8,
      objectives: ["Understand 'for every'", "Share an amount in a ratio"],
      steps: [
        {
          type: "explain",
          title: "For every…",
          body: ["A **ratio** compares amounts. **2 : 3** means for every **2** blue, there are **3** orange.", "If there are 10 blue, that's 5 groups of 2, so there are 5 × 3 = **15** orange."],
          visual: { kind: "bar", parts: [{ label: "", tone: "brand" }, { label: "", tone: "brand" }, { label: "", tone: "num" }, { label: "", tone: "num" }, { label: "", tone: "num" }], note: "2 blue : 3 orange" },
        },
        { type: "lab", title: "See it in 3D", body: [], explainer: "ratio-3d", numbers: [], challenges: [] },
        {
          type: "worked",
          title: "Watch me share",
          support: "full",
          problem: "Share **35** sweets in the ratio **2 : 5**.",
          visual: { kind: "bar", parts: [{ label: "A", tone: "brand" }, { label: "A", tone: "brand" }, { label: "B", tone: "num" }, { label: "B", tone: "num" }, { label: "B", tone: "num" }, { label: "B", tone: "num" }, { label: "B", tone: "num" }], total: "35" },
          steps: [{ text: "Count the parts: 2 + 5 = **7**." }, { text: "One part: 35 ÷ 7 = **5**." }, { text: "A gets 2 × 5 = **10**. B gets 5 × 5 = **25**." }],
          conclusion: "10 and 25: they add up to **35**.",
        },
        {
          type: "worked",
          title: "Together: share 24 in the ratio 1 : 3",
          support: "faded",
          problem: "Share **24** stickers between Zara and Leo in the ratio **1 : 3**.",
          visual: { kind: "bar", parts: [{ label: "Z", tone: "brand" }, { label: "L", tone: "num" }, { label: "L", tone: "num" }, { label: "L", tone: "num" }], total: "24" },
          steps: [
            { text: "Count the parts: 1 + 3 = **4**.", blank: { prompt: "One part is 24 ÷ 4 = ?", answer: 6, hint: "4 × 6 = 24", traps: [{ value: 8, misconception: M.part, feedback: "Divide by all the parts (4), not just Leo's 3." }], worked: "One part is **6**." } },
            { text: "Zara gets 1 × 6 = 6. Leo gets 3 × 6 = 18." },
          ],
          conclusion: "Zara **6**, Leo **18**. Check: 6 + 18 = 24.",
        },
        { type: "check", title: "Your turn", questionId: gen("ra-ratio", 1, 3) },
        { type: "check", title: "One more", questionId: gen("ra-ratio", 2, 6) },
      ],
    },
    {
      id: "scaling",
      title: "Scaling recipes",
      phase: "Visualise",
      summary: "Find the amount for one, then multiply.",
      minutes: 6,
      objectives: ["Scale amounts up and down"],
      steps: [
        {
          type: "explain",
          title: "Find one, then multiply",
          body: ["A recipe is a ratio: if you cook for more people, **every** amount grows by the same multiple.", "The safest way is to find the amount for **one** first, by dividing. Then multiply by the number you need.", "Don't add: 4 people to 6 people isn't \"add 2 to every amount\"."],
          visual: { kind: "bar", parts: [{ label: "75 g", tone: "brand" }, { label: "75 g", tone: "brand" }, { label: "75 g", tone: "brand" }, { label: "75 g", tone: "brand" }], total: "300 g for 4 people" },
        },
        {
          type: "worked",
          title: "Watch me: 3 cakes to 5 cakes",
          support: "full",
          problem: "**3 cakes** need **12 eggs**. How many eggs for **5 cakes**?",
          steps: [{ text: "One cake: 12 ÷ 3 = **4 eggs**." }, { text: "Five cakes: 5 × 4 = **20 eggs**." }],
          conclusion: "5 cakes need **20 eggs**.",
        },
        {
          type: "worked",
          title: "Let's do it together",
          support: "faded",
          problem: "A recipe for **4** people uses **300 g** of flour. How much for **6** people?",
          steps: [
            { text: "Find the amount for 1 person.", blank: { prompt: "What is 300 ÷ 4?", answer: 75, hint: "Half of 300 is 150; half again.", traps: [{ value: 302, misconception: M.add, feedback: "Don't add people to grams. Find the amount for one person by dividing." }], worked: "300 ÷ 4 = **75**." } },
            { text: "6 people: 6 × 75 = 450." },
          ],
          conclusion: "For 6 people you need **450 g**.",
        },
        { type: "check", title: "Your turn", questionId: gen("ra-scale", 1, 2) },
        { type: "check", title: "One more", questionId: gen("ra-scale", 2, 5) },
      ],
    },
    {
      id: "equations",
      title: "Missing numbers",
      phase: "Practise",
      summary: "Undo each step with the inverse.",
      minutes: 7,
      objectives: ["Find missing numbers", "Solve two-step equations"],
      steps: [
        {
          type: "explain",
          title: "Undo it",
          body: ["**3n + 5 = 26**. The bar shows three n's and a 5 make 26.", "Take away the 5: 3n = **21**. Share between three: n = **7**.", "Always undo the steps in reverse order: the last thing done to n is the first thing you undo."],
          visual: { kind: "bar", parts: [{ label: "n", tone: "brand" }, { label: "n", tone: "brand" }, { label: "n", tone: "brand" }, { label: "5", tone: "num" }], total: "26" },
          tip: "Undo + with −, and × with ÷.",
        },
        {
          type: "worked",
          title: "Watch me: 4n − 3 = 25",
          support: "full",
          problem: "Solve **4n − 3 = 25**.",
          visual: { kind: "bar", parts: [{ label: "n", tone: "brand" }, { label: "n", tone: "brand" }, { label: "n", tone: "brand" }, { label: "n", tone: "brand" }], total: "28", note: "4n is 3 more than 25" },
          steps: [{ text: "The last step was − 3, so undo it first: 25 + 3 = **28**. So 4n = 28." }, { text: "4n means 4 × n. Undo × 4: 28 ÷ 4 = **7**." }],
          conclusion: "n = **7**. Check: 4 × 7 − 3 = 25.",
        },
        {
          type: "worked",
          title: "Together: 2n + 9 = 21",
          support: "faded",
          problem: "Solve **2n + 9 = 21**.",
          steps: [
            { text: "Undo + 9 first.", blank: { prompt: "21 − 9 = ?", answer: 12, hint: "So 2n is this.", traps: [{ value: 30, misconception: M.inverse, feedback: "Undo + 9 by taking 9 away, not adding it." }], worked: "2n = **12**." } },
            { text: "Undo × 2: 12 ÷ 2 = **6**." },
          ],
          conclusion: "n = **6**.",
        },
        { type: "check", title: "Your turn", questionId: gen("ra-missing", 1, 4) },
        { type: "check", title: "One more", questionId: gen("ra-missing", 3, 2) },
      ],
    },
    {
      id: "formulas",
      title: "Formulas",
      phase: "Explore",
      summary: "3a means 3 × a.",
      minutes: 6,
      objectives: ["Substitute numbers into formulas"],
      steps: [
        {
          type: "explain",
          title: "Letters stand for numbers",
          body: ["In algebra a letter stands for a number. **3a** means **3 × a**.", "If a = 4, then 3a + 2 = 3 × 4 + 2 = **14**, not 34 + 2.", "A formula is a rule written with letters. Swap each letter for its number, then multiply before you add."],
          visual: { kind: "bar", parts: [{ label: "a", tone: "brand" }, { label: "a", tone: "brand" }, { label: "a", tone: "brand" }, { label: "2", tone: "num" }], note: "3a + 2" },
          tip: "A number next to a letter means multiply.",
        },
        {
          type: "worked",
          title: "Watch me: taxi fares",
          support: "full",
          problem: "A taxi costs **C = 3 + 2m** pounds for m miles. What does **5 miles** cost?",
          steps: [{ text: "Swap m for 5: C = 3 + 2 × 5." }, { text: "Multiply first: 2 × 5 = 10. Then add: 3 + 10 = **13**." }],
          conclusion: "5 miles cost **£13**.",
        },
        {
          type: "worked",
          title: "Together: 5b − 4 when b = 3",
          support: "faded",
          problem: "Work out **5b − 4** when **b = 3**.",
          steps: [{ text: "5b means 5 × b.", blank: { prompt: "What is 5b?", answer: 15, hint: "5 × 3", traps: [{ value: 53, misconception: M.letters, feedback: "5b means 5 × b, not the digits 5 and 3 side by side." }], worked: "5b = **15**." } }, { text: "15 − 4 = **11**." }],
          conclusion: "5b − 4 = **11**.",
        },
        { type: "check", title: "Your turn", questionId: gen("ra-formula", 2, 3) },
        { type: "check", title: "One more", questionId: gen("ra-formula", 3, 7) },
      ],
    },
    {
      id: "sequences",
      title: "Sequences",
      phase: "Apply",
      summary: "Find the step, then jump to any position.",
      minutes: 7,
      objectives: ["Continue a sequence", "Find the nth term"],
      steps: [
        {
          type: "explain",
          title: "Jump to the 10th",
          body: ["**3, 7, 11, 15, …** goes up by **4** each time.", "The 10th number is the 1st plus 9 jumps of 4: 3 + 9 × 4 = **39**.", "Watch out: to reach the 10th number there are only **9** jumps, because you start on the first number."],
          visual: { kind: "line", min: 0, max: 20, step: 1, labelEvery: 5, points: [{ value: 3, label: "3" }, { value: 7, label: "7" }, { value: 11, label: "11" }, { value: 15, label: "15" }], jumps: [{ from: 3, to: 7, label: "+4" }, { from: 7, to: 11, label: "+4" }, { from: 11, to: 15, label: "+4" }] },
        },
        {
          type: "worked",
          title: "Watch me: the 20th number of 5, 8, 11, …",
          support: "full",
          problem: "Find the **20th** number of **5, 8, 11, 14, …**",
          visual: { kind: "line", min: 0, max: 20, step: 1, labelEvery: 5, points: [{ value: 5, label: "5" }, { value: 8, label: "8" }, { value: 11, label: "11" }, { value: 14, label: "14" }], jumps: [{ from: 5, to: 8, label: "+3" }, { from: 8, to: 11, label: "+3" }, { from: 11, to: 14, label: "+3" }] },
          steps: [{ text: "The step is **+3**." }, { text: "From the 1st to the 20th is **19 jumps**: 19 × 3 = 57." }, { text: "Add the first number: 5 + 57 = **62**." }],
          conclusion: "The 20th number is **62**.",
        },
        {
          type: "worked",
          title: "Together: the 10th number of 2, 6, 10, …",
          support: "faded",
          problem: "Find the **10th** number of **2, 6, 10, 14, …**",
          steps: [{ text: "The step is **+4**, and there are 9 jumps.", blank: { prompt: "2 + 9 × 4 = ?", answer: 38, hint: "9 × 4 = 36", traps: [{ value: 40, misconception: M.nth, feedback: "10 × 4 forgets that you start on 2 and only make 9 jumps." }], worked: "**38**." } }],
          conclusion: "The 10th number is **38**.",
        },
        { type: "check", title: "Your turn", questionId: gen("ra-sequence", 1, 2) },
        { type: "check", title: "One more", questionId: gen("ra-sequence", 2, 6) },
      ],
    },
  ],
  templates,
  misconceptions: [
    { id: M.part, name: "Mixing up the parts", possibleCause: "It looks like the ratio parts got mixed up.", description: "Gives the other share, or divides by one part instead of all the parts.", explanation: ["Add the parts to find how many equal parts there are.", "Find one part, then multiply."], skills: [S.ratio], followUpTemplates: ["ra-ratio"] },
    { id: M.add, name: "Adding instead of scaling", possibleCause: "It looks like an amount was added instead of multiplied.", description: "Thinks 4 people → 6 people means add 2 to every amount.", explanation: ["Ratio and recipes scale by multiplying.", "Find the amount for 1, then multiply."], skills: [S.ratio, S.scale], followUpTemplates: ["ra-scale"] },
    { id: M.inverse, name: "Wrong inverse", possibleCause: "It looks like the wrong inverse operation was used.", description: "Adds when it should take away, or stops after one step.", explanation: ["Undo + with −, and × with ÷.", "Undo the last step first."], skills: [S.equations], followUpTemplates: ["ra-missing"] },
    { id: M.letters, name: "Reading 3a as thirty-something", possibleCause: "It looks like a number next to a letter was read as digits.", description: "Works out 3a with a = 4 as 34.", explanation: ["A number next to a letter means multiply.", "3a = 3 × a."], skills: [S.formulas, S.sequences], followUpTemplates: ["ra-formula"] },
    { id: M.nth, name: "Position and step mixed up", possibleCause: "It looks like the position was multiplied by the step without the starting number.", description: "Says the 10th number of 3, 7, 11 … is 40.", explanation: ["Start from the first number.", "The nth number is n − 1 jumps from the first."], skills: [S.sequences], followUpTemplates: ["ra-sequence"] },
  ],
  placement: [
    { lessonId: "ratio", template: "ra-ratio" },
    { lessonId: "scaling", template: "ra-scale" },
    { lessonId: "equations", template: "ra-missing" },
    { lessonId: "formulas", template: "ra-formula" },
    { lessonId: "sequences", template: "ra-sequence" },
  ],
}, twoUnknowns));
