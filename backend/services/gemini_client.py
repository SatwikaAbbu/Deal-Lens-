import os
import re
import asyncio
import json
import time
import logging
from typing import List, Optional

from google import genai
from google.genai import types

logger = logging.getLogger(__name__)

# ── Multi-Key Management ──────────────────────────────────────────────────────

def _load_clients() -> List[genai.Client]:
    """
    Scans environment for all GEMINI_API_KEY_x variables and initializes clients.
    If none found, falls back to the standard GEMINI_API_KEY.
    """
    keys = []
    # Check for GEMINI_API_KEY_1, _2, _3...
    for i in range(1, 11):
        key = os.getenv(f"GEMINI_API_KEY_{i}")
        if key:
            keys.append(key)
    
    # Fallback to single key if no numbered keys exist
    if not keys:
        single_key = os.getenv("GEMINI_API_KEY")
        if single_key:
            keys.append(single_key)
            
    if not keys:
        raise RuntimeError("No Gemini API keys found in environment. Please set GEMINI_API_KEY_1, etc.")
    
    logger.info(f"[Gemini] Initialized client pool with {len(keys)} API keys.")
    return [genai.Client(api_key=k) for k in keys]

# Global pool of clients
_CLIENT_POOL = _load_clients()
_CURRENT_KEY_INDEX = 0

def _get_next_client() -> genai.Client:
    global _CURRENT_KEY_INDEX
    client = _CLIENT_POOL[_CURRENT_KEY_INDEX]
    # Rotate index for the next call (Round Robin)
    _CURRENT_KEY_INDEX = (_CURRENT_KEY_INDEX + 1) % len(_CLIENT_POOL)
    return client


# ── Model Pool ────────────────────────────────────────────────────────────────
# PERMANENT SOLUTION: Load-balance across MULTIPLE models.
# Google's free tier limit is 20 RPD *per model per project*.
# By using N models × K keys, we get N × K × 20 requests per day.
#
# IMPORTANT: Only include models that are CONFIRMED to have free tier quota > 0.
# Models like gemini-2.0-flash and gemini-2.0-flash-lite have limit: 0 on free
# tier and MUST NOT be included — they waste retry attempts.
#
# Confirmed working models with free tier (as of 2026-05-05):
#   - gemini-2.5-flash-lite   → 20 RPD free tier ✓
#   - gemini-2.5-flash        → 20 RPD free tier ✓ (but often 503 under load)
#   - gemini-flash-latest     → maps to gemini-3-flash, 20 RPD ✓
#   - gemini-flash-lite-latest → 20 RPD ✓
#   - gemini-3.1-flash-lite-preview → 20 RPD ✓
#   - gemini-3-flash-preview  → 20 RPD ✓

MODEL_POOL = [
    "gemini-2.5-flash-lite",
    "gemini-flash-latest",
    "gemini-flash-lite-latest",
    "gemini-3.1-flash-lite-preview",
    "gemini-3-flash-preview",
    "gemini-2.5-flash",
]
# With 6 models × 2 keys = 240 RPD (enough for ~40 full pipeline runs/day)
# Adding more API keys multiplies this linearly.

_CURRENT_MODEL_INDEX = 0

def _get_next_model() -> str:
    global _CURRENT_MODEL_INDEX
    model = MODEL_POOL[_CURRENT_MODEL_INDEX]
    _CURRENT_MODEL_INDEX = (_CURRENT_MODEL_INDEX + 1) % len(MODEL_POOL)
    return model

# Default model constants — the actual model used may change at runtime via rotation
FLASH      = "gemini-2.5-flash"
FLASH_LITE = "gemini-2.5-flash-lite"

# Models reserved exclusively for F8 (scorecard).
# These must NEVER fall back to Groq — if they 503, fall back to Flash instead.
_SCORECARD_MODELS = {
    "gemini-2.5-flash-lite",
    "gemini-flash-lite-latest",
    "gemini-3.1-flash-lite-preview",
}


# ── Retry Delay Extraction ────────────────────────────────────────────────────

def _extract_retry_delay(err_str: str) -> int:
    """
    Extracts the suggested retry delay (in seconds) from a Gemini error message.
    Example: 'Please retry in 47.653416745s.' → 48
    Returns a minimum of 5 seconds if no delay is found.
    """
    match = re.search(r'retry in (\d+(?:\.\d+)?)s', err_str)
    if match:
        return int(float(match.group(1))) + 2  # Add 2s buffer
    return 5  # Default fallback


# ── Core Gemini Call ──────────────────────────────────────────────────────────

