import type { Metadata } from "next";
import { DashboardScreen } from "@/components/screens/DashboardScreen";

export const metadata: Metadata = { title: "Dashboard · Kite Maths" };

export default function Page() {
  return <DashboardScreen />;
}
