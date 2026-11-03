import { defineTopic, genFor, int, pick } from "@/topics/kit/define";
import type { ChooseOption, Template } from "@/topics/kit/types";

/** Time: reading clocks, 12- and 24-hour time, units of time, and how long things take. */

const T = "time";
const gen = genFor(T);
const S = { read: `${T}.read-clock`, clock24: `${T}.24-hour`, units: `${T}.units`, durations: `${T}.durations` };
const M = { hands: `${T}.hands-swapped`, nextHour: `${T}.wrong-hour`, number: `${T}.minute-number`, pm: `${T}.am-pm`, ten: `${T}.add-ten`, hundred: `${T}.hundred-minutes` };

const h12 = (h: number) => h % 12 || 12;
const mm = (m: number) => String(m).padStart(2, "0");
/** 15, 40 → "3:40" */
const clock12 = (h: number, m: number) => `${h12(h)}:${mm(m)}`;
/** 15, 40 → "15:40", 9, 5 → "09:05" */
const clock24 = (h: number, m: number) => `${String(h).padStart(2, "0")}:${mm(m)}`;
/** 15, 40 → "3:40 pm" */
const ampm = (h: number, m: number) => `${clock12(h, m)} ${h < 12 ? "am" : "pm"}`;
/** How we say it: "quarter to 4", "25 past 3", "17 minutes past 7". */
function say(h: number, m: number): string {
  const now = h12(h);
  const next = h12(h + 1);
  if (m === 0) return `${now} o'clock`;
  if (m === 15) return `quarter past ${now}`;
  if (m === 30) return `half past ${now}`;
  if (m === 45) return `quarter to ${next}`;
  const min = m % 5 === 0 ? "" : " minutes";
  return m < 30 ? `${m}${min} past ${now}` : `${60 - m}${min} to ${next}`;
}
/** Minutes after midnight → [hours, minutes]. */
const hm = (t: number) => [Math.floor(t / 60) % 24, t % 60] as const;

function unique(right: string, wrong: ChooseOption[]): ChooseOption[] {
  const out: ChooseOption[] = [{ text: right }];
  for (const w of wrong) if (!out.some((o) => o.text === w.text)) out.push(w);
  return out.slice(0, 4);
}

