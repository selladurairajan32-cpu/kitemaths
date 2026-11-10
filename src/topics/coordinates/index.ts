import { defineTopic, genFor, int, pick, withHints } from "@/topics/kit/define";
import { num } from "@/topics/kit/evaluate";
import type { ChooseOption, Template } from "@/topics/kit/types";

/** Coordinates: reading and plotting points, finding the missing corner of a shape, translations, four quadrants. */

const T = "coordinates";
const gen = genFor(T);
const S = { read: `${T}.read`, plot: `${T}.plot`, shapes: `${T}.shapes`, translate: `${T}.translate` };
const M = { swap: `${T}.x-y-swapped`, sign: `${T}.negative-sign`, direction: `${T}.wrong-direction`, one: `${T}.off-by-one` };

/** (3, −2) */
const pt = (x: number, y: number) => `(${num(x)}, ${num(y)})`;

function unique(right: string, wrong: ChooseOption[]): ChooseOption[] {
  const out: ChooseOption[] = [{ text: right }];
  for (const w of wrong) if (!out.some((o) => o.text === w.text)) out.push(w);
  return out.slice(0, 4);
}
/** The grid for each level: 0 to 6, 0 to 10, or all four quadrants. */
const range = (difficulty: number) => (difficulty === 1 ? { min: 0, max: 6 } : difficulty === 2 ? { min: 0, max: 10 } : { min: -6, max: 6 });
/** A point on the grid, off the axes, with x ≠ y so a swap shows. */
function point(r: () => number, difficulty: number): [number, number] {
  const { min, max } = range(difficulty);
  for (;;) {
    const x = int(r, min, max);
    const y = int(r, min, max);
    if (x !== 0 && y !== 0 && x !== y && (difficulty < 3 || x < 0 || y < 0)) return [x, y];
  }
}

