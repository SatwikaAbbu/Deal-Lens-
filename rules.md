# DealLens — Agent Rules

> **For the agent:** Read this file completely before touching any code.
> These rules are non-negotiable. They exist because every deviation has a cost —
> wrong colour, wrong model, wrong file location, or missing error handling will
> break the investor demo. When in doubt, check this file first.

---

## Table of Contents

1. [Project Philosophy](#1-project-philosophy)
2. [File & Folder Rules](#2-file--folder-rules)
3. [Frontend — Coding Rules](#3-frontend--coding-rules)
4. [Frontend — Design Rules](#4-frontend--design-rules)
5. [Frontend — Component Rules](#5-frontend--component-rules)
6. [Backend — Coding Rules](#6-backend--coding-rules)
7. [Backend — AI Pipeline Rules](#7-backend--ai-pipeline-rules)
8. [API & Data Contract Rules](#8-api--data-contract-rules)
9. [Error Handling Rules](#9-error-handling-rules)
10. [State & Loading Rules](#10-state--loading-rules)
11. [Security & Environment Rules](#11-security--environment-rules)
12. [What to Never Do](#12-what-to-never-do)

---

## 1. Project Philosophy

- DealLens is a **professional investor intelligence tool**, not a consumer app or marketing site. Every decision serves one goal: help an investor scan, understand, and act on data in minimum time.
- **Clarity over decoration.** If a UI element does not help the user understand data faster, it does not exist.
- **Data is the design.** The UI chrome frames content — it does not compete with it.
- **Trust through precision.** Monospace for numbers. Consistent verdict colours. No ambiguity.
- This codebase is built for a hackathon demo. Scope is fixed. Do not add features not in `page-spec.md`. Do not refactor working code during build time.

---

## 2. File & Folder Rules

- **Never create files outside the defined project structure.** See `architecture.md` section 3 for the exact folder tree. Every new file must go into its correct folder.
- **Frontend files live in `frontend/src/`** — components in `components/`, hooks in `hooks/`, API calls in `api/`, mock data in `data/`.
- **Backend files live in `backend/`** — pipeline modules in `pipeline/`, prompts in `prompts/`, external service wrappers in `services/`, DB logic in `db/`, Pydantic models in `models/`.
- **Planning docs live in `_project/`** — never deployed, never imported by application code.
- **Never import from `_project/`** in frontend or backend code.
- **One component per file.** No barrel `index.jsx` files that re-export multiple components — import directly.
- **File naming:** React components use PascalCase (`ReportPage.jsx`). Hooks use camelCase with `use` prefix (`useScrollSpy.js`). Python modules use snake_case (`claim_parser.py`).
- **Never commit `.env`** — only `.env.example` is committed.

---

## 3. Frontend — Coding Rules

- **Always use `.jsx` for React components** and `.js` for non-component JavaScript. No `.tsx` or `.ts` — this project does not use TypeScript.
- **Never put logic in page/section components.** Page components (`UploadPage.jsx`, `ReportPage.jsx`, etc.) are layout shells only. Business logic, state management, and data transformations go in hooks (`hooks/`) or utility functions (`lib/`).
- **All API calls go through `api/analyse.js`** using Axios. Never write `fetch()` or `axios` calls directly inside a component.
- **No raw `useEffect` for data fetching.** Use the API module functions triggered by user actions, not effect-based polling.
- **All async operations require both a loading state and an error state** — no exceptions. A component that fetches data must visually handle: loading (skeleton), success (data), and error (message or boundary).
- **No inline styles anywhere.** Tailwind classes only. If a value is not in the design system, it must be added to `tailwind.config.js` first.
- **No `useState` for derived data.** If a value can be computed from existing state, compute it inline — do not store it in state.
- **Routing uses React Router.** Three routes only: `/`, `/loading`, `/report/:id`. A catch-all `*` renders `<NotFound />`. Do not add routes not in the spec.
- **Props must be destructured** at the top of every component function — no `props.something` access.
- **Every component that receives data must handle `null` and `undefined` gracefully.** Use optional chaining (`?.`) and nullish coalescing (`??`) everywhere. A missing field must never crash the component.

---

## 4. Frontend — Design Rules

- **Use only design token names from `design.md` section 2** — never raw hex values, never Tailwind defaults that conflict. Every colour on screen must trace back to a token defined in `tailwind.config.js`.
- **Background layers, in order:** `bg-bg-base` (page) → `bg-bg-panel` (sidebar/nav) → `bg-bg-surface` (cards) → `bg-bg-raised` (hover / dropdowns). Never skip levels or reverse the stack.
- **All numerical data** (scores, percentages, currency, counts) always uses `font-mono`. Never `font-sans` for numbers.
- **Maximum heading weight is `font-semibold` (600).** Never use `font-bold` (700) anywhere.
- **Body text is always `text-text-secondary`** — never `text-text-primary`. Primary is reserved for headings and key data labels only.
- **Uppercase text always pairs with `tracking-widest` or `tracking-[0.14em]`.** Never uppercase without letter-spacing.
- **Scores always show `/10` denominator.** Never display a raw score number alone.
- **Percentages always show `%` and always use `font-mono`.**
- **Missing data uses `—` (em dash) in `text-text-faint font-mono`** — never "N/A", "null", "undefined", or an empty string.
- **Desktop-first layout at 1280px.** Sidebar collapses at `md:` (768px) — use hamburger. 2-col grids collapse to 1 col. Do not optimise below 768px.
- **Verdict colours are semantic — never decorative:**
  - Green → verified / strong / score 7–10 only
  - Amber → inflated / weak / score 4–6 / needs attention
  - Red → flag / unsubstantiated / score 1–3
  - Blue → informational / neutral / no strong verdict
- **`shadow-card` for card outlines, not CSS `border`.** Cards use the shadow utility, not `border border-white/X`.
- **No gradients for decorative purposes.** Gradients are used only in skeleton shimmer animations.
- **No `border-radius` larger than `rounded-xl` (12px)** except the upload drop zone (`rounded-2xl`) and pill badges.
- **`text-center` only on the upload page and empty states.** Body text and data are always left-aligned.
- **No card nesting beyond one level.** A card inside a card is the maximum. No third level.

---

## 5. Frontend — Component Rules

### Shared components

- **`<Skeleton />`** — use for every data placeholder. Match exact height/width of real content. All loading states use `animate-pulse` shimmer, not spinners (spinners are for buttons only).
- **`<VerdictBadge />`** — always pass a `verdict` prop from the API enum (`VERIFIED | INFLATED | UNSUBSTANTIATED | STRONG | WEAK`). Never hardcode colour classes — derive them from the verdict value.
- **`<ScoreBar />`** — always pass `score` (number 1–10). The component derives its own colour (green/amber/red). Never pass a colour prop to ScoreBar.
- **`<ErrorBoundary />`** — wraps every report section independently. A crash in one section must never crash the page. Use `<SectionError section="..." />` as fallback.
- **`<ReportCard />`** — the shell for every report section. Always receives `eyebrow`, `title`, and `children`. Section content lives in `children`.
- **`<DataTable />`** — always left-aligned. No alternating row colours. Hover state only (`hover:bg-bg-raised`). Scrollable horizontally (`overflow-x-auto`) at all viewports.
- **`<QuestionCard />`** — collapsible. Closed by default. Expanded state shows `targetsClaim`, `gapFound`, `strongAnswerLooksLike`.

### Page-level components

- **`<UploadPage />`** — handles 4 states: idle, file-selected, uploading, error. On upload success, navigate to `/loading` immediately — do not wait for analysis to complete.
- **`<LoadingPage />`** — 5 steps with optimistic advancement (show each step as done 2–3 seconds before backend confirms). Rotating insight card every 8 seconds. Progress bar animates smoothly with `transition-all duration-1000`.
- **`<ReportPage />`** — sidebar + scrollable main. Sidebar uses `useScrollSpy` to highlight the active section. Each section is an independent component wrapped in `<ErrorBoundary>`.

### Interactions

- Every click, hover, and drag event must respond within 50ms — no debounce on UI interactions.
- Copy buttons show `✓ Copied` for exactly 2 seconds, then revert.
- Drag-over on the upload drop zone swaps `border-accent bg-accent/5` classes instantly.
- Buttons show a pressed/loading state (spinner + disabled) while async operations are in-flight.

---

## 6. Backend — Coding Rules

- **FastAPI + Python only.** Do not introduce new frameworks or swap libraries from `requirements.txt`.
- **All endpoints are `async def`.** No synchronous route handlers.
- **All external API calls use `asyncio.gather()`** for parallel execution. Never await calls sequentially when they can run in parallel. The 3-way parallel gather (Tavily + Serper + Crunchbase) is the core performance strategy.
- **All Pydantic models live in `models/report.py`.** Never define inline Pydantic models inside route handlers or pipeline functions.
- **All pipeline functions** (`claim_parser.py`, `tam_checker.py`, etc.) must accept text/data as parameters and return a typed dict or Pydantic model — they never read from disk or call global state directly.
- **All prompts live in `prompts/`.** No prompt strings inside pipeline files. Import from the prompts module.
- **All external service calls live in `services/`.** Pipeline modules import from `services/` — never call `httpx`, `requests`, or SDK clients directly in pipeline code.
- **Supabase operations live in `db/supabase_client.py`.** Never import supabase or call DB operations from routers or pipeline modules directly.
- **One router file: `routers/analyse.py`.** It handles `POST /analyse` and `GET /report/{id}` only. `main.py` handles app setup and CORS only.
- **CORS must be configured in `main.py`** to allow `http://localhost:5173` in development. Do not hardcode production URLs.
- **Type hints on every function signature.** Every parameter and return type must be annotated.

---

## 7. Backend — AI Pipeline Rules

### Model selection

- **`gemini-2.5-flash`** for all complex reasoning: claim extraction (F1), TAM check (F2), traction validation (F3), moat stress test (F4), founder intel (F5), financial flags (F6), question generation (F7).
- **`gemini-2.5-flash-lite`** for simple aggregation: scorecard (F8) and JSON validation only.
- **Never use Flash for tasks Flash-Lite can handle.** Free quota on Flash (500 RPD) is the binding constraint. Protect it.
- **Never swap models** without updating both `gemini_client.py` and this rules file.

### Retry logic

- **Every Gemini call must use the 3-attempt exponential backoff** defined in `gemini_client.py`: wait 10s on first 429, 20s on second, 30s on third. A rate limit must never crash the demo.
- **Never add bare `try/except Exception`** in pipeline files — let the retry wrapper in `gemini_client.py` handle Gemini errors. Catch only non-Gemini exceptions (e.g., Tavily timeouts) locally.

### JSON parsing

- **Every Gemini response that must return JSON must be prompted to return only JSON** with no preamble, no markdown fences, no explanation. State this explicitly in the system prompt.
- **Always strip markdown fences before `json.loads()`** — Gemini sometimes wraps JSON in ` ```json ` blocks despite instructions. Strip defensively.
- **Validate Gemini JSON output against the Pydantic model immediately** after parsing. If validation fails, log the raw response and return a safe fallback — never return a partially-structured dict.

### Pipeline build order

Build and test in this exact order: F1 → F2 → F4 → F5 → F7 → F8 → F3 → F6.
F1 (claim extraction) must be working before any other module is built. F7 (questions) is never cut — it is the highest-impact output in the demo.

---

## 8. API & Data Contract Rules

- **The response schema in `architecture.md` section 10 is the single source of truth.** Frontend and backend must both conform to it exactly. No field name variations, no snake_case/camelCase mismatches.
- **`POST /analyse` accepts `multipart/form-data` with a `file` field.** Reject non-PDF MIME types immediately with `422 { "detail": "File must be a PDF." }` before running any pipeline step.
- **File size limit is 20MB.** Reject oversized files with a clear error before reading content.
- **`GET /report/{id}`** returns 404 `{ "detail": "Report not found." }` for unknown IDs — never 500.
- **Pipeline failures return 500 `{ "detail": "Analysis failed at module: {module_name}." }`** — always name the failing module so the frontend can surface a useful error.
- **`report_id` is a UUID string.** Always generate with `uuid.uuid4()` — never use sequential integers.
- **Verdict enums are fixed strings.** TAM verdict: `VERIFIED | INFLATED | UNSUBSTANTIATED`. Moat verdict: `STRONG | WEAK | UNSUBSTANTIATED`. Threat level: `CRITICAL | HIGH | MEDIUM | LOW`. Domain fit: `HIGH | MEDIUM-HIGH | MEDIUM | LOW`. Question severity: `HIGH | MEDIUM`. Never return values outside these enums.
- **All score values are `numeric(3,1)` — one decimal place.** Scores are 0.0–10.0. The frontend renders them with `/10`.
- **The `competitors` array at the top level of the response and `claims.moat.competitors` must be identical.** They are the same data — do not generate separately.

---

## 9. Error Handling Rules

### Frontend

- **Every report section is wrapped in `<ErrorBoundary>`** with a `<SectionError>` fallback. A malformed backend response must not crash the page.
- **Upload errors** (wrong type, too large) show inline in the drop zone in `text-verdict-red-text font-mono`, auto-clear after 3 seconds.
- **Network errors during upload** show a persistent error below the drop zone with a retry button — do not silently fail.
- **If `/loading` receives a pipeline failure from the backend,** navigate to `/` and show an error toast — never leave the investor stuck on the loading screen.
- **Empty state for every section** — see `page-spec.md` empty states table. Never show a blank card or a raw null.
- **Never `console.error` without also updating UI state** — a caught error must always produce a visible response to the user.

### Backend

- **Image-only PDFs** (no extractable text) must be caught in `extractor.py`. Return `{ "detail": "Could not extract text from this PDF. The file may be image-based." }` with status 422 — never crash.
- **Empty extraction** (text extracted but no claims found) must be handled in `claim_parser.py` — return an empty `claims` array, not an error.
- **Crunchbase returning no data** is not an error — founder may have no public record. Return empty arrays for `past_ventures` and `credibility_signals`.
- **Tavily / Serper timeouts** must be caught per-service with a 10s timeout. If one service fails, the pipeline continues with reduced data — it does not stop.
- **Never let a 429 from any external API crash the request.** Rate limit errors are handled by retry logic in each service client.
- **Log the raw Gemini response on JSON parse failure** before returning a fallback — this is critical for debugging during the hackathon.

---

## 10. State & Loading Rules

- **The loading page uses optimistic step advancement.** Steps 1–4 are shown as complete 2–3 seconds before the backend confirms. Step 5 advances only when the API actually returns. This is intentional — do not replace it with real backend polling.
- **Every data section on the report page renders independently.** Do not gate the entire report on all data being ready. Render each section the moment its data is available.
- **Skeleton components must match the size and shape of real content.** A skeleton for a `StatCard` is a `h-24 w-full rounded-xl` block. A skeleton for a table row is a `h-4 w-full rounded` line. Do not use generic spinners for content placeholders.
- **Button loading state:** disabled + spinner icon + label change (e.g., "Uploading…"). Re-enable only on success or error — never leave a button permanently disabled.
- **Progress bar on the loading page animates with `transition-all duration-1000 ease-out`** — smooth, not snapping.
- **Questions on the report page stagger in with 150ms delay each** using `animate-fadeIn` and `animationDelay`. Do not render all at once without animation.
- **Scroll spy for the sidebar** uses `IntersectionObserver` via `useScrollSpy.js`. The active section highlight updates as the user scrolls, with no additional state management in `ReportPage.jsx`.

---

## 11. Security & Environment Rules

- **Never hardcode any API key** in any source file. All keys are read from environment variables only.
- **`.env` is never committed.** Only `.env.example` (with placeholder values) is committed.
- **Frontend reads `VITE_API_URL`** for the backend base URL. Never hardcode `localhost:8000` in component or API files.
- **Backend reads all keys via `os.getenv()`** with no default values for secrets — a missing key must raise an error at startup, not silently use `None`.
- **Supabase uses the anon key only** (`SUPABASE_ANON_KEY`). Never use the service role key in application code.
- **File uploads are validated on the backend** (MIME type + size) regardless of frontend validation. Frontend validation is UX; backend validation is security.
- **CORS allows `http://localhost:5173`** during development. Do not open CORS to `*` in any environment.
- **No sensitive data in error messages returned to the client.** Log full errors on the server; return only safe, descriptive messages to the frontend.

---

## 12. What to Never Do

### Never in frontend

- Never use `bg-white` or `text-white` — use design tokens
- Never use `font-bold` (700) — max is `font-semibold` (600)
- Never use `font-sans` for numbers, scores, or data values — always `font-mono`
- Never write uppercase text without `tracking-widest` or `tracking-[0.14em]`
- Never use arbitrary hex or colour values not in `tailwind.config.js`
- Never use the `accent` colour for anything other than CTAs, active nav states, and eyebrow labels
- Never use gradient backgrounds for decoration
- Never use `border-radius` larger than `rounded-xl` except drop zone and pill badges
- Never use `text-center` for body text or data — only upload page and empty states
- Never nest cards more than one level deep
- Never display a score without `/10`
- Never display a percentage without `%` and `font-mono`
- Never use "N/A" for missing data — use `—` (em dash) in `text-text-faint font-mono`
- Never add a route not listed in `page-spec.md`
- Never create a new button variant — use only Primary, Secondary, Ghost from `design.md` section 6.5
- Never use green, amber, or red for decoration — these colours are strictly semantic

### Never in backend

- Never make Gemini API calls sequentially when they can be parallelised
- Never write a bare Gemini call without retry logic
- Never put prompt strings directly in pipeline files — always in `prompts/`
- Never call external APIs (Tavily, Serper, Crunchbase) directly from pipeline or router files — always via `services/`
- Never skip Pydantic validation on Gemini output
- Never use `gemini-2.5-flash` for scorecard aggregation — use Flash-Lite
- Never use `gemini-2.5-flash-lite` for complex reasoning modules — use Flash
- Never return a 500 from `GET /report/{id}` — unknown IDs are always 404
- Never read the PDF file in a router function — `extractor.py` handles all PDF I/O
- Never commit a working endpoint without also handling its error cases

### Never in both

- Never commit `.env`
- Never use `print()` for debugging in production code paths — use `logging`
- Never add a feature, page, or API endpoint not specified in the project docs without explicit instruction
- Never modify `tailwind.config.js` colour tokens without also updating `design.md`
- Never change the API response schema without updating both the Pydantic models and the frontend data mapping

---

*DealLens Rules · v1.0 · Read before writing a single line of code*
