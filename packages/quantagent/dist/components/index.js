// components/QuantAgentWidget.tsx
import { useState, useCallback } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
function QuantAgentWidget({
  token,
  timeframe = "4h",
  apiEndpoint = "/api/quantagent",
  onDecision,
  theme = "dark",
  compact = false
}) {
  const [loading, setLoading] = useState(false);
  const [decision, setDecision] = useState(null);
  const [error, setError] = useState(null);
  const analyze = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, timeframe })
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
    muted: theme === "dark" ? "#2a2a3e" : "#f5f5f5"
  };
  const getActionColor = (action) => {
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
  if (compact) {
    return /* @__PURE__ */ jsx(
      "div",
      {
        style: {
          background: colors.bg,
          border: `1px solid ${colors.border}`,
          borderRadius: "8px",
          padding: "12px",
          fontFamily: "system-ui, -apple-system, sans-serif"
        },
        children: /* @__PURE__ */ jsxs(
          "div",
          {
            style: {
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            },
            children: [
              /* @__PURE__ */ jsx("span", { style: { color: colors.text, fontWeight: 600 }, children: token.symbol }),
              decision ? /* @__PURE__ */ jsx(
                "span",
                {
                  style: {
                    background: getActionColor(decision.action),
                    color: "white",
                    padding: "4px 12px",
                    borderRadius: "4px",
                    fontWeight: 600,
                    fontSize: "12px"
                  },
                  children: decision.action
                }
              ) : /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: analyze,
                  disabled: loading,
                  style: {
                    background: "#7c3aed",
                    color: "white",
                    border: "none",
                    padding: "4px 12px",
                    borderRadius: "4px",
                    cursor: loading ? "not-allowed" : "pointer",
                    fontSize: "12px",
                    opacity: loading ? 0.7 : 1
                  },
                  children: loading ? "..." : "Analyze"
                }
              )
            ]
          }
        )
      }
    );
  }
  return /* @__PURE__ */ jsxs(
    "div",
    {
      style: {
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        borderRadius: "12px",
        overflow: "hidden",
        fontFamily: "system-ui, -apple-system, sans-serif",
        maxWidth: "400px"
      },
      children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            style: {
              background: "linear-gradient(135deg, #7c3aed, #a855f7)",
              padding: "16px",
              color: "white"
            },
            children: /* @__PURE__ */ jsxs(
              "div",
              {
                style: {
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                },
                children: [
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("div", { style: { fontSize: "18px", fontWeight: 600 }, children: token.symbol }),
                    /* @__PURE__ */ jsxs("div", { style: { fontSize: "12px", opacity: 0.8 }, children: [
                      timeframe,
                      " Analysis"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsx("div", { style: { fontSize: "24px" }, children: "\u{1F4CA}" })
                ]
              }
            )
          }
        ),
        /* @__PURE__ */ jsxs("div", { style: { padding: "16px" }, children: [
          error && /* @__PURE__ */ jsx(
            "div",
            {
              style: {
                background: "#fef2f2",
                border: "1px solid #ef4444",
                borderRadius: "8px",
                padding: "12px",
                color: "#ef4444",
                marginBottom: "16px",
                fontSize: "14px"
              },
              children: error
            }
          ),
          !decision && !loading && /* @__PURE__ */ jsx(
            "button",
            {
              onClick: analyze,
              style: {
                width: "100%",
                background: "#7c3aed",
                color: "white",
                border: "none",
                padding: "12px",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: 600,
                cursor: "pointer"
              },
              children: "Run Analysis"
            }
          ),
          loading && /* @__PURE__ */ jsxs(
            "div",
            {
              style: {
                textAlign: "center",
                padding: "20px",
                color: colors.text
              },
              children: [
                /* @__PURE__ */ jsx("div", { style: { fontSize: "24px", marginBottom: "8px" }, children: "\u23F3" }),
                /* @__PURE__ */ jsx("div", { children: "Analyzing with 4 AI agents..." })
              ]
            }
          ),
          decision && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsxs(
              "div",
              {
                style: {
                  background: getActionColor(decision.action),
                  color: "white",
                  padding: "16px",
                  borderRadius: "8px",
                  textAlign: "center",
                  marginBottom: "16px"
                },
                children: [
                  /* @__PURE__ */ jsx("div", { style: { fontSize: "24px", fontWeight: 700 }, children: decision.action }),
                  /* @__PURE__ */ jsxs("div", { style: { fontSize: "14px", opacity: 0.9 }, children: [
                    decision.confidence,
                    "% Confidence"
                  ] })
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              "div",
              {
                style: {
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "8px",
                  marginBottom: "16px"
                },
                children: [
                  /* @__PURE__ */ jsxs("div", { style: { textAlign: "center" }, children: [
                    /* @__PURE__ */ jsx("div", { style: { fontSize: "11px", color: "#6b7280" }, children: "Entry" }),
                    /* @__PURE__ */ jsxs("div", { style: { color: colors.text, fontWeight: 600 }, children: [
                      "$",
                      decision.entryPrice.toFixed(4)
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { style: { textAlign: "center" }, children: [
                    /* @__PURE__ */ jsx("div", { style: { fontSize: "11px", color: "#6b7280" }, children: "Stop Loss" }),
                    /* @__PURE__ */ jsxs("div", { style: { color: "#ef4444", fontWeight: 600 }, children: [
                      "$",
                      decision.stopLoss.toFixed(4)
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { style: { textAlign: "center" }, children: [
                    /* @__PURE__ */ jsx("div", { style: { fontSize: "11px", color: "#6b7280" }, children: "Take Profit" }),
                    /* @__PURE__ */ jsxs("div", { style: { color: "#10b981", fontWeight: 600 }, children: [
                      "$",
                      decision.takeProfit.toFixed(4)
                    ] })
                  ] })
                ]
              }
            ),
            /* @__PURE__ */ jsx(
              "div",
              {
                style: {
                  background: colors.muted,
                  padding: "12px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  color: colors.text,
                  lineHeight: 1.5
                },
                children: decision.rationale
              }
            ),
            /* @__PURE__ */ jsxs(
              "div",
              {
                style: {
                  marginTop: "12px",
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "12px",
                  color: "#6b7280"
                },
                children: [
                  /* @__PURE__ */ jsxs("span", { children: [
                    "Risk Score: ",
                    decision.risk.riskScore,
                    "/100"
                  ] }),
                  /* @__PURE__ */ jsxs("span", { children: [
                    "R/R: ",
                    decision.risk.rewardRatio.toFixed(2)
                  ] })
                ]
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: analyze,
                disabled: loading,
                style: {
                  width: "100%",
                  marginTop: "16px",
                  background: "transparent",
                  border: `1px solid ${colors.border}`,
                  color: colors.text,
                  padding: "8px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px"
                },
                children: "Refresh Analysis"
              }
            )
          ] })
        ] })
      ]
    }
  );
}
export {
  QuantAgentWidget
};
