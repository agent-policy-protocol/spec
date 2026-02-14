# APoP (Agent Policy Protocol) Implementation Prompt

## Project Context

You are building the reference implementation for the Agent Policy Protocol (APoP), a W3C-track standard for website owners to control AI agent access and actions. APoP complements WebMCP, MCP, A2A, APAAI, AP2, and UCP by providing the authorization/governance layer.

## Core Objective

Build a complete reference implementation that demonstrates how websites can declare agent policies and how agents can discover and respect them.

---

## Phase 1: Core Specification Files

### Task 1.1: Create `agent-policy.json` Schema

**Location**: `/spec/schema/agent-policy.schema.json`

Create a JSON Schema that defines:

- `version`: Protocol version (start with "1.0")
- `policyUrl`: URL to full policy document
- `defaultPolicy`: Object with default rules
  - `allow`: boolean (default access)
  - `actions`: array of allowed actions ["read", "extract", "api_call", "form_submit"]
  - `rateLimit`: Object {requests: number, window: "minute"|"hour"|"day"}
- `pathPolicies`: Array of path-specific overrides
  - `path`: string (glob pattern support)
  - `allow`: boolean
  - `actions`: array
  - `requiresAuth`: boolean
  - `agentWhitelist`: array of agent identifiers
  - `agentBlacklist`: array of agent identifiers
- `metadata`: Object with owner info, contact, lastModified

### Task 1.2: Create Discovery Mechanism

**Location**: `/spec/discovery.md`

Document three discovery methods:

1. **HTTP Header**: `X-Agent-Policy: https://example.com/.well-known/agent-policy.json`
2. **Well-known URI**: `/.well-known/agent-policy.json`
3. **HTML Meta Tag**: `<meta name="agent-policy" content="/.well-known/agent-policy.json">`

### Task 1.3: Create Agent Identification Spec

**Location**: `/spec/agent-identification.md`

Define how agents identify themselves:

- **User-Agent Header**: `Mozilla/5.0 (compatible; AgentName/1.0; +https://agent.example.com/policy)`
- **Custom Header**: `X-Agent-ID: agent-name@company.com`
- **JWT-based Auth**: For verified agents (define JWT claims)

---

## Phase 2: Reference Server Implementation

### Task 2.1: Python Middleware (FastAPI/Flask)

**Location**: `/implementations/python/apop_middleware/`

Create FastAPI middleware with these core components:

1. APopMiddleware class with async support
2. Policy loader with caching mechanism
3. Agent detection from User-Agent and custom headers
4. Path matching with glob pattern support
5. Rate limiting with Redis backend
6. Action permission checking
7. Compliance response headers
8. Logging and analytics hooks

### Task 2.2: Node.js Middleware (Express)

**Location**: `/implementations/nodejs/apop-middleware/`

Port Python implementation to Express with equivalent functionality

### Task 2.3: WordPress Plugin

**Location**: `/implementations/wordpress/apop-wp/`

Create WordPress plugin:

- Admin UI for policy configuration
- Automatic `.well-known` endpoint
- Integration with existing auth systems
- Analytics dashboard

---

## Phase 3: Agent SDK Implementation

### Task 3.1: Python Agent SDK

**Location**: `/implementations/python/apop_agent/`

Create client library with:

- Policy discovery via well-known, headers, and meta tags
- Policy caching mechanism
- Permission checking before actions
- Rate limit tracking
- Automatic agent identification headers
- Fallback to robots.txt if no APoP policy
- Full async support with httpx

### Task 3.2: LangChain Integration

**Location**: `/implementations/integrations/langchain/`

Create LangChain tool wrapper that checks APoP compliance before web actions

### Task 3.3: CrewAI Integration

**Location**: `/implementations/integrations/crewai/`

Similar pattern for CrewAI tools with APoP compliance built-in

---

## Phase 4: Validation & Testing Tools

### Task 4.1: Policy Validator CLI

**Location**: `/tools/validator/`

Build CLI tool with commands:

- `apop validate policy.json` - Validate policy syntax
- `apop test https://example.com` - Test policy discovery
- `apop scan --agent-id mybot@example.com https://example.com/api` - Test compliance

### Task 4.2: Compliance Test Suite

**Location**: `/tests/compliance/`

Create comprehensive test suites:

- Policy discovery across all methods
- Enforcement of allow/deny rules
- Rate limiting accuracy
- Path matching with wildcards
- Agent whitelist/blacklist logic
- Edge cases and error handling

### Task 4.3: Browser Extension for Testing

**Location**: `/tools/browser-extension/`

Chrome extension that:

- Shows APoP policy for current site
- Visualizes allowed/denied actions
- Tests agent compliance
- Displays rate limit status

---

## Phase 5: Interoperability Bridges

### Task 5.1: MCP Server with APoP

**Location**: `/examples/mcp-integration/`

Demonstrate MCP server that checks APoP policies before exposing tools to LLMs

### Task 5.2: WebMCP Tool Contract Wrapper

**Location**: `/examples/webmcp-integration/`

Show how APoP gates WebMCP tool contracts with authorization checks

### Task 5.3: A2A Protocol Integration

**Location**: `/examples/a2a-integration/`

Document how APoP provides authorization layer for A2A agent-to-agent communications

---

## Phase 6: Documentation & Examples

### Task 6.1: Getting Started Guides

**Location**: `/docs/getting-started/`

Create guides for:

- Website owners: "Protect your site in 5 minutes"
- Agent developers: "Build compliant agents"
- Enterprise: "Deploy APoP at scale"

### Task 6.2: Example Policies

**Location**: `/examples/policies/`

Provide templates:

