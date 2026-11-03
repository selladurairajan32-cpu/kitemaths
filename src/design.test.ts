import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { KITE_PATTERNS } from "@/components/paper/PaperKite";
import { isPaperIconName } from "@/components/paper/PaperIcon";
import { PIC_NAMES } from "@/components/paper/Pic";
import { createInitialState } from "@/engine/progress";
import { badgesFor } from "@/engine/rewards";
import { TOPICS } from "@/topics";
import { WORLDS } from "@/topics/worlds";

/** Design system rules that can be checked without a browser (docs/DESIGN.md). */

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? sourceFiles(join(dir, e.name)) : /\.(tsx?|css)$/.test(e.name) ? [join(dir, e.name)] : [],
  );
}

describe("design system", () => {
  it("uses no emoji anywhere in the app: pictures are drawn paper icons", () => {
    const offenders = sourceFiles("src").flatMap((f) =>
      readFileSync(f, "utf8")
        .split("\n")
        .flatMap((line, i) => (/\p{Extended_Pictographic}/u.test(line) ? [`${f}:${i + 1}`] : [])),
    );
    expect(offenders).toEqual([]);
  });

  it("names only paper icons that exist", () => {
    for (const w of WORLDS) {
      expect(isPaperIconName(w.icon), w.id).toBe(true);
      w.islands.forEach((i) => expect(isPaperIconName(i.icon), i.title).toBe(true));
    }
    for (const t of TOPICS) {
      expect(isPaperIconName(t.look.icon), t.id).toBe(true);
      t.lessons.forEach((l) => expect(isPaperIconName(t.lessonLook(l.id).icon), l.id).toBe(true));
    }
  });

  it("gives every badge a kite pattern the shelf can draw", () => {
    const badges = badgesFor(createInitialState(), TOPICS.flatMap((t) => t.skills), 8, 0);
    badges.forEach((b) => expect(KITE_PATTERNS, b.id).toContain(b.pattern));
  });

  it("has a 3D picture file for every picture name, and keeps its licence alongside", () => {
    PIC_NAMES.forEach((n) => expect(existsSync(join("public/3d", `${n}.png`)), n).toBe(true));
    expect(existsSync("public/3d/LICENSE-fluentui-emoji.txt")).toBe(true);
  });

  it("keeps violet and gradients out of the stylesheet", () => {
    const css = readFileSync("src/app/globals.css", "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
    expect(css).not.toMatch(/gradient\(/);
    expect(css).not.toMatch(/violet|indigo|backdrop-filter/i);
  });
});
