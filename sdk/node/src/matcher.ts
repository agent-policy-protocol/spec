/**
 * APoP v1.0 — Path Matching Engine
 *
 * Implements glob-style path matching per the APoP specification:
 *   - /foo/*  → matches /foo/bar but NOT /foo/bar/baz (single segment)
 *   - /foo/** → matches /foo/bar, /foo/bar/baz, etc. (recursive)
 *   - /foo    → matches only /foo (exact match)
 */

import type { AgentPolicy, PathPolicy, PolicyRule } from "./types.js";

/**
 * Test whether a URL path matches a glob-style path pattern.
 *
 * @param urlPath - The actual URL path (e.g. "/api/v1/users").
 * @param pattern - The glob pattern from the policy (e.g. "/api/**").
 * @returns true if the URL path matches the pattern.
 */
export function pathMatches(urlPath: string, pattern: string): boolean {
  // Recursive glob: /foo/** matches /foo/anything/at/any/depth
  if (pattern.endsWith("/**")) {
    const prefix = pattern.slice(0, -3);
    return urlPath === prefix || urlPath.startsWith(prefix + "/");
  }

  // Single-segment glob: /foo/* matches /foo/bar but not /foo/bar/baz
  if (pattern.endsWith("/*")) {
    const prefix = pattern.slice(0, -2);
    const rest = urlPath.slice(prefix.length);
    return (
      urlPath.startsWith(prefix) &&
      rest.startsWith("/") &&
      !rest.slice(1).includes("/")
    );
  }

  // Exact match
  return urlPath === pattern;
}

/**
 * Find the first matching PathPolicy for a given URL path.
 *
 * Path policies are evaluated in order; the first match wins.
 *
 * @param policy - The full APoP policy.
 * @param urlPath - The URL path to match against.
 * @returns The matching PathPolicy or null if no match.
 */
export function matchPathPolicy(
  policy: AgentPolicy,
  urlPath: string,
): PathPolicy | null {
  if (!policy.pathPolicies) return null;
  for (const rule of policy.pathPolicies) {
    if (pathMatches(urlPath, rule.path)) return rule;
  }
  return null;
}

/**
 * Merge the defaultPolicy with a path-specific policy override.
 *
 * Path policy fields override default policy fields when present.
 * `allow` uses the path rule value if defined, otherwise falls back to default.
 * `rateLimit` uses the path rule value if defined, otherwise falls back to default.
 *
 * @param defaultPolicy - The site-wide default policy.
 * @param pathRule - The matching path policy (may be null).
 * @returns Merged effective policy rule.
 */
export function mergePolicy(
  defaultPolicy: PolicyRule,
  pathRule: PathPolicy | null,
): PolicyRule & { agentAllowlist?: string[]; agentDenylist?: string[] } {
  if (!pathRule) return { ...defaultPolicy };

  return {
    ...defaultPolicy,
    ...pathRule,
    allow: pathRule.allow !== undefined ? pathRule.allow : defaultPolicy.allow,
    rateLimit: pathRule.rateLimit || defaultPolicy.rateLimit,
    requireVerification:
      pathRule.requireVerification !== undefined
        ? pathRule.requireVerification
        : defaultPolicy.requireVerification,
  };
}
