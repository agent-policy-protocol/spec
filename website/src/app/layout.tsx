import type { Metadata } from "next";
import { JetBrains_Mono, Outfit, Inter } from "next/font/google";
import { RootProvider } from "fumadocs-ui/provider/next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default:
      "Agent Policy Protocol (APoP) — The Authorization Layer for the Agentic Web",
    template: "%s | APoP",
  },
  description:
    "Define how AI agents access your website with APoP — the open standard for agent authorization. Verify identity, set permissions, limit rates. Free & open source.",
  metadataBase: new URL("https://agentpolicy.org"),
  alternates: {
    canonical: "https://agentpolicy.org",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://agentpolicy.org",
    title: "Agent Policy Protocol (APoP)",
    description:
      "An open standard creating mutual clarity between AI agents and websites — enabling the agentic web with verified identity, transparent permissions, and rate limits.",
    siteName: "Agent Policy Protocol",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Agent Policy Protocol (APoP)",
    description:
      "An open standard creating mutual clarity between AI agents and websites — enabling the agentic web.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "Agent Policy Protocol (APoP)",
              description:
                "Open standard for AI agent authorization on the web",
              url: "https://agentpolicy.org",
              applicationCategory: "WebApplication",
              license: "https://opensource.org/licenses/Apache-2.0",
              author: {
                "@type": "Organization",
                name: "Superdom AI Research Labs",
                url: "https://superdom.ai",
              },
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
            }),
          }}
        />
      </head>
      <body
        className={`${outfit.variable} ${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <RootProvider>{children}</RootProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
