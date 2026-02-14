# APoP Conformance Test Suite

Validates that middleware implementations correctly enforce the Agent Policy Protocol (APoP) v1.0 specification.

## Test Files

| Test File                    | What It Tests                                                                              |
| ---------------------------- | ------------------------------------------------------------------------------------------ |
| `test-policy-parsing.js`     | JSON Schema compliance, malformed/missing fields, action types, verification methods       |
| `test-discovery.js`          | `/.well-known/agent-policy.json` endpoint, `Agent-Policy` / `Agent-Policy-Version` headers |
| `test-status-codes.js`       | 430, 439, 200 responses with correct headers and JSON bodies                               |
| `test-agent-headers.js`      | `Agent-Name`, `Agent-Intent`, `Agent-Id`, `Agent-Signature`, `Agent-VC` parsing            |
| `test-path-matching.js`      | Glob patterns: `/*`, `/**`, exact match, edge cases                                        |
| `test-allowlist-denylist.js` | `agentAllowlist`, `agentDenylist`, precedence rules                                        |
| `test-rate-limiting.js`      | Rate limit headers (`Agent-Policy-Rate-Limit`, `Agent-Policy-Rate-Remaining`)              |
| `test-verification.js`       | 439 response, accepted methods, verify endpoint, credential handling                       |
| `test-intent-enforcement.js` | Single/multi intent, disallow precedence, comma-separated intents                          |

## Running Tests

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Validate example policies against JSON Schema
npm run validate:examples
```

## How It Works

Tests use [supertest](https://github.com/ladjs/supertest) to make HTTP requests against an Express app created from the APoP middleware logic. The test helper (`helpers.js`) creates an isolated app instance with a configurable policy object — no filesystem dependency during tests.

The test policy (`TEST_POLICY` in `helpers.js`) covers:

- Default policy with verification required, rate limits, and disallowed actions
- Public paths (no verification)
- Denied paths (`/admin/*`, `/api/private/*`)
- Allowlisted paths (`/api/v1/*`)
- Denylisted paths (`/blocked/*`)
- Deep glob paths (`/deep/nested/**`)

## Testing Your Own Middleware

To test a different middleware implementation:

1. Modify `helpers.js` to create your middleware app instead of the reference Express implementation
2. Ensure your middleware follows the same request/response contract:
   - Reads `Agent-Name`, `Agent-Intent`, `Agent-Id`, `Agent-Signature`, `Agent-VC` headers
   - Returns 430, 438, 439 status codes with JSON bodies
   - Sets `Agent-Policy-Status`, `Agent-Policy-Actions`, `Agent-Policy-Rate-*`, `Agent-Policy-Verify` headers
