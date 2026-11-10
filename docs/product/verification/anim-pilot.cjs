// Usage: node docs/product/verification/anim-pilot.cjs <outDir> [port]
// ANIM-001 pilot v2 (D-036): the Long multiplication "Watch how it works" stage and "Try it yourself" on a running
// production build. At 390, 768 and 1280px it walks all 14 steps, doing each task the way a child would (tap the ones,
// drag the scissors with the pointer, drag the 0 into the gap), captures each step mid-animation and at rest, then the
// try-it with a slip and "Show me again". It also runs the stage by keyboard only, repeats with reduced motion, runs
// axe-core and records console errors. Developer evidence, not independent QA.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const OUT = process.argv[2]; const BASE = 'http://localhost:' + (process.argv[3] || '3123');
fs.mkdirSync(OUT, { recursive: true });
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const LESSON = '/t/multiply-divide/lesson/long/';
// The lesson's steps: explain, watch me, together, then the animated watch step and the try step (1-based URLs).
const WATCH = 4;
const TRY = 5;
const NEXT = /^(Next|I've got it!)$/;

async function open(p, step) {
  await p.goto(BASE + LESSON + '1', { waitUntil: 'networkidle' });
  await p.waitForFunction(() => localStorage.getItem('kite-maths:v2'));
  await p.evaluate((furthest) => {
    const s = JSON.parse(localStorage.getItem('kite-maths:v2'));
    s.topics['multiply-divide'].lessons.long = { step: furthest, furthestStep: furthest, completed: false };
    localStorage.setItem('kite-maths:v2', JSON.stringify(s));
  }, step - 1);
  await p.goto(BASE + LESSON + step, { waitUntil: 'networkidle' });
}

/** Drag from the centre of one element to a point given by a function of the page. */
async function drag(p, from, to) {
  const a = await from.boundingBox();
  await p.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
  await p.mouse.down();
  const t = await to();
  for (let i = 1; i <= 8; i++) await p.mouse.move(a.x + a.width / 2 + ((t.x - a.x - a.width / 2) * i) / 8, a.y + a.height / 2 + ((t.y - a.y - a.height / 2) * i) / 8);
  await p.mouse.up();
}

async function doTask(p, report, vw) {
  const swap = p.getByRole('button', { name: 'Swap 10 ones for a ten' }).last();
  if (await swap.count()) { await swap.click(); return 'swap'; }
  const scissors = p.getByRole('slider', { name: /Scissors/ });
  if (await scissors.count()) {
    // Drag the scissors to the line after 10 rows: the rectangle is 14 rows, so 10/14 of its height.
    const rect = p.locator('svg[aria-label*="with scissors"] rect').nth(1);
    await drag(p, scissors.locator('circle').first(), async () => { const r = await rect.boundingBox(); return { x: r.x - 10, y: r.y + (r.height * 10) / 14 }; });
    await p.waitForTimeout(300);
    report.drags[vw + '-scissors'] = await p.getByText(/Great cut/).count() > 0;
    return 'cut';
  }
  const zero = p.getByRole('button', { name: 'Put a 0 in the ones place' });
  if (await zero.count()) {
    await drag(p, zero, async () => { const h = await p.getByLabel('Empty ones place').boundingBox(); return { x: h.x + h.width / 2, y: h.y + h.height / 2 }; });
    await p.waitForTimeout(400);
    report.drags[vw + '-zero'] = await p.getByText(/Digits moved one place/).count() > 0;
    if (!report.drags[vw + '-zero'] && (await zero.count())) await zero.click();
    return 'zero';
  }
  return null;
}

(async () => {
  const b = await chromium.launch();
  const report = { errors: [], axe: {}, drags: {}, keyboard: {}, reduced: {}, steps: {}, shots: 0 };
  for (const [vw, w, h] of [['phone', 390, 844], ['tablet', 768, 1024], ['desk', 1280, 900]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: vw === 'desk' ? 2 : 1 });
    const p = await ctx.newPage();
    p.on('pageerror', (e) => report.errors.push(`${vw} pageerror ${e.message}`));
    p.on('console', (m) => m.type() === 'error' && report.errors.push(`${vw}: ${m.text()}`));
    await open(p, WATCH);
    const card = p.locator('main');
    const shot = async (n) => { await card.screenshot({ path: `${OUT}/${vw}-${n}.png` }); report.shots++; };
    let i = 0;
    for (; i < 20; i++) {
      const name = String(i + 1).padStart(2, '0');
      await p.waitForTimeout(900); if (vw !== 'tablet') await shot(`${name}-moving`);
      await p.waitForTimeout(4600); await shot(`${name}`);
      const task = await doTask(p, report, vw);
      if (task) { await p.waitForTimeout(vw === 'tablet' ? 2600 : 900); if (vw !== 'tablet') await shot(`${name}-${task}-moving`); await p.waitForTimeout(2200); await shot(`${name}-${task}-done`); }
      const next = p.getByRole('button', { name: NEXT });
      if (!(await next.count()) || !(await next.isEnabled())) break;
      const last = (await next.textContent()).includes("I've got it");
      await next.click();
      if (last) { i++; break; }
    }
    report.steps[vw] = i;
    report[vw + 'ContinueEnabled'] = await p.getByRole('button', { name: /^Continue/ }).isEnabled();
    await p.addScriptTag({ content: AXE });
    report.axe[vw + '-watch'] = await p.evaluate(async () => (await window.axe.run(document.querySelector('main'))).violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.length}`));

    // Try it yourself: a missing-zero slip, "Show me again", then the right answers.
    await open(p, TRY);
    const answer = async (v) => { await p.getByRole('textbox').fill(v); await p.getByRole('button', { name: 'Check' }).click(); await p.waitForTimeout(500); };
    await answer('68'); await answer('34');
    await p.getByRole('button', { name: /Show me again/ }).click();
    await p.waitForTimeout(4000);
    await shot('try-show-me-again');
    await answer('340'); await answer('408');
    await p.waitForTimeout(600);
    await shot('try-done');
    report[vw + 'TryContinueEnabled'] = await p.getByRole('button', { name: /^Continue/ }).isEnabled();
    await p.addScriptTag({ content: AXE });
    report.axe[vw + '-try'] = await p.evaluate(async () => (await window.axe.run(document.querySelector('main'))).violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.length}`));
    await ctx.close();
  }

  // Keyboard only: Next, the swap, the scissors slider and the 0, all by keys.
  {
    const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
    const p = await ctx.newPage();
    await open(p, WATCH);
    const next = p.getByRole('button', { name: /^(Next|I've got it!|Your turn first)$/ });
    await next.focus();
    let steps = 0;
    for (; steps < 20; steps++) {
      await p.waitForTimeout(2500); // let the step's beats play, so a task's control is there
      if (await p.getByRole('button', { name: 'Swap 10 ones for a ten' }).count()) { await p.getByRole('button', { name: 'Swap 10 ones for a ten' }).first().focus(); await p.keyboard.press('Enter'); }
      if (await p.getByRole('slider', { name: /Scissors/ }).count()) { await p.getByRole('slider').focus(); for (let k = 0; k < 7; k++) await p.keyboard.press('ArrowDown'); await p.keyboard.press('Enter'); }
      if (await p.getByRole('button', { name: 'Put a 0 in the ones place' }).count()) { await p.getByRole('button', { name: 'Put a 0 in the ones place' }).focus(); await p.keyboard.press('Enter'); }
      await p.waitForTimeout(200);
      const label = await next.textContent();
      await next.focus(); await p.keyboard.press('Enter');
      if (label.includes("I've got it")) break;
    }
    report.keyboard.steps = steps + 1;
    report.keyboard.finished = await p.getByRole('button', { name: 'Watched it all' }).count() > 0;
    report.keyboard.focusRing = await p.evaluate(() => { const e = document.activeElement; const s = getComputedStyle(e); return `${e.textContent.trim()}: outline ${s.outlineStyle} ${s.outlineWidth}`; });
    await ctx.close();
  }

  // Reduced motion: every step shows its end state at once and nothing animates.
  {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
    const p = await ctx.newPage();
    await open(p, WATCH);
    for (let i = 0; i < 3; i++) await p.getByRole('button', { name: NEXT }).click();
    await p.waitForTimeout(80);
    report.reduced.joinedAt80ms = await p.getByText('= 230').count() > 0;
    report.reduced.runningAnimations = await p.evaluate(() => document.getAnimations().length);
    await p.locator('main').screenshot({ path: `${OUT}/reduced-04.png` }); report.shots++;
    await ctx.close();
  }
  fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 1));
  console.log(JSON.stringify(report, null, 1));
  await b.close();
})();
