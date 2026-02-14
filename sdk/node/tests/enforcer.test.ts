/**
 * Tests for src/enforcer.ts — APoP policy enforcement engine.
 */
import { describe, it, expect } from "vitest";
import { enforce } from "../src/enforcer.js";
import type { AgentPolicy, RequestContext } from "../src/types.js";

const TEST_POLICY: AgentPolicy = {
  version: "1.0",
  policyUrl: "https://example.com/.well-known/agent-policy.json",
  defaultPolicy: {
    allow: true,
    actions: ["read", "render"],
    disallow: ["extract", "automated_purchase"],
    rateLimit: { requests: 100, window: "hour" },
    requireVerification: true,
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
      agentAllowlist: [
        "did:web:comet.perplexity.ai",
        "did:web:gemini.google.com",
      ],
    },
    {
      path: "/blocked/*",
      allow: true,
      actions: ["read"],
      agentDenylist: ["did:web:bad-agent.example.com"],
    },
    {
      path: "/deep/nested/**",
      allow: true,
      actions: ["read", "summarize"],
      requireVerification: false,
    },
  ],
  verification: {
    method: ["did", "verifiable-credential", "pkix"],
    registry: "https://registry.agentpolicy.org",
    trustedIssuers: ["did:web:trust.agentpolicy.org"],
    verificationEndpoint: "https://example.com/agent-verify",
  },
};

