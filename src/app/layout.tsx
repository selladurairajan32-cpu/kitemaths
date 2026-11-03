import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import { AppShell } from "@/components/ui/AppShell";
import "./globals.css";

/** Nunito: soft rounded letters with open shapes, easy and pleasant for young readers. */
const nunito = Nunito({ variable: "--font-nunito", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kite Maths · Fractions adventure",
  description: "A playful maths adventure for Years 3–6: learn fractions with Kip the kite, one fun step at a time.",
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
