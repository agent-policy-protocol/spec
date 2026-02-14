/**
 * Tests for src/headers.ts — APoP header parsing and building.
 */
import { describe, it, expect } from "vitest";
import {
  parseRequestHeaders,
  isAgent,
  parseIntents,
  buildDiscoveryHeaders,
  buildAllowedHeaders,
  buildDeniedHeaders,
  buildVerificationHeaders,
  buildRateLimitedHeaders,
} from "../src/headers.js";

describe("parseRequestHeaders", () => {
  it("should parse headers from a plain object (lowercase)", () => {
    const headers = parseRequestHeaders({
      "agent-name": "TestBot/1.0",
      "agent-intent": "read, summarize",
      "agent-id": "did:web:test.example.com",
      "agent-signature": "sig123",
      "agent-vc": "vc456",
      "agent-card": "https://test.example.com/.well-known/agent.json",
      "agent-key-id": "did:web:test.example.com#key-1",
    });

    expect(headers.agentName).toBe("TestBot/1.0");
    expect(headers.agentIntent).toBe("read, summarize");
    expect(headers.agentId).toBe("did:web:test.example.com");
    expect(headers.agentSignature).toBe("sig123");
    expect(headers.agentVC).toBe("vc456");
    expect(headers.agentCard).toBe(
      "https://test.example.com/.well-known/agent.json",
    );
    expect(headers.agentKeyId).toBe("did:web:test.example.com#key-1");
  });

  it("should return empty object for missing headers", () => {
    const headers = parseRequestHeaders({});
    expect(headers.agentName).toBeUndefined();
    expect(headers.agentIntent).toBeUndefined();
  });

  it("should parse from object with .header() method (Express-like)", () => {
    const req = {
      header(name: string) {
        const map: Record<string, string> = {
          "agent-name": "ExpressBot/2.0",
          "agent-intent": "read",
        };
        return map[name.toLowerCase()];
      },
    };
    const headers = parseRequestHeaders(req);
    expect(headers.agentName).toBe("ExpressBot/2.0");
    expect(headers.agentIntent).toBe("read");
  });
});

describe("isAgent", () => {
  it("should return true when agentName is present", () => {
    expect(isAgent({ agentName: "Bot/1.0" })).toBe(true);
  });

  it("should return false when agentName is missing", () => {
    expect(isAgent({})).toBe(false);
  });

  it("should return false when agentName is empty string", () => {
    expect(isAgent({ agentName: "" })).toBe(false);
  });
});

describe("parseIntents", () => {
  it("should parse comma-separated intents", () => {
    expect(parseIntents("read, summarize, index")).toEqual([
      "read",
      "summarize",
      "index",
    ]);
  });

  it("should handle single intent", () => {
    expect(parseIntents("read")).toEqual(["read"]);
  });

  it("should return empty array for undefined", () => {
    expect(parseIntents(undefined)).toEqual([]);
  });

  it("should return empty array for empty string", () => {
    expect(parseIntents("")).toEqual([]);
  });

  it("should trim whitespace", () => {
    expect(parseIntents("  read , summarize  ")).toEqual(["read", "summarize"]);
  });
});

describe("buildDiscoveryHeaders", () => {
  it("should include policy URL and version", () => {
    const headers = buildDiscoveryHeaders(
      "https://example.com/.well-known/agent-policy.json",
      "1.0",
    );
    expect(headers["Agent-Policy"]).toBe(
      "https://example.com/.well-known/agent-policy.json",
    );
    expect(headers["Agent-Policy-Version"]).toBe("1.0");
  });

  it("should default version to 1.0", () => {
    const headers = buildDiscoveryHeaders();
    expect(headers["Agent-Policy-Version"]).toBe("1.0");
    expect(headers["Agent-Policy"]).toBeUndefined();
  });
});

describe("buildAllowedHeaders", () => {
  it("should set status to allowed with actions and rate limit", () => {
    const headers = buildAllowedHeaders({
      policyUrl: "https://example.com/.well-known/agent-policy.json",
      version: "1.0",
      actions: ["read", "render"],
      rateLimit: { requests: 100, window: "hour" },
    });
    expect(headers["Agent-Policy-Status"]).toBe("allowed");
    expect(headers["Agent-Policy-Actions"]).toBe("read, render");
    expect(headers["Agent-Policy-Rate-Limit"]).toBe("100/hour");
    expect(headers["Agent-Policy-Rate-Remaining"]).toBe("100");
  });

  it("should omit actions if empty", () => {
    const headers = buildAllowedHeaders({
      actions: [],
    });
    expect(headers["Agent-Policy-Actions"]).toBeUndefined();
  });
});

describe("buildDeniedHeaders", () => {
  it("should set status to denied", () => {
    const headers = buildDeniedHeaders({
      policyUrl: "https://example.com/.well-known/agent-policy.json",
    });
    expect(headers["Agent-Policy-Status"]).toBe("denied");
  });
});

describe("buildVerificationHeaders", () => {
  it("should set verify methods and endpoint", () => {
    const headers = buildVerificationHeaders({
      methods: ["did", "verifiable-credential"],
      verifyEndpoint: "https://example.com/agent-verify",
    });
    expect(headers["Agent-Policy-Status"]).toBe("denied");
    expect(headers["Agent-Policy-Verify"]).toBe("did, verifiable-credential");
    expect(headers["Agent-Policy-Verify-Endpoint"]).toBe(
      "https://example.com/agent-verify",
    );
  });

  it("should omit endpoint if not provided", () => {
    const headers = buildVerificationHeaders({
      methods: ["pkix"],
    });
    expect(headers["Agent-Policy-Verify-Endpoint"]).toBeUndefined();
  });
});

describe("buildRateLimitedHeaders", () => {
  it("should set rate limit info with retry-after", () => {
    const headers = buildRateLimitedHeaders({
      rateLimit: { requests: 100, window: "hour" },
      retryAfter: 60,
      rateReset: "2026-02-14T11:00:00Z",
    });
    expect(headers["Agent-Policy-Status"]).toBe("denied");
    expect(headers["Agent-Policy-Rate-Limit"]).toBe("100/hour");
    expect(headers["Agent-Policy-Rate-Remaining"]).toBe("0");
    expect(headers["Retry-After"]).toBe("60");
    expect(headers["Agent-Policy-Rate-Reset"]).toBe("2026-02-14T11:00:00Z");
  });
});
