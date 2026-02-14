"""
APoP v1.0 — Flask Middleware

Drop-in middleware that enforces APoP policies on Flask apps.

Usage::

    from flask import Flask
    from apop.middleware.flask import create_flask_middleware, create_flask_discovery
    from apop.parser import parse_policy_file
    from apop.types import MiddlewareOptions

    app = Flask(__name__)
    result = parse_policy_file("agent-policy.json")

    # Register enforcement middleware
    create_flask_middleware(app, MiddlewareOptions(policy=result.policy))

    # Register discovery endpoint
    create_flask_discovery(app, result.policy)
"""

from __future__ import annotations

from typing import Any

from apop.enforcer import enforce
from apop.headers import is_agent, parse_request_headers
from apop.types import AgentPolicy, MiddlewareOptions, RequestContext


def create_flask_middleware(app: Any, options: MiddlewareOptions) -> None:
    """
    Register APoP enforcement as a Flask before_request hook.

    Args:
        app: Flask application instance.
        options: Middleware options including the policy to enforce.
    """
    from flask import jsonify, request

    policy = options.policy
    skip_non_agents = options.skip_non_agents

    @app.before_request
    def apop_enforce() -> Any:
        # Parse agent headers
        agent_headers = parse_request_headers(dict(request.headers))

        # Skip non-agent requests if configured
        if skip_non_agents and not is_agent(agent_headers):
            return None

        # Enforce policy
        result = enforce(
            policy,
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
            response = jsonify(result.body)
            response.status_code = result.http_status
            for key, value in result.headers.items():
                response.headers[key] = value
            return response

        # Allowed — store result for after_request to set headers
        request._apop_result = result  # type: ignore[attr-defined]
        return None

    @app.after_request
    def apop_headers(response: Any) -> Any:
        # Always set discovery headers
        if policy.policy_url:
            response.headers["Agent-Policy"] = policy.policy_url
        response.headers["Agent-Policy-Version"] = policy.version or "1.0"

        # Set enforcement headers if available
        apop_result = getattr(request, "_apop_result", None)
        if apop_result:
            for key, value in apop_result.headers.items():
                response.headers[key] = value

        return response


def create_flask_discovery(app: Any, policy: AgentPolicy) -> None:
    """
    Register the well-known APoP discovery endpoint on a Flask app.

    Args:
        app: Flask application instance.
        policy: The APoP policy to serve.
    """
    from flask import jsonify

    @app.route("/.well-known/agent-policy.json", methods=["GET"])
    def apop_discovery() -> Any:
        # Import here to avoid circular dependency
        from apop.middleware.fastapi import _policy_to_dict

        response = jsonify(_policy_to_dict(policy))
        response.headers["Content-Type"] = "application/json"
        response.headers["Cache-Control"] = "public, max-age=3600"
        return response
