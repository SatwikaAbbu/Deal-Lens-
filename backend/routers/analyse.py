import asyncio
import logging
from typing import Annotated, Optional

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from db.supabase_client import (
    get_report, save_report, save_submission,
    get_full_record, update_report_data,
    get_preferences,
)
from services.apollo_client import search_apollo
from services.crunchbase_client import get_person
from services.serper_client import search_serper
from services.tavily_client import search_tavily

logger = logging.getLogger(__name__)

router = APIRouter()

# File size limit — 20MB (rules.md §8)
MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024


# ── POST /analyse ──────────────────────────────────────────────────────────────

@router.post("/analyse")
async def analyse_deck(file: Annotated[UploadFile, File(description="Pitch deck PDF, max 20MB")]):
    """
    Accepts a PDF pitch deck and runs the full DealLens analysis pipeline.

    Steps:
      1. Validate file type and size
      2. Extract text from PDF (pipeline/extractor.py)
      3. Extract structured claims from text via Gemini Flash (F1)
      4. Parallel web research — Tavily + Serper + Crunchbase
      5. Parallel AI analysis — F2 TAM, F3 Traction, F4 Moat, F5 Founder, F6 Financials
      6. Question generation — F7 (Gemini Flash)
      7. Scorecard aggregation — F8 (Gemini Flash-Lite)
      8. Assemble report, persist to Supabase, return JSON
    """
    # ── Validation: file type ──────────────────────────────────────────────────
    filename = file.filename or ""
    if not filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=422, detail="File must be a PDF.")

    # ── Validation: file size (read once, then work with bytes) ────────────────
    pdf_bytes = await file.read()
    if len(pdf_bytes) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=422,
            detail=f"File exceeds 20MB limit ({len(pdf_bytes) // (1024 * 1024)}MB uploaded).",
        )

    if len(pdf_bytes) == 0:
        raise HTTPException(status_code=422, detail="Uploaded file is empty.")

    # ── Step 1: PDF text extraction ────────────────────────────────────────────
    logger.info(f"[analyse] 🚀 Starting PDF text extraction for '{filename}'...")
    from pipeline.extractor import extract_text
    raw_text = await extract_text(pdf_bytes)
    
    # AI-OCR Fallback: If PyMuPDF returns empty (image-based PDF), we pass the 
    # raw bytes to Gemini's vision engine instead.
    extraction_input = raw_text if raw_text.strip() else pdf_bytes
    
    if not raw_text.strip():
        logger.info(f"[analyse] ⚠️ No text extracted via PyMuPDF. Falling back to Gemini AI-OCR.")
    else:
        logger.info(f"[analyse] ✅ PDF text extraction complete ({len(pdf_bytes)} bytes).")

    # ── Step 2: Extract claims (Gemini Flash - F1) ─────────────────────────────
    logger.info("[analyse] 🔎 Parsing claims and startup category (F1)...")
    from pipeline.claim_parser import extract_claims
    claims = await extract_claims(extraction_input)
    logger.info(f"[analyse] ✅ Claim extraction complete. Category: {claims.get('category', 'unknown')}")

    # ── Step 3: Web Research (Tavily, Serper, Crunchbase) ─────────────────────────
    # ── Step 3: Shared Context & Web Research (Task 2 & 3) ──────────────────────
    category = claims.get("category", "startup")
    startup_name = claims.get("startup_name", "startup")
    context_year = claims.get("context_year") # Task 3: Extracted from F1
    
    shared_context = {
        "startup_name": startup_name,
        "category": category,
        "context_year": context_year
    }
    
    # Run all API requests in parallel (rules.md §6)
    # Task 3: Pass context_year to constrain the search era
    tavily_task = search_tavily(
        f"{category} market size TAM India",
        context_year=context_year
    )
    # Task 2: Programmatically exclude startup name from competitor search
    # Task 3: Constrain to context_year
    serper_task = search_serper(
        f"{category} India startup competitors alternatives",
        exclude_name=startup_name,
        context_year=context_year
    )
    
    cb_tasks = []
    apollo_tasks = []
    founders = claims.get("founders", [])
    for f in founders:
        if f.get("name"):
            cb_tasks.append(get_person(f["name"]))
            apollo_tasks.append(search_apollo(f["name"]))
            
    # Gather search results
    logger.info(f"[analyse] 🌐 Dispatching parallel web research (Tavily + Serper + CB + Apollo)...")
    research_results = await asyncio.gather(tavily_task, serper_task, *cb_tasks, *apollo_tasks)
    tavily_results = research_results[0]
    serper_results = research_results[1]
    
    num_founders = len(cb_tasks)
    cb_results = research_results[2 : 2 + num_founders]
    apollo_results = research_results[2 + num_founders :]
    
    logger.info(f"[analyse] ✅ Web research complete. Found {len(serper_results)} competitors and research for {num_founders} founders.")

    # ── Step 4: AI Analysis (F2, F4, F5) ──────────────────────────────────────
    logger.info("[analyse] 🤖 Running AI analysis modules (TAM, Moat, Founder)...")
    from pipeline.tam_checker import check_tam
    from pipeline.moat_tester import test_moat
    from pipeline.founder_intel import test_founder
    
    # Run analysis modules in parallel (Task 2: Pass shared_context to all)
    # Task 5: Only call Founder module if founders list is non-empty
    analysis_tasks = [
        check_tam(claims.get("market_claims", []), tavily_results, shared_context),
        test_moat(claims.get("moat_claims", []), serper_results, startup_name, context_year)
    ]
    
    founder_task_index = None
    if founders:
        founder_task_index = len(analysis_tasks)
        analysis_tasks.append(test_founder(founders, cb_results, apollo_results, tavily_results, shared_context))
    
    analysis_results = await asyncio.gather(*analysis_tasks)
    
    tam_r = analysis_results[0]
    moat_r = analysis_results[1]
    
    if founder_task_index is not None:
        founder_r = analysis_results[founder_task_index]
    else:
        # Task 5: Static fallback for no founders
        logger.info("[analyse] No founders identified. Skipping F5 Founder module.")
        founder_r = {
            "domain_fit": "UNKNOWN",
            "explanation": "No founders identified in deck.",
            "public_summary": "No founder names were extracted, so no background research could be performed.",
            "credibility_signals": [],
            "red_flags": ["Missing founder identification."],
            "investor_question": "Who are the founders of this project and what is their background?"
        }

    # ── Step 5: Synthesis (F7, F8) ─────────────────────────────────────────────
    logger.info("[analyse] ✍️ Synthesizing final report and scorecard...")
    from pipeline.question_gen import generate_questions
    from pipeline.scorecard import generate_scorecard
    
    # Bundle context for synthesis
    full_context = {
        "claims": claims,
        "tam_analysis": tam_r,
        "moat_analysis": moat_r,
        "founder_analysis": founder_r
    }
    
    synthesis_results = await asyncio.gather(
        generate_questions(full_context),
        generate_scorecard(full_context)
    )
    
    questions = synthesis_results[0]
    scorecard = synthesis_results[1]

    # ── Step 6: Final Packing & Persistence ───────────────────────────────────
    # Map into the official Pydantic model (models/report.py)
    report_data = {
        "report_id": "temp", # Will be replaced after saving
        "file_name": filename,
        "scorecard": scorecard,
        "founder": founder_r,
        "claims": {
            "tam": tam_r,
            "traction": {"flags": []},  # F3 Cut for schedule
            "moat": moat_r,
            "financials": {"flags": []} # F6 Cut for schedule
        },
        "competitors": moat_r.get("competitors", []),
        "questions": questions,
        "raw_text": raw_text  # Added for DealChat feature
    }

    # Save to Supabase
    logger.info("[analyse] 💾 Persisting report to Supabase...")
    report_id = await save_report(report_data)
    report_data["report_id"] = report_id

    logger.info(f"[analyse] Analysis complete for {filename}. Report ID: {report_id}")
    return report_data


