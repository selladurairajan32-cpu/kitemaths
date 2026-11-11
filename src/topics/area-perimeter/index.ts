import { defineTopic, genFor, int, pick, withExtras, withHints } from "@/topics/kit/define";
import { areaExtra } from "./extra";
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

const baseTemplates: Template[] = [
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
  /* D-037 (Phase B): two more question makers per skill, one of them a stretch question. */
  {
    key: "ap-perimeter-square",
    skill: S.perimeter,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const side = int(r, 2, difficulty === 1 ? 9 : 25);
      const askSide = difficulty === 3;
      return askSide
        ? {
            kind: "number",
            prompt: `A square has a perimeter of **${side * 4} cm**. How long is one side?`,
            visual: { kind: "rect", w: 4, h: 4, labels: { bottom: "? cm" } },
            unit: "cm",
            answer: side,
            traps: [{ value: side * 2, misconception: M.two, feedback: "A square has 4 equal sides, so divide the perimeter by 4." }],
            hint: "A square has 4 equal sides.",
            explanation: `${side * 4} ÷ 4 = **${side} cm**.`,
          }
        : {
            kind: "number",
            prompt: `A square has sides of **${side} cm**. What is its perimeter?`,
            visual: { kind: "rect", w: 4, h: 4, labels: { bottom: `${side} cm` } },
            unit: "cm",
            answer: side * 4,
            traps: [{ value: side * side, misconception: M.mixup, feedback: "That's the area. Perimeter is the distance round: add all 4 sides." }, { value: side * 2, misconception: M.two, feedback: "A square has 4 sides to go round, not 2." }].filter((t) => t.value !== side * 4),
            hint: "A square has 4 equal sides. Go all the way round.",
            explanation: `${side} × 4 = **${side * 4} cm**.`,
          };
    },
  },
  {
    key: "ap-perimeter-stretch",
    skill: S.perimeter,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const l = lShape(r, true);
      return {
        kind: "number",
        prompt: "What is the **perimeter** of this shape? Two sides aren't labelled: work them out first.",
        visual: lLabels(l, "m", true),
        unit: "m",
        answer: l.perimeter,
        traps: [{ value: l.perimeter - l.cw - l.ch, misconception: M.cut, feedback: "Two sides have no labels. Work out their lengths and include them." }, { value: l.area, misconception: M.mixup, feedback: "That's the area. Perimeter is the distance all the way round." }].filter((t) => t.value !== l.perimeter),
        hint: "The missing sides are the differences: compare the long sides with the short ones opposite them.",
        explanation: `The two hidden sides are ${l.cw} m and ${l.ch} m. All the way round: **${l.perimeter} m** (the same as the whole ${l.w} × ${l.h} rectangle).`,
      };
    },
  },
  {
    key: "ap-count-half",
    skill: S.count,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const w = int(r, 2, difficulty === 1 ? 5 : 8);
      const h = int(r, 2, 6);
      return {
        kind: "number",
        prompt: `A rectangle is **${w} squares** long and **${h} squares** high. A line from corner to corner cuts it in half. What is the area of **one half**, in squares?`,
        visual: { kind: "rect", w, h, grid: true },
        unit: "squares",
        answer: (w * h) / 2,
        decimals: 1,
        traps: [{ value: w * h, feedback: "That's the whole rectangle. A corner-to-corner line cuts it into two equal halves." }],
        hint: `Count all the squares, then halve.`,
        explanation: `The whole rectangle is ${w} × ${h} = ${w * h} squares, so half is **${(w * h) / 2}**.`,
      };
    },
  },
  {
    key: "ap-count-stretch",
    skill: S.count,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const area = pick(r, [12, 16, 18, 20, 24]);
      const pairs = [];
      for (let w = 1; w <= area; w++) if (area % w === 0 && w <= area / w) pairs.push([w, area / w]);
      return {
        kind: "number",
        prompt: `How many **different rectangles** with whole-number sides have an area of **${area} squares**? (A 2 × 6 and a 6 × 2 count as the same rectangle.)`,
        answer: pairs.length,
        traps: [{ value: pairs.length * 2, feedback: "Turning a rectangle round doesn't make a new one." }],
        hint: `Find pairs of numbers that multiply to make ${area}.`,
        explanation: `${pairs.map(([a, b]) => `${a} × ${b}`).join(", ")}: **${pairs.length}** rectangles.`,
      };
    },
  },
  {
    key: "ap-area-word",
    skill: S.area,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const l = int(r, 3, difficulty === 1 ? 9 : 15);
      const w = int(r, 2, difficulty === 1 ? 6 : 12);
      const thing = pick(r, ["A classroom floor", "A garden lawn", "A playground"]);
      return {
        kind: "number",
        prompt: `${thing} is a rectangle **${l} m** long and **${w} m** wide. What is its area?`,
        unit: "m²",
        answer: l * w,
        traps: [{ value: 2 * (l + w), misconception: M.mixup, feedback: "That's the perimeter. Area is length × width." }, { value: l + w, misconception: M.add, feedback: "Area means multiply the sides, not add them." }].filter((t) => t.value !== l * w),
        hint: "Area of a rectangle = length × width.",
        explanation: `${l} × ${w} = **${l * w} m²**.`,
      };
    },
  },
  {
    key: "ap-area-stretch",
    skill: S.area,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const l = int(r, 4, 10);
      const w = int(r, 3, 8);
      const tile = pick(r, [2]);
      const lw = l * tile;
      const ww = w * tile;
      return {
        kind: "number",
        prompt: `A floor is **${lw} m** by **${ww} m**. Square tiles are **${tile} m** by **${tile} m**. How many tiles cover the floor?`,
        answer: l * w,
        traps: [{ value: lw * ww, feedback: `That's the floor's area in m². Each tile covers ${tile * tile} m².` }, { value: (lw * ww) / tile, feedback: `Each tile covers ${tile} × ${tile} = ${tile * tile} m², not ${tile} m².` }].filter((t) => t.value !== l * w),
        hint: `How many tiles fit along each side?`,
        explanation: `${lw} ÷ ${tile} = ${l} tiles along, ${ww} ÷ ${tile} = ${w} tiles across: ${l} × ${w} = **${l * w}** tiles.`,
      };
    },
  },
  {
    key: "ap-compound-split",
    skill: S.compound,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const l = lShape(r, difficulty > 1);
      return {
        kind: "choose",
        prompt: `This shape is split into two rectangles. Which calculation gives its area?`,
        visual: lLabels(l, "cm"),
        options: [
          { text: `${l.w} × ${l.h - l.ch} + ${l.w - l.cw} × ${l.ch}` },
          { text: `${l.w} × ${l.h}`, misconception: M.cut, feedback: "That's the whole rectangle, including the missing corner." },
          { text: `${l.w} + ${l.h} + ${l.w - l.cw} + ${l.h - l.ch}`, misconception: M.add, feedback: "Area means multiplying sides, not adding them." },
          { text: `${l.w} × ${l.h - l.ch} + ${l.w} × ${l.ch}`, misconception: M.cut, feedback: `The top part isn't ${l.w} wide: the corner is missing.` },
        ].filter((o, i, all) => all.findIndex((x) => x.text === o.text) === i),
        answer: 0,
        hint: "Split the L into a bottom rectangle and a top rectangle. Use each one's own length and width.",
        explanation: `Bottom: ${l.w} × ${l.h - l.ch}; top: ${l.w - l.cw} × ${l.ch}. Total **${l.area} cm²**.`,
      };
    },
  },
  {
    key: "ap-compound-stretch",
    skill: S.compound,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const outer = int(r, 6, 12);
      const inner = int(r, 2, outer - 3);
      return {
        kind: "number",
        prompt: `A square photo frame is **${outer} cm** wide. The square hole for the photo is **${inner} cm** wide. What is the area of the **frame** (not the hole)?`,
        visual: { kind: "rect", w: outer, h: outer, labels: { bottom: `${outer} cm` } },
        unit: "cm²",
        answer: outer * outer - inner * inner,
        traps: [{ value: outer * outer, misconception: M.cut, feedback: "Take away the hole in the middle." }, { value: (outer - inner) * (outer - inner), feedback: "Work out the two squares' areas, then take one from the other." }].filter((t) => t.value !== outer * outer - inner * inner),
        hint: "Big square's area, take away the small square's area.",
        explanation: `${outer} × ${outer} = ${outer * outer}; ${inner} × ${inner} = ${inner * inner}; ${outer * outer} − ${inner * inner} = **${outer * outer - inner * inner} cm²**.`,
      };
    },
  },
  {
    key: "ap-missing-perimeter",
    skill: S.missing,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const l = int(r, 4, difficulty === 1 ? 10 : 25);
      const w = int(r, 2, l - 1);
      const p = 2 * (l + w);
      return {
        kind: "number",
        prompt: `A rectangle has a perimeter of **${p} cm**. Its length is **${l} cm**. What is its width?`,
        visual: { kind: "rect", w: l, h: w, labels: { bottom: `${l} cm`, left: "?" } },
        unit: "cm",
        answer: w,
        traps: [{ value: p - l, misconception: M.unknown, feedback: "The perimeter has two lengths and two widths. Take away both lengths, then halve." }, { value: (p - l) / 2, misconception: M.unknown, feedback: "Take away **both** lengths first." }].filter((t) => t.value !== w && Number.isInteger(t.value)),
        hint: `The perimeter is length + width + length + width.`,
        explanation: `${p} − ${l} − ${l} = ${2 * w}, and half of that is **${w} cm**.`,
      };
    },
  },
  {
    key: "ap-missing-stretch",
    skill: S.missing,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const side = pick(r, [4, 6, 8, 10]);
      const l = side * 2;
      const w = side / 2;
      return {
        kind: "number",
        prompt: `A square has sides of **${side} cm**. A rectangle has the **same area** as the square. The rectangle is **${l} cm** long. How wide is it?`,
        unit: "cm",
        answer: w,
        traps: [{ value: side * side, feedback: `That's the area. Now divide it by the length, ${l} cm.` }, { value: side, feedback: "A different shape with the same area doesn't keep the same sides." }],
        hint: `First find the square's area: ${side} × ${side}.`,
        explanation: `${side} × ${side} = ${side * side} cm², and ${side * side} ÷ ${l} = **${w} cm**.`,
      };
    },
  },
];

