import { defineTopic, genFor, int, pick } from "@/topics/kit/define";
import { num } from "@/topics/kit/evaluate";
import type { Template } from "@/topics/kit/types";

/** Problem solving: two-step problems, working backwards, sum and difference, counting combinations, fractions in context. */

const T = "problem-solving";
const gen = genFor(T);
const S = { steps: `${T}.two-step`, backwards: `${T}.backwards`, reasoning: `${T}.sum-difference`, counting: `${T}.counting`, fractions: `${T}.fractions-in-context` };
const M = { oneStep: `${T}.stopped-early`, forwards: `${T}.went-forwards`, halved: `${T}.halved-total`, added: `${T}.added-choices`, part: `${T}.wrong-part` };

const NAMES = ["Sam", "Aisha", "Leo", "Maya", "Kai", "Ella", "Ravi", "Zoe"];
const pounds = (p: number) => `£${(p / 100).toFixed(2)}`;
const price = (p: number) => (p < 100 ? `${p}p` : pounds(p));

const templates: Template[] = [
  {
    key: "ps-two-step",
    skill: S.steps,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const who = pick(r, NAMES);
      if (difficulty === 1) {
        const boxes = int(r, 3, 8);
        const each = pick(r, [6, 10, 12]);
        const broken = int(r, 2, each - 1);
        const answer = boxes * each - broken;
        return {
          kind: "number",
          prompt: `${who} has **${boxes} boxes** of eggs. Each box holds **${each}** eggs. **${broken}** eggs break. How many eggs are left?`,
          answer,
          traps: [{ value: boxes * each, misconception: M.oneStep, feedback: "That's how many eggs there were. Now take away the broken ones." }, { value: boxes + each - broken, feedback: `${boxes} boxes of ${each} means ${boxes} × ${each}.` }].filter((t) => t.value !== answer && t.value > 0),
          hint: `First find how many eggs: ${boxes} × ${each}. Then take away ${broken}.`,
          explanation: `${boxes} × ${each} = ${boxes * each}. ${boxes * each} − ${broken} = **${answer}**.`,
        };
      }
      const [a, b] = pick(r, [["pencils", "rulers"], ["apples", "bananas"], ["stickers", "badges"], ["buns", "drinks"]] as const);
      const pa = int(r, 3, 9) * 5;
      const pb = int(r, 6, 19) * 5;
      const na = int(r, 2, 5);
      const nb = int(r, 2, 4);
      const spent = na * pa + nb * pb;
      if (difficulty === 2) {
        return {
          kind: "number",
          prompt: `${a.charAt(0).toUpperCase() + a.slice(1)} cost **${price(pa)}** each and ${b} cost **${price(pb)}** each. ${who} buys **${na} ${a}** and **${nb} ${b}**. How much does ${who} spend?`,
          answer: spent / 100,
          unit: "£",
          decimals: 2,
          traps: [{ value: (pa + pb) / 100, misconception: M.oneStep, feedback: `That's one of each. ${who} buys ${na} ${a} and ${nb} ${b}.` }, { value: spent, feedback: `${spent}p is right, but write it in pounds: ${pounds(spent)}.` }].filter((t) => Math.abs(t.value - spent / 100) > 1e-9),
          hint: `Work out ${na} × ${price(pa)} and ${nb} × ${price(pb)}, then add.`,
          explanation: `${na} × ${pa}p = ${na * pa}p. ${nb} × ${pb}p = ${nb * pb}p. Total: ${spent}p = **${pounds(spent)}**.`,
        };
      }
      const paid = spent < 1000 ? 1000 : 2000;
      const change = paid - spent;
      return {
        kind: "number",
        prompt: `${a.charAt(0).toUpperCase() + a.slice(1)} cost **${price(pa)}** each and ${b} cost **${price(pb)}** each. ${who} buys **${na} ${a}** and **${nb} ${b}**, and pays with a **${pounds(paid).replace(".00", "")}** note. How much change does ${who} get?`,
        answer: change / 100,
        unit: "£",
        decimals: 2,
        traps: [{ value: spent / 100, misconception: M.oneStep, feedback: "That's what it all costs. Now work out the change." }],
        hint: "Find the total cost first, then take it away from what was paid.",
        explanation: `Cost: ${na} × ${pa}p + ${nb} × ${pb}p = ${spent}p = ${pounds(spent)}. Change: ${pounds(paid)} − ${pounds(spent)} = **${pounds(change)}**.`,
      };
    },
  },
  {
    key: "ps-measure",
    skill: S.steps,
    difficulties: [2, 3],
    make: (r, { difficulty }) => {
      const metres = int(r, 2, 5);
      const piece = int(r, 3, 9) * (difficulty === 2 ? 10 : 5);
      const count = int(r, 2, Math.min(6, Math.floor((metres * 100) / piece) - 1));
      const left = metres * 100 - count * piece;
      const thing = pick(r, ["ribbon", "rope", "string", "wool"]);
      return {
        kind: "number",
        prompt: `A piece of ${thing} is **${metres} m** long. **${count}** pieces of **${piece} cm** are cut off. How much ${thing} is left, in centimetres?`,
        answer: left,
        unit: "cm",
        traps: [{ value: count * piece, misconception: M.part, feedback: "That's the part that was cut off. How much is left?" }, { value: metres * 100 - piece, misconception: M.oneStep, feedback: `${count} pieces were cut, not one.` }, { value: metres - count * piece, feedback: `Change metres to centimetres first: ${metres} m = ${metres * 100} cm.` }].filter((t) => t.value !== left && t.value > 0),
        hint: `${metres} m = ${metres * 100} cm. Then take away ${count} × ${piece} cm.`,
        explanation: `${metres} m = ${metres * 100} cm. Cut: ${count} × ${piece} = ${count * piece} cm. Left: ${metres * 100} − ${count * piece} = **${left} cm**.`,
      };
    },
  },
  {
    key: "ps-backwards",
    skill: S.backwards,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const start = int(r, 3, 15);
      if (difficulty === 1) {
        const add = int(r, 6, 40);
        return {
          kind: "number",
          prompt: `I think of a number. I add **${add}**. The answer is **${start + add}**. What was my number?`,
          answer: start,
          traps: [{ value: start + add + add, misconception: M.forwards, feedback: `Undo "add ${add}" by taking away ${add}.` }],
          hint: `Work backwards: ${start + add} − ${add}.`,
          explanation: `${start + add} − ${add} = **${start}**.`,
        };
      }
      const k = int(r, 2, 9);
      const c = int(r, 2, 15);
      const sub = r() < 0.5;
      const mid = start * k;
      const end = sub ? mid - c : mid + c;
      if (difficulty === 2) {
        return {
          kind: "number",
          prompt: `I think of a number. I multiply it by **${k}**, then ${sub ? "take away" : "add"} **${c}**. The answer is **${end}**. What was my number?`,
          answer: start,
          traps: [{ value: end * k + (sub ? -c : c), misconception: M.forwards, feedback: "Work backwards: undo the last step first, with the inverse." }, ...((sub ? end - c : end + c) % k === 0 ? [{ value: (sub ? end - c : end + c) / k, misconception: M.forwards, feedback: `Undo "${sub ? "take away" : "add"} ${c}" by ${sub ? "adding" : "taking away"} ${c}.` }] : [])].filter((t) => t.value !== start && t.value > 0),
          hint: `Undo the last step first: ${end} ${sub ? "+" : "−"} ${c}. Then divide by ${k}.`,
          explanation: `${end} ${sub ? "+" : "−"} ${c} = ${mid}. ${mid} ÷ ${k} = **${start}**.`,
        };
      }
      // Three steps, with a halving.
      const even = start * 2;
      const afterDouble = even * k;
      const end3 = afterDouble / 2 + c;
      return {
        kind: "number",
        prompt: `I think of a number. I multiply it by **${k}**, halve the answer, then add **${c}**. I get **${end3}**. What was my number?`,
        answer: even,
        traps: [{ value: ((end3 - c) * 2) / k / 2, misconception: M.forwards, feedback: "Undo halving by doubling." }, { value: end3 - c, misconception: M.oneStep, feedback: "Keep going: undo every step, last one first." }].filter((t) => Number.isInteger(t.value) && t.value !== even && t.value > 0),
        hint: `Undo in reverse: take away ${c}, double, then divide by ${k}.`,
        explanation: `${end3} − ${c} = ${end3 - c}. Double: ${(end3 - c) * 2}. ÷ ${k} = **${even}**.`,
      };
    },
  },
  {
    key: "ps-sum-diff",
    skill: S.reasoning,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const [p, q] = [pick(r, NAMES.slice(0, 4)), pick(r, NAMES.slice(4))];
      const what = pick(r, ["marbles", "stickers", "cards", "shells"]);
      if (difficulty === 3) {
        const small = int(r, 4, 15);
        const times = int(r, 2, 4);
        const total = small * (times + 1);
        return {
          kind: "number",
          prompt: `${p} has **${times} times** as many ${what} as ${q}. Together they have **${total}**. How many does **${q}** have?`,
          visual: { kind: "bar", parts: [{ label: q, tone: "num" }, ...Array.from({ length: times }, () => ({ label: p.charAt(0), tone: "brand" as const }))], total: `${total}` },
          answer: small,
          traps: [{ value: total / 2, misconception: M.halved, feedback: "They don't have the same amount. Count the equal parts in the bar." }, { value: small * times, misconception: M.part, feedback: `That's ${p}'s ${what}.` }, { value: total / times, misconception: M.part, feedback: `There are ${times} + 1 = ${times + 1} equal parts, not ${times}.` }].filter((t) => Number.isInteger(t.value) && t.value !== small),
          hint: `${q} is 1 part and ${p} is ${times} parts: ${times + 1} parts altogether.`,
          explanation: `${times + 1} equal parts make ${total}, so 1 part is ${total} ÷ ${times + 1} = **${small}**.`,
        };
      }
      const small = int(r, 5, difficulty === 1 ? 20 : 60);
      const diff = int(r, 2, difficulty === 1 ? 10 : 30);
      const total = small * 2 + diff;
      const askBig = difficulty === 2 && r() < 0.5;
      const answer = askBig ? small + diff : small;
      return {
        kind: "number",
        prompt: `${p} and ${q} have **${total}** ${what} altogether. ${p} has **${diff} more** than ${q}. How many does **${askBig ? p : q}** have?`,
        visual: { kind: "bar", parts: [{ label: q, tone: "num", size: small }, { label: `${p}`, tone: "brand", size: small }, { label: `+${diff}`, tone: "brand", size: Math.max(diff, small / 3) }], total: `${total}` },
        answer,
        traps: [{ value: total / 2, misconception: M.halved, feedback: `They don't have the same: take away the ${diff} extra first, then halve.` }, { value: total - diff, misconception: M.oneStep, feedback: "That's both of them without the extra. Now halve it." }, { value: askBig ? small : small + diff, misconception: M.part, feedback: `That's ${askBig ? q : p}'s amount.` }].filter((t) => Number.isInteger(t.value) && t.value !== answer),
        hint: `Take away the ${diff} extra. What's left is two equal amounts.`,
        explanation: askBig
          ? `${total} − ${diff} = ${total - diff}. Half of that is ${small}, so ${q} has ${small} and ${p} has ${small} + ${diff} = **${small + diff}**.`
          : `${total} − ${diff} = ${total - diff}. Half of that is ${small}, so ${q} has **${small}**.`,
      };
    },
  },
  {
    key: "ps-counting",
    skill: S.counting,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      if (difficulty === 1) {
        const tops = int(r, 2, 6);
        const bottoms = int(r, 2, 5);
        return {
          kind: "number",
          prompt: `${pick(r, NAMES)} has **${tops} T-shirts** and **${bottoms} pairs of shorts**. How many different outfits of one T-shirt and one pair of shorts can be made?`,
          answer: tops * bottoms,
          traps: [{ value: tops + bottoms, misconception: M.added, feedback: `Each T-shirt goes with all ${bottoms} pairs of shorts. That's ${tops} lots of ${bottoms}.` }].filter((t) => t.value !== tops * bottoms),
          hint: `Each T-shirt can go with every pair of shorts.`,
          explanation: `${tops} × ${bottoms} = **${tops * bottoms}** outfits.`,
        };
      }
      if (difficulty === 2) {
        const set = pick(r, [
          { place: "A café offers", a: "starter", b: "main", c: "pudding", sets: "meals" },
          { place: "A sandwich bar offers", a: "bread", b: "filling", c: "drink", sets: "lunches" },
          { place: "A shop sells", a: "hat", b: "scarf", c: "pair of gloves", sets: "sets" },
        ]);
        const { a, b, c } = set;
        const [x, y, z] = [int(r, 2, 4), int(r, 2, 4), int(r, 2, 3)];
        return {
          kind: "number",
          prompt: `${set.place} **${x}** kinds of ${a}, **${y}** kinds of ${b} and **${z}** kinds of ${c === "pair of gloves" ? "gloves" : c}. How many different ${set.sets} of one ${a}, one ${b} and one ${c} are there?`,
          answer: x * y * z,
          traps: [{ value: x + y + z, misconception: M.added, feedback: "Multiply the choices: every choice goes with every other choice." }, { value: x * y + z, misconception: M.added, feedback: "Multiply all three numbers of choices." }].filter((t) => t.value !== x * y * z),
          hint: "Multiply the number of choices for each part.",
          explanation: `${x} × ${y} × ${z} = **${x * y * z}**.`,
        };
      }
      const n = int(r, 4, 8);
      const answer = (n * (n - 1)) / 2;
      return {
        kind: "number",
        prompt: `**${n}** friends meet. Each friend shakes hands **once** with every other friend. How many handshakes are there?`,
        answer,
        traps: [{ value: n * (n - 1), misconception: M.added, feedback: "Each handshake has been counted twice: A with B is the same as B with A." }, { value: n * n, feedback: "Nobody shakes their own hand, and each handshake is shared by two people." }],
        hint: `The first friend shakes ${n - 1} hands, the next ${n - 2} new hands, and so on.`,
        explanation: `${Array.from({ length: n - 1 }, (_, i) => n - 1 - i).join(" + ")} = **${answer}** handshakes.`,
      };
    },
  },
  {
    key: "ps-fractions",
    skill: S.fractions,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const d = pick(r, [3, 4, 5, 6, 8]);
      const k = int(r, 2, 9);
      const whole = d * k;
      if (difficulty === 1) {
        return {
          kind: "number",
          prompt: `There are **${whole}** children in a club. **{1/${d}}** of them play chess. How many play chess?`,
          answer: k,
          traps: [{ value: whole - k, misconception: M.part, feedback: "That's the children who don't play chess." }, { value: whole / 2, feedback: `{1/${d}} means divide by ${d}.` }].filter((t) => Number.isInteger(t.value) && t.value !== k),
          hint: `Find {1/${d}}: divide ${whole} by ${d}.`,
          explanation: `${whole} ÷ ${d} = **${k}**.`,
        };
      }
      const n = int(r, 2, d - 1);
      if (difficulty === 2) {
        const yes = n * k;
        return {
          kind: "number",
          prompt: `There are **${whole}** children in a class. **{${n}/${d}}** of them walk to school. How many children do **not** walk?`,
          visual: { kind: "bar", parts: Array.from({ length: d }, (_, i) => ({ label: `${k}`, tone: i < n ? ("brand" as const) : ("plain" as const) })), total: `${whole}` },
          answer: whole - yes,
          traps: [{ value: yes, misconception: M.part, feedback: "That's the children who do walk. The question asks about the rest." }, { value: k, misconception: M.oneStep, feedback: `That's {1/${d}}. Keep going.` }].filter((t) => t.value !== whole - yes),
          hint: `Find {1/${d}} first (${whole} ÷ ${d}), then the walkers, then the rest.`,
          explanation: `{1/${d}} of ${whole} is ${k}, so {${n}/${d}} is ${yes}. ${whole} − ${yes} = **${whole - yes}**.`,
        };
      }
      // Working back from what's left.
      const left = (d - n) * k;
      return {
        kind: "number",
        prompt: `${pick(r, NAMES)} spends **{${n}/${d}}** of their money and has **£${left}** left. How much did they have to start with?`,
        visual: { kind: "bar", parts: Array.from({ length: d }, (_, i) => ({ label: i < n ? "spent" : "?", tone: i < n ? ("plain" as const) : ("ok" as const) })), note: `The ${d - n} part${d - n > 1 ? "s" : ""} left make £${left}` },
        answer: whole,
        unit: "£",
        traps: [{ value: left + (left * n) / d, misconception: M.part, feedback: `£${left} is the part left: {${d - n}/${d}} of the money, not all of it.` }, { value: left * d, misconception: M.part, feedback: `£${left} is ${d - n} part${d - n > 1 ? "s" : ""}, not one part.` }].filter((t) => Number.isInteger(t.value) && t.value !== whole),
        hint: `What's left is {${d - n}/${d}}. Find one part: £${left} ÷ ${d - n}.`,
        explanation: `£${left} is ${d - n} of ${d} parts, so one part is £${k}. All ${d} parts: ${d} × £${k} = **£${num(whole)}**.`,
      };
    },
  },
];

