/**
 * APoP v1.0 — Express Middleware
 *
 * Drop-in Express middleware that enforces APoP policies.
 * Replaces middleware/index.express.js with SDK-based enforcement.
 */

import type { Request, Response, NextFunction, RequestHandler } from "express";
import type { AgentPolicy, MiddlewareOptions } from "../types.js";
import { enforce } from "../enforcer.js";
import { parseRequestHeaders, isAgent } from "../headers.js";

/**
 * Create an Express middleware that enforces an APoP policy.
 *
 * @param options - Middleware options including the policy to enforce.
 * @returns Express middleware function.
 *
 * @example
 * ```ts
 * import express from 'express';
 * import { createExpressMiddleware } from '@apop/node/middleware/express';
 * import policy from './agent-policy.json' assert { type: 'json' };
 *
 * const app = express();
 * app.use(createExpressMiddleware({ policy }));
 * ```
 */
export function createExpressMiddleware(
  options: MiddlewareOptions,
): RequestHandler {
  const { policy, skipNonAgents = true } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    // Set discovery headers on all responses
    if (policy.policyUrl) {
      res.set("Agent-Policy", policy.policyUrl);
    }
    res.set("Agent-Policy-Version", policy.version || "1.0");

    const agentHeaders = parseRequestHeaders(req);

    // Skip non-agent requests if configured
    if (skipNonAgents && !isAgent(agentHeaders)) {
      next();
      return;
    }

    // Build request context from parsed headers
    const result = enforce(policy, {
      path: req.path,
      agentName: agentHeaders.agentName,
      agentIntent: agentHeaders.agentIntent,
      agentId: agentHeaders.agentId,
      agentSignature: agentHeaders.agentSignature,
      agentVC: agentHeaders.agentVC,
      agentCard: agentHeaders.agentCard,
      agentKeyId: agentHeaders.agentKeyId,
    });

    // Set response headers from enforcement result
    for (const [key, value] of Object.entries(result.headers)) {
      if (value !== undefined) {
        res.set(key, value);
      }
    }

    // If denied or verification-required, send error response
    if (result.status !== "allowed") {
      res.status(result.httpStatus).json(result.body);
      return;
    }

    // Allowed — continue to next middleware
    next();
  };
}

/**
 * Create an Express route handler for the well-known APoP discovery endpoint.
 *
 * @param policy - The APoP policy to serve.
 * @returns Express route handler for GET /.well-known/agent-policy.json.
 */
export function createDiscoveryEndpoint(policy: AgentPolicy): RequestHandler {
  return (_req: Request, res: Response): void => {
    res.set("Content-Type", "application/json");
    res.set("Cache-Control", "public, max-age=3600");
    res.json(policy);
  };
}
