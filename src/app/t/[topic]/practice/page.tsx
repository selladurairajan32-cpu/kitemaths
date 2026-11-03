import type { Metadata } from "next";
import { PracticeScreen } from "@/components/screens/PracticeScreen";

export const metadata: Metadata = { title: "Practice · Kite Maths" };

export default function Page() {
  return <PracticeScreen />;
}