# ── Background Tasks ─────────────────────────────────────────────────────────

async def process_triage_and_email(pdf_bytes: bytes, filename: str, founder_email: str, startup_name_input: str, report_id: str):
    try:
        from pipeline.extractor import extract_text
        from pipeline.claim_parser import extract_claims
        from services.email_service import send_investor_acknowledgement
        
        logger.info(f"[submit_bg] Starting background triage for '{filename}'...")
        raw_text = await extract_text(pdf_bytes)
        extraction_input = raw_text if raw_text.strip() else pdf_bytes

        logger.info("[submit_bg] Running F1 extraction for category + description...")
        claims = await extract_claims(extraction_input)
        
        category = claims.get("category", "Other")
        short_description = claims.get("short_description", "")
        ai_startup_name = claims.get("startup_name", "Unknown")
        final_startup_name = startup_name_input if startup_name_input else ai_startup_name

        prefs = await get_preferences()
        interested_cats = [c.lower() for c in prefs.get("interested_categories", [])]
        disqualified_cats = [c.lower() for c in prefs.get("disqualified_categories", [])]
        
        if category.lower() in disqualified_cats:
            status = "disqualified"
        elif len(interested_cats) > 0 and category.lower() not in interested_cats:
            status = "rejected"
        else:
            status = "inbox"

        await update_report_data(report_id, {
            "startup_name": final_startup_name,
            "category": category,
            "short_description": short_description,
            "status": status,
            "report": {"claims": claims},
            "raw_text": raw_text if isinstance(raw_text, str) else "",
        })
        
        logger.info(f"[submit_bg] Triage complete. ID: {report_id}, Status: {status}")

        if founder_email:
            await send_investor_acknowledgement(founder_email, final_startup_name)

    except Exception as e:
        logger.error(f"[submit_bg] Background triage failed: {e}")

