import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ExternalLink, Linkedin } from "lucide-react";

export const metadata: Metadata = {
  title: "About APoP - Origin Story",
  description:
    "How the Perplexity-Amazon conflict sparked the creation of the Agent Policy Protocol — a constructive path forward for the agentic web.",
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-background pt-24 pb-16 sm:pt-32 sm:pb-20">
          <div
            className="absolute inset-0 gradient-radial"
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 protocol-grid opacity-60"
            aria-hidden="true"
          />

          <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-6">
              <Badge
                variant="outline"
                className="border-primary/30 bg-primary/5 text-primary px-4 py-2 font-semibold text-sm rounded-full"
              >
                Origin Story
              </Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                <span className="block text-foreground">From Conflict to</span>
                <span className="block text-primary mt-2">
                  Collaborative Standard
                </span>
              </h1>
              <p className="text-lg sm:text-xl leading-relaxed max-w-3xl mx-auto text-muted-foreground">
                How the Perplexity-Amazon conflict sparked the creation of an
                open protocol for mutual clarity in the agentic web.
              </p>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <article className="prose prose-lg dark:prose-invert max-w-none">
              {/* The Spark */}
              <div className="space-y-6 mb-12">
                <h2 className="text-3xl font-bold tracking-tight">The Spark</h2>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  <strong className="text-foreground">November 2025:</strong>{" "}
                  Amazon sues Perplexity AI, demanding they shut down
                  Comet—their AI shopping assistant. The charge? Computer fraud.
                  Amazon claimed Comet disguised itself as human traffic,
                  bypassing their systems without proper disclosure.
                </p>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  <strong className="text-foreground">September 2025:</strong>{" "}
                  Google blocks Comet from accessing Google Ads and Analytics.
                  Their security systems couldn't distinguish between a
                  legitimate AI assistant and a malicious scraping bot. Users
                  trying to manage their campaigns found themselves locked out,
                  caught in the crossfire.
                </p>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  These weren't isolated incidents. They were symptoms of a
                  fundamental gap in how the web works — catalyzed by a{" "}
                  <a
                    href="https://www.perplexity.ai/hub/blog/bullying-is-not-innovation"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    public response from Perplexity's CEO
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  </a>{" "}
                  that sparked global conversation.
                </p>
              </div>

              {/* Image */}
              <div className="my-12 rounded-2xl border border-border bg-card p-6 shadow-lg">
                <div className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden">
                  <Image
                    src="https://github.com/user-attachments/assets/4f4ffbfb-1d54-4886-a0cb-0558d9a4499f"
                    alt="Perplexity AI CEO's response to Amazon blocking Comet Assistant"
                    width={555}
                    height={347}
                    className="w-full h-full object-contain"
                    priority
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-4 text-center italic">
                  The public statement that catalyzed a new approach to
                  AI-website relations
                </p>
              </div>

              {/* Quote */}
              <div className="my-12 border-l-4 border-primary bg-primary/5 dark:bg-primary/10 p-6 rounded-r-lg">
                <blockquote className="text-lg leading-relaxed space-y-4">
                  <p className="text-foreground">
                    "We would be happy to work together with Amazon to figure
                    out a win-win outcome for both us and them. But when it
                    comes to attempts to block our Comet Assistant on Amazon and
                    hurt our users — we will have to stand up for them and not
                    get bullied by Amazon."
                  </p>
                  <footer className="text-sm text-muted-foreground">
                    — Aravind Srinivas, CEO of Perplexity AI
                  </footer>
                </blockquote>
              </div>

              {/* The Problem */}
              <div className="space-y-6 mb-12">
                <h2 className="text-3xl font-bold tracking-tight">
                  The Missing Standard
                </h2>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  When search engines emerged in the 1990s, the web had no way
                  to tell crawlers what they could and couldn't index. Websites
                  were overwhelmed. Servers crashed under bot traffic. Content
                  was scraped without permission.
                </p>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  Then in 1994, Martijn Koster created{" "}
                  <strong className="text-foreground">robots.txt</strong>—a
                  simple file that let websites communicate with crawlers. One
                  standard solved the chaos.
                </p>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  <strong className="text-foreground">
                    We're at that exact moment again, but for AI agents.
                  </strong>
                </p>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  AI agents can now browse websites, extract data, make
                  purchases, and perform actions on your behalf. But there's no
                  standardized way for websites to communicate boundaries,
                  verify agent identity, or enforce policies.
                </p>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  Without this standard, every interaction becomes a potential
                  legal battle. Platforms block agents defensively. Agents try
                  to disguise themselves to function. Users lose access to tools
                  they trust.
                  <strong className="text-foreground">
                    {" "}
                    Innovation stalls on both sides.
                  </strong>
                </p>
              </div>

              {/* The Solution */}
              <div className="space-y-6 mb-12">
                <h2 className="text-3xl font-bold tracking-tight">
                  Our Solution: Agent Policy Protocol
                </h2>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  <strong className="text-foreground">
                    APoP is robots.txt for the agentic web.
                  </strong>{" "}
                  A simple, open standard that gives websites control while
                  letting AI agents operate transparently.
                </p>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  How it works:
                </p>
                <ul className="space-y-3 text-lg">
                  <li className="flex items-start gap-3">
                    <span
                      className="rounded-full w-2 h-2 bg-primary mt-2.5 shrink-0"
                      aria-hidden="true"
                    />
                    <span className="text-muted-foreground">
                      Websites place an{" "}
                      <code className="text-foreground bg-muted px-1.5 py-0.5 rounded text-sm">
                        agent-policy.json
                      </code>{" "}
                      file at their root
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span
                      className="rounded-full w-2 h-2 bg-primary mt-2.5 shrink-0"
                      aria-hidden="true"
                    />
                    <span className="text-muted-foreground">
                      The file specifies allowed actions, rate limits,
                      authentication requirements, and path-specific rules
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span
                      className="rounded-full w-2 h-2 bg-primary mt-2.5 shrink-0"
                      aria-hidden="true"
                    />
                    <span className="text-muted-foreground">
                      AI agents check this file before interacting—just like
                      search crawlers check{" "}
                      <code className="text-foreground bg-muted px-1.5 py-0.5 rounded text-sm">
                        robots.txt
                      </code>
                    </span>
                  </li>
                </ul>
                <p className="text-lg leading-relaxed text-muted-foreground mt-6">
                  <strong className="text-foreground">
                    Simple. Transparent. Built on consent.
                  </strong>
                </p>
              </div>

              {/* LinkedIn Post */}
              <div className="my-12 border border-border bg-card rounded-2xl p-8 shadow-lg">
                <div className="flex items-start gap-4 mb-6">
                  <div className="rounded-lg bg-[#0077B5] p-3">
                    <Linkedin
                      className="h-6 w-6 text-white"
                      aria-hidden="true"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">The Original Proposal</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      I wrote about this solution on LinkedIn, proposing a new
                      standard for the agentic web
                    </p>
                  </div>
                </div>
                <a
                  href="https://www.linkedin.com/posts/arunvijayarengan_github-agent-policy-protocolspec-robotstxt-activity-7391871409305821184-tQgG/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
                >
                  Read the LinkedIn post
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>

              {/* Why It Matters */}
              <div className="space-y-6 mb-12">
                <h2 className="text-3xl font-bold tracking-tight">
                  Why It Matters Now
                </h2>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  The Comet conflicts were just the beginning. As agentic AI
                  becomes mainstream—shopping assistants, research agents,
                  workflow automators—friction will intensify without standards.
                </p>
                <div className="grid sm:grid-cols-2 gap-6 mt-8">
                  <div className="space-y-3">
                    <h3 className="font-semibold text-foreground text-lg">
                      Without APoP:
                    </h3>
                    <ul className="space-y-2 text-base">
                      <li className="flex items-start gap-2">
                        <span className="text-destructive mt-1">✗</span>
                        <span className="text-muted-foreground">
                          More lawsuits blocking innovation
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-destructive mt-1">✗</span>
                        <span className="text-muted-foreground">
                          Inconsistent security creating false positives
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-destructive mt-1">✗</span>
                        <span className="text-muted-foreground">
                          Degraded user experiences
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-destructive mt-1">✗</span>
                        <span className="text-muted-foreground">
                          Fragmented web with proprietary rules
                        </span>
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-semibold text-foreground text-lg">
                      With APoP:
                    </h3>
                    <ul className="space-y-2 text-base">
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">✓</span>
                        <span className="text-muted-foreground">
                          Transparent agent behavior platforms can trust
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">✓</span>
                        <span className="text-muted-foreground">
                          Granular control without legal escalation
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">✓</span>
                        <span className="text-muted-foreground">
                          Predictable, reliable agent access
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">✓</span>
                        <span className="text-muted-foreground">
                          Interoperability with emerging standards
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* The Vision */}
              <div className="space-y-6 mb-12">
                <h2 className="text-3xl font-bold tracking-tight">
                  Built for the Future, Open for Everyone
                </h2>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  APoP is open-source (Apache 2.0) and community-driven. We're
                  building this alongside the broader agent ecosystem—compatible
                  with Model Context Protocol (MCP), W3C standards, and emerging
                  agent frameworks.
                </p>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  This isn't about picking sides between platforms and agents.
                  It's about creating infrastructure where both can thrive—where
                  innovation and ownership coexist through transparency,
                  respect, and mutual benefit.
                </p>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  <strong className="text-foreground text-xl">
                    The future of the web should be agentic AND consensual.
                  </strong>
                </p>
              </div>

              {/* Call to Action */}
              <div className="mt-16 border-t border-border pt-12">
                <div className="text-center space-y-6">
                  <h2 className="text-3xl font-bold tracking-tight">
                    Join the Movement
                  </h2>
                  <p className="text-lg leading-relaxed text-muted-foreground max-w-2xl mx-auto">
                    APoP is an open standard — built by the community, for the
                    community. Help us create a better future for the agentic
                    web.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
                    <Link
                      href="/docs"
                      className="inline-flex items-center gap-2 bg-primary px-8 py-4 rounded-lg font-semibold text-sm text-primary-foreground hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl"
                    >
                      Read the Docs
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                    <a
                      href="https://github.com/agent-policy-protocol/spec"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 border border-border bg-card px-8 py-4 rounded-lg font-semibold text-sm hover:bg-muted transition-all"
                    >
                      Star on GitHub
                      <ExternalLink className="h-4 w-4" aria-hidden="true" />
                    </a>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
