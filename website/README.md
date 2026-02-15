# APoP Website — agentpolicy.org

The official website for the **Agent Policy Protocol (APoP)** — an open standard that lets websites declare how AI agents can access and interact with their content.

Live at [agentpolicy.org](https://agentpolicy.org).

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org) (App Router, React 19)
- **Docs Engine**: [Fumadocs](https://fumadocs.vercel.app) (MDX-based, full-text search)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) (New York)
- **Code Editor**: [Monaco Editor](https://microsoft.github.io/monaco-editor) (playground)
- **Analytics**: [Vercel Analytics](https://vercel.com/analytics) + [Speed Insights](https://vercel.com/docs/speed-insights)
- **Deployment**: [Vercel](https://vercel.com)
- **Language**: TypeScript

## Getting Started

```bash
# Install dependencies
pnpm install

# Sync spec files (from ../spec/ to docs content)
pnpm sync-spec

# Start dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## Project Structure

```
website/
├── content/          # MDX content (docs + blog)
│   ├── docs/         # Documentation pages
│   └── blog/         # Blog posts
├── public/           # Static assets
│   └── schema/       # JSON Schema (v1)
├── scripts/          # Build scripts (sync-spec)
├── src/
│   ├── app/          # Next.js App Router pages
│   │   ├── api/      # API routes (search, validate, OG)
│   │   ├── blog/     # Blog pages
│   │   ├── community/# Community page
│   │   ├── docs/     # Docs layout + pages
│   │   ├── playground/# Interactive playground
│   │   └── privacy/  # Privacy policy
│   ├── components/   # React components
│   │   ├── landing/  # Landing page sections
│   │   └── ui/       # shadcn/ui components
│   └── lib/          # Utilities + content source
└── .github/workflows/# CI (lint + build)
```

## Available Scripts

| Script           | Description                                     |
| ---------------- | ----------------------------------------------- |
| `pnpm dev`       | Start development server                        |
| `pnpm build`     | Production build                                |
| `pnpm start`     | Start production server                         |
| `pnpm lint`      | Run ESLint                                      |
| `pnpm sync-spec` | Sync spec files from `../spec/` to docs content |

## Contributing

See the [Contributing Guide](https://agentpolicy.org/docs/contributing/how-to-contribute) for details on how to contribute to the APoP project.

## License

Apache 2.0 — see [LICENSE](../LICENSE) for details.
