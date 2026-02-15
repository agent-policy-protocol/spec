"use client";

import Link from "next/link";
import { useState } from "react";
import { useTheme } from "next-themes";
import { Github, Menu, X, Moon, Sun, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const navLinks = [
  { href: "/docs", label: "Docs" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/playground", label: "Playground" },
  { href: "/community", label: "Community" },
  {
    href: "https://github.com/agent-policy-protocol/spec",
    label: "GitHub",
    external: true,
  },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-border glass-effect"
      role="banner"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 group"
          aria-label="APoP Home"
        >
          <div className="rounded-lg bg-primary p-2 group-hover:bg-primary/90 transition-all group-hover:scale-105">
            <Shield
              className="h-5 w-5 text-primary-foreground"
              aria-hidden="true"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-xl tracking-tight">APoP</span>
            <Badge
              variant="outline"
              className="hidden sm:inline-flex border-primary/30 bg-primary/5 text-primary font-medium text-xs px-2 py-0.5 rounded-full"
              aria-label="Version 1.0"
            >
              v1.0
            </Badge>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav
          className="hidden md:flex items-center gap-1"
          role="navigation"
          aria-label="Main navigation"
        >
          {navLinks.map((link) =>
            "external" in link && link.external ? (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none transition-colors"
                aria-label={link.label}
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none transition-colors"
                aria-label={link.label}
              >
                {link.label}
              </Link>
            ),
          )}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-lg p-2 hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none transition-colors"
            aria-label={
              theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
            }
            suppressHydrationWarning
          >
            <Sun className="h-5 w-5 hidden dark:block" aria-hidden="true" />
            <Moon className="h-5 w-5 block dark:hidden" aria-hidden="true" />
          </button>

          <a
            href="https://github.com/agent-policy-protocol/spec"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-2 bg-foreground text-background px-4 py-2 rounded-lg text-sm font-semibold hover:bg-foreground/90 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none transition-all"
            aria-label="Star on GitHub"
          >
            <Github className="h-4 w-4" aria-hidden="true" />
            <span>Star</span>
          </a>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden rounded-lg p-2 hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none transition-colors"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <div
          className="md:hidden border-t border-border bg-background/95 backdrop-blur"
          id="mobile-navigation"
        >
          <nav
            className="flex flex-col px-4 py-3 gap-1"
            role="navigation"
            aria-label="Mobile navigation"
          >
            {navLinks.map((link) =>
              "external" in link && link.external ? (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-3 text-sm font-medium rounded-lg hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label={link.label}
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-3 text-sm font-medium rounded-lg hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label={link.label}
                >
                  {link.label}
                </Link>
              ),
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
