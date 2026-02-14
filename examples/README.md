# APoP Example Policies

This directory contains 9 example `agent-policy.json` files for different industries and use cases. Each validates against the [APoP v1.0 JSON Schema](../spec/schema/agent-policy.schema.json).

## Examples

| File                                             | Use Case                                       | Default Access                 | Verification                          |
| ------------------------------------------------ | ---------------------------------------------- | ------------------------------ | ------------------------------------- |
| [news-publisher.json](news-publisher.json)       | News/media site with paywalled content         | Allow read + index             | Required for premium content          |
| [ecommerce.json](ecommerce.json)                 | E-commerce store with checkout protection      | Allow read + render            | Required for checkout/purchase        |
| [saas-api.json](saas-api.json)                   | API-first SaaS with public docs                | Allow read                     | Required for API endpoints            |
| [open-data.json](open-data.json)                 | Government open data portal                    | Allow all (generous)           | Not required                          |
| [restrictive.json](restrictive.json)             | High-security corporate site                   | Deny all                       | Required everywhere                   |
| [healthcare.json](healthcare.json)               | HIPAA-sensitive hospital system                | Deny all                       | VC required, allowlist only           |
| [personal-blog.json](personal-blog.json)         | Simple personal blog                           | Allow read + index + summarize | Not required                          |
| [wordpress-default.json](wordpress-default.json) | WordPress site template                        | Allow read + index + summarize | Not required (except WooCommerce API) |
| [multi-protocol.json](multi-protocol.json)       | Full interop: A2A + MCP + WebMCP + UCP + APAAI | Allow read + render            | Required for API/tools                |

## When to Use Each

### Permissive (low friction)

- **open-data.json** — Public datasets, government portals, open-source docs. No barriers.
- **personal-blog.json** — Personal sites that want search indexing and AI summarization.
- **wordpress-default.json** — Drop-in for any WordPress site. Blocks admin, allows content.

### Balanced (some protection)

- **news-publisher.json** — Free content indexable, premium behind verification. Good for media companies.
- **ecommerce.json** — Product pages open, checkout/purchase locked down. Prevents unauthorized purchases.
- **saas-api.json** — Docs open, API requires auth. Standard for developer platforms.

### Restrictive (maximum control)

- **restrictive.json** — Near-total lockdown. Only root page readable with verification.
- **healthcare.json** — HIPAA-compliant. Patient data fully blocked, only allowlisted agents for appointments.

### Advanced

- **multi-protocol.json** — Complete interop declaration linking APoP with A2A, MCP, WebMCP, UCP, and APAAI.

## Validating Examples

Validate any example against the schema:

```bash
# Using ajv-cli
npx ajv validate -s ../spec/schema/agent-policy.schema.json -d news-publisher.json

# Using the APoP CLI (coming soon)
npx apop-validate news-publisher.json
```

## Using as Templates

1. Copy the example closest to your use case
2. Update `policyUrl` to your domain
3. Adjust `pathPolicies` for your URL structure
4. Set `contact` information
5. Save as `/.well-known/agent-policy.json` on your site

## Schema Reference

See [spec/schema/agent-policy.schema.json](../spec/schema/agent-policy.schema.json) for the full JSON Schema definition.