# ── POST /submit-deck (Zero-Wait) ──────────────────────────────────────────────

from fastapi import BackgroundTasks

@router.post("/submit-deck")
async def submit_deck(
    background_tasks: BackgroundTasks,
    file: Annotated[UploadFile, File(description="Pitch deck PDF, max 20MB")],
    founder_email: str = Form(""),
    startup_name_input: str = Form(""),
):
    """
    Zero-wait endpoint for the public founder submission form.
    Returns immediately while extraction, triage, and email run in the background.
    """
    filename = file.filename or ""
    if not filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=422, detail="File must be a PDF.")

    pdf_bytes = await file.read()
    if len(pdf_bytes) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(status_code=422, detail=f"File exceeds 20MB limit.")
    if len(pdf_bytes) == 0:
        raise HTTPException(status_code=422, detail="Uploaded file is empty.")

    # Save initial pending stub immediately
    submission_data = {
        "startup_name": startup_name_input or "Processing...",
        "file_name": filename,
        "report": {"claims": {}},
        "status": "pending",
        "category": "Processing...",
        "short_description": "We are extracting details from your deck.",
        "founder_email": founder_email,
        "raw_text": "",
    }
    
    report_id = await save_submission(submission_data)
    
    background_tasks.add_task(
        process_triage_and_email,
        pdf_bytes,
        filename,
        founder_email,
        startup_name_input,
        report_id
    )
    
    logger.info(f"[submit] Zero-wait submission accepted. ID: {report_id}. Processing in background.")
    return {
        "success": True,
        "report_id": report_id,
        "startup_name": startup_name_input or "Your Startup",
        "status": "pending",
    }


# ── POST /analyse-full/{report_id} (Deep Dive from Dashboard) ─────────────────

@router.post("/analyse-full/{report_id}")
async def analyse_full(report_id: str):
    """
    Runs the full deep-dive analysis on a previously submitted deck.
    Triggered when the investor clicks 'Detailed Report' on the dashboard.
    """
    # Fetch the existing stub record
    record = await get_full_record(report_id)
    if not record:
        raise HTTPException(status_code=404, detail="Submission not found.")
    
    raw_text = record.get("raw_text", "")
    claims = record.get("report", {}).get("claims", {})
    filename = record.get("file_name", "unknown.pdf")
    
    if not claims:
        raise HTTPException(status_code=422, detail="No claim data found for this submission. Please re-submit.")

    logger.info(f"[analyse-full] Running deep analysis for report {report_id}...")

    # ── Step 3: Web Research ──────────────────────────────────────────────────
    category = claims.get("category", "startup")
    startup_name = claims.get("startup_name", "startup")
    context_year = claims.get("context_year")
    
    shared_context = {
        "startup_name": startup_name,
        "category": category,
        "context_year": context_year,
    }
    
    tavily_task = search_tavily(
        f"{category} market size TAM India",
        context_year=context_year,
    )
    serper_task = search_serper(
        f"{category} India startup competitors alternatives",
        exclude_name=startup_name,
        context_year=context_year,
    )
    
    cb_tasks = []
    apollo_tasks = []
    founders = claims.get("founders", [])
    
    # ── FALLBACK: If founders are missing, ask Gemini directly ──
    if not founders or not any(f.get("name") for f in founders):
        logger.info(f"[analyse-full] Founders missing from deck. Asking AI for '{startup_name}' founders...")
        try:
            # pyrefly: ignore [missing-import]
            from pipeline.llm_client import get_gemini_client
            model = get_gemini_client()
            prompt = f"Who are the founders of {startup_name}? Respond ONLY with a comma-separated list of their names. If you absolutely do not know or if the name is too generic, respond with 'UNKNOWN'."
            response = await asyncio.to_thread(model.generate_content, prompt)
            text = response.text.strip()
            if text and "UNKNOWN" not in text.upper():
                names = [n.strip() for n in text.split(",")]
                founders = [{"name": n, "role": "Founder", "background": "Identified via AI Knowledge"} for n in names if n]
                logger.info(f"[analyse-full] AI identified founders: {names}")
                claims["founders"] = founders  # Update claims so it shows in the final report
        except Exception as e:
            logger.error(f"[analyse-full] AI founder fallback failed: {e}")

    for f in founders:
        if f.get("name"):
            cb_tasks.append(get_person(f["name"]))
            apollo_tasks.append(search_apollo(f["name"]))
    
    logger.info(f"[analyse-full] Dispatching parallel web research...")
    research_results = await asyncio.gather(tavily_task, serper_task, *cb_tasks, *apollo_tasks)
    tavily_results = research_results[0]
    serper_results = research_results[1]
    num_founders = len(cb_tasks)
    cb_results = research_results[2 : 2 + num_founders]
    apollo_results = research_results[2 + num_founders :]

    # ── Step 4: AI Analysis ───────────────────────────────────────────────────
    logger.info("[analyse-full] Running AI analysis modules...")
    from pipeline.tam_checker import check_tam
    from pipeline.moat_tester import test_moat
    from pipeline.founder_intel import test_founder
    
    analysis_tasks = [
        check_tam(claims.get("market_claims", []), tavily_results, shared_context),
        test_moat(claims.get("moat_claims", []), serper_results, startup_name, context_year),
    ]
    
    founder_task_index = None
    if founders:
        founder_task_index = len(analysis_tasks)
        analysis_tasks.append(test_founder(founders, cb_results, apollo_results, tavily_results, shared_context))
    
    analysis_results = await asyncio.gather(*analysis_tasks)
    tam_r = analysis_results[0]
    moat_r = analysis_results[1]
    
    if founder_task_index is not None:
        founder_r = analysis_results[founder_task_index]
    else:
        founder_r = {
            "domain_fit": "UNKNOWN",
            "explanation": "No founders identified in deck.",
            "credibility_signals": [],
            "red_flags": ["Missing founder identification."],
            "investor_question": "Who are the founders?",
        }

    # ── Step 5: Synthesis ─────────────────────────────────────────────────────
    logger.info("[analyse-full] Synthesizing report...")
    from pipeline.question_gen import generate_questions
    from pipeline.scorecard import generate_scorecard
    
    full_context = {
        "claims": claims,
        "tam_analysis": tam_r,
        "moat_analysis": moat_r,
        "founder_analysis": founder_r,
    }
    
    synthesis_results = await asyncio.gather(
        generate_questions(full_context),
        generate_scorecard(full_context),
    )
    questions = synthesis_results[0]
    scorecard = synthesis_results[1]

    # ── Step 6: Update the existing record ────────────────────────────────────
    report_data = {
        "report_id": report_id,
        "file_name": filename,
        "scorecard": scorecard,
        "founder": founder_r,
        "claims": {
            "tam": tam_r,
            "traction": {"flags": []},
            "moat": moat_r,
            "financials": {"flags": []},
        },
        "competitors": moat_r.get("competitors", []),
        "questions": questions,
        "raw_text": raw_text,
    }

    await update_report_data(report_id, {
        "report": report_data,
        "overall_score": scorecard.get("overall", 0),
        "status": "inbox",
    })

    logger.info(f"[analyse-full] Full analysis complete for report {report_id}")
    return report_data


