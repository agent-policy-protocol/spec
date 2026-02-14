# APoP Project Review — Issues & Implementation Plan

**Date**: 2026-02-14
**Repo**: https://github.com/agent-policy-protocol/spec
**Reviewer**: GitHub Copilot (Claude Opus 4.6)

---

## Summary

The project is a strong v1.0 specification with clean positioning ("authorization & consent layer for the agentic web"), a well-designed JSON Schema, RFC-style spec docs, a TypeScript SDK, 210+ tests, CI/CD, Docker support, and 9 example policies. However, there are issues ranging from critical (missing LICENSE file, spec inconsistencies) to minor (deprecated Docker config) that should be addressed before wider adoption.

---

## Issue List

### CRITICAL

| #   | Issue                                      | Location                                                          | Details                                                                                                                                                                                                                                                                                                         |
| --- | ------------------------------------------ | ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C1  | **No LICENSE file**                        | Repo root                                                         | README and all `package.json` files declare Apache-2.0 but no `LICENSE` file exists. GitHub shows "No license" which is legally ambiguous.                                                                                                                                                                      |
| C2  | **`allow` + `actions` field ambiguity**    | `spec/schema/agent-policy.schema.json` — PolicyRule `$defs`       | `allow` can be `boolean` OR `ActionType[]`, and `actions` is also `ActionType[]`. When both are present, precedence is undefined. The enforcer only checks `allow` as boolean, never as an array. Either remove the array form of `allow` (keep it boolean, use `actions` for the list) or document precedence. |
| C3  | **v0.1 artifacts create confusion**        | `SPEC.md` (root), `docs/PROJECT_OVERVIEW.md`                      | `SPEC.md` uses v0.1 names (`default`, `paths`, `pattern`, `require_verification`, `per_seconds`). `PROJECT_OVERVIEW.md` references status codes **431** and **432** which are wrong in v1.0 (should be **438** and **439**). Code 431 conflicts with RFC 6585.                                                  |
| C4  | **Discovery fallback order inconsistency** | `prompts/apop_immediate_plan_prompt_v1.md` vs `spec/discovery.md` | The spec says: Well-known → HTTP Header → HTML Meta → DNS TXT. The prompt says: DNS TXT → Well-known → HTTP Header → HTML Meta. The spec is correct; the prompt is wrong.                                                                                                                                       |

### HIGH

| #   | Issue                                               | Location                                                                                         | Details                                                                                                                                                                                                                           |
| --- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| H1  | **`/**` glob bug in middleware and test helpers\*\* | `middleware/index.express.js:36-38`, `middleware/index.js`, `tests/conformance/helpers.js:11-14` | Uses `urlPath.startsWith(prefix)` which incorrectly matches `/deep/nestedXYZ` for pattern `/deep/nested/**`. The SDK (`sdk/node/src/matcher.ts:22-24`) correctly uses `urlPath === prefix \|\| urlPath.startsWith(prefix + "/")`. |
| H2  | **Tests don't test the SDK**                        | `tests/conformance/helpers.js`                                                                   | Conformance tests use a hand-written middleware copy in `helpers.js`, not the SDK. If the SDK has bugs the helpers don't, tests pass but the SDK is broken. Already proven by H1.                                                 |
| H3  | **No rate limiting enforcement**                    | `sdk/node/src/enforcer.ts`                                                                       | `enforce()` never returns `rate-limited` status. Rate limit config is passed through to headers but request counts are never tracked. `Agent-Policy-Rate-Remaining` is set to the _max_ value, not actual remaining.              |
| H4  | **`todays-readme.md` in repo root**                 | `todays-readme.md`                                                                               | Appears to be a working scratchpad. Should not be in a published spec repo.                                                                                                                                                       |

### MEDIUM

