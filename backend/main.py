"""
GitScope AI - FastAPI Backend (Groq Edition)
"""

# Load environment variables FIRST - before any other imports
from dotenv import load_dotenv
load_dotenv()

import time
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.analyze import router as analyze_router
from utils.cache import cache

app = FastAPI(
    title="GitScope AI",
    description="Transform any GitHub repository into visual analysis using Groq + LangGraph",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze_router, prefix="/api")


@app.get("/")
async def root():
    return {
        "name": "GitScope AI",
        "version": "2.0.0",
        "powered_by": "Groq + LangGraph + Llama3",
        "docs": "/docs",
    }


@app.get("/health")
async def health():
    return {"status": "ok", "timestamp": time.time()}


@app.get("/cache/stats")
async def cache_stats():
    return {"cached_repos": len(cache), "keys": list(cache.keys())}
