import type { Metadata } from "next";
import { ResultsScreen } from "@/components/screens/ResultsScreen";
import { ParentGate } from "@/components/ui/ParentGate";

export const metadata: Metadata = { title: "Full report · Kite Maths" };

export default function Page() {
  return (
    <ParentGate>
      <ResultsScreen />
    </ParentGate>
  );
}
