import os
import requests
from datetime import datetime, timedelta

NEWS_API_KEY = os.getenv("NEWS_API_KEY")

def fetch_news(topic: str, days_back: int = 1, max_results: int = 20) -> list[dict]:
    """Fetch news articles for a given topic using NewsAPI."""
    url = "https://newsapi.org/v2/everything"
    from_date = (datetime.now() - timedelta(days=days_back)).strftime("%Y-%m-%d")

    params = {
        "q": topic,
        "from": from_date,
        "sortBy": "publishedAt",
        "language": "en",
        "pageSize": max_results,
        "apiKey": NEWS_API_KEY,
    }

    response = requests.get(url, params=params)
    data = response.json()

    if data.get("status") != "ok":
        print(f"NewsAPI error: {data.get('message')}")
        return []

    articles = []
    for article in data.get("articles", []):
        articles.append({
            "source": "news",
            "title": article.get("title", ""),
            "text": article.get("description") or article.get("content") or "",
            "url": article.get("url", ""),
            "published_at": article.get("publishedAt", ""),
            "author": article.get("source", {}).get("name", ""),
        })

    return articles