import logging
import json
from prompts.questions import SYSTEM
from services.gemini_client import call_gemini, parse_json

logger = logging.getLogger(__name__)

async def generate_questions(full_context: dict) -> list[dict]:
    """
    Synthesizes all analysis results into 5 hard-hitting investor questions.
    """
    logger.info("[question_gen] Synthesizing final questions...")

    user_prompt = "PITCH DECK ANALYSIS CONTEXT:\n"
    user_prompt += json.dumps(full_context, indent=2)

    try:
        response_text = await call_gemini(system=SYSTEM, user=user_prompt)
        result = parse_json(response_text)
        questions = result.get("questions", [])
        
        # Ensure we always return exactly 5, even if Gemini missed some
        return questions[:5]
    except Exception as e:
        logger.error(f"[question_gen] Question synthesis failed: {e}")
        return []
