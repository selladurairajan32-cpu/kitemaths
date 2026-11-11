// Usage: node docs/product/verification/live-check.cjs <outDir>
// D-037 deployment check on https://kitemaths.vercel.app with cache-busting loads: Home, the Measures island, the Long
// multiplication animated step 4, a Measures lesson and the mock with the ISEB profile, at 390 and 1280px. Records the
// HTTP status, one content check per page and console errors. Developer evidence, not independent QA.
const { chromium } = require('playwright');
const OUT = process.argv[2]; const BASE = 'https://kitemaths.vercel.app';
const cb = () => `?cb=${Date.now()}`;
(async () => {
  const b = await chromium.launch();
  const report = { errors: [], checks: {} };
  for (const [vw, w, h] of [['phone', 390, 844], ['desk', 1280, 900]]) {
    const p = await (await b.newContext({ viewport: { width: w, height: h } })).newPage();
    p.on('pageerror', (e) => report.errors.push(`${vw} pageerror ${e.message}`));
    p.on('console', (m) => m.type() === 'error' && report.errors.push(`${vw}: ${m.text()}`));
    const go = async (name, url, test) => { const r = await p.goto(BASE + url + cb(), { waitUntil: 'networkidle' }); await p.waitForTimeout(600); report.checks[`${vw}-${name}`] = { status: r.status(), ok: await test() }; await p.screenshot({ path: `${OUT}/${vw}-${name}.png` }); };
    await go('home', '/', async () => (await p.getByRole('link', { name: /Continue|Start|Play the warm-up/ }).count()) > 0);
    await go('island', '/t/measures/', async () => (await p.getByText('Measures').count()) > 0);
    // Long multiplication step 4 (the animated watch step) needs the earlier steps recorded as seen.
    await p.goto(BASE + '/t/multiply-divide/lesson/long/1' + cb(), { waitUntil: 'networkidle' });
    await p.evaluate(() => { const s = JSON.parse(localStorage.getItem('kite-maths:v2')); s.topics['multiply-divide'].lessons.long = { step: 3, furthestStep: 3, completed: false }; localStorage.setItem('kite-maths:v2', JSON.stringify(s)); });
    await go('pilot-step4', '/t/multiply-divide/lesson/long/4', async () => (await p.getByRole('button', { name: /^(Next|Replay|Pause)/ }).count()) > 0);
    await go('measures-volume', '/t/measures/lesson/volume/1', async () => (await p.getByText('Layers of cubes').count()) > 0 && (await p.locator('figure[aria-label*="cuboid"]').count()) > 0);
    await go('mock', '/t/mock-exams/mock', async () => { await p.getByRole('button', { name: /^ISEB Common Pre-Tests/ }).click(); return (await p.getByText(/40 minutes/).count()) > 0 && (await p.getByRole('button', { name: 'Answer sheet (A to E)' }).count()) > 0; });
  }
  require('fs').writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 1));
  console.log(JSON.stringify(report));
  await b.close();
})();
