// Usage: node docs/product/verification/ratio-3d.cjs <outDir> [port]
// D-040 Phase 1: the ratio explanation page (/t/ratio-algebra/explain/ratio) on a running production build.
// At 390, 768 and 1280px: WebGL draws (the stage changes between beats and after a drag), every chapter plays through
// to its checkpoint and is answered (one wrong first, to see the replay and hint), the table turns by drag, Try it is
// done by keyboard, and axe-core runs on every tab. Also: reduced motion draws the 2.5D picture with no canvas; the
// frame rate while objects glide with 4x CPU throttling at phone width; console errors; and that the 3D code is not
// downloaded by the home page. Developer evidence, not independent QA.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const OUT = process.argv[2]; const BASE = 'http://localhost:' + (process.argv[3] || '3123');
fs.mkdirSync(OUT, { recursive: true });
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const PAGE = '/t/ratio-algebra/explain/ratio';
const ANSWERS = [9, 15, 600];

(async () => {
  const b = await chromium.launch();
  const report = { errors: [], axe: {}, webgl: {}, chapters: {}, orbit: {}, tryIt: {}, reduced: {}, fps: {}, homeLoads3D: null, shots: 0 };
  for (const [vw, w, h] of [['phone', 390, 844], ['tablet', 768, 1024], ['desk', 1280, 900]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: vw === 'desk' ? 2 : 1 });
    const p = await ctx.newPage();
    p.on('pageerror', (e) => report.errors.push(`${vw} pageerror ${e.message}`));
    p.on('console', (m) => m.type() === 'error' && report.errors.push(`${vw}: ${m.text()}`));
    await p.goto(BASE + PAGE, { waitUntil: 'networkidle' });
    await p.addStyleTag({ content: 'header, nav[aria-label="Main"] { position: static !important; }' });
    const stage = p.locator('[data-stage="webgl"]');
    await stage.waitFor({ timeout: 15000 });
    await p.waitForTimeout(2500);
    const shot = async (n, el = stage) => { const buf = await el.screenshot({ path: path.join(OUT, `${vw}-${n}.png`) }); report.shots++; return buf; };
    const first = await shot('1-start');
    const skip = p.getByRole('button', { name: 'Skip to the next part' });
    await skip.click(); await p.waitForTimeout(2500);
    const second = await shot('2-two-groups');
    report.webgl[vw] = { canvas: await stage.locator('canvas').count(), changesBetweenBeats: !first.equals(second) };

    // Turn the table by dragging across the stage.
    const box = await stage.boundingBox();
    await p.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.5);
    await p.mouse.down();
    for (let i = 1; i <= 12; i++) await p.mouse.move(box.x + box.width * (0.5 + i * 0.025), box.y + box.height * 0.5);
    await p.mouse.up();
    await p.waitForTimeout(800);
    const turned = await shot('3-turned');
    report.orbit[vw] = !turned.equals(second);

    // Every chapter: play to the checkpoint and answer it (chapter 1 wrong first).
    const section = () => p.getByText('Quick check').locator('xpath=ancestor::section[1]');
    for (let c = 0; c < ANSWERS.length; c++) {
      while (await skip.isEnabled()) { await skip.click(); await p.waitForTimeout(c === 1 ? 1200 : 300); }
      if (c === 1) await shot('4-jars-or-bar');
      if (c === 0) {
        await section().getByLabel('Your answer').fill('6');
        await section().getByRole('button', { name: 'Check', exact: true }).click();
        while (await skip.isEnabled()) { await skip.click(); await p.waitForTimeout(200); }
        report.chapters.hintAfterWrong = (await p.getByText(/Hint: 6 blue is 3 groups of 2/).count()) > 0;
      }
      await section().getByLabel('Your answer').fill(String(ANSWERS[c]));
      await section().getByRole('button', { name: 'Check', exact: true }).click();
      report.chapters[`${vw}-${c + 1}`] = (await p.getByText("Yes, that's right!").count()) > 0;
      if (c < ANSWERS.length - 1) await p.getByRole('button', { name: /Next chapter/ }).click();
    }
    await p.waitForTimeout(1500);
    await shot('5-recipe');
    await p.addScriptTag({ content: AXE });
    const axe = async (name) => { report.axe[`${vw}-${name}`] = await p.evaluate(async () => (await window.axe.run(document.querySelector('main'))).violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.length}`)); };
    await axe('story');

    // The other tabs.
    for (const [tab, name] of [['Step by step', 'steps'], ['Real-life example', 'real-life'], ['Key notes', 'notes']]) {
      await p.getByRole('tab', { name: tab }).click(); await p.waitForTimeout(600);
      await axe(name);
      await shot(`6-${name}`, p.locator('main'));
    }
    // Try it, by keyboard only.
    await p.getByRole('tab', { name: 'Try it' }).click();
    await p.waitForTimeout(1200);
    await p.getByLabel('How many sweets are in one group?').focus();
    await p.keyboard.type('4'); await p.keyboard.press('Enter');
    const deal = p.getByRole('button', { name: 'Deal one group of 4' });
    for (let i = 0; i < 5; i++) { await deal.focus(); await p.keyboard.press('Enter'); await p.waitForTimeout(250); }
    await p.getByLabel('How many sweets does Amir get?').focus();
    await p.keyboard.type('15'); await p.keyboard.press('Enter');
    report.tryIt[vw] = (await p.getByText(/Yes! 5 groups × 3 = 15 for Amir/).count()) > 0;
    // The stage pauses while off screen; bring it back into view so it draws the final state before the capture.
    await p.locator('[data-stage="webgl"]').scrollIntoViewIfNeeded();
    await p.waitForTimeout(2500);
    await shot('7-try-stage');
    await shot('7-try', p.locator('main'));
    await axe('try');
    await ctx.close();
  }

  // Frame rate while the sweets glide, phone width, 4x CPU throttling.
  {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
    const p = await ctx.newPage();
    const cdp = await ctx.newCDPSession(p);
    await p.goto(BASE + PAGE, { waitUntil: 'networkidle' });
    await p.locator('[data-stage="webgl"]').waitFor();
    await p.waitForTimeout(2000);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    await p.getByRole('button', { name: 'Skip to the next part' }).click();
    report.fps.phone4x = await p.evaluate(() => new Promise((done) => { let n = 0; const t0 = performance.now(); const f = () => { n++; if (performance.now() - t0 < 2000) requestAnimationFrame(f); else done(Math.round((n / (performance.now() - t0)) * 1000)); }; requestAnimationFrame(f); }));
    await ctx.close();
  }

  // Reduced motion: the 2.5D picture, no canvas.
  {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
    const p = await ctx.newPage();
    await p.goto(BASE + PAGE, { waitUntil: 'networkidle' });
    await p.waitForTimeout(2000);
    report.reduced = { canvas: await p.locator('canvas').count(), svgStage: await p.locator('main svg[viewBox="0 0 600 360"]').count() };
    await ctx.close();
  }

  // The home page must not download the 3D code.
  {
    const ctx = await b.newContext();
    const p = await ctx.newPage();
    const scripts = [];
    p.on('response', async (r) => { if (r.url().endsWith('.js')) scripts.push(r.url()); });
    await p.goto(BASE + '/', { waitUntil: 'networkidle' });
    let loads = false;
    for (const u of scripts) { const body = await (await ctx.request.get(u)).text(); if (body.includes('WebGLRenderer')) loads = true; }
    report.homeLoads3D = loads;
    await ctx.close();
  }
  fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 1));
  console.log(JSON.stringify(report));
  await b.close();
})();
