"""Tests for apop.headers — Header Parsing & Building."""

import pytest

from apop.headers import (
    build_allowed_headers,
    build_denied_headers,
    build_discovery_headers,
    build_rate_limited_headers,
    build_verification_headers,
    is_agent,
    parse_intents,
    parse_request_headers,
)
from apop.types import AgentRequestHeaders, RateLimit


# ---------------------------------------------------------------------------
# parseRequestHeaders tests
# ---------------------------------------------------------------------------


class TestParseRequestHeaders:
    def test_parse_from_lowercase_dict(self):
        headers = {
            "agent-name": "TestBot/1.0",
            "agent-intent": "read, summarize",
            "agent-id": "did:web:testbot.example.com",
            "agent-signature": "sig123",
            "agent-vc": "vc-token",
            "agent-card": "https://testbot.example.com/.well-known/agent.json",
            "agent-key-id": "key-1",
        }
        result = parse_request_headers(headers)
        assert result.agent_name == "TestBot/1.0"
        assert result.agent_intent == "read, summarize"
        assert result.agent_id == "did:web:testbot.example.com"
        assert result.agent_signature == "sig123"
        assert result.agent_vc == "vc-token"
        assert result.agent_card == "https://testbot.example.com/.well-known/agent.json"
        assert result.agent_key_id == "key-1"

    def test_return_empty_for_missing_headers(self):
        result = parse_request_headers({})
        assert result.agent_name is None
        assert result.agent_intent is None
        assert result.agent_id is None

    def test_parse_mixed_case_headers(self):
        headers = {
            "Agent-Name": "TestBot/1.0",
            "Agent-Intent": "read",
        }
        result = parse_request_headers(headers)
        assert result.agent_name == "TestBot/1.0"
        assert result.agent_intent == "read"


# ---------------------------------------------------------------------------
# isAgent tests
# ---------------------------------------------------------------------------


class TestIsAgent:
    def test_true_when_agent_name_present(self):
        headers = AgentRequestHeaders(agent_name="Bot/1.0")
        assert is_agent(headers) is True

    def test_false_when_agent_name_missing(self):
        headers = AgentRequestHeaders()
        assert is_agent(headers) is False

    def test_false_when_agent_name_empty(self):
        headers = AgentRequestHeaders(agent_name="")
        assert is_agent(headers) is False


# ---------------------------------------------------------------------------
# parseIntents tests
# ---------------------------------------------------------------------------


class TestParseIntents:
    def test_parse_comma_separated(self):
        assert parse_intents("read, summarize, index") == ["read", "summarize", "index"]

    def test_single_intent(self):
        assert parse_intents("read") == ["read"]

    def test_return_empty_for_none(self):
        assert parse_intents(None) == []

    def test_return_empty_for_empty_string(self):
        assert parse_intents("") == []

    def test_trim_whitespace(self):
        assert parse_intents("  read , summarize  ") == ["read", "summarize"]


# ---------------------------------------------------------------------------
# buildDiscoveryHeaders tests
# ---------------------------------------------------------------------------


class TestBuildDiscoveryHeaders:
    def test_include_policy_url_and_version(self):
        headers = build_discovery_headers(
            policy_url="https://example.com/.well-known/agent-policy.json",
            version="1.0",
        )
        assert headers["Agent-Policy"] == "https://example.com/.well-known/agent-policy.json"
        assert headers["Agent-Policy-Version"] == "1.0"

    def test_default_version(self):
        headers = build_discovery_headers()
        assert headers["Agent-Policy-Version"] == "1.0"
        assert "Agent-Policy" not in headers


# ---------------------------------------------------------------------------
# buildAllowedHeaders tests
# ---------------------------------------------------------------------------


class TestBuildAllowedHeaders:
    def test_set_status_with_actions_and_rate_limit(self):
        headers = build_allowed_headers(
            policy_url="https://example.com/.well-known/agent-policy.json",
            actions=["read", "render"],
            rate_limit=RateLimit(requests=100, window="hour"),
        )
        assert headers["Agent-Policy-Status"] == "allowed"
        assert headers["Agent-Policy-Actions"] == "read, render"
        assert headers["Agent-Policy-Rate-Limit"] == "100/hour"
        assert headers["Agent-Policy-Rate-Remaining"] == "100"

    def test_omit_actions_if_empty(self):
        headers = build_allowed_headers()
        assert "Agent-Policy-Actions" not in headers


# ---------------------------------------------------------------------------
# buildDeniedHeaders tests
# ---------------------------------------------------------------------------


class TestBuildDeniedHeaders:
    def test_set_status_to_denied(self):
        headers = build_denied_headers()
        assert headers["Agent-Policy-Status"] == "denied"


# ---------------------------------------------------------------------------
# buildVerificationHeaders tests
# ---------------------------------------------------------------------------


class TestBuildVerificationHeaders:
    def test_set_verify_methods_and_endpoint(self):
        headers = build_verification_headers(
            methods=["did", "pkix"],
            verify_endpoint="https://example.com/verify",
        )
        assert headers["Agent-Policy-Status"] == "denied"
        assert headers["Agent-Policy-Verify"] == "did, pkix"
        assert headers["Agent-Policy-Verify-Endpoint"] == "https://example.com/verify"

    def test_omit_endpoint_if_not_provided(self):
        headers = build_verification_headers(methods=["pkix"])
        assert "Agent-Policy-Verify-Endpoint" not in headers


# ---------------------------------------------------------------------------
# buildRateLimitedHeaders tests
# ---------------------------------------------------------------------------


class TestBuildRateLimitedHeaders:
    def test_set_rate_limit_with_retry_after(self):
        headers = build_rate_limited_headers(
            rate_limit=RateLimit(requests=100, window="hour"),
            retry_after=60,
            rate_reset="2026-02-14T01:00:00Z",
        )
        assert headers["Agent-Policy-Rate-Limit"] == "100/hour"
        assert headers["Agent-Policy-Rate-Remaining"] == "0"
        assert headers["Retry-After"] == "60"
        assert headers["Agent-Policy-Rate-Reset"] == "2026-02-14T01:00:00Z"
