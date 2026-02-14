# APoP v1.0 — Remaining Work & Action Plans

**Last Updated**: 2026-02-14  
**Phase 1**: Specification & Foundation — ✅ COMPLETE  
**Next Up**: Phase 2 (Reference Implementations)  
**Source**: Aligned with [STRATEGIC_ROADMAP.md](STRATEGIC_ROADMAP.md)

---

## Overview

This document tracks all remaining work items from the APoP v1.0 implementation plan. Each phase includes specific deliverables, estimated effort, and file-level action plans.

Cross-reference: The strategic roadmap ([STRATEGIC_ROADMAP.md](STRATEGIC_ROADMAP.md)) covers business strategy, partnerships, messaging, budget, and revenue targets. This file focuses on **implementation tasks only**.

---

## Phase 1: Specification & Foundation — INCOMPLETE ITEMS

### Priority: CRITICAL (must close before moving to Phase 2)

Phase 1 core deliverables (schema, discovery spec, agent-identification spec, HTTP extensions spec, middleware v1.0 upgrade) are done. The following items from the strategic roadmap's Week 1-2 plan were **not completed**.

### 1.1 Update Root README (`README.md`) ✅

The root README has been updated to reflect v1.0.

**Action Plan**:

- [x] Update schema summary table to v1.0 field names (`defaultPolicy`, `pathPolicies`, `rateLimit`, `requireVerification`, `metadata`, `interop`)
- [x] Change well-known URL from `https://example.com/agent-policy.json` to `https://example.com/.well-known/agent-policy.json`
- [x] Add links to `spec/` directory (JSON Schema, discovery, agent-identification, HTTP extensions)
- [x] Update "Quick Summary" to mention 4 discovery methods, 3 status codes (430/438/439), identity tiers
- [x] Add v1.0 quick-start code snippet showing minimal policy + curl test
- [x] Add "Ecosystem Positioning" section — how APoP complements MCP, A2A, WebMCP, AP2, APAAI, UCP
- [x] Add contributor badges and links to community channels

**Output file**: `README.md`

### 1.2 Example Policies (`examples/`) ✅

9 example policies created, all validated against JSON Schema.

**Action Plan**:

- [x] `examples/news-publisher.json` — Paywalled content protection (allow read on public, block extract on premium, require verification)
- [x] `examples/ecommerce.json` — E-commerce store (allow read + render, block automated_purchase without verification, rate limit api_call)
- [x] `examples/saas-api.json` — API-first SaaS (open public docs, restricted API paths with allowlists, high rate limits for verified agents)
- [x] `examples/open-data.json` — Fully permissive (allow all, no verification, generous rate limits)
- [x] `examples/restrictive.json` — Minimal access (deny all except read on /, require verification everywhere)
- [x] `examples/healthcare.json` — HIPAA-sensitive (deny all by default, allowlist only, VC verification required, strict rate limits)
- [x] `examples/personal-blog.json` — Simple personal site (allow read + index + summarize, no verification)
- [x] `examples/wordpress-default.json` — Sensible defaults for WordPress sites (template for the WordPress plugin)
- [x] `examples/multi-protocol.json` — Full interop example (A2A Agent Card, MCP server, WebMCP, UCP, APAAI all declared)
- [x] `examples/README.md` — Index explaining each example and when to use it

**Output files**: `examples/**`

### 1.3 Conformance Test Suite (`tests/conformance/`) ✅

109 tests across 9 test files, all passing. Uses vitest + supertest.

**Action Plan**:

- [x] `tests/conformance/test-policy-parsing.js` — Validate schema compliance, handle malformed JSON, missing fields, unknown fields
- [x] `tests/conformance/test-discovery.js` — Test all 4 discovery methods (well-known, header, meta tag, DNS TXT)
- [x] `tests/conformance/test-status-codes.js` — Verify correct 430/438/439 responses with required headers and JSON body
- [x] `tests/conformance/test-agent-headers.js` — Test Agent-Name, Agent-Intent, Agent-Id, Agent-Signature, Agent-VC parsing
- [x] `tests/conformance/test-path-matching.js` — Glob matching: `/*`, `/**`, exact path, edge cases (trailing slash, encoded chars)
- [x] `tests/conformance/test-allowlist-denylist.js` — Allowlist-only paths, denylist enforcement, precedence rules
- [x] `tests/conformance/test-rate-limiting.js` — Rate limit headers, 438 response, Retry-After, rate reset
- [x] `tests/conformance/test-verification.js` — 439 response when verification required but not provided, accepted methods header
- [x] `tests/conformance/test-intent-enforcement.js` — Intent-based blocking, multi-intent requests, disallow precedence
- [x] `tests/conformance/package.json` — Test runner (vitest or jest)
- [x] `tests/conformance/README.md` — How to run conformance tests against any middleware

