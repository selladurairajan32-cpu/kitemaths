/**
 * The mental-strategy catalogue (R3: MM-001, MM-003 to MM-008). Pure maths.
 *
 * Every strategy states when to use it, why it works (the mathematical justification), and when it is unsuitable, and
 * builds its worked steps for any numbers it fits. Each step is one binary operation whose value is recorded, so every
 * step of every example can be recomputed independently (src/maths/strategies.test.ts does this with BigInt). No claim
 * about speed is made anywhere: the catalogue is about valid, understandable methods (MM-001 AC2).
 */

export type StepOp = "+" | "−" | "×" | "÷";
export type ProblemOp = "+" | "−" | "×" | "÷" | "% of" | "²" | "fraction of";
export type Family = "bonds" | "doubling" | "multiply" | "squares" | "fdp";

/** One step: `left op right = value`, shown as `text`. */
export interface Step {
  text: string;
  left: number;
  op: StepOp;
  right: number;
  value: number;
}

export interface Problem {
  op: ProblemOp;
  /** For "fraction of": [numerator, denominator, amount]. For "% of": [percent, amount]. For "²": [n]. */
  nums: number[];
}

export interface Strategy {
  id: string;
  name: string;
  family: Family;
  /** One line a child can read: when the strategy is a good choice. */
  when: string;
  /** Why it gives the right answer: the mathematical justification (MM-001 AC1). */
  why: string;
  /** When not to use it (MM-002: situations where the strategy is unsuitable). */
  unsuitable: string;
  /** Curriculum objectives a child needs first (ids in docs/product/curriculum/curriculum-map.csv), and the years it suits. */
  prerequisites: string[];
  years: [number, number];
  /** Evaluated in MM-008 as a Vedic Maths candidate and accepted into the learner curriculum. */
  vedic?: boolean;
  /** An optional 11+ extension, not part of the national curriculum (D-033). */
  extension?: boolean;
  op: ProblemOp;
  fits(nums: number[]): boolean;
  steps(nums: number[]): Step[];
  /** Hand-picked examples, each checked independently in the tests. */
  examples: number[][];
}

const step = (left: number, op: StepOp, right: number, text?: string): Step => {
  const value = op === "+" ? left + right : op === "−" ? left - right : op === "×" ? left * right : left / right;
  return { left, op, right, value, text: text ?? `${fmt(left)} ${op} ${fmt(right)} = ${fmt(value)}` };
};
/** UK number format (UX-003 §6): 1,234. */
export const fmt = (n: number) => n.toLocaleString("en-GB");
const isInt = (n: number) => Number.isSafeInteger(n);
const lastOf = (s: Step[]) => s[s.length - 1].value;

/** The exact answer to a problem, independent of any strategy. */
export function solve(p: Problem): number {
  const [x, y, z] = p.nums;
  switch (p.op) {
    case "+":
      return x + y;
    case "−":
      return x - y;
    case "×":
      return x * y;
    case "÷":
      return x / y;
    case "% of":
      return (x * y) / 100;
    case "²":
      return x * x;
    case "fraction of":
      return (x * z) / y;
  }
}

export function problemText(p: Problem): string {
  const [x, y, z] = p.nums.map(fmt);
  switch (p.op) {
    case "% of":
      return `${x}% of ${y}`;
    case "²":
      return `${x}²`;
    case "fraction of":
      return `${x}/${y} of ${z}`;
    default:
      return `${x} ${p.op} ${y}`;
  }
}

