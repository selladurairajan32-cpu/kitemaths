import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import { AppShell } from "@/components/ui/AppShell";
import "./globals.css";

/** Nunito: soft rounded letters with open shapes, easy and pleasant for young readers. */
const nunito = Nunito({ variable: "--font-nunito", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kite Maths · Maths for Years 3 to 6",
  description: "A maths learning app for Years 3 to 6 with Kip the kite. Start with fractions: learn, explore, practise and show what you know.",
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-GB" className={`${nunito.variable} antialiased`}>
      <body className="min-h-dvh">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
