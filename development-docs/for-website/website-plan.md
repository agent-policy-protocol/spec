# agentpolicy.org — Website Implementation Plan

**Created**: 2026-02-14
**Status**: Ready for Implementation
**Domain**: agentpolicy.org
**Hosting**: Vercel
**Build Location**: `./website` subfolder inside the spec project (can be extracted to `agent-policy-protocol/agentpolicy.org` repo later)
**Source Spec Repo**: `agent-policy-protocol/spec`

> **Execution Strategy**: This plan is broken into 4 self-contained phases. Each phase has a standalone prompt you can paste into a new coding agent chat. Commit after each phase before moving to the next.

---

## 1. Purpose & Goals

Build the official website for the Agent Policy Protocol (APoP) — the authorization layer for the agentic web. The site serves as:

1. **Landing page** — explain what APoP is, why it matters, who it's for
2. **Documentation hub** — full spec, SDK references, guides, examples
3. **Blog** — thought leadership, launch posts, community updates
4. **Interactive playground** — build `agent-policy.json` in-browser
5. **Community hub** — links to Discord, GitHub Discussions, contributing guide
6. **Dogfooding** — the site itself serves `/.well-known/agent-policy.json`

---

## 2. Tech Stack

| Layer                 | Technology                            | Version            | Why                                                                                                    |
| --------------------- | ------------------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------ |
| **Framework**         | Next.js                               | 16.x (App Router)  | Latest stable — native Vercel support, React Server Components, Turbopack stable                       |
| **React**             | React                                 | 19.x               | Server Components, Actions, `use()` hook, asset loading                                                |
| **Docs Engine**       | Fumadocs                              | latest (15.x+)     | Purpose-built for Next.js App Router, MDX-native, built-in search, TOC, breadcrumbs, code highlighting |
| **Language**          | TypeScript                            | 5.8+               | Type safety across the codebase                                                                        |
| **Styling**           | Tailwind CSS                          | v4                 | Utility-first, zero-runtime CSS, native cascade layers, CSS-first config                               |
| **UI Components**     | shadcn/ui                             | latest             | Beautiful, accessible, copy-paste components built on Radix UI                                         |
| **Content**           | MDX                                   | 3.x                | Markdown + React components — contributors write `.mdx` files                                          |
| **Icons**             | Lucide React                          | latest             | Consistent, tree-shakable icon set                                                                     |
| **Code Highlighting** | Shiki                                 | 3.x (via Fumadocs) | Accurate syntax highlighting with VS Code themes                                                       |
| **Search**            | Fumadocs built-in + Algolia DocSearch | latest             | Fumadocs built-in for instant search; apply for free Algolia DocSearch (open source)                   |
| **Analytics**         | Vercel Analytics + Plausible          | latest             | Privacy-first, GDPR-compliant, no cookie banner needed                                                 |
| **Deployment**        | Vercel                                | —                  | Auto-deploy from GitHub, preview deployments on PRs                                                    |
| **Package Manager**   | pnpm                                  | 10.x               | Fast, disk-efficient, workspace-native                                                                 |
| **Node.js**           | Node.js                               | 22 LTS             | Latest LTS with native fetch, test runner, ESM support                                                 |
| **Linting**           | ESLint 9 (flat config) + Prettier     | latest             | Code quality enforcement                                                                               |
| **Link Checking**     | remark-lint-no-dead-urls              | latest             | CI check for broken links in MDX                                                                       |
| **RSS**               | feed (npm)                            | ^4.2.0             | Auto-generated RSS/Atom feed for blog                                                                  |
| **SEO**               | next-sitemap + next/metadata API      | latest             | Sitemaps, Open Graph, structured data                                                                  |
| **Animation**         | Motion (formerly Framer Motion)       | 12.x+              | Subtle landing page animations                                                                         |
| **Schema Viewer**     | Custom React component                | —                  | Renders `agent-policy.schema.json` as interactive browsable docs                                       |
| **Playground**        | Monaco Editor (@monaco-editor/react)  | latest             | VS Code-quality in-browser JSON editor with schema validation                                          |

---

## 3. Repository Setup

### 3.1 Build Location: `./website` subfolder

Build inside the spec project as `./website/`. This gives you:

- Direct access to spec files, examples, and schema during development
- Clean git commits per phase (`git add website/ && git commit`)
- Can be extracted to a separate `agent-policy-protocol/agentpolicy.org` repo later
- Vercel can deploy from a monorepo subfolder (set Root Directory to `website` in project settings)

### 3.2 Directory Structure

```
website/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                    # Lint, type-check, build, link-check
│   │   ├── preview.yml               # Vercel preview deployment on PR
│   │   └── sync-spec.yml             # Auto-sync spec docs from spec repo
│   ├── CONTRIBUTING.md               # How to contribute to the website
│   └── CODEOWNERS                    # Auto-assign reviewers
├── public/
│   ├── .well-known/
│   │   └── agent-policy.json         # Dogfooding — APoP policy for this site
│   ├── favicon.ico
│   ├── og-image.png                  # Default Open Graph image (1200x630)
│   ├── logo.svg                      # APoP logo
│   ├── logo-dark.svg                 # APoP logo (dark mode variant)
│   └── schema/
│       └── v1/
│           └── agent-policy.schema.json  # Serve schema at agentpolicy.org/schema/v1/
├── content/
│   ├── docs/
│   │   ├── index.mdx                 # Docs landing — "Getting Started"
│   │   ├── meta.json                 # Fumadocs page ordering & navigation config
│   │   ├── introduction/
│   │   │   ├── meta.json
│   │   │   ├── what-is-apop.mdx
│   │   │   ├── why-apop.mdx
│   │   │   ├── quick-start.mdx
│   │   │   └── ecosystem.mdx         # Where APoP fits (MCP, A2A, WebMCP, etc.)
│   │   ├── specification/
│   │   │   ├── meta.json
│   │   │   ├── overview.mdx
│   │   │   ├── schema-reference.mdx  # Auto-rendered from JSON Schema
│   │   │   ├── discovery.mdx         # Synced from spec/discovery.md
│   │   │   ├── agent-identification.mdx  # Synced from spec/agent-identification.md
│   │   │   ├── http-extensions.mdx   # Synced from spec/http-extensions.md
│   │   │   └── changelog.mdx         # v0.1 → v1.0 evolution, future versions
│   │   ├── sdks/
│   │   │   ├── meta.json
│   │   │   ├── overview.mdx
│   │   │   ├── node/
│   │   │   │   ├── meta.json
│   │   │   │   ├── installation.mdx
│   │   │   │   ├── parser.mdx
│   │   │   │   ├── enforcer.mdx
│   │   │   │   ├── discovery.mdx
│   │   │   │   ├── middleware-express.mdx
│   │   │   │   ├── middleware-nextjs.mdx
│   │   │   │   └── middleware-vercel.mdx
│   │   │   └── python/
│   │   │       ├── meta.json
│   │   │       ├── installation.mdx
│   │   │       ├── parser.mdx
│   │   │       ├── enforcer.mdx
│   │   │       ├── discovery.mdx
│   │   │       ├── middleware-fastapi.mdx
│   │   │       ├── middleware-flask.mdx
│   │   │       └── middleware-django.mdx
│   │   ├── guides/
│   │   │   ├── meta.json
│   │   │   ├── deploy-vercel.mdx
│   │   │   ├── deploy-cloudflare.mdx
│   │   │   ├── deploy-docker.mdx
│   │   │   ├── wordpress.mdx
│   │   │   ├── nextjs.mdx
│   │   │   ├── fastapi.mdx
│   │   │   └── policy-templates.mdx  # Link to 9 examples with explanations
│   │   ├── examples/
│   │   │   ├── meta.json
│   │   │   ├── news-publisher.mdx
│   │   │   ├── ecommerce.mdx
│   │   │   ├── saas-api.mdx
│   │   │   ├── healthcare.mdx
│   │   │   ├── open-data.mdx
│   │   │   ├── restrictive.mdx
│   │   │   ├── personal-blog.mdx
│   │   │   ├── wordpress.mdx
│   │   │   └── multi-protocol.mdx
│   │   └── contributing/
│   │       ├── meta.json
│   │       ├── how-to-contribute.mdx
│   │       ├── spec-changes.mdx
│   │       ├── sdk-development.mdx
│   │       └── conformance-tests.mdx
│   └── blog/
│       ├── robots-txt-is-dead.mdx
│       ├── introducing-apop.mdx
│       ├── protect-your-website.mdx
│       ├── building-agent-aware-apps.mdx
│       └── open-letter.mdx
├── src/
│   ├── app/
│   │   ├── layout.tsx                # Root layout — fonts, metadata, theme
│   │   ├── page.tsx                  # Landing page (hero, features, CTA)
│   │   ├── globals.css               # Tailwind v4 imports + custom tokens
│   │   ├── docs/
│   │   │   └── [[...slug]]/
│   │   │       └── page.tsx          # Fumadocs catch-all docs route
│   │   ├── blog/
│   │   │   ├── page.tsx              # Blog index
│   │   │   └── [slug]/
│   │   │       └── page.tsx          # Individual blog post
│   │   ├── playground/
│   │   │   └── page.tsx              # Interactive policy builder
│   │   ├── community/
│   │   │   └── page.tsx              # Community hub page
│   │   ├── schema/
│   │   │   └── page.tsx              # Interactive schema browser
│   │   └── api/
│   │       ├── search/
│   │       │   └── route.ts          # Fumadocs search API
│   │       ├── validate/
│   │       │   └── route.ts          # Policy validation API endpoint
│   │       └── og/
│   │           └── route.tsx         # Dynamic OG image generation (Vercel OG)
│   ├── components/
│   │   ├── ui/                       # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── tooltip.tsx
│   │   │   ├── accordion.tsx
│   │   │   └── ... (as needed)
│   │   ├── landing/
│   │   │   ├── hero.tsx              # Hero section with animated terminal demo
│   │   │   ├── features.tsx          # 6-feature grid
│   │   │   ├── ecosystem-diagram.tsx # Interactive protocol stack diagram
│   │   │   ├── code-preview.tsx      # Side-by-side code examples (Node + Python)
│   │   │   ├── comparison-table.tsx  # APoP vs robots.txt vs nothing
│   │   │   ├── adopters.tsx          # Logo grid of adopters (placeholder for now)
│   │   │   ├── cta.tsx               # Call to action — get started
│   │   │   └── stats.tsx             # GitHub stars, npm downloads, adopters count
│   │   ├── playground/
│   │   │   ├── policy-editor.tsx     # Monaco editor with JSON schema validation
│   │   │   ├── policy-preview.tsx    # Live preview of the policy as a readable table
│   │   │   ├── template-selector.tsx # Dropdown to load example templates
│   │   │   ├── validation-panel.tsx  # Real-time schema validation errors
│   │   │   └── export-panel.tsx      # Copy / download the generated JSON
│   │   ├── blog/
│   │   │   ├── post-card.tsx         # Blog post card for listing
│   │   │   ├── post-header.tsx       # Blog post header with metadata
│   │   │   └── share-buttons.tsx     # Social sharing (X, LinkedIn, HN)
│   │   ├── schema-viewer.tsx         # Renders JSON Schema as interactive tree
│   │   ├── copy-button.tsx           # Reusable copy-to-clipboard
│   │   ├── theme-toggle.tsx          # Dark/light mode toggle
│   │   ├── header.tsx                # Site header with nav
│   │   ├── footer.tsx                # Site footer with links
│   │   └── mdx-components.tsx        # Custom MDX components (callouts, tabs, etc.)
│   ├── lib/
│   │   ├── source.ts                 # Fumadocs content source configuration
│   │   ├── metadata.ts               # SEO metadata helpers
│   │   ├── schema.ts                 # JSON Schema loader and parser
│   │   └── validate.ts               # Policy validation logic (uses Ajv)
│   └── styles/
│       └── fumadocs.css              # Fumadocs theme overrides
├── scripts/
│   ├── sync-spec.ts                  # Pull latest spec docs from spec repo
│   ├── generate-schema-docs.ts       # Auto-generate schema reference from JSON Schema
│   └── check-links.ts               # Validate all internal/external links
├── next.config.ts                    # Next.js configuration (MDX, redirects)
├── tailwind.config.ts                # Tailwind v4 config (if needed beyond CSS)
├── tsconfig.json
├── package.json
├── pnpm-lock.yaml
├── .env.example                      # NEXT_PUBLIC_SITE_URL, analytics keys
├── .gitignore
├── LICENSE                           # Apache 2.0
├── README.md
└── vercel.json                       # Vercel config (redirects, headers, rewrites)
```

