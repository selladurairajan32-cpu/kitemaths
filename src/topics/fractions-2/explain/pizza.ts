/**
 * D-043: pizza geometry for the fractions pictures. Slice k of a pizza cut into n equal slices, starting at 12 o'clock
 * and going clockwise, as an SVG path. Every path has the same commands (M, L, A, Z), so one slice can glide into another
 * place by animating its `d`.
 */
export function slicePath(cx: number, cy: number, r: number, n: number, k: number): string {
  const a0 = -Math.PI / 2 + (k * 2 * Math.PI) / n;
  const a1 = a0 + (2 * Math.PI) / n;
  const p = (a: number) => `${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)}`;
  return `M ${cx} ${cy} L ${p(a0)} A ${r} ${r} 0 ${n === 1 ? 1 : 0} 1 ${p(a1)} Z`;
}

/** The middle of slice k, a fraction `f` of the way out from the centre (for toppings and numbers). */
export function sliceMid(cx: number, cy: number, r: number, n: number, k: number, f = 0.62): [number, number] {
  const a = -Math.PI / 2 + ((k + 0.5) * 2 * Math.PI) / n;
  return [cx + r * f * Math.cos(a), cy + r * f * Math.sin(a)];
}
