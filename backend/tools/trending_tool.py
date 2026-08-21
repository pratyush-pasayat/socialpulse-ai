import os
import requests

NEWS_API_KEY = os.getenv("NEWS_API_KEY")
GNEWS_API_KEY = os.getenv("GNEWS_API_KEY")
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")


def fetch_trending_news(max_results: int = 15) -> list[str]:
    """Fetch top headlines (not topic-specific) from NewsAPI for trend extraction."""
    url = "https://newsapi.org/v2/top-headlines"
    params = {
        "language": "en",
        "pageSize": max_results,
        "apiKey": NEWS_API_KEY,
    }
    try:
        response = requests.get(url, params=params, timeout=10)
        data = response.json()
        if data.get("status") != "ok":
            print(f"Trending NewsAPI error: {data.get('message')}")
            return []
        return [a.get("title", "") for a in data.get("articles", []) if a.get("title")]
    except Exception as e:
        print(f"Trending NewsAPI error: {e}")
        return []


def fetch_trending_gnews(max_results: int = 15) -> list[str]:
    """Fetch top headlines from GNews for trend extraction."""
    url = "https://gnews.io/api/v4/top-headlines"
    params = {
        "lang": "en",
        "max": max_results,
        "apikey": GNEWS_API_KEY,
    }
    try:
        response = requests.get(url, params=params, timeout=10)
        data = response.json()
        if "articles" not in data:
            print(f"Trending GNews error: {data.get('errors', 'Unknown error')}")
            return []
        return [a.get("title", "") for a in data.get("articles", []) if a.get("title")]
    except Exception as e:
        print(f"Trending GNews error: {e}")
        return []


def fetch_trending_hackernews(max_results: int = 15) -> list[str]:
    """Fetch current front-page HackerNews stories for trend extraction."""
    url = f"https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage={max_results}"
    try:
        response = requests.get(url, timeout=10)
        data = response.json()
        return [hit.get("title", "") for hit in data.get("hits", []) if hit.get("title")]
    except Exception as e:
        print(f"Trending HackerNews error: {e}")
        return []


def fetch_trending_youtube(max_results: int = 15) -> list[str]:
    """Fetch currently trending YouTube video titles for trend extraction."""
    url = "https://www.googleapis.com/youtube/v3/videos"
    params = {
        "part": "snippet",
        "chart": "mostPopular",
        "regionCode": "US",
        "maxResults": max_results,
        "key": YOUTUBE_API_KEY,
    }
    try:
        response = requests.get(url, params=params, timeout=10)
        data = response.json()
        if "items" not in data:
            print(f"Trending YouTube error: {data.get('error', 'Unknown error')}")
            return []
        return [item["snippet"].get("title", "") for item in data.get("items", []) if item.get("snippet")]
    except Exception as e:
        print(f"Trending YouTube error: {e}")
        return []


def fetch_all_trending_content(max_per_source: int = 12) -> dict:
    """
    Fetch broad trending content from all 4 sources — separately, so each
    source's contribution to the topic-extraction prompt can be capped
    evenly (prevents one source's volume from dominating the result).
    """
    return {
        "news": fetch_trending_news(max_per_source),
        "gnews": fetch_trending_gnews(max_per_source),
        "hackernews": fetch_trending_hackernews(max_per_source),
        "youtube": fetch_trending_youtube(max_per_source),
    }