export const problemSolving = defineTopic({
  id: T,
  title: "Problem solving",
  subtitle: "Two-step problems, working backwards, bar models, counting choices and fractions in real life",
  world: "summit",
  years: [5, 6],
  order: 2,
  icon: "bulb",
  skills: [
    { id: S.steps, title: "Two-step problems", description: "Solve problems with more than one step, including money and measures.", lessonId: "steps" },
    { id: S.backwards, title: "Working backwards", description: "Undo each step to find the starting number.", lessonId: "backwards" },
    { id: S.reasoning, title: "Bar model puzzles", description: "Use a bar model for sum, difference and 'times as many' problems.", lessonId: "bar-models" },
    { id: S.counting, title: "Counting choices", description: "Count combinations like outfits, meals and handshakes.", lessonId: "counting" },
    { id: S.fractions, title: "Fractions in real life", description: "Use fractions of amounts, the rest, and work backwards from a fraction.", lessonId: "fractions" },
  ],
  lessonIcons: { steps: "map", backwards: "recheck", "bar-models": "puzzle", counting: "dice", fractions: "pizza" },
  lessons: [
    {
      id: "steps",
      title: "Two-step problems",
      phase: "Understand",
      summary: "Read it, plan the steps, solve, then check.",
      minutes: 8,
      objectives: ["Plan and solve problems with two steps"],
      steps: [
        {
          type: "explain",
          title: "Read, plan, solve, check",
          body: ["**Read** the question twice. **Plan**: what do you need to find first? **Solve** one step at a time. **Check**: does the answer make sense?", "Many problems hide two steps: first find a total, then take away or share."],
          tip: "Write down the answer to each step so you don't lose it.",
        },
        {
          type: "worked",
          title: "Watch me plan",
          support: "full",
          problem: "Pencils cost **45p** and rulers cost **80p**. Sam buys **3 pencils** and **2 rulers**. How much does Sam spend?",
          steps: [{ text: "Step 1: 3 pencils: 3 × 45p = **135p**." }, { text: "Step 2: 2 rulers: 2 × 80p = **160p**." }, { text: "Step 3: add: 135p + 160p = **295p**." }],
          conclusion: "Sam spends **£2.95**.",
        },
        { type: "check", title: "Your turn", questionId: gen("ps-two-step", 1, 4) },
        { type: "check", title: "One more", questionId: gen("ps-two-step", 2, 9) },
      ],
    },
    {
      id: "backwards",
      title: "Working backwards",
      phase: "Visualise",
      summary: "Undo the last step first.",
      minutes: 7,
      objectives: ["Find a starting number by working backwards"],
      steps: [
        {
          type: "worked",
          title: "Let's do it together",
          support: "faded",
          problem: "I think of a number. I multiply it by **4**, then add **7**. The answer is **43**. What was my number?",
          steps: [
            { text: "Undo the last step first: add 7 becomes take away 7.", blank: { prompt: "What is 43 − 7?", answer: 36, hint: "43 − 3 = 40, then − 4 more.", worked: "43 − 7 = **36**." } },
            { text: "Undo × 4 with ÷ 4: 36 ÷ 4 = 9." },
          ],
          conclusion: "My number was **9**. Check: 9 × 4 + 7 = 43.",
        },
        { type: "check", title: "Your turn", questionId: gen("ps-backwards", 1, 2) },
        { type: "check", title: "One more", questionId: gen("ps-backwards", 2, 5) },
      ],
    },
    {
      id: "bar-models",
      title: "Bar model puzzles",
      phase: "Practise",
      summary: "Draw it: equal bars make tricky problems easy.",
      minutes: 8,
      objectives: ["Solve sum and difference problems", "Solve 'times as many' problems"],
      steps: [
        {
          type: "explain",
          title: "Take away the extra",
          body: ["Amy and Ben have **30** marbles. Amy has **6 more** than Ben.", "Take away the 6 extra: 30 − 6 = 24. That's two equal bars, so Ben has 24 ÷ 2 = **12**, and Amy has 12 + 6 = **18**."],
          visual: { kind: "bar", parts: [{ label: "Ben", tone: "num", size: 12 }, { label: "Amy", tone: "brand", size: 12 }, { label: "+6", tone: "brand", size: 6 }], total: "30" },
        },
        { type: "check", title: "Your turn", questionId: gen("ps-sum-diff", 1, 3) },
        { type: "check", title: "One more", questionId: gen("ps-sum-diff", 3, 6) },
      ],
    },
    {
      id: "counting",
      title: "Counting choices",
      phase: "Explore",
      summary: "Every choice goes with every other choice: multiply.",
      minutes: 7,
      objectives: ["Count combinations", "Avoid counting things twice"],
      steps: [
        {
          type: "explain",
          title: "Multiply the choices",
          body: ["3 T-shirts and 4 pairs of shorts: each T-shirt goes with all 4 pairs of shorts.", "That's 3 lots of 4: **3 × 4 = 12** outfits, not 3 + 4."],
          visual: { kind: "array", rows: 3, cols: 4 },
          tip: "For handshakes, A with B is the same as B with A: don't count it twice.",
        },
        { type: "check", title: "Your turn", questionId: gen("ps-counting", 1, 2) },
        { type: "check", title: "One more", questionId: gen("ps-counting", 2, 7) },
      ],
    },
    {
      id: "fractions",
      title: "Fractions in real life",
      phase: "Apply",
      summary: "Find one part first, then build up.",
      minutes: 8,
      objectives: ["Find a fraction of an amount in a story", "Work backwards from a fraction"],
      steps: [
        {
          type: "explain",
          title: "One part first",
          body: ["{3/5} of 40 children walk. One fifth is 40 ÷ 5 = **8**, so {3/5} is 3 × 8 = **24**.", "The rest is {2/5}: 2 × 8 = **16** children don't walk."],
          visual: { kind: "bar", parts: [{ label: "8", tone: "brand" }, { label: "8", tone: "brand" }, { label: "8", tone: "brand" }, { label: "8", tone: "plain" }, { label: "8", tone: "plain" }], total: "40" },
        },
        { type: "check", title: "Your turn", questionId: gen("ps-fractions", 2, 3) },
        { type: "check", title: "One more", questionId: gen("ps-fractions", 3, 5) },
      ],
    },
  ],
  templates,
  misconceptions: [
    { id: M.oneStep, name: "Stopping after one step", possibleCause: "It looks like the problem was stopped after the first step.", description: "Answers the first step, not the whole question.", explanation: ["Read the question again: what does it ask for?", "Plan all the steps before you start."], skills: [S.steps, S.backwards, S.reasoning, S.fractions], followUpTemplates: ["ps-two-step", "ps-fractions"] },
    { id: M.forwards, name: "Going forwards, not backwards", possibleCause: "It looks like the steps were done forwards instead of undone.", description: "Uses the same operations instead of the inverses.", explanation: ["Undo the last step first.", "+ becomes −, × becomes ÷, halve becomes double."], skills: [S.backwards], followUpTemplates: ["ps-backwards"] },
    { id: M.halved, name: "Halving the total", possibleCause: "It looks like the total was halved, as if both had the same.", description: "Halves the total when one person has more.", explanation: ["Take away the extra first.", "Then the rest splits into equal parts."], skills: [S.reasoning], followUpTemplates: ["ps-sum-diff"] },
    { id: M.added, name: "Adding the choices", possibleCause: "It looks like the choices were added instead of multiplied.", description: "Says 3 T-shirts and 4 shorts make 7 outfits.", explanation: ["Each choice goes with every other choice.", "Multiply: 3 × 4 = 12."], skills: [S.counting], followUpTemplates: ["ps-counting"] },
    { id: M.part, name: "Answering the wrong part", possibleCause: "It looks like the answer is a different part of the problem.", description: "Gives the part that walks when the question asks about the rest.", explanation: ["Read the last sentence again.", "Check which part the question wants."], skills: [S.steps, S.reasoning, S.fractions], followUpTemplates: ["ps-fractions", "ps-sum-diff"] },
  ],
  placement: [
    { lessonId: "steps", template: "ps-two-step" },
    { lessonId: "backwards", template: "ps-backwards" },
    { lessonId: "bar-models", template: "ps-sum-diff" },
    { lessonId: "counting", template: "ps-counting" },
    { lessonId: "fractions", template: "ps-fractions" },
  ],
});
