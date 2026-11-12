// Usage: node docs/product/verification/explain-modes.cjs <outDir> [port]
// D-041 Phase 1: the three ways to learn on a running production build. On the fractions pilot
// (/t/fractions-2/explain/add-different) at 390, 768 and 1280px: Watch (the film loads with its length, captions are on,
// a chapter button jumps and plays), Step through (the voice for each beat is fetched while playing; both checkpoints
// answered; the stage changes between beats), Try it (cut by keyboard, four pieces placed by real pointer drags and the
// rest by tap), the remembered choice after a reload, axe-core on every way, sideways overflow and console errors.
// Also: the ratio film; 320px width; reduced motion; the frame rate while the pieces fly together at phone width with
// 4x CPU throttling. Developer evidence, not independent QA.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const OUT = process.argv[2]; const BASE = 'http://localhost:' + (process.argv[3] || '3123');
fs.mkdirSync(OUT, { recursive: true });
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const PAGE = '/t/fractions-2/explain/add-different';

(async () => {
  const b = await chromium.launch();
  const report = { errors: [], axe: {}, watch: {}, step: {}, tryIt: {}, remembered: {}, overflow: {}, ratioFilm: null, narrow: null, reduced: {}, fps: null, shots: 0 };
  const axe = async (p, key) => {
    await p.addScriptTag({ content: AXE });
    report.axe[key] = await p.evaluate(async () => (await window.axe.run(document.querySelector('main'))).violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.length}`));
  };
  const overflow = (p) => p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

  for (const [vw, w, h] of [['phone', 390, 844], ['tablet', 768, 1024], ['desk', 1280, 900]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: vw === 'desk' ? 2 : 1 });
    const p = await ctx.newPage();
    const voices = new Set();
    p.on('pageerror', (e) => report.errors.push(`${vw} pageerror ${e.message}`));
    p.on('console', (m) => m.type() === 'error' && report.errors.push(`${vw}: ${m.text()}`));
    p.on('response', (r) => { const m = r.url().match(/\/voice\/add-different\/([\w-]+)\.mp3$/); if (m && r.status() < 400) voices.add(m[1]); });
    const shot = async (n, el) => { await (el ?? p.locator('#mode-panel')).screenshot({ path: path.join(OUT, `${vw}-${n}.png`) }); report.shots++; };
    await p.goto(BASE + PAGE, { waitUntil: 'networkidle' });
    await p.addStyleTag({ content: 'header, nav[aria-label="Main"] { position: static !important; }' });

    // Watch.
    const video = p.locator('video');
    await p.waitForFunction(() => document.querySelector('video')?.readyState >= 1, null, { timeout: 15000 });
    const info = await video.evaluate((v) => ({ duration: Math.round(v.duration * 10) / 10, tracks: v.textTracks.length, cues: v.textTracks[0]?.cues?.length ?? 0, mode: v.textTracks[0]?.mode, autoplay: v.autoplay, paused: v.paused }));
    await p.getByRole('button', { name: 'Add them', exact: true }).click();
    await p.waitForTimeout(1200);
    const after = await video.evaluate((v) => ({ t: Math.round(v.currentTime * 10) / 10, paused: v.paused }));
    report.watch[vw] = { ...info, selected: await p.getByRole('tab', { name: /^Watch/ }).getAttribute('aria-selected'), jumpedTo: after.t, playingAfterJump: !after.paused };
    await video.evaluate((v) => v.pause());
    await shot('1-watch');
    await axe(p, `${vw}-watch`);
    report.overflow[`${vw}-watch`] = await overflow(p);

    // Step through.
    await p.getByRole('tab', { name: /^Step through/ }).click();
    await p.waitForTimeout(800);
    const stage = p.locator('#mode-panel svg[viewBox="0 0 720 400"]').first();
    const s1 = await stage.screenshot();
    await p.getByRole('button', { name: 'Play', exact: true }).click();
    await p.waitForTimeout(2500);
    await p.getByRole('button', { name: 'Pause', exact: true }).click();
    const skip = p.getByRole('button', { name: 'Skip to the next part' });
    for (let i = 0; i < 3; i++) { await skip.click(); await p.waitForTimeout(300); }
    await p.waitForTimeout(1500);
    const s2 = await stage.screenshot();
    await shot('2-step-cut');
    while (await skip.isEnabled()) { await skip.click(); await p.waitForTimeout(250); }
    const quick = () => p.getByText('Quick check').locator('xpath=ancestor::section[1]');
    await quick().getByLabel('Your answer').fill('4');
    await quick().getByRole('button', { name: 'Check', exact: true }).click();
    const first = (await p.getByText("Yes, that's right!").count()) > 0;
    // Next chapter starts playing by itself.
    await p.getByRole('button', { name: /Next chapter/ }).click();
    await p.waitForTimeout(2600);
    await shot('3-step-combine');
    await p.getByRole('button', { name: 'Pause', exact: true }).click();
    while (await skip.isEnabled()) { await skip.click(); await p.waitForTimeout(250); }
    await quick().getByLabel('Your answer').fill('5');
    await quick().getByRole('button', { name: 'Check', exact: true }).click();
    report.step[vw] = { stageChanges: !s1.equals(s2), checkpoint1: first, checkpoint2: (await p.getByText("Yes, that's right!").count()) > 0, voicesFetched: [...voices].sort() };
    await axe(p, `${vw}-step`);
    report.overflow[`${vw}-step`] = await overflow(p);

    // Try it: cut by keyboard, then drag four pieces and tap the rest.
    await p.getByRole('tab', { name: /^Try it/ }).click();
    await p.waitForTimeout(600);
    await p.getByLabel(/Rows across the third/).focus();
    for (let i = 0; i < 3; i++) await p.keyboard.press('ArrowRight');
    await p.getByLabel(/Columns down the quarter/).focus();
    for (let i = 0; i < 2; i++) await p.keyboard.press('ArrowRight');
    await p.waitForTimeout(900);
    const matched = (await p.getByText(/both wholes have 12 equal pieces/).count()) > 0;
    await shot('4-try-matched');
    const grid = p.getByRole('img', { name: /The whole:/ });
    for (let k = 0; k < 4; k++) {
      const tile = p.getByRole('button', { name: /twelfth: place it/ }).first();
      await tile.scrollIntoViewIfNeeded();
      const t = await tile.boundingBox(); const g = await grid.boundingBox();
      await p.mouse.move(t.x + t.width / 2, t.y + t.height / 2); await p.mouse.down();
      for (let i = 1; i <= 10; i++) await p.mouse.move(t.x + t.width / 2 + ((g.x + g.width / 2) - (t.x + t.width / 2)) * i / 10, t.y + t.height / 2 + ((g.y + g.height / 2) - (t.y + t.height / 2)) * i / 10);
      await p.mouse.up(); await p.waitForTimeout(700);
    }
    const byDrag = Number((await grid.getAttribute('aria-label')).match(/(\d+) of 12/)[1]);
    while (await p.getByRole('button', { name: /twelfth: place it/ }).count()) { await p.getByRole('button', { name: /twelfth: place it/ }).first().click(); await p.waitForTimeout(400); }
    await p.waitForTimeout(900);
    report.tryIt[vw] = { matched, placedByDrag: byDrag, done: (await p.getByText('Four twelfths and three twelfths make seven twelfths.').count()) > 0 };
    await shot('5-try-done');
    await axe(p, `${vw}-try`);
    report.overflow[`${vw}-try`] = await overflow(p);

    // The choice is remembered.
    await p.goto(BASE + PAGE, { waitUntil: 'networkidle' });
    report.remembered[vw] = await p.getByRole('tab', { name: /^Try it/ }).getAttribute('aria-selected');
    await shot('6-page', p.locator('main'));
    await ctx.close();
  }

  // The ratio film, and 320px.
  {
    const ctx = await b.newContext({ viewport: { width: 320, height: 700 } });
    const p = await ctx.newPage();
    p.on('pageerror', (e) => report.errors.push(`320 pageerror ${e.message}`));
    await p.goto(BASE + '/t/ratio-algebra/explain/ratio', { waitUntil: 'networkidle' });
    await p.waitForFunction(() => document.querySelector('video')?.readyState >= 1, null, { timeout: 15000 });
    report.ratioFilm = await p.locator('video').evaluate((v) => ({ duration: Math.round(v.duration * 10) / 10, cues: v.textTracks[0]?.cues?.length ?? 0 }));
    report.narrow = { ratio: await overflow(p) };
    for (const m of ['Watch', 'Step through', 'Try it']) {
      await p.goto(BASE + PAGE, { waitUntil: 'networkidle' });
      await p.getByRole('tab', { name: new RegExp('^' + m) }).click();
      await p.waitForTimeout(600);
      report.narrow[m] = await overflow(p);
    }
    await ctx.close();
  }

  // Reduced motion: the stage still draws, and Try it finishes by tap.
  {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
    const p = await ctx.newPage();
    await p.goto(BASE + PAGE + '#step', { waitUntil: 'networkidle' });
    report.reduced.stage = await p.locator('#mode-panel svg[viewBox="0 0 720 400"]').count();
    await p.getByRole('tab', { name: /^Try it/ }).click();
    await p.getByLabel(/Rows across the third/).fill('4');
    await p.getByLabel(/Columns down the quarter/).fill('3');
    while (await p.getByRole('button', { name: /twelfth: place it/ }).count()) await p.getByRole('button', { name: /twelfth: place it/ }).first().click();
    report.reduced.tryDone = (await p.getByText('Four twelfths and three twelfths make seven twelfths.').count()) > 0;
    await ctx.close();
  }

  // Frame rate while the pieces fly together, phone width, 4x CPU throttling.
  {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
    const p = await ctx.newPage();
    const cdp = await ctx.newCDPSession(p);
    await p.goto(BASE + PAGE + '#step', { waitUntil: 'networkidle' });
    const skip = p.getByRole('button', { name: 'Skip to the next part' });
    while (await skip.isEnabled()) await skip.click();
    const quick = p.getByText('Quick check').locator('xpath=ancestor::section[1]');
    await quick.getByLabel('Your answer').fill('4');
    await quick.getByRole('button', { name: 'Check', exact: true }).click();
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    await p.getByRole('button', { name: /Next chapter/ }).click();
    report.fps = await p.evaluate(() => new Promise((done) => { let n = 0; const t0 = performance.now(); const f = () => { n++; if (performance.now() - t0 < 2000) requestAnimationFrame(f); else done(Math.round((n / (performance.now() - t0)) * 1000)); }; requestAnimationFrame(f); }));
    await ctx.close();
  }

  fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 1));
  console.log(JSON.stringify(report));
  await b.close();
})();
