export default function Keywords({ keywords, onKeywordClick }: { keywords: string[], onKeywordClick: (k: string) => void }) {
  if (!keywords || keywords.length === 0) return null;

  const colors = [
    "bg-purple-500/20 text-purple-400 border-purple-400/30 hover:bg-purple-500/40",
    "bg-cyan-500/20 text-cyan-400 border-cyan-400/30 hover:bg-cyan-500/40",
    "bg-pink-500/20 text-pink-400 border-pink-400/30 hover:bg-pink-500/40",
    "bg-yellow-500/20 text-yellow-400 border-yellow-400/30 hover:bg-yellow-500/40",
    "bg-green-500/20 text-green-400 border-green-400/30 hover:bg-green-500/40",
    "bg-orange-500/20 text-orange-400 border-orange-400/30 hover:bg-orange-500/40",
    "bg-blue-500/20 text-blue-400 border-blue-400/30 hover:bg-blue-500/40",
    "bg-red-500/20 text-red-400 border-red-400/30 hover:bg-red-500/40",
  ];

  return (
    <div className="bg-gray-800 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">🔑</span>
        <h3 className="text-gray-300 font-semibold">Trending Themes</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {keywords.map((keyword, index) => (
          <button
            key={index}
            onClick={() => onKeywordClick(keyword)}
            className={`px-3 py-1.5 rounded-full border text-sm font-medium transition-all cursor-pointer ${colors[index % colors.length]}`}
          >
            {keyword}
          </button>
        ))}
      </div>
      <p className="text-gray-600 text-xs mt-3">Click a keyword to analyze it</p>
    </div>
  );
}