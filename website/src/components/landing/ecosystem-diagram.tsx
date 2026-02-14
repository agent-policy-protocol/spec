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
  const hoveredInfo = protocols.find((p) => p.id === hoveredProtocol);

  const topRow = protocols.filter((p) => p.row === 0);
  const bottomRow = protocols.filter((p) => p.row === 2);

  return (
    <div className="w-full max-w-3xl mx-auto mb-12">
      <div className="relative flex flex-col items-center gap-4">
        {/* Top row protocols */}
        <div className="flex flex-wrap justify-center gap-3">
          {topRow.map((protocol) => (
            <button
              key={protocol.id}
              onMouseEnter={() => setHoveredProtocol(protocol.id)}
              onMouseLeave={() => setHoveredProtocol(null)}
              onFocus={() => setHoveredProtocol(protocol.id)}
              onBlur={() => setHoveredProtocol(null)}
              className={`rounded-lg border-2 px-4 py-2 text-sm font-semibold transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 ${protocol.color}`}
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
              onMouseEnter={() => setHoveredProtocol(protocol.id)}
              onMouseLeave={() => setHoveredProtocol(null)}
              onFocus={() => setHoveredProtocol(protocol.id)}
              onBlur={() => setHoveredProtocol(null)}
              className={`rounded-lg border-2 px-4 py-2 text-sm font-semibold transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 ${protocol.color}`}
              aria-label={`${protocol.name}: ${protocol.purpose}`}
            >
              {protocol.name}
            </button>
          ))}
        </div>

        {/* Tooltip */}
        {hoveredInfo && (
          <div className="mt-4 w-full max-w-md rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4 shadow-lg transition-all">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-bold text-neutral-900 dark:text-white">
                {hoveredInfo.name}
              </span>
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                by {hoveredInfo.author}
              </span>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-1">
              {hoveredInfo.purpose}
            </p>
            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
              ↗ {hoveredInfo.relation}
            </p>
          </div>
        )}

        {!hoveredInfo && (
          <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400 text-center">
            Hover over a protocol to see how APoP integrates with it
          </p>
        )}
      </div>
    </div>
  );
}
