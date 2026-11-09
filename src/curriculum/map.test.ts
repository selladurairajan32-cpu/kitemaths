import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { TOPICS } from "@/topics";

/**
 * CUR-001: the Year 3–6 curriculum map (docs/product/curriculum/CUR-001-curriculum-map.md).
 * Checks the authored map (curriculum-map.csv) against the statutory wording extracted from the official DfE page, the
 * live islands, and the generated document. Year allocation is checked against the source, not against island labels.
 */

const DIR = join(process.cwd(), "docs/product/curriculum");
const read = (f: string) => readFileSync(join(DIR, f), "utf8");

/** Minimal RFC 4180 CSV reader (quoted fields, doubled quotes, newlines inside quotes). */
function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else field += c;
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  const [head, ...body] = rows;
  return body.map((r) => Object.fromEntries(head.map((h, i) => [h, r[i] ?? ""])));
}

interface Section {
  year: number;
  heading: string;
  anchor: string;
  code: string;
  statements: { id: string; text: string }[];
}
const dfe = JSON.parse(read("evidence/dfe-maths-pos-y2-y6.json")) as { source: Record<string, string>; sections: Section[]; school_curriculum: string[] };
const snapshot = JSON.parse(read("evidence/islands-snapshot.json")) as { id: string; years: number[]; skills: { id: string }[] }[];
const rows = parseCsv(read("curriculum-map.csv"));
const statutory = rows.filter((r) => r.status === "statutory");
const extension = rows.filter((r) => r.status === "11+-extension-candidate");
const statements = new Map(dfe.sections.flatMap((s) => s.statements.map((st) => [st.id, { year: s.year, section: s }] as const)));
const expectedIds = dfe.sections.filter((s) => s.year >= 3).flatMap((s) => s.statements.map((st) => st.id));
const skillIds = new Set(TOPICS.flatMap((t) => t.skills.map((s) => s.id)));
const ID = /Y\d\.[A-Z]+\.\d+/g;
const doc = read("CUR-001-curriculum-map.md");

