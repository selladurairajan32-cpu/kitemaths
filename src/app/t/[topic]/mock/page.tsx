import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { MockScreen } from "@/components/screens/MockScreen";
import { ScreenSkeleton } from "@/components/ui/Screen";

export const metadata: Metadata = { title: "Practice mock · Kite Maths" };

/** R5: only the mock-exams island has practice mocks. */
export default async function Page({ params }: PageProps<"/t/[topic]/mock">) {
  const { topic } = await params;
  if (topic !== "mock-exams") notFound();
  return (
    <Suspense fallback={<ScreenSkeleton />}>
      <MockScreen />
    </Suspense>
  );
}
