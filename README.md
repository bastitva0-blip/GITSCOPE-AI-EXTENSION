<div align="center">

# 🔭 GitScope AI

### Transform any GitHub repository into visual, interactive analysis — in seconds.

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-gitscope--groq.vercel.app-6366f1?style=for-the-badge)](https://gitscope-groq-zcbq.vercel.app/)
[![Watch Video](https://img.shields.io/badge/🎬_Watch_Demo-Google_Drive-red?style=for-the-badge)](https://drive.google.com/file/d/1813qJv1LybzbKTo0pJxVYArxOX8DelJN/view)
[![View Presentation](https://img.shields.io/badge/📊_Presentation-Google_Slides-orange?style=for-the-badge)](https://docs.google.com/presentation/d/1IseYaZ-TjB6R-6fArLCZrhEjo6anmqOv/edit?usp=sharing&ouid=112410421244667825095&rtpof=true&sd=true)

**Built by Team Elite Coders** — Astitva Bhardwaj · Vaibhav Singh · Harsh Tripathi · Kulshreshtha Sharma

</div>

---

## 🧠 What is GitScope AI?

GitScope AI is an **AI-powered repository intelligence platform** that turns any GitHub URL into instant, visual insights — no setup, no manual reading, no expertise required.

Paste a link. Get architecture diagrams, tech stack breakdown, issue detection, and AI-written summaries in under **30 seconds**.

| 👤 For Founders | ⚙️ For Engineers | 📋 For PMs |
|---|---|---|
| Evaluate open-source tools and vendor repos without reading a single line of code | Onboard faster, spot issues instantly, and navigate unfamiliar repos with confidence | Understand architecture, tech debt, and health scores to make informed product decisions |

---

## 😩 The Problem

Understanding a new codebase is painful:

- **README Overload** — READMEs are incomplete, outdated, or painfully long
- **Architecture Blindness** — Mapping how a codebase is structured takes hours, even for senior engineers
- **New Joiner Struggle** — New team members spend days just navigating a repo before writing a single line of code

**GitScope AI solves all three — in one paste.**

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🗺️ **Architecture Flowchart** | Auto-generated Mermaid.js diagrams that visually map your entire codebase structure |
| ⚙️ **Tech Stack Detection** | Automatically identifies every framework, library, and language used in the repo |
| 🔍 **Issue Detector** | Flags missing tests, absent CI/CD pipelines, no LICENSE file — instantly |
| 📝 **AI Summary** | Dual-mode summaries for beginners and expert engineers — tailored to your level |
| ⭐ **Quality Score** | A single health score capturing repo quality, completeness, and best-practice adherence |
| 🧩 **Chrome Extension** | Analyze repos directly on GitHub — without leaving your browser tab |

---

## 🏗️ Architecture

```
GitHub URL
    │
    ▼
FastAPI Backend  ──────────────────────────────────────────────────────┐
    │                                                                   │
    ▼                                                                   │
LangGraph Pipeline                                                      │
    │                                                                   │
    ├──► fetch_repo     → Pulls all repo data via GitHub REST API      │
    │                                                                   │
    ├──► analyze_code   → LLM-driven deep code comprehension           │
    │         │                                                         │
    │    ┌────┴──────────────────────────────────┐                     │
    │    │      Parallel Agents (simultaneous)   │                     │
    │    ├──► flowchart      (Mermaid.js diagram)│                     │
    │    ├──► tech_stack     (language detection)│                     │
    │    ├──► issue_detector (missing files/CI)  │                     │
    │    └──► summarizer     (beginner + expert) │                     │
    │         │                                  │                     │
    │    merge_results ◄─────────────────────────┘                     │
    │                                                                   │
    └──────────────────────────────────────► React Web App + Extension ┘
```

The entire pipeline is orchestrated by **LangGraph** — agents run in parallel, merge results, and deliver structured output to both the web app and the Chrome Extension simultaneously.

---

## 🤖 Why Groq?

| | |
|---|---|
| ✅ **Free** | Generous free tier at [console.groq.com](https://console.groq.com) — no credit card needed |
| ⚡ **Ultra-fast** | Fastest LLM inference available anywhere |
| 🦙 **Llama3 70B** | Powerful open-source model with massive context window |

### Available Models

| Model | Speed | Quality |
|---|---|---|
| `llama3-70b-8192` | Fast | Best ✅ |
| `llama3-8b-8192` | Fastest | Good |
| `mixtral-8x7b-32768` | Fast | Great |

---

## 🚀 Quick Start

### Step 1 — Backend

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env   # Mac/Linux
copy .env.example .env  # Windows
```

Edit `.env`:

```env
GROQ_API_KEY=gsk_...your-key-here...
GITHUB_TOKEN=ghp_...your-token-here...
GROQ_MODEL=llama3-70b-8192
HOST=0.0.0.0
PORT=8000
```

Start the server:

```bash
python -m uvicorn main:app --reload --port 8000
```

### Step 2 — Frontend

```bash
cd frontend
npm install
npm run dev
```

Open: **http://localhost:5173**

### Step 3 — Get Your API Keys

| Key | How to get it |
|---|---|
| **Groq (free)** | [console.groq.com](https://console.groq.com) → API Keys → Create |
| **GitHub Token** | [github.com/settings/tokens](https://github.com/settings/tokens) → Generate new token |

---

## 📁 Project Structure

```
gitscope/
├── backend/                  # FastAPI + LangGraph + Groq
│   ├── main.py               # App entry point
│   ├── agents/
│   │   ├── graph.py          # LangGraph multi-agent pipeline
│   │   └── prompts.py        # LLM system prompts
│   ├── routers/
│   │   └── analyze.py        # API route: POST /analyze
│   ├── utils/
│   │   └── github.py         # GitHub REST API fetcher
│   └── requirements.txt
│
├── frontend/                 # React + Vite + TailwindCSS
│   ├── src/
│   │   ├── components/       # UI components
│   │   └── pages/            # App pages
│   └── package.json
│
├── extension/                # Chrome Extension (Manifest V3)
│   ├── manifest.json
│   ├── popup.html
│   └── content.js
│
└── prompts/                  # AI prompt documentation
```

---

## ⚔️ Challenges We Overcame

**1. LangGraph State Conflict**
Parallel agents caused state collisions — resolved using `Annotated` type merging with custom reducers in LangGraph.

**2. API Quota Limits**
Single LLM quotas were hit under load — implemented multi-LLM fallback across Groq, Claude & Gemini.

**3. Chrome CSP Policy**
Inline scripts were blocked by Content Security Policy — refactored into separate JS module files compliant with Manifest V3.

**4. GitHub Rate Limiting**
Unauthenticated API calls were throttled — fixed with authenticated token-based requests raising the limit from 60 to 5,000 requests/hour.

---

## 🛠️ Tech Stack

**Frontend & Backend**
- React + Vite + TailwindCSS
- FastAPI + Python
- Chrome Extension (Manifest V3)

**AI & Data Layer**
- 🤖 Groq, Claude & Gemini APIs — powering intelligent analysis
- 🔗 LangGraph — multi-agent pipeline for parallel processing
- 📡 GitHub REST API — real-time repo data fetching

---

## 👥 Team Elite Coders

| Name | Role |
|---|---|
| **Astitva Bhardwaj** | AI/ML & LangGraph Pipeline |
| **Vaibhav Singh** | Backend & API Integration |
| **Harsh Tripathi** | Frontend & Chrome Extension |
| **Kulshreshtha Sharma** | Architecture & DevOps |

---

<div align="center">

Made with ❤️ by **Team Elite Coders**

[![Live Demo](https://img.shields.io/badge/Try_It_Live-6366f1?style=for-the-badge)](https://gitscope-groq-zcbq.vercel.app/)

</div>
| `gemma2-9b-it` | Fast | Good |
