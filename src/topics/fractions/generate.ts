import { hashString, prng, seededShuffle } from "@/engine/random";
import type { SkillId } from "@/engine/types";
import { compareSymbol, equivalent, format, frac as f, gcd, partName, sameFraction, type Fraction } from "./math";
import { M } from "./misconceptions";
import type { ChoiceOption, Diagram, FractionOption, FractionQuestion, NumericTrap } from "./types";

/**
 * Procedural question generators.
 *
 * A generated question's id encodes everything needed to rebuild it:
 * `g:fractions.<template>:<difficulty>:<seed>`. So a question can be persisted by id,
 * reloaded later, and regenerated identically — no question bank to exhaust.
 */

type Rng = () => number;
type Difficulty = 1 | 2 | 3;
type Base = { id: string; skill: SkillId; difficulty: Difficulty };

interface Template {
  key: string;
  skill: SkillId;
  difficulties: Difficulty[];
  make: (rng: Rng, base: Base) => FractionQuestion;
}

const int = (r: Rng, lo: number, hi: number) => lo + Math.floor(r() * (hi - lo + 1));
const pick = <T,>(r: Rng, items: readonly T[]): T => items[Math.floor(r() * items.length)];
const range = (n: number) => Array.from({ length: n }, (_, i) => i);
const fr = (x: Fraction) => `{${format(x)}}`;

/** A random coprime fraction n/d with 1 ≤ n < d. */
function properFraction(r: Rng, dMin: number, dMax: number, unitOnly = false): Fraction {
  for (;;) {
    const d = int(r, dMin, dMax);
    const n = unitOnly ? 1 : int(r, 1, d - 1);
    if (gcd(n, d) === 1) return f(n, d);
  }
}

function randomSubset(r: Rng, total: number, count: number): number[] {
  return seededShuffle(range(total), String(Math.floor(r() * 1e9)))
    .slice(0, count)
    .sort((a, b) => a - b);
}

function shapeWord(d: Diagram) {
  return d.shape === "circle" ? "circle" : d.shape === "grid" ? "rectangle" : d.shape === "line" ? "number line" : "bar";
}

/** Unequal piece sizes: never all the same. */
function unequalSizes(r: Rng, parts: number): number[] {
  for (;;) {
    const sizes = range(parts).map(() => pick(r, [1, 1, 2, 2, 3]));
    if (new Set(sizes).size > 1) return sizes;
  }
}

function namingDiagram(r: Rng, difficulty: Difficulty): Diagram {
  if (difficulty === 1) {
    const parts = int(r, 2, 6);
    const shaded = range(int(r, 1, parts - 1));
    return { shape: pick(r, ["bar", "circle"] as const), parts, shaded };
  }
  if (difficulty === 2) {
    if (r() < 0.3) {
      const [rows, cols] = pick(r, [[2, 2], [2, 3], [2, 4], [3, 3], [2, 5], [3, 4]] as const);
      const total = rows * cols;
      return { shape: "grid", rows, cols, shaded: randomSubset(r, total, int(r, 1, total - 1)) };
    }
    const parts = int(r, 4, 9);
    return { shape: pick(r, ["bar", "circle"] as const), parts, shaded: range(int(r, 1, parts - 1)) };
  }
  const parts = int(r, 6, 12);
  return { shape: pick(r, ["bar", "circle"] as const), parts, shaded: randomSubset(r, parts, int(r, 1, parts - 1)) };
}

function partsOf(d: Diagram) {
  return d.shape === "grid" ? d.rows * d.cols : d.shape === "line" ? d.intervals : d.parts;
}

/** Plausible wrong answers for "what fraction is shown", each tagged with the misconception it reveals. */
function namingOptions(r: Rng, answer: Fraction, total: number, counted: number): FractionOption[] {
  const candidates: FractionOption[] = [
    { ...f(total, counted), misconception: M.SWAP },
    { ...f(counted, total - counted), misconception: M.PART_PART },
    { ...f(counted, total + 1), misconception: M.MISCOUNT },
    { ...f(counted, total - 1), misconception: M.MISCOUNT },
    f(total - counted, total),
    f(counted + 1, total),
  ];
  const out: FractionOption[] = [answer];
  for (const c of candidates) {
    if (out.length >= 4) break;
    if (c.d < 1 || c.n < 0) continue;
    if (out.some((o) => sameFraction(o, c) || equivalent(o, c))) continue;
    out.push(c);
  }
  return seededShuffle(out, String(Math.floor(r() * 1e9)));
}