| #   | Issue                                                    | Location                                                                                            | Details                                                                                                                                                             |
| --- | -------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| M1  | **Missing standard open-source files**                   | Repo root                                                                                           | No `CONTRIBUTING.md` or `SECURITY.md`. Essential for an open standard seeking community contribution.                                                               |
| M2  | **Date inconsistencies**                                 | `spec/discovery.md`, `spec/agent-identification.md`, `spec/http-extensions.md`, `agent-policy.json` | Spec docs say `Last Updated: 2025-02-14` (should be 2026). Root `agent-policy.json` metadata says `"lastModified": "2025-02-14T00:00:00Z"` while examples say 2026. |
| M3  | **Docker Compose deprecated `version` key**              | `docker-compose.yml:1`                                                                              | `version: "3.8"` is deprecated in Docker Compose v2+. Should be removed.                                                                                            |
| M4  | **CI schema validation uses `require()` in ESM project** | `.github/workflows/schema-validate.yml:46`                                                          | Inline Node script uses `require()` but the project is ESM. Will fail if `package.json` has `"type": "module"`.                                                     |
| M5  | **`$schema` / `$id` URLs point to non-existent domain**  | `spec/schema/agent-policy.schema.json:3`                                                            | `https://agentpolicy.org/schema/v1/agent-policy.schema.json` presumably returns 404. Add a note that this is a placeholder, or host it at the GitHub raw URL.       |
| M6  | **`policyUrl` not marked as recommended**                | Schema + spec docs                                                                                  | Without `policyUrl`, error responses can't include a link back to the policy. Should be documented as RECOMMENDED.                                                  |

---

## Implementation Plan — 4 Commits

### Commit 1: Legal & Repo Hygiene

**Scope**: Add missing repo files, remove scratchpad, fix dates.

**Files to create**:

- `LICENSE` — Full Apache License 2.0 text
- `CONTRIBUTING.md` — Contribution guidelines (how to propose changes, submit PRs, code of conduct reference)
- `SECURITY.md` — Responsible disclosure policy

**Files to modify**:

- `spec/discovery.md` — Change `Last Updated: 2025-02-14` → `2026-02-14`
- `spec/agent-identification.md` — Change `Last Updated: 2025-02-14` → `2026-02-14`
- `spec/http-extensions.md` — Change `Last Updated: 2025-02-14` → `2026-02-14`
- `agent-policy.json` — Change `"lastModified": "2025-02-14T00:00:00Z"` → `"2026-02-14T00:00:00Z"`
- `docker-compose.yml` — Remove `version: "3.8"` line

**Files to delete**:

- `todays-readme.md`

**Covers**: C1, H4, M1, M2, M3

**Commit message**:

```
chore: add LICENSE, CONTRIBUTING, SECURITY; remove scratchpad; fix dates

- Add Apache-2.0 LICENSE file
- Add CONTRIBUTING.md with contribution guidelines
- Add SECURITY.md with responsible disclosure policy
- Remove todays-readme.md (working scratchpad, not spec content)
- Fix Last Updated dates in spec docs from 2025 to 2026
- Fix lastModified in root agent-policy.json from 2025 to 2026
- Remove deprecated `version` key from docker-compose.yml
```

---

### Commit 2: Spec & Schema Fixes

**Scope**: Fix the schema ambiguity, update stale v0.1 docs, resolve discovery order conflict, add policyUrl guidance.

**Files to modify**:

1. **`spec/schema/agent-policy.schema.json`** — In the `PolicyRule` definition:
   - Change `allow` to `type: "boolean"` only (remove the `oneOf` with array form)
   - The `actions` array already serves the purpose of listing allowed action types
   - Same change in `PathPolicy.allow`
   - Add `description` note to `policyUrl`: "RECOMMENDED. Without this, error responses cannot reference the policy."

2. **`sdk/node/src/types.ts`** — Update `PolicyRule.allow` to `boolean` only (remove `ActionType[]` union)
   - Update `PathPolicy.allow` to `boolean` only

3. **`SPEC.md`** — Add deprecation banner at the top:

   ```markdown
   > **DEPRECATED**: This is the v0.1 draft specification, superseded by the v1.0 spec in the `spec/` directory.
   > See [spec/README.md](spec/README.md) for the current specification.
   ```

   Optionally move to `docs/archive/spec-v0.1.md`.

4. **`docs/PROJECT_OVERVIEW.md`** — Update status codes:
   - `431` → `438` (Agent Rate Limited)
   - `432` → `439` (Agent Verification Required)
   - Update all prose references (Vercel serverless section, Enforcement Models table)

