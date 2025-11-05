# Agent Policy Protocol (APoP) — v0.1 Draft

**Status:** Draft (Open for community feedback)

**Purpose:**  
The Agent Policy Protocol (APoP) defines a simple, web-native standard that allows websites to declare how AI agents may interact with their content, APIs, and resources.  
It provides transparency, consent, and verification — similar in spirit to `robots.txt`, CORS, and CSP, but designed for the agent-driven web.

---

## 1. Core Principles

1. **Consent** – Sites explicitly define what agents can or cannot do.  
2. **Transparency** – Agents must identify themselves and declare their intent.  
3. **Verification** – Agents can cryptographically prove their identity.  
4. **Interoperability** – Built to integrate easily with HTTP and modern web stacks.  
5. **Simplicity** – Lightweight, JSON-based, and backward-compatible.

---

## 2. Protocol Components

| Component | Description |
|------------|-------------|
| `agent-policy.json` | Manifest file defining site-wide agent rules. |
| Agent Headers | Standard `Agent-*` HTTP headers for agent identity and verification. |
| Policy Headers | Server responses declaring active policy enforcement. |
| Verification Registry | Optional identity registry for public keys and metadata. |
| Custom Status Codes | Distinguish agent-specific enforcement responses. |

---

## 3. Manifest: `agent-policy.json`

**Location:**  
`https://example.com/agent-policy.json`

### Example
```json
{
  "version": "0.1",
  "default": {
    "allow": ["read", "render"],
    "disallow": ["data-extraction", "api-calls"],
    "rate_limit": { "requests": 100, "per_seconds": 3600 },
    "require_verification": true
  },
  "paths": [
    { "pattern": "/public/*", "allow": ["read", "index"], "require_verification": false },
    { "pattern": "/api/private/*", "disallow": ["read"] },
    { "pattern": "/admin/*", "disallow": ["all"] }
  ],
  "verification": {
    "method": "pkix",
    "registry": "https://registry.agentpolicy.org"
  },
  "contact": {
    "email": "security@example.com",
    "policy_url": "https://example.com/agent-policy"
  },
  "meta": {
    "description": "Defines how AI agents may interact with this site under the Agent Policy Protocol (APoP) v0.1.",
    "last_updated": "2025-11-05T00:00:00Z"
  }
}
```

| **Field**              | **Type**  | **Description**                                                                                                                       |
| ---------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `version`              | `string`  | Protocol version (e.g., `"0.1"`)                                                                                                      |
| `default`              | `object`  | Defines the site-wide fallback rules. Applies when no path-specific rule matches.                                                     |
| `allow`                | `array`   | Lists actions explicitly allowed for agents (`"read"`, `"render"`, `"index"`, etc.).                                                  |
| `disallow`             | `array`   | Lists actions that agents are forbidden from performing (`"data-extraction"`, `"api-calls"`, `"automated-purchases"`, etc.).          |
| `rate_limit`           | `object`  | Specifies request frequency limits. Example: `{ "requests": 100, "per_seconds": 3600 }`                                               |
| `require_verification` | `boolean` | If `true`, agents must verify identity using digital signatures or a registry.                                                        |
| `paths`                | `array`   | Path-based rule overrides. Each item contains a `pattern` and optional overrides for `allow`, `disallow`, and `require_verification`. |
| `verification`         | `object`  | Describes how agent verification is handled (e.g., PKI or registry lookup).                                                           |
| `contact`              | `object`  | Contains the site’s contact information (e.g., security email, policy URL).                                                           |
| `meta`                 | `object`  | Optional metadata for documentation — description, maintainer, or last update timestamp.                                              |


### Agent Identity Headers

Agents MUST include the following headers when acting autonomously:
```
Agent-Name: comet-assistant/1.2.3
Agent-Intent: summarization
Agent-KeyId: did:agent:abc123
Agent-Signature: <base64(signature)>
Agent-Contact: contact@example-agent-company.ai
```

| **Header**        | **Required** | **Description**                                                                      |
| ----------------- | ------------ | ------------------------------------------------------------------------------------ |
| `Agent-Name`      | ✅            | Human-readable identifier of the agent, including version.                           |
| `Agent-Intent`    | ✅            | Declares the purpose of the request (e.g., `qa`, `indexing`, `retrieval`).           |
| `Agent-KeyId`     | ⚙️           | References a public key or registry identity (e.g., a DID or URL).                   |
| `Agent-Signature` | ⚙️           | Base64-encoded digital signature proving the request came from the claimed identity. |
| `Agent-Contact`   | ⚙️           | Optional contact email or endpoint for abuse handling or compliance queries.         |


### Agent Policy Headers (Server Responses)
Servers MAY send these headers in HTTP responses to communicate active policy enforcement:

```
Agent-Policy: allow read
Agent-Policy: block unverified
Agent-Policy-Remaining: 95
WWW-Agent-Verify: https://example.com/agent-verify
```