const templates = withHints(baseTemplates, {
  "ap-perimeter": () => ["Perimeter is the distance all the way round the edge.", "A rectangle has two lengths and two widths: add all four sides."],
  "ap-perimeter-square": () => ["All four sides of a square are the same.", "Multiply one side by 4, or divide the perimeter by 4."],
  "ap-perimeter-stretch": () => ["Each missing side is a long side take away the short side opposite it.", "Then add all six sides."],
  "ap-count": () => ["Count the squares inside the shape.", "Count one row, then multiply by the number of rows."],
  "ap-count-half": () => ["The line cuts the rectangle into two equal halves.", "Find the whole area, then divide by 2."],
  "ap-count-stretch": () => ["Start with 1 × the number.", "Try 2, 3, 4… and stop when the pairs start to repeat."],
  "ap-area": () => ["Area of a rectangle = length × width.", "Imagine the rows of squares: rows × squares in each row."],
  "ap-area-word": () => ["It's a rectangle, so multiply the length by the width.", "Area is in square metres (m²)."],
  "ap-area-stretch": () => ["Count how many tiles fit along each side.", "Multiply the two numbers."],
  "ap-compound": () => ["Split the shape into two rectangles, or take the missing corner away from a big rectangle.", "Find each area, then add (or subtract)."],
  "ap-compound-split": () => ["Find the two rectangles inside the L.", "Each part uses its own length and width."],
  "ap-compound-stretch": () => ["The frame is the big square with a hole.", "Subtract the hole's area from the big square's area."],
  "ap-missing": () => ["Work backwards from what you know.", "From area: divide by the side you know. From perimeter: take away the known sides, then halve."],
  "ap-missing-perimeter": () => ["Take both lengths away from the perimeter.", "What's left is two widths: halve it."],
  "ap-missing-stretch": () => ["Same area: work out the square's area first.", "Then divide by the rectangle's length."],
});

