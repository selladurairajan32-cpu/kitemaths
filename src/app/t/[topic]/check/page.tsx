import type { Metadata } from "next";
import { AssessmentScreen } from "@/components/screens/AssessmentScreen";

export const metadata: Metadata = { title: "The big challenge · Kite Maths" };

export default function Page() {
  return <AssessmentScreen />;
}
