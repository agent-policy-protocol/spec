import { ImageResponse } from "@vercel/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
const { searchParams } = new URL(request.url);
const title = searchParams.get("title") || "Agent Policy Protocol";
const type = searchParams.get("type") || "default";
const section = searchParams.get("section") || "";
const author = searchParams.get("author") || "";
const date = searchParams.get("date") || "";

// Badge config per type
const badge =
{
blog: { label: "Blog", color: "#059669", bg: "#064e3b" },
docs: { label: "Documentation", color: "#3b82f6", bg: "#1e3a5f" },
playground: { label: "Playground", color: "#f59e0b", bg: "#78350f" },
default: null,
}[type] ?? null;

return new ImageResponse(
<div
style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "space-between",
        width: "100%",
        height: "100%",
        padding: "60px 80px",
        fontFamily: "Inter, system-ui, sans-serif",
        background: `
          radial-gradient(circle at 75% 30%, rgba(168, 85, 247, 0.35), transparent 40%),
          radial-gradient(circle at 40% 50%, rgba(59, 130, 246, 0.35), transparent 50%),
          linear-gradient(135deg, #0b1f3a 0%, #1e3a8a 40%, #4c1d95 100%)
        `,
      }} >
{/_ Top bar — logo + badge _/}
<div
style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          width: "100%",
        }} >
{/_ Shield icon _/}
<div
style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "44px",
            height: "44px",
            borderRadius: "10px",
            backgroundColor: "rgba(59, 130, 246, 0.2)",
            border: "2px solid rgba(147, 197, 253, 0.3)",
          }} >
<svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
</svg>
</div>
<span
style={{
            fontSize: "22px",
            color: "#e2e8f0",
            fontWeight: 600,
          }} >
Agent Policy Protocol
</span>
{badge && (
<span
style={{
              fontSize: "14px",
              color: badge.color,
              fontWeight: 600,
              backgroundColor: badge.bg,
              padding: "4px 14px",
              borderRadius: "9999px",
              marginLeft: "8px",
              border: `1px solid ${badge.color}40`,
            }} >
{badge.label}
</span>
)}
</div>

      {/* Center — section breadcrumb + title */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          maxWidth: "1000px",
        }}
      >
        {/* Section breadcrumb for docs */}
        {type === "docs" && section && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "16px",
              color: "#94a3b8",
            }}
          >
            {section.split(" / ").map((part, i, arr) => (
              <div
                key={i}
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <span
                  style={{
                    color: i === arr.length - 1 ? "#bae6fd" : "#94a3b8",
                  }}
                >
                  {part}
                </span>
                {i < arr.length - 1 && (
                  <span style={{ color: "#64748b" }}>›</span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Author + date for blog */}
        {type === "blog" && (author || date) && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              fontSize: "16px",
              color: "#cbd5e1",
            }}
          >
            {author && (
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#cbd5e1"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="8" r="5" />
                  <path d="M20 21a8 8 0 0 0-16 0" />
                </svg>
                <span>{author}</span>
              </div>
            )}
            {date && (
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#cbd5e1"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                  <line x1="16" x2="16" y1="2" y2="6" />
                  <line x1="8" x2="8" y1="2" y2="6" />
                  <line x1="3" x2="21" y1="10" y2="10" />
                </svg>
                <span>{date}</span>
              </div>
            )}
          </div>
        )}

        <h1
          style={{
            fontSize: title.length > 60 ? "40px" : "52px",
            fontWeight: 700,
            color: "#ffffff",
            lineHeight: 1.2,
            margin: 0,
          }}
        >
          {title}
        </h1>

        {/* Subtitle for playground */}
        {type === "playground" && (
          <p
            style={{
              fontSize: "22px",
              color: "#cbd5e1",
              margin: 0,
              lineHeight: 1.4,
            }}
          >
            Create, validate &amp; export your agent-policy.json
          </p>
        )}
      </div>

      {/* Bottom bar — tagline + domain + author credit */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          <span
            style={{
              fontSize: "16px",
              color: "#94a3b8",
            }}
          >
            The Authorization Layer for the Agentic Web
          </span>
          <span
            style={{
              fontSize: "13px",
              color: "#94a3b8",
            }}
          >
            By Arun Vijayarengan, CEO — Superdom AI
          </span>
        </div>
        <span
          style={{
            fontSize: "16px",
            color: "#94a3b8",
          }}
        >
          agentpolicy.org
        </span>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
    },

);
}
