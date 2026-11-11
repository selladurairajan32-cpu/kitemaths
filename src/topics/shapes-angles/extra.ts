import { genFor, int, pick, withAnswer, type TopicExtra } from "@/topics/kit/define";
import type { ChooseOption, ShapeName, Template } from "@/topics/kit/types";

/**
 * D-037: lines of symmetry and reflection (Y4.GPS.3, Y4.GPS.4), nets of 3-D shapes, parts of a circle (Y6.GPS.4) and
 * estimating angles (Y5.GPS.3, without a protractor).
 */

const T = "shapes-angles";
const gen = genFor(T);
const S = { symmetry: `${T}.symmetry`, nets: `${T}.nets`, circles: `${T}.circles`, estimate: `${T}.estimate-angles` };
const M = { diagonals: `${T}.diagonal-symmetry`, anyNet: `${T}.any-six-squares`, radiusDiameter: `${T}.radius-diameter`, clockHand: `${T}.clock-angle` };

/** Lines of symmetry of each shape as the kit draws it (regular pentagon, hexagon and octagon; a scalene triangle). */
const LINES: [ShapeName, string, number][] = [
  ["square", "square", 4],
  ["rectangle", "rectangle", 2],
  ["equilateral", "equilateral triangle", 3],
  ["isosceles", "isosceles triangle", 1],
  ["scalene", "scalene triangle", 0],
  ["rhombus", "rhombus", 2],
  ["parallelogram", "parallelogram", 0],
  ["kite", "kite", 1],
  ["pentagon", "regular pentagon", 5],
  ["hexagon", "regular hexagon", 6],
  ["octagon", "regular octagon", 8],
];
const SIDES: Partial<Record<ShapeName, number>> = { square: 4, rectangle: 4, rhombus: 4, parallelogram: 4, kite: 4, equilateral: 3, isosceles: 3, scalene: 3, pentagon: 5, hexagon: 6, octagon: 8 };

/** Six squares that fold into a cube (hand-checked): the 1-4-1 family, a 3-3 staircase and a 2-2-2 staircase. */
const CUBE_NETS: [number, number][][] = [
  [[0, 0], [0, 1], [1, 1], [2, 1], [3, 1], [0, 2]],
  [[0, 0], [0, 1], [1, 1], [2, 1], [3, 1], [1, 2]],
  [[0, 0], [0, 1], [1, 1], [2, 1], [3, 1], [2, 2]],
  [[0, 0], [0, 1], [1, 1], [2, 1], [3, 1], [3, 2]],
  [[1, 0], [0, 1], [1, 1], [2, 1], [3, 1], [1, 2]],
  [[1, 0], [0, 1], [1, 1], [2, 1], [3, 1], [2, 2]],
  [[0, 0], [1, 0], [2, 0], [2, 1], [3, 1], [4, 1]],
  [[0, 0], [1, 0], [1, 1], [2, 1], [2, 2], [3, 2]],
];
/** Six squares that don't (hand-checked): a 2 by 3 block, five in a row, a 2 by 2 block, and two flaps on one side. */
const NOT_NETS: [number, number][][] = [
  [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1]],
  [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [2, 1]],
  [[0, 0], [1, 0], [0, 1], [1, 1], [2, 1], [3, 1]],
  [[1, 0], [3, 0], [0, 1], [1, 1], [2, 1], [3, 1]],
];
const SOLIDS = [
  { solid: "square-pyramid" as const, name: "Square-based pyramid", faces: 5, edges: 8, vertices: 5 },
  { solid: "triangular-prism" as const, name: "Triangular prism", faces: 5, edges: 9, vertices: 6 },
  { solid: "tetrahedron" as const, name: "Tetrahedron (triangle-based pyramid)", faces: 4, edges: 6, vertices: 4 },
];

/** The angle between clock hands at h:m, the smaller way round (the hour hand moves 0.5° a minute). */
function clockAngle(h: number, m: number): number {
  const a = Math.abs(30 * (h % 12) - 5.5 * m);
  return Math.min(a, 360 - a);
}

