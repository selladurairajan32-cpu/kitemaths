// D-050: browser check of the first batch of hard-concept journeys on a production build.
// Usage: node docs/product/verification/journeys-batch1.cjs <out-dir> <port>
// For each concept at 390 and 1280px: Learn loads with the film (its length read from the video), Step through draws
// its picture, Try it shows its first activity; the Practise stage shows the first question with a "Check answer"
// button; the Check stage starts the recheck. axe-core on the whole page at each stage, console errors, sideways scroll.
// Developer evidence, not independent QA.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const out = process.argv[2] || 'batch1-out';
const base = `http://localhost:${process.argv[3] || '3123'}`;
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const KEY = 'kite-maths:v2';
const CONCEPTS = [
  ['decimals', 'compare-decimals', 106],
  ['percentages', 'percent-of-amount', 97.5],
  ['fractions-2', 'multiply-fractions', 94.5],
  ['multiply-divide', 'remainders', 97],
];

(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch();
  const report = { errors: [], axe: {}, overflow: {}, checks: {} };
  for (const [vw, h] of [[390, 844], [1280, 900]]) {
    const ctx = await browser.newContext({ viewport: { width: vw, height: h } });
    const p = await ctx.newPage();
    p.on('console', (m) => m.type() === 'error' && report.errors.push(`${vw}: ${m.text()}`));
    p.on('pageerror', (e) => report.errors.push(`${vw}: ${e.message}`));
    const axe = async (key) => {
      await p.addScriptTag({ content: AXE });
      report.axe[key] = await p.evaluate(async () => (await window.axe.run(document)).violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.length}`));
      report.overflow[key] = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    };
    for (const [topic, concept, seconds] of CONCEPTS) {
      const url = `${base}/t/${topic}/learn/${concept}`;
      const c = (report.checks[`${vw}-${concept}`] = {});
      await p.goto(url, { waitUntil: 'networkidle' });
      await p.waitForSelector('main h1');
      c.title = await p.locator('main h1').innerText();
      await p.getByRole('tab', { name: /^Watch/ }).click();
      c.film = await p.waitForFunction(() => { const v = document.querySelector('video'); return v && v.readyState >= 1 && Math.round(v.duration * 2) / 2; }, null, { timeout: 20000 }).then((x) => x.jsonValue()).catch(() => 0);
      c.filmOk = Math.abs(c.film - seconds) <= 0.5;
      await axe(`${vw}-${concept}-watch`);
      await p.screenshot({ path: path.join(out, `${vw}-${concept}-watch.png`), fullPage: vw < 500 });
      await p.getByRole('tab', { name: /^Step through/ }).click();
      await p.waitForTimeout(900);
      c.stepDraws = (await p.locator('#mode-panel svg[viewBox="0 0 720 400"]').count()) > 0;
      await axe(`${vw}-${concept}-step`);
      await p.screenshot({ path: path.join(out, `${vw}-${concept}-step.png`) });
      await p.getByRole('tab', { name: /^Try it/ }).click();
      await p.waitForTimeout(500);
      c.tryHeading = await p.locator('#mode-panel h2').first().innerText().catch(() => '');
      await axe(`${vw}-${concept}-try`);
      await p.screenshot({ path: path.join(out, `${vw}-${concept}-try.png`) });
      // Practise: open the stage directly through the saved journey.
      for (const [stage, name] of [[1, 'practise'], [3, 'check']]) {
        await p.evaluate(([k, key, stage]) => { const s = JSON.parse(localStorage.getItem(k)); s.journeys[key] = { ...s.journeys[key], stage, reached: stage }; localStorage.setItem(k, JSON.stringify(s)); }, [KEY, `${topic}/${concept}`, stage]);
        await p.reload({ waitUntil: 'networkidle' });
        await p.waitForSelector('main h1');
        await p.waitForTimeout(800);
        if (name === 'practise') c.checkAnswer = (await p.getByRole('button', { name: /^Check answer/ }).count()) > 0;
        else {
          await p.getByRole('button', { name: /Start the check/ }).click();
          // Let the first question finish fading in: axe on a half-transparent fade reports false contrast failures.
          await p.waitForTimeout(1200);
          c.checkStarted = (await p.getByText(/^Check: /).count()) > 0;
        }
        await axe(`${vw}-${concept}-${name}`);
        await p.screenshot({ path: path.join(out, `${vw}-${concept}-${name}.png`) });
      }
    }
    await ctx.close();
  }
  await browser.close();
  fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 2));
  const axeN = Object.values(report.axe).flat().length;
  const wide = Object.entries(report.overflow).filter(([, v]) => v > 0).map(([k]) => k);
  console.log(`errors ${report.errors.length}, axe violations ${axeN}, sideways scroll ${wide.length}`);
  if (axeN) console.log(JSON.stringify(Object.fromEntries(Object.entries(report.axe).filter(([, v]) => v.length)), null, 1));
  if (wide.length) console.log(wide);
  if (report.errors.length) console.log(report.errors.slice(0, 8));
  console.log(JSON.stringify(report.checks, null, 1));
})();
