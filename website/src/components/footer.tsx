import Link from "next/link";
import { Github, Shield } from "lucide-react";

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
    { href: "/docs/contributing/how-to-contribute", label: "Contributing" },
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
    <footer className="border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
                {category}
              </h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    {"external" in link && link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors"
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

        <div className="mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-800">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-700 dark:text-blue-400" />
              <span className="text-sm text-neutral-500 dark:text-neutral-400">
                APoP is an open standard —{" "}
                <a
                  href="https://github.com/agent-policy-protocol/spec"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-700 dark:text-blue-400 hover:underline"
                >
                  contribute on GitHub
                </a>
              </span>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-neutral-400 dark:text-neutral-500">
                Made by{" "}
                <a
                  href="https://superdom.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                >
                  Superdom AI
                </a>
              </span>
              <div className="flex items-center gap-3">
                <a
                  href="https://github.com/agent-policy-protocol/spec"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                  aria-label="GitHub"
                >
                  <Github className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
