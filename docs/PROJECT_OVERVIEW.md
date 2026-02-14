# Agent Policy Protocol (APoP) — Project Documentation

## What is APoP?

The **Agent Policy Protocol (APoP)** is an open standard — often described as **"robots.txt for the agentic web"** — that allows websites to declare how AI agents may access and interact with their content, APIs, and resources. It provides a JSON-based manifest (`agent-policy.json`) that sites host at their root, enabling consent, transparency, and verification for agent-driven interactions.

---

## Problem Statement

AI agents (browsing assistants, summarizers, data extractors) are actively interacting with the web, but websites currently have **no standardized, machine-readable way** to express consent, access rules, or identity verification requirements for these agents. Existing mechanisms like `robots.txt` were designed for crawlers, not autonomous agents that take actions.

APoP fills this gap by providing a lightweight, HTTP-native protocol for **agent access governance**.

---

## Core Principles

| Principle            | Description                                                                                                          |
| -------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **Consent**          | Sites explicitly define what agents can and cannot do.                                                               |
| **Transparency**     | Agents must identify themselves and declare their intent via HTTP headers.                                           |
| **Verification**     | Agents can cryptographically prove their identity (PKI signatures, registry lookup, or partner tokens).              |
| **Interoperability** | Built to integrate with standard HTTP stacks; compatible with emerging standards like MCP and W3C Agent Protocol CG. |
| **Simplicity**       | JSON-based, lightweight, and backward-compatible.                                                                    |

---

## Project Structure

```
agent-policy-protocol-demo/
├── agent-policy.json          # Example APoP manifest (site-root placement)
├── README.md                  # Project overview and quick start
├── SPEC.md                    # v0.1 draft specification
├── docs/                      # Documentation
│   └── PROJECT_OVERVIEW.md    # This file
├── middleware/                 # Reference implementation (Node.js)
│   ├── agent-policy.json      # Local copy of the policy for middleware use
│   ├── index.js               # Vercel serverless function handler
│   ├── index.express.js       # Express.js middleware implementation
│   ├── package.json           # Node.js package manifest
│   └── vercel.json            # Vercel deployment configuration
└── prompts/                   # AI prompt assets (not covered here)
```

---

## How It Works

### 1. The Manifest — `agent-policy.json`

Websites host an `agent-policy.json` file at their root (e.g., `https://example.com/agent-policy.json`). This file declares:

- **Default rules** — site-wide allow/disallow lists for agent actions.
- **Path-specific overrides** — granular rules for specific URL patterns (e.g., allow indexing on `/public/*`, block all access to `/admin/*`).
- **Rate limits** — maximum requests per time window.
- **Verification requirements** — whether agents must prove their identity.
- **Contact info** — who to reach for policy questions or abuse reports.

#### Example Manifest (condensed)

```json
{
  "version": "0.1",
  "default": {
    "allow": ["read", "render"],
    "disallow": ["data-extraction", "api-calls", "automated-purchases"],
    "rate_limit": { "requests": 100, "per_seconds": 3600 },
    "require_verification": true
  },
  "paths": [
    {
      "pattern": "/public/*",
      "allow": ["read", "index"],
      "require_verification": false
    },
    { "pattern": "/api/private/*", "disallow": ["read", "data-extraction"] },
    { "pattern": "/admin/*", "disallow": ["all"] }
  ],
  "verification": {
    "method": "pkix",
    "registry": "https://registry.agentpolicy.org"
  },
  "contact": {
    "email": "security@example.com",
    "policy_url": "https://example.com/agent-policy"
  }
}
```

### 2. Agent Identity Headers

AI agents include standard HTTP headers when making requests:

| Header            | Required    | Purpose                                                                      |
| ----------------- | ----------- | ---------------------------------------------------------------------------- |
| `Agent-Name`      | Yes         | Human-readable agent identifier with version (e.g., `comet-assistant/1.2.3`) |
| `Agent-Intent`    | Yes         | Purpose of the request (e.g., `summarization`, `indexing`, `qa`)             |
| `Agent-KeyId`     | Conditional | Public key reference or DID for identity verification                        |
| `Agent-Signature` | Conditional | Base64-encoded digital signature of the request                              |
| `Agent-Contact`   | Optional    | Contact email for the agent operator                                         |

### 3. Server Response Headers

Servers respond with policy enforcement headers:

| Header                   | Purpose                                                                      |
| ------------------------ | ---------------------------------------------------------------------------- |
| `Agent-Policy`           | Declares the active policy decision (e.g., `allow read`, `block unverified`) |
| `Agent-Policy-Remaining` | Remaining request quota for the agent                                        |
| `WWW-Agent-Verify`       | URL for agent verification endpoint                                          |

