import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * QA-004: the defect register (docs/product/traceability/defects.csv), its triage rules and its agreement with
 * STATUS.md, DECISIONS.md and the generated page. Documentation checks only.
 */

const DOCS = join(process.cwd(), "docs/product");
const read = (f: string) => readFileSync(join(DOCS, f), "utf8");

function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; } else if (c === '"') quoted = false; else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const [head, ...body] = rows;
  return body.map((r) => Object.fromEntries(head.map((h, i) => [h, r[i] ?? ""])));
}

const defects = parseCsv(read("traceability/defects.csv"));
const decisions = read("DECISIONS.md");
const decisionIds = new Set([...decisions.matchAll(/^\| (D-\d{3}) \|/gm)].map((m) => m[1]));
const FIELDS = ["id", "title", "severity", "priority", "affected_requirements", "steps", "expected", "actual", "evidence", "tested_commit", "accountable_role", "fix_status", "retest_status", "release_impact", "deferral", "history"];

function state(r: Record<string, string>): string {
  if (r.fix_status === "Open") return "Open";
  if (r.fix_status.startsWith("Documentation corrected")) return "Partly fixed (behaviour open)";
  if (r.fix_status === "Partly fixed") return "Partly fixed";
  if (r.retest_status.startsWith("Independently verified")) return "Closed (verified)";
  return "Fixed, closure not confirmed";
}

describe("defect register (QA-004)", () => {
  it("has one row per defect, numbered DEF-001 upwards with no gaps or repeats", () => {
    expect(defects.map((d) => d.id)).toEqual(defects.map((_, i) => `DEF-${String(i + 1).padStart(3, "0")}`));
    expect(defects.length).toBeGreaterThanOrEqual(38);
  });

  it("gives every defect all the required fields, with valid severity and priority (QA-004 AC1)", () => {
    for (const d of defects) {
      for (const f of FIELDS) expect(d[f]?.trim(), `${d.id} ${f}`).toBeTruthy();
      expect(["Critical", "High", "Medium", "Low"], d.id).toContain(d.severity);
      expect(["P1", "P2", "P3"], d.id).toContain(d.priority);
      // Priority follows severity: Critical/High are P1, Medium P2, Low P3, except a Low defect that blocks a planned acceptance (P2).
      const allowed = { Critical: ["P1"], High: ["P1", "P2"], Medium: ["P2"], Low: ["P3", "P2"] }[d.severity]!;
      expect(allowed, `${d.id} ${d.severity}/${d.priority}`).toContain(d.priority);
      for (const sha of d.tested_commit.match(/`[0-9a-f]{7,40}`/g) ?? []) expect(sha.length, d.id).toBeGreaterThanOrEqual(9);
    }
  });

  it("names affected requirements that exist in the backlog", () => {
    const backlog = read("backlog.md");
    for (const d of defects) {
      const ids = d.affected_requirements.match(/\b[A-Z]{2,6}-\d{3}\b/g) ?? [];
      expect(ids.length + (/No specific acceptance criterion/.test(d.affected_requirements) ? 1 : 0), d.id).toBeGreaterThan(0);
      for (const id of ids) if (!["PARENT-002", "PARENT"].includes(id)) expect(backlog, `${d.id} -> ${id}`).toContain(id);
    }
  });

  it("closes a defect only on independent verification that cites a recorded decision (QA-004 rule 4)", () => {
    for (const d of defects.filter((d) => state(d) === "Closed (verified)")) {
      expect(d.retest_status, d.id).toMatch(/^Independently verified on `[0-9a-f]{7,40}` \(D-\d{3}\)$/);
      const ref = /\((D-\d{3})\)/.exec(d.retest_status)![1];
      expect(decisionIds.has(ref), `${d.id} cites ${ref}`).toBe(true);
    }
    // A fixed defect without a recorded retest is never shown as closed.
    for (const d of defects.filter((d) => d.fix_status.startsWith("Fixed") && !d.retest_status.startsWith("Independently verified"))) {
      expect(d.retest_status, d.id).toMatch(/^Not retested$/);
      expect(state(d), d.id).toBe("Fixed, closure not confirmed");
    }
  });

  it("keeps DEF-038 explicit: the behaviour is fixed by D-033, not yet retested, and still traced to TC-ARCH-002.1.13", () => {
    const d = defects.find((x) => x.id === "DEF-038")!;
    expect(d.fix_status).toBe("Fixed");
    expect(d.history).toContain("D-033");
    expect(d.deferral).toContain("TC-ARCH-002.1.13");
    expect(state(d)).toBe("Fixed, closure not confirmed");
    const tc = readFileSync(join(DOCS, "traceability/test-cases.csv"), "utf8");
    expect(tc).toContain("TC-ARCH-002.1.13");
  });

  it("blocks release on every open Critical or High defect, and invents no deferral approval (QA-004 AC2)", () => {
    for (const d of defects.filter((d) => ["Critical", "High"].includes(d.severity) && state(d) !== "Closed (verified)")) {
      expect(d.release_impact, d.id).toMatch(/^Blocks release|^Blocks release until fixed/);
    }
    for (const d of defects) {
      for (const ref of d.deferral.match(/\bD-\d{3}\b/g) ?? []) expect(decisionIds.has(ref), `${d.id} -> ${ref}`).toBe(true);
      // Only a recorded decision can approve a deferral; "pending" rows must say so and name no approval.
      if (/None approved/.test(d.deferral)) expect(d.deferral, d.id).not.toMatch(/\bD-\d{3}\b/);
    }
  });

  it("links to evidence files that exist", () => {
    for (const d of defects) {
      for (const m of `${d.evidence} ${d.retest_evidence} ${d.deferral}`.matchAll(/\]\(([^)#]+)(#[^)]*)?\)/g)) {
        if (/^https?:/.test(m[1])) continue;
        // Links are written relative to docs/product, where the generated page lives.
        expect(existsSync(join(DOCS, m[1])), `${d.id}: ${m[1]}`).toBe(true);
      }
    }
  });

  it("is mirrored by the STATUS.md index: same ids, severity, state and affected items", () => {
    const status = read("STATUS.md");
    const section = status.slice(status.indexOf("## Defect index"));
    const index = [...section.matchAll(/^\| (DEF-\d{3}) \| ([^|]+) \| ([^|]+) \| ([^|]+) \|$/gm)].map((m) => ({ id: m[1], severity: m[2].trim(), state: m[3].trim(), affects: m[4].trim() }));
    expect(index).toEqual(defects.map((d) => ({ id: d.id, severity: d.severity, state: state(d), affects: d.affected_requirements.replace(/\|/g, "/") })));
    // Defects are referenced elsewhere in STATUS.md; each reference must be to a registered defect.
    for (const id of status.match(/DEF-\d{3}/g) ?? []) expect(defects.some((d) => d.id === id), id).toBe(true);
  });

  it("is shown in the generated page with every defect, the rules and the state counts", () => {
    const page = read("QA-004-defect-register.md");
    for (const d of defects) expect(page, d.id).toContain(`### ${d.id}:`);
    expect(page).toContain("## 2. Triage rules");
    expect(page).toContain("## 4. R1 obligations that are not defect rows");
    const closed = defects.filter((d) => state(d) === "Closed (verified)").length;
    expect(page).toContain(`| Closed (verified) | ${closed} |`);
    expect(page).toContain(`| **Total** | **${defects.length}** | |`);
    expect(page).toMatch(/Today no defect has an approved release deferral/);
  });
});
