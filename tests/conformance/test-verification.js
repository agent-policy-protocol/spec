/**
 * test-verification.js
 *
 * Tests 439 response when verification is required but not provided,
 * and proper behavior when verification credentials are present.
 */
import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { createApp, TEST_POLICY } from "./helpers.js";

describe("Verification — 439 Response", () => {
  let app;

  beforeAll(() => {
    app = createApp(TEST_POLICY);
  });

  it("should return 439 when requireVerification is true and no credentials", async () => {
    const res = await request(app)
      .get("/some-page")
      .set("Agent-Name", "TestBot");
    expect(res.status).toBe(439);
    expect(res.body.error).toBe("agent_verification_required");
  });

  it("should list accepted methods in 439 response", async () => {
    const res = await request(app)
      .get("/some-page")
      .set("Agent-Name", "TestBot");
    expect(res.body.acceptedMethods).toEqual(
      expect.arrayContaining(["did", "verifiable-credential", "pkix"])
    );
  });

  it("should include verifyEndpoint in 439 response", async () => {
    const res = await request(app)
      .get("/some-page")
      .set("Agent-Name", "TestBot");
    expect(res.body.verifyEndpoint).toBe("https://example.com/agent-verify");
  });

  it("should set Agent-Policy-Verify header listing methods", async () => {
    const res = await request(app)
      .get("/some-page")
      .set("Agent-Name", "TestBot");
    const verifyHeader = res.headers["agent-policy-verify"];
    expect(verifyHeader).toContain("did");
    expect(verifyHeader).toContain("verifiable-credential");
    expect(verifyHeader).toContain("pkix");
  });

  it("should set Agent-Policy-Verify-Endpoint header", async () => {
    const res = await request(app)
      .get("/some-page")
      .set("Agent-Name", "TestBot");
    expect(res.headers["agent-policy-verify-endpoint"]).toBe(
      "https://example.com/agent-verify"
    );
  });

  it("should set Agent-Policy-Status: denied on 439", async () => {
    const res = await request(app)
      .get("/some-page")
      .set("Agent-Name", "TestBot");
    expect(res.headers["agent-policy-status"]).toBe("denied");
  });
});

describe("Verification — Skipped When Not Required", () => {
  it("should not require verification when requireVerification is false", async () => {
    const res = await request(createApp(TEST_POLICY))
      .get("/public/article")
      .set("Agent-Name", "TestBot");
    expect(res.status).toBe(200);
    expect(res.headers["agent-policy-status"]).toBe("allowed");
  });

  it("should not require verification for policy with no verification config", async () => {
    const policy = {
      version: "1.0",
      defaultPolicy: {
        allow: true,
        actions: ["read"],
      },
    };
    const app = createApp(policy);
    const res = await request(app)
      .get("/test")
      .set("Agent-Name", "TestBot");
    expect(res.status).toBe(200);
  });
});

describe("Verification — Single Method", () => {
  it("should handle single verification method (not array)", async () => {
    const policy = {
      version: "1.0",
      policyUrl: "https://example.com/.well-known/agent-policy.json",
      defaultPolicy: {
        allow: true,
        requireVerification: true,
      },
      verification: {
        method: "pkix",
      },
    };
    const app = createApp(policy);
    const res = await request(app)
      .get("/test")
      .set("Agent-Name", "TestBot");
    expect(res.status).toBe(439);
    expect(res.body.acceptedMethods).toEqual(["pkix"]);
  });

  it("should default to pkix when method is not specified", async () => {
    const policy = {
      version: "1.0",
      defaultPolicy: {
        allow: true,
        requireVerification: true,
      },
    };
    const app = createApp(policy);
    const res = await request(app)
      .get("/test")
      .set("Agent-Name", "TestBot");
    expect(res.status).toBe(439);
    expect(res.body.acceptedMethods).toEqual(["pkix"]);
  });
});