export const STRATEGIES: Strategy[] = [
  // ── Number bonds, partitioning and place value (MM-003) ──
  {
    id: "bridge-10",
    name: "Bridge through 10",
    family: "bonds",
    when: "Adding a one-digit number that takes you past the next ten.",
    why: "Splitting the number you add doesn't change the total: a + b = a + p + q when b = p + q. Choosing p to reach the ten uses a number bond you know.",
    unsuitable: "When the ones don't cross a ten (32 + 5): just add the ones.",
    prerequisites: ["Y3.AS.1"],
    years: [2, 4],
    op: "+",
    fits: ([a, b]) => isInt(a) && b >= 2 && b <= 9 && (a % 10) + b > 10,
    steps: ([a, b]) => {
      const p = 10 - (a % 10);
      const s1 = step(a, "+", p, `${fmt(a)} + ${p} = ${fmt(a + p)} (to the next ten)`);
      return [s1, step(s1.value, "+", b - p, `${fmt(s1.value)} + ${b - p} = ${fmt(s1.value + b - p)} (the rest of ${b})`)];
    },
    examples: [[47, 8], [38, 5], [126, 7]],
  },
  {
    id: "partition-add",
    name: "Partition and recombine",
    family: "bonds",
    when: "Adding two two-digit numbers in your head.",
    why: "Place value: 36 = 30 + 6 and 47 = 40 + 7, and addition can be done in any order and grouping, so add tens, add ones, then recombine.",
    unsuitable: "When one number is close to a ten (46 + 39): compensating is simpler.",
    prerequisites: ["Y3.NPV.2", "Y3.AS.1"],
    years: [3, 5],
    op: "+",
    fits: ([a, b]) => a >= 11 && a <= 99 && b >= 11 && b <= 99 && b % 10 !== 9 && b % 10 !== 0,
    steps: ([a, b]) => {
      const t = step(a - (a % 10), "+", b - (b % 10), `${fmt(a - (a % 10))} + ${fmt(b - (b % 10))} = ${fmt(a - (a % 10) + b - (b % 10))} (tens)`);
      const o = step(a % 10, "+", b % 10, `${a % 10} + ${b % 10} = ${(a % 10) + (b % 10)} (ones)`);
      return [t, o, step(t.value, "+", o.value, `${fmt(t.value)} + ${fmt(o.value)} = ${fmt(t.value + o.value)} (recombine)`)];
    },
    examples: [[36, 47], [58, 24], [73, 18]],
  },
  {
    id: "compensate-add",
    name: "Round and adjust (adding)",
    family: "bonds",
    when: "Adding a number that is 1 or 2 less than a multiple of ten, like 39 or 198.",
    why: "a + b = a + (b + k) − k: adding the rounded number and taking back the extra gives the same total.",
    unsuitable: "When the number is not near a ten (46 + 34): there is nothing easy to round to.",
    prerequisites: ["Y3.AS.1", "Y4.NPV.7"],
    years: [3, 6],
    op: "+",
    fits: ([a, b]) => isInt(a) && b >= 8 && [8, 9].includes(b % 10),
    steps: ([a, b]) => {
      const k = 10 - (b % 10);
      const r = step(a, "+", b + k, `${fmt(a)} + ${fmt(b + k)} = ${fmt(a + b + k)} (round ${fmt(b)} up to ${fmt(b + k)})`);
      return [r, step(r.value, "−", k, `${fmt(r.value)} − ${k} = ${fmt(r.value - k)} (take back the extra ${k})`)];
    },
    examples: [[46, 39], [125, 98], [347, 199]],
  },
  {
    id: "compensate-sub",
    name: "Round and adjust (subtracting)",
    family: "bonds",
    when: "Subtracting a number that is 1 or 2 less than a multiple of ten, like 29 or 98.",
    why: "a − b = a − (b + k) + k: taking away k too many, then giving k back, leaves the same difference.",
    unsuitable: "When the number is not near a ten: counting up or partitioning is clearer.",
    prerequisites: ["Y3.AS.1", "Y4.NPV.7"],
    years: [3, 6],
    op: "−",
    fits: ([a, b]) => b >= 8 && a > b + 10 && [8, 9].includes(b % 10),
    steps: ([a, b]) => {
      const k = 10 - (b % 10);
      const r = step(a, "−", b + k, `${fmt(a)} − ${fmt(b + k)} = ${fmt(a - b - k)} (take away ${fmt(b + k)} instead)`);
      return [r, step(r.value, "+", k, `${fmt(r.value)} + ${k} = ${fmt(r.value + k)} (you took ${k} too many, so give it back)`)];
    },
    examples: [[73, 29], [254, 98], [600, 199]],
  },
  {
    id: "count-up",
    name: "Count up through the hundred",
    family: "bonds",
    when: "Subtracting numbers that sit either side of a hundred or thousand, like 403 − 287.",
    why: "The difference between two numbers is how far it is from one to the other, so a − b is the jump from b up to a. Jumping to the next hundred first uses bonds to 100.",
    unsuitable: "When the numbers are far apart in a way that needs many jumps, or when no exchange is needed (586 − 241).",
    prerequisites: ["Y3.AS.2", "Y4.AS.1"],
    years: [3, 6],
    op: "−",
    fits: ([a, b]) => b >= 100 && a > b && Math.floor(a / 100) > Math.floor(b / 100) && b % 100 !== 0,
    steps: ([a, b]) => {
      const h = (Math.floor(b / 100) + 1) * 100;
      const up = step(h, "−", b, `${fmt(b)} + ${fmt(h - b)} = ${fmt(h)} (up to the hundred)`);
      const rest = step(a, "−", h, `${fmt(h)} + ${fmt(a - h)} = ${fmt(a)} (on to ${fmt(a)})`);
      return [up, rest, step(up.value, "+", rest.value, `${fmt(up.value)} + ${fmt(rest.value)} = ${fmt(up.value + rest.value)} (add the jumps)`)];
    },
    examples: [[403, 287], [1005, 968], [612, 395]],
  },
  // ── Doubling, halving and near-doubles (MM-004) ──
  {
    id: "near-double",
    name: "Near doubles",
    family: "doubling",
    when: "Adding two numbers that are next to each other, like 35 + 36.",
    why: "If b = a + 1, then a + b = a + a + 1 = double a, plus 1.",
    unsuitable: "When the numbers are not close together.",
    prerequisites: ["Y3.AS.1"],
    years: [2, 4],
    op: "+",
    fits: ([a, b]) => isInt(a) && b === a + 1 && a >= 5,
    steps: ([a, b]) => {
      const d = step(a, "×", 2, `double ${fmt(a)} = ${fmt(2 * a)}`);
      return [d, step(d.value, "+", b - a, `${fmt(d.value)} + 1 = ${fmt(d.value + 1)}`)];
    },
    examples: [[35, 36], [7, 8], [150, 151]],
  },
  {
    id: "double-halve",
    name: "Double one, halve the other",
    family: "doubling",
    when: "Multiplying when one number is even and doubling the other makes it round, like 16 × 25.",
    why: "(a ÷ 2) × (b × 2) = a × b, because halving and doubling cancel out: the product stays the same.",
    unsuitable: "When both numbers are odd: halving gives a fraction.",
    prerequisites: ["Y4.MD.1", "Y4.MD.3"],
    years: [4, 6],
    op: "×",
    fits: ([a, b]) => a % 2 === 0 && a >= 4 && (b * 2) % 10 === 0 && b % 10 !== 0,
    steps: ([a, b]) => {
      const out: Step[] = [];
      let x = a;
      let y = b;
      while (x % 2 === 0 && y % 10 !== 0 && out.length < 8) {
        out.push(step(x, "÷", 2, `halve ${fmt(x)} = ${fmt(x / 2)}, double ${fmt(y)} = ${fmt(y * 2)}`));
        x /= 2;
        y *= 2;
      }
      out.push(step(x, "×", y));
      return out;
    },
    examples: [[16, 25], [14, 5], [18, 15]],
  },
  {
    id: "halve-twice",
    name: "Halve and halve again",
    family: "doubling",
    when: "Dividing by 4, or finding a quarter.",
    why: "4 = 2 × 2, so dividing by 4 is dividing by 2 twice: a ÷ 4 = (a ÷ 2) ÷ 2.",
    unsuitable: "When the number isn't a multiple of 4 and you need a whole-number answer.",
    prerequisites: ["Y3.MD.1", "Y3.FRAC.2"],
    years: [3, 5],
    op: "÷",
    fits: ([a, b]) => b === 4 && a % 4 === 0 && a >= 8,
    steps: ([a]) => {
      const h = step(a, "÷", 2, `half of ${fmt(a)} = ${fmt(a / 2)}`);
      return [h, step(h.value, "÷", 2, `half of ${fmt(h.value)} = ${fmt(h.value / 2)}`)];
    },
    examples: [[64, 4], [180, 4], [348, 4]],
  },
  // ── Multiplication and division (MM-005) ──
  ...[
    { id: "times-5", k: 5, name: "×5: times 10, then halve", why: "5 = 10 ÷ 2, so a × 5 = (a × 10) ÷ 2.", big: 10, sub: false, div: 2 },
    { id: "times-50", k: 50, name: "×50: times 100, then halve", why: "50 = 100 ÷ 2, so a × 50 = (a × 100) ÷ 2.", big: 100, sub: false, div: 2 },
    { id: "times-25", k: 25, name: "×25: times 100, then quarter", why: "25 = 100 ÷ 4, so a × 25 = (a × 100) ÷ 4.", big: 100, sub: false, div: 4 },
  ].map(
    (m): Strategy => ({
      id: m.id,
      name: m.name,
      family: "multiply",
      when: `Multiplying by ${m.k}.`,
      why: m.why,
      unsuitable: m.div === 4 ? "When the other number isn't a multiple of 4, the quarter isn't a whole number; another method is clearer." : "When the other number is odd and you'd rather avoid halves: the answer still works, but ends in 5.",
      prerequisites: ["Y4.MD.2", "Y5.MD.5", "Y5.MD.7"],
      years: [4, 6],
      op: "×",
      fits: ([a, b]) => b === m.k && a >= 2 && (m.div !== 4 || a % 4 === 0),
      steps: ([a]) => {
        const s1 = step(a, "×", m.big);
        return [s1, step(s1.value, "÷", m.div, `${fmt(s1.value)} ÷ ${m.div} = ${fmt(s1.value / m.div)} (${m.div === 2 ? "halve" : "halve twice"})`)];
      },
      examples: m.div === 4 ? [[16, 25], [36, 25], [124, 25]] : [[46, m.k], [37, m.k], [128, m.k]],
    }),
  ),
  ...[
    { id: "times-9", k: 9, big: 10, add: false },
    { id: "times-99", k: 99, big: 100, add: false },
    { id: "times-11", k: 11, big: 10, add: true },
  ].map(
    (m): Strategy => ({
      id: m.id,
      name: `×${m.k}: times ${m.big}, then ${m.add ? "add" : "take away"} one lot`,
      family: "multiply",
      when: `Multiplying by ${m.k}.`,
      why: `${m.k} = ${m.big} ${m.add ? "+" : "−"} 1, so a × ${m.k} = a × ${m.big} ${m.add ? "+" : "−"} a (the distributive law).`,
      unsuitable: `When the other number is small enough to know the fact by heart (${m.k} × 3).`,
      prerequisites: ["Y4.MD.2", "Y4.MD.5"],
      years: [4, 6],
      op: "×",
      fits: ([a, b]) => b === m.k && a >= 12,
      steps: ([a]) => {
        const s1 = step(a, "×", m.big);
        return [s1, step(s1.value, m.add ? "+" : "−", a, `${fmt(s1.value)} ${m.add ? "+" : "−"} ${fmt(a)} = ${fmt(m.add ? s1.value + a : s1.value - a)} (${m.add ? "add" : "take away"} one ${fmt(a)})`)];
      },
      examples: [[37, m.k], [125, m.k], [64, m.k]],
    }),
  ),
  {
    id: "partition-mult",
    name: "Partition and multiply",
    family: "multiply",
    when: "Multiplying a two-digit number by a one-digit number.",
    why: "The distributive law: 23 × 7 = (20 + 3) × 7 = 20 × 7 + 3 × 7.",
    unsuitable: "When the one-digit number is 5 or 9: their special methods are simpler.",
    prerequisites: ["Y4.MD.5"],
    years: [4, 6],
    op: "×",
    fits: ([a, b]) => a >= 11 && a <= 99 && a % 10 !== 0 && b >= 2 && b <= 9 && b !== 5 && b !== 9,
    steps: ([a, b]) => {
      const t = step(a - (a % 10), "×", b);
      const o = step(a % 10, "×", b);
      return [t, o, step(t.value, "+", o.value)];
    },
    examples: [[23, 7], [48, 6], [76, 3]],
  },
  {
    id: "factorise",
    name: "Split into factors",
    family: "multiply",
    when: "Multiplying by a number with easy factors, like 12 = 3 × 4 or 15 = 3 × 5.",
    why: "Associativity: a × (p × q) = (a × p) × q, so multiply by one factor, then the other.",
    unsuitable: "When the number is prime (13, 17): it has no smaller factors to use.",
    prerequisites: ["Y4.MD.3", "Y5.MD.1"],
    years: [5, 6],
    op: "×",
    fits: ([a, b]) => a >= 11 && [12, 15, 16, 18].includes(b),
    steps: ([a, b]) => {
      const [p, q] = b === 12 ? [3, 4] : b === 15 ? [3, 5] : b === 16 ? [4, 4] : [2, 9];
      const s1 = step(a, "×", p);
      return [s1, step(s1.value, "×", q, `${fmt(s1.value)} × ${q} = ${fmt(s1.value * q)} (${b} = ${p} × ${q})`)];
    },
    examples: [[14, 12], [21, 15], [25, 16]],
  },
  {
    id: "divide-by-factors",
    name: "Divide by factors",
    family: "multiply",
    when: "Dividing by a number with easy factors, like 12 = 2 × 6 or 15 = 3 × 5.",
    why: "a ÷ (p × q) = (a ÷ p) ÷ q: sharing into p × q groups is sharing into p, then each into q.",
    unsuitable: "When the divisor is prime: there are no factors to split it into.",
    prerequisites: ["Y4.MD.1", "Y5.MD.1"],
    years: [5, 6],
    op: "÷",
    fits: ([a, b]) => [12, 15, 16, 18, 24].includes(b) && a % b === 0 && a / b >= 2,
    steps: ([a, b]) => {
      const [p, q] = b === 12 ? [2, 6] : b === 15 ? [3, 5] : b === 16 ? [2, 8] : b === 18 ? [2, 9] : [4, 6];
      const s1 = step(a, "÷", p);
      return [s1, step(s1.value, "÷", q, `${fmt(s1.value)} ÷ ${q} = ${fmt(s1.value / q)} (${b} = ${p} × ${q})`)];
    },
    examples: [[168, 12], [240, 15], [432, 24]],
  },
  {
    id: "crosswise",
    name: "Vertically and crosswise",
    family: "multiply",
    vedic: true,
    extension: true,
    when: "Multiplying two two-digit numbers, as an optional 11+ extension.",
    why: "(10a + b) × (10c + d) = 100ac + 10(ad + bc) + bd: multiply the tens, the ones, and the two crosses, then put the hundreds, tens and ones together. It is the grid method written in one line.",
    unsuitable: "When one number is a multiple of 10 or has one digit: a simpler method is clearer. It is not in the national curriculum, so the grid or long multiplication is always fine.",
    prerequisites: ["Y4.MD.5", "Y5.MD.4"],
    years: [6, 6],
    op: "×",
    fits: ([a, b]) => a >= 11 && a <= 99 && b >= 11 && b <= 99 && a % 10 !== 0 && b % 10 !== 0,
    steps: ([x, y]) => {
      const [a, b, c, d] = [Math.floor(x / 10), x % 10, Math.floor(y / 10), y % 10];
      const ones = step(b, "×", d, `${b} × ${d} = ${b * d} (ones × ones, vertically)`);
      const c1 = step(a, "×", d, `${a} × ${d} = ${a * d} (crosswise)`);
      const c2 = step(b, "×", c, `${b} × ${c} = ${b * c} (crosswise)`);
      const cross = step(c1.value, "+", c2.value, `${a * d} + ${b * c} = ${a * d + b * c} (the crosses, worth tens)`);
      const tens = step(a, "×", c, `${a} × ${c} = ${a * c} (tens × tens, vertically, worth hundreds)`);
      const h = step(tens.value, "×", 100);
      const t = step(cross.value, "×", 10);
      const ht = step(h.value, "+", t.value);
      return [ones, c1, c2, cross, tens, h, t, ht, step(ht.value, "+", ones.value)];
    },
    examples: [[23, 41], [37, 64], [98, 76]],
  },
  {
    id: "near-hundred",
    name: "Multiply near 100",
    family: "multiply",
    vedic: true,
    when: "Multiplying two numbers just below 100, like 97 × 96.",
    why: "a × b = (a − (100 − b)) × 100 + (100 − a)(100 − b). Expanding (100 − x)(100 − y) gives 100 × (100 − x − y) + xy, which is the same thing.",
    unsuitable: "When the numbers are far from 100: the shortfalls get big and the method stops being simpler.",
    prerequisites: ["Y4.MD.1", "Y5.MD.5", "Y5.MD.7"],
    years: [6, 6],
    op: "×",
    fits: ([a, b]) => a >= 90 && a <= 99 && b >= 90 && b <= 99,
    steps: ([a, b]) => {
      const x = 100 - a;
      const y = 100 - b;
      const lead = step(a, "−", y, `${fmt(a)} − ${y} = ${fmt(a - y)} (${fmt(b)} is ${y} short of 100)`);
      const tail = step(x, "×", y, `${x} × ${y} = ${x * y} (the two shortfalls multiplied)`);
      const hundreds = step(lead.value, "×", 100);
      return [lead, tail, hundreds, step(hundreds.value, "+", tail.value)];
    },
    examples: [[97, 96], [98, 93], [91, 99]],
  },
  // ── Squares and number patterns (MM-006) ──
  {
    id: "square-ending-5",
    name: "Square a number ending in 5",
    family: "squares",
    vedic: true,
    when: "Squaring a two-digit number that ends in 5, like 35².",
    why: "(10n + 5)² = 100n² + 100n + 25 = 100 × n(n + 1) + 25. So multiply the tens digit by the next number up, then write 25.",
    unsuitable: "Any number not ending in 5: the pattern only works for 5s.",
    prerequisites: ["Y5.MD.8"],
    years: [5, 6],
    op: "²",
    fits: ([a]) => a % 10 === 5 && a >= 15 && a <= 95,
    steps: ([a]) => {
      const n = Math.floor(a / 10);
      const s1 = step(n, "×", n + 1, `${n} × ${n + 1} = ${n * (n + 1)} (tens digit times the next number)`);
      const s2 = step(s1.value, "×", 100);
      return [s1, s2, step(s2.value, "+", 25, `${fmt(s2.value)} + 25 = ${fmt(s2.value + 25)}`)];
    },
    examples: [[35], [85], [15]],
  },
  {
    id: "next-square",
    name: "From one square to the next",
    family: "squares",
    when: "Squaring a number one more than a square you know, like 21² from 20².",
    why: "(n + 1)² = n² + 2n + 1 = n² + n + (n + 1): the next square adds the two numbers.",
    unsuitable: "When you don't know the square just below.",
    prerequisites: ["Y5.MD.8"],
    years: [5, 6],
    op: "²",
    fits: ([a]) => a >= 11 && (a - 1) % 10 === 0 && a <= 101,
    steps: ([a]) => {
      const n = a - 1;
      const sq = step(n, "×", n, `${fmt(n)}² = ${fmt(n * n)}`);
      const plusN = step(sq.value, "+", n);
      return [sq, plusN, step(plusN.value, "+", a)];
    },
    examples: [[21], [31], [51]],
  },
  // ── Fraction, decimal and percentage shortcuts (MM-007) ──
  {
    id: "ten-percent",
    name: "10% is a tenth",
    family: "fdp",
    when: "Finding 10%, 20%, 30% … of an amount.",
    why: "Per cent means out of 100, so 10% = 10/100 = 1/10: divide by 10. Then multiply for 20%, 30% and so on.",
    unsuitable: "For percentages that aren't multiples of 10 (like 15%) you need a second step, such as 10% + 5%.",
    prerequisites: ["Y5.FRAC.11"],
    years: [5, 6],
    op: "% of",
    fits: ([p, a]) => p % 10 === 0 && p >= 10 && p <= 90 && a % 10 === 0,
    steps: ([p, a]) => {
      const t = step(a, "÷", 10, `10% of ${fmt(a)} = ${fmt(a)} ÷ 10 = ${fmt(a / 10)}`);
      return p === 10 ? [t] : [t, step(t.value, "×", p / 10, `${p}% = ${p / 10} × 10%: ${fmt(t.value)} × ${p / 10} = ${fmt((t.value * p) / 10)}`)];
    },
    examples: [[10, 350], [30, 120], [70, 50]],
  },
  {
    id: "five-percent",
    name: "5% is half of 10%",
    family: "fdp",
    when: "Finding 5% (or 15%) of an amount.",
    why: "5% = 10% ÷ 2, because 5/100 is half of 10/100.",
    unsuitable: "When 10% of the amount is odd: half of it is a decimal, which is fine but harder in your head.",
    prerequisites: ["Y5.FRAC.11"],
    years: [5, 6],
    op: "% of",
    fits: ([p, a]) => p === 5 && a % 20 === 0,
    steps: ([, a]) => {
      const t = step(a, "÷", 10, `10% of ${fmt(a)} = ${fmt(a / 10)}`);
      return [t, step(t.value, "÷", 2, `5% = half of that = ${fmt(t.value / 2)}`)];
    },
    examples: [[5, 80], [5, 360], [5, 1200]],
  },
  {
    id: "quarter-percent",
    name: "25% is a quarter",
    family: "fdp",
    when: "Finding 25% or 50% of an amount.",
    why: "25% = 25/100 = 1/4 and 50% = 1/2, so halve (and halve again for 25%).",
    unsuitable: "For 75%, add one more step: 75% = 50% + 25%.",
    prerequisites: ["Y5.FRAC.11", "Y5.FRAC.12"],
    years: [5, 6],
    op: "% of",
    fits: ([p, a]) => (p === 25 && a % 4 === 0) || (p === 50 && a % 2 === 0),
    steps: ([p, a]) => {
      const h = step(a, "÷", 2, `50% of ${fmt(a)} = half = ${fmt(a / 2)}`);
      return p === 50 ? [h] : [h, step(h.value, "÷", 2, `25% = half again = ${fmt(h.value / 2)}`)];
    },
    examples: [[25, 64], [50, 90], [25, 360]],
  },
  {
    id: "fraction-of",
    name: "Divide by the bottom, times by the top",
    family: "fdp",
    when: "Finding a fraction of an amount, like 3/5 of 40.",
    why: "1/5 of 40 is one of 5 equal parts: 40 ÷ 5 = 8. Three of those parts is 3 × 8 = 24.",
    unsuitable: "When the amount doesn't divide exactly by the denominator: the answer is not a whole number.",
    prerequisites: ["Y3.FRAC.2", "Y4.FRAC.3"],
    years: [3, 6],
    op: "fraction of",
    fits: ([n, d, a]) => n >= 1 && n < d && a % d === 0,
    steps: ([n, d, a]) => {
      const one = step(a, "÷", d, `1/${d} of ${fmt(a)} = ${fmt(a)} ÷ ${d} = ${fmt(a / d)}`);
      return n === 1 ? [one] : [one, step(one.value, "×", n, `${n}/${d} = ${n} × ${fmt(one.value)} = ${fmt(n * one.value)}`)];
    },
    examples: [[3, 5, 40], [2, 3, 27], [7, 10, 150]],
  },
];

