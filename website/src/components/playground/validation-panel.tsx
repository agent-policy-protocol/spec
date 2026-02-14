"use client";

import { useEffect, useState, useCallback } from "react";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";
import Ajv from "ajv";
import addFormats from "ajv-formats";

interface ValidationError {
  path: string;
  message: string;
}

interface ValidationPanelProps {
  code: string;
}

let cachedSchema: Record<string, unknown> | null = null;

export function ValidationPanel({ code }: ValidationPanelProps) {
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [valid, setValid] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  const validate = useCallback(async (json: string) => {
    try {
      const parsed = JSON.parse(json);

      if (!cachedSchema) {
        const res = await fetch("/schema/v1/agent-policy.schema.json");
        cachedSchema = await res.json();
        setLoading(false);
      }

      const ajv = new Ajv({ allErrors: true, strict: false });
      addFormats(ajv);
      const validateFn = ajv.compile(cachedSchema!);
      const isValid = validateFn(parsed);

      if (isValid) {
        setValid(true);
        setErrors([]);
      } else {
        setValid(false);
        setErrors(
          (validateFn.errors || []).map((e) => ({
            path: e.instancePath || "/",
            message: e.message || "Unknown error",
          })),
        );
      }
    } catch {
      // JSON parse error — handled by parent
      setValid(null);
      setErrors([]);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => validate(code), 300);
    return () => clearTimeout(timer);
  }, [code, validate]);

  if (loading && valid === null) {
    return (
      <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-4 text-center text-neutral-500 text-sm">
        Loading schema...
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
      <div className="px-4 py-3 bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-800">
        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Schema Validation
        </span>
      </div>
      <div className="p-4">
        {valid === true && (
          <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Valid policy</span>
          </div>
        )}
        {valid === false && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
              <XCircle className="h-4 w-4" />
              <span className="text-sm font-medium">
                {errors.length} validation error{errors.length !== 1 ? "s" : ""}
              </span>
            </div>
            <ul className="space-y-1 pl-6">
              {errors.map((err, i) => (
                <li key={i} className="text-xs text-red-600 dark:text-red-400">
                  <code className="font-mono text-red-700 dark:text-red-300">
                    {err.path}
                  </code>{" "}
                  — {err.message}
                </li>
              ))}
            </ul>
          </div>
        )}
        {valid === null && (
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Fix JSON syntax errors first</span>
          </div>
        )}
      </div>
    </div>
  );
}