const PEOPLE = ["Mia", "Leo", "Ava", "Sam", "Zara", "Omar", "Priya", "Jay", "Ellie", "Noah", "Isla", "Kai"];

const STORIES: { total: (n: number) => string; ask: (who: string, fr: string) => string; unit: string }[] = [
  { total: (n) => `A bag has ${n} sweets.`, ask: (w, x) => `${w} eats ${x} of them. How many sweets does ${w} eat?`, unit: "sweets" },
  { total: (n) => `There are ${n} children in a class.`, ask: (_w, x) => `${x} of them walk to school. How many children walk to school?`, unit: "children" },
  { total: (n) => `A book has ${n} pages.`, ask: (w, x) => `${w} has read ${x} of the book. How many pages has ${w} read?`, unit: "pages" },
  { total: (n) => `A farmer has ${n} sheep.`, ask: (_w, x) => `${x} of the sheep are in the top field. How many sheep is that?`, unit: "sheep" },
  { total: (n) => `Ava has £${n} of pocket money.`, ask: (_w, x) => `She spends ${x} of it on a kite. How much does the kite cost?`, unit: "£" },
  { total: (n) => `A box holds ${n} crayons.`, ask: (_w, x) => `${x} of the crayons are broken. How many crayons are broken?`, unit: "crayons" },
  { total: (n) => `A garden has ${n} flowers.`, ask: (_w, x) => `${x} of them are red. How many red flowers are there?`, unit: "flowers" },
  { total: (n) => `A race is ${n} km long.`, ask: (w, x) => `${w} has run ${x} of the race. How far has ${w} run?`, unit: "km" },
];

