# APoP Agent Identification & Verification Specification

**Version**: 1.0-draft  
**Status**: Draft  
**Authors**: Arun Vijayarengan (Superdom AI Research Labs)  
**Last Updated**: 2025-02-14

---

## 1. Overview

This document specifies how AI agents identify themselves to websites implementing the Agent Policy Protocol (APoP), and how websites verify agent identity claims. Agent identification is fundamental to APoP — it enables sites to differentiate between agents, apply per-agent policies, and cryptographically verify that an agent is who it claims to be.

## 2. Design Principles

- **Layered identity**: Simple name-based identification for basic use cases, full cryptographic verification for high-trust interactions.
- **Interoperable**: Agent identity aligns with emerging standards (W3C DIDs, Verifiable Credentials, A2A Agent Cards).
- **Privacy-preserving**: Agents disclose only what is necessary. Purpose (intent) declaration is standardized but content is opaque.
- **Backwards compatible**: Agents that only send `User-Agent` can still be matched by name. APoP headers are additive.

## 3. Agent Request Headers

### 3.1 Required Headers

#### `Agent-Name`

The human-readable name and version of the agent.

- **Format**: `{AgentName}/{Version}`
- **Required**: YES (for APoP-aware agents)
- **Examples**: `PerplexityBot/1.0`, `CometAgent/2.3`, `GeminiCrawler/1.0`

```
Agent-Name: PerplexityBot/1.0
```

### 3.2 Recommended Headers

#### `Agent-Intent`

Declares the purpose of the agent's current request. Enables sites to make policy decisions based on what the agent intends to do.

- **Format**: One or more action types from the APoP action registry, comma-separated.
- **Required**: RECOMMENDED
- **Valid values**: `read`, `index`, `extract`, `summarize`, `render`, `api_call`, `form_submit`, `automated_purchase`, `tool_invoke`

```
Agent-Intent: read, summarize
```

When multiple intents are declared, the site evaluates the policy against **all** declared intents. If any intent is disallowed, the entire request is denied (fail-closed semantics).

#### `Agent-Id`

A globally unique, verifiable identifier for the agent. Supports multiple identifier schemes.

- **Format**: URI (DID, email-style, or custom scheme)
- **Required**: RECOMMENDED (REQUIRED when `requireVerification: true`)
- **Supported schemes**:
  - `did:web:` — W3C Decentralized Identifier (preferred for production)
  - `did:key:` — Cryptographic key-based DID (for ephemeral agents)
  - `mailto:` — Email-based identifier (for simple integrations)
  - `https:` — URL-based identifier pointing to an agent profile

```
Agent-Id: did:web:comet.perplexity.ai
```

```
Agent-Id: did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK
```

### 3.3 Optional Headers

#### `Agent-Card`

URL pointing to the agent's machine-readable capability card. Aligns with the A2A Agent Card specification and provides the site with detailed information about the agent's capabilities.

- **Format**: Absolute URI
- **Required**: OPTIONAL

```
Agent-Card: https://comet.perplexity.ai/.well-known/agent.json
```

#### `Agent-Signature`

Cryptographic signature proving ownership of the `Agent-Id`. Required when the site's policy sets `requireVerification: true`.

- **Format**: Base64url-encoded signature
- **Required**: CONDITIONAL (required when verification is demanded)

```
Agent-Signature: eyJhbGciOiJFZERTQSIsImtpZCI6ImRpZDp3ZWI6Y29tZXQucGVycGxleGl0eS5haSJ9...
```

#### `Agent-Key-Id`

Reference to the signing key used for the signature. Allows the verifier to fetch the public key.

- **Format**: URI (typically a DID fragment or JWK URL)
- **Required**: CONDITIONAL (when `Agent-Signature` is present)

```
Agent-Key-Id: did:web:comet.perplexity.ai#key-1
```

#### `Agent-VC`

A W3C Verifiable Credential proving the agent's identity, issued by a trusted authority. Aligns with Google's Agent Payment Protocol (AP2) approach.

