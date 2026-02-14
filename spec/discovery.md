# APoP Discovery Specification

**Version**: 1.0-draft  
**Status**: Draft  
**Authors**: Arun Vijayarengan (Superdom AI Research Labs)  
**Last Updated**: 2025-02-14

---

## 1. Overview

This document specifies how AI agents discover the Agent Policy Protocol (APoP) manifest for a given website. Discovery is the first step in the APoP protocol flow: an agent must locate and fetch the policy before it can determine what actions are permitted.

APoP defines **four discovery methods**, ordered by priority. Agents MUST attempt them in the specified order and use the first successful result.

## 2. Design Principles

- **Zero configuration**: The primary method (well-known URI) works with no server-side changes beyond hosting a static JSON file.
- **Progressive enhancement**: Sites can add HTTP headers, HTML meta tags, or DNS records for richer integration.
- **Graceful degradation**: If no policy is discovered, the agent SHOULD treat the site as having no APoP policy (open access, subject to `robots.txt` and legal compliance).
- **Cacheability**: Discovered policies SHOULD be cacheable to minimize overhead.

## 3. Discovery Methods

### 3.1 Well-Known URI (Primary)

The canonical discovery method. Agents MUST check this first.

**URI**: `/.well-known/agent-policy.json`

**Requirements**:

- The server MUST serve the file with `Content-Type: application/json`.
- The file MUST conform to the [APoP JSON Schema](schema/agent-policy.schema.json).
- The server SHOULD set `Cache-Control` headers (recommended: `public, max-age=3600`).
- The file MUST be accessible without authentication.

**Agent behavior**:

1. Issue a `GET` request to `https://{host}/.well-known/agent-policy.json`.
2. If the response is `200 OK` with valid JSON, parse and apply the policy.
3. If the response is `404 Not Found`, proceed to the next discovery method.
4. If the response is any other error (5xx, timeout), the agent SHOULD retry with exponential backoff (max 3 attempts) before proceeding to the next method.

**Example**:

```
GET /.well-known/agent-policy.json HTTP/1.1
Host: example.com
Agent-Name: MyCrawler/1.0

HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: public, max-age=3600

{
  "version": "1.0",
  "defaultPolicy": {
    "allow": true,
    "actions": ["read", "render"],
    "rateLimit": { "requests": 100, "window": "hour" }
  }
}
```

### 3.2 HTTP Response Header

Allows servers to advertise the policy URL in any HTTP response, enabling discovery without a separate request.

**Header**: `Agent-Policy`

**Format**: A URI pointing to the APoP manifest.

```
Agent-Policy: https://example.com/.well-known/agent-policy.json
```

**Requirements**:

- The header value MUST be an absolute URI.
- Servers SHOULD include this header in all responses (or at minimum, in the response to the root URL `/`).
- If both the well-known URI and the header are present, the well-known URI takes precedence.

**Agent behavior**:

1. If the well-known URI returned 404, check if any HTTP response from the target site includes the `Agent-Policy` header.
2. Fetch the URI specified in the header.
3. Parse and validate against the APoP schema.

**Example**:

```
GET / HTTP/1.1
Host: example.com
Agent-Name: AssistantBot/2.0

HTTP/1.1 200 OK
Content-Type: text/html
Agent-Policy: https://example.com/.well-known/agent-policy.json
Agent-Policy-Version: 1.0
```

### 3.3 HTML Meta Tag

For static sites or environments where HTTP header modification is difficult (e.g., some CDN configurations, GitHub Pages).

**Tag**: `<meta name="agent-policy" content="{url}">`

**Placement**: Inside the `<head>` element of any HTML page (preferably the root `/` page).

**Requirements**:

- The `content` attribute MUST be an absolute URI pointing to the APoP manifest.
- If multiple `agent-policy` meta tags exist, the first one encountered takes precedence.
- This method is ONLY applicable when the agent is fetching HTML content.

**Agent behavior**:

1. If the well-known URI returned 404 **and** no `Agent-Policy` HTTP header was found, parse the HTML of the root page.
2. Look for `<meta name="agent-policy" content="...">` in the `<head>`.
3. Fetch and validate the referenced policy.

**Example**:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta
      name="agent-policy"
      content="https://example.com/.well-known/agent-policy.json"
    />
    <title>Example Corp</title>
  </head>
  <body>
    ...
  </body>
