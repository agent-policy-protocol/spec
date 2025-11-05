# spec
Robots.txt for the agentic web. The open standard that lets websites define how AI agents can access and interact with their content.

agent-policy.json defines how AI agents are allowed to interact with your website — what they can access, how often, and whether they must verify identity.
Think of it as robots.txt for the agentic web, built under the Agent Policy Protocol (APP) standard.
Place it at your site root: https://example.com/agent-policy.json.

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


### Notes
Place agent-policy.json in your site’s root (e.g. https://example.com/agent-policy.json), just like robots.txt.
Agents should fetch and respect this file before interacting with your website.
Use "require_verification": true for sensitive endpoints.
Path patterns support simple prefix matching using * (e.g. "/public/*").
