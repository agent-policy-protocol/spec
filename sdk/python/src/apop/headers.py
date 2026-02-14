"""
APoP v1.0 — Header Parsing & Building

Parse incoming APoP agent request headers and build APoP response headers.

Request headers (from agent):
  Agent-Name, Agent-Intent, Agent-Id, Agent-Signature, Agent-VC,
  Agent-Card, Agent-Key-Id

Response headers (from server):
  Agent-Policy, Agent-Policy-Version, Agent-Policy-Status, Agent-Policy-Actions,
  Agent-Policy-Rate-Limit, Agent-Policy-Rate-Remaining, Agent-Policy-Rate-Reset,
  Agent-Policy-Verify, Agent-Policy-Verify-Endpoint, Retry-After
"""

from __future__ import annotations

from typing import Optional

from apop.types import (
    AgentRequestHeaders,
    AgentResponseHeaders,
    RateLimit,
    VerificationMethod,
)

# ---------------------------------------------------------------------------
# Header name → AgentRequestHeaders field mapping
# ---------------------------------------------------------------------------

_HEADER_MAP: dict[str, str] = {
    "agent-name": "agent_name",
    "agent-intent": "agent_intent",
    "agent-id": "agent_id",
    "agent-signature": "agent_signature",
    "agent-vc": "agent_vc",
    "agent-card": "agent_card",
    "agent-key-id": "agent_key_id",
}


# ---------------------------------------------------------------------------
# Request Header Parsing
# ---------------------------------------------------------------------------


def parse_request_headers(
    headers: dict[str, str | list[str] | None],
) -> AgentRequestHeaders:
    """
    Parse APoP agent request headers from an incoming HTTP request.

    Accepts a plain dict of headers (case-insensitive lookup).

    Args:
        headers: Dictionary of HTTP headers.

    Returns:
        Parsed AgentRequestHeaders.
    """
    # Normalize to lowercase keys
    normalized: dict[str, str] = {}
    for key, value in headers.items():
        k = key.lower()
        if isinstance(value, list):
            normalized[k] = value[0] if value else ""
        elif value is not None:
            normalized[k] = value

    kwargs: dict[str, str | None] = {}
    for header_name, field_name in _HEADER_MAP.items():
        kwargs[field_name] = normalized.get(header_name)

    return AgentRequestHeaders(**kwargs)


def is_agent(headers: AgentRequestHeaders) -> bool:
    """
    Check whether a request is from an APoP-aware agent
    (i.e., has an Agent-Name header).
    """
    return bool(headers.agent_name)


def parse_intents(intent_header: Optional[str]) -> list[str]:
    """
    Parse the Agent-Intent header value into a list of intent strings.

    Args:
        intent_header: Raw Agent-Intent header value (comma-separated).

    Returns:
        List of trimmed intent strings.
    """
    if not intent_header:
        return []
    return [s.strip() for s in intent_header.split(",") if s.strip()]


# ---------------------------------------------------------------------------
# Response Header Building
# ---------------------------------------------------------------------------


def build_discovery_headers(
    policy_url: Optional[str] = None,
    version: Optional[str] = None,
) -> AgentResponseHeaders:
    """
    Build base discovery/version response headers for every APoP-aware response.
    """
    headers: AgentResponseHeaders = {
        "Agent-Policy-Version": version or "1.0",
    }
    if policy_url:
        headers["Agent-Policy"] = policy_url
    return headers


def build_allowed_headers(
    *,
    policy_url: Optional[str] = None,
    version: Optional[str] = None,
    actions: Optional[list[str]] = None,
    rate_limit: Optional[RateLimit] = None,
    rate_remaining: Optional[int] = None,
    rate_reset: Optional[str] = None,
) -> AgentResponseHeaders:
    """Build response headers for a successful (allowed) request."""
    headers = {
        **build_discovery_headers(policy_url, version),
        "Agent-Policy-Status": "allowed",
    }

    if actions:
        headers["Agent-Policy-Actions"] = ", ".join(actions)

    if rate_limit:
        headers["Agent-Policy-Rate-Limit"] = f"{rate_limit.requests}/{rate_limit.window}"
        headers["Agent-Policy-Rate-Remaining"] = str(
            rate_remaining if rate_remaining is not None else rate_limit.requests
        )
        if rate_reset:
            headers["Agent-Policy-Rate-Reset"] = rate_reset

    return headers


def build_denied_headers(
    *,
    policy_url: Optional[str] = None,
    version: Optional[str] = None,
) -> AgentResponseHeaders:
    """Build response headers for a denied (430) response."""
    return {
        **build_discovery_headers(policy_url, version),
        "Agent-Policy-Status": "denied",
    }


def build_verification_headers(
    *,
    policy_url: Optional[str] = None,
    version: Optional[str] = None,
    methods: list[VerificationMethod],
    verify_endpoint: Optional[str] = None,
) -> AgentResponseHeaders:
    """Build response headers for a verification-required (439) response."""
    headers: AgentResponseHeaders = {
        **build_discovery_headers(policy_url, version),
        "Agent-Policy-Status": "denied",
        "Agent-Policy-Verify": ", ".join(methods),
    }
    if verify_endpoint:
        headers["Agent-Policy-Verify-Endpoint"] = verify_endpoint
    return headers


def build_rate_limited_headers(
    *,
    policy_url: Optional[str] = None,
    version: Optional[str] = None,
    rate_limit: RateLimit,
    retry_after: int,
    rate_reset: Optional[str] = None,
) -> AgentResponseHeaders:
    """Build response headers for a rate-limited (438) response."""
    headers: AgentResponseHeaders = {
        **build_discovery_headers(policy_url, version),
        "Agent-Policy-Status": "denied",
        "Agent-Policy-Rate-Limit": f"{rate_limit.requests}/{rate_limit.window}",
        "Agent-Policy-Rate-Remaining": "0",
        "Retry-After": str(retry_after),
    }
    if rate_reset:
        headers["Agent-Policy-Rate-Reset"] = rate_reset
    return headers
