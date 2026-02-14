/**
 * APoP v1.0 — Header Parsing & Building
 *
 * Parse incoming APoP agent request headers and build APoP response headers.
 *
 * Request headers (from agent):
 *   Agent-Name, Agent-Intent, Agent-Id, Agent-Signature, Agent-VC,
 *   Agent-Card, Agent-Key-Id
 *
 * Response headers (from server):
 *   Agent-Policy, Agent-Policy-Version, Agent-Policy-Status, Agent-Policy-Actions,
 *   Agent-Policy-Rate-Limit, Agent-Policy-Rate-Remaining, Agent-Policy-Rate-Reset,
 *   Agent-Policy-Verify, Agent-Policy-Verify-Endpoint, Retry-After
 */

import type {
  AgentRequestHeaders,
  AgentResponseHeaders,
  PolicyStatus,
  RateLimit,
  VerificationMethod,
} from "./types.js";

// ---------------------------------------------------------------------------
// Request Header Parsing
// ---------------------------------------------------------------------------

/** Lowercase header name → AgentRequestHeaders key mapping. */
const HEADER_MAP: Record<string, keyof AgentRequestHeaders> = {
  "agent-name": "agentName",
  "agent-intent": "agentIntent",
  "agent-id": "agentId",
  "agent-signature": "agentSignature",
  "agent-vc": "agentVC",
  "agent-card": "agentCard",
  "agent-key-id": "agentKeyId",
};

/**
 * Generic header getter — works with any request-like object.
 */
type HeaderGetter = (name: string) => string | string[] | undefined;

/**
 * Parse APoP agent request headers from an incoming HTTP request.
 *
 * Accepts either:
 *   - An object with a `.header(name)` or `.get(name)` method (Express, Koa, etc.)
 *   - A plain `Record<string, string>` (e.g. `req.headers`)
 *
 * @param source - Header source (request object or plain headers map).
 * @returns Parsed AgentRequestHeaders.
 */
export function parseRequestHeaders(
  source:
    | Record<string, string | string[] | undefined>
    | { header?: HeaderGetter; get?: HeaderGetter },
): AgentRequestHeaders {
  const get = (name: string): string | undefined => {
    if (typeof (source as any).header === "function") {
      const v = (source as any).header(name);
      return Array.isArray(v) ? v[0] : v;
    }
    if (typeof (source as any).get === "function") {
      const v = (source as any).get(name);
      return Array.isArray(v) ? v[0] : v;
    }
    // Plain object — try lower-case key
    const plain = source as Record<string, string | string[] | undefined>;
    const v = plain[name] ?? plain[name.toLowerCase()];
    return Array.isArray(v) ? v[0] : v;
  };

  const headers: AgentRequestHeaders = {};
  for (const [headerName, key] of Object.entries(HEADER_MAP)) {
    const value =
      get(headerName) ??
      get(
        headerName
          .split("-")
          .map((w, i) =>
            i === 0
              ? w.charAt(0).toUpperCase() + w.slice(1)
              : w.charAt(0).toUpperCase() + w.slice(1),
          )
          .join("-"),
      );
    if (value) {
      headers[key] = value;
    }
  }

  return headers;
}

/**
 * Check whether a request is from an APoP-aware agent
 * (i.e., has an Agent-Name header).
 */
export function isAgent(headers: AgentRequestHeaders): boolean {
  return !!headers.agentName;
}

/**
 * Parse the Agent-Intent header value into an array of intent strings.
 *
 * @param intentHeader - Raw Agent-Intent header value (comma-separated).
 * @returns Array of trimmed intent strings.
 */
export function parseIntents(intentHeader: string | undefined): string[] {
  if (!intentHeader) return [];
  return intentHeader
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

// ---------------------------------------------------------------------------
// Response Header Building
// ---------------------------------------------------------------------------

/**
 * Build the base discovery/version response headers that should be set on
 * every response from an APoP-aware server.
 */
export function buildDiscoveryHeaders(
  policyUrl?: string,
  version?: string,
): AgentResponseHeaders {
  const headers: AgentResponseHeaders = {
    "Agent-Policy-Version": version || "1.0",
  };
  if (policyUrl) {
    headers["Agent-Policy"] = policyUrl;
  }
  return headers;
}

/**
 * Build response headers for a successful (allowed) request.
 */
export function buildAllowedHeaders(opts: {
  policyUrl?: string;
  version?: string;
  actions?: string[];
  rateLimit?: RateLimit;
  rateRemaining?: number;
  rateReset?: string;
}): AgentResponseHeaders {
  const headers: AgentResponseHeaders = {
    ...buildDiscoveryHeaders(opts.policyUrl, opts.version),
    "Agent-Policy-Status": "allowed",
  };

  if (opts.actions && opts.actions.length > 0) {
    headers["Agent-Policy-Actions"] = opts.actions.join(", ");
  }

  if (opts.rateLimit) {
    headers["Agent-Policy-Rate-Limit"] =
      `${opts.rateLimit.requests}/${opts.rateLimit.window}`;
    headers["Agent-Policy-Rate-Remaining"] = (
      opts.rateRemaining ?? opts.rateLimit.requests
    ).toString();
    if (opts.rateReset) {
      headers["Agent-Policy-Rate-Reset"] = opts.rateReset;
    }
  }

  return headers;
}

/**
 * Build response headers for a denied (430) response.
 */
export function buildDeniedHeaders(opts: {
  policyUrl?: string;
  version?: string;
}): AgentResponseHeaders {
  return {
    ...buildDiscoveryHeaders(opts.policyUrl, opts.version),
    "Agent-Policy-Status": "denied",
  };
}

/**
 * Build response headers for a verification-required (439) response.
 */
export function buildVerificationHeaders(opts: {
  policyUrl?: string;
  version?: string;
  methods: VerificationMethod[];
  verifyEndpoint?: string;
}): AgentResponseHeaders {
  const headers: AgentResponseHeaders = {
    ...buildDiscoveryHeaders(opts.policyUrl, opts.version),
    "Agent-Policy-Status": "denied",
    "Agent-Policy-Verify": opts.methods.join(", "),
  };
  if (opts.verifyEndpoint) {
    headers["Agent-Policy-Verify-Endpoint"] = opts.verifyEndpoint;
  }
  return headers;
}

/**
 * Build response headers for a rate-limited (438) response.
 */
export function buildRateLimitedHeaders(opts: {
  policyUrl?: string;
  version?: string;
  rateLimit: RateLimit;
  retryAfter: number;
  rateReset?: string;
}): AgentResponseHeaders {
  return {
    ...buildDiscoveryHeaders(opts.policyUrl, opts.version),
    "Agent-Policy-Status": "denied",
    "Agent-Policy-Rate-Limit": `${opts.rateLimit.requests}/${opts.rateLimit.window}`,
    "Agent-Policy-Rate-Remaining": "0",
    "Retry-After": opts.retryAfter.toString(),
    ...(opts.rateReset ? { "Agent-Policy-Rate-Reset": opts.rateReset } : {}),
  };
}
