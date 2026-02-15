import { AlertTriangle, ArrowRight } from "lucide-react";

export function ProblemStatement() {
  return (
    <section className="py-16 sm:py-24 bg-white dark:bg-neutral-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950 px-4 py-1.5 text-sm font-medium text-amber-700 dark:text-amber-300 mb-6">
            <AlertTriangle className="h-4 w-4" />
            The Problem
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white">
            The Agentic Web Needs Rules
          </h2>
          <p className="mt-6 text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed">
            AI agents are browsing, summarizing, and transacting on the web —
            but without clear rules, both sides face legal uncertainty. APoP
            brings{" "}
            <span className="font-semibold text-neutral-900 dark:text-white">
              robots.txt-level simplicity
            </span>{" "}
            to the age of intelligent agents.
          </p>

          {/* Before/After visual */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/50 p-6 text-left">
              <h3 className="font-semibold text-red-700 dark:text-red-400 mb-3">
                Without APoP
              </h3>
              <ul className="space-y-2 text-sm text-red-600 dark:text-red-300">
                <li>• No shared rules — agents guess what&apos;s allowed</li>
                <li>• Legal uncertainty slows innovation on both sides</li>
                <li>• robots.txt can&apos;t express intent or verification</li>
                <li>• No standard for rate limits or action permissions</li>
                <li>• No way for agents to prove their identity</li>
              </ul>
            </div>
            <div className="rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/50 p-6 text-left">
              <h3 className="font-semibold text-emerald-700 dark:text-emerald-400 mb-3">
                With APoP
              </h3>
              <ul className="space-y-2 text-sm text-emerald-600 dark:text-emerald-300">
                <li>• Clear rules — agents know what&apos;s allowed</li>
                <li>• Per-path, per-agent transparent permissions</li>
                <li>• Verified agent identity builds trust</li>
                <li>• Standard rate limits enable fair access</li>
                <li>• Cross-protocol interop (MCP, A2A, WebMCP)</li>
              </ul>
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
    <section className="py-16 sm:py-24 bg-neutral-50 dark:bg-neutral-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white">
            How It Works
          </h2>
          <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-300">
            Three steps to set clear rules for AI agents on your website.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((item) => (
            <div key={item.step} className="relative">
              {/* Step number */}
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-700 text-white font-bold text-lg mb-4">
                {item.step}
              </div>
              {/* Connector line */}
              {item.step < 3 && (
                <div className="hidden md:block absolute top-5 left-12 w-[calc(100%-3rem)]">
                  <ArrowRight className="h-5 w-5 text-neutral-300 dark:text-neutral-600" />
                </div>
              )}
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
                {item.title}
              </h3>
              <p className="text-neutral-600 dark:text-neutral-300 mb-4">
                {item.description}
              </p>
              <pre className="rounded-lg bg-neutral-900 dark:bg-neutral-800 p-4 text-sm text-neutral-300 overflow-x-auto">
                <code>{item.code}</code>
              </pre>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