**Output files**: `tests/conformance/**`

### 1.4 CI/CD Pipeline (`.github/workflows/`) ✅

**Action Plan**:

- [x] `.github/workflows/ci.yml` — Run conformance tests on push/PR (Node 18/20/22 matrix)
- [x] `.github/workflows/schema-validate.yml` — Validate all example policies against the JSON Schema
- [ ] `.github/workflows/release.yml` — Automated npm/PyPI publishing on tag (deferred to Phase 2 when SDK exists)

**Output files**: `.github/workflows/**`

### 1.5 Docker Compose for Local Testing ✅

**Action Plan**:

- [x] `docker-compose.yml` — Spin up Express middleware + test agent in containers
- [x] `Dockerfile` — Node.js middleware container
- [x] `docker/test-agent/` — Simple agent that sends APoP headers and logs responses

**Output files**: `docker-compose.yml`, `Dockerfile`, `docker/**`

---

## Phase 2: Reference Implementations (Weeks 3–4)

### Priority: HIGH

Build production-quality middleware and SDKs that demonstrate the v1.0 spec in practice.

### 2.1 Node.js SDK (`sdk/node/`) ✅

**Action Plan**:

- [x] Create `sdk/node/` package with TypeScript
- [x] `src/parser.ts` — Parse and validate `agent-policy.json` against the JSON Schema (use `ajv`)
- [x] `src/discovery.ts` — Implement the 4-method discovery chain (well-known → HTTP header → meta tag → DNS)
- [x] `src/matcher.ts` — Path matching engine with glob support
- [x] `src/enforcer.ts` — Policy enforcement logic (allowlist, denylist, intent checking, rate limits)
- [x] `src/headers.ts` — Parse/set APoP request and response headers
- [x] `src/middleware/express.ts` — Express middleware wrapper
- [x] `src/middleware/vercel.ts` — Vercel serverless wrapper
- [x] `src/middleware/nextjs.ts` — Next.js middleware wrapper
- [x] `src/types.ts` — TypeScript type definitions generated from JSON Schema
- [x] `tests/` — Unit tests for all modules (vitest) — 101 tests across 6 files
- [x] `package.json`, `tsconfig.json`, `README.md`
- [ ] Publish as `@apop/node` on npm

**Output files**: `sdk/node/**`

### 2.2 Python SDK (`sdk/python/`)

**Action Plan**:

- [ ] Create `sdk/python/` package
- [ ] `apop/parser.py` — Policy parsing and Pydantic validation
- [ ] `apop/discovery.py` — Discovery chain implementation (httpx + dnspython)
- [ ] `apop/matcher.py` — Path matching engine (fnmatch-style)
- [ ] `apop/enforcer.py` — Policy enforcement logic
- [ ] `apop/headers.py` — Header parsing/generation
- [ ] `apop/middleware/fastapi.py` — FastAPI middleware
- [ ] `apop/middleware/flask.py` — Flask middleware
- [ ] `apop/middleware/django.py` — Django middleware
- [ ] `apop/agent.py` — Agent-side SDK (discover + respect policies when crawling)
- [ ] `tests/` — pytest test suite
- [ ] `pyproject.toml`, `README.md`
- [ ] Publish as `apop` on PyPI

**Output files**: `sdk/python/**`

### 2.3 Migrate Existing Middleware

**Action Plan**:

- [ ] Move current `middleware/` enforcement logic into `sdk/node/` as the reference implementation
- [ ] Add JSON Schema validation using `ajv` library
- [ ] Add rate limiting state (in-memory + Redis adapter)
- [ ] Implement actual rate limit tracking (in-memory counter + Redis adapter) — current `Agent-Policy-Rate-Remaining` header reflects max value, not actual remaining
- [ ] Implement signature verification (Ed25519, ES256 at minimum) — current SDK only checks for header presence, not cryptographic validity
- [ ] Add proper logging (pino or winston)
- [ ] Keep `middleware/` as a thin demo that imports from `sdk/node/`

