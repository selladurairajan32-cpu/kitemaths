// A parameter that shadows globalThis is fine; the real destructure in the other function is not.
export function local(globalThis: { localStorage: number }) {
  const { localStorage } = globalThis;
  return localStorage;
}
export function real() {
  const { sessionStorage } = globalThis;
  return sessionStorage;
}
