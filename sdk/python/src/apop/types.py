"""
APoP v1.0 — Python Type Definitions

Dataclass-based types matching the APoP JSON Schema.
All types use snake_case per Python conventions.
"""

from __future__ import annotations

from dataclasses import dataclass
from enum import Enum
from typing import Literal

# ---------------------------------------------------------------------------
# Enums & Literals
# ---------------------------------------------------------------------------

ActionType = Literal[
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
]

ACTION_TYPES: tuple[ActionType, ...] = (
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
)

VerificationMethod = Literal[
    "pkix",
    "did",
    "verifiable-credential",
    "partner-token",
]

RateLimitWindow = Literal["minute", "hour", "day"]

PolicyStatus = Literal[
    "allowed",
    "restricted",
    "denied",
    "unverified",
    "no-policy",
]

EnforcementStatus = Literal[
    "allowed",
    "denied",
    "verification-required",
    "rate-limited",
]


class ApopStatusCodes(int, Enum):
    """APoP custom HTTP status codes."""

    ACTION_NOT_ALLOWED = 430
    RATE_LIMITED = 438
    VERIFICATION_REQUIRED = 439


APOP_STATUS_CODES = {
    "ACTION_NOT_ALLOWED": 430,
    "RATE_LIMITED": 438,
    "VERIFICATION_REQUIRED": 439,
}


# ---------------------------------------------------------------------------
# Core Schema Types
# ---------------------------------------------------------------------------


@dataclass
class RateLimit:
    """Rate limiting configuration for agent requests."""

    requests: int
    window: RateLimitWindow


@dataclass
class PolicyRule:
    """A set of rules governing agent access."""

    allow: bool | list[ActionType]
    disallow: list[ActionType] | None = None
    actions: list[ActionType] | None = None
    rate_limit: RateLimit | None = None
    require_verification: bool = False


@dataclass
class PathPolicy:
    """Path-specific policy override."""

    path: str
    allow: bool | list[ActionType] | None = None
    disallow: list[ActionType] | None = None
    actions: list[ActionType] | None = None
    rate_limit: RateLimit | None = None
    require_verification: bool | None = None
    agent_allowlist: list[str] | None = None
    agent_denylist: list[str] | None = None


@dataclass
class Verification:
    """Configuration for agent identity verification."""

    method: VerificationMethod | list[VerificationMethod]
    registry: str | None = None
    trusted_issuers: list[str] | None = None
    verification_endpoint: str | None = None


@dataclass
class Contact:
    """Contact information for the policy owner."""

    email: str | None = None
    policy_url: str | None = None
    abuse_url: str | None = None


@dataclass
class Metadata:
    """Human-readable metadata about the policy."""

    description: str | None = None
    owner: str | None = None
    maintainer: str | None = None
    last_modified: str | None = None
    license: str | None = None


@dataclass
class Interoperability:
    """Cross-protocol interoperability declarations."""

    a2a_agent_card: str | None = None
    mcp_server_url: str | None = None
    webmcp_enabled: bool | None = None
    ucp_capabilities: str | None = None
    apaai_endpoint: str | None = None


@dataclass
class AgentPolicy:
    """The top-level Agent Policy Protocol manifest (agent-policy.json)."""

    version: str
    default_policy: PolicyRule
    schema_url: str | None = None
    policy_url: str | None = None
    path_policies: list[PathPolicy] | None = None
    verification: Verification | None = None
    contact: Contact | None = None
    metadata: Metadata | None = None
    interop: Interoperability | None = None


# ---------------------------------------------------------------------------
# Request / Response Context Types (SDK-specific)
# ---------------------------------------------------------------------------


@dataclass
class AgentRequestHeaders:
    """Agent request headers parsed from an incoming HTTP request."""

    agent_name: str | None = None
    agent_intent: str | None = None
    agent_id: str | None = None
    agent_signature: str | None = None
    agent_vc: str | None = None
    agent_card: str | None = None
    agent_key_id: str | None = None


AgentResponseHeaders = dict[str, str]
"""APoP response headers to set on the outgoing HTTP response."""


@dataclass
class EnforcementResult:
    """Result of policy enforcement evaluation."""

    status: EnforcementStatus
    http_status: int
    headers: AgentResponseHeaders
    body: dict[str, object] | None = None


@dataclass
class RequestContext:
    """Request context used by the enforcer."""

    path: str
    agent_name: str | None = None
    agent_intent: str | None = None
    agent_id: str | None = None
    agent_signature: str | None = None
    agent_vc: str | None = None
    agent_card: str | None = None
    agent_key_id: str | None = None


@dataclass
class MiddlewareOptions:
    """Options for the APoP middleware."""

    policy: AgentPolicy
    skip_non_agents: bool = True


@dataclass
class DiscoveryResult:
    """Discovery result from the 4-method discovery chain."""

    policy: AgentPolicy | None = None
    policy_url: str | None = None
    method: Literal["well-known", "http-header", "meta-tag", "dns-txt"] | None = None
    error: str | None = None
