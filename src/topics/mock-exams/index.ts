import { hashString, prng } from "@/engine/random";
import type { SkillId } from "@/engine/types";
import { addSubtract } from "@/topics/add-subtract";
import { areaPerimeter } from "@/topics/area-perimeter";
import { chartsData } from "@/topics/charts-data";
import { coordinates } from "@/topics/coordinates";
import { decimals } from "@/topics/decimals";
import { fractions2 } from "@/topics/fractions-2";
import { defineTopic, genFor, int, pick, templatesOf, withHints } from "@/topics/kit/define";
import { measures } from "@/topics/measures";
import { mentalMaths } from "@/topics/mental-maths";
import type { KitQuestion, Template } from "@/topics/kit/types";
import { money } from "@/topics/money";
import { multiplyDivide } from "@/topics/multiply-divide";
import { negative } from "@/topics/negative";
import { percentages } from "@/topics/percentages";
import { placeValue } from "@/topics/place-value";
import { problemSolving } from "@/topics/problem-solving";
import { ratioAlgebra } from "@/topics/ratio-algebra";
import { rounding } from "@/topics/rounding";
import { shapesAngles } from "@/topics/shapes-angles";
import { time } from "@/topics/time";
import { timesTables } from "@/topics/times-tables";

/**
 * Mock exams: 11+ style mixed practice. Each area borrows the harder question makers from the islands it
 * covers, so a mock question is a real island question asked in exam conditions. The lessons teach exam
 * technique; the big challenge is a 12-question mini mock.
 */

const T = "mock-exams";
const gen = genFor(T);
const S = { number: `${T}.number`, calc: `${T}.calculation`, fdp: `${T}.fdp`, measure: `${T}.measures`, shape: `${T}.shape-data`, reasoning: `${T}.reasoning`, problems: `${T}.problem-types` };
export const MOCK_SKILLS = S;
/** UK number format: 8,000. */
const fmtN = (n: number) => n.toLocaleString("en-GB");

type Body = ReturnType<Template["make"]>;
/** Misconceptions belong to the island that found them, so a borrowed question keeps the feedback but not the tag. */
function untag(body: Body): Body {
  const q = body as KitQuestion;
  if (q.kind === "choose") return { ...q, options: q.options.map((o) => ({ text: o.text, feedback: o.feedback })) } as Body;
  // DEF-028: a borrowed question can repeat a trap value; keep the first, so every trap's feedback is reachable.
  return { ...q, traps: q.traps?.filter((t, i, all) => all.findIndex((x) => x.value === t.value) === i).map((t) => ({ value: t.value, feedback: t.feedback })) } as Body;
}

/** A mock question maker that borrows a level 2 or 3 question from one of these islands. */
function borrow(key: string, skill: SkillId, islands: { id: string }[]): Template {
  return {
    key,
    skill,
    difficulties: [2, 3],
    make: (r, base) => {
      const island = pick(r, islands);
      const makers = templatesOf(island.id).filter((t) => t.difficulties.some((d) => d >= 2));
      const t = pick(r, makers);
      const d = t.difficulties.includes(base.difficulty) ? base.difficulty : t.difficulties[t.difficulties.length - 1];
      return { ...untag(t.make(r, { ...base, difficulty: d })), origin: t.skill };
    },
  };
}

