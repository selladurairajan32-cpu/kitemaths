import type { Metadata } from "next";
import { JourneyScreen } from "@/components/screens/JourneyScreen";

export const metadata: Metadata = { title: "Learning journey · Kite Maths" };

export default function Page() {
  return <JourneyScreen />;
}
