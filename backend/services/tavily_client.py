import os
import asyncio
import logging
from typing import Optional

from tavily import TavilyClient

logger = logging.getLogger(__name__)

# Validate key at startup (rules.md §11)
_API_KEY = os.getenv("TAVILY_API_KEY")
if not _API_KEY:
    raise RuntimeError("TAVILY_API_KEY environment variable is not set.")

_client = TavilyClient(api_key=_API_KEY)


async def search_tavily(query: str, max_results: int = 5, context_year: str = None) -> list[dict]:
    """
    Searches Tavily and returns full page content — not just snippets.
    Use for: market reports, founder news, full article content (architecture.md §7).

    Args:
        query: The search term.
        max_results: Number of results to return.
        context_year: Optional year to constrain the search (e.g. "Ride sharing market 2008")
    """
    if not query or not query.strip():
        logger.warning("[Tavily] Empty query received, skipping search.")
        return []

    # Time constraint (Task 3)
    if context_year:
        query = f"{query} {context_year}"

    for attempt in range(3):
        try:
            result: dict = await asyncio.to_thread(
                lambda: _client.search(
                    query=query,
                    max_results=max_results,
                    include_raw_content=True,
                )
            )
            return result.get("results", [])
        except Exception as e:
            logger.warning(f"[Tavily] Attempt {attempt+1} failed for query '{query}': {e}")
            if attempt < 2:
                await asyncio.sleep(2) # Brief wait before retry
            else:
                # Tavily failure must never block the report (rules.md §9)
                logger.error(f"[Tavily] All 3 attempts failed for query '{query}'. Returning empty results.")
                return []
