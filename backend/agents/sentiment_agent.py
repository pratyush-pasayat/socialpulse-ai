import os
from groq import Groq

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def analyze_sentiment(items: list[dict]) -> list[dict]:
    """Analyze sentiment for a list of news/HN items using Groq LLaMA."""
    
    results = []
    
    for item in items:
        text = item.get("title", "") + " " + item.get("text", "")
        text = text.strip()[:500]  # limit tokens
        
        if not text:
            continue

        prompt = f"""Analyze the sentiment of this text and respond in exactly this format:
SENTIMENT: [positive/negative/neutral]
SCORE: [0.0 to 1.0, where 1.0 is most confident]
EMOTION: [one word: excited/angry/fearful/sad/hopeful/neutral]
SUMMARY: [one sentence summary]

Text: {text}"""

        try:
            response = client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=150,
                temperature=0.1,
            )
            
            raw = response.choices[0].message.content.strip()
            parsed = parse_sentiment_response(raw)
            
            results.append({
                **item,
                "sentiment": parsed["sentiment"],
                "score": parsed["score"],
                "emotion": parsed["emotion"],
                "summary": parsed["summary"],
            })

        except Exception as e:
            print(f"Groq error: {e}")
            results.append({
                **item,
                "sentiment": "neutral",
                "score": 0.5,
                "emotion": "neutral",
                "summary": text[:100],
            })
    
    return results


def parse_sentiment_response(raw: str) -> dict:
    """Parse the structured sentiment response from LLaMA."""
    lines = raw.strip().split("\n")
    result = {
        "sentiment": "neutral",
        "score": 0.5,
        "emotion": "neutral",
        "summary": "",
    }
    
    for line in lines:
        if line.startswith("SENTIMENT:"):
            val = line.split(":", 1)[1].strip().lower()
            if val in ["positive", "negative", "neutral"]:
                result["sentiment"] = val
        elif line.startswith("SCORE:"):
            try:
                result["score"] = float(line.split(":", 1)[1].strip())
            except:
                pass
        elif line.startswith("EMOTION:"):
            result["emotion"] = line.split(":", 1)[1].strip().lower()
        elif line.startswith("SUMMARY:"):
            result["summary"] = line.split(":", 1)[1].strip()
    
    return result