- **Format**: Base64url-encoded Verifiable Credential (JWT or JSON-LD format)
- **Required**: OPTIONAL (used when `verification.method` includes `verifiable-credential`)

```
Agent-VC: eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJkaWQ6d2ViOnRydXN0LmFnZW50cG9saWN5Lm9yZyJ9...
```

## 4. Header Summary Table

| Header            | Required      | Format               | Purpose                       |
| ----------------- | ------------- | -------------------- | ----------------------------- |
| `Agent-Name`      | YES           | `Name/Version`       | Human-readable identification |
| `Agent-Intent`    | RECOMMENDED   | Action type(s)       | Declare purpose of request    |
| `Agent-Id`        | RECOMMENDED\* | URI (DID, mailto, …) | Globally unique identifier    |
| `Agent-Card`      | OPTIONAL      | Absolute URI         | Link to agent capability card |
| `Agent-Signature` | CONDITIONAL   | Base64url            | Cryptographic identity proof  |
| `Agent-Key-Id`    | CONDITIONAL   | URI                  | Signing key reference         |
| `Agent-VC`        | OPTIONAL      | Base64url            | Verifiable Credential token   |

_\* REQUIRED when the site's policy sets `requireVerification: true`_

## 5. Verification Methods

APoP supports four verification methods that sites can require. A site declares the accepted method(s) in the `verification.method` field of its policy manifest.

### 5.1 PKIX Verification (`pkix`)

Traditional Public Key Infrastructure (X.509) based verification.

**Flow**:

1. Agent sends `Agent-Id`, `Agent-Signature`, and `Agent-Key-Id` headers.
2. Server resolves `Agent-Key-Id` to a public key (via X.509 certificate chain or `.well-known/keys` endpoint).
3. Server verifies the signature over a canonical message (see Section 6).
4. If valid, the agent is verified; if invalid, respond with `432 Agent Verification Required`.

### 5.2 DID Verification (`did`)

W3C Decentralized Identifier-based verification.

**Flow**:

1. Agent sends `Agent-Id: did:web:{domain}` and `Agent-Signature`.
2. Server resolves the DID Document by fetching `https://{domain}/.well-known/did.json`.
3. Server extracts the verification method from the DID Document.
4. Server verifies the signature over the canonical message.

**DID Document example** (hosted by the agent operator):

```json
{
  "@context": "https://www.w3.org/ns/did/v1",
  "id": "did:web:comet.perplexity.ai",
  "verificationMethod": [
    {
      "id": "did:web:comet.perplexity.ai#key-1",
      "type": "Ed25519VerificationKey2020",
      "controller": "did:web:comet.perplexity.ai",
      "publicKeyMultibase": "z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK"
    }
  ],
  "authentication": ["did:web:comet.perplexity.ai#key-1"]
}
```

### 5.3 Verifiable Credential Verification (`verifiable-credential`)

W3C Verifiable Credentials-based verification, aligned with Google's Agent Payment Protocol (AP2).

**Flow**:

1. Agent sends `Agent-VC` header containing a signed Verifiable Credential.
2. Server validates the VC structure and signature.
3. Server checks that the VC issuer (`iss`) is in the policy's `trustedIssuers` list.
4. Server validates the VC has not expired.
5. If valid, extract agent claims (name, capabilities, organization) from the VC.

**Verifiable Credential payload example**:

```json
{
  "iss": "did:web:trust.agentpolicy.org",
  "sub": "did:web:comet.perplexity.ai",
  "iat": 1739500000,
  "exp": 1742092000,
  "vc": {
    "@context": ["https://www.w3.org/2018/credentials/v1"],
    "type": ["VerifiableCredential", "AgentIdentityCredential"],
    "credentialSubject": {
      "agentName": "CometAgent",
      "organization": "Perplexity AI",
      "capabilities": ["read", "summarize"],
      "complianceLevel": "standard"
    }
  }
}
```

### 5.4 Partner Token Verification (`partner-token`)

Pre-shared API token for simple, bilateral integrations where full cryptographic identity is overkill.

**Flow**:

