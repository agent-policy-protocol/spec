# 🌐 Agent Policy Protocol (APoP)

**Robots.txt for the agentic web.**  
The open standard that lets websites define how AI agents can access and interact with their content.

---

## 🧩 Overview

`agent-policy.json` defines how AI agents are allowed to interact with your website —  
what they can access, how often, and whether they must verify identity.  

Think of it as **robots.txt for the agentic web**, built under the **Agent Policy Protocol (APoP)** standard.  
Place it at your site root:  
https://example.com/agent-policy.json
---

### 📘 Specification
- **Draft:** [SPEC.md](./SPEC.md)
- **Example Manifest:** [agent-policy.json](./agent-policy.json)
- **Reference Middleware:** [middleware/](./middleware)

---

### ⚙️ Quick Summary
- Websites declare policies in a JSON file at:  
  `https://example.com/agent-policy.json`
- AI agents send `Agent-*` headers identifying themselves and their intent.  
- Servers respond with `Agent-Policy` headers and enforce verification or rate limits.  
- Built for compatibility with emerging standards like MCP and W3C Agent Protocol CG.

---

### 🧩 Why It Matters
AI agents are already browsing, summarizing, and interacting with the web —  
but websites have no standardized way to express **consent or control**.  
APoP introduces a simple, open mechanism that brings **balance** between innovation and ownership.

---

### 💡 Origin Story
This initiative was inspired by growing friction between AI agents and web platforms —  
most notably a public discussion sparked by [Perplexity AI’s CEO](https://www.perplexity.ai/hub/blog/bullying-is-not-innovation)  
after Amazon attempted to block their Comet Assistant.  

> "We would be happy to work together with Amazon to figure out a win-win outcome for both us and them.  
> But when it comes to attempts to block our Comet Assistant on Amazon and hurt our users —  
> we will have to stand up for them and not get bullied by Amazon."

APoP emerged as a constructive path forward: an open, transparent, consent-based standard for the agentic web.

---

### 🧱 Schema Summary

| **Field**              | **Purpose**                                                                                                                                |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `version`              | Specifies the Agent Policy Protocol version. Always start with `"0.1"` for current drafts.                                                 |
| `default`              | Defines the default rules that apply to all paths on the website unless overridden.                                                        |
| `allow` / `disallow`   | Lists which actions agents are explicitly allowed or denied to perform. Examples: `"read"`, `"index"`, `"data-extraction"`, `"api-calls"`. |
| `rate_limit`           | Limits how many agent requests are accepted per time window. Example: `100 requests` per `3600 seconds` (1 hour).                          |
| `require_verification` | Indicates whether agents must verify their identity (using digital signatures or registry validation) before access is granted.            |
| `paths`                | Optional overrides for specific URL patterns. For example, you might allow agents to index `/public/*` but disallow `/admin/*`.            |
| `verification`         | Specifies the method of verifying agent identity (e.g., `"pkix"`) and optionally the verification registry endpoint.                       |
| `contact`              | Provides the responsible contact for questions, abuse reports, or policy clarifications.                                                   |
| `meta`                 | Contains optional human-readable metadata such as description, maintainer info, or last update timestamp.                                  |

---

### 🧠 Notes

- Place `agent-policy.json` in your site’s root (e.g. `https://example.com/agent-policy.json`), just like `robots.txt`.  
- Agents should fetch and respect this file before interacting with your website.  
- Use `"require_verification": true` for sensitive endpoints.  
- Path patterns support simple prefix matching using `*` (e.g. `/public/*`).  

---

### 🏁 Stewardship
The Agent Policy Protocol (APoP) was initiated by [**Arun Vijayarengan**](https://www.linkedin.com/in/arunvijayarengan),  
Founder & CEO of [**Superdom AI**](https://superdom.ai),  
to ensure the next generation of AI agents and websites can cooperate transparently —  
balancing **innovation** with **respect for access, ownership, and user trust**.

---

### 📜 License
Apache 2.0 — open for community contribution.  
Pull requests, RFCs, and implementation feedback are encouraged.

---
