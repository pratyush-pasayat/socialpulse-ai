import os
import json
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from agents.orchestrator import run_pipeline, generate_ai_summary, extract_keywords
from tools.supabase_tool import get_search_history, save_search
from tools.news_tool import fetch_news
from tools.hackernews_tool import fetch_hackernews
from tools.gnews_tool import fetch_gnews
from tools.youtube_tool import fetch_youtube
from agents.sentiment_agent import analyze_sentiment

load_dotenv()

app = FastAPI(
    title="SocialPulse AI",
    description="Real-time social listening and sentiment analytics",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "SocialPulse AI is running 🚀"}

@app.get("/analyze")
def analyze(topic: str, max_results: int = 10):
    """Analyze sentiment for a given topic."""
    result = run_pipeline(topic=topic, max_results=max_results)
    return result

@app.get("/analyze-stream")
async def analyze_stream(topic: str, max_results: int = 10):
    """Stream results progressively as each agent completes."""

    async def generate():
        # ── Stage 1: Fetch all data ──────────────────────
        news_items = fetch_news(topic, max_results=5)
        hn_items = fetch_hackernews(topic, max_results=5)
        gnews_items = fetch_gnews(topic, max_results=5)
        youtube_items = fetch_youtube(topic, max_results=5)
        all_items = news_items + hn_items + gnews_items + youtube_items

        # Send raw items immediately so UI can show headlines
        yield f"data: {json.dumps({'stage': 'items', 'items': all_items})}\n\n"

        # ── Stage 2: Sentiment Analysis ──────────────────
        analyzed = analyze_sentiment(all_items)
        yield f"data: {json.dumps({'stage': 'sentiment', 'items': analyzed})}\n\n"

        # ── Stage 3: Aggregate + Summary + Keywords ──────
        sentiment_counts = {"positive": 0, "negative": 0, "neutral": 0}
        emotion_counts = {}

        for item in analyzed:
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

        ai_summary = generate_ai_summary(topic, analyzed, summary)
        keywords = extract_keywords(topic, analyzed)

        yield f"data: {json.dumps({'stage': 'summary', 'summary': summary, 'ai_summary': ai_summary, 'keywords': keywords, 'total': len(analyzed)})}\n\n"

        # ── Stage 4: Save to Supabase ─────────────────────
        save_search(topic, {
            "total": len(analyzed),
            "items": analyzed,
            "ai_summary": ai_summary,
            "keywords": keywords,
            "summary": summary,
        })

        yield f"data: {json.dumps({'stage': 'done'})}\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        }
    )

@app.get("/history")
def history(limit: int = 10):
    """Get recent search history from Supabase."""
    return get_search_history(limit=limit)

@app.get("/health")
def health():
    return {"status": "ok"}