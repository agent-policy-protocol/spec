# Agent Policy Protocol (APoP) v1.0

**The authorization layer for the agentic web.**
An open standard that lets websites declare how AI agents can access and interact with their content — with JSON Schema, verified identity, rate limits, and cross-protocol interop.

[![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![APoP Version](https://img.shields.io/badge/APoP-v1.0-green.svg)](spec/schema/agent-policy.schema.json)
[![JSON Schema](https://img.shields.io/badge/Schema-Draft%202020--12-orange.svg)](spec/schema/agent-policy.schema.json)

---

## Overview

`agent-policy.json` defines how AI agents are allowed to interact with your website — what they can access, what actions are permitted, how often, and whether they must verify identity.

Think of it as **robots.txt for the agentic web**, built under the **Agent Policy Protocol (APoP)** standard. Place it at:

\`\`\`
https://example.com/.well-known/agent-policy.json
\`\`\`

---

## Quick Start

**1. Create your policy** — save as `/.well-known/agent-policy.json`:

\`\`\`json
{
"$schema": "https://agentpolicy.org/schema/v1/agent-policy.schema.json",
"version": "1.0",
"defaultPolicy": {
"allow": true,
"actions": ["read", "index", "summarize"],
"disallow": ["extract", "automated_purchase"],
"rateLimit": { "requests": 100, "window": "hour" },
"requireVerification": false
},
"pathPolicies": [
{ "path": "/admin/_", "allow": false },
{ "path": "/api/_", "allow": true, "actions": ["api_call"], "requireVerification": true }
]
}
\`\`\`

**2. Test it** with curl:

\`\`\`bash
curl -H "Agent-Name: MyBot" \
 -H "Agent-Intent: read" \
 https://example.com/.well-known/agent-policy.json
\`\`\`

**3. Add the middleware** to your Express app:

\`\`\`bash
cd middleware && npm install && node index.express.js
\`\`\`

See [examples/](examples/) for 9 industry-specific policy templates.

---

## Specification

| Document                                                                     | Description                                                             |
| ---------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| [spec/schema/agent-policy.schema.json](spec/schema/agent-policy.schema.json) | JSON Schema (draft 2020-12) for the APoP v1.0 manifest                  |
| [spec/discovery.md](spec/discovery.md)                                       | 4 discovery methods: well-known URI, HTTP header, HTML meta, DNS TXT    |
| [spec/agent-identification.md](spec/agent-identification.md)                 | 7 agent headers, 4 verification methods, 3 identity tiers               |
| [spec/http-extensions.md](spec/http-extensions.md)                           | Custom HTTP status codes: 430, 438, 439; response headers; error format |
| [SPEC.md](SPEC.md)                                                           | Original v0.1 draft (superseded by `spec/` directory)                   |

---

## Quick Summary

- **Discovery**: 4 methods with defined priority — well-known URI, HTTP header, HTML meta tag, DNS TXT record
- **10 action types**: `read`, `index`, `extract`, `summarize`, `render`, `api_call`, `form_submit`, `automated_purchase`, `tool_invoke`, `all`
- **3 custom HTTP status codes**: `430 Agent Action Not Allowed`, `438 Agent Rate Limited`, `439 Agent Verification Required`
- **3 identity tiers**: Anonymous → Identified → Verified
- **4 verification methods**: `pkix`, `did`, `verifiable-credential`, `partner-token`
- **Cross-protocol interop**: Links to A2A Agent Cards, MCP servers, WebMCP, UCP, APAAI

---

## Schema Summary (v1.0)

| **Field**       | **Purpose**                                                                                                         |
| --------------- | ------------------------------------------------------------------------------------------------------------------- |
| `version`       | APoP protocol version. Use `"1.0"` for the current specification.                                                   |
| `policyUrl`     | Canonical URL where the policy is hosted (e.g., `https://example.com/.well-known/agent-policy.json`).               |
| `defaultPolicy` | Site-wide fallback rules — `allow`, `disallow`, `actions`, `rateLimit`, `requireVerification`.                      |
| `pathPolicies`  | Path-specific policy overrides with glob patterns (`*`, `**`), `agentAllowlist`, `agentDenylist`.                   |
| `verification`  | Verification configuration — `method` (pkix/did/verifiable-credential/partner-token), `registry`, `trustedIssuers`. |
| `contact`       | Contact info — `email`, `policyUrl`, `abuseUrl`.                                                                    |
| `metadata`      | Human-readable metadata — `description`, `owner`, `lastModified`, `license`.                                        |
| `interop`       | Cross-protocol declarations — `a2aAgentCard`, `mcpServerUrl`, `webmcpEnabled`, `ucpCapabilities`, `apaaiEndpoint`.  |

---

## Ecosystem Positioning

APoP is the **authorization layer** that complements the broader agentic protocol ecosystem:

| Protocol                                                             | What It Does                                              | How APoP Relates                                                                                |
| -------------------------------------------------------------------- | --------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| **[MCP](https://modelcontextprotocol.io/)** (Model Context Protocol) | Defines how agents invoke tools and access context        | APoP gates _which_ MCP tools an agent may call. `interop.mcpServerUrl` links to MCP endpoint.   |
| **[A2A](https://google.github.io/A2A/)** (Agent-to-Agent Protocol)   | Defines how agents communicate with each other            | APoP enforces access rules _before_ A2A delegation. `interop.a2aAgentCard` links to Agent Card. |
| **[WebMCP](https://anthropic.com/research/webmcp)**                  | Exposes browser-side tools via `navigator.modelContext`   | APoP determines _if_ a WebMCP tool may execute. `interop.webmcpEnabled` declares support.       |
| **[AP2](https://protocols.ai/ap2)** (Agent Protocol v2)              | Agent lifecycle and identity using Verifiable Credentials | APoP supports AP2's VC-based verification via `verifiable-credential` method.                   |
| **[APAAI](https://apaai.org/)**                                      | Accountability and audit logging for agent actions        | APoP works alongside APAAI for compliance. `interop.apaaiEndpoint` links to audit endpoint.     |
| **[UCP](https://ucp.dev/)** (Universal Commerce Protocol)            | Agent-mediated commerce transactions                      | APoP governs `automated_purchase` actions. `interop.ucpCapabilities` links to UCP profile.      |

> **MCP/WebMCP solve _how_ agents invoke tools. A2A solves _how_ agents talk to each other. APoP solves _whether they're allowed to_.**

---

## Why It Matters

AI agents are already browsing, summarizing, and interacting with the web — but websites have no standardized way to express **consent or control**. APoP introduces a simple, open mechanism that brings **balance** between innovation and ownership.

---

## Origin Story

This initiative was inspired by growing friction between AI agents and web platforms — most notably a public discussion sparked by [Perplexity AI's CEO](https://www.perplexity.ai/hub/blog/bullying-is-not-innovation) after Amazon attempted to block their Comet Assistant.

<img width="555" height="347" alt="image" src="https://github.com/user-attachments/assets/4f4ffbfb-1d54-4886-a0cb-0558d9a4499f" />

> "We would be happy to work together with Amazon to figure out a win-win outcome for both us and them.
> But when it comes to attempts to block our Comet Assistant on Amazon and hurt our users —
> we will have to stand up for them and not get bullied by Amazon."

APoP emerged as a constructive path forward: an open, transparent, consent-based standard for the agentic web.

---

## Project Structure

\`\`\`
agent-policy.json # Example v1.0 policy manifest
spec/
schema/agent-policy.schema.json # JSON Schema (draft 2020-12)
discovery.md # Discovery methods spec
agent-identification.md # Agent headers & verification spec
http-extensions.md # HTTP status codes & headers spec
middleware/
index.express.js # Express.js reference middleware
index.js # Vercel serverless handler
examples/ # Industry-specific policy templates
tests/conformance/ # Conformance test suite
docs/ # Project documentation
\`\`\`

---

## Notes

- Place `agent-policy.json` at `/.well-known/agent-policy.json` on your site.
- Agents should discover and respect this file before interacting with your website.
- Use `"requireVerification": true` for sensitive endpoints.
- Path patterns support glob matching: `*` (single segment), `**` (multiple segments).
- `disallow` takes precedence over `allow` when both are present.
- `agentAllowlist` restricts a path to specific agent identifiers (DID URIs, emails, or name patterns).

---

## Stewardship

The Agent Policy Protocol (APoP) was initiated by [**Arun Vijayarengan**](https://www.linkedin.com/in/arunvijayarengan), Founder & CEO of [**Superdom AI**](https://superdom.ai), to ensure the next generation of AI agents and websites can cooperate transparently — balancing **innovation** with **respect for access, ownership, and user trust**.

---

## License

Apache 2.0 — open for community contribution.
Pull requests, RFCs, and implementation feedback are encouraged.
READMEEOF
