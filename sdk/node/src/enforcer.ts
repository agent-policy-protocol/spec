/**
 * APoP v1.0 — Policy Enforcer
 *
 * Takes a policy + request context and returns an EnforcementResult
 * with status, HTTP status code, response headers, and error body.
 *
 * Enforcement logic order:
 *   1. Match path → merge with defaultPolicy
 *   2. Check denylist → 430
 *   3. Check allowlist → 430
 *   4. Check allow/disallow → 430
 *   5. Check intent against disallow list → 430
 *   6. Check requireVerification → 439
 *   7. Set rate limit headers → 200
 */

import type {
  AgentPolicy,
  EnforcementResult,
  RequestContext,
  VerificationMethod,
} from "./types.js";
import { matchPathPolicy, mergePolicy } from "./matcher.js";
import {
  buildAllowedHeaders,
  buildDeniedHeaders,
  buildVerificationHeaders,
  parseIntents,
} from "./headers.js";

/**
 * Evaluate an APoP policy against a request context and return an enforcement decision.
 *
 * @param policy - The APoP policy to enforce.
 * @param ctx - The request context (path, agent name, intent, id, etc.).
 * @returns EnforcementResult with status, HTTP code, headers, and optional body.
 */
export function enforce(
  policy: AgentPolicy,
  ctx: RequestContext,
): EnforcementResult {
  // Step 1: Match path → merge with defaultPolicy
  const pathRule = matchPathPolicy(policy, ctx.path);
  const effective = mergePolicy(policy.defaultPolicy, pathRule);

  const deniedHeaders = buildDeniedHeaders({
    policyUrl: policy.policyUrl,
    version: policy.version,
  });

  // Step 2: Check denylist
  if (pathRule?.agentDenylist && ctx.agentId) {
    if (pathRule.agentDenylist.includes(ctx.agentId)) {
      return {
        status: "denied",
        httpStatus: 430,
        headers: deniedHeaders,
        body: {
          error: "agent_on_denylist",
          message: `Agent '${ctx.agentId}' is denied access to this path.`,
          policy: policy.policyUrl,
          path: ctx.path,
        },
      };
    }
  }

  // Step 3: Check allowlist
  if (pathRule?.agentAllowlist) {
    if (!ctx.agentId || !pathRule.agentAllowlist.includes(ctx.agentId)) {
      return {
        status: "denied",
        httpStatus: 430,
        headers: deniedHeaders,
        body: {
          error: "agent_not_on_allowlist",
          message: "This path is restricted to specific agents.",
          policy: policy.policyUrl,
          path: ctx.path,
        },
      };
    }
  }

  // Step 4: Check allow/disallow — access denied
  if (effective.allow === false) {
    return {
      status: "denied",
      httpStatus: 430,
      headers: deniedHeaders,
      body: {
        error: "agent_action_not_allowed",
        message: "Access is not permitted on this path.",
        policy: policy.policyUrl,
        path: ctx.path,
      },
    };
  }

  // Step 5: Intent-based enforcement
  if (ctx.agentIntent && effective.disallow) {
    const intents = parseIntents(ctx.agentIntent);
    const blocked = intents.filter((i) =>
      effective.disallow!.includes(i as any),
    );
    if (blocked.length > 0) {
      return {
        status: "denied",
        httpStatus: 430,
        headers: deniedHeaders,
        body: {
          error: "agent_action_not_allowed",
          message: `Action(s) '${blocked.join(", ")}' not permitted on this path.`,
          policy: policy.policyUrl,
          allowedActions: effective.actions || [],
          path: ctx.path,
        },
      };
    }
  }

  // Step 6: Verification required
  if (effective.requireVerification) {
    const hasVerification = ctx.agentSignature || ctx.agentVC;
    if (!hasVerification) {
      const methods: VerificationMethod[] = Array.isArray(
        policy.verification?.method,
      )
        ? policy.verification!.method
        : [policy.verification?.method || "pkix"];

      return {
        status: "verification-required",
        httpStatus: 439,
        headers: buildVerificationHeaders({
          policyUrl: policy.policyUrl,
          version: policy.version,
          methods,
          verifyEndpoint: policy.verification?.verificationEndpoint,
        }),
        body: {
          error: "agent_verification_required",
          message: "This endpoint requires verified agent identity.",
          acceptedMethods: methods,
          verifyEndpoint: policy.verification?.verificationEndpoint,
          trustedIssuers: policy.verification?.trustedIssuers,
          policy: policy.policyUrl,
        },
      };
    }
  }

  // Step 7: Allowed — build success headers
  return {
    status: "allowed",
    httpStatus: 200,
    headers: buildAllowedHeaders({
      policyUrl: policy.policyUrl,
      version: policy.version,
      actions: effective.actions,
      rateLimit: effective.rateLimit,
    }),
  };
}
