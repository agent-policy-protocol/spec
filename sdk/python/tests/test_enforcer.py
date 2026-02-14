"""Tests for apop.enforcer — Policy Enforcement Engine."""

import pytest

from apop.enforcer import enforce
from apop.types import (
    AgentPolicy,
    PathPolicy,
    PolicyRule,
    RateLimit,
    RequestContext,
    Verification,
)


# ---------------------------------------------------------------------------
# Test Policy
# ---------------------------------------------------------------------------

TEST_POLICY = AgentPolicy(
    version="1.0",
    policy_url="https://example.com/.well-known/agent-policy.json",
    default_policy=PolicyRule(
        allow=True,
        actions=["read", "render"],
        disallow=["extract", "automated_purchase"],
        rate_limit=RateLimit(requests=100, window="hour"),
        require_verification=True,
    ),
    path_policies=[
        PathPolicy(
            path="/public/*",
            allow=True,
            actions=["read", "index", "summarize"],
            require_verification=False,
        ),
        PathPolicy(path="/admin/*", allow=False),
        PathPolicy(
            path="/api/v1/*",
            allow=True,
            actions=["read", "api_call"],
            agent_allowlist=["did:web:perplexity.ai", "did:web:gemini.google.com"],
            require_verification=True,
        ),
        PathPolicy(
            path="/blocked/*",
            allow=True,
            agent_denylist=["did:web:bad-agent.com"],
            require_verification=False,
        ),
        PathPolicy(
            path="/deep/nested/**",
            allow=True,
            actions=["read"],
            require_verification=False,
        ),
    ],
    verification=Verification(
        method=["did", "verifiable-credential", "pkix"],
        verification_endpoint="https://example.com/verify-agent",
        trusted_issuers=["did:web:agentpolicy.org"],
    ),
)


# ---------------------------------------------------------------------------
# Allowed requests
# ---------------------------------------------------------------------------


class TestAllowedRequests:
    def test_allow_verified_agent_on_public_path(self):
        result = enforce(
            TEST_POLICY,
            RequestContext(
                path="/public/page",
                agent_name="TestBot/1.0",
                agent_id="did:web:testbot.com",
                agent_signature="sig123",
            ),
        )
        assert result.status == "allowed"
        assert result.http_status == 200
        assert result.headers["Agent-Policy-Status"] == "allowed"

    def test_allow_on_deep_nested_path(self):
        result = enforce(
            TEST_POLICY,
            RequestContext(
                path="/deep/nested/a/b/c",
                agent_name="TestBot/1.0",
            ),
        )
        assert result.status == "allowed"
        assert result.http_status == 200

    def test_set_rate_limit_headers(self):
        result = enforce(
            TEST_POLICY,
            RequestContext(
                path="/public/page",
                agent_name="TestBot/1.0",
            ),
        )
        # Public path inherits default rate limit
        assert result.headers.get("Agent-Policy-Rate-Limit") == "100/hour"

    def test_set_action_headers(self):
        result = enforce(
            TEST_POLICY,
            RequestContext(
                path="/public/page",
                agent_name="TestBot/1.0",
            ),
        )
        assert result.headers.get("Agent-Policy-Actions") == "read, index, summarize"

    def test_set_policy_url_header(self):
        result = enforce(
            TEST_POLICY,
            RequestContext(
                path="/public/page",
                agent_name="TestBot/1.0",
            ),
        )
        assert (
            result.headers.get("Agent-Policy")
            == "https://example.com/.well-known/agent-policy.json"
        )


# ---------------------------------------------------------------------------
# Denylist enforcement
# ---------------------------------------------------------------------------


class TestDenylistEnforcement:
    def test_deny_agent_on_denylist(self):
        result = enforce(
            TEST_POLICY,
            RequestContext(
                path="/blocked/resource",
                agent_name="BadBot",
                agent_id="did:web:bad-agent.com",
            ),
        )
        assert result.status == "denied"
        assert result.http_status == 430
        assert result.body is not None
        assert result.body["error"] == "agent_on_denylist"

    def test_allow_agent_not_on_denylist(self):
        result = enforce(
            TEST_POLICY,
            RequestContext(
                path="/blocked/resource",
                agent_name="GoodBot",
                agent_id="did:web:good-agent.com",
            ),
        )
        assert result.status == "allowed"
        assert result.http_status == 200


# ---------------------------------------------------------------------------
# Allowlist enforcement
# ---------------------------------------------------------------------------


class TestAllowlistEnforcement:
    def test_deny_agent_not_on_allowlist(self):
        result = enforce(
            TEST_POLICY,
            RequestContext(
                path="/api/v1/data",
                agent_name="RandomBot",
                agent_id="did:web:random.com",
                agent_signature="sig",
            ),
        )
        assert result.http_status == 430
        assert result.body is not None
        assert result.body["error"] == "agent_not_on_allowlist"

    def test_allow_agent_on_allowlist_with_verification(self):
        result = enforce(
            TEST_POLICY,
            RequestContext(
                path="/api/v1/data",
                agent_name="Perplexity",
                agent_id="did:web:perplexity.ai",
                agent_signature="sig123",
            ),
        )
        assert result.status == "allowed"
        assert result.http_status == 200

    def test_deny_agent_without_id(self):
        result = enforce(
            TEST_POLICY,
            RequestContext(
                path="/api/v1/data",
                agent_name="NoIdBot",
            ),
        )
        assert result.http_status == 430
        assert result.body is not None
        assert result.body["error"] == "agent_not_on_allowlist"


# ---------------------------------------------------------------------------
# Access denied (allow: false)
# ---------------------------------------------------------------------------


