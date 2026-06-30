"use client";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#4ade80", "#f87171", "#94a3b8"];

export default function SentimentChart({ summary, isDark }: any) {
  const data = [
    { name: "Positive", value: summary.positive },
    { name: "Negative", value: summary.negative },
    { name: "Neutral", value: summary.neutral },
  ].filter((d) => d.value > 0);

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
        Sentiment Distribution
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} opacity={0.85} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? "rgba(4,15,31,0.95)" : "rgba(255,255,255,0.95)",
              border: `1px solid ${isDark ? "rgba(59,130,246,0.2)" : "rgba(147,197,253,0.4)"}`,
              borderRadius: "12px",
              fontSize: "13px",
              color: isDark ? "#e2e8f0" : "#1e293b",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div style={{ display: "flex", justifyContent: "center", gap: "24px", marginTop: "20px" }}>
        {data.map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: COLORS[i] }} />
            <span style={{ fontSize: "12px", color: isDark ? "#334155" : "#94a3b8" }}>{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}