import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createInitialState } from "@/engine/progress";
import type { ItemResult } from "@/engine/types";
import { updateLearner } from "@/lib/store";
import { fittingStrategies, type Problem } from "@/maths/strategies";
import { StrategyReportScreen } from "./StrategyReportScreen";
import { ChooseScreen, CompareScreen, TimedStrategyScreen } from "./StrategyScreens";

/** R3 screens in jsdom: compare (MM-009), choose (MM-010), the timed challenge (MM-011) and the analytics (MM-012). */

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: () => {}, replace: () => {} }), usePathname: () => "/t/mental-maths/strategies" }));

const setResults = (results: ItemResult[]) => act(() => updateLearner(() => ({ ...createInitialState(), results })));
beforeEach(() => {
  vi.spyOn(Date, "now").mockReturnValue(1_700_000_000_000);
  setResults([]);
});
afterEach(() => vi.restoreAllMocks());

/** Reads a problem back from its on-screen text, to find the suitable method independently of the screen. */
function parseProblem(text: string): Problem {
  const n = (s: string) => Number(s.replace(/,/g, ""));
  let m = /([\d,]+) ([+−×÷]) ([\d,]+)/.exec(text);
  if (m) return { op: m[2] as Problem["op"], nums: [n(m[1]), n(m[3])] };
  m = /(\d+)% of ([\d,]+)/.exec(text);
  if (m) return { op: "% of", nums: [n(m[1]), n(m[2])] };
  m = /(\d+)\/(\d+) of ([\d,]+)/.exec(text);
  if (m) return { op: "fraction of", nums: [n(m[1]), n(m[2]), n(m[3])] };
  m = /(\d+)²/.exec(text);
  return { op: "²", nums: [n(m![1])] };
}

describe("compare the methods (MM-009)", () => {
  it("accepts any method that works: the standard one or an efficient alternative", async () => {
    const user = userEvent.setup();
    const first = render(<CompareScreen />);
    await user.click(screen.getByRole("button", { name: /Standard method/ }));
    expect(screen.getByText("That method works")).toBeTruthy();
    first.unmount();
    render(<CompareScreen />);
    const alternative = screen.getAllByRole("button").find((b) => /Method [A-C]/.test(b.textContent ?? "") && !/Standard method|Another way/.test(b.textContent ?? ""))!;
    await user.click(alternative);
    expect(screen.getByText("That method works")).toBeTruthy();
  });

  it("shows a method with one wrong step, rejects it and points to the step", async () => {
    const user = userEvent.setup();
    render(<CompareScreen />);
    // Find a round with a flawed method (deterministic for the pinned clock), moving on through the rounds.
    for (let round = 0; round < 5 && !screen.queryByRole("button", { name: /Another way/ }); round++) {
      await user.click(screen.getByRole("button", { name: /Standard method/ }));
      await user.click(screen.getByRole("button", { name: /Next/ }));
    }
    await user.click(screen.getByRole("button", { name: /Another way/ }));
    expect(screen.getByText("Not that one")).toBeTruthy();
    expect(screen.getByText("Goes wrong")).toBeTruthy();
    expect(screen.getByText(/This step (adds|takes away), but it should/)).toBeTruthy();
  });
});

describe("choose and say why (MM-010)", () => {
  it("rejects a method the numbers don't suit, and needs the right reason for full credit", async () => {
    const user = userEvent.setup();
    render(<ChooseScreen />);
    const p = parseProblem(screen.getByRole("heading", { level: 1 }).textContent!);
    const suitable = new Set(fittingStrategies(p).map((s) => s.name));
    const buttons = within(screen.getByRole("group", { name: /Pick a method/ })).getAllByRole("button");
    const right = buttons.find((b) => [...suitable].some((n) => b.textContent!.startsWith(n)))!;
    await user.click(right);
    // The reasons: exactly one is the chosen method's justification.
    const reasons = within(screen.getByRole("group", { name: /Why does it work/ })).getAllByRole("button");
    expect(reasons.length).toBe(3);
    // Exactly one reason is the chosen method's own justification, taken from the catalogue.
    const chosen = fittingStrategies(p).find((st) => right.textContent!.startsWith(st.name))!;
    expect(reasons.filter((b) => b.textContent === chosen.why).length).toBe(1);
    await user.click(reasons.find((b) => b.textContent === chosen.why)!);
    expect(screen.getByText("Right method, right reason")).toBeTruthy();
  });

  it("says why an unsuitable method doesn't fit", async () => {
    const user = userEvent.setup();
    render(<ChooseScreen />);
    const p = parseProblem(screen.getByRole("heading", { level: 1 }).textContent!);
    const suitable = new Set(fittingStrategies(p).map((s) => s.name));
    const wrong = within(screen.getByRole("group", { name: /Pick a method/ }))
      .getAllByRole("button")
      .find((b) => ![...suitable].some((n) => b.textContent!.startsWith(n)))!;
    await user.click(wrong);
    expect(screen.getByText("Not for these numbers")).toBeTruthy();
  });
});