const templates: Template[] = [
  {
    key: "sa-sym-lines",
    skill: S.symmetry,
    difficulties: [1, 2],
    make: (r, { difficulty }) => {
      const pool = difficulty === 1 ? LINES.slice(0, 5) : LINES.slice(5);
      const [shape, name, lines] = pick(r, pool);
      const sides = SIDES[shape]!;
      return {
        kind: "number",
        prompt: `How many **lines of symmetry** does this **${name}** have?`,
        visual: { kind: "shape", name: shape },
        answer: lines,
        traps: [{ value: sides, misconception: M.diagonals, feedback: "Not every line through a corner is a line of symmetry. Fold it in your head: do the two halves match exactly?" }, { value: lines === 2 ? 4 : 2, misconception: M.diagonals, feedback: "Check each line: would the shape fold exactly onto itself along it?" }].filter((t) => t.value !== lines),
        hint: "A line of symmetry folds the shape into two halves that match exactly.",
        hints: ["Try lines up and down, across, and corner to corner.", lines === 0 ? "If no fold makes the halves match, the answer is 0." : `Count each fold that works. Diagonals only work in some shapes.`],
        explanation: `A ${name} has **${lines}** line${lines === 1 ? "" : "s"} of symmetry.${shape === "rectangle" || shape === "parallelogram" ? " Folding along a diagonal doesn't make the halves match." : ""}`,
      };
    },
  },
  {
    key: "sa-sym-reflect",
    skill: S.symmetry,
    difficulties: [1, 2],
    make: (r, { difficulty }) => {
      const size = 6;
      const count = difficulty === 1 ? int(r, 2, 3) : int(r, 4, 6);
      const cells: [number, number][] = [];
      while (cells.length < count) {
        const c: [number, number] = [int(r, 0, 2), int(r, 0, 5)];
        if (!cells.some(([x, y]) => x === c[0] && y === c[1])) cells.push(c);
      }
      return {
        kind: "number",
        prompt: "The shaded shape is reflected in the dashed mirror line. How many squares are shaded **altogether** once the reflection is drawn?",
        visual: { kind: "symmetry", size, cells, mirror: "vertical" },
        answer: count * 2,
        traps: [{ value: count, feedback: "That is the shape before it was reflected. The reflection adds the same number again." }],
        hint: "Each shaded square has a partner on the other side of the mirror.",
        hints: ["A square 1 away from the mirror has its reflection 1 away on the other side.", `There are ${count} squares now, and each gets a reflection.`],
        explanation: `${count} shaded squares, each with a reflection the same distance from the mirror: ${count} + ${count} = **${count * 2}**.`,
      };
    },
  },
  {
    key: "sa-sym-stretch",
    skill: S.symmetry,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const right = pick(r, ["H", "X"]);
      const one = ["A", "T", "M", "E", "C", "U"];
      const none = ["F", "N", "S", "Z", "P", "R"];
      const wrong: ChooseOption[] = [pick(r, one), pick(r, none), pick(r, one.filter((x) => x !== "M"))]
        .filter((x, i, all) => all.indexOf(x) === i)
        .map((x) => ({ text: x, feedback: `${x} has ${one.includes(x) ? "only 1 line" : "no lines"} of symmetry.` }));
      const { options, answer } = withAnswer(r, { text: right } as ChooseOption, wrong);
      return {
        kind: "choose",
        prompt: "Which capital letter has **exactly 2** lines of symmetry?",
        options,
        answer,
        hint: "Try a line up and down, then a line across.",
        hints: ["A has a line up and down only; E has a line across only.", "Look for a letter that folds both ways."],
        explanation: `**${right}** folds onto itself both up and down and across: 2 lines of symmetry.`,
      };
    },
  },
  {
    key: "sa-net-cube",
    skill: S.nets,
    difficulties: [1, 2],
    make: (r) => {
      const isNet = r() < 0.5;
      const cells = pick(r, isNet ? CUBE_NETS : NOT_NETS);
      return {
        kind: "choose",
        prompt: "Will these 6 squares fold up to make a **cube**?",
        visual: { kind: "net", cells },
        options: [
          { text: "Yes", ...(isNet ? {} : { misconception: M.anyNet, feedback: "Not every 6 squares make a cube: some faces would overlap or leave a gap." }) },
          { text: "No", ...(isNet ? { feedback: "Fold it in your head: each square becomes a different face, with none overlapping." } : {}) },
        ],
        answer: isNet ? 0 : 1,
        fixedOrder: true,
        hint: "Pick one square as the bottom and fold the others up around it.",
        hints: ["A cube has 6 faces: bottom, top and four sides. Two squares must never land on the same face.", "Five in a row, or a 2 by 2 block, can never fold into a cube."],
        explanation: isNet ? "Folding it up, every square becomes a different face of the cube: it **is** a net of a cube." : "Folding it up, two squares land on the same face and one face is left open: it is **not** a net of a cube.",
      };
    },
  },
  {
    key: "sa-net-solid",
    skill: S.nets,
    difficulties: [2],
    make: (r) => {
      const s = pick(r, SOLIDS);
      const others = ["Cube", "Cuboid", "Cone", ...SOLIDS.map((x) => x.name)].filter((x) => x !== s.name);
      const wrong = others.sort(() => r() - 0.5).slice(0, 3).map((x) => ({ text: x, feedback: `Count the faces and their shapes: a ${s.name.toLowerCase()} has ${s.faces} faces.` }));
      const { options, answer } = withAnswer(r, { text: s.name } as ChooseOption, wrong);
      return {
        kind: "choose",
        prompt: "Which 3-D shape does this net fold up to make?",
        visual: { kind: "net", solid: s.solid },
        options,
        answer,
        hint: "Count the faces in the net, and look at their shapes.",
        hints: [`There are ${s.faces} faces.`, "Triangles meeting at one point make a pyramid; two matching ends joined by rectangles make a prism."],
        explanation: `${s.faces} faces: it folds into a **${s.name.toLowerCase()}**.`,
      };
    },
  },
  {
    key: "sa-net-stretch",
    skill: S.nets,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const s = pick(r, SOLIDS);
      const ask = pick(r, ["edges", "vertices"] as const);
      return {
        kind: "number",
        prompt: `This net is folded up into a 3-D shape. How many **${ask}** does the shape have?`,
        visual: { kind: "net", solid: s.solid },
        answer: s[ask],
        traps: [{ value: s.faces, feedback: `${s.faces} is the number of faces. ${ask === "edges" ? "Edges are where two faces meet." : "Vertices are the corners."}` }].filter((t) => t.value !== s[ask]),
        hint: `Picture the folded ${s.name.toLowerCase()}.`,
        hints: [ask === "edges" ? "Edges are the lines where two faces meet." : "Vertices are the corners, where edges meet.", `It is a ${s.name.toLowerCase()}: count its ${ask} around the bottom, then the rest.`],
        explanation: `The net folds into a ${s.name.toLowerCase()}, which has ${s.faces} faces, ${s.edges} edges and ${s.vertices} vertices: **${s[ask]}** ${ask}.`,
      };
    },
  },
  {
    key: "sa-circle-parts",
    skill: S.circles,
    difficulties: [1],
    make: (r) => {
      const parts = [
        { name: "Radius", says: "a straight line from the centre to the edge" },
        { name: "Diameter", says: "a straight line from edge to edge through the centre" },
        { name: "Circumference", says: "the distance all the way round the edge" },
        { name: "Centre", says: "the point in the middle, the same distance from every point on the edge" },
      ];
      const p = pick(r, parts);
      const { options, answer } = withAnswer(
        r,
        { text: p.name } as ChooseOption,
        parts.filter((x) => x !== p).map((x) => ({ text: x.name, ...(x.name === "Radius" || x.name === "Diameter" ? { misconception: M.radiusDiameter } : {}), feedback: `The ${x.name.toLowerCase()} is ${x.says}.` })),
      );
      return {
        kind: "choose",
        prompt: `What is the name for **${p.says}** of a circle?`,
        visual: { kind: "circle", radius: "radius", diameter: "diameter", centre: true },
        options,
        answer,
        hint: "Look at the labelled circle.",
        hints: ["The radius starts at the centre; the diameter goes right across.", "The circumference is the edge itself."],
        explanation: `The **${p.name.toLowerCase()}** is ${p.says}.`,
      };
    },
  },
  {
    key: "sa-circle-diameter",
    skill: S.circles,
    difficulties: [1, 2],
    make: (r, { difficulty }) => {
      const radius = int(r, 2, difficulty === 1 ? 12 : 45);
      if (difficulty === 1) {
        return {
          kind: "number",
          prompt: `A circle has a **radius of ${radius} cm**. What is its **diameter**?`,
          visual: { kind: "circle", radius: `${radius} cm`, centre: true },
          answer: 2 * radius,
          unit: "cm",
          traps: [{ value: radius, misconception: M.radiusDiameter, feedback: "The diameter goes all the way across: it is two radii." }].concat(radius % 2 === 0 ? [{ value: radius / 2, misconception: M.radiusDiameter, feedback: "The diameter is twice the radius, not half." }] : []),
          hint: "The diameter is two radii, end to end.",
          hints: ["Diameter = 2 × radius.", `2 × ${radius}.`],
          explanation: `The diameter is twice the radius: 2 × ${radius} = **${2 * radius} cm**.`,
        };
      }
      return {
        kind: "number",
        prompt: `A circle has a **diameter of ${2 * radius} cm**. What is its **radius**?`,
        visual: { kind: "circle", diameter: `${2 * radius} cm`, centre: true },
        answer: radius,
        unit: "cm",
        traps: [{ value: 4 * radius, misconception: M.radiusDiameter, feedback: "The radius is half the diameter, not double." }, { value: 2 * radius, misconception: M.radiusDiameter, feedback: "The radius only goes from the centre to the edge: half the diameter." }],
        hint: "The radius is half of the diameter.",
        hints: ["Radius = diameter ÷ 2.", `${2 * radius} ÷ 2.`],
        explanation: `The radius is half the diameter: ${2 * radius} ÷ 2 = **${radius} cm**.`,
      };
    },
  },
  {
    key: "sa-circle-stretch",
    skill: S.circles,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const radius = int(r, 2, 9);
      const n = int(r, 3, 5);
      return {
        kind: "number",
        prompt: `**${n} coins**, each with a **radius of ${radius} cm**, fit exactly side by side in a row inside a box. How long is the box?`,
        answer: 2 * radius * n,
        unit: "cm",
        traps: [{ value: radius * n, misconception: M.radiusDiameter, feedback: "Each coin is a whole diameter wide: twice the radius." }],
        hint: "How wide is one coin?",
        hints: [`One coin is a diameter wide: 2 × ${radius} = ${2 * radius} cm.`, `${n} coins: ${n} × ${2 * radius}.`],
        explanation: `Each coin is 2 × ${radius} = ${2 * radius} cm across. ${n} × ${2 * radius} = **${2 * radius * n} cm**.`,
      };
    },
  },
  {
    key: "sa-estimate",
    skill: S.estimate,
    difficulties: [1, 2],
    make: (r, { difficulty }) => {
      const deg = difficulty === 1 ? pick(r, [30, 45, 60, 120, 135, 150]) : pick(r, [25, 35, 40, 50, 55, 65, 70, 80, 100, 110, 115, 125, 140, 145, 160, 165]);
      const options = [deg, deg + 50, deg - 50, deg + 100, deg - 100].filter((x) => x > 0 && x < 180 && x !== 90);
      const pickd = [deg, ...options.slice(1).sort(() => r() - 0.5).slice(0, 3)].sort((a, b) => a - b);
      return {
        kind: "choose",
        prompt: "Estimate the size of this angle. Which is **closest**?",
        visual: { kind: "angle", degrees: deg },
        options: pickd.map((x) => (x === deg ? { text: `${x}°` } : { text: `${x}°`, feedback: x < deg ? "Too small: compare the angle with a right angle (90°)." : "Too big: compare the angle with a right angle (90°)." })),
        answer: pickd.indexOf(deg),
        fixedOrder: true,
        hint: "Is it smaller or bigger than a right angle (90°)?",
        hints: ["Half a right angle is 45°. A straight line is 180°.", deg < 90 ? "It's acute: less than 90°." : "It's obtuse: between 90° and 180°."],
        explanation: `The angle is ${deg < 90 ? "less" : "more"} than a right angle, so it is about **${deg}°**.`,
      };
    },
  },
  {
    key: "sa-clock-angle",
    skill: S.estimate,
    difficulties: [2],
    make: (r) => {
      const h = int(r, 1, 5);
      return {
        kind: "number",
        prompt: `What is the angle between the hands of a clock at **${h} o'clock**?`,
        visual: { kind: "clock", hours: h, minutes: 0 },
        answer: 30 * h,
        unit: "°",
        traps: [{ value: 5 * h, misconception: M.clockHand, feedback: "Each hour mark is 30°, not 5°: 360° ÷ 12 = 30°." }],
        hint: "A full turn is 360°, and the clock has 12 hour marks.",
        hints: ["360° ÷ 12 = 30° between hour marks.", `${h} hour marks apart: ${h} × 30°.`],
        explanation: `360° ÷ 12 = 30° between hour marks. At ${h} o'clock the hands are ${h} marks apart: ${h} × 30° = **${30 * h}°**.`,
      };
    },
  },
  {
    key: "sa-clock-stretch",
    skill: S.estimate,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const h = int(r, 1, 5);
      const answer = clockAngle(h, 30);
      return {
        kind: "number",
        prompt: `At **${h}:30**, what is the smaller angle between the hands of a clock?`,
        visual: { kind: "clock", hours: h, minutes: 30 },
        answer,
        unit: "°",
        traps: [{ value: Math.abs(180 - 30 * h), misconception: M.clockHand, feedback: "At half past, the hour hand has moved halfway to the next hour: another 15°." }].filter((t) => t.value !== answer),
        hint: "Where is the hour hand at half past? It isn't exactly on the hour.",
        hints: ["The minute hand points at 6, which is 180° from 12.", `The hour hand is halfway between ${h} and ${h + 1}: ${30 * h + 15}° from 12.`],
        explanation: `Minute hand: 180°. Hour hand: ${30 * h}° + 15° = ${30 * h + 15}°. Difference: 180° − ${30 * h + 15}° = **${answer}°**.`,
      };
    },
  },
];