/** EXAM-004: estimation, pattern recognition, interpretation, multi-step problems, working backwards and method choice. */
const problemTemplates: Template[] = [
  {
    key: "mx-estimate",
    skill: S.problems,
    difficulties: [2, 3],
    make: (r, { difficulty }) => {
      const a = int(r, 3, difficulty === 2 ? 9 : 19) * 100 - int(r, 1, 30);
      const b = int(r, 2, difficulty === 2 ? 5 : 9) * 10 + pick(r, [-1, 1, 2]);
      const ra = Math.round(a / 100) * 100;
      const rb = Math.round(b / 10) * 10;
      const best = ra * rb;
      const options = [
        { text: fmtN(best) },
        { text: fmtN((ra - 100) * rb), feedback: `That rounds ${fmtN(a)} down too far: it's nearer ${fmtN(ra)}.` },
        { text: fmtN(ra * (rb + 10)), feedback: `That rounds ${b} up too far: it's nearer ${rb}.` },
        { text: fmtN(ra + rb), feedback: "That adds the rounded numbers. The question multiplies." },
      ].filter((o, i, all) => all.findIndex((x) => x.text === o.text) === i);
      return {
        kind: "choose",
        prompt: `Which is the best estimate of **${fmtN(a)} × ${b}**?`,
        options,
        answer: 0,
        hint: "Round each number to one non-zero digit, then multiply.",
        explanation: `${fmtN(a)} is about ${fmtN(ra)} and ${b} is about ${rb}, so the answer is about ${fmtN(ra)} × ${rb} = **${fmtN(best)}**. The exact answer, ${fmtN(a * b)}, is close to that.`,
      };
    },
  },
  {
    key: "mx-pattern",
    skill: S.problems,
    difficulties: [2, 3],
    make: (r, { difficulty }) => {
      const start = int(r, 2, 30);
      const step = int(r, 3, 12) * (difficulty === 3 && r() < 0.3 ? -1 : 1);
      const ask = difficulty === 2 ? 5 : 10;
      // A falling sequence starts high enough that the term asked for is still positive.
      const terms = [0, 1, 2, 3].map((i) => start + i * step + (step < 0 ? (ask - 1) * -step : 0));
      const answer = terms[0] + (ask - 1) * step;
      return {
        kind: "number",
        prompt: `**${terms.join(", ")}, …** What is the ${ask === 5 ? "5th" : "10th"} number in this sequence?`,
        answer,
        traps: [{ value: terms[3] + step * (ask - 3), feedback: "Count the terms carefully: the first number is the 1st term." }, { value: terms[0] + ask * step, feedback: `The ${ask}th number is ${ask - 1} steps after the first, not ${ask}.` }].filter((t, i, all) => t.value !== answer && all.findIndex((x) => x.value === t.value) === i),
        hint: "How much does it change each time? Then count the steps from the first number.",
        explanation: `The numbers go ${step > 0 ? "up" : "down"} by ${Math.abs(step)} each time. The ${ask === 5 ? "5th" : "10th"} number is ${ask - 1} steps after the first: ${terms[0]} ${step > 0 ? "+" : "−"} ${ask - 1} × ${Math.abs(step)} = **${answer}**.`,
      };
    },
  },
  {
    key: "mx-interpret",
    skill: S.problems,
    difficulties: [2, 3],
    make: (r, { difficulty }) => {
      const items = [["Pencils", int(r, 2, 9) * 5], ["Rulers", int(r, 3, 12) * 10], ["Notebooks", int(r, 5, 19) * 10]] as const;
      const qty = items.map(() => int(r, 2, difficulty === 2 ? 5 : 9));
      const [i, j] = pick(r, [[0, 1], [0, 2], [1, 2]] as const);
      const cost = (k: number) => items[k][1] * qty[k];
      const answer = cost(i) + cost(j);
      return {
        kind: "number",
        prompt: `The table shows prices and how many of each were bought. How much was spent on **${items[i][0].toLowerCase()} and ${items[j][0].toLowerCase()} together**, in pence?`,
        visual: { kind: "table", head: ["Item", "Price (p)", "Number bought"], rows: items.map((it, k) => [it[0], String(it[1]), String(qty[k])]) },
        answer,
        traps: [{ value: items[i][1] + items[j][1], feedback: "That adds one of each. Multiply each price by how many were bought." }, { value: cost(i), feedback: `That's only the ${items[i][0].toLowerCase()}.` }].filter((t, k, all) => t.value !== answer && all.findIndex((x) => x.value === t.value) === k),
        hint: "For each item: price × number bought. Then add the two totals.",
        explanation: `${items[i][0]}: ${items[i][1]} × ${qty[i]} = ${cost(i)}p. ${items[j][0]}: ${items[j][1]} × ${qty[j]} = ${cost(j)}p. Together: ${cost(i)} + ${cost(j)} = **${answer}p**.`,
      };
    },
  },
  {
    key: "mx-multistep",
    skill: S.problems,
    difficulties: [2, 3],
    make: (r, { difficulty }) => {
      const per = pick(r, [12, 24, 36, 48]);
      const boxes = int(r, 3, difficulty === 2 ? 6 : 12);
      const total = per * boxes;
      const out = int(r, Math.ceil(total / 4), total - 5);
      const answer = total - out;
      return {
        kind: "number",
        prompt: `A box holds **${per} pencils**. A school buys **${boxes} boxes** and gives out **${out}** pencils. How many pencils are left?`,
        answer,
        traps: [{ value: total, feedback: "That's how many were bought. Some were given out." }, { value: per * boxes + out, feedback: "Giving pencils out leaves fewer, so take away." }].filter((t) => t.value !== answer),
        hint: "First find how many pencils were bought. Then take away the ones given out.",
        explanation: `First, the pencils bought: ${per} × ${boxes} = ${total}. Then take away those given out: ${total} − ${out} = **${answer}** left.`,
      };
    },
  },
  borrow("mx-backwards", S.problems, [problemSolving]),
  {
    key: "mx-method",
    skill: S.problems,
    difficulties: [2, 3],
    make: (r, base) => {
      const choose = templatesOf(mentalMaths.id).filter((t) => t.key.startsWith("mm-choose"));
      const t = pick(r, choose);
      return { ...untag(t.make(r, { ...base, difficulty: base.difficulty })), origin: t.skill };
    },
  },
];