5. **`prompts/apop_immediate_plan_prompt_v1.md`** — Fix discovery fallback order from "DNS TXT → Well-known ..." to "Well-known → HTTP Header → HTML Meta → DNS TXT" (or add a note that the canonical order is in `spec/discovery.md`)

6. **`.github/workflows/schema-validate.yml`** — Fix the inline Node script:

   ```yaml
   - name: Validate schema is valid JSON Schema
     run: |
       node --input-type=module -e "
         import { readFileSync } from 'fs';
         const schema = JSON.parse(readFileSync('./spec/schema/agent-policy.schema.json', 'utf-8'));
         console.log('Schema title:', schema.title);
         console.log('Schema version:', schema.properties.version.default);
         console.log('Required fields:', schema.required);
         console.log('Schema is valid JSON');
       "
   ```

7. **Root `agent-policy.json`** and **`middleware/agent-policy.json`** — If `allow` was used as an array anywhere, change to boolean + `actions`. (Currently both use `"allow": true` so no change needed, but verify.)

8. **All 9 example files in `examples/`** — Verify none use `allow` as an array. (Currently they all use booleans, so likely no change needed.)

**Covers**: C2, C3, C4, M4, M5, M6

**Commit message**:

```
fix: resolve schema ambiguity, update v0.1 docs, fix discovery order

- Simplify PolicyRule.allow to boolean-only (remove array form; use
  `actions` for listing allowed action types)
- Update PathPolicy.allow to boolean-only in schema and TypeScript types
- Add deprecation banner to SPEC.md (v0.1 draft)
- Fix PROJECT_OVERVIEW.md status codes: 431→438, 432→439
- Fix discovery fallback order in implementation plan prompt
- Fix ESM/CJS mismatch in schema-validate CI workflow
- Mark policyUrl as RECOMMENDED in schema description
```

---

### Commit 3: Fix `/**` Glob Bug & Unify Enforcement Logic

**Scope**: Fix the path matching bug in middleware and test helpers, and rewire tests to use the SDK.

**Files to modify**:

1. **`middleware/index.express.js`** — Fix `pathMatches()`:

   ```javascript
   if (pattern.endsWith("/**")) {
     const prefix = pattern.slice(0, -3);
     return urlPath === prefix || urlPath.startsWith(prefix + "/");
   }
   ```

2. **`middleware/index.js`** — Same fix for the Vercel handler's `pathMatches()`.

3. **`tests/conformance/helpers.js`** — Two options (pick one):
   - **Option A (preferred)**: Import `pathMatches`, `matchPathPolicy`, `mergePolicy` from `sdk/node/src/matcher.ts` instead of re-implementing. Import `enforce` from `sdk/node/src/enforcer.ts` and use it in the middleware. This requires the conformance tests to depend on the SDK.
   - **Option B (quick fix)**: Fix the `pathMatches()` bug inline (same one-line fix as middleware) and leave the code duplication for now.

   If choosing Option A:
   - Update `tests/conformance/package.json` to add a local dependency: `"@apop/node": "file:../../sdk/node"`
   - Rewrite `helpers.js` to import from `@apop/node` and build the Express app using `createExpressMiddleware` from the SDK
   - This ensures conformance tests validate the actual SDK

4. **Add a regression test** in `tests/conformance/test-path-matching.js`:
   ```javascript
   it("should NOT match /** when path shares prefix but not segment boundary", () => {
     expect(pathMatches("/deep/nestedXYZ", "/deep/nested/**")).toBe(false);
   });
   ```

**Covers**: H1, H2

**Commit message**:

```
fix: fix /** glob matching bug, unify enforcement across middleware/tests

- Fix pathMatches() for /** patterns: require segment boundary match
  (prevents /deep/nestedXYZ matching /deep/nested/**)
- Fix in middleware/index.express.js, middleware/index.js, and
  tests/conformance/helpers.js
- Add regression test for segment boundary edge case
- [Optional] Rewire conformance tests to import from sdk/node
```

---

### Commit 4: Document Rate Limiting Limitations & Add Schema Note

**Scope**: Clearly document what is and isn't implemented for rate limiting. Add a note about the `$schema` URL being a placeholder.

**Files to modify**:

