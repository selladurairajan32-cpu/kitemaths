import type { Metadata } from "next";
import { WorldMapScreen } from "@/components/screens/WorldMapScreen";

export const metadata: Metadata = { title: "World map · Kite Maths" };

export default function Page() {
  return <WorldMapScreen />;
}
