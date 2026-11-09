"""Rewrite the defect index in STATUS.md from traceability/defects.csv. Run from the repository root."""
import csv, re, importlib.util
rows = list(csv.DictReader(open("docs/product/traceability/defects.csv", encoding="utf-8")))
def state(r):
    f, rt = r["fix_status"], r["retest_status"]
    if f == "Open": return "Open"
    if f.startswith("Documentation corrected"): return "Partly fixed (behaviour open)"
    if f == "Partly fixed": return "Partly fixed"
    if rt.startswith("Independently verified"): return "Closed (verified)"
    return "Fixed, closure not confirmed"
p = "docs/product/STATUS.md"
s = open(p, encoding="utf-8").read()
a = s.index("## Open defects affecting status") if "## Open defects affecting status" in s else s.index("## Defect index")
b = s.index("\n## ", a + 5) if "\n## " in s[a + 5:] else len(s)
new = ["## Defect index", "",
 "The defect register is [`traceability/defects.csv`](traceability/defects.csv), shown with the triage rules in [QA-004](QA-004-defect-register.md). This table is an index of it and must agree with it (`src/defects.test.ts`). Fix and retest detail is in the register, not here. An item's acceptance does not close a defect.", "",
 "| Defect | Severity | State | Affects |", "|---|---|---|---|"]
for r in rows:
    new.append(f"| {r['id']} | {r['severity']} | {state(r)} | {r['affected_requirements'].replace('|','/')} |")
new.append("")
s = s[:a] + "\n".join(new) + s[b:]
open(p, "w", encoding="utf-8").write(s)
print(len(rows), "rows")
