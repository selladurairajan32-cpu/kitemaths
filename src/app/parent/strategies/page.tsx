import type { Metadata } from "next";
import { StrategyReportScreen } from "@/components/screens/StrategyReportScreen";
import { ParentGate } from "@/components/ui/ParentGate";

export const metadata: Metadata = { title: "Mental maths · Kite Maths" };

export default function Page() {
  return (
    <ParentGate>
      <StrategyReportScreen />
    </ParentGate>
  );
}
