/**
 * QuantAgent Widget - Embeddable React component for trading signals
 */

import React, { useState, useCallback } from "react";
import type { TradeDecision, TokenInfo } from "../src/agents/types.js";

export interface QuantAgentWidgetProps {
  token: TokenInfo;
  timeframe?: "1h" | "4h" | "1d";
  apiEndpoint?: string;
  onDecision?: (decision: TradeDecision) => void;
  theme?: "dark" | "light";
  compact?: boolean;
}

export function QuantAgentWidget({
  token,
  timeframe = "4h",
  apiEndpoint = "/api/quantagent",
  onDecision,
  theme = "dark",
  compact = false,
}: QuantAgentWidgetProps) {
  const [loading, setLoading] = useState(false);
  const [decision, setDecision] = useState<TradeDecision | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, timeframe }),
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`);
      }

      const result = await response.json();
      setDecision(result);
      onDecision?.(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [token, timeframe, apiEndpoint, onDecision]);

  const colors = {
    bg: theme === "dark" ? "#1a1a2e" : "#ffffff",
    text: theme === "dark" ? "#e0e0e0" : "#1a1a2e",
    border: theme === "dark" ? "#3a3a4e" : "#e0e0e0",
    muted: theme === "dark" ? "#2a2a3e" : "#f5f5f5",
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "LONG":
        return "#10b981";
      case "SHORT":
        return "#ef4444";
      case "EXIT":
        return "#f59e0b";
      default:
        return "#6b7280";
    }
  };

  // Compact view
  if (compact) {
    return (
      <div
        style={{
          background: colors.bg,
          border: `1px solid ${colors.border}`,
          borderRadius: "8px",
          padding: "12px",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ color: colors.text, fontWeight: 600 }}>
            {token.symbol}
          </span>
          {decision ? (
            <span
              style={{
                background: getActionColor(decision.action),
                color: "white",
                padding: "4px 12px",
                borderRadius: "4px",
                fontWeight: 600,
                fontSize: "12px",
              }}
            >
              {decision.action}
            </span>
          ) : (
            <button
              onClick={analyze}
              disabled={loading}
              style={{
                background: "#7c3aed",
                color: "white",
                border: "none",
                padding: "4px 12px",
                borderRadius: "4px",
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: "12px",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "..." : "Analyze"}
            </button>
          )}
        </div>
      </div>
    );
  }

  // Full view
  return (
    <div
      style={{
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        borderRadius: "12px",
        overflow: "hidden",
        fontFamily: "system-ui, -apple-system, sans-serif",
        maxWidth: "400px",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #7c3aed, #a855f7)",
          padding: "16px",
          color: "white",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ fontSize: "18px", fontWeight: 600 }}>
              {token.symbol}
            </div>
            <div style={{ fontSize: "12px", opacity: 0.8 }}>
              {timeframe} Analysis
            </div>
          </div>
          <div style={{ fontSize: "24px" }}>📊</div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "16px" }}>
        {error && (
          <div
            style={{
              background: "#fef2f2",
              border: "1px solid #ef4444",
              borderRadius: "8px",
              padding: "12px",
              color: "#ef4444",
              marginBottom: "16px",
              fontSize: "14px",
            }}
          >
            {error}
          </div>
        )}

        {!decision && !loading && (
          <button
            onClick={analyze}
            style={{
              width: "100%",
              background: "#7c3aed",
              color: "white",
              border: "none",
              padding: "12px",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Run Analysis
          </button>
        )}

        {loading && (
          <div
            style={{
              textAlign: "center",
              padding: "20px",
              color: colors.text,
            }}
          >
            <div style={{ fontSize: "24px", marginBottom: "8px" }}>⏳</div>
            <div>Analyzing with 4 AI agents...</div>
          </div>
        )}

        {decision && (
          <>
            {/* Decision */}
            <div
              style={{
                background: getActionColor(decision.action),
                color: "white",
                padding: "16px",
                borderRadius: "8px",
                textAlign: "center",
                marginBottom: "16px",
              }}
            >
              <div style={{ fontSize: "24px", fontWeight: 700 }}>
                {decision.action}
              </div>
              <div style={{ fontSize: "14px", opacity: 0.9 }}>
                {decision.confidence}% Confidence
              </div>
            </div>

            {/* Levels */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "8px",
                marginBottom: "16px",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "11px", color: "#6b7280" }}>
                  Entry
                </div>
                <div style={{ color: colors.text, fontWeight: 600 }}>
                  ${decision.entryPrice.toFixed(4)}
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "11px", color: "#6b7280" }}>
                  Stop Loss
                </div>
                <div style={{ color: "#ef4444", fontWeight: 600 }}>
                  ${decision.stopLoss.toFixed(4)}
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "11px", color: "#6b7280" }}>
                  Take Profit
                </div>
                <div style={{ color: "#10b981", fontWeight: 600 }}>
                  ${decision.takeProfit.toFixed(4)}
                </div>
              </div>
            </div>

            {/* Rationale */}
            <div
              style={{
                background: colors.muted,
                padding: "12px",
                borderRadius: "8px",
                fontSize: "13px",
                color: colors.text,
                lineHeight: 1.5,
              }}
            >
              {decision.rationale}
            </div>

            {/* Risk Score */}
            <div
              style={{
                marginTop: "12px",
                display: "flex",
                justifyContent: "space-between",
                fontSize: "12px",
                color: "#6b7280",
              }}
            >
              <span>Risk Score: {decision.risk.riskScore}/100</span>
              <span>R/R: {decision.risk.rewardRatio.toFixed(2)}</span>
            </div>

            {/* Refresh button */}
            <button
              onClick={analyze}
              disabled={loading}
              style={{
                width: "100%",
                marginTop: "16px",
                background: "transparent",
                border: `1px solid ${colors.border}`,
                color: colors.text,
                padding: "8px",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              Refresh Analysis
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default QuantAgentWidget;
