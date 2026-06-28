export default function ResultsTable({ items }: any) {
  const sentimentColor = (s: string) => {
    if (s === "positive") return "text-green-400 bg-green-400/10 border-green-400/20";
    if (s === "negative") return "text-red-400 bg-red-400/10 border-red-400/20";
    return "text-gray-400 bg-gray-400/10 border-gray-400/20";
  };

  const emotionEmoji = (e: string) => {
    const map: any = {
      hopeful: "🌟", angry: "😠", fearful: "😨", sad: "😢",
      excited: "🎉", neutral: "😐", frustrated: "😤",
      skeptical: "🤨", embarrassed: "😳",
    };
    return map[e] || "😐";
  };

  const sourceColor = (s: string) => {
    if (s === "news") return "bg-blue-500/20 text-blue-400 border border-blue-400/20";
    return "bg-orange-500/20 text-orange-400 border border-orange-400/20";
  };

  const scoreColor = (score: number) => {
    if (score >= 0.8) return "text-green-400";
    if (score >= 0.6) return "text-yellow-400";
    return "text-gray-400";
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-semibold text-gray-300">Analyzed Items</h2>
        <span className="text-sm text-gray-500">{items.length} results</span>
      </div>

      <div className="space-y-3">
        {items.map((item: any, index: number) => (
          <div
            key={index}
            className="bg-gray-900 rounded-xl p-4 border border-gray-700 hover:border-gray-500 transition-all"
          >
            <div className="flex items-start gap-4">
              {/* Index */}
              <div className="text-gray-600 text-sm font-mono mt-1 w-5 shrink-0">
                {index + 1}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${sourceColor(item.source)}`}>
                    {item.source === "news" ? "📰 News" : "🔶 HackerNews"}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold capitalize ${sentimentColor(item.sentiment)}`}>
                    {item.sentiment}
                  </span>
                  <span className="text-xs text-gray-400">
                    {emotionEmoji(item.emotion)} {item.emotion}
                  </span>
                </div>

                {/* Title */}
                <p
                  onClick={() => item.url && window.open(item.url, "_blank")}
                  className={`text-white font-medium text-sm mb-2 line-clamp-2 ${item.url ? "cursor-pointer hover:text-purple-400 transition-colors" : ""}`}
                >
                  {item.title} {item.url && "↗"}
                </p>

                {/* AI Summary */}
                {item.summary && (
                  <p className="text-gray-400 text-xs leading-relaxed">{item.summary}</p>
                )}

                {/* Meta */}
                {item.published_at && (
                  <p className="text-gray-600 text-xs mt-2">
                    {new Date(item.published_at).toLocaleDateString("en-IN", {
                      year: "numeric", month: "short", day: "numeric",
                    })}
                    {item.author && ` · ${item.author}`}
                  </p>
                )}
              </div>

              {/* Confidence Score */}
              <div className="text-right shrink-0">
                <div className={`text-xl font-bold ${scoreColor(item.score)}`}>
                  {(item.score * 100).toFixed(0)}%
                </div>
                <div className="text-xs text-gray-500">confidence</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}