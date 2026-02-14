/**
 * APoP v1.0 — TypeScript Type Definitions
 *
 * Generated from spec/schema/agent-policy.schema.json
 * All types use camelCase per SDK conventions.
 */

// ---------------------------------------------------------------------------
// Enums & Literals
// ---------------------------------------------------------------------------

/**
 * Standardized action types that an agent may perform.
 */
export type ActionType =
  | "read"
  | "index"
  | "extract"
  | "summarize"
  | "render"
  | "api_call"
  | "form_submit"
  | "automated_purchase"
  | "tool_invoke"
  | "all";

/** All valid action type values. */
export const ACTION_TYPES: readonly ActionType[] = [
  "read",
  "index",
  "extract",
  "summarize",
  "render",
  "api_call",
  "form_submit",
  "automated_purchase",
  "tool_invoke",
  "all",
] as const;

/**
 * Supported agent identity verification methods.
 */
export type VerificationMethod =
  | "pkix"
  | "did"
  | "verifiable-credential"
  | "partner-token";

/**
 * Rate-limit time window.
 */
export type RateLimitWindow = "minute" | "hour" | "day";

/**
 * APoP custom HTTP status codes.
 */
export const APOP_STATUS_CODES = {
  /** 430 — Agent action is not allowed by the policy. */
  ACTION_NOT_ALLOWED: 430,
  /** 438 — Agent has exceeded the rate limit. */
  RATE_LIMITED: 438,
  /** 439 — Agent must verify its identity before access is granted. */
  VERIFICATION_REQUIRED: 439,
} as const;

/**
 * Policy evaluation status values for the Agent-Policy-Status header.
 */
export type PolicyStatus =
  | "allowed"
  | "restricted"
  | "denied"
  | "unverified"
  | "no-policy";

// ---------------------------------------------------------------------------
// Core Schema Types
// ---------------------------------------------------------------------------

/**
 * Rate limiting configuration for agent requests.
 */
export interface RateLimit {
  /** Maximum number of requests allowed within the window. */
  requests: number;
  /** Time window for rate limiting. */
  window: RateLimitWindow;
}

/**
 * A set of rules governing agent access (used as defaultPolicy and within PathPolicy).
 */
export interface PolicyRule {
  /** If boolean: true = allow, false = deny. If array: list of allowed action types. */
  allow: boolean | ActionType[];
  /** Explicitly disallowed action types. Takes precedence over `allow`. */
  disallow?: ActionType[];
  /** Explicit list of permitted action types (alternative to boolean allow). */
  actions?: ActionType[];
  /** Rate limiting configuration. */
  rateLimit?: RateLimit;
  /** If true, agents must verify their identity before access is granted. */
  requireVerification?: boolean;
}

/**
 * Path-specific policy override. Extends PolicyRule with path matching and agent filtering.
 */
export interface PathPolicy {
  /** URL path pattern. Supports glob-style wildcards: * (single segment), ** (multiple segments). */
  path: string;
  /** Allow/deny/action list for this path. */
  allow?: boolean | ActionType[];
  /** Explicitly disallowed action types on this path. */
  disallow?: ActionType[];
  /** Explicit list of permitted action types. */
  actions?: ActionType[];
  /** Rate limiting configuration for this path. */
  rateLimit?: RateLimit;
  /** Whether agents must verify identity for this path. */
  requireVerification?: boolean;
  /** Agent identifiers explicitly allowed on this path. */
  agentAllowlist?: string[];
  /** Agent identifiers explicitly denied on this path. */
  agentDenylist?: string[];
}

/**
 * Configuration for agent identity verification.
 */
export interface Verification {
  /** Supported verification method(s). */
  method: VerificationMethod | VerificationMethod[];
  /** URL of the verification registry for identity lookups. */
  registry?: string;
  /** Trusted Verifiable Credential issuer DIDs. */
  trustedIssuers?: string[];
  /** URL where agents can initiate verification. */
  verificationEndpoint?: string;
}

/**
 * Contact information for the policy owner.
 */
export interface Contact {
  /** Contact email for policy questions or compliance. */
  email?: string;
  /** Human-readable policy page URL. */
  policyUrl?: string;
  /** URL for reporting agent abuse or policy violations. */
  abuseUrl?: string;
}

/**
 * Human-readable metadata about the policy.
 */
export interface Metadata {
  /** Brief description of this policy's purpose. */
  description?: string;
  /** Organization or individual that owns this website/policy. */
  owner?: string;
  /** Contact for the person or team maintaining the policy. */
  maintainer?: string;
  /** ISO 8601 timestamp of last policy update. */
  lastModified?: string;
  /** License URL or SPDX identifier. */
  license?: string;
}

