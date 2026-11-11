import { defineTopic, genFor, int, pick, withExtras, withHints } from "@/topics/kit/define";
import { multiplyDivideExtra } from "./extra";
import { num } from "@/topics/kit/evaluate";
import type { Template } from "@/topics/kit/types";
import { factors, gcdOf } from "@/maths/integer";

/** Multiply and divide: by 10, 100 and 1,000, short and long multiplication, division with remainders, factors. */

const T = "multiply-divide";
const gen = genFor(T);
const S = { tens: `${T}.ten-hundred`, short: `${T}.short-mult`, long: `${T}.long-mult`, div: `${T}.division`, factors: `${T}.factors` };
const M = { zeros: `${T}.zeros`, carry: `${T}.no-carry`, tensPlace: `${T}.tens-place`, remainder: `${T}.remainder`, factorEnds: `${T}.factor-pairs` };

/** Each digit times m, keeping only the ones digit (no carrying). */
function noCarryProduct(n: number, m: number) {
  return Number(String(n).split("").map((d) => (Number(d) * m) % 10).join(""));
}

const baseTemplates: Template[] = [
  {
    key: "md-10",
    skill: S.tens,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const by = difficulty === 1 ? pick(r, [10, 100]) : difficulty === 2 ? pick(r, [10, 100]) : 1000;
      const divide = difficulty === 2 || (difficulty === 3 && r() < 0.5);
      if (divide) {
        const answer = difficulty === 3 ? int(r, 2, 99) : int(r, 3, 99);
        const n = answer * by;
        return {
          kind: "number",
          prompt: `**${num(n)} ÷ ${num(by)} = ?**`,
          visual: { kind: "pv-chart", value: n, columns: n >= 10000 ? ["TTh", "Th", "H", "T", "O"] : ["Th", "H", "T", "O"] },
          answer,
          traps: [{ value: n / (by === 10 ? 100 : 10), misconception: M.zeros, feedback: `Dividing by ${num(by)} moves every digit ${by === 10 ? "one place" : by === 100 ? "two places" : "three places"} to the right.` }, { value: n * by, misconception: M.zeros, feedback: "Dividing makes the number smaller." }].filter((t) => Number.isInteger(t.value) && t.value !== answer),
          hint: `Each digit moves ${by === 10 ? "one" : by === 100 ? "two" : "three"} place${by === 10 ? "" : "s"} to the right.`,
          explanation: `${num(n)} ÷ ${num(by)} = **${num(answer)}**.`,
        };
      }
      const n = difficulty === 1 ? int(r, 12, 99) : int(r, 12, 999);
      const answer = n * by;
      return {
        kind: "number",
        prompt: `**${num(n)} × ${num(by)} = ?**`,
        answer,
        traps: [by === 10 ? { value: n * 100, misconception: M.zeros, feedback: "× 10 moves each digit one place to the left: one zero fills the ones." } : { value: n * (by / 10), misconception: M.zeros, feedback: `× ${num(by)} moves each digit ${by === 100 ? "two" : "three"} places to the left.` }],
        hint: `Every digit moves ${by === 10 ? "one place" : by === 100 ? "two places" : "three places"} to the left. Zeros fill the empty places.`,
        explanation: `${num(n)} × ${num(by)} = **${num(answer)}**.`,
      };
    },
  },
  {
    key: "md-short",
    skill: S.short,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const m = int(r, 3, 9);
      const n = difficulty === 1 ? int(r, 13, 49) : difficulty === 2 ? int(r, 102, 489) : int(r, 1012, 4899);
      const answer = n * m;
      const wrong = noCarryProduct(n, m);
      return {
        kind: "number",
        prompt: `Work out **${num(n)} × ${m}**.`,
        answer,
        traps: wrong !== answer ? [{ value: wrong, misconception: M.carry, feedback: "When a column makes 10 or more, carry the tens into the next column." }] : [],
        hint: "Multiply the ones first. Carry anything over 9 into the next column.",
        explanation: `${num(n)} × ${m} = **${num(answer)}**.`,
      };
    },
  },
  {
    key: "md-partition",
    skill: S.short,
    difficulties: [1, 2],
    make: (r, { difficulty }) => {
      const tens = int(r, 2, 9) * 10;
      const ones = int(r, 2, 9);
      const m = int(r, 3, difficulty === 1 ? 6 : 9);
      const n = tens + ones;
      return {
        kind: "number",
        prompt: `Use partitioning: **${n} × ${m} = ${tens} × ${m} + ${ones} × ${m}**. What is ${n} × ${m}?`,
        visual: { kind: "bar", total: `${n} × ${m}`, parts: [{ label: `${tens} × ${m} = ${tens * m}`, size: tens, tone: "brand" }, { label: `${ones} × ${m} = ${ones * m}`, size: Math.max(ones, tens / 3), tone: "num" }] },
        answer: n * m,
        traps: [{ value: tens * m + ones, misconception: M.carry, feedback: `Multiply the ones part too: ${ones} × ${m} = ${ones * m}.` }],
        hint: `${tens} × ${m} = ${tens * m}. Then ${ones} × ${m}. Add them.`,
        explanation: `${tens * m} + ${ones * m} = **${n * m}**.`,
      };
    },
  },
  {
    key: "md-long",
    skill: S.long,
    difficulties: [2, 3],
    make: (r, { difficulty }) => {
      const a = difficulty === 2 ? int(r, 12, 49) : int(r, 102, 389);
      const b = int(r, 12, difficulty === 2 ? 39 : 29);
      const tens = Math.floor(b / 10);
      const ones = b % 10;
      const answer = a * b;
      const forgot = a * ones + a * tens;
      return {
        kind: "number",
        prompt: `Work out **${num(a)} × ${b}**.`,
        visual: { kind: "bar", total: `${num(a)} × ${b}`, parts: [{ label: `${num(a)} × ${tens * 10}`, size: tens * 10, tone: "brand" }, { label: `${num(a)} × ${ones}`, size: Math.max(ones, 3), tone: "num" }] },
        answer,
        traps: forgot !== answer ? [{ value: forgot, misconception: M.tensPlace, feedback: `The ${tens} in ${b} is ${tens} tens, so multiply by ${tens * 10}, not ${tens}.` }] : [],
        hint: `Split ${b} into ${tens * 10} and ${ones}. Multiply ${num(a)} by each, then add.`,
        explanation: `${num(a)} × ${tens * 10} = ${num(a * tens * 10)} and ${num(a)} × ${ones} = ${num(a * ones)}; together **${num(answer)}**.`,
      };
    },
  },
  {
    key: "md-div",
    skill: S.div,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const d = int(r, 2, difficulty === 1 ? 5 : 9);
      if (difficulty === 3) {
        const q = int(r, 12, 39);
        const rem = int(r, 1, d - 1);
        const n = q * d + rem;
        const options = [
          { text: `${q} r ${rem}` },
          { text: `${q - 1} r ${rem + d}`, misconception: M.remainder, feedback: `A remainder of ${rem + d} is ${d} or more: another group of ${d} fits.` },
          { text: `${q + 1} r ${rem}`, feedback: `${q + 1} × ${d} = ${(q + 1) * d}, which is more than ${n}.` },
          { text: `${q} r ${d - rem}`, feedback: `${q} × ${d} = ${q * d}, and ${n} − ${q * d} = ${rem}.` },
        ].filter((o, i, all) => all.findIndex((x) => x.text === o.text) === i);
        return {
          kind: "choose",
          prompt: `**${n} ÷ ${d} = ?**`,
          options,
          answer: 0,
          hint: `How many ${d}s fit into ${n}? Whatever is left over is the remainder, and it must be less than ${d}.`,
          explanation: `${q} × ${d} = ${q * d}, with ${rem} left over: **${q} r ${rem}**.`,
        };
      }
      const q = difficulty === 1 ? int(r, 11, 25) : int(r, 21, 99);
      const n = q * d;
      return {
        kind: "number",
        prompt: `**${num(n)} ÷ ${d} = ?**`,
        visual: difficulty === 1 && q <= 12 ? { kind: "groups", groups: d, each: q, label: `${n} shared into ${d} equal groups` } : undefined,
        answer: q,
        traps: [{ value: n * d, misconception: M.zeros, feedback: "Dividing shares the number out, so the answer is smaller." }],
        hint: `Use your ${d} times table: how many ${d}s make ${num(n)}? Try the tens first.`,
        explanation: `${q} × ${d} = ${num(n)}, so ${num(n)} ÷ ${d} = **${q}**.`,
      };
    },
  },
  {
    key: "md-share",
    skill: S.div,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const d = int(r, 3, 8);
      if (difficulty === 3) {
        const n = int(r, 4, 12) * d + int(r, 1, d - 1);
        const need = Math.ceil(n / d);
        return {
          kind: "number",
          prompt: `Eggs come in boxes of **${d}**. How many boxes do you need for **${n} eggs**?`,
          answer: need,
          traps: [{ value: need - 1, misconception: M.remainder, feedback: `${need - 1} boxes hold ${(need - 1) * d} eggs. The leftover eggs need one more box.` }],
          hint: `${n} ÷ ${d} has a remainder. Do the leftover eggs need a box?`,
          explanation: `${n} ÷ ${d} = ${Math.floor(n / d)} r ${n % d}, and the ${n % d} leftover eggs need another box: **${need}**.`,
        };
      }
      const q = difficulty === 1 ? int(r, 3, 12) : int(r, 12, 30);
      const n = q * d;
      return {
        kind: "number",
        prompt: `**${n} sweets** are shared equally between **${d} children**. How many does each child get?`,
        visual: difficulty === 1 ? { kind: "groups", groups: d, each: q, label: `${n} sweets in ${d} equal shares` } : undefined,
        answer: q,
        traps: [{ value: n - d, feedback: "Sharing equally means dividing, not taking away." }],
        hint: `Divide ${n} by ${d}.`,
        explanation: `${n} ÷ ${d} = **${q}** each.`,
      };
    },
  },
  {
    key: "md-factor",
    skill: S.factors,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      if (difficulty === 2) {
        const m = int(r, 3, 9);
        const right = m * int(r, 3, 12);
        const wrong = [right + 1, right + m - 1 === right ? right + 2 : right + m - 1, right - 2].filter((x) => x % m !== 0);
        return {
          kind: "choose",
          prompt: `Which number is a **multiple of ${m}**?`,
          options: [{ text: num(right) }, ...[...new Set(wrong)].slice(0, 3).map((x) => ({ text: num(x), feedback: `${num(x)} isn't in the ${m} times table.` }))],
          answer: 0,
          hint: `Multiples of ${m} are the answers in the ${m} times table.`,
          explanation: `${num(right)} = ${m} × ${right / m}, so **${num(right)}** is a multiple of ${m}.`,
        };
      }
      const n = pick(r, difficulty === 1 ? [12, 18, 20, 24, 30] : [36, 42, 48, 56, 60, 72]);
      const fs = factors(n).filter((x) => x > 1 && x < n);
      const right = pick(r, fs);
      const wrong: number[] = [];
      for (let x = 4; wrong.length < 3 && x < n; x++) if (n % x !== 0 && x !== right && r() < 0.5) wrong.push(x);
      for (let x = 5; wrong.length < 3; x++) if (n % x !== 0 && !wrong.includes(x)) wrong.push(x);
      return {
        kind: "choose",
        prompt: `Which number is a **factor of ${n}**?`,
        options: [{ text: num(right) }, ...wrong.map((x) => ({ text: num(x), feedback: `${n} ÷ ${x} doesn't divide exactly.` }))],
        answer: 0,
        hint: `A factor divides ${n} exactly, with nothing left over.`,
        explanation: `${n} ÷ ${right} = ${n / right}, so **${right}** is a factor of ${n}.`,
      };
    },
  },
  {
    key: "md-factor-count",
    skill: S.factors,
    difficulties: [2, 3],
    make: (r, { difficulty }) => {
      const n = pick(r, difficulty === 2 ? [6, 8, 10, 12, 15, 16, 18, 20] : [24, 28, 30, 36, 40, 45]);
      const count = factors(n).length;
      return {
        kind: "number",
        prompt: `How many **factors** does **${n}** have?`,
        answer: count,
        traps: [{ value: count - 2, misconception: M.factorEnds, feedback: `Don't forget 1 and ${n} itself: they are factors too.` }].filter((t) => t.value > 0),
        hint: `Find factor pairs: 1 × ${n}, 2 × …, and stop when they meet in the middle.`,
        explanation: `The factors of ${n} are ${factors(n).join(", ")}: **${count}** factors.`,
      };
    },
  },

  /* D-037 (Phase B): more question makers per skill, each a different structure or context, plus stretch questions. */
  {
    key: "md-10-missing",
    skill: S.tens,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const by = difficulty === 1 ? 10 : difficulty === 2 ? 100 : 1000;
      const n = int(r, 12, 99);
      return {
        kind: "number",
        prompt: `**? × ${num(by)} = ${num(n * by)}**`,
        answer: n,
        traps: [{ value: (n * by) / 10 === n ? n * 10 : (n * by) / 10, misconception: M.zeros, feedback: `Undo × ${num(by)} by moving the digits back ${by === 10 ? "one place" : by === 100 ? "two places" : "three places"} to the right.` }].filter((t) => t.value !== n),
        hint: `What number, made ${num(by)} times bigger, gives ${num(n * by)}?`,
        explanation: `${n} × ${num(by)} = ${num(n * by)}, so the missing number is **${n}**.`,
      };
    },
  },
  {
    key: "md-10-chart",
    skill: S.tens,
    difficulties: [1, 2],
    make: (r, { difficulty }) => {
      const n = int(r, 21, 89);
      const by = difficulty === 1 ? 10 : 100;
      const right = n * by;
      const options = [
        { text: num(right) },
        { text: num(by === 10 ? n * 100 : n * 10), misconception: M.zeros, feedback: `× ${num(by)} moves each digit ${by === 10 ? "one place" : "two places"}.` },
        { text: num(n + by), feedback: `× ${num(by)} isn't the same as + ${num(by)}.` },
        { text: `${Math.floor(n / 10)}0${n % 10}${by === 100 ? "0" : ""}`, feedback: "The digits stay next to each other; zeros go in the empty places on the right." },
      ];
      return {
        kind: "choose",
        prompt: `Which number is **${n} × ${num(by)}**?`,
        visual: { kind: "pv-chart", value: right, columns: ["Th", "H", "T", "O"], hideDigits: true },
        options: options.filter((o, i, all) => all.findIndex((x) => x.text === o.text) === i),
        answer: 0,
        hint: `Each digit of ${n} moves ${by === 10 ? "one place" : "two places"} to the left.`,
        explanation: `${n} × ${num(by)} = **${num(right)}**.`,
      };
    },
  },
  {
    key: "md-10-stretch",
    skill: S.tens,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const each = int(r, 12, 48);
      return {
        kind: "number",
        prompt: `A pack has **${each} stickers**. A school buys **100 packs** and shares all the stickers equally into **10 albums**. How many stickers go in each album?`,
        answer: each * 10,
        traps: [
          { value: each * 100, misconception: M.zeros, feedback: `That's how many stickers there are. Now share them into 10 albums.` },
          { value: each, misconception: M.zeros, feedback: `× 100 then ÷ 10 is the same as × 10.` },
        ],
        hint: `First work out all the stickers: ${each} × 100.`,
        explanation: `${each} × 100 = ${num(each * 100)}, and ${num(each * 100)} ÷ 10 = **${num(each * 10)}**.`,
      };
    },
  },
  {
    key: "md-short-word",
    skill: S.short,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const m = int(r, 3, 9);
      const each = difficulty === 1 ? int(r, 21, 48) : difficulty === 2 ? int(r, 105, 395) : int(r, 1015, 2490);
      const ctx = pick(r, [
        { thing: "seats", group: "coach" },
        { thing: "pages", group: "book" },
        { thing: "grams", group: "bag" },
      ]);
      const answer = each * m;
      const wrong = noCarryProduct(each, m);
      return {
        kind: "number",
        prompt: `Each ${ctx.group} has **${num(each)} ${ctx.thing}**. How many ${ctx.thing} in **${m} ${ctx.group}s**?`,
        answer,
        traps: wrong !== answer ? [{ value: wrong, misconception: M.carry, feedback: "Carry the tens into the next column when a column makes 10 or more." }] : [],
        hint: `It's ${num(each)} × ${m}.`,
        explanation: `${num(each)} × ${m} = **${num(answer)}**.`,
      };
    },
  },
  {
    key: "md-short-stretch",
    skill: S.short,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const price = int(r, 6, 19) * 2;
      const adults = int(r, 3, 8);
      const kids = int(r, 2, 6);
      const answer = adults * price + kids * (price / 2);
      return {
        kind: "number",
        prompt: `Adult tickets cost **£${price}**. Child tickets cost **half** as much. What do **${adults} adults** and **${kids} children** pay altogether?`,
        unit: "£",
        answer,
        traps: [{ value: (adults + kids) * price, feedback: `Child tickets are half price: £${price / 2} each.` }],
        hint: `Work out the adults (${adults} × £${price}) and the children (${kids} × £${price / 2}) separately.`,
        explanation: `${adults} × £${price} = £${adults * price} and ${kids} × £${price / 2} = £${kids * (price / 2)}; together **£${answer}**.`,
      };
    },
  },
  {
    key: "md-long-row",
    skill: S.long,
    difficulties: [2, 3],
    make: (r, { difficulty }) => {
      const a = difficulty === 2 ? int(r, 13, 49) : int(r, 104, 289);
      const tens = int(r, 1, 3);
      const ones = int(r, 2, 9);
      const b = tens * 10 + ones;
      return {
        kind: "number",
        prompt: `To work out **${num(a)} × ${b}**, the first row is ${num(a)} × ${ones} = ${num(a * ones)}. What is the **second row**, ${num(a)} × ${tens * 10}?`,
        answer: a * tens * 10,
        traps: [{ value: a * tens, misconception: M.tensPlace, feedback: `The ${tens} in ${b} means ${tens} tens, so the row is ${num(a)} × ${tens * 10}: put a 0 in the ones first.` }],
        hint: `${num(a)} × ${tens * 10} is ${num(a)} × ${tens}, then × 10.`,
        explanation: `${num(a)} × ${tens} = ${num(a * tens)}, and × 10 gives **${num(a * tens * 10)}**.`,
      };
    },
  },
  {
    key: "md-long-word",
    skill: S.long,
    difficulties: [2, 3],
    make: (r, { difficulty }) => {
      const boxes = int(r, 12, difficulty === 2 ? 29 : 48);
      const each = int(r, 12, difficulty === 2 ? 36 : 75);
      const answer = boxes * each;
      const tens = Math.floor(each / 10);
      const ones = each % 10;
      const forgot = boxes * ones + boxes * tens;
      return {
        kind: "number",
        prompt: `A school orders **${boxes} boxes** with **${each} pencils** in each. How many pencils is that?`,
        answer,
        traps: forgot !== answer ? [{ value: forgot, misconception: M.tensPlace, feedback: `The ${tens} in ${each} is ${tens} tens: multiply by ${tens * 10}.` }] : [],
        hint: `Work out ${boxes} × ${each}. Split ${each} into ${tens * 10} and ${ones}.`,
        explanation: `${boxes} × ${tens * 10} = ${num(boxes * tens * 10)} and ${boxes} × ${ones} = ${num(boxes * ones)}; together **${num(answer)}**.`,
      };
    },
  },
  {
    key: "md-long-stretch",
    skill: S.long,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const a = int(r, 31, 89);
      const b = int(r, 21, 49);
      const right = a * b;
      const noTens = a * (b % 10) + a * Math.floor(b / 10);
      const estimate = Math.round(a / 10) * 10 * Math.round(b / 10) * 10;
      const options = [
        { text: num(right) },
        { text: num(noTens), misconception: M.tensPlace, feedback: `Far too small: ${a} × ${b} is about ${num(estimate)}. The tens row was multiplied by ${Math.floor(b / 10)}, not ${Math.floor(b / 10) * 10}.` },
        { text: num(right + 100), feedback: "Close, but check the hundreds when you add the rows." },
        { text: num(right * 10), feedback: `Far too big: ${a} × ${b} is about ${num(estimate)}.` },
      ];
      return {
        kind: "choose",
        prompt: `Four children worked out **${a} × ${b}**. Use an estimate to help you: which answer is right?`,
        options: options.filter((o, i, all) => all.findIndex((x) => x.text === o.text) === i),
        answer: 0,
        hint: `Round first: ${a} is about ${Math.round(a / 10) * 10} and ${b} is about ${Math.round(b / 10) * 10}.`,
        explanation: `${a} × ${b} is about ${num(estimate)}, and the exact answer is **${num(right)}**.`,
      };
    },
  },
  {
    key: "md-div-missing",
    skill: S.div,
    difficulties: [1, 2],
    make: (r, { difficulty }) => {
      const d = int(r, 3, 9);
      const q = difficulty === 1 ? int(r, 4, 12) : int(r, 13, 30);
      return {
        kind: "number",
        prompt: `**? ÷ ${d} = ${q}**`,
        answer: q * d,
        traps: [{ value: q + d, feedback: `Division undoes multiplication: the missing number is ${q} × ${d}.` }].filter((t) => t.value !== q * d),
        hint: `Which number shared into ${d} equal groups gives ${q} in each?`,
        explanation: `${q} × ${d} = ${q * d}, so **${q * d}** ÷ ${d} = ${q}.`,
      };
    },
  },
  {
    key: "md-div-stretch",
    skill: S.div,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const team = int(r, 6, 9);
      const children = int(r, 7, 15) * team + int(r, 1, team - 1);
      const left = children % team;
      return {
        kind: "number",
        prompt: `**${children} children** are put into teams of **${team}**. How many more children are needed to make one more full team?`,
        answer: team - left,
        traps: [{ value: left, misconception: M.remainder, feedback: `${left} children are left over. How many more join them to make a team of ${team}?` }].filter((t) => t.value !== team - left),
        hint: `Work out ${children} ÷ ${team}. What is the remainder?`,
        explanation: `${children} ÷ ${team} = ${Math.floor(children / team)} r ${left}. The ${left} left over need **${team - left}** more to make a team of ${team}.`,
      };
    },
  },
  {
    key: "md-common-factor",
    skill: S.factors,
    difficulties: [2, 3],
    make: (r, { difficulty }) => {
      const pairs = difficulty === 2 ? [[12, 18], [16, 24], [15, 25], [14, 21], [20, 30]] : [[24, 36], [27, 45], [32, 48], [42, 56], [36, 60]];
      const [a, b] = pick(r, pairs) as [number, number];
      const g = gcdOf(a, b);
      const smaller = factors(g).filter((x) => x > 1 && x < g).pop();
      return {
        kind: "number",
        prompt: `What is the **biggest number** that is a factor of both **${a}** and **${b}**?`,
        answer: g,
        traps: smaller ? [{ value: smaller, feedback: `${smaller} is a factor of both, but there is a bigger one.` }] : [],
        hint: `List the factors of ${a}, then find the biggest one that also goes into ${b}.`,
        explanation: `${g} goes into ${a} (${a / g} times) and into ${b} (${b / g} times), and nothing bigger does: **${g}**.`,
      };
    },
  },
  {
    key: "md-factor-stretch",
    skill: S.factors,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const [m, n, lo, hi] = pick(r, FACTOR_PUZZLES);
      const answer = uniquePuzzleAnswer(m, n, lo, hi);
      return {
        kind: "number",
        prompt: `I am a **multiple of ${m}** and a **factor of ${n}**. I am between ${lo} and ${hi}. What number am I?`,
        answer,
        hint: `List the multiples of ${m} between ${lo} and ${hi}.`,
        explanation: `Of the multiples of ${m} between ${lo} and ${hi}, only **${answer}** goes into ${n} exactly.`,
      };
    },
  },
];

