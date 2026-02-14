# APoP (Agent Policy Protocol) — Implementation Plan v1

## Revised: February 2026

---

## Review of Changes Since v0

The original plan was drafted in November 2025. Since then, the agentic AI standards landscape has exploded. This v1 revision accounts for six major protocols that are now live or in active draft — and repositions APoP to fill the specific gap none of them cover: **website-side consent, access governance, and agent verification for the open web**.

### What Changed

| Area                 | v0 (Nov 2025)                         | v1 (Feb 2026)                                                                                                                                                 |
| -------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Landscape**        | MCP was emerging; A2A was pre-release | MCP mature (LF project), A2A at v0.3 (LF, 22k stars), UCP launched by Google, AP2 announced with 60+ partners, APAAI published v1.0, WebMCP is a W3C CG draft |
| **Schema**           | Loosely defined, ad-hoc fields        | Must align with `.well-known` conventions and interop with A2A Agent Cards and MCP tool schemas                                                               |
| **Discovery**        | Three methods listed but unspecified  | Must match the `.well-known` pattern used by A2A and UCP; clear precedent now exists                                                                          |
| **Verification**     | PKI mentioned generically             | AP2 sets a precise precedent with Verifiable Credentials and cryptographic mandates — APoP should align                                                       |
| **Interoperability** | Mentioned MCP/WebMCP vaguely          | Concrete bridge specs needed for MCP, A2A, WebMCP, UCP, and AP2                                                                                               |
| **Standards track**  | "W3C/IETF submission" as v1.0 goal    | W3C Autonomous Agents CG and Web Machine Learning CG are active homes; IETF also viable for HTTP-layer concerns                                               |
| **Positioning**      | "robots.txt for agents"               | Refined: "The authorization & consent layer for the agentic web" — complementary to all six protocols                                                         |

---

## Competitive Landscape Analysis

Understanding exactly what each standard does — and what it **doesn't** do — is critical for positioning APoP.

### MCP — Model Context Protocol

- **By:** Anthropic → Linux Foundation
- **What:** Standardized client-server protocol for connecting AI apps to external tools, data sources, and workflows. "USB-C for AI applications."
- **Mechanism:** Local stdio or HTTP+SSE transport between an AI host (Claude, ChatGPT) and MCP servers that expose tools/resources/prompts.
- **Gap APoP fills:** MCP defines _how agents connect to tools_, but says nothing about _whether a website consents to being accessed_ or what actions are allowed. An MCP server can expose a "scrape this URL" tool — APoP is what the target website uses to say "no."

### A2A — Agent-to-Agent Protocol

- **By:** Google → Linux Foundation (v0.3, 22k GitHub stars, 139 contributors)
- **What:** Open protocol for inter-agent communication. Agents discover each other via "Agent Cards" (JSON metadata), then exchange tasks using JSON-RPC 2.0 over HTTP(S). Supports sync, streaming (SSE), and async push.
- **Key concept:** Agents collaborate _without exposing internal state_ — opaque interoperability.
- **SDKs:** Python, Go, JS, Java, .NET
- **Gap APoP fills:** A2A governs agent↔agent communication. It doesn't address agent↔website consent. When Agent A sends Agent B to fetch data from `example.com`, there's no mechanism in A2A for `example.com` to declare its policies. APoP is that mechanism.

### UCP — Universal Commerce Protocol

- **By:** Google (open-source, Apache 2.0, 2.3k stars)
- **What:** Standardizes commerce interactions (checkout, identity linking, orders, payment token exchange) between AI platforms, merchants, PSPs, and credential providers. Transport-agnostic — works over REST, MCP, or A2A.
- **Key concept:** Composable "Capabilities" (Checkout, Identity Linking) + "Extensions" (Discounts, Fulfillment). Businesses declare capabilities in a standardized profile for autonomous discovery.
- **Gap APoP fills:** UCP standardizes _what_ commerce actions agents can perform and _how_. APoP governs _whether_ the merchant's website permits the agent to access those endpoints at all, at what rate, and with what verification.

### AP2 — Agent Payments Protocol

- **By:** Google with 60+ partners (Mastercard, PayPal, American Express, Adyen, Coinbase, etc.)
- **What:** Extends A2A/MCP for secure agent-initiated payments. Core mechanism: **Mandates** — cryptographically signed, tamper-proof digital contracts (Intent Mandate → Cart Mandate) using Verifiable Credentials.
- **Key concept:** Non-repudiable audit trail for authorization, authenticity, and accountability of agent payments.
- **Gap APoP fills:** AP2 handles _payment authorization_. APoP handles _access authorization_ — the layer before a transaction even begins. A website might allow an agent to browse products (APoP: `allow: ["read"]`) but block automated purchases (APoP: `disallow: ["automated-purchases"]`) unless the agent is verified.

### APAAI — Accountability Protocol for Agentic AI

