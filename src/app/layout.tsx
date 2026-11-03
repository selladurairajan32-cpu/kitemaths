import type { Metadata, Viewport } from "next";
import { Lexend } from "next/font/google";
import { AppShell } from "@/components/ui/AppShell";
import "./globals.css";

const lexend = Lexend({ variable: "--font-lexend", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kite Maths · Fractions adventure",
  description: "A playful maths adventure for Years 3–6: learn fractions with Kip the kite, one fun step at a time.",
};

export const viewport: Viewport = {
  themeColor: "#eaf4fd",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-GB" className={`${lexend.variable} antialiased`}>
      <body className="min-h-dvh">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
