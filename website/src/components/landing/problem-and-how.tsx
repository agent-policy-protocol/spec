"use client";

import { AlertTriangle, ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function ProblemStatement() {
  return (
    <section className="py-20 sm:py-28 bg-background relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 gradient-radial opacity-50" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        <div className="mx-auto max-w-5xl">
          <div className="space-y-6 mb-16">
            <Badge
              variant="outline"
              className="border-warning/30 bg-warning/5 px-4 py-2 text-warning font-medium text-xs rounded-full"
            >
              <AlertTriangle className="h-3 w-3 mr-2" />
              The Problem
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
              The Agentic Web Needs{" "}
              <span className="text-primary">Clear Rules</span>
            </h2>
            <p className="text-lg sm:text-xl leading-relaxed text-muted-foreground max-w-3xl">
              AI agents are browsing, summarizing, and transacting on the web —
              but without clear rules, both sides face legal uncertainty. APoP
              brings{" "}
              <span className="font-semibold text-foreground bg-primary/10 px-2 py-0.5 rounded">
                robots.txt-level simplicity
              </span>{" "}
              to the age of intelligent agents.
            </p>
          </div>

          {/* Comparison grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Without APoP */}
            <div className="border border-destructive/50 bg-card backdrop-blur rounded-2xl overflow-hidden space-y-6 shadow-lg">
              <div className="h-1 bg-linear-to-r from-destructive to-destructive/50" />
              <div className="px-8 pb-8 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-destructive/10 p-2.5">
                    <XCircle className="h-6 w-6 text-destructive" />
                  </div>
                  <h3 className="font-bold text-xl tracking-tight">
                    Without APoP
                  </h3>
                </div>
                <ul className="space-y-4">
                  {[
                    "No shared rules — agents guess what's allowed",
                    "Legal uncertainty slows innovation",
                    "robots.txt can't express intent or verification",
                    "No standard for rate limits",
                    "No way for agents to prove identity",
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm">
                      <div className="rounded-full w-1.5 h-1.5 bg-destructive mt-2 shrink-0" />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* With APoP */}
            <div className="border border-primary/50 bg-card backdrop-blur rounded-2xl overflow-hidden space-y-6 shadow-xl">
              <div className="h-1 bg-linear-to-r from-primary to-accent" />
              <div className="px-8 pb-8 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2.5">
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-xl tracking-tight">
                    With APoP
                  </h3>
                </div>
                <ul className="space-y-4">
                  {[
                    "Clear rules — agents know what's allowed",
                    "Per-path, per-agent transparent permissions",
                    "Verified agent identity builds trust",
                    "Standard rate limits enable fair access",
                    "Cross-protocol interop (MCP, A2A, WebMCP)",
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm">
                      <div className="rounded-full w-1.5 h-1.5 bg-primary mt-2 shrink-0" />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function HowItWorks() {
  const steps = [
    {
      step: 1,
      title: "Create",
      description: "Define your rules in a simple JSON file.",
      code: `{
  "version": "1.0",
  "defaultPolicy": {
    "allow": true,
    "actions": ["read", "summarize"]
  }
}`,
    },
    {
      step: 2,
      title: "Deploy",
      description: "Place it at /.well-known/agent-policy.json on your site.",
      code: `# Copy to your web root
cp agent-policy.json \\
  public/.well-known/agent-policy.json`,
    },
    {
      step: 3,
      title: "Enforce",
      description: "Agents discover and respect your policy automatically.",
      code: `GET /.well-known/agent-policy.json
Host: example.com
Agent-Name: MyCrawler/1.0
Agent-Intent: read, summarize`,
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-muted/30 border-y border-border relative">
      <div className="absolute inset-0 protocol-grid opacity-30" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        <div className="mb-16">
          <div className="inline-flex items-center gap-2 border border-primary/30 bg-primary/5 px-4 py-2 rounded-full text-primary mb-6">
            <h2 className="text-xs font-semibold uppercase tracking-wider">
              How It Works
            </h2>
          </div>
          <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight max-w-2xl">
            Three Steps to Agent Authorization
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {steps.map((item) => (
            <div key={item.step} className="relative group">
              {/* Step card */}
              <div className="glass-effect rounded-2xl p-6 shadow-elevated hover:shadow-2xl transition-all border border-border/50 h-full flex flex-col">
                {/* Header */}
                <div className="flex items-start gap-4 mb-6">
                  <div className="rounded-xl bg-primary text-primary-foreground w-12 h-12 flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform shadow-lg">
                    {item.step}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold tracking-tight mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Connector arrow */}
                {item.step < 3 && (
                  <div className="hidden lg:block absolute top-10 -right-4 z-20">
                    <div className="bg-background rounded-full p-2 border border-border shadow-md">
                      <ArrowRight className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                )}

                {/* Code block - Flex grow to push to bottom */}
                <div className="border border-border rounded-xl overflow-hidden mt-auto">
                  <div className="bg-muted/80 dark:bg-muted px-3 py-2.5 flex items-center justify-between border-b border-border">
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Code
                    </span>
                  </div>
                  <pre className="bg-muted/30 dark:bg-muted/50 p-4 text-xs overflow-x-auto min-h-30">
                    <code className="text-foreground/90 dark:text-foreground font-mono leading-relaxed">
                      {item.code}
                    </code>
                  </pre>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
