import { genFor, int, pick, withAnswer, type TopicExtra } from "@/topics/kit/define";
import type { ChooseOption, Rng, ShapeName, Template } from "@/topics/kit/types";

/**
 * D-038: horizontal, vertical, parallel and perpendicular lines (Y3.GPS.4), and checking shapes drawn to given sizes and
 * angles (Y6.GPS.1, recognition only by the Product Owner's choice: the child checks and reasons about drawings but
 * does not draw).
 */

const T = "shapes-angles";
const gen = genFor(T);
const S = { lines: `${T}.lines`, construct: `${T}.construct` };
const M = { mixup: `${T}.parallel-perpendicular`, oneCheck: `${T}.construct-one-check` };

type Dir = "horizontal" | "vertical" | "down" | "up";
/** A line in one of four 4-by-3 boxes on the 8-by-6 grid, so lines never cross or touch. */
function segment(dir: Dir, box: number): { from: [number, number]; to: [number, number] } {
  const [bx, by] = [(box % 2) * 4, Math.floor(box / 2) * 3];
  if (dir === "horizontal") return { from: [bx + 0.5, by + 1.5], to: [bx + 3.5, by + 1.5] };
  if (dir === "vertical") return { from: [bx + 2, by + 0.25], to: [bx + 2, by + 2.75] };
  if (dir === "down") return { from: [bx + 0.75, by + 0.25], to: [bx + 3.25, by + 2.75] };
  return { from: [bx + 0.75, by + 2.75], to: [bx + 3.25, by + 0.25] };
}
const PERP: Record<Dir, Dir> = { horizontal: "vertical", vertical: "horizontal", down: "up", up: "down" };
const OTHER: Record<Dir, Dir> = { horizontal: "down", vertical: "up", down: "horizontal", up: "vertical" };
const LETTERS = ["A", "B", "C", "D"];

function shuffle<X>(r: Rng, xs: X[]): X[] {
  return xs.map((x) => ({ x, k: r() })).sort((a, b) => a.k - b.k).map((p) => p.x);
}

/** Pairs of parallel sides in each shape as the kit draws it (regular hexagon and octagon). */
const PARALLEL: [ShapeName, string, number][] = [
  ["square", "square", 2],
  ["rectangle", "rectangle", 2],
  ["parallelogram", "parallelogram", 2],
  ["rhombus", "rhombus", 2],
  ["trapezium", "trapezium", 1],
  ["kite", "kite", 0],
  ["hexagon", "regular hexagon", 3],
  ["octagon", "regular octagon", 4],
];
const SIDES: Partial<Record<ShapeName, number>> = { square: 4, rectangle: 4, parallelogram: 4, rhombus: 4, trapezium: 4, kite: 4, hexagon: 6, octagon: 8 };

