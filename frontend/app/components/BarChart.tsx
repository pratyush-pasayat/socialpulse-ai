"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function SentimentBarChart({ items }: any) {
  const sourceCounts: any = { news: { positive: 0, negative: 0, neutral: 0 }, hackernews: { positive: 0, negative: 0, neutral: 0 } };

  items.forEach((item: any) => {
    const src = item.source === "news" ? "news" : "hackernews";
    sourceCounts[src][item.sentiment]++;
  });

  const data = [
    { name: "News", ...sourceCounts.news },
    { name: "HackerNews", ...sourceCounts.hackernews },
  ];

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-300">Sentiment by Source</h2>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <XAxis dataKey="name" stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" />
          <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: "8px" }} />
          <Bar dataKey="positive" fill="#4ade80" radius={[4, 4, 0, 0]} />
          <Bar dataKey="negative" fill="#f87171" radius={[4, 4, 0, 0]} />
          <Bar dataKey="neutral" fill="#94a3b8" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}