// A parameter named globalThis is a local value, not the global object.
export function f(globalThis: { localStorage: number }) {
  const { localStorage } = globalThis;
  return localStorage;
}
