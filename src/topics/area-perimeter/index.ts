import { defineTopic, genFor, int, pick } from "@/topics/kit/define";
import type { KitVisual, Template } from "@/topics/kit/types";

/** Area and perimeter: perimeter of rectangles and L-shapes, area by counting and by multiplying, and missing sides. */

const T = "area-perimeter";
const gen = genFor(T);
const S = { perimeter: `${T}.perimeter`, count: `${T}.area-counting`, area: `${T}.area-rectangles`, compound: `${T}.compound`, missing: `${T}.missing-sides` };
const M = { mixup: `${T}.area-perimeter-mixed`, two: `${T}.two-sides-only`, add: `${T}.adding-for-area`, cut: `${T}.missing-corner`, unknown: `${T}.missing-side` };

/** An L-shape: a w × h rectangle with a cw × ch corner taken away, all whole numbers. */
function lShape(r: () => number, big: boolean) {
  const w = int(r, big ? 6 : 4, big ? 12 : 7);
  const h = int(r, big ? 5 : 3, big ? 10 : 6);
  const cw = int(r, 1, w - 2);
  const ch = int(r, 1, h - 2);
  return { w, h, cw, ch, area: w * h - cw * ch, perimeter: 2 * (w + h) };
}
const lLabels = (l: ReturnType<typeof lShape>, u: string, hideInner = false): KitVisual => ({
  kind: "rect",
  w: l.w,
  h: l.h,
  cut: { w: l.cw, h: l.ch },
  labels: {
    top: `${l.w - l.cw} ${u}`,
    right: `${l.h - l.ch} ${u}`,
    bottom: `${l.w} ${u}`,
    left: `${l.h} ${u}`,
    ...(hideInner ? {} : { innerV: `${l.ch} ${u}`, innerH: `${l.cw} ${u}` }),
  },
});

