"""
backend/services/groq_client.py

Fallback LLM client using Groq's Llama 3.3 70B model.
Groq's API is OpenAI-compatible, so we use the openai package.

Free tier: 14,400 requests/day — ample headroom for pipeline fallback.

Usage contract (mirrors gemini_client.call_gemini signature):
    text: str = await call_groq(system="...", user="...")

Temperature is always 0.1 for analytical consistency (matches Gemini config).
"""

import os
import logging
import asyncio
from openai import OpenAI

logger = logging.getLogger(__name__)

# Groq is OpenAI-compatible — just swap the base_url and model
_GROQ_MODEL = "llama-3.3-70b-versatile"


def _get_groq_client() -> OpenAI:
    """
    Lazy-initialise the Groq client so a missing key only errors at call time,
    not at import time (avoids breaking the whole app if Groq is not configured).
    """
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise RuntimeError(
            "GROQ_API_KEY is not set. "
            "Get a free key at https://console.groq.com and add it to .env"
        )
    return OpenAI(
        api_key=api_key,
        base_url="https://api.groq.com/openai/v1",
    )


def _call_groq_sync(system: str, user: str) -> str:
    """
    Blocking Groq call. Runs in a thread pool via call_groq().

    Returns the model's text response as a plain string —
    same contract as gemini_client._call_sync().
    """
    client = _get_groq_client()

    logger.info(f"[Groq] Calling {_GROQ_MODEL} as Gemini fallback...")

    response = client.chat.completions.create(
        model=_GROQ_MODEL,
        messages=[
            {"role": "system", "content": system},
            {"role": "user",   "content": user},
        ],
        temperature=0.1,
        max_tokens=8192,
    )

    text = response.choices[0].message.content
    logger.info("[Groq] ✓ Fallback response received successfully.")
    return text


async def call_groq(system: str, user: str) -> str:
    """
    Async wrapper — runs the blocking Groq call in a thread pool executor
    so it doesn't block the FastAPI event loop.

    Signature intentionally matches call_gemini() so callers don't need
    to know which model actually responded.
    """
    return await asyncio.to_thread(_call_groq_sync, system, user)
