import type { Metadata } from "next";
import { AssessmentScreen } from "@/components/screens/AssessmentScreen";

export const metadata: Metadata = { title: "Mastery check · Kite Maths" };

export default function Page() {
  return <AssessmentScreen />;
}
