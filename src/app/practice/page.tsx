import type { Metadata } from "next";
import { HubRedirect } from "@/components/ui/HubRedirect";

export const metadata: Metadata = { title: "Practice · Kite Maths", robots: { index: false } };

export default function Page() {
  return <HubRedirect section="practice" />;
}