- **By:** apaAI Labs (v1.0, RFC-2025-001, Apache 2.0)
- **What:** Defines an **Action → Policy → Evidence** accountability loop for autonomous agent actions. Model-agnostic HTTP API with three primitives: Action (structured intent), Policy (rules that constrain execution, enforce/observe modes), Evidence (attestable outcomes).
- **Key concept:** Human-in-the-loop approval as a first-class primitive. Verifiable evidence records with optional signing.
- **Gap APoP fills:** APAAI records _what an agent did_ and _whether it was compliant_. APoP declares _what a website allows_ in advance. They're complementary: APoP defines the rules, APAAI logs compliance with those rules. An APAAI policy could reference an APoP manifest as its source of truth.

### WebMCP — Web Model Context Protocol

- **By:** W3C Web Machine Learning Community Group (Draft, Feb 12, 2026; editors from Microsoft & Google)
- **What:** Browser-level JavaScript API (`navigator.modelContext`) that allows web pages to register structured _tools_ (name, description, JSON Schema, execute callback) that browser agents and AI platforms can invoke. Declarative (HTML forms) + Imperative (JS) APIs.
- **Key concept:** Web pages become MCP-compatible tool servers _in the browser_ — no backend required. Includes `requestUserInteraction()` for human-in-the-loop during tool execution.
- **Gap APoP fills:** WebMCP defines _what tools a page offers to agents_. APoP defines _what agents are allowed to do on the page_ — including which agents, at what rate, and whether they must verify identity. A page could use WebMCP to expose tools AND use APoP to restrict which agents can invoke them.

### Agent Protocol (AP)

- **By:** AGI, Inc. / AI Engineer Foundation
- **What:** Tech-agnostic OpenAPI REST spec (`/ap/v1/agent/tasks`, `/steps`) for universal agent communication. Focus on benchmarking, standardized task execution, and framework interoperability.
- **Gap APoP fills:** Agent Protocol standardizes how to _talk to_ agents. APoP standardizes how websites _talk back_ — declaring consent and restrictions before agents act.

### W3C Autonomous Agents on the Web CG

- **What:** Community Group exploring Hypermedia Multi-Agent Systems (hMAS) — world-wide hybrid communities of people and AI agents on the Web, using Linked Data and Semantic Web standards.
- **Relevance:** Potential standards home for APoP. APoP aligns with their vision of transparent, accountable agent-web interaction.

---

## APoP's Unique Position

```
┌─────────────────────────────────────────────────────────────────┐
│                    THE AGENTIC WEB STACK                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │  WebMCP  │  │   MCP    │  │   A2A    │  │    AP    │       │
│  │ (tools)  │  │ (tools)  │  │ (agents) │  │ (tasks)  │       │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘       │
│       │              │              │              │             │
│       └──────────────┴──────┬───────┴──────────────┘             │
│                             │                                    │
│                    ┌────────▼────────┐                           │
│                    │      APoP      │  ← Consent & Access       │
│                    │ (authorization │     Governance Layer       │
│                    │  & consent)    │                            │
│                    └────────┬────────┘                           │
│                             │                                    │
│       ┌─────────────────────┼─────────────────────┐             │
│       │                     │                     │             │
│  ┌────▼─────┐  ┌────────────▼──────┐  ┌──────────▼───┐        │
│  │   UCP    │  │       AP2        │  │    APAAI     │        │
│  │(commerce)│  │   (payments)     │  │(accountability)│       │
│  └──────────┘  └──────────────────┘  └───────────────┘        │
│                                                                 │
│                    ┌──────────────────┐                         │
│                    │    Website /     │                         │
│                    │   robots.txt     │                         │
│                    └──────────────────┘                         │
└─────────────────────────────────────────────────────────────────┘
```

**APoP is the missing consent & authorization layer.** Every protocol above assumes the agent has the right to act. APoP is what makes that assumption explicit, verifiable, and enforceable.

---

## Project Context

You are building the reference implementation for the Agent Policy Protocol (APoP) — the web-native authorization and consent standard for AI agent interactions. APoP complements the existing protocol stack (MCP, A2A, WebMCP, UCP, AP2, APAAI, Agent Protocol) by answering the question none of them address:

> **"Does this website consent to this agent performing this action?"**

## Core Objective

Build a production-quality reference implementation and formal specification that:

1. Demonstrates how websites declare agent policies
2. Shows how agents discover and respect those policies
3. Integrates cleanly with MCP, A2A, WebMCP, UCP, AP2, and APAAI
4. Meets the bar for submission to W3C and/or IETF

---

## Phase 1: Formal Specification (Standards-Grade)

### Task 1.1: JSON Schema — `agent-policy.json`

**Location**: `/spec/schema/agent-policy.schema.json`

Create a JSON Schema (draft 2020-12) defining the APoP manifest. Key changes from v0:

