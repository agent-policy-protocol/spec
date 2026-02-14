/**
 * Tests for src/matcher.ts — Path matching engine.
 */
import { describe, it, expect } from "vitest";
import { pathMatches, matchPathPolicy, mergePolicy } from "../src/matcher.js";
import type { AgentPolicy, PolicyRule } from "../src/types.js";

describe("pathMatches", () => {
  describe("exact match", () => {
    it("should match identical paths", () => {
      expect(pathMatches("/foo", "/foo")).toBe(true);
    });

    it("should not match different paths", () => {
      expect(pathMatches("/foo", "/bar")).toBe(false);
    });

    it("should not match partial paths", () => {
      expect(pathMatches("/foo/bar", "/foo")).toBe(false);
    });

    it("should match root path", () => {
      expect(pathMatches("/", "/")).toBe(true);
    });
  });

  describe("single-segment glob (/*)", () => {
    it("should match one segment after prefix", () => {
      expect(pathMatches("/foo/bar", "/foo/*")).toBe(true);
    });

    it("should not match nested segments", () => {
      expect(pathMatches("/foo/bar/baz", "/foo/*")).toBe(false);
    });

    it("should not match the prefix itself", () => {
      expect(pathMatches("/foo", "/foo/*")).toBe(false);
    });

    it("should match root-level single segment", () => {
      expect(pathMatches("/bar", "/*")).toBe(true);
    });

    it("should not match multi-segment under root glob", () => {
      expect(pathMatches("/bar/baz", "/*")).toBe(false);
    });
  });

  describe("recursive glob (/**)", () => {
    it("should match one segment after prefix", () => {
      expect(pathMatches("/foo/bar", "/foo/**")).toBe(true);
    });

    it("should match nested segments", () => {
      expect(pathMatches("/foo/bar/baz", "/foo/**")).toBe(true);
    });

    it("should match deeply nested segments", () => {
      expect(pathMatches("/foo/a/b/c/d", "/foo/**")).toBe(true);
    });

    it("should match the prefix path itself", () => {
      expect(pathMatches("/foo", "/foo/**")).toBe(true);
    });

    it("should not match paths that dont start with prefix", () => {
      expect(pathMatches("/bar/foo/baz", "/foo/**")).toBe(false);
    });
  });

  describe("edge cases", () => {
    it("should handle paths with encoded characters", () => {
      expect(pathMatches("/foo/bar%20baz", "/foo/*")).toBe(true);
    });

    it("should handle empty path segments", () => {
      expect(pathMatches("/foo//bar", "/foo/*")).toBe(false);
    });
  });
});

describe("matchPathPolicy", () => {
  const policy: AgentPolicy = {
    version: "1.0",
    defaultPolicy: { allow: true },
    pathPolicies: [
      { path: "/public/*", allow: true, actions: ["read"] },
      { path: "/api/**", allow: true, actions: ["read", "api_call"] },
      { path: "/admin/*", allow: false },
    ],
  };

  it("should return first matching path policy", () => {
    const result = matchPathPolicy(policy, "/public/page");
    expect(result).not.toBeNull();
    expect(result!.path).toBe("/public/*");
  });

  it("should match recursive globs", () => {
    const result = matchPathPolicy(policy, "/api/v1/users");
    expect(result).not.toBeNull();
    expect(result!.path).toBe("/api/**");
  });

  it("should return null when no path matches", () => {
    const result = matchPathPolicy(policy, "/other/page");
    expect(result).toBeNull();
  });

  it("should return null when no pathPolicies exist", () => {
    const simplePolicy: AgentPolicy = {
      version: "1.0",
      defaultPolicy: { allow: true },
    };
    expect(matchPathPolicy(simplePolicy, "/any/path")).toBeNull();
  });

  it("should match first rule when multiple match", () => {
    const multiPolicy: AgentPolicy = {
      version: "1.0",
      defaultPolicy: { allow: true },
      pathPolicies: [
        { path: "/data/*", allow: true, actions: ["read"] },
        { path: "/data/**", allow: true, actions: ["read", "extract"] },
      ],
    };
    const result = matchPathPolicy(multiPolicy, "/data/file");
    expect(result!.actions).toEqual(["read"]); // First match wins
  });
});

describe("mergePolicy", () => {
  const defaultPolicy: PolicyRule = {
    allow: true,
    actions: ["read", "render"],
    rateLimit: { requests: 100, window: "hour" },
    requireVerification: false,
  };

  it("should return copy of default when no path rule", () => {
    const result = mergePolicy(defaultPolicy, null);
    expect(result).toEqual(defaultPolicy);
    expect(result).not.toBe(defaultPolicy); // Should be a new object
  });

  it("should override allow from path rule", () => {
    const result = mergePolicy(defaultPolicy, {
      path: "/admin/*",
      allow: false,
    });
    expect(result.allow).toBe(false);
  });

  it("should keep default allow when path rule has no allow", () => {
    const result = mergePolicy(defaultPolicy, {
      path: "/data/*",
      actions: ["read"],
    });
    expect(result.allow).toBe(true);
  });

  it("should override rateLimit from path rule", () => {
    const result = mergePolicy(defaultPolicy, {
      path: "/api/*",
      rateLimit: { requests: 1000, window: "day" },
    });
    expect(result.rateLimit).toEqual({ requests: 1000, window: "day" });
  });

  it("should fall back to default rateLimit when path has none", () => {
    const result = mergePolicy(defaultPolicy, {
      path: "/data/*",
    });
    expect(result.rateLimit).toEqual({ requests: 100, window: "hour" });
  });

  it("should override requireVerification from path rule", () => {
    const result = mergePolicy(defaultPolicy, {
      path: "/api/*",
      requireVerification: true,
    });
    expect(result.requireVerification).toBe(true);
  });

  it("should preserve agentAllowlist from path rule", () => {
    const result = mergePolicy(defaultPolicy, {
      path: "/api/*",
      agentAllowlist: ["did:web:agent.example.com"],
    });
    expect(result.agentAllowlist).toEqual(["did:web:agent.example.com"]);
  });

  it("should preserve agentDenylist from path rule", () => {
    const result = mergePolicy(defaultPolicy, {
      path: "/blocked/*",
      agentDenylist: ["did:web:bad.example.com"],
    });
    expect(result.agentDenylist).toEqual(["did:web:bad.example.com"]);
  });
});
