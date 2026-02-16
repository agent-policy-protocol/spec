"use client";

import {
  Shield,
  Bot,
  Gauge,
  Link2,
  Globe,
  FileText,
  Zap,
  Code2,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useState } from "react";

const featureCategories = [
  {
    id: "core",
    label: "Core Protocol",
    icon: Shield,
    features: [
      {
        icon: Shield,
        title: "Transparent Access Rules",
        description:
          "Define clear permissions by path, action, and agent identity. Give agents the clarity they need to interact confidently.",
        code: `{
  "version": "1.0",
  "rules": [{
    "path": "/api/*",
    "allow": ["read"],
    "agents": ["TrustedBot"]
  }]
}`,
      },
      {
        icon: Bot,
        title: "Agent Identity & Verification",
        description:
          "PKIX, DID, Verifiable Credentials, and partner tokens for cryptographic agent identity.",
        code: `{
  "verification": {
    "methods": ["pkix", "did", "vc"],
    "required": true
  }
}`,
      },
    ],
  },
  {
    id: "control",
    label: "Control & Limits",
    icon: Gauge,
    features: [
      {
        icon: Gauge,
        title: "Rate Limiting",
        description:
          "Per-agent, per-window request limits with custom HTTP headers for enforcement feedback.",
        code: `{
  "rateLimit": {
    "window": "1h",
    "maxRequests": 1000,
    "perAgent": true
  }
}`,
      },
      {
        icon: Zap,
        title: "Intent-Based Access",
        description:
          "Agents declare their intent (read, summarize, transact), and policies enforce accordingly.",
        code: `{
  "intents": {
    "read": {"allow": true},
    "summarize": {"allow": true},
    "transact": {"allow": false}
  }
}`,
      },
    ],
  },
  {
    id: "integration",
    label: "Integration",
    icon: Link2,
    features: [
      {
        icon: Link2,
        title: "Cross-Protocol Interop",
        description:
          "Links to MCP, A2A, WebMCP, UCP, and APAAI. APoP is the authorization layer for all protocols.",
        code: `{
  "protocols": {
    "mcp": "/mcp-endpoint",
    "a2a": "/a2a-endpoint"
  }
}`,
      },
      {
        icon: Globe,
        title: "4 Discovery Methods",
        description:
          "Well-known URI, HTTP header, HTML meta tag, and DNS TXT record for maximum flexibility.",
        code: `<!-- HTML Meta -->
<meta name="agent-policy" 
  content="/.well-known/agent-policy.json">`,
      },
    ],
  },
  {
    id: "developer",
    label: "Developer Tools",
    icon: Code2,
    features: [
      {
        icon: FileText,
        title: "9 Ready-Made Templates",
        description:
          "News, e-commerce, SaaS, healthcare, open data, and more — get started in seconds.",
        code: `# Use a template
npx @apop/cli init --template=ecommerce`,
      },
      {
        icon: Code2,
        title: "SDK & Middleware",
        description:
          "Node.js and Python SDKs with Express, Next.js, and FastAPI middleware for instant integration.",
        code: `import { apopMiddleware } from '@apop/node';
app.use(apopMiddleware());`,
      },
    ],
  },
];

export function Features() {
  const [selectedTab, setSelectedTab] = useState("core");

  return (
    <section className="py-20 sm:py-28 bg-muted/30 border-t border-border relative">
      <div className="absolute inset-0 protocol-grid opacity-30" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="mb-16 space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 border border-primary/30 bg-primary/5 px-4 py-2 rounded-full text-primary">
            <Shield className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              Features
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
            Everything You Need for the Agentic Web
          </h2>
          <p className="text-lg text-muted-foreground">
            A complete authorization framework for AI agent interactions
          </p>
        </div>

        {/* Desktop: Tabs Layout */}
        <div className="hidden lg:block">
          <Tabs
            value={selectedTab}
            onValueChange={setSelectedTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-4 border border-border rounded-xl p-1.5 bg-background/80 dark:bg-background/50 backdrop-blur">
              {featureCategories.map((category) => {
                const Icon = category.icon;
                return (
                  <TabsTrigger
                    key={category.id}
                    value={category.id}
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground min-h-[44px] py-3 px-6 font-semibold text-sm rounded-lg transition-all flex items-center justify-center"
                    aria-label={`${category.label} features`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {category.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {featureCategories.map((category) => (
              <TabsContent
                key={category.id}
                value={category.id}
                className="mt-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {category.features.map((feature, idx) => {
                    const Icon = feature.icon;
                    return (
                      <Card
                        key={feature.title}
                        className="border border-border bg-card backdrop-blur hover:border-primary/50 hover:shadow-lg transition-all group"
                        style={{
                          animationDelay: `${idx * 100}ms`,
                        }}
                      >
                        <CardHeader className="space-y-4">
                          <div className="flex items-start justify-between">
                            <div className="rounded-xl bg-primary/10 dark:bg-primary/20 p-3 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                              <Icon className="h-6 w-6" />
                            </div>
                            <div className="text-xs font-mono text-muted-foreground bg-muted/50 dark:bg-muted px-2.5 py-1 rounded">
                              0{idx + 1}
                            </div>
                          </div>
                          <CardTitle className="text-xl font-bold tracking-tight">
                            {feature.title}
                          </CardTitle>
                          <CardDescription className="text-sm leading-relaxed">
                            {feature.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="border border-border rounded-lg overflow-hidden">
                            <div className="bg-muted/80 dark:bg-muted px-3 py-2 border-b border-border">
                              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                Code
                              </span>
                            </div>
                            <pre className="bg-muted/30 dark:bg-muted/50 p-4 text-xs overflow-x-auto min-h-25">
                              <code className="text-foreground/90 dark:text-foreground font-mono leading-relaxed">
                                {feature.code}
                              </code>
                            </pre>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Mobile: Accordion Layout */}
        <div className="lg:hidden">
          <Accordion
            type="single"
            collapsible
            defaultValue="core"
            className="space-y-4"
          >
            {featureCategories.map((category) => {
              const CategoryIcon = category.icon;
              return (
                <AccordionItem
                  key={category.id}
                  value={category.id}
                  className="border border-border rounded-xl bg-card/50 backdrop-blur overflow-hidden"
                >
                  <AccordionTrigger className="px-4 py-4 hover:no-underline hover:bg-muted/50">
                    <div className="flex items-center gap-3">
                      <CategoryIcon className="h-5 w-5 text-primary" />
                      <span className="font-semibold text-sm">
                        {category.label}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-4 pt-4">
                      {category.features.map((feature) => {
                        const Icon = feature.icon;
                        return (
                          <div
                            key={feature.title}
                            className="border-l-4 border-primary pl-4 space-y-3"
                          >
                            <div className="flex items-start gap-3">
                              <div className="rounded-lg bg-primary/10 p-2 text-primary">
                                <Icon className="h-4 w-4" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-sm mb-1">
                                  {feature.title}
                                </h4>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                  {feature.description}
                                </p>
                              </div>
                            </div>
                            <pre className="border border-border bg-muted/50 rounded-lg p-3 text-xs overflow-x-auto">
                              <code className="text-foreground font-mono">
                                {feature.code}
                              </code>
                            </pre>
                          </div>
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
