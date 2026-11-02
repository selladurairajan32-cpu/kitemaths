import type { Metadata } from "next";
import { ParentScreen } from "@/components/screens/ParentScreen";
import { ParentGate } from "@/components/ui/ParentGate";

export const metadata: Metadata = { title: "Grown-ups · Kite Maths" };

export default function Page() {
  return (
    <ParentGate>
      <ParentScreen />
    </ParentGate>
  );
}
