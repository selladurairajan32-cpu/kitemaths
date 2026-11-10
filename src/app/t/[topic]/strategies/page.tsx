import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StrategyHubScreen } from "@/components/screens/StrategyScreens";

export const metadata: Metadata = { title: "Mental maths methods · Kite Maths" };

/** R3: only the mental-maths island has a methods lab. */
export default async function Page({ params }: PageProps<"/t/[topic]/strategies">) {
  const { topic } = await params;
  if (topic !== "mental-maths") notFound();
  return <StrategyHubScreen />;
}
