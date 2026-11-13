import type { Metadata, Viewport } from "next";
import { Fraunces, Lexend } from "next/font/google";
import { AppShell } from "@/components/ui/AppShell";
import "./globals.css";

/**
 * D-066: the first prototype's two faces. Lexend for reading (designed for easy reading, with open, even letters) and
 * Fraunces for titles.
 */
const lexend = Lexend({ variable: "--font-lexend", subsets: ["latin"] });
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"], axes: ["opsz"] });

export const metadata: Metadata = {
  title: "Kite Maths · Maths for Years 3 to 6",
  description: "A maths learning app for Years 3 to 6 with Kip the kite. Start with fractions: learn, explore, practise and show what you know.",
};

export const viewport: Viewport = {
  themeColor: "#faf8f4",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-GB" className={`${lexend.variable} ${fraunces.variable} antialiased`}>
      <body className="min-h-dvh">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
