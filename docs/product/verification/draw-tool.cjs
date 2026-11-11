// Usage: node docs/product/verification/draw-tool.cjs <outDir> [port]
// D-039 (Y6.GPS.1): the "Draw it yourself" lab in Shapes and angles > Drawing to size, on a running production build.
// At 390 and 1280px it draws both triangles with real pointer drags (ruler, protractor, ruler, join), capturing each
// stage; then draws them by keyboard only; then checks reduced motion. axe-core runs at every stage and console errors
// are recorded. Developer evidence, not independent QA.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const OUT = process.argv[2]; const BASE = 'http://localhost:' + (process.argv[3] || '3123');
fs.mkdirSync(OUT, { recursive: true });
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const LESSON = '/t/shapes-angles/lesson/construct/';
const LAB = 4; // explain, watch me, together, then the drawing lab (1-based)
const TRIANGLES = [[6, 4, 50], [5, 7, 110]];
const U = 32; const O = { x: 200, y: 258 };
const end = (len, deg) => ({ x: O.x + len * Math.cos((deg * Math.PI) / 180), y: O.y - len * Math.sin((deg * Math.PI) / 180) });

async function open(p) {
  await p.goto(BASE + LESSON + '1', { waitUntil: 'networkidle' });
  await p.waitForFunction(() => localStorage.getItem('kite-maths:v2'));
  await p.evaluate((furthest) => {
    const s = JSON.parse(localStorage.getItem('kite-maths:v2'));
    s.topics['shapes-angles'].lessons.construct = { step: furthest, furthestStep: furthest, completed: false };
    localStorage.setItem('kite-maths:v2', JSON.stringify(s));
  }, LAB - 1);
  await p.goto(BASE + LESSON + LAB, { waitUntil: 'networkidle' });
  await p.waitForSelector('svg[aria-label^="Drawing a triangle"]');
}

/** Screen position of a point in the drawing's own coordinates. */
async function screenAt(p, pt) {
  return p.evaluate(({ x, y }) => {
    const svg = document.querySelector('svg[aria-label^="Drawing a triangle"]');
    const m = svg.getScreenCTM();
    return { x: m.a * x + m.e, y: m.d * y + m.f };
  }, pt);
}

async function dragTo(p, pt) {
  const handle = p.getByRole('slider').locator('circle').first();
  const a = await handle.boundingBox();
  const t = await screenAt(p, pt);
  await p.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
  await p.mouse.down();
  for (let i = 1; i <= 10; i++) await p.mouse.move(a.x + a.width / 2 + ((t.x - a.x - a.width / 2) * i) / 10, a.y + a.height / 2 + ((t.y - a.y - a.height / 2) * i) / 10);
  await p.mouse.up();
}

async function axe(p, report, name) {
  await p.addScriptTag({ content: AXE });
  report.axe[name] = await p.evaluate(async () => (await window.axe.run(document.querySelector('main'))).violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.length}`));
}

(async () => {
  const b = await chromium.launch();
  const report = { errors: [], axe: {}, pointer: {}, keyboard: {}, reduced: {}, shots: 0 };
  for (const [vw, w, h] of [['phone', 390, 844], ['desk', 1280, 900]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: vw === 'desk' ? 2 : 1 });
    const p = await ctx.newPage();
    p.on('pageerror', (e) => report.errors.push(`${vw} pageerror ${e.message}`));
    p.on('console', (m) => m.type() === 'error' && report.errors.push(`${vw}: ${m.text()}`));
    await open(p);
    const shot = async (n) => { await p.locator('main').screenshot({ path: path.join(OUT, `${vw}-${n}.png`) }); report.shots++; };
    for (const [i, [base, side, angle]] of TRIANGLES.entries()) {
      const t = `t${i + 1}`;
      await shot(`${t}-0-start`);
      await dragTo(p, { x: O.x + base * U, y: O.y });
      const gotBase = await p.getByRole('slider').getAttribute('aria-valuenow');
      await p.getByRole('button', { name: 'Check', exact: true }).click();
      await shot(`${t}-1-base`); await axe(p, report, `${vw}-${t}-protractor`);
      await dragTo(p, end(140, angle));
      const gotAngle = await p.getByRole('slider').getAttribute('aria-valuenow');
      await p.getByRole('button', { name: 'Check', exact: true }).click();
      await shot(`${t}-2-angle`); await axe(p, report, `${vw}-${t}-ruler2`);
      await dragTo(p, end(side * U, angle));
      const gotSide = await p.getByRole('slider').getAttribute('aria-valuenow');
      await p.getByRole('button', { name: 'Check', exact: true }).click();
      await shot(`${t}-3-side`);
      await p.getByRole('button', { name: 'Join the ends' }).click();
      await shot(`${t}-4-done`); await axe(p, report, `${vw}-${t}-done`);
      report.pointer[`${vw}-${t}`] = { base: gotBase, angle: gotAngle, side: gotSide, done: (await p.getByText(/^Done:/).count()) > 0 };
      if (i === 0) await p.getByRole('button', { name: 'Draw the next triangle' }).click();
    }
    report.pointer[`${vw}-continueEnabled`] = await p.getByRole('button', { name: /^Continue/ }).isEnabled();
    await ctx.close();
  }

  // Keyboard only: arrows (Shift for big steps) and Enter, never the mouse.
  {
    const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
    const p = await ctx.newPage();
    await open(p);
    const moveTo = async (want, stepSize) => {
      const s = p.getByRole('slider');
      await s.focus();
      let now = Number(await s.getAttribute('aria-valuenow'));
      while (Math.abs(want - now) >= stepSize * 10) { await p.keyboard.press(want > now ? 'Shift+ArrowRight' : 'Shift+ArrowLeft'); now = Number(await s.getAttribute('aria-valuenow')); }
      while (now !== want) { await p.keyboard.press(want > now ? 'ArrowRight' : 'ArrowLeft'); now = Number(await s.getAttribute('aria-valuenow')); }
      await p.keyboard.press('Enter');
    };
    for (const [i, [base, side, angle]] of TRIANGLES.entries()) {
      await moveTo(base, 0.5); await moveTo(angle, 1); await moveTo(side, 0.5);
      await p.getByRole('button', { name: 'Join the ends' }).focus(); await p.keyboard.press('Enter');
      report.keyboard[`t${i + 1}`] = (await p.getByText(/^Done:/).count()) > 0;
      if (i === 0) { await p.getByRole('button', { name: 'Draw the next triangle' }).focus(); await p.keyboard.press('Enter'); }
    }
    report.keyboard.focusRing = await p.evaluate(() => { const e = document.activeElement; const s = getComputedStyle(e); return `${e.tagName} "${e.textContent.trim().slice(0, 80)}": outline ${s.outlineStyle} ${s.outlineWidth}`; });
    await ctx.close();
  }

  // Reduced motion: nothing animates on the drawing.
  {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
    const p = await ctx.newPage();
    await open(p);
    report.reduced.runningAnimations = await p.evaluate(() => document.getAnimations().length);
    await ctx.close();
  }
  fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 1));
  console.log(JSON.stringify(report));
  await b.close();
})();
