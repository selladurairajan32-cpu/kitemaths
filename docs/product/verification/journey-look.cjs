// D-046: screenshots of the restyled topic journey (each stage, both concepts, Home) at 1280 and 390px, for the Product
// Owner to look at. Usage: node docs/product/verification/journey-look.cjs <out-dir> (a production build on port 3123).
const { chromium } = require('playwright');
const B = 'http://localhost:3123', K = 'kite-maths:v2', OUT = process.argv[2] || '/tmp/claude-0/shots';
(async () => {
  const b = await chromium.launch();
  for (const [vw, h] of [[1280, 900], [390, 844]]) {
    const ctx = await b.newContext({ viewport: { width: vw, height: h } });
    const p = await ctx.newPage();
    const errs = []; p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
    const set = async (stage, reached) => p.evaluate(([k, stage, reached]) => { const s = JSON.parse(localStorage.getItem(k)); s.journeys['fractions-2/add-different'] = { ...s.journeys['fractions-2/add-different'], stage, reached }; localStorage.setItem(k, JSON.stringify(s)); }, [K, stage, reached]);
    await p.goto(B + '/t/fractions-2/learn/add-different', { waitUntil: 'networkidle' }); await p.waitForTimeout(800);
    await p.screenshot({ path: `${OUT}/${vw}-learn-watch.png`, fullPage: true });
    await p.getByRole('tab', { name: /^Step through/ }).click(); await p.waitForTimeout(900);
    await p.screenshot({ path: `${OUT}/${vw}-learn-step.png`, fullPage: vw < 500 });
    await p.getByRole('tab', { name: /^Try it/ }).click(); await p.waitForTimeout(500);
    await p.screenshot({ path: `${OUT}/${vw}-learn-try.png` });
    for (const [name, st] of [['practise', 1], ['check', 3], ['complete', 4]]) {
      await set(st, st); await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(800);
      await p.screenshot({ path: `${OUT}/${vw}-${name}.png`, fullPage: vw < 500 });
    }
    await p.goto(B + '/t/ratio-algebra/learn/ratio', { waitUntil: 'networkidle' }); await p.waitForTimeout(800);
    await p.screenshot({ path: `${OUT}/${vw}-ratio.png` });
    await p.goto(B + '/', { waitUntil: 'networkidle' }); await p.waitForTimeout(500);
    await p.screenshot({ path: `${OUT}/${vw}-home.png` });
    console.log(vw, 'errors', errs.length, errs.slice(0, 3));
    await ctx.close();
  }
  await b.close();
})();
