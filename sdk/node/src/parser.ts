/**
 * APoP v1.0 — Policy Parser & Validator
 *
 * Parses and validates agent-policy.json against the APoP JSON Schema
 * using Ajv with JSON Schema draft 2020-12 support.
 */

import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import type { AgentPolicy } from "./types.js";

// Inline the APoP JSON Schema so the SDK is self-contained.
// This is the full v1.0 schema from spec/schema/agent-policy.schema.json.
const APOP_SCHEMA = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://agentpolicy.org/schema/v1/agent-policy.schema.json",
  title: "Agent Policy Protocol (APoP) v1.0 Manifest",
  description:
    "Defines how AI agents may interact with a website — what they can access, what actions are allowed, rate limits, and verification requirements.",
  type: "object" as const,
  required: ["version", "defaultPolicy"],
  properties: {
    $schema: {
      type: "string" as const,
      description: "Reference to this JSON Schema for validation.",
      format: "uri",
    },
    version: {
      type: "string" as const,
      description: "APoP protocol version. Use '1.0' for this specification.",
      enum: ["0.1", "1.0"],
      default: "1.0",
    },
    policyUrl: {
      type: "string" as const,
      description: "Canonical URL where this policy is hosted.",
      format: "uri",
    },
    defaultPolicy: {
      $ref: "#/$defs/PolicyRule",
      description:
        "Site-wide fallback rules. Applies when no path-specific rule matches.",
    },
    pathPolicies: {
      type: "array" as const,
      description:
        "Path-specific policy overrides. Evaluated in order; first matching path wins.",
      items: { $ref: "#/$defs/PathPolicy" },
    },
    verification: {
      $ref: "#/$defs/Verification",
      description:
        "Configuration for how agent identity verification is handled.",
    },
    contact: {
      $ref: "#/$defs/Contact",
      description: "Contact information for policy questions.",
    },
    metadata: {
      $ref: "#/$defs/Metadata",
      description: "Human-readable metadata about this policy.",
    },
    interop: {
      $ref: "#/$defs/Interoperability",
      description: "Optional cross-protocol interoperability declarations.",
    },
  },
  additionalProperties: false,
  $defs: {
    ActionType: {
      type: "string" as const,
      description: "Standardized action type that an agent may perform.",
      enum: [
        "read",
        "index",
        "extract",
        "summarize",
        "render",
        "api_call",
        "form_submit",
        "automated_purchase",
        "tool_invoke",
        "all",
      ],
    },
    RateLimit: {
      type: "object" as const,
      description: "Rate limiting configuration for agent requests.",
      required: ["requests", "window"],
      properties: {
        requests: {
          type: "integer" as const,
          description:
            "Maximum number of requests allowed within the specified window.",
          minimum: 0,
        },
        window: {
          type: "string" as const,
          description: "Time window for rate limiting.",
          enum: ["minute", "hour", "day"],
        },
      },
      additionalProperties: false,
    },
    PolicyRule: {
      type: "object" as const,
      description: "A set of rules governing agent access.",
      required: ["allow"],
      properties: {
        allow: {
          oneOf: [
            { type: "boolean" as const },
            { type: "array" as const, items: { $ref: "#/$defs/ActionType" } },
          ],
        },
        disallow: {
          type: "array" as const,
          items: { $ref: "#/$defs/ActionType" },
        },
        actions: {
          type: "array" as const,
          items: { $ref: "#/$defs/ActionType" },
        },
        rateLimit: { $ref: "#/$defs/RateLimit" },
        requireVerification: {
          type: "boolean" as const,
          default: false,
        },
      },
      additionalProperties: false,
    },
    PathPolicy: {
      type: "object" as const,
      description: "Path-specific policy override.",
      required: ["path"],
      properties: {
        path: { type: "string" as const },
        allow: {
          oneOf: [
            { type: "boolean" as const },
            { type: "array" as const, items: { $ref: "#/$defs/ActionType" } },
          ],
        },
        disallow: {
          type: "array" as const,
          items: { $ref: "#/$defs/ActionType" },
        },
        actions: {
          type: "array" as const,
          items: { $ref: "#/$defs/ActionType" },
        },
        rateLimit: { $ref: "#/$defs/RateLimit" },
        requireVerification: { type: "boolean" as const, default: false },
        agentAllowlist: {
          type: "array" as const,
          items: { type: "string" as const },
        },
        agentDenylist: {
          type: "array" as const,
          items: { type: "string" as const },
        },
      },
      additionalProperties: false,
    },
    Verification: {
      type: "object" as const,
      description: "Configuration for agent identity verification.",
      required: ["method"],
      properties: {
        method: {
          oneOf: [
            {
              type: "string" as const,
              enum: ["pkix", "did", "verifiable-credential", "partner-token"],
            },
            {
              type: "array" as const,
              items: {
                type: "string" as const,
                enum: ["pkix", "did", "verifiable-credential", "partner-token"],
              },
            },
          ],
        },
        registry: { type: "string" as const, format: "uri" },
        trustedIssuers: {
          type: "array" as const,
          items: { type: "string" as const },
        },
        verificationEndpoint: { type: "string" as const, format: "uri" },
      },
      additionalProperties: false,
    },
    Contact: {
      type: "object" as const,
      properties: {
        email: { type: "string" as const, format: "email" },
        policyUrl: { type: "string" as const, format: "uri" },
        abuseUrl: { type: "string" as const, format: "uri" },
      },
      additionalProperties: false,
    },
    Metadata: {
      type: "object" as const,
      properties: {
        description: { type: "string" as const },
        owner: { type: "string" as const },
        maintainer: { type: "string" as const },
        lastModified: { type: "string" as const, format: "date-time" },
        license: { type: "string" as const },
      },
      additionalProperties: false,
    },
    Interoperability: {
      type: "object" as const,
      properties: {
        a2aAgentCard: { type: "string" as const, format: "uri" },
        mcpServerUrl: { type: "string" as const, format: "uri" },
        webmcpEnabled: { type: "boolean" as const, default: false },
        ucpCapabilities: { type: "string" as const, format: "uri" },
        apaaiEndpoint: { type: "string" as const, format: "uri" },
      },
      additionalProperties: false,
    },
  },
};

