import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createInitialState } from "@/engine/progress";
import type { ItemResult } from "@/engine/types";
import { updateLearner } from "@/lib/store";
import { MockScreen } from "./MockScreen";
import { PlanScreen } from "./PlanScreen";

/** R5 screens in jsdom: practice mocks (EXAM-005, EXAM-006) and the weekly plan (PARENT-003). */

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: () => {}, replace: () => {} }), usePathname: () => "/t/mock-exams/mock" }));

beforeEach(() => {
  act(() => updateLearner(() => createInitialState()));
});

describe("practice mock (EXAM-005)", () => {
  it("says it is practice, not an official paper, and leaves every exam fact unknown", () => {
    render(<MockScreen />);
    expect(screen.getAllByText(/It is not an official paper or a past paper/).length).toBeGreaterThan(0);
    const facts = screen.getByRole("heading", { name: "Which test?" }).closest("section")!;
    expect(within(facts).getAllByText(/: unknown$|unknown/).length).toBeGreaterThanOrEqual(5);
    expect(screen.getByText(/Timing: not known for this test/)).toBeTruthy();
  });

  it("follows the chosen settings: number of questions, a section timer and the review rule", async () => {
    const user = userEvent.setup();
    render(<MockScreen />);
    await user.click(screen.getByRole("button", { name: "6" }));
    await user.click(screen.getByRole("button", { name: "No going back" }));
    await user.click(screen.getByRole("button", { name: /Start the mock/ }));
    expect(screen.getByText(/Question 1 of 6 · Answer in order, with no going back/)).toBeTruthy();
    expect(screen.getByRole("timer")).toBeTruthy();
    expect(screen.queryByRole("navigation", { name: "Questions" })).toBeNull();
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.queryByRole("button", { name: "Back" })).toBeNull();
  });

  it("lets the child move between questions when review is allowed at any time", async () => {
    const user = userEvent.setup();
    render(<MockScreen />);
    await user.click(screen.getByRole("button", { name: "6" }));
    await user.click(screen.getByRole("button", { name: /Start the mock/ }));
    const nav = screen.getByRole("navigation", { name: "Questions" });
    expect(within(nav).getAllByRole("button").length).toBe(6);
    await user.click(within(nav).getByRole("button", { name: "4" }));
    expect(screen.getByText(/Question 4 of 6/)).toBeTruthy();
    expect(screen.getByRole("button", { name: "Back" })).toBeTruthy();
  });
});

describe("post-test analysis on screen (EXAM-006)", () => {
  it("stores the attempt, analyses it, gives a plan, predicts nothing, and keeps it for review", async () => {
    const user = userEvent.setup();
    render(<MockScreen />);
    await user.click(screen.getByRole("button", { name: "6" }));
    await user.click(screen.getByRole("button", { name: /Start the mock/ }));
    await user.click(screen.getByRole("button", { name: "Finish the mock" }));
    expect(screen.getByRole("heading", { name: "0 of 6 right" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "What to do next" })).toBeTruthy();
    expect(screen.getByText(/does not predict a test score, a pass mark, admission or the chance of an offer/)).toBeTruthy();
    // Skipped in a mock finished early: labelled as not clear yet, never as time pressure.
    expect(screen.getAllByText("Not clear yet").length).toBeGreaterThan(0);
    expect(screen.queryByText("Time pressure")).toBeNull();
    const review = screen.getByRole("heading", { name: "Question by question" }).closest("section")!;
    expect(within(review).getAllByRole("listitem").length).toBe(6);
    // The attempt is stored and listed for review later.
    await user.click(screen.getByRole("button", { name: "Set up another mock" }));
    expect(screen.getByRole("heading", { name: "Your mocks" })).toBeTruthy();
    expect(screen.getByRole("button", { name: /0 of 6/ })).toBeTruthy();
  });
});

describe("weekly plan (PARENT-003)", () => {
  it("shows each day with the reason for every item, and follows the workload the grown-up sets", async () => {
    const user = userEvent.setup();
    render(<PlanScreen />);
    expect(screen.getAllByRole("heading", { name: /^Day \d/ }).length).toBe(5);
    await user.selectOptions(screen.getByLabelText("Days a week"), "3");
    expect(screen.getAllByRole("heading", { name: /^Day \d/ }).length).toBe(3);
    await user.selectOptions(screen.getByLabelText("Minutes a day"), "10");
    for (const h of screen.getAllByRole("heading", { name: /^Day \d/ })) {
      const minutes = Number(/· (\d+) min/.exec(h.textContent!)![1]);
      expect(minutes).toBeLessThanOrEqual(10);
    }
    expect(screen.getByText(/estimates/)).toBeTruthy();
  });

  it("puts review first when a check has flagged a skill", () => {
    const wrong = (at: number): ItemResult => ({ questionId: `a${at}`, skill: "times-tables.meaning", context: "assessment", correct: false, firstTry: false, attempts: 1, hintsUsed: 0, misconceptions: [], at });
    const s = createInitialState();
    act(() =>
      updateLearner(() => ({
        ...s,
        currentTopicId: "times-tables",
        results: [wrong(1), wrong(2)],
        topics: { "times-tables": { ...(s.topics["times-tables"] ?? {}), assessment: { status: "complete", order: [], index: 0, evaluations: {}, responses: {}, timesCompleted: 1, last: { completedAt: 3, order: [], evaluations: {}, responses: {}, seed: 1, form: "A" } } } } as never,
      })),
    );
    render(<PlanScreen />);
    const day1 = screen.getByRole("heading", { name: /^Day 1/ }).closest("li")!;
    expect(within(day1).getAllByText(/^Review · /).length).toBe(1);
    expect(within(day1).getByText(/needs another look/)).toBeTruthy();
  });
});
