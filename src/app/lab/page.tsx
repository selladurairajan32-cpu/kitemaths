import type { Metadata } from "next";
import { FreeLabScreen } from "@/components/screens/LessonStudioScreen";

export const metadata: Metadata = { title: "Fraction Lab · Kite Maths" };

export default function Page() {
  return <FreeLabScreen />;
}
