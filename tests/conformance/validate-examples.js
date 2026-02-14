/**
 * validate-examples.js
 *
 * Standalone script to validate all example policies against the JSON Schema.
 * Usage: node validate-examples.js
 */
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
const examplesDir = path.join(__dirname, "../../examples");

const schema = JSON.parse(fs.readFileSync(schemaPath, "utf-8"));
const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(schema);

const files = fs.readdirSync(examplesDir).filter((f) => f.endsWith(".json"));

let allValid = true;

for (const file of files) {
  const content = JSON.parse(
    fs.readFileSync(path.join(examplesDir, file), "utf-8")
  );
  const valid = validate(content);
  if (valid) {
    console.log(`✅ ${file}`);
  } else {
    console.error(`❌ ${file}:`);
    for (const err of validate.errors) {
      console.error(`   ${err.instancePath} ${err.message}`);
    }
    allValid = false;
  }
}

// Also validate root agent-policy.json
const rootPolicy = path.join(__dirname, "../../agent-policy.json");
if (fs.existsSync(rootPolicy)) {
  const content = JSON.parse(fs.readFileSync(rootPolicy, "utf-8"));
  const valid = validate(content);
  if (valid) {
    console.log(`✅ agent-policy.json (root)`);
  } else {
    console.error(`❌ agent-policy.json (root):`);
    for (const err of validate.errors) {
      console.error(`   ${err.instancePath} ${err.message}`);
    }
    allValid = false;
  }
}

console.log(
  allValid
    ? "\n✅ All policies valid."
    : "\n❌ Some policies have validation errors."
);
process.exit(allValid ? 0 : 1);
