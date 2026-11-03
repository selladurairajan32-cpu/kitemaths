import { defineTopic, genFor, int } from "@/topics/kit/define";
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

const templates: Template[] = [
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
];

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
          type: "worked",
          title: "Watch me find (2, 5)",
          support: "full",
          problem: "Which point is at **(2, 5)**?",
          visual: { kind: "coords", min: 0, max: 6, points: [{ x: 5, y: 2, label: "P" }, { x: 2, y: 5, label: "Q" }] },
          steps: [{ text: "Start at (0, 0)." }, { text: "Go **2 along** the x-axis." }, { text: "Then go **5 up**." }],
          conclusion: "(2, 5) is point **Q**. P is at (5, 2): the numbers swapped round!",
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
