import logging
import json
from prompts.founder import SYSTEM
from services.gemini_client import call_gemini, parse_json

logger = logging.getLogger(__name__)

async def test_founder(founders: list[dict], crunchbase_data: list[dict], tavily_data: list[dict], context: dict = None) -> dict:
    """
    Evaluates founder domain expertise using Crunchbase and Tavily data.
    Returns the domain fit JSON structure.
    """
    if not founders:
        logger.info("[founder_intel] No founder data found. Returning default verdict.")
        return _empty_founder_verdict()

    logger.info(f"[founder_intel] Verifying {len(founders)} founders...")

    # Format the prompt context
    user_prompt = "FOUNDER DETAILS FROM PITCH DECK:\n"
    user_prompt += json.dumps(founders, indent=2) + "\n\n"
    
    user_prompt += "CRUNCHBASE DATA:\n"
    user_prompt += json.dumps(crunchbase_data, indent=2) + "\n\n"
    
    user_prompt += "WEB RESEARCH DATA (News/Background):\n"
    if not tavily_data:
        user_prompt += "No additional web data found.\n"
    else:
        for res in tavily_data[:3]: # Top 3 organic results
            user_prompt += f"Source: {res.get('url', '')}\n"
            user_prompt += f"Content: {res.get('content', '')[:500]}...\n\n"

    try:
        response_text = await call_gemini(system=SYSTEM, user=user_prompt)
        verdict = parse_json(response_text)
        logger.info(f"[founder_intel] Validation complete. Domain Fit: {verdict.get('domain_fit', 'UNKNOWN')}")
        return verdict
    except Exception as e:
        logger.error(f"[founder_intel] Founder validation failed: {e}")
        return _empty_founder_verdict(error_msg=str(e))

def _empty_founder_verdict(error_msg: str = None) -> dict:
    return {
        "domain_fit": "LOW",
        "flags": [f"Pipeline error: {error_msg}"] if error_msg else ["No founder details provided in pitch deck."],
        "explanation": "Cannot assess domain fit without founder names or background information.",
        "investor_question": "Can you walk me through the founding team's specific prior experience in this exact industry?"
    }
