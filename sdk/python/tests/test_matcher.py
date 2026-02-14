"""Tests for apop.matcher — Path Matching Engine."""

import pytest

from apop.matcher import match_path_policy, merge_policy, path_matches
from apop.types import AgentPolicy, PathPolicy, PolicyRule, RateLimit


# ---------------------------------------------------------------------------
# pathMatches tests
# ---------------------------------------------------------------------------


class TestPathMatchesExact:
    def test_match_identical_paths(self):
        assert path_matches("/foo", "/foo") is True

    def test_not_match_different_paths(self):
        assert path_matches("/foo", "/bar") is False

    def test_not_match_partial_paths(self):
        assert path_matches("/foo/bar", "/foo") is False

    def test_match_root_path(self):
        assert path_matches("/", "/") is True


class TestPathMatchesSingleSegmentGlob:
    def test_match_one_segment_after_prefix(self):
        assert path_matches("/foo/bar", "/foo/*") is True

    def test_not_match_nested_segments(self):
        assert path_matches("/foo/bar/baz", "/foo/*") is False

    def test_not_match_prefix_itself(self):
        assert path_matches("/foo", "/foo/*") is False

    def test_match_root_level_single_segment(self):
        assert path_matches("/bar", "/*") is True

    def test_not_match_multi_segment_under_root_glob(self):
        assert path_matches("/bar/baz", "/*") is False


class TestPathMatchesRecursiveGlob:
    def test_match_one_segment_after_prefix(self):
        assert path_matches("/foo/bar", "/foo/**") is True

    def test_match_nested_segments(self):
        assert path_matches("/foo/bar/baz", "/foo/**") is True

    def test_match_deeply_nested_segments(self):
        assert path_matches("/foo/a/b/c/d", "/foo/**") is True

    def test_match_prefix_path_itself(self):
        assert path_matches("/foo", "/foo/**") is True

    def test_not_match_paths_without_prefix(self):
        assert path_matches("/bar/foo/baz", "/foo/**") is False


class TestPathMatchesEdgeCases:
    def test_encoded_characters(self):
        assert path_matches("/foo/bar%20baz", "/foo/*") is True

    def test_empty_path_segments(self):
        assert path_matches("/foo//bar", "/foo/*") is False


# ---------------------------------------------------------------------------
# matchPathPolicy tests
# ---------------------------------------------------------------------------


class TestMatchPathPolicy:
    @pytest.fixture
    def policy(self) -> AgentPolicy:
        return AgentPolicy(
            version="1.0",
            default_policy=PolicyRule(allow=True),
            path_policies=[
                PathPolicy(path="/public/*", allow=True, actions=["read", "render"]),
                PathPolicy(path="/api/**", allow=True, actions=["read", "api_call"]),
                PathPolicy(path="/admin/*", allow=False),
            ],
        )

    def test_return_first_matching_path_policy(self, policy: AgentPolicy):
        result = match_path_policy(policy, "/public/page")
        assert result is not None
        assert result.path == "/public/*"

    def test_match_recursive_globs(self, policy: AgentPolicy):
        result = match_path_policy(policy, "/api/v1/users")
        assert result is not None
        assert result.path == "/api/**"

    def test_return_none_when_no_match(self, policy: AgentPolicy):
        result = match_path_policy(policy, "/other/page")
        assert result is None

    def test_return_none_when_no_path_policies(self):
        policy = AgentPolicy(version="1.0", default_policy=PolicyRule(allow=True))
        result = match_path_policy(policy, "/any/path")
        assert result is None

    def test_first_rule_wins_when_multiple_match(self):
        policy = AgentPolicy(
            version="1.0",
            default_policy=PolicyRule(allow=True),
            path_policies=[
                PathPolicy(path="/data/*", allow=True, actions=["read"]),
                PathPolicy(path="/data/*", allow=True, actions=["read", "index"]),
            ],
        )
        result = match_path_policy(policy, "/data/file")
        assert result is not None
        assert result.actions == ["read"]


# ---------------------------------------------------------------------------
# mergePolicy tests
# ---------------------------------------------------------------------------


class TestMergePolicy:
    @pytest.fixture
    def default_policy(self) -> PolicyRule:
        return PolicyRule(
            allow=True,
            actions=["read", "render"],
            rate_limit=RateLimit(requests=100, window="hour"),
            require_verification=False,
        )

    def test_return_copy_of_default_when_no_path_rule(self, default_policy: PolicyRule):
        merged = merge_policy(default_policy, None)
        assert merged.allow is True
        assert merged.actions == ["read", "render"]
        assert merged.rate_limit is not None
        assert merged.rate_limit.requests == 100

    def test_override_allow_from_path_rule(self, default_policy: PolicyRule):
        path_rule = PathPolicy(path="/blocked/*", allow=False)
        merged = merge_policy(default_policy, path_rule)
        assert merged.allow is False

    def test_keep_default_allow_when_path_has_no_allow(self, default_policy: PolicyRule):
        path_rule = PathPolicy(path="/page/*")
        merged = merge_policy(default_policy, path_rule)
        assert merged.allow is True

    def test_override_rate_limit_from_path_rule(self, default_policy: PolicyRule):
        path_rule = PathPolicy(
            path="/api/*",
            rate_limit=RateLimit(requests=1000, window="day"),
        )
        merged = merge_policy(default_policy, path_rule)
        assert merged.rate_limit is not None
        assert merged.rate_limit.requests == 1000
        assert merged.rate_limit.window == "day"

    def test_fallback_to_default_rate_limit(self, default_policy: PolicyRule):
        path_rule = PathPolicy(path="/page/*")
        merged = merge_policy(default_policy, path_rule)
        assert merged.rate_limit is not None
        assert merged.rate_limit.requests == 100
        assert merged.rate_limit.window == "hour"

    def test_override_require_verification(self, default_policy: PolicyRule):
        path_rule = PathPolicy(path="/secure/*", require_verification=True)
        merged = merge_policy(default_policy, path_rule)
        assert merged.require_verification is True

    def test_preserve_agent_allowlist(self, default_policy: PolicyRule):
        path_rule = PathPolicy(
            path="/api/*",
            agent_allowlist=["did:web:example.com"],
        )
        merged = merge_policy(default_policy, path_rule)
        assert merged.agent_allowlist == ["did:web:example.com"]

    def test_preserve_agent_denylist(self, default_policy: PolicyRule):
        path_rule = PathPolicy(
            path="/api/*",
            agent_denylist=["did:web:bad-agent.com"],
        )
        merged = merge_policy(default_policy, path_rule)
        assert merged.agent_denylist == ["did:web:bad-agent.com"]
