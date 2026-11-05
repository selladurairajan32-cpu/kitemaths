import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * UX-002, UX-003, UX-004: the design tokens are defined, readable and the only way forward.
 * Specs: docs/product/design/. Tokens: src/app/globals.css (@theme static).
 */

const ROOT = process.cwd();
const css = readFileSync(join(ROOT, "src/app/globals.css"), "utf8");
const theme = css.slice(css.indexOf("@theme static {"), css.indexOf("\n}", css.indexOf("@theme static {")));
const tokens = new Map([...theme.matchAll(/--([a-z0-9-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
const hex = (name: string) => {
  const v = tokens.get(name);
  if (!v || !/^#[0-9a-f]{6}$/i.test(v)) throw new Error(`--${name} is not a 6-digit hex colour (${v})`);
  return v;
};

/** WCAG 2 contrast ratio between two hex colours. */
function contrast(a: string, b: string): number {
  const lum = (h: string) => {
    const [r, g, bl] = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

function files(dir: string, keep: (name: string) => boolean): string[] {
  const abs = join(ROOT, dir);
  if (!existsSync(abs)) return [];
  return readdirSync(abs).flatMap((name) => {
    const p = join(abs, name);
    if (statSync(p).isDirectory()) return files(relative(ROOT, p), keep);
    return keep(name) ? [relative(ROOT, p).split("\\").join("/")] : [];
  });
}

const TYPE_SCALE = ["display-1", "display-2", "heading-1", "heading-2", "prompt", "prompt-sm", "title", "body-lg", "body", "label"];
const CONTENT_TYPES = ["teach", "rule", "example", "hint", "tip", "notice", "misconception", "success", "retry", "challenge"];
const DESIGN_DOCS = ["UX-002-design-tokens.md", "UX-003-typography.md", "UX-004-content-differentiation.md"];

interface Pairing { fg: string; bg: string; use: string; px: number; weight: number; kind: "text" | "graphic"; minimum: number; target: number | null; shown: number }
/** The supported pairings table in UX-004 §2.3. */
function pairings(): Pairing[] {
  const doc = readFileSync(join(ROOT, "docs/product/design/UX-004-content-differentiation.md"), "utf8");
  const section = doc.slice(doc.indexOf("### 2.3 Supported colour pairings"), doc.indexOf("## 3. "));
  return [...section.matchAll(/^\| `--([a-z0-9-]+)` \| `--([a-z0-9-]+)` \| ([^|]+) \| ([\d.]+) \| (\d+) \| (text|graphic) \| ([\d.]+):1 \| (?:([\d.]+):1|—) \| ([\d.]+):1 \|$/gm)].map((m) => ({
    fg: m[1], bg: m[2], use: m[3].trim(), px: Number(m[4]), weight: Number(m[5]), kind: m[6] as Pairing["kind"],
    minimum: Number(m[7]), target: m[8] ? Number(m[8]) : null, shown: Number(m[9]),
  }));
}

/** Baselines measured on 4 Nov 2026 (R0 step 2). These may only go down as screens move to tokens in R1. */
const ARBITRARY_TEXT_SIZE_BASELINE = 224;
const TSX_FILES_WITH_HEX_BASELINE = 15;
/**
 * Added 5 Nov (independent review): counting files alone let more hex values be added inside files that
 * already had one. Limit that remains: a count can't stop one value being swapped for another.
 */
const HEX_OCCURRENCE_BASELINE = 101;

describe("design tokens (UX-002, UX-003, UX-004)", () => {
  it("defines every token the design specs name", () => {
    const named = new Set<string>();
    for (const doc of DESIGN_DOCS) {
      const text = readFileSync(join(ROOT, "docs/product/design", doc), "utf8");
      for (const m of text.matchAll(/`--([a-z0-9-]+)`/g)) named.add(m[1]);
    }
    expect(named.size).toBeGreaterThan(40);
    expect([...named].filter((t) => !tokens.has(t))).toEqual([]);
  });

  it("gives every type role a size and line height, none below 15px", () => {
    for (const t of TYPE_SCALE) {
      const size = tokens.get(`text-${t}`);
      expect(size, t).toMatch(/^[\d.]+rem$/);
      expect(parseFloat(size!) * 16, t).toBeGreaterThanOrEqual(15);
      expect(tokens.get(`text-${t}--line-height`), `${t} line height`).toBeDefined();
    }
  });

  it("meets the contrast minimum for every supported pairing at its real size and weight, without rounding", () => {
    const rows = pairings();
    expect(rows.length).toBeGreaterThan(40);
    const problems: string[] = [];
    for (const r of rows) {
      const ratio = contrast(hex(r.fg), hex(r.bg));
      const large = r.px >= 24 || (r.px >= 18.67 && r.weight >= 700);
      const derived = r.kind === "graphic" || large ? 3 : 4.5;
      if (r.minimum !== derived) problems.push(`${r.use}: minimum says ${r.minimum}:1 but ${r.px}px / ${r.weight} ${r.kind} needs ${derived}:1`);
      if (ratio < r.minimum) problems.push(`${r.use}: ${ratio} < ${r.minimum}`);
      if (r.target !== null && ratio < r.target) problems.push(`${r.use}: ${ratio} misses the ${r.target}:1 target`);
      // The ratio shown in the spec is cut to two decimals, never rounded up (a 4.496 must not read 4.50).
      if (r.shown !== Math.floor(ratio * 100) / 100) problems.push(`${r.use}: spec shows ${r.shown}, computed ${ratio}`);
    }
    expect(problems).toEqual([]);
  });

  it("keeps content ink on every content-type background at the 7:1 product target, with labels on dark backgrounds", () => {
    const rows = pairings();
    for (const t of CONTENT_TYPES) {
      hex(`color-${t}-edge`);
      const ink = rows.find((r) => r.fg === `color-${t}-ink` && r.bg === `color-${t}-soft`);
      expect(ink?.target, `${t} ink row`).toBe(7);
      // Fraction digits on every tinted panel: numerator and the darker denominator, at the inline size.
      for (const fg of ["color-num-strong", "color-den-strong"]) expect(rows.some((r) => r.fg === fg && r.bg === `color-${t}-soft`), `${t} ${fg}`).toBe(true);
    }
    // White text never sits on a light edge colour; it uses the -strong label backgrounds (DEF-022).
    expect(rows.filter((r) => r.fg === "color-on-strong" && r.kind === "text").map((r) => r.bg).sort()).toEqual(["color-challenge-strong", "color-example-strong"]);
    expect(rows.some((r) => r.kind === "text" && r.bg.endsWith("-edge"))).toBe(false);
  });

  it("checks fraction digits at the sizes FractionNotation actually renders", () => {
    const src = readFileSync(join(ROOT, "src/components/math/FractionNotation.tsx"), "utf8");
    const body = parseFloat(tokens.get("text-body")!) * 16;
    const inlineEm = Number(/inline:\s*\{\s*text:\s*"text-\[([\d.]+)em\]/.exec(src)![1]);
    const TAILWIND_PX: Record<string, number> = { "text-base": 16, "text-2xl": 24, "text-4xl": 36, "text-6xl": 60 };
    const sizes: Record<string, number> = { inline: Math.round(inlineEm * body * 100) / 100 };
    for (const s of ["sm", "md", "lg", "xl"]) sizes[s] = TAILWIND_PX[new RegExp(`${s}:\\s*\\{\\s*text:\\s*"(text-[a-z0-9]+)`).exec(src)![1]];
    expect(sizes).toEqual({ inline: 16.56, sm: 16, md: 24, lg: 36, xl: 60 });
    const digitRows = pairings().filter((r) => /fraction digits \((inline|sm|md|lg|xl)\)/.test(r.use));
    expect(digitRows.length).toBeGreaterThan(20);
    for (const r of digitRows) expect(r.px, r.use).toBe(sizes[/\((\w+)\)/.exec(r.use)![1]]);
  });

  it("keeps state colours readable and the focus ring visible", () => {
    expect(contrast(hex("color-correct"), hex("color-correct-soft"))).toBeGreaterThanOrEqual(4.5);
    expect(contrast(hex("color-incorrect"), hex("color-incorrect-soft"))).toBeGreaterThanOrEqual(4.5);
    expect(contrast(hex("color-selected"), hex("color-selected-soft"))).toBeGreaterThanOrEqual(4.5);
    // Focus ring: non-text contrast (WCAG 1.4.11) against the page and cards.
    expect(contrast(hex("color-focus"), hex("color-paper"))).toBeGreaterThanOrEqual(3);
    expect(contrast(hex("color-focus"), hex("color-surface"))).toBeGreaterThanOrEqual(3);
  });

  it("adds no violet token (D-013: the undefined violet classes are fixed in R1, DEF-009)", () => {
    expect([...tokens.keys()].filter((t) => t.includes("violet"))).toEqual([]);
  });

  it("does not let one-off text sizes or hex colours grow (ratchet)", () => {
    const tsx = files("src", (n) => n.endsWith(".tsx")).filter((f) => !f.startsWith("src/architecture/fixtures/"));
    const sources = tsx.map((f) => readFileSync(join(ROOT, f), "utf8"));
    const arbitrarySizes = sources.reduce((n, s) => n + (s.match(/\btext-\[[\d.]+(rem|px|em)\]/g)?.length ?? 0), 0);
    const withHex = sources.filter((s) => /#[0-9a-fA-F]{3,8}\b/.test(s)).length;
    const hexValues = sources.reduce((n, s) => n + (s.match(/#[0-9a-fA-F]{3,8}\b/g)?.length ?? 0), 0);
    expect(arbitrarySizes).toBeLessThanOrEqual(ARBITRARY_TEXT_SIZE_BASELINE);
    expect(withHex).toBeLessThanOrEqual(TSX_FILES_WITH_HEX_BASELINE);
    expect(hexValues).toBeLessThanOrEqual(HEX_OCCURRENCE_BASELINE);
  });

  it("keeps the design specimen out of production and search engines", () => {
    const page = readFileSync(join(ROOT, "src/app/design-specimen/page.tsx"), "utf8");
    expect(page).toMatch(/process\.env\.VERCEL_ENV === "production"\) notFound\(\)/);
    expect(page).toMatch(/robots: \{ index: false, follow: false \}/);
  });
});
