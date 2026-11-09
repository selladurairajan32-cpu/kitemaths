import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * GOV-002 / GOV-003: keeps the product source of truth consistent.
 * - Every backlog item (docs/product/backlog.md) is a requirement, with each acceptance criterion listed.
 * - Every item appears once in the status register with a valid QA status and implementation state.
 * - Every P0/P1 acceptance criterion has a test case; every later item has at least one (RC-001).
 * - Automated test cases point at tests that exist, and every test file traces to a requirement.
 */

const ROOT = process.cwd();
const PRODUCT = join(ROOT, "docs/product");
const read = (p: string) => readFileSync(join(PRODUCT, p), "utf8");

const QA_STATUSES = ["NOT STARTED", "SPECIFIED", "READY FOR DEVELOPMENT", "IN DEVELOPMENT", "READY FOR QA", "QA FAILED", "READY FOR RETEST", "ACCEPTED", "BLOCKED"];
const IMPLEMENTATION = ["Implemented", "Partial", "Not implemented"];
const TC_LEVELS = ["unit", "content", "component", "e2e", "visual-a11y-qa", "document-review", "content-review"];
const TC_AUTOMATION = ["automated", "manual", "planned"];
const TC_STATUS = ["passing", "partial", "failing", "planned", "review-pending", "accepted"];

/** A small CSV reader: comma-separated, double-quoted fields may contain commas and doubled quotes. */
function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  for (const line of text.split("\n")) {
    if (!line.trim()) continue;
    const cells: string[] = [];
    let cell = "";
    let quoted = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (quoted) {
        if (ch === '"' && line[i + 1] === '"') {
          cell += '"';
          i++;
        } else if (ch === '"') quoted = false;
        else cell += ch;
      } else if (ch === '"') quoted = true;
      else if (ch === ",") {
        cells.push(cell);
        cell = "";
      } else cell += ch;
    }
    cells.push(cell);
    rows.push(cells);
  }
  const [head, ...body] = rows;
  return body.map((r) => Object.fromEntries(head.map((h, i) => [h, r[i] ?? ""])));
}

interface BacklogItem {
  id: string;
  priority: string;
  release: string;
  acs: string[];
}

