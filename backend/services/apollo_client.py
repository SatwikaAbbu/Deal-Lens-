import httpx
import os
import asyncio
from typing import Dict, Any

async def search_apollo(name: str) -> Dict[str, Any]:
    """
    Founder lookup using Apollo.io. 
    Returns employment history and professional background.
    """
    api_key = os.getenv("APOLLO_API_KEY")
    if not api_key or not name:
        return {}

    try:
        async with httpx.AsyncClient() as client:
            # Using the contacts/search endpoint which is available on the free tier
            response = await client.post(
                "https://api.apollo.io/api/v1/contacts/search",
                json={
                    "api_key": api_key,
                    "q_keywords": name,
                    "sort_by_field": "contact_last_modified_at",
                    "sort_ascending": False
                },
                timeout=10.0
            )
            
            if response.status_code == 200:
                data = response.json()
                contacts = data.get("contacts", [])
                if not contacts:
                    return {}
                
                # Get the first matching contact
                person = contacts[0]
                
                # Extract relevant fields for our analysis
                return {
                    "name": person.get("name"),
                    "title": person.get("title"),
                    "headline": person.get("headline"),
                    "employment_history": person.get("employment_history", []),
                    "education": person.get("education", []),
                    "linkedin_url": person.get("linkedin_url"),
                    "organization": person.get("organization", {}).get("name")
                }
            return {}
    except Exception as e:
        print(f"Apollo API Error: {e}")
        return {}

if __name__ == "__main__":
    # Test script
    from dotenv import load_dotenv
    load_dotenv()
    
    async def test():
        res = await search_apollo("Elon Musk")
        print(res)
    
    asyncio.run(test())
