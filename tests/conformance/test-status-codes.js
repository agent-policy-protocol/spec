/**
 * test-status-codes.js
 *
 * Verifies correct 430/438/439 responses with required headers and JSON body.
 */
import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { createApp, TEST_POLICY } from "./helpers.js";

describe("Status Codes — 430 Agent Action Not Allowed", () => {
  let app;

  beforeAll(() => {
    app = createApp(TEST_POLICY);
  });

  it("should return 430 when path is denied (allow: false)", async () => {
    const res = await request(app)
      .get("/admin/settings")
      .set("Agent-Name", "TestBot");
    expect(res.status).toBe(430);
  });

  it("should return JSON error body on 430", async () => {
    const res = await request(app)
      .get("/admin/settings")
      .set("Agent-Name", "TestBot");
    expect(res.body.error).toBe("agent_action_not_allowed");
    expect(res.body.message).toBeDefined();
    expect(res.body.path).toBe("/admin/settings");
  });

  it("should set Agent-Policy-Status: denied on 430", async () => {
    const res = await request(app)
      .get("/admin/settings")
      .set("Agent-Name", "TestBot");
    expect(res.headers["agent-policy-status"]).toBe("denied");
  });

  it("should return 430 when agent intent is disallowed", async () => {
    const res = await request(app)
      .get("/public/article")
      .set("Agent-Name", "TestBot")
      .set("Agent-Intent", "extract");
    expect(res.status).toBe(430);
    expect(res.body.error).toBe("agent_action_not_allowed");
  });

  it("should include policy URL in 430 response", async () => {
    const res = await request(app)
      .get("/admin/settings")
      .set("Agent-Name", "TestBot");
    expect(res.body.policy).toBe(
      "https://example.com/.well-known/agent-policy.json"
    );
  });
});

describe("Status Codes — 439 Agent Verification Required", () => {
  let app;

  beforeAll(() => {
    app = createApp(TEST_POLICY);
  });

  it("should return 439 when verification required but not provided", async () => {
    // Default policy requires verification; request a non-public path without credentials
    const res = await request(app)
      .get("/some-page")
      .set("Agent-Name", "TestBot");
    expect(res.status).toBe(439);
  });

  it("should return correct JSON body on 439", async () => {
    const res = await request(app)
      .get("/some-page")
      .set("Agent-Name", "TestBot");
    expect(res.body.error).toBe("agent_verification_required");
    expect(res.body.acceptedMethods).toBeInstanceOf(Array);
    expect(res.body.acceptedMethods).toContain("did");
    expect(res.body.acceptedMethods).toContain("verifiable-credential");
    expect(res.body.acceptedMethods).toContain("pkix");
  });

  it("should set Agent-Policy-Verify header on 439", async () => {
    const res = await request(app)
      .get("/some-page")
      .set("Agent-Name", "TestBot");
    expect(res.headers["agent-policy-verify"]).toBeDefined();
    expect(res.headers["agent-policy-verify"]).toContain("did");
  });

  it("should set Agent-Policy-Verify-Endpoint header on 439", async () => {
    const res = await request(app)
      .get("/some-page")
      .set("Agent-Name", "TestBot");
    expect(res.headers["agent-policy-verify-endpoint"]).toBe(
      "https://example.com/agent-verify"
    );
  });

  it("should include trustedIssuers in 439 body", async () => {
    const res = await request(app)
      .get("/some-page")
      .set("Agent-Name", "TestBot");
    expect(res.body.trustedIssuers).toContain(
      "did:web:trust.agentpolicy.org"
    );
  });

  it("should allow access when Agent-Signature is provided", async () => {
    const res = await request(app)
      .get("/some-page")
      .set("Agent-Name", "TestBot")
      .set("Agent-Signature", "sig-placeholder");
    expect(res.status).toBe(200);
    expect(res.headers["agent-policy-status"]).toBe("allowed");
  });

  it("should allow access when Agent-VC is provided", async () => {
    const res = await request(app)
      .get("/some-page")
      .set("Agent-Name", "TestBot")
      .set("Agent-VC", "vc-placeholder");
    expect(res.status).toBe(200);
    expect(res.headers["agent-policy-status"]).toBe("allowed");
  });
});

describe("Status Codes — 200 Allowed", () => {
  let app;

  beforeAll(() => {
    app = createApp(TEST_POLICY);
  });

  it("should return 200 for allowed paths without verification requirement", async () => {
    const res = await request(app)
      .get("/public/article")
      .set("Agent-Name", "TestBot");
    expect(res.status).toBe(200);
  });

  it("should set Agent-Policy-Status: allowed on success", async () => {
    const res = await request(app)
      .get("/public/article")
      .set("Agent-Name", "TestBot");
    expect(res.headers["agent-policy-status"]).toBe("allowed");
  });

  it("should pass through non-agent requests", async () => {
    const res = await request(app).get("/admin/settings");
    expect(res.status).toBe(200); // No Agent-Name header → not treated as agent
  });
});