/** Puzzles with exactly one answer: [multiple of, factor of, from, to] (checked in the tests). */
export const FACTOR_PUZZLES: [number, number, number, number][] = [
  [6, 60, 20, 40],
  [7, 84, 10, 20],
  [9, 90, 10, 40],
  [3, 45, 10, 20],
];

/** The single number that is a multiple of m, a factor of n and between lo and hi; throws if there isn't exactly one. */
export function uniquePuzzleAnswer(m: number, n: number, lo: number, hi: number): number {
  const fits = factors(n).filter((x) => x % m === 0 && x > lo && x < hi);
  if (fits.length !== 1) throw new Error(`Puzzle ${m}, ${n}, ${lo}–${hi} has ${fits.length} answers`);
  return fits[0]!;
}

const templates = withHints(baseTemplates, {
  "md-10": () => ["Count the zeros in the number you multiply or divide by: that's how many places each digit moves.", "Move every digit together and keep them in order. Zeros fill the empty places."],
  "md-10-missing": () => ["Work backwards: divide by the same number.", "Move each digit back to the right, and drop the zeros."],
  "md-10-chart": () => ["Picture the place-value chart: every digit slides left together.", "Zeros fill the empty places on the right, not the middle."],
  "md-10-stretch": () => ["× 100, then ÷ 10, is the same as × 10.", "So just multiply the stickers in one pack by 10."],
  "md-short": () => ["Write the bigger number on top, the single digit underneath, ones under ones.", "Multiply each column from the right. Carry the tens into the next column, then add them."],
  "md-partition": () => ["Multiply the tens part, then the ones part.", "Add the two answers together."],
  "md-short-word": () => ["Several groups of the same size: that's a multiplication.", "Use short multiplication, carrying when a column makes 10 or more."],
  "md-short-stretch": () => ["Find the child price first: half of the adult price.", "Add the adults' total and the children's total."],
  "md-long": () => ["First row: multiply by the ones digit. Second row: put a 0 in the ones, then multiply by the tens digit.", "Add the two rows to get the answer."],
  "md-long-row": () => ["Multiplying by a ten: write a 0 in the ones place first.", "Then multiply by the tens digit as if it were ones."],
  "md-long-word": () => ["Boxes times pencils in each box: it's a long multiplication.", "Do the ones row and the tens row, then add them."],
  "md-long-stretch": () => ["Multiply the rounded numbers: that's roughly the answer.", "Pick the answer closest to your estimate, then check the ones digit too."],
  "md-div": () => ["Count up in the times table of the number you divide by.", "Whatever is left over is the remainder, and it must be smaller than the number you divide by."],
  "md-div-missing": () => ["Multiply to undo the division.", "The missing number is the two numbers multiplied together."],
  "md-share": () => ["Sharing equally is dividing.", "In a problem, think about what the leftovers mean: do they need one more group?"],
  "md-div-stretch": () => ["Find how many full teams fit, and how many children are left over.", "Then count how many more make a full team."],
  "md-factor": () => ["A factor divides the number exactly, with nothing left over.", "Try dividing by each option. Which one leaves no remainder?"],
  "md-factor-count": () => ["Work in factor pairs: 1 and the number, then 2, then 3…", "Stop when the pairs meet in the middle. Count every number you wrote."],
  "md-common-factor": () => ["Write the factor pairs of each number.", "Circle the numbers in both lists. Which is the biggest?"],
  "md-factor-stretch": () => ["Cross out the multiples that don't divide the second number exactly.", "Only one number should be left."],
});

