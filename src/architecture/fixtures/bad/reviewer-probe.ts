// The independent reviewer's probe: a side-effect UI import, a dynamic React import and browser storage.
import "@/components/ui/Button";
export async function save(v: string) {
  await import("react");
  window.localStorage.setItem("k", v);
}
