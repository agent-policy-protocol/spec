"""
APoP v1.0 — Policy Parser & Validator

Parses and validates agent-policy.json against the APoP JSON Schema
using jsonschema with JSON Schema draft 2020-12 support.
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Optional

import jsonschema

from apop.types import (
    AgentPolicy,
    Contact,
    Interoperability,
    Metadata,
    PathPolicy,
    PolicyRule,
    RateLimit,
    Verification,
)

# ---------------------------------------------------------------------------
# Inline APoP JSON Schema (self-contained SDK)
# ---------------------------------------------------------------------------

APOP_SCHEMA: dict[str, Any] = {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "$id": "https://agentpolicy.org/schema/v1/agent-policy.schema.json",
    "title": "Agent Policy Protocol (APoP) v1.0 Manifest",
    "description": (
        "Defines how AI agents may interact with a website — what they can access, "
        "what actions are allowed, rate limits, and verification requirements."
    ),
    "type": "object",
    "required": ["version", "defaultPolicy"],
    "properties": {
        "$schema": {
            "type": "string",
            "description": "Reference to this JSON Schema for validation.",
            "format": "uri",
        },
        "version": {
            "type": "string",
            "description": "APoP protocol version. Use '1.0' for this specification.",
            "enum": ["0.1", "1.0"],
            "default": "1.0",
        },
        "policyUrl": {
            "type": "string",
            "description": "Canonical URL where this policy is hosted.",
            "format": "uri",
        },
        "defaultPolicy": {
            "$ref": "#/$defs/PolicyRule",
            "description": (
                "Site-wide fallback rules. Applies when no path-specific rule matches."
            ),
        },
        "pathPolicies": {
            "type": "array",
            "description": (
                "Path-specific policy overrides. Evaluated in order; first matching path wins."
            ),
            "items": {"$ref": "#/$defs/PathPolicy"},
        },
        "verification": {
            "$ref": "#/$defs/Verification",
            "description": "Configuration for how agent identity verification is handled.",
        },
        "contact": {
            "$ref": "#/$defs/Contact",
            "description": "Contact information for policy questions.",
        },
        "metadata": {
            "$ref": "#/$defs/Metadata",
            "description": "Human-readable metadata about this policy.",
        },
        "interop": {
            "$ref": "#/$defs/Interoperability",
            "description": "Optional cross-protocol interoperability declarations.",
        },
    },
    "additionalProperties": False,
    "$defs": {
        "ActionType": {
            "type": "string",
            "description": "Standardized action type that an agent may perform.",
            "enum": [
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
            ],
        },
        "RateLimit": {
            "type": "object",
            "description": "Rate limiting configuration for agent requests.",
            "required": ["requests", "window"],
            "properties": {
                "requests": {
                    "type": "integer",
                    "description": (
                        "Maximum number of requests allowed within the specified window."
                    ),
                    "minimum": 0,
                },
                "window": {
                    "type": "string",
                    "description": "Time window for rate limiting.",
                    "enum": ["minute", "hour", "day"],
                },
            },
            "additionalProperties": False,
        },
        "PolicyRule": {
            "type": "object",
            "description": "A set of rules governing agent access.",
            "required": ["allow"],
            "properties": {
                "allow": {
                    "oneOf": [
                        {"type": "boolean"},
                        {"type": "array", "items": {"$ref": "#/$defs/ActionType"}},
                    ],
                },
                "disallow": {
                    "type": "array",
                    "items": {"$ref": "#/$defs/ActionType"},
                },
                "actions": {
                    "type": "array",
                    "items": {"$ref": "#/$defs/ActionType"},
                },
                "rateLimit": {"$ref": "#/$defs/RateLimit"},
                "requireVerification": {
                    "type": "boolean",
                    "default": False,
                },
            },
            "additionalProperties": False,
        },
        "PathPolicy": {
            "type": "object",
            "description": "Path-specific policy override.",
            "required": ["path"],
            "properties": {
                "path": {"type": "string"},
                "allow": {
                    "oneOf": [
                        {"type": "boolean"},
                        {"type": "array", "items": {"$ref": "#/$defs/ActionType"}},
                    ],
                },
                "disallow": {
                    "type": "array",
                    "items": {"$ref": "#/$defs/ActionType"},
                },
                "actions": {
                    "type": "array",
                    "items": {"$ref": "#/$defs/ActionType"},
                },
                "rateLimit": {"$ref": "#/$defs/RateLimit"},
                "requireVerification": {"type": "boolean", "default": False},
                "agentAllowlist": {
                    "type": "array",
                    "items": {"type": "string"},
                },
                "agentDenylist": {
                    "type": "array",
                    "items": {"type": "string"},
                },
            },
            "additionalProperties": False,
        },
        "Verification": {
            "type": "object",
            "description": "Configuration for agent identity verification.",
            "required": ["method"],
            "properties": {
                "method": {
                    "oneOf": [
                        {
                            "type": "string",
                            "enum": [
                                "pkix",
                                "did",
                                "verifiable-credential",
                                "partner-token",
                            ],
                        },
                        {
                            "type": "array",
                            "items": {
                                "type": "string",
                                "enum": [
                                    "pkix",
                                    "did",
                                    "verifiable-credential",
                                    "partner-token",
                                ],
                            },
                        },
                    ],
                },
                "registry": {"type": "string", "format": "uri"},
                "trustedIssuers": {
                    "type": "array",
                    "items": {"type": "string"},
                },
                "verificationEndpoint": {"type": "string", "format": "uri"},
            },
            "additionalProperties": False,
        },
        "Contact": {
            "type": "object",
            "properties": {
                "email": {"type": "string", "format": "email"},
                "policyUrl": {"type": "string", "format": "uri"},
                "abuseUrl": {"type": "string", "format": "uri"},
            },
            "additionalProperties": False,
        },
        "Metadata": {
            "type": "object",
            "properties": {
                "description": {"type": "string"},
                "owner": {"type": "string"},
                "maintainer": {"type": "string"},
                "lastModified": {"type": "string", "format": "date-time"},
                "license": {"type": "string"},
            },
            "additionalProperties": False,
        },
        "Interoperability": {
            "type": "object",
            "properties": {
                "a2aAgentCard": {"type": "string", "format": "uri"},
                "mcpServerUrl": {"type": "string", "format": "uri"},
                "webmcpEnabled": {"type": "boolean", "default": False},
                "ucpCapabilities": {"type": "string", "format": "uri"},
                "apaaiEndpoint": {"type": "string", "format": "uri"},
            },
            "additionalProperties": False,
        },
    },
}


# ---------------------------------------------------------------------------
# Result Types
# ---------------------------------------------------------------------------


@dataclass
class ValidationError:
    """A single validation error."""

    path: str
    message: str


@dataclass
class ParseResult:
    """Result of parsing and validating an APoP policy."""

    valid: bool
    policy: Optional[AgentPolicy] = None
    errors: Optional[list[ValidationError]] = None


# ---------------------------------------------------------------------------
# Conversion helpers (dict → dataclass)
# ---------------------------------------------------------------------------


def _dict_to_rate_limit(data: dict[str, Any]) -> RateLimit:
    return RateLimit(requests=data["requests"], window=data["window"])


def _dict_to_policy_rule(data: dict[str, Any]) -> PolicyRule:
    return PolicyRule(
        allow=data["allow"],
        disallow=data.get("disallow"),
        actions=data.get("actions"),
        rate_limit=_dict_to_rate_limit(data["rateLimit"]) if "rateLimit" in data else None,
        require_verification=data.get("requireVerification", False),
    )


def _dict_to_path_policy(data: dict[str, Any]) -> PathPolicy:
    return PathPolicy(
        path=data["path"],
        allow=data.get("allow"),
        disallow=data.get("disallow"),
        actions=data.get("actions"),
        rate_limit=_dict_to_rate_limit(data["rateLimit"]) if "rateLimit" in data else None,
        require_verification=data.get("requireVerification"),
        agent_allowlist=data.get("agentAllowlist"),
        agent_denylist=data.get("agentDenylist"),
    )


def _dict_to_verification(data: dict[str, Any]) -> Verification:
    return Verification(
        method=data["method"],
        registry=data.get("registry"),
        trusted_issuers=data.get("trustedIssuers"),
        verification_endpoint=data.get("verificationEndpoint"),
    )


def _dict_to_contact(data: dict[str, Any]) -> Contact:
    return Contact(
        email=data.get("email"),
        policy_url=data.get("policyUrl"),
        abuse_url=data.get("abuseUrl"),
    )


def _dict_to_metadata(data: dict[str, Any]) -> Metadata:
    return Metadata(
        description=data.get("description"),
        owner=data.get("owner"),
        maintainer=data.get("maintainer"),
        last_modified=data.get("lastModified"),
        license=data.get("license"),
    )


def _dict_to_interop(data: dict[str, Any]) -> Interoperability:
    return Interoperability(
        a2a_agent_card=data.get("a2aAgentCard"),
        mcp_server_url=data.get("mcpServerUrl"),
        webmcp_enabled=data.get("webmcpEnabled"),
        ucp_capabilities=data.get("ucpCapabilities"),
        apaai_endpoint=data.get("apaaiEndpoint"),
    )


def _dict_to_agent_policy(data: dict[str, Any]) -> AgentPolicy:
    """Convert a validated dict to an AgentPolicy dataclass."""
    return AgentPolicy(
        version=data["version"],
        default_policy=_dict_to_policy_rule(data["defaultPolicy"]),
        schema_url=data.get("$schema"),
        policy_url=data.get("policyUrl"),
        path_policies=(
            [_dict_to_path_policy(p) for p in data["pathPolicies"]]
            if "pathPolicies" in data
            else None
        ),
        verification=(
            _dict_to_verification(data["verification"]) if "verification" in data else None
        ),
        contact=_dict_to_contact(data["contact"]) if "contact" in data else None,
        metadata=_dict_to_metadata(data["metadata"]) if "metadata" in data else None,
        interop=_dict_to_interop(data["interop"]) if "interop" in data else None,
    )


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------


def parse_policy(json_str: str) -> ParseResult:
    """
    Parse a JSON string into an AgentPolicy and validate it against the APoP schema.

    Args:
        json_str: Raw JSON string of the agent-policy.json file.

    Returns:
        ParseResult with validity status, parsed policy, or errors.
    """
    try:
        data = json.loads(json_str)
    except json.JSONDecodeError as e:
        return ParseResult(
            valid=False,
            errors=[ValidationError(path="", message=f"Invalid JSON: {e}")],
        )
    return validate_policy(data)


def validate_policy(data: Any) -> ParseResult:
    """
    Validate a parsed object against the APoP schema.

    Args:
        data: Parsed policy object (dict) to validate.

    Returns:
        ParseResult with validity status, parsed policy, or errors.
    """
    validator = jsonschema.Draft202012Validator(APOP_SCHEMA)
    errors_list = list(validator.iter_errors(data))

    if errors_list:
        validation_errors = [
            ValidationError(
                path="/".join(str(p) for p in e.absolute_path) or "/",
                message=e.message,
            )
            for e in errors_list
        ]
        return ParseResult(valid=False, errors=validation_errors)

    return ParseResult(valid=True, policy=_dict_to_agent_policy(data))


def parse_policy_file(file_path: str | Path) -> ParseResult:
    """
    Load and validate an AgentPolicy from a file path.

    Args:
        file_path: Path to agent-policy.json.

    Returns:
        ParseResult with validity status, parsed policy, or errors.
    """
    content = Path(file_path).read_text(encoding="utf-8")
    return parse_policy(content)


def get_schema() -> dict[str, Any]:
    """Returns the raw APoP JSON Schema object."""
    return APOP_SCHEMA
