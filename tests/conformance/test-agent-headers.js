/**
 * test-agent-headers.js
 *
 * Tests Agent-Name, Agent-Intent, Agent-Id, Agent-Signature, Agent-VC parsing.
 * Validates that the middleware correctly reads and acts on agent headers.
 */
import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { createApp, TEST_POLICY } from "./helpers.js";

describe("Agent Headers — Agent-Name", () => {
  let app;

  beforeAll(() => {
    app = createApp(TEST_POLICY);
  });

  it("should treat requests with Agent-Name as agent requests", async () => {
    const res = await request(app)
      .get("/public/article")
      .set("Agent-Name", "TestBot");
    expect(res.headers["agent-policy-status"]).toBeDefined();
  });

  it("should NOT treat requests without Agent-Name as agent requests", async () => {
    const res = await request(app).get("/public/article");
    // Non-agent request should pass through without Agent-Policy-Status
    expect(res.headers["agent-policy-status"]).toBeUndefined();
    expect(res.status).toBe(200);
  });

  it("should process requests with empty Agent-Name as agent requests", async () => {
    const res = await request(app)
      .get("/public/article")
      .set("Agent-Name", "");
    // Even empty Agent-Name means the header is present
    expect(res.headers["agent-policy-status"]).toBeDefined();
  });
});

describe("Agent Headers — Agent-Intent", () => {
  let app;

  beforeAll(() => {
    app = createApp(TEST_POLICY);
  });

  it("should allow requests with permitted intent", async () => {
    const res = await request(app)
      .get("/public/article")
      .set("Agent-Name", "TestBot")
      .set("Agent-Intent", "read");
    expect(res.status).toBe(200);
  });

  it("should block requests with disallowed intent", async () => {
    // Default policy disallows 'extract'
    const res = await request(app)
      .get("/public/article")
      .set("Agent-Name", "TestBot")
      .set("Agent-Intent", "extract");
    expect(res.status).toBe(430);
    expect(res.body.error).toBe("agent_action_not_allowed");
  });

  it("should allow requests without Agent-Intent header", async () => {
    const res = await request(app)
      .get("/public/article")
      .set("Agent-Name", "TestBot");
    expect(res.status).toBe(200);
  });
});

describe("Agent Headers — Agent-Id", () => {
  let app;

  beforeAll(() => {
    app = createApp(TEST_POLICY);
  });

  it("should use Agent-Id for allowlist checking", async () => {
    const res = await request(app)
      .get("/api/v1/data")
      .set("Agent-Name", "Perplexity Comet")
      .set("Agent-Id", "did:web:comet.perplexity.ai")
      .set("Agent-Signature", "sig");
    expect(res.status).toBe(200);
  });

  it("should deny access without Agent-Id on allowlist paths", async () => {
    const res = await request(app)
      .get("/api/v1/data")
      .set("Agent-Name", "TestBot");
    expect(res.status).toBe(430);
    expect(res.body.error).toBe("agent_not_on_allowlist");
  });
});

describe("Agent Headers — Agent-Signature & Agent-VC", () => {
  let app;

  beforeAll(() => {
    app = createApp(TEST_POLICY);
  });

  it("should accept Agent-Signature as verification credential", async () => {
    const res = await request(app)
      .get("/some-protected-page")
      .set("Agent-Name", "TestBot")
      .set("Agent-Signature", "valid-signature-placeholder");
    expect(res.status).toBe(200);
    expect(res.headers["agent-policy-status"]).toBe("allowed");
  });

  it("should accept Agent-VC as verification credential", async () => {
    const res = await request(app)
      .get("/some-protected-page")
      .set("Agent-Name", "TestBot")
      .set("Agent-VC", "valid-vc-placeholder");
    expect(res.status).toBe(200);
    expect(res.headers["agent-policy-status"]).toBe("allowed");
  });

  it("should require either Agent-Signature or Agent-VC for verified paths", async () => {
    const res = await request(app)
      .get("/some-protected-page")
      .set("Agent-Name", "TestBot");
    expect(res.status).toBe(439);
  });
});
