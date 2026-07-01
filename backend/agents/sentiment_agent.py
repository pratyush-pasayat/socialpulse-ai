import os
from groq import Groq

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def analyze_sentiment(items: list[dict]) -> list[dict]:
    """Analyze sentiment in batches of 5 for speed."""
    results = []
    batch_size = 5

    for i in range(0, len(items), batch_size):
        batch = items[i:i + batch_size]
        batch_results = analyze_batch(batch)
        results.extend(batch_results)

    return results


def analyze_batch(items: list[dict]) -> list[dict]:
    """Analyze a batch of items in a single Groq call."""

    numbered = ""
    for idx, item in enumerate(items):
        text = (item.get("title", "") + " " + item.get("text", "")).strip()[:200]
        numbered += f"{idx+1}. {text}\n"

    prompt = f"""Analyze sentiment for each text. Respond in this exact format for each:
N|sentiment|score|emotion|summary

Where:
- N = item number
- sentiment = positive, negative, or neutral
- score = 0.1 to 1.0 (be specific, not always 0.8)
- emotion = one word (hopeful/angry/fearful/sad/excited/neutral/frustrated/skeptical)
- summary = max 10 words describing the text

Texts:
{numbered}
Respond with ONLY the pipe-separated lines, nothing else. No explanations."""

    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=300,
            temperature=0.1,
        )

        raw = response.choices[0].message.content.strip()
        lines = [l.strip() for l in raw.split("\n") if "|" in l]

        results = []
        for idx, item in enumerate(items):
            matched = False
            for line in lines:
                parts = line.split("|")
                if len(parts) >= 5:
                    try:
                        num = int(parts[0].strip())
                        if num == idx + 1:
                            sentiment = parts[1].strip().lower()
                            if sentiment not in ["positive", "negative", "neutral"]:
                                sentiment = "neutral"
                            try:
                                score = float(parts[2].strip())
                                score = max(0.1, min(1.0, score))
                            except:
                                score = 0.5
                            results.append({
                                **item,
                                "sentiment": sentiment,
                                "score": score,
                                "emotion": parts[3].strip().lower(),
                                "summary": parts[4].strip(),
                            })
                            matched = True
                            break
                    except:
                        continue
            if not matched:
                results.append({
                    **item,
                    "sentiment": "neutral",
                    "score": 0.5,
                    "emotion": "neutral",
                    "summary": item.get("title", "")[:80],
                })
        return results

    except Exception as e:
        print(f"Batch sentiment error: {e}")
        return [
            {
                **item,
                "sentiment": "neutral",
                "score": 0.5,
                "emotion": "neutral",
                "summary": item.get("title", "")[:80],
            }
            for item in items
        ]