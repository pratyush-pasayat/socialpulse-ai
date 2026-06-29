"use client";
import { useEffect, useState } from "react";

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 800;
    const steps = 30;
    const increment = value / steps;
    const interval = duration / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setDisplay(value);
        clearInterval(timer);
      } else {
        setDisplay(Math.floor(start));
      }
    }, interval);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{display}</span>;
}

export default function SummaryCards({ summary, topic, total, aiSummary }: any) {
  const cards = [
    { label: "Total Analyzed", value: total, color: "text-white", bg: "bg-gray-800", border: "border-gray-700" },
    { label: "Positive", value: summary.positive, color: "text-green-400", bg: "bg-gray-800", border: "border-green-400/20" },
    { label: "Negative", value: summary.negative, color: "text-red-400", bg: "bg-gray-800", border: "border-red-400/20" },
    { label: "Neutral", value: summary.neutral, color: "text-gray-400", bg: "bg-gray-800", border: "border-gray-400/20" },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-300">
        Results for: <span className="text-purple-400">"{topic}"</span>
      </h2>

      {/* Animated Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className={`${card.bg} border ${card.border} rounded-xl p-4 text-center`}>
            <div className={`text-3xl font-bold ${card.color}`}>
              <AnimatedNumber value={card.value} />
            </div>
            <div className="text-gray-400 text-sm mt-1">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Dominant badges */}
      <div className="flex gap-4">
        <div className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-sm">
          Dominant Sentiment: <span className="text-purple-400 font-semibold capitalize">{summary.dominant_sentiment}</span>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-sm">
          Dominant Emotion: <span className="text-cyan-400 font-semibold capitalize">{summary.dominant_emotion}</span>
        </div>
      </div>

      {/* AI Summary */}
      {aiSummary && (
        <div className="bg-gray-800 border border-purple-500/30 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-purple-400 text-lg">🤖</span>
            <h3 className="text-purple-400 font-semibold">AI Intelligence Summary</h3>
          </div>
          <p className="text-gray-300 leading-relaxed">{aiSummary}</p>
        </div>
      )}
    </div>
  );
}