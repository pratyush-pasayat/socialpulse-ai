"use client";
import { useEffect, useState } from "react";

interface SearchSidebarProps {
  isDark: boolean;
  apiBase: string;
  onTopicClick: (topic: string) => void;
}

interface HistoryItem {
  id: string;
  topic: string;
  dominant_sentiment: string;
  total: number;
}

function timeAgo(iso: string | null): string {
  if (!iso) return "";
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const SOURCES = [
  { key: "news", label: "News" },
  { key: "gnews", label: "GNews" },
  { key: "hackernews", label: "HackerNews" },
  { key: "youtube", label: "YouTube" },
];

export default function SearchSidebar({ isDark, apiBase, onTopicClick }: SearchSidebarProps) {
  const [trending, setTrending] = useState<string[]>([]);
  const [trendingUpdated, setTrendingUpdated] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);

  const [trendingError, setTrendingError] = useState(false);

  useEffect(() => {
    // Show cached data INSTANTLY (no wait, no skeleton) if we have it from
    // earlier this session, then quietly re-fetch in the background to
    // keep it current — this avoids a visible reload every time the
    // sidebar remounts (e.g. navigating), which is what was making it
    // feel slow even though the actual fetch itself is quick.
    try {
      const cachedTrending = sessionStorage.getItem("sp_trending");
      if (cachedTrending) {
        const parsed = JSON.parse(cachedTrending);
        setTrending(parsed.topics || []);
        setTrendingUpdated(parsed.updated_at || null);
      }
      const cachedHistory = sessionStorage.getItem("sp_history");
      if (cachedHistory) {
        setHistory(JSON.parse(cachedHistory));
      }
    } catch {
      // sessionStorage unavailable or corrupted — safe to ignore, falls
      // through to the normal fetch below
    }

    fetch(`${apiBase}/trending`)
      .then((res) => {
        if (!res.ok) throw new Error(`Trending endpoint returned ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setTrending(data.topics || []);
        setTrendingUpdated(data.updated_at || null);
        try {
          sessionStorage.setItem("sp_trending", JSON.stringify(data));
        } catch {}
      })
      .catch((err) => {
        console.error("Failed to load trending topics:", err);
        setTrendingError(true);
      });

    fetch(`${apiBase}/history?limit=8`)
      .then((res) => {
        if (!res.ok) throw new Error(`History endpoint returned ${res.status}`);
        return res.json();
      })
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setHistory(list);
        try {
          sessionStorage.setItem("sp_history", JSON.stringify(list));
        } catch {}
      })
      .catch((err) => console.error("Failed to load recent searches:", err));
  }, [apiBase]);

  const sentimentColor = (s: string) => {
    if (s === "positive") return isDark ? "#4ade80" : "#15803d";
    if (s === "negative") return isDark ? "#f87171" : "#dc2626";
    return isDark ? "#94a3b8" : "#475569";
  };

  const handleClick = (topic: string) => {
    onTopicClick(topic);
    setMobileOpen(false);
  };

  const sectionLabelStyle: React.CSSProperties = {
    fontSize: "13px",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    fontWeight: 600,
    color: isDark ? "#334155" : "#94a3b8",
    marginBottom: "10px",
  };

  const sidebarContent = (
    <div style={{ display: "flex", flexDirection: "column", gap: "36px", padding: "28px 22px" }}>
      {/* ── TRENDING NOW ── */}
      <div>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "10px" }}>
          <p style={{ ...sectionLabelStyle, marginBottom: 0 }}>Trending Now</p>
          {trendingUpdated && (
            <span style={{ fontSize: "10px", color: isDark ? "#1e3a5f" : "#bfdbfe" }}>
              {timeAgo(trendingUpdated)}
            </span>
          )}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          {trendingError && (
            <p style={{ gridColumn: "1 / -1", fontSize: "11px", color: isDark ? "#f87171" : "#dc2626", margin: 0 }}>
              Couldn't load trending topics
            </p>
          )}
          {!trendingError && trending.length === 0 &&
            Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                style={{
                  height: "46px",
                  borderRadius: "12px",
                  background: isDark ? "rgba(255,255,255,0.03)" : "rgba(226,232,240,0.5)",
                  animation: "pulse 1.5s ease-in-out infinite",
                }}
              />
            ))}
          {trending.map((topic, i) => (
            <button
              key={i}
              onClick={() => handleClick(topic)}
              style={{
                padding: "12px 14px",
                borderRadius: "12px",
                fontSize: "13.5px",
                fontWeight: 500,
                textAlign: "left",
                cursor: "pointer",
                background: isDark ? "rgba(30,58,138,0.18)" : "rgba(219,234,254,0.7)",
                border: `1px solid ${isDark ? "rgba(59,130,246,0.18)" : "rgba(59,130,246,0.18)"}`,
                color: isDark ? "#93c5fd" : "#1d4ed8",
                transition: "all 0.2s ease",
                lineHeight: 1.3,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = isDark ? "rgba(30,58,138,0.35)" : "rgba(191,219,254,0.9)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = isDark ? "rgba(30,58,138,0.18)" : "rgba(219,234,254,0.7)")}
            >
              {topic}
            </button>
          ))}
        </div>
      </div>

      {/* ── RECENT SEARCHES ── */}
      <div>
        <p style={sectionLabelStyle}>Recent Searches</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {history.length === 0 && (
            <p style={{ fontSize: "12px", color: isDark ? "#334155" : "#94a3b8", margin: 0 }}>
              No searches yet
            </p>
          )}
          {history.slice(0, 8).map((item) => (
            <div
              key={item.id}
              onClick={() => handleClick(item.topic)}
              style={{
                padding: "12px 14px",
                borderRadius: "12px",
                cursor: "pointer",
                background: isDark ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.6)",
                border: `1px solid ${isDark ? "rgba(59,130,246,0.08)" : "rgba(147,197,253,0.3)"}`,
                transition: "background 0.2s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.85)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.6)")}
            >
              <p
                style={{
                  fontSize: "14.5px",
                  fontWeight: 500,
                  margin: 0,
                  color: isDark ? "#e2e8f0" : "#1e293b",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  textTransform: "capitalize",
                }}
              >
                {item.topic}
              </p>
              <p style={{ fontSize: "12px", margin: "3px 0 0", color: sentimentColor(item.dominant_sentiment), textTransform: "capitalize" }}>
                {item.dominant_sentiment}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── SOURCE STATUS ── */}
      <div>
        <p style={sectionLabelStyle}>Sources</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {SOURCES.map((s) => (
            <div key={s.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "13.5px", color: isDark ? "#94a3b8" : "#475569" }}>{s.label}</span>
              <span style={{ color: isDark ? "#4ade80" : "#15803d", fontSize: "13px" }}>✓</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "12px", color: isDark ? "#475569" : "#94a3b8" }}>Reddit</span>
            <span style={{ fontSize: "10px", color: isDark ? "#475569" : "#94a3b8" }}>coming soon</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar — always visible */}
      <aside
        className="sp-sidebar-desktop"
        style={{
          width: "300px",
          flexShrink: 0,
          borderRight: `1px solid ${isDark ? "rgba(59,130,246,0.12)" : "rgba(147,197,253,0.3)"}`,
          background: isDark ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.4)",
          backdropFilter: "blur(20px)",
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          overflowY: "auto",
          zIndex: 10,
        }}
      >
        {sidebarContent}
      </aside>

      {/* Mobile floating toggle — glassmorphism pill, top-left, aligned
          with the theme toggle on the opposite corner */}
      <button
        className="sp-sidebar-toggle"
        onClick={() => setMobileOpen(true)}
        aria-label="Open trending and recent searches"
        style={{
          position: "absolute",
          top: "24px",
          left: "24px",
          zIndex: 40,
          width: "44px",
          height: "44px",
          borderRadius: "50%",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "4px",
          background: isDark ? "rgba(15,23,42,0.55)" : "rgba(255,255,255,0.55)",
          border: `1px solid ${isDark ? "rgba(59,130,246,0.25)" : "rgba(147,197,253,0.6)"}`,
          backdropFilter: "blur(20px) saturate(160%)",
          WebkitBackdropFilter: "blur(20px) saturate(160%)",
          boxShadow: isDark ? "0 4px 20px rgba(0,0,0,0.3)" : "0 4px 20px rgba(59,130,246,0.15)",
          cursor: "pointer",
        }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              width: "16px",
              height: "2px",
              borderRadius: "2px",
              background: isDark ? "#93c5fd" : "#1d4ed8",
              display: "block",
            }}
          />
        ))}
      </button>

      {/* Mobile overlay panel */}
      {mobileOpen && (
        <div
          className="sp-sidebar-overlay"
          onClick={() => setMobileOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            background: "rgba(0,0,0,0.4)",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "82%",
              maxWidth: "340px",
              height: "100%",
              background: isDark ? "rgba(4,15,31,0.85)" : "rgba(255,255,255,0.85)",
              backdropFilter: "blur(30px) saturate(160%)",
              WebkitBackdropFilter: "blur(30px) saturate(160%)",
              borderRight: `1px solid ${isDark ? "rgba(59,130,246,0.2)" : "rgba(147,197,253,0.5)"}`,
              overflowY: "auto",
            }}
          >
            <div style={{ display: "flex", justifyContent: "flex-end", padding: "12px 16px 0" }}>
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close"
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "18px",
                  color: isDark ? "#93c5fd" : "#1d4ed8",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>
            {sidebarContent}
          </div>
        </div>
      )}

      <style>{`
        .sp-sidebar-toggle { display: none; }
        .sp-sidebar-desktop {
          scrollbar-width: thin;
          scrollbar-color: ${isDark ? "rgba(96,165,250,0.25)" : "rgba(148,163,184,0.4)"} transparent;
        }
        .sp-sidebar-desktop::-webkit-scrollbar { width: 5px; }
        .sp-sidebar-desktop::-webkit-scrollbar-track { background: transparent; }
        .sp-sidebar-desktop::-webkit-scrollbar-thumb {
          background: ${isDark ? "rgba(96,165,250,0.25)" : "rgba(148,163,184,0.4)"};
          border-radius: 999px;
        }
        .sp-sidebar-desktop::-webkit-scrollbar-thumb:hover {
          background: ${isDark ? "rgba(96,165,250,0.45)" : "rgba(148,163,184,0.65)"};
        }
        @media (max-width: 900px) {
          .sp-sidebar-desktop { display: none; }
          .sp-sidebar-toggle { display: flex; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </>
  );
}