const baseTemplates: Template[] = [
  {
    key: "co-read",
    skill: S.read,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const [x, y] = point(r, difficulty);
      return {
        kind: "choose",
        prompt: "What are the coordinates of point **A**?",
        visual: { kind: "coords", ...range(difficulty), points: [{ x, y, label: "A" }] },
        options: unique(pt(x, y), [
          { text: pt(y, x), misconception: M.swap, feedback: "Go along the x-axis first, then up the y-axis: (across, up)." },
          ...(difficulty === 3 ? [{ text: pt(-x, y), misconception: M.sign, feedback: "Left of zero, x is negative. Below zero, y is negative." }, { text: pt(x, -y), misconception: M.sign, feedback: "Left of zero, x is negative. Below zero, y is negative." }] : []),
          { text: pt(x + 1, y), misconception: M.one, feedback: "Count the lines from 0, not the squares." },
          { text: pt(x, y - 1), misconception: M.one, feedback: "Count the lines from 0, not the squares." },
        ]),
        answer: 0,
        hint: "Along the corridor, then up the stairs: x first, then y.",
        explanation: `A is ${num(Math.abs(x))} ${x < 0 ? "left" : "along"} and ${num(Math.abs(y))} ${y < 0 ? "down" : "up"}: **${pt(x, y)}**.`,
      };
    },
  },
  {
    key: "co-plot",
    skill: S.plot,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const [x, y] = point(r, difficulty);
      // Decoys: the swapped point, a sign slip (in four quadrants) and one nearby point.
      const decoys: [number, number][] = [[y, x], difficulty === 3 ? [-x, y] : [x, Math.min(range(difficulty).max, y + 1) === y ? y - 1 : y + 1], [x - 1 >= range(difficulty).min ? x - 1 : x + 1, y]];
      const labels = ["A", "B", "C", "D"];
      const all: [number, number][] = [[x, y], ...decoys];
      const order = [0, 1, 2, 3].sort(() => r() - 0.5);
      const placed = order.map((k) => all[k]);
      const at = order.indexOf(0);
      return {
        kind: "choose",
        prompt: `Which point is at **${pt(x, y)}**?`,
        visual: { kind: "coords", ...range(difficulty), points: placed.map(([px, py], i) => ({ x: px, y: py, label: labels[i] })) },
        options: labels.map((l, i) => {
          const [px, py] = placed[i];
          const swap = px === y && py === x;
          return { text: l, misconception: i === at ? undefined : swap ? M.swap : difficulty === 3 && px === -x ? M.sign : M.one, feedback: i === at ? undefined : `${l} is at ${pt(px, py)}. ${swap ? "x comes first: along, then up." : "Count carefully from 0."}` };
        }),
        answer: at,
        fixedOrder: true,
        hint: `Start at 0. Go ${num(Math.abs(x))} ${x < 0 ? "left" : "along"}, then ${num(Math.abs(y))} ${y < 0 ? "down" : "up"}.`,
        explanation: `${pt(x, y)}: ${num(Math.abs(x))} ${x < 0 ? "left" : "along"} and ${num(Math.abs(y))} ${y < 0 ? "down" : "up"}. That's point **${labels[at]}**.`,
      };
    },
  },
  {
    key: "co-shape",
    skill: S.shapes,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const { min, max } = range(difficulty);
      const square = difficulty > 1 && r() < 0.5;
      let x1 = int(r, min + 1, max - 3);
      let y1 = int(r, min + 1, max - 3);
      const w = int(r, 2, max - x1);
      const h = square ? w : int(r, 2, max - y1);
      if (y1 + h > max) y1 = max - h;
      if (x1 + w > max) x1 = max - w;
      const [x2, y2] = [x1 + w, y1 + h];
      const shape = square ? "square" : "rectangle";
      const D: [number, number] = [x1, y2];
      return {
        kind: "choose",
        prompt: `A, B and C are three corners of a **${shape}**. What are the coordinates of the fourth corner, D?`,
        visual: { kind: "coords", min, max, points: [{ x: x1, y: y1, label: "A" }, { x: x2, y: y1, label: "B" }, { x: x2, y: y2, label: "C" }] },
        options: unique(pt(...D), [
          ...(D[0] !== D[1] ? [{ text: pt(D[1], D[0]), misconception: M.swap, feedback: "x first, then y: D is straight above A, so it has the same x as A." }] : []),
          { text: pt(x1, y2 + 1), misconception: M.one, feedback: "D is level with C, so it has the same y as C." },
          { text: pt(x1 - 1, y2), misconception: M.one, feedback: "D is straight above A, so it has the same x as A." },
          { text: pt(x2, y1 + h + 1), feedback: "D is level with C and straight above A." },
        ]),
        answer: 0,
        hint: `D is straight above A (same x) and level with C (same y).`,
        explanation: `D has A's x (${num(x1)}) and C's y (${num(y2)}): **${pt(...D)}**.`,
      };
    },
  },
  {
    key: "co-translate",
    skill: S.translate,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const { min, max } = range(difficulty);
      const [x, y] = point(r, difficulty);
      // A move that stays on the grid, with different across and up amounts.
      let dx = 0;
      let dy = 0;
      for (let k = 0; k < 40; k++) {
        dx = int(r, -4, 4);
        dy = int(r, -4, 4);
        if (difficulty === 1 && (dx < 0 || dy < 0)) continue;
        if (dx !== 0 && dy !== 0 && Math.abs(dx) !== Math.abs(dy) && x + dx >= min && x + dx <= max && y + dy >= min && y + dy <= max) break;
      }
      if (dx === 0 || dy === 0 || Math.abs(dx) === Math.abs(dy) || x + dx < min || x + dx > max || y + dy < min || y + dy > max) {
        dx = x + 2 <= max ? 2 : -2;
        dy = y + 1 <= max ? 1 : -1;
      }
      const move = `${Math.abs(dx)} ${dx > 0 ? "right" : "left"} and ${Math.abs(dy)} ${dy > 0 ? "up" : "down"}`;
      return {
        kind: "choose",
        prompt: `Point **A** moves **${move}**. Where is it now?`,
        visual: { kind: "coords", min, max, points: [{ x, y, label: "A" }] },
        options: unique(pt(x + dx, y + dy), [
          { text: pt(x - dx, y + dy), misconception: M.direction, feedback: "Right adds to x; left takes away from x." },
          { text: pt(x + dx, y - dy), misconception: M.direction, feedback: "Up adds to y; down takes away from y." },
          { text: pt(x + dy, y + dx), misconception: M.swap, feedback: "Left and right change x. Up and down change y." },
          { text: pt(x - dx, y - dy), misconception: M.direction, feedback: "Check which way each move goes." },
        ]),
        answer: 0,
        hint: "Left and right change x. Up and down change y.",
        explanation: `A is at ${pt(x, y)}. x: ${num(x)} ${dx > 0 ? "+" : "−"} ${Math.abs(dx)} = ${num(x + dx)}. y: ${num(y)} ${dy > 0 ? "+" : "−"} ${Math.abs(dy)} = ${num(y + dy)}. So A moves to **${pt(x + dx, y + dy)}**.`,
      };
    },
  },
  /* D-037 (Phase B): two more question makers per skill, one of them a stretch question. */
  {
    key: "co-read-one",
    skill: S.read,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const [x, y] = point(r, difficulty);
      const askX = r() < 0.5;
      return {
        kind: "number",
        prompt: `What is the **${askX ? "x" : "y"}-coordinate** of point A?`,
        visual: { kind: "coords", ...range(difficulty), points: [{ x, y, label: "A" }] },
        answer: askX ? x : y,
        negative: difficulty === 3,
        traps: [{ value: askX ? y : x, misconception: M.swap, feedback: `The ${askX ? "x-coordinate is how far along" : "y-coordinate is how far up"}; you gave the other one.` }],
        hint: askX ? "x is how far along, left or right of zero." : "y is how far up or down from zero.",
        explanation: `A is at ${pt(x, y)}, so its ${askX ? "x" : "y"}-coordinate is **${num(askX ? x : y)}**.`,
      };
    },
  },
  {
    key: "co-read-stretch",
    skill: S.read,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const [x1, y1] = point(r, 2);
      const x2 = x1 + 2 * int(r, 1, 3);
      const y2 = y1 + 2 * int(r, -2, 2);
      const mx = (x1 + x2) / 2;
      const my = (y1 + y2) / 2;
      return {
        kind: "choose",
        prompt: `A is at **${pt(x1, y1)}** and B is at **${pt(x2, y2)}**. What are the coordinates of the point **exactly halfway** between them?`,
        options: unique(pt(mx, my), [
          { text: pt(my, mx), misconception: M.swap, feedback: "Keep x first, then y." },
          { text: pt(x2 - x1, y2 - y1), feedback: "That's how far apart they are. Halfway is the middle of each pair of coordinates." },
          { text: pt(x1 + x2, y1 + y2), feedback: "Add the coordinates, then halve them." },
        ]),
        answer: 0,
        hint: "Find the number halfway between the x-coordinates, then halfway between the y-coordinates.",
        explanation: `Halfway between ${num(x1)} and ${num(x2)} is ${num(mx)}; between ${num(y1)} and ${num(y2)} is ${num(my)}: **${pt(mx, my)}**.`,
      };
    },
  },
  {
    key: "co-plot-axis",
    skill: S.plot,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const onX = r() < 0.5;
      const v = int(r, 1, difficulty === 1 ? 5 : 9) * (difficulty === 3 && r() < 0.5 ? -1 : 1);
      const right = onX ? pt(v, 0) : pt(0, v);
      return {
        kind: "choose",
        prompt: `Which point lies on the **${onX ? "x" : "y"}-axis**?`,
        options: unique(right, [
          { text: onX ? pt(0, v) : pt(v, 0), misconception: M.swap, feedback: `On the ${onX ? "x" : "y"}-axis the ${onX ? "y" : "x"}-coordinate is 0.` },
          { text: pt(v, v), feedback: "This point is not on either axis." },
          { text: pt(v + 1, v === -1 ? 2 : -v || 1), feedback: "Neither coordinate is 0, so it isn't on an axis." },
        ]),
        answer: 0,
        hint: `Every point on the ${onX ? "x" : "y"}-axis has ${onX ? "y" : "x"} = 0.`,
        explanation: `**${right}** has ${onX ? "y" : "x"} = 0, so it is on the ${onX ? "x" : "y"}-axis.`,
      };
    },
  },
  {
    key: "co-plot-stretch",
    skill: S.plot,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const x = int(r, 1, 6);
      const y = int(r, 1, 6);
      const quadrants = [
        { name: "above the x-axis and left of the y-axis", p: pt(-x, y) },
        { name: "below the x-axis and right of the y-axis", p: pt(x, -y) },
        { name: "below the x-axis and left of the y-axis", p: pt(-x, -y) },
      ];
      const q = pick(r, quadrants);
      return {
        kind: "choose",
        prompt: `Which point is **${q.name}**?`,
        options: unique(q.p, [pt(x, y), ...quadrants.filter((z) => z !== q).map((z) => z.p)].map((t) => ({ text: t, misconception: M.sign, feedback: "Left of the y-axis means negative x; below the x-axis means negative y." }))),
        answer: 0,
        hint: "Left of the y-axis: x is negative. Below the x-axis: y is negative.",
        explanation: `**${q.p}** is ${q.name}.`,
      };
    },
  },
  {
    key: "co-shape-side",
    skill: S.shapes,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const x1 = int(r, 0, 3);
      const y1 = int(r, 0, 3);
      const w = int(r, 2, difficulty === 1 ? 4 : 6);
      const h = int(r, 2, difficulty === 1 ? 4 : 6);
      const askW = r() < 0.5;
      return {
        kind: "number",
        prompt: `A rectangle has corners at **${pt(x1, y1)}**, **${pt(x1 + w, y1)}**, **${pt(x1 + w, y1 + h)}** and **${pt(x1, y1 + h)}**. How long is its **${askW ? "bottom side" : "left side"}**, in squares?`,
        visual: { kind: "coords", min: 0, max: 10, join: true, points: [{ x: x1, y: y1 }, { x: x1 + w, y: y1 }, { x: x1 + w, y: y1 + h }, { x: x1, y: y1 + h }] },
        answer: askW ? w : h,
        traps: [{ value: askW ? x1 + w : y1 + h, misconception: M.one, feedback: "Find the difference between the two coordinates, not one of them." }].filter((t) => t.value !== (askW ? w : h)),
        hint: askW ? "Along the bottom, only x changes: find the difference." : "Up the side, only y changes: find the difference.",
        explanation: askW ? `${x1 + w} − ${x1} = **${w}**.` : `${y1 + h} − ${y1} = **${h}**.`,
      };
    },
  },
  {
    key: "co-shapes-stretch",
    skill: S.shapes,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const x1 = -int(r, 1, 4);
      const y1 = -int(r, 1, 4);
      const s = int(r, 3, 6);
      return {
        kind: "choose",
        prompt: `A **square** has corners at **${pt(x1, y1)}**, **${pt(x1 + s, y1)}** and **${pt(x1 + s, y1 + s)}**. Where is the fourth corner?`,
        options: unique(pt(x1, y1 + s), [
          { text: pt(y1 + s, x1), misconception: M.swap, feedback: "Keep x first, then y." },
          { text: pt(x1 + s, y1 + 2 * s), feedback: "The fourth corner is above the first one." },
          { text: pt(x1 - s, y1 + s), misconception: M.direction, feedback: "Count the side length in the right direction." },
        ]),
        answer: 0,
        hint: "The fourth corner is straight above the first corner, level with the third.",
        explanation: `Above ${pt(x1, y1)} and level with ${pt(x1 + s, y1 + s)}: **${pt(x1, y1 + s)}**.`,
      };
    },
  },
  {
    key: "co-translate-which",
    skill: S.translate,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const [x, y] = point(r, Math.min(difficulty, 2));
      const dx = int(r, 1, 3) * (r() < 0.5 ? -1 : 1);
      const dy = int(r, 1, 3) * (r() < 0.5 ? -1 : 1);
      const words = (n: number, pos: string, neg: string) => `${Math.abs(n)} ${n > 0 ? pos : neg}`;
      const right = `${words(dx, "right", "left")} and ${words(dy, "up", "down")}`;
      return {
        kind: "choose",
        prompt: `Point A at **${pt(x, y)}** is translated to **${pt(x + dx, y + dy)}**. Describe the translation.`,
        options: unique(right, [
          { text: `${words(-dx, "right", "left")} and ${words(-dy, "up", "down")}`, misconception: M.direction, feedback: "Start from A and move towards the new point." },
          { text: `${words(dy, "right", "left")} and ${words(dx, "up", "down")}`, misconception: M.swap, feedback: "The change in x is left or right; the change in y is up or down." },
          { text: `${words(dx, "right", "left")} and ${words(-dy, "up", "down")}`, misconception: M.direction, feedback: "Check whether y went up or down." },
        ]),
        answer: 0,
        hint: "Compare the x-coordinates for left/right, then the y-coordinates for up/down.",
        explanation: `x changes by ${dx > 0 ? "+" : ""}${dx} and y by ${dy > 0 ? "+" : ""}${dy}: **${right}**.`,
      };
    },
  },
  {
    key: "co-translate-stretch",
    skill: S.translate,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const x = int(r, -3, 3);
      const y = int(r, -3, 3);
      const a = [int(r, 1, 4), -int(r, 1, 4)];
      const b = [-int(r, 1, 3), int(r, 1, 5)];
      const end = [x + a[0]! + b[0]!, y + a[1]! + b[1]!];
      return {
        kind: "choose",
        prompt: `A point at **${pt(x, y)}** moves **${a[0]} right and ${-a[1]!} down**, then **${-b[0]!} left and ${b[1]} up**. Where does it end?`,
        options: unique(pt(end[0]!, end[1]!), [
          { text: pt(x + a[0]!, y + a[1]!), feedback: "Do both moves." },
          { text: pt(end[1]!, end[0]!), misconception: M.swap, feedback: "Keep x first, then y." },
          { text: pt(x + a[0]! - b[0]!, y + a[1]! - b[1]!), misconception: M.direction, feedback: "Left takes away from x; up adds to y." },
        ]),
        answer: 0,
        hint: "Work out the total change in x, then the total change in y.",
        explanation: `x: ${num(x)} + ${a[0]} − ${-b[0]!} = ${num(end[0]!)}; y: ${num(y)} − ${-a[1]!} + ${b[1]} = ${num(end[1]!)}. It ends at **${pt(end[0]!, end[1]!)}**.`,
      };
    },
  },
];