class TestAccessDenied:
    def test_deny_on_blocked_paths(self):
        result = enforce(
            TEST_POLICY,
            RequestContext(
                path="/admin/settings",
                agent_name="TestBot",
                agent_signature="sig",
            ),
        )
        assert result.http_status == 430
        assert result.body is not None
        assert result.body["error"] == "agent_action_not_allowed"


# ---------------------------------------------------------------------------
# Intent-based enforcement
# ---------------------------------------------------------------------------


class TestIntentEnforcement:
    def test_deny_blocked_intent(self):
        result = enforce(
            TEST_POLICY,
            RequestContext(
                path="/public/page",
                agent_name="TestBot",
                agent_intent="extract",
            ),
        )
        assert result.status == "denied"
        assert result.body is not None
        assert result.body["error"] == "agent_action_not_allowed"

    def test_deny_if_any_intent_blocked(self):
        result = enforce(
            TEST_POLICY,
            RequestContext(
                path="/public/page",
                agent_name="TestBot",
                agent_intent="read, extract",
            ),
        )
        assert result.status == "denied"
        assert result.http_status == 430

    def test_allow_permitted_intents(self):
        result = enforce(
            TEST_POLICY,
            RequestContext(
                path="/public/page",
                agent_name="TestBot",
                agent_intent="read, summarize",
            ),
        )
        assert result.status == "allowed"

    def test_allow_when_no_intent(self):
        result = enforce(
            TEST_POLICY,
            RequestContext(
                path="/public/page",
                agent_name="TestBot",
            ),
        )
        assert result.status == "allowed"


# ---------------------------------------------------------------------------
# Verification enforcement
# ---------------------------------------------------------------------------


class TestVerificationEnforcement:
    def test_require_verification_when_set(self):
        result = enforce(
            TEST_POLICY,
            RequestContext(
                path="/unmatched/path",
                agent_name="TestBot",
            ),
        )
        assert result.status == "verification-required"
        assert result.http_status == 439
        assert result.body is not None
        assert result.body["error"] == "agent_verification_required"
        assert result.body["acceptedMethods"] == ["did", "verifiable-credential", "pkix"]

    def test_set_verify_headers_on_439(self):
        result = enforce(
            TEST_POLICY,
            RequestContext(
                path="/unmatched/path",
                agent_name="TestBot",
            ),
        )
        assert "Agent-Policy-Verify" in result.headers
        assert "Agent-Policy-Verify-Endpoint" in result.headers

    def test_allow_verified_agent_with_signature(self):
        result = enforce(
            TEST_POLICY,
            RequestContext(
                path="/unmatched/path",
                agent_name="TestBot",
                agent_signature="sig123",
            ),
        )
        assert result.status == "allowed"
        assert result.http_status == 200

    def test_allow_verified_agent_with_vc(self):
        result = enforce(
            TEST_POLICY,
            RequestContext(
                path="/unmatched/path",
                agent_name="TestBot",
                agent_vc="vc-token",
            ),
        )
        assert result.status == "allowed"
        assert result.http_status == 200

    def test_no_verification_when_path_overrides_to_false(self):
        result = enforce(
            TEST_POLICY,
            RequestContext(
                path="/public/page",
                agent_name="TestBot",
            ),
        )
        assert result.status == "allowed"
        assert result.http_status == 200


# ---------------------------------------------------------------------------
# Default policy fallback
# ---------------------------------------------------------------------------


class TestDefaultPolicyFallback:
    def test_use_default_for_unmatched_paths(self):
        result = enforce(
            TEST_POLICY,
            RequestContext(
                path="/some/unknown/path",
                agent_name="TestBot",
            ),
        )
        # Default requires verification, and no signature provided
        assert result.status == "verification-required"
        assert result.http_status == 439


# ---------------------------------------------------------------------------
# Enforcement order
# ---------------------------------------------------------------------------


class TestEnforcementOrder:
    def test_check_denylist_before_allowlist(self):
        policy = AgentPolicy(
            version="1.0",
            default_policy=PolicyRule(allow=True),
            path_policies=[
                PathPolicy(
                    path="/mixed/*",
                    allow=True,
                    agent_allowlist=["did:web:bad-agent.com"],
                    agent_denylist=["did:web:bad-agent.com"],
                ),
            ],
        )
        result = enforce(
            policy,
            RequestContext(
                path="/mixed/resource",
                agent_name="Bot",
                agent_id="did:web:bad-agent.com",
            ),
        )
        assert result.body is not None
        assert result.body["error"] == "agent_on_denylist"

    def test_check_allow_before_intent(self):
        result = enforce(
            TEST_POLICY,
            RequestContext(
                path="/admin/settings",
                agent_name="TestBot",
                agent_intent="read",
                agent_signature="sig",
            ),
        )
        assert result.body is not None
        assert result.body["error"] == "agent_action_not_allowed"
        assert result.body["message"] == "Access is not permitted on this path."


# ---------------------------------------------------------------------------
# Minimal policy
# ---------------------------------------------------------------------------


class TestMinimalPolicy:
    def test_allow_all_with_minimal_policy(self):
        policy = AgentPolicy(
            version="1.0",
            default_policy=PolicyRule(allow=True),
        )
        result = enforce(
            policy,
            RequestContext(path="/", agent_name="Bot"),
        )
        assert result.status == "allowed"
        assert result.http_status == 200

    def test_deny_all_with_minimal_policy(self):
        policy = AgentPolicy(
            version="1.0",
            default_policy=PolicyRule(allow=False),
        )
        result = enforce(
            policy,
            RequestContext(path="/", agent_name="Bot"),
        )
        assert result.status == "denied"
        assert result.http_status == 430
