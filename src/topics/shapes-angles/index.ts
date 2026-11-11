import { defineTopic, genFor, int, pick, withExtras, withHints } from "@/topics/kit/define";
import { shapesAnglesExtra } from "./extra";
import type { ChooseOption, ShapeName, Template } from "@/topics/kit/types";

/** Shapes and angles: naming 2D and 3D shapes, types of angle, turns and degrees, and angle facts. */

const T = "shapes-angles";
const gen = genFor(T);
const S = { shapes: `${T}.shapes`, types: `${T}.angle-types`, turns: `${T}.turns`, facts: `${T}.angle-facts` };
const M = { names: `${T}.shape-names`, parts: `${T}.faces-edges-vertices`, size: `${T}.angle-sizes`, direction: `${T}.clockwise`, total: `${T}.angle-total` };

function unique(right: string, wrong: ChooseOption[]): ChooseOption[] {
  const out: ChooseOption[] = [{ text: right }];
  for (const w of wrong) if (!out.some((o) => o.text === w.text)) out.push(w);
  return out.slice(0, 4);
}

const NAME: Record<ShapeName, string> = {
  square: "Square",
  rectangle: "Rectangle",
  equilateral: "Equilateral triangle",
  "right-triangle": "Right-angled triangle",
  isosceles: "Isosceles triangle",
  scalene: "Scalene triangle",
  rhombus: "Rhombus",
  parallelogram: "Parallelogram",
  trapezium: "Trapezium",
  kite: "Kite",
  pentagon: "Pentagon",
  hexagon: "Hexagon",
  octagon: "Octagon",
  circle: "Circle",
};
const WHY: Partial<Record<ShapeName, string>> = {
  square: "4 equal sides and 4 right angles.",
  rectangle: "4 right angles, with opposite sides equal.",
  rhombus: "4 equal sides, but no right angles.",
  parallelogram: "2 pairs of parallel sides, with no right angles.",
  trapezium: "exactly 1 pair of parallel sides.",
  kite: "2 pairs of equal sides next to each other.",
  pentagon: "5 sides.",
  hexagon: "6 sides.",
  octagon: "8 sides.",
  equilateral: "3 equal sides and 3 equal angles.",
  isosceles: "2 equal sides and 2 equal angles.",
  scalene: "no equal sides.",
  "right-triangle": "one right angle.",
};
/** Shapes that are easy to mix up with each one (never names that are also true of it). */
const LOOKALIKE: Record<ShapeName, ShapeName[]> = {
  square: ["rectangle", "rhombus", "kite"],
  rectangle: ["square", "parallelogram", "trapezium"],
  rhombus: ["square", "kite", "parallelogram"],
  parallelogram: ["rhombus", "trapezium", "rectangle"],
  trapezium: ["parallelogram", "kite", "rhombus"],
  kite: ["rhombus", "trapezium", "parallelogram"],
  pentagon: ["hexagon", "octagon", "square"],
  hexagon: ["pentagon", "octagon", "circle"],
  octagon: ["hexagon", "pentagon", "circle"],
  circle: ["octagon", "hexagon", "pentagon"],
  equilateral: ["isosceles", "scalene", "right-triangle"],
  isosceles: ["equilateral", "scalene", "right-triangle"],
  scalene: ["isosceles", "equilateral", "right-triangle"],
  "right-triangle": ["equilateral", "isosceles"],
};

const SOLIDS = [
  { name: "cube", faces: 6, edges: 12, vertices: 8 },
  { name: "cuboid", faces: 6, edges: 12, vertices: 8 },
  { name: "square-based pyramid", faces: 5, edges: 8, vertices: 5 },
  { name: "triangular prism", faces: 5, edges: 9, vertices: 6 },
  { name: "tetrahedron (triangle-based pyramid)", faces: 4, edges: 6, vertices: 4 },
  { name: "hexagonal prism", faces: 8, edges: 18, vertices: 12 },
] as const;

/** "A" or "An", to go before a word. */
const article = (word: string) => (/^[aeiou]/i.test(word) ? "An" : "A");
const typeOf = (d: number) => (d < 90 ? "Acute" : d === 90 ? "Right angle" : d < 180 ? "Obtuse" : "Reflex");
const TYPE_RULE = "Acute: less than 90°. Right angle: exactly 90°. Obtuse: between 90° and 180°. Reflex: more than 180°.";

