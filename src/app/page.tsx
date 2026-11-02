import type { Metadata } from "next";
import { KidHomeScreen } from "@/components/screens/KidHomeScreen";

export const metadata: Metadata = { title: "Home · Kite Maths" };

export default function Page() {
  return <KidHomeScreen />;
}
