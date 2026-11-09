// Checked with Node typings only (no DOM lib): `fetch` is still a prohibited global.
export const get = () => fetch("https://example.com");
