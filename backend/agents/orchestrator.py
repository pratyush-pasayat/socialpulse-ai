import os
from dotenv import load_dotenv
from groq import Groq
from tools.news_tool import fetch_news
from tools.hackernews_tool import fetch_hackernews
from agents.sentiment_agent import analyze_sentiment

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def generate_ai_summary(topic: str, items: list[dict], summary: dict) -> str:
    """Agent 3: Generate an AI narrative summary of all analyzed items."""
    
    top_items = items[:8]
    headlines = "\n".join([
        f"- [{item['sentiment'].upper()}] {item['title']}"
        for item in top_items
    ])
    
    prompt = f"""You are a social intelligence analyst. Based on the following data about "{topic}", write a concise 3-sentence executive summary.

Sentiment breakdown: {summary['positive']} positive, {summary['negative']} negative, {summary['neutral']} neutral
Dominant sentiment: {summary['dominant_sentiment']}
Dominant emotion: {summary['dominant_emotion']}

Top headlines:
{headlines}

Write an insightful 3-sentence summary that:
1. States the overall public sentiment
2. Identifies the key themes or concerns
3. Gives a forward-looking observation

Be direct and analytical. No bullet points."""

    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=200,
            temperature=0.7,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        return f"Summary unavailable: {str(e)}"


def run_pipeline(topic: str, max_results: int = 10) -> dict:
    """
    Main orchestrator — coordinates all agents:
    1. Fetcher Agent: pulls data from NewsAPI + HackerNews
    2. Sentiment Agent: analyzes each item with Groq
    3. Summary Agent: generates AI narrative
    """
    
    print(f"\n🔍 Starting SocialPulse pipeline for topic: '{topic}'")
    
    # ── Agent 1: Fetch data ──────────────────────────────
    print("📡 Fetcher Agent: collecting data...")
    news_items = fetch_news(topic, max_results=max_results)
    hn_items = fetch_hackernews(topic, max_results=max_results)
    
    all_items = news_items + hn_items
    print(f"   ✅ Fetched {len(news_items)} news + {len(hn_items)} HN items")
    
    if not all_items:
        return {
            "topic": topic,
            "total": 0,
            "items": [],
            "ai_summary": "No data found for this topic.",
            "summary": {
                "positive": 0,
                "negative": 0,
                "neutral": 0,
                "dominant_sentiment": "neutral",
                "dominant_emotion": "neutral",
            }
        }
    
    # ── Agent 2: Sentiment Analysis ──────────────────────
    print("🧠 Sentiment Agent: analyzing sentiment...")
    analyzed_items = analyze_sentiment(all_items)
    print(f"   ✅ Analyzed {len(analyzed_items)} items")
    
    # ── Aggregate results ────────────────────────────────
    sentiment_counts = {"positive": 0, "negative": 0, "neutral": 0}
    emotion_counts = {}
    
    for item in analyzed_items:
        s = item.get("sentiment", "neutral")
        sentiment_counts[s] = sentiment_counts.get(s, 0) + 1
        e = item.get("emotion", "neutral")
        emotion_counts[e] = emotion_counts.get(e, 0) + 1
    
    dominant_sentiment = max(sentiment_counts, key=sentiment_counts.get)
    dominant_emotion = max(emotion_counts, key=emotion_counts.get) if emotion_counts else "neutral"
    
    summary = {
        "positive": sentiment_counts["positive"],
        "negative": sentiment_counts["negative"],
        "neutral": sentiment_counts["neutral"],
        "dominant_sentiment": dominant_sentiment,
        "dominant_emotion": dominant_emotion,
    }
    
    # ── Agent 3: AI Summary ──────────────────────────────
    print("✍️  Summary Agent: generating narrative...")
    ai_summary = generate_ai_summary(topic, analyzed_items, summary)
    print(f"   ✅ Summary generated")
    
    return {
        "topic": topic,
        "total": len(analyzed_items),
        "items": analyzed_items,
        "ai_summary": ai_summary,
        "summary": summary,
    }