import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { VisualRenderer } from "./Visuals";

/** D-037 (Phase A): a picture's caption is drawn as maths, never as raw `{n/d}` markup. */
describe("fraction pictures (component)", () => {
  it("draws a diagram caption's fractions as fractions, not braces", () => {
    const { container } = render(<VisualRenderer spec={{ type: "diagram", diagram: { shape: "bar", parts: 7, shaded: [0, 1, 2, 3, 4] }, caption: "{2/7} + {3/7} = {5/7}" }} />);
    const caption = container.querySelector("figcaption")!;
    expect(caption.textContent).not.toContain("{");
    expect(caption.textContent).not.toContain("}");
  });
});
