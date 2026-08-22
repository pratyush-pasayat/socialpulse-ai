import os
from groq import Groq
from tools.trending_tool import fetch_all_trending_content

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def extract_trending_topics(content_by_source: dict, max_per_source: int = 8) -> list[str]:
    """
    Extract 8 concise, real-world topic names from combined headlines/titles
    across all 4 sources. Caps each source's contribution to the prompt so
    one high-volume source (e.g. News) doesn't dominate the result over a
    lower-volume one (e.g. HackerNews).
    """
    sections = []
    for source_name, titles in content_by_source.items():
        capped = titles[:max_per_source]
        if capped:
            sections.append(f"--- {source_name} ---\n" + "\n".join(f"- {t}" for t in capped))

    if not sections:
        return []

    combined = "\n\n".join(sections)

    prompt = f"""You are a trends analyst. Below are current headlines and titles from
several different sources (news, tech community, video platform). Identify
the 8 most significant real-world topics, events, entities, or storylines
that appear across them.

{combined}

Rules:
- Return ONLY a comma-separated list of exactly 8 topics
- Each topic should be short (2-4 words) and recognizable on its own —
  e.g. "Ind vs NZ", "iPhone 17", "Fed rate cut", "OpenAI funding"
- Prefer topics that appear in or are implied by multiple headlines over
  a topic mentioned only once
- Do not include generic words like "news", "update", "today"
- No explanations, no numbering, just the 8 topics

Topics:"""

    try:
        response = client.chat.completions.create(
            model="openai/gpt-oss-20b",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=100,
            temperature=0.4,
            timeout=15,
        )
        raw = response.choices[0].message.content.strip()
        topics = [t.strip() for t in raw.split(",") if t.strip()]
        return topics[:8]
    except Exception as e:
        print(f"Trending extraction error: {e}")
        return []


def refresh_trending() -> list[str]:
    """
    Full refresh pipeline: fetch broad content from all 4 sources, extract
    8 topic names, return them. Caller (main.py's /refresh-trending route)
    is responsible for saving the result to Supabase.
    """
    print("🔥 Trending Agent: fetching broad content from 4 sources...")
    content = fetch_all_trending_content(max_per_source=12)
    total_items = sum(len(v) for v in content.values())
    print(f"   ✅ Collected {total_items} headlines/titles across sources")

    print("🔥 Trending Agent: extracting topics...")
    topics = extract_trending_topics(content)
    print(f"   ✅ Extracted {len(topics)} trending topics")

    return topics