/**
 * @apop/node — Agent Policy Protocol SDK for Node.js
 *
 * Public API barrel export.
 *
 * @packageDocumentation
 */

// Types
export type {
  ActionType,
  AgentPolicy,
  AgentRequestHeaders,
  AgentResponseHeaders,
  Contact,
  DiscoveryResult,
  EnforcementResult,
  EnforcementStatus,
  Interoperability,
  Metadata,
  MiddlewareOptions,
  PathPolicy,
  PolicyRule,
  PolicyStatus,
  RateLimit,
  RateLimitWindow,
  RequestContext,
  Verification,
  VerificationMethod,
} from "./types.js";

export { ACTION_TYPES, APOP_STATUS_CODES } from "./types.js";

// Parser
export {
  parsePolicy,
  validatePolicy,
  parsePolicyFile,
  getSchema,
} from "./parser.js";
export type { ParseResult, ValidationError } from "./parser.js";

// Discovery
export { discoverPolicy } from "./discovery.js";
export type { DiscoveryOptions } from "./discovery.js";

// Matcher
export { pathMatches, matchPathPolicy, mergePolicy } from "./matcher.js";

// Enforcer
export { enforce } from "./enforcer.js";

// Headers
export {
  parseRequestHeaders,
  isAgent,
  parseIntents,
  buildDiscoveryHeaders,
  buildAllowedHeaders,
  buildDeniedHeaders,
  buildVerificationHeaders,
  buildRateLimitedHeaders,
} from "./headers.js";

// Middleware (re-exported for convenience)
export {
  createExpressMiddleware,
  createDiscoveryEndpoint,
} from "./middleware/express.js";
export {
  createVercelHandler,
  createVercelEdgeMiddleware,
} from "./middleware/vercel.js";
export { createNextMiddleware } from "./middleware/nextjs.js";
