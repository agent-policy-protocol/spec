/**
 * test-allowlist-denylist.js
 *
 * Tests agentAllowlist and agentDenylist enforcement and precedence.
 */
import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { createApp, TEST_POLICY } from "./helpers.js";

describe("Allowlist Enforcement", () => {
  let app;

  beforeAll(() => {
    app = createApp(TEST_POLICY);
  });

  it("should allow agents on the allowlist", async () => {
    const res = await request(app)
      .get("/api/v1/data")
      .set("Agent-Name", "Perplexity Comet")
      .set("Agent-Id", "did:web:comet.perplexity.ai")
      .set("Agent-Signature", "sig");
    expect(res.status).toBe(200);
    expect(res.headers["agent-policy-status"]).toBe("allowed");
  });

  it("should allow second agent on the allowlist", async () => {
    const res = await request(app)
      .get("/api/v1/data")
      .set("Agent-Name", "Google Gemini")
      .set("Agent-Id", "did:web:gemini.google.com")
      .set("Agent-Signature", "sig");
    expect(res.status).toBe(200);
  });

  it("should deny agents NOT on the allowlist", async () => {
    const res = await request(app)
      .get("/api/v1/data")
      .set("Agent-Name", "RandomBot")
      .set("Agent-Id", "did:web:random.example.com")
      .set("Agent-Signature", "sig");
    expect(res.status).toBe(430);
    expect(res.body.error).toBe("agent_not_on_allowlist");
  });

  it("should deny agents without Agent-Id on allowlist paths", async () => {
    const res = await request(app)
      .get("/api/v1/data")
      .set("Agent-Name", "RandomBot")
      .set("Agent-Signature", "sig");
    expect(res.status).toBe(430);
    expect(res.body.error).toBe("agent_not_on_allowlist");
  });

  it("should include policy URL in allowlist denial", async () => {
    const res = await request(app)
      .get("/api/v1/data")
      .set("Agent-Name", "RandomBot")
      .set("Agent-Id", "did:web:random.example.com");
    expect(res.body.policy).toBe(
      "https://example.com/.well-known/agent-policy.json"
    );
  });
});

describe("Denylist Enforcement", () => {
  let app;

  beforeAll(() => {
    app = createApp(TEST_POLICY);
  });

  it("should deny agents on the denylist", async () => {
    const res = await request(app)
      .get("/blocked/resource")
      .set("Agent-Name", "BadBot")
      .set("Agent-Id", "did:web:bad-agent.example.com");
    expect(res.status).toBe(430);
    expect(res.body.error).toBe("agent_on_denylist");
  });

  it("should include agent ID in denylist denial message", async () => {
    const res = await request(app)
      .get("/blocked/resource")
      .set("Agent-Name", "BadBot")
      .set("Agent-Id", "did:web:bad-agent.example.com");
    expect(res.body.message).toContain("did:web:bad-agent.example.com");
  });

  it("should allow agents NOT on the denylist", async () => {
    const res = await request(app)
      .get("/blocked/resource")
      .set("Agent-Name", "GoodBot")
      .set("Agent-Id", "did:web:good-agent.example.com")
      .set("Agent-Signature", "sig");
    expect(res.status).toBe(200);
  });

  it("should not check denylist if Agent-Id is not provided", async () => {
    // Without Agent-Id, denylist cannot be checked, so request goes through other checks
    const res = await request(app)
      .get("/blocked/resource")
      .set("Agent-Name", "SomeBot")
      .set("Agent-Signature", "sig");
    expect(res.status).toBe(200);
  });
});

describe("Allowlist + Denylist Precedence", () => {
  it("should check denylist before allowlist", async () => {
    const policy = {
      version: "1.0",
      policyUrl: "https://example.com/.well-known/agent-policy.json",
      defaultPolicy: { allow: true },
      pathPolicies: [
        {
          path: "/restricted/*",
          allow: true,
          actions: ["read"],
          agentAllowlist: [
            "did:web:agent-a.example.com",
            "did:web:agent-b.example.com",
          ],
          agentDenylist: ["did:web:agent-b.example.com"],
        },
      ],
    };
    const app = createApp(policy);

    // agent-b is on both allowlist and denylist → denylist wins
    const res = await request(app)
      .get("/restricted/data")
      .set("Agent-Name", "AgentB")
      .set("Agent-Id", "did:web:agent-b.example.com");
    expect(res.status).toBe(430);
    expect(res.body.error).toBe("agent_on_denylist");
  });

  it("should allow agent on allowlist and not on denylist", async () => {
    const policy = {
      version: "1.0",
      policyUrl: "https://example.com/.well-known/agent-policy.json",
      defaultPolicy: { allow: true },
      pathPolicies: [
        {
          path: "/restricted/*",
          allow: true,
          actions: ["read"],
          agentAllowlist: [
            "did:web:agent-a.example.com",
            "did:web:agent-b.example.com",
          ],
          agentDenylist: ["did:web:agent-b.example.com"],
        },
      ],
    };
    const app = createApp(policy);

    const res = await request(app)
      .get("/restricted/data")
      .set("Agent-Name", "AgentA")
      .set("Agent-Id", "did:web:agent-a.example.com");
    expect(res.status).toBe(200);
  });
});
