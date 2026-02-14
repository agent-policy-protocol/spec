import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for agentpolicy.org",
};

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen py-20">
        <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 prose prose-neutral dark:prose-invert">
          <h1>Privacy Policy</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Last updated: February 14, 2026
          </p>

          <h2>Overview</h2>
          <p>
            The Agent Policy Protocol (APoP) website at{" "}
            <strong>agentpolicy.org</strong> is an open source project licensed
            under the Apache 2.0 License. We are committed to protecting your
            privacy and being transparent about how this website works.
          </p>

          <h2>Cookies</h2>
          <p>
            This website does not use cookies by default. We do not set any
            tracking cookies, advertising cookies, or third-party cookies.
          </p>

          <h2>Analytics</h2>
          <p>
            We use <strong>Vercel Analytics</strong> and{" "}
            <strong>Vercel Speed Insights</strong> to understand how the website
            is used and to improve performance. These tools are privacy-first:
          </p>
          <ul>
            <li>No cookies are used</li>
            <li>No personally identifiable information is collected</li>
            <li>Data is aggregated and anonymized</li>
            <li>Compliant with GDPR, CCPA, and other privacy regulations</li>
          </ul>

          <h2>Search</h2>
          <p>
            The website uses Fumadocs built-in search functionality. Search
            queries are processed locally and are not sent to any third-party
            services.
          </p>

          <h2>Data Collection</h2>
          <p>
            We do not collect, store, or process any personal data.
            Specifically:
          </p>
          <ul>
            <li>No user accounts or registration</li>
            <li>No email collection (unless you contact us directly)</li>
            <li>No form submissions stored</li>
            <li>No IP address logging</li>
          </ul>

          <h2>Schema Validation API</h2>
          <p>
            The <code>/api/validate</code> endpoint accepts JSON payloads for
            schema validation. These payloads are processed in memory and are
            not stored, logged, or shared.
          </p>

          <h2>Third-Party Services</h2>
          <ul>
            <li>
              <strong>Vercel</strong> — Hosting and deployment (
              <a
                href="https://vercel.com/legal/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
              >
                Vercel Privacy Policy
              </a>
              )
            </li>
            <li>
              <strong>GitHub</strong> — Source code hosting and community (
              <a
                href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub Privacy Statement
              </a>
              )
            </li>
          </ul>

          <h2>Open Source</h2>
          <p>
            This website is open source. You can review the complete source code
            at{" "}
            <a
              href="https://github.com/agent-policy-protocol/spec"
              target="_blank"
              rel="noopener noreferrer"
            >
              github.com/agent-policy-protocol/spec
            </a>
            .
          </p>

          <h2>Contact</h2>
          <p>
            For privacy-related questions, contact us at{" "}
            <a href="mailto:hello@agentpolicy.org">hello@agentpolicy.org</a>.
          </p>

          <h2>Changes</h2>
          <p>
            We may update this privacy policy from time to time. Any changes
            will be reflected on this page with an updated date.
          </p>
        </article>
      </main>
      <Footer />
    </>
  );
}
