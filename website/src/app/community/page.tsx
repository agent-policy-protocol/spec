import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Github,
  MessageCircle,
  MessagesSquare,
  BookOpen,
  Heart,
  Rocket,
  ExternalLink,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Community",
  description:
    "Join the APoP community — contribute to the spec, build SDKs, and shape the future of AI agent authorization.",
};

const communityCards = [
  {
    icon: Github,
    title: "GitHub",
    description: "Star the repo, report issues, submit PRs",
    href: "https://github.com/agent-policy-protocol/spec",
    external: true,
    color: "text-neutral-900 dark:text-white",
    bg: "bg-neutral-100 dark:bg-neutral-800",
  },
  {
    icon: MessageCircle,
    title: "Discord",
    description: "Chat with contributors, ask questions, share ideas",
    href: "https://discord.gg/agentpolicy",
    external: true,
    color: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-50 dark:bg-indigo-950",
  },
  {
    icon: MessagesSquare,
    title: "GitHub Discussions",
    description: "Propose RFCs, vote on features, get help",
    href: "https://github.com/agent-policy-protocol/spec/discussions",
    external: true,
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-950",
  },
  {
    icon: BookOpen,
    title: "Contributing",
    description: "Read the contributing guide to get started",
    href: "/docs/contributing/how-to-contribute",
    external: false,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950",
  },
  {
    icon: Heart,
    title: "Code of Conduct",
    description: "We follow the Contributor Covenant",
    href: "https://www.contributor-covenant.org/version/2/1/code_of_conduct/",
    external: true,
    color: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-50 dark:bg-rose-950",
  },
  {
    icon: Rocket,
    title: "Roadmap",
    description: "See what's coming next for APoP",
    href: "#roadmap",
    external: false,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950",
  },
];

const roadmapItems = [
  {
    title: "W3C Community Group",
    description: "Formal standardization process",
    status: "planned" as const,
  },
  {
    title: "WordPress Plugin",
    description: "One-click APoP for 40%+ of the web",
    status: "planned" as const,
  },
  {
    title: "Browser Integration",
    description: "Native agent policy support in browsers",
    status: "planned" as const,
  },
  {
    title: "Agent Certification Program",
    description: "Verify agents comply with APoP policies",
    status: "planned" as const,
  },
  {
    title: "More SDK Languages",
    description: "Go, Rust, Java, PHP, Ruby SDKs",
    status: "planned" as const,
  },
  {
    title: "Policy Templates Hub",
    description: "Community-contributed policy templates",
    status: "planned" as const,
  },
];

export default function CommunityPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        {/* Hero */}
        <section className="relative overflow-hidden bg-linear-to-b from-blue-50 via-white to-white dark:from-neutral-950 dark:via-neutral-950 dark:to-neutral-900 pt-20 pb-16 sm:pt-28 sm:pb-20">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-size-[4rem_4rem] opacity-30" />
          <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Join the APoP Community
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto">
              Help build the authorization layer that creates mutual clarity
              between AI agents and websites — enabling innovation on both
              sides.
            </p>
          </div>
        </section>

        {/* Community Cards */}
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {communityCards.map((card) => {
                const Icon = card.icon;

                const cardInner = (
                  <Card className="group hover:shadow-md hover:border-neutral-300 dark:hover:border-neutral-700 transition-all h-full">
                    <CardHeader>
                      <div
                        className={`inline-flex items-center justify-center rounded-lg ${card.bg} p-3 w-fit`}
                      >
                        <Icon className={`h-6 w-6 ${card.color}`} />
                      </div>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        {card.title}
                        {card.external && (
                          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                      </CardTitle>
                      <CardDescription>{card.description}</CardDescription>
                    </CardHeader>
                  </Card>
                );

                if (card.external) {
                  return (
                    <a
                      key={card.title}
                      href={card.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      {cardInner}
                    </a>
                  );
                }

                return (
                  <Link key={card.title} href={card.href} className="block">
                    {cardInner}
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Roadmap */}
        <section
          id="roadmap"
          className="py-16 sm:py-20 bg-neutral-50 dark:bg-neutral-900"
        >
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white">
                Roadmap
              </h2>
              <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-300">
                What&apos;s coming next for the Agent Policy Protocol.
              </p>
            </div>

            <div className="space-y-4">
              {roadmapItems.map((item, index) => (
                <Card
                  key={item.title}
                  className="flex-row items-start gap-4 p-5"
                >
                  <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base">{item.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {item.description}
                    </CardDescription>
                  </div>
                  <Badge
                    variant="outline"
                    className="ml-auto shrink-0 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950 text-amber-700 dark:text-amber-300"
                  >
                    Planned
                  </Badge>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
