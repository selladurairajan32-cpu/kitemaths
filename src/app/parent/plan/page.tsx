import type { Metadata } from "next";
import { PlanScreen } from "@/components/screens/PlanScreen";
import { ParentGate } from "@/components/ui/ParentGate";

export const metadata: Metadata = { title: "Weekly plan · Kite Maths" };

export default function Page() {
  return (
    <ParentGate>
      <PlanScreen />
    </ParentGate>
  );
}