const TEMPLATES: Template[] = [
  /* ─────────── Wholes and equal parts ─────────── */
  {
    key: "ep-pick",
    skill: "fractions.equal-parts",
    difficulties: [1, 2, 3],
    make: (r, base) => {
      const maxParts = base.difficulty === 1 ? 4 : base.difficulty === 2 ? 6 : 8;
      const flags = seededShuffle([true, false, r() < 0.5, r() < 0.5], String(Math.floor(r() * 1e9)));
      const items = flags.map((equal, i) => {
        const shape = pick(r, ["bar", "circle"] as const);
        const parts = int(r, 2, maxParts);
        const diagram: Diagram = equal ? { shape, parts } : { shape, parts, sizes: unequalSizes(r, parts) };
        return { id: String.fromCharCode(97 + i), diagram, equal };
      });
      return {
        ...base,
        kind: "equal-parts",
        prompt: "Tap every shape that is split into **equal parts**.",
        items: items.map(({ id, diagram }) => ({ id, diagram })),
        answer: items.filter((it) => it.equal).map((it) => it.id),
        hint: "Check one shape at a time. Are all of its pieces exactly the same size?",
        explanation: "Equal parts means every piece is the same size. Count isn't enough — check the size of each piece.",
      };
    },
  },
  {
    key: "ep-yesno",
    skill: "fractions.equal-parts",
    difficulties: [1, 2, 3],
    make: (r, base) => {
      const parts = int(r, 2, base.difficulty === 1 ? 4 : 6);
      const equal = r() < 0.45;
      const shape = pick(r, ["bar", "circle"] as const);
      const thing = shape === "circle" ? pick(r, ["pizza", "pie", "cake"]) : pick(r, ["ribbon", "chocolate bar", "strip of paper"]);
      const who = pick(r, PEOPLE);
      const name = partName(parts);
      const yes: ChoiceOption = equal
        ? { id: "yes", label: `Yes — the ${parts} pieces are all the same size` }
        : { id: "yes", label: `Yes — there are ${parts} pieces`, misconception: M.UNEQUAL };
      const no: ChoiceOption = equal
        ? { id: "no", label: `No — ${name} need more pieces` }
        : { id: "no", label: `No — the pieces are not all the same size` };
      return {
        ...base,
        kind: "choose",
        prompt: `${who} cuts a ${thing} like this. Has it been cut into **${name}**?`,
        diagram: equal ? { shape, parts } : { shape, parts, sizes: unequalSizes(r, parts) },
        options: [yes, no, { id: "other", label: `No — ${name} must always be shaded` }],
        answer: equal ? "yes" : "no",
        hint: `${name[0].toUpperCase()}${name.slice(1)} are ${parts} pieces that are all exactly the same size.`,
        explanation: equal
          ? `There are ${parts} pieces and they are all equal, so they are ${name}.`
          : `There are ${parts} pieces, but they are different sizes — so they are not ${name}.`,
      };
    },
  },

  /* ─────────── Reading fractions ─────────── */
  {
    key: "nm-choose",
    skill: "fractions.name",
    difficulties: [1, 2, 3],
    make: (r, base) => {
      const diagram = namingDiagram(r, base.difficulty);
      const total = partsOf(diagram);
      const shaded = diagram.shape === "line" ? 0 : diagram.shaded?.length ?? 0;
      const ask = base.difficulty === 3 && r() < 0.4 ? ("unshaded" as const) : ("shaded" as const);
      const counted = ask === "shaded" ? shaded : total - shaded;
      const answer = f(counted, total);
      const word = shapeWord(diagram);
      return {
        ...base,
        kind: "choose-fraction",
        prompt: ask === "shaded" ? `What fraction of the ${word} is shaded?` : `What fraction of the ${word} is **not** shaded?`,
        diagram,
        ask,
        options: namingOptions(r, answer, total, counted),
        answer,
        hint: "Count every equal part for the bottom number. Then count the parts you're asked about for the top number.",
        explanation: `There are ${total} equal parts and ${counted} ${ask === "shaded" ? "are shaded" : "are not shaded"}, so the answer is ${fr(answer)}.`,
      };
    },
  },
  {
    key: "nm-write",
    skill: "fractions.name",
    difficulties: [2, 3],
    make: (r, base) => {
      const diagram = namingDiagram(r, base.difficulty);
      const total = partsOf(diagram);
      const counted = diagram.shape === "line" ? 0 : diagram.shaded?.length ?? 0;
      const answer = f(counted, total);
      return {
        ...base,
        kind: "write-fraction",
        prompt: `Write the fraction of the ${shapeWord(diagram)} that is shaded.`,
        diagram,
        answer,
        hint: "Bottom number: all the equal parts. Top number: the shaded parts.",
        explanation: `There are ${total} equal parts and ${counted} are shaded, so ${fr(answer)} is shaded.`,
      };
    },
  },
  {
    key: "nm-line",
    skill: "fractions.number-line",
    difficulties: [2, 3],
    make: (r, base) => {
      const intervals = base.difficulty === 2 ? int(r, 3, 6) : int(r, 6, 10);
      const point = int(r, 1, intervals - 1);
      const answer = f(point, intervals);
      return {
        ...base,
        kind: "choose-fraction",
        prompt: "What fraction is marked on the number line?",
        diagram: { shape: "line", intervals, point },
        options: namingOptions(r, answer, intervals, point),
        answer,
        hint: "Count the equal jumps from 0 to 1 — not the marks. That's the bottom number.",
        explanation: `There are ${intervals} equal jumps from 0 to 1, and the point is ${point} jump${point === 1 ? "" : "s"} along: ${fr(answer)}.`,
      };
    },
  },

  /* ─────────── Showing fractions ─────────── */
  {
    key: "rp-shade",
    skill: "fractions.represent",
    difficulties: [1, 2, 3],
    make: (r, base) => {
      const shape = pick(r, ["bar", "circle"] as const);
      if (base.difficulty === 3) {
        for (;;) {
          const target = properFraction(r, 2, 6);
          const k = int(r, 2, 3);
          if (target.d * k > 12) continue;
          const parts = target.d * k;
          return {
            ...base,
            kind: "shade",
            prompt: `This ${shape} has ${parts} equal parts. Shade ${fr(target)} of it.`,
            diagram: { shape, parts },
            target,
            hint: `${parts} parts is ${k} times as many as ${target.d}. So each ${partName(target.d, false)} is ${k} parts.`,
            explanation: `${fr(target)} = ${fr(f(target.n * k, parts))}, so shade ${target.n * k} of the ${parts} parts.`,
          };
        }
      }
      const target = properFraction(r, 2, base.difficulty === 1 ? 6 : 10);
      return {
        ...base,
        kind: "shade",
        prompt: `Shade ${fr(target)} of the ${shape}.`,
        diagram: { shape, parts: target.d },
        target,
        hint: `The ${shape} has ${target.d} equal parts. The top number tells you how many to shade.`,
        explanation: `${fr(target)} means ${target.n} of the ${target.d} equal parts.`,
      };
    },
  },

  /* ─────────── Comparing ─────────── */
  {
    key: "cp-sign",
    skill: "fractions.compare",
    difficulties: [1, 2, 3],
    make: (r, base) => {
      let left: Fraction;
      let right: Fraction;
      let why: string;
      if (base.difficulty === 1) {
        const d = int(r, 3, 10);
        const [a, b] = seededShuffle(range(d - 1).map((x) => x + 1), String(Math.floor(r() * 1e9))).slice(0, 2);
        left = f(a, d);
        right = f(b, d);
        why = `Both are ${partName(d)} of the same whole, so the one with more parts is bigger.`;
      } else if (base.difficulty === 2) {
        const n = int(r, 1, 3);
        const [a, b] = seededShuffle(
          range(9).map((x) => x + n + 1),
          String(Math.floor(r() * 1e9)),
        ).slice(0, 2);
        left = f(n, a);
        right = f(n, b);
        why = `Both have ${n} part${n === 1 ? "" : "s"}. ${partName(Math.max(a, b))[0].toUpperCase()}${partName(Math.max(a, b)).slice(1)} are smaller pieces than ${partName(Math.min(a, b))}, so the one with the smaller denominator is bigger.`;
      } else {
        const small = properFraction(r, 2, 5);
        const k = int(r, 2, 3);
        const bigD = small.d * k;
        const n = pick(r, [small.n * k - 1, small.n * k, small.n * k + 1].filter((x) => x >= 1 && x < bigD));
        const pair = [small, f(n, bigD)];
        [left, right] = r() < 0.5 ? pair : [pair[1], pair[0]];
        why = `${fr(small)} = ${fr(f(small.n * k, bigD))}. Now both are ${partName(bigD)}, so compare the numerators.`;
      }
      const sym = compareSymbol(left, right);
      return {
        ...base,
        kind: "compare",
        prompt: "Choose the correct sign.",
        left,
        right,
        showVisual: base.difficulty < 3,
        hint:
          base.difficulty === 1
            ? "Same bottom number means same-sized pieces. Which has more pieces?"
            : base.difficulty === 2
              ? "Same top number — so think about the size of each piece. More pieces in the whole means smaller pieces."
              : "Make the denominators the same first, then compare.",
        explanation: `${why} So ${fr(left)} ${sym} ${fr(right)}.`,
      };
    },
  },

  /* ─────────── Equivalent fractions ─────────── */
  {
    key: "eq-missing",
    skill: "fractions.equivalent",
    difficulties: [1, 2, 3],
    make: (r, base) => {
      const left = properFraction(r, 2, base.difficulty === 3 ? 7 : 5);
      const k = base.difficulty === 1 ? int(r, 2, 3) : base.difficulty === 2 ? int(r, 2, 5) : int(r, 3, 6);
      const missingTop = base.difficulty === 1 || r() < 0.55;
      const right = missingTop ? { d: left.d * k } : { n: left.n * k };
      return {
        ...base,
        kind: "missing-number",
        prompt: "Find the missing number.",
        left,
        right,
        hint: missingTop
          ? `What do you multiply ${left.d} by to get ${left.d * k}? Do the same to the top.`
          : `What do you multiply ${left.n} by to get ${left.n * k}? Do the same to the bottom.`,
        explanation: missingTop
          ? `${left.d} × ${k} = ${left.d * k}, so ${left.n} × ${k} = ${left.n * k}: ${fr(left)} = ${fr(f(left.n * k, left.d * k))}.`
          : `${left.n} × ${k} = ${left.n * k}, so ${left.d} × ${k} = ${left.d * k}: ${fr(left)} = ${fr(f(left.n * k, left.d * k))}.`,
      };
    },
  },
  {
    key: "eq-choose",
    skill: "fractions.equivalent",
    difficulties: [2, 3],
    make: (r, base) => {
      const target = properFraction(r, 2, 6);
      const k = int(r, 2, base.difficulty === 2 ? 4 : 6);
      const right = f(target.n * k, target.d * k);
      const wrong: ChoiceOption[] = [];
      const add = int(r, 1, 3);
      const tries: [Fraction, string | undefined][] = [
        [f(target.n + add, target.d + add), M.ADDITIVE],
        [f(target.n * k, target.d * k + 1), undefined],
        [f(target.n * k, target.d), undefined],
        [f(target.n + k, target.d * k), undefined],
        [f(target.n * (k + 1), target.d * k), undefined],
      ];
      for (const [x, m] of tries) {
        if (wrong.length >= 3) break;
        if (equivalent(x, target) || x.n > x.d * 2) continue;
        if (wrong.some((w) => w.label === fr(x)) || fr(x) === fr(right)) continue;
        wrong.push({ id: `w${wrong.length}`, label: fr(x), misconception: m });
      }
      return {
        ...base,
        kind: "choose",
        prompt: `Which fraction is **equivalent** to ${fr(target)}?`,
        options: seededShuffle([{ id: "ok", label: fr(right) }, ...wrong], String(Math.floor(r() * 1e9))),
        answer: "ok",
        hint: "Equivalent fractions come from multiplying the top and bottom by the same number.",
        explanation: `${fr(target)} × ${k} on the top and the bottom gives ${fr(right)} — the same amount.`,
      };
    },
  },

  /* ─────────── Number lines ─────────── */
  {
    key: "nl-place",
    skill: "fractions.number-line",
    difficulties: [1, 2, 3],
    make: (r, base) => {
      if (base.difficulty === 3) {
        for (;;) {
          const target = properFraction(r, 2, 5);
          const k = int(r, 2, 3);
          if (target.d * k > 12) continue;
          const intervals = target.d * k;
          return {
            ...base,
            kind: "number-line-place",
            prompt: `This line is split into ${partName(intervals)}. Mark ${fr(target)}.`,
            intervals,
            target,
            hint: `${fr(target)} = ?/${intervals}. Multiply the top and bottom by ${k}.`,
            explanation: `${fr(target)} = ${fr(f(target.n * k, intervals))}, so it is ${target.n * k} jumps from 0.`,
          };
        }
      }
      const target = properFraction(r, 2, base.difficulty === 1 ? 5 : 10);
      return {
        ...base,
        kind: "number-line-place",
        prompt: `Tap the number line to mark ${fr(target)}.`,
        intervals: target.d,
        target,
        hint: `The line from 0 to 1 is split into ${target.d} equal jumps. Make ${target.n} jump${target.n === 1 ? "" : "s"} from 0.`,
        explanation: `${target.d} equal jumps make ${partName(target.d)}. ${fr(target)} is ${target.n} jump${target.n === 1 ? "" : "s"} from 0.`,
      };
    },
  },

  /* ─────────── Adding and subtracting (same denominator) ─────────── */
  {
    key: "ad-sum",
    skill: "fractions.add-same",
    difficulties: [1, 2, 3],
    make: (r, base) => {
      const d = int(r, 3, base.difficulty === 1 ? 8 : 12);
      if (base.difficulty === 1) {
        // a/d + b/d with the result within one whole.
        const a = int(r, 1, d - 2);
        const b = int(r, 1, d - 1 - a);
        const answer = f(a + b, d);
        const options: FractionOption[] = [answer, { ...f(a + b, d + d), misconception: M.ADD_DEN }, f(Math.max(a, b), d), f(d, a + b)];
        return {
          ...base,
          kind: "choose-fraction",
          prompt: `${fr(f(a, d))} + ${fr(f(b, d))} = ?`,
          diagram: { shape: "bar", parts: d, shaded: range(a + b), added: range(a + b).slice(a) },
          options: options.filter((o, i) => options.findIndex((x) => x.n * o.d === o.n * x.d && x.n === o.n) === i),
          answer,
          hint: `The parts are all ${fr(f(1, d))}s. Count them.`,
          explanation: `${a} + ${b} = ${a + b}, and the parts stay the same size: ${fr(answer)}.`,
        };
      }
      // a/d − b/d; at difficulty 3 the first fraction is the whole, d/d.
      const a = base.difficulty === 3 ? d : int(r, 2, d - 1);
      const b = int(r, 1, a - 1);
      const answer = f(a - b, d);
      return {
        ...base,
        kind: "write-fraction",
        prompt: base.difficulty === 3 ? `A whole bar is ${fr(f(d, d))}. Take away ${fr(f(b, d))}. Write what is left.` : `Write the answer: ${fr(f(a, d))} − ${fr(f(b, d))} = ?`,
        diagram: { shape: "bar", parts: d, shaded: range(a - b), removed: range(a).slice(a - b) },
        answer,
        hint: "Take away the numerators. The denominator stays the same.",
        explanation: `${a} − ${b} = ${a - b}, and the parts stay the same size: ${fr(answer)}.`,
      };
    },
  },

  /* ─────────── Fractions of amounts ─────────── */
  {
    key: "fo-amount",
    skill: "fractions.fraction-of",
    difficulties: [1, 2, 3],
    make: (r, base) => {
      const fraction = properFraction(r, 2, base.difficulty === 1 ? 5 : base.difficulty === 2 ? 8 : 10, base.difficulty === 1);
      const each = int(r, 2, base.difficulty === 1 ? 5 : base.difficulty === 2 ? 8 : 12);
      const amount = fraction.d * each;
      const answer = fraction.n * each;
      const traps: NumericTrap[] = [];
      if (fraction.n > 1) {
        traps.push({ value: each, misconception: M.UNIT_ONLY, feedback: `${each} is the size of **one** part. You need ${fraction.n} parts.` });
        if (amount % fraction.n === 0 && amount / fraction.n !== answer && amount / fraction.n !== each) {
          traps.push({ value: amount / fraction.n, misconception: M.SWAP, feedback: `It looks like you divided by ${fraction.n}. Divide by the denominator, ${fraction.d}, first.` });
        }
      }
      const method = fraction.n === 1
        ? `${amount} ÷ ${fraction.d} = ${each}.`
        : `${amount} ÷ ${fraction.d} = ${each} in each part. ${fraction.n} parts is ${fraction.n} × ${each} = ${answer}.`;
      if (base.difficulty === 3) {
        const story = pick(r, STORIES);
        const who = pick(r, PEOPLE);
        return {
          ...base,
          kind: "fraction-of",
          prompt: `${story.total(amount)} ${story.ask(who, fr(fraction))}`,
          fraction,
          amount,
          unit: story.unit,
          traps,
          hint: "Divide by the bottom number to find one part, then multiply by the top number.",
          explanation: method,
        };
      }
      return {
        ...base,
        kind: "fraction-of",
        prompt: `What is ${fr(fraction)} of ${amount}?`,
        fraction,
        amount,
        showCounters: amount <= 30,
        traps,
        hint: fraction.n === 1
          ? `Share ${amount} into ${fraction.d} equal groups. How many in one group?`
          : `Share ${amount} into ${fraction.d} equal groups, then count ${fraction.n} of the groups.`,
        explanation: method,
      };
    },
  },

  /* ─────────── Reasoning ─────────── */
  {
    key: "rs-claim",
    skill: "fractions.reasoning",
    difficulties: [1, 2, 3],
    make: (r, base) => {
      const who = pick(r, PEOPLE);
      const kind = pick(r, base.difficulty === 1 ? ["den", "partpart"] : ["den", "additive", "partpart"]);
      if (kind === "den") {
        const n = base.difficulty === 3 ? int(r, 2, 3) : 1;
        const big = int(r, n + 3, 12);
        const small = int(r, n + 1, big - 1);
        const a = f(n, big);
        const b = f(n, small);
        return {
          ...base,
          kind: "choose",
          prompt: `${who} says: “${fr(a)} is bigger than ${fr(b)}, because ${big} is bigger than ${small}.” Is ${who} right?`,
          options: [
            { id: "yes", label: `Yes — ${big} is bigger, so ${fr(a)} is bigger`, misconception: M.BIGGER_DEN },
            { id: "no", label: `No — ${partName(big)} are smaller pieces than ${partName(small)}, so ${fr(a)} is smaller` },
            { id: "same", label: "No — they are the same size because the top numbers match" },
          ],
          answer: "no",
          hint: "Picture one whole shared into more pieces. What happens to the size of each piece?",
          explanation: `Sharing the same whole into ${big} pieces makes smaller pieces than sharing it into ${small}. So ${fr(a)} < ${fr(b)}.`,
        };
      }
      if (kind === "additive") {
        const a = properFraction(r, 2, 5);
        const add = int(r, 1, 3);
        const b = f(a.n + add, a.d + add);
        const k = 2;
        return {
          ...base,
          kind: "choose",
          prompt: `${who} says: “${fr(a)} = ${fr(b)}, because I added ${add} to the top and the bottom.” Is ${who} right?`,
          options: [
            { id: "yes", label: "Yes — doing the same to the top and bottom keeps it equal", misconception: M.ADDITIVE },
            { id: "no", label: `No — you must **multiply** the top and bottom by the same number, like ${fr(a)} = ${fr(f(a.n * k, a.d * k))}` },
            { id: "half", label: "No — you can only add 1, not more" },
          ],
          answer: "no",
          hint: "Equivalent fractions show the same amount. Does adding keep the amount the same?",
          explanation: `Adding changes the amount: ${fr(a)} and ${fr(b)} are different sizes. Multiplying the top and bottom by the same number keeps it equal.`,
        };
      }
      const total = int(r, base.difficulty === 1 ? 3 : 4, base.difficulty === 1 ? 6 : 9);
      const shaded = int(r, 1, total - 2);
      const right = f(shaded, total);
      const claim = f(shaded, total - shaded);
      const other = total - shaded !== shaded ? f(total - shaded, total) : f(total, shaded);
      return {
        ...base,
        kind: "choose",
        prompt: `${who} says ${fr(claim)} of this bar is shaded. Is ${who} right?`,
        diagram: { shape: "bar", parts: total, shaded: range(shaded) },
        options: [
          { id: "yes", label: `Yes — ${shaded} shaded and ${total - shaded} not shaded`, misconception: M.PART_PART },
          { id: "no", label: `No — there are ${total} parts altogether, so it is ${fr(right)}` },
          { id: "other", label: `No — it is ${fr(other)}` },
        ],
        answer: "no",
        hint: "The bottom number counts **all** the equal parts, shaded and unshaded together.",
        explanation: `The bar has ${total} equal parts and ${shaded} are shaded, so ${fr(right)} is shaded. ${who} compared shaded parts with unshaded parts.`,
      };
    },
  },
];

