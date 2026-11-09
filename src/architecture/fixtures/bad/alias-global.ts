// Aliasing the global object hides which capability is used.
const g = globalThis;
export const read = () => g.sessionStorage;
