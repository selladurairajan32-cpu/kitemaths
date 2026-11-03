import { defineTopic, genFor, int, pick } from "@/topics/kit/define";
import { num } from "@/topics/kit/evaluate";
import type { ChooseOption, Template } from "@/topics/kit/types";

/** Charts and data: pictograms, bar charts, tables and timetables, line graphs, and the mean. */

const T = "charts-data";
const gen = genFor(T);
const S = { picto: `${T}.pictograms`, bar: `${T}.bar-charts`, tables: `${T}.tables`, line: `${T}.line-graphs`, mean: `${T}.mean` };
const M = { key: `${T}.forgot-key`, scale: `${T}.misread-scale`, op: `${T}.add-or-subtract`, mean: `${T}.mean-not-divided`, row: `${T}.wrong-row` };

function unique(right: string, wrong: ChooseOption[]): ChooseOption[] {
  const out: ChooseOption[] = [{ text: right }];
  for (const w of wrong) if (!out.some((o) => o.text === w.text)) out.push(w);
  return out.slice(0, 4);
}
/** n different items from a list, in an order that depends only on the seed. */
function some<X>(r: () => number, list: readonly X[], n: number): X[] {
  const left = [...list];
  return Array.from({ length: n }, () => left.splice(Math.floor(r() * left.length), 1)[0]);
}
const mm = (m: number) => String(m).padStart(2, "0");
const clock = (t: number) => `${Math.floor(t / 60)}:${mm(t % 60)}`;

