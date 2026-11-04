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

/** Baselines measured on 4 Nov 2026 (R0 step 2). These may only go down as screens move to tokens in R1. */
const ARBITRARY_TEXT_SIZE_BASELINE = 224;
const TSX_FILES_WITH_HEX_BASELINE = 15;

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

  it("keeps every content type readable: ink on its background at least 7:1, fraction digits at least 4:1", () => {
    for (const t of CONTENT_TYPES) {
      const soft = hex(`color-${t}-soft`);
      hex(`color-${t}-edge`);
      expect(contrast(hex(`color-${t}-ink`), soft), `${t} ink`).toBeGreaterThanOrEqual(7);
      expect(contrast(hex("color-num-strong"), soft), `${t} numerator`).toBeGreaterThanOrEqual(4);
      expect(contrast(hex("color-den"), soft), `${t} denominator`).toBeGreaterThanOrEqual(4);
    }
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
    const tsx = files("src", (n) => n.endsWith(".tsx"));
    const sources = tsx.map((f) => readFileSync(join(ROOT, f), "utf8"));
    const arbitrarySizes = sources.reduce((n, s) => n + (s.match(/\btext-\[[\d.]+(rem|px|em)\]/g)?.length ?? 0), 0);
    const withHex = sources.filter((s) => /#[0-9a-fA-F]{3,8}\b/.test(s)).length;
    expect(arbitrarySizes).toBeLessThanOrEqual(ARBITRARY_TEXT_SIZE_BASELINE);
    expect(withHex).toBeLessThanOrEqual(TSX_FILES_WITH_HEX_BASELINE);
  });

  it("keeps the design specimen out of production and search engines", () => {
    const page = readFileSync(join(ROOT, "src/app/design-specimen/page.tsx"), "utf8");
    expect(page).toMatch(/process\.env\.VERCEL_ENV === "production"\) notFound\(\)/);
    expect(page).toMatch(/robots: \{ index: false, follow: false \}/);
  });
});
