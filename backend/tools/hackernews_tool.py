import requests

def fetch_hackernews(topic: str, max_results: int = 20) -> list[dict]:
    """Fetch HackerNews stories matching a topic."""
    search_url = f"https://hn.algolia.com/api/v1/search?query={topic}&tags=story&hitsPerPage={max_results}"

    try:
        # NEW: 10s timeout — same reasoning as news_tool.py
        response = requests.get(search_url, timeout=10)
        data = response.json()

        results = []
        for hit in data.get("hits", []):
            results.append({
                "source": "hackernews",
                "title": hit.get("title", ""),
                "text": hit.get("story_text") or hit.get("title") or "",
                "url": hit.get("url", ""),
                "published_at": hit.get("created_at", ""),
                "author": hit.get("author", ""),
            })

        return results
    except requests.exceptions.Timeout:
        print("HackerNews error: request timed out after 10s")
        return []
    except Exception as e:
        print(f"HackerNews error: {e}")
        return []