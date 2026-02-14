"use client";

import { useState } from "react";
import { CopyButton } from "@/components/copy-button";

const tabs = [
  {
    label: "agent-policy.json",
    language: "json",
    code: `{
  "$schema": "https://agentpolicy.org/schema/v1/agent-policy.schema.json",
  "version": "1.0",
  "defaultPolicy": {
    "allow": true,
    "actions": ["read", "index", "summarize"],
    "rateLimit": { "requests": 100, "window": "hour" },
    "requireVerification": false
  },
  "pathPolicies": [
    {
      "path": "/api/**",
      "allow": true,
      "actions": ["api_call"],
      "rateLimit": { "requests": 60, "window": "minute" },
      "requireVerification": true
    }
  ]
}`,
  },
  {
    label: "Node.js",
    language: "javascript",
    code: `import express from "express";
import { createAgentPolicyMiddleware } from "@apop/node/middleware/express";

const app = express();

app.use(createAgentPolicyMiddleware({
  policyPath: "./.well-known/agent-policy.json",
}));

app.listen(3000);`,
  },
  {
    label: "Python",
    language: "python",
    code: `from fastapi import FastAPI
from apop.middleware.fastapi import AgentPolicyMiddleware

app = FastAPI()

app.add_middleware(
    AgentPolicyMiddleware,
    policy_path=".well-known/agent-policy.json",
)`,
  },
  {
    label: "curl",
    language: "bash",
    code: `# Test your APoP policy
curl -s https://example.com/.well-known/agent-policy.json | jq .

# Make a request with APoP headers
curl -H "Agent-Name: MyCrawler/1.0" \\
     -H "Agent-Intent: read, summarize" \\
     https://example.com/api/data`,
  },
];

export function CodePreview() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <section className="py-16 sm:py-24 bg-white dark:bg-neutral-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white">
            Get Started in Minutes
          </h2>
          <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-300">
            Drop-in middleware for your favorite framework, or just serve a JSON
            file.
          </p>
        </div>

        <div className="mx-auto max-w-3xl">
          {/* Tabs */}
          <div className="flex flex-wrap border-b border-neutral-200 dark:border-neutral-700 mb-0">
            {tabs.map((tab, index) => (
              <button
                key={tab.label}
                onClick={() => setActiveTab(index)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === index
                    ? "border-blue-700 text-blue-700 dark:border-blue-400 dark:text-blue-400"
                    : "border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Code block */}
          <div className="relative rounded-b-xl bg-neutral-900 dark:bg-neutral-800 p-6 overflow-x-auto">
            <div className="absolute top-3 right-3">
              <CopyButton text={tabs[activeTab].code} />
            </div>
            <pre className="text-sm text-neutral-300 leading-relaxed">
              <code>{tabs[activeTab].code}</code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
