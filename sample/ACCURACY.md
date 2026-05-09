# DealLens Accuracy & Traceability (Judge Notes)

This project is not a "black box summarizer". It is a retrieval-backed analysis pipeline that:

- Extracts *explicit* claims from the uploaded deck
- Pulls external evidence (search APIs) for verification
- Produces verdicts with explanations and (where applicable) primary sources
- Generates investor questions that *reference deck-specific claims*

## What "Accuracy" Means Here

Accuracy is defined per section (because each section answers a different kind of question):

- **Claim extraction (F1):** Did we correctly capture *verifiable* factual claims from the deck text?
- **TAM check (F2):** Is the verdict (VERIFIED / INFLATED / UNSUBSTANTIATED) supported by cited evidence?
- **Moat + competitors (F4):** Are competitor names real and relevant, and is the moat verdict supported?
- **Founder intel (F5):** Are statements grounded in public sources (no hallucinated credentials)?
- **Questions (F7):** Do questions map back to specific claims/gaps from this deck (not generic VC questions)?
- **Scorecard (F8):** Is scoring consistent with flags/verdicts (not arbitrary)?

We do **not** claim:

- Perfect truth for the entire internet
- Guarantee that every cited webpage is high-quality
- Correctness for PDFs that are image-only without OCR success

## How We Reduce Hallucination Risk

- **Retrieval first:** verification modules receive web/search results as inputs (Tavily/Serper/Crunchbase), so the model is not asked to "guess".
- **Constrained outputs:** modules return strict JSON with fixed enums (VERIFIED/INFLATED/UNSUBSTANTIATED, STRONG/WEAK/UNSUBSTANTIATED, etc.).
- **Temperature = 0.0:** deterministic outputs for demos (repeatability under judge scrutiny).
- **Source surfacing:** verdicts carry `source` fields; claim rows show evidence + sources on the report page.

## What We Can Measure In A Demo

You can run an "accuracy check" on any saved report JSON to show:

- All verdict enums are valid
- Sources look like real URLs (or are present where expected)
- Questions are deck-specific (they reference extracted claims/gaps)
- Internal consistency: top-level `competitors` matches moat competitors (when structured)

Run:

```powershell
python sample\accuracy_check.py sample\sample_response.json
```

This prints a short checklist + issues to fix before the final demo.

## Suggested Live Judge Flow (60 seconds)

1. Upload deck -> generate report.
2. Open Claim Verification section -> expand one claim.
3. Show:
   - the extracted claim (from the deck)
   - the verdict
   - the evidence paragraph
   - the clickable source URL
4. Click the source to prove traceability.
5. Jump to Investor Questions -> show that Q1 references that same claim/gap.

