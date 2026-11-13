// D-060: the lesson canvas pilot (adding fractions with different denominators) from start to finish, at 1280 and 390px.
// Learn is walked as designed; Practise, Apply and the check are answered badly on purpose, so the path of a child who
// struggles is exercised: hints, the misconception follow-up, the answer shown, then the summary.
// Usage: node docs/product/verification/lesson-canvas.cjs <out-dir> [port]   (a production build serving on the port)
const { chromium } = require('playwright');
const OUT = process.argv[2] || 'docs/product/verification/results/d060-canvas', B = `http://localhost:${process.argv[3] || 3123}`;
(async () => {
  const b = await chromium.launch();
  let failed = false;
  for (const [vw, h] of [[1280, 900], [390, 844]]) {
    const ctx = await b.newContext({ viewport: { width: vw, height: h }, deviceScaleFactor: 2 });
    const p = await ctx.newPage();
    const errs = []; p.on('console', (m) => m.type() === 'error' && errs.push(m.text())); p.on('pageerror', (e) => errs.push(String(e)));
    const shot = async (n) => { await p.waitForTimeout(1300); await p.screenshot({ path: `${OUT}/${vw}-${n}.png` }); };
    const click = (name) => p.getByRole('button', { name }).first().click();
    const cut = async (who, n) => { for (let i = 0; i < n; i++) await click(`Cut ${who} bar into smaller pieces`); };
    const sideways = async () => p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    await p.goto(B + '/t/fractions-2/learn/add-different', { waitUntil: 'networkidle' });
    const nav = await p.getByRole('combobox', { name: 'Choose a lesson' }).count();
    await shot('1-discover');
    await p.getByRole('group', { name: /Have a guess/ }).getByRole('button').first().click(); await shot('1-discover-tested');
    await click(/Find out why/); await shot('2-explore');
    await cut("Sam's", 1); await shot('2-explore-mismatch');
    await cut("Sam's", 2); await cut("Zara's", 2); await shot('2-explore-match');
    await click(/Join them/); await shot('2-explore-joined');
    await click(/Try another pair/); await cut("Ben's", 4); await cut("Mia's", 1); await click(/Join them/); await shot('2-explore-second');
    await click(/See why it works/); await shot('3-understand-picture');
    await click(/^Next/); await p.getByRole('tab', { name: 'Story' }).click(); await shot('3-understand-story');
    await click(/^Next/); await p.getByRole('tab', { name: 'Numbers' }).click();
    await p.getByRole('button', { name: '2', exact: true }).click(); await shot('3-understand-your-turn-wrong');
    await p.getByRole('button', { name: '6', exact: true }).click(); await click(/^Next/); await shot('3-understand-numbers-end');
    await p.getByRole('tab', { name: 'Picture' }).click(); await shot('3-understand-picture-end');
    await click(/Start practising/); await shot('4-practise');
    // Answer badly until the question is finished, whatever it takes: wrong answer, follow-up, back, wrong again.
    const struggle = async (label) => {
      for (let i = 0; i < 40; i++) {
        if (await p.getByRole('button', { name: /^(Next question|Finish)/ }).count()) { await click(/^(Next question|Finish)/); return; }
        for (const name of [/Try a quick question/, /Try the question again/, /Back to the question/]) if (await p.getByRole('button', { name }).count()) { if (label) { await shot(label); label = null; } await click(name); }
        const box = p.getByRole('textbox');
        if (await box.count()) await box.first().fill(String(90 + i)); else { const r = p.locator('input[type=radio]:not(:disabled)'); const n = await r.count(); if (n) await r.nth(n - 1 - (i % 2)).evaluate((el) => el.click()); }
        const check = p.getByRole('button', { name: /^Check/ });
        if (await check.count() && await check.first().isEnabled()) await check.first().click();
        await p.waitForTimeout(250);
      }
      await p.screenshot({ path: `${OUT}/${vw}-stuck.png`, fullPage: true });
      throw new Error('a question never finished: ' + (await p.getByRole('button').allTextContents()).join(' | '));
    };
    await struggle('4-practise-misconception');
    await shot('4-practise-second');
    for (let i = 1; i < 7; i++) await struggle();
    await shot('4-practise-done');
    await click(/Real-life problems/); await shot('5-apply');
    for (let i = 0; i < 3; i++) await struggle();
    await click(/^Prove it$/); await shot('6-prove');
    await click(/Start the check/); await shot('6-prove-question');
    for (let i = 0; i < 12; i++) {
      if (await p.getByRole('button', { name: /See what you/ }).count()) break;
      const box = p.getByRole('textbox');
      if (await box.count()) await box.first().fill('97'); else if (await p.getByRole('radio').count()) await p.getByRole('radio').first().evaluate((el) => el.click());
      for (const name of [/^Finish!/, /^Review/, /^Next/]) { const btn = p.getByRole('button', { name }); if (await btn.count() && await btn.first().isEnabled()) { await btn.first().click(); break; } }
      await p.waitForTimeout(300);
    }
    await shot('6-prove-done');
    await click(/See what you/); await shot('7-summary');
    const summary = await p.getByRole('heading', { name: 'What your answers show' }).count();
    const ok = nav === 1 && summary === 1 && errs.length === 0 && !(await sideways());
    failed ||= !ok;
    console.log(vw, ok ? 'PASS' : 'FAIL', { studioHeader: nav, summary, sideways: await sideways(), errors: errs.slice(0, 5) });
    await ctx.close();
  }
  await b.close();
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