- `version`: Protocol version. Start with `"1.0"` (bump from `"0.1"` draft).
- `$schema`: Self-referencing schema URL for validation
- `policyUrl`: Canonical URL to this policy document
- `defaultPolicy`: Site-wide fallback rules
  - `allow`: boolean (default access posture)
  - `actions`: Array of allowed/disallowed action types. Standardize a registry:
    - `"read"` — view/fetch content
    - `"index"` — add to search/knowledge indexes
    - `"extract"` — structured data extraction
    - `"summarize"` — content summarization
    - `"render"` — visual rendering/screenshot
    - `"api_call"` — invoke APIs
    - `"form_submit"` — submit forms
    - `"automated_purchase"` — programmatic buying
    - `"tool_invoke"` — invoke WebMCP/MCP tools
  - `rateLimit`: `{ requests: number, window: "minute" | "hour" | "day" }`
  - `requireVerification`: boolean
- `pathPolicies`: Array of path-specific overrides
  - `path`: string (glob pattern, e.g., `/api/*`, `/admin/**`)
  - `allow`: boolean
  - `actions`: array
  - `requireVerification`: boolean
  - `agentAllowlist`: array of agent identifiers (replaces `agentWhitelist`)
  - `agentDenylist`: array of agent identifiers (replaces `agentBlacklist`)
- `verification`: Verification configuration
  - `method`: `"pkix"` | `"did"` | `"verifiable-credential"` | `"partner-token"`
  - `registry`: URL to verification registry
  - `trustedIssuers`: Array of trusted VC issuer DIDs (alignment with AP2)
- `contact`: `{ email, policyUrl, abuseUrl }`
- `metadata`: `{ description, owner, maintainer, lastModified, license }`
- `interop`: Optional interoperability declarations
  - `a2aAgentCard`: URL to site's A2A Agent Card (if it acts as an agent)
  - `mcpServerUrl`: URL to site's MCP server endpoint
  - `webmcpEnabled`: boolean (whether the site exposes WebMCP tools)
  - `ucpCapabilities`: URL to UCP capability profile
  - `apaaiEndpoint`: URL to APAAI accountability endpoint

### Task 1.2: Discovery Specification

**Location**: `/spec/discovery.md`

Formalize four discovery methods (prioritized):

1. **Well-known URI** (Primary): `/.well-known/agent-policy.json`  
   — Follows the same pattern as A2A's `/.well-known/agent.json` and UCP's capability profiles. Register with IANA Well-Known URIs registry.

2. **HTTP Response Header**: `Agent-Policy: /.well-known/agent-policy.json`  
   — Sent by servers to actively communicate policy location. Parallels `Link:` headers and CSP.

3. **HTML Meta Tag**: `<meta name="agent-policy" content="/.well-known/agent-policy.json">`  
   — For static sites and CDN-hosted pages that can't set custom headers.

4. **DNS TXT Record**: `_agent-policy.example.com TXT "v=apop1; url=https://example.com/.well-known/agent-policy.json"`  
   — For domain-wide policy declaration. Follows DMARC/SPF pattern.

**Fallback chain**: Agents SHOULD check in order: DNS TXT → Well-known URI → HTTP Header → HTML Meta → `robots.txt` (legacy compatibility).

### Task 1.3: Agent Identification & Verification Spec

**Location**: `/spec/agent-identification.md`

Define how agents identify themselves. Updated to align with A2A Agent Cards and AP2 Verifiable Credentials:

- **Agent-Name Header** (Required): `Agent-Name: comet-assistant/1.2.3`
- **Agent-Intent Header** (Required): `Agent-Intent: summarization | indexing | commerce | tool-invoke`
- **Agent-Id Header**: `Agent-Id: did:web:agent.example.com` or `Agent-Id: agent-name@company.com`
- **Agent-Card Header**: `Agent-Card: https://agent.example.com/.well-known/agent.json`  
  — Points to an A2A-compatible Agent Card for full capability declaration.
- **Agent-KeyId / Agent-Signature**: For cryptographic verification (same as v0 spec)
- **Authorization via Verifiable Credentials**: For high-trust scenarios (AP2 alignment)
  - Agent presents a VC issued by a trusted issuer
  - Server validates VC against `verification.trustedIssuers` in policy

### Task 1.4: HTTP Status Codes & Response Headers

**Location**: `/spec/http-extensions.md`

Formalize custom status codes and register with IANA:

| Code    | Name                        | Description                                                                          |
| ------- | --------------------------- | ------------------------------------------------------------------------------------ |
| **430** | Agent Policy Violation      | Agent attempted a disallowed action                                                  |
| **431** | Agent Rate Limited          | Agent exceeded rate limits (Note: 431 is already assigned — propose **439** instead) |
| **432** | Agent Verification Required | Agent must verify identity                                                           |

**Important correction:** HTTP 431 is already assigned to "Request Header Fields Too Large" (RFC 6585). Propose reassignment:

- **438**: Agent Rate Limited
- **439**: Agent Verification Required

Or alternatively, use `403 Forbidden` with `Agent-Policy` response headers for broader compatibility, with these codes as optional extensions.

