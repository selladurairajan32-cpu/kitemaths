import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { LabStepProps } from "@/topics/types";
import { ConstructLab, trianglesOf } from "./ConstructLab";

/** D-039 (Y6.GPS.1): drawing a triangle with the on-screen ruler and protractor, by keyboard and by buttons. */

const step = {
  type: "lab",
  title: "Draw it yourself",
  body: [],
  explainer: "triangle-construct",
  numbers: [6, 4, 50, 5, 7, 110],
  challenges: ["shapes-angles.construct-draw-1", "shapes-angles.construct-draw-2"],
} as unknown as LabStepProps["step"];

/** Moves the current slider to `want` with the arrow keys (Shift for big steps), from its current value. */
function moveTo(want: number, stepSize: number) {
  const slider = screen.getByRole("slider");
  let now = Number(slider.getAttribute("aria-valuenow"));
  while (Math.abs(want - now) >= stepSize * 10) {
    fireEvent.keyDown(slider, { key: want > now ? "ArrowRight" : "ArrowLeft", shiftKey: true });
    now = Number(screen.getByRole("slider").getAttribute("aria-valuenow"));
  }
  while (now !== want) {
    fireEvent.keyDown(screen.getByRole("slider"), { key: want > now ? "ArrowRight" : "ArrowLeft" });
    now = Number(screen.getByRole("slider").getAttribute("aria-valuenow"));
  }
  fireEvent.keyDown(screen.getByRole("slider"), { key: "Enter" });
}

describe("drawing to size (Y6.GPS.1, D-039)", () => {
  it("reads the triangles from the lab numbers three at a time", () => {
    expect(trianglesOf([6, 4, 50, 5, 7, 110])).toEqual([{ base: 6, side: 4, angle: 50 }, { base: 5, side: 7, angle: 110 }]);
  });

  it("draws a triangle by keyboard alone: base, angle, second side, then join", async () => {
    const user = userEvent.setup();
    const done = vi.fn();
    render(<ConstructLab step={step} completed={[]} onChallengeComplete={done} />);
    expect(screen.getByRole("slider", { name: "Ruler: length of the base" }).getAttribute("aria-valuetext")).toBe("3 centimetres");
    moveTo(6, 0.5);
    expect(screen.getByRole("slider", { name: "Protractor: the angle at the left end" }).getAttribute("aria-valuetext")).toBe("30 degrees");
    moveTo(50, 1);
    expect(screen.getByRole("slider", { name: "Ruler: length of the second side" })).toBeTruthy();
    moveTo(4, 0.5);
    expect(screen.queryByRole("slider")).toBeNull();
    await user.click(screen.getByRole("button", { name: "Join the ends" }));
    expect(done).toHaveBeenCalledWith("shapes-angles.construct-draw-1");
    // Third side by the law of cosines: √(36 + 16 − 48 cos 50°) ≈ 4.6 cm (hand-worked: 48 × 0.643 = 30.9; √21.1 = 4.6).
    expect(screen.getByText(/The third side measures about 4\.6 cm/)).toBeTruthy();
  });

  it("nudges after a wrong check, and offers to do the step after two misses", async () => {
    const user = userEvent.setup();
    render(<ConstructLab step={step} completed={[]} onChallengeComplete={() => {}} />);
    await user.click(screen.getByRole("button", { name: "Check" }));
    expect(screen.getByText("That's 3 cm. You need 6 cm.")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Do this step for me" })).toBeNull();
    await user.click(screen.getByRole("button", { name: "Check" }));
    await user.click(screen.getByRole("button", { name: "Do this step for me" }));
    expect(screen.getByRole("slider", { name: "Protractor: the angle at the left end" })).toBeTruthy();
  });

  it("moves on to the second triangle and completes its challenge too", async () => {
    const user = userEvent.setup();
    const done = vi.fn();
    render(<ConstructLab step={step} completed={["shapes-angles.construct-draw-1"]} onChallengeComplete={done} />);
    expect(screen.getByText(/Triangle 2 of 2: sides 5 cm and 7 cm with 110°/)).toBeTruthy();
    moveTo(5, 0.5);
    moveTo(110, 1);
    moveTo(7, 0.5);
    await user.click(screen.getByRole("button", { name: "Join the ends" }));
    expect(done).toHaveBeenCalledWith("shapes-angles.construct-draw-2");
    expect(screen.queryByRole("button", { name: "Draw the next triangle" })).toBeNull();
  });

  it("shows the finished drawing when every triangle is already drawn", () => {
    render(<ConstructLab step={step} completed={["shapes-angles.construct-draw-1", "shapes-angles.construct-draw-2"]} onChallengeComplete={() => {}} />);
    expect(screen.getByText(/^Done: 5 cm, 7 cm and 110°/)).toBeTruthy();
    expect(screen.queryByRole("slider")).toBeNull();
  });
});
