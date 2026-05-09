import os
import logging
import asyncio
from typing import Optional
from uuid import UUID
from supabase import create_client, Client

logger = logging.getLogger(__name__)

# Validate environment variables before creating the client
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    logger.error("Supabase environment variables are missing. Database operations will fail.")
    _sb: Optional[Client] = None
else:
    try:
        _sb = create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception as e:
        logger.error(f"Failed to initialize Supabase client: {e}")
        _sb = None

def _is_valid_uuid(val: str) -> bool:
    try:
        UUID(str(val))
        return True
    except ValueError:
        return False


# ── Report CRUD ────────────────────────────────────────────────────────────────

def _save_report_sync(report: dict) -> str:
    if not _sb:
        raise RuntimeError("Supabase client not initialized.")
    
    startup_name = report.get("scorecard", {}).get("startup_name", "Unknown")
    file_name = report.get("file_name", "unknown.pdf")
    overall_score = report.get("scorecard", {}).get("overall", 0.0)

    response = (
        _sb.table("analyses")
        .insert({
            "startup_name": startup_name,
            "file_name": file_name,
            "report": report,
            "overall_score": overall_score,
        })
        .execute()
    )
    
    if not response.data or len(response.data) == 0:
        raise ValueError("Supabase insert succeeded but returned no data.")
        
    return response.data[0]["id"]

def _save_submission_sync(data: dict) -> str:
    """Save a quick-triage submission (stub report before full analysis)."""
    if not _sb:
        raise RuntimeError("Supabase client not initialized.")
    
    response = (
        _sb.table("analyses")
        .insert({
            "startup_name": data.get("startup_name", "Unknown"),
            "file_name": data.get("file_name", "unknown.pdf"),
            "report": data.get("report", {}),
            "overall_score": None,
            "status": data.get("status", "pending"),
            "category": data.get("category"),
            "short_description": data.get("short_description"),
            "founder_email": data.get("founder_email"),
            "raw_text": data.get("raw_text"),
        })
        .execute()
    )
    
    if not response.data or len(response.data) == 0:
        raise ValueError("Supabase insert succeeded but returned no data.")
        
    return response.data[0]["id"]

def _get_report_sync(report_id: str) -> Optional[dict]:
    if not _sb:
        raise RuntimeError("Supabase client not initialized.")
        
    response = (
        _sb.table("analyses")
        .select("*")
        .eq("id", report_id)
        .execute()
    )
    if response.data and len(response.data) > 0:
        return response.data[0]["report"]
    return None

def _get_full_record_sync(report_id: str) -> Optional[dict]:
    """Get the full database row (not just the report JSON)."""
    if not _sb:
        raise RuntimeError("Supabase client not initialized.")
        
    response = (
        _sb.table("analyses")
        .select("*")
        .eq("id", report_id)
        .execute()
    )
    if response.data and len(response.data) > 0:
        return response.data[0]
    return None

def _get_all_deals_sync() -> list[dict]:
    """Get all submissions for the dashboard."""
    if not _sb:
        raise RuntimeError("Supabase client not initialized.")
        
    response = (
        _sb.table("analyses")
        .select("id, created_at, startup_name, file_name, overall_score, status, category, short_description, founder_email")
        .order("created_at", desc=True)
        .execute()
    )
    return response.data or []

def _update_report_status_sync(report_id: str, status: str) -> bool:
    """Update the status of a deal (inbox, accepted, rejected, favourite, disqualified)."""
    if not _sb:
        raise RuntimeError("Supabase client not initialized.")
    
    response = (
        _sb.table("analyses")
        .update({"status": status})
        .eq("id", report_id)
        .execute()
    )
    return bool(response.data)

def _update_report_data_sync(report_id: str, updates: dict) -> bool:
    """Update specific columns of a deal row (e.g., report, overall_score, status)."""
    if not _sb:
        raise RuntimeError("Supabase client not initialized.")
    
    response = (
        _sb.table("analyses")
        .update(updates)
        .eq("id", report_id)
        .execute()
    )
    return bool(response.data)

def _delete_report_sync(report_id: str) -> bool:
    if not _sb:
        raise RuntimeError("Supabase client not initialized.")
    response = _sb.table("analyses").delete().eq("id", report_id).execute()
    return True # Delete returns empty data usually if successful

