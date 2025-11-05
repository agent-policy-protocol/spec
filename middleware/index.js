import fs from "fs";
import path from "path";

export default function handler(req, res) {
  // Load the policy from one level up (root)
  const policyPath = path.join(process.cwd(), "../agent-policy.json");
  const policy = JSON.parse(fs.readFileSync(policyPath, "utf-8"));

  const isAgent = !!req.headers["agent-name"];
  const pathRule = matchPathRule(req.url, policy);
  const effective = { ...policy.default, ...pathRule };

  if (!isAgent) {
    res.status(200).send("✅ APP Middleware active. Agent Policy enforced.");
    return;
  }

  // Require verification
  if (effective.require_verification && !req.headers["agent-keyid"]) {
    res.setHeader("WWW-Agent-Verify", "/agent-verify");
    res.status(432).send("Agent Verification Required");
    return;
  }

  // Disallow read example
  if ((effective.disallow || []).includes("read")) {
    res.setHeader("Agent-Policy", "block unverified");
    res.status(430).send("Agent Policy Violation");
    return;
  }

  // Success
  res.setHeader("Agent-Policy", "allow read");
  res.setHeader("Agent-Policy-Remaining", effective.rate_limit.requests.toString());
  res.status(200).send("✅ APP Middleware active. Agent Policy enforced.");
}

function matchPathRule(urlPath, policy) {
  for (const rule of policy.paths || []) {
    const pattern = rule.pattern.replace("*", "");
    if (urlPath.startsWith(pattern)) return rule;
  }
  return null;
}
