import type { Metadata } from "next";
import { TopicsScreen } from "@/components/screens/TopicsScreen";

export const metadata: Metadata = { title: "Topics · Kite Maths" };

export default function Page() {
  return <TopicsScreen />;
}
