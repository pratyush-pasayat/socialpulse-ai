"use client";
import { useState, useEffect, useRef } from "react";
import SentimentChart from "./components/SentimentChart";
import ResultsTable from "./components/ResultsTable";
import SummaryCards from "./components/SummaryCards";
import SentimentBarChart from "./components/BarChart";
import SearchSidebar from "./components/SearchSidebar";
import Keywords from "./components/Keywords";

const API = "https://socialpulse-ai-backend-7lzo.onrender.com";

const BG_LIGHT =
  "radial-gradient(circle at 82% 8%, rgba(96,165,250,0.35), transparent 42%)," +
  "radial-gradient(circle at 12% 38%, rgba(167,139,250,0.28), transparent 46%)," +
  "radial-gradient(circle at 50% 95%, rgba(96,165,250,0.22), transparent 42%)," +
  "#fafbff";

const BG_DARK =
  "radial-gradient(circle at 82% 8%, rgba(59,130,246,0.28), transparent 42%)," +
  "radial-gradient(circle at 12% 38%, rgba(129,140,248,0.2), transparent 46%)," +
  "radial-gradient(circle at 50% 95%, rgba(59,130,246,0.16), transparent 42%)," +
  "#020817";

const GRAIN_SVG =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

function SearchIcon({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="11" cy="11" r="7" stroke={color} strokeWidth="2" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ThemeToggle({ isDark, onToggle }: { isDark: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      aria-label="Toggle theme"
      style={{
        width: "68px",
        height: "36px",
        borderRadius: "999px",
        background: "#0f172a",
        border: "1px solid rgba(255,255,255,0.08)",
        position: "relative",
        cursor: "pointer",
        padding: "3px",
        display: "flex",
        alignItems: "center",
        boxShadow: "0 4px 14px rgba(15,23,42,0.25)",
        flexShrink: 0,
      }}
    >
      <span style={{ position: "absolute", left: "10px", fontSize: "13px", opacity: isDark ? 0.25 : 1, transition: "opacity 0.3s ease" }}>☀️</span>
      <span style={{ position: "absolute", right: "10px", fontSize: "13px", opacity: isDark ? 1 : 0.25, transition: "opacity 0.3s ease" }}>🌙</span>
      <div
        style={{
          width: "28px",
          height: "28px",
          borderRadius: "50%",
          background: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "13px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
          transform: isDark ? "translateX(32px)" : "translateX(0px)",
          transition: "transform 0.35s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        {isDark ? "🌙" : "☀️"}
      </div>
    </button>
  );
}

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
  const [hasSearched, setHasSearched] = useState(false);
  const [showCompact, setShowCompact] = useState(false);
  const [collapsing, setCollapsing] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const [centerOffset, setCenterOffset] = useState(0);
  const compactBarRef = useRef<HTMLDivElement>(null);
  const [compactBarHeight, setCompactBarHeight] = useState(140);

  useEffect(() => {
    if (!showCompact) return;
    function measureBar() {
      if (compactBarRef.current) {
        setCompactBarHeight(compactBarRef.current.offsetHeight);
      }
    }
    measureBar();
    window.addEventListener("resize", measureBar);
    return () => window.removeEventListener("resize", measureBar);
  }, [showCompact]);

  useEffect(() => {
    function measure() {
      if (heroRef.current) {
        const heroHeight = heroRef.current.offsetHeight;
        const offset = Math.max(0, (window.innerHeight - heroHeight) / 2 - 90);
        setCenterOffset(offset);
      }
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    document.body.className = theme;
    document.documentElement.style.background = theme === "light" ? BG_LIGHT : BG_DARK;
    document.documentElement.style.minHeight = "100vh";
  }, [theme]);

  useEffect(() => {
    document.body.className = "light";
    document.documentElement.style.background = BG_LIGHT;
    document.documentElement.style.minHeight = "100vh";
  }, []);

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

  useEffect(() => {
    if (stage === "done" && !showCompact) {
      setHasSearched(true);
      setCollapsing(true);
      const t = setTimeout(() => setShowCompact(true), 650);
      return () => clearTimeout(t);
    }
  }, [stage, showCompact]);

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
    <div style={{
      minHeight: "100vh",
      width: "100%",
      background: isDark ? BG_DARK : BG_LIGHT,
      transition: "background 0.4s ease",
      position: "relative",
    }}>

      <div style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        backgroundImage: GRAIN_SVG,
        opacity: isDark ? 0.05 : 0.035,
        mixBlendMode: "overlay",
      }} />

      <SearchSidebar isDark={isDark} apiBase={API} onTopicClick={(t) => analyze(t)} />

      <main className="sp-main-content" style={{
        position: "relative",
      }}>

        <div className="sp-theme-toggle-wrap">
          <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
        </div>

        <div style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "clamp(16px, 4vw, 40px) clamp(16px, 4vw, 24px) 80px",
          position: "relative",
          zIndex: 1,
          boxSizing: "border-box",
          width: "100%",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}>

          {/* Shared group. NOTE: both transform AND willChange are dropped
              once showCompact is true — will-change:transform by itself
              (even with transform:none) still creates a new containing
              block, which breaks position:sticky on descendants. Neither
              is needed once the slide animation has finished. */}
          <div ref={heroRef} style={{
            transform: showCompact ? "none" : `translateY(${hasSearched ? 0 : centerOffset}px)`,
            transition: "transform 0.6s cubic-bezier(0.4,0,0.2,1)",
            willChange: showCompact ? "auto" : "transform",
          }}>

          {!showCompact && (
          <div style={{
            maxHeight: collapsing ? "0px" : "800px",
            opacity: collapsing ? 0 : 1,
            overflow: "hidden",
            transition: "max-height 0.5s cubic-bezier(0.4,0,0.2,1), opacity 0.35s ease",
          }}>

          <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            background: isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.9)",
            border: `1px solid ${isDark ? "rgba(96,165,250,0.35)" : "#bfdbfe"}`,
            borderRadius: "999px", padding: "8px 16px",
            fontSize: "clamp(10px, 2vw, 12px)", fontWeight: 700,
            letterSpacing: "0.06em", textTransform: "uppercase" as const,
            color: isDark ? "#93c5fd" : "#1d4ed8",
            backdropFilter: "blur(20px)",
            boxShadow: isDark ? "none" : "0 2px 10px rgba(59,130,246,0.08)",
          }}>
            <span style={{ fontSize: "13px" }}>✦</span>
            AI-Powered Social Intelligence
          </div>
          </div>

          <div style={{ textAlign: "center", marginBottom: "clamp(28px, 5vw, 52px)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "clamp(12px, 2vw, 20px)", marginBottom: "clamp(12px, 3vw, 20px)" }}>
              <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{
                  position: "absolute",
                  width: "140%", height: "140%",
                  borderRadius: "50%",
                  background: "radial-gradient(circle, rgba(59,130,246,0.55) 0%, transparent 70%)",
                  filter: "blur(18px)",
                  zIndex: 0,
                }} />
                <img
                  src="/logo.svg"
                  alt="SocialPulse AI Logo"
                  style={{ width: "clamp(40px, 8vw, 72px)", height: "clamp(40px, 8vw, 72px)", position: "relative", zIndex: 1 }}
                />
              </div>
              <h1 style={{
                fontSize: "clamp(36px, 10vw, 76px)",
                fontWeight: 900,
                letterSpacing: "-0.03em",
                display: "block",
                lineHeight: 1.05,
                margin: 0,
                color: isDark ? "#f8fafc" : "#0f172a",
              }}>
                SocialPulse
              </h1>
            </div>
            <p style={{
              fontSize: "clamp(15px, 3.2vw, 19px)", fontWeight: 400,
              color: isDark ? "#94a3b8" : "#64748b",
              lineHeight: 1.6, margin: 0, padding: "0 8px",
            }}>
              Understand what the world thinks — in real time
            </p>
          </div>

          <div style={{
            background: isDark ? "rgba(255,255,255,0.06)" : "#ffffff",
            border: `1px solid ${isDark ? "rgba(96,165,250,0.15)" : "rgba(226,232,240,0.8)"}`,
            borderRadius: "999px", padding: "8px 8px 8px 22px", marginBottom: "clamp(24px, 5vw, 48px)",
            boxShadow: isDark
              ? "0 8px 30px rgba(0,0,0,0.35)"
              : "0 10px 34px rgba(59,130,246,0.14)",
            backdropFilter: "blur(40px)",
          }}>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <SearchIcon color={isDark ? "#64748b" : "#94a3b8"} />
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && analyze()}
                placeholder="Search any topic, brand, or trend..."
                style={{
                  flex: 1,
                  padding: "clamp(12px, 2.5vw, 16px) 0",
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
                  padding: "clamp(12px, 2.5vw, 14px) clamp(20px, 3vw, 28px)",
                  borderRadius: "999px",
                  background: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
                  color: "#fff", fontWeight: 700,
                  fontSize: "clamp(13px, 3vw, 15px)",
                  border: "none", cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.5 : 1,
                  transition: "all 0.3s ease",
                  whiteSpace: "nowrap" as const, flexShrink: 0,
                  boxShadow: "0 4px 14px rgba(29,78,216,0.35)",
                }}
              >
                {loading ? "..." : "Analyze →"}
              </button>
            </div>
          </div>

          </div>
          )}

          {/* COMPACT TOP BAR — position:fixed (not sticky). Sticky depends on
              correctly identifying the "nearest scrolling ancestor," which
              is fragile and broke in practice; fixed is always relative to
              the viewport itself, so it's guaranteed to stay pinned
              regardless of any ancestor's overflow/transform setup. */}
          {showCompact && (
          <div ref={compactBarRef} className="sp-compact-fixed" style={{
            position: "fixed",
            top: 0,
            zIndex: 20,
            background: isDark ? "rgba(2,8,23,0.35)" : "rgba(250,251,255,0.4)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            paddingTop: "16px",
            paddingBottom: "14px",
            paddingLeft: "clamp(16px, 4vw, 24px)",
            paddingRight: "clamp(16px, 4vw, 24px)",
            boxSizing: "border-box",
            animation: "fadeIn 0.45s ease-out",
          }}>
            <div style={{ maxWidth: "900px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "18px" }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                background: isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.9)",
                border: `1px solid ${isDark ? "rgba(96,165,250,0.35)" : "#bfdbfe"}`,
                borderRadius: "999px", padding: "6px 14px",
                fontSize: "clamp(9px, 1.8vw, 11px)", fontWeight: 700,
                letterSpacing: "0.06em", textTransform: "uppercase" as const,
                color: isDark ? "#93c5fd" : "#1d4ed8",
                backdropFilter: "blur(20px)",
                boxShadow: isDark ? "none" : "0 2px 10px rgba(59,130,246,0.08)",
              }}>
                <span style={{ fontSize: "12px" }}>✦</span>
                AI-Powered Social Intelligence
              </div>
            </div>

            <div className="sp-compact-row" style={{
              display: "flex", alignItems: "center", gap: "16px",
              flexWrap: "wrap",
            }}>
              <h2 style={{
                fontSize: "clamp(22px, 4vw, 30px)",
                fontWeight: 900,
                letterSpacing: "-0.02em",
                margin: 0,
                color: isDark ? "#f8fafc" : "#0f172a",
                flexShrink: 0,
              }}>
                SocialPulse
              </h2>

              <div className="sp-compact-searchbar" style={{
                flex: 1, minWidth: "240px",
                background: isDark ? "rgba(255,255,255,0.06)" : "#ffffff",
                border: `1px solid ${isDark ? "rgba(96,165,250,0.15)" : "rgba(226,232,240,0.8)"}`,
                borderRadius: "999px", padding: "6px 6px 6px 16px",
                boxShadow: isDark
                  ? "0 8px 30px rgba(0,0,0,0.35)"
                  : "0 10px 34px rgba(59,130,246,0.14)",
                backdropFilter: "blur(40px)",
              }}>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <SearchIcon color={isDark ? "#64748b" : "#94a3b8"} />
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && analyze()}
                    placeholder="Search any topic, brand, or trend..."
                    style={{
                      flex: 1,
                      padding: "10px 0",
                      background: "transparent", border: "none", outline: "none",
                      fontSize: "clamp(13px, 3vw, 15px)",
                      color: isDark ? "#e2e8f0" : "#1e293b",
                      minWidth: 0,
                    }}
                  />
                  <button
                    onClick={() => analyze()}
                    disabled={loading}
                    style={{
                      padding: "10px clamp(16px, 3vw, 22px)",
                      borderRadius: "999px",
                      background: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
                      color: "#fff", fontWeight: 700,
                      fontSize: "clamp(12px, 3vw, 14px)",
                      border: "none", cursor: loading ? "not-allowed" : "pointer",
                      opacity: loading ? 0.5 : 1,
                      transition: "all 0.3s ease",
                      whiteSpace: "nowrap" as const, flexShrink: 0,
                      boxShadow: "0 4px 14px rgba(29,78,216,0.35)",
                    }}
                  >
                    {loading ? "..." : "Analyze →"}
                  </button>
                </div>
              </div>
            </div>
            </div>
          </div>
          )}

          {/* Spacer matching the fixed bar's actual measured height — since
              position:fixed removes it from document flow entirely, results
              need this to avoid sitting hidden underneath it. */}
          {showCompact && <div style={{ height: `${compactBarHeight}px` }} />}

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

          {loading && (
            <div style={{
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              padding: "clamp(60px, 10vw, 100px) 0", gap: "24px",
            }}>
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

          {/* end shared transform group */}
          </div>

        </div>

        <style>{`
          .sp-main-content { margin-left: 300px; }
          .sp-compact-fixed { left: 300px; right: 0; }
          .sp-theme-toggle-wrap { position: fixed; top: 24px; right: 24px; z-index: 30; }
          @media (max-width: 900px) {
            .sp-main-content { margin-left: 0; }
            .sp-compact-fixed { left: 0; padding-top: 56px !important; }
            .sp-theme-toggle-wrap { position: absolute; }
            .sp-compact-searchbar { min-width: 100%; flex-basis: 100%; }
          }
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
    </div>
  );
}