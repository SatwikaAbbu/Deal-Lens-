import os
import logging

import httpx

logger = logging.getLogger(__name__)

# Validate key at startup (rules.md §11)
_API_KEY = os.getenv("SERPER_API_KEY")
if not _API_KEY:
    raise RuntimeError("SERPER_API_KEY environment variable is not set.")

_SERPER_URL = "https://google.serper.dev/search"


async def search_serper(query: str, num: int = 10, exclude_name: str = None, context_year: str = None) -> list[dict]:
    """
    Returns Google results as structured JSON via Serper.
    Use for: competitor lists, funding news, press coverage (architecture.md §7).

    Args:
        query: The search term.
        num: Number of results to return.
        exclude_name: Optional name to exclude from search results via -"{name}"
        context_year: Optional year to constrain the search (e.g. "Ride sharing 2008")
    """
    if not query or not query.strip():
        logger.warning("[Serper] Empty query received, skipping search.")
        return []

    # Time constraint (Task 3)
    if context_year:
        query = f"{query} {context_year}"

    # Programmatic exclusion (Task 2)
    if exclude_name:
        query = f'{query} -"{exclude_name}"'

    import asyncio
    for attempt in range(3):
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(
                    _SERPER_URL,
                    headers={"X-API-KEY": _API_KEY},
                    json={"q": query, "num": num},
                )
                response.raise_for_status()
                return response.json().get("organic", [])
        except httpx.TimeoutException:
            logger.warning(f"[Serper] Attempt {attempt+1} timed out for query: '{query}'")
        except httpx.HTTPStatusError as e:
            logger.warning(f"[Serper] Attempt {attempt+1} HTTP {e.response.status_code} for query '{query}': {e}")
        except Exception as e:
            logger.warning(f"[Serper] Attempt {attempt+1} failed for query '{query}': {e}")
            
        if attempt < 2:
            await asyncio.sleep(2)
    
    logger.error(f"[Serper] All 3 attempts failed for query '{query}'. Returning empty results.")
    return []
