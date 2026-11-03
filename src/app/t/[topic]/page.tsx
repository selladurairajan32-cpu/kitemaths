import type { Metadata } from "next";
import { SkyMapScreen } from "@/components/screens/SkyMapScreen";
import { topicById } from "@/topics";

export async function generateMetadata({ params }: PageProps<"/t/[topic]">): Promise<Metadata> {
  const { topic } = await params;
  return { title: `${topicById(topic)?.title ?? "Island"} · Kite Maths` };
}

export default function Page() {
  return <SkyMapScreen />;
}