/** D-037: each exam-technique maker gives a second, more helpful hint; borrowed questions keep their island's hints. */
const techniqueTemplates = withHints(problemTemplates, {
  "mx-estimate": () => ["Round each number to something easy first.", "Pick the option closest to your rounded answer."],
  "mx-pattern": () => ["Find what changes from one term to the next.", "Use the same rule to continue the pattern."],
  "mx-interpret": () => ["Read the labels and the scale before the numbers.", "Find exactly the row, bar or value the question asks about."],
  "mx-multistep": () => ["Plan the steps: what do you need to find first?", "Write down each step's answer before the next."],
  "mx-backwards": () => ["Start from the end and undo each step.", "Undo the last step first, with the opposite operation."],
  "mx-method": () => ["Look at the numbers before you choose.", "Pick the method with the fewest easy steps that still works."],
});

/**
 * D-037: a written question in two linked parts, as some 11+ papers set them (the format is not claimed for any one
 * test). Part (a) and part (b) with the same difficulty and seed share one story, so a paper can set them together;
 * each is still a whole question on its own.
 */
function story(id: string, difficulty: number) {
  const r = prng(hashString(`twopart:${difficulty}:${/:(\d+)$/.exec(id)![1]}`));
  const which = int(r, 0, 2);
  if (which === 0) {
    const price = 5 * int(r, 24, 40);
    const k = int(r, 2, difficulty === 3 ? 4 : 3);
    const drink = 5 * int(r, 12, 24);
    const cost = price * k;
    return {
      text: `A café sells sandwiches for **${price}p** each and drinks for **${drink}p** each.`,
      a: { ask: `How much do **${k} sandwiches** cost, in pence?`, answer: cost, trap: price + k, hints: ["Each sandwich costs the same: multiply.", `${price} × ${k}.`], why: `${price} × ${k} = **${cost}p**.` },
      b: { ask: `Sam buys ${k} sandwiches and one drink, and pays with a **£10** note. How much change does Sam get, in pence?`, answer: 1000 - cost - drink, trap: 1000 - cost, hints: ["£10 is 1,000p. Find the total spent first.", `Total spent: ${cost} + ${drink}. Then take it from 1,000.`], why: `Spent: ${cost} + ${drink} = ${cost + drink}p. Change: 1,000 − ${cost + drink} = **${1000 - cost - drink}p**.` },
    };
  }
  if (which === 1) {
    const seats = pick(r, [32, 45, 52]);
    const buses = int(r, 3, difficulty === 3 ? 7 : 5);
    const pupils = seats * (buses - 1) + int(r, 1, seats - 1);
    return {
      text: `A school trip has **${fmtN(pupils)} pupils**. Each coach holds **${seats}** pupils.`,
      a: { ask: "How many coaches are needed so that every pupil has a seat?", answer: buses, trap: buses - 1, hints: ["Divide the pupils by the seats on one coach.", "If there is a remainder, those pupils still need a coach: round up."], why: `${fmtN(pupils)} ÷ ${seats} = ${buses - 1} remainder ${pupils - seats * (buses - 1)}. The pupils left over need one more coach: **${buses}** coaches.` },
      b: { ask: "How many empty seats are there when every coach needed is used?", answer: seats * buses - pupils, trap: pupils - seats * (buses - 1), hints: ["Find how many seats the coaches have altogether.", `Seats: ${seats} × ${buses}. Take away the pupils.`], why: `Seats: ${seats} × ${buses} = ${fmtN(seats * buses)}. Empty: ${fmtN(seats * buses)} − ${fmtN(pupils)} = **${seats * buses - pupils}**.` },
    };
  }
  const long = int(r, 6, difficulty === 3 ? 15 : 10);
  const wide = int(r, 3, long - 1);
  const perM = int(r, 3, 9);
  const round = 2 * (long + wide);
  return {
    text: `A rectangular garden is **${long} m** long and **${wide} m** wide.`,
    a: { ask: "What is the area of the garden, in square metres?", answer: long * wide, trap: round, hints: ["Area of a rectangle: length × width.", `${long} × ${wide}.`], why: `${long} × ${wide} = **${long * wide} m²**.` },
    b: { ask: `A fence goes all the way round the edge. Fencing costs **£${perM}** a metre. How much does the fence cost, in pounds?`, answer: round * perM, trap: (long + wide) * perM, hints: ["First find the distance all the way round: the perimeter.", `Perimeter: ${long} + ${wide} + ${long} + ${wide} = ${round} m. Then × £${perM}.`], why: `Perimeter: 2 × (${long} + ${wide}) = ${round} m. Cost: ${round} × £${perM} = **£${round * perM}**.` },
  };
}

