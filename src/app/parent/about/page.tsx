import type { Metadata } from "next";
import { AboutScreen } from "@/components/screens/AboutScreen";

export const metadata: Metadata = {
  title: "About Kite Maths · Kite Maths",
  description: "What Kite Maths is, what is ready, how progress is judged, and where your child's progress is kept.",
};

/** Not behind the grown-ups gate: a new grown-up can read it before anything else (content audit R10). */
export default function Page() {
  return <AboutScreen />;
}
