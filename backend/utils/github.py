"""
GitHub API utility - fetches repo data in minimal API calls.
"""
import httpx
import re
import base64
import os
from typing import Optional

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN", "")
HEADERS = {"Accept": "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28"}
if GITHUB_TOKEN:
    HEADERS["Authorization"] = f"Bearer {GITHUB_TOKEN}"


def parse_repo_url(url: str) -> tuple[str, str]:
    match = re.search(r"github\.com[:/]([^/]+)/([^/.\s]+?)(?:\.git)?/?$", url.strip())
    if not match:
        raise ValueError(f"Cannot parse GitHub URL: {url}")
    return match.group(1), match.group(2)


async def fetch_repo_data(repo_url: str) -> dict:
    owner, repo = parse_repo_url(repo_url)

    async with httpx.AsyncClient(timeout=30.0) as client:
        # Call 1: Repo metadata
        meta = await client.get(f"https://api.github.com/repos/{owner}/{repo}", headers=HEADERS)
        if meta.status_code == 404:
            raise ValueError(f"Repository not found: {owner}/{repo}")
        if meta.status_code == 403:
            raise ValueError("GitHub API rate limit exceeded. Add GITHUB_TOKEN to .env")
        meta.raise_for_status()
        metadata = meta.json()

        # Call 2: File tree (recursive, single call)
        branch = metadata.get("default_branch", "main")
        tree_resp = await client.get(
            f"https://api.github.com/repos/{owner}/{repo}/git/trees/{branch}?recursive=1",
            headers=HEADERS,
        )
        tree_resp.raise_for_status()
        file_tree = [i["path"] for i in tree_resp.json().get("tree", []) if i["type"] == "blob"]

        # Fetch key files for analysis context
        key_files = {}
        priority = ["README.md", "README.rst", "package.json", "requirements.txt",
                    "pyproject.toml", "go.mod", "Cargo.toml", "pom.xml", "Gemfile",
                    "composer.json", "Pipfile", ".github/workflows"]

        for fname in priority:
            matched = next((f for f in file_tree if f.lower() == fname.lower()), None)
            if matched:
                r = await client.get(
                    f"https://api.github.com/repos/{owner}/{repo}/contents/{matched}",
                    headers=HEADERS,
                )
                if r.status_code == 200:
                    data = r.json()
                    if data.get("encoding") == "base64":
                        try:
                            decoded = base64.b64decode(data["content"]).decode("utf-8", errors="replace")
                            key_files[matched] = decoded[:3000]
                        except Exception:
                            pass

        return {
            "owner": owner,
            "repo": repo,
            "metadata": {
                "name": metadata.get("name"),
                "full_name": metadata.get("full_name"),
                "description": metadata.get("description"),
                "language": metadata.get("language"),
                "stars": metadata.get("stargazers_count", 0),
                "forks": metadata.get("forks_count", 0),
                "open_issues": metadata.get("open_issues_count", 0),
                "topics": metadata.get("topics", []),
                "license": metadata.get("license", {}).get("name") if metadata.get("license") else None,
                "default_branch": branch,
                "created_at": metadata.get("created_at"),
                "updated_at": metadata.get("updated_at"),
            },
            "file_tree": file_tree,
            "key_files": key_files,
        }
