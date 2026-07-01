export default function ResultsTable({ items, isDark }: any) {
  const sentimentStyle = (s: string) => {
    if (s === "positive") return {
      color: isDark ? "#4ade80" : "#15803d",
      background: isDark ? "rgba(74,222,128,0.08)" : "rgba(187,247,208,0.7)",
      border: `1px solid ${isDark ? "rgba(74,222,128,0.15)" : "rgba(74,222,128,0.3)"}`,
    };
    if (s === "negative") return {
      color: isDark ? "#f87171" : "#dc2626",
      background: isDark ? "rgba(248,113,113,0.08)" : "rgba(254,202,202,0.7)",
      border: `1px solid ${isDark ? "rgba(248,113,113,0.15)" : "rgba(248,113,113,0.3)"}`,
    };
    return {
      color: isDark ? "#94a3b8" : "#475569",
      background: isDark ? "rgba(148,163,184,0.08)" : "rgba(226,232,240,0.7)",
      border: `1px solid ${isDark ? "rgba(148,163,184,0.15)" : "rgba(148,163,184,0.3)"}`,
    };
  };

  const emotionEmoji = (e: string) => {
    const map: any = {
      hopeful: "🌟", angry: "😠", fearful: "😨", sad: "😢",
      excited: "🎉", neutral: "😐", frustrated: "😤",
      skeptical: "🤨", embarrassed: "😳", informative: "📊",
    };
    return map[e] || "😐";
  };

  const sourceStyle = (s: string) => {
    if (s === "news") return {
      color: isDark ? "#93c5fd" : "#1d4ed8",
      background: isDark ? "rgba(30,58,138,0.3)" : "rgba(219,234,254,0.8)",
      border: `1px solid ${isDark ? "rgba(59,130,246,0.2)" : "rgba(59,130,246,0.2)"}`,
    };
    if (s === "gnews") return {
      color: isDark ? "#a78bfa" : "#7c3aed",
      background: isDark ? "rgba(91,33,182,0.25)" : "rgba(237,233,254,0.8)",
      border: `1px solid ${isDark ? "rgba(139,92,246,0.2)" : "rgba(139,92,246,0.2)"}`,
    };
    if (s === "youtube") return {
      color: isDark ? "#f87171" : "#dc2626",
      background: isDark ? "rgba(127,29,29,0.25)" : "rgba(254,226,226,0.8)",
      border: `1px solid ${isDark ? "rgba(239,68,68,0.2)" : "rgba(239,68,68,0.2)"}`,
    };
    return {
      color: isDark ? "#fb923c" : "#c2410c",
      background: isDark ? "rgba(124,45,18,0.3)" : "rgba(254,237,213,0.8)",
      border: `1px solid ${isDark ? "rgba(249,115,22,0.2)" : "rgba(249,115,22,0.2)"}`,
    };
  };

  const sourceLabel = (s: string) => {
    if (s === "news") return "News";
    if (s === "gnews") return "GNews";
    if (s === "youtube") return "YouTube";
    return "HackerNews";
  };

  const scoreColor = (score: number) => {
    if (!score) return isDark ? "#94a3b8" : "#475569";
    if (score >= 0.8) return isDark ? "#4ade80" : "#15803d";
    if (score >= 0.6) return isDark ? "#facc15" : "#a16207";
    return isDark ? "#94a3b8" : "#475569";
  };

  return (
    <div style={{
      background: isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.7)",
      border: `1px solid ${isDark ? "rgba(59,130,246,0.15)" : "rgba(147,197,253,0.4)"}`,
      borderRadius: "18px",
      padding: "24px",
      backdropFilter: "blur(20px)",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <p style={{
          fontSize: "11px", textTransform: "uppercase" as const,
          letterSpacing: "0.06em", fontWeight: 600,
          color: isDark ? "#334155" : "#94a3b8", margin: 0,
        }}>
          Analyzed Items
        </p>
        <span style={{
          background: isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.7)",
          border: `1px solid ${isDark ? "rgba(59,130,246,0.15)" : "rgba(147,197,253,0.4)"}`,
          borderRadius: "999px", padding: "4px 12px",
          fontSize: "12px", color: isDark ? "#475569" : "#94a3b8",
        }}>
          {items.length} results
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {items.map((item: any, index: number) => (
          <div
            key={index}
            style={{
              borderRadius: "14px",
              padding: "16px 18px",
              cursor: item.url ? "pointer" : "default",
              transition: "background 0.2s ease",
              background: isDark ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.6)",
              border: `1px solid ${isDark ? "rgba(59,130,246,0.08)" : "rgba(147,197,253,0.3)"}`,
            }}
            onMouseEnter={e => (e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.85)")}
            onMouseLeave={e => (e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.6)")}
            onClick={() => item.url && window.open(item.url, "_blank")}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>

              <span style={{
                fontSize: "12px", fontFamily: "monospace",
                marginTop: "2px", width: "16px", flexShrink: 0,
                color: isDark ? "#1e3a5f" : "#bfdbfe",
              }}>
                {index + 1}
              </span>

              <div style={{ flex: 1, minWidth: 0 }}>

                {/* Badges */}
                <div style={{ display: "flex", flexWrap: "wrap" as const, alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                  <span style={{
                    fontSize: "11px", padding: "2px 10px",
                    borderRadius: "999px", ...sourceStyle(item.source),
                  }}>
                    {sourceLabel(item.source)}
                  </span>

                  {item.sentiment && (
                    <span className="capitalize" style={{
                      fontSize: "11px", padding: "2px 10px",
                      borderRadius: "999px", fontWeight: 500,
                      ...sentimentStyle(item.sentiment),
                      transition: "all 0.3s ease",
                    }}>
                      {item.sentiment}
                    </span>
                  )}

                  {!item.sentiment && (
                    <span style={{
                      fontSize: "11px", padding: "2px 10px",
                      borderRadius: "999px",
                      background: isDark ? "rgba(255,255,255,0.04)" : "rgba(226,232,240,0.5)",
                      border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(148,163,184,0.2)"}`,
                      color: isDark ? "#334155" : "#cbd5e1",
                      animation: "pulse 1.5s ease-in-out infinite",
                    }}>
                      analyzing...
                    </span>
                  )}

                  {item.emotion && (
                    <span style={{
                      fontSize: "11px",
                      color: isDark ? "#334155" : "#94a3b8",
                      transition: "all 0.3s ease",
                    }}>
                      {emotionEmoji(item.emotion)} {item.emotion}
                    </span>
                  )}
                </div>

                {/* Title */}
                <p style={{
                  fontSize: "14px", fontWeight: 500,
                  lineHeight: 1.5, marginBottom: "6px",
                  color: isDark ? "#cbd5e1" : "#1e293b",
                }}>
                  {item.title}{" "}
                  {item.url && <span style={{ color: isDark ? "#1e3a5f" : "#bfdbfe" }}>↗</span>}
                </p>

                {/* Summary */}
                {item.summary && (
                  <p style={{
                    fontSize: "12px", lineHeight: 1.6,
                    color: isDark ? "#64748b" : "#94a3b8",
                    marginBottom: "8px",
                    transition: "all 0.3s ease",
                  }}>
                    {item.summary}
                  </p>
                )}

                {/* Meta */}
                {item.published_at && (
                  <p style={{ fontSize: "11px", color: isDark ? "#475569" : "#bfdbfe", margin: 0 }}>
                    {new Date(item.published_at).toLocaleDateString("en-IN", {
                      year: "numeric", month: "short", day: "numeric",
                    })}
                    {item.author && ` · ${item.author}`}
                  </p>
                )}
              </div>

              {/* Score */}
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{
                  fontSize: "17px", fontWeight: 700,
                  color: scoreColor(item.score), lineHeight: 1.2,
                  transition: "all 0.3s ease",
                }}>
                  {item.score ? `${(item.score * 100).toFixed(0)}%` : "—"}
                </div>
                <div style={{ fontSize: "10px", color: isDark ? "#1e3a5f" : "#bfdbfe" }}>
                  {item.score ? "confidence" : ""}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}