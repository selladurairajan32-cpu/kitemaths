import { describe, expect, it } from "vitest";
import { STRATEGIES } from "@/maths/strategies";
import { topicById } from "@/topics";
import type { KitQuestion } from "@/topics/kit/types";
import { MM_SKILLS as S, skillOfStrategy } from "./index";

/** R3 island content: the strategy lesson template (MM-002) and the techniques each skill covers (MM-003 to MM-007). */

const topic = topicById("mental-maths")!;
const pool = topic.practiceQuestions as KitQuestion[];
const ids = (skill: string) => STRATEGIES.filter((s) => skillOfStrategy(s.id) === skill).map((s) => s.id);

describe("strategy lesson template (MM-002)", () => {
  it("gives every lesson: when to use it, why it works, a guided attempt, an independent transfer question and when not to use it", () => {
    for (const l of topic.lessons) {
      const titles = l.steps.map((s) => s.title);
      expect(titles.some((t) => t.startsWith("When to use it")), `${l.id}: when`).toBe(true);
      expect(titles, `${l.id}: why`).toContain("Why it works");
      expect(titles, `${l.id}: guided`).toContain("Let's do it together");
      expect(titles, `${l.id}: transfer`).toContain("Your turn");
      expect(titles, `${l.id}: unsuitable`).toContain("When not to use it");
      // The independent question is a real check, after the guided attempt.
      const guided = titles.indexOf("Let's do it together");
      const transfer = l.steps.findIndex((s) => s.title === "Your turn");
      expect(transfer > guided && l.steps[transfer].type === "check", l.id).toBe(true);
    }
  });

  it("uses a visual or place-value picture where it helps", () => {
    const withVisual = topic.lessons.filter((l) => l.steps.some((s) => "visual" in s && s.visual));
    expect(withVisual.length).toBeGreaterThanOrEqual(5);
  });
});

describe("techniques taught (MM-003 to MM-007)", () => {
  it("covers bonds, partitioning, bridging, compensation and counting up (MM-003), each mapped to prerequisites and ages", () => {
    expect(ids(S.bonds).sort()).toEqual(["bridge-10", "compensate-add", "compensate-sub", "count-up", "partition-add"]);
    for (const s of STRATEGIES) expect(s.prerequisites.length > 0 && s.years[0] <= s.years[1], s.id).toBe(true);
  });

  it("connects doubling and halving to multiplying, dividing and fractions, and explains why the product is kept (MM-004)", () => {
    expect(ids(S.doubling).sort()).toEqual(["double-halve", "halve-twice", "near-double"]);
    const lesson = JSON.stringify(topic.lessons.find((l) => l.id === "double-halve"));
    expect(lesson).toContain("halving and doubling cancel out");
    expect(lesson).toContain("A quarter is half of a half");
    expect(lesson).toContain("Dividing by 4 is halving twice");
  });

  it("covers partitioning, factors, commutativity and associativity, the special multipliers and dividing by factors (MM-005)", () => {
    expect(ids(S.special).sort()).toEqual(["times-11", "times-25", "times-5", "times-50", "times-9", "times-99"]);
    expect(ids(S.factors).sort()).toEqual(["divide-by-factors", "factorise", "near-hundred", "partition-mult"]);
    expect(STRATEGIES.find((s) => s.id === "factorise")!.why).toContain("Associativity");
    expect(STRATEGIES.find((s) => s.id === "partition-mult")!.why).toContain("distributive");
  });

  it("teaches squares, the numbers-ending-in-5 method and its boundary (MM-006)", () => {
    expect(ids(S.squares).sort()).toEqual(["next-square", "square-ending-5"]);
    expect(pool.some((q) => q.prompt.includes("²"))).toBe(true);
    expect(JSON.stringify(topic.lessons.find((l) => l.id === "square-patterns"))).toContain("34² is not");
  });

  it("covers percentages, fractions of amounts and why each method works (MM-007)", () => {
    expect(ids(S.fdp).sort()).toEqual(["five-percent", "fraction-of", "quarter-percent", "ten-percent"]);
    for (const id of ids(S.fdp)) expect(STRATEGIES.find((s) => s.id === id)!.why.length).toBeGreaterThan(20);
  });

  it("asks the child to choose a suitable method with its reason, with every other option unsuitable for the numbers (MM-010)", () => {
    const choose = pool.filter((q) => q.skill === S.choose && q.kind === "choose");
    expect(choose.length).toBeGreaterThan(20);
    for (const q of choose) if (q.kind === "choose") {
      expect(q.options.length, q.id).toBeGreaterThanOrEqual(2);
      // Each option names a method and its reason: "Name: when to use it".
      for (const o of q.options) expect(o.text, q.id).toMatch(/^[^:]+: /);
      for (const o of q.options.slice(1)) expect(o.feedback, q.id).toMatch(/^Not here: /);
    }
  });
});