describe("one-minute challenge (MM-011)", () => {
  const untimed = (n: number, ok: boolean): ItemResult[] =>
    Array.from({ length: n }, (_, i) => ({ questionId: `q${i}`, skill: "mental-maths.squares", context: "practice", correct: ok, firstTry: ok, attempts: 1, hintsUsed: 0, misconceptions: [], at: i + 1 }));

  it("stays closed until there is enough accurate untimed practice", () => {
    setResults(untimed(9, true));
    render(<TimedStrategyScreen />);
    expect(screen.getByText("Not open yet")).toBeTruthy();
  });

  it("opens after 10 untimed answers at 80% or more, judges accuracy first and compares only with the child's own runs", async () => {
    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval", "setTimeout"] });
    try {
      setResults(untimed(10, true));
      render(<TimedStrategyScreen />);
      await act(async () => screen.getByRole("button", { name: /Start/ }).click());
      expect(screen.getByRole("timer")).toBeTruthy();
      // Answer one question wrong on purpose, then let the minute run out.
      fireEvent.change(screen.getByLabelText("Your answer"), { target: { value: "1" } });
      await act(async () => screen.getByRole("button", { name: "Enter" }).click());
      expect(screen.getByText("Not that one. Next!")).toBeTruthy();
      vi.mocked(Date.now).mockReturnValue(1_700_000_000_000 + 61_000);
      await act(async () => vi.advanceTimersByTime(1000));
      // Accuracy first: the headline is how many were right, then the share right.
      expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("0 right out of 1");
      expect(screen.getByText("0% right")).toBeTruthy();
      expect(screen.getByText(/Your first one-minute challenge/)).toBeTruthy();
      expect(document.body.textContent).not.toMatch(/\b(rank|ranked|leaderboard|top \d+|other children|beat)\b/i);
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("mental-strategy analytics (MM-012)", () => {
  it("shows the measures in separate columns and warns when a faster run hides lower accuracy", () => {
    const r = (ok: boolean, extra: Partial<ItemResult>): ItemResult => ({
      questionId: "q", skill: "mental-maths.squares", context: "practice", correct: ok, firstTry: ok, attempts: 1, hintsUsed: 0, misconceptions: [], at: 1, ...extra,
    });
    const run = (s: string, pattern: boolean[], at: number) => pattern.map((ok, i) => r(ok, { context: "timed", id: `timed-mm:${s}:${i}`, at: at + i, durationMs: 3000 }));
    setResults([
      r(true, { durationMs: 4000 }),
      r(false, { durationMs: 8000, hintsUsed: 1 }),
      ...run("a", [true, true, true, true], 100), // 4 of 4
      ...run("b", [true, true, false, false, false, false], 200), // 2 of 6: more answered, smaller share right
    ]);
    render(<StrategyReportScreen />);
    const row = screen.getByRole("rowheader", { name: "Square patterns" }).closest("tr")!;
    const cells = within(row).getAllByRole("cell").map((c) => c.textContent);
    // Hand count: 2 untimed answers, 1 right; no method choices; independence 1 of 2; 1 hint; median untimed 6.0 s; timed 3.0 s.
    expect(cells).toEqual(["50% of 2", "—", "50%", "1", "6.0 s", "3.0 s"]);
    expect(screen.getByRole("status").textContent).toMatch(/Accuracy has dropped, so speed is not an improvement/);
  });
});
