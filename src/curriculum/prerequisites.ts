/**
 * CUR-002: the prerequisite graph, as pure data. Spec: docs/product/curriculum/CUR-002-progression-model.md.
 *
 * Not yet used by the app (D-012): R1 wires it into recommendations and explained locks (FR-011).
 * Each entry maps a node to the nodes that should be secure before it. Prerequisites are
 * recommendations with explained "best after" locks, never hard walls.
 *
 * Ids are island ids (`src/topics/index.ts`), skill ids (`<island>.<skill>`) or planned areas
 * (`planned:<area>`, see PLANNED_AREAS) for Times Tables fluency (R2) and Mental Maths (R3).
 */

export type Graph = Readonly<Record<string, readonly string[]>>;

/** Island level: which islands' skills an island builds on. `place-value` and `times-tables` are entry points. */
export const ISLAND_PREREQUISITES: Graph = {
  "place-value": [],
  rounding: ["place-value"],
  negative: ["place-value"],
  "add-subtract": ["place-value"],
  "times-tables": [],
  "multiply-divide": ["place-value", "times-tables"],
  fractions: ["times-tables"],
  "fractions-2": ["fractions", "multiply-divide"],
  decimals: ["place-value", "fractions"],
  percentages: ["decimals", "fractions-2"],
  money: ["add-subtract"],
  time: ["add-subtract"],
  "area-perimeter": ["add-subtract", "times-tables"],
  "shapes-angles": ["add-subtract"],
  coordinates: ["negative"],
  "charts-data": ["add-subtract", "multiply-divide"],
  "ratio-algebra": ["multiply-divide", "fractions-2"],
  "problem-solving": ["add-subtract", "multiply-divide", "fractions"],
  "mock-exams": ["rounding", "negative", "multiply-divide", "percentages", "money", "time", "area-perimeter", "shapes-angles", "coordinates", "charts-data", "ratio-algebra", "problem-solving"],
};

/** Skill level for the R1 Fractions island, plus the one cross-island prerequisite it needs. */
export const FRACTIONS_SKILL_PREREQUISITES: Graph = {
  "fractions.equal-parts": [],
  "fractions.name": ["fractions.equal-parts"],
  "fractions.represent": ["fractions.name"],
  "fractions.compare": ["fractions.name", "fractions.represent"],
  "fractions.equivalent": ["fractions.represent", "fractions.compare"],
  "fractions.number-line": ["fractions.name"],
  // Finding 3/4 of 12 means sharing into equal groups: it needs division facts.
  "fractions.fraction-of": ["fractions.name", "times-tables.division-facts"],
  "fractions.reasoning": ["fractions.compare", "fractions.equivalent"],
};

/** Learning areas that are planned but not built yet, so the graph already shows where they sit. */
export const PLANNED_AREAS: readonly { id: string; title: string; release: "R2" | "R3"; backlog: string; prerequisites: readonly string[] }[] = [
  { id: "planned:tt-fluency", title: "Times Tables fluency (facts to 12 × 12, MTC-style practice)", release: "R2", backlog: "TT-001–TT-012", prerequisites: ["times-tables"] },
  { id: "planned:mm-additive", title: "Mental Maths: bonds, partitioning, bridging, compensation", release: "R3", backlog: "MM-003", prerequisites: ["place-value", "add-subtract"] },
  { id: "planned:mm-multiplicative", title: "Mental Maths: doubling, halving, factor and ×5/9/11/25 strategies", release: "R3", backlog: "MM-004–MM-006", prerequisites: ["planned:tt-fluency", "multiply-divide"] },
  { id: "planned:mm-fdp", title: "Mental Maths: fraction, decimal and percentage shortcuts", release: "R3", backlog: "MM-007", prerequisites: ["percentages", "planned:mm-multiplicative"] },
];

/** The planned areas as a graph, for checks that treat every node alike. */
export const PLANNED_GRAPH: Graph = Object.fromEntries(PLANNED_AREAS.map((a) => [a.id, a.prerequisites]));

/** A cycle in the graph (as a list of ids), or null if there is none. */
export function findCycle(graph: Graph): string[] | null {
  const state = new Map<string, "visiting" | "done">();
  const path: string[] = [];
  const visit = (id: string): string[] | null => {
    if (state.get(id) === "done") return null;
    if (state.get(id) === "visiting") return [...path.slice(path.indexOf(id)), id];
    state.set(id, "visiting");
    path.push(id);
    for (const p of graph[id] ?? []) {
      const c = visit(p);
      if (c) return c;
    }
    path.pop();
    state.set(id, "done");
    return null;
  };
  for (const id of Object.keys(graph)) {
    const c = visit(id);
    if (c) return c;
  }
  return null;
}

/** Everything a node depends on, directly or indirectly. */
export function allPrerequisites(graph: Graph, id: string): Set<string> {
  const out = new Set<string>();
  const walk = (n: string) => {
    for (const p of graph[n] ?? []) {
      if (!out.has(p)) {
        out.add(p);
        walk(p);
      }
    }
  };
  walk(id);
  return out;
}
