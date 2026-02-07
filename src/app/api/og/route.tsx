import { ImageResponse } from "next/og";

export const runtime = "edge";

// Cache OG images for 24 hours at the CDN level
export const revalidate = 86400;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") || "ClawdBot";
  const kind = searchParams.get("kind") || "tool";

  const kindColors: Record<string, string> = {
    agent: "#D97757",
    skill: "#4E82EE",
    mcp: "#10A37F",
    command: "#9333EA",
  };

  const kindLabels: Record<string, string> = {
    agent: "AI AGENT",
    skill: "SKILL",
    mcp: "MCP SERVER",
    command: "COMMAND",
  };

  const color = kindColors[kind] || "#00F0FF";
  const label = kindLabels[kind] || kind.toUpperCase();

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0A0A0B",
          backgroundImage:
            "radial-gradient(circle at 25% 25%, #00F0FF10 0%, transparent 50%), radial-gradient(circle at 75% 75%, #7000FF10 0%, transparent 50%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Kind badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              width: "16px",
              height: "16px",
              borderRadius: "50%",
              backgroundColor: color,
              boxShadow: `0 0 20px ${color}80`,
            }}
          />
          <span
            style={{
              color: "#888",
              fontSize: "28px",
              fontWeight: "600",
              letterSpacing: "2px",
            }}
          >
            {label}
          </span>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: "80px",
            fontWeight: "bold",
            color: "white",
            textAlign: "center",
            maxWidth: "1000px",
            lineHeight: 1.1,
            letterSpacing: "-2px",
          }}
        >
          {title}
        </div>

        {/* Subtitle */}
        <div
          style={{
            marginTop: "40px",
            fontSize: "32px",
            color: "#666",
          }}
        >
          Universal AI Workflow Marketplace
        </div>

        {/* Logo */}
        <div
          style={{
            marginTop: "60px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "24px",
              height: "24px",
              borderRadius: "6px",
              background: "linear-gradient(135deg, #00F0FF 0%, #7000FF 100%)",
            }}
          />
          <span
            style={{
              color: "#00F0FF",
              fontSize: "36px",
              fontWeight: "bold",
            }}
          >
            ClawdBot
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
