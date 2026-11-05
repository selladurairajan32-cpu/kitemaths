import { existsSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { analyse, projectOptions, type Analysis, type Dependency, type Problem } from "./architecture/analyse";

/**
 * ARCH-001: keeps the learning architecture modular (docs/product/architecture/ARCH-001-architecture.md §1–§4).
 *
 * Every rule works on parsed code (src/architecture/analyse.ts): real module resolution, all import
 * forms, and scope-aware detection of browser and network globals. `.ts` and `.tsx` files are both
 * checked; a `.tsx` file fails only if it has a forbidden dependency or behaviour. Fixtures in
 * src/architecture/fixtures prove the guard rejects bad code and accepts good code.
 */

const ROOT = process.cwd();
const UI_PACKAGES = new Set(["react", "react-dom", "next", "motion", "@next/font"]);
/** Content-contract files that import UI today (coupling K-1, K-2). Shrink this list; never grow it. */
const UI_TYPE_ALLOWLIST = ["src/topics/kit/define.ts", "src/topics/kit/types.ts", "src/topics/types.ts", "src/topics/worlds.ts"];
/**
 * Existing couplings the old regex guard missed, found on 5 Nov when the guard was rebuilt (DEF-023).
 * Recorded as K-6 and K-7 in ARCH-001 §4. They are known defects with a fix scheduled, not an allowance:
 * this list may only shrink.
 */
const DISCOVERED_COUPLINGS = [
  "src/topics/index.ts", // K-6: the topic registry imports the Fractions composition root (fractions/module.tsx)
  "src/topics/place-value/index.ts", // K-7: place-value digit maths is imported from a UI file (kit/visuals.tsx)
];

type Layer = "engine" | "maths" | "lessons" | "curriculum" | "questions" | "fractions-content" | "topics-contract" | "presentation" | "lib" | "other";
/** Layers that may depend only on themselves. */
const SELF_ONLY: Layer[] = ["engine", "maths"];
/** Layers that may not depend on UI. */
const NO_UI: Layer[] = ["lessons", "curriculum", "questions", "fractions-content"];
const PURE: Layer[] = [...SELF_ONLY, ...NO_UI];

function layerOf(file: string): Layer {
  const rel = relative(ROOT, file).split("\\").join("/");
  if (rel.startsWith("src/architecture/fixtures/")) return "engine"; // fixtures are checked as engine code
  if (rel.startsWith("src/engine/")) return "engine";
  if (rel.startsWith("src/maths/")) return "maths";
  if (rel.startsWith("src/lessons/")) return "lessons";
  if (rel.startsWith("src/curriculum/")) return "curriculum";
  if (rel.startsWith("src/questions/")) return "questions";
  if (rel.startsWith("src/app/") || rel.startsWith("src/components/")) return "presentation";
  if (rel.startsWith("src/topics/fractions/ui/") || rel === "src/topics/fractions/module.tsx") return "presentation"; // module.tsx: the composition root
  if (rel.startsWith("src/topics/fractions/")) return "fractions-content";
  if (rel.startsWith("src/topics/") && rel.endsWith(".tsx")) return "presentation"; // kit pictures and inputs, topic providers
  if (rel.startsWith("src/topics/")) return "topics-contract";
  if (rel.startsWith("src/lib/")) return "lib";
  return "other";
}

function sourceFiles(dir: string): string[] {
  const abs = join(ROOT, dir);
  if (!existsSync(abs)) return [];
  return readdirSync(abs).flatMap((name) => {
    const p = join(abs, name);
    if (statSync(p).isDirectory()) return sourceFiles(relative(ROOT, p));
    return /\.tsx?$/.test(name) && !/\.(test|d)\.tsx?$/.test(name) ? [relative(ROOT, p).split("\\").join("/")] : [];
  });
}

const isUi = (d: Dependency) => (d.packageName !== null && UI_PACKAGES.has(d.packageName)) || (d.resolved !== null && layerOf(d.resolved) === "presentation");

/** Every way a file breaks the rules of its layer, as readable strings. */
function violations(a: Analysis, files: string[]): string[] {
  const out: string[] = [];
  const own = new Set(files);
  for (const d of a.dependencies.filter((x) => own.has(x.file))) {
    const layer = layerOf(join(ROOT, d.file));
    const where = `${d.file}:${d.line} ${d.via} "${d.specifier}"`;
    if (SELF_ONLY.includes(layer)) {
      const target = d.resolved && !d.resolved.includes("/node_modules/") ? layerOf(d.resolved) : null;
      if (target !== layer) out.push(`${where}: ${layer} may only depend on ${layer}`);
    } else if (NO_UI.includes(layer) && isUi(d)) {
      out.push(`${where}: ${layer} may not depend on UI`);
    }
  }
  for (const p of a.problems.filter((x: Problem) => own.has(x.file) && PURE.includes(layerOf(join(ROOT, x.file))))) {
    out.push(`${p.file}:${p.line} ${p.kind}: ${p.detail}`);
  }
  return out;
}

const PROTECTED = {
  engine: sourceFiles("src/engine"),
  maths: sourceFiles("src/maths"),
  lessons: sourceFiles("src/lessons"),
  curriculum: sourceFiles("src/curriculum"),
  questions: sourceFiles("src/questions"),
  fractions: sourceFiles("src/topics/fractions").filter((f) => layerOf(join(ROOT, f)) === "fractions-content"),
};
const CONTRACT = sourceFiles("src/topics").filter((f) => layerOf(join(ROOT, f)) === "topics-contract");
const BAD = sourceFiles("src/architecture/fixtures/bad");
const GOOD = sourceFiles("src/architecture/fixtures/good");

let project: Analysis;
let fixtures: Analysis;

describe("learning architecture (ARCH-001)", () => {
  beforeAll(() => {
    project = analyse([...Object.values(PROTECTED).flat(), ...CONTRACT]);
    fixtures = analyse([...BAD, ...GOOD]);
  }, 120_000);

  it("A1: keeps the engine pure, importing only other engine files", () => {
    expect(PROTECTED.engine.length).toBeGreaterThan(5);
    expect(violations(project, PROTECTED.engine)).toEqual([]);
  });

  it("A2: keeps mathematical logic self-contained", () => {
    expect(PROTECTED.maths.length).toBeGreaterThan(0);
    expect(violations(project, PROTECTED.maths)).toEqual([]);
  });

  it("A3: keeps Fractions content, marking and diagnosis free of UI code", () => {
    expect(PROTECTED.fractions.length).toBeGreaterThan(8);
    expect(violations(project, PROTECTED.fractions)).toEqual([]);
  });

  it("A4: keeps the lesson schema free of UI code", () => {
    expect(violations(project, PROTECTED.lessons)).toEqual([]);
  });

  it("A5: keeps curriculum data free of UI code", () => {
    expect(violations(project, PROTECTED.curriculum)).toEqual([]);
  });

  it("A6: lets only the known content-contract files import UI types", () => {
    const importers = [...new Set(project.dependencies.filter((d) => CONTRACT.includes(d.file) && isUi(d)).map((d) => d.file))];
    expect(importers.sort()).toEqual([...UI_TYPE_ALLOWLIST, ...DISCOVERED_COUPLINGS].sort());
  });

  it("A7: keeps the question schema free of UI code and browser access", () => {
    expect(violations(project, PROTECTED.questions)).toEqual([]);
  });

  it("guard: rejects every bad fixture, each for the expected reason", () => {
    const expected: Record<string, RegExp> = {
      "side-effect-ui.ts": /import "@\/components\/ui\/Button": engine may only depend on engine/,
      "dynamic-react.ts": /dynamic-import "react"/,
      "require-react.ts": /require "react"/,
      "re-export-ui.ts": /export "@\/components\/ui\/Button"/,
      "non-literal-import.ts": /non-literal/,
      "relative-traversal-ui.ts": /"\.\.\/\.\.\/\.\.\/components\/ui\/Button"/,
      "unresolved.ts": /unresolved: cannot resolve "\.\/does-not-exist"/,
      "reviewer-probe.ts": /prohibited-global: window\.localStorage/,
      "global-this.ts": /prohibited-global: globalThis\["sessionStorage"\]/,
      "global-computed.ts": /globalThis\[…\] with a computed name/,
      "shadowed-plus-global.ts": /:7 prohibited-global: document$/,
      "shorthand-global.ts": /prohibited-global: navigator/,
      "ui-component.tsx": /import "react"/,
      "browser-in-tsx.tsx": /prohibited-global: window/,
      "node-fetch.ts": /prohibited-global: fetch/,
    };
    expect(BAD.map((f) => f.split("/").pop()).sort()).toEqual(Object.keys(expected).sort());
    for (const f of BAD) {
      const found = violations(fixtures, [f]);
      const name = f.split("/").pop()!;
      expect(found.some((v) => expected[name].test(v)), `${name}: ${JSON.stringify(found)}`).toBe(true);
    }
    // The reviewer's probe fails for all three of its faults.
    const probe = violations(fixtures, BAD.filter((f) => f.endsWith("reviewer-probe.ts")));
    expect(probe.some((v) => /import "@\/components/.test(v))).toBe(true);
    expect(probe.some((v) => /dynamic-import "react"/.test(v))).toBe(true);
    // A shadowed local `document` (line 3–4) is not reported; only the real global use (line 7) is.
    expect(violations(fixtures, BAD.filter((f) => f.endsWith("shadowed-plus-global.ts"))).filter((v) => /prohibited-global/.test(v))).toHaveLength(1);
  });

  it("guard: accepts good fixtures: comments, strings, property names, local names and pure .tsx", () => {
    expect(GOOD.length).toBeGreaterThanOrEqual(5);
    expect(violations(fixtures, GOOD)).toEqual([]);
  });

  it("guard: finds Node-typed fetch even without the DOM library", () => {
    const nodeOnly = analyse(BAD.filter((f) => f.endsWith("node-fetch.ts")), projectOptions({ lib: ["lib.esnext.d.ts"], types: ["node"] }));
    expect(nodeOnly.problems.map((p) => p.detail)).toContain("fetch");
  }, 60_000);
});