const templates: Template[] = [
  {
    key: "sa-lines-pair",
    skill: S.lines,
    difficulties: [1, 2],
    make: (r, { difficulty }) => {
      const ask = difficulty === 1 ? "parallel" : pick(r, ["parallel", "perpendicular"] as const);
      const dir = pick(r, ["horizontal", "vertical", "down", "up"] as Dir[]);
      const dirs: Dir[] = [dir, dir, PERP[dir], OTHER[dir]];
      const boxes = shuffle(r, [0, 1, 2, 3]);
      const segments = dirs.map((d, i) => ({ ...segment(d, boxes[i]), label: LETTERS[i] }));
      const right = ask === "parallel" ? "B" : "C";
      const wrong: ChooseOption[] = ["B", "C", "D"].filter((x) => x !== right).map((x) => ({ text: `Line ${x}`, ...(x === "B" || x === "C" ? { misconception: M.mixup } : {}), feedback: x === "B" ? "Line B goes the same way as A: that makes them parallel." : x === "C" ? "Line C meets A's direction at a right angle: that makes them perpendicular." : "Line D is neither: it isn't the same way as A and doesn't make a right angle with it." }));
      const { options, answer } = withAnswer(r, { text: `Line ${right}` } as ChooseOption, wrong);
      return {
        kind: "choose",
        prompt: `Which line is **${ask}** to line A?`,
        visual: { kind: "lines", segments },
        options,
        answer,
        hint: ask === "parallel" ? "Parallel lines go the same way and never meet." : "Perpendicular lines meet at a right angle.",
        hints: ["Follow the grid squares: count across and down along each line.", ask === "parallel" ? "Find the line that slopes exactly like A." : "Imagine sliding a line until it meets A: is the corner square?"],
        explanation: ask === "parallel" ? "Line **B** goes in exactly the same direction as A, so they would never meet: they are parallel." : "Line **C** would meet A at a right angle: they are perpendicular.",
      };
    },
  },
  {
    key: "sa-lines-hv",
    skill: S.lines,
    difficulties: [1],
    make: (r) => {
      const ask = pick(r, ["horizontal", "vertical"] as const);
      const dirs = shuffle(r, ["horizontal", "vertical", "down", "up"] as Dir[]);
      const segments = dirs.map((d, i) => ({ ...segment(d, i), label: LETTERS[i] }));
      const right = LETTERS[dirs.indexOf(ask)];
      const other = ask === "horizontal" ? "vertical" : "horizontal";
      const wrong: ChooseOption[] = LETTERS.filter((x) => x !== right).map((x) => ({ text: `Line ${x}`, feedback: dirs[LETTERS.indexOf(x)] === other ? `Line ${x} is ${other}: it goes straight ${other === "vertical" ? "up and down" : "across"}.` : `Line ${x} slopes, so it is neither horizontal nor vertical.` }));
      const { options, answer } = withAnswer(r, { text: `Line ${right}` } as ChooseOption, wrong);
      return {
        kind: "choose",
        prompt: `Which line is **${ask}**?`,
        visual: { kind: "lines", segments },
        options,
        answer,
        hint: "Horizontal goes straight across, like the horizon. Vertical goes straight up and down.",
        hints: ["A sloping line is neither.", `Look for the line that runs exactly along the grid ${ask === "horizontal" ? "from side to side" : "from top to bottom"}.`],
        explanation: `Line **${right}** runs straight ${ask === "horizontal" ? "across" : "up and down"}, so it is ${ask}.`,
      };
    },
  },
  {
    key: "sa-lines-stretch",
    skill: S.lines,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const [shape, name, pairs] = pick(r, PARALLEL);
      return {
        kind: "number",
        prompt: `How many **pairs of parallel sides** does this **${name}** have?`,
        visual: { kind: "shape", name: shape },
        answer: pairs,
        traps: [{ value: SIDES[shape]!, misconception: M.mixup, feedback: "Count pairs of sides that go the same way, not the sides themselves." }].filter((t) => t.value !== pairs),
        hint: "Parallel sides go the same way and never meet, however far you extend them.",
        hints: ["Look at the opposite sides: do they go the same way?", "Count each matching pair once."],
        explanation: `A ${name} has **${pairs}** pair${pairs === 1 ? "" : "s"} of parallel sides.`,
      };
    },
  },
  {
    key: "sa-construct-check",
    skill: S.construct,
    difficulties: [1, 2],
    make: (r, { difficulty }) => {
      const a = int(r, 4, 8);
      const b = int(r, 4, 8);
      const angle = pick(r, [30, 40, 50, 60, 70, 80, 100, 110]);
      const fault = pick(r, ["none", "angle", "side"] as const);
      const drawn = { a: fault === "side" ? a + (difficulty === 1 ? 2 : 1) : a, b, angle: fault === "angle" ? angle + (difficulty === 1 ? 30 : 10) : angle };
      const choices: ChooseOption[] = [
        { text: "Yes, it matches", ...(fault === "none" ? {} : { misconception: M.oneCheck, feedback: `Check all three: the drawing shows ${drawn.a} cm, ${drawn.b} cm and ${drawn.angle}°.` }) },
        { text: "No: an angle is wrong", ...(fault === "angle" ? {} : { feedback: `The angle is ${drawn.angle}°, as asked.` }) },
        { text: "No: a side is wrong", ...(fault === "side" ? {} : { feedback: `The sides are ${drawn.a} cm and ${drawn.b} cm, as asked.` }) },
      ];
      return {
        kind: "choose",
        prompt: `Sam was asked to draw a triangle with sides of **${a} cm** and **${b} cm** and an angle of **${angle}°** between them. Does Sam's drawing match?`,
        visual: { kind: "drawn-triangle", a: drawn.a, b: drawn.b, angle: drawn.angle },
        options: choices,
        answer: fault === "none" ? 0 : fault === "angle" ? 1 : 2,
        fixedOrder: true,
        hint: "Check all three: both sides and the angle between them.",
        hints: [`Asked for: ${a} cm, ${b} cm and ${angle}°.`, `The drawing is labelled ${drawn.a} cm, ${drawn.b} cm and ${drawn.angle}°.`],
        explanation: fault === "none" ? "Both sides and the angle match: **yes, it matches**." : fault === "angle" ? `The angle is ${drawn.angle}°, not ${angle}°: **an angle is wrong**.` : `One side is ${drawn.a} cm, not ${a} cm: **a side is wrong**.`,
      };
    },
  },
  {
    key: "sa-construct-angle",
    skill: S.construct,
    difficulties: [2],
    make: (r) => {
      const x = 5 * int(r, 6, 16);
      const y = 5 * int(r, 6, Math.min(20, (175 - x) / 5 - 1));
      const z = 180 - x - y;
      return {
        kind: "number",
        prompt: `Priya draws a triangle on a **7 cm** base, with angles of **${x}°** and **${y}°** at its ends. What will the **third angle** measure?`,
        visual: { kind: "triangle", angles: [x, y, z], labels: [`${x}°`, `${y}°`, "?"] },
        answer: z,
        unit: "°",
        traps: [{ value: 360 - x - y, feedback: "The angles in a triangle add up to 180°, not 360°." }, { value: x + y, feedback: "Take the two angles away from 180°." }].filter((t) => t.value !== z),
        hint: "The angles in a triangle add up to 180°.",
        hints: [`${x}° + ${y}° = ${x + y}°.`, `180° − ${x + y}°.`],
        explanation: `${x}° + ${y}° = ${x + y}°, and 180° − ${x + y}° = **${z}°**. Measuring the drawing with a protractor should give the same.`,
      };
    },
  },
  {
    key: "sa-construct-stretch",
    skill: S.construct,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const side = int(r, 4, 8);
      const top = pick(r, [20, 40, 50, 60, 80, 100]);
      const each = (180 - top) / 2;
      return {
        kind: "number",
        prompt: `A triangle is drawn with two sides of **${side} cm** and an angle of **${top}°** between them. What size is **each of the other two angles**?`,
        visual: { kind: "drawn-triangle", a: side, b: side, angle: top },
        answer: each,
        unit: "°",
        traps: [{ value: 180 - top, feedback: "That is both angles together. The two sides are equal, so the two angles are equal: halve it." }],
        hint: "Two equal sides make an isosceles triangle: the other two angles are equal.",
        hints: [`Together they make 180° − ${top}° = ${180 - top}°.`, `Halve it: ${180 - top}° ÷ 2.`],
        explanation: `180° − ${top}° = ${180 - top}° for the other two angles. They are equal, so each is **${each}°**.`,
      };
    },
  },
];

