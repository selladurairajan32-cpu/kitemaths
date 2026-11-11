import { defineTopic, genFor, int, pick } from "@/topics/kit/define";
import type { Template } from "@/topics/kit/types";

/**
 * Measures (D-037): converting metric units (Y3.MEAS.1, Y5.MEAS.1, Y6.MEAS.1), miles and kilometres (Y5.MEAS.2,
 * Y6.MEAS.3), and volume of cuboids (Y5.MEAS.5, Y6.MEAS.7). Speed is an optional 11+ extension, outside the national
 * curriculum, and labelled so.
 */

const T = "measures";
const gen = genFor(T);
const S = { convert: `${T}.convert`, miles: `${T}.miles-km`, volume: `${T}.volume`, speed: `${T}.speed` };
const M = { factor: `${T}.wrong-factor`, direction: `${T}.wrong-direction`, addSides: `${T}.adds-sides` };
const fmt = (n: number) => n.toLocaleString("en-GB", { maximumFractionDigits: 3 });

/** Metric pairs: the bigger unit, the smaller unit, and how many smaller units make one bigger one. */
const PAIRS = [
  { big: "m", small: "cm", k: 100, what: "length" },
  { big: "cm", small: "mm", k: 10, what: "length" },
  { big: "km", small: "m", k: 1000, what: "length" },
  { big: "kg", small: "g", k: 1000, what: "mass" },
  { big: "l", small: "ml", k: 1000, what: "capacity" },
] as const;
/** A wrong factor a child might use for this pair: 10 for 100, 100 for 1,000, and so on. */
const wrongK = (k: number) => (k === 10 ? 100 : k === 100 ? 1000 : 100);

