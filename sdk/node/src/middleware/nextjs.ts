/**
 * APoP v1.0 — Next.js Middleware Adapter
 *
 * Provides an APoP policy enforcer for Next.js middleware.ts files.
 * Works with the Next.js Edge Runtime (middleware.ts).
 */

import type { AgentPolicy, MiddlewareOptions } from "../types.js";
import { enforce } from "../enforcer.js";
import { parseRequestHeaders, isAgent } from "../headers.js";

/**
 * Minimal NextRequest-like interface for compatibility without
 * requiring next as a dependency.
 */
export interface NextJsRequest {
  url: string;
  headers: Headers | Map<string, string>;
  nextUrl?: { pathname: string };
}

/**
 * A NextResponse-like factory (we don't import next/server directly).
 */
export interface NextResponseFactory {
  next: (init?: { headers?: Headers }) => unknown;
  json: (
    body: unknown,
    init?: { status?: number; headers?: Headers },
  ) => unknown;
}

/**
 * Create a Next.js middleware handler that enforces APoP policies.
 *
 * Use this inside your project's `middleware.ts`:
 *
 * @example
 * ```ts
 * // middleware.ts
 * import { NextResponse } from 'next/server';
 * import { createNextMiddleware } from '@apop/node/middleware/nextjs';
 * import policy from './agent-policy.json' assert { type: 'json' };
 *
 * const apop = createNextMiddleware({ policy });
 *
 * export function middleware(request) {
 *   const result = apop(request, NextResponse);
 *   if (result) return result; // Blocked by policy
 *   return NextResponse.next();
 * }
 *
 * export const config = { matcher: '/:path*' };
 * ```
 */
export function createNextMiddleware(
  options: MiddlewareOptions,
): (
  request: NextJsRequest,
  NextResponse: NextResponseFactory,
) => unknown | null {
  const { policy, skipNonAgents = true } = options;

  return (
    request: NextJsRequest,
    NextResponse: NextResponseFactory,
  ): unknown | null => {
    // Parse headers — Next.js middleware uses Web API Headers
    const headersObj: Record<string, string> = {};
    if (request.headers instanceof Headers) {
      request.headers.forEach((value, key) => {
        headersObj[key] = value;
      });
    } else if (request.headers instanceof Map) {
      request.headers.forEach((value, key) => {
        headersObj[key] = value;
      });
    }

    const agentHeaders = parseRequestHeaders(headersObj);

    if (skipNonAgents && !isAgent(agentHeaders)) {
      return null; // Allow through
    }

    // Get the pathname
    const pathname = request.nextUrl?.pathname ?? new URL(request.url).pathname;

    const result = enforce(policy, {
      path: pathname,
      agentName: agentHeaders.agentName,
      agentIntent: agentHeaders.agentIntent,
      agentId: agentHeaders.agentId,
      agentSignature: agentHeaders.agentSignature,
      agentVC: agentHeaders.agentVC,
      agentCard: agentHeaders.agentCard,
      agentKeyId: agentHeaders.agentKeyId,
    });

    // Build response headers
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
      return NextResponse.json(result.body, {
        status: result.httpStatus,
        headers: responseHeaders,
      });
    }

    // Allowed — pass through with APoP headers added
    return NextResponse.next({ headers: responseHeaders });
  };
}
