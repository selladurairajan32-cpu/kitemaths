import type { Metadata } from "next";
import { TestsScreen } from "@/components/screens/TestsScreen";

export const metadata: Metadata = { title: "Tests · Kite Maths" };

export default function Page() {
  return <TestsScreen />;
}
