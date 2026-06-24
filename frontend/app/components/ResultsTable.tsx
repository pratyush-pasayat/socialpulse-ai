export default function ResultsTable({ items }: any) {
  const sentimentColor = (s: string) => {
    if (s === "positive") return "text-green-400";
    if (s === "negative") return "text-red-400";
    return "text-gray-400";
  };

  const sourceColor = (s: string) => {
    if (s === "news") return "bg-blue-500/20 text-blue-400";
    if (s === "hackernews") return "bg-orange-500/20 text-orange-400";
    return "bg-gray-500/20 text-gray-400";
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-300">Analyzed Items</h2>
      <div className="space-y-3">
        {items.map((item: any, index: number) => (
          <div key={index} className="bg-gray-900 rounded-lg p-4 border border-gray-700">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${sourceColor(item.source)}`}>
                    {item.source}
                  </span>
                  <span className={`text-sm font-semibold capitalize ${sentimentColor(item.sentiment)}`}>
                    {item.sentiment}
                  </span>
                  <span className="text-xs text-gray-500">{item.emotion}</span>
                </div>
                <p className="text-white font-medium text-sm">{item.title}</p>
                {item.summary && (
                  <p className="text-gray-400 text-xs mt-1">{item.summary}</p>
                )}
              </div>
              <div className="text-right shrink-0">
                <div className="text-lg font-bold text-purple-400">
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