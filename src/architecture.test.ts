import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * ARCH-001: keeps the learning architecture modular. The core (engine, maths), lesson schema,
 * Fractions content and curriculum data stay free of UI code; only an explicit allowlist of
 * content-contract files may import UI types today (to be removed in R1, see
 * docs/product/architecture/ARCH-001-architecture.md §4).
 */

const ROOT = process.cwd();
const UI_IMPORT = /from\s+["'](react|react-dom|next(\/[^"']*)?|motion(\/[^"']*)?|@\/components\/[^"']*|@\/app\/[^"']*)["']/;

function files(dir: string, keep: (name: string) => boolean): string[] {
  const abs = join(ROOT, dir);
  if (!existsSync(abs)) return [];
  return readdirSync(abs).flatMap((name) => {
    const p = join(abs, name);
    if (statSync(p).isDirectory()) return files(relative(ROOT, p), keep);
    return keep(name) ? [relative(ROOT, p).split("\\").join("/")] : [];
  });
}
const source = (name: string) => name.endsWith(".ts") && !name.endsWith(".test.ts") && !name.endsWith(".d.ts");
const imports = (file: string) => [...readFileSync(join(ROOT, file), "utf8").matchAll(/from\s+["']([^"']+)["']/g)].map((m) => m[1]);
const uiImporters = (list: string[]) => list.filter((f) => UI_IMPORT.test(readFileSync(join(ROOT, f), "utf8")));

/** Content-contract files that import UI types today (coupling K-1, K-2). Shrink this list; never grow it. */
const UI_TYPE_ALLOWLIST = ["src/topics/kit/define.ts", "src/topics/kit/types.ts", "src/topics/types.ts", "src/topics/worlds.ts"];

describe("learning architecture (ARCH-001)", () => {
  it("A1: keeps the engine pure, importing only other engine files", () => {
    const engine = files("src/engine", source);
    expect(engine.length).toBeGreaterThan(5);
    for (const f of engine) for (const i of imports(f)) expect(i.startsWith("./"), `${f} imports ${i}`).toBe(true);
  });

  it("A2: keeps mathematical logic self-contained", () => {
    const maths = files("src/maths", source);
    expect(maths.length).toBeGreaterThan(0);
    for (const f of maths) for (const i of imports(f)) expect(i.startsWith("./"), `${f} imports ${i}`).toBe(true);
  });

  it("A3: keeps Fractions content, marking and diagnosis free of UI code", () => {
    const content = files("src/topics/fractions", (n) => source(n)).filter((f) => !f.includes("/ui/"));
    expect(content.length).toBeGreaterThan(8);
    expect(uiImporters(content)).toEqual([]);
  });

  it("A4: keeps the lesson schema free of UI code", () => {
    expect(uiImporters(files("src/lessons", source))).toEqual([]);
  });

  it("A5: keeps curriculum data free of UI code", () => {
    expect(uiImporters(files("src/curriculum", source))).toEqual([]);
  });

  it("A6: lets only the known content-contract files import UI types", () => {
    const topicsTs = files("src/topics", source);
    expect(uiImporters(topicsTs).sort()).toEqual([...UI_TYPE_ALLOWLIST].sort());
  });
});