export const strategyById = (id: string) => STRATEGIES.find((s) => s.id === id);

/** The strategies that fit a problem, so a child's choice can be judged as valid or not (MM-009, MM-010). */
export function fittingStrategies(p: Problem): Strategy[] {
  return STRATEGIES.filter((s) => s.op === p.op && s.fits(p.nums));
}

/** A strategy's steps give the right answer for this problem: its last step equals the exact answer. */
export function strategyWorks(s: Strategy, p: Problem): boolean {
  if (s.op !== p.op || !s.fits(p.nums)) return false;
  return lastOf(s.steps(p.nums)) === solve(p);
}

/**
 * MM-009: the standard method a problem is compared against: partition the second number (add or take the tens, then
 * the ones; multiply by its tens and ones and add), or multiply then divide by 100 for a percentage. Every step is one
 * checked operation, like a catalogue strategy. Null where no standard method is shown (fractions of amounts).
 */
export function standardSteps(p: Problem): Step[] | null {
  const [a, b] = p.nums;
  switch (p.op) {
    case "+":
    case "−": {
      const tens = b - (b % 10);
      if (tens === 0 || b % 10 === 0) return [step(a, p.op, b)];
      const s1 = step(a, p.op, tens, `${fmt(a)} ${p.op} ${fmt(tens)} = ${fmt(p.op === "+" ? a + tens : a - tens)} (the tens)`);
      return [s1, step(s1.value, p.op, b % 10, `${fmt(s1.value)} ${p.op} ${b % 10} = ${fmt(p.op === "+" ? s1.value + (b % 10) : s1.value - (b % 10))} (the ones)`)];
    }
    case "×": {
      const [x, y] = b >= 10 ? [a, b] : [b, a];
      const tens = y - (y % 10);
      if (tens === 0 || y % 10 === 0) return [step(a, "×", b)];
      const t = step(x, "×", tens);
      const o = step(x, "×", y % 10);
      return [t, o, step(t.value, "+", o.value)];
    }
    case "÷":
      return [step(a, "÷", b)];
    case "²": {
      const tens = a - (a % 10);
      if (tens === 0 || a % 10 === 0) return [step(a, "×", a)];
      const t = step(tens, "×", a);
      const o = step(a % 10, "×", a);
      return [t, o, step(t.value, "+", o.value)];
    }
    case "% of": {
      const m = step(b, "×", a, `${fmt(b)} × ${a} = ${fmt(a * b)} (times the per cent)`);
      return [m, step(m.value, "÷", 100, `${fmt(m.value)} ÷ 100 = ${fmt(m.value / 100)} (per cent means out of 100)`)];
    }
    case "fraction of":
      return null;
  }
}

