"use client";

import { useState } from "react";

const protocols = [
  {
    id: "webmcp",
    name: "WebMCP",
    author: "Google/Microsoft",
    purpose: "Browser-native tool contracts for web agents",
    relation: "APoP authorizes which WebMCP tools an agent can invoke",
    row: 0,
    color:
      "border-violet-300 dark:border-violet-700 bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-300",
  },
  {
    id: "mcp",
    name: "MCP",
    author: "Anthropic",
    purpose: "Server-side tool and data integration for LLMs",
    relation:
      "APoP provides website-level policies MCP servers check before serving data",
    row: 0,
    color:
      "border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-orange-300",
  },
  {
    id: "a2a",
    name: "A2A",
    author: "Google",
    purpose: "Agent-to-agent communication protocol",
    relation:
      "APoP ensures agents have resource-owner authorization before A2A data sharing",
    row: 0,
    color:
      "border-sky-300 dark:border-sky-700 bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300",
  },
  {
    id: "ap",
    name: "AP",
    author: "Community",
    purpose: "Agent discovery via standard profiles",
    relation: "APoP validates agent identity claims from Agent Profiles",
    row: 0,
    color:
      "border-teal-300 dark:border-teal-700 bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300",
  },
  {
    id: "ucp",
    name: "UCP",
    author: "Community",
    purpose: "Universal commerce protocol",
    relation: "APoP gates access before commerce transactions begin",
    row: 2,
    color:
      "border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300",
  },
  {
    id: "ap2",
    name: "AP2",
    author: "Community",
    purpose: "Agent payment flows and billing",
    relation: "APoP sets access control rules before payment is negotiated",
    row: 2,
    color:
      "border-pink-300 dark:border-pink-700 bg-pink-50 dark:bg-pink-950 text-pink-700 dark:text-pink-300",
  },
  {
    id: "apaai",
    name: "APAAI",
    author: "Community",
    purpose: "Post-hoc action auditing and compliance",
    relation:
      "APoP provides preventive control; APAAI provides reactive auditing",
    row: 2,
    color:
      "border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300",
  },
];

export function EcosystemDiagram() {
  const [hoveredProtocol, setHoveredProtocol] = useState<string | null>(null);
  const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 0 });
  const hoveredInfo = protocols.find((p) => p.id === hoveredProtocol);

  const topRow = protocols.filter((p) => p.row === 0);
  const bottomRow = protocols.filter((p) => p.row === 2);

  const handleMouseEnter = (
    protocol: (typeof protocols)[0],
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    setHoveredProtocol(protocol.id);
    const rect = event.currentTarget.getBoundingClientRect();
    setPopoverPosition({
      x: rect.left + rect.width / 2,
      y: rect.bottom + 10,
    });
  };

  const handleFocus = (
    protocol: (typeof protocols)[0],
    event: React.FocusEvent<HTMLButtonElement>,
  ) => {
    setHoveredProtocol(protocol.id);
    const rect = event.currentTarget.getBoundingClientRect();
    setPopoverPosition({
      x: rect.left + rect.width / 2,
      y: rect.bottom + 10,
    });
  };

  return (
    <div className="w-full max-w-3xl mx-auto mb-12">
      <div className="relative flex flex-col items-center gap-4">
        {/* Top row protocols */}
        <div className="flex flex-wrap justify-center gap-3">
          {topRow.map((protocol) => (
            <button
              key={protocol.id}
              onMouseEnter={(e) => handleMouseEnter(protocol, e)}
              onMouseLeave={() => setHoveredProtocol(null)}
              onFocus={(e) => handleFocus(protocol, e)}
              onBlur={() => setHoveredProtocol(null)}
              className={`rounded-lg border-2 px-4 py-2 text-sm font-semibold transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary ${protocol.color}`}
              aria-label={`${protocol.name}: ${protocol.purpose}`}
            >
              {protocol.name}
            </button>
          ))}
        </div>

        {/* Connection lines (down arrows) */}
        <div className="flex justify-center gap-6 text-neutral-400 dark:text-neutral-600">
          <span>↘</span>
          <span>↓</span>
          <span>↓</span>
          <span>↙</span>
        </div>

        {/* APoP center */}
        <div className="relative">
          <div className="rounded-xl border-2 border-blue-500 dark:border-blue-400 bg-blue-600 dark:bg-blue-700 px-8 py-4 text-center shadow-lg shadow-blue-500/20">
            <div className="text-xl font-bold text-white">APoP</div>
            <div className="text-xs text-blue-100 mt-1">
              Authorization Layer
            </div>
          </div>
        </div>

        {/* Connection lines (down arrows) */}
        <div className="flex justify-center gap-8 text-neutral-400 dark:text-neutral-600">
          <span>↙</span>
          <span>↓</span>
          <span>↘</span>
        </div>

        {/* Bottom row protocols */}
        <div className="flex flex-wrap justify-center gap-3">
          {bottomRow.map((protocol) => (
            <button
              key={protocol.id}
              onMouseEnter={(e) => handleMouseEnter(protocol, e)}
              onMouseLeave={() => setHoveredProtocol(null)}
              onFocus={(e) => handleFocus(protocol, e)}
              onBlur={() => setHoveredProtocol(null)}
              className={`rounded-lg border-2 px-4 py-2 text-sm font-semibold transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary ${protocol.color}`}
              aria-label={`${protocol.name}: ${protocol.purpose}`}
            >
              {protocol.name}
            </button>
          ))}
        </div>

        {/* Floating popover - appears on hover without affecting layout */}
        {hoveredInfo && (
          <div
            className="fixed z-50 w-95 rounded-lg border border-border bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-200"
            style={{
              left: `${popoverPosition.x}px`,
              top: `${popoverPosition.y}px`,
              transform: "translateX(-50%)",
            }}
            role="tooltip"
          >
            <div className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="font-bold text-lg text-foreground">
                  {hoveredInfo.name}
                </span>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                  by {hoveredInfo.author}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                {hoveredInfo.purpose}
              </p>
              <div className="flex items-start gap-2 border-l-2 border-primary pl-3">
                <span className="text-primary mt-0.5" aria-hidden="true">
                  ↗
                </span>
                <p className="text-sm text-foreground font-medium leading-relaxed">
                  {hoveredInfo.relation}
                </p>
              </div>
            </div>
            {/* Arrow pointing to button */}
            <div
              className="absolute w-3 h-3 bg-card border-l border-t border-border rotate-45"
              style={{
                left: "50%",
                top: "-6px",
                transform: "translateX(-50%)",
              }}
            />
          </div>
        )}
      </div>

      {/* Hint text */}
      <p className="mt-6 text-sm text-muted-foreground text-center">
        Hover over a protocol to see how APoP integrates with it
      </p>
    </div>
  );
}
