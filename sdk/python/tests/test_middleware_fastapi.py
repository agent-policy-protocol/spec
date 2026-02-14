"""Tests for apop.middleware.fastapi — FastAPI/Starlette Middleware."""

import json

import pytest

from apop.types import (
    AgentPolicy,
    MiddlewareOptions,
    PathPolicy,
    PolicyRule,
    RateLimit,
    Verification,
)


TEST_POLICY = AgentPolicy(
    version="1.0",
    policy_url="https://example.com/.well-known/agent-policy.json",
    default_policy=PolicyRule(
        allow=True,
        actions=["read", "render"],
        rate_limit=RateLimit(requests=100, window="hour"),
        require_verification=False,
    ),
    path_policies=[
        PathPolicy(path="/admin/*", allow=False),
        PathPolicy(
            path="/api/*",
            allow=True,
            agent_allowlist=["did:web:trusted.com"],
            require_verification=True,
        ),
    ],
    verification=Verification(method=["did", "pkix"]),
)


@pytest.fixture
def app():
    """Create a test FastAPI app with APoP middleware."""
    try:
        from fastapi import FastAPI
        from fastapi.testclient import TestClient

        from apop.middleware.fastapi import create_fastapi_middleware, create_discovery_route

        app = FastAPI()
        app.add_middleware(
            create_fastapi_middleware(MiddlewareOptions(policy=TEST_POLICY))
        )
        app.get("/.well-known/agent-policy.json")(create_discovery_route(TEST_POLICY))

        @app.get("/public/page")
        async def public_page():
            return {"message": "Hello"}

        @app.get("/admin/settings")
        async def admin_settings():
            return {"message": "Admin"}

        @app.get("/api/data")
        async def api_data():
            return {"message": "Data"}

        return app
    except ImportError:
        pytest.skip("FastAPI not installed")


@pytest.fixture
def client(app):
    """Create a test client."""
    from fastapi.testclient import TestClient
    return TestClient(app)


class TestFastAPIMiddleware:
    def test_pass_through_non_agent_requests(self, client):
        response = client.get("/public/page")
        assert response.status_code == 200
        assert response.headers.get("Agent-Policy-Version") == "1.0"

    def test_allow_agent_on_permitted_path(self, client):
        response = client.get(
            "/public/page",
            headers={"Agent-Name": "TestBot/1.0"},
        )
        assert response.status_code == 200
        assert response.headers.get("Agent-Policy-Status") == "allowed"

    def test_deny_agent_on_blocked_path(self, client):
        response = client.get(
            "/admin/settings",
            headers={"Agent-Name": "TestBot/1.0"},
        )
        assert response.status_code == 430
        body = response.json()
        assert body["error"] == "agent_action_not_allowed"

    def test_require_verification(self, client):
        response = client.get(
            "/api/data",
            headers={
                "Agent-Name": "TestBot/1.0",
                "Agent-Id": "did:web:trusted.com",
            },
        )
        assert response.status_code == 439
        body = response.json()
        assert body["error"] == "agent_verification_required"

    def test_set_policy_url_header(self, client):
        response = client.get(
            "/public/page",
            headers={"Agent-Name": "TestBot/1.0"},
        )
        assert (
            response.headers.get("agent-policy")
            == "https://example.com/.well-known/agent-policy.json"
        )


class TestDiscoveryRoute:
    def test_serve_policy_as_json(self, client):
        response = client.get("/.well-known/agent-policy.json")
        assert response.status_code == 200
        body = response.json()
        assert body["version"] == "1.0"
        assert "defaultPolicy" in body
