# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

This is the monorepo for the **Agent Policy Protocol (APoP)** — an open standard ("robots.txt for the agentic web") that lets a site declare, via `/.well-known/agent-policy.json`, how AI agents may access it: which actions are allowed, rate limits, identity verification, and cross-protocol interop.

The spec itself is the product. Everything else (SDKs, middleware, website) is a reference implementation or distribution of that spec.

## Monorepo layout — there is NO root package manager

Each subdirectory is an **independent project with its own install/test step**. There is no root `package.json`; never run `npm install` at the repo root. The components and their toolchains:

| Directory | Tool | Purpose |
| --- | --- | --- |
| `spec/` | — | **Source of truth.** JSON Schema (`spec/schema/agent-policy.schema.json`, draft 2020-12) + markdown specs (`discovery.md`, `agent-identification.md`, `http-extensions.md`) |
| `sdk/node/` | npm + vitest + tsc | Packaged as `@apop/node` (not yet published to npm) |
| `sdk/python/` | hatchling + pytest + ruff + mypy | Packaged as `apop` (not yet published to PyPI) |
| `middleware/` | npm | Reference Express (`index.express.js`) + Vercel (`index.js`) handlers |
| `tests/conformance/` | vitest + supertest + ajv | Protocol conformance suite (the spec's executable contract) |
| `website/` | **pnpm** + Next.js 16 + Fumadocs | agentpolicy.org — docs, blog, interactive playground |
| `examples/` | — | 9 industry policy JSON templates, validated in CI |
| `SPEC.md` | — | Superseded v0.1 draft; `spec/` is authoritative |

## Common commands

```bash
# Node SDK (sdk/node)
npm install && npm test          # vitest
npm run build                    # tsc → dist/
npm run lint                     # tsc --noEmit
npx vitest run tests/enforcer.test.ts   # single test file

# Python SDK (sdk/python) — verified clean: ruff, strict mypy, 107 pytest tests
pip install -e ".[dev]"
pytest                           # all tests
pytest tests/test_enforcer.py    # single file
ruff check . && mypy src         # lint + strict typecheck (both must pass)

# Conformance suite (tests/conformance) — run before submitting SDK/middleware changes
npm install && npm test
npm run validate:examples        # validate examples/*.json against the schema

# Reference middleware (middleware)
npm install && node index.express.js   # serves on :3000
docker compose up                       # middleware + test-agent (from repo root)

# Website (website) — uses pnpm, NOT npm
pnpm install
pnpm sync-spec                   # MUST run after editing spec/ (see below)
pnpm dev                         # localhost:3000
pnpm build
pnpm lint                        # eslint
```

## SDK architecture (Node and Python mirror each other)

Both SDKs are deliberately structured the same way — same module names, same public functions, same enforcement order. A change to protocol behavior should usually land in **both**.

Modules: `types` → `parser` (ajv/jsonschema validation against the bundled schema) → `matcher` (glob path matching + policy merge) → `enforcer` (the decision engine) → `headers` (parse agent request headers, build response headers) → `discovery` (fetch + resolve a remote policy). Framework adapters live under `middleware/` (Express/Vercel/Next.js for Node; FastAPI/Flask/Django for Python) and are thin wrappers over `enforce()`.

Python typing notes: `mypy` runs `strict = true`. The web frameworks (FastAPI/Flask/Django) and `dnspython` are *optional* deps, imported lazily inside their adapter functions; `pyproject.toml` has per-module mypy overrides so missing stubs/untyped decorators on those don't fail the strict check — keep new framework integration code inside those modules. Action lists are typed as `list[ActionType]` (a `Literal`) and flow through `MergedPolicy`; functions that only read them take `Sequence[str]` to stay covariant (`list[ActionType]` is not assignable to `list[str]`).

**Enforcement pipeline** (`enforcer.ts` / `enforcer.py`) — evaluated strictly in this order, first failure wins:
1. Match path policy, merge over `defaultPolicy`
2. `agentDenylist` → **430**
3. `agentAllowlist` (agent must be present) → **430**
4. `allow === false` → **430**
5. Intent in `disallow` list → **430**
6. `requireVerification` with no `Agent-Signature`/`Agent-VC` → **439**
7. Otherwise **200** with rate-limit headers

**Protocol invariants that span files** (keep these consistent across schema, both SDKs, and conformance tests):
- Custom status codes: `430` Action Not Allowed, `438` Rate Limited, `439` Verification Required
- 10 action types; `disallow` takes precedence over `allow`
- Path globs: `/foo/*` matches one segment only; `/foo/**` matches recursively; otherwise exact match. First matching `pathPolicies` entry wins.
- `mergePolicy` overlays the path rule onto `defaultPolicy` field-by-field (path values win when defined)

## Website content pipeline

- Built on **Fumadocs** (MDX). Docs live in `website/content/docs/`, blog in `website/content/blog/`. Blog frontmatter is schema-validated in `website/source.config.ts`. `website/.source/` is generated — never edit it.
- **The specification docs are generated, not hand-written.** `pnpm sync-spec` (`website/scripts/sync-spec.ts`) copies `spec/*.md` → `website/content/docs/specification/*.mdx` and `spec/schema/*.json` → `website/public/schema/v1/`. To change spec content, edit the source in `spec/` and re-run `sync-spec` — do not edit the generated `content/docs/specification/` MDX or the copied schema directly.
- The `website/` directory has its own git workflows, `.env.example`, and `vercel.json`. Active website work happens on the `website` branch (not `main`).
- Local agent skills for website work live in `.agents/skills/` (`frontend-design`, `seo-audit`, `web-design-guidelines`).

## CI (`.github/workflows/`)

- `ci.yml`: conformance suite on Node 18/20/22 + a middleware smoke test (boots `index.express.js`, curls the well-known endpoint).
- `schema-validate.yml`: runs `validate:examples` whenever `spec/schema/**`, `examples/**`, or any `agent-policy.json` changes.

Practical rule: editing the schema or an example policy means both the conformance `validate:examples` step and the new behavior's tests must pass; editing protocol logic means updating Node SDK, Python SDK, and `tests/conformance/` together.
