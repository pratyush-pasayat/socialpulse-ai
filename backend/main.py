import os
from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from dotenv import load_dotenv
from agents.orchestrator import run_pipeline
from agents.trending_agent import refresh_trending
from tools.supabase_tool import get_search_history, get_trending_topics, save_trending_topics

load_dotenv()

CRON_SECRET = os.getenv("CRON_SECRET")

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

app.add_middleware(GZipMiddleware, minimum_size=500)


@app.get("/")
def root():
    return {"message": "SocialPulse AI is running 🚀"}


@app.get("/analyze")
def analyze(topic: str, max_results: int = 10):
    """Analyze sentiment for a given topic."""
    result = run_pipeline(topic=topic, max_results=max_results)
    return result


@app.get("/history")
def history(limit: int = 10):
    """Get recent search history from Supabase."""
    return get_search_history(limit=limit)


@app.get("/health")
def health():
    return {"status": "ok"}


# ── NEW: trending topics ─────────────────────────────────

@app.get("/trending")
def trending():
    """
    Public, read-only endpoint. Serves the CACHED trending topics list —
    never triggers a live fetch itself, so it's instant and doesn't touch
    your API quotas no matter how many visitors hit it. Includes
    updated_at so the frontend can show e.g. "Updated 2 hours ago".
    """
    return get_trending_topics()


@app.post("/refresh-trending")
def refresh_trending_endpoint(x_cron_secret: str = Header(default=None)):
    """
    Protected endpoint — only your scheduled cron job should call this,
    not the frontend and not the public. It re-fetches broad content from
    all 4 sources, extracts new topics, and overwrites the cached list.

    Protection: requires an `X-Cron-Secret` header matching CRON_SECRET
    (set in your .env / Render environment variables). Without this,
    anyone who found this URL could spam it and burn your API quota.
    """
    if not CRON_SECRET or x_cron_secret != CRON_SECRET:
        raise HTTPException(status_code=401, detail="Unauthorized")

    topics = refresh_trending()
    save_trending_topics(topics)
    return {"status": "refreshed", "topics": topics}


# NOTE: the old /analyze-stream (SSE) endpoint was removed here — it was
# dead code, never called by the frontend (page.tsx only calls /analyze).
# If real streaming is built later, it should reuse run_pipeline's logic
# via a generator, rather than duplicating the aggregation code again.