---

## Phase 3: Validator & Testing Tools (Weeks 3–4)

### Priority: HIGH

### 3.1 CLI Validator (`tools/validator/`)

**Action Plan**:

- [ ] `tools/validator/cli.js` — CLI tool to validate `agent-policy.json` files
- [ ] Uses the JSON Schema from `spec/schema/agent-policy.schema.json`
- [ ] Features: validate local file, validate remote URL, output errors with line numbers, `--fix` mode for common issues
- [ ] `npx apop-validate ./agent-policy.json`
- [ ] `npx apop-validate https://example.com/.well-known/agent-policy.json`
- [ ] `package.json` with `bin` entry for global install

**Output files**: `tools/validator/**`

### 3.2 Online Validator (Web)

**Action Plan**:

- [ ] Simple web page that accepts a URL or JSON paste
- [ ] Validates against the schema, shows formatted results with line highlighting
- [ ] Provides "fix suggestions" for common errors
- [ ] Generate a score/badge (e.g., "APoP Compliant ✓")
- [ ] Deploy to Vercel at `validate.agentpolicy.org`

**Output files**: `tools/web-validator/**`

### 3.3 Interactive Policy Builder

From the strategic roadmap: "Interactive policy builder on website"

**Action Plan**:

- [ ] Web-based form to generate a valid `agent-policy.json`
- [ ] Choose from templates (news, e-commerce, SaaS, open, restrictive)
- [ ] Configure paths, actions, rate limits, verification
- [ ] Live preview of JSON output
- [ ] "Copy to clipboard" / "Download" buttons
- [ ] Deploy alongside the validator

**Output files**: `tools/policy-builder/**`

---

## Phase 4: Interoperability Bridges (Weeks 5–6)

### Priority: MEDIUM-HIGH

Build protocol bridges that connect APoP to the broader agentic ecosystem.

### 4.1 MCP → APoP Bridge

**Action Plan**:

- [ ] `bridges/mcp-apop/` — MCP Tool that checks APoP policy before tool invocation
- [ ] Implements: `check_agent_policy` MCP tool
- [ ] Before any MCP tool runs, query the target site's APoP policy
- [ ] Block disallowed actions, enforce rate limits
- [ ] Example: MCP server template with APoP built-in

**Output files**: `bridges/mcp-apop/**`

### 4.2 WebMCP → APoP Bridge

From the strategic roadmap: "WebMCP tool contract gated by APoP"

**Action Plan**:

- [ ] `bridges/webmcp-apop/` — Browser extension or polyfill that checks APoP before `navigator.modelContext` tool calls
- [ ] Intercept WebMCP tool invocations and validate against APoP policy
- [ ] Demo page showing WebMCP + APoP working together

**Output files**: `bridges/webmcp-apop/**`

### 4.3 A2A → APoP Bridge

**Action Plan**:

- [ ] `bridges/a2a-apop/` — A2A TaskHandler that consults APoP before delegation
- [ ] Agent Card extension: `agentPolicy` field pointing to APoP manifest
- [ ] Auto-negotiate permissions based on the APoP policy

**Output files**: `bridges/a2a-apop/**`

### 4.4 LangChain / CrewAI Integration

**Action Plan**:

- [ ] `integrations/langchain/` — LangChain tool wrapper that enforces APoP (PR to LangChain repo)
- [ ] `integrations/crewai/` — CrewAI agent decorator for APoP compliance
- [ ] `integrations/autogpt/` — AutoGPT plugin
- [ ] Auto-discover and cache policies for target URLs

**Output files**: `integrations/**`

### 4.5 Full Protocol Stack Demo

From the strategic roadmap: "Example showing all 6 protocols working together"

**Action Plan**:

- [ ] `demos/full-stack/` — Single demo showing APoP + MCP + WebMCP + A2A + AP2 + APAAI
- [ ] Video script: "The Complete Agent Protocol Stack" (3-minute demo)
- [ ] Blog post: "APoP + MCP + WebMCP: The Complete Agent Protocol Stack"

**Output files**: `demos/full-stack/**`

---

## Phase 5: Agent Registry & Trust Infrastructure (Weeks 7–8)

### Priority: MEDIUM

### 5.1 Agent Registry Service

**Action Plan**:

