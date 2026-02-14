"""
APoP v1.0 — Python Type Definitions

Dataclass-based types matching the APoP JSON Schema.
All types use snake_case per Python conventions.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Literal, Optional, Union


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

    allow: Union[bool, list[ActionType]]
    disallow: Optional[list[ActionType]] = None
    actions: Optional[list[ActionType]] = None
    rate_limit: Optional[RateLimit] = None
    require_verification: bool = False


@dataclass
class PathPolicy:
    """Path-specific policy override."""

    path: str
    allow: Optional[Union[bool, list[ActionType]]] = None
    disallow: Optional[list[ActionType]] = None
    actions: Optional[list[ActionType]] = None
    rate_limit: Optional[RateLimit] = None
    require_verification: Optional[bool] = None
    agent_allowlist: Optional[list[str]] = None
    agent_denylist: Optional[list[str]] = None


@dataclass
class Verification:
    """Configuration for agent identity verification."""

    method: Union[VerificationMethod, list[VerificationMethod]]
    registry: Optional[str] = None
    trusted_issuers: Optional[list[str]] = None
    verification_endpoint: Optional[str] = None


@dataclass
class Contact:
    """Contact information for the policy owner."""

    email: Optional[str] = None
    policy_url: Optional[str] = None
    abuse_url: Optional[str] = None


@dataclass
class Metadata:
    """Human-readable metadata about the policy."""

    description: Optional[str] = None
    owner: Optional[str] = None
    maintainer: Optional[str] = None
    last_modified: Optional[str] = None
    license: Optional[str] = None


@dataclass
class Interoperability:
    """Cross-protocol interoperability declarations."""

    a2a_agent_card: Optional[str] = None
    mcp_server_url: Optional[str] = None
    webmcp_enabled: Optional[bool] = None
    ucp_capabilities: Optional[str] = None
    apaai_endpoint: Optional[str] = None


@dataclass
class AgentPolicy:
    """The top-level Agent Policy Protocol manifest (agent-policy.json)."""

    version: str
    default_policy: PolicyRule
    schema_url: Optional[str] = None
    policy_url: Optional[str] = None
    path_policies: Optional[list[PathPolicy]] = None
    verification: Optional[Verification] = None
    contact: Optional[Contact] = None
    metadata: Optional[Metadata] = None
    interop: Optional[Interoperability] = None


# ---------------------------------------------------------------------------
# Request / Response Context Types (SDK-specific)
# ---------------------------------------------------------------------------


@dataclass
class AgentRequestHeaders:
    """Agent request headers parsed from an incoming HTTP request."""

    agent_name: Optional[str] = None
    agent_intent: Optional[str] = None
    agent_id: Optional[str] = None
    agent_signature: Optional[str] = None
    agent_vc: Optional[str] = None
    agent_card: Optional[str] = None
    agent_key_id: Optional[str] = None


AgentResponseHeaders = dict[str, str]
"""APoP response headers to set on the outgoing HTTP response."""


@dataclass
class EnforcementResult:
    """Result of policy enforcement evaluation."""

    status: EnforcementStatus
    http_status: int
    headers: AgentResponseHeaders
    body: Optional[dict[str, object]] = None


@dataclass
class RequestContext:
    """Request context used by the enforcer."""

    path: str
    agent_name: Optional[str] = None
    agent_intent: Optional[str] = None
    agent_id: Optional[str] = None
    agent_signature: Optional[str] = None
    agent_vc: Optional[str] = None
    agent_card: Optional[str] = None
    agent_key_id: Optional[str] = None


@dataclass
class MiddlewareOptions:
    """Options for the APoP middleware."""

    policy: AgentPolicy
    skip_non_agents: bool = True


@dataclass
class DiscoveryResult:
    """Discovery result from the 4-method discovery chain."""

    policy: Optional[AgentPolicy] = None
    policy_url: Optional[str] = None
    method: Optional[Literal["well-known", "http-header", "meta-tag", "dns-txt"]] = None
    error: Optional[str] = None
