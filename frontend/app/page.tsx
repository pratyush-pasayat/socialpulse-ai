"use client";
import { useState } from "react";
import axios from "axios";
import SentimentChart from "./components/SentimentChart";
import ResultsTable from "./components/ResultsTable";
import SummaryCards from "./components/SummaryCards";

export default function Home() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");

  const analyze = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setError("");
    setData(null);
    try {
      const res = await axios.get(`http://localhost:8000/analyze`, {
        params: { topic, max_results: 10 },
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
      {/* Header */}
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
          SocialPulse AI
        </h1>
        <p className="text-center text-gray-400 mb-8">
          Real-time social listening & sentiment analytics
        </p>

        {/* Search Bar */}
        <div className="flex gap-3 mb-8">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && analyze()}
            placeholder="Enter a topic (e.g. OpenAI, Bitcoin, Climate...)"
            className="flex-1 px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
          />
          <button
            onClick={analyze}
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 font-semibold transition-all"
          >
            {loading ? "Analyzing..." : "Analyze"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="text-red-400 text-center mb-4">{error}</div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center text-purple-400 animate-pulse text-lg">
            🧠 Agents are working... fetching & analyzing data
          </div>
        )}

        {/* Results */}
        {data && (
          <div className="space-y-8">
            <SummaryCards summary={data.summary} topic={data.topic} total={data.total} aiSummary={data.ai_summary} />
            <SentimentChart summary={data.summary} />
            <ResultsTable items={data.items} />
          </div>
        )}
      </div>
    </main>
  );
}