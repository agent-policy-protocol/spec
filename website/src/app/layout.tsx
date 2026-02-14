import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { RootProvider } from "fumadocs-ui/provider/next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default:
      "Agent Policy Protocol (APoP) — The Authorization Layer for the Agentic Web",
    template: "%s | APoP",
  },
  description:
    "An open standard that lets websites declare how AI agents can access and interact with their content.",
  metadataBase: new URL("https://agentpolicy.org"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://agentpolicy.org",
    title: "Agent Policy Protocol (APoP)",
    description:
      "An open standard that lets websites declare how AI agents can access and interact with their content.",
    siteName: "Agent Policy Protocol",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Agent Policy Protocol (APoP)",
    description:
      "An open standard that lets websites declare how AI agents can access and interact with their content.",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <RootProvider>{children}</RootProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
