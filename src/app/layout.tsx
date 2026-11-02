import type { Metadata, Viewport } from "next";
import { Fredoka, Lexend } from "next/font/google";
import { AppShell } from "@/components/ui/AppShell";
import "./globals.css";

const lexend = Lexend({ variable: "--font-lexend", subsets: ["latin"] });
const fredoka = Fredoka({ variable: "--font-fredoka", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kite Maths · Fractions adventure",
  description: "A playful maths adventure for Years 3–6: learn fractions with Kip the kite, one fun step at a time.",
};

export const viewport: Viewport = {
  themeColor: "#e6f3ff",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-GB" className={`${lexend.variable} ${fredoka.variable} antialiased`}>
      <body className="min-h-dvh">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
