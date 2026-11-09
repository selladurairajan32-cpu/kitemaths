// Destructuring capability-like names from an ordinary object is fine.
export function f(props: { document: string; localStorage: string; fetch: string }) {
  const { document, localStorage, fetch } = props;
  return document + localStorage + fetch;
}
