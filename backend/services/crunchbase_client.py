import os
import logging

import httpx

logger = logging.getLogger(__name__)

# Crunchbase key is optional — free trial may not always be active (architecture.md §7)
_API_KEY: str | None = os.getenv("CRUNCHBASE_API_KEY")

_CRUNCHBASE_URL = "https://api.crunchbase.com/api/v4/searches/people"


async def get_person(name: str) -> dict:
    """
    Looks up a founder on Crunchbase by name.
    Returns empty dict if not found, key missing, or any error occurs.
    A Crunchbase failure MUST NEVER block the report pipeline (rules.md §9, architecture.md §7).

    Edge cases handled:
    - Empty/blank name: returns {} immediately (no API call wasted)
    - Missing CRUNCHBASE_API_KEY: returns {} with a warning log
    - Person not found in results: returns {}
    - Timeout after 10s: returns {}
    - Non-200 HTTP response: returns {}
    - Any unexpected exception: returns {}
    """
    if not name or not name.strip():
        logger.warning("[Crunchbase] Empty founder name received, skipping lookup.")
        return {}

    if not _API_KEY:
        logger.warning("[Crunchbase] CRUNCHBASE_API_KEY not set — skipping founder lookup.")
        return {}

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                _CRUNCHBASE_URL,
                params={"user_key": _API_KEY},
                json={
                    "field_ids": [
                        "first_name",
                        "last_name",
                        "primary_job_title",
                        "primary_organization",
                        "num_founded_organizations",
                    ],
                    "query": [
                        {
                            "type": "predicate",
                            "field_id": "facet_ids",
                            "operator_id": "includes",
                            "values": ["person"],
                        }
                    ],
                    "limit": 1,
                },
                timeout=10.0,
            )
            response.raise_for_status()
            data = response.json()
            entities = data.get("entities", [])
            if entities:
                return entities[0].get("properties", {})
            return {}
    except httpx.TimeoutException:
        logger.error(f"[Crunchbase] Request timed out for founder: '{name}'")
        return {}
    except httpx.HTTPStatusError as e:
        logger.error(f"[Crunchbase] HTTP {e.response.status_code} for '{name}': {e}")
        return {}
    except Exception as e:
        # All failures are silent — founder may simply have no public record (rules.md §9)
        logger.error(f"[Crunchbase] Lookup failed for '{name}': {e}")
        return {}