const BY_KEY = new Map(TEMPLATES.map((t) => [t.key, t]));

export const GENERATED_PREFIX = "g:fractions.";

export function isGeneratedId(id: string) {
  return id.startsWith(GENERATED_PREFIX);
}

/** Rebuilds a generated question from its id, or returns null if the id isn't valid. */
export function generateFromId(id: string): FractionQuestion | null {
  const m = /^g:fractions\.([a-z-]+):([123]):(\d+)$/.exec(id);
  if (!m) return null;
  const t = BY_KEY.get(m[1]);
  const difficulty = Number(m[2]) as Difficulty;
  if (!t || !t.difficulties.includes(difficulty)) return null;
  // Seeded from the id's pre-namespacing form (`g:<template>:<level>:<seed>`) so
  // questions saved before topics were namespaced rebuild exactly as the child saw them.
  return t.make(prng(hashString(`g:${m[1]}:${m[2]}:${m[3]}`)), { id, skill: t.skill, difficulty });
}

/** A content fingerprint, so two seeds that happen to build the same question count as one. */
export function contentKey(q: FractionQuestion): string {
  return JSON.stringify({ ...q, id: undefined, hint: undefined, explanation: undefined });
}

export const GENERATED_SKILLS = [...new Set(TEMPLATES.map((t) => t.skill))];

/**
 * A fresh, deterministic pool of generated questions for one practice session.
 * Questions whose content the learner has already seen are skipped.
 */
export function generatedPool(
  sessionSeed: string,
  seenIds: Iterable<string> = [],
  perTemplateLevel = 4,
): FractionQuestion[] {
  const seenKeys = new Set<string>();
  for (const id of seenIds) {
    if (!isGeneratedId(id)) continue;
    const q = generateFromId(id);
    if (q) seenKeys.add(contentKey(q));
  }
  const out: FractionQuestion[] = [];
  for (const t of TEMPLATES) {
    for (const d of t.difficulties) {
      let made = 0;
      for (let attempt = 0; attempt < perTemplateLevel * 4 && made < perTemplateLevel; attempt++) {
        const seed = hashString(`${sessionSeed}:${t.key}:${d}:${attempt}`) % 1_000_000_000;
        const q = generateFromId(`${GENERATED_PREFIX}${t.key}:${d}:${seed}`);
        if (!q) continue;
        const key = contentKey(q);
        if (seenKeys.has(key)) continue;
        seenKeys.add(key);
        out.push(q);
        made++;
      }
    }
  }
  return out;
}
