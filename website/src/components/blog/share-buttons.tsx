"use client";

import { Twitter, Linkedin, Link as LinkIcon, Check } from "lucide-react";
import { useState } from "react";

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
      icon: () => <span className="text-xs font-bold leading-none">HN</span>,
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
      <span className="text-sm text-neutral-500 dark:text-neutral-400 mr-1">
        Share:
      </span>
      {shareLinks.map((link) => (
        <a
          key={link.name}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          title={`Share on ${link.name}`}
          className="inline-flex items-center justify-center rounded-lg border border-neutral-200 dark:border-neutral-700 p-2 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800 transition-colors"
        >
          {typeof link.icon === "function" &&
          link.icon.length === 0 &&
          link.name === "Hacker News" ? (
            <span className="text-xs font-bold leading-none w-4 h-4 flex items-center justify-center">
              Y
            </span>
          ) : (
            <link.icon className="h-4 w-4" />
          )}
        </a>
      ))}
      <button
        onClick={handleCopy}
        title="Copy link"
        className="inline-flex items-center justify-center rounded-lg border border-neutral-200 dark:border-neutral-700 p-2 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800 transition-colors"
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-600" />
        ) : (
          <LinkIcon className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}
