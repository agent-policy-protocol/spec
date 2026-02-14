"""
APoP v1.0 — FastAPI / Starlette Middleware

Drop-in middleware that enforces APoP policies on FastAPI and Starlette apps.

Usage::

    from fastapi import FastAPI
    from apop.middleware.fastapi import create_apop_middleware
    from apop.parser import parse_policy_file

    app = FastAPI()
    result = parse_policy_file("agent-policy.json")
    app.add_middleware(create_apop_middleware(result.policy))

Or as a dependency::

    from apop.middleware.fastapi import APoPDependency

    apop = APoPDependency(policy=result.policy)

    @app.get("/data")
    async def get_data(enforcement=Depends(apop)):
        return {"status": "ok"}
"""

from __future__ import annotations

from typing import Any, Optional

from apop.enforcer import enforce
from apop.headers import is_agent, parse_request_headers
from apop.types import AgentPolicy, EnforcementResult, MiddlewareOptions


def create_fastapi_middleware(
    options: MiddlewareOptions,
) -> Any:
    """
    Create a Starlette/FastAPI middleware class that enforces APoP policies.

    Args:
        options: Middleware options including the policy to enforce.

    Returns:
        A Starlette-compatible middleware class.

    Example::

        from fastapi import FastAPI
        from apop.middleware.fastapi import create_fastapi_middleware
        from apop.types import MiddlewareOptions

        app = FastAPI()
        app.add_middleware(
            create_fastapi_middleware(MiddlewareOptions(policy=policy))
        )
    """
    from starlette.middleware.base import BaseHTTPMiddleware
    from starlette.requests import Request
    from starlette.responses import JSONResponse, Response

    policy = options.policy
    skip_non_agents = options.skip_non_agents

    class APoPMiddleware(BaseHTTPMiddleware):
        async def dispatch(self, request: Request, call_next: Any) -> Response:
            # Set discovery headers on all responses
            agent_headers = parse_request_headers(dict(request.headers))

            # Skip non-agent requests if configured
            if skip_non_agents and not is_agent(agent_headers):
                response = await call_next(request)
                if policy.policy_url:
                    response.headers["Agent-Policy"] = policy.policy_url
                response.headers["Agent-Policy-Version"] = policy.version or "1.0"
                return response

            # Enforce policy
            result = enforce(
                policy,
                _request_to_context(request, agent_headers),
            )

            # If denied or verification-required, return error
            if result.status != "allowed":
                response = JSONResponse(
                    content=result.body,
                    status_code=result.http_status,
                )
                for key, value in result.headers.items():
                    response.headers[key] = value
                return response

            # Allowed — continue to next middleware
            response = await call_next(request)
            for key, value in result.headers.items():
                response.headers[key] = value
            return response

    return APoPMiddleware


def create_discovery_route(policy: AgentPolicy) -> Any:
    """
    Create a FastAPI/Starlette route handler for the well-known discovery endpoint.

    Args:
        policy: The APoP policy to serve.

    Returns:
        An async function suitable as a FastAPI route handler.

    Example::

        from fastapi import FastAPI
        from apop.middleware.fastapi import create_discovery_route

        app = FastAPI()
        app.get("/.well-known/agent-policy.json")(create_discovery_route(policy))
    """
    from starlette.responses import JSONResponse

    async def discovery_endpoint() -> JSONResponse:
        return JSONResponse(
            content=_policy_to_dict(policy),
            headers={
                "Content-Type": "application/json",
                "Cache-Control": "public, max-age=3600",
            },
        )

    return discovery_endpoint


def _request_to_context(request: Any, agent_headers: Any) -> Any:
    """Convert a Starlette Request + parsed agent headers to a RequestContext."""
    from apop.types import RequestContext

    return RequestContext(
        path=request.url.path,
        agent_name=agent_headers.agent_name,
        agent_intent=agent_headers.agent_intent,
        agent_id=agent_headers.agent_id,
        agent_signature=agent_headers.agent_signature,
        agent_vc=agent_headers.agent_vc,
        agent_card=agent_headers.agent_card,
        agent_key_id=agent_headers.agent_key_id,
    )


