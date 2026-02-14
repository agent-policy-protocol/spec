"""Tests for apop.discovery — Policy Discovery Chain."""

import json

import httpx
import pytest

from apop.discovery import DiscoveryOptions, discover_policy


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

VALID_POLICY_JSON = json.dumps({
    "version": "1.0",
    "defaultPolicy": {"allow": True},
})


def _make_mock_transport(routes: dict[str, httpx.Response]) -> httpx.MockTransport:
    """Create a mock transport that returns predefined responses for URLs."""

    def handler(request: httpx.Request) -> httpx.Response:
        url = str(request.url)
        for pattern, response in routes.items():
            if pattern in url:
                return response
        return httpx.Response(404, text="Not found")

    return httpx.MockTransport(handler)


# ---------------------------------------------------------------------------
# Discovery tests
# ---------------------------------------------------------------------------


class TestDiscoverPolicy:
    @pytest.mark.asyncio
    async def test_discover_from_well_known(self):
        transport = _make_mock_transport({
            "/.well-known/agent-policy.json": httpx.Response(
                200,
                text=VALID_POLICY_JSON,
                headers={"content-type": "application/json"},
            ),
        })
        client = httpx.AsyncClient(transport=transport)
        result = await discover_policy(
            "example.com",
            DiscoveryOptions(http_client=client),
        )
        assert result.policy is not None
        assert result.method == "well-known"
        assert result.policy_url is not None
        assert "agent-policy.json" in result.policy_url

    @pytest.mark.asyncio
    async def test_discover_from_http_header(self):
        policy_url = "https://example.com/custom/policy.json"
        transport = _make_mock_transport({
            "/.well-known/agent-policy.json": httpx.Response(404),
            "example.com/custom/policy.json": httpx.Response(
                200,
                text=VALID_POLICY_JSON,
                headers={"content-type": "application/json"},
            ),
            "example.com/": httpx.Response(
                200,
                text="<html></html>",
                headers={"Agent-Policy": policy_url},
            ),
        })

        # Need special handling since the root URL and well-known URL overlap
        call_count = {"root": 0}

        def handler(request: httpx.Request) -> httpx.Response:
            url = str(request.url)
            if "/.well-known/agent-policy.json" in url:
                return httpx.Response(404)
            if url == policy_url:
                return httpx.Response(200, text=VALID_POLICY_JSON)
            if url.rstrip("/") == "https://example.com":
                call_count["root"] += 1
                return httpx.Response(
                    200,
                    text="<html></html>",
                    headers={"Agent-Policy": policy_url},
                )
            return httpx.Response(404)

        transport2 = httpx.MockTransport(handler)
        client = httpx.AsyncClient(transport=transport2)
        result = await discover_policy(
            "example.com",
            DiscoveryOptions(http_client=client),
        )
        assert result.policy is not None
        assert result.method == "http-header"

    @pytest.mark.asyncio
    async def test_discover_from_meta_tag(self):
        policy_url = "https://example.com/meta-policy.json"
        html = f'<html><head><meta name="agent-policy" content="{policy_url}"></head></html>'

        def handler(request: httpx.Request) -> httpx.Response:
            url = str(request.url)
            if "/.well-known/agent-policy.json" in url:
                return httpx.Response(404)
            if url == policy_url:
                return httpx.Response(200, text=VALID_POLICY_JSON)
            if url.rstrip("/") == "https://example.com":
                return httpx.Response(200, text=html)
            return httpx.Response(404)

        transport = httpx.MockTransport(handler)
        client = httpx.AsyncClient(transport=transport)
        result = await discover_policy(
            "example.com",
            DiscoveryOptions(http_client=client),
        )
        assert result.policy is not None
        assert result.method == "meta-tag"

    @pytest.mark.asyncio
    async def test_discover_from_dns_txt(self):
        policy_url = "https://example.com/dns-policy.json"

        def handler(request: httpx.Request) -> httpx.Response:
            url = str(request.url)
            if "/.well-known/agent-policy.json" in url:
                return httpx.Response(404)
            if url == policy_url:
                return httpx.Response(200, text=VALID_POLICY_JSON)
            if url.rstrip("/") == "https://example.com":
                return httpx.Response(200, text="<html>no meta</html>")
            return httpx.Response(404)

        async def dns_resolve(hostname: str, rrtype: str) -> list[list[str]]:
            return [["apop=1 v=1.0 policy=" + policy_url]]

        transport = httpx.MockTransport(handler)
        client = httpx.AsyncClient(transport=transport)
        result = await discover_policy(
            "example.com",
            DiscoveryOptions(http_client=client, dns_resolve=dns_resolve),
        )
        assert result.policy is not None
        assert result.method == "dns-txt"

    @pytest.mark.asyncio
    async def test_return_none_when_all_fail(self):
        def handler(request: httpx.Request) -> httpx.Response:
            return httpx.Response(404)

        async def dns_resolve(hostname: str, rrtype: str) -> list[list[str]]:
            raise Exception("DNS lookup failed")

        transport = httpx.MockTransport(handler)
        client = httpx.AsyncClient(transport=transport)
        result = await discover_policy(
            "example.com",
            DiscoveryOptions(http_client=client, dns_resolve=dns_resolve),
        )
        assert result.policy is None
        assert result.error is not None

    @pytest.mark.asyncio
    async def test_prefer_well_known_over_header(self):
        policy_url = "https://example.com/alt-policy.json"

        def handler(request: httpx.Request) -> httpx.Response:
            url = str(request.url)
            if "/.well-known/agent-policy.json" in url:
                return httpx.Response(200, text=VALID_POLICY_JSON)
            if url.rstrip("/") == "https://example.com":
                return httpx.Response(
                    200,
                    text="<html></html>",
                    headers={"Agent-Policy": policy_url},
                )
            return httpx.Response(404)

        transport = httpx.MockTransport(handler)
        client = httpx.AsyncClient(transport=transport)
        result = await discover_policy(
            "example.com",
            DiscoveryOptions(http_client=client),
        )
        assert result.method == "well-known"