describe("curriculum map (CUR-001)", () => {
  it("records its official source: publisher, URL, page date, retrieval date and licence", () => {
    expect(dfe.source.publisher).toBe("Department for Education");
    expect(dfe.source.url).toMatch(/^https:\/\/www\.gov\.uk\/government\/publications\/national-curriculum-in-england-mathematics-programmes-of-study\//);
    expect(dfe.source.page_last_modified).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(dfe.source.retrieved).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(dfe.source.licence).toMatch(/Open Government Licence/);
    // The key-stage caveat is part of the evidence, because it limits what a "year" means.
    expect(dfe.school_curriculum.join(" ")).toMatch(/only required to teach the relevant programme of study by the end of the key stage/);
  });

  it("maps every Year 3–6 statutory statement exactly once, in source order, with year, strand and location from the source", () => {
    expect(statutory.map((r) => r.id)).toEqual(expectedIds);
    expect(statutory).toHaveLength(171);
    for (const r of statutory) {
      const s = statements.get(r.id)!;
      expect(Number(r.year), r.id).toBe(s.year);
      expect(r.source_anchor, r.id).toBe(s.section.anchor);
      expect(Number(r.source_position), r.id).toBe(s.section.statements.findIndex((x) => x.id === r.id) + 1);
      expect(r.id.startsWith(`Y${s.year}.${s.section.code}.`), r.id).toBe(true);
      expect(r.key_stage, r.id).toBe(s.year <= 4 ? "KS2 lower" : "KS2 upper");
    }
  });

  it("gives every objective all the required fields", () => {
    for (const r of statutory) {
      for (const f of ["strand", "outcome", "prerequisites", "vocabulary", "examples", "mastery_kind", "coverage"]) expect(r[f]?.trim(), `${r.id} ${f}`).toBeTruthy();
      for (const k of r.mastery_kind.split("+")) expect(k.length === 1 && "FRPXWV".includes(k), `${r.id} kind ${k}`).toBe(true);
      expect(["addressed", "partial", "not-addressed"], r.id).toContain(r.coverage);
      expect(doc, r.id).toContain(r.id);
    }
  });

  it("has prerequisites that exist, are not from a later year, and form no cycle", () => {
    const graph = new Map<string, string[]>();
    for (const r of statutory) {
      const ids = r.prerequisites.match(ID) ?? [];
      expect(ids.length, `${r.id} names no prerequisite objective`).toBeGreaterThan(0);
      for (const p of ids) {
        expect(statements.has(p), `${r.id} -> ${p} does not exist`).toBe(true);
        expect(statements.get(p)!.year, `${r.id} -> ${p} is from a later year`).toBeLessThanOrEqual(statements.get(r.id)!.year);
        expect(p, `${r.id} lists itself`).not.toBe(r.id);
      }
      graph.set(r.id, ids);
    }
    const state = new Map<string, "visiting" | "done">();
    const visit = (id: string, path: string[]) => {
      if (state.get(id) === "done") return;
      expect(state.get(id), `cycle: ${[...path, id].join(" -> ")}`).not.toBe("visiting");
      state.set(id, "visiting");
      for (const p of graph.get(id) ?? []) if (graph.has(p)) visit(p, [...path, id]);
      state.set(id, "done");
    };
    for (const id of graph.keys()) visit(id, []);
  });

  it("maps only to existing skills, keeps coverage consistent with the mapping, and covers every Fractions skill", () => {
    for (const r of rows) {
      const skills = r.skills.split(";").filter(Boolean);
      for (const s of skills) expect(skillIds.has(s), `${r.id} -> ${s} is not a skill`).toBe(true);
      expect(r.coverage === "not-addressed", `${r.id}: coverage ${r.coverage} with ${skills.length} skills`).toBe(skills.length === 0);
    }
    const fractionSkills = TOPICS.find((t) => t.id === "fractions")!.skills.map((s) => s.id);
    for (const s of fractionSkills) expect(statutory.some((r) => r.skills.split(";").includes(s)), `${s} is not mapped to any objective`).toBe(true);
  });

  it("makes the Fractions R1 dependencies identifiable and consistent", () => {
    const roles = new Set(statutory.map((r) => r.r1_role).filter(Boolean));
    expect([...roles].sort()).toEqual(["builds-on", "prerequisite", "taught"]);
    const taught = statutory.filter((r) => r.r1_role === "taught");
    expect(taught.length).toBeGreaterThanOrEqual(5);
    for (const r of taught) {
      expect(r.strand, r.id).toMatch(/fractions/i);
      expect(r.skills.split(";").some((s) => s.startsWith("fractions.")), `${r.id}: taught but not mapped to a Fractions skill`).toBe(true);
    }
    // "Builds on" rows are fractions work taught elsewhere: a fractions strand, or a statement that uses fractions (Y5.MD.11 scales by simple fractions).
    for (const r of statutory.filter((r) => r.r1_role === "builds-on")) expect(`${r.strand} ${statements.get(r.id) ? dfe.sections.flatMap((s) => s.statements).find((x) => x.id === r.id)!.text : ""}`, r.id).toMatch(/fraction/i);
    expect(statutory.filter((r) => r.r1_role === "prerequisite").map((r) => r.id)).toEqual(expect.arrayContaining(["Y3.MD.1", "Y4.MD.1"]));
  });

  it("keeps the 11+ extension separate: labelled, unsourced, never statutory, and never based on an invented specification", () => {
    expect(extension.length).toBeGreaterThanOrEqual(1);
    for (const r of extension) {
      expect(r.id, r.id).toMatch(/^E11\.\d+$/);
      expect(r.source_anchor, `${r.id} must not carry a source`).toBe("");
      expect(r.year, r.id).toMatch(/unverified/);
      expect(r.gap, `${r.id} must say why it has no source`).toMatch(/No official source/);
      expect(r.prerequisites.match(ID)?.length, `${r.id} should relate to a statutory objective`).toBeGreaterThan(0);
    }
    expect(rows.filter((r) => r.status !== "statutory" && r.status !== "11+-extension-candidate")).toEqual([]);
    expect(doc).toMatch(/no single official 11\+ specification/i);
    expect(doc).toContain("## 6. Optional 11+ extension");
  });

  it("keeps the island snapshot in step with the live islands, so a change to islands flags the map", () => {
    expect(snapshot.map((t) => ({ id: t.id, years: t.years, skills: t.skills.map((s) => s.id) }))).toEqual(
      TOPICS.map((t) => ({ id: t.id, years: t.years, skills: t.skills.map((s) => s.id) })),
    );
  });

  it("invents no mastery threshold: thresholds belong to MAST-001", () => {
    const text = [doc, ...rows.map((r) => Object.values(r).join(" "))].join("\n");
    expect(text).not.toMatch(/\b(at least|minimum of|threshold of)\s+\d+\s+(correct|right|items|questions|answers)/i);
    expect(text).not.toMatch(/\b\d+\s*(out of|of the last)\s*\d+\s*(correct|right|items|questions|answers)/i);
    expect(text).not.toMatch(/\b\d+\s*%\s*(correct|accuracy|mastery)/i);
    expect(doc).toMatch(/owned by MAST-001/);
  });

  it("states the year-allocation caveat and the evidence method in the document", () => {
    expect(doc).toContain("Schools are, however, only required to teach the relevant programme of study by the end of the key stage");
    expect(doc).toMatch(/not a requirement to teach in that year/);
    expect(doc).toMatch(/desk judgement/);
    expect(doc).toContain(dfe.source.url);
  });
});
