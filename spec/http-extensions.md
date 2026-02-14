# APoP HTTP Extensions Specification

**Version**: 1.0-draft  
**Status**: Draft  
**Authors**: Arun Vijayarengan (Superdom AI Research Labs)  
**Last Updated**: 2026-02-14

---

## 1. Overview

This document specifies the HTTP extensions introduced by the Agent Policy Protocol (APoP): custom status codes for agent-specific error conditions, response headers for communicating policy information, and the interaction model between agents and APoP-aware servers.

## 2. Custom HTTP Status Codes

APoP defines three custom HTTP status codes in the **4xx Client Error** range. These codes communicate agent-specific policy enforcement decisions that are distinct from standard HTTP errors.

### 2.1 Status Code Registry

| Code | Reason Phrase               | Description                                                  |
| ---- | --------------------------- | ------------------------------------------------------------ |
| 430  | Agent Action Not Allowed    | The requested action is disallowed by the site's APoP policy |
| 438  | Agent Rate Limited          | The agent has exceeded the rate limit defined in the policy  |
| 439  | Agent Verification Required | The agent must verify its identity before access is granted  |

> **Note**: Code 431 is NOT used by APoP — it is already assigned to "Request Header Fields Too Large" by [RFC 6585](https://www.rfc-editor.org/rfc/rfc6585). Codes 430, 438, and 439 are currently unassigned in IANA's HTTP Status Code Registry.

### 2.2 `430 Agent Action Not Allowed`

Returned when the agent's request or declared intent is explicitly disallowed by the site's APoP policy.

**When to use**:

- The agent's `Agent-Intent` includes an action that is listed in `disallow`.
- The agent is requesting a path where `allow: false` in the policy.
- The agent is not on the `agentAllowlist` for a restricted path.
- The agent is on the `agentDenylist`.

**Response body** (RECOMMENDED):

```json
{
  "error": "agent_action_not_allowed",
  "message": "The action 'extract' is not permitted on this path.",
  "policy": "https://example.com/.well-known/agent-policy.json",
  "allowedActions": ["read", "render"],
  "path": "/api/data"
}
```

**Agent behavior**:

- The agent MUST NOT retry the same action on the same path.
- The agent MAY attempt a different (less permissive) action if available.
- The agent SHOULD log the denial for operator review.

### 2.3 `438 Agent Rate Limited`

Returned when the agent has exceeded the rate limit defined in the site's APoP policy.

**When to use**:

- The agent's request count within the policy-defined window exceeds the `rateLimit.requests` value.

**Response headers** (REQUIRED):

```
Retry-After: 60
Agent-Policy-Rate-Limit: 100/hour
Agent-Policy-Rate-Remaining: 0
Agent-Policy-Rate-Reset: 2025-02-14T11:00:00Z
```

**Response body** (RECOMMENDED):

```json
{
  "error": "agent_rate_limited",
  "message": "Rate limit exceeded. 100 requests per hour allowed.",
  "retryAfter": 60,
  "limit": 100,
  "window": "hour",
  "resetAt": "2025-02-14T11:00:00Z"
}
```

**Agent behavior**:

- The agent MUST wait for the duration specified in `Retry-After` before retrying.
- The agent SHOULD use exponential backoff if rate limiting persists.
- The agent MUST NOT attempt to circumvent rate limits (e.g., by rotating identities).

### 2.4 `439 Agent Verification Required`

Returned when the path requires agent identity verification and the agent has not provided sufficient identity proof.

**When to use**:

- The path's policy sets `requireVerification: true`.
- The agent did not include `Agent-Signature` or `Agent-VC` headers.
- The agent's verification credentials were invalid (expired, wrong issuer, bad signature).

**Response headers** (REQUIRED):

```
Agent-Policy-Verify: did, verifiable-credential
Agent-Policy-Verify-Endpoint: https://example.com/agent-verify
```

**Response body** (RECOMMENDED):

```json
{
  "error": "agent_verification_required",
  "message": "This endpoint requires verified agent identity.",
  "acceptedMethods": ["did", "verifiable-credential"],
  "verifyEndpoint": "https://example.com/agent-verify",
  "trustedIssuers": ["did:web:trust.agentpolicy.org"],
  "policy": "https://example.com/.well-known/agent-policy.json"
}
```

**Agent behavior**:

1. Fetch the policy to understand verification requirements.
2. If the agent supports the required verification method, retry with appropriate headers.
3. If the agent cannot satisfy verification, abort the request and report to the operator.

## 3. APoP Response Headers

Servers implementing APoP SHOULD include the following response headers to communicate policy information to agents.

### 3.1 Header Registry

| Header                         | Status   | Description                                             |
| ------------------------------ | -------- | ------------------------------------------------------- |
| `Agent-Policy`                 | Standard | URL to the APoP manifest                                |
| `Agent-Policy-Version`         | Standard | APoP protocol version implemented by the server         |
| `Agent-Policy-Status`          | Standard | Agent's current policy compliance status                |
| `Agent-Policy-Actions`         | Standard | Comma-separated list of permitted actions for this path |
| `Agent-Policy-Rate-Limit`      | Standard | Rate limit for this agent (format: `{n}/{window}`)      |
| `Agent-Policy-Rate-Remaining`  | Standard | Remaining requests in current window                    |
| `Agent-Policy-Rate-Reset`      | Standard | ISO 8601 time when the rate limit window resets         |
| `Agent-Policy-Verify`          | Standard | Accepted verification methods (comma-separated)         |
| `Agent-Policy-Verify-Endpoint` | Standard | URL for agent verification                              |

### 3.2 Successful Response Example

When an agent's request is allowed:

```
HTTP/1.1 200 OK
Content-Type: application/json
Agent-Policy: https://example.com/.well-known/agent-policy.json
Agent-Policy-Version: 1.0
Agent-Policy-Status: allowed
Agent-Policy-Actions: read, summarize
Agent-Policy-Rate-Limit: 100/hour
Agent-Policy-Rate-Remaining: 87
Agent-Policy-Rate-Reset: 2025-02-14T11:00:00Z
```

### 3.3 Policy Status Values

The `Agent-Policy-Status` header communicates the result of the policy evaluation:

| Value        | Description                                                           |
| ------------ | --------------------------------------------------------------------- |
| `allowed`    | Request is allowed. Proceed normally.                                 |
| `restricted` | Request is allowed but with limitations (see `Agent-Policy-Actions`). |
| `denied`     | Request is denied. See status code for reason.                        |
| `unverified` | Agent identity not verified; reduced permissions apply.               |
| `no-policy`  | No APoP policy found for this site.                                   |

## 4. Request Flow

### 4.1 Standard Request Flow

```
Agent                          Server
  │                               │
  │  1. GET /.well-known/         │
  │     agent-policy.json         │
  │ ─────────────────────────────>│
  │                               │
  │  2. 200 OK                    │
  │     {policy JSON}             │
  │ <─────────────────────────────│
  │                               │
  │  [Agent evaluates policy]     │
  │                               │
  │  3. GET /api/data             │
  │     Agent-Name: Bot/1.0       │
  │     Agent-Intent: read        │
  │     Agent-Id: did:web:bot.ai  │
  │ ─────────────────────────────>│
  │                               │
  │  [Server evaluates policy]    │
  │                               │
  │  4. 200 OK                    │
  │     Agent-Policy-Status:      │
  │       allowed                 │
  │     Agent-Policy-Actions:     │
  │       read                    │
  │     {response body}           │
  │ <─────────────────────────────│
```

### 4.2 Verification Flow

```
Agent                          Server
  │                               │
  │  1. GET /api/secure           │
  │     Agent-Name: Bot/1.0       │
  │     Agent-Intent: api_call    │
  │ ─────────────────────────────>│
  │                               │
  │  2. 439 Verification Required │
  │     Agent-Policy-Verify: did  │
  │ <─────────────────────────────│
  │                               │
  │  [Agent prepares signature]   │
  │                               │
  │  3. GET /api/secure           │
  │     Agent-Name: Bot/1.0       │
  │     Agent-Id: did:web:bot.ai  │
  │     Agent-Signature: {sig}    │
  │     Agent-Key-Id: ...#key-1   │
  │ ─────────────────────────────>│
  │                               │
  │  [Server verifies identity]   │
  │                               │
  │  4. 200 OK                    │
  │     Agent-Policy-Status:      │
  │       allowed                 │
  │ <─────────────────────────────│
```

### 4.3 Rate Limiting Flow

```
Agent                          Server
  │                               │
  │  1. GET /api/data (101st req) │
  │     Agent-Name: Bot/1.0       │
  │ ─────────────────────────────>│
  │                               │
  │  2. 438 Rate Limited          │
  │     Retry-After: 300          │
  │     Agent-Policy-Rate-Limit:  │
  │       100/hour                │
  │     Agent-Policy-Rate-Reset:  │
  │       2025-02-14T11:00:00Z    │
  │ <─────────────────────────────│
  │                               │
  │  [Agent waits 300 seconds]    │
  │                               │
  │  3. GET /api/data             │
  │     Agent-Name: Bot/1.0       │
  │ ─────────────────────────────>│
  │                               │
  │  4. 200 OK                    │
  │     Agent-Policy-Rate-Limit:  │
  │       100/hour                │
  │     Agent-Policy-Rate-Remaining: │
  │       99                      │
  │ <─────────────────────────────│
```

## 5. Error Response Format

All APoP error responses SHOULD use a consistent JSON format:

```json
{
  "error": "{error_code}",
  "message": "{human_readable_message}",
  "policy": "{policy_url}",
  "details": {}
}
```

### 5.1 Error Codes

| Error Code                    | HTTP Status | Description                       |
| ----------------------------- | ----------- | --------------------------------- |
| `agent_action_not_allowed`    | 430         | Action is disallowed by policy    |
| `agent_not_on_allowlist`      | 430         | Agent not in path's allowlist     |
| `agent_on_denylist`           | 430         | Agent is on path's denylist       |
| `agent_rate_limited`          | 438         | Rate limit exceeded               |
| `agent_verification_required` | 439         | Identity verification needed      |
| `agent_verification_failed`   | 439         | Verification attempted but failed |
| `agent_credential_expired`    | 439         | VC or signature has expired       |
| `agent_issuer_untrusted`      | 439         | VC issuer not in trusted list     |

## 6. Interaction with Standard HTTP

### 6.1 Precedence

APoP status codes and headers are **additive** to standard HTTP. They do not replace standard mechanisms:

- **Authentication** (`401 Unauthorized`): APoP verification (`439`) is separate from HTTP authentication. A server MAY require both.
- **Authorization** (`403 Forbidden`): If a request is forbidden for non-APoP reasons (e.g., user auth), use `403`. Use `430` only for APoP policy violations.
- **Rate limiting** (`429 Too Many Requests`): If the server has its own rate limiting (beyond APoP), use `429`. Use `438` only for APoP-defined rate limits.

### 6.2 Proxy & CDN Considerations

- CDN/proxy servers that are APoP-aware SHOULD pass through APoP headers unmodified.
- If a CDN caches responses, it MUST vary the cache by `Agent-Name` and `Agent-Id` to avoid serving the wrong policy response to different agents.
- CDNs SHOULD include `Vary: Agent-Name, Agent-Id` in cached responses.

## 7. IANA Considerations

### 7.1 HTTP Status Code Registration

This specification requests registration of the following HTTP status codes:

| Value | Description                 | Reference     |
| ----- | --------------------------- | ------------- |
| 430   | Agent Action Not Allowed    | This document |
| 438   | Agent Rate Limited          | This document |
| 439   | Agent Verification Required | This document |

### 7.2 HTTP Header Field Registration

All headers listed in Section 3.1 are requested for registration in the IANA HTTP Field Name Registry.

## 8. Security Considerations

- Servers MUST NOT leak detailed policy information in error responses to non-APoP agents that may be attempting policy enumeration.
- Rate limit headers (`Agent-Policy-Rate-Remaining`) SHOULD only be sent to agents that include `Agent-Name` to prevent anonymous probing.
- The `Agent-Policy-Verify-Endpoint` URL MUST be served over HTTPS and SHOULD be on the same origin as the protected resource.
- Servers SHOULD implement anti-enumeration protections: if an agent sends many requests with different `Agent-Id` values in quick succession, rate limit at the IP level.

## 9. Conformance

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be interpreted as described in [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119).
