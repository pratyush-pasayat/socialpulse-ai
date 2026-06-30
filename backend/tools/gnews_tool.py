import os
import requests

GNEWS_API_KEY = os.getenv("GNEWS_API_KEY")

def fetch_gnews(topic: str, max_results: int = 10) -> list[dict]:
    """Fetch news articles for a topic using GNews API."""
    url = "https://gnews.io/api/v4/search"
    params = {
        "q": topic,
        "lang": "en",
        "max": max_results,
        "apikey": GNEWS_API_KEY,
    }

    try:
        response = requests.get(url, params=params)
        data = response.json()

        if "articles" not in data:
            print(f"GNews error: {data.get('errors', 'Unknown error')}")
            return []

        articles = []
        for article in data.get("articles", []):
            articles.append({
                "source": "gnews",
                "title": article.get("title", ""),
                "text": article.get("description") or "",
                "url": article.get("url", ""),
                "published_at": article.get("publishedAt", ""),
                "author": article.get("source", {}).get("name", ""),
            })

        return articles
    except Exception as e:
        print(f"GNews fetch error: {e}")
        return []