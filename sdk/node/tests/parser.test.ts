/**
 * Tests for src/parser.ts — APoP policy parsing and validation.
 */
import { describe, it, expect } from "vitest";
import { parsePolicy, validatePolicy, getSchema } from "../src/parser.js";

const VALID_MINIMAL_POLICY = JSON.stringify({
  version: "1.0",
  defaultPolicy: {
    allow: true,
  },
});

const VALID_FULL_POLICY = JSON.stringify({
  $schema: "https://agentpolicy.org/schema/v1/agent-policy.schema.json",
  version: "1.0",
  policyUrl: "https://example.com/.well-known/agent-policy.json",
  defaultPolicy: {
    allow: true,
    actions: ["read", "render"],
    disallow: ["extract"],
    rateLimit: { requests: 100, window: "hour" },
    requireVerification: false,
  },
  pathPolicies: [
    {
      path: "/public/*",
      allow: true,
      actions: ["read", "index", "summarize"],
      requireVerification: false,
    },
    {
      path: "/admin/*",
      allow: false,
    },
    {
      path: "/api/v1/*",
      allow: true,
      actions: ["read", "api_call"],
      requireVerification: true,
      rateLimit: { requests: 1000, window: "hour" },
      agentAllowlist: ["did:web:comet.perplexity.ai"],
    },
    {
      path: "/blocked/*",
      allow: true,
      agentDenylist: ["did:web:bad-agent.example.com"],
    },
  ],
  verification: {
    method: ["did", "verifiable-credential"],
    registry: "https://registry.agentpolicy.org",
    trustedIssuers: ["did:web:trust.agentpolicy.org"],
    verificationEndpoint: "https://example.com/agent-verify",
  },
  contact: {
    email: "security@example.com",
    policyUrl: "https://example.com/agent-policy",
    abuseUrl: "https://example.com/report-abuse",
  },
  metadata: {
    description: "Test policy",
    owner: "Test Corp",
    lastModified: "2026-02-14T00:00:00Z",
    license: "Apache-2.0",
  },
  interop: {
    a2aAgentCard: "https://example.com/.well-known/agent.json",
    mcpServerUrl: "https://example.com/mcp",
    webmcpEnabled: false,
  },
});

describe("parsePolicy", () => {
  it("should parse a valid minimal policy", () => {
    const result = parsePolicy(VALID_MINIMAL_POLICY);
    expect(result.valid).toBe(true);
    expect(result.policy).toBeDefined();
    expect(result.policy!.version).toBe("1.0");
    expect(result.policy!.defaultPolicy.allow).toBe(true);
  });

  it("should parse a valid full policy", () => {
    const result = parsePolicy(VALID_FULL_POLICY);
    expect(result.valid).toBe(true);
    expect(result.policy).toBeDefined();
    expect(result.policy!.pathPolicies).toHaveLength(4);
    expect(result.policy!.verification?.method).toEqual([
      "did",
      "verifiable-credential",
    ]);
  });

  it("should reject invalid JSON", () => {
    const result = parsePolicy("{not valid json}");
    expect(result.valid).toBe(false);
    expect(result.errors).toBeDefined();
    expect(result.errors![0].message).toContain("Invalid JSON");
  });

  it("should reject missing required fields", () => {
    const result = parsePolicy(JSON.stringify({ version: "1.0" }));
    expect(result.valid).toBe(false);
    expect(result.errors).toBeDefined();
  });

  it("should reject missing version", () => {
    const result = parsePolicy(
      JSON.stringify({ defaultPolicy: { allow: true } }),
    );
    expect(result.valid).toBe(false);
  });

  it("should reject invalid version", () => {
    const result = parsePolicy(
      JSON.stringify({ version: "2.0", defaultPolicy: { allow: true } }),
    );
    expect(result.valid).toBe(false);
  });

  it("should reject invalid action types", () => {
    const result = parsePolicy(
      JSON.stringify({
        version: "1.0",
        defaultPolicy: { allow: true, actions: ["read", "invalid_action"] },
      }),
    );
    expect(result.valid).toBe(false);
  });

  it("should reject invalid rate limit window", () => {
    const result = parsePolicy(
      JSON.stringify({
        version: "1.0",
        defaultPolicy: {
          allow: true,
          rateLimit: { requests: 100, window: "week" },
        },
      }),
    );
    expect(result.valid).toBe(false);
  });

  it("should reject unknown top-level properties", () => {
    const result = parsePolicy(
      JSON.stringify({
        version: "1.0",
        defaultPolicy: { allow: true },
        unknownField: "test",
      }),
    );
    expect(result.valid).toBe(false);
  });

  it("should accept allow as array of action types", () => {
    const result = parsePolicy(
      JSON.stringify({
        version: "1.0",
        defaultPolicy: { allow: ["read", "render"] },
      }),
    );
    expect(result.valid).toBe(true);
    expect(result.policy!.defaultPolicy.allow).toEqual(["read", "render"]);
  });

  it("should accept all 10 action types", () => {
    const actions = [
      "read",
      "index",
      "extract",
      "summarize",
      "render",
      "api_call",
      "form_submit",
      "automated_purchase",
      "tool_invoke",
      "all",
    ];
    const result = parsePolicy(
      JSON.stringify({
        version: "1.0",
        defaultPolicy: { allow: true, actions },
      }),
    );
    expect(result.valid).toBe(true);
  });

  it("should accept all 4 verification methods", () => {
    const result = parsePolicy(
      JSON.stringify({
        version: "1.0",
        defaultPolicy: { allow: true },
        verification: {
          method: ["pkix", "did", "verifiable-credential", "partner-token"],
        },
      }),
    );
    expect(result.valid).toBe(true);
  });

  it("should accept single verification method as string", () => {
    const result = parsePolicy(
      JSON.stringify({
        version: "1.0",
        defaultPolicy: { allow: true },
        verification: { method: "pkix" },
      }),
    );
    expect(result.valid).toBe(true);
  });
});

describe("validatePolicy", () => {
  it("should validate a parsed object", () => {
    const policy = {
      version: "1.0",
      defaultPolicy: { allow: true },
    };
    const result = validatePolicy(policy);
    expect(result.valid).toBe(true);
    expect(result.policy).toBeDefined();
  });

  it("should reject invalid objects", () => {
    const result = validatePolicy({ version: "1.0" });
    expect(result.valid).toBe(false);
  });
});

describe("getSchema", () => {
  it("should return the APoP JSON Schema", () => {
    const schema = getSchema();
    expect(schema.$schema).toBe("https://json-schema.org/draft/2020-12/schema");
    expect(schema.$id).toBe(
      "https://agentpolicy.org/schema/v1/agent-policy.schema.json",
    );
    expect(schema.required).toContain("version");
    expect(schema.required).toContain("defaultPolicy");
  });
});
