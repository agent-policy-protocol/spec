/**
 * Test helper — creates an Express app with the APoP middleware
 * using a given policy object (no filesystem dependency).
 */
import express from "express";

/**
 * Glob-style path matching (mirrors middleware/index.express.js).
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

function matchPathPolicy(policy, urlPath) {
  if (!policy.pathPolicies) return null;
  for (const rule of policy.pathPolicies) {
    if (pathMatches(urlPath, rule.path)) return rule;
  }
  return null;
}

function mergePolicy(defaultPolicy, pathRule) {
  if (!pathRule) return { ...defaultPolicy };
  return {
    ...defaultPolicy,
    ...pathRule,
    allow: pathRule.allow !== undefined ? pathRule.allow : defaultPolicy.allow,
    rateLimit: pathRule.rateLimit || defaultPolicy.rateLimit,
  };
}

/**
 * Creates an Express app with the APoP enforcement middleware.
 * @param {object} policy - APoP v1.0 policy object
 * @returns {import('express').Express}
 */
export function createApp(policy) {
  const app = express();

  // APoP enforcement middleware
  app.use((req, res, next) => {
    // Set discovery headers on all responses
    if (policy.policyUrl) {
      res.set("Agent-Policy", policy.policyUrl);
    }
    res.set("Agent-Policy-Version", policy.version || "1.0");

    const isAgent = req.header("Agent-Name") !== undefined;
    if (!isAgent) return next();

    const agentIntent = req.header("Agent-Intent");
    const agentId = req.header("Agent-Id");
    const agentSignature = req.header("Agent-Signature");
    const agentVC = req.header("Agent-VC");

    const pathRule = matchPathPolicy(policy, req.path);
    const effective = mergePolicy(policy.defaultPolicy, pathRule);

    // 1. Denylist
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

    // 2. Allowlist
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

    // 6. Success
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

  // Well-known discovery endpoint
  app.get("/.well-known/agent-policy.json", (req, res) => {
    res.json(policy);
  });

  // Catch-all route for testing
  app.all("*", (req, res) => {
    res.json({ ok: true, path: req.path });
  });

  return app;
}

/**
 * A standard test policy used across multiple test files.
 */
export const TEST_POLICY = {
  $schema: "https://agentpolicy.org/schema/v1/agent-policy.schema.json",
  version: "1.0",
  policyUrl: "https://example.com/.well-known/agent-policy.json",
  defaultPolicy: {
    allow: true,
    actions: ["read", "render"],
    disallow: ["extract", "api_call", "automated_purchase"],
    rateLimit: {
      requests: 100,
      window: "hour",
    },
    requireVerification: true,
  },
  pathPolicies: [
    {
      path: "/public/*",
      allow: true,
      actions: ["read", "index", "summarize"],
      requireVerification: false,
    },
    {
      path: "/api/private/*",
      allow: false,
      disallow: ["read", "extract"],
    },
    {
      path: "/admin/*",
      allow: false,
    },
    {
      path: "/api/v1/*",
      allow: true,
      actions: ["read", "api_call"],
      requireVerification: true,
      rateLimit: {
        requests: 1000,
        window: "hour",
      },
      agentAllowlist: [
        "did:web:comet.perplexity.ai",
        "did:web:gemini.google.com",
      ],
    },
    {
      path: "/blocked/*",
      allow: true,
      actions: ["read"],
      agentDenylist: ["did:web:bad-agent.example.com"],
    },
    {
      path: "/deep/nested/**",
      allow: true,
      actions: ["read", "summarize"],
      requireVerification: false,
    },
  ],
  verification: {
    method: ["did", "verifiable-credential", "pkix"],
    registry: "https://registry.agentpolicy.org",
    trustedIssuers: ["did:web:trust.agentpolicy.org"],
    verificationEndpoint: "https://example.com/agent-verify",
  },
  contact: {
    email: "security@example.com",
    policyUrl: "https://example.com/agent-policy",
    abuseUrl: "https://example.com/report-abuse",
  },
  metadata: {
    description: "Test policy for conformance tests",
    owner: "Test Corp",
    lastModified: "2026-02-14T00:00:00Z",
    license: "Apache-2.0",
  },
  interop: {
    a2aAgentCard: "https://example.com/.well-known/agent.json",
    mcpServerUrl: "https://example.com/mcp",
    webmcpEnabled: false,
  },
};

// Export path matching for unit tests
export { pathMatches };
