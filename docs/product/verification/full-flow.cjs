// D-062: one full flow by clicking only: Home → Topics → Fractions 2 → "Different denominators" → the lesson canvas
// (Discover) → leave → back on the topic page, which now shows where the lesson has got to → Home offers to continue.
// At 1280 and 390px. Usage: node docs/product/verification/full-flow.cjs <out-dir> [port] (a production build serving).
const { chromium } = require('playwright');
const OUT = process.argv[2] || 'docs/product/verification/results/d062-flow', B = `http://localhost:${process.argv[3] || 3123}`;
(async () => {
  const b = await chromium.launch();
  let failed = false;
  for (const [vw, h] of [[1280, 900], [390, 844]]) {
    const ctx = await b.newContext({ viewport: { width: vw, height: h }, deviceScaleFactor: 2 });
    const p = await ctx.newPage();
    const errs = []; p.on('console', (m) => m.type() === 'error' && errs.push(m.text())); p.on('pageerror', (e) => errs.push(String(e)));
    const checks = {};
    const shot = async (n) => { await p.waitForTimeout(900); checks[n + ' fits'] = !(await p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)); await p.screenshot({ path: `${OUT}/${vw}-${n}.png`, fullPage: true }); };
    const main = () => p.locator(vw < 1024 ? 'nav[aria-label="Main"] >> visible=true' : 'header nav[aria-label="Main"]').first();
    await p.goto(B + '/', { waitUntil: 'networkidle' });
    checks['home: one yellow button'] = (await p.locator('main .bg-cta >> visible=true').count()) === 1;
    await shot('1-home');
    await main().getByRole('link', { name: 'Topics' }).click(); await p.waitForURL('**/topics'); await p.getByRole('heading', { level: 1, name: 'Topics' }).waitFor(); await p.waitForTimeout(800);
    checks['topics: 21 rows'] = (await p.locator('main li a[href^="/t/"] >> visible=true').count()) === 21;
    await shot('2-topics');
    await p.getByRole('link', { name: /^Fractions 2/ }).click(); await p.waitForURL('**/t/fractions-2'); await p.getByRole('heading', { level: 1, name: 'Fractions 2' }).waitFor(); await p.waitForTimeout(800);
    checks['topic: one yellow button'] = (await p.locator('main .bg-cta >> visible=true').count()) === 1;
    await shot('3-topic');
    await p.getByRole('link', { name: /^Different denominators/ }).click(); await p.waitForURL('**/learn/add-different'); await p.getByRole('heading', { level: 1, name: /How much chocolate/ }).waitFor(); await p.waitForTimeout(500);
    checks['lesson: canvas, no site navigation'] = (await p.getByRole('heading', { level: 1, name: /How much chocolate/ }).count()) === 1 && (await p.locator('nav[aria-label="Main"] >> visible=true').count()) === 0;
    await p.getByRole('group', { name: /Have a guess/ }).getByRole('button').first().click();
    await p.getByRole('button', { name: /Find out why/ }).click();
    await shot('4-lesson');
    await p.getByRole('link', { name: /Leave the lesson/ }).click(); await p.waitForURL('**/t/fractions-2');
    checks['topic: shows the lesson under way'] = (await p.getByText('Carry on: Explore, step 2 of 6.').count()) > 0;
    await shot('5-topic-after');
    await main().getByRole('link', { name: 'Home' }).click(); await p.waitForURL(B + '/');
    checks['home: continues the lesson'] = (await p.getByRole('link', { name: /^Continue/ }).getAttribute('href')) === '/t/fractions-2/learn/add-different' && (await p.getByText(/Step 2 of 6: Explore/).count()) > 0;
    await shot('6-home-after');
    const ok = Object.values(checks).every(Boolean) && errs.length === 0;
    failed ||= !ok;
    console.log(vw, ok ? 'PASS' : 'FAIL', JSON.stringify(checks), errs.slice(0, 3));
    await ctx.close();
  }
  await b.close();
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
