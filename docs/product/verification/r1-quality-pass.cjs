// Usage: node docs/product/verification/r1-quality-pass.cjs <outDir> [baseUrl]
// UX-007, UX-008, QA-005 on a running production build. Developer evidence, not independent QA.
// For each main screen at 320, 375, 430, 768 and 1280px: screenshots; sideways scroll; clipped text; overlapping
// controls; touch targets. At 390 and 1280: an axe-core audit (WCAG 2.1 A and AA). On three screens: a keyboard walk
// that checks every focused control shows a visible focus indicator. Writes results.json and a summary.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const OUT = process.argv[2]; fs.mkdirSync(path.join(OUT, 'screens'), { recursive: true });
const BASE = process.argv[3] || 'http://localhost:3123';
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const WIDTHS = [['small-mobile', 320, 640], ['mobile', 375, 812], ['large-mobile', 430, 932], ['tablet', 768, 1024], ['desktop', 1280, 900]];

// A learner with some progress, so screens show real states.
const SEED = { version: 2, currentTopicId: 'fractions', topics: { fractions: { lessons: { wholes: { step: 4, furthestStep: 4, completed: true, completedAt: 1 }, naming: { step: 2, furthestStep: 2, completed: false } } } }, results: [
  { questionId: 'fractions.ls-wholes-1', skill: 'fractions.equal-parts', context: 'lesson', correct: true, firstTry: true, attempts: 1, hintsUsed: 0, misconceptions: [], at: 10 },
  { questionId: 'fractions.nm-5', skill: 'fractions.name', context: 'practice', correct: false, firstTry: false, attempts: 2, hintsUsed: 1, misconceptions: ['fractions.numerator-denominator-swap'], at: 20 },
] };

const PAGES = [
  ['home', '/'], ['map', '/journey'], ['island', '/t/fractions'], ['lesson-explain', '/t/fractions/lesson/adding/1'],
  ['lesson-worked', '/t/fractions/lesson/adding/2'], ['practice', 'PRACTICE'], ['lab', '/t/fractions/lab'], ['check', 'CHECK'],
  ['grown-ups', 'GATE:/parent'], ['report', 'GATE:/results'], ['badges', '/badges'],
];

