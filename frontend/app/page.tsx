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
      const response = await fetch(`${API}/analyze-stream?topic=${encodeURIComponent(t)}&max_results=10`);
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter(l => l.startsWith("data: "));

        for (const line of lines) {
          try {
            const data = JSON.parse(line.replace("data: ", ""));

            if (data.stage === "items") {
              setItems(data.items);
              setStage("analyzing");
            } else if (data.stage === "sentiment") {
              setItems(data.items);
              setStage("summarizing");
            } else if (data.stage === "summary") {
              setSummary(data.summary);
              setAiSummary(data.ai_summary);
              setKeywords(data.keywords);
              setTotal(data.total);
              setStage("done");
            }
          } catch (e) {
            // skip malformed chunks
          }
        }
      }
    } catch (err) {
      setError("Failed to fetch data. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const stageLabel = () => {
    if (stage === "fetching") return { emoji: "📡", text: "Fetching from 4 sources..." };
    if (stage === "analyzing") return { emoji: "🧠", text: "Analyzing sentiment..." };
    if (stage === "summarizing") return { emoji: "✍️", text: "Generating AI summary..." };
    return { emoji: "✅", text: "Done!" };
  };

  const showResults = items.length > 0;

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
            fontSize: "clamp(9px, 2vw, 11px)", fontWeight: 500, letterSpacing: "0.06em",
            textTransform: "uppercase" as const,
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
          boxShadow: isDark ? "0 0 40px rgba(59,130,246,0.07)" : "0 0 40px rgba(59,130,246,0.1)",
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
                flex: 1, padding: "clamp(10px, 2.5vw, 14px) clamp(12px, 3vw, 20px)",
                background: "transparent", border: "none", outline: "none",
                fontSize: "clamp(14px, 3.5vw, 16px)",
                color: isDark ? "#e2e8f0" : "#1e293b", minWidth: 0,
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

        {/* ── PROGRESSIVE STAGE INDICATOR ── */}
        {loading && (
          <div style={{
            display: "flex", alignItems: "center", gap: "10px",
            padding: "12px 18px", marginBottom: "20px",
            background: isDark ? "rgba(59,130,246,0.08)" : "rgba(219,234,254,0.6)",
            border: `1px solid ${isDark ? "rgba(59,130,246,0.2)" : "rgba(59,130,246,0.2)"}`,
            borderRadius: "12px",
            animation: "pulse 2s ease-in-out infinite",
          }}>
            <span style={{ fontSize: "18px" }}>{stageLabel().emoji}</span>
            <span style={{ fontSize: "13px", fontWeight: 500, color: isDark ? "#60a5fa" : "#1d4ed8" }}>
              {stageLabel().text}
            </span>
            <div style={{ display: "flex", gap: "4px", marginLeft: "auto" }}>
              {[0,1,2].map(i => (
                <div key={i} style={{
                  width: "4px", height: "4px", borderRadius: "50%",
                  background: isDark ? "#60a5fa" : "#3b82f6",
                  animation: `pulse 0.8s ease-in-out ${i*0.2}s infinite`,
                }} />
              ))}
            </div>
          </div>
        )}

        {/* ── PROGRESSIVE RESULTS ── */}
        {showResults && (
          <div style={{ display: "flex", flexDirection: "column", gap: "clamp(12px, 3vw, 20px)" }}>

            {/* Summary cards — show when summary is ready */}
            {summary && (
              <div style={{ animation: "fadeIn 0.4s ease-in" }}>
                <SummaryCards
                  summary={summary}
                  topic={topic}
                  total={total}
                  aiSummary={aiSummary}
                  isDark={isDark}
                />
              </div>
            )}

            {/* Keywords — show when ready */}
            {keywords.length > 0 && (
              <div style={{ animation: "fadeIn 0.4s ease-in" }}>
                <Keywords
                  keywords={keywords}
                  onKeywordClick={(k) => analyze(k)}
                  isDark={isDark}
                />
              </div>
            )}

            {/* Charts — show when summary is ready */}
            {summary && (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(min(280px, 100%), 1fr))",
                gap: "clamp(12px, 3vw, 20px)",
                animation: "fadeIn 0.4s ease-in",
              }}>
                <SentimentChart summary={summary} isDark={isDark} />
                <SentimentBarChart items={items} isDark={isDark} />
              </div>
            )}

            {/* Results table — shows immediately with raw items, updates with sentiment */}
            <div style={{ animation: "fadeIn 0.3s ease-in" }}>
              <ResultsTable items={items} isDark={isDark} />
            </div>
          </div>
        )}

      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  );
}