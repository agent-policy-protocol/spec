# APoP Specification — v1.0 Draft

> **Agent Policy Protocol (APoP)** — The authorization & consent layer for the agentic web.

This directory contains the formal specification documents for APoP v1.0.

## Documents

| File                                                               | Description                                                                                 | Status |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- | ------ |
| [schema/agent-policy.schema.json](schema/agent-policy.schema.json) | JSON Schema (draft 2020-12) for the APoP manifest                                           | Draft  |
| [discovery.md](discovery.md)                                       | How agents discover APoP policies (well-known URI, HTTP headers, HTML meta, DNS TXT)        | Draft  |
| [agent-identification.md](agent-identification.md)                 | Agent identity headers, verification methods (PKIX, DID, VC, partner-token), identity tiers | Draft  |
| [http-extensions.md](http-extensions.md)                           | Custom HTTP status codes (430/438/439), response headers, request flows                     | Draft  |

## Quick Reference

### Discovery

```
GET /.well-known/agent-policy.json
```

### Agent Headers

```
Agent-Name: MyBot/1.0
Agent-Intent: read, summarize
Agent-Id: did:web:mybot.example.com
```

### Status Codes

| Code | Meaning                     |
| ---- | --------------------------- |
| 430  | Agent Action Not Allowed    |
| 438  | Agent Rate Limited          |
| 439  | Agent Verification Required |

### Minimal Policy

```json
{
  "version": "1.0",
  "defaultPolicy": {
    "allow": true,
    "actions": ["read", "render"]
  }
}
```

## Relationship to Root Spec

The root [SPEC.md](../SPEC.md) contains the original v0.1 draft. These v1.0 spec documents supersede it with:

- Formal JSON Schema validation
- Four discovery methods (v0.1 had one)
- W3C DID and Verifiable Credential verification (v0.1 had PKIX only)
- Corrected HTTP status codes (438/439 instead of 431/432)
- Cross-protocol interoperability (A2A, MCP, WebMCP, UCP, APAAI)
- Agent identity tiers (Anonymous → Identified → Verified)

## License

Apache 2.0 — See [LICENSE](../LICENSE) in the project root.
