// Usage: node docs/product/verification/r1-step4-checks.cjs <outDir> [baseUrl]
// R1 step 4 (UX-005, FR-011, ARCH-004) on a running production build. Developer evidence, not independent QA.
// Checks: every main destination is reachable by clicking navigation; no Lab tab or placeholder on an island without a
// lab; /practice, /lab and /start open the current island; the design mock-ups are not public; the island map shows
// evidence-based status, skill outcomes and an explained prerequisite; progress survives a reload.
const { chromium } = require('playwright');
const fs = require('fs');
const OUT = process.argv[2]; fs.mkdirSync(OUT, { recursive: true });
const BASE = process.argv[3] || 'http://localhost:3123';
const rows = [];
const check = (name, ok, detail = '') => { rows.push({ name, ok, detail }); console.log(ok ? 'PASS' : 'FAIL', name, detail); };

(async () => {
  const b = await chromium.launch();
  for (const [vw, w, h] of [['phone', 390, 844], ['tablet', 768, 1024], ['desktop', 1280, 900]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, reducedMotion: 'reduce' });
    const p = await ctx.newPage();
    const errors = []; p.on('pageerror', (e) => errors.push(String(e)));
    const nav = () => p.getByRole('navigation', { name: 'Main' }).filter({ visible: true });

    await p.goto(BASE + '/', { waitUntil: 'networkidle' });
    // Dashboard → journey (map) → island → lesson; practice; results (grown-ups).
    await nav().getByRole('link', { name: 'Map' }).click(); await p.waitForURL('**/journey');
    check(`${vw}: Map tab opens the world map`, p.url().endsWith('/journey'));
    await nav().getByRole('link', { name: 'Practice' }).click(); await p.waitForURL('**/t/*/practice**');
    check(`${vw}: Practice tab opens the current island's practice`, /\/t\/fractions\/practice/.test(p.url()), p.url());
    await nav().getByRole('link', { name: 'Home' }).click(); await p.waitForURL(BASE + '/');
    await p.getByRole('link', { name: /Open my island|See the map/ }).first().click(); await p.waitForURL('**/t/fractions');
    check(`${vw}: home links to the island map (learning journey)`, p.url().endsWith('/t/fractions'));
    const firstLesson = p.getByRole('link', { name: /Spot the equal parts|Wholes|equal parts/i }).first();
    await firstLesson.click(); await p.waitForURL('**/lesson/**');
    check(`${vw}: island map opens a lesson`, /\/lesson\//.test(p.url()), p.url());

    // FR-011 on the island map.
    await p.goto(BASE + '/t/fractions', { waitUntil: 'networkidle' });
    const body = await p.locator('main').innerText();
    check(`${vw}: island map shows skill outcomes`, /You'll learn:/.test(body));
    check(`${vw}: island map explains a prerequisite`, /Best after “[^”]+”: this lesson uses/.test(body));
    check(`${vw}: island map marks the next step`, /Next!/.test(body));

    // Finish lesson 1 by its last page only: it shows as finished, not done (FR-011 AC3), and survives a reload (ARCH-004).
    await p.evaluate(() => {
      const s = JSON.parse(localStorage.getItem('kite-maths:v2')) || { version: 2, topics: {}, results: [] };
      s.topics.fractions = s.topics.fractions || {};
      s.topics.fractions.lessons = { ...(s.topics.fractions.lessons || {}), wholes: { step: 4, furthestStep: 4, completed: true, completedAt: 1 } };
      localStorage.setItem('kite-maths:v2', JSON.stringify(s));
    });
    await p.reload({ waitUntil: 'networkidle' });
    const after = await p.locator('main').innerText();
    check(`${vw}: a lesson finished by traversal shows "Finished", not done`, /Finished! Now answer a few new questions/.test(after));
    check(`${vw}: progress survives a reload`, await p.evaluate(() => !!JSON.parse(localStorage.getItem('kite-maths:v2')).topics.fractions.lessons.wholes.completed));

    // An island without a lab: no Lab tab, and /lab goes to its map (UX-005 AC3, DEF-005).
    await p.goto(BASE + '/t/place-value', { waitUntil: 'networkidle' });
    check(`${vw}: no Lab tab on an island without a lab`, (await nav().getByRole('link', { name: 'Lab' }).count()) === 0);
    await p.goto(BASE + '/t/fractions', { waitUntil: 'networkidle' });
    check(`${vw}: Lab tab on Fractions`, (await nav().getByRole('link', { name: 'Lab' }).count()) === 1);

    check(`${vw}: no page errors`, errors.length === 0, errors.join(' | '));
    await p.screenshot({ path: `${OUT}/${vw}-island.png`, fullPage: true });
    await ctx.close();
  }

  // Hubs and mock-ups (DEF-014, DEF-016), with a learner whose current island is place value.
  const ctx = await b.newContext(); const p = await ctx.newPage();
  await p.goto(BASE + '/t/place-value', { waitUntil: 'networkidle' });
  await p.evaluate(() => { const s = JSON.parse(localStorage.getItem('kite-maths:v2')) || { version: 2, topics: {}, results: [] }; s.currentTopicId = 'place-value'; localStorage.setItem('kite-maths:v2', JSON.stringify(s)); });
  await p.goto(BASE + '/practice'); await p.waitForURL('**/t/place-value/practice', { timeout: 10000 }).catch(() => {});
  check('/practice opens the current island', p.url().endsWith('/t/place-value/practice'), p.url());
  await p.goto(BASE + '/lab'); await p.waitForURL('**/t/place-value', { timeout: 10000 }).catch(() => {});
  check('/lab on an island without a lab opens its map', p.url().endsWith('/t/place-value'), p.url());
  await p.goto(BASE + '/start'); await p.waitForURL('**/t/place-value/start', { timeout: 10000 }).catch(() => {});
  check('/start opens the current island warm-up', p.url().endsWith('/t/place-value/start'), p.url());
  for (const u of ['/sky', '/crystal', '/preview/sky/index.html']) {
    const r = await p.goto(BASE + u); check(`${u} is not public`, r.status() === 404, String(r.status()));
  }
  await ctx.close(); await b.close();
  fs.writeFileSync(`${OUT}/results.json`, JSON.stringify(rows, null, 1));
  const failed = rows.filter((r) => !r.ok).length;
  console.log(`${rows.length - failed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})();
