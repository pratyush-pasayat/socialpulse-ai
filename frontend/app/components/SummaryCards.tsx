export default function SummaryCards({ summary, topic, total }: any) {
  const cards = [
    { label: "Total Analyzed", value: total, color: "text-white", bg: "bg-gray-800" },
    { label: "Positive", value: summary.positive, color: "text-green-400", bg: "bg-gray-800 border border-green-400/20" },
    { label: "Negative", value: summary.negative, color: "text-red-400", bg: "bg-gray-800 border border-red-400/20" },
    { label: "Neutral", value: summary.neutral, color: "text-gray-400", bg: "bg-gray-800 border border-gray-400/20" },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-gray-300">
        Results for: <span className="text-purple-400">"{topic}"</span>
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className={`${card.bg} rounded-xl p-4 text-center`}>
            <div className={`text-3xl font-bold ${card.color}`}>{card.value}</div>
            <div className="text-gray-400 text-sm mt-1">{card.label}</div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-4">
        <div className="bg-gray-800 rounded-xl px-4 py-2 text-sm">
          Dominant Sentiment: <span className="text-purple-400 font-semibold capitalize">{summary.dominant_sentiment}</span>
        </div>
        <div className="bg-gray-800 rounded-xl px-4 py-2 text-sm">
          Dominant Emotion: <span className="text-cyan-400 font-semibold capitalize">{summary.dominant_emotion}</span>
        </div>
      </div>
    </div>
  );
}