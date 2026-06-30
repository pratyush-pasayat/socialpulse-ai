export default function Keywords({ keywords, onKeywordClick, isDark }: { keywords: string[], onKeywordClick: (k: string) => void, isDark: boolean }) {
  if (!keywords || keywords.length === 0) return null;

  return (
    <div style={{
      background: isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.7)",
      border: `1px solid ${isDark ? "rgba(59,130,246,0.15)" : "rgba(147,197,253,0.4)"}`,
      borderRadius: "18px",
      padding: "24px",
      backdropFilter: "blur(20px)",
    }}>
      <p style={{
        fontSize: "11px", textTransform: "uppercase" as const,
        letterSpacing: "0.06em", fontWeight: 600,
        color: isDark ? "#334155" : "#94a3b8",
        marginBottom: "16px",
      }}>
        Trending Themes
      </p>
      <div style={{ display: "flex", flexWrap: "wrap" as const, gap: "10px" }}>
        {keywords.map((keyword, index) => (
          <button
            key={index}
            onClick={() => onKeywordClick(keyword)}
            style={{
              padding: "8px 18px",
              borderRadius: "999px",
              fontSize: "13px",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.2s ease",
              background: isDark ? "rgba(30,58,138,0.2)" : "rgba(219,234,254,0.7)",
              border: `1px solid ${isDark ? "rgba(59,130,246,0.2)" : "rgba(59,130,246,0.2)"}`,
              color: isDark ? "#93c5fd" : "#1d4ed8",
            }}
            onMouseEnter={e => {
              (e.target as HTMLElement).style.background = isDark ? "rgba(30,58,138,0.4)" : "rgba(191,219,254,0.9)";
              (e.target as HTMLElement).style.transform = "scale(1.05)";
            }}
            onMouseLeave={e => {
              (e.target as HTMLElement).style.background = isDark ? "rgba(30,58,138,0.2)" : "rgba(219,234,254,0.7)";
              (e.target as HTMLElement).style.transform = "scale(1)";
            }}
          >
            {keyword}
          </button>
        ))}
      </div>
      <p style={{
        fontSize: "12px", marginTop: "16px", marginBottom: 0,
        color: isDark ? "#1e3a5f" : "#bfdbfe",
      }}>
        Click any theme to analyze it
      </p>
    </div>
  );
}