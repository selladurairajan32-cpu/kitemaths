import type { Metadata } from "next";
import { JourneyScreen } from "@/components/screens/JourneyScreen";
import { ParentGate } from "@/components/ui/ParentGate";

export const metadata: Metadata = { title: "Journey detail · Kite Maths" };

export default function Page() {
  return (
    <ParentGate>
      <JourneyScreen />
    </ParentGate>
  );
}