const baseTemplates: Template[] = [
  {
    key: "sa-name",
    skill: S.shapes,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const name = pick<ShapeName>(r, difficulty === 1 ? ["square", "rectangle", "circle", "pentagon", "hexagon", "octagon"] : difficulty === 2 ? ["rhombus", "parallelogram", "trapezium", "kite", "octagon", "pentagon"] : ["equilateral", "isosceles", "scalene", "right-triangle"]);
      return {
        kind: "choose",
        prompt: difficulty === 3 ? "What type of triangle is this?" : "What is this shape called?",
        visual: { kind: "shape", name },
        options: unique(
          NAME[name],
          LOOKALIKE[name].map((w) => ({ text: NAME[w], misconception: M.names, feedback: `${article(NAME[w])} ${NAME[w].toLowerCase()} has ${WHY[w] ?? "no corners at all."}` })),
        ),
        answer: 0,
        hint: difficulty === 1 ? "Count the sides and look for right angles." : "Look for equal sides, right angles and parallel sides.",
        explanation: `It's a **${NAME[name].toLowerCase()}**${WHY[name] ? `: ${WHY[name]}` : ": one curved edge and no corners."}`,
      };
    },
  },
  {
    key: "sa-props",
    skill: S.shapes,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      if (difficulty < 3) {
        const flat: [string, number][] = difficulty === 1 ? [["triangle", 3], ["square", 4], ["pentagon", 5], ["hexagon", 6]] : [["octagon", 8], ["hexagon", 6], ["pentagon", 5], ["heptagon", 7], ["decagon", 10]];
        const [name, sides] = pick(r, flat);
        const ask = pick(r, ["sides", "vertices (corners)"]);
        return {
          kind: "number",
          prompt: `How many **${ask}** does ${article(name).toLowerCase()} **${name}** have?`,
          answer: sides,
          traps: [{ value: sides + 1, misconception: M.names, feedback: `${name.charAt(0).toUpperCase() + name.slice(1)}: ${sides} sides and ${sides} vertices.` }, { value: sides - 1, misconception: M.names, feedback: `${name.charAt(0).toUpperCase() + name.slice(1)}: ${sides} sides and ${sides} vertices.` }],
          hint: "Penta = 5, hexa = 6, hepta = 7, octa = 8, deca = 10. A flat shape has as many corners as sides.",
          explanation: `A ${name} has **${sides}** sides and ${sides} vertices.`,
        };
      }
      const solid = pick(r, SOLIDS);
      const ask = pick(r, ["faces", "edges", "vertices"] as const);
      const others = (["faces", "edges", "vertices"] as const).filter((k) => k !== ask);
      return {
        kind: "number",
        prompt: `How many **${ask}** does ${article(solid.name).toLowerCase()} **${solid.name}** have?`,
        answer: solid[ask],
        traps: others.map((k) => ({ value: solid[k], misconception: M.parts, feedback: `${solid[k]} is the number of ${k}. Faces are flat sides, edges are where faces meet, vertices are corners.` })).filter((t) => t.value !== solid[ask]),
        hint: "Faces are the flat surfaces. Edges are where two faces meet. Vertices are the corners.",
        explanation: `A ${solid.name} has ${solid.faces} faces, ${solid.edges} edges and ${solid.vertices} vertices: **${solid[ask]} ${ask}**.`,
      };
    },
  },
  {
    key: "sa-type",
    skill: S.types,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      if (difficulty === 3) {
        const want = pick(r, ["acute", "obtuse", "reflex"] as const);
        const pool = { acute: int(r, 2, 8) * 10, obtuse: int(r, 10, 17) * 10, reflex: int(r, 20, 34) * 10, right: 90 };
        const right = `${pool[want]}°`;
        return {
          kind: "choose",
          prompt: `Which angle is **${want}**?`,
          options: unique(
            right,
            (["acute", "obtuse", "reflex", "right"] as const).filter((k) => k !== want).map((k) => ({ text: `${pool[k]}°`, misconception: M.size, feedback: `${pool[k]}° is ${typeOf(pool[k]).toLowerCase().replace("right angle", "a right angle")}. ${TYPE_RULE}` })),
          ),
          answer: 0,
          hint: TYPE_RULE,
          explanation: `**${right}** is ${want}.`,
        };
      }
      const kind = pick(r, difficulty === 1 ? ["Acute", "Right angle", "Obtuse"] : ["Acute", "Obtuse", "Reflex", "Reflex"]);
      const d = kind === "Acute" ? int(r, 3, 8) * 10 : kind === "Right angle" ? 90 : kind === "Obtuse" ? int(r, 10, 17) * 10 : int(r, 20, 33) * 10;
      const names = difficulty === 1 ? ["Acute", "Right angle", "Obtuse"] : ["Acute", "Right angle", "Obtuse", "Reflex"];
      return {
        kind: "choose",
        prompt: "What type of angle is this?",
        visual: { kind: "angle", degrees: d },
        options: names.map((n) => ({ text: n, misconception: n === kind ? undefined : M.size, feedback: n === kind ? undefined : TYPE_RULE })),
        answer: names.indexOf(kind),
        fixedOrder: true,
        hint: "Compare it with a right angle, like the corner of a page. Is it smaller, the same, or bigger? Bigger than a straight line?",
        explanation: `This angle is ${d}°, so it's **${kind.toLowerCase().replace("right angle", "a right angle")}**.`,
      };
    },
  },
  {
    key: "sa-turns",
    skill: S.turns,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      if (difficulty === 1) {
        const [name, deg] = pick(r, [["a quarter turn", 90], ["a half turn", 180], ["a three-quarter turn", 270], ["a full turn", 360]] as const);
        return {
          kind: "number",
          prompt: `How many degrees are in **${name}**?`,
          answer: deg,
          unit: "°",
          traps: deg === 90 ? [{ value: 25, misconception: M.size, feedback: "A full turn is 360°, so a quarter turn is 360 ÷ 4." }] : deg === 180 ? [{ value: 50, misconception: M.size, feedback: "A full turn is 360°, so a half turn is 360 ÷ 2." }] : [{ value: deg === 360 ? 100 : 75, misconception: M.size, feedback: "A full turn is 360°." }],
          hint: "A full turn is 360°. A quarter turn is a right angle.",
          explanation: `${name.charAt(0).toUpperCase() + name.slice(1)} is **${deg}°**.`,
        };
      }
      const DIRS = difficulty === 2 ? ["North", "East", "South", "West"] : ["North", "North-east", "East", "South-east", "South", "South-west", "West", "North-west"];
      const stepDeg = 360 / DIRS.length;
      const start = int(r, 0, DIRS.length - 1);
      const clockwise = r() < 0.5;
      const turn = difficulty === 2 ? pick(r, [90, 180, 270]) : pick(r, [45, 90, 135, 225, 270]);
      const steps = turn / stepDeg;
      const end = (start + (clockwise ? steps : -steps) + DIRS.length * 4) % DIRS.length;
      const wrongWay = (start + (clockwise ? -steps : steps) + DIRS.length * 4) % DIRS.length;
      const turnName = difficulty === 2 ? { 90: "a quarter turn", 180: "a half turn", 270: "a three-quarter turn" }[turn as 90 | 180 | 270] : `${turn}°`;
      return {
        kind: "choose",
        prompt: `Kip faces **${DIRS[start]}** and turns **${turnName} ${clockwise ? "clockwise" : "anticlockwise"}**. Which way does Kip face now?`,
        options: unique(DIRS[end], [
          { text: DIRS[wrongWay], misconception: M.direction, feedback: "Clockwise goes the way a clock's hands move: North, then East, then South, then West." },
          { text: DIRS[(end + 1) % DIRS.length], feedback: `Count the turn in ${stepDeg}° steps.` },
          { text: DIRS[(end + DIRS.length - 1) % DIRS.length], feedback: `Count the turn in ${stepDeg}° steps.` },
          { text: DIRS[start], feedback: "Kip has turned, so Kip faces a new way." },
        ]),
        answer: 0,
        hint: `Clockwise: North → East → South → West. Each step of the compass is ${stepDeg}°.`,
        explanation: `${turn}° is ${steps} step${steps > 1 ? "s" : ""} of ${stepDeg}° ${clockwise ? "clockwise" : "anticlockwise"} from ${DIRS[start]}: **${DIRS[end]}**.`,
      };
    },
  },
  {
    key: "sa-line",
    skill: S.facts,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      if (difficulty === 1) {
        const a = int(r, 4, 14) * 10 + pick(r, [0, 5]);
        return {
          kind: "number",
          prompt: "These angles sit on a **straight line**. What is the missing angle?",
          visual: { kind: "angle-split", parts: [a, 180 - a], labels: [`${a}°`, "?"] },
          answer: 180 - a,
          unit: "°",
          traps: [{ value: 360 - a, misconception: M.total, feedback: "Angles on a straight line add up to 180°, not 360°." }, { value: 90 - a, misconception: M.total, feedback: "A straight line is 180°." }].filter((t) => t.value > 0),
          hint: "Angles on a straight line add up to 180°.",
          explanation: `180° − ${a}° = **${180 - a}°**.`,
        };
      }
      const parts = difficulty === 2 ? [int(r, 6, 14) * 10, int(r, 5, 12) * 10] : [int(r, 50, 130), int(r, 40, 110)];
      const missing = 360 - parts[0] - parts[1];
      return {
        kind: "number",
        prompt: "These angles go **all the way round** a point. What is the missing angle?",
        visual: { kind: "angle-split", parts: [...parts, missing], labels: [`${parts[0]}°`, `${parts[1]}°`, "?"] },
        answer: missing,
        unit: "°",
        traps: [{ value: 180 - parts[0] - parts[1], misconception: M.total, feedback: "All the way round a point is 360°, not 180°." }].filter((t) => t.value > 0),
        hint: "Angles around a point add up to 360°.",
        explanation: `360° − ${parts[0]}° − ${parts[1]}° = **${missing}°**.`,
      };
    },
  },
  {
    key: "sa-triangle",
    skill: S.facts,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      if (difficulty === 3) {
        // Isosceles: the top angle is given; the two base angles are equal.
        const top = int(r, 4, 14) * 10;
        const base = (180 - top) / 2;
        return {
          kind: "number",
          prompt: `This is an **isosceles** triangle: the two bottom angles are equal. The top angle is **${top}°**. What is each bottom angle?`,
          visual: { kind: "triangle", angles: [base, base, top], labels: ["?", "?", `${top}°`] },
          answer: base,
          unit: "°",
          traps: [{ value: 180 - top, misconception: M.total, feedback: "That's both bottom angles together. Halve it." }, { value: 360 - top, misconception: M.total, feedback: "Angles in a triangle add up to 180°." }],
          hint: `180° − ${top}° leaves the two equal angles. Share it between them.`,
          explanation: `180° − ${top}° = ${180 - top}°, and ${180 - top}° ÷ 2 = **${base}°**.`,
        };
      }
      const a = difficulty === 2 ? 90 : int(r, 4, 9) * 10;
      let b = difficulty === 2 ? int(r, 25, 65) : int(r, 3, 8) * 10;
      if (difficulty === 2 && b === 45) b = 50;
      const c = 180 - a - b;
      const left = r() < 0.5;
      const order: [number, number, number] = left ? [a, c, b] : [c, a, b];
      const labels: [string, string, string] = left ? [`${a}°`, "?", `${b}°`] : ["?", `${a}°`, `${b}°`];
      return {
        kind: "number",
        prompt: "What is the missing angle in this triangle?",
        visual: { kind: "triangle", angles: order, labels },
        answer: c,
        unit: "°",
        traps: [{ value: 360 - a - b, misconception: M.total, feedback: "Angles in a triangle add up to 180°, not 360°." }],
        hint: `Angles in a triangle add up to 180°.${a === 90 ? " The square corner is 90°." : ""}`,
        explanation: `180° − ${a}° − ${b}° = **${c}°**.`,
      };
    },
  },
  /* D-037 (Phase B): a stretch question for every skill, and a second maker for angle types and turns. */
  {
    key: "sa-shapes-stretch",
    skill: S.shapes,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const solid = pick(r, SOLIDS);
      const sum = solid.faces + solid.vertices - solid.edges;
      return {
        kind: "number",
        prompt: `A **${solid.name}** has ${solid.faces} faces and ${solid.vertices} vertices. How many **edges** does it have?`,
        answer: solid.edges,
        traps: [{ value: solid.faces + solid.vertices, misconception: M.parts, feedback: "Edges are where two faces meet: count the lines, not faces plus corners." }],
        hint: "Picture it: count the straight lines where two faces meet.",
        explanation: `A ${solid.name} has **${solid.edges}** edges. (Faces + vertices − edges = ${sum}, which is true for every one of these solids.)`,
      };
    },
  },
  {
    key: "sa-type-word",
    skill: S.types,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const d = difficulty === 1 ? pick(r, [30, 60, 90, 120, 150]) : difficulty === 2 ? int(r, 10, 175) : int(r, 181, 350);
      const right = typeOf(d);
      return {
        kind: "choose",
        prompt: `What type of angle is **${d}°**?`,
        options: unique(right, ["Acute", "Right angle", "Obtuse", "Reflex"].filter((x) => x !== right).map((x) => ({ text: x, misconception: M.size, feedback: TYPE_RULE }))),
        answer: 0,
        fixedOrder: true,
        hint: "Compare it with 90° and 180°.",
        explanation: `${d}° is **${right.toLowerCase()}**. ${TYPE_RULE}`,
      };
    },
  },
  {
    key: "sa-types-stretch",
    skill: S.types,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const h = pick(r, [1, 2, 4, 5, 7, 8, 10, 11]);
      const deg = Math.min(h * 30, 360 - h * 30);
      const right = typeOf(deg);
      return {
        kind: "choose",
        prompt: `At **${h} o'clock**, what type of angle do the clock hands make (the smaller angle between them)?`,
        visual: { kind: "clock", hours: h, minutes: 0 },
        options: unique(right, ["Acute", "Right angle", "Obtuse"].filter((x) => x !== right).map((x) => ({ text: x, misconception: M.size, feedback: "Each hour mark is 30° apart. Count the hours between the hands." }))),
        answer: 0,
        fixedOrder: true,
        hint: "The 12 numbers split 360° into 12 equal parts: 30° each.",
        explanation: `The hands are ${Math.min(h, 12 - h)} hours apart: ${Math.min(h, 12 - h)} × 30° = ${deg}°, which is **${right.toLowerCase()}**.`,
      };
    },
  },
  {
    key: "sa-turn-degrees",
    skill: S.turns,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const quarters = difficulty === 1 ? int(r, 1, 2) : int(r, 1, 3);
      const words = ["", "a quarter turn", "a half turn", "three quarters of a turn"][quarters]!;
      return {
        kind: "number",
        prompt: `How many degrees is **${words}**?`,
        unit: "°",
        answer: quarters * 90,
        traps: [{ value: quarters * 100, misconception: M.total, feedback: "A full turn is 360°, so a quarter turn is 90°, not 100°." }],
        hint: "A full turn is 360°. Divide it into quarters.",
        explanation: `${quarters} × 90° = **${quarters * 90}°**.`,
      };
    },
  },
  {
    key: "sa-turns-stretch",
    skill: S.turns,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const dirs = ["North", "East", "South", "West"];
      const start = int(r, 0, 3);
      const a = int(r, 1, 3);
      const b = int(r, 1, 3);
      const end = (start + a - b + 8) % 4;
      return {
        kind: "choose",
        prompt: `Sam faces **${dirs[start]}**. Sam turns **${a * 90}° clockwise**, then **${b * 90}° anticlockwise**. Which way does Sam face now?`,
        options: [{ text: dirs[end]! }, ...dirs.filter((_, i) => i !== end).map((d) => ({ text: d, misconception: M.direction, feedback: "Clockwise goes North → East → South → West; anticlockwise goes the other way." }))],
        answer: 0,
        fixedOrder: true,
        hint: "Each 90° turn moves one compass point. Do the clockwise turn first.",
        explanation: `${a} quarter turns clockwise, then ${b} back: Sam faces **${dirs[end]}**.`,
      };
    },
  },
  {
    key: "sa-facts-stretch",
    skill: S.facts,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const a = int(r, 50, 120);
      const b = int(r, 40, 300 - a - 40);
      const c = 360 - a - b;
      return {
        kind: "number",
        prompt: `Three angles meet at a point. Two of them are **${a}°** and **${b}°**. What is the third angle?`,
        visual: { kind: "angle-split", parts: [a, b, c], labels: [`${a}°`, `${b}°`, "?"] },
        unit: "°",
        answer: c,
        traps: [{ value: 180 - a - b > 0 ? 180 - a - b : 180 + a - b, misconception: M.total, feedback: "Angles around a point add up to 360°, not 180°." }].filter((t) => t.value !== c && t.value > 0),
        hint: "Angles all the way round a point make a full turn.",
        explanation: `360° − ${a}° − ${b}° = **${c}°**.`,
      };
    },
  },
];

