# APoP Python SDK

**Agent Policy Protocol (APoP) SDK for Python** — the authorization & consent layer for the agentic web.

> Like `robots.txt`, but for AI agents — with fine-grained access control, identity verification, rate limiting, and cross-protocol interoperability.

[![PyPI version](https://img.shields.io/pypi/v/apop.svg)](https://pypi.org/project/apop/)
[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

## Installation

```bash
pip install apop
```

With framework extras:

```bash
pip install apop[fastapi]   # FastAPI / Starlette
pip install apop[flask]     # Flask
pip install apop[django]    # Django
pip install apop[all]       # All frameworks
```

## Quick Start

### 1. Create your policy (`agent-policy.json`)

```json
{
  "version": "1.0",
  "defaultPolicy": {
    "allow": true,
    "disallow": ["extract", "automated_purchase"],
    "rateLimit": { "requests": 100, "window": "hour" }
  },
  "pathPolicies": [
    { "path": "/admin/*", "allow": false },
    { "path": "/api/**", "allow": true, "requireVerification": true }
  ]
}
```

### 2. Use with FastAPI

```python
from fastapi import FastAPI
from apop.parser import parse_policy_file
from apop.middleware.fastapi import create_fastapi_middleware, create_discovery_route
from apop.types import MiddlewareOptions

app = FastAPI()

# Load and validate policy
result = parse_policy_file("agent-policy.json")
policy = result.policy

# Add enforcement middleware
app.add_middleware(
    create_fastapi_middleware(MiddlewareOptions(policy=policy))
)

# Serve policy at well-known URL
app.get("/.well-known/agent-policy.json")(create_discovery_route(policy))
```

### 3. Use with Flask

```python
from flask import Flask
from apop.parser import parse_policy_file
from apop.middleware.flask import create_flask_middleware, create_flask_discovery
from apop.types import MiddlewareOptions

app = Flask(__name__)

result = parse_policy_file("agent-policy.json")
policy = result.policy

create_flask_middleware(app, MiddlewareOptions(policy=policy))
create_flask_discovery(app, policy)
```

### 4. Use with Django

```python
# settings.py
MIDDLEWARE = [
    # ... other middleware ...
    'apop.middleware.django.APoPMiddleware',
]

APOP_POLICY_FILE = BASE_DIR / "agent-policy.json"
```

### 5. Programmatic Enforcement

```python
from apop.parser import parse_policy
from apop.enforcer import enforce
from apop.types import RequestContext

result = parse_policy('{"version":"1.0","defaultPolicy":{"allow":true}}')
policy = result.policy

decision = enforce(policy, RequestContext(
    path="/api/data",
    agent_name="TestBot/1.0",
    agent_intent="read",
    agent_id="did:web:testbot.com",
    agent_signature="sig123",
))

print(decision.status)       # "allowed"
print(decision.http_status)  # 200
print(decision.headers)      # {"Agent-Policy-Status": "allowed", ...}
```

### 6. Policy Discovery

```python
import asyncio
from apop.discovery import discover_policy

async def main():
    result = await discover_policy("example.com")
    if result.policy:
        print(f"Found policy via {result.method}")
        print(f"Version: {result.policy.version}")
    else:
        print(f"No policy found: {result.error}")

asyncio.run(main())
```

## API Reference

### Core Modules

| Module           | Description                                              |
| ---------------- | -------------------------------------------------------- |
| `apop.parser`    | Parse & validate `agent-policy.json` against JSON Schema |
| `apop.enforcer`  | Evaluate policy against request context                  |
| `apop.matcher`   | Glob-style path matching (`/*`, `/**`)                   |
| `apop.headers`   | Parse agent request headers, build response headers      |
| `apop.discovery` | 4-method discovery chain (well-known, header, meta, DNS) |
| `apop.types`     | Dataclass types for all APoP entities                    |

### Middleware Adapters

| Module                    | Framework           |
| ------------------------- | ------------------- |
| `apop.middleware.fastapi` | FastAPI / Starlette |
| `apop.middleware.flask`   | Flask               |
| `apop.middleware.django`  | Django              |

### Key Functions

```python
# Parser
parse_policy(json_str: str) -> ParseResult
validate_policy(data: Any) -> ParseResult
parse_policy_file(path: str) -> ParseResult
get_schema() -> dict

# Enforcer
enforce(policy: AgentPolicy, ctx: RequestContext) -> EnforcementResult

# Matcher
path_matches(url_path: str, pattern: str) -> bool
match_path_policy(policy: AgentPolicy, url_path: str) -> PathPolicy | None
merge_policy(default: PolicyRule, path_rule: PathPolicy | None) -> MergedPolicy

# Headers
parse_request_headers(headers: dict) -> AgentRequestHeaders
is_agent(headers: AgentRequestHeaders) -> bool
parse_intents(header: str | None) -> list[str]
build_allowed_headers(**kwargs) -> dict[str, str]
build_denied_headers(**kwargs) -> dict[str, str]
build_verification_headers(**kwargs) -> dict[str, str]
build_rate_limited_headers(**kwargs) -> dict[str, str]

# Discovery (async)
discover_policy(domain: str, options?: DiscoveryOptions) -> DiscoveryResult
```

### Types

| Type                  | Description                                              |
| --------------------- | -------------------------------------------------------- |
| `AgentPolicy`         | Top-level policy manifest                                |
| `PolicyRule`          | Default or path-specific rules                           |
| `PathPolicy`          | Path-specific policy with allow/deny lists               |
| `RateLimit`           | Rate limiting config (requests + window)                 |
| `Verification`        | Identity verification config                             |
| `EnforcementResult`   | Result of `enforce()` — status, HTTP code, headers, body |
| `RequestContext`      | Incoming request info for enforcement                    |
| `AgentRequestHeaders` | Parsed agent headers                                     |
| `DiscoveryResult`     | Result of `discover_policy()`                            |

### HTTP Status Codes

| Code | Constant                                     | Meaning                      |
| ---- | -------------------------------------------- | ---------------------------- |
| 430  | `APOP_STATUS_CODES["ACTION_NOT_ALLOWED"]`    | Action not allowed by policy |
| 438  | `APOP_STATUS_CODES["RATE_LIMITED"]`          | Rate limit exceeded          |
| 439  | `APOP_STATUS_CODES["VERIFICATION_REQUIRED"]` | Agent must verify identity   |

### Action Types

```python
from apop.types import ACTION_TYPES
# ('read', 'index', 'extract', 'summarize', 'render',
#  'api_call', 'form_submit', 'automated_purchase', 'tool_invoke', 'all')
```

## Known Limitations

> These match the Node.js SDK and are documented for transparency:

- **Rate limiting is advisory-only**: Headers are set from config, but actual request counting is not implemented. Use a dedicated rate limiter (e.g., `slowapi`, Redis) for production enforcement.
- **Signature verification is presence-check only**: `require_verification=True` checks that an `Agent-Signature` or `Agent-VC` header exists, but does not perform cryptographic validation.

## Development

```bash
# Clone the repo
git clone https://github.com/ArunSuperdom/agent-policy-protocol.git
cd agent-policy-protocol/sdk/python

# Install dev dependencies
pip install -e ".[dev]"

# Run tests
pytest

# Type check
mypy src/apop

# Lint
ruff check src/ tests/
```

## License

Apache 2.0 — see [LICENSE](../../LICENSE).

## Links

- [APoP Specification](../../spec/README.md)
- [JSON Schema](../../spec/schema/agent-policy.schema.json)
- [Node.js SDK](../node/README.md)
- [Example Policies](../../examples/)
- [GitHub Repository](https://github.com/ArunSuperdom/agent-policy-protocol)
