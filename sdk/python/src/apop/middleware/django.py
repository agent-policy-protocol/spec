"""
APoP v1.0 — Django Middleware

Drop-in middleware that enforces APoP policies on Django apps.

Usage::

    # settings.py
    MIDDLEWARE = [
        # ... other middleware ...
        'apop.middleware.django.APoPMiddleware',
    ]

    APOP_POLICY_FILE = BASE_DIR / "agent-policy.json"

    # Or provide inline:
    APOP_POLICY = {
        "version": "1.0",
        "defaultPolicy": {"allow": True}
    }
"""

from __future__ import annotations

import json
from typing import Any, Callable

from apop.enforcer import enforce
from apop.headers import is_agent, parse_request_headers
from apop.parser import parse_policy, parse_policy_file
from apop.types import AgentPolicy, MiddlewareOptions, RequestContext


class APoPMiddleware:
    """
    Django middleware that enforces APoP policies.

    Configure via Django settings:
        - APOP_POLICY_FILE: Path to agent-policy.json
        - APOP_POLICY: Inline policy dict (alternative to file)
        - APOP_SKIP_NON_AGENTS: Whether to skip non-agent requests (default: True)
    """

    def __init__(self, get_response: Callable[..., Any]) -> None:
        self.get_response = get_response
        self._policy: AgentPolicy | None = None
        self._skip_non_agents: bool = True
        self._initialized = False

    def _ensure_initialized(self) -> None:
        if self._initialized:
            return

        from django.conf import settings

        # Load policy from settings
        policy_file = getattr(settings, "APOP_POLICY_FILE", None)
        policy_dict = getattr(settings, "APOP_POLICY", None)
        self._skip_non_agents = getattr(settings, "APOP_SKIP_NON_AGENTS", True)

        if policy_file:
            result = parse_policy_file(str(policy_file))
            if result.valid and result.policy:
                self._policy = result.policy
            else:
                raise ValueError(
                    f"Invalid APoP policy file '{policy_file}': "
                    f"{result.errors}"
                )
        elif policy_dict:
            result = parse_policy(json.dumps(policy_dict))
            if result.valid and result.policy:
                self._policy = result.policy
            else:
                raise ValueError(f"Invalid APoP policy: {result.errors}")
        else:
            raise ValueError(
                "APoP middleware requires either APOP_POLICY_FILE or APOP_POLICY in settings."
            )

        self._initialized = True

    def __call__(self, request: Any) -> Any:
        from django.http import JsonResponse

        self._ensure_initialized()
        assert self._policy is not None

        # Parse agent headers from Django request
        headers: dict[str, str] = {}
        for key, value in request.META.items():
            if key.startswith("HTTP_"):
                # Convert HTTP_AGENT_NAME → agent-name
                header_name = key[5:].lower().replace("_", "-")
                headers[header_name] = value

        agent_headers = parse_request_headers(headers)

        # Skip non-agent requests if configured
        if self._skip_non_agents and not is_agent(agent_headers):
            response = self.get_response(request)
            if self._policy.policy_url:
                response["Agent-Policy"] = self._policy.policy_url
            response["Agent-Policy-Version"] = self._policy.version or "1.0"
            return response

        # Enforce policy
        result = enforce(
            self._policy,
            RequestContext(
                path=request.path,
                agent_name=agent_headers.agent_name,
                agent_intent=agent_headers.agent_intent,
                agent_id=agent_headers.agent_id,
                agent_signature=agent_headers.agent_signature,
                agent_vc=agent_headers.agent_vc,
                agent_card=agent_headers.agent_card,
                agent_key_id=agent_headers.agent_key_id,
            ),
        )

        # If denied or verification-required, return error
        if result.status != "allowed":
            response = JsonResponse(result.body, status=result.http_status)
            for key, value in result.headers.items():
                response[key] = value
            return response

        # Allowed — continue to next middleware
        response = self.get_response(request)
        for key, value in result.headers.items():
            response[key] = value
        return response
