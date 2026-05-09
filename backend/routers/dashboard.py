import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from db.supabase_client import (
    get_all_deals,
    update_report_status,
    get_preferences,
    save_preferences,
)

logger = logging.getLogger(__name__)

router = APIRouter()


# ── GET /deals ─────────────────────────────────────────────────────────────────

@router.get("/deals")
async def list_deals():
    """
    Returns all deal submissions for the investor dashboard.
    Each item includes: id, startup_name, category, short_description, status, created_at, overall_score.
    """
    deals = await get_all_deals()
    return {"deals": deals}


# ── PATCH /deals/{deal_id}/status ──────────────────────────────────────────────

class StatusUpdate(BaseModel):
    status: str  # inbox, accepted, rejected, favourite, disqualified

@router.patch("/deals/{deal_id}/status")
async def update_deal_status(deal_id: str, body: StatusUpdate):
    """
    Updates the status of a deal.
    Valid statuses: inbox, accepted, rejected, favourite, disqualified.
    """
    valid_statuses = {"pending", "inbox", "accepted", "rejected", "favourite", "disqualified"}
    if body.status not in valid_statuses:
        raise HTTPException(
            status_code=422,
            detail=f"Invalid status '{body.status}'. Must be one of: {', '.join(valid_statuses)}"
        )
    
    success = await update_report_status(deal_id, body.status)
    if not success:
        raise HTTPException(status_code=404, detail="Deal not found.")
    
    logger.info(f"[dashboard] Deal {deal_id} status updated to '{body.status}'")
    return {"success": True, "deal_id": deal_id, "status": body.status}


# ── GET /preferences ──────────────────────────────────────────────────────────

@router.get("/preferences")
async def get_investor_preferences():
    """
    Returns the investor's category preferences.
    """
    prefs = await get_preferences()
    return prefs


# ── POST /preferences ─────────────────────────────────────────────────────────

class PreferencesUpdate(BaseModel):
    interested_categories: list[str]
    disqualified_categories: list[str]

@router.post("/preferences")
async def save_investor_preferences(body: PreferencesUpdate):
    """
    Saves/updates the investor's category preferences.
    Retroactively updates the status of previously processed deals.
    """
    result = await save_preferences(body.interested_categories, body.disqualified_categories)
    logger.info(f"[dashboard] Preferences updated: interested={body.interested_categories}, disqualified={body.disqualified_categories}")
    
    # Retroactive update
    deals = await get_all_deals()
    interested_cats = [c.lower() for c in body.interested_categories]
    disqualified_cats = [c.lower() for c in body.disqualified_categories]
    
    for deal in deals:
        cat = (deal.get("category") or "Other").lower()
        old_status = deal.get("status")
        
        # Only auto-update deals that haven't been accepted or favourited
        if old_status in ["inbox", "disqualified", "rejected", "pending"]:
            new_status = "inbox"
            if cat in disqualified_cats:
                new_status = "disqualified"
            elif len(interested_cats) > 0 and cat not in interested_cats:
                new_status = "rejected"
                
            if new_status != old_status:
                await update_report_status(deal["id"], new_status)
                logger.info(f"[dashboard] Retroactively updated deal {deal['id']} from {old_status} to {new_status}")
                
    return {"success": True, "preferences": result}