Response headers:

- `Agent-Policy: allow read | block unverified | deny`
- `Agent-Policy-Remaining: 95`
- `Agent-Policy-Reset: 1708905600` (Unix timestamp for rate limit reset)
- `WWW-Agent-Verify: https://example.com/.well-known/agent-verify`
- `Agent-Policy-Url: /.well-known/agent-policy.json`

### Task 1.5: Formal IETF/W3C Specification Document

**Location**: `/spec/draft-apop-v1.md` (Markdown) + `/spec/draft-apop-v1.xml` (xml2rfc format for IETF)

Write the specification in the style of an Internet-Draft (I-D) or W3C Community Group Report:

- Abstract, Status, Introduction
- Terminology (MUST/SHOULD/MAY per RFC 2119)
- Protocol Description
- Security Considerations
- IANA Considerations (well-known URI registration, header registration, status code registration)
- References (Normative + Informative)
- Appendices with examples

---

## Phase 2: Reference Server Implementations

### Task 2.1: Python Middleware (FastAPI)

**Location**: `/implementations/python/apop_middleware/`

Create an async FastAPI/Starlette middleware:

1. `APopMiddleware` class — pluggable into any ASGI app
2. Policy loader with file-based and URL-based loading + in-memory caching with TTL
3. Agent detection from `Agent-Name`, `Agent-Id`, `User-Agent` headers
4. Path matching with glob patterns (fnmatch) and prefix matching
5. Action-based permission checking
6. Rate limiting with pluggable backends (in-memory, Redis, Memcached)
7. Verification: signature validation, VC validation, partner token check
8. Compliance response headers (`Agent-Policy`, `Agent-Policy-Remaining`, etc.)
9. Structured logging with OpenTelemetry integration
10. Metrics emission (request counts by agent, policy decisions, rate limit hits)

### Task 2.2: Node.js Middleware (Express + generic HTTP)

**Location**: `/implementations/nodejs/apop-middleware/`

- Express middleware + generic Node.js HTTP handler (for Vercel/Cloudflare Workers/Deno)
- Same feature set as Python implementation
- TypeScript with full type definitions
- Published to npm as `@apop/middleware`

### Task 2.3: Go Middleware

**Location**: `/implementations/go/apop-middleware/`

- `net/http` middleware handler
- Minimal dependencies, designed for performance
- Use case: high-throughput API gateways, cloud-native infrastructure

### Task 2.4: WordPress Plugin

**Location**: `/implementations/wordpress/apop-wp/`

- Admin UI for policy configuration (no-code)
- Automatic `.well-known/agent-policy.json` serving
- Per-page/per-post policy overrides
- Integration with existing auth systems
- Analytics dashboard (agent visits, policy decisions)

### Task 2.5: Nginx/Caddy Modules

**Location**: `/implementations/nginx/` and `/implementations/caddy/`

- Infrastructure-level enforcement for sites that can't modify application code
- Nginx: OpenResty Lua module
- Caddy: Go-based Caddy module

---

## Phase 3: Agent SDK Implementation

### Task 3.1: Python Agent SDK

**Location**: `/implementations/python/apop_agent/`

- `APopClient` class with async support (httpx)
- `discover_policy(url)` — checks all four discovery methods in fallback order
- `check_permission(url, action)` — returns allow/deny with reason
- `request_with_compliance(method, url, **kwargs)` — wrapper that auto-checks policy
- Policy caching with TTL (configurable, default 1 hour)
- Automatic `Agent-Name`, `Agent-Intent`, `Agent-Id` header injection
- Rate limit tracking per domain
- Fallback to `robots.txt` parsing if no APoP policy found
- Full async/await with sync wrappers

### Task 3.2: Node.js/TypeScript Agent SDK

**Location**: `/implementations/nodejs/apop-agent/`

- Published to npm as `@apop/agent`
- Same capabilities as Python SDK
- Works in Node.js, Deno, Bun, and browser environments

### Task 3.3: Go Agent SDK

**Location**: `/implementations/go/apop-agent/`

- Lightweight, zero-dependency agent client
- Designed for CLI tools and server-to-server agent scenarios

---

## Phase 4: Framework Integrations (Critical for Adoption)

### Task 4.1: LangChain Integration

**Location**: `/integrations/langchain/`

- `APopToolWrapper` — wraps any LangChain tool to check APoP compliance before execution
- `APopWebLoader` — document loader that respects APoP policies
- Published to PyPI as `langchain-apop`

### Task 4.2: CrewAI Integration

**Location**: `/integrations/crewai/`

- APoP-aware tool decorator for CrewAI agents
- Automatic policy checking in crew task execution

### Task 4.3: LlamaIndex Integration

**Location**: `/integrations/llamaindex/`

- APoP-compliant web reader/retriever
- Policy-aware query engine wrapper

### Task 4.4: Google ADK (Agent Development Kit) Integration

