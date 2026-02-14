import Link from "next/link";
import { ArrowRight, Terminal } from "lucide-react";
import { CopyButton } from "@/components/copy-button";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 via-white to-white dark:from-neutral-950 dark:via-neutral-950 dark:to-neutral-900 pt-20 pb-16 sm:pt-28 sm:pb-24">
      {/* Decorative grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950 px-3 py-1 text-xs font-medium text-blue-700 dark:text-blue-300">
              Apache 2.0 Licensed
            </span>
            <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
              APoP v1.0
            </span>
            <span className="inline-flex items-center rounded-full border border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 px-3 py-1 text-xs font-medium text-neutral-600 dark:text-neutral-300">
              JSON Schema Draft 2020-12
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-900 dark:text-white">
            The Authorization Layer for the{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-emerald-600 dark:from-blue-400 dark:to-emerald-400">
              Agentic Web
            </span>
          </h1>

          {/* Subheadline */}
          <p className="mt-6 text-lg sm:text-xl text-neutral-600 dark:text-neutral-300 max-w-3xl mx-auto leading-relaxed">
            An open standard that lets websites declare how AI agents can access
            and interact with their content — with JSON Schema, verified
            identity, rate limits, and cross-protocol interop.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/docs"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-blue-800 transition-colors"
            >
              Read the Docs
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/playground"
              className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-6 py-3 text-sm font-semibold text-neutral-900 dark:text-white shadow-sm hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
            >
              <Terminal className="h-4 w-4" />
              Try the Playground
            </Link>
          </div>

          {/* Install commands */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 dark:bg-neutral-800 pl-4 pr-2 py-2 font-mono text-sm text-neutral-300">
              <span className="text-emerald-400">$</span>
              <span>npm install @apop/node</span>
              <CopyButton text="npm install @apop/node" />
            </div>
            <div className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 dark:bg-neutral-800 pl-4 pr-2 py-2 font-mono text-sm text-neutral-300">
              <span className="text-emerald-400">$</span>
              <span>pip install apop</span>
              <CopyButton text="pip install apop" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