/**
 * Validation error detail.
 */
export interface ValidationError {
  path: string;
  message: string;
}

/**
 * Result of parsing and validating an APoP policy.
 */
export interface ParseResult {
  /** Whether the policy is valid. */
  valid: boolean;
  /** The parsed policy (only set if valid). */
  policy?: AgentPolicy;
  /** Validation errors (only set if invalid). */
  errors?: ValidationError[];
}

// Lazy-initialized Ajv instance
let _ajv: InstanceType<typeof Ajv2020> | null = null;
let _validate: ReturnType<InstanceType<typeof Ajv2020>["compile"]> | null =
  null;

function getValidator() {
  if (!_validate) {
    _ajv = new Ajv2020({ allErrors: true, strict: false });
    addFormats(_ajv);
    _validate = _ajv.compile(APOP_SCHEMA);
  }
  return _validate;
}

/**
 * Parse a JSON string into an AgentPolicy and validate it against the APoP schema.
 *
 * @param json - Raw JSON string of the agent-policy.json file.
 * @returns ParseResult with validity status, parsed policy, or errors.
 */
export function parsePolicy(json: string): ParseResult {
  let data: unknown;
  try {
    data = JSON.parse(json);
  } catch (err) {
    return {
      valid: false,
      errors: [
        { path: "", message: `Invalid JSON: ${(err as Error).message}` },
      ],
    };
  }
  return validatePolicy(data);
}

/**
 * Validate a parsed object against the APoP schema.
 *
 * @param data - Parsed policy object to validate.
 * @returns ParseResult with validity status, parsed policy, or errors.
 */
export function validatePolicy(data: unknown): ParseResult {
  const validate = getValidator();
  const valid = validate(data);

  if (!valid) {
    const errors: ValidationError[] = (validate.errors || []).map((e) => ({
      path: e.instancePath || "/",
      message: e.message || "Unknown validation error",
    }));
    return { valid: false, errors };
  }

  return { valid: true, policy: data as AgentPolicy };
}

/**
 * Load and validate an AgentPolicy from a file path.
 *
 * @param filePath - Absolute or relative path to agent-policy.json.
 * @returns Promise<ParseResult>
 */
export async function parsePolicyFile(filePath: string): Promise<ParseResult> {
  const { readFile } = await import("node:fs/promises");
  const content = await readFile(filePath, "utf-8");
  return parsePolicy(content);
}

/**
 * Returns the raw APoP JSON Schema object.
 */
export function getSchema(): typeof APOP_SCHEMA {
  return APOP_SCHEMA;
}
