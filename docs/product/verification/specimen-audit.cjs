// Usage: node docs/product/verification/specimen-audit.cjs <outDir> [baseUrl]
//
// Audits the design specimen (/design-specimen) in a real browser (Chromium via Playwright):
//  1. Contrast from the colours the browser actually applied. For every element with its own visible text, and every
//     icon inside a badge or label, it reads the computed colour, font size and weight, finds the effective background
//     (the nearest ancestor with an opaque background colour), and checks WCAG: 4.5:1 for normal text, 3:1 for large text
//     (>= 24px, or >= 18.67px at weight >= 700) and for icons. Ratios are compared unrounded.
//  2. Layout at 1280px and 390px, at 100% and 200% root font size, and at 320px: sideways overflow of the specimen's own
//     content (<main>), kept separate from the shared app header (a known defect, DEF-018).
// Writes <outDir>/specimen-audit.json and screenshots, and prints a summary. Exit code 1 if anything fails.
const { chromium } = require("playwright");
const fs = require("fs");

const OUT = process.argv[2] || "specimen-audit";
const BASE = process.argv[3] || "http://localhost:3123";
fs.mkdirSync(OUT, { recursive: true });

const CONDITIONS = [
  { name: "desktop-100", width: 1280, height: 900, scale: "100%" },
  { name: "phone-100", width: 390, height: 844, scale: "100%" },
  { name: "desktop-200", width: 1280, height: 900, scale: "200%" },
  { name: "phone-200", width: 390, height: 844, scale: "200%" },
  { name: "reflow-320", width: 320, height: 640, scale: "100%" },
];

function audit() {
  const parse = (c) => {
    const m = /rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/.exec(c);
    return m ? { r: +m[1], g: +m[2], b: +m[3], a: m[4] === undefined ? 1 : +m[4] } : null;
  };
  const lum = ({ r, g, b }) => {
    const f = (v) => ((v /= 255) <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const ratio = (a, b) => {
    const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
  };
  const background = (el) => {
    for (let e = el; e; e = e.parentElement) {
      const c = parse(getComputedStyle(e).backgroundColor);
      if (c && c.a >= 0.99) return c;
      if (c && c.a > 0) return null; // translucent: can't be computed reliably, reported as unknown
    }
    return { r: 255, g: 255, b: 255, a: 1 };
  };
  const main = document.querySelector("main");
  const results = [];
  const describe = (el) => `${el.tagName.toLowerCase()} "${(el.textContent || "").trim().slice(0, 40)}"`;
  for (const el of main.querySelectorAll("*")) {
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || cs.display === "none" || el.closest(".sr-only") || el.classList.contains("sr-only")) continue;
    const ownText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    const isIcon = el.tagName.toLowerCase() === "svg";
    if (!ownText && !isIcon) continue;
    const fg = parse(isIcon ? cs.color : cs.color);
    const bg = background(el);
    if (!fg || !bg) {
      results.push({ el: describe(el), kind: isIcon ? "graphic" : "text", unknown: true });
      continue;
    }
    const px = parseFloat(cs.fontSize);
    const weight = Number(cs.fontWeight);
    const large = px >= 24 || (px >= 18.67 && weight >= 700);
    const kind = isIcon ? "graphic" : "text";
    const min = kind === "graphic" || large ? 3 : 4.5;
    const r = ratio(fg, bg);
    results.push({ el: describe(el), kind, px, weight, min, ratio: r, pass: r >= min, fg: cs.color, bg: `rgb(${bg.r}, ${bg.g}, ${bg.b})` });
  }
  return results;
}

(async () => {
  const browser = await chromium.launch();
  const report = { base: BASE, at: new Date().toISOString(), contrast: null, layout: [] };
  let failed = false;
  for (const c of CONDITIONS) {
    const page = await browser.newPage({ viewport: { width: c.width, height: c.height }, deviceScaleFactor: 1, reducedMotion: "reduce" });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    const res = await page.goto(`${BASE}/design-specimen`, { waitUntil: "networkidle" });
    await page.addStyleTag({ content: `html { font-size: ${c.scale} !important; }` });
    await page.waitForTimeout(600);
    const layout = await page.evaluate(() => {
      const vw = window.innerWidth;
      const main = document.querySelector("main");
      const own = [...main.querySelectorAll("*")].filter((e) => e.getBoundingClientRect().width > 0 && e.getBoundingClientRect().right > vw + 1);
      return {
        pageOverflow: document.documentElement.scrollWidth - vw,
        specimenOverflowing: own.length,
        examples: own.slice(0, 5).map((e) => `${e.tagName.toLowerCase()} "${(e.textContent || "").trim().slice(0, 30)}"`),
        robots: document.querySelector('meta[name="robots"]')?.getAttribute("content") ?? null,
      };
    });
    report.layout.push({ condition: c.name, status: res.status(), consoleErrors: errors, ...layout });
    if (res.status() !== 200 || layout.specimenOverflowing > 0 || errors.length) failed = true;
    if (c.name === "desktop-100") {
      report.contrast = await page.evaluate(audit);
    }
    await page.addStyleTag({ content: ".sticky, header { position: static !important; } .fixed { display: none !important; }" });
    await page.screenshot({ path: `${OUT}/specimen-${c.name}.png`, fullPage: true });
    await page.close();
  }
  await browser.close();
  const checked = report.contrast.filter((r) => !r.unknown);
  const fails = checked.filter((r) => !r.pass);
  const unknown = report.contrast.filter((r) => r.unknown);
  if (fails.length) failed = true;
  fs.writeFileSync(`${OUT}/specimen-audit.json`, JSON.stringify(report, null, 1));
  console.log(`contrast: ${checked.length} elements checked, ${fails.length} below minimum, ${unknown.length} on translucent backgrounds (not computed)`);
  for (const f of fails) console.log("  FAIL", f.el, f.ratio.toFixed(3), "<", f.min, f.fg, "on", f.bg);
  const lowest = [...checked].sort((a, b) => a.ratio - b.ratio).slice(0, 3);
  for (const l of lowest) console.log("  lowest", l.el, l.ratio.toFixed(3), `(min ${l.min}, ${l.px}px/${l.weight})`);
  for (const l of report.layout) console.log(`layout ${l.condition}: status ${l.status}, specimen content overflowing ${l.specimenOverflowing}, page overflow ${l.pageOverflow}px (includes the shared header, DEF-018), console errors ${l.consoleErrors.length}`);
  process.exit(failed ? 1 : 0);
})();
