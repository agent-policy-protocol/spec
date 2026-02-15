"use client";

import Link from "next/link";
import { ArrowRight, Terminal, Shield, Lock, Zap } from "lucide-react";
import { CopyButton } from "@/components/copy-button";
import { TerminalDemo } from "@/components/landing/terminal-demo";
import { Badge } from "@/components/ui/badge";

export function Hero() {
  return (
    <section
      className="relative overflow-hidden bg-background pt-20 pb-16 sm:pt-32 sm:pb-24"
      aria-label="Hero section"
    >
      {/* Gradient background */}
      <div className="absolute inset-0 gradient-radial" aria-hidden="true" />
      <div
        className="absolute inset-0 protocol-grid opacity-60"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Asymmetric layout */}
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left column - Main content */}
          <div className="lg:col-span-7 space-y-8">
            {/* Protocol badges */}
            <div className="flex flex-wrap items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Badge
                variant="outline"
                className="border-primary/30 bg-primary/5 px-3 py-1.5 text-primary font-medium text-xs rounded-full"
              >
                <Lock className="h-3 w-3 mr-1.5" />
                Protocol v1.0
              </Badge>
              <Badge
                variant="outline"
                className="border-accent/30 bg-accent/5 px-3 py-1.5 text-accent font-medium text-xs rounded-full"
              >
                Apache 2.0
              </Badge>
              <Badge
                variant="outline"
                className="border-primary/30 bg-primary/5 px-3 py-1.5 text-primary font-medium text-xs rounded-full"
              >
                JSON Schema 2020-12
              </Badge>
            </div>

            {/* Main headline - Refined and authoritative */}
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.1]">
                <span className="block text-foreground">
                  The Authorization Layer
                </span>
                <span className="block text-primary mt-2">
                  for the Agentic Web
                </span>
              </h1>
            </div>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl leading-relaxed max-w-2xl text-muted-foreground animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
              An open standard creating mutual clarity between AI agents and
              websites — with verified identity, transparent permissions, and
              rate limits.{" "}
              <span className="text-foreground font-semibold">
                Like robots.txt enabled search engines, APoP enables the agentic
                web.
              </span>
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-start gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
              <Link
                href="/docs"
                className="inline-flex items-center gap-3 bg-primary px-8 py-4 rounded-lg font-semibold text-sm text-primary-foreground hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none transition-all duration-200 shadow-lg hover:shadow-xl group"
                aria-label="Read the documentation"
              >
                Read the Documentation
                <ArrowRight
                  className="h-4 w-4 group-hover:translate-x-1 transition-transform"
                  aria-hidden="true"
                />
              </Link>
              <Link
                href="/playground"
                className="inline-flex items-center gap-3 border border-border bg-card/50 px-8 py-4 rounded-lg font-semibold text-sm hover:bg-card hover:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none transition-all duration-200 group"
                aria-label="Try the playground"
              >
                <Terminal className="h-4 w-4" aria-hidden="true" />
                Try Playground
              </Link>
            </div>

            {/* Install commands */}
            <div
              className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400"
              role="region"
              aria-label="Installation commands"
            >
              <div className="flex items-center gap-3 border border-border/50 bg-muted/30 rounded-lg pl-4 pr-2 py-3.5 font-mono text-sm group hover:border-primary/30 transition-colors">
                <span className="text-primary font-bold" aria-hidden="true">
                  $
                </span>
                <span className="flex-1" aria-label="npm install command">
                  npm install @apop/node
                </span>
                <CopyButton text="npm install @apop/node" />
              </div>
              <div className="flex items-center gap-3 border border-border/50 bg-muted/30 rounded-lg pl-4 pr-2 py-3.5 font-mono text-sm group hover:border-primary/30 transition-colors">
                <span className="text-primary font-bold" aria-hidden="true">
                  $
                </span>
                <span className="flex-1" aria-label="pip install command">
                  pip install apop
                </span>
                <CopyButton text="pip install apop" />
              </div>
            </div>
          </div>

          {/* Right column - Protocol status card */}
          <div className="lg:col-span-5 animate-in fade-in slide-in-from-right-4 duration-700 delay-500">
            <div className="relative">
              {/* Decorative elements with flow animation */}
              <div
                className="absolute -top-4 -right-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl"
                aria-hidden="true"
              />
              <div
                className="absolute -bottom-4 -left-4 w-32 h-32 bg-accent/10 rounded-full blur-3xl"
                aria-hidden="true"
              />

              <div
                className="glass-effect rounded-2xl p-8 shadow-elevated relative overflow-hidden"
                role="region"
                aria-label="Protocol status information"
              >
                {/* Accent corner */}
                <div
                  className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-primary/20 to-transparent rounded-bl-full"
                  aria-hidden="true"
                />

                <div className="space-y-6 relative z-10">
                  <div className="space-y-3">
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Protocol Status
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="relative flex h-3 w-3" aria-hidden="true">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                      </div>
                      <div
                        className="text-2xl font-bold"
                        role="status"
                        aria-live="polite"
                      >
                        Active
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Policy File
                    </div>
                    <div className="text-base font-mono bg-muted/50 px-4 py-2.5 rounded-lg border-l-4 border-primary">
                      agent-policy.json
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Discovery Endpoint
                    </div>
                    <div className="text-sm font-mono bg-muted/50 px-4 py-2.5 rounded-lg">
                      /.well-known/agent-policy.json
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border/50">
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                      Protocol Ecosystem
                    </div>
                    <div className="grid grid-cols-2 gap-2.5 text-xs font-medium">
                      <div className="flex items-center gap-2 border border-primary/30 bg-primary/5 px-3 py-2 rounded-lg">
                        <Zap className="h-3 w-3 text-primary" />
                        <span>MCP</span>
                      </div>
                      <div className="flex items-center gap-2 border border-accent/30 bg-accent/5 px-3 py-2 rounded-lg">
                        <Zap className="h-3 w-3 text-accent" />
                        <span>A2A</span>
                      </div>
                      <div className="flex items-center gap-2 border border-primary/30 bg-primary/5 px-3 py-2 rounded-lg">
                        <Zap className="h-3 w-3 text-primary" />
                        <span>WebMCP</span>
                      </div>
                      <div className="flex items-center gap-2 border border-accent/30 bg-accent/5 px-3 py-2 rounded-lg">
                        <Zap className="h-3 w-3 text-accent" />
                        <span>UCP</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Terminal Demo */}
        <div className="mt-20 lg:mt-28 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-600">
          <TerminalDemo />
        </div>
      </div>
    </section>
  );
}