const templates: Template[] = [
  {
    key: "tm-read",
    skill: S.read,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const h = int(r, 1, 12);
      const m = difficulty === 1 ? pick(r, [0, 30]) : difficulty === 2 ? pick(r, [15, 45, int(r, 1, 11) * 5]) : int(r, 1, 59);
      const words = difficulty === 1 || (difficulty === 2 && r() < 0.5);
      const show = (hh: number, mi: number) => (words ? say(hh, mi) : clock12(hh, mi));
      const pointsAt = Math.round(m / 5) % 12 || 12;
      const wrong: ChooseOption[] = [
        // The hour hand is close to the next number after half past.
        { text: show(m >= 30 ? h + 1 : h - 1 + 12, m), misconception: M.nextHour, feedback: "The short hand has gone past the hour it shows, and not yet reached the next one." },
        ...(m % 5 === 0 && m !== 0 ? [{ text: show(pointsAt, (h % 12) * 5), misconception: M.hands, feedback: "The short hand shows the hour. The long hand shows the minutes." }] : []),
        ...(!words && m >= 5 ? [{ text: clock12(h, pointsAt), misconception: M.number, feedback: `The long hand points at ${pointsAt}, which means ${pointsAt * 5} minutes. Count in fives.` }] : []),
        { text: show(h, (m + 30) % 60), feedback: "Look again at where the long hand points." },
        { text: show(h + 1, m), misconception: M.nextHour, feedback: "Look at the short hand: which number has it just passed?" },
      ];
      return {
        kind: "choose",
        prompt: "What time does the clock show?",
        visual: { kind: "clock", hours: h, minutes: m },
        options: unique(show(h, m), wrong.filter((w) => w.text !== show(h, m))),
        answer: 0,
        hint: m === 0 || m === 30 ? "The long hand at 12 means o'clock. At 6, it means half past." : "The short hand is the hour. Count the long hand in fives from 12.",
        explanation: `The short hand is ${m === 0 ? "on" : "just past"} ${h12(h)} and the long hand shows ${m} minutes: **${show(h, m)}**${words ? "" : ` (${say(h, m)})`}.`,
      };
    },
  },
  {
    key: "tm-24",
    skill: S.clock24,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const pm = difficulty === 1 || r() < 0.75;
      const h = pm ? int(r, 13, 23) : int(r, 1, 11);
      const m = difficulty === 1 ? 0 : int(r, 1, 11) * 5;
      if (difficulty < 3) {
        return {
          kind: "choose",
          prompt: `What is **${ampm(h, m)}** in 24-hour time?`,
          options: unique(
            clock24(h, m),
            pm
              ? [
                  { text: clock24(h - 12, m), misconception: M.pm, feedback: "pm means after midday: add 12 to the hour." },
                  { text: clock24(h - 2, m), misconception: M.ten, feedback: "Add 12, not 10: 1 pm is 13:00." },
                  { text: clock24(h < 23 ? h + 1 : h - 1, m), feedback: "Check the hour: add 12." },
                ]
              : [
                  { text: clock24(h + 12, m), misconception: M.pm, feedback: "am is before midday, so the hour stays the same." },
                  { text: clock24(h + 1, m), feedback: "am hours stay the same." },
                  { text: clock24(h + 10, m), feedback: "am hours stay the same." },
                ],
          ),
          answer: 0,
          hint: pm ? "pm hours: add 12. 1 pm is 13:00." : "am hours stay the same: 9 am is 09:00.",
          explanation: `${ampm(h, m)} = **${clock24(h, m)}**.`,
        };
      }
      return {
        kind: "choose",
        prompt: `What is **${clock24(h, m)}** in 12-hour time?`,
        options: unique(ampm(h, m), [
          { text: `${clock12(h, m)} ${h < 12 ? "pm" : "am"}`, misconception: M.pm, feedback: h < 12 ? "Before 12:00 is am." : "After 12:00 is pm." },
          ...(h > 12 ? [{ text: `${clock12(h - 10, m)} pm`, misconception: M.ten, feedback: "Take away 12, not 10." }] : [{ text: `${clock12(h + 2, m)} am`, feedback: "The hour stays the same before midday." }]),
          { text: `${clock12(h + 1, m)} ${h < 11 ? "am" : "pm"}`, feedback: "Check the hour." },
        ]),
        answer: 0,
        hint: "Hours after 12 take away 12 and are pm. Hours before 12 are am.",
        explanation: `${clock24(h, m)} = **${ampm(h, m)}**.`,
      };
    },
  },
  {
    key: "tm-units",
    skill: S.units,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      if (difficulty === 1) {
        const [unit, per, small] = pick(r, [["hours", 60, "minutes"], ["minutes", 60, "seconds"], ["weeks", 7, "days"], ["days", 24, "hours"]] as const);
        const n = int(r, 2, unit === "days" ? 3 : 6);
        return {
          kind: "number",
          prompt: `How many **${small}** are in **${n} ${unit}**?`,
          answer: n * per,
          unit: small,
          traps: per === 60 ? [{ value: n * 100, misconception: M.hundred, feedback: `There are 60 ${small} in one ${unit.slice(0, -1)}, not 100.` }] : [],
          hint: `1 ${unit.slice(0, -1)} = ${per} ${small}.`,
          explanation: `${n} × ${per} = **${n * per} ${small}**.`,
        };
      }
      const big = int(r, 1, 3);
      const rest = int(r, 1, 11) * 5;
      const [unit, small] = pick(r, [["hour", "minutes"], ["minute", "seconds"]] as const);
      const total = big * 60 + rest;
      if (difficulty === 2) {
        return {
          kind: "number",
          prompt: `How many **${small}** is **${big} ${unit}${big > 1 ? "s" : ""} ${rest} ${small}**?`,
          answer: total,
          unit: small,
          traps: [{ value: big * 100 + rest, misconception: M.hundred, feedback: `One ${unit} is 60 ${small}, not 100.` }, { value: big + rest, feedback: `Change the ${unit}s into ${small} first.` }],
          hint: `${big} ${unit}${big > 1 ? "s" : ""} = ${big} × 60 ${small}. Then add ${rest}.`,
          explanation: `${big} × 60 + ${rest} = **${total} ${small}**.`,
        };
      }
      // Level 3: the other way. 150 minutes is 2 hours 30 minutes, not 1 hour 50.
      const say2 = (a: number, b: number) => `${a} ${unit}${a === 1 ? "" : "s"} ${b} ${small}`;
      const asHundred = [Math.floor(total / 100), total % 100] as const;
      return {
        kind: "choose",
        prompt: `**${total} ${small}** is the same as…`,
        options: unique(say2(big, rest), [
          ...(asHundred[0] > 0 && asHundred[1] < 60 && asHundred[0] !== big ? [{ text: say2(asHundred[0], asHundred[1]), misconception: M.hundred, feedback: `One ${unit} is 60 ${small}, not 100.` }] : []),
          { text: say2(big + 1, rest), feedback: `${big + 1} ${unit}s would be ${(big + 1) * 60} ${small}.` },
          { text: say2(big, (rest + 20) % 60 || 10), feedback: `Take away ${big} × 60 = ${big * 60} ${small}. What is left?` },
          { text: say2(Math.max(1, big - 1), rest), feedback: `Count the whole ${unit}s: how many 60s fit into ${total}?` },
        ]),
        answer: 0,
        hint: `How many 60s fit into ${total}? What is left?`,
        explanation: `${total} = ${big} × 60 + ${rest}, so it's **${say2(big, rest)}**.`,
      };
    },
  },
  {
    key: "tm-duration",
    skill: S.durations,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const what = pick(r, difficulty === 3 ? ["A film", "A car journey", "A school trip", "A train journey"] : ["A swimming lesson", "A TV show", "A piano lesson", "A bike ride"]);
      // Times in minutes after midnight.
      // Level 1 stays inside one hour, so it starts by half past.
      const start = difficulty === 1 ? int(r, 9, 16) * 60 + int(r, 0, 6) * 5 : difficulty === 3 ? int(r, 13 * 12, 17 * 12) * 5 : int(r, 9 * 12, 16 * 12) * 5;
      const length = difficulty === 1 ? int(r, 2, Math.max(2, 11 - (start % 60) / 5)) * 5 : difficulty === 2 ? int(r, 4, 11) * 5 : int(r, 13, 35) * 5;
      const end = start + length;
      const [sh, sm] = hm(start);
      const [eh, em] = hm(end);
      const show = difficulty === 3 ? clock24 : clock12;
      // Taking the times away as if they were ordinary numbers: 3:20 − 2:45 → 75.
      const asNumbers = eh * 100 + em - (sh * 100 + sm);
      return {
        kind: "number",
        prompt: `${what} starts at **${show(sh, sm)}** and ends at **${show(eh, em)}**. How many minutes long is it?`,
        visual: difficulty < 3 ? { kind: "clock", hours: sh, minutes: sm } : undefined,
        answer: length,
        unit: "minutes",
        traps: asNumbers !== length ? [{ value: asNumbers, misconception: M.hundred, feedback: "Times aren't ordinary numbers: an hour has 60 minutes, not 100. Count on to the next hour." }] : [],
        hint: sm === 0 ? "Count on from the start time." : `Count on to the next o'clock first: ${show(sh, sm)} to ${show(sh + 1, 0)} is ${60 - sm} minutes.`,
        explanation:
          sh === eh
            ? `From ${show(sh, sm)} to ${show(eh, em)} is **${length} minutes**.`
            : `${show(sh, sm)} to ${show(sh + 1, 0)} is ${60 - sm} minutes${eh - sh > 1 ? `, then ${(eh - sh - 1) * 60} minutes to ${show(eh, 0)}` : ""}, then ${em} minutes more: **${length} minutes**.`,
      };
    },
  },
  {
    key: "tm-end",
    skill: S.durations,
    difficulties: [1, 2, 3],
    make: (r, { difficulty }) => {
      const start = int(r, 8 * 12, 17 * 12) * 5;
      const length = difficulty === 1 ? pick(r, [15, 30, 45]) : difficulty === 2 ? int(r, 5, 11) * 5 : int(r, 13, 23) * 5;
      const end = start + length;
      const [sh, sm] = hm(start);
      const [eh, em] = hm(end);
      const show = difficulty === 3 ? clock24 : clock12;
      const len = length >= 60 ? `${Math.floor(length / 60)} hour${length >= 120 ? "s" : ""} ${length % 60} minutes` : `${length} minutes`;
      const what = pick(r, [["A cake goes in the oven", "When is it ready?", "bakes for"], ["A bus leaves", "When does it arrive?", "takes"], ["A film starts", "When does it finish?", "lasts"]] as const);
      return {
        kind: "choose",
        prompt: `${what[0]} at **${show(sh, sm)}**. It ${what[2]} **${len}**. ${what[1]}`,
        options: unique(show(eh, em), [
          ...(sm + (length % 60) >= 60 ? [{ text: `${difficulty === 3 ? String(sh + Math.floor(length / 60)).padStart(2, "0") : h12(sh + Math.floor(length / 60))}:${sm + (length % 60)}`, misconception: M.hundred, feedback: "An hour has 60 minutes. When the minutes pass 60, go on to the next hour." }] : []),
          { text: show(...hm(end + 10)), feedback: "Count on again carefully." },
          { text: show(...hm(end - 10)), feedback: "Count on again carefully." },
          { text: show(...hm(end + 60)), misconception: M.nextHour, feedback: "Check the hour." },
        ]),
        answer: 0,
        hint: sm === 0 ? `Count on ${len} from ${show(sh, sm)}.` : `Count on to the next o'clock first: ${60 - sm} minutes to ${show(sh + 1, 0)}.`,
        explanation: `${show(sh, sm)} + ${len} = **${show(eh, em)}**.`,
      };
    },
  },
];

