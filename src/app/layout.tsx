import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SupabaseAuthRecovery } from "@/components/supabase-auth-recovery";
import { TctCurrencyProvider } from "@/components/tct-currency-provider";
import { getUserCurrency } from "@/lib/getUserCurrency";
import { SITE_URL } from "@/lib/site";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currency } = getUserCurrency();

  return (
    <html lang="en">
      <head>
        <Script id="microsoft-clarity" strategy="beforeInteractive">
          {`
(function(c,l,a,r,i,t,y){
    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window, document, "clarity", "script", "wt5fx2dlcq");
`}
        </Script>
        {GA_MEASUREMENT_ID ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="beforeInteractive"
            />
            <Script id="google-analytics-gtag" strategy="beforeInteractive">
              {`
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_MEASUREMENT_ID}');
`}
            </Script>
          </>
        ) : null}
      </head>
      <body>
        <SupabaseAuthRecovery />
        <TctCurrencyProvider serverPricingCurrency={currency}>
          <SiteHeader />
          <main className="mx-auto w-full max-w-6xl px-6 py-12">
            {children}
          </main>

          <SiteFooter />
        </TctCurrencyProvider>
      </body>
    </html>
  );
}