# ── Preferences CRUD ──────────────────────────────────────────────────────────

def _get_preferences_sync() -> dict:
    """Get the single investor preferences row."""
    if not _sb:
        raise RuntimeError("Supabase client not initialized.")
    
    response = (
        _sb.table("investor_preferences")
        .select("*")
        .limit(1)
        .execute()
    )
    if response.data and len(response.data) > 0:
        return response.data[0]
    return {"interested_categories": [], "disqualified_categories": []}

def _save_preferences_sync(interested: list[str], disqualified: list[str]) -> dict:
    """Upsert investor preferences (update existing or insert new)."""
    if not _sb:
        raise RuntimeError("Supabase client not initialized.")
    
    # Check if a row exists
    existing = _get_preferences_sync()
    
    if existing and existing.get("id"):
        # Update existing row
        response = (
            _sb.table("investor_preferences")
            .update({
                "interested_categories": interested,
                "disqualified_categories": disqualified,
            })
            .eq("id", existing["id"])
            .execute()
        )
    else:
        # Insert new row
        response = (
            _sb.table("investor_preferences")
            .insert({
                "interested_categories": interested,
                "disqualified_categories": disqualified,
            })
            .execute()
        )
    
    return response.data[0] if response.data else {}


# ── Async wrappers ────────────────────────────────────────────────────────────

async def save_report(report: dict) -> str:
    try:
        report_id = await asyncio.to_thread(_save_report_sync, report)
        logger.info(f"[supabase] Report saved successfully: {report_id}")
        return report_id
    except Exception as e:
        logger.error(f"[supabase] Failed to save report: {e}")
        raise

async def save_submission(data: dict) -> str:
    try:
        report_id = await asyncio.to_thread(_save_submission_sync, data)
        logger.info(f"[supabase] Submission saved successfully: {report_id}")
        return report_id
    except Exception as e:
        logger.error(f"[supabase] Failed to save submission: {e}")
        raise

async def get_report(report_id: str) -> Optional[dict]:
    if not _is_valid_uuid(report_id):
        logger.warning(f"[supabase] Invalid UUID format requested: {report_id}")
        return None
    try:
        return await asyncio.to_thread(_get_report_sync, report_id)
    except Exception as e:
        logger.error(f"[supabase] Failed to fetch report {report_id}: {e}")
        return None

async def get_full_record(report_id: str) -> Optional[dict]:
    if not _is_valid_uuid(report_id):
        return None
    try:
        return await asyncio.to_thread(_get_full_record_sync, report_id)
    except Exception as e:
        logger.error(f"[supabase] Failed to fetch full record {report_id}: {e}")
        return None

async def get_all_deals() -> list[dict]:
    try:
        return await asyncio.to_thread(_get_all_deals_sync)
    except Exception as e:
        logger.error(f"[supabase] Failed to fetch deals: {e}")
        return []

async def update_report_status(report_id: str, status: str) -> bool:
    if not _is_valid_uuid(report_id):
        return False
    try:
        return await asyncio.to_thread(_update_report_status_sync, report_id, status)
    except Exception as e:
        logger.error(f"[supabase] Failed to update status: {e}")
        return False

async def update_report_data(report_id: str, updates: dict) -> bool:
    if not _is_valid_uuid(report_id):
        return False
    try:
        return await asyncio.to_thread(_update_report_data_sync, report_id, updates)
    except Exception as e:
        logger.error(f"[supabase] Failed to update report data: {e}")
        return False

async def get_preferences() -> dict:
    try:
        return await asyncio.to_thread(_get_preferences_sync)
    except Exception as e:
        logger.error(f"[supabase] Failed to fetch preferences: {e}")
        return {"interested_categories": [], "disqualified_categories": []}

async def save_preferences(interested: list[str], disqualified: list[str]) -> dict:
    try:
        return await asyncio.to_thread(_save_preferences_sync, interested, disqualified)
    except Exception as e:
        logger.error(f"[supabase] Failed to save preferences: {e}")
        raise

async def delete_report(report_id: str) -> bool:
    if not _is_valid_uuid(report_id):
        return False
    try:
        return await asyncio.to_thread(_delete_report_sync, report_id)
    except Exception as e:
        logger.error(f"[supabase] Failed to delete report {report_id}: {e}")
        return False
