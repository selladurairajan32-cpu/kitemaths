// Usage: node docs/product/verification/live-check.cjs <outDir>
// D-037 deployment check on https://kitemaths.vercel.app with cache-busting loads: Home, the Measures island, the Long
// multiplication animated step 4, a Measures lesson, the D-038 thousandths lesson, the D-039 drawing lab, the mock
// with the ISEB profile, and the D-040/D-041/D-043 topic journeys (fractions: the film loads and Step through draws; ratio:
// the 3D stage draws in Step through), and the D-043 step 3 kid pages (Home continues the journey, Topics, Practice,
// Tests, Progress), at 390 and 1280px. Records the
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
    // D-038: one of the last 7 objectives (thousandths), with its new two-column table.
    await go('decimals-thousandths', '/t/decimals/lesson/thousandths/1', async () => (await p.getByText('Three places after the point').count()) > 0 && (await p.getByText('6 thousandths = 0.006').count()) > 0);
    // D-039: the drawing lab (Drawing to size, step 4) shows its ruler handle.
    await p.goto(BASE + '/t/shapes-angles/lesson/construct/1' + cb(), { waitUntil: 'networkidle' });
    await p.evaluate(() => { const s = JSON.parse(localStorage.getItem('kite-maths:v2')); s.topics['shapes-angles'].lessons.construct = { step: 3, furthestStep: 3, completed: false }; localStorage.setItem('kite-maths:v2', JSON.stringify(s)); });
    await go('draw-tool', '/t/shapes-angles/lesson/construct/4', async () => (await p.getByRole('slider', { name: 'Ruler: length of the base' }).count()) > 0);
    // D-041, D-043: the fractions journey's Learn stage: the film loads with its length, and Step through draws its stage.
    await go('explain-fractions', '/t/fractions-2/learn/add-different', async () => {
      const film = await p.waitForFunction(() => { const v = document.querySelector('video'); return v && v.readyState >= 1 && Math.round(v.duration); }, null, { timeout: 15000 }).then((h) => h.jsonValue()).catch(() => 0);
      await p.getByRole('tab', { name: /^Step through/ }).click();
      return film === 103 && (await p.locator('#mode-panel svg[viewBox="0 0 720 400"]').count()) > 0 && (await p.getByRole('list', { name: 'Your learning journey' }).count()) > 0;
    });
    // D-040, D-041: the ratio explanation: Step through draws the WebGL stage.
    await go('explain-ratio', '/t/ratio-algebra/learn/ratio', async () => {
      await p.getByRole('tab', { name: /^Step through/ }).click();
      return (await p.locator('[data-stage="webgl"] canvas').waitFor({ timeout: 15000 }).then(() => true).catch(() => false));
    });
    // D-043 step 3: the kid pages and their navigation; Home continues the journey opened last above (ratio).
    await go('home-continue', '/', async () => (await p.getByRole('link', { name: /^Continue/ }).getAttribute('href')) === '/t/ratio-algebra/learn/ratio');
    await go('topics', '/topics', async () => (await p.getByRole('list', { name: 'Topics' }).getByRole('listitem').count()) >= 20);
    await go('practice-hub', '/practice', async () => (await p.getByRole('heading', { name: 'Quick practice' }).count()) > 0);
    await go('tests', '/tests', async () => (await p.getByRole('heading', { name: 'Big challenges' }).count()) > 0);
    await go('progress', '/progress', async () => (await p.locator('[aria-label^="Mastery:"]').count()) > 0 && (await p.getByRole('navigation', { name: 'Main' }).first().getByRole('link', { name: 'Progress', exact: true }).getAttribute('aria-current')) === 'page');
    // D-050: the four new journeys: the page, the film's length, and the journey bar.
    for (const [path, secs] of [['/t/decimals/learn/compare-decimals', 106], ['/t/percentages/learn/percent-of-amount', 97.5], ['/t/fractions-2/learn/multiply-fractions', 94.5], ['/t/multiply-divide/learn/remainders', 97]]) {
      await go(path.split('/').pop(), path, async () => {
        await p.getByRole('tab', { name: /^Watch/ }).click();
        const film = await p.waitForFunction(() => { const v = document.querySelector('video'); return v && v.readyState >= 1 && Math.round(v.duration * 2) / 2; }, null, { timeout: 15000 }).then((h) => h.jsonValue()).catch(() => 0);
        return film === secs && (await p.getByRole('list', { name: 'Your learning journey' }).count()) > 0;
      });
    }
    await go('mock', '/t/mock-exams/mock', async () => { await p.getByRole('button', { name: /^ISEB Common Pre-Tests/ }).click(); return (await p.getByText(/40 minutes/).count()) > 0 && (await p.getByRole('button', { name: 'Answer sheet (A to E)' }).count()) > 0; });
  }
  require('fs').writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 1));
  console.log(JSON.stringify(report));
  await b.close();
})();
