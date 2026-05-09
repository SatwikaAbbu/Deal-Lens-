import logging
import json
from prompts.tam_validation import SYSTEM
from services.gemini_client import call_gemini, parse_json

logger = logging.getLogger(__name__)

async def check_tam(market_claims: list[dict], tavily_results: list[dict], context: dict = None) -> dict:
    """
    Validates founder TAM claims against real web search results.
    Returns the verdict JSON structure.
    """
    context = context or {}
    startup_name = context.get("startup_name", "the startup")
    category = context.get("category", "the industry")
    if not market_claims:
        logger.info("[tam_checker] No market claims to verify. Returning default safe verdict.")
        return _empty_tam_verdict()

    logger.info(f"[tam_checker] Verifying {len(market_claims)} market claims using {len(tavily_results)} search results...")

    # Format the prompt context
    context_year = context.get("context_year") or "the current era"
    user_prompt = f"STARTUP BEING ANALYSED: {startup_name}\n"
    user_prompt += f"INDUSTRY/CATEGORY: {category}\n"
    user_prompt += f"ANALYSIS ERA/YEAR: {context_year}\n\n"
    user_prompt += "FOUNDER'S MARKET CLAIMS:\n"
    user_prompt += json.dumps(market_claims, indent=2) + "\n\n"
    
    user_prompt += "WEB RESEARCH DATA (Tavily):\n"
    if not tavily_results:
        user_prompt += "No web data available. Evaluate based on general knowledge if possible, or mark UNSUBSTANTIATED.\n"
    else:
        for res in tavily_results[:3]: # Only pass top 3 to save tokens
            user_prompt += f"Source: {res.get('url', 'Unknown')}\n"
            user_prompt += f"Content Snippet: {res.get('content', '')[:1000]}...\n\n"

    try:
        response_text = await call_gemini(system=SYSTEM, user=user_prompt)
        verdict = parse_json(response_text)
        logger.info(f"[tam_checker] Validation complete. Verdict: {verdict.get('verdict', 'UNKNOWN')}")
        return verdict
    except Exception as e:
        logger.error(f"[tam_checker] TAM validation failed: {e}")
        return _empty_tam_verdict(error_msg=str(e))

def _empty_tam_verdict(error_msg: str = None) -> dict:
    return {
        "verdict": "UNSUBSTANTIATED",
        "claimed_tam": "None found" if not error_msg else "Error processing claims",
        "real_tam": "Unknown",
        "inflation_factor": None,
        "explanation": f"Pipeline error: {error_msg}" if error_msg else "No TAM figure provided in deck",
        "source": "None",
        "investor_question": "Can you provide a detailed, bottom-up calculation of your serviceable obtainable market (SOM)?"
    }
