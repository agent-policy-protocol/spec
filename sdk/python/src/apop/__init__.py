"""
Agent Policy Protocol (APoP) SDK for Python.

The authorization & consent layer for the agentic web.
Like robots.txt, but for AI agents — with fine-grained access control,
identity verification, and cross-protocol interoperability.
"""

__version__ = "1.0.0"

# Types
from apop.types import (
    ACTION_TYPES,
    APOP_STATUS_CODES,
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
)

# Parser
from apop.parser import get_schema, parse_policy, parse_policy_file, validate_policy
from apop.parser import ParseResult, ValidationError

# Matcher
from apop.matcher import match_path_policy, merge_policy, path_matches

# Enforcer
from apop.enforcer import enforce

# Headers
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

# Discovery
from apop.discovery import discover_policy, DiscoveryOptions

__all__ = [
    # Types
    "ActionType",
    "ACTION_TYPES",
    "AgentPolicy",
    "AgentRequestHeaders",
    "AgentResponseHeaders",
    "APOP_STATUS_CODES",
    "Contact",
    "DiscoveryResult",
    "EnforcementResult",
    "EnforcementStatus",
    "Interoperability",
    "Metadata",
    "MiddlewareOptions",
    "PathPolicy",
    "PolicyRule",
    "PolicyStatus",
    "RateLimit",
    "RateLimitWindow",
    "RequestContext",
    "Verification",
    "VerificationMethod",
    # Parser
    "parse_policy",
    "validate_policy",
    "parse_policy_file",
    "get_schema",
    "ParseResult",
    "ValidationError",
    # Matcher
    "path_matches",
    "match_path_policy",
    "merge_policy",
    # Enforcer
    "enforce",
    # Headers
    "parse_request_headers",
    "is_agent",
    "parse_intents",
    "build_discovery_headers",
    "build_allowed_headers",
    "build_denied_headers",
    "build_verification_headers",
    "build_rate_limited_headers",
    # Discovery
    "discover_policy",
    "DiscoveryOptions",
]
