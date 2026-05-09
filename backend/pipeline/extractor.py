import fitz  # PyMuPDF
import logging
from services.gemini_client import call_gemini

logger = logging.getLogger(__name__)

# If a slide has fewer than this many characters, we assume it's a chart/table
# and trigger vision fallback.
_TEXT_THRESHOLD = 150

_VISION_SYSTEM = """
You are an expert data analyst. You are looking at a slide from a startup pitch deck that likely contains a chart, table, or complex data grid.
Describe every piece of numerical data, every column header, every axis label, and every trend you see.
If it is a table, transcribe the values as a markdown table if possible.
If it is a chart, describe the growth rates or values clearly.
Return ONLY the description. No conversational filler.
"""

async def extract_text(pdf_bytes: bytes) -> str:
    """
    Extracts text from a PDF. If a page has very little text, it renders the 
    page as an image and uses Gemini Vision to extract tabular/chart data.
    """
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    full_text = ""
    
    for i, page in enumerate(doc):
        page_text = page.get_text().strip()
        
        # Check if we should trigger vision (Task 7)
        # Threshold of 150 chars is roughly 20-30 words.
        if len(page_text) < _TEXT_THRESHOLD:
            logger.info(f"[extractor] Slide {i+1} has low text density ({len(page_text)} chars). Triggering vision fallback...")
            try:
                # Render page to JPEG (PyMuPDF native)
                pix = page.get_pixmap(matrix=fitz.Matrix(2, 2)) # 2x zoom for better OCR
                img_bytes = pix.tobytes("jpeg")
                
                # Call Gemini Vision (Flash)
                vision_desc = await call_gemini(
                    system=_VISION_SYSTEM,
                    user=img_bytes
                )
                
                # Append description to any extracted text
                page_text = f"{page_text}\n\n[AI-VISION DATA DESCRIPTION]:\n{vision_desc}".strip()
            except Exception as e:
                logger.error(f"[extractor] Vision fallback failed for slide {i+1}: {e}")
                # Continue with whatever text we have (rules.md §9)

        if page_text:
            full_text += f"\n--- SLIDE {i + 1} ---\n{page_text}\n"
            
    doc.close()
    return full_text.strip()
