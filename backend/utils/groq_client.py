"""
Groq API client wrapper.
Groq provides ultra-fast inference for open-source models (Llama3, Mixtral, etc.)
Free tier: https://console.groq.com
"""
import os
import json
import re
from groq import Groq

_client: Groq = None


def get_groq_client() -> Groq:
    global _client
    if _client is None:
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise ValueError(
                "GROQ_API_KEY not found. Add it to your .env file.\n"
                "Get your free key at: https://console.groq.com"
            )
        _client = Groq(api_key=api_key)
    return _client


def get_model() -> str:
    return os.getenv("GROQ_MODEL", "llama3-70b-8192")


def groq_chat(system_prompt: str, user_content: str, temperature: float = 0.3) -> str:
    """
    Send a chat completion request to Groq.
    Returns the raw text response.
    """
    client = get_groq_client()
    model = get_model()

    response = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_content},
        ],
        temperature=temperature,
        max_tokens=4096,
    )
    return response.choices[0].message.content


def parse_json_response(text: str) -> dict | list:
    """Safely parse JSON from LLM response, stripping markdown fences."""
    cleaned = text.strip()
    # Remove ```json ... ``` or ``` ... ``` fences
    cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
    cleaned = re.sub(r"\s*```$", "", cleaned)
    cleaned = cleaned.strip()
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        # Try to extract JSON object/array from the text
        match = re.search(r"(\{[\s\S]*\}|\[[\s\S]*\])", cleaned)
        if match:
            return json.loads(match.group(1))
        raise ValueError(f"Could not parse JSON from response: {cleaned[:200]}")
