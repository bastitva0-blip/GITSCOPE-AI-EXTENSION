"""Simple in-memory cache with TTL."""
import time
from typing import Any, Optional

_cache: dict = {}
DEFAULT_TTL = 3600  # 1 hour


def cache_set(key: str, value: Any, ttl: int = DEFAULT_TTL):
    _cache[key] = (value, time.time() + ttl)


def cache_get(key: str) -> Optional[Any]:
    entry = _cache.get(key)
    if not entry:
        return None
    value, expiry = entry
    if time.time() > expiry:
        del _cache[key]
        return None
    return value


def cache_key(repo_url: str) -> str:
    return f"repo:{repo_url.strip().lower().rstrip('/')}"


# Export cache dict for stats endpoint
cache = _cache