---

## 4. Pages & Sections

### 4.1 Landing Page (`/`)

The landing page must convey: **what APoP is, why it matters, and how to start — in under 30 seconds.**

#### Sections (top to bottom):

1. **Hero**
   - Headline: "The Authorization Layer for the Agentic Web"
   - Subheadline: "An open standard that lets websites declare how AI agents can access and interact with their content."
   - Two CTAs: `Read the Docs` | `Try the Playground`
   - Animated terminal showing `curl` fetching an `agent-policy.json` and getting a response with APoP headers
   - GitHub star count badge, npm/PyPI download counts

2. **Problem Statement**
   - "AI agents are browsing, summarizing, and transacting on the web — but websites have no standardized way to express consent or control."
   - Visual: Before (chaos) vs After (APoP order)

3. **How It Works** (3 steps)
   - Step 1: Create `agent-policy.json` (with minimal code snippet)
   - Step 2: Place it at `/.well-known/agent-policy.json`
   - Step 3: Agents discover and respect your policy
   - Each step with an icon + 2-line description

4. **Key Features** (6-card grid)
   - 🔒 Fine-Grained Access Control — allow/deny by path, action, and agent
   - 🤖 Agent Identity & Verification — PKIX, DID, Verifiable Credentials
   - ⚡ Rate Limiting — per-agent, per-window request limits
   - 🔗 Cross-Protocol Interop — links to MCP, A2A, WebMCP, UCP, APAAI
   - 🌐 4 Discovery Methods — well-known URI, HTTP header, HTML meta, DNS TXT
   - 📋 9 Ready-Made Templates — news, e-commerce, SaaS, healthcare, and more

5. **Ecosystem Position**
   - Interactive diagram showing the Agentic Web Stack (APoP at the authorization layer)
   - Protocol comparison table (MCP, A2A, WebMCP, UCP, AP2, APAAI) — what each does, what gap APoP fills

6. **Code Preview**
   - Tabbed code block: Node.js | Python | curl
   - Show Express middleware setup, FastAPI middleware, and raw curl command

7. **Adopters** (initially placeholder)
   - "Organizations using APoP" with logo grid
   - CTA: "Add your organization"

8. **Call to Action**
   - "Get started in 5 minutes" → links to Quick Start docs
   - "Join the community" → Discord + GitHub Discussions
   - "Contribute" → GitHub repo

9. **Footer**
   - Navigation columns: Docs, Community, SDKs, Legal
   - "Made by Superdom AI" with link
   - Apache 2.0 license
   - Social links (GitHub, X, Discord, LinkedIn)
   - "APoP is an open standard — contribute on GitHub"

### 4.2 Documentation (`/docs`)

Powered by Fumadocs with full sidebar navigation, breadcrumbs, TOC, prev/next, and search.

#### Documentation Tree:

```
📚 Documentation
├── 🏠 Getting Started
│   ├── What is APoP?
│   ├── Why APoP? (The Problem)
│   ├── Quick Start (5-minute guide)
│   └── Ecosystem & Interoperability
├── 📜 Specification
│   ├── Overview
│   ├── Schema Reference (auto-generated from JSON Schema)
│   ├── Discovery Methods
│   ├── Agent Identification & Verification
│   ├── HTTP Extensions (Status Codes & Headers)
│   └── Changelog (v0.1 → v1.0)
├── 📦 SDKs
│   ├── Overview
│   ├── Node.js (@apop/node)
│   │   ├── Installation
│   │   ├── Parser
│   │   ├── Enforcer
│   │   ├── Discovery
│   │   ├── Express Middleware
│   │   ├── Next.js Middleware
│   │   └── Vercel Edge Middleware
│   └── Python (apop)
│       ├── Installation
│       ├── Parser
│       ├── Enforcer
│       ├── Discovery
│       ├── FastAPI Middleware
│       ├── Flask Middleware
│       └── Django Middleware
├── 🛠 Guides
│   ├── Deploy on Vercel
│   ├── Deploy on Cloudflare
│   ├── Deploy with Docker
│   ├── WordPress Integration
│   ├── Next.js Integration
│   ├── FastAPI Integration
│   └── Policy Templates
├── 📋 Examples
│   ├── News Publisher
│   ├── E-Commerce Store
│   ├── SaaS API Platform
│   ├── Healthcare (HIPAA)
│   ├── Open Data Portal
│   ├── Restrictive (High Security)
│   ├── Personal Blog
│   ├── WordPress Default
│   └── Multi-Protocol Interop
└── 🤝 Contributing
    ├── How to Contribute
    ├── Proposing Spec Changes
    ├── SDK Development
    └── Running Conformance Tests
```

#### Docs Features:

- **"Edit this page on GitHub"** link on every page → opens PR to spec repo or website repo
- **Version selector** — v1.0 (current), with future version support
- **Copy code buttons** on all code blocks
- **Syntax-highlighted** JSON, TypeScript, Python, bash
- **Callout components** — Note, Warning, Tip, Important
- **Tabbed code blocks** — show same concept in Node.js / Python / curl
- **Interactive schema browser** — expand/collapse JSON Schema fields
- **Prev/Next navigation** at bottom of every page
- **Table of Contents** sidebar on the right
- **Breadcrumbs** at the top
- **Full-text search** via Fumadocs built-in or Algolia DocSearch

### 4.3 Blog (`/blog`)

MDX-powered blog for thought leadership and announcements.

#### Launch Posts (from your blog plan):

1. "robots.txt Is Dead. The Agentic Web Needs a New Standard."
2. "Introducing Agent Policy Protocol: Consent & Governance for AI Agents"
3. "Protect Your Website from AI Agents in 5 Minutes"
4. "Building Agent-Aware Apps with APoP: A Developer's Guide"
5. "An Open Letter to Google, Anthropic, and Every AI Agent Builder"

#### Blog Features:

- Post listing with cards (title, date, author, excerpt, tags, reading time)
- Individual post pages with MDX rendering
- Author profiles (name, avatar, bio, social links)
- Tags/categories filtering
- RSS feed at `/blog/feed.xml`
- Social sharing buttons (X, LinkedIn, Hacker News)
- Open Graph images auto-generated per post (Vercel OG)
- Related posts at bottom
- Reading time estimate
- "Subscribe for updates" email capture (optional — integrate with Resend or Buttondown)

