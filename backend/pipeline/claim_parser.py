import logging
from prompts.extraction import SYSTEM
from services.gemini_client import call_gemini, parse_json

logger = logging.getLogger(__name__)

async def extract_claims(raw_text: str | bytes) -> dict:
    """
    Passes the raw PDF text (or bytes) to Gemini to extract structured claims.
    Returns the parsed JSON dictionary.
    Handles empty extraction gracefully.
    """
    if isinstance(raw_text, str) and not raw_text.strip():
        logger.warning("[claim_parser] Received empty text. Returning empty claims.")
        return _empty_claims()

    logger.info("[claim_parser] Sending data to Gemini for claim extraction (AI-OCR fallback enabled)...")
    
    # We use Flash for complex reasoning (rules.md §7)
    try:
        response_text = await call_gemini(system=SYSTEM, user=raw_text)
        claims = parse_json(response_text)
        logger.info(f"[claim_parser] Successfully extracted claims for: {claims.get('startup_name', 'Unknown')}")
        return claims
    except Exception as e:
        logger.error(f"[claim_parser] Extraction failed: {e}")
        # On failure, return an empty structure so the pipeline doesn't completely crash
        return _empty_claims()

def _empty_claims() -> dict:
    return {
        "startup_name": "Unknown",
        "category": "Unknown",
        "context_year": None,
        "founders": [],
        "market_claims": [],
        "traction_claims": [],
        "moat_claims": [],
        "financial_claims": [],
        "competitor_claims": [],
        "funding_ask": {"amount": "", "valuation": "", "use_of_funds": ""}
    }
