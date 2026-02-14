"""
APoP v1.0 — Policy Enforcer

Takes a policy + request context and returns an EnforcementResult
with status, HTTP status code, response headers, and error body.

Enforcement logic order:
  1. Match path → merge with defaultPolicy
  2. Check denylist → 430
  3. Check allowlist → 430
  4. Check allow/disallow → 430
  5. Check intent against disallow list → 430
  6. Check requireVerification → 439
  7. Set rate limit headers → 200
"""

from __future__ import annotations

from typing import Any

from apop.types import (
    AgentPolicy,
    EnforcementResult,
    RequestContext,
    VerificationMethod,
)
from apop.matcher import match_path_policy, merge_policy
from apop.headers import (
    build_allowed_headers,
    build_denied_headers,
    build_verification_headers,
    parse_intents,
)


def enforce(policy: AgentPolicy, ctx: RequestContext) -> EnforcementResult:
    """
    Evaluate an APoP policy against a request context and return an enforcement decision.

    Args:
        policy: The APoP policy to enforce.
        ctx: The request context (path, agent name, intent, id, etc.).

    Returns:
        EnforcementResult with status, HTTP code, headers, and optional body.
    """
    # Step 1: Match path → merge with defaultPolicy
    path_rule = match_path_policy(policy, ctx.path)
    effective = merge_policy(policy.default_policy, path_rule)

    denied_headers = build_denied_headers(
        policy_url=policy.policy_url,
        version=policy.version,
    )

    # Step 2: Check denylist
    if path_rule and path_rule.agent_denylist and ctx.agent_id:
        if ctx.agent_id in path_rule.agent_denylist:
            return EnforcementResult(
                status="denied",
                http_status=430,
                headers=denied_headers,
                body={
                    "error": "agent_on_denylist",
                    "message": f"Agent '{ctx.agent_id}' is denied access to this path.",
                    "policy": policy.policy_url,
                    "path": ctx.path,
                },
            )

    # Step 3: Check allowlist
    if path_rule and path_rule.agent_allowlist:
        if not ctx.agent_id or ctx.agent_id not in path_rule.agent_allowlist:
            return EnforcementResult(
                status="denied",
                http_status=430,
                headers=denied_headers,
                body={
                    "error": "agent_not_on_allowlist",
                    "message": "This path is restricted to specific agents.",
                    "policy": policy.policy_url,
                    "path": ctx.path,
                },
            )

    # Step 4: Check allow/disallow — access denied
    if effective.allow is False:
        return EnforcementResult(
            status="denied",
            http_status=430,
            headers=denied_headers,
            body={
                "error": "agent_action_not_allowed",
                "message": "Access is not permitted on this path.",
                "policy": policy.policy_url,
                "path": ctx.path,
            },
        )

    # Step 5: Intent-based enforcement
    if ctx.agent_intent and effective.disallow:
        intents = parse_intents(ctx.agent_intent)
        blocked = [i for i in intents if i in effective.disallow]
        if blocked:
            return EnforcementResult(
                status="denied",
                http_status=430,
                headers=denied_headers,
                body={
                    "error": "agent_action_not_allowed",
                    "message": f"Action(s) '{', '.join(blocked)}' not permitted on this path.",
                    "policy": policy.policy_url,
                    "allowedActions": effective.actions or [],
                    "path": ctx.path,
                },
            )

    # Step 6: Verification required
    if effective.require_verification:
        has_verification = ctx.agent_signature or ctx.agent_vc
        if not has_verification:
            methods: list[VerificationMethod]
            if policy.verification and policy.verification.method:
                m = policy.verification.method
                methods = m if isinstance(m, list) else [m]
            else:
                methods = ["pkix"]

            return EnforcementResult(
                status="verification-required",
                http_status=439,
                headers=build_verification_headers(
                    policy_url=policy.policy_url,
                    version=policy.version,
                    methods=methods,
                    verify_endpoint=(
                        policy.verification.verification_endpoint
                        if policy.verification
                        else None
                    ),
                ),
                body={
                    "error": "agent_verification_required",
                    "message": "This endpoint requires verified agent identity.",
                    "acceptedMethods": methods,
                    "verifyEndpoint": (
                        policy.verification.verification_endpoint
                        if policy.verification
                        else None
                    ),
                    "trustedIssuers": (
                        policy.verification.trusted_issuers if policy.verification else None
                    ),
                    "policy": policy.policy_url,
                },
            )

    # Step 7: Allowed — build success headers
    return EnforcementResult(
        status="allowed",
        http_status=200,
        headers=build_allowed_headers(
            policy_url=policy.policy_url,
            version=policy.version,
            actions=effective.actions,
            rate_limit=effective.rate_limit,
        ),
    )
