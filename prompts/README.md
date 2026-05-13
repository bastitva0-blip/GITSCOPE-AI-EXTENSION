# GitScope AI - Agent Prompts

All AI prompts are defined in `/backend/agents/prompts.py`.

## Prompt Architecture

| Agent | Purpose | Output Format |
|-------|---------|---------------|
| `ANALYZER_PROMPT` | Detects project type, architecture, tech stack | JSON |
| `FLOWCHART_PROMPT` | Generates Mermaid.js architecture diagram | Mermaid code block |
| `ISSUE_DETECTOR_PROMPT` | Finds missing files, bad practices, security issues | JSON with score |
| `SUMMARIZER_PROMPT` | Writes beginner + expert explanations | JSON |

## Customizing Prompts

Edit the prompt constants in `backend/agents/prompts.py`.

### Tips for better results:
1. **ANALYZER**: Add specific framework names you want detected
2. **FLOWCHART**: Adjust max node count for simpler/richer diagrams
3. **ISSUE_DETECTOR**: Add domain-specific checks (e.g., HIPAA compliance)
4. **SUMMARIZER**: Change tone or audience (e.g., "for a CTO" vs "for a student")

## Model Selection

Default: `gpt-4o-mini` (fast, cheap, sufficient for most repos)

For large/complex repos: set `OPENAI_MODEL=gpt-4o` in `.env`
