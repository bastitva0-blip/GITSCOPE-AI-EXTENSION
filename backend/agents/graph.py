import json
import asyncio
import re
import os
from typing import TypedDict
from dotenv import load_dotenv
load_dotenv()

from langgraph.graph import StateGraph, END
from agents.prompts import ANALYZER_PROMPT, FLOWCHART_PROMPT, ISSUE_DETECTOR_PROMPT, SUMMARIZER_PROMPT
from utils.github import fetch_repo_data
from utils.groq_client import groq_chat, parse_json_response

class RepoState(TypedDict):
    repo_url: str
    repo_data: dict
    analysis: dict
    flowchart: str
    tech_stack: list
    issues: list
    summary: dict
    score: str
    error: str

async def fetch_repo_node(state: RepoState) -> dict:
    try:
        repo_data = await fetch_repo_data(state["repo_url"])
        return {"repo_data": repo_data}
    except Exception as e:
        return {"error": f"Failed to fetch repo: {str(e)}"}

async def analyze_code_node(state: RepoState) -> dict:
    if state.get("error"):
        return {"analysis": state.get("analysis", {})}
    repo = state["repo_data"]
    context = f"""
Repository: {repo['metadata']['full_name']}
Description: {repo['metadata']['description']}
Language: {repo['metadata']['language']}
File Tree: {chr(10).join(repo['file_tree'][:100])}
Key Files: {json.dumps({k: v[:500] for k, v in repo['key_files'].items()}, indent=2)}
"""
    try:
        response = await asyncio.get_event_loop().run_in_executor(
            None, lambda: groq_chat(ANALYZER_PROMPT, context, temperature=0.3)
        )
        return {"analysis": parse_json_response(response)}
    except Exception as e:
        return {"error": f"Analysis failed: {str(e)}"}

async def flowchart_node(state: RepoState) -> dict:
    if state.get("error"):
        return {"flowchart": state.get("flowchart", "")}
    repo = state["repo_data"]
    analysis = state.get("analysis", {})
    context = f"""
Repository: {repo['metadata']['full_name']}
Architecture: {analysis.get('architecture', 'unknown')}
Project Type: {analysis.get('project_type', 'unknown')}
File Tree: {chr(10).join(repo['file_tree'][:80])}
"""
    try:
        response = await asyncio.get_event_loop().run_in_executor(
            None, lambda: groq_chat(FLOWCHART_PROMPT, context, temperature=0.2)
        )

        resp = response.strip()

        # Extract mermaid code from response
        if "```mermaid" in resp:
            start = resp.index("```mermaid") + len("```mermaid")
            end = resp.index("```", start)
            flowchart = resp[start:end].strip()
        elif "```" in resp:
            start = resp.index("```") + 3
            end = resp.index("```", start)
            flowchart = resp[start:end].strip()
        else:
            flowchart = resp

        # Validate it starts with a mermaid keyword
        valid = ["graph ", "flowchart ", "sequenceDiagram", "classDiagram",
                 "stateDiagram", "erDiagram", "gantt", "pie"]
        if not any(flowchart.startswith(v) for v in valid):
            match = re.search(r'(graph\s+(?:TD|LR|TB|BT|RL)[\s\S]*)', resp)
            if match:
                flowchart = match.group(1).strip()
            else:
                flowchart = "graph TD\n    A[Repository] --> B[Analysis Complete]"

        # Remove HTML tags
        flowchart = re.sub(r'<[^>]+>', '', flowchart).strip()

        return {"flowchart": flowchart}
    except Exception as e:
        return {"flowchart": "graph TD\n    A[Error generating flowchart]"}

async def tech_stack_node(state: RepoState) -> dict:
    if state.get("error"):
        return {"tech_stack": state.get("tech_stack", [])}
    analysis = state.get("analysis", {})
    tech_stack = list(analysis.get("tech_stack", []))
    file_tree = state["repo_data"]["file_tree"]
    infra_files = {
        "docker-compose.yml": {"name": "Docker Compose", "category": "infrastructure", "icon": "🐳"},
        "dockerfile": {"name": "Docker", "category": "infrastructure", "icon": "🐳"},
        ".github/workflows": {"name": "GitHub Actions", "category": "tooling", "icon": "⚙️"},
        "jest.config": {"name": "Jest", "category": "testing", "icon": "🧪"},
    }
    existing = {t["name"].lower() for t in tech_stack}
    for f in file_tree:
        for key, tech in infra_files.items():
            if key in f.lower() and tech["name"].lower() not in existing:
                tech_stack.append(tech)
                existing.add(tech["name"].lower())
    return {"tech_stack": tech_stack}