const SURVEYS = [
  { what: "favourite fruit", who: "children", cats: ["Apples", "Bananas", "Grapes", "Pears", "Plums"] },
  { what: "pets", who: "pets", cats: ["Cats", "Dogs", "Fish", "Rabbits", "Birds"] },
  { what: "way to school", who: "children", cats: ["Walk", "Car", "Bus", "Bike", "Scooter"] },
  { what: "favourite sport", who: "children", cats: ["Football", "Netball", "Tennis", "Cricket", "Rugby"] },
] as const;
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const DAY: Record<string, string> = { Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday", Thu: "Thursday", Fri: "Friday" };
/** "the Library", but "Park Road". */
const at = (stop: string) => (stop === "Park Road" ? stop : `the ${stop}`);

const templates: Template[] = [
  {
    key: "cd-picto",
    skill: S.picto,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const survey = pick(r, SURVEYS);
      const key = difficulty === 1 ? 2 : difficulty === 2 ? pick(r, [4, 5]) : 10;
      const halves = key % 2 === 0 && difficulty > 1;
      const cats = some(r, survey.cats, 4);
      const rows = cats.map((label) => ({ label, value: (int(r, 1, 6) + (halves && r() < 0.5 ? 0.5 : 0)) * key }));
      const visual = { kind: "pictogram" as const, rows, key, keyLabel: `${key} ${survey.who}` };
      if (difficulty < 3) {
        const row = pick(r, rows);
        const icons = Math.ceil(row.value / key);
        return {
          kind: "number",
          prompt: `The pictogram shows ${survey.who === "pets" ? "the pets children have" : `children's ${survey.what}`}. How many ${survey.who === "pets" ? "" : "children chose "}**${row.label}**${survey.who === "pets" ? " are there" : ""}?`,
          visual,
          answer: row.value,
          traps: [{ value: icons, misconception: M.key, feedback: `Each circle stands for ${key}, so multiply: don't just count the circles.` }, ...(row.value % key ? [{ value: icons * key, misconception: M.key, feedback: `Half a circle is half of ${key}: ${key / 2}.` }] : [])].filter((t) => t.value !== row.value),
          hint: `Each whole circle is ${key}. Half a circle is ${key / 2}.`,
          explanation: `${row.label}: ${Math.floor(row.value / key)} circle${Math.floor(row.value / key) === 1 ? "" : "s"}${row.value % key ? " and a half" : ""} × ${key} = **${num(row.value)}**.`,
        };
      }
      const [a, b] = some(r, rows, 2).sort((x, y) => y.value - x.value);
      if (a.value === b.value) b.value = Math.max(key / 2, b.value - key);
      return {
        kind: "number",
        prompt: `How many more ${survey.who === "pets" ? "" : "children chose "}**${a.label}** than **${b.label}**?`,
        visual: { ...visual, rows: rows.map((x) => (x.label === b.label ? b : x)) },
        answer: a.value - b.value,
        traps: [{ value: a.value + b.value, misconception: M.op, feedback: "How many more means find the difference: take away." }, { value: (a.value - b.value) / key, misconception: M.key, feedback: `Each circle is ${key}.` }].filter((t) => Number.isInteger(t.value) && t.value !== a.value - b.value),
        hint: `Work out each one (each circle is ${key}), then take away.`,
        explanation: `${a.label}: ${num(a.value)}. ${b.label}: ${num(b.value)}. ${num(a.value)} − ${num(b.value)} = **${num(a.value - b.value)}**.`,
      };
    },
  },
  {
    key: "cd-bar",
    skill: S.bar,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const step = difficulty === 1 ? 2 : difficulty === 2 ? 5 : 10;
      const max = step * (difficulty === 3 ? 8 : 6);
      // Level 3 has bars that stop halfway between lines.
      const bars = DAYS.map((label) => ({ label, value: difficulty === 3 ? int(r, 2, 15) * 5 : int(r, 1, 6) * step }));
      const what = pick(r, ["books read", "cups of juice sold", "cars in the car park", "children at breakfast club"]);
      const visual = { kind: "barchart" as const, bars, max, step, axis: "Number" };
      if (difficulty === 1) {
        const bar = pick(r, bars);
        return {
          kind: "number",
          prompt: `The bar chart shows the number of ${what} each day. How many on **${DAY[bar.label]}**?`,
          visual,
          answer: bar.value,
          traps: [{ value: bar.value / step, misconception: M.scale, feedback: `Each line on the scale goes up in ${step}s, not 1s.` }].filter((t) => t.value !== bar.value),
          hint: `Read across from the top of the bar. The scale goes up in ${step}s.`,
          explanation: `The ${bar.label} bar reaches **${num(bar.value)}**.`,
        };
      }
      const [a, b] = some(r, bars, 2);
      if (a.value === b.value) a.value = a.value + step <= max ? a.value + step : a.value - step;
      const [big, small] = a.value > b.value ? [a, b] : [b, a];
      if (r() < 0.5) {
        return {
          kind: "number",
          prompt: `The bar chart shows the number of ${what} each day. How many more on **${DAY[big.label]}** than on **${DAY[small.label]}**?`,
          visual: { ...visual, bars: bars.map((x) => (x.label === a.label ? a : x)) },
          answer: big.value - small.value,
          traps: [{ value: big.value + small.value, misconception: M.op, feedback: "How many more means the difference: take away." }, ...(difficulty === 3 ? [] : [{ value: (big.value - small.value) / step, misconception: M.scale, feedback: `The scale goes up in ${step}s.` }])].filter((t) => t.value !== big.value - small.value),
          hint: "Read both bars, then take the smaller from the bigger.",
          explanation: `${big.label}: ${num(big.value)}. ${small.label}: ${num(small.value)}. ${num(big.value)} − ${num(small.value)} = **${num(big.value - small.value)}**.`,
        };
      }
      return {
        kind: "number",
        prompt: `The bar chart shows the number of ${what} each day. How many on **${DAY[a.label]}** and **${DAY[b.label]}** altogether?`,
        visual: { ...visual, bars: bars.map((x) => (x.label === a.label ? a : x)) },
        answer: a.value + b.value,
        traps: [{ value: Math.abs(a.value - b.value), misconception: M.op, feedback: "Altogether means add." }].filter((t) => t.value !== a.value + b.value),
        hint: `Read both bars${difficulty === 3 ? " (a bar between two lines is halfway: 5 more)" : ""}, then add.`,
        explanation: `${a.label}: ${num(a.value)}. ${b.label}: ${num(b.value)}. Together: **${num(a.value + b.value)}**.`,
      };
    },
  },
  {
    key: "cd-table",
    skill: S.tables,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      if (difficulty === 1) {
        const classes = ["Class 3", "Class 4", "Class 5"];
        const cats = some(r, SURVEYS[1].cats, 3);
        const grid = classes.map(() => cats.map(() => int(r, 1, 12)));
        const ci = int(r, 0, 2);
        const pj = int(r, 0, 2);
        return {
          kind: "number",
          prompt: `The table shows the pets in three classes. How many **${cats[pj].toLowerCase()}** are in **${classes[ci]}**?`,
          visual: { kind: "table", head: ["", ...cats], rows: classes.map((c, i) => [c, ...grid[i].map(String)]) },
          answer: grid[ci][pj],
          traps: [grid[(ci + 1) % 3][pj], grid[ci][(pj + 1) % 3], grid[pj % 3][ci % 3]].filter((v, i, all) => v !== grid[ci][pj] && all.indexOf(v) === i).map((value) => ({ value, misconception: M.row, feedback: `Find the ${classes[ci]} row, then the ${cats[pj]} column. Where they meet is the answer.` })),
          hint: `Find the row for ${classes[ci]}, then go across to the ${cats[pj]} column.`,
          explanation: `${classes[ci]} row, ${cats[pj]} column: **${grid[ci][pj]}**.`,
        };
      }
      // A bus timetable: stops down the side, buses across the top.
      const stops = ["Station", "Park Road", "Library", "School", "Leisure Centre"];
      const gaps = stops.slice(1).map(() => int(r, 2, 6) * 2 + (difficulty === 3 ? int(r, 0, 1) : 0));
      const firsts = [0, 1, 2].map((k) => 8 * 60 + 10 + k * int(r, 4, 6) * 5);
      const times = firsts.map((f) => stops.map((_, i) => f + gaps.slice(0, i).reduce((x, y) => x + y, 0)));
      const visual = { kind: "table" as const, head: ["Stop", "Bus A", "Bus B", "Bus C"], rows: stops.map((s, i) => [s, ...times.map((t) => clock(t[i]))]) };
      const bus = int(r, 0, 2);
      const from = int(r, 0, 2);
      const to = int(r, from + 1, 4);
      if (difficulty === 2) {
        const right = clock(times[bus][to]);
        return {
          kind: "choose",
          prompt: `Bus ${"ABC"[bus]} leaves **${at(stops[from])}** at **${clock(times[bus][from])}**. When does it get to **${at(stops[to])}**?`,
          visual,
          options: unique(right, [
            ...(bus < 2 ? [{ text: clock(times[bus + 1][to]), misconception: M.row, feedback: "Stay in the same bus's column." }] : [{ text: clock(times[bus - 1][to]), misconception: M.row, feedback: "Stay in the same bus's column." }]),
            { text: clock(times[bus][to === 4 ? 3 : to + 1]), misconception: M.row, feedback: `Find the ${stops[to]} row.` },
            { text: clock(times[bus][to - 1]), misconception: M.row, feedback: `Find the ${stops[to]} row.` },
          ]),
          answer: 0,
          hint: `Go down the Bus ${"ABC"[bus]} column to the ${stops[to]} row.`,
          explanation: `In the Bus ${"ABC"[bus]} column, the ${stops[to]} row says **${right}**.`,
        };
      }
      const length = times[bus][to] - times[bus][from];
      return {
        kind: "number",
        prompt: `How many minutes does Bus ${"ABC"[bus]} take to get from **${at(stops[from])}** to **${at(stops[to])}**?`,
        visual,
        answer: length,
        unit: "minutes",
        traps: [{ value: Math.floor(times[bus][to] / 60) * 100 + (times[bus][to] % 60) - (Math.floor(times[bus][from] / 60) * 100 + (times[bus][from] % 60)), misconception: M.op, feedback: "An hour has 60 minutes: count on from one time to the other." }].filter((t) => t.value !== length),
        hint: `Find both times in the Bus ${"ABC"[bus]} column, then count on.`,
        explanation: `${clock(times[bus][from])} to ${clock(times[bus][to])} is **${length} minutes**.`,
      };
    },
  },
  {
    key: "cd-line",
    skill: S.line,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const hours = [8, 10, 12, 14, 16];
      const step = 2;
      let temp = int(r, 3, 8) * 2;
      const values = hours.map((_, i) => {
        if (i > 0) temp = Math.max(2, Math.min(28, temp + pick(r, i < 3 ? [2, 4, 6] : [-4, -2, 0, 2])));
        return temp;
      });
      const points = hours.map((h, i) => ({ label: `${h}:00`, value: values[i] }));
      const visual = { kind: "linegraph" as const, points, min: 0, max: 30, step, axis: "°C" };
      if (difficulty === 1) {
        const i = int(r, 0, 4);
        return {
          kind: "number",
          prompt: `The line graph shows the temperature during a day. What was the temperature at **${hours[i]}:00**?`,
          visual,
          answer: values[i],
          unit: "°C",
          traps: [{ value: values[i] / 2, misconception: M.scale, feedback: "Each line on the scale is 2 degrees." }].filter((t) => Number.isInteger(t.value) && t.value !== values[i]),
          hint: `Find ${hours[i]}:00 along the bottom, go up to the line, then across to the scale.`,
          explanation: `At ${hours[i]}:00 the line is at **${values[i]}°C**.`,
        };
      }
      if (difficulty === 2) {
        const i = int(r, 0, 2);
        const j = int(r, i + 1, 4);
        const change = values[j] - values[i];
        if (change === 0) values[j] += 2;
        const diff = Math.abs(values[j] - values[i]);
        return {
          kind: "number",
          prompt: `By how many degrees did the temperature change between **${hours[i]}:00** and **${hours[j]}:00**?`,
          visual: { ...visual, points: hours.map((h, k) => ({ label: `${h}:00`, value: values[k] })) },
          answer: diff,
          unit: "°C",
          traps: [{ value: values[i] + values[j], misconception: M.op, feedback: "The change is the difference: take away." }],
          hint: "Read both temperatures, then find the difference.",
          explanation: `${values[i]}°C to ${values[j]}°C is a change of **${diff}°C**.`,
        };
      }
      const rises = values.slice(1).map((v, k) => v - values[k]);
      const best = rises.indexOf(Math.max(...rises));
      if (rises.filter((x) => x === rises[best]).length > 1) {
        values[best + 1] += 2;
        for (let k = best + 2; k < values.length; k++) values[k] += 2;
      }
      const gaps = hours.slice(1).map((h, k) => `${hours[k]}:00 and ${h}:00`);
      return {
        kind: "choose",
        prompt: "Between which two times did the temperature **rise the most**?",
        visual: { ...visual, points: hours.map((h, k) => ({ label: `${h}:00`, value: values[k] })), max: Math.max(30, Math.ceil(Math.max(...values) / 2) * 2) },
        options: gaps.map((g, k) => ({ text: g, misconception: k === best ? undefined : M.scale, feedback: k === best ? undefined : "Look for the steepest uphill part of the line." })),
        answer: best,
        fixedOrder: true,
        hint: "The steepest uphill part of the line is the biggest rise.",
        explanation: `From ${gaps[best]} it went from ${values[best]}°C to ${values[best + 1]}°C: a rise of ${values[best + 1] - values[best]}°C. **${gaps[best]}** is the biggest rise.`,
      };
    },
  },
  {
    key: "cd-mean",
    skill: S.mean,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const n = difficulty === 1 ? 3 : int(r, 4, 5);
      const mean = int(r, 3, difficulty === 1 ? 9 : 15);
      // Numbers that add up to n × mean.
      const values = Array.from({ length: n }, () => mean);
      for (let k = 0; k < n * 2; k++) {
        const i = int(r, 0, n - 1);
        const j = int(r, 0, n - 1);
        const d = int(r, 1, 3);
        if (i !== j && values[j] - d >= 1) {
          values[i] += d;
          values[j] -= d;
        }
      }
      const sum = values.reduce((a, b) => a + b, 0);
      if (difficulty === 3) {
        const missing = values[n - 1];
        const known = values.slice(0, -1);
        return {
          kind: "number",
          prompt: `The mean of **${n}** numbers is **${mean}**. ${n - 1} of them are **${known.join(", ")}**. What is the last number?`,
          answer: missing,
          traps: [{ value: mean, misconception: M.mean, feedback: "Find the total first: mean × how many numbers. Then take away the ones you know." }, { value: known.reduce((a, b) => a + b, 0), misconception: M.mean, feedback: "That's the total of the ones you know. The total of all of them is mean × how many." }].filter((t) => t.value !== missing),
          hint: `The total of all ${n} numbers is ${n} × ${mean}.`,
          explanation: `Total: ${n} × ${mean} = ${n * mean}. ${n * mean} − ${known.join(" − ")} = **${missing}**.`,
        };
      }
      return {
        kind: "number",
        prompt: `Find the **mean** of these numbers: **${values.join(", ")}**.`,
        answer: mean,
        traps: [{ value: sum, misconception: M.mean, feedback: `That's the total. Now share it: divide by ${n}.` }, ...(n % 2 === 1 ? [{ value: [...values].sort((a, b) => a - b)[(n - 1) / 2], feedback: "That's the middle number. The mean is the total shared equally." }] : [])].filter((t) => t.value !== mean),
        hint: `Add them all up, then divide by how many there are (${n}).`,
        explanation: `${values.join(" + ")} = ${sum}. ${sum} ÷ ${n} = **${mean}**.`,
      };
    },
  },
];