/** Items and their acceptance criteria, read straight from the backlog text. */
function backlogItems(): BacklogItem[] {
  const text = read("backlog.md");
  return text
    .split(/\n(?=### [A-Z]+-\d{3} — )/)
    .filter((b) => /^### [A-Z]+-\d{3} — /.test(b))
    .map((b) => {
      const id = b.match(/^### ([A-Z]+-\d{3})/)![1];
      const meta = b.match(/\*\*Priority:\*\* (P\d) \| \*\*Release:\*\* (R[\d/R]+)/)!;
      const ac = b.match(/\*\*Acceptance criteria:\*\* (.+)/)![1].trim();
      const acs = ac
        .split(/;\s+/)
        .map((a) => a.trim().replace(/\.$/, ""))
        .filter(Boolean);
      return { id, priority: meta[1], release: meta[2], acs };
    });
}

/** Rows of the status register tables: | ID | Title | Pri | Rel | QA status | Implementation | Evidence | */
function statusRows() {
  const register = read("STATUS.md").split(/^## Register\s*$/m)[1]?.split(/^## /m)[0] ?? "";
  return register
    .split("\n")
    .filter((l) => /^\| [A-Z]+-\d{3} \|/.test(l))
    .map((l) => {
      const c = l.split("|").map((s) => s.trim());
      return { id: c[1], qa: c[5], implementation: c[6] };
    });
}

function testFiles(dir = join(ROOT, "src")): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return testFiles(p);
    return name.endsWith(".test.ts") ? [relative(ROOT, p).split("\\").join("/")] : [];
  });
}

const items = backlogItems();
const requirements = parseCsv(read("traceability/requirements.csv"));
const testCases = parseCsv(read("traceability/test-cases.csv"));

describe("product source of truth and traceability", () => {
  it("reads all 97 items of backlog v1.0", () => {
    expect(items.length).toBe(97);
    expect(new Set(items.map((i) => i.id)).size).toBe(97);
  });

  it("lists every backlog item and acceptance criterion as a requirement", () => {
    const expected = items.flatMap((i) => i.acs.map((ac, n) => `${i.id}|AC${n + 1}|${i.priority}|${i.release}|${ac}`));
    const actual = requirements.map((r) => `${r.req_id}|${r.ac}|${r.priority}|${r.release}|${r.acceptance_criterion}`);
    expect(actual).toEqual(expected);
  });

  it("lists every backlog item exactly once in the status register", () => {
    const rows = statusRows();
    expect(rows.map((r) => r.id).sort()).toEqual(items.map((i) => i.id).sort());
    for (const r of rows) {
      expect(QA_STATUSES, `${r.id} QA status "${r.qa}"`).toContain(r.qa.replace(/ \(D-\d{3}\)$/, ""));
      expect(IMPLEMENTATION, `${r.id} implementation "${r.implementation}"`).toContain(r.implementation);
    }
  });

  it("only marks an item ACCEPTED when a recorded decision says so", () => {
    const decisions = read("DECISIONS.md");
    for (const r of statusRows().filter((r) => r.qa.startsWith("ACCEPTED"))) {
      const ref = r.qa.match(/\((D-\d{3})\)/);
      expect(ref, `${r.id} is ACCEPTED without a decision reference`).not.toBeNull();
      expect(decisions, `${r.id} cites ${ref![1]}, which is not in DECISIONS.md`).toContain(`| ${ref![1]} |`);
    }
    // Test cases can only be "accepted" for items the Product Owner has accepted.
    const accepted = new Set(statusRows().filter((r) => r.qa.startsWith("ACCEPTED")).map((r) => r.id));
    for (const tc of testCases.filter((t) => t.status === "accepted")) expect(accepted.has(tc.req_id), tc.tc_id).toBe(true);
  });

  it("keeps test-case fields valid and unique, and tied to a real criterion", () => {
    const ids = testCases.map((t) => t.tc_id);
    expect(new Set(ids).size).toBe(ids.length);
    const criteria = new Set(requirements.map((r) => `${r.req_id}|${r.ac}`));
    for (const t of testCases) {
      expect(criteria.has(`${t.req_id}|${t.ac}`), `${t.tc_id} -> ${t.req_id} ${t.ac}`).toBe(true);
      expect(TC_LEVELS, t.tc_id).toContain(t.level);
      expect(TC_AUTOMATION, t.tc_id).toContain(t.automation);
      expect(TC_STATUS, t.tc_id).toContain(t.status);
      // "passing" means an automated test (or a recorded CI run) actually passes; never a plan.
      if (t.status === "passing") expect(t.automation === "automated" || /CI run/.test(t.notes), t.tc_id).toBe(true);
    }
  });

  it("gives every P0/P1 acceptance criterion at least one test case", () => {
    const covered = new Set(testCases.map((t) => `${t.req_id}|${t.ac}`));
    const missing = items
      .filter((i) => i.priority === "P0" || i.priority === "P1")
      .flatMap((i) => i.acs.map((_, n) => `${i.id}|AC${n + 1}`))
      .filter((k) => !covered.has(k));
    expect(missing).toEqual([]);
  });

  it("gives every later-release item, including Times Tables and Mental Maths, at least one test case", () => {
    const withCases = new Set(testCases.map((t) => t.req_id));
    const later = items.filter((i) => !["P0", "P1"].includes(i.priority));
    expect(later.some((i) => i.id.startsWith("TT-")) && later.some((i) => i.id.startsWith("MM-"))).toBe(true);
    expect(later.filter((i) => !withCases.has(i.id)).map((i) => i.id)).toEqual([]);
  });

  it("points every automated test case at a test that exists", () => {
    for (const t of testCases.filter((t) => t.automation === "automated")) {
      const [file, title] = t.test_ref.split("::");
      expect(file && title, `${t.tc_id} needs file::title`).toBeTruthy();
      expect(existsSync(join(ROOT, file)), `${t.tc_id}: ${file} is missing`).toBe(true);
      expect(readFileSync(join(ROOT, file), "utf8").includes(title), `${t.tc_id}: no test titled "${title}" in ${file}`).toBe(true);
    }
  });

  it("traces every test file in the repository to at least one requirement", () => {
    const referenced = new Set(testCases.filter((t) => t.test_ref).map((t) => t.test_ref.split("::")[0]));
    expect(testFiles().filter((f) => !referenced.has(f))).toEqual([]);
  });
});
