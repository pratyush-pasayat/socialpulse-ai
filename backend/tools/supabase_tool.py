import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SECRET_KEY")

supabase: Client = create_client(url, key)

def save_search(topic: str, result: dict) -> bool:
    """Save a search result to Supabase."""
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
    """Fetch recent search history from Supabase."""
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