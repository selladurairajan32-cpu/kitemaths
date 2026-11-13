import type { Metadata, Viewport } from "next";
import { Comic_Neue, DM_Sans } from "next/font/google";
import { AppShell } from "@/components/ui/AppShell";
import "./globals.css";

/**
 * D-057: two faces. DM Sans for reading (clear, open, even numerals) and Comic Neue for titles (friendly, handwritten
 * feel, still easy to read), the pairing studied on the reference site.
 */
const dmSans = DM_Sans({ variable: "--font-dm-sans", subsets: ["latin"] });
const comicNeue = Comic_Neue({ variable: "--font-comic", subsets: ["latin"], weight: ["400", "700"] });

export const metadata: Metadata = {
  title: "Kite Maths · Maths for Years 3 to 6",
  description: "A maths learning app for Years 3 to 6 with Kip the kite. Start with fractions: learn, explore, practise and show what you know.",
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-GB" className={`${dmSans.variable} ${comicNeue.variable} antialiased`}>
      <body className="min-h-dvh">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
