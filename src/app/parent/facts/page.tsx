import type { Metadata } from "next";
import { FactReportScreen } from "@/components/screens/FactReportScreen";
import { ParentGate } from "@/components/ui/ParentGate";

export const metadata: Metadata = { title: "Times tables · Kite Maths" };

export default function Page() {
  return (
    <ParentGate>
      <FactReportScreen />
    </ParentGate>
  );
}