export const linesAndConstruction: TopicExtra = {
  skills: [
    { id: S.lines, title: "Lines", description: "Spot horizontal and vertical lines, and parallel and perpendicular pairs.", lessonId: "lines" },
    { id: S.construct, title: "Drawing to size", description: "Check shapes drawn from given sides and angles, and work out what the drawing will show.", lessonId: "construct" },
  ],
  lessonIcons: { lines: "ruler", construct: "compass" },
  lessons: [
    {
      id: "lines",
      title: "Parallel and perpendicular",
      phase: "Understand",
      summary: "Parallel lines never meet; perpendicular lines meet at a right angle.",
      minutes: 7,
      objectives: ["Spot horizontal and vertical lines", "Find parallel and perpendicular pairs"],
      steps: [
        {
          type: "explain",
          title: "Same way, or square corner",
          body: [
            "A **horizontal** line goes straight across, like the horizon. A **vertical** line goes straight up and down. **Parallel** lines go the same way and never meet, like railway tracks: here, lines A and B are parallel.",
            "**Perpendicular** lines meet, or would meet if you made them longer, at a **right angle**: lines A and C are perpendicular. Line D is neither. The two long edges of a window are parallel, and a window's top edge is perpendicular to its sides.",
          ],
          visual: { kind: "lines", segments: [{ ...segment("horizontal", 0), label: "A" }, { ...segment("horizontal", 3), label: "B" }, { ...segment("vertical", 1), label: "C" }, { ...segment("down", 2), label: "D" }] },
          tip: "Parallel: same way. Perpendicular: a square corner.",
        },
        {
          type: "worked",
          title: "Watch me: parallel sides of a rectangle",
          support: "full",
          problem: "How many pairs of parallel sides does a **rectangle** have?",
          visual: { kind: "shape", name: "rectangle" },
          steps: [{ text: "The top and bottom go the same way: one pair." }, { text: "The two ends go the same way: a second pair." }],
          conclusion: "A rectangle has **2** pairs of parallel sides.",
        },
        {
          type: "worked",
          title: "Let's do it together",
          support: "faded",
          problem: "How many pairs of parallel sides does a **trapezium** have?",
          visual: { kind: "shape", name: "trapezium" },
          steps: [{ text: "The top and bottom go the same way. The slanted sides lean different ways.", blank: { prompt: "How many pairs?", answer: 1, hint: "Only the top and bottom.", traps: [{ value: 4, misconception: M.mixup, feedback: "Count pairs of sides that go the same way, not the sides themselves." }], worked: "**1** pair." } }],
          conclusion: "A trapezium has **1** pair of parallel sides.",
        },
        { type: "check", title: "Your turn", questionId: gen("sa-lines-hv", 1, 3) },
        { type: "check", title: "One more", questionId: gen("sa-lines-pair", 1, 5) },
      ],
    },
    {
      id: "construct",
      title: "Drawing to size",
      phase: "Apply",
      summary: "Check every side and angle against what was asked.",
      minutes: 8,
      objectives: ["Check a triangle drawn from two sides and the angle between them", "Work out the angles a drawing will show"],
      steps: [
        {
          type: "explain",
          title: "Ruler, then protractor",
          body: [
            "To draw a triangle with sides of **5 cm** and **6 cm** and an angle of **40°** between them: draw the 5 cm line with a ruler, put the protractor's centre on one end and mark 40°, then draw the 6 cm line through that mark. Join the ends to finish the triangle.",
            "Kite Maths can't check your drawing on screen, so here you check drawings and work out what they must show. Check **all three** measurements: a drawing with the right sides but the wrong angle is a different triangle. The angles of any triangle still add up to 180°.",
          ],
          visual: { kind: "drawn-triangle", a: 5, b: 6, angle: 40 },
          tip: "Measure the angle from the line you drew first.",
        },
        {
          type: "worked",
          title: "Watch me: check a drawing",
          support: "full",
          problem: "Asked for: sides **6 cm** and **4 cm** with **60°** between them. The drawing shows 6 cm, 4 cm and 70°. Does it match?",
          visual: { kind: "drawn-triangle", a: 6, b: 4, angle: 70 },
          steps: [{ text: "Sides: 6 cm and 4 cm, as asked." }, { text: "Angle: 70°, but 60° was asked for." }],
          conclusion: "It **doesn't match**: the angle is wrong.",
        },
        {
          type: "worked",
          title: "Let's do it together",
          support: "faded",
          problem: "A triangle is drawn with angles of **50°** and **60°** at the ends of its base. What will the third angle measure?",
          visual: { kind: "triangle", angles: [50, 60, 70], labels: ["50°", "60°", "?"] },
          steps: [{ text: "The angles add up to 180°. 50° + 60° = 110°.", blank: { prompt: "Third angle in degrees?", answer: 70, hint: "180 − 110.", traps: [{ value: 250, feedback: "Triangles have 180°, not 360°: 180 − 110." }], worked: "180° − 110° = **70**°." } }],
          conclusion: "The third angle is **70°**.",
        },
        { type: "check", title: "Your turn", questionId: gen("sa-construct-check", 1, 3) },
        { type: "check", title: "One more", questionId: gen("sa-construct-angle", 2, 5) },
      ],
    },
  ],
  templates,
  misconceptions: [
    {
      id: M.mixup,
      name: "Parallel and perpendicular mixed up",
      possibleCause: "You might have mixed up parallel (same way) and perpendicular (a right angle).",
      description: "Calls perpendicular lines parallel, or the reverse, or counts sides instead of parallel pairs.",
      explanation: ["Parallel lines go the same way and never meet.", "Perpendicular lines meet at a right angle."],
      skills: [S.lines],
      followUpTemplates: ["sa-lines-pair"],
    },
    {
      id: M.oneCheck,
      name: "Only part of the drawing checked",
      possibleCause: "You might have checked the sides but not the angle, or the reverse.",
      description: "Accepts a drawing as matching after checking only some of the given measurements.",
      explanation: ["A triangle from two sides and an angle needs all three to match.", "Check each side with a ruler and the angle with a protractor."],
      skills: [S.construct],
      followUpTemplates: ["sa-construct-check"],
    },
  ],
  placement: [
    { lessonId: "lines", template: "sa-lines-hv" },
    { lessonId: "construct", template: "sa-construct-check" },
  ],
};
