// A local `document` in one function must not hide the real global use in another.
function local() {
  const document = { title: "local" };
  return document.title;
}
export function real() {
  return document.title;
}
export const l = local;
