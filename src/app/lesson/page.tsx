import type { Metadata } from "next";
import { LessonStudioScreen } from "@/components/screens/LessonStudioScreen";

export const metadata: Metadata = { title: "Lesson Studio · Kite Maths" };

export default function Page() {
  return <LessonStudioScreen />;
}
