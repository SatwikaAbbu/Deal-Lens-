import logging
import json
from prompts.moat import SYSTEM
from services.gemini_client import call_gemini, parse_json

logger = logging.getLogger(__name__)

_VALID_THREAT_LEVELS = {"CRITICAL", "HIGH", "MEDIUM", "LOW"}

async def test_moat(moat_claims: list[dict], serper_results: list[dict], startup_name: str = "the startup", context_year: str = None) -> dict:
    """
    Evaluates founder moat claims against Serper competitor research.
    Returns the verdict JSON structure.
    """
    if not moat_claims:
        logger.info("[moat_tester] No moat claims to verify. Returning default verdict.")
        return _empty_moat_verdict()

    logger.info(f"[moat_tester] Verifying {len(moat_claims)} moat claims using {len(serper_results)} search results...")

    # Format the prompt context
    user_prompt = f"STARTUP BEING ANALYSED: {startup_name}\n"
    user_prompt += f"ANALYSIS ERA/YEAR: {context_year or 'the current era'}\n\n"
    user_prompt += "FOUNDER'S MOAT CLAIMS:\n"
    user_prompt += json.dumps(moat_claims, indent=2) + "\n\n"
    
    user_prompt += "WEB RESEARCH DATA (Google/Serper competitors):\n"
    if not serper_results:
        user_prompt += "No competitor data found on the web.\n"
    else:
        for res in serper_results[:5]: # Top 5 organic results
            user_prompt += f"Title: {res.get('title', '')}\n"
            user_prompt += f"Snippet: {res.get('snippet', '')}\n\n"

    try:
        system_prompt = SYSTEM.replace("[STARTUP_NAME]", startup_name)
        response_text = await call_gemini(system=system_prompt, user=user_prompt)
        verdict = parse_json(response_text)
        verdict["competitors"] = _validate_competitors(verdict.get("competitors", []))
        logger.info(f"[moat_tester] Validation complete. Verdict: {verdict.get('verdict', 'UNKNOWN')} | Competitors: {len(verdict['competitors'])}")
        return verdict
    except Exception as e:
        logger.error(f"[moat_tester] Moat validation failed: {e}")
        return _empty_moat_verdict(error_msg=str(e))

def _validate_competitors(raw: list) -> list[dict]:
    """
    Ensures every item in the competitors array is a properly structured object.
    - Plain strings are discarded with a warning (format violation from LLM).
    - Invalid threat_level values are clamped to 'LOW'.
    - Missing fields are filled with 'Unknown'.
    """
    validated = []
    for item in raw:
        if isinstance(item, str):
            logger.warning(f"[moat_tester] Discarding plain-string competitor (format violation): '{item}'")
            continue
        if not isinstance(item, dict):
            logger.warning(f"[moat_tester] Discarding unexpected competitor type: {type(item)}")
            continue

        threat = item.get("threat_level", "LOW").upper()
        if threat not in _VALID_THREAT_LEVELS:
            logger.warning(f"[moat_tester] Invalid threat_level '{threat}' — clamping to 'LOW'")
            threat = "LOW"

        validated.append({
            "name": item.get("name", "Unknown"),
            "backing": item.get("backing", "Unknown"),
            "scale": item.get("scale", "Unknown"),
            "threat_level": threat
        })
    return validated

def _empty_moat_verdict(error_msg: str = None) -> dict:
    return {
        "verdict": "UNSUBSTANTIATED",
        "competitors": [],
        "explanation": f"Pipeline error: {error_msg}" if error_msg else "No specific competitive moat claims were found in the pitch deck.",
        "investor_question": "What is your core sustainable competitive advantage against well-funded incumbents?"
    }
