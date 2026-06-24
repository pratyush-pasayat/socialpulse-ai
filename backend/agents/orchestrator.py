import os
from dotenv import load_dotenv
from tools.news_tool import fetch_news
from tools.hackernews_tool import fetch_hackernews
from agents.sentiment_agent import analyze_sentiment

load_dotenv()

def run_pipeline(topic: str, max_results: int = 10) -> dict:
    """
    Main orchestrator — coordinates all agents:
    1. Fetcher Agent: pulls data from NewsAPI + HackerNews
    2. Sentiment Agent: analyzes each item with Groq
    3. Returns structured results
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
    
    return {
        "topic": topic,
        "total": len(analyzed_items),
        "items": analyzed_items,
        "summary": {
            "positive": sentiment_counts["positive"],
            "negative": sentiment_counts["negative"],
            "neutral": sentiment_counts["neutral"],
            "dominant_sentiment": dominant_sentiment,
            "dominant_emotion": dominant_emotion,
        }
    }