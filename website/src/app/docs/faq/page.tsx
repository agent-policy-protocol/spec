import { source } from "@/lib/source";
import {
  DocsPage,
  DocsBody,
  DocsDescription,
  DocsTitle,
} from "fumadocs-ui/page";
import { notFound } from "next/navigation";
import defaultMdxComponents from "fumadocs-ui/mdx";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description:
    "Common questions about the Agent Policy Protocol (APoP) and how to implement it.",
  alternates: {
    canonical: "https://agentpolicy.org/docs/faq",
  },
};

export default async function FAQPage() {
  const page = source.getPage(["faq"]);
  if (!page) notFound();

  const MDX = page.data.body;

  // FAQ Schema - structured data for search engines
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is APoP?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Agent Policy Protocol (APoP) is an open standard that enables websites to declare how AI agents can access and interact with their content. It provides a standardized way to specify permissions, rate limits, verification requirements, and interoperability with other protocols.",
        },
      },
      {
        "@type": "Question",
        name: "How is APoP different from robots.txt?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "While robots.txt provides simple crawl directives for search engines, APoP offers rich action vocabulary, agent verification, rate limiting, protocol interoperability, path-specific policies, and JSON Schema validation.",
        },
      },
      {
        "@type": "Question",
        name: "Is APoP a replacement for robots.txt?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No, APoP complements robots.txt. Robots.txt remains the standard for traditional web crawlers. APoP adds agent-specific authorization for the new generation of AI-powered interactions.",
        },
      },
      {
        "@type": "Question",
        name: "Where do I place my agent-policy.json file?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The recommended location is https://yourdomain.com/.well-known/agent-policy.json. This follows the RFC 8615 well-known URI standard.",
        },
      },
      {
        "@type": "Question",
        name: "What's the minimum policy I need?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "A minimal policy only needs the version field and defaultPolicy with allow set to true. However, it's recommended to also specify allowed actions and rate limits.",
        },
      },
      {
        "@type": "Question",
        name: "How do I allow reading but prevent training?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Use the action-based policy by setting allowed actions to read, summarize, and index, while setting disallowedActions to train and extract.",
        },
      },
      {
        "@type": "Question",
        name: "Can I have different policies for different paths?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, use pathPolicies to define different rules for different paths on your website. Each path can have its own allow/disallow rules, actions, and rate limits.",
        },
      },
      {
        "@type": "Question",
        name: "How do I require agent verification?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Enable verification in your policy by setting verification.required to true and specifying accepted methods like pkix or did. Agents must then provide cryptographic proof of identity via the Agent-Verification header.",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />
      <DocsPage
        toc={page.data.toc}
        editOnGithub={{
          repo: "spec",
          owner: "agent-policy-protocol",
          sha: "main",
          path: `website/content/docs/${page.path}`,
        }}
      >
        <DocsTitle>{page.data.title}</DocsTitle>
        <DocsDescription>{page.data.description}</DocsDescription>
        <DocsBody>
          <MDX components={{ ...defaultMdxComponents }} />
        </DocsBody>
      </DocsPage>
    </>
  );
}
