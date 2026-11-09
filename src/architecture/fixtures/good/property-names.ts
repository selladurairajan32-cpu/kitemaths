export const o = { document: 1, window: 2, fetch: 3 };
export function read(x: { document: number; history: string[] }) {
  return x.document + x.history.length;
}
