import { existsSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { analyse, projectOptions, transitiveViolations, type Analysis, type Dependency, type Problem } from "./architecture/analyse";

/**
 * ARCH-001: keeps the learning architecture modular (docs/product/architecture/ARCH-001-architecture.md §1–§4).
 *
 * Every rule works on parsed code (src/architecture/analyse.ts): real module resolution, all import
 * forms, scope-aware detection of browser and network globals (including the global object escaping,
 * as in `const { localStorage } = globalThis`), a per-layer dependency matrix, and a transitive check that
 * follows runtime imports so an intermediate module can't hide UI or browser access. `.ts` and `.tsx`
 * files are both checked; a `.tsx` file fails only if it has a forbidden dependency or behaviour.
 * Fixtures in src/architecture/fixtures prove the guard rejects bad code and accepts good code.
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
  // K-7 (place-value digit maths in a UI file) was removed by ARCH-003 on 5 Nov: the maths is in src/maths/place-value.ts.
];

type Layer = "engine" | "maths" | "lessons" | "curriculum" | "questions" | "fractions-content" | "topics-contract" | "presentation" | "lib" | "other";
type Protected = "engine" | "maths" | "lessons" | "curriculum" | "questions" | "fractions-content";

/**
 * The dependency matrix (ARCH-001 §2). Per protected layer, per import edge:
 *  - `runtime`: the layers it may import, with a runtime effect. Its own layer is always in the list, so a
 *    same-layer import is allowed whether or not it is type-only.
 *  - `typeOnly`: layers it may import **in addition**, and only as types (`import type`, or only inline `type`
 *    specifiers). A type-only import may therefore go to `runtime` ∪ `typeOnly`.
 * Packages are not layers: UI packages are never allowed, and engine and maths take no packages at all.
 */
const MATRIX: Record<Protected, { runtime: Layer[]; typeOnly: Layer[]; packages: boolean }> = {
  engine: { runtime: ["engine"], typeOnly: [], packages: false },
  maths: { runtime: ["maths"], typeOnly: [], packages: false },
  lessons: { runtime: ["lessons"], typeOnly: ["engine"], packages: true },
  curriculum: { runtime: ["curriculum"], typeOnly: ["engine", "lessons"], packages: true },
  questions: { runtime: ["questions", "maths"], typeOnly: ["engine", "lessons", "fractions-content"], packages: true },
  "fractions-content": { runtime: ["fractions-content", "engine", "maths"], typeOnly: ["lessons"], packages: true },
};
const isProtected = (l: Layer): l is Protected => l in MATRIX;

function layerOf(file: string): Layer {
  const rel = relative(ROOT, file).split("\\").join("/");
  if (rel.startsWith("src/architecture/fixtures/")) {
    // Fixtures are checked as engine code, unless a folder named as-<layer> says otherwise.
    const as = /\/as-([a-z-]+)\//.exec(rel)?.[1];
    return (as as Layer | undefined) ?? "engine";
  }
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

const isUiPackage = (name: string) => UI_PACKAGES.has(name);
const isUi = (d: Dependency) => (d.packageName !== null && isUiPackage(d.packageName)) || (d.resolved !== null && layerOf(d.resolved) === "presentation");

/** Direct rules: every import edge against the matrix, plus prohibited globals and unchecked imports in the file itself. */
function directViolations(a: Analysis, files: string[]): string[] {
  const out: string[] = [];
  const own = new Set(files);
  for (const d of a.dependencies.filter((x) => own.has(x.file))) {
    const layer = layerOf(join(ROOT, d.file));
    if (!isProtected(layer)) continue;
    const rule = MATRIX[layer];
    const where = `${d.file}:${d.line} ${d.via} "${d.specifier}"`;
    const project = d.resolved && !d.resolved.includes("/node_modules/");
    if (!project) {
      if (d.packageName !== null && isUiPackage(d.packageName)) out.push(`${where}: ${layer} may not depend on UI`);
      else if (!rule.packages) out.push(`${where}: ${layer} may only depend on ${layer}`);
      continue;
    }
    const target = layerOf(d.resolved!);
    const allowed = d.typeOnly ? [...rule.runtime, ...rule.typeOnly] : rule.runtime;
    if (!allowed.includes(target)) {
      const only = rule.runtime.length === 1 && !rule.typeOnly.length;
      out.push(`${where}: ${only ? `${layer} may only depend on ${layer}` : `${layer} may not depend on ${target}${d.typeOnly ? "" : " at runtime"} (allowed: ${allowed.join(", ")})`}`);
    }
  }
  for (const p of a.problems.filter((x: Problem) => own.has(x.file) && isProtected(layerOf(join(ROOT, x.file))))) {
    out.push(`${p.file}:${p.line} ${p.kind}: ${p.detail}`);
  }
  return out;
}

/** Transitive rule: nothing reachable through runtime imports may use UI or a prohibited global (DEF-031). */
const closureViolations = (a: Analysis, files: string[]) => transitiveViolations(a, files, isUiPackage);
/** Everything wrong with these files, directly or through what they import. */
const violations = (a: Analysis, files: string[]) => [...directViolations(a, files), ...closureViolations(a, files)];

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
const name = (f: string) => f.split("/").pop()!;

/** One analysis of every non-test source file, so the transitive check can follow any import. */
let project: Analysis;

describe("learning architecture (ARCH-001)", () => {
  beforeAll(() => {
    project = analyse(sourceFiles("src"));
  }, 240_000);

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
    expect(PROTECTED.questions.length).toBeGreaterThan(2);
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
      // Review 2 (DEF-030, DEF-031):
      "destructure-global.ts": /global-object-escape: globalThis escapes.*\(captures localStorage\)/,
      "alias-global.ts": /global-object-escape: globalThis escapes/,
      "reflect-global.ts": /global-object-escape: globalThis escapes/,
      "shadow-param-plus-destructure.ts": /:7 global-object-escape: globalThis escapes.*\(captures sessionStorage\)/,
      "indirect-via-helper.ts": /indirect-via-helper\.ts → src\/architecture\/fixtures\/support\/uses-window\.ts: prohibited-global at line 2: window/,
      "import-lib-store.ts": /import "@\/lib\/store": questions may not depend on lib at runtime/,
      "runtime-from-fractions.ts": /questions may not depend on fractions-content at runtime/,
    };
    expect(BAD.map(name).sort()).toEqual(Object.keys(expected).sort());
    for (const f of BAD) {
      const found = violations(project, [f]);
      expect(found.some((v) => expected[name(f)].test(v)), `${name(f)}: ${JSON.stringify(found)}`).toBe(true);
    }
    // The reviewer's first probe fails for all three of its faults.
    const probe = violations(project, BAD.filter((f) => f.endsWith("reviewer-probe.ts")));
    expect(probe.some((v) => /import "@\/components/.test(v))).toBe(true);
    expect(probe.some((v) => /dynamic-import "react"/.test(v))).toBe(true);
    // A shadowed local `document` (line 3–4) is not reported; only the real global use (line 7) is.
    expect(violations(project, BAD.filter((f) => f.endsWith("shadowed-plus-global.ts"))).filter((v) => /prohibited-global/.test(v))).toHaveLength(1);
    // The shadowing parameter (lines 2–3) is not reported; only the real destructure (line 7) is.
    expect(violations(project, BAD.filter((f) => f.endsWith("shadow-param-plus-destructure.ts"))).filter((v) => /global-object-escape/.test(v))).toHaveLength(1);
  });

  it("guard: the transitive check alone detects a violation hidden behind an intermediate module", () => {
    const hidden = BAD.filter((f) => f.endsWith("indirect-via-helper.ts"));
    expect(hidden).toHaveLength(1);
    // No direct rule is broken: the import is same-layer and the file itself does nothing forbidden...
    expect(directViolations(project, hidden)).toEqual([]);
    // ...and the helper is not scanned on its own, so only following the import reveals the problem.
    expect(closureViolations(project, hidden).some((v) => /support\/uses-window\.ts: prohibited-global at line 2: window/.test(v))).toBe(true);
    // The same holds for the reviewer's second probe: lib/store.ts reaches React and window.localStorage.
    const storeProbe = BAD.filter((f) => f.endsWith("import-lib-store.ts"));
    const chain = closureViolations(project, storeProbe);
    expect(chain.some((v) => /import-lib-store\.ts → src\/lib\/store\.ts → react: reaches UI at runtime/.test(v)), JSON.stringify(chain)).toBe(true);
    expect(chain.some((v) => /src\/lib\/store\.ts: prohibited-global.*window/.test(v))).toBe(true);
  });

  it("guard: accepts good fixtures: comments, strings, property names, local names, same-layer and allowed type-only imports, pure .tsx", () => {
    expect(GOOD.length).toBeGreaterThanOrEqual(10);
    expect(GOOD.map(name)).toEqual(expect.arrayContaining(["local-globalthis-param.ts", "destructure-nonglobal.ts", "typeof-globalthis.ts", "type-only-engine.ts", "type-only-same-layer.ts", "type-from-fractions.ts"]));
    expect(violations(project, GOOD)).toEqual([]);
  });

  it("guard: finds Node-typed fetch even without the DOM library", () => {
    const nodeOnly = analyse(BAD.filter((f) => f.endsWith("node-fetch.ts")), projectOptions({ lib: ["lib.esnext.d.ts"], types: ["node"] }));
    expect(nodeOnly.problems.map((p) => p.detail)).toContain("fetch");
  }, 60_000);
});
