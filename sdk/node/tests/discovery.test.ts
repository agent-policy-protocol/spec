/**
 * Tests for src/discovery.ts — APoP policy discovery chain.
 */
import { describe, it, expect, vi } from "vitest";
import { discoverPolicy } from "../src/discovery.js";

const VALID_POLICY = JSON.stringify({
  version: "1.0",
  defaultPolicy: { allow: true },
});

/**
 * Helper: create a mock fetch function.
 */
function mockFetch(
  handlers: Record<
    string,
    { status: number; body: string; headers?: Record<string, string> }
  >,
) {
  return (
    url: string | URL | Request,
    _init?: RequestInit,
  ): Promise<Response> => {
    const urlStr =
      typeof url === "string"
        ? url
        : url instanceof URL
          ? url.toString()
          : url.url;
    const handler = handlers[urlStr];
    if (!handler) {
      return Promise.resolve(new Response("Not Found", { status: 404 }));
    }
    const responseHeaders = new Headers(handler.headers || {});
    return Promise.resolve(
      new Response(handler.body, {
        status: handler.status,
        headers: responseHeaders,
      }),
    );
  };
}

describe("discoverPolicy", () => {
  describe("well-known URI (step 1)", () => {
    it("should discover policy from well-known URI", async () => {
      const fetchImpl = mockFetch({
        "https://example.com/.well-known/agent-policy.json": {
          status: 200,
          body: VALID_POLICY,
        },
      });

      const result = await discoverPolicy("example.com", { fetchImpl });
      expect(result.policy).not.toBeNull();
      expect(result.method).toBe("well-known");
      expect(result.policyUrl).toBe(
        "https://example.com/.well-known/agent-policy.json",
      );
    });
  });

  describe("HTTP header (step 2)", () => {
    it("should discover policy from HTTP header when well-known returns 404", async () => {
      const policyUrl = "https://example.com/custom-policy.json";
      const fetchImpl = mockFetch({
        "https://example.com/.well-known/agent-policy.json": {
          status: 404,
          body: "Not Found",
        },
        "https://example.com/": {
          status: 200,
          body: "<html></html>",
          headers: { "Agent-Policy": policyUrl },
        },
        [policyUrl]: {
          status: 200,
          body: VALID_POLICY,
        },
      });

      const result = await discoverPolicy("example.com", { fetchImpl });
      expect(result.policy).not.toBeNull();
      expect(result.method).toBe("http-header");
      expect(result.policyUrl).toBe(policyUrl);
    });
  });

  describe("HTML meta tag (step 3)", () => {
    it("should discover policy from meta tag", async () => {
      const policyUrl = "https://example.com/meta-policy.json";
      const fetchImpl = mockFetch({
        "https://example.com/.well-known/agent-policy.json": {
          status: 404,
          body: "Not Found",
        },
        "https://example.com/": {
          status: 200,
          body: `<html><head><meta name="agent-policy" content="${policyUrl}"></head></html>`,
        },
        [policyUrl]: {
          status: 200,
          body: VALID_POLICY,
        },
      });

      const result = await discoverPolicy("example.com", { fetchImpl });
      expect(result.policy).not.toBeNull();
      expect(result.method).toBe("meta-tag");
    });
  });

  describe("DNS TXT record (step 4)", () => {
    it("should discover policy from DNS TXT record", async () => {
      const policyUrl = "https://example.com/dns-policy.json";
      const fetchImpl = mockFetch({
        "https://example.com/.well-known/agent-policy.json": {
          status: 404,
          body: "Not Found",
        },
        "https://example.com/": {
          status: 200,
          body: "<html><head></head></html>",
        },
        [policyUrl]: {
          status: 200,
          body: VALID_POLICY,
        },
      });

      const dnsResolve = async (_hostname: string, _rrtype: string) => {
        return [[`apop=1 v=1.0 policy=${policyUrl}`]];
      };

      const result = await discoverPolicy("example.com", {
        fetchImpl,
        dnsResolve,
      });
      expect(result.policy).not.toBeNull();
      expect(result.method).toBe("dns-txt");
    });
  });

  describe("no policy found", () => {
    it("should return null policy when all methods fail", async () => {
      const fetchImpl = mockFetch({
        "https://example.com/.well-known/agent-policy.json": {
          status: 404,
          body: "Not Found",
        },
        "https://example.com/": {
          status: 200,
          body: "<html><head></head></html>",
        },
      });

      const dnsResolve = async () => {
        throw new Error("ENOTFOUND");
      };

      const result = await discoverPolicy("example.com", {
        fetchImpl,
        dnsResolve,
      });
      expect(result.policy).toBeNull();
      expect(result.error).toBeDefined();
    });
  });

  describe("priority order", () => {
    it("should prefer well-known over HTTP header", async () => {
      const fetchImpl = mockFetch({
        "https://example.com/.well-known/agent-policy.json": {
          status: 200,
          body: VALID_POLICY,
        },
        "https://example.com/": {
          status: 200,
          body: "<html></html>",
          headers: { "Agent-Policy": "https://example.com/other.json" },
        },
      });

      const result = await discoverPolicy("example.com", { fetchImpl });
      expect(result.method).toBe("well-known");
    });
  });
});
