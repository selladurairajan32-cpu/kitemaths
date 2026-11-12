import type { Metadata } from "next";
import { PracticeHubScreen } from "@/components/screens/PracticeHubScreen";

export const metadata: Metadata = { title: "Practice · Kite Maths" };

export default function Page() {
  return <PracticeHubScreen />;
}
