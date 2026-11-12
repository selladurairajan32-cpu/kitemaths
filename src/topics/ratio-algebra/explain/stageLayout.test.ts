import { describe, expect, it } from "vitest";
import { layout } from "./stageLayout";

/** D-040: what the 3D stage places for each scene. Oracles: hand-counted objects for 35 in 2 : 3. */

const scene = (stage: "pile" | "groups" | "jars" | "bar") => ({ kind: "share" as const, total: 35, a: 2, b: 3, stage });

describe("3D ratio stage layout (D-040)", () => {
  it("keeps the same 35 sweets from the pile to the groups to the jars, so each one glides rather than reappears", () => {
    const keys = (s: ReturnType<typeof layout>) => s.items.filter((i) => i.shape === "sweet").map((i) => i.key).sort();
    const pile = layout(scene("pile"));
    expect(keys(pile)).toHaveLength(35);
    expect(keys(layout(scene("groups")))).toEqual(keys(pile));
    expect(keys(layout(scene("jars")))).toEqual(keys(pile));
  });

  it("puts 14 blue sweets in one jar and 21 orange in the other, and labels them so", () => {
    const jars = layout(scene("jars"));
    const blue = jars.items.filter((i) => i.shape === "sweet" && i.color === "brand");
    const orange = jars.items.filter((i) => i.shape === "sweet" && i.color === "num");
    expect([blue.length, orange.length]).toEqual([14, 21]);
    expect(blue.every((i) => i.pos[0] < 0) && orange.every((i) => i.pos[0] > 0)).toBe(true);
    expect(jars.labels.map((l) => l.text)).toEqual(["Blue 14", "Orange 21"]);
    expect(jars.jars).toHaveLength(2);
  });

  it("raises five equal parts of 7 for the bar, two blue and three orange, and hides the sweets", () => {
    const bar = layout(scene("bar"));
    const parts = bar.items.filter((i) => i.shape === "part");
    expect(parts.map((p) => [p.color, p.label])).toEqual([["brand", "7"], ["brand", "7"], ["num", "7"], ["num", "7"], ["num", "7"]]);
    expect(bar.items.filter((i) => i.shape === "sweet").every((i) => i.scale === 0)).toBe(true);
  });

  it("draws three groups of 2 blue and 3 orange cubes, with the running count", () => {
    const g = layout({ kind: "groups", groups: 3, a: 2, b: 3, count: true });
    expect(g.items.filter((i) => i.color === "brand")).toHaveLength(6);
    expect(g.items.filter((i) => i.color === "num")).toHaveLength(9);
    expect(g.labels.at(-1)!.text).toBe("6 blue : 9 orange");
  });

  it("shows the scaled recipe: 3 eggs and a 450 ml jug for 6 people", () => {
    const r = layout({ kind: "recipe", people: 6, eggs: 3, milk: 450 });
    expect(r.items.filter((i) => i.shape === "egg" && i.scale !== 0)).toHaveLength(3);
    expect(r.jug).toBe(450);
  });

  it("deals Try it groups into the jars and leaves the rest in the pile (hand-worked: 20 in 3 : 1, 2 groups dealt)", () => {
    const d = layout({ kind: "deal", total: 20, a: 3, b: 1, dealt: 2 });
    expect(d.labels.map((l) => l.text)).toEqual(["Left 12", "Jar A 6", "Jar B 2"]);
    expect(d.items.filter((i) => i.color === "ink")).toHaveLength(12);
  });
});
