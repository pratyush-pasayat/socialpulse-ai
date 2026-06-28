"use client";
import { useEffect, useState } from "react";
import axios from "axios";

export default function SearchHistory({ onSelect }: { onSelect: (topic: string) => void }) {
  const [history, setHistory] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    axios.get("http://localhost:8000/history?limit=10").then((res) => {
      setHistory(res.data);
    });
  }, []);

  const sentimentColor = (s: string) => {
    if (s === "positive") return "text-green-400";
    if (s === "negative") return "text-red-400";
    return "text-gray-400";
  };

  if (history.length === 0) return null;

  return (
    <div className="mb-6">
      <button
        onClick={() => setOpen(!open)}
        className="text-sm text-gray-400 hover:text-purple-400 transition-colors flex items-center gap-2"
      >
        <span>🕐</span>
        <span>Recent Searches ({history.length})</span>
        <span>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="mt-3 bg-gray-800 rounded-xl p-4 space-y-2">
          {history.map((item: any) => (
            <div
              key={item.id}
              onClick={() => onSelect(item.topic)}
              className="flex items-center justify-between p-3 bg-gray-900 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-purple-400 font-semibold capitalize">{item.topic}</span>
                <span className={`text-xs capitalize ${sentimentColor(item.dominant_sentiment)}`}>
                  {item.dominant_sentiment}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500">
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