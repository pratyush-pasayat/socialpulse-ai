import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from agents.orchestrator import run_pipeline

load_dotenv()

app = FastAPI(
    title="SocialPulse AI",
    description="Real-time social listening and sentiment analytics",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "SocialPulse AI is running 🚀"}

@app.get("/analyze")
def analyze(topic: str, max_results: int = 10):
    """Analyze sentiment for a given topic."""
    result = run_pipeline(topic=topic, max_results=max_results)
    return result

@app.get("/health")
def health():
    return {"status": "ok"}