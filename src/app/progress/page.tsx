import type { Metadata } from "next";
import { ProgressScreen } from "@/components/screens/ProgressScreen";

export const metadata: Metadata = { title: "Progress · Kite Maths" };

export default function Page() {
  return <ProgressScreen />;
}
