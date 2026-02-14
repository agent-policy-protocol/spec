"""Tests for apop.parser — Policy Parsing & Validation."""

import json

import pytest

from apop.parser import get_schema, parse_policy, validate_policy


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

MINIMAL_POLICY = json.dumps({
    "version": "1.0",
    "defaultPolicy": {"allow": True},
})

FULL_POLICY = json.dumps({
    "$schema": "https://agentpolicy.org/schema/v1/agent-policy.schema.json",
    "version": "1.0",
    "policyUrl": "https://example.com/.well-known/agent-policy.json",
    "defaultPolicy": {
        "allow": True,
        "disallow": ["extract", "automated_purchase"],
        "actions": ["read", "render"],
        "rateLimit": {"requests": 100, "window": "hour"},
        "requireVerification": True,
    },
    "pathPolicies": [
        {"path": "/public/*", "allow": True, "requireVerification": False},
        {"path": "/private/*", "allow": False},
        {"path": "/admin/*", "allow": False},
        {
            "path": "/api/v1/*",
            "allow": True,
            "actions": ["read", "api_call"],
            "agentAllowlist": ["did:web:perplexity.ai", "did:web:gemini.google.com"],
        },
    ],
    "verification": {
        "method": ["did", "verifiable-credential"],
        "registry": "https://agents.agentpolicy.org/registry",
        "trustedIssuers": ["did:web:agentpolicy.org"],
        "verificationEndpoint": "https://example.com/verify-agent",
    },
    "contact": {
        "email": "admin@example.com",
        "policyUrl": "https://example.com/ai-policy",
        "abuseUrl": "https://example.com/report-abuse",
    },
    "metadata": {
        "description": "Test policy",
        "owner": "Test Corp",
        "maintainer": "admin@example.com",
        "lastModified": "2026-02-14T00:00:00Z",
        "license": "Apache-2.0",
    },
    "interop": {
        "a2aAgentCard": "https://example.com/.well-known/agent.json",
        "mcpServerUrl": "https://example.com/mcp",
        "webmcpEnabled": True,
    },
})


# ---------------------------------------------------------------------------
# parsePolicy tests
# ---------------------------------------------------------------------------


class TestParsePolicy:
    def test_parse_valid_minimal_policy(self):
        result = parse_policy(MINIMAL_POLICY)
        assert result.valid is True
        assert result.policy is not None
        assert result.policy.version == "1.0"
        assert result.policy.default_policy.allow is True

    def test_parse_valid_full_policy(self):
        result = parse_policy(FULL_POLICY)
        assert result.valid is True
        assert result.policy is not None
        assert result.policy.path_policies is not None
        assert len(result.policy.path_policies) == 4
        assert result.policy.verification is not None
        assert result.policy.verification.method == ["did", "verifiable-credential"]

    def test_reject_invalid_json(self):
        result = parse_policy("{not valid json}")
        assert result.valid is False
        assert result.errors is not None
        assert "Invalid JSON" in result.errors[0].message

    def test_reject_missing_default_policy(self):
        result = parse_policy(json.dumps({"version": "1.0"}))
        assert result.valid is False
        assert result.errors is not None

    def test_reject_missing_version(self):
        result = parse_policy(json.dumps({"defaultPolicy": {"allow": True}}))
        assert result.valid is False

    def test_reject_invalid_version(self):
        result = parse_policy(
            json.dumps({"version": "2.0", "defaultPolicy": {"allow": True}})
        )
        assert result.valid is False

    def test_reject_invalid_action_types(self):
        result = parse_policy(
            json.dumps({
                "version": "1.0",
                "defaultPolicy": {
                    "allow": True,
                    "actions": ["invalid_action"],
                },
            })
        )
        assert result.valid is False

    def test_reject_invalid_rate_limit_window(self):
        result = parse_policy(
            json.dumps({
                "version": "1.0",
                "defaultPolicy": {
                    "allow": True,
                    "rateLimit": {"requests": 100, "window": "week"},
                },
            })
        )
        assert result.valid is False

    def test_reject_unknown_top_level_properties(self):
        result = parse_policy(
            json.dumps({
                "version": "1.0",
                "defaultPolicy": {"allow": True},
                "unknownField": "value",
            })
        )
        assert result.valid is False

    def test_accept_allow_as_array(self):
        result = parse_policy(
            json.dumps({
                "version": "1.0",
                "defaultPolicy": {"allow": ["read", "render"]},
            })
        )
        assert result.valid is True
        assert result.policy is not None
        assert result.policy.default_policy.allow == ["read", "render"]

    def test_accept_all_10_action_types(self):
        result = parse_policy(
            json.dumps({
                "version": "1.0",
                "defaultPolicy": {
                    "allow": True,
                    "actions": [
                        "read", "index", "extract", "summarize", "render",
                        "api_call", "form_submit", "automated_purchase",
                        "tool_invoke", "all",
                    ],
                },
            })
        )
        assert result.valid is True

    def test_accept_all_4_verification_methods(self):
        result = parse_policy(
            json.dumps({
                "version": "1.0",
                "defaultPolicy": {"allow": True},
                "verification": {
                    "method": ["pkix", "did", "verifiable-credential", "partner-token"],
                },
            })
        )
        assert result.valid is True

    def test_accept_single_verification_method_string(self):
        result = parse_policy(
            json.dumps({
                "version": "1.0",
                "defaultPolicy": {"allow": True},
                "verification": {"method": "pkix"},
            })
        )
        assert result.valid is True


# ---------------------------------------------------------------------------
# validatePolicy tests
# ---------------------------------------------------------------------------


class TestValidatePolicy:
    def test_validate_parsed_object(self):
        data = json.loads(MINIMAL_POLICY)
        result = validate_policy(data)
        assert result.valid is True
        assert result.policy is not None

    def test_reject_invalid_object(self):
        result = validate_policy({"version": "1.0"})
        assert result.valid is False


# ---------------------------------------------------------------------------
# getSchema tests
# ---------------------------------------------------------------------------


class TestGetSchema:
    def test_return_schema(self):
        schema = get_schema()
        assert schema["$schema"] == "https://json-schema.org/draft/2020-12/schema"
        assert schema["$id"] == "https://agentpolicy.org/schema/v1/agent-policy.schema.json"
        assert "version" in schema["required"]
        assert "defaultPolicy" in schema["required"]