def _call_sync(model_name: str, system: str, user: str, max_tokens: int) -> str:
    """
    Blocking Gemini call with TRIPLE rotation strategy:
      1. Rotate API key
      2. Rotate model
      3. Wait the API-suggested retry delay before final retry

    If ALL Gemini key×model combos are exhausted:
      - Scorecard models (Flash-Lite): fall back to Flash, then raise.
        Rationale: F8 must never use Groq — Flash-Lite quota is conserved
        by design. If Flash-Lite fails, Flash is the correct escalation.
      - All other models: fall back to Groq (Llama 3.3 70B) automatically.
        This is invisible to the caller — they receive a valid string response.
    """
    # Track whether the original request was for a scorecard (Flash-Lite) model.
    # We use this to decide whether Groq is permitted as a final fallback.
    is_scorecard_call = model_name in _SCORECARD_MODELS

    config = types.GenerateContentConfig(
        system_instruction=system,
        max_output_tokens=max_tokens,
        temperature=0.1,
        response_mime_type="application/json",
    )

    total_combos = len(_CLIENT_POOL) * len(MODEL_POOL)
    # We try every key×model combo, then do ONE final retry round after waiting
    max_attempts = total_combos + len(MODEL_POOL)
    last_err_str = ""

    for attempt in range(max_attempts):
        client = _get_next_client()
        try:
            # Handle multi-modal input (PDF or Image bytes fallback)
            content_parts = user
            if isinstance(user, bytes):
                # Basic mime type detection based on magic bytes
                mime_type = "application/pdf"
                if user.startswith(b"\xff\xd8"):
                    mime_type = "image/jpeg"
                elif user.startswith(b"\x89PNG"):
                    mime_type = "image/png"
                elif user.startswith(b"GIF8"):
                    mime_type = "image/gif"
                elif user.startswith(b"RIFF") and user[8:12] == b"WEBP":
                    mime_type = "image/webp"

                content_parts = [
                    types.Part.from_bytes(data=user, mime_type=mime_type),
                    "Process this document/image according to the instructions provided."
                ]

            response = client.models.generate_content(
                model=model_name,
                contents=content_parts,
                config=config,
            )
            logger.info(f"[Gemini] ✓ Success with model={model_name} on attempt {attempt+1}")
            return response.text
        except Exception as e:
            err_str = str(e)
            last_err_str = err_str
            is_rate_limit = "429" in err_str or "RESOURCE_EXHAUSTED" in err_str or "quota" in err_str.lower()
            is_unavailable = "503" in err_str or "UNAVAILABLE" in err_str
            is_retryable = is_rate_limit or is_unavailable or "403" in err_str or "PERMISSION_DENIED" in err_str

            if not is_retryable:
                # Non-retryable error (bad prompt, auth error, etc.) — fail fast
                logger.error(f"[Gemini] Non-retryable error: {err_str}")
                raise

            logger.warning(f"[Gemini] Attempt {attempt+1}/{max_attempts} failed | model={model_name} | {'RATE_LIMIT' if is_rate_limit else 'UNAVAILABLE'}")

            if attempt < total_combos:
                # Phase 1: Quick rotation through all key×model combos
                model_name = _get_next_model()
                time.sleep(1)  # Brief pause between rotations
            else:
                # Phase 2: All combos exhausted. Respect the API's suggested delay.
                retry_delay = _extract_retry_delay(err_str)
                logger.warning(f"[Gemini] All combos exhausted. Waiting {retry_delay}s (API-suggested delay)...")
                time.sleep(retry_delay)
                model_name = _get_next_model()

    # ── All Gemini retries exhausted ─────────────────────────────────────────
    if is_scorecard_call:
        # F8 constraint: scorecard must never use Groq.
        # Escalate to Flash (the full model) as the last resort.
        logger.warning("[Gemini] Scorecard call exhausted Flash-Lite retries — escalating to Flash (not Groq).")
        flash_config = types.GenerateContentConfig(
            system_instruction=system,
            max_output_tokens=max_tokens,
            temperature=0.1,
            response_mime_type="application/json",
        )
        client = _get_next_client()
        try:
            response = client.models.generate_content(
                model=FLASH,
                contents=user,
                config=flash_config,
            )
            logger.info("[Gemini] ✓ Scorecard Flash escalation succeeded.")
            return response.text
        except Exception as flash_err:
            logger.error(f"[Gemini] Scorecard Flash escalation also failed: {flash_err}")
            raise RuntimeError(
                f"Scorecard (F8) failed after exhausting Flash-Lite and Flash. Last error: {flash_err}"
            ) from flash_err
    else:
        # All other modules: use Groq as the invisible final fallback.
        logger.warning(
            "[Gemini] All Gemini key×model combos exhausted — activating Groq fallback."
        )
        # Import here (not at top level) to keep the module importable even
        # when the openai package or GROQ_API_KEY is absent.
        try:
            from services.groq_client import _call_groq_sync
            return _call_groq_sync(system=system, user=user if isinstance(user, str) else str(user))
        except Exception as groq_err:
            logger.error(f"[Groq] Fallback also failed: {groq_err}")
            raise RuntimeError(
                f"Pipeline failed: Gemini exhausted all retries and Groq fallback also failed. "
                f"Last Gemini error: {last_err_str} | Groq error: {groq_err}"
            ) from groq_err


async def call_gemini(
    system: str,
    user: str,
    model: str = None,
    max_tokens: int = 8192,
) -> str:
    """Async wrapper that runs the blocking call in a thread pool."""
    # Always start with the next model from the pool for load balancing
    if model is None:
        model = _get_next_model()
    return await asyncio.to_thread(_call_sync, model, system, user, max_tokens)


def parse_json(text: str) -> dict:
    """Defensively strips markdown and parses JSON."""
    original = text
    text = text.strip()
    if text.startswith("```"):
        lines = text.split("\n")
        text = "\n".join(lines[1:-1]).strip()
    try:
        parsed = json.loads(text)
        # Defensive check: if Gemini returns a list instead of a dict, take the first item
        if isinstance(parsed, list) and len(parsed) > 0:
            return parsed[0]
        elif isinstance(parsed, list):
            return {}
        return parsed
    except json.JSONDecodeError as e:
        logger.error(f"[Gemini] JSON parse failed: {e}\nRaw response:\n{original}")
        raise
