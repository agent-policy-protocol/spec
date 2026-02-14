"use client";

import { useRef, useEffect } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import { useTheme } from "next-themes";

interface PolicyEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function PolicyEditor({ value, onChange }: PolicyEditorProps) {
  const { resolvedTheme } = useTheme();
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);

  const handleEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    // Load and configure JSON Schema
    fetch("/schema/v1/agent-policy.schema.json")
      .then((res) => res.json())
      .then((schema) => {
        monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
          validate: true,
          schemas: [
            {
              uri: "https://agentpolicy.org/schema/v1/agent-policy.schema.json",
              fileMatch: ["*"],
              schema,
            },
          ],
          enableSchemaRequest: false,
        });
      })
      .catch(console.error);
  };

  useEffect(() => {
    if (editorRef.current) {
      const currentValue = editorRef.current.getValue();
      if (currentValue !== value) {
        editorRef.current.setValue(value);
      }
    }
  }, [value]);

  return (
    <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
        <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
          agent-policy.json
        </span>
        <span className="text-xs text-neutral-400 dark:text-neutral-500">
          JSON + Schema Validation
        </span>
      </div>
      <Editor
        height="500px"
        language="json"
        theme={resolvedTheme === "dark" ? "vs-dark" : "light"}
        value={value}
        onChange={(v) => onChange(v || "")}
        onMount={handleEditorMount}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          wordWrap: "on",
          tabSize: 2,
          formatOnPaste: true,
          automaticLayout: true,
          padding: { top: 12, bottom: 12 },
        }}
      />
    </div>
  );
}