- [ ] `registry/` — Service for agent identity registration
- [ ] DID Document hosting and resolution (`did:web` support)
- [ ] Agent capability declarations
- [ ] Trust scoring / reputation system (v2)
- [ ] API: `POST /register`, `GET /agents/{did}`, `GET /agents/{did}/did.json`

**Output files**: `registry/**`

### 5.2 Verifiable Credential Issuer

**Action Plan**:

- [ ] `registry/vc-issuer/` — Issue W3C Verifiable Credentials to verified agents
- [ ] Trusted issuer list management
- [ ] Aligned with AP2's VC-based approach
- [ ] Certification tiers: Basic (automated, free), Verified ($500/yr), Enterprise ($5K/yr)

**Output files**: `registry/vc-issuer/**`

---

## Phase 6: Documentation & Website (Weeks 7–8)

### Priority: MEDIUM

### 6.1 Specification Website (`website/`)

**Action Plan**:

- [ ] `website/` — Static site (Docusaurus or Astro) at agentpolicy.org
- [ ] Host spec documents (auto-render markdown from `spec/`)
- [ ] Interactive examples and playground
- [ ] Getting started guide
- [ ] Landing page with positioning: "The authorization layer for the agentic web"
- [ ] Register domain: `agentpolicy.org`

**Output files**: `website/**`

### 6.2 Integration Guides

**Action Plan**:

- [ ] `docs/guides/getting-started.md` — Add APoP to your site in 5 minutes
- [ ] `docs/guides/express-guide.md` — Express.js integration
- [ ] `docs/guides/nextjs-guide.md` — Next.js integration
- [ ] `docs/guides/fastapi-guide.md` — FastAPI integration
- [ ] `docs/guides/agent-developer-guide.md` — How to make your agent APoP-compliant
- [ ] `docs/guides/mcp-integration-guide.md` — MCP + APoP bridge setup
- [ ] `docs/guides/a2a-integration-guide.md` — A2A + APoP bridge setup
- [ ] `docs/guides/webmcp-integration-guide.md` — WebMCP + APoP bridge setup
- [ ] `docs/guides/wordpress-guide.md` — WordPress plugin usage
- [ ] `docs/guides/cloudflare-workers-guide.md` — Cloudflare Workers deployment

**Output files**: `docs/guides/**`

### 6.3 Content Strategy (from Strategic Roadmap)

Blog posts to draft (see roadmap for full content calendar):

- [ ] "Introducing APoP: Authorization for the Agentic Web" (launch post)
- [ ] "WebMCP Solves How. APoP Solves If." (positioning)
- [ ] "The Amazon-Perplexity Problem: Why We Built APoP" (origin story)
- [ ] "How to Protect Your Website from AI Agents in 5 Minutes" (tutorial)
- [ ] "APoP + MCP + WebMCP: The Complete Agent Protocol Stack" (ecosystem)
- [ ] "From robots.txt to APoP: 30 Years of Web Automation Governance" (thought leadership)

**Output files**: `content/blog/**` or published externally

---

## Phase 7: Community & Standards Track (Weeks 9–10)

### Priority: MEDIUM

### 7.1 Standards Body Submissions

**Action Plan**:

- [ ] Draft IETF Internet-Draft for HTTP status codes (430, 438, 439)
- [ ] Draft IANA registration for well-known URI (`agent-policy.json`)
- [ ] IANA HTTP header registrations (Agent-Policy, Agent-Policy-Version, Agent-Policy-Status, etc.)
- [ ] W3C Community Group application: "AI Agent Authorization and Consent CG"
- [ ] Recruit 15+ member companies for W3C CG (Google, Microsoft, Anthropic, Mozilla, Cloudflare, NYT, etc.)
- [ ] Engage with existing W3C Autonomous Agents on the Web CG
- [ ] Submit to Linux Foundation AI & Data (alongside MCP, A2A)

### 7.2 Community Building

**Action Plan**:

- [ ] GitHub Discussions enabled for the repo
- [ ] `CONTRIBUTING.md` — Contribution guidelines, coding standards, PR process
- [ ] `CODE_OF_CONDUCT.md` — Community standards
- [ ] Discord / community channel setup
- [ ] Social media accounts (Twitter/X, LinkedIn)

### 7.3 Platform Integrations (from Strategic Roadmap)

Quick-reach distribution channels:

- [ ] WordPress plugin submission (60M+ potential sites)
- [ ] Cloudflare Workers template (one-click deploy)
- [ ] Vercel template
- [ ] Webflow/Wix marketplace apps

---