1. Agent sends `Authorization: Bearer {token}` header.
2. Server validates the token against its stored partner tokens.
3. If valid, the agent is verified with the associated permissions.

**When to use**: Internal tools, trusted partnerships, development environments.

## 6. Signature Construction

When cryptographic verification is used (`pkix` or `did`), the agent MUST sign a canonical message consisting of:

```
{METHOD} {PATH}\n
host: {HOST}\n
date: {ISO8601_TIMESTAMP}\n
agent-id: {AGENT_ID}\n
agent-intent: {INTENT}
```

**Example** (for a GET request to `/api/data`):

```
GET /api/data
host: example.com
date: 2025-02-14T10:30:00Z
agent-id: did:web:comet.perplexity.ai
agent-intent: read, extract
```

The agent signs this message with its private key and includes the signature in `Agent-Signature`. This binds the signature to the specific request, preventing replay attacks.

### 6.1 Supported Algorithms

| Algorithm | Key Type   | Use Case              |
| --------- | ---------- | --------------------- |
| `Ed25519` | OKP        | Default, recommended  |
| `ES256`   | EC (P-256) | Web PKI compatibility |
| `ES384`   | EC (P-384) | Higher security       |
| `RS256`   | RSA        | Legacy compatibility  |

## 7. Agent Identity Tiers

APoP recognizes three levels of agent identity, each with increasing trust:

| Tier | Identity Level | Headers Required                  | Trust Level | Use Cases                   |
| ---- | -------------- | --------------------------------- | ----------- | --------------------------- |
| 1    | **Anonymous**  | `Agent-Name` only                 | Low         | Public content reading      |
| 2    | **Identified** | + `Agent-Id`, `Agent-Intent`      | Medium      | API access, indexing        |
| 3    | **Verified**   | + `Agent-Signature` or `Agent-VC` | High        | Purchases, form submissions |

Sites declare the minimum required tier through their policy:

- `requireVerification: false` → Tier 1 (Anonymous) is sufficient.
- `requireVerification: true` → Tier 3 (Verified) is required.
- Per-path policies can require different tiers for different endpoints.

## 8. Agent Allowlists and Denylists

Path policies can include `agentAllowlist` and `agentDenylist` arrays to control access by specific agents:

```json
{
  "path": "/api/premium/*",
  "allow": true,
  "actions": ["read", "api_call"],
  "requireVerification": true,
  "agentAllowlist": ["did:web:comet.perplexity.ai", "did:web:gemini.google.com"]
}
```

**Rules**:

- If `agentAllowlist` is present, ONLY listed agents can access the path (even if the default policy allows it).
- If `agentDenylist` is present, listed agents are blocked (even if otherwise allowed).
- If both are present, `agentDenylist` takes precedence.
- Agent identifiers are matched against the `Agent-Id` header value.

## 9. Interoperability with A2A Agent Cards

When an agent provides an `Agent-Card` URL, the site MAY fetch the A2A Agent Card to learn the agent's capabilities:

```json
{
  "name": "CometAgent",
  "description": "AI shopping assistant by Perplexity AI",
  "url": "https://comet.perplexity.ai",
  "capabilities": {
    "streaming": true,
    "pushNotifications": false
  },
  "skills": [
    {
      "id": "product-search",
      "name": "Product Search",
      "description": "Search for products across retailers"
    }
  ]
}
```

The site can use this information to:

1. Auto-populate agent identity fields.
2. Cross-reference declared capabilities with requested intents.
3. Detect capability mismatches (agent claiming intents it doesn't list in its card).

## 10. Privacy Considerations

- Agents SHOULD disclose the minimum identity level required by the site's policy.
- Sites MUST NOT share agent identity information with third parties without the agent operator's consent.
- Agent-VC credentials SHOULD use selective disclosure to reveal only necessary claims.
- Agents using `did:key` identifiers can rotate keys to prevent cross-site tracking.
- Sites SHOULD NOT require Tier 3 verification for publicly accessible content.

## 11. Conformance

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be interpreted as described in [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119).
