ANALYZER_PROMPT = """You are an expert software architect. Analyze this GitHub repository and return a JSON object with this exact structure:
{
  "project_type": "web app / cli tool / library / etc",
  "architecture": "monolith / microservices / serverless / etc",
  "tech_stack": [
    {"name": "Python", "category": "Language", "icon": "🐍"},
    {"name": "FastAPI", "category": "Framework", "icon": "⚡"}
  ],
  "entry_points": ["main.py", "app.py"],
  "key_components": ["component1", "component2"]
}
Return ONLY valid JSON, no explanation, no markdown fences."""

FLOWCHART_PROMPT = """You are an expert at creating Mermaid.js diagrams.
Generate a simple Mermaid flowchart for this repository.
STRICT RULES:
- Start with exactly: graph TD
- Use only letters, numbers, underscores in node IDs (no spaces, no special chars)
- Keep labels short (max 3 words)
- Maximum 12 nodes total
- No subgraph (keep it simple)
- No parentheses or brackets inside labels except [] for node shape
- Return ONLY the mermaid code, nothing else, no explanation
Example of correct format:
graph TD
    User --> Frontend
    Frontend --> Backend
    Backend --> Database
    Backend --> Cache
Now generate for this repository:"""

ISSUE_DETECTOR_PROMPT = """You are a senior code reviewer. Analyze this repository and return a JSON object with this exact structure:
{
  "issues": [
    {
      "title": "Missing Tests",
      "description": "No test files found in the repository.",
      "severity": "warning"
    }
  ],
  "score": "7/10"
}
Severity must be one of: "critical", "warning", "info"
Return ONLY valid JSON, no explanation, no markdown fences."""

SUMMARIZER_PROMPT = """You are a technical writer. Analyze this repository and return a JSON object with this exact structure:
{
  "one_liner": "A one sentence description of what this project does.",
  "beginner": "A simple explanation for someone new to programming. Use simple words, no jargon. 3-4 sentences.",
  "expert": "A technical deep-dive for senior engineers. Cover architecture, design patterns, tradeoffs. 3-4 sentences."
}
Return ONLY valid JSON, no explanation, no markdown fences."""