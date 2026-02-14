"use client";

import { useEffect, useState, useRef } from "react";

const LINES = [
  {
    type: "command" as const,
    text: '$ curl -H "Agent-Name: MyBot/1.0" -H "Agent-Intent: read" \\\n    https://example.com/.well-known/agent-policy.json',
    delay: 30,
  },
  {
    type: "response" as const,
    text: `{
  "apopVersion": "1.0",
  "defaultPolicy": {
    "allowedIntents": ["read", "summarize"],
    "rateLimit": { "maxRequests": 100, "windowSeconds": 3600 },
    "cachePolicy": "respect-headers"
  }
}`,
    delay: 0,
  },
  { type: "gap" as const, text: "", delay: 0 },
  {
    type: "command" as const,
    text: '$ curl -H "Agent-Name: MyBot/1.0" -H "Agent-Intent: extract" \\\n    https://example.com/api/data',
    delay: 30,
  },
  {
    type: "response-error" as const,
    text: `HTTP/1.1 430 Agent Action Not Allowed

{
  "error": "intent_not_allowed",
  "message": "Intent 'extract' is not permitted by the site policy.",
  "allowed": ["read", "summarize"]
}`,
    delay: 0,
  },
];

export function TerminalDemo() {
  const [visibleLines, setVisibleLines] = useState<number>(0);
  const [typedText, setTypedText] = useState<string>("");
  const [isTyping, setIsTyping] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const hasStarted = useRef(false);

  useEffect(() => {
    // Respect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      setVisibleLines(LINES.length);
      setTypedText("");
      return;
    }

    if (hasStarted.current) return;
    hasStarted.current = true;

    let currentLine = 0;
    let currentChar = 0;

    const processLine = () => {
      if (currentLine >= LINES.length) {
        // Restart after a delay
        setTimeout(() => {
          setVisibleLines(0);
          setTypedText("");
          currentLine = 0;
          currentChar = 0;
          hasStarted.current = false;
          setTimeout(processLine, 500);
        }, 5000);
        return;
      }

      const line = LINES[currentLine];

      if (line.type === "command" && line.delay > 0) {
        setIsTyping(true);
        const fullText = line.text;

        const typeChar = () => {
          if (currentChar < fullText.length) {
            currentChar++;
            setTypedText(fullText.slice(0, currentChar));
            animationRef.current = window.setTimeout(typeChar, line.delay);
          } else {
            setIsTyping(false);
            setVisibleLines((prev) => prev + 1);
            setTypedText("");
            currentLine++;
            currentChar = 0;
            animationRef.current = window.setTimeout(processLine, 400);
          }
        };

        animationRef.current = window.setTimeout(typeChar, 600);
      } else if (line.type === "gap") {
        setVisibleLines((prev) => prev + 1);
        currentLine++;
        animationRef.current = window.setTimeout(processLine, 800);
      } else {
        // Response lines appear immediately
        setVisibleLines((prev) => prev + 1);
        currentLine++;
        animationRef.current = window.setTimeout(processLine, 1200);
      }
    };

    const timeout = setTimeout(processLine, 1000);

    return () => {
      clearTimeout(timeout);
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, []);

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-950 shadow-2xl overflow-hidden">
        {/* Terminal header */}
        <div className="flex items-center gap-2 px-4 py-3 bg-neutral-900 border-b border-neutral-800">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <span className="ml-2 text-xs text-neutral-500 font-mono">
            terminal — zsh
          </span>
        </div>

        {/* Terminal body */}
        <div
          ref={containerRef}
          className="p-4 font-mono text-xs sm:text-sm leading-relaxed min-h-[280px] max-h-[400px] overflow-y-auto"
        >
          {LINES.slice(0, visibleLines).map((line, i) => (
            <div key={i} className="mb-3">
              {line.type === "command" && (
                <pre className="text-green-400 whitespace-pre-wrap break-all">
                  {line.text}
                </pre>
              )}
              {line.type === "response" && (
                <pre className="text-blue-300 whitespace-pre-wrap break-all">
                  {line.text}
                </pre>
              )}
              {line.type === "response-error" && (
                <pre className="text-red-400 whitespace-pre-wrap break-all">
                  {line.text}
                </pre>
              )}
              {line.type === "gap" && <div className="h-2" />}
            </div>
          ))}

          {/* Currently typing line */}
          {isTyping && typedText && (
            <div className="mb-3">
              <pre className="text-green-400 whitespace-pre-wrap break-all">
                {typedText}
                <span className="animate-pulse">▌</span>
              </pre>
            </div>
          )}

          {/* Idle cursor */}
          {!isTyping &&
            visibleLines < LINES.length &&
            !prefersReducedMotion && (
              <span className="text-green-400 animate-pulse">▌</span>
            )}
        </div>
      </div>
    </div>
  );
}
