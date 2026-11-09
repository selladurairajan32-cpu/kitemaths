import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * GOV-004: change-control records. The decision log is append only, its ids are unique and in order, and every
 * reference to a decision, clarification or change resolves. Documentation checks only.
 */

const DOCS = join(process.cwd(), "docs/product");
const read = (f: string) => readFileSync(join(DOCS, f), "utf8");
const decisions = read("DECISIONS.md");
const ids = (prefix: string) => [...decisions.matchAll(new RegExp(`^\\| (${prefix}-\\d{3}) \\|`, "gm"))].map((m) => m[1]);

describe("change control (GOV-004)", () => {
  it("numbers decisions, clarifications and changes in order, with no gaps and no repeats", () => {
    for (const [prefix, start] of [["D", 0], ["RC", 1], ["CH", 1]] as const) {
      const found = ids(prefix);
      expect(found.length, prefix).toBeGreaterThan(5);
      expect(found, prefix).toEqual(found.map((_, i) => `${prefix}-${String(i + start).padStart(3, "0")}`));
    }
  });

  it("resolves every decision, clarification and change cited in the records", () => {
    const known = new Set([...ids("D"), ...ids("RC"), ...ids("CH")]);
    const sources = ["STATUS.md", "DECISIONS.md", "GOV-004-change-control.md", "QA-004-defect-register.md", "traceability/defects.csv", "traceability/test-cases.csv"];
    for (const f of sources) for (const id of read(f).match(/\b(?:D|RC|CH)-\d{3}\b/g) ?? []) expect(known.has(id), `${f}: ${id}`).toBe(true);
  });

  it("lets only a decision accept an item: every ACCEPTED status cites one that exists", () => {
    const known = new Set(ids("D"));
    const accepted = [...read("STATUS.md").matchAll(/\| ACCEPTED \((D-\d{3})\) \|/g)];
    expect(accepted.length).toBeGreaterThan(5);
    for (const m of accepted) expect(known.has(m[1]), m[1]).toBe(true);
  });

  it("defines the material kinds, the four required items, the roles and the no-silent-reinterpretation rule", () => {
    const doc = read("GOV-004-change-control.md");
    for (const kind of ["**Scope**", "**Curriculum**", "**UX**", "**Architecture**"]) expect(doc, kind).toContain(kind);
    for (const item of ["**Reason**", "**Impact**", "**Owner**", "**Decision**"]) expect(doc, item).toContain(item);
    expect(doc).toContain("## 5. Roles");
    expect(doc).toContain("**Yes, and only the Product Owner.**");
    expect(doc).toContain("## 6. Claude Code does not silently reinterpret a requirement");
    expect(doc).toContain("## 7. Keeping deferrals and exceptions visible");
    expect(doc).toContain("## 8. Proportionality");
  });

  it("links to files that exist", () => {
    for (const f of ["GOV-004-change-control.md", "QA-004-defect-register.md", "reports/R0-step4-handoff.md"]) {
      const dir = f.includes("/") ? f.slice(0, f.lastIndexOf("/")) : "";
      for (const m of read(f).matchAll(/\]\(([^)#\s]+)(?:#[^)]*)?\)/g)) {
        if (/^https?:/.test(m[1])) continue;
        expect(existsSync(join(DOCS, dir, m[1])), `${f} -> ${m[1]}`).toBe(true);
      }
    }
  });
});
