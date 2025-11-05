import express from "express";
import fs from "fs";
import path from "path";

const app = express();
const PORT = process.env.PORT || 3000;

// Load local agent-policy.json
const policyPath = path.join(process.cwd(), "../agent-policy.json");
const policy = JSON.parse(fs.readFileSync(policyPath, "utf-8"));

function isAgent(req) {
  return req.header("Agent-Name") !== undefined;
}

function matchPathRule(urlPath) {
  for (const rule of policy.paths || []) {
    const pattern = rule.pattern.replace("*", "");
    if (urlPath.startsWith(pattern)) return rule;
  }
  return null;
}

app.use((req, res, next) => {
  if (!isAgent(req)) return next(); // skip humans

  const agentName = req.header("Agent-Name");
  const keyId = req.header("Agent-KeyId");
  const pathRule = matchPathRule(req.path);
  const effective = { ...policy.default, ...pathRule };

  // Require verification
  if (effective.require_verification && !keyId) {
    res.set("WWW-Agent-Verify", "/agent-verify");
    return res.status(432).send("Agent Verification Required");
  }

  // Disallowed action check
  if ((effective.disallow || []).includes("read")) {
    res.set("Agent-Policy", "block unverified");
    return res.status(430).send("Agent Policy Violation");
  }

  // Success path
  res.set("Agent-Policy", "allow read");
  res.set("Agent-Policy-Remaining", effective.rate_limit.requests.toString());
  next();
});

app.get("/", (req, res) => {
  res.send("✅ APP Middleware active. Agent Policy enforced.");
});

app.listen(PORT, () => console.log(`Agent Policy middleware running on port ${PORT}`));
