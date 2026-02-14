"""
APoP v1.0 — Path Matching Engine

Implements glob-style path matching per the APoP specification:
  - /foo/*  → matches /foo/bar but NOT /foo/bar/baz (single segment)
  - /foo/** → matches /foo/bar, /foo/bar/baz, etc. (recursive)
  - /foo    → matches only /foo (exact match)
"""

from __future__ import annotations

from copy import copy
from dataclasses import dataclass, field, fields
from typing import Optional

from apop.types import AgentPolicy, PathPolicy, PolicyRule, RateLimit


@dataclass
class MergedPolicy:
    """A PolicyRule merged with path-specific overrides, including allow/deny lists."""

    allow: bool | list[str]
    disallow: Optional[list[str]] = None
    actions: Optional[list[str]] = None
    rate_limit: Optional[RateLimit] = None
    require_verification: bool = False
    agent_allowlist: Optional[list[str]] = None
    agent_denylist: Optional[list[str]] = None


def path_matches(url_path: str, pattern: str) -> bool:
    """
    Test whether a URL path matches a glob-style path pattern.

    Args:
        url_path: The actual URL path (e.g. "/api/v1/users").
        pattern: The glob pattern from the policy (e.g. "/api/**").

    Returns:
        True if the URL path matches the pattern.
    """
    # Recursive glob: /foo/** matches /foo/anything/at/any/depth
    if pattern.endswith("/**"):
        prefix = pattern[:-3]
        return url_path == prefix or url_path.startswith(prefix + "/")

    # Single-segment glob: /foo/* matches /foo/bar but not /foo/bar/baz
    if pattern.endswith("/*"):
        prefix = pattern[:-2]
        rest = url_path[len(prefix):]
        return url_path.startswith(prefix) and rest.startswith("/") and "/" not in rest[1:]

    # Exact match
    return url_path == pattern


def match_path_policy(policy: AgentPolicy, url_path: str) -> Optional[PathPolicy]:
    """
    Find the first matching PathPolicy for a given URL path.

    Path policies are evaluated in order; the first match wins.

    Args:
        policy: The full APoP policy.
        url_path: The URL path to match against.

    Returns:
        The matching PathPolicy or None if no match.
    """
    if not policy.path_policies:
        return None
    for rule in policy.path_policies:
        if path_matches(url_path, rule.path):
            return rule
    return None


def merge_policy(
    default_policy: PolicyRule,
    path_rule: Optional[PathPolicy],
) -> MergedPolicy:
    """
    Merge the defaultPolicy with a path-specific policy override.

    Path policy fields override default policy fields when present.

    Args:
        default_policy: The site-wide default policy.
        path_rule: The matching path policy (may be None).

    Returns:
        Merged effective policy.
    """
    if path_rule is None:
        return MergedPolicy(
            allow=default_policy.allow,
            disallow=default_policy.disallow,
            actions=default_policy.actions,
            rate_limit=default_policy.rate_limit,
            require_verification=default_policy.require_verification,
        )

    return MergedPolicy(
        allow=path_rule.allow if path_rule.allow is not None else default_policy.allow,
        disallow=path_rule.disallow if path_rule.disallow is not None else default_policy.disallow,
        actions=path_rule.actions if path_rule.actions is not None else default_policy.actions,
        rate_limit=path_rule.rate_limit if path_rule.rate_limit is not None else default_policy.rate_limit,
        require_verification=(
            path_rule.require_verification
            if path_rule.require_verification is not None
            else default_policy.require_verification
        ),
        agent_allowlist=path_rule.agent_allowlist,
        agent_denylist=path_rule.agent_denylist,
    )
