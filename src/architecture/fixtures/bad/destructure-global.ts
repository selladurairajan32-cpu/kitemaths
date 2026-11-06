// The independent reviewer's probe (DEF-030): browser storage destructured from globalThis.
export const storage = () => {
  const { localStorage: store } = globalThis;
  return store;
};