### 4.4 Playground (`/playground`)

Interactive policy builder — the #1 adoption driver.

#### Features:

- **Monaco Editor** (left panel) — full VS Code editing experience for `agent-policy.json`
- **JSON Schema validation** — real-time error highlighting as you type
- **Template Selector** (top bar) — dropdown to load any of the 9 example templates
- **Live Preview** (right panel) — renders the policy as a human-readable table:
  - Default policy rules
  - Path-specific rules
  - Allowed/disallowed actions
  - Rate limits
  - Verification requirements
- **Validation Panel** (bottom) — shows schema validation errors/warnings
- **Export Options**:
  - Copy to clipboard
  - Download as `.json` file
  - Generate `curl` test command
  - Generate middleware setup code (Node.js / Python)
- **Share** — Generate a shareable URL with the policy encoded (base64 in query param, or short URL)
- **"Deploy This Policy"** guide — step-by-step for Vercel, Cloudflare, Nginx, Apache

### 4.5 Community (`/community`)

Central hub for community engagement.

#### Sections:

- **GitHub** — Link to `agent-policy-protocol/spec` with star count
- **Discord** — Invite link + brief description of channels
- **GitHub Discussions** — Link to discussions tab for RFCs, Q&A, ideas
- **Contributing Guide** — Quick summary + link to full docs
- **Code of Conduct** — Link to Contributor Covenant
- **Adopters** — List of organizations using APoP (submit via PR or form)
- **Roadmap** — Public roadmap highlights (link to STRATEGIC_ROADMAP.md)
- **Events** — Upcoming talks, conferences, meetups (initially empty)

### 4.6 Schema Reference (`/schema`)

Auto-generated interactive documentation from the JSON Schema.

#### Features:

- Tree view of all schema fields
- Expand/collapse nested objects
- Type annotations, required markers, default values
- Enum value lists with descriptions
- Pattern/format constraints
- Examples for each field
- Link to raw schema file
- "Open in Playground" button for any example

---

## 5. Design System

### 5.1 Brand Identity

