// A .tsx file is fine in a pure layer when it has no UI dependency or browser access.
export const biggest = (xs: number[]) => Math.max(...xs.map((x) => Number(x)));
