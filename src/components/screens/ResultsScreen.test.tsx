import { render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { seededLearner } from "@/test/seed";
import { ActiveTopicProvider } from "@/topics/ActiveTopic";
import { ResultsScreen } from "./ResultsScreen";

/** MAST-004 and MAST-002 AC4: the results report, rendered from a saved learner. */

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: () => {}, replace: () => {} }), usePathname: () => "/results" }));

beforeAll(() => {
  window.localStorage.setItem("kite-maths:v2", JSON.stringify(seededLearner()));
});

describe("mastery results (MAST-004)", () => {
  it("reports strengths, skills to develop, patterns of difficulty and next steps, by skill", () => {
    render(
      <ActiveTopicProvider choosable>
        <ResultsScreen />
      </ActiveTopicProvider>,
    );
    for (const h of ["Strengths", "Next steps", "Ideas to watch", "Last mastery check"]) expect(screen.getByRole("heading", { name: new RegExp(h) })).toBeTruthy();
    // A pattern of difficulty, stated tentatively, from the stored answers.
    expect(screen.getByText("Mixing up numerator and denominator")).toBeTruthy();
    expect(screen.getByText(/Still working on it|Improving/)).toBeTruthy();
    // Skill-level evidence: each skill is listed with its own status (MAST-002 AC4).
    expect(screen.getAllByText("Comparing fractions").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Needs review/).length).toBeGreaterThan(0);
  });

  it("makes no claims about ability", () => {
    render(
      <ActiveTopicProvider choosable>
        <ResultsScreen />
      </ActiveTopicProvider>,
    );
    expect(document.body.textContent).not.toMatch(/\b(clever|smart|genius|gifted|bright|weak|slow|bad at maths|not a maths person|below average|above average)\b/i);
  });
});