/**
 * MM-009: a copy of a method with one step done the wrong way round (adding instead of taking away, or the reverse),
 * for the child to spot. Returns the broken steps and the index of the broken step, or null if no step can be broken.
 */
export function flawedSteps(steps: Step[]): { steps: Step[]; broken: number } | null {
  const i = [...steps.keys()].reverse().find((k) => steps[k].op === "+" || steps[k].op === "−");
  if (i === undefined) return null;
  const s = steps[i];
  const op: StepOp = s.op === "+" ? "−" : "+";
  const wrong = op === "+" ? s.left + s.right : s.left - s.right;
  const out = steps.slice(0, i).concat({ left: s.left, op, right: s.right, value: wrong, text: `${fmt(s.left)} ${op} ${fmt(s.right)} = ${fmt(wrong)}` });
  // Later steps carry the wrong value forward, so the method still looks finished.
  for (const later of steps.slice(i + 1)) {
    const left = later.left === s.value ? wrong : later.left;
    const right = later.right === s.value ? wrong : later.right;
    const v = later.op === "+" ? left + right : later.op === "−" ? left - right : later.op === "×" ? left * right : left / right;
    out.push({ left, op: later.op, right, value: v, text: `${fmt(left)} ${later.op} ${fmt(right)} = ${fmt(v)}` });
  }
  return { steps: out, broken: i };
}
