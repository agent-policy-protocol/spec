import {
  readFileSync,
  writeFileSync,
  copyFileSync,
  existsSync,
  mkdirSync,
} from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ROOT = join(__dirname, "..");
const SPEC_DIR = join(ROOT, "..", "spec");
const EXAMPLES_DIR = join(ROOT, "..", "examples");
const CONTENT_SPEC = join(ROOT, "content", "docs", "specification");
const PUBLIC_SCHEMA = join(ROOT, "public", "schema", "v1");

function ensureDir(dir: string) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

function mdToMdx(filePath: string, title: string, description: string): string {
  const content = readFileSync(filePath, "utf-8");

  // Strip any existing frontmatter
  const stripped = content.replace(/^---[\s\S]*?---\n*/, "");

  const frontmatter = `---
title: "${title}"
description: "${description}"
---

`;

  return frontmatter + stripped;
}

const specFiles: Array<{
  src: string;
  dest: string;
  title: string;
  description: string;
}> = [
  {
    src: "discovery.md",
    dest: "discovery.mdx",
    title: "Discovery",
    description:
      "How agents discover agent-policy.json files via .well-known URLs.",
  },
  {
    src: "agent-identification.md",
    dest: "agent-identification.mdx",
    title: "Agent Identification",
    description: "How AI agents identify themselves using HTTP headers.",
  },
  {
    src: "http-extensions.md",
    dest: "http-extensions.mdx",
    title: "HTTP Extensions",
    description:
      "Custom HTTP headers and status codes for agent policy enforcement.",
  },
];

function syncSpec() {
  console.log("🔄 Syncing spec files...\n");

  // Sync spec markdown files to MDX
  ensureDir(CONTENT_SPEC);
  for (const file of specFiles) {
    const srcPath = join(SPEC_DIR, file.src);
    if (existsSync(srcPath)) {
      const mdxContent = mdToMdx(srcPath, file.title, file.description);
      const destPath = join(CONTENT_SPEC, file.dest);
      writeFileSync(destPath, mdxContent, "utf-8");
      console.log(`  ✅ ${file.src} → content/docs/specification/${file.dest}`);
    } else {
      console.log(`  ⚠️  ${file.src} not found at ${srcPath}, skipping`);
    }
  }

  // Sync JSON Schema
  ensureDir(PUBLIC_SCHEMA);
  const schemaSource = join(SPEC_DIR, "schema", "agent-policy.schema.json");
  const schemaDest = join(PUBLIC_SCHEMA, "agent-policy.schema.json");
  if (existsSync(schemaSource)) {
    copyFileSync(schemaSource, schemaDest);
    console.log(`  ✅ agent-policy.schema.json → public/schema/v1/`);
  } else {
    console.log(`  ⚠️  Schema not found at ${schemaSource}, skipping`);
  }

  // Report available examples
  if (existsSync(EXAMPLES_DIR)) {
    const examples = [
      "ecommerce.json",
      "healthcare.json",
      "multi-protocol.json",
      "news-publisher.json",
      "open-data.json",
      "personal-blog.json",
      "restrictive.json",
      "saas-api.json",
      "wordpress-default.json",
    ];

    let found = 0;
    for (const ex of examples) {
      if (existsSync(join(EXAMPLES_DIR, ex))) {
        found++;
      }
    }
    console.log(`  ✅ ${found} example policies available in ../examples/`);
  }

  console.log("\n✨ Spec sync complete!");
}

syncSpec();
