import type { Metadata } from "next";
import { BadgesScreen } from "@/components/screens/BadgesScreen";

export const metadata: Metadata = { title: "Badges · Kite Maths" };

export default function Page() {
  return <BadgesScreen />;
}
