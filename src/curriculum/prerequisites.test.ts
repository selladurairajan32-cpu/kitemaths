import { describe, expect, it } from "vitest";
import { TOPICS } from "@/topics";
import { allPrerequisites, findCycle, FRACTIONS_SKILL_PREREQUISITES, ISLAND_PREREQUISITES, PLANNED_AREAS, PLANNED_GRAPH, type Graph } from "./prerequisites";

/** CUR-002: the prerequisite graph is explicit, valid and consistent with the content it describes. */

const islands = new Set(TOPICS.map((t) => t.id));
const skills = new Set(TOPICS.flatMap((t) => t.skills.map((s) => s.id)));
const planned = new Set(PLANNED_AREAS.map((a) => a.id));
const fractions = TOPICS.find((t) => t.id === "fractions")!;
const all: Graph = { ...ISLAND_PREREQUISITES, ...FRACTIONS_SKILL_PREREQUISITES, ...PLANNED_GRAPH };

describe("prerequisite graph (CUR-002)", () => {
  it("has no cycles, at island level, at Fractions skill level, or across planned areas", () => {
    expect(findCycle(ISLAND_PREREQUISITES)).toBeNull();
    expect(findCycle(FRACTIONS_SKILL_PREREQUISITES)).toBeNull();
    expect(findCycle(all)).toBeNull();
    // The cycle finder itself works.
    expect(findCycle({ a: ["b"], b: ["a"] })).toEqual(["a", "b", "a"]);
  });

  it("covers every island and every Fractions skill", () => {
    expect(Object.keys(ISLAND_PREREQUISITES).sort()).toEqual([...islands].sort());
    expect(Object.keys(FRACTIONS_SKILL_PREREQUISITES).sort()).toEqual(fractions.skills.map((s) => s.id).sort());
  });

  it("uses only real islands, real skills or planned areas", () => {
    for (const [node, prereqs] of Object.entries(all)) {
      for (const p of prereqs) expect(islands.has(p) || skills.has(p) || planned.has(p), `${node} -> ${p}`).toBe(true);
    }
  });

  it("places Times Tables fluency (R2) and Mental Maths (R3) in the graph as planned areas", () => {
    expect(PLANNED_AREAS.some((a) => a.release === "R2" && a.id === "planned:tt-fluency")).toBe(true);
    expect(PLANNED_AREAS.filter((a) => a.release === "R3").length).toBeGreaterThanOrEqual(3);
    for (const a of PLANNED_AREAS) expect(islands.has(a.id), `${a.id} must not clash with a built island`).toBe(false);
    // Mental Maths builds on times-table fluency, which builds on the Times tables island.
    expect(allPrerequisites(all, "planned:mm-multiplicative").has("times-tables")).toBe(true);
  });

  it("teaches every Fractions prerequisite in an earlier lesson", () => {
    const lessonIndex = (skillId: string) => fractions.lessons.findIndex((l) => l.id === fractions.skillById(skillId).lessonId);
    for (const [skill, prereqs] of Object.entries(FRACTIONS_SKILL_PREREQUISITES)) {
      for (const p of prereqs.filter((p) => p.startsWith("fractions."))) {
        expect(lessonIndex(p), `${p} should come before ${skill}`).toBeLessThan(lessonIndex(skill));
      }
    }
  });

  it("shows a picture or a lab before the first check in every Fractions lesson (concrete before abstract)", () => {
    for (const l of fractions.lessons) {
      const firstCheck = l.steps.findIndex((s) => s.type === "check");
      const before = l.steps.slice(0, firstCheck < 0 ? l.steps.length : firstCheck);
      expect(
        before.some((s) => s.type === "lab" || ("visual" in s && !!s.visual)),
        l.id,
      ).toBe(true);
    }
  });
});