export const areaPerimeter = defineTopic(withExtras({
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
        {
          type: "worked",
          title: "Watch me: a 7 m by 4 m garden",
          support: "full",
          problem: "Find the perimeter of a rectangle **7 m** by **4 m**.",
          visual: { kind: "rect", w: 7, h: 4, labels: { top: "7 m", right: "4 m", bottom: "7 m", left: "4 m" } },
          steps: [{ text: "Two lengths: 7 + 7 = **14 m**." }, { text: "Two widths: 4 + 4 = **8 m**." }, { text: "All the way round: 14 + 8 = **22 m**." }],
          conclusion: "The perimeter is **22 m**.",
        },
        {
          type: "worked",
          title: "Together: a 6 cm by 2 cm rectangle",
          support: "faded",
          problem: "Find the perimeter of a rectangle **6 cm** by **2 cm**.",
          visual: { kind: "rect", w: 6, h: 2, grid: true, labels: { bottom: "6 cm", left: "2 cm" } },
          steps: [{ text: "Go round all four sides: 6 + 2 + 6 + 2.", blank: { prompt: "What is the perimeter in cm?", answer: 16, hint: "6 + 2 + 6 + 2", traps: [{ value: 8, misconception: M.two, feedback: "That's only two sides. A rectangle has four." }, { value: 12, misconception: M.mixup, feedback: "12 is the area (6 × 2). Perimeter goes round the edge." }], worked: "**16 cm**." } }],
          conclusion: "The perimeter is **16 cm**.",
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
        {
          type: "worked",
          title: "Watch me: count in rows",
          support: "full",
          problem: "Find the area of this shape by counting.",
          visual: { kind: "rect", w: 6, h: 3, grid: true },
          steps: [{ text: "Don't count one by one: count one row. There are **6** squares in a row." }, { text: "There are **3** rows: 6 + 6 + 6 = **18**." }],
          conclusion: "The area is **18 squares**.",
        },
        {
          type: "worked",
          title: "Together: 5 rows of 4",
          support: "faded",
          problem: "Find the area of a 4 by 5 grid of squares.",
          visual: { kind: "rect", w: 4, h: 5, grid: true },
          steps: [{ text: "Each row has 4 squares and there are 5 rows.", blank: { prompt: "How many squares?", answer: 20, hint: "5 lots of 4", traps: [{ value: 18, misconception: M.mixup, feedback: "18 is the perimeter (the distance round). Area counts the squares inside." }, { value: 9, misconception: M.add, feedback: "4 + 5 adds the sides. Area is 5 rows of 4." }], worked: "**20 squares**." } }],
          conclusion: "The area is **20 squares**.",
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
          type: "explain",
          title: "Rows of squares",
          body: ["A rectangle 8 cm long and 5 cm wide holds 5 rows of 8 one-centimetre squares.", "So instead of counting, multiply: **area = length × width**. The answer is in **square** units: cm² or m².", "Don't add the sides: that gives half the perimeter, not the area."],
          visual: { kind: "rect", w: 8, h: 5, grid: true, labels: { bottom: "8 cm", left: "5 cm" } },
        },
        {
          type: "worked",
          title: "A quicker way",
          support: "full",
          problem: "Find the area of a rectangle **8 cm** long and **5 cm** wide.",
          visual: { kind: "rect", w: 8, h: 5, labels: { bottom: "8 cm", left: "5 cm" } },
          steps: [{ text: "Imagine the squares: 5 rows of 8." }, { text: "5 × 8 = **40**." }],
          conclusion: "The area is **40 cm²**.",
        },
        {
          type: "worked",
          title: "Together: 9 m by 6 m",
          support: "faded",
          problem: "Find the area of a rectangle **9 m** by **6 m**.",
          visual: { kind: "rect", w: 9, h: 6, labels: { bottom: "9 m", left: "6 m" } },
          steps: [{ text: "Area = length × width.", blank: { prompt: "9 × 6 = ?", answer: 54, hint: "6 × 9", traps: [{ value: 15, misconception: M.add, feedback: "9 + 6 adds the sides. Area multiplies them." }, { value: 30, misconception: M.mixup, feedback: "30 is the perimeter. Area is length × width." }], worked: "**54 m²**." } }],
          conclusion: "The area is **54 m²**.",
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
          type: "explain",
          title: "Two ways to find an L",
          body: ["An L-shape is made of rectangles. You can **split** it into two rectangles and add their areas.", "Or imagine the **whole** rectangle and **take away** the missing corner. Both ways give the same answer.", "Sometimes a side isn't labelled: work it out from the sides opposite."],
          visual: { kind: "rect", w: 8, h: 6, cut: { w: 3, h: 2 }, labels: { top: "5 cm", innerV: "2 cm", innerH: "3 cm", right: "4 cm", bottom: "8 cm", left: "6 cm" } },
        },
        {
          type: "worked",
          title: "Take away the corner",
          support: "full",
          problem: "Find the area of this shape.",
          visual: { kind: "rect", w: 8, h: 6, cut: { w: 3, h: 2 }, labels: { top: "5 cm", innerV: "2 cm", innerH: "3 cm", right: "4 cm", bottom: "8 cm", left: "6 cm" } },
          steps: [{ text: "Imagine the whole rectangle: 8 × 6 = **48 cm²**." }, { text: "The missing corner is 3 × 2 = **6 cm²**." }, { text: "48 − 6 = **42**." }],
          conclusion: "The area is **42 cm²**.",
        },
        {
          type: "worked",
          title: "Together: split it",
          support: "faded",
          problem: "Find the area of the same shape by splitting it.",
          visual: { kind: "rect", w: 8, h: 6, cut: { w: 3, h: 2 }, labels: { top: "5 cm", innerV: "2 cm", innerH: "3 cm", right: "4 cm", bottom: "8 cm", left: "6 cm" } },
          steps: [
            { text: "Bottom rectangle: 8 cm long and 4 cm high: 8 × 4 = **32 cm²**." },
            { text: "Top rectangle: 5 cm long and 2 cm high.", blank: { prompt: "5 × 2 = ?", answer: 10, hint: "The top part is 5 wide.", traps: [{ value: 16, misconception: M.cut, feedback: "The top part isn't 8 wide: the corner is missing, so it is 5 wide." }], worked: "**10 cm²**." } },
            { text: "32 + 10 = **42 cm²**: the same as before." },
          ],
          conclusion: "Both ways give **42 cm²**.",
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
          type: "explain",
          title: "Work backwards",
          body: ["If you know the **area** and one side, divide: the area is length × width, so the missing side is area ÷ the side you know.", "If you know the **perimeter** and one side, take that side away **twice** (there are two of it), then halve what's left."],
          visual: { kind: "rect", w: 9, h: 4, labels: { bottom: "9 cm", left: "?" } },
        },
        {
          type: "worked",
          title: "Watch me: from a perimeter",
          support: "full",
          problem: "A rectangle has a perimeter of **30 cm**. Its length is **10 cm**. How wide is it?",
          visual: { kind: "rect", w: 10, h: 5, labels: { bottom: "10 cm", left: "?" } },
          steps: [{ text: "Two lengths: 10 + 10 = **20 cm**." }, { text: "30 − 20 = **10 cm** is left for the two widths." }, { text: "One width: 10 ÷ 2 = **5 cm**." }],
          conclusion: "The width is **5 cm**.",
        },
        {
          type: "worked",
          title: "Let's do it together",
          support: "faded",
          problem: "A rectangle has an area of **36 cm²**. One side is **9 cm**. How long is the other side?",
          visual: { kind: "rect", w: 9, h: 4, labels: { bottom: "9 cm", left: "?" } },
          steps: [
            { text: "Area = length × width, so 9 × ? = 36." },
            { text: "Divide to find it.", blank: { prompt: "What is 36 ÷ 9?", answer: 4, hint: "9 × 4 = 36.", traps: [{ value: 27, misconception: M.unknown, feedback: "Taking away doesn't undo multiplying. Divide 36 by 9." }], worked: "36 ÷ 9 = **4**." } },
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
}, areaExtra));
