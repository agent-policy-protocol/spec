import Link from "next/link";
import { Github, Shield, MessageCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const footerLinks = {
  Docs: [
    { href: "/docs", label: "Getting Started" },
    { href: "/docs/specification/overview", label: "Specification" },
    { href: "/docs/examples/news-publisher", label: "Examples" },
    { href: "/docs/guides/deploy-vercel", label: "Guides" },
  ],
  Community: [
    {
      href: "https://github.com/agent-policy-protocol/spec",
      label: "GitHub",
      external: true,
    },
    {
      href: "https://discord.gg/apop",
      label: "Discord",
      external: true,
    },
    { href: "/about", label: "About" },
    { href: "/docs/contributing/how-to-contribute", label: "Contributing" },
    {
      href: "https://github.com/agent-policy-protocol/spec/blob/main/CODE_OF_CONDUCT.md",
      label: "Code of Conduct",
      external: true,
    },
  ],
  SDKs: [
    { href: "/docs/sdks/node/installation", label: "Node.js (@apop/node)" },
    { href: "/docs/sdks/python/installation", label: "Python (apop)" },
  ],
  Legal: [
    {
      href: "https://github.com/agent-policy-protocol/spec/blob/main/LICENSE",
      label: "License (Apache 2.0)",
      external: true,
    },
    { href: "/privacy", label: "Privacy Policy" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30 relative">
      <div className="absolute inset-0 protocol-grid opacity-20" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 relative">
        {/* Logo and tagline */}
        <div className="mb-12 pb-8 border-b border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="rounded-lg bg-primary p-2.5">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="font-bold text-2xl tracking-tight">APoP</span>
          </div>
          <p className="text-sm text-muted-foreground max-w-md">
            The Authorization Layer for the Agentic Web
          </p>
        </div>

        {/* Links grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-4 text-muted-foreground">
                {category}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    {"external" in link && link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm hover:text-primary transition-colors"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm hover:text-primary transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="mb-8 bg-border" />

        {/* Bottom section */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-sm">
            <span>Open Standard</span>
            <span className="text-muted-foreground">•</span>
            <a
              href="https://github.com/agent-policy-protocol/spec"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors font-semibold"
            >
              Contribute on GitHub
            </a>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground">
              Made by{" "}
              <a
                href="https://superdom.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors font-medium"
              >
                Superdom AI
              </a>
            </span>

            <div className="flex items-center gap-2">
              <a
                href="https://github.com/agent-policy-protocol/spec"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg p-2 hover:bg-muted transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href="https://x.com/agentpolicy"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg p-2 hover:bg-muted transition-colors"
                aria-label="X / Twitter"
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://discord.gg/apop"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg p-2 hover:bg-muted transition-colors"
                aria-label="Discord"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
