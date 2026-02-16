import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Policy Playground",
  description:
    "Interactive playground for creating and testing Agent Policy Protocol configurations. Build, validate, and export your agent-policy.json file.",
  alternates: {
    canonical: "https://agentpolicy.org/playground",
  },
};

export default function PlaygroundLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
