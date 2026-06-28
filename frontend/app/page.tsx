"use client";
import { useState } from "react";
import axios from "axios";
import SentimentChart from "./components/SentimentChart";
import ResultsTable from "./components/ResultsTable";
import SummaryCards from "./components/SummaryCards";
import SentimentBarChart from "./components/BarChart";
import SearchHistory from "./components/SearchHistory";

export default function Home() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");

  const analyze = async (searchTopic?: string) => {
    const t = searchTopic || topic;
    if (!t.trim()) return;
    setTopic(t);
    setLoading(true);
    setError("");
    setData(null);
    try {
      const res = await axios.get(`http://localhost:8000/analyze`, {
        params: { topic: t, max_results: 10 },
      });
      setData(res.data);
    } catch (err) {
      setError("Failed to fetch data. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            SocialPulse AI
          </h1>
          <p className="text-gray-400 text-lg">
            Real-time social listening & sentiment analytics powered by AI agents
          </p>
        </div>

        {/* Search Bar */}
        <div className="flex gap-3 mb-4">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && analyze()}
            placeholder="Enter a topic (e.g. OpenAI, Bitcoin, Climate...)"
            className="flex-1 px-5 py-4 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-lg"
          />
          <button
            onClick={() => analyze()}
            disabled={loading}
            className="px-8 py-4 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 font-semibold text-lg transition-all"
          >
            {loading ? "Analyzing..." : "Analyze"}
          </button>
        </div>

        {/* Search History */}
        <SearchHistory onSelect={(t) => analyze(t)} />

        {/* Error */}
        {error && (
          <div className="text-red-400 text-center mb-4 bg-red-400/10 rounded-xl p-4">{error}</div>
        )}

        {/* Loading Animation */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-6">
            <div className="flex gap-3">
              {["📡", "🧠", "✍️", "💾"].map((emoji, i) => (
                <div
                  key={i}
                  className="text-3xl animate-bounce"
                  style={{ animationDelay: `${i * 0.2}s` }}
                >
                  {emoji}
                </div>
              ))}
            </div>
            <div className="space-y-2 text-center">
              <p className="text-purple-400 font-semibold text-lg">AI Agents Working...</p>
              <p className="text-gray-500 text-sm">Fetching → Analyzing → Summarizing → Saving</p>
            </div>
            <div className="flex gap-2">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {data && (
          <div className="space-y-6">
            <SummaryCards
              summary={data.summary}
              topic={data.topic}
              total={data.total}
              aiSummary={data.ai_summary}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SentimentChart summary={data.summary} />
              <SentimentBarChart items={data.items} />
            </div>
            <ResultsTable items={data.items} />
          </div>
        )}
      </div>
    </main>
  );
}