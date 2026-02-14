/**
 * Tests for src/middleware/express.ts — Express middleware adapter.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createExpressMiddleware,
  createDiscoveryEndpoint,
} from "../src/middleware/express.js";
import type { AgentPolicy } from "../src/types.js";
import type { NextFunction } from "express";

// Minimal mock types for Express req/res/next
interface MockReq {
  path: string;
  headers: Record<string, string>;
  header(name: string): string | undefined;
}

interface MockRes {
  statusCode: number;
  headers: Record<string, string>;
  body: unknown;
  set(key: string, value: string): void;
  status(code: number): MockRes;
  json(body: unknown): void;
}

function createMockReq(
  overrides: Partial<MockReq> & { path: string },
): MockReq {
  const headers = overrides.headers || {};
  return {
    path: overrides.path,
    headers,
    header(name: string) {
      return headers[name.toLowerCase()] || headers[name];
    },
  };
}

function createMockRes(): MockRes {
  const res: MockRes = {
    statusCode: 200,
    headers: {},
    body: null,
    set(key: string, value: string) {
      res.headers[key.toLowerCase()] = value;
    },
    status(code: number) {
      res.statusCode = code;
      return res;
    },
    json(body: unknown) {
      res.body = body;
    },
  };
  return res;
}

const TEST_POLICY: AgentPolicy = {
  version: "1.0",
  policyUrl: "https://example.com/.well-known/agent-policy.json",
  defaultPolicy: {
    allow: true,
    actions: ["read", "render"],
    rateLimit: { requests: 100, window: "hour" },
    requireVerification: false,
  },
  pathPolicies: [
    {
      path: "/admin/*",
      allow: false,
    },
    {
      path: "/api/*",
      allow: true,
      requireVerification: true,
      agentAllowlist: ["did:web:allowed.agent"],
    },
  ],
  verification: {
    method: "did",
    verificationEndpoint: "https://example.com/verify",
  },
};

describe("createExpressMiddleware", () => {
  let middleware: ReturnType<typeof createExpressMiddleware>;

  beforeEach(() => {
    middleware = createExpressMiddleware({ policy: TEST_POLICY });
  });

  it("should pass through non-agent requests", () => {
    const req = createMockReq({ path: "/page" });
    const res = createMockRes();
    const next = vi.fn() as unknown as NextFunction;

    middleware(req as any, res as any, next);

    expect(next).toHaveBeenCalled();
    expect(res.headers["agent-policy-version"]).toBe("1.0");
  });

  it("should allow agent request on permitted path", () => {
    const req = createMockReq({
      path: "/page",
      headers: { "agent-name": "Bot/1.0" },
    });
    const res = createMockRes();
    const next = vi.fn() as unknown as NextFunction;

    middleware(req as any, res as any, next);

    expect(next).toHaveBeenCalled();
    expect(res.headers["agent-policy-status"]).toBe("allowed");
  });

  it("should deny agent request on blocked path", () => {
    const req = createMockReq({
      path: "/admin/settings",
      headers: { "agent-name": "Bot/1.0" },
    });
    const res = createMockRes();
    const next = vi.fn() as unknown as NextFunction;

    middleware(req as any, res as any, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(430);
    expect((res.body as any).error).toBe("agent_action_not_allowed");
  });

  it("should require verification when policy demands it", () => {
    const req = createMockReq({
      path: "/api/data",
      headers: {
        "agent-name": "Bot/1.0",
        "agent-id": "did:web:allowed.agent",
      },
    });
    const res = createMockRes();
    const next = vi.fn() as unknown as NextFunction;

    middleware(req as any, res as any, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(439);
    expect((res.body as any).error).toBe("agent_verification_required");
  });

  it("should set policy URL header", () => {
    const req = createMockReq({
      path: "/",
      headers: { "agent-name": "Bot/1.0" },
    });
    const res = createMockRes();
    const next = vi.fn() as unknown as NextFunction;

    middleware(req as any, res as any, next);

    expect(res.headers["agent-policy"]).toBe(
      "https://example.com/.well-known/agent-policy.json",
    );
  });
});

describe("createDiscoveryEndpoint", () => {
  it("should serve the policy as JSON", () => {
    const handler = createDiscoveryEndpoint(TEST_POLICY);
    const req = createMockReq({ path: "/.well-known/agent-policy.json" });
    const res = createMockRes();

    handler(req as any, res as any, vi.fn() as unknown as NextFunction);

    expect(res.body).toEqual(TEST_POLICY);
    expect(res.headers["content-type"]).toBe("application/json");
    expect(res.headers["cache-control"]).toBe("public, max-age=3600");
  });
});
