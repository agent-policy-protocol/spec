import fs from "fs";
import path from "path";

/**
 * APoP v1.0 Middleware — Vercel Serverless Handler
 *
 * Enforces Agent Policy Protocol rules per the v1.0 specification.
 * Reads the policy from agent-policy.json and evaluates requests
 * against defaultPolicy and pathPolicies.
 *
 * Spec references:
 *   - spec/schema/agent-policy.schema.json (manifest schema)
 *   - spec/http-extensions.md (status codes 430/438/439)
 *   - spec/agent-identification.md (agent headers)
 */
export default function handler(req, res) {
  // Load the policy from one level up (root)
  const policyPath = path.join(process.cwd(), "../agent-policy.json");
  const policy = JSON.parse(fs.readFileSync(policyPath, "utf-8"));

  const agentName = req.headers["agent-name"];
  const agentIntent = req.headers["agent-intent"];
  const agentId = req.headers["agent-id"];
  const agentSignature = req.headers["agent-signature"];
  const agentVC = req.headers["agent-vc"];
  const isAgent = !!agentName;

  // Set discovery headers on all responses
  if (policy.policyUrl) {
    res.setHeader("Agent-Policy", policy.policyUrl);
  }
  res.setHeader("Agent-Policy-Version", policy.version || "1.0");

  if (!isAgent) {
    res.status(200).send("✅ APoP v1.0 Middleware active. Agent Policy enforced.");
    return;
  }

  // Resolve effective policy for this path
  const pathRule = matchPathPolicy(req.url, policy.pathPolicies);
  const effective = mergePolicy(policy.defaultPolicy, pathRule);

  // 1. Check denylist
  if (pathRule?.agentDenylist && agentId) {
    if (pathRule.agentDenylist.includes(agentId)) {
      res.setHeader("Agent-Policy-Status", "denied");
      res.status(430).json({
        error: "agent_on_denylist",
        message: `Agent '${agentId}' is denied access to this path.`,
        policy: policy.policyUrl,
        path: req.url,
      });
      return;
    }
  }

  // 2. Check allowlist (if present, only listed agents may access)
  if (pathRule?.agentAllowlist) {
    if (!agentId || !pathRule.agentAllowlist.includes(agentId)) {
      res.setHeader("Agent-Policy-Status", "denied");
      res.status(430).json({
        error: "agent_not_on_allowlist",
        message: "This path is restricted to specific agents.",
        policy: policy.policyUrl,
        path: req.url,
      });
      return;
    }
  }

  // 3. Check if access is globally denied
  if (effective.allow === false) {
    res.setHeader("Agent-Policy-Status", "denied");
    res.status(430).json({
      error: "agent_action_not_allowed",
      message: "Access is not permitted on this path.",
      policy: policy.policyUrl,
      path: req.url,
    });
    return;
  }

  // 4. Check agent intent against disallowed actions
  if (agentIntent && effective.disallow) {
    const intents = agentIntent.split(",").map((s) => s.trim());
    const blocked = intents.filter((i) => effective.disallow.includes(i));
    if (blocked.length > 0) {
      res.setHeader("Agent-Policy-Status", "denied");
      res.status(430).json({
        error: "agent_action_not_allowed",
        message: `Action(s) '${blocked.join(", ")}' not permitted on this path.`,
        policy: policy.policyUrl,
        allowedActions: effective.actions || [],
        path: req.url,
      });
      return;
    }
  }

  // 5. Check verification requirement
  if (effective.requireVerification) {
    const hasVerification = agentSignature || agentVC;
    if (!hasVerification) {
      const methods = Array.isArray(policy.verification?.method)
        ? policy.verification.method
        : [policy.verification?.method || "pkix"];
      res.setHeader("Agent-Policy-Status", "denied");
      res.setHeader("Agent-Policy-Verify", methods.join(", "));
      if (policy.verification?.verificationEndpoint) {
        res.setHeader(
          "Agent-Policy-Verify-Endpoint",
          policy.verification.verificationEndpoint
        );
      }
      res.status(439).json({
        error: "agent_verification_required",
        message: "This endpoint requires verified agent identity.",
        acceptedMethods: methods,
        verifyEndpoint: policy.verification?.verificationEndpoint,
        trustedIssuers: policy.verification?.trustedIssuers,
        policy: policy.policyUrl,
      });
      return;
    }
  }

  // 6. Success — set informational headers
  res.setHeader("Agent-Policy-Status", "allowed");
  res.setHeader(
    "Agent-Policy-Actions",
    (effective.actions || []).join(", ")
  );
  if (effective.rateLimit) {
    res.setHeader(
      "Agent-Policy-Rate-Limit",
      `${effective.rateLimit.requests}/${effective.rateLimit.window}`
    );
    // NOTE: This is the configured max value, not actual remaining.
    // Real rate limit tracking (in-memory/Redis) is not yet implemented.
    res.setHeader(
      "Agent-Policy-Rate-Remaining",
      effective.rateLimit.requests.toString()
    );
  }

  res.status(200).send("✅ APoP v1.0 Middleware active. Agent Policy enforced.");
}

/**
 * Match a request path against pathPolicies (first match wins).
 * Supports glob-style wildcards: * matches a single segment, ** matches multiple.
 */
function matchPathPolicy(urlPath, pathPolicies) {
  if (!pathPolicies) return null;
  for (const rule of pathPolicies) {
    if (pathMatches(urlPath, rule.path)) return rule;
  }
  return null;
}

/**
 * Simple glob-style path matching.
 * - /foo/* matches /foo/bar but not /foo/bar/baz
 * - /foo/** matches /foo/bar, /foo/bar/baz, etc.
 */
function pathMatches(urlPath, pattern) {
  if (pattern.endsWith("/**")) {
    const prefix = pattern.slice(0, -3);
    return urlPath === prefix || urlPath.startsWith(prefix + "/");
  }
  if (pattern.endsWith("/*")) {
    const prefix = pattern.slice(0, -2);
    const rest = urlPath.slice(prefix.length);
    return (
      urlPath.startsWith(prefix) &&
      rest.startsWith("/") &&
      !rest.slice(1).includes("/")
    );
  }
  return urlPath === pattern;
}

/**
 * Merge defaultPolicy with path-specific overrides.
 * Path rules take precedence over defaults.
 */
function mergePolicy(defaultPolicy, pathRule) {
  if (!pathRule) return { ...defaultPolicy };
  return {
    ...defaultPolicy,
    ...pathRule,
    // If path explicitly sets allow, that takes precedence
    allow: pathRule.allow !== undefined ? pathRule.allow : defaultPolicy.allow,
    // Merge rate limits (path overrides default)
    rateLimit: pathRule.rateLimit || defaultPolicy.rateLimit,
  };
}
