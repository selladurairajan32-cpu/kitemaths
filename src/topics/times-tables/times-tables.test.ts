import { describe, expect, it } from "vitest";
import { topicById } from "@/topics";
import type { KitQuestion } from "@/topics/kit/types";
import { factKey } from "@/engine/facts";
import { factResult, skillForFact } from "./facts";
import { TT_SKILLS as S } from "./index";

/** R2 content: TT-002 and TT-003 lessons, and how fact answers are stored. Oracles are hand-written expectations. */

const topic = topicById("times-tables")!;
const lesson = (id: string) => topic.lessons.find((l) => l.id === id)!;
const visuals = (id: string) => lesson(id).steps.flatMap((s) => ("visual" in s && s.visual ? [(s.visual as { kind: string }).kind] : []));
const pool = (skill: string) => (topic.practiceQuestions as KitQuestion[]).filter((q) => q.skill === skill);
const text = (id: string) => JSON.stringify(lesson(id));

describe("conceptual multiplication lessons (TT-002)", () => {
  it("teach equal groups, repeated addition, number-line jumps, arrays and scaling, each joined to a times sign", () => {
    expect(visuals("groups-and-jumps")).toEqual(expect.arrayContaining(["groups", "line", "bar"]));
    expect(text("groups-and-jumps")).toContain("3 + 3 + 3 + 3 = 12");
    expect(text("groups-and-jumps")).toContain("4 × 3 = 12");
    expect(text("groups-and-jumps")).toContain("times as long");
    expect(visuals("two-five-ten")).toContain("array");
    // Practice covers each representation with a symbolic answer (AC3: representations connect to symbolic facts).
    const kinds = new Set(pool(S.meaning).map((q) => (q.visual as { kind?: string } | undefined)?.kind ?? q.kind));
    expect([...kinds]).toEqual(expect.arrayContaining(["groups", "line", "bar", "choose"]));
  });

  it("show commutativity and the distributive law", () => {
    expect(text("turn-and-split")).toContain("3 × 6 = 6 × 3");
    expect(text("turn-and-split")).toContain("5 lots of 6 and 2 lots of 6");
    const prompts = pool(S.laws).map((q) => q.prompt).join(" | ");
    expect(prompts).toMatch(/What is \*\*\d+ × \d+\*\*\?/);
    expect(prompts).toMatch(/is the same as \*\*\d+ × \d+ \+ \? × \d+\*\*/);
  });
});

describe("division and inverse-fact lessons (TT-003)", () => {
  it("cover sharing and grouping, and connect each multiplication to two divisions", () => {
    expect(text("share-and-group")).toContain("shared between 3");
    expect(text("share-and-group")).toContain("boxes of 3");
    expect(text("share-and-group")).toContain("12 ÷ 3 = 4 and 12 ÷ 4 = 3");
    const prompts = pool(S.families).map((q) => q.prompt).join(" | ");
    expect(prompts).toContain("shared equally between");
    expect(prompts).toMatch(/put into \w+ of/);
  });

  it("let the learner identify a fact family and choose the explanation of the relationship", () => {
    const odd = pool(S.families).filter((q) => q.prompt.includes("not** part of the fact family"));
    const why = pool(S.families).filter((q) => q.prompt.includes("Why does that tell you"));
    expect(odd.length).toBeGreaterThan(0);
    expect(why.length).toBeGreaterThan(0);
    for (const q of why) if (q.kind === "choose") expect(q.options[q.answer].text).toMatch(/groups of/);
  });
});

describe("storing a fact answer (TT-004 to TT-012)", () => {
  it("counts each fact towards the family of its harder number, and division towards division facts", () => {
    // Hand-written table of expectations.
    expect(skillForFact({ a: 2, b: 5, form: "mul" })).toBe(S.easy);
    expect(skillForFact({ a: 4, b: 10, form: "mul" })).toBe(S.doubling);
    expect(skillForFact({ a: 7, b: 3, form: "mul" })).toBe(S.tricky);
    expect(skillForFact({ a: 12, b: 2, form: "mul" })).toBe(S.big);
    expect(skillForFact({ a: 12, b: 7, form: "div-quotient" })).toBe(S.division);
  });

  it("flags a slip without judging it, keeps timed answers in their own context, and marks a late timed answer wrong", () => {
    const base = { session: "s", index: 0, attempts: 1, hintsUsed: 0, durationMs: 2000, at: 5 };
    const slip = factResult({ ...base, mode: "practice", fact: { a: 7, b: 8, form: "mul" }, given: 65 });
    expect(slip).toMatchObject({ correct: false, slip: true, context: "practice", fact: { a: 7, b: 8, form: "mul" } });
    expect(slip.questionId).toContain(factKey(7, 8));
    const timed = factResult({ ...base, mode: "timed", fact: { a: 6, b: 7, form: "mul" }, given: 42, inTime: false });
    expect(timed).toMatchObject({ correct: false, timed: true, context: "timed" });
    const neighbour = factResult({ ...base, mode: "practice", fact: { a: 7, b: 8, form: "mul" }, given: 63 });
    expect(neighbour.misconceptions).toEqual(["times-tables.one-step-out"]);
  });
});
