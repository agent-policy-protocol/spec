"use client";

import {
  Shield,
  ShieldCheck,
  ShieldX,
  Clock,
  FolderOpen,
  AlertTriangle,
} from "lucide-react";

interface PolicyPreviewProps {
  policy: Record<string, unknown> | null;
  jsonError: string | null;
}

export function PolicyPreview({ policy, jsonError }: PolicyPreviewProps) {
  if (jsonError) {
    return (
      <div className="rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 p-4">
        <div className="flex items-center gap-2 text-red-700 dark:text-red-400 mb-2">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-sm font-medium">Invalid JSON</span>
        </div>
        <p className="text-xs text-red-600 dark:text-red-400 font-mono">
          {jsonError}
        </p>
      </div>
    );
  }

  if (!policy) {
    return (
      <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-4 text-center text-neutral-500 dark:text-neutral-400 text-sm">
        Enter a valid policy JSON to see the preview
      </div>
    );
  }

  const defaultPolicy = policy.defaultPolicy as
    | Record<string, unknown>
    | undefined;
  const pathPolicies = policy.pathPolicies as
    | Array<Record<string, unknown>>
    | undefined;
  const verification = policy.verification as
    | Record<string, unknown>
    | undefined;
  const contact = policy.contact as Record<string, unknown> | undefined;
  const interop = policy.interoperability as
    | Record<string, unknown>
    | undefined;

  return (
    <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
      <div className="px-4 py-3 bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Policy Preview
          </span>
          {policy.version ? (
            <span className="text-xs font-mono bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">
              v{String(policy.version)}
            </span>
          ) : null}
        </div>
      </div>

      <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
        {/* Default Policy */}
        {defaultPolicy && (
          <section>
            <h4 className="flex items-center gap-1.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              <Shield className="h-4 w-4" />
              Default Policy
            </h4>
            <div className="space-y-2 pl-5">
              {defaultPolicy.allow !== undefined && (
                <div className="flex items-center gap-2">
                  {defaultPolicy.allow ? (
                    <ShieldCheck className="h-3.5 w-3.5 text-green-600" />
                  ) : (
                    <ShieldX className="h-3.5 w-3.5 text-red-600" />
                  )}
                  <span className="text-xs text-neutral-600 dark:text-neutral-400">
                    {defaultPolicy.allow
                      ? "Allowed by default"
                      : "Denied by default"}
                  </span>
                </div>
              )}

              {Array.isArray(defaultPolicy.actions) &&
                defaultPolicy.actions.length > 0 && (
                  <div>
                    <span className="text-xs text-neutral-500 dark:text-neutral-500 block mb-1">
                      Allowed actions:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {(defaultPolicy.actions as string[]).map((action) => (
                        <span
                          key={action}
                          className="inline-flex items-center rounded-full bg-green-50 dark:bg-green-950 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-300"
                        >
                          {action}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {Array.isArray(defaultPolicy.disallow) &&
                defaultPolicy.disallow.length > 0 && (
                  <div>
                    <span className="text-xs text-neutral-500 dark:text-neutral-500 block mb-1">
                      Disallowed actions:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {(defaultPolicy.disallow as string[]).map((action) => (
                        <span
                          key={action}
                          className="inline-flex items-center rounded-full bg-red-50 dark:bg-red-950 px-2 py-0.5 text-xs font-medium text-red-700 dark:text-red-300"
                        >
                          {action}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {defaultPolicy.rateLimit ? (
                <div className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400">
                  <Clock className="h-3.5 w-3.5" />
                  {String(
                    (defaultPolicy.rateLimit as Record<string, unknown>)
                      .requests,
                  )}{" "}
                  requests /{" "}
                  {String(
                    (defaultPolicy.rateLimit as Record<string, unknown>).window,
                  )}
                </div>
              ) : null}

              {defaultPolicy.requireVerification ? (
                <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Verification required
                </div>
              ) : null}
            </div>
          </section>
        )}

        {/* Path Policies */}
        {pathPolicies && pathPolicies.length > 0 && (
          <section>
            <h4 className="flex items-center gap-1.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              <FolderOpen className="h-4 w-4" />
              Path Policies ({pathPolicies.length})
            </h4>
            <div className="space-y-2 pl-5">
              {pathPolicies.map((pp, i) => (
                <div
                  key={i}
                  className="rounded border border-neutral-100 dark:border-neutral-800 p-2 text-xs space-y-1"
                >
                  <div className="flex items-center gap-2">
                    <code className="font-mono text-blue-700 dark:text-blue-400">
                      {String(pp.path)}
                    </code>
                    {pp.allow === false ? (
                      <span className="text-red-600 dark:text-red-400 font-medium">
                        DENIED
                      </span>
                    ) : (
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        ALLOWED
                      </span>
                    )}
                  </div>
                  {Array.isArray(pp.actions) && (
                    <div className="flex flex-wrap gap-1">
                      {(pp.actions as string[]).map((a) => (
                        <span
                          key={a}
                          className="rounded-full bg-blue-50 dark:bg-blue-950 px-1.5 py-0.5 text-[10px] text-blue-700 dark:text-blue-300"
                        >
                          {a}
                        </span>
                      ))}
                    </div>
                  )}
                  {pp.rateLimit ? (
                    <div className="text-neutral-500">
                      Rate:{" "}
                      {String(
                        (pp.rateLimit as Record<string, unknown>).requests,
                      )}{" "}
                      /{" "}
                      {String((pp.rateLimit as Record<string, unknown>).window)}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Verification */}
        {verification && (
          <section>
            <h4 className="flex items-center gap-1.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              <ShieldCheck className="h-4 w-4" />
              Verification
            </h4>
            <div className="pl-5 text-xs text-neutral-600 dark:text-neutral-400 space-y-1">
              {Array.isArray(verification.methods) && (
                <div>
                  Methods: {(verification.methods as string[]).join(", ")}
                </div>
              )}
              {verification.registryUrl ? (
                <div>Registry: {String(verification.registryUrl)}</div>
              ) : null}
            </div>
          </section>
        )}

        {/* Contact */}
        {contact && (
          <section>
            <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Contact
            </h4>
            <div className="pl-5 text-xs text-neutral-600 dark:text-neutral-400 space-y-0.5">
              {contact.name ? <div>{String(contact.name)}</div> : null}
              {contact.email ? <div>{String(contact.email)}</div> : null}
              {contact.url ? <div>{String(contact.url)}</div> : null}
            </div>
          </section>
        )}

        {/* Interoperability */}
        {interop && (
          <section>
            <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Interoperability
            </h4>
            <div className="pl-5 text-xs text-neutral-600 dark:text-neutral-400 space-y-0.5">
              {Object.entries(interop).map(([protocol, config]) => (
                <div key={protocol}>
                  <span className="font-medium uppercase">{protocol}</span>:{" "}
                  {typeof config === "object" && config !== null
                    ? Object.values(config as Record<string, unknown>).join(
                        ", ",
                      )
                    : String(config)}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
