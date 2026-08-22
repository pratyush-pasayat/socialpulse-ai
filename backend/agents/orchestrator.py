import os
from concurrent.futures import ThreadPoolExecutor, as_completed
from dotenv import load_dotenv
from groq import Groq
from tools.news_tool import fetch_news
from tools.hackernews_tool import fetch_hackernews
from tools.gnews_tool import fetch_gnews
from tools.youtube_tool import fetch_youtube
from agents.sentiment_agent import analyze_sentiment
from tools.supabase_tool import save_search

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def generate_ai_summary(topic: str, items: list[dict], summary: dict) -> str:
    """Agent 3: Generate an AI narrative summary of all analyzed items. (Unchanged)"""
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
            model="openai/gpt-oss-20b",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=200,
            temperature=0.7,
            timeout=15,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        return f"Summary unavailable: {str(e)}"


def extract_keywords(topic: str, items: list[dict]) -> list[str]:
    """Agent 3b: Extract top keywords/themes from all analyzed items. (Unchanged)"""
    all_titles = "\n".join([item.get("title", "") for item in items[:15]])

    prompt = f"""Extract the 8 most important keywords or themes from these headlines about "{topic}".

Headlines:
{all_titles}

Rules:
- Return ONLY a comma-separated list of keywords
- Each keyword should be 1-3 words max
- Focus on topics, entities, and themes
- No explanations, no numbering, just the keywords
- Example format: regulation, job market, safety concerns, funding, competition

Keywords:"""

    try:
        response = client.chat.completions.create(
            model="openai/gpt-oss-20b",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=100,
            temperature=0.3,
            timeout=15,
        )
        raw = response.choices[0].message.content.strip()
        keywords = [k.strip() for k in raw.split(",") if k.strip()]
        return keywords[:8]
    except Exception as e:
        return []


def _fetch_all_sources(topic: str) -> dict:
    """
    NEW: fetch all 4 sources concurrently instead of one after another.

    Each fetch_* function is independent (none depend on another's result),
    so running them in a thread pool means total fetch time ≈ the slowest
    single source, not the sum of all four.

    If one source fails or times out, it just contributes an empty list —
    it does NOT take down the other 3 sources' results.
    """
    fetchers = {
        "news": lambda: fetch_news(topic, max_results=5),
        "hackernews": lambda: fetch_hackernews(topic, max_results=5),
        "gnews": lambda: fetch_gnews(topic, max_results=5),
        "youtube": lambda: fetch_youtube(topic, max_results=5),
    }

    results = {"news": [], "hackernews": [], "gnews": [], "youtube": []}

    with ThreadPoolExecutor(max_workers=4) as executor:
        future_to_source = {executor.submit(fn): name for name, fn in fetchers.items()}
        for future in as_completed(future_to_source):
            source_name = future_to_source[future]
            try:
                results[source_name] = future.result()
            except Exception as e:
                # One source failing (timeout, API down, rate limited) no
                # longer breaks the whole search — it just returns nothing
                # from that source, same as it returning zero results today.
                print(f"   ⚠️  {source_name} fetch failed: {e}")
                results[source_name] = []

    return results


def run_pipeline(topic: str, max_results: int = 10) -> dict:
    """
    Main orchestrator — coordinates all agents:
    1. Fetcher Agent: pulls data from NewsAPI + HackerNews + GNews + YouTube
       (NOW PARALLEL — see _fetch_all_sources)
    2. Sentiment Agent: analyzes each item with Groq (NOW PARALLEL internally)
    3. Summary Agent: generates AI narrative
    3b. Keyword Agent: extracts top themes
       (Summary + Keywords NOW run concurrently with each other — see below)
    4. Storage Agent: saves to Supabase
    """

    print(f"\n🔍 Starting SocialPulse pipeline for topic: '{topic}'")

    # ── Agent 1: Fetch data (PARALLEL) ───────────────────
    print("📡 Fetcher Agent: collecting data from 4 sources concurrently...")
    fetched = _fetch_all_sources(topic)
    news_items = fetched["news"]
    hn_items = fetched["hackernews"]
    gnews_items = fetched["gnews"]
    youtube_items = fetched["youtube"]

    all_items = news_items + hn_items + gnews_items + youtube_items
    print(f"   ✅ Fetched {len(news_items)} news + {len(hn_items)} HN + {len(gnews_items)} GNews + {len(youtube_items)} YouTube items")

    if not all_items:
        return {
            "topic": topic,
            "total": 0,
            "items": [],
            "ai_summary": "No data found for this topic.",
            "keywords": [],
            "summary": {
                "positive": 0,
                "negative": 0,
                "neutral": 0,
                "dominant_sentiment": "neutral",
                "dominant_emotion": "neutral",
            }
        }

    # ── Agent 2: Sentiment Analysis (PARALLEL internally) ─
    print("🧠 Sentiment Agent: analyzing sentiment (batches run concurrently)...")
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

    # ── Agent 3 + 3b: AI Summary + Keywords (PARALLEL) ───
    # These two Groq calls don't depend on each other's output — only on
    # analyzed_items — so they no longer wait for one another.
    print("✍️  Summary + Keyword Agents: running concurrently...")
    ai_summary = "Summary unavailable."
    keywords = []
    with ThreadPoolExecutor(max_workers=2) as executor:
        summary_future = executor.submit(generate_ai_summary, topic, analyzed_items, summary)
        keywords_future = executor.submit(extract_keywords, topic, analyzed_items)
        try:
            ai_summary = summary_future.result()
        except Exception as e:
            print(f"   ⚠️  Summary generation failed: {e}")
        try:
            keywords = keywords_future.result()
        except Exception as e:
            print(f"   ⚠️  Keyword extraction failed: {e}")
    print(f"   ✅ Summary + {len(keywords)} keywords generated")

    result = {
        "topic": topic,
        "total": len(analyzed_items),
        "items": analyzed_items,
        "ai_summary": ai_summary,
        "keywords": keywords,
        "summary": summary,
    }

    # ── Agent 4: Save to Supabase ────────────────────────
    print("💾 Storage Agent: saving to Supabase...")
    save_search(topic, result)

    return result