### Custom HTTP Status Codes
| **Code** | **Name**                      | **Meaning**                                                |
| -------- | ----------------------------- | ---------------------------------------------------------- |
| **430**  | `Agent Policy Violation`      | The agent performed or requested a disallowed action.      |
| **431**  | `Agent Rate Limited`          | The agent exceeded rate limits defined in the site policy. |
| **432**  | `Agent Verification Required` | The agent must verify its identity before continuing.      |


### Verification Process
| **Mode**                     | **Description**                                                                                                                                                                    |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **PKI Signature Validation** | Agent signs `(method + path + timestamp + keyId)` with a private key. The server retrieves the corresponding public key from `Agent-KeyId` or registry and verifies the signature. |
| **Registry Lookup**          | Server queries a trusted registry defined in `agent-policy.json` to confirm the agent’s identity and intent.                                                                       |
| **Partner Token**            | Simplified fallback method where the agent authenticates using a pre-shared API token issued by the site.                                                                          |


### Example Failure Response
```
HTTP/1.1 432 Agent Verification Required
WWW-Agent-Verify: https://example.com/agent-verify
```

### Enforcement Models
| **Mode**       | **Behavior**                                                                       |
| -------------- | ---------------------------------------------------------------------------------- |
| **Advisory**   | Logs and tags violations but still serves responses. Useful for gradual adoption.  |
| **Strict**     | Blocks unverified or disallowed agents outright (`430` or `432`).                  |
| **Rate-Limit** | Enforces request caps from `rate_limit` and uses `Agent-Policy-Remaining` headers. |

### Security Considerations
| **Concern**        | **Mitigation**                                                                       |
| ------------------ | ------------------------------------------------------------------------------------ |
| **Spoofing**       | Require signatures and use verification registries to validate authenticity.         |
| **Replay Attacks** | Include timestamps and nonces in signatures to prevent reuse of old requests.        |
| **Privacy**        | Avoid embedding user data in headers. Agents should only expose identity and intent. |
| **Auditability**   | Log agent identifiers, intents, and outcomes for compliance tracking.                |

### Example Request Flow
#### Step 1: Agent makes request
```
curl -i -H "Agent-Name: comet" -H "Agent-KeyId: did:agent:123" https://example.com/api/data
```

#### Step 2: Flow Process

1. **Agent sends request** with required headers
2. **Server fetches and parses** `/agent-policy.json`
3. **Checks matching path rule** and verifies signature (if required)
4. **Server responds** with one of:
   - `200 OK` → allowed
   - `430 Agent Policy Violation` → blocked
   - `432 Agent Verification Required` → verification missing

### Implementation Reference 
| **Language / Framework**       | **Repo Path**                 | **Status**  |
| ------------------------------ | ----------------------------- | ----------- |
| Node.js (Express / Serverless) | [`/middleware`](./middleware) | ✅ Reference |
| Python (FastAPI)               | Planned                       | ⏳           |
| Go                             | Planned                       | ⏳           |


### Example Public Demo:
(to be linked after Vercel deployment)

### Roadmap 
| **Milestone** | **Goal**                                    | **Status** |
| ------------- | ------------------------------------------- | ---------- |
| v0.1          | Initial working draft + Node middleware     | ✅          |
| v0.2          | Define signature schema + registry design   | ⏳          |
| v0.3          | SDKs (Node, Python) + verification registry | 🔜         |
| v1.0          | Formalized spec + W3C/IETF submission       | 🔜         |


### License & Contributions
License: Apache 2.0
Contributions: Open for pull requests and RFCs in /rfcs directory.
Maintained by: Agent Policy Protocol (APoP)

### Summary

The Agent Policy Protocol (APoP) brings consent, control, and verification to the agentic web —
giving websites a voice in how autonomous AI agents interact with them.

---


### 🏁 **Origin & Stewardship**

The **Agent Policy Protocol (APoP)** was conceived by [**Arun Vijayarengan**](https://www.linkedin.com/in/arunvijayarengan), Founder & CEO of [**Superdom AI**](https://superdom.ai), as part of a broader mission to build a safer, more consent-driven agentic web.  

Superdom AI initiated this open standard to ensure that the next generation of AI agents and websites can cooperate transparently —  
balancing **innovation** with **respect for ownership, access, and user trust**.

---


### 🧩 **Backstory**

In late 2025, public discussions around **AI agent access to websites** intensified after a post by **Aravind Srinivas**, CEO of [Perplexity AI](https://www.perplexity.ai), regarding Amazon's attempts to block their *Comet Assistant*.  
In his statement, he wrote:

> "We would be happy to work together with Amazon to figure out a win-win outcome for both us and them.  
> But when it comes to attempts to block our Comet Assistant on Amazon and hurt our users —  
> we will have to stand up for them and not get bullied by Amazon."

📄 *Source:* [Perplexity AI Blog — “Bullying is not innovation”](https://www.perplexity.ai/hub/blog/bullying-is-not-innovation)

This moment highlighted a growing tension in the emerging **agentic web** — between AI agents seeking to browse, summarize, and interact with content, and websites asserting control over how their data is accessed.  

The **Agent Policy Protocol (APoP)** was created as a constructive solution to that tension —  
a way for websites to clearly state their access rules, and for agents to respect them transparently, without conflict.

---