| Element                | Value                                                 |
| ---------------------- | ----------------------------------------------------- |
| **Primary Color**      | Deep blue (#1e40af) — trust, authority, standards     |
| **Accent Color**       | Emerald green (#059669) — growth, permission, "allow" |
| **Warning Color**      | Amber (#d97706) — caution, rate limiting              |
| **Error Color**        | Red (#dc2626) — deny, block                           |
| **Background (Light)** | White (#ffffff) / Gray-50 (#f9fafb)                   |
| **Background (Dark)**  | Gray-950 (#030712) / Gray-900 (#111827)               |
| **Font (Headings)**    | Inter (variable)                                      |
| **Font (Body)**        | Inter (variable)                                      |
| **Font (Code)**        | JetBrains Mono or Geist Mono                          |
| **Border Radius**      | 8px (rounded-lg)                                      |
| **Spacing Scale**      | Tailwind v4 default                                   |

### 5.2 Visual Language

- Clean, professional, standards-body aesthetic (not startup flashy)
- Generous whitespace
- Subtle gradients on hero and CTA sections
- Muted color palette with strategic pops of emerald (allow) and red (deny)
- Dark mode: true dark (#030712) with reduced contrast for readability
- Code blocks: One Dark Pro theme (light) / GitHub Dark theme (dark)
- Diagrams: hand-drawn style (Excalidraw aesthetic) for warmth, or clean SVG for precision

### 5.3 Responsive Design

- Mobile-first with breakpoints at sm(640px), md(768px), lg(1024px), xl(1280px)
- Docs sidebar collapses to hamburger on mobile
- Playground stacks editor/preview vertically on mobile
- Landing page hero adjusts for mobile (no terminal animation on small screens)

---

## 6. SEO & Metadata Strategy

### 6.1 Meta Tags (per page)

```tsx
// Example: src/lib/metadata.ts
export const siteConfig = {
  name: "Agent Policy Protocol (APoP)",
  description:
    "The open standard for AI agent authorization on the web. Define how agents can access your content with a simple JSON file.",
  url: "https://agentpolicy.org",
  ogImage: "https://agentpolicy.org/og-image.png",
  links: {
    github: "https://github.com/agent-policy-protocol/spec",
    discord: "https://discord.gg/apop",
  },
};
```

### 6.2 Structured Data (JSON-LD)

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Agent Policy Protocol (APoP)",
  "description": "Open standard for AI agent authorization on the web",
  "url": "https://agentpolicy.org",
  "applicationCategory": "WebApplication",
  "operatingSystem": "Any",
  "license": "https://opensource.org/licenses/Apache-2.0",
  "author": {
    "@type": "Organization",
    "name": "Superdom AI Research Labs",
    "url": "https://superdom.ai"
  },
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  }
}
```

### 6.3 Dynamic OG Images

Use Vercel OG (`@vercel/og`) to generate per-page social cards:

- Docs pages: Title + section breadcrumb + APoP branding
- Blog posts: Title + author + date + APoP branding
- Playground: "Build your AI agent policy" + APoP branding

### 6.4 Sitemap & Robots

- Auto-generated sitemap via `next-sitemap`
- `robots.txt` allowing all crawlers
- Plus `/.well-known/agent-policy.json` — dogfooding APoP itself

---

## 7. Dogfooding: APoP on agentpolicy.org

The site MUST serve its own `agent-policy.json` at `/.well-known/agent-policy.json`:

```json
{
  "$schema": "https://agentpolicy.org/schema/v1/agent-policy.schema.json",
  "version": "1.0",
  "policyUrl": "https://agentpolicy.org/.well-known/agent-policy.json",
  "defaultPolicy": {
    "allow": true,
    "actions": ["read", "index", "summarize", "render"],
    "rateLimit": { "requests": 500, "window": "hour" },
    "requireVerification": false
  },
  "pathPolicies": [
    {
      "path": "/api/**",
      "allow": true,
      "actions": ["api_call"],
      "rateLimit": { "requests": 60, "window": "minute" },
      "requireVerification": false
    }
  ],
  "contact": {
    "email": "hello@agentpolicy.org",
    "policyUrl": "https://agentpolicy.org/docs"
  },
  "metadata": {
    "description": "The official APoP website — open for all agents to read, index, and summarize.",
    "owner": "Agent Policy Protocol Community",
    "lastModified": "2026-02-14T00:00:00Z",
    "license": "Apache-2.0"
  },
  "interop": {
    "webmcpEnabled": false,
    "mcpServerUrl": null,
    "a2aAgentCard": null
  }
}
```

This demonstrates the protocol in action and gives every visitor a live, inspectable example.

---

## 8. Contributor Workflow

### 8.1 How Open-Source Contributors Update the Website

1. **Fork** `agent-policy-protocol/agentpolicy.org`
2. **Edit MDX files** in `/content/docs/` or `/content/blog/`
3. **Push and open a PR**
4. **Vercel auto-deploys a preview** — PR gets a unique URL like `agentpolicy-org-git-fix-typo-xyz.vercel.app`
5. **Maintainers review** the preview + code diff
6. **Merge to `main`** → Vercel auto-deploys to production

### 8.2 "Edit This Page" Links

Every docs page includes a link:

```
📝 Edit this page on GitHub →
https://github.com/agent-policy-protocol/agentpolicy.org/edit/main/content/docs/{path}.mdx
```

### 8.3 Spec Sync Workflow

The spec lives in `agent-policy-protocol/spec`. Spec docs need to appear on the website.

**Option A: GitHub Action Auto-Sync (Recommended)**

A GitHub Action in the website repo runs on a schedule (daily) or on-demand:

1. Clones `agent-policy-protocol/spec`
2. Copies `spec/*.md` → `content/docs/specification/` (converts to MDX)
3. Copies `spec/schema/*.json` → `public/schema/v1/`
4. Copies `examples/*.json` → used by playground templates
5. Opens a PR if changes detected

```yaml
# .github/workflows/sync-spec.yml
name: Sync Spec Docs
on:
  schedule:
    - cron: "0 6 * * *" # Daily at 6 AM UTC
  workflow_dispatch: # Manual trigger

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Clone spec repo
        run: git clone https://github.com/agent-policy-protocol/spec.git /tmp/spec
      - name: Sync spec docs
        run: node scripts/sync-spec.ts
      - name: Create PR if changes
        uses: peter-evans/create-pull-request@v7
        with:
          title: "docs: sync spec docs from spec repo"
          branch: auto-sync-spec
          commit-message: "docs: sync spec docs"
```

**Option B: Git Submodule**

Add the spec repo as a git submodule. Simpler but requires contributors to understand submodules.

### 8.4 Branch Protection

- `main` branch is protected — requires PR review
- CI must pass (lint, type-check, build, link-check) before merge
- At least 1 maintainer approval required

### 8.5 CODEOWNERS

```
# .github/CODEOWNERS
* @arunvijayarengan
content/docs/specification/ @arunvijayarengan
content/blog/ @arunvijayarengan
src/ @arunvijayarengan
```

---

## 9. Vercel Configuration

### 9.1 `vercel.json`

```json
{
  "framework": "nextjs",
  "headers": [
    {
      "source": "/.well-known/agent-policy.json",
      "headers": [
        { "key": "Content-Type", "value": "application/json" },
        { "key": "Cache-Control", "value": "public, max-age=3600" },
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Agent-Policy-Version", "value": "1.0" }
      ]
    },
    {
      "source": "/schema/(.*)",
      "headers": [
        { "key": "Content-Type", "value": "application/schema+json" },
        { "key": "Cache-Control", "value": "public, max-age=86400" },
        { "key": "Access-Control-Allow-Origin", "value": "*" }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Agent-Policy",
          "value": "https://agentpolicy.org/.well-known/agent-policy.json"
        }
      ]
    }
  ],
  "redirects": [
    {
      "source": "/github",
      "destination": "https://github.com/agent-policy-protocol/spec",
      "permanent": false
    },
    {
      "source": "/discord",
      "destination": "https://discord.gg/apop",
      "permanent": false
    },
    {
      "source": "/spec",
      "destination": "/docs/specification/overview",
      "permanent": false
    },
    {
      "source": "/schema/v1/agent-policy.schema.json",
      "destination": "/schema/v1/agent-policy.schema.json",
      "permanent": false
    }
  ]
}
```

### 9.2 Environment Variables

```env
# .env.example
NEXT_PUBLIC_SITE_URL=https://agentpolicy.org
NEXT_PUBLIC_GITHUB_REPO=agent-policy-protocol/spec
NEXT_PUBLIC_DISCORD_INVITE=https://discord.gg/apop

# Analytics (optional)
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=agentpolicy.org

# Algolia DocSearch (apply at https://docsearch.algolia.com)
NEXT_PUBLIC_ALGOLIA_APP_ID=
NEXT_PUBLIC_ALGOLIA_SEARCH_KEY=
NEXT_PUBLIC_ALGOLIA_INDEX_NAME=
```

### 9.3 Custom Domain Setup

1. Add `agentpolicy.org` as custom domain in Vercel project settings
2. Configure DNS at registrar:
   - `A` record → `76.76.21.21` (Vercel)
   - `CNAME` `www` → `cname.vercel-dns.com`
3. Vercel auto-provisions SSL certificate
4. Enable "Redirect www to apex" in Vercel settings

---

## 10. CI/CD Pipeline

### 10.1 `.github/workflows/ci.yml`

```yaml
name: CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint-and-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 10
      - uses: actions/setup-node@v4
        with:
          node-version: 22 LTS
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm type-check
      - run: pnpm build
      - run: pnpm check-links # Validate no broken links in MDX

  preview:
    if: github.event_name == 'pull_request'
    needs: lint-and-build
    runs-on: ubuntu-latest
    steps:
      - name: Comment preview URL
        uses: actions/github-script@v7
        with:
          script: |
            // Vercel auto-creates preview — just add helpful comment
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '🔍 Preview deployment will be available on Vercel shortly.'
            })
```

### 10.2 `package.json` Scripts

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "eslint . --ext .ts,.tsx,.mdx",
    "type-check": "tsc --noEmit",
    "check-links": "node scripts/check-links.ts",
    "sync-spec": "node scripts/sync-spec.ts",
    "generate-schema-docs": "node scripts/generate-schema-docs.ts"
  }
}
```

---

## 11. Performance Targets

| Metric                    | Target                         |
| ------------------------- | ------------------------------ |
| Lighthouse Performance    | 95+                            |
| Lighthouse Accessibility  | 100                            |
| Lighthouse Best Practices | 100                            |
| Lighthouse SEO            | 100                            |
| First Contentful Paint    | < 1.0s                         |
| Largest Contentful Paint  | < 2.0s                         |
| Cumulative Layout Shift   | < 0.05                         |
| Time to Interactive       | < 2.0s                         |
| Bundle Size (JS)          | < 150KB gzipped (landing page) |

### Performance Strategies:

- React Server Components for all non-interactive pages
- Dynamic imports for Monaco Editor (playground only)
- Image optimization via `next/image`
- Font subsetting via `next/font`
- Static generation for all docs and blog pages
- Edge runtime for API routes (validate, search)
- Preload critical fonts and above-the-fold resources

---

## 12. Implementation Phases (Standalone Prompts)

Each phase below is a **self-contained prompt** you can paste into a new coding agent chat (Claude Code, Cursor, GH Copilot, etc.). After completing each phase, verify the checklist, then commit before moving to the next phase.

---

### Phase 1: Foundation (Week 1) — COMMIT AFTER THIS

**Git commit message**: `feat: phase 1 — website foundation with landing page and docs shell`

#### Prompt to paste in new chat:

````
You are building the official website for the Agent Policy Protocol (APoP) — an open standard for AI agent authorization on the web. The project repo is at https://github.com/agent-policy-protocol/spec.

Build the website inside a `./website` subfolder of the current project.

## Tech Stack (USE LATEST VERSIONS — do not use older versions)
- Next.js 16 (App Router) — `next@latest`
- React 19 — `react@latest react-dom@latest`
- TypeScript 5.8+ — `typescript@latest`
- Fumadocs (latest version compatible with Next.js 16) — `fumadocs-core@latest fumadocs-ui@latest fumadocs-mdx@latest`
- Tailwind CSS v4 — `tailwindcss@latest @tailwindcss/postcss@latest`
- shadcn/ui — initialize with `npx shadcn@latest init`
- pnpm as package manager
- Node.js 22 LTS

## What to Build

### 1. Project Initialization
- Run `pnpm create fumadocs-app website` or manually initialize Next.js 16 + Fumadocs
- If Fumadocs scaffolding doesn't support Next.js 16 yet, initialize Next.js 16 first (`pnpm create next-app@latest website`) then add Fumadocs manually
- Configure Tailwind CSS v4 (CSS-first config, no tailwind.config.js — use `@import "tailwindcss"` in CSS)
- Initialize shadcn/ui (`npx shadcn@latest init`)
- Set up TypeScript strict mode
- Create `.env.example` with:
  ```
  NEXT_PUBLIC_SITE_URL=https://agentpolicy.org
  NEXT_PUBLIC_GITHUB_REPO=agent-policy-protocol/spec
  NEXT_PUBLIC_DISCORD_INVITE=https://discord.gg/apop
  ```

### 2. Root Layout (`src/app/layout.tsx`)
- Use `next/font` with Inter (variable) for body and Geist Mono for code
- Include site-wide metadata:
  - title: "Agent Policy Protocol (APoP) — The Authorization Layer for the Agentic Web"
  - description: "An open standard that lets websites declare how AI agents can access and interact with their content."
  - Open Graph image: `/og-image.png`
  - URL: `https://agentpolicy.org`
- Dark/light mode via `next-themes` (ThemeProvider wrapping children)
- JSON-LD structured data:
  ```json
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Agent Policy Protocol (APoP)",
    "description": "Open standard for AI agent authorization on the web",
    "url": "https://agentpolicy.org",
    "applicationCategory": "WebApplication",
    "license": "https://opensource.org/licenses/Apache-2.0",
    "author": { "@type": "Organization", "name": "Superdom AI Research Labs", "url": "https://superdom.ai" }
  }
  ```

### 3. Header Component (`src/components/header.tsx`)
- Logo (text "APoP" or placeholder SVG) + site name
- Navigation links: Docs, Blog, Playground, Community, GitHub
- Theme toggle (dark/light)
- GitHub star button linking to https://github.com/agent-policy-protocol/spec
- Mobile hamburger menu
- Sticky on scroll

### 4. Footer Component (`src/components/footer.tsx`)
- 4 columns: Docs, Community, SDKs, Legal
- Docs: Getting Started, Specification, Examples, Guides
- Community: GitHub, Discord, Contributing, Code of Conduct
- SDKs: Node.js (@apop/node), Python (apop)
- Legal: License (Apache 2.0), Privacy Policy
- Bottom row: "APoP is an open standard — contribute on GitHub" + "Made by Superdom AI"
- Social links: GitHub, X/Twitter, Discord, LinkedIn

### 5. Landing Page (`src/app/page.tsx`)
Build these sections top to bottom:

**Hero Section:**
- Headline: "The Authorization Layer for the Agentic Web"
- Subheadline: "An open standard that lets websites declare how AI agents can access and interact with their content — with JSON Schema, verified identity, rate limits, and cross-protocol interop."
- Two CTA buttons: "Read the Docs" (→ /docs) | "Try the Playground" (→ /playground)
- Below CTAs: "npm install @apop/node" with copy button, and "pip install apop" with copy button
- Badge row: "Apache 2.0 Licensed" | "APoP v1.0" | "JSON Schema Draft 2020-12"

**Problem Statement Section:**
- Heading: "The Agentic Web Needs Rules"
- Body: "AI agents are browsing, summarizing, and transacting on the web — but websites have no standardized way to express consent or control. APoP brings robots.txt-level simplicity to the age of intelligent agents."

**How It Works (3 steps):**
- Step 1: "Create" — Create an agent-policy.json defining your rules (show minimal JSON snippet)
- Step 2: "Deploy" — Place it at /.well-known/agent-policy.json on your site
- Step 3: "Enforce" — Agents discover and respect your policy automatically
- Use icons from Lucide React

**Key Features (6-card grid using shadcn Card):**
- Fine-Grained Access Control — allow/deny by path, action, and agent identity
- Agent Identity & Verification — PKIX, DID, Verifiable Credentials, partner tokens
- Rate Limiting — per-agent, per-window request limits with custom HTTP headers
- Cross-Protocol Interop — links to MCP, A2A, WebMCP, UCP, APAAI
- 4 Discovery Methods — well-known URI, HTTP header, HTML meta, DNS TXT
- 9 Ready-Made Templates — news, e-commerce, SaaS, healthcare, and more

**Ecosystem Position:**
- Heading: "The Missing Layer in the Agentic Stack"
- Protocol comparison table (HTML table, not image):
  | Protocol | Purpose | Gap APoP Fills |
  |----------|---------|----------------|
  | WebMCP (Google/Microsoft) | Browser-native tool contracts | No consent management |
  | MCP (Anthropic) | Server-side tool/data integration | No website-level policies |
  | A2A | Agent-to-agent communication | No resource owner authorization |
  | AP2 | Agent payment flows | No access control before payment |
  | APAAI | Post-hoc action auditing | Reactive, not preventive |
  | UCP | Universal commerce | No access control |

**Code Preview:**
- Tabbed code block (use shadcn Tabs): `agent-policy.json` | Node.js | Python | curl
- agent-policy.json tab: Show a minimal but realistic policy
- Node.js tab: Express middleware setup (5-6 lines)
- Python tab: FastAPI middleware setup (5-6 lines)
- curl tab: Testing command with Agent-Name and Agent-Intent headers
- Use Shiki/Fumadocs code highlighting

**Call to Action:**
- "Get started in 5 minutes" → /docs/introduction/quick-start
- "Join the community" → /community
- "Star on GitHub" → GitHub repo

### 6. Docs Shell (Fumadocs)
- Set up Fumadocs with content source pointing to `content/docs/`
- Create `src/app/docs/[[...slug]]/page.tsx` catch-all route
- Create `src/lib/source.ts` with Fumadocs content source config
- Create sidebar navigation via `content/docs/meta.json`:
  ```json
  {
    "title": "Documentation",
    "pages": [
      "---Getting Started---",
      "introduction/what-is-apop",
      "introduction/why-apop",
      "introduction/quick-start",
      "introduction/ecosystem",
      "---Specification---",
      "specification/overview",
      "specification/discovery",
      "specification/agent-identification",
      "specification/http-extensions",
      "---SDKs---",
      "sdks/overview",
      "---Guides---",
      "guides/...",
      "---Examples---",
      "examples/...",
      "---Contributing---",
      "contributing/..."
    ]
  }
  ```
  (Adjust the meta.json format to match whatever Fumadocs version supports)

### 7. Initial Docs Content (MDX)
Create these MDX files with real content derived from the spec repo files. The spec content is available at these paths relative to the project root (one level up from `./website`):
- `../spec/discovery.md` → `content/docs/specification/discovery.mdx`
- `../spec/agent-identification.md` → `content/docs/specification/agent-identification.mdx`
- `../spec/http-extensions.md` → `content/docs/specification/http-extensions.mdx`
- `../spec/README.md` → `content/docs/specification/overview.mdx`
- `../README.md` → extract content for `content/docs/introduction/what-is-apop.mdx`

Also create placeholder MDX files (with title and "Coming soon" body) for:
- `content/docs/introduction/why-apop.mdx`
- `content/docs/introduction/quick-start.mdx` (add the Quick Start from the README)
- `content/docs/introduction/ecosystem.mdx`
- `content/docs/index.mdx` (docs landing page)

### 8. Static Files (`public/`)
- `public/.well-known/agent-policy.json` — the site's own APoP policy:
  ```json
  {
    "$schema": "https://agentpolicy.org/schema/v1/agent-policy.schema.json",
    "version": "1.0",
    "policyUrl": "https://agentpolicy.org/.well-known/agent-policy.json",
    "defaultPolicy": {
      "allow": true,
      "actions": ["read", "index", "summarize", "render"],
      "rateLimit": { "requests": 500, "window": "hour" },
      "requireVerification": false
    },
    "pathPolicies": [
      {
        "path": "/api/**",
        "allow": true,
        "actions": ["api_call"],
        "rateLimit": { "requests": 60, "window": "minute" }
      }
    ],
    "contact": { "email": "hello@agentpolicy.org", "policyUrl": "https://agentpolicy.org/docs" },
    "metadata": {
      "description": "The official APoP website — open for all agents to read, index, and summarize.",
      "owner": "Agent Policy Protocol Community",
      "lastModified": "2026-02-14T00:00:00Z",
      "license": "Apache-2.0"
    }
  }
  ```
- Copy `../spec/schema/agent-policy.schema.json` → `public/schema/v1/agent-policy.schema.json`

### 9. Vercel Config (`vercel.json`)
```json
{
  "framework": "nextjs",
  "headers": [
    {
      "source": "/.well-known/agent-policy.json",
      "headers": [
        { "key": "Content-Type", "value": "application/json" },
        { "key": "Cache-Control", "value": "public, max-age=3600" },
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Agent-Policy-Version", "value": "1.0" }
      ]
    },
    {
      "source": "/schema/(.*)",
      "headers": [
        { "key": "Content-Type", "value": "application/schema+json" },
        { "key": "Cache-Control", "value": "public, max-age=86400" },
        { "key": "Access-Control-Allow-Origin", "value": "*" }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Agent-Policy", "value": "https://agentpolicy.org/.well-known/agent-policy.json" }
      ]
    }
  ],
  "redirects": [
    { "source": "/github", "destination": "https://github.com/agent-policy-protocol/spec", "permanent": false },
    { "source": "/discord", "destination": "https://discord.gg/apop", "permanent": false },
    { "source": "/spec", "destination": "/docs/specification/overview", "permanent": false }
  ]
}
```

### 10. SEO Basics
- `robots.txt` via Next.js metadata API (allow all)
- `sitemap.xml` via `next-sitemap` or Next.js built-in sitemap generation
- Proper `<title>` and `<meta>` on every page

### 11. Responsive Design
- All components mobile-first
- Docs sidebar collapsible on mobile
- Landing page hero stack vertically on small screens
- Test at 375px, 768px, 1024px, 1440px

## Verification Checklist
After building, verify:
- [ ] `pnpm dev` starts without errors
- [ ] Landing page renders with all sections
- [ ] `/docs` renders with sidebar navigation
- [ ] At least 4 spec docs render as MDX pages
- [ ] Dark/light mode toggle works
- [ ] `/.well-known/agent-policy.json` is accessible
- [ ] `/schema/v1/agent-policy.schema.json` is accessible
- [ ] Mobile responsive (check at 375px width)
- [ ] `pnpm build` completes without errors
- [ ] No TypeScript errors (`pnpm type-check`)

## Do NOT build in this phase:
- Blog engine
- Playground/Monaco Editor
- Community page
- Search
- Analytics
- Dynamic OG images
- Algolia DocSearch
- GitHub Actions
````

#### After completion, commit:

```bash
cd website
git add -A
git commit -m "feat: phase 1 — website foundation with landing page and docs shell"
```

---

### Phase 2: Docs & Content (Week 2) — COMMIT AFTER THIS

**Git commit message**: `feat: phase 2 — complete documentation, SDK reference, examples, and search`

#### Prompt to paste in new chat:

```
I have an existing Next.js 16 + Fumadocs website in `./website` for the Agent Policy Protocol (APoP). Phase 1 is complete: landing page, docs shell with sidebar, basic spec docs, dark/light mode, responsive design.

Now build Phase 2: complete documentation content and docs features.

## What to Build

### 1. SDK Documentation — Node.js (@apop/node)
Create these MDX docs under `content/docs/sdks/node/`. Use the content from `../sdk/node/README.md` and the source files in `../sdk/node/src/` as reference:

- `installation.mdx` — npm install command, requirements (Node 18+), ESM setup
- `parser.mdx` — `parsePolicy()`, `parsePolicyFile()` API reference with examples
- `enforcer.mdx` — `createEnforcer()`, enforcement logic, status codes returned
- `discovery.mdx` — `discoverPolicy()`, 4 discovery methods, caching
- `middleware-express.mdx` — `createExpressMiddleware()`, `createDiscoveryEndpoint()`, full example
- `middleware-nextjs.mdx` — Next.js middleware integration
- `middleware-vercel.mdx` — Vercel Edge middleware integration

Each page should have:
- Import statements
- API signature with TypeScript types
- Usage example with full code block
- Configuration options table
- Notes / gotchas

Create `content/docs/sdks/node/meta.json` for page ordering.

### 2. SDK Documentation — Python (apop)
Create these MDX docs under `content/docs/sdks/python/`. Use `../sdk/python/README.md` and source files in `../sdk/python/src/apop/`:

- `installation.mdx` — pip install, extras (`[fastapi]`, `[flask]`, `[django]`, `[all]`), Python 3.10+
- `parser.mdx` — `parse_policy()`, `parse_policy_file()` API
- `enforcer.mdx` — `create_enforcer()`, enforcement logic
- `discovery.mdx` — `discover_policy()`, discovery methods
- `middleware-fastapi.mdx` — FastAPI middleware setup
- `middleware-flask.mdx` — Flask middleware setup
- `middleware-django.mdx` — Django middleware setup

Create `content/docs/sdks/python/meta.json` for page ordering.

### 3. SDK Overview Page
Create `content/docs/sdks/overview.mdx` comparing Node.js and Python SDKs:
- Feature comparison table
- When to use which
- Links to both

### 4. Example Policies as Docs
Create MDX pages under `content/docs/examples/` for each example. Read the actual JSON from `../examples/*.json` and embed it in the docs with explanation:

- `news-publisher.mdx` — Explain the policy, when to use, key features
- `ecommerce.mdx`
- `saas-api.mdx`
- `healthcare.mdx`
- `open-data.mdx`
- `restrictive.mdx`
- `personal-blog.mdx`
- `wordpress.mdx`
- `multi-protocol.mdx`

Each page: description of the use case, the full JSON policy embedded, explanation of each section, "Try it in the Playground" link (placeholder for now).

Create `content/docs/examples/meta.json`.

### 5. Deployment Guides
Create under `content/docs/guides/`:

- `deploy-vercel.mdx` — Step-by-step: create next.js app, add middleware, deploy to Vercel, configure /.well-known/
- `deploy-cloudflare.mdx` — Cloudflare Workers/Pages, serve agent-policy.json, edge enforcement
- `deploy-docker.mdx` — Using the project's docker-compose.yml, Dockerfile reference
- `nextjs.mdx` — Next.js App Router integration guide (middleware.ts approach)
- `fastapi.mdx` — FastAPI integration guide
- `wordpress.mdx` — Manual: upload agent-policy.json to .well-known directory; future: plugin
- `policy-templates.mdx` — Overview of all 9 templates with comparison table, links to each

Create `content/docs/guides/meta.json`.

### 6. Contributing Guide
Create under `content/docs/contributing/`:

- `how-to-contribute.mdx` — Based on `../CONTRIBUTING.md` content
- `spec-changes.mdx` — How to propose specification changes (issue first, discuss, PR)
- `sdk-development.mdx` — How to contribute to Node.js and Python SDKs
- `conformance-tests.mdx` — How to run the test suite, add new tests

Create `content/docs/contributing/meta.json`.

### 7. Complete Introduction Docs
Fill in any placeholder pages from Phase 1:

- `content/docs/introduction/why-apop.mdx` — The problem: robots.txt limitations, legal conflicts (Amazon-Perplexity), 98% of agents lack governance. Why APoP is needed.
- `content/docs/introduction/quick-start.mdx` — 5-minute guide: create policy, add middleware, test with curl. Both Node.js and Python examples with tabbed code blocks.
- `content/docs/introduction/ecosystem.mdx` — Where APoP fits: the agentic web stack diagram (as text/table), relationship with MCP, A2A, WebMCP, UCP, AP2, APAAI. Use the `interop` field explanation.

### 8. Changelog
Create `content/docs/specification/changelog.mdx`:
- v0.1 (original draft) → v1.0 (current) changes
- New status codes (431/432 → 438/439)
- Well-known URI change
- 4 discovery methods added
- DID and VC verification added
- Interoperability fields added
- Schema formalized with JSON Schema draft 2020-12

### 9. Schema Reference Page
Create `content/docs/specification/schema-reference.mdx`:
- Read `public/schema/v1/agent-policy.schema.json`
- Document every field in a structured format:
  - Field name, type, required/optional, description, example value, constraints
- Organize by top-level sections: version, policyUrl, defaultPolicy, pathPolicies, verification, contact, metadata, interop
- Include the full schema JSON at the bottom for reference

### 10. Docs Features
- Add "Edit this page on GitHub" link to the docs layout. Link format: `https://github.com/agent-policy-protocol/agentpolicy.org/edit/main/website/content/docs/{path}.mdx`
- Enable Fumadocs built-in search
- Ensure all code blocks have copy buttons (Fumadocs default)
- Add tabbed code blocks where appropriate (use Fumadocs Tab component or custom):
  - Quick Start: Node.js | Python | curl tabs
  - SDK pages: show equivalent code in both languages where relevant

### 11. Update Sidebar Navigation
Update `content/docs/meta.json` to include all new pages in the correct order with section groupings.

## Verification Checklist
- [ ] All SDK doc pages render correctly with code examples
- [ ] All 9 example policy pages render with embedded JSON
- [ ] All deployment guides render
- [ ] Contributing guide pages render
- [ ] Schema reference page shows all fields
- [ ] Changelog page documents v0.1 → v1.0
- [ ] Sidebar navigation shows all sections properly
- [ ] "Edit this page" links point to correct GitHub URLs
- [ ] Search returns results for docs content
- [ ] Code blocks have copy buttons
- [ ] `pnpm build` completes without errors

## Do NOT build in this phase:
- Blog engine
- Playground
- Community page
- Dynamic OG images
- Analytics
- GitHub Actions / CI
```

#### After completion, commit:

```bash
cd website
git add -A
git commit -m "feat: phase 2 — complete documentation, SDK reference, examples, and search"
```

---

### Phase 3: Blog & Playground (Week 3) — COMMIT AFTER THIS

**Git commit message**: `feat: phase 3 — blog engine with 5 posts and interactive playground`

#### Prompt to paste in new chat:

````
I have an existing Next.js 16 + Fumadocs website in `./website` for the Agent Policy Protocol (APoP). Phase 1 (landing page, docs shell) and Phase 2 (full docs, SDK reference, examples, search) are complete.

Now build Phase 3: Blog engine and Interactive Playground.

## Part A: Blog Engine

### 1. Blog Content Source
- Set up Fumadocs (or manual MDX processing) for blog posts in `content/blog/`
- Each blog post is an MDX file with frontmatter:
  ```yaml
  ---
  title: "Post Title"
  description: "Short description"
  date: "2026-02-14"
  author:
    name: "Arun Vijayarengan"
    title: "Founder & CEO, Superdom AI"
    url: "https://www.linkedin.com/in/arunvijayarengan"
    avatar: "/authors/arun.jpg"
  tags: ["standard", "announcement"]
  image: "/blog/post-slug/cover.png"
  ---
  ```
- Create `src/lib/blog.ts` — utility to read blog posts, sort by date, compute reading time

### 2. Blog Listing Page (`src/app/blog/page.tsx`)
- Grid of blog post cards
- Each card: title, date, author name, excerpt (first 160 chars or description), reading time, tags
- Sorted by date (newest first)
- Use shadcn Card component
- Metadata: title "Blog — Agent Policy Protocol", description

### 3. Blog Post Page (`src/app/blog/[slug]/page.tsx`)
- Full MDX rendering with Fumadocs/MDX components
- Post header: title, date, author (name + avatar + title), reading time, tags
- Table of contents (right sidebar on desktop)
- Social sharing buttons at the bottom: X/Twitter, LinkedIn, Hacker News, Copy link
- "← Back to blog" link at top
- Dynamic metadata per post (title, description, OG image)

### 4. Blog Components
- `src/components/blog/post-card.tsx` — Card for listing
- `src/components/blog/post-header.tsx` — Header with metadata
- `src/components/blog/share-buttons.tsx` — Social sharing (X, LinkedIn, HN, Copy link)

### 5. RSS Feed
- Create `src/app/blog/feed.xml/route.ts` — generates RSS/Atom feed using `feed` npm package
- Include all blog posts with title, description, date, link, author
- Set content-type to `application/rss+xml`

### 6. Dynamic OG Images
- Create `src/app/api/og/route.tsx` using `@vercel/og` (or `next/og` if available in Next.js 16)
- Generate OG images dynamically:
  - For blog posts: title + author + date + APoP branding
  - For docs pages: title + section name + APoP branding
  - Default: "Agent Policy Protocol — The Authorization Layer for the Agentic Web"
- Use Inter font, dark blue background, white/green text
- 1200x630px

### 7. Write 5 Blog Posts
Create these MDX files in `content/blog/`:

**Post 1: `robots-txt-is-dead.mdx`**
- Title: "robots.txt Is Dead. The Agentic Web Needs a New Standard."
- ~800 words. Hook: Amazon-Perplexity conflict. Problem: robots.txt designed for crawlers, not intelligent agents that summarize, transact, and act autonomously. robots.txt can't express intent-based rules, rate limits, or identity verification. APoP as the evolution. End with link to APoP spec.

**Post 2: `introducing-apop.mdx`**
- Title: "Introducing Agent Policy Protocol: Consent & Governance for AI Agents"
- ~1200 words. What APoP is, how it works. Schema overview. Discovery mechanism. Comparison with MCP, A2A, WebMCP, UCP, AP2. Code examples (Node.js + Python). How to try it. Link to Quick Start docs.

**Post 3: `protect-your-website.mdx`**
- Title: "Protect Your Website from AI Agents in 5 Minutes"
- ~600 words. Practical, step-by-step tutorial. Create agent-policy.json (show JSON). Deploy it (3 methods: static file, Express middleware, Vercel). Test with curl. Show what happens when an agent violates the policy (430 response). Very beginner-friendly.

**Post 4: `building-agent-aware-apps.mdx`**
- Title: "Building Agent-Aware Apps with APoP: A Developer's Guide"
- ~1500 words. Technical deep-dive. Node.js SDK walkthrough (parser, enforcer, middleware). Python SDK walkthrough. Custom enforcement logic. Path matching patterns. Agent identity tiers. Tabbed code examples throughout.

**Post 5: `open-letter.mdx`**
- Title: "An Open Letter to Google, Anthropic, and Every AI Agent Builder"
- ~1000 words. Why Chrome/Arc/Firefox should support APoP headers. Why LangChain/CrewAI/AutoGPT should respect APoP. Why Google/Anthropic/OpenAI should adopt APoP in their agents. Specific asks for each. Bold, visionary, respectful tone. End with call to collaborate.

### 8. Update Header Navigation
- Add "Blog" link to the header nav

## Part B: Interactive Playground

### 1. Playground Page (`src/app/playground/page.tsx`)
- Full-width layout (no docs sidebar)
- Title: "Policy Playground" with subtitle "Build, validate, and preview your agent-policy.json"
- Split panel layout:
  - Left (60%): Code editor
  - Right (40%): Live preview + validation

### 2. Code Editor (`src/components/playground/policy-editor.tsx`)
- Use `@monaco-editor/react` (dynamic import to avoid SSR issues)
- Load with JSON language
- Configure JSON Schema validation using the APoP schema (load from `public/schema/v1/agent-policy.schema.json`)
- Default content: minimal valid policy
- Theme: match site theme (dark/light)
- Features: auto-complete, error squiggles, formatting

### 3. Template Selector (`src/components/playground/template-selector.tsx`)
- Dropdown/select at the top of the editor
- Options: "Blank", "Personal Blog", "News Publisher", "E-Commerce", "SaaS API", "Healthcare", "Open Data", "Restrictive", "WordPress", "Multi-Protocol"
- When selected, loads the corresponding JSON from `../examples/*.json` (bundle these as static assets or inline)
- Confirm before replacing current content if modified

### 4. Live Preview (`src/components/playground/policy-preview.tsx`)
- Renders the current JSON as a human-readable card/table view:
  - Version badge
  - Default Policy section: allowed actions (green badges), disallowed actions (red badges), rate limit, verification required
  - Path Policies: collapsible list, each showing path pattern, allowed/denied actions, overrides
  - Verification: method, registry
  - Contact info
  - Interop links
- Updates live as user types (debounce 300ms)
- Shows "Invalid JSON" or "Schema validation errors" if applicable

### 5. Validation Panel (`src/components/playground/validation-panel.tsx`)
- Below the preview
- Uses `ajv` + `ajv-formats` to validate against the APoP JSON Schema
- Shows: ✅ "Valid policy" or ❌ list of errors with JSON path and message
- Real-time validation on change (debounced)

### 6. Export Panel (`src/components/playground/export-panel.tsx`)
- Buttons:
  - "Copy JSON" — copy to clipboard with toast notification
  - "Download" — download as `agent-policy.json`
  - "Copy curl command" — generate a curl test command
  - "Share" — encode policy as base64 in URL query param, copy shareable link
- Place at the bottom of the right panel or as a toolbar

### 7. Share via URL
- When user clicks "Share", encode the policy JSON as base64 in `?policy=<base64>`
- On page load, check for `policy` query param and pre-populate the editor
- Keep URL under 2000 chars (warn if policy is too large)

### 8. Responsive Layout
- On mobile (<768px): stack editor above preview vertically
- Editor: minimum height 400px
- Preview: scrollable below editor

## Verification Checklist
- [ ] `/blog` shows listing of 5 posts
- [ ] Each blog post renders with full MDX, author info, reading time
- [ ] RSS feed at `/blog/feed.xml` is valid XML with all 5 posts
- [ ] Social share buttons work (correct URLs)
- [ ] Dynamic OG images generate for blog posts
- [ ] `/playground` loads with Monaco editor
- [ ] Template selector loads all 9 templates
- [ ] JSON editing triggers live preview update
- [ ] Schema validation shows errors for invalid JSON
- [ ] Copy/download/share buttons work
- [ ] Share URL loads playground with pre-populated content
- [ ] Mobile layout works for both blog and playground
- [ ] `pnpm build` completes without errors

## Do NOT build in this phase:
- Community page
- Analytics
- Algolia DocSearch
- GitHub Actions / CI
- Performance optimization
````

#### After completion, commit:

```bash
cd website
git add -A
git commit -m "feat: phase 3 — blog engine with 5 posts and interactive playground"
```

---

### Phase 4: Polish & Community (Week 4) — COMMIT AFTER THIS

**Git commit message**: `feat: phase 4 — community page, SEO, analytics, CI/CD, and polish`

#### Prompt to paste in new chat:

````
I have an existing Next.js 16 + Fumadocs website in `./website` for the Agent Policy Protocol (APoP). Phases 1-3 are complete: landing page, full docs, blog with 5 posts, interactive playground.

Now build Phase 4: Polish, community page, analytics, CI/CD, and final touches.

## What to Build

### 1. Community Page (`src/app/community/page.tsx`)
- Heading: "Join the APoP Community"
- Subheading: "Help shape the future of AI agent authorization on the web."
- Cards grid:
  - **GitHub** — "Star the repo, report issues, submit PRs" + link to https://github.com/agent-policy-protocol/spec + star count badge
  - **Discord** — "Chat with contributors, ask questions, share ideas" + invite link
  - **GitHub Discussions** — "Propose RFCs, vote on features, get help" + link to discussions tab
  - **Contributing** — "Read the contributing guide" + link to /docs/contributing/how-to-contribute
  - **Code of Conduct** — "We follow the Contributor Covenant" + link
  - **Roadmap** — "See what's coming next" + brief list: W3C Community Group, WordPress plugin, Browser integration, Agent Certification Program
- Use shadcn Card components with Lucide icons

### 2. Schema Validation API (`src/app/api/validate/route.ts`)
- POST endpoint accepting JSON body
- Validates against APoP JSON Schema using `ajv` + `ajv-formats`
- Returns:
  ```json
  { "valid": true }
  ```
  or
  ```json
  { "valid": false, "errors": [{ "path": "/defaultPolicy/rateLimit", "message": "..." }] }
  ```
- CORS headers for cross-origin use
- Rate limit: use Edge runtime

### 3. 404 Page (`src/app/not-found.tsx`)
- "Page not found" with APoP branding
- Helpful links: Home, Docs, Blog, Playground
- Search bar (if Fumadocs search is available)
- Fun message: "This page returned a 430 — Agent Action Not Allowed 😄"

### 4. Privacy Policy (`src/app/privacy/page.tsx`)
- Simple privacy policy page
- State: no cookies by default, Vercel Analytics is privacy-first (no cookies), Plausible is cookie-free
- If Algolia is used: mention search queries are sent to Algolia
- Open source project, Apache 2.0 license
- Contact: hello@agentpolicy.org

### 5. Analytics Setup
- Install `@vercel/analytics` and `@vercel/speed-insights`
- Add `<Analytics />` and `<SpeedInsights />` to root layout
- These are zero-config on Vercel

### 6. Animated Hero Terminal Demo
- Create `src/components/landing/terminal-demo.tsx`
- Animated terminal that shows:
  1. Types: `curl -H "Agent-Name: MyBot/1.0" -H "Agent-Intent: read" https://example.com/.well-known/agent-policy.json`
  2. Shows the response with syntax-highlighted JSON
  3. Types: `curl -H "Agent-Name: MyBot/1.0" -H "Agent-Intent: extract" https://example.com/api/data`
  4. Shows: `HTTP/1.1 430 Agent Action Not Allowed` with error JSON
- Use CSS animations or Motion (framer-motion) for typing effect
- Respect `prefers-reduced-motion`
- Replace the static code in the hero section with this terminal demo (keep static on mobile)

### 7. Ecosystem Diagram
- Create `src/components/landing/ecosystem-diagram.tsx`
- Visual representation of the Agentic Web Stack:
  ```
  [WebMCP] [MCP] [A2A] [AP]
       \    |    |    /
        [   APoP   ]  ← Authorization Layer
       /    |    \
  [UCP] [AP2]  [APAAI]
  ```
- Use SVG or CSS grid with protocol boxes
- APoP box highlighted in brand colors
- Hovering on each protocol shows a tooltip with its purpose and relationship to APoP
- Replace the static table in the ecosystem section with this diagram (keep table below for detail)

### 8. GitHub Actions CI/CD
Create `.github/workflows/ci.yml` in the `website/` directory:
```yaml
name: Website CI
on:
  push:
    branches: [main]
    paths: ['website/**']
  pull_request:
    branches: [main]
    paths: ['website/**']

defaults:
  run:
    working-directory: website

jobs:
  lint-and-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 10
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
          cache-dependency-path: website/pnpm-lock.yaml
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm type-check
      - run: pnpm build
```

### 9. Spec Sync Script
Create `website/scripts/sync-spec.ts`:
- Reads spec files from `../spec/` (relative to website dir)
- Copies and converts:
  - `../spec/discovery.md` → `content/docs/specification/discovery.mdx` (add MDX frontmatter)
  - `../spec/agent-identification.md` → `content/docs/specification/agent-identification.mdx`
  - `../spec/http-extensions.md` → `content/docs/specification/http-extensions.mdx`
  - `../spec/schema/agent-policy.schema.json` → `public/schema/v1/agent-policy.schema.json`
  - `../examples/*.json` → bundled for playground
- Add as npm script: `"sync-spec": "tsx scripts/sync-spec.ts"`

### 10. Performance Optimization
- Ensure Monaco Editor is dynamically imported (`next/dynamic` with `ssr: false`)
- Verify all docs and blog pages are statically generated (`generateStaticParams`)
- Check that landing page JS bundle is under 150KB gzipped
- Add `loading.tsx` for docs and blog routes
- Verify images use `next/image` where applicable
- Font subsetting via `next/font`

### 11. Accessibility Audit
- All interactive elements have proper `aria-labels`
- Color contrast meets WCAG AA (4.5:1 for text)
- Focus indicators visible on all interactive elements
- Skip-to-main-content link
- Semantic HTML (nav, main, article, aside, footer)
- Alt text on all images

### 12. Final Touches
- Update header to include all nav links (Docs, Blog, Playground, Community)
- Ensure all internal links work (no 404s)
- Verify `robots.txt` is generated
- Verify `sitemap.xml` is generated with all pages
- Test all redirects from `vercel.json` work
- Add website README.md:
  ```markdown
  # agentpolicy.org

  The official website for the Agent Policy Protocol (APoP).

  ## Development

  ```bash
  cd website
  pnpm install
  pnpm dev
  ```

  ## Tech Stack

  - Next.js 16 + React 19
  - Fumadocs (docs engine)
  - Tailwind CSS v4 + shadcn/ui
  - MDX for all content

  ## Contributing

  See [Contributing Guide](/docs/contributing/how-to-contribute).
  ```

## Verification Checklist
- [ ] `/community` page renders with all cards
- [ ] POST `/api/validate` returns correct validation results
- [ ] 404 page renders with helpful links
- [ ] Privacy policy page renders
- [ ] Vercel Analytics loads (check in browser devtools)
- [ ] Animated terminal demo plays on landing page hero
- [ ] Ecosystem diagram renders with tooltips
- [ ] GitHub Actions CI workflow is valid YAML
- [ ] `pnpm build` produces no errors
- [ ] No TypeScript errors
- [ ] Lighthouse Performance ≥ 90
- [ ] Lighthouse Accessibility ≥ 95
- [ ] Lighthouse SEO = 100
- [ ] All internal links resolve (no broken links)
- [ ] Mobile responsive across all pages
- [ ] Dark mode works on all pages
- [ ] robots.txt and sitemap.xml generated
- [ ] RSS feed valid at /blog/feed.xml

## Final Deploy Steps
1. Push to GitHub
2. Connect Vercel to the repo
3. Set Root Directory to `website` in Vercel project settings
4. Add custom domain `agentpolicy.org`
5. Configure DNS: A record → 76.76.21.21, CNAME www → cname.vercel-dns.com
6. Verify `/.well-known/agent-policy.json` serves correctly with CORS headers
7. Verify `/schema/v1/agent-policy.schema.json` serves with CORS headers
8. Submit sitemap to Google Search Console
````

#### After completion, commit:

```bash
cd website
git add -A
git commit -m "feat: phase 4 — community page, SEO, analytics, CI/CD, and polish"
```

---

## 13. Dependencies (`package.json`)

```json
{
  "name": "agentpolicy-org",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "type-check": "tsc --noEmit",
    "check-links": "tsx scripts/check-links.ts",
    "sync-spec": "tsx scripts/sync-spec.ts"
  },
  "dependencies": {
    "next": "latest",
    "react": "latest",
    "react-dom": "latest",
    "fumadocs-core": "latest",
    "fumadocs-ui": "latest",
    "fumadocs-mdx": "latest",
    "@monaco-editor/react": "latest",
    "ajv": "latest",
    "ajv-formats": "latest",
    "motion": "latest",
    "lucide-react": "latest",
    "next-themes": "latest",
    "clsx": "latest",
    "tailwind-merge": "latest",
    "feed": "latest",
    "reading-time": "latest",
    "gray-matter": "latest",
    "date-fns": "latest",
    "@vercel/analytics": "latest",
    "@vercel/speed-insights": "latest"
  },
  "devDependencies": {
    "typescript": "latest",
    "@types/react": "latest",
    "@types/react-dom": "latest",
    "@types/node": "latest",
    "tailwindcss": "latest",
    "@tailwindcss/postcss": "latest",
    "postcss": "latest",
    "eslint": "latest",
    "eslint-config-next": "latest",
    "@eslint/js": "latest",
    "prettier": "latest",
    "tsx": "latest",
    "@vercel/og": "latest",
    "next-sitemap": "latest"
  }
}
```

> **Note**: Use `latest` during `pnpm add` to always get the newest stable versions. The lock file will pin exact versions. At time of writing (Feb 2026), this means Next.js 16.x, React 19.x, TypeScript 5.8+, Tailwind CSS 4.x, Fumadocs 15.x+.

---

## 14. Important URLs

| URL                                                   | Purpose                             |
| ----------------------------------------------------- | ----------------------------------- |
| `agentpolicy.org`                                     | Landing page                        |
| `agentpolicy.org/docs`                                | Documentation                       |
| `agentpolicy.org/docs/specification/overview`         | Spec overview                       |
| `agentpolicy.org/docs/specification/schema-reference` | Interactive schema browser          |
| `agentpolicy.org/docs/sdks/node/installation`         | Node.js SDK docs                    |
| `agentpolicy.org/docs/sdks/python/installation`       | Python SDK docs                     |
| `agentpolicy.org/docs/guides/quick-start`             | 5-minute quick start                |
| `agentpolicy.org/docs/examples/news-publisher`        | Example policy walkthrough          |
| `agentpolicy.org/blog`                                | Blog listing                        |
| `agentpolicy.org/playground`                          | Interactive policy builder          |
| `agentpolicy.org/community`                           | Community hub                       |
| `agentpolicy.org/schema`                              | Interactive schema browser          |
| `agentpolicy.org/schema/v1/agent-policy.schema.json`  | Raw JSON Schema (served with CORS)  |
| `agentpolicy.org/.well-known/agent-policy.json`       | Site's own APoP policy (dogfooding) |
| `agentpolicy.org/blog/feed.xml`                       | RSS feed                            |
| `agentpolicy.org/api/validate`                        | Policy validation API               |
| `agentpolicy.org/github`                              | Redirect → GitHub repo              |
| `agentpolicy.org/discord`                             | Redirect → Discord server           |

---

## 15. Schema URL Resolution

The `$schema` field in every `agent-policy.json` currently references:

```
https://agentpolicy.org/schema/v1/agent-policy.schema.json
```

The website MUST serve this file at that exact URL with:

- `Content-Type: application/schema+json`
- `Access-Control-Allow-Origin: *` (so any tool/editor can fetch it)
- `Cache-Control: public, max-age=86400`

This enables JSON Schema validation in any IDE (VS Code, JetBrains, etc.) when users reference the `$schema` URL.

---

## 16. Pre-Launch Checklist

- [ ] Domain DNS configured → Vercel
- [ ] SSL certificate provisioned (automatic via Vercel)
- [ ] `/.well-known/agent-policy.json` serving correctly
- [ ] `/schema/v1/agent-policy.schema.json` serving with CORS
- [ ] All docs pages rendering correctly
- [ ] Search working
- [ ] Dark/light mode working
- [ ] Mobile responsive
- [ ] Lighthouse scores meeting targets
- [ ] Open Graph images rendering correctly
- [ ] RSS feed valid
- [ ] Sitemap submitted to Google Search Console
- [ ] GitHub repo linked with "Website" field
- [ ] Discord server created with invite link
- [ ] 5 blog posts drafted and scheduled
- [ ] Playground functional with all 9 templates
- [ ] "Edit this page" links pointing to correct GitHub paths
- [ ] 404 page implemented
- [ ] Analytics configured
- [ ] Privacy policy page live
- [ ] CONTRIBUTING.md in website repo

---

## 17. Post-Launch Roadmap

| Timeline | Enhancement                                               |
| -------- | --------------------------------------------------------- |
| Week 5-6 | Algolia DocSearch integration                             |
| Week 5-6 | Community submissions: adopters, blog posts               |
| Week 7-8 | i18n support (start with Chinese, Japanese, Spanish)      |
| Month 3  | "APoP Certified Agent" badge page                         |
| Month 3  | Policy analytics dashboard (link to Superdom AI product)  |
| Month 4  | Plugin marketplace (WordPress, Cloudflare, Nginx configs) |
| Month 6  | W3C Community Group page on the site                      |
| Month 6  | RFC/spec versioning with diff viewer                      |

---

## 18. Execution Guide

### How to Execute This Plan

This plan is designed for **phase-by-phase execution in separate coding agent sessions** to avoid context window overflow.

#### Workflow per Phase:

1. **Open a new coding agent chat** (Claude Code, Cursor, GH Copilot, etc.)
2. **Paste the self-contained prompt** from Section 12 for that phase
3. **Point the agent to the project folder** so it can read spec files, examples, and existing website code
4. **Let the agent build** — each prompt has everything it needs
5. **Verify** using the checklist at the end of each phase prompt
6. **Commit** using the git command provided
7. **Move to the next phase** in a new chat

#### What to Attach / Provide for Each Phase:

| Phase   | What the agent needs access to                                  |
| ------- | --------------------------------------------------------------- |
| Phase 1 | The project folder (for spec files, schema, README content)     |
| Phase 2 | The project folder + the `./website` folder from Phase 1 output |
| Phase 3 | The project folder + `./website` from Phases 1-2                |
| Phase 4 | The project folder + `./website` from Phases 1-3                |

#### Vercel Deployment:

After Phase 1, you can already deploy to Vercel:

1. Push to GitHub (either the monorepo or extract `website/` to its own repo)
2. Connect to Vercel → set **Root Directory** to `website`
3. Add custom domain `agentpolicy.org`
4. Each subsequent phase commit will auto-deploy

#### Extracting to Separate Repo (Optional, Post-Launch):

If you want to move the website to `agent-policy-protocol/agentpolicy.org`:

```bash
# From project root
cp -r website/ /tmp/agentpolicy-org
cd /tmp/agentpolicy-org
git init
git remote add origin git@github.com:agent-policy-protocol/agentpolicy.org.git
# Update spec sync script paths (scripts/sync-spec.ts) to clone from GitHub instead of relative paths
git add -A && git commit -m "initial: agentpolicy.org website"
git push -u origin main
```

---

_This plan was generated on 2026-02-14. All dependency versions use `latest` — the coding agent should install the newest stable versions available at execution time._
