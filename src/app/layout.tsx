import type { Metadata, Viewport } from "next";
import { Fraunces, Lexend } from "next/font/google";
import { AppShell } from "@/components/ui/AppShell";
import "./globals.css";

const lexend = Lexend({ variable: "--font-lexend", subsets: ["latin"] });
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"], axes: ["opsz"] });

export const metadata: Metadata = {
  title: "Kite Maths · Fractions",
  description: "An interactive 11+ maths tutor prototype: understanding fractions from the very beginning.",
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
