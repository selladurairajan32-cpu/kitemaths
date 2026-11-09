import type { Metadata } from "next";
import { ResultsScreen } from "@/components/screens/ResultsScreen";
import { ParentGate } from "@/components/ui/ParentGate";
import { ActiveTopicProvider } from "@/topics/ActiveTopic";

export const metadata: Metadata = { title: "Full report · Kite Maths" };

export default function Page() {
  return (
    <ParentGate>
      <ActiveTopicProvider choosable>
        <ResultsScreen />
      </ActiveTopicProvider>
    </ParentGate>
  );
}