const templates: Template[] = [
  {
    key: "ms-convert-up",
    skill: S.convert,
    difficulties: [1, 2],
    make: (r, { difficulty }) => {
      const p = pick(r, PAIRS);
      const v = difficulty === 1 ? int(r, 2, 12) : int(r, 11, 99) / 10;
      const answer = Math.round(v * p.k);
      return {
        kind: "number",
        prompt: `**${fmt(v)} ${p.big}** = how many **${p.small}**?`,
        answer,
        unit: p.small,
        traps: [{ value: Math.round(v * wrongK(p.k)), misconception: M.factor, feedback: `1 ${p.big} = ${fmt(p.k)} ${p.small}. Check how many.` }, { value: v, misconception: M.direction, feedback: `${p.small} are smaller, so there are more of them: multiply by ${fmt(p.k)}.` }].filter((t) => t.value !== answer && Number.isInteger(t.value)),
        hint: `How many ${p.small} make 1 ${p.big}?`,
        hints: [`1 ${p.big} = ${fmt(p.k)} ${p.small}.`, `Multiply: ${fmt(v)} × ${fmt(p.k)}.`],
        explanation: `1 ${p.big} = ${fmt(p.k)} ${p.small}, so ${fmt(v)} ${p.big} = ${fmt(v)} × ${fmt(p.k)} = **${fmt(answer)} ${p.small}**.`,
      };
    },
  },
  {
    key: "ms-convert-down",
    skill: S.convert,
    difficulties: [2, 3],
    make: (r, { difficulty }) => {
      const p = pick(r, PAIRS);
      const places = p.k === 10 ? 1 : p.k === 100 ? 2 : 3;
      const small = difficulty === 2 ? int(r, 2, 9) * p.k + int(r, 1, 9) * (p.k / 10) : int(r, 1, 9) * p.k + int(r, 1, p.k - 1);
      const answer = small / p.k;
      return {
        kind: "number",
        prompt: `**${fmt(small)} ${p.small}** = how many **${p.big}**?`,
        answer,
        unit: p.big,
        decimals: places,
        traps: [{ value: small * p.k, misconception: M.direction, feedback: `${p.big} are bigger, so there are fewer of them: divide by ${fmt(p.k)}.` }, { value: small / wrongK(p.k), misconception: M.factor, feedback: `1 ${p.big} = ${fmt(p.k)} ${p.small}. Divide by ${fmt(p.k)}.` }].filter((t) => t.value !== answer && t.value <= 9_999_999),
        hint: `How many ${p.small} make 1 ${p.big}?`,
        hints: [`1 ${p.big} = ${fmt(p.k)} ${p.small}, so divide by ${fmt(p.k)}.`, `Dividing by ${fmt(p.k)} moves each digit ${places} place${places === 1 ? "" : "s"} to the right.`],
        explanation: `1 ${p.big} = ${fmt(p.k)} ${p.small}, so ${fmt(small)} ${p.small} = ${fmt(small)} ÷ ${fmt(p.k)} = **${fmt(answer)} ${p.big}**.`,
      };
    },
  },
  {
    key: "ms-convert-stretch",
    skill: S.convert,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const litres = pick(r, [1.5, 2, 2.5, 3]);
      const glass = pick(r, [150, 200, 250, 300]);
      const n = int(r, 2, Math.floor((litres * 1000) / glass) - 1);
      const left = litres * 1000 - n * glass;
      return {
        kind: "number",
        prompt: `A jug holds **${fmt(litres)} litres** of juice. Amira pours **${n} glasses** of **${glass} ml** each. How many **ml** are left in the jug?`,
        answer: left,
        unit: "ml",
        traps: [{ value: litres * 100 - n * glass, misconception: M.factor, feedback: "1 litre is 1,000 ml, not 100 ml." }, { value: n * glass, feedback: "That is how much was poured out. Take it from what was in the jug." }].filter((t) => t.value > 0 && t.value !== left),
        hint: "Change the litres into ml first.",
        hints: [`${fmt(litres)} l = ${fmt(litres * 1000)} ml.`, `Poured out: ${n} × ${glass} = ${n * glass} ml. Take that away.`],
        explanation: `${fmt(litres)} l = ${fmt(litres * 1000)} ml. Poured out: ${n} × ${glass} = ${fmt(n * glass)} ml. Left: ${fmt(litres * 1000)} − ${fmt(n * glass)} = **${fmt(left)} ml**.`,
      };
    },
  },
  {
    key: "ms-miles-km",
    skill: S.miles,
    difficulties: [1, 2],
    make: (r, { difficulty }) => {
      const miles = 5 * int(r, difficulty === 1 ? 1 : 3, difficulty === 1 ? 6 : 20);
      const km = (miles / 5) * 8;
      return {
        kind: "number",
        prompt: `**5 miles is about 8 km.** About how many km is **${miles} miles**?`,
        answer: km,
        unit: "km",
        traps: [{ value: (miles / 8) * 5, misconception: M.direction, feedback: "A km is shorter than a mile, so there are more km than miles." }, { value: miles, feedback: "Miles and km are different lengths. Use 5 miles ≈ 8 km." }].filter((t) => Number.isInteger(t.value) && t.value !== km),
        hint: `How many lots of 5 miles are in ${miles} miles?`,
        hints: [`${miles} ÷ 5 = ${miles / 5} lots of 5 miles.`, `Each lot is about 8 km: ${miles / 5} × 8.`],
        explanation: `${miles} miles is ${miles / 5} lots of 5 miles. Each is about 8 km, so ${miles / 5} × 8 = **${km} km**.`,
      };
    },
  },
  {
    key: "ms-km-miles",
    skill: S.miles,
    difficulties: [2],
    make: (r) => {
      const km = 8 * int(r, 2, 15);
      const miles = (km / 8) * 5;
      return {
        kind: "number",
        prompt: `**8 km is about 5 miles.** About how many miles is **${km} km**?`,
        answer: miles,
        unit: "miles",
        traps: [{ value: (km / 5) * 8, misconception: M.direction, feedback: "A mile is longer than a km, so there are fewer miles than km." }].filter((t) => Number.isInteger(t.value)),
        hint: `How many lots of 8 km are in ${km} km?`,
        hints: [`${km} ÷ 8 = ${km / 8}.`, `Each 8 km is about 5 miles: ${km / 8} × 5.`],
        explanation: `${km} km is ${km / 8} lots of 8 km. Each is about 5 miles, so ${km / 8} × 5 = **${miles} miles**.`,
      };
    },
  },
  {
    key: "ms-miles-stretch",
    skill: S.miles,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const miles = 5 * int(r, 10, 30);
      const total = (miles / 5) * 8;
      const done = 8 * int(r, 2, total / 8 - 2);
      return {
        kind: "number",
        prompt: `A sign says **London ${miles} miles**. A coach has already driven **${done} km** towards it. Using 5 miles ≈ 8 km, about how many **km** are left?`,
        answer: total - done,
        unit: "km",
        traps: [{ value: miles - done, feedback: "Change the miles into km before you take away." }].filter((t) => t.value > 0),
        hint: "Change the whole journey into km first.",
        hints: [`${miles} miles ≈ ${miles / 5} × 8 = ${total} km.`, `Then take away the ${done} km already driven.`],
        explanation: `${miles} miles ≈ ${total} km. Left: ${total} − ${done} = **${total - done} km**.`,
      };
    },
  },
  {
    key: "ms-volume",
    skill: S.volume,
    difficulties: [1, 2],
    make: (r, { difficulty }) => {
      const [l, w, h] = difficulty === 1 ? [int(r, 2, 5), int(r, 2, 4), int(r, 2, 4)] : [int(r, 5, 12), int(r, 3, 8), int(r, 2, 10)];
      return {
        kind: "number",
        prompt: `What is the **volume** of this cuboid?`,
        visual: { kind: "cuboid", l, w, h, unit: "cm", cubes: difficulty === 1 },
        answer: l * w * h,
        unit: "cm³",
        traps: [{ value: l + w + h, misconception: M.addSides, feedback: "Volume multiplies the three lengths; it doesn't add them." }, { value: l * w, feedback: `That is one layer. There are ${h} layers.` }].filter((t) => t.value !== l * w * h),
        hint: "Volume = length × width × height.",
        hints: [`One layer: ${l} × ${w} = ${l * w} cubes.`, `${h} layers: ${l * w} × ${h}.`],
        explanation: `${l} × ${w} = ${l * w} centimetre cubes in each layer, and ${h} layers: ${l * w} × ${h} = **${l * w * h} cm³**.`,
      };
    },
  },
  {
    key: "ms-volume-layers",
    skill: S.volume,
    difficulties: [1, 2],
    make: (r, { difficulty }) => {
      const [l, w, h] = [int(r, 2, 6), int(r, 2, 5), int(r, 2, difficulty === 1 ? 4 : 8)];
      return {
        kind: "number",
        prompt: `A box is filled with centimetre cubes: **${l}** along, **${w}** across and **${h}** layers high. How many cubes fill the box?`,
        answer: l * w * h,
        traps: [{ value: l * h, feedback: "That is only the front face. The cubes go back too." }, { value: 2 * (l * w + l * h + w * h), feedback: "That counts the outside faces. Count the cubes, layer by layer." }].filter((t) => t.value !== l * w * h),
        hint: "Find how many cubes are in one layer first.",
        hints: [`One layer: ${l} × ${w} = ${l * w}.`, `Then × ${h} layers.`],
        explanation: `One layer has ${l} × ${w} = ${l * w} cubes. ${h} layers: ${l * w} × ${h} = **${l * w * h}** cubes.`,
      };
    },
  },
  {
    key: "ms-volume-stretch",
    skill: S.volume,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const [l, w, h] = [int(r, 4, 12), int(r, 2, 8), int(r, 3, 10)];
      const v = l * w * h;
      return {
        kind: "number",
        prompt: `A cuboid has a volume of **${v} cm³**. It is **${l} cm** long and **${w} cm** wide. How **tall** is it?`,
        answer: h,
        unit: "cm",
        traps: [{ value: v / l, feedback: `Divide by both the length and the width: ${l} × ${w} = ${l * w}.` }, { value: v - l - w, misconception: M.addSides, feedback: "Volume multiplies the lengths, so divide to undo it." }].filter((t) => Number.isInteger(t.value) && t.value !== h && t.value > 0),
        hint: "Volume = length × width × height. Which part is missing?",
        hints: [`Length × width = ${l} × ${w} = ${l * w}.`, `${l * w} × height = ${v}, so height = ${v} ÷ ${l * w}.`],
        explanation: `${l} × ${w} = ${l * w}. Height = ${v} ÷ ${l * w} = **${h} cm**. Check: ${l} × ${w} × ${h} = ${v}.`,
      };
    },
  },
  {
    key: "ms-speed-distance",
    skill: S.speed,
    difficulties: [2],
    make: (r) => {
      const s = pick(r, [30, 40, 50, 60, 70]);
      const t = int(r, 2, 5);
      return {
        kind: "number",
        prompt: `A train travels at **${s} miles per hour** for **${t} hours**. How far does it go?`,
        answer: s * t,
        unit: "miles",
        traps: [{ value: s + t, feedback: `${s} miles every hour, for ${t} hours: multiply.` }],
        hint: `In one hour it goes ${s} miles.`,
        hints: ["Distance = speed × time.", `${s} × ${t}.`],
        explanation: `${s} miles each hour for ${t} hours: ${s} × ${t} = **${s * t} miles**.`,
      };
    },
  },
  {
    key: "ms-speed-time",
    skill: S.speed,
    difficulties: [2, 3],
    make: (r, { difficulty }) => {
      const s = pick(r, difficulty === 2 ? [10, 12, 15, 20] : [16, 18, 24, 45]);
      const t = int(r, 2, 6);
      const d = s * t;
      return {
        kind: "number",
        prompt: `A cyclist rides **${d} km** at **${s} km per hour**. How many **hours** does it take?`,
        answer: t,
        unit: "hours",
        traps: [{ value: d - s, feedback: "Divide the distance by the speed: how many lots of the speed make the distance?" }].filter((x) => x.value !== t),
        hint: `Each hour covers ${s} km. How many hours make ${d} km?`,
        hints: ["Time = distance ÷ speed.", `${d} ÷ ${s}.`],
        explanation: `${d} ÷ ${s} = **${t} hours**. Check: ${s} × ${t} = ${d} km.`,
      };
    },
  },
  {
    key: "ms-speed-stretch",
    skill: S.speed,
    difficulties: [3],
    stretch: true,
    make: (r) => {
      const s = pick(r, [40, 48, 60, 80]);
      const mins = pick(r, [15, 30, 45, 90]);
      const answer = (s * mins) / 60;
      const decimalSlip = (s * mins) / 100;
      return {
        kind: "number",
        prompt: `A car travels at **${s} miles per hour**. How many miles does it go in **${mins} minutes**?`,
        answer,
        unit: "miles",
        traps: Number.isInteger(decimalSlip) && decimalSlip !== answer ? [{ value: decimalSlip, feedback: `${mins} minutes is not 0.${mins} of an hour: an hour has 60 minutes.` }] : [],
        hint: `What fraction of an hour is ${mins} minutes?`,
        hints: [`${mins} minutes is {${mins / 15}/4} of an hour${mins === 90 ? " (an hour and a half)" : ""}.`, `In 15 minutes the car goes ${s} ÷ 4 = ${s / 4} miles.`],
        explanation: `In 15 minutes the car goes ${s} ÷ 4 = ${s / 4} miles. ${mins} minutes is ${mins / 15} lots of 15: ${mins / 15} × ${s / 4} = **${answer} miles**.`,
      };
    },
  },
];

