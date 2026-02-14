import Link from "next/link";
import { ArrowRight, Github, Users } from "lucide-react";

export function CallToAction() {
  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-neutral-50 to-blue-50 dark:from-neutral-900 dark:to-blue-950/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white">
            Ready to protect your website?
          </h2>
          <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-300">
            Get started in 5 minutes. Deploy an agent-policy.json and take
            control of how AI agents interact with your content.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/docs/introduction/quick-start"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-blue-800 transition-colors"
            >
              Get started in 5 minutes
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/community"
              className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-6 py-3 text-sm font-semibold text-neutral-900 dark:text-white shadow-sm hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
            >
              <Users className="h-4 w-4" />
              Join the community
            </Link>
            <a
              href="https://github.com/agent-policy-protocol/spec"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-6 py-3 text-sm font-semibold text-neutral-900 dark:text-white shadow-sm hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
            >
              <Github className="h-4 w-4" />
              Star on GitHub
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