function twoPart(part: "a" | "b"): Template {
  return {
    key: `mx-twopart-${part}`,
    skill: S.problems,
    difficulties: [2, 3],
    make: (_r, { id, difficulty }) => {
      const s = story(id, difficulty);
      const p = s[part];
      return {
        kind: "number",
        prompt: `${s.text} **(${part})** ${p.ask} (1 mark)`,
        answer: p.answer,
        traps: p.trap !== p.answer && p.trap >= 0 ? [{ value: p.trap, feedback: part === "a" ? "Read the question again: which operation does it need?" : "That misses a step. Check every step of the story." }] : [],
        hint: p.hints[0],
        hints: p.hints.slice(1),
        explanation: p.why,
      };
    },
  };
}
export const TWO_PART_KEYS = ["mx-twopart-a", "mx-twopart-b"] as const;

const templates: Template[] = [
  ...techniqueTemplates,
  twoPart("a"),
  twoPart("b"),
  borrow("mx-number", S.number, [placeValue, rounding, negative]),
  borrow("mx-calc", S.calc, [addSubtract, timesTables, multiplyDivide]),
  borrow("mx-fdp", S.fdp, [fractions2, decimals, percentages]),
  borrow("mx-measure", S.measure, [money, time, areaPerimeter, measures]),
  borrow("mx-shape", S.shape, [shapesAngles, coordinates, chartsData]),
  borrow("mx-reasoning", S.reasoning, [ratioAlgebra, problemSolving]),
];

