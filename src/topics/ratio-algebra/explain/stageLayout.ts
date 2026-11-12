import type { RatioScene } from "./ratioStory";

/**
 * D-040: where everything sits on the 3D ratio stage for each scene, as pure data. Each object has a stable key, so
 * it keeps its identity from beat to beat and the stage can glide it to its new place.
 */

/** Colour names the stage maps to design tokens. */
export type Colour = "brand" | "brandStrong" | "num" | "numStrong" | "sky" | "skySoft" | "tile" | "sun" | "sunStrong" | "surface" | "sunk" | "line" | "ink" | "ok";

export type V3 = [number, number, number];
export type Item = { key: string; shape: "cube" | "sweet" | "egg" | "part"; color: Colour; pos: V3; scale?: number; label?: string };

export const UNIT = 0.56;

/** Where the sweets go at each stage of sharing (and in Try it), keyed so each sweet keeps its identity. */
function sweetsFor(total: number, a: number, b: number, place: (i: number, group: number, j: number) => { pos: V3; color: Colour; scale?: number }): Item[] {
  const n = a + b;
  return Array.from({ length: total }, (_, i) => ({ key: `s${i}`, shape: "sweet" as const, ...place(i, Math.floor(i / n), i % n) }));
}
/** The k-th sweet in a jar at x: six to a layer, in a ring. */
function inJar(k: number, x: number): V3 {
  const layer = Math.floor(k / 6);
  const angle = (k % 6) * (Math.PI / 3) + layer * 0.5;
  return [x + Math.cos(angle) * 0.42, 0.22 + layer * 0.3, Math.sin(angle) * 0.42];
}
function heap(i: number): V3 {
  const angle = i * 2.4;
  const r = 0.28 * Math.sqrt(i);
  return [Math.cos(angle) * r, 0.2 + Math.max(0, 1.2 - r) * 0.35, Math.sin(angle) * r];
}

export function layout(scene: RatioScene): { items: Item[]; labels: { key: string; pos: V3; text: string }[]; jars: number[]; jug?: number } {
  if (scene.kind === "groups") {
    const items: Item[] = [];
    const labels: { key: string; pos: V3; text: string }[] = [];
    const per = scene.a + scene.b;
    for (let g = 0; g < scene.groups; g++) {
      const cx = (g - (scene.groups - 1) / 2) * 3.05;
      for (let j = 0; j < per; j++) items.push({ key: `g${g}c${j}`, shape: "cube", color: j < scene.a ? "brand" : "num", pos: [cx + (j - (per - 1) / 2) * 0.58 + (j >= scene.a ? 0.12 : -0.12), UNIT / 2 + 0.1, 0] });
      labels.push({ key: `gl${g}`, pos: [cx, 1.35, 0], text: `Group ${g + 1}` });
    }
    if (scene.count) labels.push({ key: "count", pos: [0, -0.2, 1.9], text: `${scene.groups * scene.a} blue : ${scene.groups * scene.b} orange` });
    return { items, labels, jars: [] };
  }
  if (scene.kind === "share") {
    const { total, a, b, stage } = scene;
    const n = a + b;
    const groupsCount = total / n;
    if (stage === "pile") return { items: sweetsFor(total, a, b, (i) => ({ pos: heap(i), color: "sun" })), labels: [{ key: "pile", pos: [0, 1.6, 0], text: `${total} sweets` }], jars: [] };
    if (stage === "groups") {
      return {
        items: sweetsFor(total, a, b, (_, g, j) => ({ pos: [((g % 4) - 1.5) * 2.2 + (j - (n - 1) / 2) * 0.37, 0.2, (Math.floor(g / 4) - 0.5) * 1.5], color: j < a ? "brand" : "num" })),
        labels: [{ key: "groups", pos: [0, 1.4, 0], text: `${total} ÷ ${n} = ${groupsCount} groups` }],
        jars: [],
      };
    }
    const jarItems = sweetsFor(total, a, b, (_, g, j) => (j < a ? { pos: inJar(g * a + j, -1.7), color: "brand" } : { pos: inJar(g * b + (j - a), 1.7), color: "num" }));
    if (stage === "jars") return { items: jarItems, labels: [{ key: "ja", pos: [-1.7, 2.6, 0], text: `Blue ${groupsCount * a}` }, { key: "jb", pos: [1.7, 2.6, 0], text: `Orange ${groupsCount * b}` }], jars: [-1.7, 1.7] };
    // The bar: the sweets shrink away and five equal parts rise in their place.
    const parts: Item[] = Array.from({ length: n }, (_, p) => ({ key: `p${p}`, shape: "part", color: p < a ? "brand" : "num", pos: [(p - (n - 1) / 2) * 1.1, 0.35, 0], label: `${groupsCount}` }));
    return { items: [...sweetsFor(total, a, b, (i) => ({ pos: heap(i), color: "sun", scale: 0 })), ...parts], labels: [{ key: "ba", pos: [-((n - 1) / 2) * 1.1 + ((a - 1) / 2) * 1.1, -0.3, 0.9], text: `Blue ${groupsCount * a}` }, { key: "bb", pos: [-((n - 1) / 2) * 1.1 + (a + (b - 1) / 2) * 1.1, -0.3, 0.9], text: `Orange ${groupsCount * b}` }], jars: [] };
  }
  if (scene.kind === "recipe") {
    const eggs: Item[] = Array.from({ length: 6 }, (_, i) => ({ key: `e${i}`, shape: "egg", color: "sun", pos: [-2.6 + (i % 3) * 0.75, 0.35, (Math.floor(i / 3) - 0.5) * 0.8], scale: i < scene.eggs ? 1 : 0 }));
    return { items: eggs, labels: [{ key: "eggs", pos: [-1.85, 1.3, 0], text: `${scene.eggs} eggs` }, { key: "milk", pos: [1.8, 2.7, 0], text: `${scene.milk} ml milk` }, { key: "people", pos: [0, 3.1, -1], text: `For ${scene.people} people` }], jars: [], jug: scene.milk };
  }
  const { total, a, b, dealt } = scene;
  const n = a + b;
  const used = dealt * n;
  return {
    items: sweetsFor(total, a, b, (i, g, j) => (i < used ? (j < a ? { pos: inJar(g * a + j, -0.6), color: "brand" } : { pos: inJar(g * b + (j - a), 2.2), color: "num" }) : { pos: [-3.6 + ((i - used) % 5) * 0.32, 0.2 + Math.floor((i - used) / 5) * 0.3, 0], color: "ink" })),
    labels: [{ key: "left", pos: [-3, 2.4, 0], text: `Left ${total - used}` }, { key: "ja", pos: [-0.6, 2.6, 0], text: `Jar A ${dealt * a}` }, { key: "jb", pos: [2.2, 2.6, 0], text: `Jar B ${dealt * b}` }],
    jars: [-0.6, 2.2],
  };
}

