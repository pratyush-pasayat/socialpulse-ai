# SocialPulse AI 🔍

> Real-time social listening and sentiment analytics powered by AI agents

## What is SocialPulse AI?

SocialPulse AI is a multi-agent social intelligence platform that monitors any topic across the internet in real time, analyzes public sentiment using AI, and surfaces actionable insights — all in seconds.

Search any topic (brand, event, technology, person) and instantly get:
- **What people are saying** across News, HackerNews, GNews, and YouTube
- **How they feel** — positive, negative, or neutral with emotion detection
- **Why it matters** — AI-generated executive summary with trending themes
- **Visual breakdown** — sentiment distribution and source comparison charts

---

## Live Demo

🌐 **Frontend:** https://socialpulse-ai-drab.vercel.app  
🔧 **Backend API:** https://socialpulse-ai-backend-7lzo.onrender.com/docs

---

## Multi-Agent Architecture

SocialPulse AI uses a pipeline of 5 specialized AI agents:

┌─────────────────────────────────────────────────────────┐

│                    Orchestrator Agent                    │

│              Coordinates all agent execution             │

└────────────┬────────────────────────────────────────────┘

│

┌────────▼────────┐

│  Fetcher Agent  │  ← NewsAPI + HackerNews + GNews + YouTube

└────────┬────────┘

│

┌────────▼────────┐

│ Sentiment Agent │  ← Groq (LLaMA 3.1) batch analysis

└────────┬────────┘

│

┌────────▼────────┐

│  Summary Agent  │  ← AI narrative generation

└────────┬────────┘

│

┌────────▼────────┐

│ Keyword Agent   │  ← Theme extraction

└────────┬────────┘

│

┌────────▼────────┐

│ Storage Agent   │  ← Supabase persistence

└─────────────────┘

---

## Tech Stack

### Backend
| Tool | Purpose |
|------|---------|
| FastAPI | REST API server |
| Groq (LLaMA 3.1 8B) | Sentiment analysis + AI summaries |
| NewsAPI | Mainstream news articles |
| GNews API | Additional news coverage |
| HackerNews (Algolia) | Tech community discussions |
| YouTube Data API v3 | Video titles + public comments |
| Supabase (PostgreSQL) | Search history persistence |
| Python 3.11 | Backend language |

### Frontend
| Tool | Purpose |
|------|---------|
| Next.js 16 | React framework |
| TypeScript | Type safety |
| Recharts | Sentiment visualizations |
| Axios | API communication |
| Tailwind CSS | Utility styling |
| Vercel | Frontend deployment |

### Infrastructure
- **Backend:** Render (free tier)
- **Frontend:** Vercel (free tier)
- **Database:** Supabase (free tier)
- **AI:** Groq API (free tier)

> 💡 Entire project runs on free tiers — $0/month

---

## Features

- 🔍 **Real-time search** across 4 data sources simultaneously
- 🧠 **AI sentiment analysis** — positive/negative/neutral with emotion detection
- ✍️ **AI executive summary** — 3-sentence narrative from Groq LLaMA
- 🔑 **Keyword extraction** — trending themes from all articles
- 📊 **Visual charts** — pie chart + source comparison bar chart
- 🕐 **Search history** — powered by Supabase, clickable for re-analysis
- 🌙 **Dark/Light mode** — animated toggle with glass morphism UI
- 📱 **Mobile responsive** — works on all screen sizes

---

## Project Structure

socialpulse-ai/

├── backend/

│   ├── agents/

│   │   ├── orchestrator.py      # Main pipeline coordinator

│   │   ├── sentiment_agent.py   # Batch sentiment analysis

│   │   └── fetcher_agent.py     # Data fetching coordinator

│   ├── tools/

│   │   ├── news_tool.py         # NewsAPI integration

│   │   ├── hackernews_tool.py   # HackerNews integration

│   │   ├── gnews_tool.py        # GNews integration

│   │   ├── youtube_tool.py      # YouTube Data API integration

│   │   └── supabase_tool.py     # Database operations

│   ├── api/

│   │   └── routes.py

│   ├── main.py                  # FastAPI app + endpoints

│   └── requirements.txt

├── frontend/

│   ├── app/

│   │   ├── components/

│   │   │   ├── SummaryCards.tsx     # Animated stat cards

│   │   │   ├── SentimentChart.tsx   # Pie chart

│   │   │   ├── BarChart.tsx         # Source comparison

│   │   │   ├── ResultsTable.tsx     # Article list

│   │   │   ├── Keywords.tsx         # Theme tags

│   │   │   └── SearchHistory.tsx    # Recent searches

│   │   ├── globals.css

│   │   ├── layout.tsx

│   │   └── page.tsx                 # Main app page

│   └── package.json

└── README.md

---

## Local Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- conda (recommended)

### 1. Clone the repo
```bash
git clone https://github.com/pratyush-pasayat/socialpulse-ai.git
cd socialpulse-ai
```

### 2. Backend setup
```bash
cd backend
conda create -n socialpulse python=3.11 -y
conda activate socialpulse
pip install -r requirements.txt
```

Create `backend/.env`:
```env
GROQ_API_KEY=your_groq_key
NEWS_API_KEY=your_newsapi_key
GNEWS_API_KEY=your_gnews_key
YOUTUBE_API_KEY=your_youtube_key
SUPABASE_URL=your_supabase_url
SUPABASE_SECRET_KEY=your_supabase_secret
```

Run backend:
```bash
uvicorn main:app --reload --port 8000
```

### 3. Frontend setup
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Health check |
| `/analyze?topic=X` | GET | Full pipeline analysis |
| `/history` | GET | Recent search history |
| `/health` | GET | Backend status |

---

## Kaggle Capstone

This project was built for the **AI Agents: Intensive Vibe Coding Capstone Project** (Kaggle x Google, 2026).

**Track:** Freestyle / Agents for Business

**Concepts demonstrated:**
- ✅ Multi-agent system with orchestrator pattern
- ✅ Real-world data integration (4 sources)
- ✅ LLM-powered analysis and summarization
- ✅ Persistent storage with Supabase
- ✅ Production deployment (Render + Vercel)

---

## Author

**Pratyush Kumar Pasayat** 
GitHub: [@pratyush-pasayat](https://github.com/pratyush-pasayat)

---

## License

MIT License — feel free to use, modify, and distribute.