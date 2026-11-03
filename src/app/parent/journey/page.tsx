import type { Metadata } from "next";
import { JourneyScreen } from "@/components/screens/JourneyScreen";
import { ParentGate } from "@/components/ui/ParentGate";
import { ActiveTopicProvider } from "@/topics/ActiveTopic";

export const metadata: Metadata = { title: "Journey detail · Kite Maths" };

export default function Page() {
  return (
    <ParentGate>
      <ActiveTopicProvider>
        <JourneyScreen />
      </ActiveTopicProvider>
    </ParentGate>
  );
}
