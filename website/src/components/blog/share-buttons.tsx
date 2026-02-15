"use client";

import { Twitter, Linkedin, Link as LinkIcon, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ShareButtonsProps {
  title: string;
  url: string;
}

export function ShareButtons({ title, url }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(url);

  const shareLinks = [
    {
      name: "X / Twitter",
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      name: "Hacker News",
      icon: null,
      href: `https://news.ycombinator.com/submitlink?u=${encodedUrl}&t=${encodedTitle}`,
    },
  ];

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground mr-1">Share:</span>
      {shareLinks.map((link) => (
        <Button key={link.name} variant="outline" size="icon" asChild>
          <a
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            title={`Share on ${link.name}`}
          >
            {link.icon ? (
              <link.icon className="h-4 w-4" />
            ) : (
              <span className="text-xs font-bold leading-none">Y</span>
            )}
          </a>
        </Button>
      ))}
      <Button
        variant="outline"
        size="icon"
        onClick={handleCopy}
        title="Copy link"
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-600" />
        ) : (
          <LinkIcon className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
