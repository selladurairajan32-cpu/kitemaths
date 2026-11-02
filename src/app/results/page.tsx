import type { Metadata } from "next";
import { ResultsScreen } from "@/components/screens/ResultsScreen";

export const metadata: Metadata = { title: "Mastery results · Kite Maths" };

export default function Page() {
  return <ResultsScreen />;
}
