/**
 * test-path-matching.js
 *
 * Tests glob matching: /*, /**, exact path, edge cases.
 */
import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { createApp, TEST_POLICY, pathMatches } from "./helpers.js";

describe("Path Matching — pathMatches() unit tests", () => {
  it("should match exact paths", () => {
    expect(pathMatches("/admin", "/admin")).toBe(true);
    expect(pathMatches("/admin", "/other")).toBe(false);
  });

  it("should match /* (single segment wildcard)", () => {
    expect(pathMatches("/public/article", "/public/*")).toBe(true);
    expect(pathMatches("/public/123", "/public/*")).toBe(true);
  });

  it("should NOT match /* for deeper paths", () => {
    expect(pathMatches("/public/article/comments", "/public/*")).toBe(false);
  });

  it("should match /** (multi-segment wildcard)", () => {
    expect(pathMatches("/deep/nested/a", "/deep/nested/**")).toBe(true);
    expect(pathMatches("/deep/nested/a/b/c", "/deep/nested/**")).toBe(true);
    expect(pathMatches("/deep/nested/", "/deep/nested/**")).toBe(true);
  });

  it("should NOT match /** for unrelated prefix", () => {
    expect(pathMatches("/other/path", "/deep/nested/**")).toBe(false);
  });

  it("should NOT match /** when path shares prefix but not segment boundary", () => {
    expect(pathMatches("/deep/nestedXYZ", "/deep/nested/**")).toBe(false);
  });

  it("should match /** for exact prefix path (without trailing slash)", () => {
    expect(pathMatches("/deep/nested", "/deep/nested/**")).toBe(true);
  });

  it("should handle root path patterns", () => {
    expect(pathMatches("/", "/")).toBe(true);
    expect(pathMatches("/anything", "/")).toBe(false);
  });

  it("should not match /* without a segment after prefix", () => {
    // /public/* expects /public/{segment} — not /public alone
    expect(pathMatches("/public", "/public/*")).toBe(false);
  });
});

describe("Path Matching — Integration tests via middleware", () => {
  let app;

  beforeAll(() => {
    app = createApp(TEST_POLICY);
  });

  it("should apply path policy for /public/* (single segment)", async () => {
    const res = await request(app)
      .get("/public/article")
      .set("Agent-Name", "TestBot");
    expect(res.status).toBe(200);
    expect(res.headers["agent-policy-status"]).toBe("allowed");
  });

  it("should NOT match /public/* for nested paths", async () => {
    // /public/article/extra doesn't match /public/* so falls to defaultPolicy
    // defaultPolicy requires verification
    const res = await request(app)
      .get("/public/article/extra")
      .set("Agent-Name", "TestBot");
    expect(res.status).toBe(439); // Hits default policy (requireVerification: true)
  });

  it("should apply path policy for /** (deep match)", async () => {
    const res = await request(app)
      .get("/deep/nested/a/b/c")
      .set("Agent-Name", "TestBot");
    expect(res.status).toBe(200);
    expect(res.headers["agent-policy-status"]).toBe("allowed");
  });

  it("should deny /admin/* paths", async () => {
    const res = await request(app)
      .get("/admin/dashboard")
      .set("Agent-Name", "TestBot");
    expect(res.status).toBe(430);
  });

  it("should deny /api/private/* paths", async () => {
    const res = await request(app)
      .get("/api/private/data")
      .set("Agent-Name", "TestBot");
    expect(res.status).toBe(430);
  });

  it("should fall back to defaultPolicy for unmatched paths", async () => {
    // /unknown doesn't match any pathPolicy, goes to defaultPolicy
    // defaultPolicy requires verification
    const res = await request(app)
      .get("/unknown")
      .set("Agent-Name", "TestBot");
    expect(res.status).toBe(439);
  });

  it("should use first matching path policy (order matters)", async () => {
    // Both /api/private/* and /api/v1/* have path rules
    // Requests to /api/private/secret should hit the private rule first
    const res = await request(app)
      .get("/api/private/secret")
      .set("Agent-Name", "TestBot");
    expect(res.status).toBe(430); // /api/private/* is allow: false
  });
});
