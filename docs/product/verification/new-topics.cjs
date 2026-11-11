// Usage: node docs/product/verification/new-topics.cjs <outDir> [port]
// D-037 Phase C: opens the first step of every new lesson and the practice mock (ISEB profile, answer sheet, two
// timed sections, then two-part questions) on a running production build, at 390px and 1280px. It captures each
// screen, runs axe-core on <main>, and records console errors and horizontal overflow. Developer evidence, not QA.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const OUT = process.argv[2]; const BASE = 'http://localhost:' + (process.argv[3] || '3123');
fs.mkdirSync(OUT, { recursive: true });
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const LESSONS = [
  ['place-value', 'roman'], ['multiply-divide', 'long-division'], ['multiply-divide', 'primes'], ['multiply-divide', 'squares-cubes'], ['multiply-divide', 'order'],
  ['fractions-2', 'times-fractions'], ['fractions-2', 'divide-fractions'], ['measures', 'convert'], ['measures', 'miles'], ['measures', 'volume'], ['measures', 'speed'],
  ['shapes-angles', 'symmetry'], ['shapes-angles', 'nets'], ['shapes-angles', 'circles'], ['shapes-angles', 'estimate'], ['charts-data', 'pie'], ['charts-data', 'averages'], ['charts-data', 'probability'],
];
(async () => {
  const b = await chromium.launch();
  const report = { errors: [], axe: {}, overflow: {}, shots: 0 };
  for (const [vw, w, h] of [['phone', 390, 844], ['desk', 1280, 900]]) {
    const p = await (await b.newContext({ viewport: { width: w, height: h } })).newPage();
    p.on('pageerror', (e) => report.errors.push(`${vw} pageerror ${e.message}`));
    p.on('console', (m) => m.type() === 'error' && report.errors.push(`${vw}: ${m.text()}`));
    const check = async (name) => {
      await p.addScriptTag({ content: AXE });
      report.axe[`${vw}-${name}`] = await p.evaluate(async () => (await window.axe.run(document.querySelector('main'))).violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.length}`));
      report.overflow[`${vw}-${name}`] = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      await p.screenshot({ path: path.join(OUT, `${vw}-${name}.png`), fullPage: true }); report.shots++;
    };
    for (const [t, l] of LESSONS) {
      await p.goto(`${BASE}/t/${t}/lesson/${l}/1`, { waitUntil: 'networkidle' });
      await check(`${t}-${l}`);
    }
    await p.goto(`${BASE}/t/mock-exams/mock`, { waitUntil: 'networkidle' });
    await p.getByRole('button', { name: /^ISEB Common Pre-Tests/ }).click();
    await p.getByRole('button', { name: 'Answer sheet (A to E)' }).click();
    await p.getByRole('button', { name: '2 sections' }).click();
    await check('mock-setup-iseb');
    await p.getByRole('button', { name: /Start the mock/ }).click();
    await check('mock-answer-sheet');
    await p.goto(`${BASE}/t/mock-exams/mock`, { waitUntil: 'networkidle' });
    await p.getByRole('button', { name: 'Two-part questions' }).click();
    await p.getByRole('button', { name: /Start the mock/ }).click();
    await check('mock-two-part');
  }
  fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 1));
  const bad = Object.entries(report.axe).filter(([, v]) => v.length);
  const wide = Object.entries(report.overflow).filter(([, v]) => v > 0);
  console.log(`shots ${report.shots} errors ${report.errors.length} axe-violations ${bad.length} overflow ${wide.length}`, JSON.stringify({ bad, wide, errors: report.errors.slice(0, 5) }));
  await b.close();
})();