const templates = withHints(baseTemplates, {
  "sa-name": () => ["Count the sides and corners.", "Check the sides' lengths and any right angles or parallel sides."],
  "sa-props": () => ["Faces are the flat surfaces, edges are the lines, vertices are the corners.", "Picture the shape and count one kind at a time."],
  "sa-type": () => ["Compare the angle with a square corner (90°).", "Smaller than 90°: acute. Between 90° and 180°: obtuse. More than 180°: reflex."],
  "sa-turns": () => ["A full turn is 360°, a half turn 180°, a quarter turn 90°.", "Clockwise goes North, East, South, West."],
  "sa-line": () => ["Angles on a straight line add up to 180°.", "Take the angle you know away from 180°."],
  "sa-triangle": () => ["The angles in a triangle add up to 180°.", "Add the two you know, then take that from 180°."],
  "sa-shapes-stretch": () => ["Edges are the lines where faces meet.", "Count the edges round the top, round the bottom, and the ones joining them."],
  "sa-type-word": () => ["Is it less than 90°, exactly 90°, or more?", "More than 180° is reflex."],
  "sa-types-stretch": () => ["Each hour gap is 30°.", "Count the hour gaps between the hands and multiply by 30."],
  "sa-turn-degrees": () => ["A full turn is 360°.", "A quarter turn is 360 ÷ 4."],
  "sa-turns-stretch": () => ["Draw the compass and follow each turn.", "90° clockwise moves one point round to the right."],
  "sa-facts-stretch": () => ["Angles around a point add up to 360°.", "Take both angles away from 360."],
});

