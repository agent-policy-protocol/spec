"use client";

import { useState, useCallback, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { TemplateSelector } from "@/components/playground/template-selector";
import { PolicyPreview } from "@/components/playground/policy-preview";
import { ValidationPanel } from "@/components/playground/validation-panel";
import { ExportPanel } from "@/components/playground/export-panel";
import { useSearchParams } from "next/navigation";

const PolicyEditor = dynamic(
  () =>
    import("@/components/playground/policy-editor").then(
      (mod) => mod.PolicyEditor,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[500px] bg-neutral-50 dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800">
        <div className="text-neutral-500 dark:text-neutral-400">
          Loading editor...
        </div>
      </div>
    ),
  },
);

const DEFAULT_POLICY = JSON.stringify(
  {
    $schema: "https://agentpolicy.org/schema/v1/agent-policy.schema.json",
    version: "1.0",
    defaultPolicy: {
      allow: true,
      actions: ["read", "navigate"],
      disallow: ["train", "extract"],
      rateLimit: {
        requests: 60,
        window: "minute",
      },
    },
  },
  null,
  2,
);

function PlaygroundContent() {
  const searchParams = useSearchParams();
  const [code, setCode] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const policyParam = searchParams.get("policy");
      if (policyParam) {
        try {
          return atob(policyParam);
        } catch {
          // invalid base64
        }
      }
    }
    return DEFAULT_POLICY;
  });

  const [parsedJson, setParsedJson] = useState<Record<string, unknown> | null>(
    null,
  );
  const [jsonError, setJsonError] = useState<string | null>(null);

  const handleCodeChange = useCallback((value: string) => {
    setCode(value);
    try {
      const parsed = JSON.parse(value);
      setParsedJson(parsed);
      setJsonError(null);
    } catch (e) {
      setParsedJson(null);
      setJsonError((e as Error).message);
    }
  }, []);

  // Parse initial code
  useEffect(() => {
    try {
      const parsed = JSON.parse(code);
      setParsedJson(parsed);
      setJsonError(null);
    } catch (e) {
      setJsonError((e as Error).message);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTemplateLoad = useCallback((templateJson: string) => {
    setCode(templateJson);
    try {
      const parsed = JSON.parse(templateJson);
      setParsedJson(parsed);
      setJsonError(null);
    } catch (e) {
      setParsedJson(null);
      setJsonError((e as Error).message);
    }
  }, []);

  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Policy Playground
          </h1>
          <p className="mt-1 text-neutral-600 dark:text-neutral-400">
            Build, validate, and preview your agent-policy.json
          </p>
        </div>

        <div className="mb-4">
          <TemplateSelector onLoad={handleTemplateLoad} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Editor - left side */}
          <div className="lg:col-span-3">
            <PolicyEditor value={code} onChange={handleCodeChange} />
          </div>

          {/* Preview & validation - right side */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <PolicyPreview policy={parsedJson} jsonError={jsonError} />
            <ValidationPanel code={code} />
            <ExportPanel code={code} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function PlaygroundPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-neutral-500">Loading playground...</div>
        </div>
      }
    >
      <PlaygroundContent />
    </Suspense>
  );
}
