/**
 * APoP v1.0 — Policy Discovery
 *
 * Implements the 4-method discovery chain per spec/discovery.md:
 *   1. Well-known URI: GET /.well-known/agent-policy.json
 *   2. HTTP header: Agent-Policy response header
 *   3. HTML meta tag: <meta name="agent-policy" content="{url}">
 *   4. DNS TXT record: _agentpolicy.{domain} with apop=1 policy={url}
 *
 * Each step only runs if the previous one fails.
 * Uses Node 18+ built-in fetch and dns/promises.
 */

import type { AgentPolicy, DiscoveryResult } from "./types.js";
import { parsePolicy } from "./parser.js";

/**
 * Options for the discovery process.
 */
export interface DiscoveryOptions {
  /** Request timeout in milliseconds. Default: 10000 (10s). */
  timeout?: number;
  /** Maximum retries for 5xx errors on well-known URI. Default: 3. */
  maxRetries?: number;
  /** Custom fetch implementation (for testing). Defaults to global fetch. */
  fetchImpl?: typeof globalThis.fetch;
  /** Custom DNS resolver (for testing). Defaults to dns/promises. */
  dnsResolve?: (hostname: string, rrtype: string) => Promise<string[][]>;
}

const DEFAULT_TIMEOUT = 10_000;
const DEFAULT_MAX_RETRIES = 3;

/**
 * Discover the APoP policy for a domain using the 4-method fallback chain.
 *
 * @param domain - The domain to discover the policy for (e.g. "example.com").
 * @param options - Optional discovery settings.
 * @returns DiscoveryResult with the discovered policy or error info.
 */
export async function discoverPolicy(
  domain: string,
  options: DiscoveryOptions = {},
): Promise<DiscoveryResult> {
  const timeout = options.timeout ?? DEFAULT_TIMEOUT;
  const maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;
  const fetchFn = options.fetchImpl ?? globalThis.fetch;

  // Step 1: Well-known URI
  const wellKnownUrl = `https://${domain}/.well-known/agent-policy.json`;
  const step1 = await tryWellKnown(wellKnownUrl, fetchFn, timeout, maxRetries);
  if (step1) return step1;

  // Step 2: HTTP header on root page
  const step2 = await tryHttpHeader(domain, fetchFn, timeout);
  if (step2) return step2;

  // Step 3: HTML meta tag on root page
  const step3 = await tryMetaTag(domain, fetchFn, timeout);
  if (step3) return step3;

  // Step 4: DNS TXT record
  const step4 = await tryDnsTxt(domain, fetchFn, timeout, options.dnsResolve);
  if (step4) return step4;

  // No policy found
  return {
    policy: null,
    error: `No APoP policy found for domain: ${domain}`,
  };
}

// ---------------------------------------------------------------------------
// Step 1: Well-Known URI
// ---------------------------------------------------------------------------

async function tryWellKnown(
  url: string,
  fetchFn: typeof fetch,
  timeout: number,
  maxRetries: number,
): Promise<DiscoveryResult | null> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeout);

      const res = await fetchFn(url, { signal: controller.signal });
      clearTimeout(timer);

      if (res.status === 200) {
        const text = await res.text();
        const result = parsePolicy(text);
        if (result.valid && result.policy) {
          return {
            policy: result.policy,
            policyUrl: url,
            method: "well-known",
          };
        }
        return null; // Invalid JSON, try next method
      }

      if (res.status === 404) {
        return null; // Not found, try next method
      }

      // 5xx or other error — retry with exponential backoff
      if (res.status >= 500 && attempt < maxRetries) {
        await sleep(Math.pow(2, attempt) * 500);
        continue;
      }

      return null; // Give up after retries
    } catch {
      // Network error / timeout — retry
      if (attempt < maxRetries) {
        await sleep(Math.pow(2, attempt) * 500);
        continue;
      }
      return null;
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Step 2: HTTP Response Header
// ---------------------------------------------------------------------------

async function tryHttpHeader(
  domain: string,
  fetchFn: typeof fetch,
  timeout: number,
): Promise<DiscoveryResult | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    const res = await fetchFn(`https://${domain}/`, {
      signal: controller.signal,
    });
    clearTimeout(timer);

    const policyHeader =
      res.headers.get("Agent-Policy") || res.headers.get("agent-policy");
    if (!policyHeader) return null;

    return await fetchAndParsePolicy(
      policyHeader,
      "http-header",
      fetchFn,
      timeout,
    );
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Step 3: HTML Meta Tag
// ---------------------------------------------------------------------------

async function tryMetaTag(
  domain: string,
  fetchFn: typeof fetch,
  timeout: number,
): Promise<DiscoveryResult | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    const res = await fetchFn(`https://${domain}/`, {
      signal: controller.signal,
    });
    clearTimeout(timer);

    const html = await res.text();
    const match = html.match(
      /<meta\s+name=["']agent-policy["']\s+content=["']([^"']+)["']/i,
    );
    if (!match?.[1]) {
      // Also try content before name
      const altMatch = html.match(
        /<meta\s+content=["']([^"']+)["']\s+name=["']agent-policy["']/i,
      );
      if (!altMatch?.[1]) return null;
      return await fetchAndParsePolicy(
        altMatch[1],
        "meta-tag",
        fetchFn,
        timeout,
      );
    }

    return await fetchAndParsePolicy(match[1], "meta-tag", fetchFn, timeout);
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Step 4: DNS TXT Record
// ---------------------------------------------------------------------------

async function tryDnsTxt(
  domain: string,
  fetchFn: typeof fetch,
  timeout: number,
  customResolve?: (hostname: string, rrtype: string) => Promise<string[][]>,
): Promise<DiscoveryResult | null> {
  try {
    let records: string[][];

    if (customResolve) {
      records = await customResolve(`_agentpolicy.${domain}`, "TXT");
    } else {
      const dns = await import("node:dns/promises");
      records = await dns.resolveTxt(`_agentpolicy.${domain}`);
    }

    for (const record of records) {
      const txt = record.join("");
      // Must contain apop=1 and policy={url}
      if (!txt.includes("apop=1")) continue;
      const policyMatch = txt.match(/policy=(\S+)/);
      if (!policyMatch?.[1]) continue;

      return await fetchAndParsePolicy(
        policyMatch[1],
        "dns-txt",
        fetchFn,
        timeout,
      );
    }

    return null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function fetchAndParsePolicy(
  url: string,
  method: DiscoveryResult["method"],
  fetchFn: typeof fetch,
  timeout: number,
): Promise<DiscoveryResult | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    const res = await fetchFn(url, { signal: controller.signal });
    clearTimeout(timer);

    if (res.status !== 200) return null;

    const text = await res.text();
    const result = parsePolicy(text);
    if (result.valid && result.policy) {
      return { policy: result.policy, policyUrl: url, method };
    }
    return null;
  } catch {
    return null;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