export const time = defineTopic({
  id: T,
  title: "Time",
  subtitle: "Read clocks, use 12- and 24-hour time, change units of time and work out how long things take",
  world: "measure",
  years: [3, 4, 5, 6],
  order: 2,
  icon: "clock",
  skills: [
    { id: S.read, title: "Read the clock", description: "Tell the time on a clock to the nearest minute.", lessonId: "read" },
    { id: S.clock24, title: "12- and 24-hour time", description: "Change between am/pm and 24-hour times.", lessonId: "24-hour" },
    { id: S.units, title: "Units of time", description: "Change between seconds, minutes, hours, days and weeks.", lessonId: "units" },
    { id: S.durations, title: "How long?", description: "Work out how long something takes, and when it ends.", lessonId: "durations" },
  ],
  lessonIcons: { read: "clock", "24-hour": "sun", units: "dice", durations: "rocket" },
  lessons: [
    {
      id: "read",
      title: "Read the clock",
      phase: "Understand",
      summary: "The short hand is the hour; the long hand counts minutes in fives.",
      minutes: 8,
      objectives: ["Read o'clock, half past and quarter times", "Read times to 5 minutes and to the minute"],
      steps: [
        {
          type: "explain",
          title: "Two hands",
          body: ["The **short hand** shows the **hour**. The **long hand** shows the **minutes**.", "When the long hand points at **12**, it's o'clock. This clock shows **3 o'clock**."],
          visual: { kind: "clock", hours: 3, minutes: 0 },
        },
        {
          type: "explain",
          title: "Half past",
          body: ["The long hand at **6** means **half past**. This is **half past 4: 4:30**.", "See how the short hand is **halfway between 4 and 5**."],
          visual: { kind: "clock", hours: 4, minutes: 30 },
          tip: "After half past, the short hand is nearer the next hour. Don't let it trick you!",
        },
        { type: "check", title: "Your turn", questionId: gen("tm-read", 1, 2) },
        {
          type: "worked",
          title: "Count in fives",
          support: "full",
          problem: "What time does this clock show?",
          visual: { kind: "clock", hours: 7, minutes: 25 },
          steps: [{ text: "The short hand has just passed **7**." }, { text: "The long hand points at **5**. Count in fives: 5, 10, 15, 20, **25**." }],
          conclusion: "It's **7:25**: 25 past 7.",
        },
        { type: "check", title: "One more", questionId: gen("tm-read", 2, 7) },
      ],
    },
    {
      id: "24-hour",
      title: "24-hour time",
      phase: "Visualise",
      summary: "After midday, add 12 to the hour.",
      minutes: 6,
      objectives: ["Change am and pm times to 24-hour time", "Change 24-hour times back"],
      steps: [
        {
          type: "explain",
          title: "Counting on past 12",
          body: ["A day has **24 hours**. In 24-hour time the hours keep counting after midday: 1 pm is **13:00**, 2 pm is **14:00**.", "So **3:45 pm = 15:45**. Morning times keep their hour: **9:15 am = 09:15**."],
          visual: { kind: "clock", hours: 15, minutes: 45, digital: true },
          tip: "pm: add 12. Back again: take away 12.",
        },
        { type: "check", title: "Your turn", questionId: gen("tm-24", 1, 3) },
        { type: "check", title: "One more", questionId: gen("tm-24", 3, 5) },
      ],
    },
    {
      id: "units",
      title: "Units of time",
      phase: "Practise",
      summary: "60 seconds, 60 minutes, 24 hours, 7 days.",
      minutes: 6,
      objectives: ["Know the units of time", "Change between units"],
      steps: [
        {
          type: "explain",
          title: "Not 100!",
          body: ["**60 seconds** = 1 minute. **60 minutes** = 1 hour. **24 hours** = 1 day. **7 days** = 1 week.", "So **2 hours 15 minutes** is 60 + 60 + 15 = **135 minutes**, not 215."],
          tip: "Time doesn't count in hundreds: there are 60 minutes in an hour.",
        },
        { type: "check", title: "Your turn", questionId: gen("tm-units", 1, 2) },
        { type: "check", title: "One more", questionId: gen("tm-units", 2, 8) },
      ],
    },
    {
      id: "durations",
      title: "How long?",
      phase: "Apply",
      summary: "Count on to the next o'clock, then on again.",
      minutes: 8,
      objectives: ["Find how long something takes", "Find when something ends"],
      steps: [
        {
          type: "worked",
          title: "Watch me count on",
          support: "full",
          problem: "A film starts at **2:45** and ends at **4:20**. How long is it?",
          visual: { kind: "line", min: 0, max: 95, step: 5, labels: [{ value: 0, text: "2:45" }, { value: 15, text: "3:00" }, { value: 75, text: "4:00" }, { value: 95, text: "4:20" }], jumps: [{ from: 0, to: 15, label: "15 min" }, { from: 15, to: 75, label: "1 hour" }, { from: 75, to: 95, label: "20 min" }] },
          steps: [{ text: "2:45 to **3:00** is 15 minutes." }, { text: "3:00 to **4:00** is 1 hour: 60 minutes." }, { text: "4:00 to **4:20** is 20 minutes." }, { text: "15 + 60 + 20 = 95." }],
          conclusion: "The film is **95 minutes** long: 1 hour 35 minutes.",
        },
        { type: "check", title: "Your turn", questionId: gen("tm-duration", 2, 4) },
        { type: "check", title: "One more", questionId: gen("tm-end", 2, 6) },
      ],
    },
  ],
  templates,
  misconceptions: [
    { id: M.hands, name: "Mixing up the hands", possibleCause: "It looks like the short and long hands were swapped.", description: "Reads the long hand as the hour.", explanation: ["Short hand: hours.", "Long hand: minutes, counted in fives."], skills: [S.read], followUpTemplates: ["tm-read"] },
    { id: M.nextHour, name: "Reading the wrong hour", possibleCause: "It looks like the hour was read from the wrong number.", description: "Reads 3:45 as 4:45, because the short hand is nearly at 4.", explanation: ["The hour is the number the short hand has just passed.", "At quarter to 4, it's still 3-something: 3:45."], skills: [S.read, S.durations], followUpTemplates: ["tm-read"] },
    { id: M.number, name: "Reading the minute number", possibleCause: "It looks like the number the long hand points at was read as the minutes.", description: "Reads 3:20 as 3:04.", explanation: ["Each number on the clock is 5 minutes.", "The long hand at 4 means 4 × 5 = 20 minutes."], skills: [S.read], followUpTemplates: ["tm-read"] },
    { id: M.pm, name: "am and pm mixed up", possibleCause: "It looks like am and pm got mixed up.", description: "Writes 3 pm as 03:00.", explanation: ["am is before midday; pm is after.", "pm times add 12 in 24-hour time."], skills: [S.clock24], followUpTemplates: ["tm-24"] },
    { id: M.ten, name: "Adding 10, not 12", possibleCause: "It looks like 10 was added instead of 12.", description: "Writes 3 pm as 13:00.", explanation: ["Midday is 12:00, so 1 pm is 13:00.", "Add 12: 3 pm = 15:00."], skills: [S.clock24], followUpTemplates: ["tm-24"] },
    { id: M.hundred, name: "100 minutes in an hour", possibleCause: "It looks like time was worked out as if an hour had 100 minutes.", description: "Says 2 hours 15 minutes is 215 minutes, or 3:20 − 2:45 is 75 minutes.", explanation: ["An hour has 60 minutes.", "Count on to the next o'clock, then on again."], skills: [S.units, S.durations], followUpTemplates: ["tm-units", "tm-duration"] },
  ],
  placement: [
    { lessonId: "read", template: "tm-read" },
    { lessonId: "24-hour", template: "tm-24" },
    { lessonId: "units", template: "tm-units" },
    { lessonId: "durations", template: "tm-duration" },
  ],
});