export const multiplyDivide = defineTopic(withExtras({
  id: T,
  title: "Multiply and divide",
  subtitle: "Multiply and divide by 10, 100 and 1,000, short and long multiplication, division and factors",
  world: "calc",
  years: [4, 5, 6],
  order: 3,
  icon: "divide",
  skills: [
    { id: S.tens, title: "× and ÷ by 10, 100, 1,000", description: "Move digits left to multiply and right to divide by 10, 100 and 1,000.", lessonId: "ten-hundred" },
    { id: S.short, title: "Short multiplication", description: "Multiply numbers up to 4 digits by a single digit.", lessonId: "short" },
    { id: S.long, title: "Long multiplication", description: "Multiply by a 2-digit number by splitting it into tens and ones.", lessonId: "long" },
    { id: S.div, title: "Division and remainders", description: "Divide by a single digit, and decide what to do with a remainder.", lessonId: "divide" },
    { id: S.factors, title: "Factors and multiples", description: "Find factors and multiples, and count the factors of a number.", lessonId: "factors" },
  ],
  lessonIcons: { "ten-hundred": "place-value", short: "times", long: "rocket", divide: "divide", factors: "puzzle" },
  lessons: [
    {
      id: "ten-hundred",
      title: "× and ÷ by 10, 100 and 1,000",
      phase: "Understand",
      summary: "The digits move; zeros hold the empty places.",
      minutes: 6,
      objectives: ["Multiply and divide by 10, 100 and 1,000"],
      steps: [
        {
          type: "explain",
          title: "Digits slide along",
          body: ["**× 10** moves every digit one place to the **left**: 34 × 10 = **340**. A zero fills the empty ones place.", "**÷ 10** moves every digit one place to the **right**: 340 ÷ 10 = **34**."],
          visual: { kind: "pv-chart", value: 340, columns: ["Th", "H", "T", "O"] },
          tip: "× 100 moves two places, × 1,000 moves three.",
        },
        {
          type: "worked",
          title: "Watch me: 56 × 100",
          support: "full",
          problem: "**56 × 100**",
          visual: { kind: "pv-chart", value: 5600, columns: ["Th", "H", "T", "O"] },
          steps: [
            { text: "100 has **two zeros**, so every digit moves **two places** to the left." },
            { text: "The 5 tens become 5 thousands, and the 6 ones become 6 hundreds." },
            { text: "Zeros fill the empty tens and ones places: **5,600**." },
          ],
          conclusion: "56 × 100 = **5,600**. The digits moved; nothing was \"added on\".",
        },
        {
          type: "worked",
          title: "Together: 4,700 ÷ 10",
          support: "faded",
          problem: "**4,700 ÷ 10**",
          steps: [
            { text: "÷ 10 moves every digit **one place** to the right." },
            {
              text: "The 4 thousands become 4 hundreds and the 7 hundreds become 7 tens.",
              blank: {
                prompt: "4,700 ÷ 10 = ?",
                answer: 470,
                hint: "Move each digit one place right.",
                traps: [{ value: 47, misconception: M.zeros, feedback: "That moved the digits two places, which is ÷ 100. ÷ 10 moves them one place." }, { value: 47000, misconception: M.zeros, feedback: "Dividing makes the number smaller: the digits move right." }],
                worked: "**470**: 4 hundreds and 7 tens.",
              },
            },
          ],
          conclusion: "4,700 ÷ 10 = **470**.",
        },
        { type: "check", title: "Your turn", questionId: gen("md-10", 1, 3) },
        { type: "check", title: "One more", questionId: gen("md-10", 2, 7) },
      ],
    },
    {
      id: "short",
      title: "Short multiplication",
      phase: "Visualise",
      summary: "Split the number, multiply each part, add them up.",
      minutes: 7,
      objectives: ["Multiply by partitioning", "Use short multiplication with carrying"],
      steps: [
        {
          type: "explain",
          title: "Split it up",
          body: ["To multiply **47 × 6**, split 47 into its tens and ones: **40** and **7**.", "Multiply each part by 6: 40 × 6 = 240 and 7 × 6 = 42. Then add: 240 + 42 = **282**.", "Short multiplication in columns does exactly this, starting with the ones and carrying any tens."],
          visual: { kind: "bar", total: "47 × 6", parts: [{ label: "40 × 6 = 240", size: 40, tone: "brand" }, { label: "7 × 6 = 42", size: 14, tone: "num" }] },
        },
        {
          type: "worked",
          title: "Watch me: 36 × 7 in columns",
          support: "full",
          problem: "**36 × 7**",
          steps: [
            { text: "Write 36 with 7 underneath, ones under ones." },
            { text: "**Ones:** 6 × 7 = 42. Write **2** in the ones and carry **4** tens." },
            { text: "**Tens:** 3 × 7 = 21 tens, plus the 4 carried = **25** tens. Write 25." },
          ],
          conclusion: "36 × 7 = **252**. Check: 36 is nearly 40, and 40 × 7 = 280, so 252 is sensible.",
        },
        {
          type: "worked",
          title: "Let's do it together",
          support: "faded",
          problem: "**243 × 4**",
          steps: [
            { text: "Ones: 3 × 4 = 12. Write 2, carry 1." },
            { text: "Tens: 4 × 4 = 16, plus the carried 1.", blank: { prompt: "How many tens?", answer: 17, hint: "16 + 1", traps: [{ value: 16, misconception: M.carry, feedback: "Don't forget the 1 you carried from the ones." }], worked: "**17**: write 7, carry 1." } },
            { text: "Hundreds: 2 × 4 = 8, plus 1 = 9." },
          ],
          conclusion: "243 × 4 = **972**.",
        },
        { type: "check", title: "Your turn", questionId: gen("md-partition", 1, 5) },
        { type: "check", title: "One more", questionId: gen("md-short", 2, 8) },
      ],
    },
    {
      id: "long",
      title: "Long multiplication",
      phase: "Explore",
      summary: "Multiply by the tens, multiply by the ones, add.",
      minutes: 8,
      objectives: ["Multiply by a 2-digit number"],
      steps: [
        {
          type: "explain",
          title: "Split the second number",
          body: ["To multiply by a 2-digit number like **14**, split it into tens and ones: **10 + 4**.", "Multiply by each part, then add the two answers. 23 × 10 = 230 and 23 × 4 = 92, so 23 × 14 = 230 + 92 = **322**.", "In columns, each part gets its own row. The tens row starts with a 0, because you are multiplying by tens."],
          visual: { kind: "bar", total: "23 × 14", parts: [{ label: "23 × 10 = 230", size: 10, tone: "brand" }, { label: "23 × 4 = 92", size: 4, tone: "num" }] },
        },
        {
          type: "worked",
          title: "Watch me: 23 × 14",
          support: "full",
          problem: "**23 × 14**",
          visual: { kind: "bar", total: "23 × 14", parts: [{ label: "23 × 10 = 230", size: 10, tone: "brand" }, { label: "23 × 4 = 92", size: 4, tone: "num" }] },
          steps: [{ text: "14 is **10 + 4**." }, { text: "23 × 10 = **230**, and 23 × 4 = **92**." }, { text: "230 + 92 = **322**." }],
          conclusion: "23 × 14 = **322**.",
        },
        {
          type: "worked",
          title: "Together: 31 × 12",
          support: "faded",
          problem: "**31 × 12**",
          steps: [
            { text: "12 is **10 + 2**. First row: 31 × 2 = **62**." },
            {
              text: "Second row: 31 × 10. Write a 0 in the ones first.",
              blank: { prompt: "31 × 10 = ?", answer: 310, hint: "Each digit moves one place left.", traps: [{ value: 31, misconception: M.tensPlace, feedback: "The 1 in 12 is one **ten**: multiply by 10, so put a 0 in the ones." }], worked: "**310**." },
            },
            { text: "Add the rows: 62 + 310 = **372**." },
          ],
          conclusion: "31 × 12 = **372**.",
        },
        {
          type: "lab",
          title: "Watch how it works",
          body: [],
          explainer: "long-multiplication-watch",
          numbers: [23, 14],
          challenges: [`${T}.long-watch`],
        },
        {
          type: "lab",
          title: "Try it yourself",
          body: [],
          explainer: "long-multiplication-try",
          numbers: [34, 12, 23, 14],
          challenges: [`${T}.long-try`],
        },
        { type: "check", title: "Your turn", questionId: gen("md-long", 2, 4) },
        { type: "check", title: "One more", questionId: gen("md-long", 3, 9) },
      ],
    },
    {
      id: "divide",
      title: "Division and remainders",
      phase: "Practise",
      summary: "Share or group, and decide what a remainder means.",
      minutes: 8,
      objectives: ["Divide by a single digit", "Interpret remainders in a problem"],
      steps: [
        {
          type: "explain",
          title: "Equal groups",
          body: ["**15 ÷ 3** shares 15 into 3 equal groups: **5** in each.", "You can also think of it as grouping: how many 3s make 15? Count in threes: 3, 6, 9, 12, 15. That's **5** threes."],
          visual: { kind: "groups", groups: 3, each: 5, label: "15 in 3 equal groups" },
        },
        {
          type: "worked",
          title: "Watch me: 96 ÷ 4",
          support: "full",
          problem: "**96 ÷ 4** (short division)",
          visual: { kind: "groups", groups: 4, each: 24, label: "96 shared into 4 equal groups" },
          steps: [
            { text: "**Tens:** 9 tens ÷ 4 = 2 tens each, with **1 ten** left over." },
            { text: "Exchange the leftover ten for 10 ones: 10 + 6 = **16** ones." },
            { text: "**Ones:** 16 ÷ 4 = **4** each." },
          ],
          conclusion: "96 ÷ 4 = **24**. Check: 24 × 4 = 96.",
        },
        {
          type: "explain",
          title: "Left over",
          body: ["**17 ÷ 3** = 5 groups of 3 is 15, with **2 left over**. We write **5 r 2**.", "In a problem, think about the leftovers: 17 eggs in boxes of 3 need **6** boxes, because the last 2 eggs still need a box."],
          tip: "A remainder is always smaller than the number you divide by.",
        },
        {
          type: "worked",
          title: "Together: 47 ÷ 5",
          support: "faded",
          problem: "**47 ÷ 5**",
          steps: [
            { text: "Count in fives: 9 fives make **45**, and 10 fives make 50, which is too many." },
            {
              text: "So 9 groups, and 47 − 45 is left over.",
              blank: { prompt: "What is the remainder?", answer: 2, hint: "47 − 45", traps: [{ value: 7, misconception: M.remainder, feedback: "7 is bigger than 5, so another group of 5 fits. Use 9 groups, not 8." }], worked: "**2**: 47 ÷ 5 = 9 r 2." },
            },
          ],
          conclusion: "47 ÷ 5 = **9 r 2**. The remainder 2 is smaller than 5, as it must be.",
        },
        { type: "check", title: "Your turn", questionId: gen("md-div", 1, 2) },
        { type: "check", title: "One more", questionId: gen("md-share", 3, 6) },
      ],
    },
    {
      id: "factors",
      title: "Factors and multiples",
      phase: "Apply",
      summary: "Factors go into a number; multiples are in its times table.",
      minutes: 7,
      objectives: ["Find the factors of a number", "Recognise multiples"],
      steps: [
        {
          type: "explain",
          title: "Factor pairs",
          body: ["The factors of **12** come in pairs: **1 × 12, 2 × 6, 3 × 4**. So 12 has 6 factors: 1, 2, 3, 4, 6 and 12.", "The **multiples** of 4 are 4, 8, 12, 16…: the 4 times table."],
          visual: { kind: "array", rows: 3, cols: 4 },
        },
        {
          type: "worked",
          title: "Watch me: the factors of 18",
          support: "full",
          problem: "Find all the factors of **18**.",
          visual: { kind: "array", rows: 3, cols: 6 },
          steps: [
            { text: "Start with **1 × 18**." },
            { text: "Try 2: **2 × 9**. Try 3: **3 × 6**. Try 4 and 5: they don't divide 18." },
            { text: "The next number to try is 6, which we already have, so stop: the pairs have met in the middle." },
          ],
          conclusion: "The factors of 18 are **1, 2, 3, 6, 9 and 18**: six factors.",
        },
        {
          type: "worked",
          title: "Together: how many factors does 20 have?",
          support: "faded",
          problem: "Count the factors of **20**.",
          steps: [
            { text: "Factor pairs: **1 × 20, 2 × 10, 4 × 5**. (3 doesn't divide 20.)" },
            {
              text: "Now count every number in the pairs.",
              blank: { prompt: "How many factors?", answer: 6, hint: "1, 2, 4, 5, 10, 20", traps: [{ value: 4, misconception: M.factorEnds, feedback: "Don't forget 1 and 20 themselves: they are factors too." }], worked: "**6** factors: 1, 2, 4, 5, 10 and 20." },
            },
          ],
          conclusion: "20 has **6** factors.",
        },
        { type: "check", title: "Your turn", questionId: gen("md-factor", 1, 4) },
        { type: "check", title: "One more", questionId: gen("md-factor-count", 2, 8) },
      ],
    },
  ],
  templates,
  misconceptions: [
    { id: M.zeros, name: "Moving digits the wrong way or too far", possibleCause: "It looks like the digits moved the wrong number of places, or the wrong way.", description: "Writes 34 × 100 = 340, or divides when multiplying.", explanation: ["× 10 moves digits one place left; × 100 moves them two.", "÷ moves them right, so the number gets smaller."], skills: [S.tens, S.div], followUpTemplates: ["md-10"] },
    { id: M.carry, name: "Forgetting to carry", possibleCause: "It looks like a carried ten went missing.", description: "Writes only the ones digit of each column product.", explanation: ["3 × 4 = 12: write 2 and carry 1.", "Add the carried 1 after multiplying the next column."], skills: [S.short], followUpTemplates: ["md-short", "md-partition"] },
    { id: M.tensPlace, name: "Treating the tens digit as ones", possibleCause: "It looks like the tens digit was multiplied as if it were ones.", description: "Works out 23 × 14 as 23 × 1 + 23 × 4.", explanation: ["The 1 in 14 is 1 ten.", "So multiply by 10, not 1: 230 + 92 = 322."], skills: [S.long], followUpTemplates: ["md-long"] },
    { id: M.remainder, name: "A remainder that is too big, or ignored", possibleCause: "It looks like the remainder wasn't handled quite right.", description: "Leaves a remainder bigger than the divisor, or ignores leftovers in a problem.", explanation: ["The remainder must be smaller than the number you divide by.", "In a problem, decide if the leftovers need one more group."], skills: [S.div], followUpTemplates: ["md-div", "md-share"] },
    { id: M.factorEnds, name: "Forgetting 1 and the number itself", possibleCause: "It looks like 1 and the number itself were left out.", description: "Counts the factors of 12 as 4, missing 1 and 12.", explanation: ["Every number has 1 and itself as factors.", "12: 1, 2, 3, 4, 6 and 12."], skills: [S.factors], followUpTemplates: ["md-factor-count"] },
  ],
  placement: [
    { lessonId: "ten-hundred", template: "md-10" },
    { lessonId: "short", template: "md-short" },
    { lessonId: "long", template: "md-long" },
    { lessonId: "divide", template: "md-div" },
    { lessonId: "factors", template: "md-factor" },
  ],
}, multiplyDivideExtra));
