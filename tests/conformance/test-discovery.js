/**
 * test-discovery.js
 *
 * Tests the well-known URI discovery endpoint and response headers.
 * Validates that /.well-known/agent-policy.json returns the policy
 * and that Agent-Policy headers are present on all responses.
 */
import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { createApp, TEST_POLICY } from "./helpers.js";

describe("Discovery — Well-Known URI", () => {
  let app;

  beforeAll(() => {
    app = createApp(TEST_POLICY);
  });

  it("should serve policy at /.well-known/agent-policy.json", async () => {
    const res = await request(app).get("/.well-known/agent-policy.json");
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/json/);
    expect(res.body.version).toBe("1.0");
    expect(res.body.defaultPolicy).toBeDefined();
  });

  it("should return the full policy object", async () => {
    const res = await request(app).get("/.well-known/agent-policy.json");
    expect(res.body.pathPolicies).toBeDefined();
    expect(res.body.verification).toBeDefined();
    expect(res.body.contact).toBeDefined();
    expect(res.body.metadata).toBeDefined();
  });

  it("should include policyUrl in the response", async () => {
    const res = await request(app).get("/.well-known/agent-policy.json");
    expect(res.body.policyUrl).toBe(
      "https://example.com/.well-known/agent-policy.json"
    );
  });
});

describe("Discovery — HTTP Headers", () => {
  let app;

  beforeAll(() => {
    app = createApp(TEST_POLICY);
  });

  it("should set Agent-Policy header on all responses", async () => {
    const res = await request(app).get("/some-page");
    expect(res.headers["agent-policy"]).toBe(
      "https://example.com/.well-known/agent-policy.json"
    );
  });

  it("should set Agent-Policy-Version header on all responses", async () => {
    const res = await request(app).get("/some-page");
    expect(res.headers["agent-policy-version"]).toBe("1.0");
  });

  it("should set discovery headers even for non-agent requests", async () => {
    const res = await request(app).get("/");
    expect(res.headers["agent-policy"]).toBeDefined();
    expect(res.headers["agent-policy-version"]).toBe("1.0");
  });

  it("should set Agent-Policy-Status header for agent requests", async () => {
    const res = await request(app)
      .get("/public/article")
      .set("Agent-Name", "TestBot");
    expect(res.headers["agent-policy-status"]).toBeDefined();
  });
});

describe("Discovery — Policy Without policyUrl", () => {
  it("should not set Agent-Policy header if policyUrl is missing", async () => {
    const policy = {
      version: "1.0",
      defaultPolicy: { allow: true },
    };
    const app = createApp(policy);
    const res = await request(app).get("/");
    expect(res.headers["agent-policy"]).toBeUndefined();
    expect(res.headers["agent-policy-version"]).toBe("1.0");
  });
});
