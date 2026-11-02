import type { Metadata } from "next";
import { SkyMapScreen } from "@/components/screens/SkyMapScreen";

export const metadata: Metadata = { title: "Adventure map · Kite Maths" };

export default function Page() {
  return <SkyMapScreen />;
}
