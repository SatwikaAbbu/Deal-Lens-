# Implementation Plan - DealLens Investor CRM Upgrade

This plan outlines the architecture and steps to upgrade DealLens from a single-upload tool into a comprehensive deal-flow management dashboard with automated category-based triage.

## Goal Description
We will add a public-facing submission form for founders, an initial AI triage step that automatically categorizes and filters decks based on the investor's saved preferences, and a centralized dashboard for the investor to manage their deal flow (Accept, Reject, Favourite, Detailed Report).

## User Review Required

> [!IMPORTANT]
> **Database Changes Required**: This feature requires updating our Supabase schema. I will provide the SQL commands to run, or I can execute them programmatically if the anon key has permissions.
> 
> **Architectural Shift**: To save API costs and time, the initial `/submit` by a founder will **only** extract the category and a short description (taking ~5 seconds). The full, deep-dive analysis (Tavily, Apollo, Moat checks) will only run when you, the investor, click **"Detailed Report"** on a deck in your Inbox. Do you agree with this optimized approach?

## Proposed Changes

---

### Database Layer (Supabase)

#### [MODIFY] supabase_schema.sql
- Add new columns to `analyses` table: `status` (pending, inbox, accepted, rejected, favourite, disqualified), `category`, `short_description`, `founder_email`.
- [NEW] Create `investor_preferences` table with columns: `id`, `interested_categories` (text[]), `disqualified_categories` (text[]).

#### [MODIFY] supabase_client.py
- Update `save_report` to handle the new columns.
- Add `get_all_reports()`, `update_report_status()`, `get_preferences()`, and `save_preferences()`.

---

### Backend Pipeline

#### [MODIFY] extraction.py (Prompts)
- Update the F1 extraction prompt to explicitly generate a `short_description` (1-2 sentences summarizing what the startup does).

#### [MODIFY] analyse.py (Router)
- **Split the pipeline**: 
  - Create `POST /submit-deck`: Fast endpoint for the founder form. Extracts text, runs F1 extraction, checks `investor_preferences`, sets status to `inbox` or `disqualified`, and saves the "stub" report.
  - Create `POST /analyse-full/{report_id}`: Triggered from the dashboard. Runs the heavy parallel pipeline (Tavily, Serper, Apollo, F2-F8) on a saved stub report.

#### [NEW] `dashboard.py` (Router)
- Create REST endpoints for the dashboard: `GET /deals`, `PATCH /deals/{id}/status`, `GET /preferences`, `POST /preferences`.

---

### Frontend Application

#### [MODIFY] App.jsx
- Set up new routing structure:
  - `/` -> Landing/Upload page (existing).
  - `/submit` -> Public-facing founder submission form (shareable link).
  - `/dashboard` -> Investor CRM dashboard.
  - `/report/:id` -> Detailed report (existing).

#### [NEW] `SubmitPage.jsx`
- Clean, public-facing form with inputs for: Founder Email, Startup Name, Pitch Deck (PDF).
- Shows a "Thank you" state upon successful upload.
- **Shareable**: This page is designed to be shared as a standalone link (e.g., `yourdomain.com/submit`) that investors can embed on their website or share with founders.

#### [NEW] `DashboardPage.jsx`
- **Summary Stats Bar** at the top: Total Received, Inbox, Accepted, Rejected, Favourites, Disqualified — all as count cards for a quick at-a-glance overview.
- Sidebar with views: Inbox, Favourites, Accepted, Rejected, Disqualified.
- Main area displaying deal cards (Startup Name, Category, Description).
- Action buttons on each card: Accept, Reject, Favourite, **Detailed Report**.

#### [NEW] `PreferencesModal.jsx`
- Settings UI for the investor to add/remove tags from their `interested` and `disqualified` category lists.

#### [NEW] `api/dashboard.js`
- Axios helpers for all new dashboard endpoints.

## Verification Plan

### Manual Verification
1. **Preferences**: Open Dashboard -> Settings. Add "EdTech" to interested and "Crypto" to disqualified.
2. **Submit Flow**: Go to `/submit`, upload an EdTech deck. 
3. **Triage**: Verify it instantly appears in the Dashboard's "Inbox".
4. **Submit Flow 2**: Upload a Crypto deck. Verify it goes straight to "Disqualified".
5. **Deep Dive**: Click "Detailed Report" on the EdTech deck in the Inbox, verify it runs the full analysis and displays the report page.
6. **Stats Bar**: Verify the summary stats at the top of the dashboard update correctly.
