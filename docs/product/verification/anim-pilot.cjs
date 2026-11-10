// Usage: node docs/product/verification/anim-pilot.cjs <outDir> [port]
// ANIM-001 pilot: the animated Long multiplication lab on a running production build. For each width it captures every
// method at every step, the try-it feedback, and the finished state; it runs the lab by keyboard only, repeats with
// reduced motion, runs axe-core on the lab, and records console errors. Developer evidence, not independent QA.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const OUT = process.argv[2]; const BASE = 'http://localhost:' + (process.argv[3] || '3123');
fs.mkdirSync(OUT, { recursive: true });
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const LESSON = '/t/multiply-divide/lesson/long/';

async function openLab(p) {
  await p.goto(BASE + LESSON + '1', { waitUntil: 'networkidle' });
  await p.waitForFunction(() => localStorage.getItem('kite-maths:v2'));
  await p.evaluate(() => {
    const s = JSON.parse(localStorage.getItem('kite-maths:v2'));
    const t = s.topics['multiply-divide'];
    t.lessons.long = { step: 1, furthestStep: 1, completed: false };
    localStorage.setItem('kite-maths:v2', JSON.stringify(s));
  });
  await p.goto(BASE + LESSON + '2', { waitUntil: 'networkidle' });
  await p.getByRole('tab', { name: /In real life/ }).waitFor();
}

(async () => {
  const b = await chromium.launch();
  const report = { errors: [], axe: {}, keyboard: {}, reduced: {}, shots: 0 };
  for (const [vw, w, h] of [['phone', 390, 844], ['tablet', 768, 1024], ['desk', 1280, 900]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: vw === 'desk' ? 2 : 1 });
    const p = await ctx.newPage();
    p.on('pageerror', (e) => report.errors.push(`${vw} pageerror ${e.message}`));
    p.on('console', (m) => m.type() === 'error' && report.errors.push(`${vw}: ${m.text()}`));
    await openLab(p);
    const panel = p.locator('[role=tabpanel]');
    const shot = async (n) => { await p.waitForTimeout(1600); await panel.screenshot({ path: `${OUT}/${vw}-${n}.png` }); report.shots++; };
    for (const [id, name] of [['real', /In real life/], ['picture', /Picture it/], ['steps', /Step by step/]]) {
      await p.getByRole('tab', { name }).click();
      const steps = await p.getByRole('button', { name: /^Go to step/ }).count();
      for (let i = 1; i <= steps; i++) {
        await p.getByRole('button', { name: `Go to step ${i}` }).click();
        await shot(`${id}-${i}`);
      }
    }
    // Area-model regrouping as frames (step 3 → 4 of Picture it).
    if (vw === 'desk') {
      await p.getByRole('tab', { name: /Picture it/ }).click();
      await p.getByRole('button', { name: 'Go to step 2' }).click(); await p.waitForTimeout(1500);
      await p.getByRole('button', { name: 'Go to step 3' }).click();
      for (let f = 0; f < 6; f++) { await p.waitForTimeout(120); await panel.screenshot({ path: `${OUT}/desk-frames-${f}.png` }); report.shots++; }
    }
    // Try it: a missing-zero slip, then the right answers.
    const box = () => p.getByRole('textbox').last();
    const answer = async (v) => { await box().fill(v); await p.getByRole('button', { name: 'Check' }).click(); await p.waitForTimeout(500); };
    await answer('68'); await answer('34');
    await p.getByText('Did you forget the 0?').scrollIntoViewIfNeeded();
    await p.waitForTimeout(500);
    await p.screenshot({ path: `${OUT}/${vw}-tryit-feedback.png`, fullPage: false }); report.shots++;
    await answer('340'); await answer('408');
    await p.screenshot({ path: `${OUT}/${vw}-tryit-done.png`, fullPage: true }); report.shots++;
    report[vw + 'ContinueEnabled'] = await p.getByRole('button', { name: /^Continue/ }).isEnabled();
    await p.addScriptTag({ content: AXE });
    const ax = await p.evaluate(async () => (await window.axe.run(document.querySelector('[role=tabpanel]').closest('section').parentElement)).violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.length}`));
    report.axe[vw] = ax;
    await ctx.close();
  }

  // Keyboard only: Tab to the method tabs, arrows between methods, arrows between steps, then complete the try-it.
  {
    const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
    const p = await ctx.newPage();
    await openLab(p);
    await p.getByRole('tab', { name: /In real life/ }).focus();
    await p.keyboard.press('ArrowRight');
    report.keyboard.tabAfterArrow = await p.evaluate(() => document.activeElement.textContent);
    await p.keyboard.press('Tab'); // into the player's controls
    for (let i = 0; i < 20 && !(await p.evaluate(() => document.activeElement.textContent.includes('Next step'))); i++) await p.keyboard.press('Tab');
    await p.keyboard.press('Enter'); await p.keyboard.press('Enter');
    report.keyboard.captionAfterTwoNext = (await p.locator('[aria-live=polite]').first().textContent()).slice(0, 60);
    const focusVisible = await p.evaluate(() => getComputedStyle(document.activeElement).outlineStyle + ' ' + getComputedStyle(document.activeElement).boxShadow.slice(0, 40));
    report.keyboard.focusStyle = focusVisible;
    for (const v of ['68', '340', '408']) {
      await p.getByRole('textbox').last().focus();
      await p.keyboard.type(v); await p.keyboard.press('Enter'); await p.waitForTimeout(300);
    }
    report.keyboard.done = await p.getByText(/Every part is right/).isVisible();
    await ctx.close();
  }

  // Reduced motion: the same steps and content, with nothing moving.
  {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
    const p = await ctx.newPage();
    await openLab(p);
    await p.getByRole('tab', { name: /Step by step/ }).click();
    await p.getByRole('button', { name: 'Go to step 5' }).click();
    await p.waitForTimeout(80); // no animation should be running, so the end state shows at once
    await p.locator('[role=tabpanel]').screenshot({ path: `${OUT}/reduced-steps-5.png` }); report.shots++;
    report.reduced.totalShownAt80ms = await p.locator('[role=tabpanel] svg text').allTextContents().then((t) => t.join('').includes('322') || t.join(' ').replace(/\s/g, '').includes('223'));
    report.reduced.runningAnimations = await p.evaluate(() => document.getAnimations().length);
    await ctx.close();
  }
  fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 1));
  console.log(JSON.stringify(report, null, 1));
  await b.close();
})();
