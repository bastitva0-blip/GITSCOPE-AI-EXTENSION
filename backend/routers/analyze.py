"""
GitScope AI - Analyze Router
POST /api/analyze      - Standard analysis
POST /api/analyze/stream - SSE streaming with progress
POST /api/compare      - Compare two repos
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, validator
import asyncio
import json
import re
from agents.graph import run_analysis
from utils.cache import cache_get, cache_set, cache_key

router = APIRouter()


class AnalyzeRequest(BaseModel):
    repo_url: str

    @validator("repo_url")
    def validate_github_url(cls, v):
        v = v.strip()
        if not re.search(r"github\.com/[^/]+/[^/]+", v):
            raise ValueError("Must be a valid GitHub repository URL (e.g. https://github.com/owner/repo)")
        return v


class CompareRequest(BaseModel):
    repo_url_1: str
    repo_url_2: str


@router.post("/analyze")
async def analyze_repo(request: AnalyzeRequest):
    """Analyze a GitHub repository. Returns cached result if available."""
    key = cache_key(request.repo_url)
    cached = cache_get(key)
    if cached:
        return {"cached": True, **cached}

    try:
        result = await run_analysis(request.repo_url)
        cache_set(key, result)
        return {"cached": False, **result}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@router.post("/analyze/stream")
async def analyze_repo_stream(request: AnalyzeRequest):
    """Streaming SSE version with progress updates."""
    async def event_generator():
        key = cache_key(request.repo_url)
        cached = cache_get(key)
        if cached:
            yield f"data: {json.dumps({'type': 'complete', 'cached': True, **cached})}\n\n"
            return

        stages = [
            ("fetch", "Fetching repository from GitHub..."),
            ("analyze", "Analyzing code structure with Llama3..."),
            ("flowchart", "Generating architecture diagram..."),
            ("tech_stack", "Detecting tech stack..."),
            ("issues", "Scanning for issues..."),
            ("summary", "Writing AI summaries..."),
        ]

        for stage_id, message in stages:
            yield f"data: {json.dumps({'type': 'progress', 'stage': stage_id, 'message': message})}\n\n"
            await asyncio.sleep(0.2)

        try:
            result = await run_analysis(request.repo_url)
            cache_set(key, result)
            yield f"data: {json.dumps({'type': 'complete', 'cached': False, **result})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@router.post("/compare")
async def compare_repos(request: CompareRequest):
    """Compare two GitHub repositories."""
    try:
        results = await asyncio.gather(
            run_analysis(request.repo_url_1),
            run_analysis(request.repo_url_2),
            return_exceptions=True,
        )
        if isinstance(results[0], Exception):
            raise HTTPException(400, f"Repo 1 error: {str(results[0])}")
        if isinstance(results[1], Exception):
            raise HTTPException(400, f"Repo 2 error: {str(results[1])}")

        def score_num(s):
            try: return float(s.split("/")[0])
            except: return 0

        s1, s2 = score_num(results[0].get("score", "0")), score_num(results[1].get("score", "0"))
        return {
            "repo_1": results[0],
            "repo_2": results[1],
            "comparison": {
                "score_winner": "repo_1" if s1 > s2 else "repo_2" if s2 > s1 else "tie",
                "tech_overlap": list(
                    set(t["name"] for t in results[0].get("tech_stack", []))
                    & set(t["name"] for t in results[1].get("tech_stack", []))
                ),
                "issues_count": {"repo_1": len(results[0].get("issues", [])), "repo_2": len(results[1].get("issues", []))},
            },
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, str(e))