def _policy_to_dict(policy: AgentPolicy) -> dict[str, Any]:
    """Convert an AgentPolicy dataclass to a JSON-serializable dict with camelCase keys."""
    result: dict[str, Any] = {"version": policy.version}
    if policy.schema_url:
        result["$schema"] = policy.schema_url
    if policy.policy_url:
        result["policyUrl"] = policy.policy_url

    # defaultPolicy
    dp = policy.default_policy
    default_dict: dict[str, Any] = {"allow": dp.allow}
    if dp.disallow:
        default_dict["disallow"] = dp.disallow
    if dp.actions:
        default_dict["actions"] = dp.actions
    if dp.rate_limit:
        default_dict["rateLimit"] = {
            "requests": dp.rate_limit.requests,
            "window": dp.rate_limit.window,
        }
    if dp.require_verification:
        default_dict["requireVerification"] = dp.require_verification
    result["defaultPolicy"] = default_dict

    if policy.path_policies:
        paths = []
        for pp in policy.path_policies:
            pd: dict[str, Any] = {"path": pp.path}
            if pp.allow is not None:
                pd["allow"] = pp.allow
            if pp.disallow:
                pd["disallow"] = pp.disallow
            if pp.actions:
                pd["actions"] = pp.actions
            if pp.rate_limit:
                pd["rateLimit"] = {
                    "requests": pp.rate_limit.requests,
                    "window": pp.rate_limit.window,
                }
            if pp.require_verification is not None:
                pd["requireVerification"] = pp.require_verification
            if pp.agent_allowlist:
                pd["agentAllowlist"] = pp.agent_allowlist
            if pp.agent_denylist:
                pd["agentDenylist"] = pp.agent_denylist
            paths.append(pd)
        result["pathPolicies"] = paths

    if policy.verification:
        v: dict[str, Any] = {"method": policy.verification.method}
        if policy.verification.registry:
            v["registry"] = policy.verification.registry
        if policy.verification.trusted_issuers:
            v["trustedIssuers"] = policy.verification.trusted_issuers
        if policy.verification.verification_endpoint:
            v["verificationEndpoint"] = policy.verification.verification_endpoint
        result["verification"] = v

    if policy.contact:
        c: dict[str, Any] = {}
        if policy.contact.email:
            c["email"] = policy.contact.email
        if policy.contact.policy_url:
            c["policyUrl"] = policy.contact.policy_url
        if policy.contact.abuse_url:
            c["abuseUrl"] = policy.contact.abuse_url
        result["contact"] = c

    if policy.metadata:
        m: dict[str, Any] = {}
        if policy.metadata.description:
            m["description"] = policy.metadata.description
        if policy.metadata.owner:
            m["owner"] = policy.metadata.owner
        if policy.metadata.maintainer:
            m["maintainer"] = policy.metadata.maintainer
        if policy.metadata.last_modified:
            m["lastModified"] = policy.metadata.last_modified
        if policy.metadata.license:
            m["license"] = policy.metadata.license
        result["metadata"] = m

    if policy.interop:
        i: dict[str, Any] = {}
        if policy.interop.a2a_agent_card:
            i["a2aAgentCard"] = policy.interop.a2a_agent_card
        if policy.interop.mcp_server_url:
            i["mcpServerUrl"] = policy.interop.mcp_server_url
        if policy.interop.webmcp_enabled is not None:
            i["webmcpEnabled"] = policy.interop.webmcp_enabled
        if policy.interop.ucp_capabilities:
            i["ucpCapabilities"] = policy.interop.ucp_capabilities
        if policy.interop.apaai_endpoint:
            i["apaaiEndpoint"] = policy.interop.apaai_endpoint
        result["interop"] = i

    return result
