/**
 * test-rate-limiting.js
 *
 * Tests rate limit headers in the response.
 * Note: The current middleware does not enforce actual rate counting — it
 * advertises limits via headers. This test validates the header values.
 */
import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { createApp, TEST_POLICY } from "./helpers.js";

describe("Rate Limiting — Headers", () => {
  let app;

  beforeAll(() => {
    app = createApp(TEST_POLICY);
  });

  it("should set Agent-Policy-Rate-Limit header for rate-limited paths", async () => {
    const res = await request(app)
      .get("/public/article")
      .set("Agent-Name", "TestBot");
    // /public/* inherits defaultPolicy rateLimit (100/hour)
    expect(res.headers["agent-policy-rate-limit"]).toBe("100/hour");
  });

  it("should set Agent-Policy-Rate-Remaining header", async () => {
    const res = await request(app)
      .get("/public/article")
      .set("Agent-Name", "TestBot");
    expect(res.headers["agent-policy-rate-remaining"]).toBe("100");
  });

  it("should use path-specific rate limit when defined", async () => {
    const res = await request(app)
      .get("/api/v1/data")
      .set("Agent-Name", "Perplexity Comet")
      .set("Agent-Id", "did:web:comet.perplexity.ai")
      .set("Agent-Signature", "sig");
    expect(res.headers["agent-policy-rate-limit"]).toBe("1000/hour");
    expect(res.headers["agent-policy-rate-remaining"]).toBe("1000");
  });

  it("should not set rate limit headers if no rate limit is defined", async () => {
    const policy = {
      version: "1.0",
      defaultPolicy: {
        allow: true,
        actions: ["read"],
      },
    };
    const app = createApp(policy);
    const res = await request(app)
      .get("/some-path")
      .set("Agent-Name", "TestBot");
    expect(res.headers["agent-policy-rate-limit"]).toBeUndefined();
    expect(res.headers["agent-policy-rate-remaining"]).toBeUndefined();
  });
});

describe("Rate Limiting — Various Windows", () => {
  it("should advertise minute-based rate limits", async () => {
    const policy = {
      version: "1.0",
      defaultPolicy: {
        allow: true,
        rateLimit: { requests: 30, window: "minute" },
      },
    };
    const app = createApp(policy);
    const res = await request(app)
      .get("/test")
      .set("Agent-Name", "TestBot");
    expect(res.headers["agent-policy-rate-limit"]).toBe("30/minute");
  });

  it("should advertise day-based rate limits", async () => {
    const policy = {
      version: "1.0",
      defaultPolicy: {
        allow: true,
        rateLimit: { requests: 10000, window: "day" },
      },
    };
    const app = createApp(policy);
    const res = await request(app)
      .get("/test")
      .set("Agent-Name", "TestBot");
    expect(res.headers["agent-policy-rate-limit"]).toBe("10000/day");
  });
});
