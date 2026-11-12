// D-043 step 3: browser check of the kid pages (Home, Topics, Practice, Tests, Progress) and their navigation, on a
// production build. Usage: node docs/product/verification/kid-pages.cjs <out-dir> <port>
// For a new learner and for a learner with a journey in progress: each page at 320, 390, 768 and 1280px; axe-core on the
// whole page (header and both navigations included); console errors; sideways scroll; the navigation by pointer.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const out = process.argv[2] || 'kid-pages-out';
const port = process.argv[3] || '3123';
const base = `http://localhost:${port}`;
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const KEY = 'kite-maths:v2';
const PAGES = [['home', '/'], ['topics', '/topics'], ['practice', '/practice'], ['tests', '/tests'], ['progress', '/progress']];

(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch();
  const report = { errors: [], axe: {}, overflow: {}, checks: {}, shots: 0 };

  // A learner with answers in Fractions and the fractions journey open at Apply.
  const seed = async (ctx) => {
    const p = await ctx.newPage();
    await p.goto(`${base}/t/fractions-2/learn/add-different`, { waitUntil: 'networkidle' });
    await p.waitForFunction((k) => !!localStorage.getItem(k) && !!JSON.parse(localStorage.getItem(k)).journeys, KEY);
    await p.evaluate((k) => {
      const s = JSON.parse(localStorage.getItem(k));
      const now = Date.now();
      const a = (skill, correct, i) => ({ questionId: `seed:${skill}:${i}`, skill, context: 'practice', correct, firstTry: correct, attempts: 1, hintsUsed: 0, misconceptions: [], at: now - 60000 + i });
      s.results = [a('fractions.compare', true, 1), a('fractions.compare', true, 2), a('fractions.compare', true, 3), a('fractions.equivalent', false, 4)];
      const j = s.journeys['fractions-2/add-different'];
      s.journeys['fractions-2/add-different'] = { ...j, stage: 2, reached: 2 };
      s.profile = { ...s.profile, name: 'Sam', year: 5 };
      localStorage.setItem(k, JSON.stringify(s));
    }, KEY);
    await p.close();
  };

  for (const learner of ['new', 'seeded']) {
    for (const vw of [320, 390, 768, 1280]) {
      const ctx = await browser.newContext({ viewport: { width: vw, height: 900 } });
      if (learner === 'seeded') await seed(ctx);
      const p = await ctx.newPage();
      p.on('console', (m) => m.type() === 'error' && report.errors.push(`${learner} ${vw}: ${m.text()}`));
      p.on('pageerror', (e) => report.errors.push(`${learner} ${vw}: ${e.message}`));
      for (const [name, url] of PAGES) {
        await p.goto(base + url, { waitUntil: 'networkidle' });
        await p.waitForSelector('main h1');
        const key = `${learner}-${vw}-${name}`;
        report.overflow[key] = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        await p.addScriptTag({ content: AXE });
        report.axe[key] = await p.evaluate(async () => (await window.axe.run(document)).violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.length}`));
        if (vw === 390 || vw === 1280) {
          await p.screenshot({ path: path.join(out, `${learner}-${vw}-${name}.png`), fullPage: true });
          report.shots++;
        }
      }
      // The navigation by pointer: each tab opens its page and is marked current.
      const nav = p.locator(vw >= 1024 ? 'header nav[aria-label="Main"]' : 'body > nav[aria-label="Main"]');
      const visited = [];
      const HREF = { Topics: '/topics', Practice: '/practice', Tests: '/tests', Progress: '/progress', Home: '/' };
      for (const label of ['Topics', 'Practice', 'Tests', 'Progress', 'Home']) {
        await nav.getByRole('link', { name: label, exact: true }).click();
        await p.waitForURL((u) => u.pathname === HREF[label]);
        await p.waitForSelector('main h1');
        const current = await nav.locator('[aria-current="page"]').innerText();
        visited.push(`${label} → ${new URL(p.url()).pathname} (current: ${current.trim()})`);
      }
      report.checks[`${learner}-${vw}-nav`] = visited;
      if (learner === 'seeded') {
        await p.goto(base + '/', { waitUntil: 'networkidle' });
        report.checks[`${learner}-${vw}-continue`] = {
          h1: await p.locator('main h1').innerText(),
          href: await p.getByRole('link', { name: /^Continue/ }).getAttribute('href'),
        };
        await p.goto(base + '/progress', { waitUntil: 'networkidle' });
        report.checks[`${learner}-${vw}-ring`] = await p.locator('[aria-label^="Mastery:"]').getAttribute('aria-label');
      }
      await ctx.close();
    }
  }
  await browser.close();
  fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 2));
  const axeCount = Object.values(report.axe).flat().length;
  const wide = Object.entries(report.overflow).filter(([, v]) => v > 0);
  console.log(`errors ${report.errors.length}, axe violations ${axeCount}, sideways scroll on ${wide.length} pages, shots ${report.shots}`);
  if (axeCount) console.log(JSON.stringify(Object.fromEntries(Object.entries(report.axe).filter(([, v]) => v.length)), null, 1));
  if (wide.length) console.log(wide);
  if (report.errors.length) console.log(report.errors.slice(0, 10));
  console.log(JSON.stringify(report.checks, null, 1).slice(0, 2500));
})();