const templates = withHints(baseTemplates, {
  "co-read": () => ["Go along first: that's the x-coordinate.", "Then go up or down: that's the y-coordinate. Write (x, y)."],
  "co-plot": () => ["Start at (0, 0). Move along by the first number.", "Then move up or down by the second number."],
  "co-shape": () => ["Corners above each other share an x-coordinate.", "Corners level with each other share a y-coordinate."],
  "co-translate": () => ["Right or left changes x; up or down changes y.", "Add for right and up; take away for left and down."],
  "co-read-one": () => ["x is the first number: along.", "y is the second number: up or down."],
  "co-read-stretch": () => ["Work on x and y separately.", "The halfway number is the two numbers added, then halved."],
  "co-plot-axis": () => ["On the x-axis, y is 0. On the y-axis, x is 0.", "Look for the point with a 0 in the right place."],
  "co-plot-stretch": () => ["Negative x is left of the y-axis; negative y is below the x-axis.", "Check the signs of both numbers."],
  "co-shape-side": () => ["Along a side, only one coordinate changes.", "Subtract the smaller from the larger."],
  "co-shapes-stretch": () => ["A square's sides are all the same length.", "The missing corner shares its x with one corner and its y with another."],
  "co-translate-which": () => ["New x − old x tells you right (+) or left (−).", "New y − old y tells you up (+) or down (−)."],
  "co-translate-stretch": () => ["Add up the right/left moves for x.", "Add up the up/down moves for y."],
});