async def issue_detector_node(state: RepoState) -> dict:
    if state.get("error"):
        return {"issues": state.get("issues", []), "score": state.get("score", "N/A")}
    repo = state["repo_data"]
    file_tree = repo["file_tree"]
    key_files = repo["key_files"]
    context = f"""
Repository: {repo['metadata']['full_name']}
File Tree: {json.dumps(file_tree[:100])}
Has README: {any('readme' in f.lower() for f in file_tree)}
Has Tests: {any('test' in f.lower() or 'spec' in f.lower() for f in file_tree)}
Has CI/CD: {any('.github/workflows' in f for f in file_tree)}
Has LICENSE: {any('license' in f.lower() for f in file_tree)}
README: {key_files.get('README.md', 'NOT FOUND')[:800]}
"""
    try:
        response = await asyncio.get_event_loop().run_in_executor(
            None, lambda: groq_chat(ISSUE_DETECTOR_PROMPT, context, temperature=0.1)
        )
        result = parse_json_response(response)
        if isinstance(result, dict):
            return {"issues": result.get("issues", []), "score": result.get("score", "7/10")}
        return {"issues": [], "score": "7/10"}
    except Exception as e:
        return {"issues": [], "score": "N/A"}

async def summarizer_node(state: RepoState) -> dict:
    if state.get("error"):
        return {"summary": state.get("summary", {})}
    repo = state["repo_data"]
    analysis = state.get("analysis", {})
    readme = list(repo["key_files"].values())[0][:2000] if repo["key_files"] else "No README"
    context = f"""
Repository: {repo['metadata']['full_name']}
Description: {repo['metadata']['description']}
Language: {repo['metadata']['language']}
Project Type: {analysis.get('project_type', 'unknown')}
README: {readme}
"""
    try:
        response = await asyncio.get_event_loop().run_in_executor(
            None, lambda: groq_chat(SUMMARIZER_PROMPT, context, temperature=0.5)
        )
        return {"summary": parse_json_response(response)}
    except Exception as e:
        return {"summary": {"one_liner": repo['metadata'].get('description') or "A GitHub repository.", "beginner": "Could not generate summary.", "expert": "", "use_cases": [], "getting_started": ""}}

def build_graph():
    graph = StateGraph(RepoState)
    graph.add_node("fetch_repo", fetch_repo_node)
    graph.add_node("analyze_code", analyze_code_node)
    graph.add_node("flowchart_stage", flowchart_node)
    graph.add_node("tech_stack_stage", tech_stack_node)
    graph.add_node("issue_detector", issue_detector_node)
    graph.add_node("summarizer", summarizer_node)
    graph.set_entry_point("fetch_repo")
    graph.add_edge("fetch_repo", "analyze_code")
    graph.add_edge("analyze_code", "flowchart_stage")
    graph.add_edge("flowchart_stage", "tech_stack_stage")
    graph.add_edge("tech_stack_stage", "issue_detector")
    graph.add_edge("issue_detector", "summarizer")
    graph.add_edge("summarizer", END)
    return graph.compile()

_graph = None

def get_graph():
    global _graph
    if _graph is None:
        _graph = build_graph()
    return _graph

async def run_analysis(repo_url: str) -> dict:
    graph = get_graph()
    initial_state: RepoState = {
        "repo_url": repo_url, "repo_data": {}, "analysis": {},
        "flowchart": "", "tech_stack": [], "issues": [],
        "summary": {}, "score": "", "error": "",
    }
    final_state = await graph.ainvoke(initial_state)
    if final_state.get("error"):
        raise ValueError(final_state["error"])
    return {
        "summary": final_state.get("summary", {}),
        "flowchart": final_state.get("flowchart", ""),
        "tech_stack": final_state.get("tech_stack", []),
        "issues": final_state.get("issues", []),
        "score": final_state.get("score", "N/A"),
        "metadata": final_state.get("repo_data", {}).get("metadata", {}),
    }