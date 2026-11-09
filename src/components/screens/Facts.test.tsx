import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createInitialState } from "@/engine/progress";
import { updateLearner } from "@/lib/store";
import type { ItemResult } from "@/engine/types";
import { FactExplorerScreen } from "./FactExplorerScreen";
import { FactReportScreen } from "./FactReportScreen";
import { FactRunScreen, FactsHubScreen } from "./FactsScreens";

/** R2 screens in jsdom: the explorer's visuals (TT-007), the modes' promises (TT-009, TT-010) and the report (TT-011). */

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: () => {}, replace: () => {} }), usePathname: () => "/t/times-tables/facts" }));
vi.mock("@/lib/sound", () => ({ playSound: () => {} }));

beforeEach(() => {
  window.localStorage.setItem("kite-maths:v2", JSON.stringify(createInitialState()));
});

describe("times-table explorer (TT-007)", () => {
  it("draws every chosen fact correctly: the array has a × b dots, the jumps reach a × b, the family has four facts", async () => {
    const user = userEvent.setup();
    render(<FactExplorerScreen />);
    // Every value in the grid, 1 × 1 to 12 × 12 (AC3: correct for all supported values). Oracle: the product, by hand.
    for (const [a, b] of [[1, 1], [3, 12], [7, 8], [12, 12], [12, 1]]) {
      await user.click(screen.getByRole("button", { name: `${a} × ${b} = ${a * b}` }));
      const panel = screen.getByRole("heading", { name: `${a} × ${b} = ${a * b}` }).closest("section")!;
      expect(panel.querySelectorAll("circle").length).toBe(a * b);
      expect(within(panel).getByText(`${a} rows of ${b}`)).toBeTruthy();
      // The family, each distinct fact once: four facts, or two for a square number.
      const family = new Set([`${a} × ${b} = ${a * b}`, `${b} × ${a} = ${a * b}`, `${a * b} ÷ ${a} = ${b}`, `${a * b} ÷ ${b} = ${a}`]);
      const items = within(panel).getAllByRole("listitem").map((li) => li.textContent);
      expect(items).toEqual([...family]);
    }
  });

  it("lights up multiples and says how many there are", async () => {
    const user = userEvent.setup();
    render(<FactExplorerScreen />);
    await user.click(screen.getByRole("button", { name: "12", pressed: false }));
    // Hand count: products a × b (1–12 each) divisible by 12. Counted independently below by brute force on the grid labels.
    const lit = screen.getAllByRole("button").filter((b) => /a multiple of 12$/.test(b.getAttribute("aria-label") ?? "")).length;
    expect(screen.getByText(new RegExp(`^${lit} of the 144 squares are multiples of 12`))).toBeTruthy();
    expect(lit).toBeGreaterThan(0);
  });
});