# ── GET /report/{report_id} ────────────────────────────────────────────────────

@router.get("/report/{report_id}")
async def get_report_by_id(report_id: str):
    """
    Fetches a previously generated report by its UUID.
    """
    report = await get_report(report_id)
    if report is None:
        raise HTTPException(status_code=404, detail="Report not found.")
    return report


# ── POST /chat ─────────────────────────────────────────────────────────────────

from pydantic import BaseModel

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: list[ChatMessage]
    raw_text: str

@router.post("/chat")
async def chat_with_deal(req: ChatRequest):
    """
    Context-aware chat endpoint for a specific deal.
    """
    from services.gemini_client import call_gemini
    
    system_prompt = (
        "You are a helpful, clear-speaking VC analyst assistant. "
        "You must answer questions based EXCLUSIVELY on the pitch deck text provided below. "
        "If the answer is not in the text, you MUST reply: 'The deck does not mention this.' "
        "RULES FOR YOUR RESPONSE:\n"
        "1. Explain things in very simple, layman's terms. Avoid dense corporate jargon.\n"
        "2. Break down complex strategies into easy-to-read bullet points.\n"
        "3. Keep it brief and conversational.\n\n"
        f"--- PITCH DECK TEXT ---\n{req.raw_text}"
    )
    
    # Format history
    user_prompt = "CONVERSATION HISTORY:\n"
    for msg in req.history[-5:]: # Keep last 5 messages for context
        user_prompt += f"{msg.role.upper()}: {msg.content}\n"
    user_prompt += f"\nUSER: {req.message}"

    try:
        from services.gemini_client import _get_next_client, FLASH
        from google.genai import types
        
        client = _get_next_client()
        config = types.GenerateContentConfig(
            system_instruction=system_prompt,
            temperature=0.2, # slightly higher for natural text
        )
        response = client.models.generate_content(
            model=FLASH,
            contents=user_prompt,
            config=config,
        )
        return {"reply": response.text}
    except Exception as e:
        logger.error(f"[chat] Failed to generate chat response: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate response.")
