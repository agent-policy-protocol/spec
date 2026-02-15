import { Shield, Bot, Gauge, Link2, Globe, FileText } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

const features = [
  {
    icon: Shield,
    title: "Transparent Access Rules",
    description:
      "Define clear permissions by path, action, and agent identity. Give agents the clarity they need to interact confidently.",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950",
  },
  {
    icon: Bot,
    title: "Agent Identity & Verification",
    description:
      "PKIX, DID, Verifiable Credentials, and partner tokens for cryptographic agent identity.",
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-950",
  },
  {
    icon: Gauge,
    title: "Rate Limiting",
    description:
      "Per-agent, per-window request limits with custom HTTP headers for enforcement feedback.",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950",
  },
  {
    icon: Link2,
    title: "Cross-Protocol Interop",
    description:
      "Links to MCP, A2A, WebMCP, UCP, and APAAI. APoP is the authorization layer for all protocols.",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950",
  },
  {
    icon: Globe,
    title: "4 Discovery Methods",
    description:
      "Well-known URI, HTTP header, HTML meta tag, and DNS TXT record for maximum flexibility.",
    color: "text-cyan-600 dark:text-cyan-400",
    bg: "bg-cyan-50 dark:bg-cyan-950",
  },
  {
    icon: FileText,
    title: "9 Ready-Made Templates",
    description:
      "News, e-commerce, SaaS, healthcare, open data, and more — get started in seconds.",
    color: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-50 dark:bg-rose-950",
  },
];

export function Features() {
  return (
    <section className="py-16 sm:py-24 bg-white dark:bg-neutral-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white">
            Key Features
          </h2>
          <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-300">
            Everything you need to enable clear, transparent AI agent
            interactions with your web content.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.title}
                className="border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div
                    className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${feature.bg}`}
                  >
                    <Icon className={`h-5 w-5 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-lg text-neutral-900 dark:text-white">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
