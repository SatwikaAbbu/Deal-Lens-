# DealLens — Architecture Documentation

> **For the agent:** Read this file completely before writing any backend code.
> All stack decisions are final. Do not substitute libraries or change patterns
> without explicit instruction. Follow the folder structure exactly.

---

## Table of Contents

1. [Overview](#1-overview)
2. [System Architecture](#2-system-architecture)
3. [Project Structure](#3-project-structure)
4. [Frontend Architecture](#4-frontend-architecture)
5. [Backend Architecture](#5-backend-architecture)
6. [AI Pipeline — Gemini](#6-ai-pipeline--gemini)
7. [Data APIs](#7-data-apis)
8. [Database Schema](#8-database-schema)
9. [Feature Modules](#9-feature-modules)
10. [API Contracts](#10-api-contracts)
11. [Environment Variables](#11-environment-variables)
12. [Build Order & Team Split](#12-build-order--team-split)

---

## 1. Overview

### What DealLens Does

An investor uploads a startup's pitch deck (PDF). DealLens:

1. Extracts every verifiable claim from the deck using Gemini
2. Searches the web to fact-check those claims (Tavily + Serper)
3. Maps real competitors and stress-tests moat claims (Serper + Crunchbase)
4. Researches the founder's public background (Tavily + Crunchbase)
5. Synthesises everything into a structured investment brief using Gemini

**Output:** A deal scorecard + 5 sharp deck-specific investor questions in under 10 minutes.

### Who It's For

- Angel investors evaluating early-stage startups
- Early-stage VC partners reviewing inbound deal flow

### Stack Decision Summary

| Layer | Choice | Why |
|---|---|---|
| Frontend | React + Vite + Tailwind | Fastest path to polished UI, team familiarity |
| Backend | FastAPI (Python) | Async native, all AI/data libs are Python-first |
| PDF parsing | PyMuPDF | 3 lines of code, free, handles 99% of modern PDFs |
| AI — primary | Gemini 3.1 Flash | Best free reasoning, 500 RPD, 1M token context |
| AI — secondary | Gemini 3.1 Flash-Lite | High-volume simple tasks, 1,000 RPD free |
| Web search | Tavily | Returns full page content ready for LLM, not just snippets |
| Competitor data | Serper | Google results as clean JSON, 2,500 free queries |
| Startup data | Crunchbase | Founder + funding database, 7-day free trial |
| Database | Supabase | Hosted Postgres, free tier, 2-min setup |
| Parallelism | asyncio.gather() | Runs 3 API calls simultaneously — 3x speed improvement |

---

## 2. System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                       FRONTEND (React + Vite)                    │
│   Upload Page → Loading Page → Report Page (5 scroll sections)  │
└────────────────────────┬─────────────────────────────────────────┘
                         │  POST /analyse  (multipart PDF)
                         │  ← JSON report response
┌────────────────────────▼─────────────────────────────────────────┐
│                    BACKEND (FastAPI / Python)                     │
│                                                                  │
│  ┌──────────────┐  ┌────────────────────────────────────────┐   │
│  │   PyMuPDF    │  │         Analysis Pipeline              │   │
│  │  PDF → text  │─▶│                                        │   │
│  └──────────────┘  │  Gemini 3.1 Flash (Claim Extraction)   │   │
│                    │         │                              │   │
│                    │         ▼                              │   │
│                    │  asyncio.gather() — parallel calls     │   │
│                    │   ├── Tavily  (market + founder news)  │   │
│                    │   ├── Serper  (competitor Google data) │   │
│                    │   └── Crunchbase (founder + startups)  │   │
│                    │         │                              │   │
│                    │         ▼                              │   │
│                    │  Gemini 3.1 Flash (5 analysis modules) │   │
│                    │         │                              │   │
│                    │         ▼                              │   │
│                    │  Gemini 3.1 Flash (synthesis + Qs)     │   │
│                    │         │                              │   │
│                    │         ▼                              │   │
│                    │  Gemini 3.1 Flash-Lite (scorecard)     │   │
│                    └────────────────────────────────────────┘   │
│                                        │                         │
│                            ┌───────────▼──────────┐             │
│                            │  Supabase (Postgres)  │             │
│                            │  Store report JSON    │             │
│                            └──────────────────────┘             │
└──────────────────────────────────────────────────────────────────┘
```

### Gemini Dual-Model Strategy

DealLens uses two Gemini models strategically to maximise free tier quota.

| Model | Free tier limit | Used for |
|---|---|---|
| `gemini-3.1-flash` | 500 RPD, 10 RPM | Complex analysis — extraction, module analysis, synthesis, questions |
| `gemini-3.1-flash-lite` | 1,000 RPD, 15 RPM | Simple tasks — scorecard aggregation, JSON validation |

A single deck analysis uses ~8 Gemini calls total. At 500 RPD on Flash, you can run ~60 full analyses per day — more than enough for a hackathon demo.

**Rate limit handling:** All Gemini calls include a 3-attempt retry with exponential backoff (10s, 20s, 30s). A 429 on stage will never crash the demo.

---

## 3. Project Structure

```
deallens/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Upload/
│   │   │   │   ├── UploadPage.jsx
│   │   │   │   └── LoadingPage.jsx
│   │   │   ├── Report/
│   │   │   │   ├── ReportPage.jsx           # Shell — sidebar + scroll layout
│   │   │   │   ├── ReportHeader.jsx
│   │   │   │   ├── Section1Scorecard.jsx
│   │   │   │   ├── Section2Founder.jsx
│   │   │   │   ├── Section3Claims.jsx
│   │   │   │   ├── Section4Competitors.jsx
│   │   │   │   └── Section5Questions.jsx
│   │   │   └── shared/
│   │   │       ├── ScoreBar.jsx
│   │   │       ├── VerdictBadge.jsx
│   │   │       ├── StatCard.jsx
│   │   │       ├── ReportCard.jsx
│   │   │       ├── DataTable.jsx
│   │   │       ├── ThreatCell.jsx
│   │   │       ├── ExpandableRow.jsx
│   │   │       ├── QuestionCard.jsx
│   │   │       ├── Skeleton.jsx
│   │   │       └── ErrorBoundary.jsx
│   │   ├── api/
│   │   │   └── analyse.js                   # Axios — POST /analyse
│   │   ├── hooks/
│   │   │   └── useScrollSpy.js              # IntersectionObserver for sidebar
│   │   ├── data/
│   │   │   └── mockReport.js                # Mock JSON for Person 2
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js                   # Must match design.md tokens exactly
│
├── backend/
│   ├── main.py                              # FastAPI app + CORS
│   ├── routers/
│   │   └── analyse.py                       # POST /analyse, GET /report/:id
│   ├── pipeline/
│   │   ├── extractor.py                     # PyMuPDF — PDF bytes → text
│   │   ├── claim_parser.py                  # F1 — Gemini Flash extraction
│   │   ├── tam_checker.py                   # F2 — TAM reality check
│   │   ├── traction_validator.py            # F3 — Traction credibility
│   │   ├── moat_tester.py                   # F4 — Moat stress test
│   │   ├── founder_intel.py                 # F5 — Founder intelligence
│   │   ├── financial_flags.py               # F6 — Financial red flags
│   │   ├── question_gen.py                  # F7 — Question generator
│   │   └── scorecard.py                     # F8 — Scorecard (Flash-Lite)
│   ├── prompts/
│   │   ├── extraction.py
│   │   ├── tam_validation.py
│   │   ├── traction.py
│   │   ├── moat.py
│   │   ├── founder.py
│   │   ├── financials.py
│   │   ├── questions.py
│   │   └── scorecard.py
│   ├── services/
│   │   ├── gemini_client.py                 # Gemini SDK wrapper — dual model + retry
│   │   ├── tavily_client.py
│   │   ├── serper_client.py
│   │   └── crunchbase_client.py
│   ├── db/
│   │   └── supabase_client.py
│   ├── models/
│   │   └── report.py                        # Pydantic models
│   └── requirements.txt
│
├── _project/                                # Planning docs — not deployed
│   ├── design.md
│   ├── page-spec.md
│   ├── architecture.md                      # This file
│   ├── rules.md
│   └── progress.md
│
├── .env                                     # Never commit
├── .env.example                             # Commit this
└── README.md
```

---

## 4. Frontend Architecture

### Tech Stack

| Tool | Purpose |
|---|---|
| React 18 | UI framework |
| Vite 5 | Build tool — faster than CRA |
| Tailwind CSS 3 | Styling — tokens defined in `design.md` |
| Axios | HTTP — PDF upload + report fetch |
| React Router 6 | Client-side routing |

### Routes

| Route | Component | Notes |
|---|---|---|
| `/` | `UploadPage` | Entry point |
| `/loading` | `LoadingPage` | Navigate to `/report/:id` on complete |
| `/report/:id` | `ReportPage` | Fetch report from Supabase on mount |
| `*` | `NotFound` | Dark 404 page |

### State

```javascript
// App.jsx — flat, simple, no Redux
const [file,    setFile]    = useState(null);
const [loading, setLoading] = useState(false);
const [report,  setReport]  = useState(null);
const [error,   setError]   = useState(null);
```

### Axios Upload

```javascript
// src/api/analyse.js
import axios from 'axios';

export async function analyseDeck(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axios.post(
    `${import.meta.env.VITE_API_URL}/analyse`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );

  return response.data;
}
```

### Scroll Spy Hook

```javascript
// src/hooks/useScrollSpy.js
import { useState, useEffect } from 'react';

export function useScrollSpy(sectionIds) {
  const [activeId, setActiveId] = useState(sectionIds[0]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(e => { if (e.isIntersecting) setActiveId(e.target.id); });
      },
      { rootMargin: '-10% 0px -80% 0px' }
    );
    sectionIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return activeId;
}
```

### Mock Report

Person 2 builds all 5 report sections against this. Do not wait for the backend.

```javascript
// src/data/mockReport.js
export const mockReport = {
  scorecard: {
    startup_name: "Ziple",
    overall: 4.5,
    dimensions: {
      founder_credibility: 6,
      market_validity:     5,
      competitive_moat:    3,
      traction_quality:    5,
      financial_soundness: 4
    },
    top_flags: [
      "TAM inflated 8x — citing total grocery not quick commerce",
      "Moat claim unsubstantiated — no dark store infrastructure exists",
      "No Day-30 retention data alongside 10,000 user claim"
    ],
    strengths: [
      "Founder has 2 years relevant domain experience at Swiggy",
      "Funding ask is appropriately sized for stage"
    ]
  },
  founder: {
    name: "Arjun Mehta",
    role: "Co-founder & CEO",
    domain_fit: "MEDIUM-HIGH",
    domain_fit_reason: "2 years Swiggy ops, relevant supply chain background",
    verdict: "First-time founder with strong domain background. No public controversies found.",
    past_ventures: [],
    credibility_signals: ["2yr Swiggy ops experience", "Relevant supply chain background"],
    red_flags: ["No prior exit history", "Limited public footprint"],
    public_summary: "Founder has 2 years at Swiggy in dark store operations. No news mentions of controversy. LinkedIn shows relevant supply chain background."
  },
  claims: {
    tam: {
      verdict: "INFLATED",
      claimed_tam: "₹2.5 lakh crore",
      real_tam: "₹30,000 crore",
      inflation_factor: "8x",
      explanation: "Founder cites total Indian grocery market. Actual addressable quick commerce segment is ₹30,000 crore.",
      source: "Mordor Intelligence, 2026",
      investor_question: "Your TAM cites total grocery at ₹2.5L Cr. Walk me through your actual quick commerce SAM bottom-up."
    },
    traction: {
      flags: [{
        type: "MISSING_RETENTION",
        claim: "10,000 active users",
        problem: "No Day-30 or Day-7 retention data provided alongside user count",
        investor_question: "You claim 10,000 active users — what is your Day-30 retention?"
      }]
    },
    moat: {
      verdict: "WEAK",
      claimed_moat: "30% faster than Zepto via AI-powered routing",
      explanation: "Zepto has 700+ dark stores and 4 years of routing data. Speed without infrastructure is a feature claim, not a moat.",
      investor_question: "What specifically enables your 30% speed advantage, and how long before Zepto replicates it?"
    },
    financials: {
      flags: [
        "Revenue projection jumps 10x in Year 2 with no operational explanation",
        "Pre-revenue valuation of ₹20 crore is not justified by current traction"
      ]
    }
  },
  competitors: [
    { name: "Blinkit",          backing: "Zomato ($800M+)", scale: "1,000+ dark stores", threat_level: "CRITICAL" },
    { name: "Zepto",            backing: "$1.4B raised",     scale: "700+ dark stores",   threat_level: "CRITICAL" },
    { name: "Swiggy Instamart", backing: "Listed",           scale: "600+ dark stores",   threat_level: "CRITICAL" },
    { name: "Flipkart Minutes", backing: "Walmart",          scale: "150+ dark stores",   threat_level: "HIGH"     },
    { name: "Amazon Now",       backing: "Amazon",           scale: "Piloting",           threat_level: "HIGH"     }
  ],
  questions: [
    {
      rank: 1, category: "Market", severity: "HIGH",
      question: "Your deck cites ₹2.5 lakh crore TAM — that's total Indian grocery. Quick commerce is ₹30,000 crore. Walk me through your SAM calculation bottom-up.",
      targets_claim: "TAM of ₹2.5 lakh crore",
      gap_found: "Citing total grocery market instead of quick commerce segment — 8x inflation",
      strong_answer_looks_like: "Founder builds from: target city orders/day × basket size × market share — not a market research citation."
    },
    {
      rank: 2, category: "Moat", severity: "HIGH",
      question: "You claim 30% faster than Zepto via AI routing. Zepto has 700+ dark stores and 4 years of data on this exact problem. What specifically enables your speed advantage?",
      targets_claim: "30% faster than Zepto via AI-powered routing",
      gap_found: "Speed claim with no infrastructure — Zepto's moat is the dark store network, not the algorithm",
      strong_answer_looks_like: "Founder names a specific technical or operational edge that doesn't require matching Zepto's infrastructure."
    },
    {
      rank: 3, category: "Traction", severity: "HIGH",
      question: "You claim 10,000 active users. What is your Day-30 retention, and how do you define 'active'?",
      targets_claim: "10,000 active users",
      gap_found: "No retention data shown — growth without retention is paid acquisition masking churn",
      strong_answer_looks_like: "Founder knows Day-30 retention off the top of their head and defines active as a specific action, not app opens."
    },
    {
      rank: 4, category: "Finance", severity: "MEDIUM",
      question: "Your projections show 10x revenue growth in Year 2. What changes operationally in month 13 that enables this inflection?",
      targets_claim: "₹100Cr ARR by Year 3",
      gap_found: "Hockey-stick projection with no operational explanation — top-down logic, not bottom-up",
      strong_answer_looks_like: "Founder names a specific event: Series A hire, dark store expansion to 3 cities, a key partnership closing."
    },
    {
      rank: 5, category: "Founder", severity: "MEDIUM",
      question: "You have strong Swiggy ops experience but this is your first startup. What is your biggest blind spot as a first-time founder, and who covers it?",
      targets_claim: "Team slide — ex-Swiggy ops",
      gap_found: "Domain fit is strong but no prior founder experience detected",
      strong_answer_looks_like: "Founder names a specific weakness and a specific person or advisor who covers it."
    }
  ]
};
```

---

## 5. Backend Architecture

### Entry Point

```python
# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.analyse import router

app = FastAPI(title="DealLens API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

@app.get("/health")
async def health():
    return {"status": "ok", "version": "2.0.0"}
```

### Main Endpoint

```python
# backend/routers/analyse.py
from fastapi import APIRouter, UploadFile, File, HTTPException
from pipeline.extractor import extract_text
from pipeline.claim_parser import extract_claims
from pipeline.tam_checker import check_tam
from pipeline.traction_validator import validate_traction
from pipeline.moat_tester import stress_test_moat
from pipeline.founder_intel import get_founder_intel
from pipeline.financial_flags import detect_financial_flags
from pipeline.question_gen import generate_questions
from pipeline.scorecard import compute_scorecard
from services.tavily_client import search_tavily
from services.serper_client import search_serper
from services.crunchbase_client import get_person
from db.supabase_client import save_report, get_report
import asyncio

router = APIRouter()

@router.post("/analyse")
async def analyse_deck(file: UploadFile = File(...)):

    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=422, detail="File must be a PDF.")

    # Step 1 — Extract text
    pdf_bytes = await file.read()
    raw_text = extract_text(pdf_bytes)

    if not raw_text.strip():
        raise HTTPException(status_code=422, detail="Could not extract text. PDF may be image-based.")

    # Step 2 — Extract claims (Gemini Flash)
    claims = await extract_claims(raw_text)

    # Step 3 — Parallel data fetch
    founder_name = claims["founders"][0]["name"] if claims.get("founders") else ""
    category     = claims.get("category", "startup")

    tavily_results, serper_results, crunchbase_results = await asyncio.gather(
        search_tavily(f"{category} market size India 2025 TAM"),
        search_serper(f"{category} India startup competitors funded 2025"),
        get_person(founder_name)
    )

    # Step 4 — Parallel module analysis (Gemini Flash)
    tam_r, traction_r, moat_r, founder_r, finance_r = await asyncio.gather(
        check_tam(claims.get("market_claims", []), tavily_results),
        validate_traction(claims.get("traction_claims", [])),
        stress_test_moat(claims.get("moat_claims", []), serper_results),
        get_founder_intel(claims.get("founders", []), tavily_results, crunchbase_results),
        detect_financial_flags(claims.get("financial_claims", []))
    )

    # Step 5 — Synthesis (Gemini Flash)
    all_flags = {"tam": tam_r, "traction": traction_r, "moat": moat_r,
                 "founder": founder_r, "financials": finance_r}
    questions = await generate_questions(all_flags, claims)

    # Step 6 — Scorecard (Gemini Flash-Lite)
    scorecard = await compute_scorecard(all_flags, claims)

    # Step 7 — Assemble + store
    report = {
        "scorecard":   scorecard,
        "founder":     founder_r,
        "claims":      {"tam": tam_r, "traction": traction_r, "moat": moat_r, "financials": finance_r},
        "competitors": moat_r.get("competitors", []),
        "questions":   questions,
        "file_name":   file.filename
    }

    report_id = await save_report(report)
    return {"report_id": report_id, **report}


@router.get("/report/{report_id}")
async def get_report_by_id(report_id: str):
    report = await get_report(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found.")
    return report
```

### PDF Extraction

```python
# backend/pipeline/extractor.py
import fitz  # PyMuPDF

def extract_text(pdf_bytes: bytes) -> str:
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    text = ""
    for i, page in enumerate(doc):
        page_text = page.get_text().strip()
        if page_text:
            text += f"\n--- SLIDE {i + 1} ---\n{page_text}\n"
    doc.close()
    return text.strip()
```

### Requirements

```
# backend/requirements.txt
fastapi==0.136.1
uvicorn==0.46.0
python-multipart==0.0.27
pymupdf==1.27.2.3
google-genai==1.73.1
tavily-python==0.7.24
httpx==0.28.1
supabase==2.29.0
pydantic==2.13.3
python-dotenv==1.2.2
```

---

## 6. AI Pipeline — Gemini

### Gemini Client (Multi-Key Rotation)

```python
# backend/services/gemini_client.py
import google.genai as genai
import os, asyncio, json, time

# Detects GEMINI_API_KEY_1...10 for instant failover rotation
def _load_clients():
    keys = [os.getenv(f"GEMINI_API_KEY_{i}") for i in range(1, 11) if os.getenv(f"GEMINI_API_KEY_{i}")]
    if not keys: keys = [os.getenv("GEMINI_API_KEY")]
    return [genai.Client(api_key=k) for k in keys if k]

_CLIENT_POOL = _load_clients()
_CURRENT_INDEX = 0

# Model: 3.1 Flash Lite (Highest free quota: 500 RPD / 15 RPM)
FLASH = "gemini-3.1-flash-lite-preview"

async def call_gemini(system: str, user: str, model: str = FLASH):
    """
    Rotates keys on failure. If Key A hits a 429/503, immediately swaps 
    to Key B to ensure 100% uptime during the demo.
    """
    # Logic handles round-robin and instant failover...
    return await asyncio.to_thread(_call_sync, model, system, user)
```

### How Gemini is Called — 3 Times Per Report

| Call | Model | Input | Output |
|---|---|---|---|
| 1 — Extraction | 3.1 Flash Lite | Raw deck text | Claim manifest JSON |
| 2 — Analysis ×5 | 3.1 Flash Lite | Claims + API search results | Verdict JSON per module |
| 3 — Synthesis | 3.1 Flash Lite | All flags + original claims | 5 questions JSON |
| Scorecard | 3.1 Flash Lite | All flags | Score JSON |

### Prompt Rules — Apply to Every Prompt

1. Start with a direct role: `"You are a senior VC analyst..."`
2. List explicit output requirements
3. End with: `"Return ONLY valid JSON. No explanation. No markdown code blocks."`
4. Temperature is always 0.1
5. Never ask the model to "try its best" — give it specific constraints

### Core Prompts

```python
# backend/prompts/extraction.py
SYSTEM = """
You are a senior VC analyst reviewing a startup pitch deck.
Extract every verifiable factual claim — numbers, comparisons, credentials, projections.
Do NOT evaluate or summarise. Extract only.
Return ONLY valid JSON. No explanation. No markdown code blocks.

Required JSON structure:
{
  "startup_name": "string",
  "category": "string",
  "founders": [{"name": "string", "role": "string", "background": "string"}],
  "market_claims": [{"claim": "string", "slide": "number", "number_mentioned": "string"}],
  "traction_claims": [{"claim": "string", "metric_type": "string", "value": "string"}],
  "moat_claims": [{"claim": "string", "type": "string"}],
  "financial_claims": [{"claim": "string", "type": "string", "value": "string"}],
  "competitor_claims": [{"claim": "string", "competitors_mentioned": ["string"]}],
  "funding_ask": {"amount": "string", "valuation": "string", "use_of_funds": "string"}
}
"""
```

```python
# backend/prompts/tam_validation.py
SYSTEM = """
You are a VC analyst fact-checking a founder's market size claim.
You have the founder's TAM claim and real web research data.

Rules:
- Give a clear verdict: VERIFIED, INFLATED, or UNSUBSTANTIATED
- Never say "it depends" — commit to a verdict
- If inflated, state the inflation factor (e.g. "8x")
- Cite the specific source used
- Return ONLY valid JSON. No explanation. No markdown code blocks.

Required JSON structure:
{
  "verdict": "INFLATED | VERIFIED | UNSUBSTANTIATED",
  "claimed_tam": "string",
  "real_tam": "string",
  "inflation_factor": "string or null",
  "explanation": "string — 2-3 sentences max",
  "source": "string",
  "investor_question": "string — the exact question to ask the founder"
}
"""
```

```python
# backend/prompts/questions.py
SYSTEM = """
You are a seasoned angel investor preparing for your first meeting with this startup.
You have a complete analysis of their pitch deck with all red flags identified.

Generate EXACTLY 5 investor questions. Rules:
1. Each question MUST reference a specific claim from THIS deck — no generic questions
2. NEVER ask "what is your vision?" or "where do you see yourself in 5 years?"
3. Order by severity — most important first
4. Each question must be uncomfortable but fair
5. Return ONLY valid JSON. No markdown code blocks.

Required JSON structure:
{
  "questions": [
    {
      "rank": 1,
      "category": "Market | Moat | Traction | Founder | Finance",
      "severity": "HIGH | MEDIUM",
      "question": "string",
      "targets_claim": "string",
      "gap_found": "string",
      "strong_answer_looks_like": "string"
    }
  ]
}
"""
```

---

## 7. Data APIs

### Tavily

```python
# backend/services/tavily_client.py
from tavily import TavilyClient
import os, asyncio

_client = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))

async def search_tavily(query: str, max_results: int = 5) -> list[dict]:
    """Returns full page content — not snippets. Use for market reports and founder news."""
    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(
        None,
        lambda: _client.search(query=query, max_results=max_results, include_raw_content=True)
    )
    return result.get("results", [])
```

Free tier: 1,000 searches/month. Use for: market reports, founder news, full article content.

### Serper

```python
# backend/services/serper_client.py
import httpx, os

async def search_serper(query: str, num: int = 10) -> list[dict]:
    """Google results as JSON. Fast, broad. Use for competitor lists and headlines."""
    async with httpx.AsyncClient() as client:
        r = await client.post(
            "https://google.serper.dev/search",
            headers={"X-API-KEY": os.getenv("SERPER_API_KEY")},
            json={"q": query, "num": num},
            timeout=10.0
        )
        r.raise_for_status()
        return r.json().get("organic", [])
```

Free tier: 2,500 queries. Use for: competitor names, funding news, press coverage.

### Crunchbase

```python
# backend/services/crunchbase_client.py
import httpx, os

async def get_person(name: str) -> dict:
    """
    Founder lookup. Returns empty dict if not found — never crashes the pipeline.
    Activate 7-day free trial the morning of Day 1.
    """
    if not name:
        return {}
    try:
        async with httpx.AsyncClient() as client:
            r = await client.get(
                "https://api.crunchbase.com/api/v4/searches/people",
                params={"user_key": os.getenv("CRUNCHBASE_API_KEY")},
                json={
                    "field_ids": ["first_name", "last_name", "primary_job_title",
                                  "primary_organization", "num_founded_organizations"],
                    "limit": 1
                },
                timeout=10.0
            )
            return r.json()
    except Exception:
        return {}  # Crunchbase failure never blocks the report
```

### Parallel Pattern — Always Use This

```python
# Never call APIs sequentially — always gather
# Sequential = ~9 seconds. Parallel = ~3 seconds.
results = await asyncio.gather(
    search_tavily(market_query),
    search_serper(competitor_query),
    get_person(founder_name)
)
```

---

## 8. Database Schema

```sql
-- Run once in Supabase SQL editor before the hackathon

create table analyses (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz default now(),
  startup_name  text,
  file_name     text,
  report        jsonb,
  overall_score numeric(3,1),
  status        text default 'completed'
);
```

```python
# backend/db/supabase_client.py
from supabase import create_client
import os

_sb = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_ANON_KEY"))

async def save_report(report: dict) -> str:
    data = _sb.table("analyses").insert({
        "startup_name": report.get("scorecard", {}).get("startup_name", "Unknown"),
        "file_name":    report.get("file_name", ""),
        "report":       report,
        "overall_score": report.get("scorecard", {}).get("overall", 0)
    }).execute()
    return data.data[0]["id"]

async def get_report(report_id: str) -> dict | None:
    data = _sb.table("analyses").select("*").eq("id", report_id).execute()
    return data.data[0]["report"] if data.data else None
```

---

## 9. Feature Modules

| Module | File | Priority | APIs used | Est. time |
|---|---|---|---|---|
| F1 — Claim Extractor | `claim_parser.py` | **Build first** | Gemini 2.5 Flash | 2h |
| F2 — TAM Reality Check | `tam_checker.py` | **Must ship** | Tavily → Gemini 2.5 Flash | 2h |
| F4 — Moat Stress Test | `moat_tester.py` | **Must ship** | Serper → Gemini 2.5 Flash | 3h |
| F5 — Founder Intel | `founder_intel.py` | **Must ship** | Tavily + Crunchbase → Gemini 2.5 Flash | 2.5h |
| F7 — Question Generator | `question_gen.py` | **Never cut** | Gemini 2.5 Flash | 2h |
| F8 — Deal Scorecard | `scorecard.py` | **Must ship** | Gemini 2.5 Flash | 1.5h |
| F3 — Traction Validator | `traction_validator.py` | Cut if needed | Gemini 2.5 Flash only | 1.5h |
| F6 — Financial Flags | `financial_flags.py` | Cut if needed | Gemini 2.5 Flash only | 1.5h |

**If behind schedule:** Merge F3 and F6 into the scorecard as text flags. Never cut F7.

---

## 10. API Contracts

### POST `/analyse`

**Request:** `multipart/form-data` with `file` (PDF, max 20MB)

**Response 200:**
```json
{
  "report_id": "uuid",
  "file_name": "ziple-deck.pdf",
  "scorecard": {
    "startup_name": "string",
    "overall": 4.5,
    "dimensions": {
      "founder_credibility": 6,
      "market_validity": 5,
      "competitive_moat": 3,
      "traction_quality": 5,
      "financial_soundness": 4
    },
    "top_flags": ["string", "string", "string"],
    "strengths": ["string", "string"]
  },
  "founder": {
    "name": "string",
    "role": "string",
    "domain_fit": "HIGH | MEDIUM-HIGH | MEDIUM | LOW",
    "domain_fit_reason": "string",
    "verdict": "string",
    "past_ventures": ["string"],
    "credibility_signals": ["string"],
    "red_flags": ["string"],
    "public_summary": "string"
  },
  "claims": {
    "tam": {
      "verdict": "VERIFIED | INFLATED | UNSUBSTANTIATED",
      "claimed_tam": "string",
      "real_tam": "string",
      "inflation_factor": "string | null",
      "explanation": "string",
      "source": "string",
      "investor_question": "string"
    },
    "traction": {
      "flags": [{ "type": "string", "claim": "string", "problem": "string", "investor_question": "string" }]
    },
    "moat": {
      "verdict": "STRONG | WEAK | UNSUBSTANTIATED",
      "claimed_moat": "string",
      "explanation": "string",
      "investor_question": "string",
      "competitors": [{ "name": "string", "backing": "string", "scale": "string", "threat_level": "CRITICAL | HIGH | MEDIUM | LOW" }]
    },
    "financials": { "flags": ["string"] }
  },
  "competitors": [{ "name": "string", "backing": "string", "scale": "string", "threat_level": "string" }],
  "questions": [{
    "rank": 1,
    "category": "Market | Moat | Traction | Founder | Finance",
    "severity": "HIGH | MEDIUM",
    "question": "string",
    "targets_claim": "string",
    "gap_found": "string",
    "strong_answer_looks_like": "string"
  }]
}
```

**Response 422:** `{ "detail": "File must be a PDF." }`
**Response 404:** `{ "detail": "Report not found." }`
**Response 500:** `{ "detail": "Analysis failed at module: tam_checker." }`

---

## 11. Environment Variables

```bash
# .env — NEVER commit

# Gemini — free, no credit card
# Use multiple keys from different accounts to multiply your quota
GEMINI_API_KEY_1=AIza...
GEMINI_API_KEY_2=AIza...
GEMINI_API_KEY_3=AIza...

# Tavily — 1,000 free searches/month
# Get from: https://app.tavily.com
TAVILY_API_KEY=tvly-...

# Serper — 2,500 free queries
# Get from: https://serper.dev
SERPER_API_KEY=...

# Crunchbase — 7-day free trial
# Activate morning of Day 1
CRUNCHBASE_API_KEY=...

# Supabase — free tier
# Get from: Project Settings → API
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=eyJ...

# Frontend
VITE_API_URL=http://localhost:8000
```

**Pre-hackathon checklist:**
- [ ] Gemini API key from Google AI Studio (instant, free)
- [ ] Tavily API key (instant signup)
- [ ] Serper API key (instant signup)
- [ ] Crunchbase trial — activate Day 1 morning
- [ ] Supabase project created + SQL schema run

---

## 12. Build Order & Team Split

### Person 1 — Backend + AI

| Hour | Task | Done when |
|---|---|---|
| 0–1 | FastAPI setup, CORS, `/health`, `.env` loaded | `GET /health` → 200 |
| 1–2 | PyMuPDF — extract text from real PDF | Clean text in console |
| 2–4 | F1 Claim extractor — Gemini prompt + JSON parsing | Valid claim JSON from test deck |
| 4–6 | Tavily + Serper + Crunchbase + `asyncio.gather()` | All 3 fire in parallel |
| 6–8 | F2 TAM checker + F4 Moat stress test | Both return verdict JSON |
| 8–10 | F5 Founder intel + F3 Traction validator | Both return structured output |
| 10–11 | F6 Financial flags | Returns flag list |
| 11–13 | F7 Questions + F8 Scorecard (Flash-Lite) | Full report JSON assembled |
| 13–15 | Supabase save/fetch + `GET /report/:id` | Report persists across requests |
| 15–16 | Error handling, retry logic, edge cases | No crash on image-based PDFs |

### Person 2 — Frontend

| Hour | Task | Done when |
|---|---|---|
| 0–1 | React + Vite + Tailwind setup, tailwind.config tokens | App on localhost:5173 |
| 1–3 | Upload page — drag-and-drop, states, error handling | PDF selectable |
| 3–5 | Loading page — steps, progress bar, insight cards, timing | 5 steps advance correctly |
| 5–7 | Section 1 Scorecard — stat cards, animated score bars | Renders from mockReport.js |
| 7–9 | Section 2 Founder + Section 3 Claims table (expandable) | Both render with mock data |
| 9–11 | Section 4 Competitors + Section 5 Questions + copy btn | All 5 sections render |
| 11–13 | Sidebar scroll spy, anchor links, smooth scroll | Sidebar highlights on scroll |
| 13–15 | Connect Axios to backend — real end-to-end loop | Upload → real report |
| 15–16 | Skeleton states, error boundaries, polish | Clean on laptop screen |

### Integration Checkpoint — Hour 13

Both people stop. Together:
1. Run full pipeline on Ziple mock deck
2. Fix JSON shape mismatches between backend and frontend
3. Confirm: upload PDF → loading page → report page with real data

### Demo Prep — Hour 16+

- Prepare 3 decks: Ziple (manufactured), one real pre-seed deck, one funded startup deck
- Know exactly what DealLens says about each before going on stage
- The winning moment: read Question 1 aloud — it will reference a real claim from the deck

---

*DealLens Architecture · v2.0 · Gemini 2.5 Flash · Bower School of Entrepreneurship Hackathon*
