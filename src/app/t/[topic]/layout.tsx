import { notFound } from "next/navigation";
import { TopicProvider } from "@/topics/context";
import { TOPICS, topicById } from "@/topics";

export const instant = false;

export function generateStaticParams() {
  return TOPICS.map((t) => ({ topic: t.id }));
}

export default async function TopicLayout({ children, params }: LayoutProps<"/t/[topic]">) {
  const { topic } = await params;
  if (!topicById(topic)) notFound();
  return <TopicProvider topicId={topic}>{children}</TopicProvider>;
}