1. **`sdk/node/README.md`** — Add a "Limitations" or "Current Status" section:

   ```markdown
   ## Limitations

   ### Rate Limiting

   The current SDK evaluates rate limit _configuration_ from the policy and
   includes `Agent-Policy-Rate-Limit` headers in responses, but does **not**
   track actual request counts. The `Agent-Policy-Rate-Remaining` header
   reflects the configured maximum, not the actual remaining quota.

   To enforce real rate limits, integrate a rate limiting backend
   (in-memory, Redis, etc.) alongside the SDK. A built-in rate limiter
   with pluggable backends is planned for a future release.

   ### Signature Verification

   The SDK checks for the _presence_ of `Agent-Signature` or `Agent-VC`
   headers when `requireVerification: true`, but does not perform
   cryptographic signature validation. Actual verification must be
   implemented by the consuming application.
   ```

2. **`spec/schema/agent-policy.schema.json`** — Add a comment/description note to `$id`:

   ```json
   "$id": "https://agentpolicy.org/schema/v1/agent-policy.schema.json",
   "description": "... Note: The $id URI is the canonical identifier for this schema. The schema is currently hosted at https://github.com/agent-policy-protocol/spec/blob/main/spec/schema/agent-policy.schema.json."
   ```

   (JSON Schema doesn't support comments, so put this in the top-level `description` field.)

3. **`tests/conformance/helpers.js`** — Fix `Agent-Policy-Rate-Remaining` to not mislead:

   ```javascript
   // Change from:
   res.set(
     "Agent-Policy-Rate-Remaining",
     effective.rateLimit.requests.toString(),
   );
   // To:
   res.set(
     "Agent-Policy-Rate-Remaining",
     effective.rateLimit.requests.toString() +
       " (max, tracking not implemented)",
   );
   ```

   Or better: add a comment explaining this is a placeholder value.

4. **`docs/REMAINING_WORK.md`** — Under Phase 2.3 ("Migrate Existing Middleware"), add a note:
   ```markdown
   - [ ] Implement actual rate limit tracking (in-memory counter + Redis adapter)
   - [ ] Implement signature verification (Ed25519, ES256 at minimum)
   ```

**Covers**: H3, M5

**Commit message**:

```
docs: document rate limiting and verification limitations

- Add Limitations section to sdk/node/README.md covering rate limiting
  (advisory-only) and signature verification (presence-check only)
- Add note about $schema/$id URL being a placeholder
- Update REMAINING_WORK.md with explicit rate limiter and signature
  verification tasks
- Clarify Agent-Policy-Rate-Remaining is max value, not actual remaining
```

---

## Commit Sequence Summary

| Order | Commit                      | Issues Resolved        | Risk                                      | Status  |
| ----- | --------------------------- | ---------------------- | ----------------------------------------- | ------- |
| 1     | Legal & Repo Hygiene        | C1, H4, M1, M2, M3     | None — additive only                      | ✅ DONE |
| 2     | Spec & Schema Fixes         | C2, C3, C4, M4, M5, M6 | Medium — schema change affects types      | ✅ DONE |
| 3     | Glob Bug & Test Unification | H1, H2                 | Medium — test refactor may need debugging | ✅ DONE |
| 4     | Rate Limit Docs & Cleanup   | H3, M5                 | None — documentation only                 | ✅ DONE |

**Recommendation**: Do commits in this order. Commit 1 is zero-risk. Commit 2 changes the schema (breaking if anyone uses `allow` as an array — verify examples first). Commit 3 fixes a real bug. Commit 4 is pure documentation.

---

## Issues NOT Addressed (Deferred)

These are valid improvements but belong in future work, not this cleanup pass:

- **Publish `@apop/node` on npm** — Tracked in `REMAINING_WORK.md` Phase 2.1
- **Python SDK** — Tracked in Phase 2.2
- **Actual rate limiting with Redis** — Tracked in Phase 2.3
- **CLI Validator** — Tracked in Phase 3.1
- **Protocol bridges (MCP, A2A, WebMCP)** — Tracked in Phase 4
- **Host schema at `agentpolicy.org`** — Requires domain/infra setup
- **Signature verification implementation** — Requires crypto library integration
