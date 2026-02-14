"use client";

import { useState } from "react";
import { Copy, Download, Terminal, Share2, Check } from "lucide-react";

interface ExportPanelProps {
  code: string;
}

export function ExportPanel({ code }: ExportPanelProps) {
  const [copiedState, setCopiedState] = useState<string | null>(null);

  const showCopied = (key: string) => {
    setCopiedState(key);
    setTimeout(() => setCopiedState(null), 2000);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    showCopied("json");
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "agent-policy.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyCurl = async () => {
    const curl = `curl -s https://yoursite.com/.well-known/agent-policy.json | jq .`;
    await navigator.clipboard.writeText(curl);
    showCopied("curl");
  };

  const handleShare = async () => {
    try {
      const encoded = btoa(code);
      const url = `${window.location.origin}/playground?policy=${encoded}`;
      if (url.length > 2000) {
        alert(
          "Policy is too large to share via URL. Consider using a shorter policy or sharing the JSON file directly.",
        );
        return;
      }
      await navigator.clipboard.writeText(url);
      showCopied("share");
    } catch {
      alert("Failed to generate share URL");
    }
  };

  const buttons = [
    {
      key: "json",
      label: "Copy JSON",
      icon: Copy,
      action: handleCopy,
    },
    {
      key: "download",
      label: "Download",
      icon: Download,
      action: handleDownload,
    },
    {
      key: "curl",
      label: "Copy curl",
      icon: Terminal,
      action: handleCopyCurl,
    },
    {
      key: "share",
      label: "Share",
      icon: Share2,
      action: handleShare,
    },
  ];

  return (
    <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
      <div className="px-4 py-3 bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-800">
        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Export
        </span>
      </div>
      <div className="p-3 grid grid-cols-2 gap-2">
        {buttons.map((btn) => (
          <button
            key={btn.key}
            onClick={btn.action}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 px-3 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          >
            {copiedState === btn.key ? (
              <Check className="h-3.5 w-3.5 text-green-600" />
            ) : (
              <btn.icon className="h-3.5 w-3.5" />
            )}
            {copiedState === btn.key ? "Copied!" : btn.label}
          </button>
        ))}
      </div>
    </div>
  );
}