- `news-publisher.json`: Paywalled content protection
- `e-commerce.json`: API access with rate limits
- `saas-platform.json`: Tiered agent access
- `open-data.json`: Fully permissive policy

### Task 6.3: API Reference

Auto-generate from code comments using Sphinx/JSDoc

---

## Implementation Priority Order

1. **Week 1**: Core schema + discovery spec (Tasks 1.1-1.3)
2. **Week 2**: Python middleware (Task 2.1)
3. **Week 3**: Python agent SDK (Task 3.1)
4. **Week 4**: Node.js middleware (Task 2.2)
5. **Week 5**: LangChain/CrewAI integrations (Tasks 3.2-3.3)
6. **Week 6**: Validator & test suite (Tasks 4.1-4.2)
7. **Week 7**: MCP/WebMCP examples (Tasks 5.1-5.2)
8. **Week 8**: Documentation & launch prep (Tasks 6.1-6.3)

---

## Technical Stack Recommendations

### Server Implementation

- **Python**: FastAPI + Pydantic for validation + Redis for rate limiting
- **Node.js**: Express + Joi validation + ioredis
- **Storage**: JSON files initially, then SQLite/PostgreSQL for enterprise

### Agent SDK

- **Python**: httpx for async, cachetools for policy caching
- **Type Safety**: Full type hints with mypy/pyright

### Testing

- **Python**: pytest + pytest-asyncio + pytest-mock
- **Node.js**: jest + supertest
- **Integration**: Docker Compose for full stack testing

### CI/CD

- GitHub Actions for automated testing
- Publish to PyPI (apop-middleware, apop-agent)
- Publish to npm (@apop/middleware, @apop/agent)

---

## Code Quality Standards

- **Type Coverage**: 100% for public APIs
- **Test Coverage**: >85% for middleware, >90% for core logic
- **Documentation**: Docstrings for all public functions
- **Linting**: ruff (Python), eslint (JS)
- **Pre-commit Hooks**: black, isort, mypy

---

## Repository Structure

```
agent-policy-protocol/
├── spec/
│   ├── schema/
│   ├── discovery.md
│   └── agent-identification.md
├── implementations/
│   ├── python/
│   │   ├── apop_middleware/
│   │   └── apop_agent/
│   ├── nodejs/
│   │   └── apop-middleware/
│   ├── wordpress/
│   └── integrations/
│       ├── langchain/
│       ├── crewai/
│       └── llamaindex/
├── examples/
│   ├── policies/
│   ├── mcp-integration/
│   └── webmcp-integration/
├── tools/
│   ├── validator/
│   └── browser-extension/
├── tests/
│   └── compliance/
├── docs/
│   └── getting-started/
└── README.md
```

---

## First Coding Agent Session Commands

Start with these prompts in Coding Agent:

**Session 1: Create JSON Schema**

```
Create spec/schema/agent-policy.schema.json with complete JSON Schema v7 definition for APoP policies. Include:
- version, policyUrl, defaultPolicy, pathPolicies, metadata fields
- Validation rules for all fields
- Comprehensive examples in the schema
- Pattern matching for URLs and paths
```

**Session 2: Python Middleware**

```
Create implementations/python/apop_middleware/__init__.py with FastAPI middleware class. Requirements:
- Async support with starlette middleware pattern
- Policy loading from file with caching
- Agent detection from User-Agent and X-Agent-ID headers
- Path matching using glob patterns (fnmatch)
- Rate limiting with Redis
- Return 403 with proper error messages for denied access
- Add X-APoP-Policy and X-APoP-Status response headers
- Full type hints and docstrings
```

**Session 3: Agent SDK**

```
Create implementations/python/apop_agent/client.py with APopClient class. Requirements:
- discover_policy() method supporting all three discovery mechanisms
- check_permission() for action authorization
- request_with_compliance() wrapper for httpx requests
- Policy caching with TTL
- Automatic agent identification headers
- Async/await pattern throughout
- Full error handling and logging
```

---

## Success Metrics

- [ ] Schema validates 20+ realistic policies
- [ ] Middleware handles 1000+ req/sec with <5ms overhead
- [ ] Agent SDK has 100% type coverage
- [ ] Test suite covers 90%+ of code paths
- [ ] 3+ framework integrations working
- [ ] Documentation complete for all components
- [ ] 5+ example policies demonstrating real-world use cases

---

## Example Policy (For Reference)

```json
{
  "version": "1.0",
  "policyUrl": "https://example.com/agent-policy",
  "defaultPolicy": {
    "allow": true,
    "actions": ["read"],
    "rateLimit": {
      "requests": 100,
      "window": "hour"
    }
  },
  "pathPolicies": [
    {
      "path": "/api/*",
      "allow": true,
      "actions": ["read", "api_call"],
      "requiresAuth": true,
      "rateLimit": {
        "requests": 1000,
        "window": "hour"
      }
    },
    {
      "path": "/premium/*",
      "allow": false,
      "agentWhitelist": ["verified-agent@example.com"]
    }
  ],
  "metadata": {
    "owner": "Example Corp",
    "contact": "agent-policy@example.com",
    "lastModified": "2026-02-14T00:00:00Z"
  }
}
```

---

## Notes for Development

- Keep protocol simple for v1.0 - add complex features later
- Prioritize backward compatibility with robots.txt
- Make agent adoption frictionless (SDK auto-complies)
- Ensure website adoption is <10 min for basic setup
- Log everything for analytics but keep it privacy-safe
- Design for caching - policies shouldn't change often
- Consider offline-first for agents (cache policies locally)
- Security first - validate all inputs, sanitize outputs