**Location**: `/integrations/google-adk/`

- APoP middleware for ADK-built agents
- Natural fit given ADK's A2A support

### Task 4.5: OpenAI Agents SDK / Responses API Integration

**Location**: `/integrations/openai/`

- APoP-compliant function calling wrapper
- Web browsing tool with policy checking

---

## Phase 5: Interoperability Bridges

### Task 5.1: MCP ↔ APoP Bridge

**Location**: `/bridges/mcp/`

- MCP server that exposes `check_agent_policy` as an MCP tool
- Any MCP-connected agent can call this tool to check a website's APoP policy before accessing it
- MCP resource provider that exposes `agent-policy.json` as an MCP resource

### Task 5.2: A2A ↔ APoP Bridge

**Location**: `/bridges/a2a/`

- A2A Agent Card extension field: `agentPolicy` pointing to the agent's APoP compliance declaration
- A2A server middleware that checks APoP policies on downstream URLs before making requests
- Document how APoP discovery integrates with A2A's `/.well-known/agent.json`

### Task 5.3: WebMCP ↔ APoP Bridge

**Location**: `/bridges/webmcp/`

- JavaScript library that gates WebMCP tool registration based on APoP policy
- A page can load its APoP policy and conditionally expose/hide WebMCP tools based on the requesting agent's identity
- Example: Only expose checkout tools to verified agents; expose read-only tools to all

### Task 5.4: UCP ↔ APoP Bridge

**Location**: `/bridges/ucp/`

- UCP Capability Profile enrichment with APoP policy references
- Middleware for UCP checkout flows that validates APoP compliance before processing

### Task 5.5: AP2 ↔ APoP Bridge

**Location**: `/bridges/ap2/`

- APoP verification using AP2 Verifiable Credentials
- Bridge between APoP `verification.trustedIssuers` and AP2's VC-based mandate system
- Demonstrates: agent presents AP2 VC → APoP middleware validates → grants access

### Task 5.6: APAAI ↔ APoP Bridge

**Location**: `/bridges/apaai/`

- APAAI Policy rules that reference APoP manifests as their source of truth
- APAAI Evidence records linked to APoP policy decisions
- Example flow: Agent proposes action (APAAI) → checks APoP policy → executes → logs evidence (APAAI)

---

## Phase 6: Validation & Tooling

### Task 6.1: Policy Validator CLI

**Location**: `/tools/validator/`

CLI tool (`apop`) published to PyPI and npm:

```bash
apop validate policy.json              # Validate syntax against schema
apop check https://example.com         # Test policy discovery (all 4 methods)
apop scan --agent "mybot/1.0" \
  --intent "read" https://example.com  # Simulate agent request, report decision
apop diff old.json new.json            # Compare policy versions
apop lint policy.json                  # Best-practice linting
```

### Task 6.2: Compliance Test Suite

**Location**: `/tests/compliance/`

Comprehensive test suites (pytest + jest):

- Policy schema validation (positive + negative cases)
- Discovery across all four methods
- Path matching with wildcards, edge cases
- Rate limiting accuracy
- Agent allowlist/denylist logic
- Verification flow (PKI, DID, VC, partner token)
- HTTP status code responses
- Response header correctness
- Interop: A2A agent card linkage, MCP tool gating

### Task 6.3: Online Policy Validator & Generator

**Location**: `/tools/web-validator/`

Web application (hosted at `validator.agentpolicy.org`):

- Paste/upload policy JSON → instant validation
- Visual policy builder (no-code)
- Policy preview: "What would agent X see on path Y?"
- Generate policy from existing `robots.txt`

### Task 6.4: Browser Extension

**Location**: `/tools/browser-extension/`

Chrome/Firefox extension:

- Shows APoP policy for current site (badge indicator)
- Visualizes allowed/denied actions per path
- Displays rate limit status
- One-click policy validation
- Integration with WebMCP: shows which tools are policy-gated

---

## Phase 7: Documentation & Ecosystem

### Task 7.1: Getting Started Guides

**Location**: `/docs/getting-started/`

- **For website owners**: "Protect your site in 5 minutes" — generate and deploy an `agent-policy.json`
- **For agent developers**: "Build APoP-compliant agents" — use the SDK to auto-discover and respect policies
- **For enterprise**: "Deploy APoP at scale" — Nginx/Caddy modules, monitoring, analytics
- **For standards contributors**: "How APoP fits into the agentic web stack" — interop with MCP, A2A, WebMCP, UCP, AP2, APAAI

### Task 7.2: Example Policies

**Location**: `/examples/policies/`

Real-world templates:

- `news-publisher.json` — Paywalled content: allow read on free content, block extraction on premium, rate-limit all agents
- `e-commerce.json` — Allow product browsing, require verification for purchases, deny data extraction
- `saas-platform.json` — Tiered access: open API docs, verified-only for customer data endpoints
- `open-data.json` — Fully permissive with attribution requirements
- `government.json` — Public data with strict rate limits and mandatory verification
- `healthcare.json` — Block all agent access to patient-facing pages, allow on public health info
- `social-media.json` — Allow summarization, deny mass extraction, rate-limit indexing

