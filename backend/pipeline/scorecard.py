import logging
import json
from prompts.scorecard import SYSTEM
from services.gemini_client import call_gemini, parse_json, FLASH_LITE

logger = logging.getLogger(__name__)

async def generate_scorecard(full_context: dict) -> dict:
    """
    Distills all module findings into a numerical scorecard (F8).
    """
    logger.info("[scorecard] Generating final scorecard...")

    user_prompt = "PITCH DECK ANALYSIS CONTEXT:\n"
    user_prompt += json.dumps(full_context, indent=2)

    try:
        response_text = await call_gemini(system=SYSTEM, user=user_prompt, model=FLASH_LITE)
        return parse_json(response_text)
    except Exception as e:
        logger.error(f"[scorecard] Scorecard generation failed: {e}")
        return {
            "startup_name": "Unknown",
            "overall": 0.0,
            "dimensions": {
                "founder_credibility": 0, "market_validity": 0, "competitive_moat": 0,
                "traction_quality": 0, "financial_soundness": 0
            },
            "top_flags": ["Pipeline error occurred during scoring."],
            "strengths": []
        }