### 4. Custom HTTP Status Codes

| Code    | Name                        | Meaning                                  |
| ------- | --------------------------- | ---------------------------------------- |
| **430** | Agent Policy Violation      | The agent attempted a disallowed action  |
| **438** | Agent Rate Limited          | The agent exceeded its rate limit        |
| **439** | Agent Verification Required | The agent must verify its identity first |

### 5. Request Flow

```
Agent                                Server
  │                                    │
  │── GET /api/data ─────────────────▶│
  │   Agent-Name: comet/1.2           │
  │   Agent-Intent: summarization     │
  │   Agent-KeyId: did:agent:abc123   │
  │                                    │
  │                    Fetches agent-policy.json
  │                    Matches path rule
  │                    Validates signature (if required)
  │                                    │
  │◀── 200 OK ────────────────────────│
  │    Agent-Policy: allow read        │
  │    Agent-Policy-Remaining: 95      │
```

---

## Reference Middleware

The `middleware/` directory contains a working Node.js reference implementation with two variants:

### Vercel Serverless (`index.js`)

A standalone serverless function handler designed for deployment on Vercel. It:

- Loads `agent-policy.json` from the project root.
- Detects agent requests by checking for the `Agent-Name` header.
- Matches the request URL against path-specific rules.
- Enforces verification requirements (responds with `439` if `Agent-KeyId` is missing).
- Blocks disallowed actions (responds with `430`).
- Sets `Agent-Policy` and `Agent-Policy-Remaining` response headers on success.

### Express.js Middleware (`index.express.js`)

A traditional Express middleware that can be plugged into any Express application. It:

- Runs as middleware (`app.use(...)`) — non-agent requests pass through unmodified.
- Applies the same policy logic as the serverless variant.
- Listens on a configurable port (default `3000`).

### Deployment

The middleware includes a `vercel.json` that routes all incoming requests (`/(.*)`) to the serverless handler, enabling one-command deployment via `vercel`.

**Dependencies:** `express@^4.18.2`, `node-fetch@^3.3.2`

---

## Enforcement Models

| Mode           | Behavior                                                                              |
| -------------- | ------------------------------------------------------------------------------------- |
| **Advisory**   | Logs and tags violations but still serves responses. Useful for gradual rollout.      |
| **Strict**     | Blocks unverified or disallowed agents outright with `430` or `439` responses.        |
| **Rate-Limit** | Enforces request caps from `rate_limit` and communicates remaining quota via headers. |

---

## Verification Methods

| Method                       | Description                                                                                                                                  |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **PKI Signature Validation** | Agent signs `(method + path + timestamp + keyId)` with a private key; server verifies using the public key from `Agent-KeyId` or a registry. |
| **Registry Lookup**          | Server queries a trusted verification registry (defined in the manifest) to confirm agent identity and intent.                               |
| **Partner Token**            | Simplified fallback — the agent authenticates using a pre-shared API token.                                                                  |

---

## Security Considerations

| Concern            | Mitigation                                                        |
| ------------------ | ----------------------------------------------------------------- |
| **Spoofing**       | Require digital signatures and registry validation.               |
| **Replay Attacks** | Include timestamps and nonces in signatures.                      |
| **Privacy**        | Agents expose only identity and intent — no user data in headers. |
| **Auditability**   | Log agent identifiers, intents, and enforcement outcomes.         |

---

## Roadmap

| Milestone | Goal                                        | Status      |
| --------- | ------------------------------------------- | ----------- |
| v0.1      | Initial working draft + Node.js middleware  | ✅ Complete |
| v0.2      | Define signature schema + registry design   | ⏳ Planned  |
| v0.3      | SDKs (Node, Python) + verification registry | 🔜 Upcoming |
| v1.0      | Formalized spec + W3C/IETF submission       | 🔜 Upcoming |

**Planned SDK support:** Python (FastAPI), Go — in addition to the existing Node.js reference.

---

## Origin & Stewardship

The Agent Policy Protocol was initiated by **Arun Vijayarengan**, Founder & CEO of **Superdom AI**, in response to growing tensions between AI agents and web platforms. It was inspired by public discussions — notably around Perplexity AI's Comet Assistant being blocked by Amazon — highlighting the need for a cooperative, consent-based framework for the agentic web.

---

## License

**Apache 2.0** — open for community contribution. Pull requests, RFCs, and implementation feedback are encouraged.
