import { ImageResponse } from "@vercel/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") || "Agent Policy Protocol";
  const type = searchParams.get("type") || "default";

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
        backgroundColor: "#0f172a",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "40px",
            height: "40px",
            borderRadius: "8px",
            backgroundColor: "#1e40af",
          }}
        >
          <svg
            width="24"
            height="24"
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
            fontSize: "20px",
            color: "#94a3b8",
            fontWeight: 600,
          }}
        >
          Agent Policy Protocol
        </span>
        {type === "blog" && (
          <span
            style={{
              fontSize: "14px",
              color: "#059669",
              fontWeight: 600,
              backgroundColor: "#064e3b",
              padding: "4px 12px",
              borderRadius: "9999px",
              marginLeft: "8px",
            }}
          >
            Blog
          </span>
        )}
        {type === "docs" && (
          <span
            style={{
              fontSize: "14px",
              color: "#3b82f6",
              fontWeight: 600,
              backgroundColor: "#1e3a5f",
              padding: "4px 12px",
              borderRadius: "9999px",
              marginLeft: "8px",
            }}
          >
            Documentation
          </span>
        )}
      </div>

      {/* Title */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          maxWidth: "900px",
        }}
      >
        <h1
          style={{
            fontSize: title.length > 60 ? "40px" : "52px",
            fontWeight: 700,
            color: "#f1f5f9",
            lineHeight: 1.2,
            margin: 0,
          }}
        >
          {title}
        </h1>
      </div>

      {/* Bottom bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <span
          style={{
            fontSize: "16px",
            color: "#64748b",
          }}
        >
          The Authorization Layer for the Agentic Web
        </span>
        <span
          style={{
            fontSize: "16px",
            color: "#64748b",
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
