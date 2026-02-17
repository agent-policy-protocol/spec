import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Policy Playground",
  description:
    "Build and validate your agent-policy.json file in seconds. Interactive editor with 9 templates, real-time validation, and one-click export. Try it free.",
  alternates: {
    canonical: "https://agentpolicy.org/playground",
  },
  openGraph: {
    title: "Build Your AI Agent Policy",
    description:
      "Interactive playground for creating and testing Agent Policy Protocol configurations.",
    type: "website",
    images: [
      {
        url: "/api/og?title=Build%20Your%20AI%20Agent%20Policy&type=playground",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Build Your AI Agent Policy",
    description:
      "Interactive playground for creating and testing Agent Policy Protocol configurations.",
    images: [
      "/api/og?title=Build%20Your%20AI%20Agent%20Policy&type=playground",
    ],
  },
};

export default function PlaygroundLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