### Task 7.3: API Reference

Auto-generated from code:

- Python: Sphinx + autodoc
- Node.js: TypeDoc
- Go: godoc
- Hosted at `docs.agentpolicy.org`

### Task 7.4: Comparison Guide

**Location**: `/docs/comparison.md`

Detailed feature comparison: APoP vs robots.txt vs CSP vs CORS vs each agentic protocol, with a clear "when to use what" decision matrix.

---

## Phase 8: Standards Submission & Community Building

### Task 8.1: W3C Community Group Report

- Submit APoP spec to W3C Autonomous Agents on the Web CG (webagents)
- Cross-post to Web Machine Learning CG (where WebMCP lives)
- Goal: CG Report status, then propose as W3C Working Group deliverable

### Task 8.2: IETF Internet-Draft

- Register `Agent-Policy`, `Agent-Name`, `Agent-Intent`, `Agent-Id` headers with IANA
- Register `/.well-known/agent-policy.json` with IANA Well-Known URIs
- Propose HTTP status codes through proper IETF process (RFC 7231 §6)
- Submit as I-D to HTTPBIS or a new WG

### Task 8.3: Community Building

- GitHub Discussions for RFCs and feedback
- Monthly community calls
- Partnership outreach to:
  - Anthropic (MCP), Google (A2A, UCP, AP2, WebMCP), apaAI Labs (APAAI)
  - Web framework authors (Next.js, Django, Rails, Laravel)
  - CDN providers (Cloudflare, Vercel, Fastly) — ideal for infrastructure-level enforcement
  - CMS platforms (WordPress, Shopify, Wix) — plugin ecosystem

### Task 8.4: Registry Service

**Location**: `/registry/`

Design and deploy: `registry.agentpolicy.org`

- Agent identity registry (public keys, DIDs, capabilities)
- Policy directory (opt-in: websites register their policies for agent discovery)
- Compliance verification API
- Aligns with `verification.registry` field in the manifest

---

## Implementation Priority (Revised Timeline)

| Week    | Focus                      | Tasks                                                                | Milestone                                |
| ------- | -------------------------- | -------------------------------------------------------------------- | ---------------------------------------- |
| **1-2** | Specification              | 1.1 (Schema), 1.2 (Discovery), 1.3 (Agent ID), 1.4 (HTTP extensions) | Formal spec draft complete               |
| **3**   | Spec + Python              | 1.5 (I-D document), 2.1 (Python middleware)                          | I-D submitted, Python middleware working |
| **4**   | Node.js + SDK              | 2.2 (Node.js middleware), 3.1 (Python SDK)                           | Two server implementations + client SDK  |
| **5**   | Agent SDKs + Tooling       | 3.2 (Node SDK), 6.1 (Validator CLI)                                  | SDKs in PyPI+npm, validator available    |
| **6**   | Bridges (Critical)         | 5.1 (MCP), 5.2 (A2A), 5.3 (WebMCP)                                   | Interop demos working                    |
| **7**   | Bridges + Integrations     | 5.4 (UCP), 5.5 (AP2), 5.6 (APAAI), 4.1 (LangChain)                   | Full interop coverage                    |
| **8**   | More Integrations          | 4.2-4.5 (CrewAI, LlamaIndex, ADK, OpenAI)                            | Framework ecosystem                      |
| **9**   | WordPress + Infrastructure | 2.4 (WordPress plugin), 2.5 (Nginx/Caddy)                            | CMS & infrastructure coverage            |
| **10**  | Testing & Docs             | 6.2 (Test suite), 7.1-7.4 (All docs)                                 | Production-ready release                 |
| **11**  | Web Tools + Registry       | 6.3 (Web validator), 6.4 (Browser extension), 8.4 (Registry)         | Public tooling live                      |
| **12**  | Standards + Launch         | 8.1 (W3C CG Report), 8.2 (IETF I-D), 8.3 (Community)                 | Standards submission + public launch     |

---

## Technical Stack

### Specification

- **Schema**: JSON Schema draft 2020-12
- **Spec document**: Markdown → xml2rfc (IETF) + Bikeshed/ReSpec (W3C)
- **Validation**: ajv (JS), jsonschema (Python)

### Server Implementations

- **Python**: FastAPI + Pydantic v2 + Redis (rate limiting) + PyJWT (token verification)
- **Node.js**: Express + Zod validation + ioredis + jose (JWT/JWK)
- **Go**: `net/http` + go-jsonschema
- **Storage**: JSON files initially → SQLite → PostgreSQL for enterprise

### Agent SDKs

- **Python**: httpx (async), cachetools, pydantic
- **Node.js**: undici/fetch, zod
- **Go**: `net/http`, `encoding/json`

### CI/CD & Publishing

