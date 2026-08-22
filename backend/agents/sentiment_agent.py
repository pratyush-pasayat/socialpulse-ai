import os
from concurrent.futures import ThreadPoolExecutor, as_completed
from groq import Groq

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def analyze_sentiment(items: list[dict]) -> list[dict]:
    """
    Analyze sentiment in batches of 5 — PARALLELIZED VERSION.

    Original behavior: batches were sent to Groq one after another (sequential),
    so total time = sum of every batch's response time.

    New behavior: all batches are sent to Groq at the same time using a thread
    pool, so total time ≈ the slowest single batch's response time, not the sum.

    Results are still returned in the same order as the input `items`, so
    nothing downstream (main.py, orchestrator.py, the frontend) needs to change.
    """
    batch_size = 5
    batches = [items[i:i + batch_size] for i in range(0, len(items), batch_size)]

    if not batches:
        return []

    # Run every batch concurrently instead of one at a time.
    # max_workers caps how many Groq calls can be "in flight" simultaneously —
    # capped at 4 to stay well under Groq's free-tier 30 RPM limit even if
    # multiple users search at the same time.
    results_by_batch_index = {}
    with ThreadPoolExecutor(max_workers=min(4, len(batches))) as executor:
        future_to_index = {
            executor.submit(analyze_batch, batch): idx
            for idx, batch in enumerate(batches)
        }
        for future in as_completed(future_to_index):
            idx = future_to_index[future]
            try:
                results_by_batch_index[idx] = future.result()
            except Exception as e:
                # If a whole batch call unexpectedly throws (shouldn't normally
                # happen since analyze_batch has its own try/except), fall back
                # to neutral placeholders for that batch instead of crashing
                # the entire search.
                print(f"Batch {idx} failed unexpectedly: {e}")
                results_by_batch_index[idx] = [
                    {**item, "sentiment": "neutral", "score": 0.5,
                     "emotion": "neutral", "summary": item.get("title", "")[:80]}
                    for item in batches[idx]
                ]

    # Reassemble in original order (batch 0's items, then batch 1's, etc.)
    results = []
    for idx in range(len(batches)):
        results.extend(results_by_batch_index[idx])
    return results


def analyze_batch(items: list[dict]) -> list[dict]:
    """Analyze a batch of items in a single Groq call. (Unchanged from original.)"""

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
            model="openai/gpt-oss-20b",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=300,
            temperature=0.1,
            timeout=15,  # NEW: don't let one slow batch hang the whole pool
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