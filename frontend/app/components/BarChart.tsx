"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function SentimentBarChart({ items, isDark }: any) {
  const sourceCounts: any = {
    news: { positive: 0, negative: 0, neutral: 0 },
    gnews: { positive: 0, negative: 0, neutral: 0 },
    hackernews: { positive: 0, negative: 0, neutral: 0 },
    youtube: { positive: 0, negative: 0, neutral: 0 },
  };

  items.forEach((item: any) => {
    const src = sourceCounts[item.source] ? item.source : "hackernews";
    sourceCounts[src][item.sentiment]++;
  });

  const labelMap: any = { news: "News", gnews: "GNews", hackernews: "HackerNews", youtube: "YouTube" };

  const data = Object.keys(sourceCounts)
    .map(key => ({ name: labelMap[key], ...sourceCounts[key] }))
    .filter(d => d.positive + d.negative + d.neutral > 0);

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
        marginBottom: "24px",
      }}>
        Sentiment by Source
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barGap={6} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <XAxis
            dataKey="name"
            tick={{ fill: isDark ? "#334155" : "#94a3b8", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: isDark ? "#334155" : "#94a3b8", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? "rgba(4,15,31,0.95)" : "rgba(255,255,255,0.95)",
              border: `1px solid ${isDark ? "rgba(59,130,246,0.2)" : "rgba(147,197,253,0.4)"}`,
              borderRadius: "12px",
              fontSize: "13px",
              color: isDark ? "#e2e8f0" : "#1e293b",
            }}
            cursor={{ fill: isDark ? "rgba(255,255,255,0.02)" : "rgba(59,130,246,0.04)" }}
          />
          <Bar dataKey="positive" fill="#4ade80" radius={[4,4,0,0]} opacity={0.85} />
          <Bar dataKey="negative" fill="#f87171" radius={[4,4,0,0]} opacity={0.85} />
          <Bar dataKey="neutral" fill="#94a3b8" radius={[4,4,0,0]} opacity={0.85} />
        </BarChart>
      </ResponsiveContainer>
      <div style={{ display: "flex", justifyContent: "center", gap: "24px", marginTop: "20px" }}>
        {[["Positive","#4ade80"],["Negative","#f87171"],["Neutral","#94a3b8"]].map(([label, color]) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: color }} />
            <span style={{ fontSize: "12px", color: isDark ? "#334155" : "#94a3b8" }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}