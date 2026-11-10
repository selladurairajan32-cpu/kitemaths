/** Colour classes for one place value (the same shape as the explainer's block tone). */
export interface Tone {
  soft: string;
  edge: string;
  ink: string;
  chip: string;
  solid: string;
}

/**
 * One colour per part of the second number, used in every chapter: everything for "× 4" is orange (blocks, area-model
 * pieces, written row, carry), everything for "× 10" is blue. The shared colour is what links the three ways.
 */
const ONES: Tone = { soft: "fill-num-soft", edge: "stroke-num", ink: "fill-num-strong", chip: "bg-num-soft text-num-strong", solid: "fill-num" };
const TENS: Tone = { soft: "fill-den-soft", edge: "stroke-den", ink: "fill-den-strong", chip: "bg-den-soft text-den-strong", solid: "fill-den" };
const HUNDREDS: Tone = { soft: "fill-leaf-soft", edge: "stroke-leaf", ink: "fill-ok", chip: "bg-leaf-soft text-ok", solid: "fill-leaf" };
export const TOTAL: Tone = { soft: "fill-ok-soft", edge: "stroke-ok", ink: "fill-ok", chip: "bg-ok-soft text-ok", solid: "fill-ok" };

/** The tone for a part of the second number (4 → ones, 10 → tens, 300 → hundreds). */
export function toneFor(part: number): Tone {
  const place = 10 ** (String(part).length - 1);
  return place === 1 ? ONES : place === 10 ? TENS : HUNDREDS;
}
