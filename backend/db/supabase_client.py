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
    # We initialize it to None so the app still starts, but we handle the edge case in the functions
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

def _save_report_sync(report: dict) -> str:
    if not _sb:
        raise RuntimeError("Supabase client not initialized.")
    
    # Safely extract values with fallbacks
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
    
    # Handle the edge case where the insert succeeded but data wasn't returned
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

async def save_report(report: dict) -> str:
    """
    Insert a report into the analyses table.
    Runs in a background thread to prevent blocking the async event loop.
    Returns the UUID string.
    """
    try:
        report_id = await asyncio.to_thread(_save_report_sync, report)
        logger.info(f"[supabase] Report saved successfully: {report_id}")
        return report_id
    except Exception as e:
        logger.error(f"[supabase] Failed to save report: {e}")
        raise

async def get_report(report_id: str) -> Optional[dict]:
    """
    Fetch a report by UUID.
    Runs in a background thread to prevent blocking the async event loop.
    Returns None if not found or if the UUID is invalid.
    """
    # Edge Case: If the provided ID is not a valid UUID, Postgres will throw a 500 error.
    if not _is_valid_uuid(report_id):
        logger.warning(f"[supabase] Invalid UUID format requested: {report_id}")
        return None

    try:
        return await asyncio.to_thread(_get_report_sync, report_id)
    except Exception as e:
        logger.error(f"[supabase] Failed to fetch report {report_id}: {e}")
        return None
