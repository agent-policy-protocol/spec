/**
 * Test agent — sends APoP-compliant requests and logs responses.
 * Demonstrates how an agent interacts with an APoP-enforcing server.
 */
const BASE = process.env.APOP_SERVER || "http://localhost:3000";

async function testRequest(description, path, headers = {}) {
  console.log(`\n--- ${description} ---`);
  console.log(`GET ${path}`);
  console.log("Headers:", JSON.stringify(headers));

  try {
    const res = await fetch(`${BASE}${path}`, { headers });
    const body = await res.text();
    let parsed;
    try {
      parsed = JSON.parse(body);
    } catch {
      parsed = body;
    }

    console.log(`Status: ${res.status}`);
    console.log(`Agent-Policy-Status: ${res.headers.get("agent-policy-status") || "N/A"}`);
    console.log(`Agent-Policy: ${res.headers.get("agent-policy") || "N/A"}`);
    console.log(`Agent-Policy-Version: ${res.headers.get("agent-policy-version") || "N/A"}`);

    if (res.headers.get("agent-policy-rate-limit")) {
      console.log(`Rate-Limit: ${res.headers.get("agent-policy-rate-limit")}`);
    }
    if (res.headers.get("agent-policy-verify")) {
      console.log(`Verify Methods: ${res.headers.get("agent-policy-verify")}`);
    }

    console.log("Body:", typeof parsed === "string" ? parsed : JSON.stringify(parsed, null, 2));

    return { status: res.status, body: parsed, headers: Object.fromEntries(res.headers) };
  } catch (err) {
    console.error(`Error: ${err.message}`);
    return null;
  }
}

async function main() {
  console.log("=== APoP Test Agent ===");
  console.log(`Server: ${BASE}\n`);

  // 1. Discover policy
  await testRequest(
    "1. Discover policy (well-known URI)",
    "/.well-known/agent-policy.json"
  );

  // 2. Normal agent request (public path)
  await testRequest(
    "2. Agent read request to public path",
    "/public/article",
    { "Agent-Name": "TestBot", "Agent-Intent": "read" }
  );

  // 3. Disallowed intent
  await testRequest(
    "3. Agent extract request (should be blocked)",
    "/public/article",
    { "Agent-Name": "TestBot", "Agent-Intent": "extract" }
  );

  // 4. Denied path
  await testRequest(
    "4. Agent request to admin path (should be 430)",
    "/admin/dashboard",
    { "Agent-Name": "TestBot", "Agent-Intent": "read" }
  );

  // 5. Verification required
  await testRequest(
    "5. Agent request needing verification (should be 439)",
    "/some-protected-page",
    { "Agent-Name": "TestBot" }
  );

  // 6. With verification credential
  await testRequest(
    "6. Agent request with verification (should succeed)",
    "/some-protected-page",
    {
      "Agent-Name": "TestBot",
      "Agent-Id": "did:web:testbot.example.com",
      "Agent-Signature": "mock-signature",
    }
  );

  // 7. Allowlist-restricted path without being on list
  await testRequest(
    "7. Agent not on allowlist (should be 430)",
    "/api/v1/data",
    {
      "Agent-Name": "RandomBot",
      "Agent-Id": "did:web:random.example.com",
      "Agent-Signature": "sig",
    }
  );

  // 8. Allowlist-restricted path with valid agent
  await testRequest(
    "8. Agent on allowlist (should succeed)",
    "/api/v1/data",
    {
      "Agent-Name": "Perplexity Comet",
      "Agent-Id": "did:web:comet.perplexity.ai",
      "Agent-Signature": "sig",
    }
  );

  // 9. Non-agent request (no Agent-Name header)
  await testRequest(
    "9. Regular browser request (no agent headers)",
    "/"
  );

  console.log("\n=== Test Agent Complete ===");
}

main().catch(console.error);