/**
 * Cross-protocol interoperability declarations.
 */
export interface Interoperability {
  /** URL to the site's A2A Agent Card. */
  a2aAgentCard?: string;
  /** URL to the site's MCP server endpoint. */
  mcpServerUrl?: string;
  /** Whether the site exposes WebMCP tools. */
  webmcpEnabled?: boolean;
  /** URL to the site's UCP capability profile. */
  ucpCapabilities?: string;
  /** URL to the site's APAAI accountability endpoint. */
  apaaiEndpoint?: string;
}

// ---------------------------------------------------------------------------
// Root Policy Type
// ---------------------------------------------------------------------------

/**
 * The top-level Agent Policy Protocol manifest (agent-policy.json).
 */
export interface AgentPolicy {
  /** Reference to this JSON Schema for validation. */
  $schema?: string;
  /** APoP protocol version (e.g. "1.0"). */
  version: string;
  /** Canonical URL where this policy is hosted. */
  policyUrl?: string;
  /** Site-wide fallback rules. */
  defaultPolicy: PolicyRule;
  /** Path-specific policy overrides, evaluated in order. */
  pathPolicies?: PathPolicy[];
  /** Agent identity verification configuration. */
  verification?: Verification;
  /** Contact information. */
  contact?: Contact;
  /** Human-readable metadata. */
  metadata?: Metadata;
  /** Cross-protocol interoperability declarations. */
  interop?: Interoperability;
}

// ---------------------------------------------------------------------------
// Request / Response Context Types (SDK-specific)
// ---------------------------------------------------------------------------

/**
 * Agent request headers parsed from an incoming HTTP request.
 */
export interface AgentRequestHeaders {
  agentName?: string;
  agentIntent?: string;
  agentId?: string;
  agentSignature?: string;
  agentVC?: string;
  agentCard?: string;
  agentKeyId?: string;
}

/**
 * APoP response headers to set on the outgoing HTTP response.
 */
export interface AgentResponseHeaders {
  "Agent-Policy"?: string;
  "Agent-Policy-Version"?: string;
  "Agent-Policy-Status"?: PolicyStatus;
  "Agent-Policy-Actions"?: string;
  "Agent-Policy-Rate-Limit"?: string;
  "Agent-Policy-Rate-Remaining"?: string;
  "Agent-Policy-Rate-Reset"?: string;
  "Agent-Policy-Verify"?: string;
  "Agent-Policy-Verify-Endpoint"?: string;
  "Retry-After"?: string;
}

/**
 * Enforcement decision status.
 */
export type EnforcementStatus =
  | "allowed"
  | "denied"
  | "verification-required"
  | "rate-limited";

/**
 * Result of policy enforcement evaluation.
 */
export interface EnforcementResult {
  /** High-level status of the enforcement decision. */
  status: EnforcementStatus;
  /** HTTP status code to return (200, 430, 438, or 439). */
  httpStatus: number;
  /** Response headers to set. */
  headers: AgentResponseHeaders;
  /** Error response body (only set when status is not "allowed"). */
  body?: Record<string, unknown>;
}

/**
 * Request context used by the enforcer.
 */
export interface RequestContext {
  /** URL path being requested. */
  path: string;
  /** Agent name (from Agent-Name header). */
  agentName?: string;
  /** Agent intent (from Agent-Intent header). */
  agentIntent?: string;
  /** Agent identifier (from Agent-Id header). */
  agentId?: string;
  /** Agent signature (from Agent-Signature header). */
  agentSignature?: string;
  /** Agent verifiable credential (from Agent-VC header). */
  agentVC?: string;
  /** Agent card URL (from Agent-Card header). */
  agentCard?: string;
  /** Agent key ID (from Agent-Key-Id header). */
  agentKeyId?: string;
}

/**
 * Options for the APoP middleware.
 */
export interface MiddlewareOptions {
  /** The APoP policy to enforce. */
  policy: AgentPolicy;
  /** If true, skip enforcement for non-agent requests (no Agent-Name header). Default: true. */
  skipNonAgents?: boolean;
}

/**
 * Discovery result from the 4-method discovery chain.
 */
export interface DiscoveryResult {
  /** The discovered policy, or null if no policy was found. */
  policy: AgentPolicy | null;
  /** The URL where the policy was fetched from. */
  policyUrl?: string;
  /** The discovery method that succeeded. */
  method?: "well-known" | "http-header" | "meta-tag" | "dns-txt";
  /** Error message if discovery failed. */
  error?: string;
}
