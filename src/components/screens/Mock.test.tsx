import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_MOCK } from "@/engine/mock";
import { createInitialState } from "@/engine/progress";
import type { ItemResult } from "@/engine/types";
import { getLearner, updateLearner } from "@/lib/store";
import type { KitQuestion } from "@/topics/kit/types";
import { buildPaper, MockScreen, sectionBounds } from "./MockScreen";
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

describe("mock formats from verified profiles (D-037)", () => {
  afterEach(() => vi.useRealTimers());

  it("shows a chosen provider's verified facts with their source, and unknown for the rest", async () => {
    const user = userEvent.setup();
    render(<MockScreen />);
    await user.click(screen.getByRole("button", { name: /^ISEB Common Pre-Tests/ }));
    const facts = screen.getByRole("heading", { name: "Which test?" }).closest("section")!;
    expect(within(facts).getByText(/40 minutes/)).toBeTruthy();
    expect(within(facts).getAllByRole("link", { name: "ISEB" })[0].getAttribute("href")).toMatch(/^https:\/\/iseb\.co\.uk\//);
    expect(within(facts).getByText(/Calculators:/).parentElement!.textContent).toMatch(/Calculators: unknown/);
    expect(screen.getByText(/Timing: 40 minutes, from ISEB/)).toBeTruthy();
  });

  it("shares questions out between timed sections (hand-worked)", () => {
    expect(sectionBounds(12, 3)).toEqual([[0, 4], [4, 8], [8, 12]]);
    expect(sectionBounds(7, 2)).toEqual([[0, 3], [3, 7]]);
    expect(sectionBounds(6, 1)).toEqual([[0, 6]]);
  });

  it("builds an answer-sheet paper of lettered options and a two-part paper of linked (a) and (b) pairs", () => {
    const sheet = buildPaper("s1", { ...DEFAULT_MOCK, format: "answer-sheet", questionCount: 12, profileId: "general" });
    expect(sheet.every((q) => q.kind === "choose")).toBe(true);
    const lettered = sheet.filter((q) => q.kind === "choose" && q.options.length === 5);
    expect(lettered.length).toBeGreaterThan(0);
    for (const q of lettered) if (q.kind === "choose") expect(q.options.map((o) => o.text.slice(0, 4))).toEqual(["(A) ", "(B) ", "(C) ", "(D) ", "(E) "]);
    // Questions that were already multiple choice are lettered too, in a fixed order.
    for (const q of sheet) if (q.kind === "choose") expect(q.fixedOrder && q.options.every((o, i) => o.text.startsWith(`(${"ABCDE"[i]}) `)), q.id).toBe(true);

    const parts = buildPaper("s2", { ...DEFAULT_MOCK, format: "two-part", questionCount: 12, profileId: "general" });
    const key = (q: KitQuestion) => q.id.split(":")[1].split(".")[1];
    expect(parts.length).toBe(12);
    expect(parts.map(key).filter((k) => k.startsWith("mx-twopart")).length).toBe(8);
    parts.forEach((q, i) => {
      if (key(q) !== "mx-twopart-a") return;
      expect(key(parts[i + 1])).toBe("mx-twopart-b");
      expect(parts[i + 1].id.replace("mx-twopart-b", "mx-twopart-a")).toBe(q.id);
    });
  });

  it("gives each section its own clock, moves on when it runs out, never goes back, and records the section", () => {
    vi.useFakeTimers();
    render(<MockScreen />);
    fireEvent.click(screen.getByRole("button", { name: "6" }));
    fireEvent.click(screen.getByRole("button", { name: "10 min" }));
    fireEvent.click(screen.getByRole("button", { name: "2 sections" }));
    fireEvent.click(screen.getByRole("button", { name: /Start the mock/ }));
    expect(screen.getByText(/Section 1 of 2 · Question 1 of 6/)).toBeTruthy();
    expect(screen.getByRole("timer").textContent).toBe("5:00");
    expect(within(screen.getByRole("navigation", { name: "Questions" })).getAllByRole("button").map((b) => b.textContent)).toEqual(["1", "2", "3"]);
    act(() => { vi.advanceTimersByTime(5 * 60_000 + 600); });
    expect(screen.getByText(/Section 2 of 2 · Question 4 of 6/)).toBeTruthy();
    expect(screen.getByRole("timer").textContent).toMatch(/^[45]:\d\d$/);
    expect(within(screen.getByRole("navigation", { name: "Questions" })).getAllByRole("button").map((b) => b.textContent)).toEqual(["4", "5", "6"]);
    expect(screen.queryByRole("button", { name: "Back" })).toBeNull();
    act(() => { vi.advanceTimersByTime(5 * 60_000 + 600); });
    expect(screen.getByRole("heading", { name: "0 of 6 right" })).toBeTruthy();
    const metas = getLearner().results.filter((r) => r.mock).map((r) => r.mock!);
    expect(metas.map((m) => m.section)).toEqual([0, 0, 0, 1, 1, 1]);
    expect(metas.every((m) => m.sectionMs === 5 * 60_000 && m.endedAtMs === 5 * 60_000)).toBe(true);
  });

  it("stores an answer-sheet mock as such and reviews it with the same lettered options", async () => {
    const user = userEvent.setup();
    render(<MockScreen />);
    await user.click(screen.getByRole("button", { name: "6" }));
    await user.click(screen.getByRole("button", { name: "Answer sheet (A to E)" }));
    await user.click(screen.getByRole("button", { name: /Start the mock/ }));
    expect(screen.getByText(/Answer sheet: choose one letter, A to [D-E]\./)).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Finish the mock" }));
    expect(getLearner().results.filter((r) => r.mock).every((r) => r.mock!.sheet === true && r.mock!.format === "multiple-choice")).toBe(true);
    const review = screen.getByRole("heading", { name: "Question by question" }).closest("section")!;
    // Every reviewed question shows its options lettered, starting at (A).
    const items = within(review).getAllByRole("listitem");
    expect(items.length).toBe(6);
    for (const li of items) expect(within(li).getAllByText(/^\(A\) /).length).toBeGreaterThanOrEqual(1);
  });

  it("lets the child end a section early with Start the next section", async () => {
    const user = userEvent.setup();
    render(<MockScreen />);
    await user.click(screen.getByRole("button", { name: "6" }));
    await user.click(screen.getByRole("button", { name: "3 sections" }));
    await user.click(screen.getByRole("button", { name: /Start the mock/ }));
    expect(screen.getByText(/can't come back to it/)).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Start the next section" }));
    expect(screen.getByText(/Section 2 of 3 · Question 3 of 6/)).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Start the next section" }));
    await user.click(screen.getByRole("button", { name: "Finish the mock" }));
    expect(screen.getByRole("heading", { name: "0 of 6 right" })).toBeTruthy();
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
