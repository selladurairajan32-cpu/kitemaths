// Usage: node docs/product/verification/journey.cjs <outDir> [port]
// D-043: the topic journey on a running production build. At 390, 768 and 1280px: the old /explain address redirects;
// Learn (the mode cards, Step through fetches Emma's voice while playing, Try it with pizza cutters by keyboard and
// slices by tap); then the whole journey by pointer: Practise (7 questions, answered as a child might, sometimes
// wrong, so hints and the answer reveal are used), Apply (3), Check (the MAST-001 recheck) and Complete. axe-core on
// every stage, the height of each stage, sideways overflow, console errors, and the saved stage after a reload. Also
// 320px and reduced motion. Developer evidence, not independent QA.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const OUT = process.argv[2]; const BASE = 'http://localhost:' + (process.argv[3] || '3123');
fs.mkdirSync(OUT, { recursive: true });
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const LEARN = '/t/fractions-2/learn/add-different';

/**
 * Answers the question on screen as a child might: tries each option (or a few numbers) until the player offers to move
 * on, taking the misconception follow-up ("Try a quick question") when it is offered. Returns the attempts and follow-ups.
 */
const followUps = { n: 0 };
async function answer(p, nextName) {
  const next = p.getByRole('button', { name: nextName });
  let tries = 0;
  for (let step = 0; step < 14; step++) {
    if (await next.isVisible().catch(() => false)) return tries;
    const extra = p.getByRole('button', { name: /^(Try a quick question|Back to the question)/ });
    if (await extra.first().isVisible().catch(() => false)) {
      if (/Try a quick/.test(await extra.first().textContent())) followUps.n++;
      await extra.first().click(); await p.waitForTimeout(500); continue;
    }
    const radios = p.locator('main [role="radio"]:not([disabled]), main input[type="radio"]:not([disabled])');
    const box = p.locator('main input[type="text"]:not([disabled])').first();
    if (await radios.count()) { const r = radios.nth(tries % (await radios.count())); await r.evaluate((e) => e.scrollIntoView({ block: 'center' })); await r.click({ force: true }); }
    else if (await box.count()) await box.fill(String([4, 12, 7, 1, 3, 6][tries % 6]));
    const check = p.getByRole('button', { name: /^Check/ });
    if (await check.isEnabled().catch(() => false)) { await check.click(); tries++; }
    await p.waitForTimeout(500);
  }
  return tries;
}

