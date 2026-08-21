import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SECRET_KEY")

supabase: Client = create_client(url, key)

def save_search(topic: str, result: dict) -> bool:
    """Save a search result to Supabase. (Unchanged)"""
    try:
        data = {
            "topic": topic,
            "total": result.get("total", 0),
            "positive": result["summary"]["positive"],
            "negative": result["summary"]["negative"],
            "neutral": result["summary"]["neutral"],
            "dominant_sentiment": result["summary"]["dominant_sentiment"],
            "dominant_emotion": result["summary"]["dominant_emotion"],
            "ai_summary": result.get("ai_summary", ""),
        }
        supabase.table("search_history").insert(data).execute()
        print(f"   ✅ Saved search for '{topic}' to Supabase")
        return True
    except Exception as e:
        print(f"   ❌ Supabase error: {e}")
        return False

def get_search_history(limit: int = 10) -> list:
    """Fetch recent search history from Supabase. (Unchanged)"""
    try:
        response = supabase.table("search_history")\
            .select("*")\
            .order("created_at", desc=True)\
            .limit(limit)\
            .execute()
        return response.data
    except Exception as e:
        print(f"❌ Supabase error: {e}")
        return []


# ── NEW: trending topics caching ─────────────────────────

def save_trending_topics(topics: list[str]) -> bool:
    """
    Overwrite the single cached row of trending topics. Using a fixed
    row id=1 (upsert) means there's always exactly one current trending
    list, rather than an ever-growing history table — /refresh-trending
    replaces it every 4 hours.
    """
    try:
        from datetime import datetime, timezone
        supabase.table("trending_topics").upsert({
            "id": 1,
            "topics": topics,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }).execute()
        print(f"   ✅ Saved {len(topics)} trending topics to Supabase")
        return True
    except Exception as e:
        print(f"   ❌ Supabase error saving trending topics: {e}")
        return False


def get_trending_topics() -> dict:
    """
    Fetch the current cached trending topics list PLUS when it was last
    refreshed — the frontend needs updated_at to show something like
    "Updated 2 hours ago" next to the trending panel. Returns empty
    topics + None timestamp if none exist yet (e.g. before the first
    refresh has ever run) — callers should handle that gracefully.
    """
    try:
        response = supabase.table("trending_topics")\
            .select("topics, updated_at")\
            .eq("id", 1)\
            .execute()
        if response.data:
            row = response.data[0]
            return {
                "topics": row.get("topics", []),
                "updated_at": row.get("updated_at"),
            }
        return {"topics": [], "updated_at": None}
    except Exception as e:
        print(f"❌ Supabase error fetching trending topics: {e}")
        return {"topics": [], "updated_at": None}