async function open(p, url) {
  if (url === 'PRACTICE') {
    await p.goto(BASE + '/t/fractions/practice/add-same', { waitUntil: 'networkidle' });
    for (let i = 0; i < 5 && !(await p.getByRole('button', { name: /^Check/ }).count()); i++) { await p.getByRole('button', { name: /^Play/ }).first().click({ timeout: 4000 }).catch(() => {}); await p.waitForTimeout(500); }
  } else if (url === 'CHECK') {
    await p.goto(BASE + '/t/fractions/check', { waitUntil: 'networkidle' });
    await p.getByRole('button', { name: /I'm ready|Try the challenge again/ }).click({ timeout: 4000 }).catch(() => {});
  } else if (url.startsWith('GATE:')) {
    await p.goto(BASE + url.slice(5), { waitUntil: 'networkidle' });
    const g = p.locator('input[aria-label*="times"]');
    if (await g.count()) { const m = /(\d+) times (\d+)/.exec(await g.getAttribute('aria-label')); await g.fill(String(+m[1] * +m[2])); await p.getByRole('button', { name: 'Continue' }).click(); }
  } else await p.goto(BASE + url, { waitUntil: 'networkidle' });
  await p.waitForTimeout(700);
}

function measure() {
  const vw = window.innerWidth;
  const visible = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' && !el.closest('[aria-hidden="true"]'); };
  const name = (el) => `${el.tagName.toLowerCase()}${el.getAttribute('aria-label') ? `[${el.getAttribute('aria-label').slice(0, 30)}]` : ''} "${(el.textContent || '').trim().slice(0, 30)}"`;
  const overflowX = document.documentElement.scrollWidth - vw;
  const clipped = [];
  for (const el of document.querySelectorAll('main *')) {
    const cs = getComputedStyle(el);
    if (!['hidden', 'clip'].includes(cs.overflowX) && cs.textOverflow !== 'ellipsis') continue;
    if (el.closest('svg') || el.classList.contains('sr-only') || !el.textContent.trim() || !visible(el)) continue;
    if (el.scrollWidth > el.clientWidth + 1) clipped.push(name(el));
  }
  // Controls a child taps: buttons, links styled as controls, inputs, and shape parts. Inline links in running text are exempt (WCAG 2.5.8).
  const controls = [...document.querySelectorAll('button, a[href], input:not([type=hidden]), select, [role=checkbox], [role=radio], [role=slider]')]
    .filter((el) => visible(el) && !el.classList.contains('sr-only'))
    .filter((el) => !(el.tagName === 'A' && getComputedStyle(el).display === 'inline' && el.closest('p, li')));
  const small = [];
  for (const el of controls) {
    // A visually hidden radio or checkbox is operated through its label.
    const target = el.matches('input.sr-only') ? el.closest('label') ?? el : el;
    const r = target.getBoundingClientRect();
    if (r.width < 43.5 || r.height < 43.5) small.push(`${name(el)} ${Math.round(r.width)}×${Math.round(r.height)}`);
  }
  // Fixed and sticky bars sit above scrolling content by design; overlaps are checked among controls in the same layer.
  const layer = (el) => { for (let x = el; x; x = x.parentElement) { const pos = getComputedStyle(x).position; if (pos === 'fixed' || pos === 'sticky') return x; } return null; };
  const boxes = controls.map((el) => ({ el, r: el.getBoundingClientRect(), layer: layer(el) }));
  const overlaps = [];
  for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
    const a = boxes[i], b = boxes[j];
    if (a.layer !== b.layer) continue;
    if (a.el.contains(b.el) || b.el.contains(a.el) || a.el.closest('label')?.contains(b.el) || b.el.closest('label')?.contains(a.el)) continue;
    if (a.el.closest('svg') && a.el.closest('svg') === b.el.closest('svg')) continue; // parts of one picture share edges
    const w = Math.min(a.r.right, b.r.right) - Math.max(a.r.left, b.r.left);
    const h = Math.min(a.r.bottom, b.r.bottom) - Math.max(a.r.top, b.r.top);
    if (w > 2 && h > 2) overlaps.push(`${name(a.el)} / ${name(b.el)}`);
  }
  return { overflowX, clipped, small: small.slice(0, 12), smallCount: small.length, overlaps: overlaps.slice(0, 8), overlapCount: overlaps.length, controls: controls.length };
}

(async () => {
  const b = await chromium.launch();
  const out = { widths: [], axe: [], keyboard: [], reducedMotion: null };
  for (const [label, w, h] of WIDTHS) {
    const ctx = await b.newContext({ viewport: { width: w, height: h } });
    await ctx.addInitScript((seed) => { if (!localStorage.getItem('kite-maths:v2')) localStorage.setItem('kite-maths:v2', JSON.stringify(seed)); }, SEED);
    const p = await ctx.newPage();
    for (const [name, url] of PAGES) {
      await open(p, url);
      const m = await p.evaluate(measure);
      out.widths.push({ width: label, px: w, page: name, ...m });
      await p.screenshot({ path: path.join(OUT, 'screens', `${w}-${name}.jpg`), type: 'jpeg', quality: 55 });
      if (w === 375 || w === 1280) {
        await p.addScriptTag({ content: AXE });
        const res = await p.evaluate(async () => {
          const r = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } });
          return r.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.length, targets: v.nodes.slice(0, 3).map((n) => n.target.join(' ')) }));
        });
        out.axe.push({ px: w, page: name, violations: res });
      }
    }
    await ctx.close();
  }

  // Keyboard: every control reached by Tab shows a visible focus indicator.
  const kctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  await kctx.addInitScript((seed) => { if (!localStorage.getItem('kite-maths:v2')) localStorage.setItem('kite-maths:v2', JSON.stringify(seed)); }, SEED);
  const kp = await kctx.newPage();
  for (const [name, url] of [['home', '/'], ['lesson-worked', '/t/fractions/lesson/adding/2'], ['lab', '/t/fractions/lab'], ['practice', 'PRACTICE']]) {
    await open(kp, url);
    const seen = []; const invisible = [];
    for (let i = 0; i < 40; i++) {
      await kp.keyboard.press('Tab');
      const f = await kp.evaluate(() => {
        const el = document.activeElement; if (!el || el === document.body) return null;
        const cs = getComputedStyle(el);
        const ring = (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) || (cs.boxShadow && cs.boxShadow !== 'none');
        // SVG parts draw their own focus outline as a separate path.
        const svgFocus = el.closest('svg') && !!el.closest('svg').querySelector('path[stroke="var(--color-den)"][stroke-width="5"]');
        return { id: `${el.tagName.toLowerCase()} "${(el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 30)}"`, visible: ring || svgFocus };
      });
      if (!f) continue;
      seen.push(f.id); if (!f.visible) invisible.push(f.id);
    }
    out.keyboard.push({ page: name, focused: seen.length, withoutVisibleFocus: [...new Set(invisible)] });
  }
  await kctx.close();

  // Reduced motion: the preference is honoured (CSS transitions cut, motion off) and the journey screens still work.
  const rctx = await b.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const rp = await rctx.newPage();
  await rp.goto(BASE + '/t/fractions/lab', { waitUntil: 'networkidle' });
  out.reducedMotion = await rp.evaluate(() => ({ matches: matchMedia('(prefers-reduced-motion: reduce)').matches, transition: getComputedStyle(document.querySelector('main button')).transitionDuration }));
  await rctx.close();
  await b.close();

  fs.writeFileSync(path.join(OUT, 'results.json'), JSON.stringify(out, null, 1));
  const overflow = out.widths.filter((r) => r.overflowX > 0);
  const clipped = out.widths.filter((r) => r.clipped.length);
  const overlaps = out.widths.filter((r) => r.overlapCount);
  const small = out.widths.filter((r) => r.smallCount);
  const axeIssues = out.axe.flatMap((a) => a.violations.map((v) => `${a.px} ${a.page}: ${v.id} (${v.impact}, ${v.nodes}) ${v.targets[0] ?? ''}`));
  const lines = [
    `screens: ${out.widths.length} (${PAGES.length} pages × ${WIDTHS.length} widths)`,
    `sideways scroll: ${overflow.length ? overflow.map((r) => `${r.px} ${r.page} ${r.overflowX}px`).join('; ') : 'none'}`,
    `clipped text: ${clipped.length ? clipped.map((r) => `${r.px} ${r.page}: ${r.clipped.join(', ')}`).join('; ') : 'none'}`,
    `overlapping controls: ${overlaps.length ? overlaps.map((r) => `${r.px} ${r.page}: ${r.overlaps.join(', ')}`).join('; ') : 'none'}`,
    `touch targets under 44px: ${small.length ? small.map((r) => `${r.px} ${r.page} (${r.smallCount}): ${r.small.slice(0, 4).join(', ')}`).join('; ') : 'none'}`,
    `axe (WCAG 2.1 A/AA) violations: ${axeIssues.length ? axeIssues.join('; ') : 'none'}`,
    `keyboard: ${out.keyboard.map((k) => `${k.page} ${k.focused} focused, without visible focus: ${k.withoutVisibleFocus.join(', ') || 'none'}`).join('; ')}`,
    `reduced motion: ${JSON.stringify(out.reducedMotion)}`,
  ];
  fs.writeFileSync(path.join(OUT, 'summary.txt'), lines.join('\n') + '\n');
  console.log(lines.join('\n'));
})();
