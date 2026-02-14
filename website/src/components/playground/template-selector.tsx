"use client";

import { useState } from "react";
import { ChevronDown, FileJson } from "lucide-react";

// Inline the example templates to avoid bundling issues
const templates: Record<
  string,
  { name: string; json: Record<string, unknown> }
> = {
  blank: {
    name: "Blank Policy",
    json: {
      $schema: "https://agentpolicy.org/schema/v1/agent-policy.schema.json",
      version: "1.0",
      defaultPolicy: {
        allow: true,
        actions: ["read"],
      },
    },
  },
  "personal-blog": {
    name: "Personal Blog",
    json: {
      $schema: "https://agentpolicy.org/schema/v1/agent-policy.schema.json",
      version: "1.0",
      defaultPolicy: {
        allow: true,
        actions: ["read", "index", "summarize"],
        disallow: ["extract", "api_call", "form_submit"],
        rateLimit: { requests: 100, window: "hour" },
        requireVerification: false,
      },
      pathPolicies: [
        {
          path: "/posts/**",
          allow: true,
          actions: ["read", "index", "summarize"],
        },
        { path: "/admin/**", allow: false },
      ],
    },
  },
  "news-publisher": {
    name: "News Publisher",
    json: {
      $schema: "https://agentpolicy.org/schema/v1/agent-policy.schema.json",
      version: "1.0",
      defaultPolicy: {
        allow: true,
        actions: ["read", "index"],
        disallow: ["summarize", "extract", "train"],
        rateLimit: { requests: 60, window: "minute" },
        requireVerification: true,
      },
      pathPolicies: [
        {
          path: "/articles/**",
          allow: true,
          actions: ["read", "index"],
          rateLimit: { requests: 30, window: "minute" },
        },
        {
          path: "/api/**",
          allow: true,
          actions: ["read"],
          requireVerification: true,
        },
        { path: "/admin/**", allow: false },
      ],
    },
  },
  ecommerce: {
    name: "E-Commerce Store",
    json: {
      $schema: "https://agentpolicy.org/schema/v1/agent-policy.schema.json",
      version: "1.0",
      defaultPolicy: {
        allow: true,
        actions: ["read", "index", "navigate"],
        disallow: ["extract", "automated_purchase", "train"],
        rateLimit: { requests: 120, window: "minute" },
      },
      pathPolicies: [
        {
          path: "/products/**",
          allow: true,
          actions: ["read", "index", "summarize"],
        },
        { path: "/cart/**", allow: false },
        { path: "/checkout/**", allow: false },
        { path: "/account/**", allow: false },
      ],
    },
  },
  "saas-api": {
    name: "SaaS API Platform",
    json: {
      $schema: "https://agentpolicy.org/schema/v1/agent-policy.schema.json",
      version: "1.0",
      defaultPolicy: {
        allow: true,
        actions: ["read"],
        rateLimit: { requests: 30, window: "minute" },
        requireVerification: true,
      },
      pathPolicies: [
        {
          path: "/api/v1/**",
          allow: true,
          actions: ["read", "api_call"],
          requireVerification: true,
          rateLimit: { requests: 100, window: "hour" },
        },
        {
          path: "/docs/**",
          allow: true,
          actions: ["read", "index", "summarize"],
        },
        { path: "/admin/**", allow: false },
      ],
    },
  },
  healthcare: {
    name: "Healthcare (HIPAA)",
    json: {
      $schema: "https://agentpolicy.org/schema/v1/agent-policy.schema.json",
      version: "1.0",
      defaultPolicy: {
        allow: false,
        requireVerification: true,
      },
      pathPolicies: [
        { path: "/public/**", allow: true, actions: ["read", "index"] },
        { path: "/patient/**", allow: false },
        { path: "/api/**", allow: false },
      ],
    },
  },
  "open-data": {
    name: "Open Data Portal",
    json: {
      $schema: "https://agentpolicy.org/schema/v1/agent-policy.schema.json",
      version: "1.0",
      defaultPolicy: {
        allow: true,
        actions: ["read", "index", "summarize", "extract", "api_call"],
        rateLimit: { requests: 1000, window: "hour" },
        requireVerification: false,
      },
    },
  },
  restrictive: {
    name: "Restrictive (High Security)",
    json: {
      $schema: "https://agentpolicy.org/schema/v1/agent-policy.schema.json",
      version: "1.0",
      defaultPolicy: {
        allow: false,
        requireVerification: true,
      },
      pathPolicies: [
        { path: "/.well-known/**", allow: true, actions: ["read"] },
      ],
    },
  },
  wordpress: {
    name: "WordPress Default",
    json: {
      $schema: "https://agentpolicy.org/schema/v1/agent-policy.schema.json",
      version: "1.0",
      defaultPolicy: {
        allow: true,
        actions: ["read", "index", "summarize"],
        disallow: ["extract", "form_submit", "automated_purchase"],
        rateLimit: { requests: 60, window: "minute" },
      },
      pathPolicies: [
        { path: "/wp-admin/**", allow: false },
        { path: "/wp-login.php", allow: false },
        {
          path: "/wp-json/**",
          allow: true,
          actions: ["read"],
          rateLimit: { requests: 30, window: "minute" },
        },
      ],
    },
  },
  "multi-protocol": {
    name: "Multi-Protocol Interop",
    json: {
      $schema: "https://agentpolicy.org/schema/v1/agent-policy.schema.json",
      version: "1.0",
      defaultPolicy: {
        allow: true,
        actions: ["read", "index"],
        rateLimit: { requests: 100, window: "minute" },
      },
      interoperability: {
        mcp: { serverUrl: "https://example.com/.well-known/mcp.json" },
        a2a: { agentCardUrl: "https://example.com/.well-known/agent.json" },
      },
    },
  },
};

interface TemplateSelectorProps {
  onLoad: (json: string) => void;
}

export function TemplateSelector({ onLoad }: TemplateSelectorProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (key: string) => {
    const template = templates[key];
    if (template) {
      onLoad(JSON.stringify(template.json, null, 2));
    }
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
      >
        <FileJson className="h-4 w-4" />
        Load Template
        <ChevronDown
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 z-20 mt-1 w-64 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-lg py-1">
            {Object.entries(templates).map(([key, template]) => (
              <button
                key={key}
                onClick={() => handleSelect(key)}
                className="w-full text-left px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                {template.name}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