describe("fact modes (TT-009, TT-010)", () => {
  it("labels timed practice as a simulation, offers no-clock practice, and starts with unscored warm-ups", async () => {
    const user = userEvent.setup();
    render(<FactRunScreen mode="timed" />);
    expect(screen.getByText(/This is a practice, not the official check/)).toBeTruthy();
    expect(screen.getByRole("link", { name: "Practise without a timer" })).toBeTruthy();
    await user.click(screen.getByRole("button", { name: /Start the warm-up/ }));
    expect(screen.getByText("Warm-up: not scored")).toBeTruthy();
    expect(screen.getByRole("timer")).toBeTruthy();
  });

  it("has no countdown in untimed mode, keeps hints and retries, and lets the child choose the session length", async () => {
    const user = userEvent.setup();
    render(<FactRunScreen mode="untimed" />);
    await user.click(screen.getByRole("button", { name: "5" }));
    await user.click(screen.getByRole("button", { name: /^Start/ }));
    expect(screen.queryByRole("timer")).toBeNull();
    expect(screen.getByText("Question 1 of 5")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Show a hint" }));
    expect(screen.getByText("Hint:")).toBeTruthy();
    // A wrong answer leaves the question open to try again.
    await user.type(screen.getByLabelText("Your answer"), "1");
    await user.click(screen.getByRole("button", { name: "Enter" }));
    expect(screen.getByText("Not yet")).toBeTruthy();
    expect(screen.getByText("Question 1 of 5")).toBeTruthy();
    // No clock and no speed anywhere on the screen (AC3).
    expect(document.body.textContent).not.toMatch(/\d+ s\b|seconds|faster|speed/i);
  });

  it("ends a timed run with the score in time and the facts to revisit", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: false });
    try {
      render(<FactRunScreen mode="timed" />);
      await act(async () => screen.getByRole("button", { name: /Start the warm-up/ }).click());
      // 3 warm-ups and 25 questions, each left to time out (6 s) and pause (3 s): nothing typed, so nothing is right.
      for (let i = 0; i < 28; i++) {
        await act(async () => vi.advanceTimersByTime(6100));
        await act(async () => vi.advanceTimersByTime(3000));
      }
      expect(screen.getByRole("heading", { name: "0 out of 25 in time" })).toBeTruthy();
      expect(screen.getByRole("heading", { name: "Facts to revisit" })).toBeTruthy();
      expect(screen.getAllByRole("listitem").length).toBe(25);
      expect(screen.getByText(/not the official DfE check/)).toBeTruthy();
    } finally {
      vi.useRealTimers();
    }
  });

  it("times out after 6 seconds, then pauses for 3 before the next question", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: false });
    try {
      render(<FactRunScreen mode="timed" />);
      await act(async () => screen.getByRole("button", { name: /Start the warm-up/ }).click());
      expect(screen.getByText("Warm-up: not scored")).toBeTruthy();
      await act(async () => vi.advanceTimersByTime(6100));
      expect(screen.getByText("Next question coming…")).toBeTruthy();
      await act(async () => vi.advanceTimersByTime(3000));
      expect(screen.queryByText("Next question coming…")).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("facts hub (TT-004)", () => {
  it("shows the child which facts are known, growing, not yet secure and new, and the next table to learn", () => {
    const answer = (a: number, b: number, ok: boolean, at: number): ItemResult => ({
      questionId: `q${at}`, skill: "times-tables.two-five-ten", context: "practice", correct: ok, firstTry: ok, attempts: 1, hintsUsed: 0,
      misconceptions: [], fact: { a, b, form: "mul" }, at,
    });
    // Hand-built: 2 × 3 known (three recalls), 2 × 4 growing (one recall), 2 × 5 not yet (one miss); the rest new.
    const results = [answer(2, 3, true, 1), answer(2, 3, true, 2), answer(2, 3, true, 3), answer(2, 4, true, 4), answer(2, 5, false, 5)];
    act(() => updateLearner(() => ({ ...createInitialState(), results })));
    render(<FactsHubScreen />);
    expect(screen.getByLabelText("2 × 3 = 6: Known")).toBeTruthy();
    expect(screen.getByLabelText("2 × 4 = 8: Growing")).toBeTruthy();
    expect(screen.getByLabelText("2 × 5 = 10: Not yet")).toBeTruthy();
    expect(screen.getByLabelText("7 × 8 = 56: New")).toBeTruthy();
    expect(screen.getByText(/Next up: the 2s\./)).toBeTruthy();
    expect(screen.getByText("1 known · 1 growing · 1 not yet · 8 new")).toBeTruthy();
  });
});

describe("fact report (TT-011)", () => {
  it("keeps timed answers apart from untimed ones and makes no comparison with other children", () => {
    const fact = (ok: boolean, extra: Partial<ItemResult> = {}): ItemResult => ({
      questionId: "times-tables.fact:6x7:mul:6", skill: "times-tables.six-seven-nine", context: "practice", correct: ok, firstTry: ok, attempts: 1,
      hintsUsed: 0, misconceptions: [], fact: { a: 6, b: 7, form: "mul" }, at: 1, ...extra,
    });
    const s = { ...createInitialState(), results: [fact(true), fact(false, { timed: true, context: "timed", at: 2 })] };
    act(() => updateLearner(() => s));
    render(<FactReportScreen />);
    const row = screen.getByRole("rowheader", { name: "6 × 7 = 42" }).closest("tr")!;
    const cells = within(row).getAllByRole("cell").map((c) => c.textContent);
    // Status, untimed right, last answers, division, timed right, slips.
    expect(cells[1]).toBe("1 / 1");
    expect(cells[4]).toBe("0 / 1");
    expect(screen.getByText(/never decide whether a fact is known/)).toBeTruthy();
    expect(document.body.textContent).not.toMatch(/\b(average|other children|percentile|ranked|top \d+%|below expected)\b/i);
  });
});