describe("enforce", () => {
  describe("allowed requests", () => {
    it("should allow verified agent on public path", () => {
      const result = enforce(TEST_POLICY, {
        path: "/public/page",
        agentName: "TestBot/1.0",
        agentIntent: "read",
      });
      expect(result.status).toBe("allowed");
      expect(result.httpStatus).toBe(200);
      expect(result.headers["Agent-Policy-Status"]).toBe("allowed");
    });

    it("should allow on deep nested path", () => {
      const result = enforce(TEST_POLICY, {
        path: "/deep/nested/a/b/c",
        agentName: "Bot/1.0",
        agentIntent: "read",
      });
      expect(result.status).toBe("allowed");
      expect(result.httpStatus).toBe(200);
    });

    it("should set rate limit headers", () => {
      const result = enforce(TEST_POLICY, {
        path: "/public/page",
        agentName: "Bot/1.0",
      });
      expect(result.status).toBe("allowed");
      expect(result.headers["Agent-Policy-Rate-Limit"]).toBe("100/hour");
    });

    it("should set action headers", () => {
      const result = enforce(TEST_POLICY, {
        path: "/public/page",
        agentName: "Bot/1.0",
      });
      expect(result.headers["Agent-Policy-Actions"]).toBe(
        "read, index, summarize",
      );
    });

    it("should set policy URL header", () => {
      const result = enforce(TEST_POLICY, {
        path: "/public/page",
        agentName: "Bot/1.0",
      });
      expect(result.headers["Agent-Policy"]).toBe(
        "https://example.com/.well-known/agent-policy.json",
      );
    });
  });

  describe("denylist enforcement", () => {
    it("should deny agent on denylist", () => {
      const result = enforce(TEST_POLICY, {
        path: "/blocked/page",
        agentName: "BadBot/1.0",
        agentId: "did:web:bad-agent.example.com",
      });
      expect(result.status).toBe("denied");
      expect(result.httpStatus).toBe(430);
      expect(result.body?.error).toBe("agent_on_denylist");
    });

    it("should allow agent not on denylist", () => {
      const result = enforce(TEST_POLICY, {
        path: "/blocked/page",
        agentName: "GoodBot/1.0",
        agentId: "did:web:good-agent.example.com",
        agentSignature: "valid-sig",
      });
      expect(result.status).toBe("allowed");
      expect(result.httpStatus).toBe(200);
    });
  });

  describe("allowlist enforcement", () => {
    it("should deny agent not on allowlist", () => {
      const result = enforce(TEST_POLICY, {
        path: "/api/v1/data",
        agentName: "RandomBot/1.0",
        agentId: "did:web:random.example.com",
        agentSignature: "valid-sig",
      });
      expect(result.status).toBe("denied");
      expect(result.httpStatus).toBe(430);
      expect(result.body?.error).toBe("agent_not_on_allowlist");
    });

    it("should allow agent on allowlist with verification", () => {
      const result = enforce(TEST_POLICY, {
        path: "/api/v1/data",
        agentName: "Comet/1.0",
        agentId: "did:web:comet.perplexity.ai",
        agentSignature: "valid-sig",
      });
      expect(result.status).toBe("allowed");
      expect(result.httpStatus).toBe(200);
    });

    it("should deny agent on allowlist without any id", () => {
      const result = enforce(TEST_POLICY, {
        path: "/api/v1/data",
        agentName: "NoIdBot/1.0",
      });
      expect(result.status).toBe("denied");
      expect(result.httpStatus).toBe(430);
      expect(result.body?.error).toBe("agent_not_on_allowlist");
    });
  });

  describe("access denied (allow: false)", () => {
    it("should deny access on blocked paths", () => {
      const result = enforce(TEST_POLICY, {
        path: "/admin/settings",
        agentName: "Bot/1.0",
        agentSignature: "valid-sig",
      });
      expect(result.status).toBe("denied");
      expect(result.httpStatus).toBe(430);
      expect(result.body?.error).toBe("agent_action_not_allowed");
    });
  });

  describe("intent-based enforcement", () => {
    it("should deny blocked intent", () => {
      const result = enforce(TEST_POLICY, {
        path: "/public/page",
        agentName: "Bot/1.0",
        agentIntent: "extract",
      });
      expect(result.status).toBe("denied");
      expect(result.httpStatus).toBe(430);
      expect(result.body?.error).toBe("agent_action_not_allowed");
    });

    it("should deny if any intent in comma-separated list is blocked", () => {
      const result = enforce(TEST_POLICY, {
        path: "/public/page",
        agentName: "Bot/1.0",
        agentIntent: "read, extract",
      });
      expect(result.status).toBe("denied");
      expect(result.httpStatus).toBe(430);
    });

    it("should allow permitted intents", () => {
      const result = enforce(TEST_POLICY, {
        path: "/public/page",
        agentName: "Bot/1.0",
        agentIntent: "read, summarize",
      });
      expect(result.status).toBe("allowed");
    });

    it("should allow when no intent is provided", () => {
      const result = enforce(TEST_POLICY, {
        path: "/public/page",
        agentName: "Bot/1.0",
      });
      expect(result.status).toBe("allowed");
    });
  });

  describe("verification enforcement", () => {
    it("should require verification when requireVerification is true", () => {
      const result = enforce(TEST_POLICY, {
        path: "/some/path",
        agentName: "Bot/1.0",
        agentIntent: "read",
      });
      // Default policy has requireVerification: true
      expect(result.status).toBe("verification-required");
      expect(result.httpStatus).toBe(439);
      expect(result.body?.error).toBe("agent_verification_required");
      expect(result.body?.acceptedMethods).toEqual([
        "did",
        "verifiable-credential",
        "pkix",
      ]);
    });

    it("should set verify headers on 439", () => {
      const result = enforce(TEST_POLICY, {
        path: "/some/path",
        agentName: "Bot/1.0",
      });
      expect(result.headers["Agent-Policy-Verify"]).toBe(
        "did, verifiable-credential, pkix",
      );
      expect(result.headers["Agent-Policy-Verify-Endpoint"]).toBe(
        "https://example.com/agent-verify",
      );
    });

    it("should allow verified agent (with signature)", () => {
      const result = enforce(TEST_POLICY, {
        path: "/some/path",
        agentName: "Bot/1.0",
        agentIntent: "read",
        agentSignature: "eyJhbGciOiJFZERTQSJ9...",
      });
      expect(result.status).toBe("allowed");
      expect(result.httpStatus).toBe(200);
    });

    it("should allow verified agent (with VC)", () => {
      const result = enforce(TEST_POLICY, {
        path: "/some/path",
        agentName: "Bot/1.0",
        agentIntent: "read",
        agentVC: "eyJhbGciOiJFUzI1NiJ9...",
      });
      expect(result.status).toBe("allowed");
      expect(result.httpStatus).toBe(200);
    });

    it("should not require verification when path overrides to false", () => {
      const result = enforce(TEST_POLICY, {
        path: "/public/page",
        agentName: "Bot/1.0",
        agentIntent: "read",
      });
      expect(result.status).toBe("allowed");
      expect(result.httpStatus).toBe(200);
    });
  });

  describe("default policy fallback", () => {
    it("should use default policy for unmatched paths", () => {
      // Default policy requires verification
      const result = enforce(TEST_POLICY, {
        path: "/unknown/path",
        agentName: "Bot/1.0",
      });
      expect(result.status).toBe("verification-required");
      expect(result.httpStatus).toBe(439);
    });
  });

  describe("enforcement order", () => {
    it("should check denylist before allowlist", () => {
      // Create policy where agent is on both lists
      const policy: AgentPolicy = {
        version: "1.0",
        defaultPolicy: { allow: true },
        pathPolicies: [
          {
            path: "/test/*",
            allow: true,
            agentDenylist: ["did:web:agent.test"],
            agentAllowlist: ["did:web:agent.test"],
          },
        ],
      };
      const result = enforce(policy, {
        path: "/test/page",
        agentId: "did:web:agent.test",
      });
      expect(result.status).toBe("denied");
      expect(result.body?.error).toBe("agent_on_denylist");
    });

    it("should check allow before intent", () => {
      const result = enforce(TEST_POLICY, {
        path: "/admin/settings",
        agentName: "Bot/1.0",
        agentIntent: "extract", // Would also be blocked by intent
        agentSignature: "valid",
      });
      expect(result.body?.error).toBe("agent_action_not_allowed");
      expect(result.body?.message).toBe(
        "Access is not permitted on this path.",
      );
    });
  });

  describe("minimal policy", () => {
    it("should allow everything with minimal allow-all policy", () => {
      const policy: AgentPolicy = {
        version: "1.0",
        defaultPolicy: { allow: true },
      };
      const result = enforce(policy, {
        path: "/any/path",
        agentName: "Bot/1.0",
        agentIntent: "read",
      });
      expect(result.status).toBe("allowed");
      expect(result.httpStatus).toBe(200);
    });

    it("should deny everything with minimal deny-all policy", () => {
      const policy: AgentPolicy = {
        version: "1.0",
        defaultPolicy: { allow: false },
      };
      const result = enforce(policy, {
        path: "/any/path",
        agentName: "Bot/1.0",
      });
      expect(result.status).toBe("denied");
      expect(result.httpStatus).toBe(430);
    });
  });
});
