import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ALL_QUESTIONS } from "./questions";
import { reviewPackMarkdown } from "./reviewPack";

/** CUR-004: the review pack lists every authored question and stays in step with the content. */
const DOC = join(process.cwd(), "docs/product/curriculum/CUR-004-review-pack.md");

describe("content review pack (CUR-004)", () => {
  it("lists every authored question once and matches the content", () => {
    const md = reviewPackMarkdown();
    if (process.env.UPDATE_DOCS) writeFileSync(DOC, md);
    for (const q of ALL_QUESTIONS) expect(md, q.id).toContain(`| \`${q.id.replace("fractions.", "")}\` |`);
    expect(readFileSync(DOC, "utf8")).toBe(md);
  });
});
