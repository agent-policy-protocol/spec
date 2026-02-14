# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in the Agent Policy Protocol specification, reference implementations, or SDK, please report it responsibly.

**Do NOT open a public GitHub issue for security vulnerabilities.**

### How to Report

Send an email to **[security@agentpolicy.org](mailto:security@agentpolicy.org)** with:

- A description of the vulnerability
- Steps to reproduce the issue
- The potential impact
- Any suggested fixes (optional)

### What to Expect

- **Acknowledgment**: We will acknowledge receipt within 48 hours.
- **Assessment**: We will assess the severity and impact within 5 business days.
- **Fix**: We will work on a fix and coordinate disclosure with you.
- **Disclosure**: We will publicly disclose the vulnerability after a fix is available, crediting you (unless you prefer anonymity).

## Scope

This security policy covers:

- The APoP specification (`spec/`)
- The JSON Schema (`spec/schema/agent-policy.schema.json`)
- The Node.js SDK (`sdk/node/`)
- The reference middleware (`middleware/`)
- The conformance test suite (`tests/`)

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Security Best Practices for Implementors

When implementing APoP in production:

1. **Always validate** `agent-policy.json` against the JSON Schema before loading.
2. **Use HTTPS** for all policy URLs, verification endpoints, and registry lookups.
3. **Implement rate limiting** with a proper backend (in-memory counters, Redis, etc.) — the SDK's rate limit headers are advisory only.
4. **Verify agent signatures** cryptographically — the SDK currently checks for header presence only, not cryptographic validity.
5. **Sanitize inputs** — agent headers (`Agent-Name`, `Agent-Intent`, etc.) are untrusted input.
