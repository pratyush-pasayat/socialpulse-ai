"use client";
import { useState, useEffect } from "react";
import SentimentChart from "./components/SentimentChart";
import ResultsTable from "./components/ResultsTable";
import SummaryCards from "./components/SummaryCards";
import SentimentBarChart from "./components/BarChart";
import SearchHistory from "./components/SearchHistory";
import Keywords from "./components/Keywords";

const API = "https://socialpulse-ai-backend-7lzo.onrender.com";

export default function Home() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState<"idle" | "fetching" | "analyzing" | "summarizing" | "done">("idle");
  const [items, setItems] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [aiSummary, setAiSummary] = useState<string>("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    document.body.className = theme;
    document.documentElement.style.background = theme === "light"
      ? "linear-gradient(135deg, #e8f4fd 0%, #f0f8ff 60%, #e6f3fb 100%)"
      : "linear-gradient(135deg, #020b18 0%, #040f1f 60%, #020d1c 100%)";
    document.documentElement.style.minHeight = "100vh";
  }, [theme]);

  useEffect(() => {
    document.body.className = "light";
    document.documentElement.style.background = "linear-gradient(135deg, #e8f4fd 0%, #f0f8ff 60%, #e6f3fb 100%)";
    document.documentElement.style.minHeight = "100vh";
  }, []);

  // Auto-cycle loading stage labels while waiting
  useEffect(() => {
    if (!loading) return;
    const stages: Array<"fetching" | "analyzing" | "summarizing"> = ["fetching", "analyzing", "summarizing"];
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % stages.length;
      setStage(stages[i]);
    }, 3000);
    return () => clearInterval(interval);
  }, [loading]);

  const toggleTheme = () => setTheme(t => t === "light" ? "dark" : "light");
  const isDark = theme === "dark";

  const analyze = async (searchTopic?: string) => {
    const t = searchTopic || topic;
    if (!t.trim()) return;
    setTopic(t);
    setLoading(true);
    setStage("fetching");
    setError("");
    setItems([]);
    setSummary(null);
    setAiSummary("");
    setKeywords([]);
    setTotal(0);

    try {
      const res = await fetch(`${API}/analyze?topic=${encodeURIComponent(t)}&max_results=10`);
      const data = await res.json();
      setItems(data.items || []);
      setSummary(data.summary);
      setAiSummary(data.ai_summary);
      setKeywords(data.keywords || []);
      setTotal(data.total);
      setStage("done");
    } catch (err) {
      setError("Failed to fetch data. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const stageLabel = () => {
    if (stage === "fetching") return { emoji: "📡", text: "Fetching from 4 sources..." };
    if (stage === "analyzing") return { emoji: "🧠", text: "Analyzing sentiment with AI..." };
    if (stage === "summarizing") return { emoji: "✍️", text: "Generating insights..." };
    return { emoji: "✅", text: "Done!" };
  };

  const showResults = items.length > 0 && stage === "done";

  return (
    <main style={{
      minHeight: "100vh",
      width: "100%",
      overflowX: "hidden",
      background: isDark
        ? "linear-gradient(135deg, #020b18 0%, #040f1f 60%, #020d1c 100%)"
        : "linear-gradient(135deg, #e8f4fd 0%, #f0f8ff 60%, #e6f3fb 100%)",
      transition: "background 0.4s ease",
    }}>

      {/* Ambient orb */}
      <div style={{
        position: "fixed", top: 0, left: "25%",
        width: "500px", height: "500px", borderRadius: "50%",
        pointerEvents: "none", zIndex: 0,
        background: isDark
          ? "radial-gradient(circle, rgba(30,64,175,0.1) 0%, transparent 70%)"
          : "radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 70%)",
      }} />

      <div style={{
        maxWidth: "900px",
        margin: "0 auto",
        padding: "clamp(16px, 4vw, 40px) clamp(16px, 4vw, 24px) 80px",
        position: "relative",
        zIndex: 1,
        boxSizing: "border-box",
        width: "100%",
      }}>

        {/* ── TOP NAV ── */}
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "clamp(32px, 6vw, 64px)",
        }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            background: isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.7)",
            border: `1px solid ${isDark ? "rgba(59,130,246,0.2)" : "rgba(147,197,253,0.5)"}`,
            borderRadius: "999px", padding: "6px 12px",
            fontSize: "clamp(9px, 2vw, 11px)", fontWeight: 500,
            letterSpacing: "0.06em", textTransform: "uppercase" as const,
            color: isDark ? "#93c5fd" : "#1d4ed8",
            backdropFilter: "blur(20px)",
          }}>
            <span style={{
              width: "6px", height: "6px", borderRadius: "50%",
              background: isDark ? "#60a5fa" : "#3b82f6",
              display: "inline-block", flexShrink: 0,
            }} />
            AI-Powered Social Intelligence
          </div>

          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            style={{
              width: "40px", height: "40px", borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", transition: "all 0.3s ease",
              background: isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.8)",
              border: `1px solid ${isDark ? "rgba(59,130,246,0.25)" : "rgba(147,197,253,0.6)"}`,
              fontSize: "16px", position: "relative", overflow: "hidden",
              flexShrink: 0, backdropFilter: "blur(20px)",
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.1) rotate(15deg)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "scale(1) rotate(0deg)")}
          >
            <span style={{
              position: "absolute",
              transition: "transform 0.5s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease",
              transform: isDark ? "rotate(-90deg) scale(0)" : "rotate(0deg) scale(1)",
              opacity: isDark ? 0 : 1,
            }}>☀️</span>
            <span style={{
              position: "absolute",
              transition: "transform 0.5s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease",
              transform: isDark ? "rotate(0deg) scale(1)" : "rotate(90deg) scale(0)",
              opacity: isDark ? 1 : 0,
            }}>🌙</span>
          </button>
        </div>

        {/* ── HERO ── */}
        <div style={{ textAlign: "center", marginBottom: "clamp(28px, 5vw, 52px)" }}>
          <h1 className="glow-text" style={{
            fontSize: "clamp(36px, 10vw, 76px)",
            fontWeight: 700, letterSpacing: "-0.03em",
            marginBottom: "clamp(12px, 3vw, 20px)",
            display: "block", lineHeight: 1.05,
          }}>
            SocialPulse
          </h1>
          <p style={{
            fontSize: "clamp(14px, 3.5vw, 18px)", fontWeight: 300,
            color: isDark ? "#475569" : "#64748b",
            lineHeight: 1.7, margin: 0, padding: "0 8px",
          }}>
            Understand what the world thinks — in real time.
          </p>
        </div>

        {/* ── SEARCH ── */}
        <div style={{
          background: isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.85)",
          border: `1px solid ${isDark ? "rgba(59,130,246,0.2)" : "rgba(147,197,253,0.6)"}`,
          borderRadius: "18px", padding: "6px", marginBottom: "16px",
          boxShadow: isDark
            ? "0 0 40px rgba(59,130,246,0.07)"
            : "0 0 40px rgba(59,130,246,0.1)",
          backdropFilter: "blur(40px)",
        }}>
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && analyze()}
              placeholder="Search any topic, brand, or trend..."
              style={{
                flex: 1,
                padding: "clamp(10px, 2.5vw, 14px) clamp(12px, 3vw, 20px)",
                background: "transparent", border: "none", outline: "none",
                fontSize: "clamp(14px, 3.5vw, 16px)",
                color: isDark ? "#e2e8f0" : "#1e293b",
                minWidth: 0,
              }}
            />
            <button
              onClick={() => analyze()}
              disabled={loading}
              style={{
                padding: "clamp(10px, 2.5vw, 12px) clamp(14px, 3vw, 24px)",
                borderRadius: "13px",
                background: "linear-gradient(135deg, #1d4ed8, #0284c7)",
                color: "#fff", fontWeight: 600,
                fontSize: "clamp(12px, 3vw, 14px)",
                border: "none", cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.5 : 1,
                transition: "all 0.3s ease",
                whiteSpace: "nowrap" as const, flexShrink: 0,
              }}
            >
              {loading ? "..." : "Analyze →"}
            </button>
          </div>
        </div>

        {/* ── SEARCH HISTORY ── */}
        <div style={{ marginBottom: "clamp(24px, 5vw, 48px)" }}>
          <SearchHistory onSelect={(t) => analyze(t)} isDark={isDark} />
        </div>

        {/* ── ERROR ── */}
        {error && (
          <div style={{
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.2)",
            borderRadius: "14px", padding: "14px 20px",
            color: "#ef4444", fontSize: "14px",
            textAlign: "center", marginBottom: "32px",
          }}>
            {error}
          </div>
        )}

        {/* ── LOADING STAGE INDICATOR ── */}
        {loading && (
          <div style={{
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            padding: "clamp(60px, 10vw, 100px) 0", gap: "24px",
          }}>
            {/* Pulsing brain */}
            <div style={{ position: "relative", width: "56px", height: "56px" }}>
              <div style={{
                position: "absolute", inset: 0, borderRadius: "50%",
                border: `1px solid ${isDark ? "rgba(96,165,250,0.3)" : "rgba(59,130,246,0.3)"}`,
                animation: "ping 1s cubic-bezier(0,0,0.2,1) infinite",
              }} />
              <div style={{
                width: "56px", height: "56px", borderRadius: "50%",
                background: isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.8)",
                border: `1px solid ${isDark ? "rgba(59,130,246,0.2)" : "rgba(147,197,253,0.5)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "22px",
              }}>
                {stageLabel().emoji}
              </div>
            </div>

            {/* Stage label */}
            <div style={{ textAlign: "center" }}>
              <p style={{
                fontWeight: 500, marginBottom: "8px",
                color: isDark ? "#60a5fa" : "#1d4ed8",
                fontSize: "clamp(14px, 3.5vw, 16px)",
                transition: "all 0.4s ease",
              }}>
                {stageLabel().text}
              </p>
              <p style={{
                fontSize: "clamp(11px, 2.5vw, 13px)",
                color: isDark ? "#334155" : "#94a3b8",
              }}>
                Fetch · Analyze · Summarize · Extract · Save
              </p>
            </div>

            {/* Dots */}
            <div style={{ display: "flex", gap: "6px" }}>
              {[0,1,2,3,4].map(i => (
                <div key={i} style={{
                  width: "5px", height: "5px", borderRadius: "50%",
                  background: isDark ? "#60a5fa" : "#3b82f6",
                  animation: `pulse 1s ease-in-out ${i*0.15}s infinite`,
                }} />
              ))}
            </div>
          </div>
        )}

        {/* ── RESULTS ── */}
        {showResults && (
          <div style={{ display: "flex", flexDirection: "column", gap: "clamp(12px, 3vw, 20px)" }}>
            <div style={{ animation: "fadeIn 0.4s ease-in" }}>
              <SummaryCards
                summary={summary}
                topic={topic}
                total={total}
                aiSummary={aiSummary}
                isDark={isDark}
              />
            </div>
            <div style={{ animation: "fadeIn 0.5s ease-in" }}>
              <Keywords
                keywords={keywords}
                onKeywordClick={(k) => analyze(k)}
                isDark={isDark}
              />
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(280px, 100%), 1fr))",
              gap: "clamp(12px, 3vw, 20px)",
              animation: "fadeIn 0.6s ease-in",
            }}>
              <SentimentChart summary={summary} isDark={isDark} />
              <SentimentBarChart items={items} isDark={isDark} />
            </div>
            <div style={{ animation: "fadeIn 0.7s ease-in" }}>
              <ResultsTable items={items} isDark={isDark} />
            </div>
          </div>
        )}

      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </main>
  );
}