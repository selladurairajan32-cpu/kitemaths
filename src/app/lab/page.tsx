import type { Metadata } from "next";
import { HubRedirect } from "@/components/ui/HubRedirect";

export const metadata: Metadata = { title: "Lab · Kite Maths", robots: { index: false } };

export default function Page() {
  return <HubRedirect section="lab" />;
}
