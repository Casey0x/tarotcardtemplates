import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Tarot Card Templates | Editorial Tarot Deck Designs",
  description:
    "SEO-focused marketplace for tarot deck templates with optional single-deck printing.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SiteHeader />
        <main className="mx-auto w-full max-w-6xl px-6 py-12">
          {children}
        </main>

        <footer className="mt-8 pb-8 text-center text-xs text-neutral-500">
          Designed for modern tarot publishing workflows.
        </footer>
      </body>
    </html>
  );
}