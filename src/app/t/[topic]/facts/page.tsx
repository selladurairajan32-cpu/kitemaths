import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FactsHubScreen } from "@/components/screens/FactsScreens";
import { FACTS_TOPIC } from "@/topics/times-tables/facts";

export const metadata: Metadata = { title: "Times-table facts · Kite Maths" };

/** R2: only the times-tables island has a facts area. */
export default async function Page({ params }: PageProps<"/t/[topic]/facts">) {
  const { topic } = await params;
  if (topic !== FACTS_TOPIC) notFound();
  return <FactsHubScreen />;
}