</html>
```

### 3.4 DNS TXT Record

For organizations that want to declare a policy at the domain level, useful for multi-subdomain deployments or when web server configuration is not accessible.

**Record**: `_agentpolicy.{domain}`

**Format**: `TXT "apop=1 policy={url}"`

**Requirements**:

- The TXT record MUST include `apop=1` to indicate APoP support.
- The `policy=` value MUST be an absolute URI to the APoP manifest.
- Optional fields: `v=` (version), `verify=` (verification endpoint URL).

**Agent behavior**:

1. If all previous methods fail, issue a DNS TXT query for `_agentpolicy.{domain}`.
2. Parse the TXT record for the `policy=` field.
3. Fetch and validate the referenced policy.

**Example**:

```
_agentpolicy.example.com. 3600 IN TXT "apop=1 v=1.0 policy=https://example.com/.well-known/agent-policy.json"
```

## 4. Discovery Fallback Chain

Agents MUST follow this resolution order:

```
┌─────────────────────────────────────────────────────────────┐
│  1. GET /.well-known/agent-policy.json                      │
│     ├── 200 OK → Use this policy (DONE)                     │
│     └── 404 / Error → Continue to step 2                    │
│                                                             │
│  2. Check HTTP Response Header: Agent-Policy                │
│     ├── Present → Fetch URL, use policy (DONE)              │
│     └── Absent → Continue to step 3                         │
│                                                             │
│  3. Parse HTML <meta name="agent-policy"> tag               │
│     ├── Found → Fetch URL, use policy (DONE)                │
│     └── Not found → Continue to step 4                      │
│                                                             │
│  4. DNS TXT lookup: _agentpolicy.{domain}                   │
│     ├── Found → Fetch URL, use policy (DONE)                │
│     └── Not found → No APoP policy (act with default care)  │
└─────────────────────────────────────────────────────────────┘
```

## 5. Policy Caching

### 5.1 Cache Behavior

- Agents SHOULD cache discovered policies for the duration specified by `Cache-Control` or `Expires` headers.
- If no cache headers are present, agents SHOULD use a default TTL of **1 hour**.
- Agents MUST re-fetch the policy after the cache expires.
- Agents SHOULD support `ETag` / `If-None-Match` for conditional requests.

### 5.2 Cache-Control Recommendations for Site Owners

```
Cache-Control: public, max-age=3600
```

For frequently updated policies:

```
Cache-Control: public, max-age=300, stale-while-revalidate=60
```

### 5.3 Force Refresh

A site owner MAY signal that agents should re-fetch immediately by:

1. Changing the `lastModified` field in the policy's `metadata` section.
2. Returning a `Cache-Control: no-cache` header temporarily.

## 6. IANA Considerations

### 6.1 Well-Known URI Registration

This specification registers the following well-known URI:

- **URI suffix**: `agent-policy.json`
- **Change controller**: APoP Working Group
- **Specification document**: This document
- **Related information**: https://agentpolicy.org

### 6.2 HTTP Header Registration

This specification registers the following HTTP headers:

| Header Name            | Status    | Reference     |
| ---------------------- | --------- | ------------- |
| `Agent-Policy`         | Permanent | This document |
| `Agent-Policy-Version` | Permanent | This document |

## 7. Security Considerations

- Agents MUST fetch the policy over HTTPS. HTTP (non-TLS) policies MUST be rejected to prevent MITM attacks.
- Agents SHOULD validate the JSON against the APoP schema before applying rules.
- DNS-based discovery is susceptible to DNS spoofing; agents SHOULD use DNSSEC-validating resolvers when using Method 4.
- Agents MUST NOT follow more than 3 redirects when fetching a policy URL to prevent redirect loops.
- Agents SHOULD implement a maximum policy file size (recommended: 1 MB) to prevent resource exhaustion.

## 8. Relationship to robots.txt

APoP is designed to **complement, not replace**, `robots.txt`:

| Feature              | robots.txt             | APoP                          |
| -------------------- | ---------------------- | ----------------------------- |
| Scope                | Crawl access           | Full agent behavior           |
| Actions              | Allow/Disallow crawl   | 10+ action types              |
| Agent identification | User-Agent string      | Verified identity (DID, PKIX) |
| Rate limiting        | Crawl-delay (informal) | Formal rate limits            |
| Machine-readable     | Custom format          | JSON Schema                   |
| Verification         | None                   | Cryptographic                 |

If both `robots.txt` and APoP are present, the **more restrictive rule** applies. If `robots.txt` disallows crawling a path but APoP allows reading, the agent MUST NOT access that path.

## 9. Conformance

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be interpreted as described in [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119).