export const measures = defineTopic({
  id: T,
  title: "Measures",
  subtitle: "Converting units, miles and kilometres, volume, and speed",
  world: "measure",
  years: [3, 4, 5, 6],
  order: 4,
  icon: "ruler",
  skills: [
    { id: S.convert, title: "Converting units", description: "Change between mm, cm, m and km, g and kg, ml and l.", lessonId: "convert" },
    { id: S.miles, title: "Miles and kilometres", description: "Use 5 miles ≈ 8 km to convert between miles and kilometres.", lessonId: "miles" },
    { id: S.volume, title: "Volume of cuboids", description: "Count cubes and use length × width × height.", lessonId: "volume" },
    { id: S.speed, title: "Speed (11+ extension)", description: "Optional, beyond the national curriculum: distance, speed and time.", lessonId: "speed" },
  ],
  lessonIcons: { convert: "ruler", miles: "map", volume: "shapes", speed: "rocket" },
  lessons: [
    {
      id: "convert",
      title: "Converting units",
      phase: "Understand",
      summary: "Bigger unit to smaller: multiply. Smaller to bigger: divide.",
      minutes: 8,
      objectives: ["Know how many mm, cm and m make the next unit, and grams in a kilogram and ml in a litre", "Convert in both directions, including decimals"],
      steps: [
        {
          type: "explain",
          title: "Ten, a hundred or a thousand",
          body: [
            "Metric units go up in tens, hundreds and thousands: **10 mm = 1 cm**, **100 cm = 1 m**, **1,000 m = 1 km**, **1,000 g = 1 kg** and **1,000 ml = 1 l**. \"Kilo\" always means a thousand.",
            "Going from a **bigger** unit to a **smaller** one, there will be more of them, so **multiply**: 3 m = 300 cm. Going from smaller to bigger, there will be fewer, so **divide**: 2,500 g = 2.5 kg.",
          ],
          visual: { kind: "table", head: ["Bigger unit", "Smaller unit"], rows: [["1 cm", "10 mm"], ["1 m", "100 cm"], ["1 km", "1,000 m"], ["1 kg", "1,000 g"], ["1 l", "1,000 ml"]] },
          tip: "Ask: will there be more of the new unit, or fewer?",
        },
        {
          type: "worked",
          title: "Watch me: 3.2 kg in grams",
          support: "full",
          problem: "How many grams is **3.2 kg**?",
          steps: [{ text: "Grams are smaller, so there will be more: multiply." }, { text: "1 kg = 1,000 g, so 3.2 × 1,000 = 3,200." }],
          conclusion: "3.2 kg = **3,200 g**.",
        },
        {
          type: "worked",
          title: "Let's do it together",
          support: "faded",
          problem: "How many cm is **4.5 m**?",
          steps: [{ text: "Centimetres are smaller, so multiply by 100.", blank: { prompt: "4.5 m = ? cm", answer: 450, hint: "4.5 × 100.", traps: [{ value: 45, misconception: M.factor, feedback: "1 m is 100 cm, not 10 cm: 4.5 × 100." }, { value: 4500, misconception: M.factor, feedback: "1 m is 100 cm, not 1,000 cm." }], worked: "4.5 × 100 = **450** cm." } }],
          conclusion: "4.5 m = **450 cm**.",
        },
        { type: "check", title: "Your turn", questionId: gen("ms-convert-up", 1, 3) },
        { type: "check", title: "One more", questionId: gen("ms-convert-down", 2, 5) },
      ],
    },
    {
      id: "miles",
      title: "Miles and kilometres",
      phase: "Apply",
      summary: "5 miles is about 8 km.",
      minutes: 7,
      objectives: ["Know that 5 miles is about 8 km", "Convert between miles and km in both directions"],
      steps: [
        {
          type: "explain",
          title: "5 miles ≈ 8 km",
          body: [
            "Road signs in the UK use **miles**; most other countries use **kilometres**. A mile is longer than a km. A handy fact: **5 miles is about 8 km**, so 10 miles ≈ 16 km and 50 miles ≈ 80 km.",
            "To change miles to km, find how many lots of 5 miles there are, then multiply by 8. To change km to miles, find how many lots of 8 km, then multiply by 5. The answers are approximate, written with ≈.",
          ],
          visual: { kind: "table", head: ["Miles", "Km (about)"], rows: [["5", "8"], ["10", "16"], ["15", "24"], ["20", "32"]] },
          tip: "There are always more km than miles for the same distance.",
        },
        {
          type: "worked",
          title: "Watch me: 35 miles in km",
          support: "full",
          problem: "About how many km is **35 miles**?",
          steps: [{ text: "35 ÷ 5 = 7 lots of 5 miles." }, { text: "Each is about 8 km: 7 × 8 = 56." }],
          conclusion: "35 miles ≈ **56 km**.",
        },
        {
          type: "worked",
          title: "Let's do it together",
          support: "faded",
          problem: "About how many miles is **48 km**?",
          steps: [
            { text: "48 ÷ 8 = 6 lots of 8 km." },
            { text: "Each is about 5 miles.", blank: { prompt: "48 km ≈ ? miles", answer: 30, hint: "6 × 5.", traps: [{ value: 48, feedback: "Miles and km are different lengths. There are fewer miles than km: 6 × 5." }], worked: "6 × 5 = **30** miles." } },
          ],
          conclusion: "48 km ≈ **30 miles**.",
        },
        { type: "check", title: "Your turn", questionId: gen("ms-miles-km", 1, 3) },
        { type: "check", title: "One more", questionId: gen("ms-km-miles", 2, 5) },
      ],
    },
    {
      id: "volume",
      title: "Volume of cuboids",
      phase: "Visualise",
      summary: "Count the cubes in one layer, then multiply by the layers.",
      minutes: 8,
      objectives: ["Find volume by counting centimetre cubes", "Use length × width × height, in cm³"],
      steps: [
        {
          type: "explain",
          title: "Layers of cubes",
          body: [
            "**Volume** is how much space something takes up. We measure it in **centimetre cubes**, written **cm³**. This cuboid is 4 cubes long and 3 wide, so one layer has 4 × 3 = 12 cubes. There are 2 layers, so 12 × 2 = **24 cm³**.",
            "That is why **volume = length × width × height**. A 1 cm³ cube holds exactly 1 ml of water, so a box of 1,000 cm³ holds 1 litre.",
          ],
          visual: { kind: "cuboid", l: 4, w: 3, h: 2, unit: "cm", cubes: true },
          tip: "Volume multiplies all three lengths. Adding them gives the wrong answer.",
        },
        {
          type: "worked",
          title: "Watch me: 6 cm by 5 cm by 4 cm",
          support: "full",
          problem: "Find the volume of a cuboid **6 cm** long, **5 cm** wide and **4 cm** high.",
          visual: { kind: "cuboid", l: 6, w: 5, h: 4, unit: "cm" },
          steps: [{ text: "One layer: 6 × 5 = 30 cubes." }, { text: "4 layers: 30 × 4 = 120." }],
          conclusion: "The volume is **120 cm³**.",
        },
        {
          type: "worked",
          title: "Let's do it together",
          support: "faded",
          problem: "Find the volume of a cuboid **10 cm** by **3 cm** by **5 cm**.",
          steps: [
            { text: "One layer: 10 × 3 = 30." },
            { text: "5 layers.", blank: { prompt: "Volume in cm³?", answer: 150, hint: "30 × 5.", traps: [{ value: 18, misconception: M.addSides, feedback: "Volume multiplies the lengths: 10 × 3 × 5." }], worked: "30 × 5 = **150** cm³." } },
          ],
          conclusion: "The volume is **150 cm³**.",
        },
        { type: "check", title: "Your turn", questionId: gen("ms-volume", 1, 3) },
        { type: "check", title: "One more", questionId: gen("ms-volume-layers", 2, 5) },
      ],
    },
    {
      id: "speed",
      title: "Speed (11+ extension)",
      phase: "Master",
      summary: "Optional, beyond the national curriculum: distance = speed × time.",
      minutes: 8,
      objectives: ["Find a distance from a speed and a time", "Find a time from a distance and a speed"],
      steps: [
        {
          type: "explain",
          title: "Miles per hour",
          body: [
            "This lesson is an **optional 11+ extension**: speed isn't in the primary national curriculum, but some 11+ papers include it. **60 miles per hour** means the car goes 60 miles in every hour.",
            "So in 3 hours it goes **60 × 3 = 180 miles**: **distance = speed × time**. To find the time, divide: 180 miles at 60 mph takes 180 ÷ 60 = **3 hours**. Watch out for minutes: half an hour is 30 minutes, not 0.5 of 100.",
          ],
          visual: { kind: "table", head: ["Time at 60 mph", "Distance"], rows: [["1 hour", "60 miles"], ["2 hours", "120 miles"], ["3 hours", "180 miles"]] },
          tip: "15 minutes is a quarter of an hour, so the distance is a quarter too.",
        },
        {
          type: "worked",
          title: "Watch me: 45 minutes at 40 mph",
          support: "full",
          problem: "A car goes at **40 mph**. How far does it go in **45 minutes**?",
          steps: [{ text: "15 minutes is a quarter of an hour: 40 ÷ 4 = 10 miles." }, { text: "45 minutes is 3 lots of 15: 3 × 10 = 30." }],
          conclusion: "It goes **30 miles**.",
        },
        {
          type: "worked",
          title: "Let's do it together",
          support: "faded",
          problem: "A walker goes **20 km** at **4 km per hour**. How long does it take?",
          steps: [{ text: "Time = distance ÷ speed.", blank: { prompt: "How many hours?", answer: 5, hint: "20 ÷ 4.", traps: [{ value: 80, feedback: "That multiplies. Divide the distance by the speed: 20 ÷ 4." }], worked: "20 ÷ 4 = **5** hours." } }],
          conclusion: "It takes **5 hours**.",
        },
        { type: "check", title: "Your turn", questionId: gen("ms-speed-distance", 2, 3) },
        { type: "check", title: "One more", questionId: gen("ms-speed-time", 2, 5) },
      ],
    },
  ],
  templates,
  misconceptions: [
    {
      id: M.factor,
      name: "Wrong conversion number",
      possibleCause: "You might have used 10 or 100 where it should be 100 or 1,000.",
      description: "Converts with the wrong factor, such as 1 m = 10 cm or 1 kg = 100 g.",
      explanation: ["10 mm = 1 cm, 100 cm = 1 m, 1,000 m = 1 km.", "Kilo means a thousand: 1,000 g = 1 kg and 1,000 m = 1 km."],
      skills: [S.convert],
      followUpTemplates: ["ms-convert-up"],
    },
    {
      id: M.direction,
      name: "Multiplied instead of divided",
      possibleCause: "You might have multiplied when changing to a bigger unit.",
      description: "Multiplies when converting to a bigger unit (or divides when converting to a smaller one), so the answer goes the wrong way.",
      explanation: ["Changing to a bigger unit gives fewer of them: divide.", "Changing to a smaller unit gives more of them: multiply."],
      skills: [S.convert, S.miles],
      followUpTemplates: ["ms-convert-down", "ms-km-miles"],
    },
    {
      id: M.addSides,
      name: "Volume adds the sides",
      possibleCause: "You might have added the three lengths instead of multiplying them.",
      description: "Finds the volume of a cuboid by adding its length, width and height.",
      explanation: ["Volume counts cubes: one layer is length × width.", "Then multiply by the number of layers, the height."],
      skills: [S.volume],
      followUpTemplates: ["ms-volume"],
    },
  ],
  placement: [
    { lessonId: "convert", template: "ms-convert-up" },
    { lessonId: "miles", template: "ms-miles-km" },
    { lessonId: "volume", template: "ms-volume" },
    { lessonId: "speed", template: "ms-speed-distance" },
  ],
});