export const chartsData = defineTopic({
  id: T,
  title: "Charts and data",
  subtitle: "Read pictograms, bar charts, tables, timetables and line graphs, and find the mean",
  world: "shape",
  years: [3, 4, 5, 6],
  order: 3,
  icon: "chart",
  skills: [
    { id: S.picto, title: "Pictograms", description: "Read pictograms using the key, including half pictures.", lessonId: "pictograms" },
    { id: S.bar, title: "Bar charts", description: "Read bar charts with different scales, and compare bars.", lessonId: "bar-charts" },
    { id: S.tables, title: "Tables and timetables", description: "Find information in tables and bus timetables.", lessonId: "tables" },
    { id: S.line, title: "Line graphs", description: "Read line graphs and find how much something changed.", lessonId: "line-graphs" },
    { id: S.mean, title: "The mean", description: "Find the mean (average) of a set of numbers.", lessonId: "mean" },
  ],
  lessonIcons: { pictograms: "star", "bar-charts": "chart", tables: "book", "line-graphs": "thermometer", mean: "scales" },
  lessons: [
    {
      id: "pictograms",
      title: "Pictograms",
      phase: "Understand",
      summary: "Always read the key first.",
      minutes: 6,
      objectives: ["Read a pictogram using its key", "Read half pictures"],
      steps: [
        {
          type: "explain",
          title: "Read the key",
          body: ["In this pictogram, **each circle stands for 2 children**. Half a circle is 1 child.", "Bananas has 3 circles and a half: 2 + 2 + 2 + 1 = **7 children**."],
          visual: { kind: "pictogram", rows: [{ label: "Apples", value: 4 }, { label: "Bananas", value: 7 }, { label: "Grapes", value: 10 }], key: 2, keyLabel: "2 children" },
          tip: "Look at the key before you count anything.",
        },
        { type: "check", title: "Your turn", questionId: gen("cd-picto", 1, 3) },
        { type: "check", title: "One more", questionId: gen("cd-picto", 2, 6) },
      ],
    },
    {
      id: "bar-charts",
      title: "Bar charts",
      phase: "Visualise",
      summary: "Check what each line on the scale is worth.",
      minutes: 7,
      objectives: ["Read bar charts with scales in 2s, 5s and 10s", "Compare two bars"],
      steps: [
        {
          type: "explain",
          title: "Check the scale",
          body: ["This scale goes up in **5s**. The Wednesday bar reaches **25**.", "A bar that stops halfway between 20 and 30 on a scale of 10s is **25**."],
          visual: { kind: "barchart", bars: [{ label: "Mon", value: 15 }, { label: "Tue", value: 20 }, { label: "Wed", value: 25 }, { label: "Thu", value: 10 }], max: 30, step: 5, axis: "Number" },
        },
        { type: "check", title: "Your turn", questionId: gen("cd-bar", 1, 2) },
        { type: "check", title: "One more", questionId: gen("cd-bar", 2, 7) },
      ],
    },
    {
      id: "tables",
      title: "Tables and timetables",
      phase: "Practise",
      summary: "Find the row, find the column, read where they meet.",
      minutes: 7,
      objectives: ["Read a two-way table", "Read a bus timetable"],
      steps: [
        {
          type: "explain",
          title: "Rows and columns",
          body: ["In a timetable, each **column** is one bus and each **row** is one stop.", "Bus B gets to the Library at **9:02**. It left the Station at **8:40**."],
          visual: { kind: "table", head: ["Stop", "Bus A", "Bus B"], rows: [["Station", "8:10", "8:40"], ["Park Road", "8:18", "8:48"], ["Library", "8:32", "9:02"]] },
          tip: "Keep your finger in one column so you don't jump to another bus.",
        },
        { type: "check", title: "Your turn", questionId: gen("cd-table", 1, 4) },
        { type: "check", title: "One more", questionId: gen("cd-table", 2, 3) },
      ],
    },
    {
      id: "line-graphs",
      title: "Line graphs",
      phase: "Explore",
      summary: "Go along, up to the line, then across.",
      minutes: 7,
      objectives: ["Read values from a line graph", "Find how much something changed"],
      steps: [
        {
          type: "explain",
          title: "Along, up, across",
          body: ["A line graph shows how something changes, like the temperature during a day.", "At 12:00, go up to the line, then across: it was **18°C**. From 8:00 to 12:00 it rose by 18 − 8 = **10°C**."],
          visual: { kind: "linegraph", points: [{ label: "8:00", value: 8 }, { label: "10:00", value: 12 }, { label: "12:00", value: 18 }, { label: "14:00", value: 20 }, { label: "16:00", value: 16 }], min: 0, max: 30, step: 2, axis: "°C" },
        },
        { type: "check", title: "Your turn", questionId: gen("cd-line", 1, 5) },
        { type: "check", title: "One more", questionId: gen("cd-line", 2, 2) },
      ],
    },
    {
      id: "mean",
      title: "The mean",
      phase: "Apply",
      summary: "Add them up, then share equally.",
      minutes: 7,
      objectives: ["Find the mean of a set of numbers", "Find a missing number from the mean"],
      steps: [
        {
          type: "worked",
          title: "Let's do it together",
          support: "faded",
          problem: "Find the mean of **4, 9, 5 and 6**.",
          steps: [
            { text: "Add them all up.", blank: { prompt: "What is 4 + 9 + 5 + 6?", answer: 24, hint: "4 + 6 = 10 and 9 + 5 = 14.", worked: "4 + 9 + 5 + 6 = **24**." } },
            { text: "There are 4 numbers, so share the total equally: 24 ÷ 4 = 6." },
          ],
          conclusion: "The mean is **6**: as if every number were 6.",
        },
        { type: "check", title: "Your turn", questionId: gen("cd-mean", 1, 3) },
        { type: "check", title: "One more", questionId: gen("cd-mean", 3, 4) },
      ],
    },
  ],
  templates,
  misconceptions: [
    { id: M.key, name: "Forgetting the key", possibleCause: "It looks like the pictures were counted without using the key.", description: "Counts 3 circles as 3, when each circle is 2.", explanation: ["Read the key first.", "Multiply the circles by what each one is worth."], skills: [S.picto], followUpTemplates: ["cd-picto"] },
    { id: M.scale, name: "Misreading the scale", possibleCause: "It looks like the scale was read in ones.", description: "Reads each line as 1 when the scale goes up in 2s, 5s or 10s.", explanation: ["Check the numbers on the scale.", "Work out what each line is worth."], skills: [S.bar, S.line], followUpTemplates: ["cd-bar", "cd-line"] },
    { id: M.op, name: "Add or take away?", possibleCause: "It looks like the numbers were added instead of compared (or the other way round).", description: "Adds when asked 'how many more'.", explanation: ["'How many more' or 'difference': take away.", "'Altogether' or 'total': add."], skills: [S.picto, S.bar, S.line, S.tables], followUpTemplates: ["cd-bar", "cd-picto"] },
    { id: M.mean, name: "Forgetting to divide", possibleCause: "It looks like the total was given, not the mean.", description: "Gives the total instead of the mean.", explanation: ["Mean = total ÷ how many numbers.", "Share the total out equally."], skills: [S.mean], followUpTemplates: ["cd-mean"] },
    { id: M.row, name: "Reading the wrong row or column", possibleCause: "It looks like the answer came from the wrong row or column.", description: "Reads the next bus, or the next stop, in a timetable.", explanation: ["Find the row and the column you need.", "Read where they meet."], skills: [S.tables], followUpTemplates: ["cd-table"] },
  ],
  placement: [
    { lessonId: "pictograms", template: "cd-picto" },
    { lessonId: "bar-charts", template: "cd-bar" },
    { lessonId: "tables", template: "cd-table" },
    { lessonId: "line-graphs", template: "cd-line" },
    { lessonId: "mean", template: "cd-mean" },
  ],
});
