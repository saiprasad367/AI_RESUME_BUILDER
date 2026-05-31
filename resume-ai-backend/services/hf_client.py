"""
HF Client — Replaced with local fallback generators.
The HuggingFace Inference API requires internet which may not be available.
All functions now work fully offline using rule-based generation.
get_user_from_token() still uses Supabase JWT verification.
"""
import re
from fastapi import HTTPException


def call_mistral(prompt: str) -> str:
    """
    Previously called HuggingFace Mistral. Now returns empty string
    so callers fall through to their own heuristic fallbacks.
    """
    return ""


def get_embeddings(texts: list[str]) -> list[list[float]]:
    """
    Local TF-IDF style embeddings using character n-grams.
    Returns a 256-dim float vector per text.
    Works 100% offline.
    """
    import hashlib
    import math

    results = []
    for text in texts:
        text = text.lower().strip()
        # Build char 3-gram + word 1-gram bag
        words = re.findall(r'[a-z]+', text)
        ngrams: dict[str, int] = {}

        # Word unigrams (weighted x3)
        for w in words:
            ngrams[w] = ngrams.get(w, 0) + 3

        # Char trigrams
        for i in range(len(text) - 2):
            ng = text[i:i + 3]
            ngrams[ng] = ngrams.get(ng, 0) + 1

        # Hash each ngram into a 256-bucket vector
        vec = [0.0] * 256
        for ng, count in ngrams.items():
            idx = int(hashlib.md5(ng.encode()).hexdigest(), 16) % 256
            vec[idx] += count

        # L2-normalize
        norm = math.sqrt(sum(v * v for v in vec)) or 1.0
        vec = [v / norm for v in vec]
        results.append(vec)

    return results


def get_user_from_token(token: str):
    """Verify a Supabase JWT access token and return the user object."""
    from database.supabase_client import supabase
    try:
        response = supabase.auth.get_user(token)
        if not response.user:
            raise HTTPException(status_code=401, detail="Unauthorized — invalid token")
        return response.user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Token verification failed: {str(e)}")