- GitHub Actions: lint, test, build on every PR
- Publish to PyPI: `apop-middleware`, `apop-agent`, `langchain-apop`
- Publish to npm: `@apop/middleware`, `@apop/agent`
- Publish to pkg.go.dev: `github.com/superdom-ai/apop-go`
- Docker images for reference server

---

## Code Quality Standards

- **Type Coverage**: 100% for public APIs (mypy strict, TypeScript strict, Go static typing)
- **Test Coverage**: ≥90% for core logic, ≥85% for middleware
- **Documentation**: Every public function has docstrings/JSDoc/godoc
- **Linting**: ruff (Python), eslint+prettier (JS/TS), golangci-lint (Go)
- **Pre-commit**: ruff format, mypy, eslint, schema validation
- **Semantic Versioning**: All packages follow semver
- **Changelog**: Keep a changelog (keepachangelog.com format)

---

## Repository Structure (Revised)

```
agent-policy-protocol/
├── spec/                              # Formal specification
│   ├── schema/
│   │   └── agent-policy.schema.json   # JSON Schema (draft 2020-12)
│   ├── discovery.md                   # Discovery specification
│   ├── agent-identification.md        # Agent ID & verification spec
│   ├── http-extensions.md             # Status codes & headers
│   └── draft-apop-v1.md              # Full Internet-Draft / CG Report
├── implementations/                   # Server middleware
│   ├── python/
│   │   ├── apop_middleware/           # FastAPI/Starlette middleware
│   │   └── apop_agent/               # Python agent SDK
│   ├── nodejs/
│   │   ├── apop-middleware/           # Express + generic HTTP
│   │   └── apop-agent/               # Node.js agent SDK
│   ├── go/
│   │   ├── apop-middleware/           # net/http middleware
│   │   └── apop-agent/               # Go agent SDK
│   ├── wordpress/                     # WordPress plugin
│   ├── nginx/                         # OpenResty/Lua module
│   └── caddy/                         # Caddy module
├── integrations/                      # Framework integrations
│   ├── langchain/
│   ├── crewai/
│   ├── llamaindex/
│   ├── google-adk/
│   └── openai/
├── bridges/                           # Protocol interop bridges
│   ├── mcp/
│   ├── a2a/
│   ├── webmcp/
│   ├── ucp/
│   ├── ap2/
│   └── apaai/
├── examples/
│   └── policies/                      # Real-world policy templates
├── tools/
│   ├── validator/                     # CLI validator
│   ├── web-validator/                 # Web UI validator/generator
│   └── browser-extension/            # Chrome/Firefox extension
├── registry/                          # Agent identity registry
├── tests/
│   └── compliance/                    # Compliance test suite
├── docs/
│   ├── getting-started/
│   ├── comparison.md
│   └── api-reference/
├── rfcs/                              # Community RFCs
├── .github/
│   ├── ISSUE_TEMPLATE/
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── workflows/
├── GOVERNANCE.md
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
├── CHANGELOG.md
├── LICENSE                            # Apache 2.0
└── README.md
```

---

## Success Metrics

### Technical

- [ ] Schema validates 30+ realistic policies without false positives
- [ ] Middleware handles 5,000+ req/sec with <2ms overhead (Go), <5ms (Python/Node)
- [ ] Agent SDKs discover policies across all 4 methods in <200ms
- [ ] Test suite: 90%+ coverage, 200+ test cases
- [ ] Zero known security vulnerabilities (CVE-free)

### Adoption

- [ ] 5+ server implementations (Python, Node, Go, WordPress, Nginx/Caddy)
- [ ] 5+ framework integrations (LangChain, CrewAI, LlamaIndex, ADK, OpenAI)
- [ ] 6 interop bridges (MCP, A2A, WebMCP, UCP, AP2, APAAI)
- [ ] 7+ example policies covering major verticals
- [ ] 100+ GitHub stars within 3 months of launch

### Standards

- [ ] W3C Community Group Report published
- [ ] IETF Internet-Draft submitted
- [ ] IANA registrations filed (well-known URI, HTTP headers)
- [ ] Engagement from at least 2 major AI/web platform vendors
- [ ] Presented at 1+ standards body meeting (W3C TPAC, IETF meeting)

---

## Example Policy v1 (For Reference)

