import express from "express";
import fs from "fs";
import path from "path";

const app = express();
const PORT = process.env.PORT || 3000;

/**
 * APoP v1.0 Middleware — Express
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

// Load local agent-policy.json
const policyPath = path.join(process.cwd(), "../agent-policy.json");
const policy = JSON.parse(fs.readFileSync(policyPath, "utf-8"));

function isAgent(req) {
  return req.header("Agent-Name") !== undefined;
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

function matchPathPolicy(urlPath) {
  if (!policy.pathPolicies) return null;
  for (const rule of policy.pathPolicies) {
    if (pathMatches(urlPath, rule.path)) return rule;
  }
  return null;
}

/**
 * Merge defaultPolicy with path-specific overrides.
 */
function mergePolicy(defaultPolicy, pathRule) {
  if (!pathRule) return { ...defaultPolicy };
  return {
    ...defaultPolicy,
    ...pathRule,
    allow: pathRule.allow !== undefined ? pathRule.allow : defaultPolicy.allow,
    rateLimit: pathRule.rateLimit || defaultPolicy.rateLimit,
  };
}

// APoP enforcement middleware
app.use((req, res, next) => {
  // Set discovery headers on all responses
  if (policy.policyUrl) {
    res.set("Agent-Policy", policy.policyUrl);
  }
  res.set("Agent-Policy-Version", policy.version || "1.0");

  if (!isAgent(req)) return next(); // skip non-agent requests

  const agentName = req.header("Agent-Name");
  const agentIntent = req.header("Agent-Intent");
  const agentId = req.header("Agent-Id");
  const agentSignature = req.header("Agent-Signature");
  const agentVC = req.header("Agent-VC");

  const pathRule = matchPathPolicy(req.path);
  const effective = mergePolicy(policy.defaultPolicy, pathRule);

  // 1. Check denylist
  if (pathRule?.agentDenylist && agentId) {
    if (pathRule.agentDenylist.includes(agentId)) {
      res.set("Agent-Policy-Status", "denied");
      return res.status(430).json({
        error: "agent_on_denylist",
        message: `Agent '${agentId}' is denied access to this path.`,
        policy: policy.policyUrl,
        path: req.path,
      });
    }
  }

  // 2. Check allowlist
  if (pathRule?.agentAllowlist) {
    if (!agentId || !pathRule.agentAllowlist.includes(agentId)) {
      res.set("Agent-Policy-Status", "denied");
      return res.status(430).json({
        error: "agent_not_on_allowlist",
        message: "This path is restricted to specific agents.",
        policy: policy.policyUrl,
        path: req.path,
      });
    }
  }

  // 3. Access denied
  if (effective.allow === false) {
    res.set("Agent-Policy-Status", "denied");
    return res.status(430).json({
      error: "agent_action_not_allowed",
      message: "Access is not permitted on this path.",
      policy: policy.policyUrl,
      path: req.path,
    });
  }

  // 4. Intent-based enforcement
  if (agentIntent && effective.disallow) {
    const intents = agentIntent.split(",").map((s) => s.trim());
    const blocked = intents.filter((i) => effective.disallow.includes(i));
    if (blocked.length > 0) {
      res.set("Agent-Policy-Status", "denied");
      return res.status(430).json({
        error: "agent_action_not_allowed",
        message: `Action(s) '${blocked.join(", ")}' not permitted on this path.`,
        policy: policy.policyUrl,
        allowedActions: effective.actions || [],
        path: req.path,
      });
    }
  }

  // 5. Verification required
  if (effective.requireVerification) {
    const hasVerification = agentSignature || agentVC;
    if (!hasVerification) {
      const methods = Array.isArray(policy.verification?.method)
        ? policy.verification.method
        : [policy.verification?.method || "pkix"];
      res.set("Agent-Policy-Status", "denied");
      res.set("Agent-Policy-Verify", methods.join(", "));
      if (policy.verification?.verificationEndpoint) {
        res.set(
          "Agent-Policy-Verify-Endpoint",
          policy.verification.verificationEndpoint
        );
      }
      return res.status(439).json({
        error: "agent_verification_required",
        message: "This endpoint requires verified agent identity.",
        acceptedMethods: methods,
        verifyEndpoint: policy.verification?.verificationEndpoint,
        trustedIssuers: policy.verification?.trustedIssuers,
        policy: policy.policyUrl,
      });
    }
  }

  // 6. Success — set informational headers
  res.set("Agent-Policy-Status", "allowed");
  res.set("Agent-Policy-Actions", (effective.actions || []).join(", "));
  if (effective.rateLimit) {
    res.set(
      "Agent-Policy-Rate-Limit",
      `${effective.rateLimit.requests}/${effective.rateLimit.window}`
    );
    // NOTE: This is the configured max value, not actual remaining.
    // Real rate limit tracking (in-memory/Redis) is not yet implemented.
    res.set(
      "Agent-Policy-Rate-Remaining",
      effective.rateLimit.requests.toString()
    );
  }

  next();
});

// Well-known endpoint for APoP policy discovery
app.get("/.well-known/agent-policy.json", (req, res) => {
  res.json(policy);
});

app.get("/", (req, res) => {
  res.send("✅ APoP v1.0 Middleware active. Agent Policy enforced.");
});

app.listen(PORT, () =>
  console.log(`APoP v1.0 middleware running on port ${PORT}`)
);
