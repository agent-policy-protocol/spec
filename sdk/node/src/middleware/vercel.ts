/**
 * APoP v1.0 — Vercel Serverless Handler / Edge Middleware
 *
 * Wraps the APoP enforcer for Vercel serverless functions
 * and Edge Middleware deployments.
 */

import type { AgentPolicy, MiddlewareOptions } from "../types.js";
import { enforce } from "../enforcer.js";
import { parseRequestHeaders, isAgent } from "../headers.js";

/**
 * Vercel serverless request shape (compatible with IncomingMessage).
 */
export interface VercelRequest {
  url?: string;
  headers: Record<string, string | string[] | undefined>;
  method?: string;
}

/**
 * Vercel serverless response shape.
 */
export interface VercelResponse {
  status: (code: number) => VercelResponse;
  setHeader: (name: string, value: string) => VercelResponse;
  json: (body: unknown) => void;
  send: (body: string) => void;
  end: () => void;
}

/**
 * Create a Vercel serverless function handler that enforces APoP policies.
 *
 * @param options - Middleware options including the policy to enforce.
 * @returns A Vercel-compatible handler function.
 *
 * @example
 * ```ts
 * import { createVercelHandler } from '@apop/node/middleware/vercel';
 * import policy from './agent-policy.json' assert { type: 'json' };
 *
 * const handler = createVercelHandler({ policy });
 *
 * export default function (req, res) {
 *   // Handler returns true if the request was blocked by policy
 *   if (handler(req, res)) return;
 *   // ... your actual handler logic
 *   res.json({ ok: true });
 * }
 * ```
 */
export function createVercelHandler(
  options: MiddlewareOptions,
): (req: VercelRequest, res: VercelResponse) => boolean {
  const { policy, skipNonAgents = true } = options;

  return (req: VercelRequest, res: VercelResponse): boolean => {
    // Set discovery headers on all responses
    if (policy.policyUrl) {
      res.setHeader("Agent-Policy", policy.policyUrl);
    }
    res.setHeader("Agent-Policy-Version", policy.version || "1.0");

    const agentHeaders = parseRequestHeaders(req.headers);

    // Skip non-agent requests
    if (skipNonAgents && !isAgent(agentHeaders)) {
      return false;
    }

    // Extract URL path
    const urlPath = extractPath(req.url || "/");

    const result = enforce(policy, {
      path: urlPath,
      agentName: agentHeaders.agentName,
      agentIntent: agentHeaders.agentIntent,
      agentId: agentHeaders.agentId,
      agentSignature: agentHeaders.agentSignature,
      agentVC: agentHeaders.agentVC,
      agentCard: agentHeaders.agentCard,
      agentKeyId: agentHeaders.agentKeyId,
    });

    // Set response headers
    for (const [key, value] of Object.entries(result.headers)) {
      if (value !== undefined) {
        res.setHeader(key, value);
      }
    }

    // If blocked, send error response and return true
    if (result.status !== "allowed") {
      res.status(result.httpStatus).json(result.body);
      return true;
    }

    return false;
  };
}

/**
 * Create a Vercel Edge Middleware handler using the Web API Request/Response.
 *
 * @param options - Middleware options including the policy to enforce.
 * @returns An async function for Vercel Edge Middleware.
 *
 * @example
 * ```ts
 * import { createVercelEdgeMiddleware } from '@apop/node/middleware/vercel';
 * import policy from './agent-policy.json' assert { type: 'json' };
 *
 * const apopMiddleware = createVercelEdgeMiddleware({ policy });
 *
 * export default async function middleware(request) {
 *   const apopResult = await apopMiddleware(request);
 *   if (apopResult) return apopResult; // Blocked by policy
 *   return NextResponse.next(); // Allowed
 * }
 * ```
 */
export function createVercelEdgeMiddleware(
  options: MiddlewareOptions,
): (request: Request) => Response | null {
  const { policy, skipNonAgents = true } = options;

  return (request: Request): Response | null => {
    const agentHeaders = parseRequestHeaders(
      Object.fromEntries(request.headers.entries()),
    );

    if (skipNonAgents && !isAgent(agentHeaders)) {
      return null; // Let the request through
    }

    const url = new URL(request.url);
    const result = enforce(policy, {
      path: url.pathname,
      agentName: agentHeaders.agentName,
      agentIntent: agentHeaders.agentIntent,
      agentId: agentHeaders.agentId,
      agentSignature: agentHeaders.agentSignature,
      agentVC: agentHeaders.agentVC,
      agentCard: agentHeaders.agentCard,
      agentKeyId: agentHeaders.agentKeyId,
    });

    // Build headers for the response
    const responseHeaders = new Headers();
    if (policy.policyUrl) {
      responseHeaders.set("Agent-Policy", policy.policyUrl);
    }
    responseHeaders.set("Agent-Policy-Version", policy.version || "1.0");
    for (const [key, value] of Object.entries(result.headers)) {
      if (value !== undefined) {
        responseHeaders.set(key, value);
      }
    }

    if (result.status !== "allowed") {
      responseHeaders.set("Content-Type", "application/json");
      return new Response(JSON.stringify(result.body), {
        status: result.httpStatus,
        headers: responseHeaders,
      });
    }

    return null; // Allowed — let the request through
  };
}

function extractPath(url: string): string {
  try {
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return new URL(url).pathname;
    }
    const qIndex = url.indexOf("?");
    return qIndex >= 0 ? url.slice(0, qIndex) : url;
  } catch {
    return url;
  }
}
