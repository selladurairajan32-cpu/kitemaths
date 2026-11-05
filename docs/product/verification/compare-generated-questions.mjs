// Usage: node docs/product/verification/compare-generated-questions.mjs <baselineTree> <headTree> <outDir> [seeds]
//
// ARCH-003 behaviour-preservation check. For each source tree (for example a `git worktree` of the baseline commit, and
// the working copy), it writes a temporary vitest file into <tree>/src, runs it with that tree's own node_modules, and
// removes it again. The dump contains, for every topic:
//   - every practice and assessment question the topic exposes;
//   - for kit islands, every template × difficulty × seed 0..seeds-1 (default 150), built through questionById;
//   - the answer text the topic shows for each question.
// It then compares the two dumps question by question and writes <outDir>/generated-questions-comparison.txt.
// Exit code 1 if any question differs or is missing.
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const [baseTree, headTree, outDir, seedArg] = process.argv.slice(2);
if (!baseTree || !headTree || !outDir) {
  console.error("usage: compare-generated-questions.mjs <baselineTree> <headTree> <outDir> [seeds]");
  process.exit(2);
}
const SEEDS = Number(seedArg ?? 150);
mkdirSync(outDir, { recursive: true });

const DUMP_TEST = `
import { writeFileSync } from "node:fs";
import { it } from "vitest";
import { TOPICS } from "@/topics";
import { genId, templatesOf } from "@/topics/kit/define";

it("dumps every generated question", () => {
  const out: Record<string, string> = {};
  for (const t of TOPICS) {
    const add = (q: { id: string }) => {
      out[t.id + " " + q.id] = JSON.stringify({ q, answer: t.questions.answerText(q as never) });
    };
    for (const q of t.practiceQuestions) add(q);
    for (const q of t.assessmentQuestions) add(q);
    for (const tpl of templatesOf(t.id)) {
      for (const d of tpl.difficulties) {
        for (let s = 0; s < ${SEEDS}; s++) add(t.questionById(genId(t.id, tpl.key, d, s)));
      }
    }
  }
  writeFileSync(process.env.DUMP_OUT!, JSON.stringify(out));
}, 600_000);
`;

function dump(tree, name) {
  const file = join(resolve(tree), "src", "zz-dump-generated-questions.test.ts");
  const out = resolve(outDir, `${name}.json`);
  writeFileSync(file, DUMP_TEST);
  try {
    execFileSync("npx", ["vitest", "run", "src/zz-dump-generated-questions.test.ts"], {
      cwd: resolve(tree),
      env: { ...process.env, DUMP_OUT: out },
      stdio: "pipe",
    });
  } finally {
    rmSync(file, { force: true });
  }
  return JSON.parse(readFileSync(out, "utf8"));
}

const sha = (s) => createHash("sha256").update(s).digest("hex").slice(0, 16);
const base = dump(baseTree, "baseline");
const head = dump(headTree, "head");
const keys = [...new Set([...Object.keys(base), ...Object.keys(head)])].sort();
const differing = keys.filter((k) => base[k] !== head[k]);
const byTopic = new Map();
for (const k of keys) {
  const topic = k.split(" ")[0];
  const e = byTopic.get(topic) ?? { n: 0, diff: 0, b: "", h: "" };
  e.n++;
  if (base[k] !== head[k]) e.diff++;
  e.b += base[k] ?? "";
  e.h += head[k] ?? "";
  byTopic.set(topic, e);
}
const lines = [
  `Generated-question comparison (${SEEDS} seeds per template and difficulty)`,
  `baseline: ${resolve(baseTree)}`,
  `head:     ${resolve(headTree)}`,
  "",
  "topic | questions | differing | baseline sha256 | head sha256",
  ...[...byTopic].map(([t, e]) => `${t} | ${e.n} | ${e.diff} | ${sha(e.b)} | ${sha(e.h)}`),
  "",
  `TOTAL questions ${keys.length}, differing ${differing.length}`,
  ...differing.slice(0, 20).map((k) => `DIFF ${k}`),
];
writeFileSync(join(outDir, "generated-questions-comparison.txt"), lines.join("\n") + "\n");
rmSync(resolve(outDir, "baseline.json"));
rmSync(resolve(outDir, "head.json"));
console.log(lines.slice(-Math.min(lines.length, 3 + Math.min(differing.length, 20))).join("\n"));
process.exit(differing.length ? 1 : 0);