const templates: Template[] = [
  {
    key: "ap-perimeter",
    skill: S.perimeter,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      if (difficulty === 3) {
        const l = lShape(r, false);
        return {
          kind: "number",
          prompt: "What is the **perimeter** of this shape?",
          visual: lLabels(l, "cm"),
          answer: l.perimeter,
          unit: "cm",
          traps: [{ value: l.area, misconception: M.mixup, feedback: "That's the area. Perimeter is the distance all the way round." }, { value: l.w + l.h, misconception: M.two, feedback: "Go all the way round: add all six sides." }].filter((t) => t.value !== l.perimeter),
          hint: "Add all six sides. Start at one corner and go round.",
          explanation: `${l.w - l.cw} + ${l.ch} + ${l.cw} + ${l.h - l.ch} + ${l.w} + ${l.h} = **${l.perimeter} cm**.`,
        };
      }
      const w = int(r, 3, difficulty === 1 ? 7 : 15);
      let h = int(r, 2, difficulty === 1 ? 5 : 12);
      if (h === w) h = Math.max(2, h - 1);
      const p = 2 * (w + h);
      return {
        kind: "number",
        prompt: difficulty === 1 ? "Each square is **1 cm** long. What is the **perimeter** of the rectangle?" : "What is the **perimeter** of this rectangle?",
        visual: difficulty === 1 ? { kind: "rect", w, h, grid: true } : { kind: "rect", w, h, labels: { bottom: `${w} cm`, left: `${h} cm` } },
        answer: p,
        unit: "cm",
        traps: [{ value: w * h, misconception: M.mixup, feedback: "That's the area: the squares inside. Perimeter is the distance round the edge." }, { value: w + h, misconception: M.two, feedback: "A rectangle has four sides. Add them all." }].filter((t) => t.value !== p),
        hint: difficulty === 1 ? "Count the edges of the squares all the way round." : "The opposite sides are the same length. Add all four.",
        explanation: `${w} + ${h} + ${w} + ${h} = **${p} cm**.`,
      };
    },
  },
  {
    key: "ap-count",
    skill: S.count,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      if (difficulty === 1) {
        const w = int(r, 3, 6);
        const h = int(r, 2, 4);
        return {
          kind: "number",
          prompt: "Each square is **1 cm²**. What is the **area** of the rectangle?",
          visual: { kind: "rect", w, h, grid: true },
          answer: w * h,
          unit: "cm²",
          traps: [{ value: 2 * (w + h), misconception: M.mixup, feedback: "That's the perimeter. Area is how many squares are inside." }, { value: w + h, misconception: M.add, feedback: "Count every square inside, not just one row and one column." }].filter((t) => t.value !== w * h),
          hint: `Count the squares. Or: ${h} rows of ${w}.`,
          explanation: `${h} rows of ${w} squares: ${h} × ${w} = **${w * h} cm²**.`,
        };
      }
      const l = lShape(r, difficulty === 3);
      return {
        kind: "number",
        prompt: "Each square is **1 cm²**. What is the **area** of this shape?",
        visual: { kind: "rect", w: l.w, h: l.h, cut: { w: l.cw, h: l.ch }, grid: true },
        answer: l.area,
        unit: "cm²",
        traps: [{ value: l.w * l.h, misconception: M.cut, feedback: "The corner piece is missing. Don't count squares that aren't there." }, { value: l.perimeter, misconception: M.mixup, feedback: "That's the perimeter. Area is the squares inside." }].filter((t) => t.value !== l.area),
        hint: "Split the shape into two rectangles and count each.",
        explanation: `The whole ${l.w} × ${l.h} rectangle is ${l.w * l.h} squares. Take away the missing ${l.cw} × ${l.ch} corner: ${l.w * l.h} − ${l.cw * l.ch} = **${l.area} cm²**.`,
      };
    },
  },
  {
    key: "ap-area",
    skill: S.area,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const square = difficulty === 3 && r() < 0.4;
      const w = int(r, difficulty === 1 ? 2 : 4, difficulty === 1 ? 6 : 12);
      const h = square ? w : int(r, 2, difficulty === 1 ? 5 : difficulty === 2 ? 9 : 12);
      const u = difficulty === 3 ? pick(r, ["m", "cm"]) : "cm";
      const area = w * h;
      return {
        kind: "number",
        prompt: square ? `A square has sides of **${w} ${u}**. What is its **area**?` : "What is the **area** of this rectangle?",
        visual: square ? undefined : { kind: "rect", w, h, labels: { bottom: `${w} ${u}`, left: `${h} ${u}` } },
        answer: area,
        unit: `${u}²`,
        traps: [{ value: 2 * (w + h), misconception: M.mixup, feedback: "That's the perimeter. Area = length × width." }, { value: w + h, misconception: M.add, feedback: "For area, multiply the sides: don't add them." }, ...(square ? [{ value: 4 * w, misconception: M.mixup, feedback: "That's the perimeter. Area = side × side." }] : [])].filter((t, i, all) => t.value !== area && all.findIndex((x) => x.value === t.value) === i),
        hint: "Area of a rectangle = length × width.",
        explanation: `${w} × ${h} = **${area} ${u}²**.`,
      };
    },
  },
  {
    key: "ap-compound",
    skill: S.compound,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const l = lShape(r, difficulty > 1);
      const hide = difficulty === 3;
      const u = difficulty === 1 ? "cm" : pick(r, ["cm", "m"]);
      return {
        kind: "number",
        prompt: hide ? `Some sides aren't labelled. Work them out, then find the **area** of the shape.` : "Find the **area** of this shape.",
        visual: lLabels(l, u, hide),
        answer: l.area,
        unit: `${u}²`,
        traps: [{ value: l.w * l.h, misconception: M.cut, feedback: "That's the whole rectangle. Take away the missing corner." }, { value: l.perimeter, misconception: M.mixup, feedback: "That's the perimeter. Split the shape into rectangles and add their areas." }].filter((t) => t.value !== l.area),
        hint: hide ? `The missing corner is ${l.w} − ${l.w - l.cw} wide and ${l.h} − ${l.h - l.ch} tall.` : "Split it into two rectangles. Find each area and add them.",
        explanation: `Whole rectangle: ${l.w} × ${l.h} = ${l.w * l.h}. Missing corner: ${l.cw} × ${l.ch} = ${l.cw * l.ch}. Area = ${l.w * l.h} − ${l.cw * l.ch} = **${l.area} ${u}²**.`,
      };
    },
  },
  {
    key: "ap-missing",
    skill: S.missing,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      if (difficulty === 1) {
        const side = int(r, 2, 12);
        return {
          kind: "number",
          prompt: `A square has a perimeter of **${4 * side} cm**. How long is each side?`,
          answer: side,
          unit: "cm",
          traps: [{ value: 2 * side, misconception: M.two, feedback: "A square has four equal sides, so divide by 4." }],
          hint: "A square has 4 equal sides. Divide the perimeter by 4.",
          explanation: `${4 * side} ÷ 4 = **${side} cm**.`,
        };
      }
      const w = int(r, 3, 12);
      let h = int(r, 2, 11);
      if (h === w) h += 1;
      if (difficulty === 2) {
        const area = w * h;
        return {
          kind: "number",
          prompt: `A rectangle has an area of **${area} cm²**. One side is **${w} cm**. How long is the other side?`,
          visual: { kind: "rect", w, h, labels: { bottom: `${w} cm`, left: "?" } },
          answer: h,
          unit: "cm",
          traps: [{ value: area - w, misconception: M.unknown, feedback: "Area = length × width, so divide: area ÷ the side you know." }],
          hint: `What times ${w} makes ${area}?`,
          explanation: `${area} ÷ ${w} = **${h} cm**.`,
        };
      }
      const p = 2 * (w + h);
      return {
        kind: "number",
        prompt: `A rectangle has a perimeter of **${p} cm**. One side is **${w} cm**. How long is the side next to it?`,
        visual: { kind: "rect", w, h, labels: { bottom: `${w} cm`, left: "?" } },
        answer: h,
        unit: "cm",
        traps: [{ value: p - w, misconception: M.two, feedback: `There are two sides of ${w} cm. Take both away, then halve.` }, { value: p / 2, misconception: M.unknown, feedback: `Half the perimeter is one long side + one short side: ${p / 2} − ${w}.` }, { value: p - 2 * w, misconception: M.two, feedback: "That's both short sides together. Halve it." }].filter((t) => t.value !== h),
        hint: `Half the perimeter is one ${w} cm side plus one missing side.`,
        explanation: `Half of ${p} is ${p / 2}. ${p / 2} − ${w} = **${h} cm**.`,
      };
    },
  },
];