export const shapesAnglesExtra: TopicExtra = {
  skills: [
    { id: S.symmetry, title: "Symmetry", description: "Find lines of symmetry and complete reflections.", lessonId: "symmetry" },
    { id: S.nets, title: "Nets of 3-D shapes", description: "Tell which flat nets fold into cubes, prisms and pyramids.", lessonId: "nets" },
    { id: S.circles, title: "Parts of a circle", description: "Name the radius, diameter, centre and circumference; the diameter is twice the radius.", lessonId: "circles" },
    { id: S.estimate, title: "Estimating angles", description: "Estimate angles in degrees, and find angles on a clock face.", lessonId: "estimate" },
  ],
  lessonIcons: { symmetry: "paint", nets: "shapes", circles: "target", estimate: "angle" },
  lessons: [
    {
      id: "symmetry",
      title: "Lines of symmetry",
      phase: "Visualise",
      summary: "A line of symmetry folds a shape into two matching halves.",
      minutes: 7,
      objectives: ["Find lines of symmetry in 2-D shapes", "Complete a shape by reflecting it in a mirror line"],
      steps: [
        {
          type: "explain",
          title: "Fold and match",
          body: [
            "A **line of symmetry** is a fold line: the two halves match exactly, like a mirror. A square has **4** (up and down, across, and both diagonals). A rectangle has only **2**: folding along a diagonal doesn't make the halves match.",
            "To **reflect** a shape, each point moves to the other side of the mirror line, the **same distance** away. In this grid, a square 1 away from the mirror has its reflection 1 away on the other side.",
          ],
          visual: { kind: "symmetry", size: 6, cells: [[2, 1], [1, 2], [2, 2], [2, 3], [0, 4]], mirror: "vertical", reflected: true },
          tip: "Count the squares to the mirror, then the same number past it.",
        },
        {
          type: "worked",
          title: "Watch me: lines of symmetry in a rhombus",
          support: "full",
          problem: "How many lines of symmetry does a **rhombus** have?",
          visual: { kind: "shape", name: "rhombus" },
          steps: [{ text: "Fold from top corner to bottom corner: the halves match." }, { text: "Fold from left corner to right corner: they match too. Folding up the middle of a side doesn't." }],
          conclusion: "A rhombus has **2** lines of symmetry.",
        },
        {
          type: "worked",
          title: "Let's do it together",
          support: "faded",
          problem: "How many lines of symmetry does a **regular hexagon** have?",
          visual: { kind: "shape", name: "hexagon" },
          steps: [
            { text: "Corner to opposite corner: 3 lines." },
            { text: "Middle of a side to the middle of the opposite side: 3 more.", blank: { prompt: "How many altogether?", answer: 6, hint: "3 + 3.", traps: [{ value: 3, misconception: M.diagonals, feedback: "There are also 3 lines through the middles of opposite sides." }], worked: "3 + 3 = **6**." } },
          ],
          conclusion: "A regular hexagon has **6** lines of symmetry.",
        },
        { type: "check", title: "Your turn", questionId: gen("sa-sym-lines", 1, 3) },
        { type: "check", title: "One more", questionId: gen("sa-sym-reflect", 1, 5) },
      ],
    },
    {
      id: "nets",
      title: "Nets of 3-D shapes",
      phase: "Explore",
      summary: "A net is a flat shape that folds up into a 3-D shape.",
      minutes: 8,
      objectives: ["Tell whether 6 squares fold into a cube", "Match nets to prisms and pyramids"],
      steps: [
        {
          type: "explain",
          title: "Unfold a box",
          body: [
            "Cut along some edges of a cardboard box and lay it flat: that flat shape is a **net**. A cube has 6 square faces, so a cube's net has 6 squares, but not every 6 squares will do. Each square must fold onto a different face, with none overlapping.",
            "A good test: choose one square as the bottom, then fold the others up around it in your head. **Five in a row** or a **2 by 2 block** can never make a cube. This net, a row of four with one square above and one below, does.",
          ],
          visual: { kind: "net", cells: [[1, 0], [0, 1], [1, 1], [2, 1], [3, 1], [1, 2]] },
          tip: "Pyramids have triangles meeting at a point; prisms have two matching ends joined by rectangles.",
        },
        {
          type: "worked",
          title: "Watch me: which shape is this net?",
          support: "full",
          problem: "Which 3-D shape does this net make?",
          visual: { kind: "net", solid: "triangular-prism" },
          steps: [{ text: "There are 2 triangles and 3 rectangles: 5 faces." }, { text: "Two matching triangle ends joined by rectangles make a prism." }],
          conclusion: "It is a **triangular prism**.",
        },
        {
          type: "worked",
          title: "Let's do it together",
          support: "faded",
          problem: "A square-based pyramid is made from this net. How many faces does it have?",
          visual: { kind: "net", solid: "square-pyramid" },
          steps: [{ text: "There is 1 square for the bottom, and a triangle on each side of it.", blank: { prompt: "How many faces?", answer: 5, hint: "1 square + 4 triangles.", traps: [{ value: 4, feedback: "Don't forget the square base: 1 + 4." }], worked: "1 + 4 = **5** faces." } }],
          conclusion: "A square-based pyramid has **5** faces.",
        },
        { type: "check", title: "Your turn", questionId: gen("sa-net-cube", 1, 3) },
        { type: "check", title: "One more", questionId: gen("sa-net-solid", 2, 5) },
      ],
    },
    {
      id: "circles",
      title: "Parts of a circle",
      phase: "Understand",
      summary: "The diameter is twice the radius.",
      minutes: 7,
      objectives: ["Name the centre, radius, diameter and circumference", "Use diameter = 2 × radius"],
      steps: [
        {
          type: "explain",
          title: "Centre, radius, diameter",
          body: [
            "Every point on a circle's edge is the same distance from its **centre**. That distance is the **radius**: a straight line from the centre to the edge. The **diameter** goes all the way across, through the centre, so it is **two radii**: diameter = 2 × radius.",
            "The **circumference** is the distance all the way round the edge. A circle with a radius of 5 cm has a diameter of 10 cm.",
          ],
          visual: { kind: "circle", radius: "radius", diameter: "diameter", centre: true },
          tip: "Radius is the shorter word and the shorter line.",
        },
        {
          type: "worked",
          title: "Watch me: radius from a diameter",
          support: "full",
          problem: "A circle has a diameter of **18 cm**. What is its radius?",
          visual: { kind: "circle", diameter: "18 cm", centre: true },
          steps: [{ text: "The radius is half the diameter." }, { text: "18 ÷ 2 = 9." }],
          conclusion: "The radius is **9 cm**.",
        },
        {
          type: "worked",
          title: "Let's do it together",
          support: "faded",
          problem: "A circle has a radius of **7 cm**. What is its diameter?",
          steps: [{ text: "The diameter is two radii.", blank: { prompt: "Diameter in cm?", answer: 14, hint: "2 × 7.", traps: [{ value: 7, misconception: M.radiusDiameter, feedback: "The diameter goes all the way across: 2 × 7." }], worked: "2 × 7 = **14** cm." } }],
          conclusion: "The diameter is **14 cm**.",
        },
        { type: "check", title: "Your turn", questionId: gen("sa-circle-parts", 1, 3) },
        { type: "check", title: "One more", questionId: gen("sa-circle-diameter", 1, 5) },
      ],
    },
    {
      id: "estimate",
      title: "Estimating angles",
      phase: "Practise",
      summary: "Compare with a right angle: 90°, half of it 45°, a straight line 180°.",
      minutes: 7,
      objectives: ["Estimate angles in degrees", "Find the angle between clock hands"],
      steps: [
        {
          type: "explain",
          title: "Use benchmarks",
          body: [
            "To estimate an angle, compare it with angles you know. A **right angle** is **90°**; half a right angle is **45°**; a straight line is **180°**. This angle is wider than a right angle but nowhere near a straight line, so it is about **120°**.",
            "A clock face helps too. A full turn is 360° and there are 12 hour marks, so each hour mark is **360 ÷ 12 = 30°** apart. At 3 o'clock the hands make 3 × 30° = 90°.",
          ],
          visual: { kind: "angle", degrees: 120 },
          tip: "Decide acute or obtuse first; that rules out half the options.",
        },
        {
          type: "worked",
          title: "Watch me: 4 o'clock",
          support: "full",
          problem: "What angle do the hands make at **4 o'clock**?",
          visual: { kind: "clock", hours: 4, minutes: 0 },
          steps: [{ text: "Each hour mark is 30° apart." }, { text: "The hands are 4 marks apart: 4 × 30° = 120°." }],
          conclusion: "The angle is **120°**.",
        },
        {
          type: "worked",
          title: "Let's do it together",
          support: "faded",
          problem: "What angle do the hands make at **2 o'clock**?",
          visual: { kind: "clock", hours: 2, minutes: 0 },
          steps: [{ text: "The hands are 2 hour marks apart.", blank: { prompt: "How many degrees?", answer: 60, hint: "2 × 30°.", traps: [{ value: 10, misconception: M.clockHand, feedback: "Each hour mark is 30°, not 5°: 2 × 30°." }], worked: "2 × 30° = **60**°." } }],
          conclusion: "The angle is **60°**.",
        },
        { type: "check", title: "Your turn", questionId: gen("sa-estimate", 1, 3) },
        { type: "check", title: "One more", questionId: gen("sa-clock-angle", 2, 5) },
      ],
    },
  ],
  templates,
  misconceptions: [
    {
      id: M.diagonals,
      name: "Every line through a corner is symmetry",
      possibleCause: "You might have counted fold lines where the halves don't match.",
      description: "Counts diagonals of rectangles or parallelograms as lines of symmetry, or gives the number of sides.",
      explanation: ["Fold the shape in your head along the line: do the halves land exactly on each other?", "A rectangle's diagonals are not lines of symmetry."],
      skills: [S.symmetry],
      followUpTemplates: ["sa-sym-lines"],
    },
    {
      id: M.anyNet,
      name: "Any 6 squares make a cube",
      possibleCause: "You might have thought any 6 joined squares fold into a cube.",
      description: "Accepts arrangements of 6 squares, such as a 2 by 3 block, that can't fold into a cube.",
      explanation: ["Each square must become a different face.", "Five in a row, or a 2 by 2 block, always overlap when folded."],
      skills: [S.nets],
      followUpTemplates: ["sa-net-cube"],
    },
    {
      id: M.radiusDiameter,
      name: "Radius and diameter mixed up",
      possibleCause: "You might have mixed up the radius and the diameter.",
      description: "Uses the radius as the diameter or halves where it should double.",
      explanation: ["The radius goes from the centre to the edge.", "The diameter goes right across: diameter = 2 × radius."],
      skills: [S.circles],
      followUpTemplates: ["sa-circle-diameter"],
    },
    {
      id: M.clockHand,
      name: "Each hour is 5 degrees",
      possibleCause: "You might have counted minutes (5 per hour mark) instead of degrees.",
      description: "Takes each hour mark on a clock as 5° (from the 5 minutes) instead of 30°, or forgets that the hour hand moves.",
      explanation: ["A full turn is 360°, shared between 12 hour marks: 30° each.", "At half past, the hour hand is halfway to the next hour."],
      skills: [S.estimate],
      followUpTemplates: ["sa-clock-angle"],
    },
  ],
  placement: [
    { lessonId: "symmetry", template: "sa-sym-lines" },
    { lessonId: "nets", template: "sa-net-cube" },
    { lessonId: "circles", template: "sa-circle-parts" },
    { lessonId: "estimate", template: "sa-estimate" },
  ],
};
