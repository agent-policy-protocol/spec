"""Tests for apop.middleware.flask — Flask Middleware."""

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
    """Create a test Flask app with APoP middleware."""
    try:
        from flask import Flask

        from apop.middleware.flask import create_flask_discovery, create_flask_middleware

        app = Flask(__name__)
        app.config["TESTING"] = True

        create_flask_middleware(app, MiddlewareOptions(policy=TEST_POLICY))
        create_flask_discovery(app, TEST_POLICY)

        @app.route("/public/page")
        def public_page():
            return {"message": "Hello"}

        @app.route("/admin/settings")
        def admin_settings():
            return {"message": "Admin"}

        @app.route("/api/data")
        def api_data():
            return {"message": "Data"}

        return app
    except ImportError:
        pytest.skip("Flask not installed")


@pytest.fixture
def client(app):
    """Create a test client."""
    return app.test_client()


class TestFlaskMiddleware:
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
        body = response.get_json()
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
        body = response.get_json()
        assert body["error"] == "agent_verification_required"

    def test_set_policy_url_header(self, client):
        response = client.get(
            "/public/page",
            headers={"Agent-Name": "TestBot/1.0"},
        )
        assert (
            response.headers.get("Agent-Policy")
            == "https://example.com/.well-known/agent-policy.json"
        )


class TestFlaskDiscovery:
    def test_serve_policy_as_json(self, client):
        response = client.get("/.well-known/agent-policy.json")
        assert response.status_code == 200
        body = response.get_json()
        assert body["version"] == "1.0"
        assert "defaultPolicy" in body
