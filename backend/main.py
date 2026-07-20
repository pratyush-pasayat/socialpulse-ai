import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from dotenv import load_dotenv
from agents.orchestrator import run_pipeline
from tools.supabase_tool import get_search_history

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

# NEW: gzip-compress responses over ~500 bytes — shrinks the JSON payload
# sent to the browser (your /analyze responses can be several KB), which
# helps load time especially on slower connections. No behavior change,
# purely a transport-level optimization — the frontend receives the same
# JSON either way, the browser decompresses it automatically.
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


# NOTE: the old /analyze-stream (SSE) endpoint was removed here — it was
# dead code, never called by the frontend (page.tsx only calls /analyze).
# If real streaming is built later, it should reuse run_pipeline's logic
# via a generator, rather than duplicating the aggregation code again.