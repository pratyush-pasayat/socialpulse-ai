"use client";
import { useEffect, useState } from "react";

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const steps = 30;
    const increment = value / steps;
    const interval = 800 / steps;
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) { setDisplay(value); clearInterval(timer); }
      else setDisplay(Math.floor(start));
    }, interval);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{display}</span>;
}

export default function SummaryCards({ summary, topic, total, aiSummary, isDark }: any) {
  const cards = [
    {
      label: "Analyzed", value: total,
      color: isDark ? "#e2e8f0" : "#1e293b",
      bg: isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.8)",
      border: isDark ? "rgba(59,130,246,0.15)" : "rgba(147,197,253,0.5)",
    },
    {
      label: "Positive", value: summary.positive,
      color: isDark ? "#4ade80" : "#15803d",
      bg: isDark ? "rgba(74,222,128,0.06)" : "rgba(187,247,208,0.6)",
      border: isDark ? "rgba(74,222,128,0.2)" : "rgba(74,222,128,0.4)",
    },
    {
      label: "Negative", value: summary.negative,
      color: isDark ? "#f87171" : "#dc2626",
      bg: isDark ? "rgba(248,113,113,0.06)" : "rgba(254,202,202,0.6)",
      border: isDark ? "rgba(248,113,113,0.2)" : "rgba(248,113,113,0.4)",
    },
    {
      label: "Neutral", value: summary.neutral,
      color: isDark ? "#94a3b8" : "#475569",
      bg: isDark ? "rgba(148,163,184,0.06)" : "rgba(226,232,240,0.6)",
      border: isDark ? "rgba(148,163,184,0.2)" : "rgba(148,163,184,0.4)",
    },
  ];

  const sentimentIcon = (s: string) => s === "positive" ? "↑" : s === "negative" ? "↓" : "→";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

      {/* Topic header */}
      <h2 style={{
        fontSize: "22px",
        fontWeight: 600,
        letterSpacing: "-0.02em",
        color: isDark ? "#e2e8f0" : "#1e293b",
        marginBottom: "4px",
      }}>
        Results for{" "}
        <span style={{ color: isDark ? "#60a5fa" : "#1d4ed8" }}>"{topic}"</span>
      </h2>

      {/* Stats grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "12px",
      }}>
        {cards.map((card) => (
          <div
            key={card.label}
            style={{
              background: card.bg,
              border: `1px solid ${card.border}`,
              borderRadius: "14px",
              padding: "20px 12px",
              textAlign: "center",
              backdropFilter: "blur(20px)",
            }}
          >
            <div style={{ fontSize: "32px", fontWeight: 700, color: card.color, lineHeight: 1 }}>
              <AnimatedNumber value={card.value} />
            </div>
            <div style={{
              fontSize: "11px",
              textTransform: "uppercase" as const,
              letterSpacing: "0.06em",
              color: isDark ? "#334155" : "#94a3b8",
              marginTop: "6px",
            }}>
              {card.label}
            </div>
          </div>
        ))}
      </div>

      {/* Badges row */}
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" as const }}>
        <div style={{
          background: isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.7)",
          border: `1px solid ${isDark ? "rgba(59,130,246,0.15)" : "rgba(147,197,253,0.4)"}`,
          borderRadius: "999px",
          padding: "6px 16px",
          fontSize: "13px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          backdropFilter: "blur(20px)",
        }}>
          <span style={{ color: isDark ? "#475569" : "#94a3b8" }}>Sentiment</span>
          <span style={{ fontWeight: 600, color: isDark ? "#60a5fa" : "#1d4ed8" }} className="capitalize">
            {sentimentIcon(summary.dominant_sentiment)} {summary.dominant_sentiment}
          </span>
        </div>
        <div style={{
          background: isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.7)",
          border: `1px solid ${isDark ? "rgba(59,130,246,0.15)" : "rgba(147,197,253,0.4)"}`,
          borderRadius: "999px",
          padding: "6px 16px",
          fontSize: "13px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          backdropFilter: "blur(20px)",
        }}>
          <span style={{ color: isDark ? "#475569" : "#94a3b8" }}>Emotion</span>
          <span style={{ fontWeight: 600, color: isDark ? "#38bdf8" : "#0284c7" }} className="capitalize">
            {summary.dominant_emotion}
          </span>
        </div>
      </div>

      {/* AI Summary */}
      {aiSummary && (
        <div style={{
          background: isDark ? "rgba(30,58,138,0.12)" : "rgba(219,234,254,0.5)",
          border: `1px solid ${isDark ? "rgba(59,130,246,0.2)" : "rgba(59,130,246,0.2)"}`,
          borderRadius: "16px",
          padding: "20px 24px",
          backdropFilter: "blur(20px)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <div style={{
              width: "20px", height: "20px", borderRadius: "50%",
              background: isDark ? "rgba(59,130,246,0.25)" : "rgba(59,130,246,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "10px", color: isDark ? "#60a5fa" : "#1d4ed8",
            }}>✦</div>
            <span style={{
              fontSize: "11px", fontWeight: 600,
              letterSpacing: "0.08em", textTransform: "uppercase" as const,
              color: isDark ? "#60a5fa" : "#1d4ed8",
            }}>AI Analysis</span>
          </div>
          <p style={{
            fontSize: "14px",
            lineHeight: 1.75,
            color: isDark ? "#64748b" : "#475569",
            margin: 0,
          }}>
            {aiSummary}
          </p>
        </div>
      )}
    </div>
  );
}