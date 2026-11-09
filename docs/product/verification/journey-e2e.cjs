// Usage: node docs/product/verification/journey-e2e.cjs <outDir> [baseUrl]
// QA-003: an automated end-to-end journey on a running production build, as a new learner on a phone:
// home (dashboard) → island → a lesson with a mistake and its recovery → practice → the mastery check → results.
// Also checks that every link on the main pages works and that no placeholder text appears (QA-003 AC2, UX-005 AC3).
// Developer evidence: not run in CI (it needs a running build).
const { chromium } = require('playwright');
const fs = require('fs');
const OUT = process.argv[2]; fs.mkdirSync(OUT, { recursive: true });
const BASE = process.argv[3] || 'http://localhost:3123';
const rows = [];
const check = (name, ok, detail = '') => { rows.push({ name, ok: !!ok, detail }); console.log(ok ? 'PASS' : 'FAIL', name, detail); };
const saved = (p) => p.evaluate(() => JSON.parse(localStorage.getItem('kite-maths:v2') || 'null'));

/** Answers whatever question is on screen: picks the first choice, or fills number boxes, or shades parts. */
async function answerAny(p) {
  const radios = p.locator('main input[type=radio]:not(:disabled), main [role=radio]');
  if (await radios.count()) { const ok = await radios.first().check({ force: true, timeout: 3000 }).then(() => true).catch(() => false); if (ok) return; }
  const boxes = p.locator('main input[inputmode=numeric]:visible, main input[type=number]:visible, main input[type=text]:visible');
  const n = await boxes.count();
  let filled = 0;
  for (let i = 0; i < n; i++) if (await boxes.nth(i).isEditable().catch(() => false)) { await boxes.nth(i).fill(String(i + 1), { timeout: 3000 }).catch(() => {}); filled++; }
  if (filled) return;
  const parts = p.locator('main [role=checkbox]:visible');
  if (await parts.count()) { await parts.first().click({ timeout: 3000 }).catch(() => {}); return; }
  const opts = p.locator('main button[aria-pressed]:visible');
  if (await opts.count()) { await opts.first().click({ timeout: 3000 }).catch(() => {}); }
}

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const p = await ctx.newPage();
  const errors = []; p.on('pageerror', (e) => errors.push(String(e)));

  // 1. Dashboard.
  await p.goto(BASE + '/', { waitUntil: 'networkidle' });
  check('dashboard loads with a next step', await p.getByRole('heading', { level: 1 }).count());
  await p.getByRole('link', { name: /Play the warm-up/ }).click();
  await p.waitForURL('**/start');
  check('warm-up opens from the dashboard', p.url().endsWith('/t/fractions/start'));

  // 2. Island → lesson "Adding and subtracting fractions", with a mistake and recovery at the first check.
  await p.goto(BASE + '/t/fractions', { waitUntil: 'networkidle' });
  await p.getByRole('link', { name: 'Adding and subtracting fractions', exact: true }).first().click();
  await p.waitForURL('**/lesson/adding**');
  for (let guard = 0; guard < 40; guard++) {
    if (await p.getByRole('radio', { name: '5 over 12' }).count()) break;
    const blank = p.getByRole('spinbutton', { name: 'Sixths left' }).or(p.getByLabel('Sixths left'));
    if (await blank.count() && await blank.first().isEditable()) { await blank.first().fill('3'); await p.getByRole('button', { name: 'Check', exact: true }).first().click(); await p.waitForTimeout(150); continue; }
    const nextStep = p.getByRole('button', { name: /^Next step/ });
    if (await nextStep.count() && await nextStep.first().isEnabled()) { await nextStep.first().click(); await p.waitForTimeout(150); continue; }
    const cont = p.getByRole('button', { name: /^Continue/ });
    if (await cont.count() && await cont.first().isEnabled()) { await cont.first().click(); await p.waitForTimeout(200); continue; }
    break;
  }
  // First check: choose 5/12 (adding the denominators) on purpose.
  const wrong = p.getByRole('radio', { name: '5 over 12' });
  if (await wrong.count()) {
    await wrong.check({ force: true }); await p.getByRole('button', { name: /^Check/ }).click();
    check('a tagged mistake gets a hedged diagnosis, not the answer', await p.getByText(/might have been added/).count() && !(await p.getByText(/The answer is/).count()));
    await p.getByRole('button', { name: /Try a quick question/ }).click();
    await p.locator('label', { hasText: '5, so the answer is in fifths' }).locator('input').check({ force: true });
    const fuCheck = p.getByRole('button', { name: /^Check/ }).last(); if (await fuCheck.count()) await fuCheck.click();
    await p.getByRole('button', { name: /Back to the question/ }).click();
    await p.getByRole('radio', { name: '5 over 6' }).check({ force: true }); await p.getByRole('button', { name: /^Check/ }).click();
    check('the child recovers and answers the original question', await p.getByText(/That's it. You worked it out/).count());
    // Finish the episode so it is recorded.
    await p.getByRole('button', { name: /^Continue/ }).first().click();
    await p.waitForTimeout(300);
  } else check('lesson reached its first check', false, 'radio "5 over 12" not found');
  await p.screenshot({ path: `${OUT}/journey-lesson.png` });

  // 3. Practice: a full focused session on the same skill.
  await p.goto(BASE + '/t/fractions/practice/add-same', { waitUntil: 'networkidle' });
  for (let i = 0; i < 5 && !(await p.getByRole('button', { name: /^Check/ }).count()); i++) {
    await p.getByRole('button', { name: /^Play/ }).first().click({ timeout: 5000 }).catch(() => {});
    await p.waitForTimeout(600);
  }
  let answered = 0;
  const trace = [];
  for (let guard = 0; guard < 120; guard++) {
    if (await p.getByText(/Superstar session|Great effort/).count()) break;
    const next = p.getByRole('button', { name: /^(Next|Finish!)/ });
    trace.push((await p.locator('main').innerText()).slice(0, 60).replace(/\s+/g, ' '));
    if (await next.count()) { if (await next.first().isEnabled()) { await next.first().click({ timeout: 3000 }).catch(() => {}); answered++; } await p.waitForTimeout(250); continue; }
    const tryQ = p.getByRole('button', { name: /Try a quick question|Back to the question|Try the question again/ });
    if (await tryQ.count()) { await tryQ.first().click({ timeout: 3000 }).catch(() => {}); await p.waitForTimeout(150); continue; }
    await answerAny(p);
    const chk = p.getByRole('button', { name: /^Check/ });
    if (await chk.count() && await chk.first().isEnabled()) await chk.first().click({ timeout: 3000 }).catch(() => {});
    await p.waitForTimeout(120);
  }
  await p.getByText(/Superstar session|Great effort/).first().waitFor({ timeout: 8000 }).catch(() => {});
  await p.screenshot({ path: `${OUT}/journey-practice.png` });
  const practiceDone = await p.getByText(/Superstar session|Great effort/).count();
  check('a practice session can be completed', practiceDone, practiceDone ? `${answered} questions` : trace.slice(-8).join(' || '));

  // 4. The mastery check, start to finish.
  await p.goto(BASE + '/t/fractions/check', { waitUntil: 'networkidle' });
  await p.getByRole('button', { name: /I'm ready|Try the challenge again/ }).click();
  for (let guard = 0; guard < 60; guard++) {
    if (await p.getByRole('heading', { name: 'Ready to finish?' }).count()) break;
    await answerAny(p);
    await p.getByRole('button', { name: /^(Next|Skip for now|Review & finish)/ }).first().click({ timeout: 5000 }).catch(() => {});
    await p.waitForTimeout(120);
  }
  await p.getByRole('button', { name: /^Finish!/ }).click();
  await p.waitForTimeout(500);
  const s = await saved(p);
  const contexts = new Set((s?.results || []).map((r) => r.context));
  check('the journey recorded lesson, follow-up, practice and assessment answers', ['lesson', 'followup', 'practice', 'assessment'].every((c) => contexts.has(c)), [...contexts].join(', '));
  check('every recorded answer has a response and the attempt fields', (s?.results || []).every((r) => 'attempts' in r && 'hintsUsed' in r && 'firstTry' in r));

  // 5. Results, behind the grown-ups gate.
  await p.goto(BASE + '/results', { waitUntil: 'networkidle' });
  const gate = p.locator('input[aria-label*="times"]');
  if (await gate.count()) { const m = /(\d+) times (\d+)/.exec(await gate.getAttribute('aria-label')); await gate.fill(String(+m[1] * +m[2])); await p.getByRole('button', { name: 'Continue' }).click(); }
  check('results show strengths and next steps', await p.getByRole('heading', { name: /Next steps/ }).count());
  await p.screenshot({ path: `${OUT}/journey-results.png` });

  // 6. Links on the main pages all work, and no placeholder text (QA-003 AC2, UX-005 AC3).
  const pages = ['/', '/journey', '/t/fractions', '/t/fractions/practice', '/t/fractions/lab', '/t/fractions/check', '/badges', '/t/place-value'];
  const hrefs = new Set();
  for (const u of pages) {
    await p.goto(BASE + u, { waitUntil: 'networkidle' });
    const text = await p.locator('body').innerText();
    check(`${u}: no placeholder text`, !/coming soon|doesn.t have a lab yet|placeholder|lorem ipsum|TODO/i.test(text));
    for (const h of await p.locator('a[href^="/"]').evaluateAll((as) => as.map((a) => a.getAttribute('href')))) hrefs.add(h.split('#')[0]);
  }
  let dead = [];
  for (const h of hrefs) { const r = await p.request.get(BASE + h); if (r.status() >= 400) dead.push(`${h} ${r.status()}`); }
  check(`all ${hrefs.size} internal links on the main pages respond`, dead.length === 0, dead.join(', '));
  check('no page errors during the journey', errors.length === 0, errors.slice(0, 3).join(' | '));

  await b.close();
  fs.writeFileSync(`${OUT}/journey-results.json`, JSON.stringify(rows, null, 1));
  const failed = rows.filter((r) => !r.ok).length;
  console.log(`${rows.length - failed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})();
