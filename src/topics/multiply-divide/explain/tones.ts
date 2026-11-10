/**
 * One colour per place value of the second number, used in every scene: the "× 4" chairs, area-model row and
 * written row are all orange; the "× 10" ones are all blue. The shared colour is what links the three methods.
 */
export interface Tone {
  soft: string;
  edge: string;
  ink: string;
  chip: string;
}

const TONES: Record<number, Tone> = {
  1: { soft: "fill-num-soft", edge: "stroke-num", ink: "fill-num-strong", chip: "bg-num-soft text-num-strong" },
  10: { soft: "fill-den-soft", edge: "stroke-den", ink: "fill-den-strong", chip: "bg-den-soft text-den-strong" },
  100: { soft: "fill-leaf-soft", edge: "stroke-leaf", ink: "fill-ok", chip: "bg-leaf-soft text-ok" },
};

/** The tone for a part of the second number (4 → ones, 10 or 20 → tens, 300 → hundreds). */
export function toneFor(part: number): Tone {
  const place = 10 ** (String(part).length - 1);
  return TONES[place] ?? TONES[100]!;
}