export const areaPerimeter = defineTopic({
  id: T,
  title: "Area and perimeter",
  subtitle: "Perimeter all the way round, area inside: counting, multiplying, L-shapes and missing sides",
  world: "measure",
  years: [3, 4, 5, 6],
  order: 3,
  icon: "area",
  skills: [
    { id: S.perimeter, title: "Perimeter", description: "Find the distance all the way round a rectangle or an L-shape.", lessonId: "perimeter" },
    { id: S.count, title: "Area by counting", description: "Count squares to find area, in cm².", lessonId: "area" },
    { id: S.area, title: "Area of rectangles", description: "Find area by multiplying length × width.", lessonId: "rectangles" },
    { id: S.compound, title: "L-shapes", description: "Split shapes into rectangles to find their area.", lessonId: "compound" },
    { id: S.missing, title: "Missing sides", description: "Find a missing side from the area or perimeter.", lessonId: "missing" },
  ],
  lessonIcons: { perimeter: "ruler", area: "area", rectangles: "times", compound: "shapes", missing: "magnifier" },
  lessons: [
    {
      id: "perimeter",
      title: "Perimeter",
      phase: "Understand",
      summary: "Perimeter is the distance all the way round.",
      minutes: 6,
      objectives: ["Know what perimeter means", "Find the perimeter of rectangles"],
      steps: [
        {
          type: "explain",
          title: "All the way round",
          body: ["The **perimeter** is the distance **all the way round** a shape, like a fence round a field.", "This rectangle is 5 cm by 3 cm. Go round: 5 + 3 + 5 + 3 = **16 cm**."],
          visual: { kind: "rect", w: 5, h: 3, grid: true, labels: { top: "5 cm", right: "3 cm", bottom: "5 cm", left: "3 cm" } },
          tip: "A rectangle's opposite sides are equal, so you only need two lengths.",
        },
        { type: "check", title: "Your turn", questionId: gen("ap-perimeter", 1, 2) },
        { type: "check", title: "One more", questionId: gen("ap-perimeter", 2, 5) },
      ],
    },
    {
      id: "area",
      title: "Area: squares inside",
      phase: "Visualise",
      summary: "Area is how many squares cover the inside.",
      minutes: 6,
      objectives: ["Know what area means", "Find area by counting squares"],
      steps: [
        {
          type: "explain",
          title: "Cover it in squares",
          body: ["The **area** is the space **inside** a shape. We measure it in squares: each one here is **1 cm²** (a square centimetre).", "There are 3 rows of 4 squares: **12 cm²**."],
          visual: { kind: "rect", w: 4, h: 3, grid: true },
          tip: "Perimeter goes round the edge. Area fills the inside.",
        },
        { type: "check", title: "Your turn", questionId: gen("ap-count", 1, 4) },
        { type: "check", title: "One more", questionId: gen("ap-count", 2, 9) },
      ],
    },
    {
      id: "rectangles",
      title: "Area of rectangles",
      phase: "Practise",
      summary: "Area = length × width.",
      minutes: 6,
      objectives: ["Use length × width to find area"],
      steps: [
        {
          type: "worked",
          title: "A quicker way",
          support: "full",
          problem: "Find the area of a rectangle **8 cm** long and **5 cm** wide.",
          visual: { kind: "rect", w: 8, h: 5, labels: { bottom: "8 cm", left: "5 cm" } },
          steps: [{ text: "Imagine the squares: 5 rows of 8." }, { text: "5 × 8 = **40**." }],
          conclusion: "The area is **40 cm²**.",
        },
        { type: "check", title: "Your turn", questionId: gen("ap-area", 1, 3) },
        { type: "check", title: "One more", questionId: gen("ap-area", 2, 7) },
      ],
    },
    {
      id: "compound",
      title: "L-shapes",
      phase: "Explore",
      summary: "Split it into rectangles, or take a corner away.",
      minutes: 8,
      objectives: ["Find the area of shapes made of rectangles"],
      steps: [
        {
          type: "worked",
          title: "Take away the corner",
          support: "full",
          problem: "Find the area of this shape.",
          visual: { kind: "rect", w: 8, h: 6, cut: { w: 3, h: 2 }, labels: { top: "5 cm", innerV: "2 cm", innerH: "3 cm", right: "4 cm", bottom: "8 cm", left: "6 cm" } },
          steps: [{ text: "Imagine the whole rectangle: 8 × 6 = **48 cm²**." }, { text: "The missing corner is 3 × 2 = **6 cm²**." }, { text: "48 − 6 = **42**." }],
          conclusion: "The area is **42 cm²**.",
        },
        { type: "check", title: "Your turn", questionId: gen("ap-compound", 1, 2) },
        { type: "check", title: "One more", questionId: gen("ap-compound", 3, 4) },
      ],
    },
    {
      id: "missing",
      title: "Missing sides",
      phase: "Apply",
      summary: "Work backwards from the area or the perimeter.",
      minutes: 7,
      objectives: ["Find a missing side from the perimeter", "Find a missing side from the area"],
      steps: [
        {
          type: "worked",
          title: "Let's do it together",
          support: "faded",
          problem: "A rectangle has an area of **36 cm²**. One side is **9 cm**. How long is the other side?",
          visual: { kind: "rect", w: 9, h: 4, labels: { bottom: "9 cm", left: "?" } },
          steps: [
            { text: "Area = length × width, so 9 × ? = 36." },
            { text: "Divide to find it.", blank: { prompt: "What is 36 ÷ 9?", answer: 4, hint: "9 × 4 = 36.", worked: "36 ÷ 9 = **4**." } },
          ],
          conclusion: "The other side is **4 cm**.",
        },
        { type: "check", title: "Your turn", questionId: gen("ap-missing", 1, 3) },
        { type: "check", title: "One more", questionId: gen("ap-missing", 3, 6) },
      ],
    },
  ],
  templates,
  misconceptions: [
    { id: M.mixup, name: "Area and perimeter mixed up", possibleCause: "It looks like area and perimeter got swapped.", description: "Gives the area when asked for the perimeter, or the other way round.", explanation: ["Perimeter: the distance round the edge, in cm.", "Area: the squares inside, in cm²."], skills: [S.perimeter, S.count, S.area, S.compound], followUpTemplates: ["ap-perimeter", "ap-area"] },
    { id: M.two, name: "Only two sides", possibleCause: "It looks like only some of the sides were used.", description: "Adds length + width for the perimeter of a rectangle.", explanation: ["A rectangle has four sides.", "Perimeter = length + width + length + width."], skills: [S.perimeter, S.missing], followUpTemplates: ["ap-perimeter", "ap-missing"] },
    { id: M.add, name: "Adding for area", possibleCause: "It looks like the sides were added, not multiplied.", description: "Finds the area of 5 cm × 3 cm as 8 cm².", explanation: ["Area counts squares: rows × columns.", "5 × 3 = 15 cm²."], skills: [S.count, S.area], followUpTemplates: ["ap-count", "ap-area"] },
    { id: M.cut, name: "Forgetting the missing corner", possibleCause: "It looks like the L-shape was treated as a whole rectangle.", description: "Finds the area of the whole rectangle.", explanation: ["Find the whole rectangle, then take away the missing corner.", "Or split the shape into two rectangles."], skills: [S.count, S.compound], followUpTemplates: ["ap-compound", "ap-count"] },
    { id: M.unknown, name: "Working backwards", possibleCause: "It looks like the wrong operation was used to work backwards.", description: "Takes away instead of dividing to find a missing side.", explanation: ["From the area: divide by the side you know.", "From the perimeter: halve it, then take away the side you know."], skills: [S.missing], followUpTemplates: ["ap-missing"] },
  ],
  placement: [
    { lessonId: "perimeter", template: "ap-perimeter" },
    { lessonId: "area", template: "ap-count" },
    { lessonId: "rectangles", template: "ap-area" },
    { lessonId: "compound", template: "ap-compound" },
    { lessonId: "missing", template: "ap-missing" },
  ],
});
