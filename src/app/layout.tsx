import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { GoogleAnalytics } from "@/components/google-analytics";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Tarot Card Templates | Editorial Tarot Deck Designs",
    template: "%s | Tarot Card Templates",
  },
  description:
    "Browse professionally designed tarot card templates for artists, readers, and indie publishers. Customizable borders, print-ready files, and single-deck printing available.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <GoogleAnalytics />
        <SiteHeader />
        <main className="mx-auto w-full max-w-6xl px-6 py-12">
          {children}
        </main>

        <SiteFooter />
      </body>
    </html>
  );
}
