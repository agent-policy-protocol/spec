"use client";

import { useState } from "react";
import { Copy, Download, Terminal, Share2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

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
    <Card className="py-0 gap-0">
      <CardHeader className="px-4 py-3 border-b">
        <CardTitle className="text-sm">Export</CardTitle>
      </CardHeader>
      <CardContent className="p-3 grid grid-cols-2 gap-2">
        {buttons.map((btn) => (
          <Button
            key={btn.key}
            variant="outline"
            size="sm"
            onClick={btn.action}
            className="gap-1.5 text-xs"
          >
            {copiedState === btn.key ? (
              <Check className="h-3.5 w-3.5 text-green-600" />
            ) : (
              <btn.icon className="h-3.5 w-3.5" />
            )}
            {copiedState === btn.key ? "Copied!" : btn.label}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
