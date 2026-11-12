import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RatioExplanation } from "./RatioExplanation";

/** D-040: the ratio explanation page in jsdom, on the 2.5D picture (no WebGL here). */

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: () => {}, replace: () => {} }), usePathname: () => "/t/ratio-algebra/explain/ratio" }));

beforeEach(() => history.replaceState(null, "", "/t/ratio-algebra/explain/ratio"));

/** The checkpoint's own answer box (the final check below has one too). */
const checkpointInput = () => within(screen.getByText("Quick check").closest("section")!).getByLabelText("Your answer");
const checkpointCheck = () => within(screen.getByText("Quick check").closest("section")!).getByRole("button", { name: "Check" });

/** Skips through the current chapter to its checkpoint. */
async function toCheckpoint(user: ReturnType<typeof userEvent.setup>) {
  const skip = screen.getByRole("button", { name: "Skip to the next part" });
  while (!(skip as HTMLButtonElement).disabled) await user.click(skip);
}

describe("ratio explanation page (D-040)", () => {
  it("opens on the visual story with a caption, playback controls and the later chapters locked", () => {
    render(<RatioExplanation />);
    expect(screen.getByRole("heading", { level: 1, name: /Ratio and proportion/ })).toBeTruthy();
    expect(screen.getByRole("tab", { name: "Visual story", selected: true })).toBeTruthy();
    expect(screen.getByText(/2 blue cubes and 3 orange cubes make one group/)).toBeTruthy();
    expect(screen.getByRole("button", { name: "Play" })).toBeTruthy();
    const chapters = screen.getByRole("navigation", { name: "Chapters" });
    expect((within(chapters).getByRole("button", { name: /2\. Sharing/ }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("asks a checkpoint at the end of a chapter; a wrong answer gives a hint and Show me, a right one unlocks the next chapter", async () => {
    const user = userEvent.setup();
    render(<RatioExplanation />);
    await toCheckpoint(user);
    expect(screen.getByRole("heading", { name: /how many orange cubes go with 6 blue cubes/ })).toBeTruthy();
    await user.type(checkpointInput(), "6");
    await user.click(checkpointCheck());
    // The key beat replays; skipping it brings the question back with a hint.
    await toCheckpoint(user);
    expect(screen.getByText(/Hint: 6 blue is 3 groups of 2/)).toBeTruthy();
    expect(screen.getByRole("button", { name: "Show me" })).toBeTruthy();
    await user.type(checkpointInput(), "9");
    await user.click(checkpointCheck());
    expect(screen.getByText("Yes, that's right!")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: /Next chapter: Sharing/ }));
    expect(screen.getByText(/Share 35 sweets in the ratio 2 : 3/)).toBeTruthy();
  });

  it("switches tabs with the arrow keys and remembers the tab in the address", async () => {
    const user = userEvent.setup();
    render(<RatioExplanation />);
    screen.getByRole("tab", { name: "Visual story" }).focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Step by step", selected: true })).toBeTruthy();
    expect(window.location.hash).toBe("#steps");
    expect(screen.getByText(/35 ÷ 5 =/)).toBeTruthy();
  });

  it("shows every beat of a chapter at once in Step view", async () => {
    const user = userEvent.setup();
    render(<RatioExplanation />);
    await user.click(screen.getByRole("button", { name: "Step view" }));
    expect(screen.getAllByText(/^Step \d$/).length).toBe(3);
    await user.click(screen.getByRole("button", { name: /go to the quick check/ }));
    expect(screen.getByRole("heading", { name: /how many orange cubes/ })).toBeTruthy();
  });

  it("scales the recipe with the slider", async () => {
    const user = userEvent.setup();
    render(<RatioExplanation />);
    await user.click(screen.getByRole("tab", { name: "Real-life example" }));
    expect(screen.getAllByText(/Pancakes for 6 people: 3 eggs and 450 ml of milk/).length).toBeGreaterThan(0);
    // jsdom doesn't move a range input with the arrow keys, so set it as the browser would.
    fireEvent.change(screen.getByLabelText(/People:/), { target: { value: "8" } });
    expect(screen.getAllByText(/Pancakes for 8 people: 4 eggs and 600 ml of milk/).length).toBeGreaterThan(0);
  });

  it("walks a child through sharing by hand in Try it, by keyboard", async () => {
    const user = userEvent.setup();
    render(<RatioExplanation />);
    await user.click(screen.getByRole("tab", { name: "Try it" }));
    await user.type(screen.getByLabelText("How many sweets are in one group?"), "4{Enter}");
    for (let i = 0; i < 5; i++) await user.click(screen.getByRole("button", { name: "Deal one group of 4" }));
    await user.type(screen.getByLabelText("How many sweets does Amir get?"), "15{Enter}");
    expect(screen.getByText(/Yes! 5 groups × 3 = 15 for Amir/)).toBeTruthy();
    expect(screen.getByRole("button", { name: /Next problem/ })).toBeTruthy();
  });

  it("fades in hints one at a time", async () => {
    const user = userEvent.setup();
    render(<RatioExplanation />);
    const hints = screen.getByRole("heading", { name: "Hints" }).closest("section")!;
    expect(within(hints).getAllByRole("listitem").length).toBe(1);
    await user.click(within(hints).getByRole("button", { name: "Another hint" }));
    expect(within(hints).getAllByRole("listitem").length).toBe(2);
  });
});
