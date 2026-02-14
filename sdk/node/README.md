# @apop/node

> Node.js SDK for the **Agent Policy Protocol (APoP)** — robots.txt for the agentic web.

## Installation

```bash
npm install @apop/node
```

Requires **Node.js 18+** (uses built-in `fetch` and `dns/promises`).

## Quick Start

### Express Middleware

```ts
import express from "express";
import { createExpressMiddleware, createDiscoveryEndpoint } from "@apop/node";

const policy = {
  version: "1.0",
  policyUrl: "https://example.com/.well-known/agent-policy.json",
  defaultPolicy: {
    allow: true,
    actions: ["read", "render"],
    rateLimit: { requests: 100, window: "hour" },
    requireVerification: false,
  },
  pathPolicies: [
    { path: "/admin/*", allow: false },
    { path: "/api/**", allow: true, requireVerification: true },
  ],
  verification: { method: "did" },
};

const app = express();

// Enforce APoP policy on all routes
app.use(createExpressMiddleware({ policy }));

// Serve the policy at the well-known URI
app.get("/.well-known/agent-policy.json", createDiscoveryEndpoint(policy));

app.get("/", (req, res) => res.send("Hello!"));
app.listen(3000);
```

### Parse & Validate a Policy

```ts
import { parsePolicy, parsePolicyFile } from "@apop/node";

// From a JSON string
const result = parsePolicy(jsonString);
if (result.valid) {
  console.log(result.policy); // AgentPolicy object
} else {
  console.error(result.errors);
}

// From a file
const fileResult = await parsePolicyFile("./agent-policy.json");
```

### Enforce a Policy Programmatically

```ts
import { enforce } from "@apop/node";

const result = enforce(policy, {
  path: "/api/data",
  agentName: "MyBot/1.0",
  agentIntent: "read",
  agentId: "did:web:mybot.example.com",
  agentSignature: "eyJhbGci...",
});

console.log(result.status); // 'allowed' | 'denied' | 'verification-required' | 'rate-limited'
console.log(result.httpStatus); // 200, 430, 438, or 439
console.log(result.headers); // Response headers to set
console.log(result.body); // Error body (if denied)
```

### Discover a Policy

```ts
import { discoverPolicy } from "@apop/node";

const result = await discoverPolicy("example.com");

if (result.policy) {
  console.log(`Found via ${result.method}: ${result.policyUrl}`);
} else {
  console.log("No APoP policy found");
}
```

### Parse Agent Headers

```ts
import { parseRequestHeaders, isAgent, parseIntents } from "@apop/node";

// From Express req object
const headers = parseRequestHeaders(req);
if (isAgent(headers)) {
  const intents = parseIntents(headers.agentIntent);
  console.log(`Agent: ${headers.agentName}, Intents: ${intents}`);
}
```

## Middleware Adapters

### Vercel Serverless

```ts
import { createVercelHandler } from "@apop/node/middleware/vercel";

const apop = createVercelHandler({ policy });

export default function handler(req, res) {
  if (apop(req, res)) return; // Blocked by policy
  res.json({ ok: true });
}
```

### Vercel Edge Middleware

```ts
import { createVercelEdgeMiddleware } from "@apop/node/middleware/vercel";

const apop = createVercelEdgeMiddleware({ policy });

export default function middleware(request) {
  const blocked = apop(request);
  if (blocked) return blocked;
  return new Response("OK");
}
```

### Next.js Middleware

```ts
// middleware.ts
import { NextResponse } from "next/server";
import { createNextMiddleware } from "@apop/node/middleware/nextjs";

const apop = createNextMiddleware({ policy });

export function middleware(request) {
  const result = apop(request, NextResponse);
  if (result) return result;
  return NextResponse.next();
}

export const config = { matcher: "/:path*" };
```

## API Reference

### Core Modules

| Module      | Exports                                                                                                                                                            |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `parser`    | `parsePolicy()`, `validatePolicy()`, `parsePolicyFile()`, `getSchema()`                                                                                            |
| `discovery` | `discoverPolicy()`                                                                                                                                                 |
| `matcher`   | `pathMatches()`, `matchPathPolicy()`, `mergePolicy()`                                                                                                              |
| `enforcer`  | `enforce()`                                                                                                                                                        |
| `headers`   | `parseRequestHeaders()`, `isAgent()`, `parseIntents()`, `buildAllowedHeaders()`, `buildDeniedHeaders()`, `buildVerificationHeaders()`, `buildRateLimitedHeaders()` |

### Types

| Type                | Description                                                                                                                               |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `AgentPolicy`       | Root policy manifest                                                                                                                      |
| `PolicyRule`        | Default policy rules                                                                                                                      |
| `PathPolicy`        | Path-specific overrides                                                                                                                   |
| `RateLimit`         | Rate limiting config                                                                                                                      |
| `Verification`      | Verification config                                                                                                                       |
| `ActionType`        | 10 action types: `read`, `index`, `extract`, `summarize`, `render`, `api_call`, `form_submit`, `automated_purchase`, `tool_invoke`, `all` |
| `EnforcementResult` | Result of `enforce()`                                                                                                                     |
| `RequestContext`    | Input to `enforce()`                                                                                                                      |
| `DiscoveryResult`   | Result of `discoverPolicy()`                                                                                                              |

### Constants

| Constant                                  | Value |
| ----------------------------------------- | ----- |
| `APOP_STATUS_CODES.ACTION_NOT_ALLOWED`    | `430` |
| `APOP_STATUS_CODES.RATE_LIMITED`          | `438` |
| `APOP_STATUS_CODES.VERIFICATION_REQUIRED` | `439` |

## Path Matching

| Pattern   | Matches                          | Does NOT Match         |
| --------- | -------------------------------- | ---------------------- |
| `/foo`    | `/foo`                           | `/foo/bar`, `/foobar`  |
| `/foo/*`  | `/foo/bar`                       | `/foo/bar/baz`, `/foo` |
| `/foo/**` | `/foo`, `/foo/bar`, `/foo/a/b/c` | `/bar/foo`             |

## Enforcement Order

1. Match path → merge with `defaultPolicy`
2. Check `agentDenylist` → 430
3. Check `agentAllowlist` → 430
4. Check `allow: false` → 430
5. Check `Agent-Intent` against `disallow` → 430
6. Check `requireVerification` → 439
7. Set rate limit headers → 200

## Development

```bash
npm install
npm run build    # Compile TypeScript
npm test         # Run tests with vitest
npm run lint     # Type-check without emitting
```

## License

Apache-2.0