## Phase 8: Production Hardening (Weeks 11–12)

### Priority: MEDIUM

### 8.1 Security Audit

**Action Plan**:

- [ ] Review all verification paths for bypass vulnerabilities
- [ ] Test signature validation edge cases
- [ ] Fuzz test the policy parser (JSON Schema edge cases)
- [ ] Document threat model
- [ ] Engage OWASP or Trail of Bits for external review (roadmap: Q3 2026)

### 8.2 Performance Optimization

**Action Plan**:

- [ ] Policy caching strategy (in-memory LRU, Redis adapter, CDN-aware)
- [ ] Benchmark middleware overhead (target: <1ms per request)
- [ ] Optimize path matching for large policy files (pre-compile patterns)

### 8.3 Enterprise Features (Superdom AI SaaS)

**Action Plan**:

- [ ] Visual policy builder (no-code, drag-and-drop)
- [ ] Real-time analytics dashboard (which agents, what actions, compliance rate)
- [ ] Multi-tenant policy management (multi-site)
- [ ] Alerts & notifications (policy violations, unusual patterns)
- [ ] Compliance reporting templates (GDPR, CCPA, EU AI Act, HIPAA)
- [ ] Audit logging (immutable)
- [ ] Admin UI for policy editing
- [ ] API for programmatic policy updates
- [ ] Team collaboration & RBAC

See strategic roadmap for pricing model: Free / Pro ($49/mo) / Business ($199/mo) / Enterprise (custom).

---

## Priority Matrix

| Phase                                            | Priority    | Est. Effort | Dependencies | Status         |
| ------------------------------------------------ | ----------- | ----------- | ------------ | -------------- |
| **Phase 1 gaps**: README, examples, tests, CI/CD | CRITICAL    | 2-3 days    | None         | ✅ Complete    |
| Phase 2: Reference Implementations               | HIGH        | 2 weeks     | Phase 1      | ⬜ Not started |
| Phase 3: Validator & Testing Tools               | HIGH        | 1 week      | Phase 1      | ⬜ Not started |
| Phase 4: Interop Bridges                         | MEDIUM-HIGH | 2 weeks     | Phase 2      | ⬜ Not started |
| Phase 5: Registry & Trust                        | MEDIUM      | 2 weeks     | Phase 2      | ⬜ Not started |
| Phase 6: Docs & Website                          | MEDIUM      | 1 week      | Phase 1      | ⬜ Not started |
| Phase 7: Standards Track                         | MEDIUM      | Ongoing     | Phase 1      | ⬜ Not started |
| Phase 8: Production                              | MEDIUM      | 2 weeks     | Phase 2, 3   | ⬜ Not started |

---

## Immediate Next Steps (Recommended Order)

1. **Phase 1.1** — Update root `README.md` for v1.0 (10 min, unblocks all adoption)
2. **Phase 1.2** — Create 5+ example policies (30 min, proves schema flexibility)
3. **Phase 1.3** — Conformance test suite (2-3 hours, validates middleware correctness)
4. **Phase 1.4** — GitHub Actions CI/CD (30 min, enables quality gates)
5. **Phase 2.1** — Node.js SDK with TypeScript (highest-impact deliverable)
6. **Phase 3.1** — CLI validator (quick win, useful for testing)
7. **Phase 4.1** — MCP → APoP bridge (strongest ecosystem integration play)
8. **Phase 6.2** — "Getting Started" guide (lowers adoption barrier)

---

## Items Tracked in Strategic Roadmap Only (Not Implementation Tasks)

The following are tracked in [STRATEGIC_ROADMAP.md](STRATEGIC_ROADMAP.md) and **not duplicated here**:

- Partnership strategy (Tier 1/2/3 targets: Google, Anthropic, WordPress, LangChain, Cloudflare, NYT, EFF)
- Budget breakdown ($545K total for 2026)
- Revenue targets ($500K ARR by EOY 2026)
- Certification program pricing (Basic free, Verified $500/yr, Enterprise $5K/yr)
- SaaS pricing tiers (Free/Pro/Business/Enterprise)
- Content calendar (week-by-week blog + podcast schedule)
- Messaging & elevator pitch
- Regulatory compliance mapping (GDPR, CCPA, EU AI Act)
- Risk mitigation matrix
- P3P/CSP/OAuth lessons learned
- 2027+ north star metrics (100K websites, browser integration, W3C Recommendation)
