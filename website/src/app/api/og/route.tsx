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

  const badge =
    {
      blog: { label: "Blog", color: "#10b981" },
      docs: { label: "Documentation", color: "#3b82f6" },
      playground: { label: "Playground", color: "#f59e0b" },
      default: null,
    }[type] ?? null;

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
        height: "100%",
        padding: "60px 80px",
        fontFamily: "Inter, system-ui, sans-serif",
        background: `
          radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.08), transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.06), transparent 50%),
          linear-gradient(135deg, #0f172a 0%, #1e293b 100%)
        `,
      }}
    >
      {/* Top Bar */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "10px",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid rgba(59, 130, 246, 0.2)",
          }}
        >
          🛡️
        </div>

        <span
          style={{
            fontSize: "20px",
            color: "#e2e8f0",
            fontWeight: 600,
          }}
        >
          Agent Policy Protocol
        </span>

        {badge && (
          <span
            style={{
              fontSize: "14px",
              color: badge.color,
              fontWeight: 600,
              padding: "4px 12px",
              borderRadius: "999px",
              border: `1px solid ${badge.color}40`,
              marginLeft: "8px",
            }}
          >
            {badge.label}
          </span>
        )}
      </div>

      {/* Middle Section */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          maxWidth: "920px",
        }}
      >
        {/* Section breadcrumb for docs */}
        {type === "docs" && section && (
          <div
            style={{
              display: "flex",
              gap: "8px",
              fontSize: "16px",
              color: "#94a3b8",
              marginBottom: "16px",
            }}
          >
            {section}
          </div>
        )}

        {/* Author + date for blog */}
        {type === "blog" && (author || date) && (
          <div
            style={{
              display: "flex",
              gap: "16px",
              fontSize: "16px",
              color: "#cbd5e1",
              marginBottom: "16px",
            }}
          >
            {author && <span>{author}</span>}
            {date && <span>{date}</span>}
          </div>
        )}

        <h1
          style={{
            fontSize: title.length > 60 ? "42px" : "56px",
            fontWeight: 700,
            color: "#ffffff",
            lineHeight: 1.1,
            margin: 0,
            letterSpacing: "-1px",
          }}
        >
          {title}
        </h1>

        {type === "playground" && (
          <p
            style={{
              marginTop: "20px",
              fontSize: "22px",
              color: "#cbd5e1",
            }}
          >
            Create, validate & export your agent-policy.json
          </p>
        )}
      </div>

      {/* Bottom Bar */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <span style={{ fontSize: "16px", color: "#94a3b8" }}>
            The Authorization Layer for the Agentic Web
          </span>
          <span style={{ fontSize: "13px", color: "#94a3b8" }}>
            By Arun Vijayarengan · Superdom AI
          </span>
        </div>

        <span style={{ fontSize: "16px", color: "#94a3b8" }}>
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
