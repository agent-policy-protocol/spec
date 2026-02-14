/**
 * test-intent-enforcement.js
 *
 * Tests intent-based blocking, multi-intent requests, and disallow precedence.
 */
import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { createApp, TEST_POLICY } from "./helpers.js";

describe("Intent Enforcement — Single Intent", () => {
  let app;

  beforeAll(() => {
    app = createApp(TEST_POLICY);
  });

  it("should allow permitted intent on public path", async () => {
    const res = await request(app)
      .get("/public/article")
      .set("Agent-Name", "TestBot")
      .set("Agent-Intent", "read");
    expect(res.status).toBe(200);
  });

  it("should block disallowed intent (extract)", async () => {
    // defaultPolicy disallows extract; /public/* inherits disallow from default merge
    const res = await request(app)
      .get("/public/article")
      .set("Agent-Name", "TestBot")
      .set("Agent-Intent", "extract");
    expect(res.status).toBe(430);
    expect(res.body.error).toBe("agent_action_not_allowed");
  });

  it("should block disallowed intent (api_call) on default policy", async () => {
    const res = await request(app)
      .get("/public/article")
      .set("Agent-Name", "TestBot")
      .set("Agent-Intent", "api_call");
    expect(res.status).toBe(430);
  });

  it("should block disallowed intent (automated_purchase)", async () => {
    const res = await request(app)
      .get("/public/article")
      .set("Agent-Name", "TestBot")
      .set("Agent-Intent", "automated_purchase");
    expect(res.status).toBe(430);
  });

  it("should include blocked actions in error response", async () => {
    const res = await request(app)
      .get("/public/article")
      .set("Agent-Name", "TestBot")
      .set("Agent-Intent", "extract");
    expect(res.body.message).toContain("extract");
  });
});

describe("Intent Enforcement — Multi-Intent (comma-separated)", () => {
  let app;

  beforeAll(() => {
    app = createApp(TEST_POLICY);
  });

  it("should block if any intent in comma-separated list is disallowed", async () => {
    const res = await request(app)
      .get("/public/article")
      .set("Agent-Name", "TestBot")
      .set("Agent-Intent", "read, extract");
    expect(res.status).toBe(430);
    expect(res.body.message).toContain("extract");
  });

  it("should allow if all intents in comma-separated list are permitted", async () => {
    const res = await request(app)
      .get("/public/article")
      .set("Agent-Name", "TestBot")
      .set("Agent-Intent", "read, summarize");
    expect(res.status).toBe(200);
  });

  it("should list all blocked intents in error message", async () => {
    const res = await request(app)
      .get("/public/article")
      .set("Agent-Name", "TestBot")
      .set("Agent-Intent", "extract, api_call, automated_purchase");
    expect(res.status).toBe(430);
    expect(res.body.message).toContain("extract");
    expect(res.body.message).toContain("api_call");
    expect(res.body.message).toContain("automated_purchase");
  });
});

describe("Intent Enforcement — Disallow Precedence", () => {
  it("should block intent even if it appears in actions list (disallow wins)", async () => {
    const policy = {
      version: "1.0",
      defaultPolicy: {
        allow: true,
        actions: ["read", "extract"],
        disallow: ["extract"],
      },
    };
    const app = createApp(policy);
    const res = await request(app)
      .get("/test")
      .set("Agent-Name", "TestBot")
      .set("Agent-Intent", "extract");
    expect(res.status).toBe(430);
  });

  it("should allow intent not on disallow list", async () => {
    const policy = {
      version: "1.0",
      defaultPolicy: {
        allow: true,
        actions: ["read", "extract"],
        disallow: ["extract"],
      },
    };
    const app = createApp(policy);
    const res = await request(app)
      .get("/test")
      .set("Agent-Name", "TestBot")
      .set("Agent-Intent", "read");
    expect(res.status).toBe(200);
  });
});

describe("Intent Enforcement — No Agent-Intent Header", () => {
  let app;

  beforeAll(() => {
    app = createApp(TEST_POLICY);
  });

  it("should not block when no Agent-Intent header is sent (permissive)", async () => {
    const res = await request(app)
      .get("/public/article")
      .set("Agent-Name", "TestBot");
    expect(res.status).toBe(200);
    expect(res.headers["agent-policy-status"]).toBe("allowed");
  });
});

describe("Intent Enforcement — Path with no disallow", () => {
  it("should allow any intent if no disallow list on effective policy", async () => {
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
      .set("Agent-Name", "TestBot")
      .set("Agent-Intent", "extract");
    expect(res.status).toBe(200);
  });
});
