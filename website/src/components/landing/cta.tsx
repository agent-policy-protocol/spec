"use client";

import Link from "next/link";
import { ArrowRight, Github, Users, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function CallToAction() {
  return (
    <section className="py-20 sm:py-28 bg-primary text-primary-foreground relative overflow-hidden">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-linear-to-br from-primary via-primary to-accent opacity-90" />
      <div className="absolute inset-0 protocol-grid opacity-10" />

      {/* Decorative blur elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/30 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary-foreground/10 rounded-full blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Header */}
          <div className="space-y-6 text-center">
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Badge
                variant="outline"
                className="border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground px-4 py-2 font-semibold text-xs rounded-full"
              >
                <Zap className="h-3 w-3 mr-2" />
                Get Started
              </Badge>
              <Badge
                variant="outline"
                className="border-accent/50 bg-accent/20 text-primary-foreground px-3 py-1.5 font-semibold text-xs rounded-full"
              >
                5 Minutes
              </Badge>
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
              Ready to Enable the Agentic Web?
            </h2>

            <p className="text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto opacity-90">
              Deploy an agent-policy.json and set clear, transparent rules for
              how AI agents engage with your content. Get started in 5 minutes.
            </p>
          </div>

          {/* CTA Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              href="/docs/introduction/quick-start"
              className="bg-white dark:bg-card border border-primary-foreground/30 dark:border-primary-foreground/20 rounded-2xl p-6 hover:bg-white/95 dark:hover:bg-card/80 hover:border-primary-foreground/50 hover:shadow-2xl transition-all group shadow-xl text-foreground"
              aria-label="Quick start guide"
            >
              <div className="flex items-start justify-between mb-4">
                <ArrowRight className="h-6 w-6 text-primary group-hover:translate-x-1 transition-transform" />
                <span
                  className="text-xs font-mono bg-primary/10 text-primary px-2.5 py-1 rounded"
                  aria-hidden="true"
                >
                  01
                </span>
              </div>
              <h3 className="font-bold text-xl tracking-tight mb-2">
                Quick Start
              </h3>
              <p className="text-sm text-muted-foreground">
                5-minute setup guide
              </p>
            </Link>

            <Link
              href="/community"
              className="bg-white dark:bg-card border border-primary-foreground/30 dark:border-primary-foreground/20 rounded-2xl p-6 hover:bg-white/95 dark:hover:bg-card/80 hover:border-primary-foreground/50 hover:shadow-2xl transition-all group shadow-xl text-foreground"
              aria-label="Join community"
            >
              <div className="flex items-start justify-between mb-4">
                <Users className="h-6 w-6 text-primary" />
                <span
                  className="text-xs font-mono bg-primary/10 text-primary px-2.5 py-1 rounded"
                  aria-hidden="true"
                >
                  02
                </span>
              </div>
              <h3 className="font-bold text-xl tracking-tight mb-2">
                Join Community
              </h3>
              <p className="text-sm text-muted-foreground">
                Discord & discussions
              </p>
            </Link>

            <a
              href="https://github.com/agent-policy-protocol/spec"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white dark:bg-card border border-primary-foreground/30 dark:border-primary-foreground/20 rounded-2xl p-6 hover:bg-white/95 dark:hover:bg-card/80 hover:border-primary-foreground/50 hover:shadow-2xl transition-all group shadow-xl sm:col-span-2 lg:col-span-1 text-foreground"
              aria-label="Star on GitHub"
            >
              <div className="flex items-start justify-between mb-4">
                <Github className="h-6 w-6 text-primary" />
                <span
                  className="text-xs font-mono bg-primary/10 text-primary px-2.5 py-1 rounded"
                  aria-hidden="true"
                >
                  03
                </span>
              </div>
              <h3 className="font-bold text-xl tracking-tight mb-2">
                Star on GitHub
              </h3>
              <p className="text-sm text-muted-foreground">
                View the full spec
              </p>
            </a>
          </div>

          {/* Quick install */}
          <div className="bg-white dark:bg-card border border-primary-foreground/30 dark:border-primary-foreground/20 rounded-2xl p-6 shadow-xl text-foreground">
            <div className="text-xs font-semibold uppercase tracking-wider mb-4 text-muted-foreground">
              Quick Install
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 font-mono text-sm sm:text-base bg-muted/50 rounded-lg px-4 py-3">
                <span className="font-bold text-primary">$</span>
                <code>npm install @apop/node</code>
              </div>
              <div className="flex items-center gap-3 font-mono text-sm sm:text-base bg-muted/50 rounded-lg px-4 py-3">
                <span className="font-bold text-primary">$</span>
                <code>pip install apop</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