```json
{
  "$schema": "https://agentpolicy.org/schema/v1/agent-policy.schema.json",
  "version": "1.0",
  "policyUrl": "https://example.com/.well-known/agent-policy.json",
  "defaultPolicy": {
    "allow": true,
    "actions": ["read", "render"],
    "rateLimit": {
      "requests": 100,
      "window": "hour"
    },
    "requireVerification": false
  },
  "pathPolicies": [
    {
      "path": "/public/*",
      "allow": true,
      "actions": ["read", "index", "summarize"],
      "requireVerification": false
    },
    {
      "path": "/api/*",
      "allow": true,
      "actions": ["read", "api_call"],
      "requireVerification": true,
      "rateLimit": {
        "requests": 1000,
        "window": "hour"
      }
    },
    {
      "path": "/checkout/*",
      "allow": true,
      "actions": ["read", "form_submit", "automated_purchase"],
      "requireVerification": true,
      "agentAllowlist": [
        "did:web:comet.perplexity.ai",
        "did:web:gemini.google.com"
      ]
    },
    {
      "path": "/admin/*",
      "allow": false
    }
  ],
  "verification": {
    "method": "verifiable-credential",
    "registry": "https://registry.agentpolicy.org",
    "trustedIssuers": [
      "did:web:trust.agentpolicy.org",
      "did:web:google.com",
      "did:web:anthropic.com"
    ]
  },
  "contact": {
    "email": "security@example.com",
    "policyUrl": "https://example.com/agent-policy",
    "abuseUrl": "https://example.com/report-agent-abuse"
  },
  "metadata": {
    "description": "Agent access policy for Example Corp under APoP v1.0",
    "owner": "Example Corp",
    "maintainer": "security-team@example.com",
    "lastModified": "2026-02-14T00:00:00Z",
    "license": "https://creativecommons.org/licenses/by/4.0/"
  },
  "interop": {
    "a2aAgentCard": "https://example.com/.well-known/agent.json",
    "mcpServerUrl": "https://example.com/mcp",
    "webmcpEnabled": true,
    "ucpCapabilities": "https://example.com/.well-known/ucp-profile.json",
    "apaaiEndpoint": "https://example.com/apaai/v1"
  }
}
```

---

## Key Differences from v0 Plan

| #   | Change                                                     | Rationale                                                                        |
| --- | ---------------------------------------------------------- | -------------------------------------------------------------------------------- |
| 1   | **Added formal IETF/W3C spec document** (Task 1.5)         | Standard won't be taken seriously without a proper I-D or CG Report              |
| 2   | **Added DNS TXT discovery** (Task 1.2)                     | Follows DMARC/SPF precedent; enables domain-wide policy without per-page headers |
| 3   | **Fixed HTTP 431 conflict** (Task 1.4)                     | 431 is already assigned by RFC 6585; proposed 438/439 instead                    |
| 4   | **Added `interop` section to schema** (Task 1.1)           | Explicit cross-protocol linkage — makes APoP a hub in the protocol stack         |
| 5   | **Added Go implementation** (Tasks 2.3, 3.3)               | Go is dominant in cloud-native infra where agent gateways run                    |
| 6   | **Added Nginx/Caddy modules** (Task 2.5)                   | Infrastructure-level enforcement is critical for adoption at scale               |
| 7   | **Added 6 interop bridges** (Phase 5)                      | Concrete MCP/A2A/WebMCP/UCP/AP2/APAAI bridges are the adoption accelerator       |
| 8   | **Added Google ADK + OpenAI integrations** (Tasks 4.4-4.5) | These are the dominant agent frameworks; missing them kills adoption             |
| 9   | **Added online policy generator** (Task 6.3)               | Low-friction adoption for non-technical website owners                           |
| 10  | **Added standards submission phase** (Phase 8)             | Without formal standards track, APoP stays a hobby project                       |
| 11  | **Added registry service** (Task 8.4)                      | Centralized discovery + verification infrastructure                              |
| 12  | **Replaced whitelist/blacklist** with allowlist/denylist   | Industry standard inclusive terminology                                          |
| 13  | **Added action type registry** (Task 1.1)                  | Standardized action vocabulary prevents fragmentation                            |
| 14  | **Added VC-based verification** (Task 1.3)                 | Aligns with AP2's Verifiable Credentials approach                                |
| 15  | **Extended timeline from 8→12 weeks**                      | Realistic given expanded scope and standards-grade quality bar                   |

---

## Notes for Development

- **Standards first, code second.** The spec document (1.5) is the most important deliverable. Everything else validates it.
- **robots.txt compatibility is non-negotiable.** Agents that don't find APoP MUST fall back to robots.txt. APoP augments, never replaces.
- **Adoption is gated by framework integrations.** LangChain/CrewAI/ADK/OpenAI integrations matter more than the 4th server implementation.
- **Interop bridges are the strategic moat.** If APoP is the protocol that connects to _everything else_, it becomes indispensable.
- **CDN/infrastructure partnerships are the fastest path to scale.** One Cloudflare integration = millions of sites overnight.
- **Keep the schema simple.** A 5-line `agent-policy.json` must be valid and useful. Complexity is opt-in.
- **Design for caching.** Policies change rarely — 1-hour TTL is reasonable. Agents should cache aggressively.
- **Security first.** Validate all inputs. Never trust agent-supplied headers without verification. Log everything.
- **Privacy by default.** APoP should never require websites to expose user data. Agent headers expose identity and intent only.
- **Test with real agents.** Validate against Perplexity, Claude, ChatGPT, Gemini browsing behaviors.