(async () => {
  const b = await chromium.launch();
  const report = { errors: [], redirect: {}, axe: {}, heights: {}, overflow: {}, learn: {}, practise: {}, apply: {}, check: {}, complete: {}, resumed: {}, narrow: null, reduced: null, shots: 0 };
  const axe = async (p, key) => { await p.addScriptTag({ content: AXE }); report.axe[key] = await p.evaluate(async () => (await window.axe.run(document.querySelector('main'))).violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.length}`)); };
  const measure = async (p, key) => {
    report.heights[key] = await p.evaluate(() => Math.round((document.querySelector('main').scrollHeight / window.innerHeight) * 100) / 100);
    report.overflow[key] = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  };
  for (const [vw, w, h] of [['phone', 390, 844], ['tablet', 768, 1024], ['desk', 1280, 900]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: vw === 'desk' ? 2 : 1 });
    const p = await ctx.newPage();
    const voices = new Set();
    p.on('pageerror', (e) => report.errors.push(`${vw} pageerror ${e.message}`));
    p.on('console', (m) => m.type() === 'error' && report.errors.push(`${vw}: ${m.text()}`));
    p.on('response', (r) => { const m = r.url().match(/\/voice\/add-different\/([\w-]+)\.mp3$/); if (m && r.status() < 400) voices.add(m[1]); });
    const shot = async (n) => { await p.screenshot({ path: path.join(OUT, `${vw}-${n}.png`), fullPage: true }); report.shots++; };
    const next = (name) => p.getByRole('button', { name });

    await p.goto(BASE + '/t/fractions-2/explain/add-different', { waitUntil: 'networkidle' });
    report.redirect[vw] = new URL(p.url()).pathname;
    await p.addStyleTag({ content: 'header, nav[aria-label="Main"] { position: static !important; }' });

    // Learn.
    await p.getByRole('heading', { name: 'Choose how you want to learn' }).waitFor();
    await p.waitForFunction(() => document.querySelector('video')?.readyState >= 1, null, { timeout: 15000 });
    const film = await p.locator('video').evaluate((v) => Math.round(v.duration));
    await shot('1-learn-watch'); await measure(p, `${vw}-learn`); await axe(p, `${vw}-learn-watch`);
    await p.getByRole('tab', { name: /^Step through/ }).click();
    await p.getByRole('button', { name: 'Play', exact: true }).click();
    await p.waitForTimeout(2500);
    await p.getByRole('button', { name: 'Pause', exact: true }).click();
    await shot('2-learn-step'); await axe(p, `${vw}-learn-step`);
    await p.getByRole('tab', { name: /^Try it/ }).click();
    await p.getByLabel(/Sam's cutter/).focus(); for (let i = 0; i < 3; i++) await p.keyboard.press('ArrowRight');
    await p.getByLabel(/Zara's cutter/).focus(); for (let i = 0; i < 2; i++) await p.keyboard.press('ArrowRight');
    await p.waitForTimeout(700);
    while (await p.getByRole('button', { name: /put it on the pizza/ }).count()) { await p.getByRole('button', { name: /put it on the pizza/ }).first().click(); await p.waitForTimeout(250); }
    report.learn[vw] = { film, voices: [...voices], tryDone: (await p.getByText('Four twelfths and three twelfths make seven twelfths.').count()) > 0 };
    await shot('3-learn-try'); await axe(p, `${vw}-learn-try`);

    // Practise.
    await next(/I'm ready: Practise/).click();
    await p.getByRole('list', { name: 'Practice levels' }).waitFor();
    await p.getByRole('button', { name: 'Method' }).click();
    await shot('4-practise'); await measure(p, `${vw}-practise`); await axe(p, `${vw}-practise`);
    const tries = [];
    for (let i = 0; i < 7; i++) { tries.push(await answer(p, /^(Next question|Finish)/)); await next(/^(Next question|Finish)/).click(); await p.waitForTimeout(400); }
    report.practise[vw] = { tries, followUps: followUps.n, nextShown: await next(/Next: Apply/).isVisible() };
    await next(/Next: Apply/).click();

    // Apply.
    const applyTries = [];
    for (let i = 0; i < 3; i++) { applyTries.push(await answer(p, /^(Next question|Finish)/)); await next(/^(Next question|Finish)/).click(); await p.waitForTimeout(400); }
    await shot('5-apply'); await axe(p, `${vw}-apply`);
    report.apply[vw] = { tries: applyTries };
    await next(/Next: Check understanding/).click();

    // Check: the recheck runner.
    await next(/Start the check/).click();
    for (let i = 0; i < 4; i++) {
      const radios = p.locator('main [role="radio"], main input[type="radio"]');
      const box = p.locator('main input[type="text"]:not([disabled])').first();
      if (await radios.count()) { await radios.first().evaluate((e) => e.scrollIntoView({ block: 'center' })); await radios.first().click({ force: true }); } else if (await box.count()) await box.fill('4');
      const go = p.getByRole('button', { name: /^(Next|Review & finish|Skip for now)/ });
      if (await go.count()) { await go.first().click(); await p.waitForTimeout(400); }
      const fin = p.getByRole('button', { name: /^Finish!/ });
      if (await fin.count()) { await fin.click(); break; }
    }
    await p.waitForTimeout(800);
    report.check[vw] = { result: await p.getByText(/You got \d of \d right/).textContent().catch(() => null) };
    await shot('6-check'); await axe(p, `${vw}-check`);
    await next(/See how you did/).click();

    // Complete.
    await p.getByRole('heading', { name: /Topic complete!|Good effort!/ }).waitFor();
    report.complete[vw] = { heading: await p.locator('main h2.display').first().textContent(), strands: await p.getByRole('heading', { name: 'How well you understand it' }).locator('xpath=ancestor::section[1]//li').count() };
    await shot('7-complete'); await measure(p, `${vw}-complete`); await axe(p, `${vw}-complete`);

    // Saved: a reload comes back to Complete.
    await p.reload({ waitUntil: 'networkidle' });
    report.resumed[vw] = (await p.getByRole('heading', { name: /Topic complete!|Good effort!/ }).count()) > 0;
    await ctx.close();
  }

  // 320px: every stage reachable fits without sideways scroll (Learn and a practice question).
  {
    const ctx = await b.newContext({ viewport: { width: 320, height: 700 } });
    const p = await ctx.newPage();
    await p.goto(BASE + LEARN, { waitUntil: 'networkidle' });
    const learn = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    await p.getByRole('button', { name: /I'm ready: Practise/ }).click();
    await p.waitForTimeout(600);
    report.narrow = { learn, practise: await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth) };
    await ctx.close();
  }
  // Reduced motion: Try it still finishes by tap.
  {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
    const p = await ctx.newPage();
    await p.goto(BASE + LEARN + '#try', { waitUntil: 'networkidle' });
    await p.getByLabel(/Sam's cutter/).fill('4'); await p.getByLabel(/Zara's cutter/).fill('3');
    while (await p.getByRole('button', { name: /put it on the pizza/ }).count()) await p.getByRole('button', { name: /put it on the pizza/ }).first().click();
    report.reduced = { tryDone: (await p.getByText('Four twelfths and three twelfths make seven twelfths.').count()) > 0 };
    await ctx.close();
  }
  fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 1));
  console.log(JSON.stringify(report));
  await b.close();
})();
