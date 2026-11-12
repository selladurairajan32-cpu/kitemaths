import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getLearner, resetLearner } from "@/lib/store";
import { AddDifferentPage } from "./AddDifferentPage";

/** D-041 pilot page in jsdom: three ways to learn, the remembered choice, Kip's offer, and Try it by keyboard. */

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: () => {}, replace: () => {} }), usePathname: () => "/t/fractions-2/explain/add-different" }));

beforeEach(() => {
  resetLearner();
  history.replaceState(null, "", "/t/fractions-2/explain/add-different");
});

const tab = (name: string) => screen.getByRole("tab", { name: new RegExp(name) });
const checkpoint = () => within(screen.getByText("Quick check").closest("section")!);
async function toCheckpoint(user: ReturnType<typeof userEvent.setup>) {
  const skip = screen.getByRole("button", { name: "Skip to the next part" });
  while (!(skip as HTMLButtonElement).disabled) await user.click(skip);
}

describe("three ways to learn: adding fractions with different denominators (D-041)", () => {
  it("offers Watch, Step through and Try it, opens on Watch with the film, captions source and transcript", () => {
    render(<AddDifferentPage />);
    expect(screen.getByRole("heading", { level: 1, name: "Adding fractions with different denominators" })).toBeTruthy();
    expect(screen.getAllByRole("tab").map((t) => t.textContent)).toEqual([expect.stringMatching(/^Watch/), expect.stringMatching(/^Step through/), expect.stringMatching(/^Try it/)]);
    expect(tab("Watch").getAttribute("aria-selected")).toBe("true");
    const video = document.querySelector("video")!;
    expect(video.getAttribute("src")).toBe("/films/add-different/film.mp4");
    expect(video.getAttribute("poster")).toBe("/films/add-different/poster.jpg");
    expect(video.autoplay).toBe(false);
    expect(screen.getByText("Read the transcript")).toBeTruthy();
    expect(screen.getByRole("button", { name: /Sam ate one third of a pizza/ })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Common denominator" })).toBeTruthy();
  });

  it("remembers the chosen way for next time, and moves between ways with the arrow keys", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<AddDifferentPage />);
    await user.click(tab("Step through"));
    expect(getLearner().settings.explainMode).toBe("step");
    expect(window.location.hash).toBe("#step");
    expect(screen.getByText(/How much did they eat altogether/)).toBeTruthy();
    tab("Step through").focus();
    await user.keyboard("{ArrowRight}");
    expect(tab("Try it").getAttribute("aria-selected")).toBe("true");
    unmount();
    history.replaceState(null, "", "/t/fractions-2/explain/add-different");
    render(<AddDifferentPage />);
    expect(tab("Try it").getAttribute("aria-selected")).toBe("true");
  });

  it("steps through with a voice switch, and after two wrong answers Kip offers another way", async () => {
    const user = userEvent.setup();
    history.replaceState(null, "", "/t/fractions-2/explain/add-different#step");
    render(<AddDifferentPage />);
    const voice = screen.getByRole("button", { name: /Voice on/ });
    await user.click(voice);
    expect(getLearner().settings.explainVoice).toBe(false);
    expect(screen.getByRole("button", { name: /Voice off/ })).toBeTruthy();
    await toCheckpoint(user);
    expect(screen.getByRole("heading", { name: "One third is how many twelfths?" })).toBeTruthy();
    for (const wrong of ["3", "12"]) {
      await user.type(checkpoint().getByLabelText("Your answer"), wrong);
      await user.click(checkpoint().getByRole("button", { name: "Check" }));
      await toCheckpoint(user);
    }
    expect(screen.getByText("That one is tricky. Want to see it another way?")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Try it" }));
    expect(tab("Try it").getAttribute("aria-selected")).toBe("true");
  });

  it("does Try it by keyboard: cut the pizzas until the slices match, then place all seven twelfths", async () => {
    const user = userEvent.setup();
    history.replaceState(null, "", "/t/fractions-2/explain/add-different#try");
    render(<AddDifferentPage />);
    const sam = screen.getByLabelText(/Sam's cutter/);
    const zara = screen.getByLabelText(/Zara's cutter/);
    fireEvent.change(sam, { target: { value: "2" } });
    expect(screen.getByText(/6 slices and 4 slices: not the same size yet/)).toBeTruthy();
    fireEvent.change(sam, { target: { value: "4" } });
    fireEvent.change(zara, { target: { value: "3" } });
    expect(screen.getByText(/both pizzas have 12 slices/)).toBeTruthy();
    for (let i = 0; i < 7; i++) {
      const piece = screen.getAllByRole("button", { name: /put it on the pizza/ })[0]!;
      piece.focus();
      await user.keyboard("{Enter}");
    }
    await act(async () => {});
    expect(screen.getByText("Four twelfths and three twelfths make seven twelfths.")).toBeTruthy();
    expect(screen.getByRole("img", { name: "The whole pizza: 7 of 12 slices" })).toBeTruthy();
  });

  it("ends every way with the same island question, marked by the island", async () => {
    const user = userEvent.setup();
    render(<AddDifferentPage />);
    const final = within(screen.getByText("Mini-checkpoint").closest("section")!);
    expect(final.getByRole("heading", { name: /Work out/ })).toBeTruthy();
    const options = final.getAllByRole("radio");
    expect(options.length).toBeGreaterThanOrEqual(3);
    await user.click(options[0]!);
    await user.click(final.getByRole("button", { name: "Check" }));
    expect(final.getByRole("status").textContent).toMatch(/^(Correct!|Not yet\.)/);
  });
});