export const shapesAngles = defineTopic(withExtras({
  id: T,
  title: "Shapes and angles",
  subtitle: "Name 2D and 3D shapes, sort angles, turn by degrees and use angle facts",
  world: "shape",
  years: [3, 4, 5, 6],
  order: 1,
  icon: "angle",
  skills: [
    { id: S.shapes, title: "2D and 3D shapes", description: "Name shapes and count their sides, faces, edges and vertices.", lessonId: "shapes" },
    { id: S.types, title: "Types of angle", description: "Sort angles into acute, right, obtuse and reflex.", lessonId: "angle-types" },
    { id: S.turns, title: "Turns and degrees", description: "Use quarter, half and full turns, degrees and compass directions.", lessonId: "turns" },
    { id: S.facts, title: "Angle facts", description: "Find missing angles on a line, around a point and in a triangle.", lessonId: "facts" },
  ],
  lessonIcons: { shapes: "shapes", "angle-types": "angle", turns: "compass", facts: "target" },
  lessons: [
    {
      id: "shapes",
      title: "2D and 3D shapes",
      phase: "Understand",
      summary: "Count the sides, look for right angles and equal sides.",
      minutes: 7,
      objectives: ["Name 2D shapes from their properties", "Count faces, edges and vertices of 3D shapes"],
      steps: [
        {
          type: "explain",
          title: "Count the sides",
          body: ["A shape's name often tells you its sides: **penta**gon 5, **hexa**gon 6, **octa**gon 8.", "This is a **hexagon**: 6 straight sides and 6 vertices (corners)."],
          visual: { kind: "shape", name: "hexagon" },
        },
        {
          type: "explain",
          title: "Four-sided shapes",
          body: ["A **rhombus** has 4 equal sides like a square, but **no right angles**.", "A **trapezium** has just **one pair** of parallel sides. A **parallelogram** has two."],
          visual: { kind: "shape", name: "rhombus" },
          tip: "3D shapes have faces (flat sides), edges (where faces meet) and vertices (corners). A cube has 6, 12 and 8.",
        },
        {
          type: "worked",
          title: "Watch me: name this shape",
          support: "full",
          problem: "A shape has 4 sides. Opposite sides are parallel and equal, but there are no right angles and the sides aren't all equal. What is it?",
          visual: { kind: "shape", name: "parallelogram" },
          steps: [{ text: "4 sides: a quadrilateral." }, { text: "No right angles rules out a square and a rectangle. Sides not all equal rules out a rhombus." }, { text: "Two pairs of parallel sides: a **parallelogram**." }],
          conclusion: "It's a **parallelogram**.",
        },
        {
          type: "worked",
          title: "Together: faces of a cube",
          support: "faded",
          problem: "How many **faces** does a cube have?",
          steps: [{ text: "Count the flat surfaces: top and bottom, front and back, left and right.", blank: { prompt: "How many faces?", answer: 6, hint: "3 pairs", traps: [{ value: 8, misconception: M.parts, feedback: "8 is the number of vertices (corners). Faces are the flat squares." }, { value: 12, misconception: M.parts, feedback: "12 is the number of edges. Faces are the flat squares." }], worked: "**6** faces." } }],
          conclusion: "A cube has **6** faces, 12 edges and 8 vertices.",
        },
        { type: "check", title: "Your turn", questionId: gen("sa-name", 2, 4) },
        { type: "check", title: "One more", questionId: gen("sa-props", 3, 2) },
      ],
    },
    {
      id: "angle-types",
      title: "Types of angle",
      phase: "Visualise",
      summary: "Smaller than, equal to or bigger than a right angle?",
      minutes: 6,
      objectives: ["Know acute, right, obtuse and reflex angles"],
      steps: [
        {
          type: "explain",
          title: "The right angle",
          body: ["A **right angle** is a square corner: **90°**. We mark it with a little square.", "**Acute** angles are smaller than 90°. **Obtuse** angles are between 90° and 180°. **Reflex** angles are more than 180°."],
          visual: { kind: "angle", degrees: 90, label: "90°" },
        },
        {
          type: "explain",
          title: "An obtuse angle",
          body: ["This angle is **130°**: bigger than a right angle, smaller than a straight line. It's **obtuse**."],
          visual: { kind: "angle", degrees: 130, label: "130°" },
          tip: "Acute is small and sharp, like a cute little angle!",
        },
        {
          type: "worked",
          title: "Watch me: is 200° obtuse?",
          support: "full",
          problem: "What type of angle is **200°**?",
          visual: { kind: "angle", degrees: 200, label: "200°" },
          steps: [{ text: "A straight line is 180°. 200° is **more** than that." }, { text: "Angles more than 180° are **reflex**." }],
          conclusion: "200° is a **reflex** angle, not obtuse.",
        },
        {
          type: "worked",
          title: "Together: how much more than a right angle?",
          support: "faded",
          problem: "An angle is **135°**. How much bigger than a right angle is it?",
          visual: { kind: "angle", degrees: 135, label: "135°" },
          steps: [{ text: "A right angle is 90°.", blank: { prompt: "135 − 90 = ?", answer: 45, hint: "135 − 90", traps: [{ value: 35, misconception: M.size, feedback: "A right angle is 90°, not 100°." }], worked: "**45°** more, so it's obtuse." } }],
          conclusion: "135° is **45°** more than a right angle: **obtuse**.",
        },
        { type: "check", title: "Your turn", questionId: gen("sa-type", 1, 3) },
        { type: "check", title: "One more", questionId: gen("sa-type", 2, 5) },
      ],
    },
    {
      id: "turns",
      title: "Turns and degrees",
      phase: "Practise",
      summary: "A full turn is 360°. Clockwise goes the way clock hands go.",
      minutes: 6,
      objectives: ["Know quarter, half and full turns in degrees", "Turn clockwise and anticlockwise on a compass"],
      steps: [
        {
          type: "explain",
          title: "Turning",
          body: ["A **full turn** is **360°**. A half turn is **180°** and a quarter turn is **90°**.", "**Clockwise** turns the same way as a clock's hands: North → East → South → West.", "**Anticlockwise** goes the other way: North → West → South → East. Each quarter turn moves you one compass point."],
          visual: { kind: "angle-split", parts: [90, 90, 90, 90], labels: ["90°", "90°", "90°", "90°"] },
        },
        {
          type: "worked",
          title: "Watch me: West, then 270° clockwise",
          support: "full",
          problem: "You face **West** and turn **270° clockwise**. Which way do you face?",
          visual: { kind: "angle-split", parts: [90, 90, 90, 90], labels: ["N", "E", "S", "W"] },
          steps: [{ text: "270° is three quarter turns." }, { text: "Clockwise from West: **North**, **East**, **South**." }],
          conclusion: "You face **South**.",
        },
        {
          type: "worked",
          title: "Together: a half turn",
          support: "faded",
          problem: "How many degrees is a **half turn**?",
          steps: [{ text: "A full turn is 360°.", blank: { prompt: "360 ÷ 2 = ?", answer: 180, hint: "Half of 360", traps: [{ value: 90, misconception: M.total, feedback: "90° is a quarter turn. A half turn is half of 360°." }], worked: "**180°**." } }],
          conclusion: "A half turn is **180°**.",
        },
        { type: "check", title: "Your turn", questionId: gen("sa-turns", 1, 2) },
        { type: "check", title: "One more", questionId: gen("sa-turns", 2, 6) },
      ],
    },
    {
      id: "facts",
      title: "Angle facts",
      phase: "Apply",
      summary: "Straight line 180°, around a point 360°, triangle 180°.",
      minutes: 8,
      objectives: ["Find missing angles on a straight line and around a point", "Find missing angles in a triangle"],
      steps: [
        {
          type: "explain",
          title: "Three totals to know",
          body: ["Angles on a **straight line** add up to **180°**. Angles **around a point** add up to **360°**. The angles inside a **triangle** add up to **180°**.", "To find a missing angle, add the angles you know and take that away from the total."],
          visual: { kind: "angle-split", parts: [125, 55], labels: ["125°", "55°"] },
        },
        {
          type: "worked",
          title: "Watch me: a straight line",
          support: "full",
          problem: "Find the missing angle.",
          visual: { kind: "angle-split", parts: [125, 55], labels: ["125°", "?"] },
          steps: [{ text: "Angles on a straight line add up to **180°**." }, { text: "180 − 125 = **55**." }],
          conclusion: "The missing angle is **55°**.",
        },
        {
          type: "worked",
          title: "Let's do it together",
          support: "faded",
          problem: "Find the missing angle in the triangle.",
          visual: { kind: "triangle", angles: [70, 40, 70], labels: ["70°", "40°", "?"] },
          steps: [
            { text: "Angles in a triangle add up to 180°." },
            { text: "Add the two you know.", blank: { prompt: "What is 70 + 40?", answer: 110, hint: "70 + 40.", traps: [{ value: 140, misconception: M.total, feedback: "Add the two angles you know: 70 + 40." }], worked: "70 + 40 = **110**." } },
            { text: "180 − 110 = 70." },
          ],
          conclusion: "The missing angle is **70°**.",
        },
        { type: "check", title: "Your turn", questionId: gen("sa-line", 1, 3) },
        { type: "check", title: "One more", questionId: gen("sa-triangle", 1, 8) },
      ],
    },
  ],
  templates,
  misconceptions: [
    { id: M.names, name: "Mixing up shape names", possibleCause: "It looks like two shapes with similar looks got mixed up.", description: "Calls a rhombus a square, or a hexagon a pentagon.", explanation: ["Count the sides first.", "Then check for right angles, equal sides and parallel sides."], skills: [S.shapes], followUpTemplates: ["sa-name", "sa-props"] },
    { id: M.parts, name: "Faces, edges and vertices mixed up", possibleCause: "It looks like faces, edges and vertices got mixed up.", description: "Gives the number of corners when asked for edges.", explanation: ["Faces: flat surfaces. Edges: where two faces meet.", "Vertices: corners, where edges meet."], skills: [S.shapes], followUpTemplates: ["sa-props"] },
    { id: M.size, name: "Angle sizes mixed up", possibleCause: "It looks like the angle types got mixed up.", description: "Calls an obtuse angle acute, or a reflex angle obtuse.", explanation: ["Compare with a right angle (90°) and a straight line (180°).", "Acute < 90° < obtuse < 180° < reflex."], skills: [S.types, S.turns], followUpTemplates: ["sa-type"] },
    { id: M.direction, name: "Clockwise and anticlockwise mixed up", possibleCause: "It looks like the turn went the wrong way.", description: "Turns anticlockwise when asked to turn clockwise.", explanation: ["Clockwise is the way a clock's hands go.", "From North, clockwise goes to East first."], skills: [S.turns], followUpTemplates: ["sa-turns"] },
    { id: M.total, name: "Using the wrong angle total", possibleCause: "It looks like the wrong total (180° or 360°) was used.", description: "Uses 360° for a straight line, or 360° for a triangle.", explanation: ["Straight line: 180°. Triangle: 180°.", "All the way round a point: 360°."], skills: [S.facts], followUpTemplates: ["sa-line", "sa-triangle"] },
  ],
  placement: [
    { lessonId: "shapes", template: "sa-name" },
    { lessonId: "angle-types", template: "sa-type" },
    { lessonId: "turns", template: "sa-turns" },
    { lessonId: "facts", template: "sa-line" },
  ],
}, shapesAnglesExtra));
