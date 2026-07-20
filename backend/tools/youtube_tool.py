import os
import requests

YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")

def fetch_youtube(topic: str, max_results: int = 10) -> list[dict]:
    """Fetch YouTube video titles + top comments for a topic — real public sentiment."""

    # Step 1: Search videos related to topic
    search_url = "https://www.googleapis.com/youtube/v3/search"
    search_params = {
        "part": "snippet",
        "q": topic,
        "type": "video",
        "maxResults": min(max_results, 5),
        "order": "relevance",
        "key": YOUTUBE_API_KEY,
    }

    try:
        # NEW: 10s timeout — same reasoning as news_tool.py
        search_response = requests.get(search_url, params=search_params, timeout=10)
        search_data = search_response.json()

        if "items" not in search_data:
            print(f"YouTube search error: {search_data.get('error', 'Unknown error')}")
            return []

        results = []
        for item in search_data.get("items", []):
            video_id = item["id"].get("videoId")
            snippet = item.get("snippet", {})

            results.append({
                "source": "youtube",
                "title": snippet.get("title", ""),
                "text": snippet.get("description", "")[:300],
                "url": f"https://www.youtube.com/watch?v={video_id}",
                "published_at": snippet.get("publishedAt", ""),
                "author": snippet.get("channelTitle", ""),
            })

            # Step 2: Fetch top comments for this video (real public sentiment)
            if video_id and len(results) <= max_results:
                comments = fetch_video_comments(video_id, max_comments=2)
                results.extend(comments)

        return results[:max_results]
    except requests.exceptions.Timeout:
        print("YouTube error: search request timed out after 10s")
        return []
    except Exception as e:
        print(f"YouTube fetch error: {e}")
        return []


def fetch_video_comments(video_id: str, max_comments: int = 2) -> list[dict]:
    """Fetch top comments for a specific video — real public opinion."""
    comments_url = "https://www.googleapis.com/youtube/v3/commentThreads"
    params = {
        "part": "snippet",
        "videoId": video_id,
        "maxResults": max_comments,
        "order": "relevance",
        "key": YOUTUBE_API_KEY,
    }

    try:
        # NEW: 10s timeout — same reasoning as news_tool.py
        response = requests.get(comments_url, params=params, timeout=10)
        data = response.json()

        if "items" not in data:
            return []

        results = []
        for item in data.get("items", []):
            comment = item["snippet"]["topLevelComment"]["snippet"]
            results.append({
                "source": "youtube",
                "title": f"Comment: {comment.get('textDisplay', '')[:80]}",
                "text": comment.get("textDisplay", ""),
                "url": f"https://www.youtube.com/watch?v={video_id}",
                "published_at": comment.get("publishedAt", ""),
                "author": comment.get("authorDisplayName", ""),
            })
        return results
    except requests.exceptions.Timeout:
        # Comments might be slow — that's fine, just skip this video's comments
        return []
    except Exception as e:
        # Comments might be disabled on some videos — that's fine, just skip
        return []