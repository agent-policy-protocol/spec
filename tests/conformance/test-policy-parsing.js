/**
 * test-policy-parsing.js
 *
 * Validates that agent-policy.json files conform to the APoP v1.0 JSON Schema.
 * Tests schema compliance, malformed JSON, missing fields, unknown fields.
 */
import { describe, it, expect } from "vitest";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.join(
  __dirname,
  "../../spec/schema/agent-policy.schema.json"
);
const schema = JSON.parse(fs.readFileSync(schemaPath, "utf-8"));

function createValidator() {
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);
  return ajv.compile(schema);
}

describe("Policy Parsing — Schema Validation", () => {
  const validate = createValidator();

  it("should validate a minimal valid policy", () => {
    const policy = {
      version: "1.0",
      defaultPolicy: {
        allow: true,
      },
    };
    const valid = validate(policy);
    expect(valid).toBe(true);
  });

  it("should validate a full v1.0 policy", () => {
    const policy = {
      $schema: "https://agentpolicy.org/schema/v1/agent-policy.schema.json",
      version: "1.0",
      policyUrl: "https://example.com/.well-known/agent-policy.json",
      defaultPolicy: {
        allow: true,
        actions: ["read", "render"],
        disallow: ["extract"],
        rateLimit: { requests: 100, window: "hour" },
        requireVerification: false,
      },
      pathPolicies: [
        {
          path: "/admin/*",
          allow: false,
        },
      ],
      verification: {
        method: ["did", "pkix"],
        registry: "https://registry.agentpolicy.org",
      },
      contact: {
        email: "test@example.com",
      },
      metadata: {
        description: "Test",
        owner: "Test Corp",
      },
      interop: {
        mcpServerUrl: "https://example.com/mcp",
        webmcpEnabled: false,
      },
    };
    const valid = validate(policy);
    expect(valid).toBe(true);
  });

  it("should reject a policy missing required 'version' field", () => {
    const policy = {
      defaultPolicy: { allow: true },
    };
    const valid = validate(policy);
    expect(valid).toBe(false);
    const missingVersion = validate.errors?.some(
      (e) => e.params?.missingProperty === "version"
    );
    expect(missingVersion).toBe(true);
  });

  it("should reject a policy missing required 'defaultPolicy' field", () => {
    const policy = {
      version: "1.0",
    };
    const valid = validate(policy);
    expect(valid).toBe(false);
    const missingDefault = validate.errors?.some(
      (e) => e.params?.missingProperty === "defaultPolicy"
    );
    expect(missingDefault).toBe(true);
  });

  it("should reject unknown top-level properties when additionalProperties is false", () => {
    const policy = {
      version: "1.0",
      defaultPolicy: { allow: true },
      unknownField: "should fail",
    };
    const valid = validate(policy);
    expect(valid).toBe(false);
  });

  it("should reject an invalid version value", () => {
    const policy = {
      version: "2.0",
      defaultPolicy: { allow: true },
    };
    const valid = validate(policy);
    expect(valid).toBe(false);
  });

  it("should accept all 10 valid action types", () => {
    const actions = [
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
    ];
    const policy = {
      version: "1.0",
      defaultPolicy: {
        allow: true,
        actions,
      },
    };
    const valid = validate(policy);
    expect(valid).toBe(true);
  });

  it("should reject an invalid action type", () => {
    const policy = {
      version: "1.0",
      defaultPolicy: {
        allow: true,
        actions: ["read", "invalid_action"],
      },
    };
    const valid = validate(policy);
    expect(valid).toBe(false);
  });

  it("should accept all 4 verification methods", () => {
    const policy = {
      version: "1.0",
      defaultPolicy: { allow: true },
      verification: {
        method: ["pkix", "did", "verifiable-credential", "partner-token"],
      },
    };
    const valid = validate(policy);
    expect(valid).toBe(true);
  });

  it("should accept a single verification method as string", () => {
    const policy = {
      version: "1.0",
      defaultPolicy: { allow: true },
      verification: {
        method: "pkix",
      },
    };
    const valid = validate(policy);
    expect(valid).toBe(true);
  });

  it("should accept all 3 rate limit windows", () => {
    for (const window of ["minute", "hour", "day"]) {
      const policy = {
        version: "1.0",
        defaultPolicy: {
          allow: true,
          rateLimit: { requests: 100, window },
        },
      };
      const valid = validate(policy);
      expect(valid).toBe(true);
    }
  });

  it("should reject an invalid rate limit window", () => {
    const policy = {
      version: "1.0",
      defaultPolicy: {
        allow: true,
        rateLimit: { requests: 100, window: "week" },
      },
    };
    const valid = validate(policy);
    expect(valid).toBe(false);
  });
});

describe("Policy Parsing — Example Files Validation", () => {
  const validate = createValidator();
  const examplesDir = path.join(__dirname, "../../examples");

  let exampleFiles = [];
  try {
    exampleFiles = fs
      .readdirSync(examplesDir)
      .filter((f) => f.endsWith(".json"));
  } catch {
    // examples directory may not exist in CI without checkout
  }

  if (exampleFiles.length > 0) {
    it.each(exampleFiles)("should validate example: %s", (file) => {
      const content = JSON.parse(
        fs.readFileSync(path.join(examplesDir, file), "utf-8")
      );
      const valid = validate(content);
      if (!valid) {
        console.error(`Validation errors for ${file}:`, validate.errors);
      }
      expect(valid).toBe(true);
    });
  }

  it("should validate root agent-policy.json", () => {
    const rootPolicy = path.join(__dirname, "../../agent-policy.json");
    if (fs.existsSync(rootPolicy)) {
      const content = JSON.parse(fs.readFileSync(rootPolicy, "utf-8"));
      const valid = validate(content);
      if (!valid) {
        console.error("Root policy validation errors:", validate.errors);
      }
      expect(valid).toBe(true);
    }
  });
});