export const coordinates = defineTopic({
  id: T,
  title: "Coordinates",
  subtitle: "Read and plot points, find missing corners, translate shapes and use all four quadrants",
  world: "shape",
  years: [4, 5, 6],
  order: 2,
  icon: "compass",
  skills: [
    { id: S.read, title: "Reading coordinates", description: "Read the coordinates of a point: x first, then y.", lessonId: "read" },
    { id: S.plot, title: "Plotting points", description: "Find where a point goes on a grid.", lessonId: "plot" },
    { id: S.shapes, title: "Shapes on a grid", description: "Find the missing corner of a rectangle or square.", lessonId: "shapes" },
    { id: S.translate, title: "Translations", description: "Move a point left, right, up and down.", lessonId: "translate" },
  ],
  lessonIcons: { read: "map", plot: "target", shapes: "shapes", translate: "rocket" },
  lessons: [
    {
      id: "read",
      title: "Reading coordinates",
      phase: "Understand",
      summary: "Along the corridor, then up the stairs.",
      minutes: 7,
      objectives: ["Read coordinates in the first quadrant", "Read coordinates with negative numbers"],
      steps: [
        {
          type: "explain",
          title: "Across, then up",
          body: ["Every point has two numbers: **(x, y)**. Go **along** the x-axis first, then **up** the y-axis.", "Point A is 4 along and 3 up, so A is at **(4, 3)**."],
          visual: { kind: "coords", min: 0, max: 6, points: [{ x: 4, y: 3, label: "A" }] },
          tip: "Along the corridor, then up the stairs!",
        },
        {
          type: "explain",
          title: "Below and left of zero",
          body: ["The axes carry on past zero. Left of zero, x is **negative**. Below zero, y is **negative**.", "Point B is 3 left and 2 down: **(−3, −2)**."],
          visual: { kind: "coords", min: -5, max: 5, points: [{ x: -3, y: -2, label: "B" }] },
        },
        {
          type: "worked",
          title: "Watch me: read point C",
          support: "full",
          problem: "What are the coordinates of point C?",
          visual: { kind: "coords", min: 0, max: 6, points: [{ x: 2, y: 5, label: "C" }] },
          steps: [{ text: "Start at (0, 0). Go **along** until you are under C: **2**." }, { text: "Now go **up** to C: **5**." }],
          conclusion: "C is at **(2, 5)**: along first, then up.",
        },
        {
          type: "worked",
          title: "Together: point D",
          support: "faded",
          problem: "Point D is at **(6, 1)**. How far **along** is it?",
          visual: { kind: "coords", min: 0, max: 6, points: [{ x: 6, y: 1, label: "D" }] },
          steps: [{ text: "The first number is how far along.", blank: { prompt: "How far along?", answer: 6, hint: "The x-coordinate", traps: [{ value: 1, misconception: M.swap, feedback: "1 is how far up. The first number, 6, is how far along." }], worked: "**6** along, then 1 up." } }],
          conclusion: "D is **6 along** and 1 up.",
        },
        { type: "check", title: "Your turn", questionId: gen("co-read", 1, 2) },
        { type: "check", title: "One more", questionId: gen("co-read", 3, 7) },
      ],
    },
    {
      id: "plot",
      title: "Plotting points",
      phase: "Visualise",
      summary: "Start at zero, go along, then up.",
      minutes: 6,
      objectives: ["Find the point with given coordinates"],
      steps: [
        {
          type: "explain",
          title: "Along the corridor, up the stairs",
          body: ["To plot a point, start at the origin, (0, 0). Move **along** the x-axis by the first number, then **up** by the second.", "A saying to remember: along the corridor, then up the stairs. Swapping the numbers puts the point somewhere else: (2, 5) and (5, 2) are different points."],
          visual: { kind: "coords", min: 0, max: 6, points: [{ x: 2, y: 5, label: "(2, 5)" }, { x: 5, y: 2, label: "(5, 2)" }] },
        },
        {
          type: "worked",
          title: "Watch me find (2, 5)",
          support: "full",
          problem: "Which point is at **(2, 5)**?",
          visual: { kind: "coords", min: 0, max: 6, points: [{ x: 5, y: 2, label: "P" }, { x: 2, y: 5, label: "Q" }] },
          steps: [{ text: "Start at (0, 0)." }, { text: "Go **2 along** the x-axis." }, { text: "Then go **5 up**." }],
          conclusion: "(2, 5) is point **Q**. P is at (5, 2): the numbers swapped round!",
        },
        {
          type: "worked",
          title: "Together: plot (3, 4)",
          support: "faded",
          problem: "Plot **(3, 4)**.",
          visual: { kind: "coords", min: 0, max: 6, points: [{ x: 3, y: 4, label: "E" }] },
          steps: [{ text: "Go 3 along.", blank: { prompt: "How far up?", answer: 4, hint: "The second number", traps: [{ value: 3, misconception: M.swap, feedback: "3 was how far along. The second number tells you how far up." }], worked: "**4** up." } }],
          conclusion: "(3, 4) is **3 along and 4 up**.",
        },
        { type: "check", title: "Your turn", questionId: gen("co-plot", 1, 4) },
        { type: "check", title: "One more", questionId: gen("co-plot", 2, 8) },
      ],
    },
    {
      id: "shapes",
      title: "Shapes on a grid",
      phase: "Practise",
      summary: "Corners of a rectangle share their x or y.",
      minutes: 7,
      objectives: ["Find the missing corner of a rectangle or square"],
      steps: [
        {
          type: "explain",
          title: "Lined up corners",
          body: ["In a rectangle, corners **above each other** have the same x. Corners **level with each other** have the same y.", "A (1, 1), B (5, 1), C (5, 4): so D is above A and level with C: **(1, 4)**."],
          visual: { kind: "coords", min: 0, max: 6, join: true, points: [{ x: 1, y: 1, label: "A" }, { x: 5, y: 1, label: "B" }, { x: 5, y: 4, label: "C" }, { x: 1, y: 4, label: "D" }] },
        },
        {
          type: "worked",
          title: "Watch me: the fourth corner of a square",
          support: "full",
          problem: "A square has corners **(2, 1)**, **(5, 1)** and **(5, 4)**. Where is the fourth?",
          visual: { kind: "coords", min: 0, max: 6, join: true, points: [{ x: 2, y: 1, label: "A" }, { x: 5, y: 1, label: "B" }, { x: 5, y: 4, label: "C" }, { x: 2, y: 4, label: "D" }] },
          steps: [{ text: "D is above A, so it has A's x: **2**." }, { text: "D is level with C, so it has C's y: **4**." }],
          conclusion: "The fourth corner is **(2, 4)**.",
        },
        {
          type: "worked",
          title: "Together: a side length",
          support: "faded",
          problem: "A rectangle has corners at **(1, 2)** and **(6, 2)** along its bottom. How long is the bottom side?",
          steps: [{ text: "Only x changes along the bottom.", blank: { prompt: "6 − 1 = ?", answer: 5, hint: "Difference of the x-coordinates", traps: [{ value: 6, misconception: M.one, feedback: "6 is the x-coordinate, not the length. Find the difference: 6 − 1." }], worked: "**5** squares." } }],
          conclusion: "The bottom side is **5** squares long.",
        },
        { type: "check", title: "Your turn", questionId: gen("co-shape", 1, 3) },
        { type: "check", title: "One more", questionId: gen("co-shape", 2, 6) },
      ],
    },
    {
      id: "translate",
      title: "Translations",
      phase: "Apply",
      summary: "Right and left change x; up and down change y.",
      minutes: 7,
      objectives: ["Translate a point on a grid"],
      steps: [
        {
          type: "explain",
          title: "Sliding a point",
          body: ["A **translation** slides a point without turning it.", "**Right** adds to x, **left** takes away. **Up** adds to y, **down** takes away.", "A (2, 1) moves 3 right and 2 up: (2 + 3, 1 + 2) = **(5, 3)**."],
          visual: { kind: "coords", min: 0, max: 6, points: [{ x: 2, y: 1, label: "A" }, { x: 5, y: 3, label: "A′" }] },
        },
        {
          type: "worked",
          title: "Watch me: 4 left and 1 up",
          support: "full",
          problem: "Translate **(5, 2)** 4 left and 1 up.",
          visual: { kind: "coords", min: 0, max: 6, points: [{ x: 5, y: 2, label: "A" }, { x: 1, y: 3, label: "A′" }] },
          steps: [{ text: "Left takes away from x: 5 − 4 = **1**." }, { text: "Up adds to y: 2 + 1 = **3**." }],
          conclusion: "The new point is **(1, 3)**.",
        },
        {
          type: "worked",
          title: "Together: 2 right and 3 down",
          support: "faded",
          problem: "Translate **(1, 5)** 2 right and 3 down.",
          steps: [{ text: "Right adds to x: 1 + 2 = **3**." }, { text: "Down takes away from y.", blank: { prompt: "5 − 3 = ?", answer: 2, hint: "Down means take away.", traps: [{ value: 8, misconception: M.direction, feedback: "Down takes away from y, it doesn't add." }], worked: "**2**." } }],
          conclusion: "The new point is **(3, 2)**.",
        },
        { type: "check", title: "Your turn", questionId: gen("co-translate", 1, 2) },
        { type: "check", title: "One more", questionId: gen("co-translate", 3, 5) },
      ],
    },
  ],
  templates,
  misconceptions: [
    { id: M.swap, name: "x and y swapped", possibleCause: "It looks like the two numbers were swapped round.", description: "Reads (4, 3) as (3, 4).", explanation: ["x comes first: along the corridor.", "y comes second: up the stairs."], skills: [S.read, S.plot, S.shapes, S.translate], followUpTemplates: ["co-read", "co-plot"] },
    { id: M.sign, name: "Missing a negative sign", possibleCause: "It looks like a negative sign was missed.", description: "Reads (−3, 2) as (3, 2).", explanation: ["Left of zero, x is negative.", "Below zero, y is negative."], skills: [S.read, S.plot], followUpTemplates: ["co-read"] },
    { id: M.direction, name: "Moving the wrong way", possibleCause: "It looks like a move went the wrong way.", description: "Moves left when asked to move right.", explanation: ["Right: add to x. Left: take away from x.", "Up: add to y. Down: take away from y."], skills: [S.translate], followUpTemplates: ["co-translate"] },
    { id: M.one, name: "Counting squares, not lines", possibleCause: "It looks like the count was one out.", description: "Counts squares instead of grid lines, starting at 1.", explanation: ["Coordinates sit where lines cross.", "Count the lines from 0."], skills: [S.read, S.plot, S.shapes], followUpTemplates: ["co-read", "co-plot"] },
  ],
  placement: [
    { lessonId: "read", template: "co-read" },
    { lessonId: "plot", template: "co-plot" },
    { lessonId: "shapes", template: "co-shape" },
    { lessonId: "translate", template: "co-translate" },
  ],
});