export const mockExams = defineTopic({
  id: T,
  title: "Mock exams",
  subtitle: "11+ style mixed questions from every island, and the exam skills to beat them",
  world: "summit",
  years: [5, 6],
  order: 3,
  icon: "exam",
  skills: [
    { id: S.number, title: "Number", description: "Place value, rounding and negative numbers, 11+ style.", lessonId: "estimate" },
    { id: S.calc, title: "Calculation", description: "Adding, subtracting, multiplying and dividing, 11+ style.", lessonId: "read" },
    { id: S.fdp, title: "Fractions, decimals and %", description: "Fractions, decimals and percentages, 11+ style.", lessonId: "same-amount" },
    { id: S.measure, title: "Measures", description: "Money, time, area and perimeter, 11+ style.", lessonId: "units" },
    { id: S.shape, title: "Shape and data", description: "Shapes, angles, coordinates, charts and tables, 11+ style.", lessonId: "diagrams" },
    { id: S.reasoning, title: "Reasoning", description: "Ratio, algebra and multi-step problems, 11+ style.", lessonId: "reasoning" },
    { id: S.problems, title: "Unfamiliar problems", description: "Estimate, spot patterns, read tables, work backwards and choose a method for problems you haven't seen before.", lessonId: "problem-types" },
  ],
  lessonIcons: { read: "book", estimate: "target", units: "ruler", "same-amount": "puzzle", diagrams: "chart", reasoning: "bulb", "problem-types": "puzzle" },
  lessons: [
    {
      id: "read",
      title: "Read it twice",
      phase: "Understand",
      summary: "Find the key words before you work anything out.",
      minutes: 6,
      objectives: ["Spot the key words in a question", "Answer the question that's asked"],
      steps: [
        {
          type: "explain",
          title: "Key words",
          body: ["**Altogether**, **total** and **sum** mean add. **Difference** and **how many more** mean take away.", "**Each** and **per** often mean multiply or divide. **Not** and **the rest** mean find the other part."],
          tip: "Read the last sentence again just before you answer: what does it actually ask for?",
        },
        { type: "check", title: "Try one", questionId: gen("mx-calc", 2, 3) },
        { type: "check", title: "And another", questionId: gen("mx-calc", 3, 8) },
      ],
    },
    {
      id: "estimate",
      title: "Estimate first",
      phase: "Visualise",
      summary: "A quick estimate catches silly answers.",
      minutes: 6,
      objectives: ["Estimate before you calculate", "Use the estimate to check"],
      steps: [
        {
          type: "explain",
          title: "Round, then check",
          body: ["Before 398 × 6, think: about **400 × 6 = 2,400**. An answer of 23,880 or 238 can't be right.", "In multiple choice, an estimate often rules out most of the options straight away."],
          tip: "Estimate, calculate, then compare. If they're far apart, look again.",
        },
        { type: "check", title: "Try one", questionId: gen("mx-number", 2, 4) },
        { type: "check", title: "And another", questionId: gen("mx-number", 3, 9) },
      ],
    },
    {
      id: "units",
      title: "Units and answers",
      phase: "Practise",
      summary: "Change to the same unit before you calculate.",
      minutes: 6,
      objectives: ["Use matching units", "Give the answer in the unit asked for"],
      steps: [
        {
          type: "explain",
          title: "Match the units",
          body: ["**1 m = 100 cm**, **£1 = 100p**, **1 hour = 60 minutes**, **1 kg = 1,000 g**.", "If one amount is in metres and one in centimetres, change them to the same unit first."],
          tip: "Check the unit next to the answer box before you type.",
        },
        { type: "check", title: "Try one", questionId: gen("mx-measure", 2, 2) },
        { type: "check", title: "And another", questionId: gen("mx-measure", 3, 5) },
      ],
    },
    {
      id: "same-amount",
      title: "Same amount, three ways",
      phase: "Explore",
      summary: "Fractions, decimals and percentages are the same amounts in different clothes.",
      minutes: 6,
      objectives: ["Switch between fractions, decimals and percentages"],
      steps: [
        {
          type: "explain",
          title: "Know the pairs",
          body: ["**{1/2} = 0.5 = 50%**, **{1/4} = 0.25 = 25%**, **{3/4} = 0.75 = 75%**, **{1/10} = 0.1 = 10%**, **{1/5} = 0.2 = 20%**.", "To compare a mix of them, change them all into the same form first."],
          visual: { kind: "grid100", shaded: 75 },
        },
        { type: "check", title: "Try one", questionId: gen("mx-fdp", 2, 6) },
        { type: "check", title: "And another", questionId: gen("mx-fdp", 3, 1) },
      ],
    },
    {
      id: "diagrams",
      title: "Use the picture",
      phase: "Apply",
      summary: "Read the scale, the key and the labels before you answer.",
      minutes: 6,
      objectives: ["Read charts, grids and diagrams carefully"],
      steps: [
        {
          type: "explain",
          title: "Look before you count",
          body: ["On a chart, check the **scale**: does it go up in 1s, 2s, 5s or 10s? On a pictogram, read the **key**.", "Diagrams in the 11+ are often **not drawn to scale**: use the numbers, not a ruler."],
          tip: "Put your finger on the picture as you read it.",
        },
        { type: "check", title: "Try one", questionId: gen("mx-shape", 2, 7) },
        { type: "check", title: "And another", questionId: gen("mx-shape", 3, 2) },
      ],
    },
    {
      id: "reasoning",
      title: "Show your thinking",
      phase: "Apply",
      summary: "Draw a bar, work backwards, and check your answer fits.",
      minutes: 7,
      objectives: ["Use bar models and working backwards in tricky problems"],
      steps: [
        {
          type: "explain",
          title: "Tools for tricky problems",
          body: ["Draw a **bar model** when amounts are compared or shared.", "**Work backwards** when you know the end and need the start. Then put your answer back into the question to check it fits."],
          visual: { kind: "bar", parts: [{ label: "?", tone: "num" }, { label: "?", tone: "brand" }, { label: "?", tone: "brand" }], total: "36" },
        },
        { type: "check", title: "Try one", questionId: gen("mx-reasoning", 2, 3) },
        { type: "check", title: "And another", questionId: gen("mx-reasoning", 3, 4) },
      ],
    },
    {
      id: "problem-types",
      title: "Unfamiliar problems",
      phase: "Apply",
      summary: "Read, plan, estimate and check: a way into problems you haven't seen before.",
      minutes: 9,
      objectives: ["Plan a multi-step problem before calculating", "Estimate, spot patterns and work backwards"],
      steps: [
        { type: "explain", title: "Read, plan, check", body: ["**Read** the whole question and underline what it asks for.", "**Plan** the steps: what must you find first?", "**Check** the answer against an estimate."] },
        {
          type: "worked",
          title: "Let's do it together",
          support: "faded",
          problem: "A box holds **24** pencils. A school buys **7** boxes and gives out **125**. How many are left?",
          steps: [
            { text: "First, the pencils bought: 24 × 7 = 168." },
            { text: "Then take away the ones given out.", blank: { prompt: "What is 168 − 125?", answer: 43, hint: "168 − 100 = 68, then take away 25.", worked: "168 − 125 = **43**." } },
            { text: "Check: 125 + 43 = 168. ✓" },
          ],
          conclusion: "**43** pencils are left.",
        },
        { type: "explain", title: "Estimate, then spot the pattern", body: ["Round to estimate first: 389 × 21 is about 400 × 20 = 8,000, so an answer of 816 can't be right.", "In a sequence, find the change each time, then count the steps from the first number."] },
        { type: "check", title: "Your turn", questionId: gen("mx-pattern", 2, 3) },
        { type: "check", title: "One more", questionId: gen("mx-interpret", 2, 2) },
      ],
    },
  ],
  templates,
  misconceptions: [],
  placement: [
    { lessonId: "read", template: "mx-calc" },
    { lessonId: "estimate", template: "mx-number" },
    { lessonId: "units", template: "mx-measure" },
    { lessonId: "same-amount", template: "mx-fdp" },
    { lessonId: "diagrams", template: "mx-shape" },
    { lessonId: "reasoning", template: "mx-reasoning" },
    { lessonId: "problem-types", template: "mx-multistep" },
  ],
});
