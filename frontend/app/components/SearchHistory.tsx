"use client";
import { useEffect, useState } from "react";
import axios from "axios";

export default function SearchHistory({ onSelect, isDark }: { onSelect: (topic: string) => void, isDark: boolean }) {
  const [history, setHistory] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    axios.get("http://localhost:8000/history?limit=10").then((res) => {
      setHistory(res.data);
    });
  }, []);

  const sentimentColor = (s: string) => {
    if (s === "positive") return isDark ? "#4ade80" : "#15803d";
    if (s === "negative") return isDark ? "#f87171" : "#dc2626";
    return isDark ? "#94a3b8" : "#475569";
  };

  if (history.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-3">
        <span className="text-xs" style={{ color: isDark ? "#334155" : "#94a3b8" }}>Recent</span>
        <div className="flex gap-2 flex-wrap">
          {history.slice(0, 5).map((item, i) => (
            <button
              key={i}
              onClick={() => onSelect(item.topic)}
              className="glass rounded-full px-3 py-1 text-xs capitalize transition-all hover:scale-105"
              style={{ color: isDark ? "#60a5fa" : "#1d4ed8" }}
            >
              {item.topic}
            </button>
          ))}
        </div>
        {history.length > 5 && (
          <button
            onClick={() => setOpen(!open)}
            className="text-xs transition-colors"
            style={{ color: isDark ? "#334155" : "#94a3b8" }}
          >
            {open ? "▲ less" : `▼ +${history.length - 5} more`}
          </button>
        )}
      </div>

      {open && (
        <div className="mt-3 glass rounded-2xl p-4 space-y-2">
          {history.slice(5).map((item: any) => (
            <div
              key={item.id}
              onClick={() => onSelect(item.topic)}
              className="flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all"
              style={{
                background: isDark ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.6)",
                border: `1px solid ${isDark ? "rgba(59,130,246,0.08)" : "rgba(147,197,253,0.3)"}`,
              }}
              onMouseEnter={e => (e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.85)")}
              onMouseLeave={e => (e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.6)")}
            >
              <div className="flex items-center gap-3">
                <span className="font-medium text-sm capitalize" style={{ color: isDark ? "#e2e8f0" : "#1e293b" }}>{item.topic}</span>
                <span className="text-xs capitalize" style={{ color: sentimentColor(item.dominant_sentiment) }}>
                  {item.dominant_sentiment}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs" style={{ color: isDark ? "#334155" : "#94a3b8" }}>
                <span>{item.total} items</span>
                <span>{new Date(item.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}