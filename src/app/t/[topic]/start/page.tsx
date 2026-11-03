import type { Metadata } from "next";
import { PlacementScreen } from "@/components/screens/PlacementScreen";

export const metadata: Metadata = { title: "Let's get started · Kite Maths" };

export default function Page() {
  return <PlacementScreen />;
}
