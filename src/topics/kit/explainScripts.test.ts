import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { scriptProblems, timedCues, type ExplainScript } from "@/engine/explainScript";
import { toSpeech } from "@/lib/speech";
import { EXPLANATIONS } from "./explanationIndex";
import { EXPLAIN_SCRIPTS } from "./explainScripts";

/**
 * D-041: the explanation scripts, the copies the film pipeline reads, and the films and voices made from them. Refresh
 * the copies with `UPDATE_DOCS=1 npx vitest run src/topics/kit/explainScripts.test.ts`, then run `tools/films/build.py`.
 */

const ROOT = process.cwd();
/** Words as the voice should say them: lesson markup in words, and "2 : 3" as "2 to 3". */
export const voiceText = (text: string) => toSpeech(text).replace(/(\d+)\s*:\s*(\d+)/g, "$1 to $2");

function exported(s: ExplainScript<unknown>) {
  return {
    note: "Generated from the explanation script by src/topics/kit/explainScripts.test.ts. Do not edit.",
    topicId: s.topicId,
    concept: s.concept,
    title: s.title,
    cues: timedCues(s.film).map((c) => ({ id: c.id, start: c.start, end: c.end, caption: c.text.replace(/\{(\d+)\/(\d+)\}/g, "$1/$2").replace(/\*\*/g, ""), say: voiceText(c.say ?? c.text) })),
    beats: s.story.flatMap((ch) => ch.beats.map((b) => ({ id: b.id, seconds: b.ms / 1000, say: voiceText(b.say ?? b.caption) }))),
  };
}

describe("explanation scripts and their media (D-041)", () => {
  it("has a script for every explanation page, and every script passes its checks", () => {
    expect(EXPLAIN_SCRIPTS.map((s) => `${s.topicId}/${s.concept}`).sort()).toEqual(EXPLANATIONS.map((e) => `${e.topicId}/${e.id}`).sort());
    for (const s of EXPLAIN_SCRIPTS) expect(scriptProblems(s), s.concept).toEqual([]);
  });

  it("keeps the film pipeline's copy of each script up to date", () => {
    for (const s of EXPLAIN_SCRIPTS) {
      const file = join(ROOT, "tools/films/scripts", `${s.concept}.json`);
      const body = `${JSON.stringify(exported(s), null, 1)}\n`;
      if (process.env.UPDATE_DOCS) writeFileSync(file, body);
      expect(existsSync(file) ? readFileSync(file, "utf8") : "", `${file}: run UPDATE_DOCS=1`).toBe(body);
    }
  });

  it("has a film, a poster and a recorded voice for every step, for every script", () => {
    const missing: string[] = [];
    for (const s of EXPLAIN_SCRIPTS) {
      for (const f of [`films/${s.concept}/film.mp4`, `films/${s.concept}/poster.jpg`, ...s.story.flatMap((c) => c.beats.map((b) => `voice/${s.concept}/${b.id}.mp3`))])
        if (!existsSync(join(ROOT, "public", f))) missing.push(f);
    }
    expect(missing).toEqual([]);
  });

  it("says symbols in words for the voice (hand-worked)", () => {
    expect(voiceText("{1/3} + {1/4} = {7/12}")).toBe("one third + one quarter = seven twelfths");
    expect(voiceText("The ratio is 2 : 3. 35 ÷ 5 = 7.")).toBe("The ratio is 2 to 3. 35 divided by 5 = 7.");
  });
});
