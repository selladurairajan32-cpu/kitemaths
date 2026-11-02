import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PracticeScreen } from "@/components/screens/PracticeScreen";
import { SKILLS } from "@/topics/fractions/skills";

export const instant = false;

export function generateStaticParams() {
  return SKILLS.map((s) => ({ skill: s.id }));
}

export async function generateMetadata({ params }: PageProps<"/practice/[skill]">): Promise<Metadata> {
  const { skill } = await params;
  return { title: `Practise ${SKILLS.find((s) => s.id === skill)?.title ?? ""} · Kite Maths` };
}

export default async function Page({ params }: PageProps<"/practice/[skill]">) {
  const { skill } = await params;
  if (!SKILLS.some((s) => s.id === skill)) notFound();
  return <PracticeScreen focusSkill={skill} />;
}
