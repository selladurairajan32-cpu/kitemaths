// globalThis in a type position is not a use of it.
export type G = typeof globalThis;
export const answer = (g: G | undefined) => (g ? 1 : 0);
