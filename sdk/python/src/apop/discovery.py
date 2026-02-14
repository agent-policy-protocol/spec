"""
APoP v1.0 — Policy Discovery

Implements the 4-method discovery chain per spec/discovery.md:
  1. Well-known URI: GET /.well-known/agent-policy.json
  2. HTTP header: Agent-Policy response header
  3. HTML meta tag: <meta name="agent-policy" content="{url}">
  4. DNS TXT record: _agentpolicy.{domain} with apop=1 policy={url}

Each step only runs if the previous one fails.
"""

from __future__ import annotations

import asyncio
import re
from dataclasses import dataclass, field
from typing import Any, Callable, Coroutine, Optional

import httpx

from apop.parser import parse_policy
from apop.types import DiscoveryResult


@dataclass
class DiscoveryOptions:
    """Options for the discovery process."""

    timeout: float = 10.0
    """Request timeout in seconds. Default: 10s."""

    max_retries: int = 3
    """Maximum retries for 5xx errors on well-known URI. Default: 3."""

    http_client: Optional[httpx.AsyncClient] = None
    """Custom httpx async client (for testing). Defaults to creating a new one."""

    dns_resolve: Optional[Callable[[str, str], Coroutine[Any, Any, list[list[str]]]]] = None
    """Custom DNS resolver (for testing). Defaults to dnspython or asyncio resolver."""


async def discover_policy(
    domain: str,
    options: Optional[DiscoveryOptions] = None,
) -> DiscoveryResult:
    """
    Discover the APoP policy for a domain using the 4-method fallback chain.

    Args:
        domain: The domain to discover the policy for (e.g. "example.com").
        options: Optional discovery settings.

    Returns:
        DiscoveryResult with the discovered policy or error info.
    """
    opts = options or DiscoveryOptions()
    client = opts.http_client or httpx.AsyncClient(timeout=opts.timeout, follow_redirects=True)
    should_close = opts.http_client is None

    try:
        # Step 1: Well-known URI
        well_known_url = f"https://{domain}/.well-known/agent-policy.json"
        step1 = await _try_well_known(well_known_url, client, opts.max_retries)
        if step1:
            return step1

        # Step 2: HTTP header on root page
        step2 = await _try_http_header(domain, client)
        if step2:
            return step2

        # Step 3: HTML meta tag on root page
        step3 = await _try_meta_tag(domain, client)
        if step3:
            return step3

        # Step 4: DNS TXT record
        step4 = await _try_dns_txt(domain, client, opts.dns_resolve)
        if step4:
            return step4

        # No policy found
        return DiscoveryResult(
            policy=None,
            error=f"No APoP policy found for domain: {domain}",
        )
    finally:
        if should_close:
            await client.aclose()


# ---------------------------------------------------------------------------
# Step 1: Well-Known URI
# ---------------------------------------------------------------------------


async def _try_well_known(
    url: str,
    client: httpx.AsyncClient,
    max_retries: int,
) -> Optional[DiscoveryResult]:
    for attempt in range(max_retries + 1):
        try:
            response = await client.get(url)

            if response.status_code == 200:
                result = parse_policy(response.text)
                if result.valid and result.policy:
                    return DiscoveryResult(
                        policy=result.policy,
                        policy_url=url,
                        method="well-known",
                    )
                return None  # Invalid JSON, try next method

            if response.status_code == 404:
                return None  # Not found, try next method

            # 5xx — retry with exponential backoff
            if response.status_code >= 500 and attempt < max_retries:
                await asyncio.sleep(2**attempt * 0.5)
                continue

            return None
        except (httpx.HTTPError, Exception):
            if attempt < max_retries:
                await asyncio.sleep(2**attempt * 0.5)
                continue
            return None

    return None


# ---------------------------------------------------------------------------
# Step 2: HTTP Response Header
# ---------------------------------------------------------------------------


async def _try_http_header(
    domain: str,
    client: httpx.AsyncClient,
) -> Optional[DiscoveryResult]:
    try:
        response = await client.get(f"https://{domain}/")
        policy_header = response.headers.get("agent-policy") or response.headers.get(
            "Agent-Policy"
        )
        if not policy_header:
            return None

        return await _fetch_and_parse_policy(policy_header, "http-header", client)
    except (httpx.HTTPError, Exception):
        return None


# ---------------------------------------------------------------------------
# Step 3: HTML Meta Tag
# ---------------------------------------------------------------------------


async def _try_meta_tag(
    domain: str,
    client: httpx.AsyncClient,
) -> Optional[DiscoveryResult]:
    try:
        response = await client.get(f"https://{domain}/")
        html = response.text

        # Try name before content
        match = re.search(
            r'<meta\s+name=["\']agent-policy["\']\s+content=["\']([^"\']+)["\']',
            html,
            re.IGNORECASE,
        )
        if not match:
            # Try content before name
            match = re.search(
                r'<meta\s+content=["\']([^"\']+)["\']\s+name=["\']agent-policy["\']',
                html,
                re.IGNORECASE,
            )
        if not match:
            return None

        return await _fetch_and_parse_policy(match.group(1), "meta-tag", client)
    except (httpx.HTTPError, Exception):
        return None


# ---------------------------------------------------------------------------
# Step 4: DNS TXT Record
# ---------------------------------------------------------------------------


async def _try_dns_txt(
    domain: str,
    client: httpx.AsyncClient,
    custom_resolve: Optional[Callable[..., Coroutine[Any, Any, list[list[str]]]]] = None,
) -> Optional[DiscoveryResult]:
    try:
        records: list[list[str]]

        if custom_resolve:
            records = await custom_resolve(f"_agentpolicy.{domain}", "TXT")
        else:
            # Use asyncio DNS resolver
            try:
                import dns.asyncresolver  # type: ignore[import-untyped]

                answers = await dns.asyncresolver.resolve(f"_agentpolicy.{domain}", "TXT")
                records = [[rdata.to_text().strip('"') for rdata in answer.strings] for answer in answers]  # type: ignore[attr-defined]
            except ImportError:
                # Fallback: use socket-level resolution (limited)
                loop = asyncio.get_event_loop()
                try:
                    import socket

                    result = await loop.getaddrinfo(
                        f"_agentpolicy.{domain}", None, type=socket.SOCK_STREAM
                    )
                    # getaddrinfo can't resolve TXT records; skip DNS step
                    return None
                except (socket.gaierror, OSError):
                    return None
            except Exception:
                return None

        for record in records:
            txt = "".join(record)
            if "apop=1" not in txt:
                continue
            policy_match = re.search(r"policy=(\S+)", txt)
            if not policy_match:
                continue

            return await _fetch_and_parse_policy(
                policy_match.group(1), "dns-txt", client
            )

        return None
    except Exception:
        return None


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


async def _fetch_and_parse_policy(
    url: str,
    method: str,
    client: httpx.AsyncClient,
) -> Optional[DiscoveryResult]:
    try:
        response = await client.get(url)
        if response.status_code != 200:
            return None

        result = parse_policy(response.text)
        if result.valid and result.policy:
            return DiscoveryResult(
                policy=result.policy,
                policy_url=url,
                method=method,  # type: ignore[arg-type]
            )
        return None
    except (httpx.HTTPError, Exception):
        return None
