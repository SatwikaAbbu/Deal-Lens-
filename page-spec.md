# DealLens — Page Specification

> **For the agent:** This file defines every page, section, and element in DealLens.
> Read `design.md` first — all component names, tokens, and Tailwind classes referenced
> here are defined there. Do not render any element not listed in this spec.
> Do not invent layouts. Follow this exactly.

---

## Optimistic UI & Perceived Performance — Global Rules

These rules apply to EVERY page and component. The goal is to make DealLens
feel instant even when it isn't. An investor must never feel like they're waiting.

### The 4 techniques used throughout this spec

**1. Skeleton loading** — every data element has a skeleton placeholder that
renders immediately while real data loads. Skeletons are animated shimmer blocks
that match the exact size and shape of the real content they replace.

```jsx
// Skeleton shimmer — use this for ALL loading placeholders
function Skeleton({ className }) {
  return (
    <div className={`
      animate-pulse rounded bg-gradient-to-r
      from-bg-raised via-bg-surface to-bg-raised
      bg-[length:200%_100%] animate-shimmer
      ${className}
    `} />
  );
}

// Add to tailwind.config.js under theme.extend.animation:
// shimmer: 'shimmer 1.5s infinite'
// And keyframes:
// shimmer: { '0%': { backgroundPosition: '200% 0' }, '100%': { backgroundPosition: '-200% 0' } }
```

**2. Progressive rendering** — sections render as soon as their data arrives.
Do not wait for ALL data before showing ANYTHING. Show the scorecard the moment
it arrives. Show the founder card the moment it arrives. Each section is
independent.

**3. Optimistic step advancement** — on the loading page, steps advance
slightly before the actual backend confirms completion. If a step takes
8 seconds, show it as "done" at 6 seconds. The user feels progress, not waiting.

**4. Instant feedback** — every click, hover, and interaction gets a response
within 50ms. Buttons show a pressed state. Nav items highlight immediately.
Upload drag zone changes colour on dragover without delay.

---

## Page 1 — Upload Page

**Route:** `/`
**Purpose:** Investor lands here, uploads a pitch deck PDF, triggers analysis.
**Layout:** Full screen centred — no sidebar, no nav.
**Shell component:** `<UploadPage />` from `design.md` section 6.8

### Elements

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│                    [LOGO]                           │
│                   DealLens                          │
│         AI-powered due diligence in 10 min          │
│                                                     │
│         ┌─────────────────────────────┐             │
│         │                             │             │
│         │   📄  Drop pitch deck here  │             │
│         │   PDF only · Max 20MB       │             │
│         │                             │             │
│         │      [Browse file btn]      │             │
│         │                             │             │
│         └─────────────────────────────┘             │
│                                                     │
│         [3 trust signals below drop zone]           │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Element Spec

| Element | Component | Tailwind classes | Notes |
|---|---|---|---|
| Page background | `div` | `min-h-screen bg-bg-base flex flex-col items-center justify-center px-6` | |
| Logo wordmark | `h1` | `text-3xl font-sans font-semibold text-text-primary` | "Deal" + `<span className="text-accent-light">Lens</span>` |
| Tagline | `p` | `text-sm font-sans text-text-muted mt-2 mb-12` | "AI-powered due diligence in under 10 minutes" |
| Drop zone (idle) | `div` | `w-full max-w-lg rounded-2xl border-2 border-dashed border-white/10 bg-bg-surface py-16 px-8 flex flex-col items-center gap-4 cursor-pointer transition-colors duration-150` | |
| Drop zone (dragging) | same + | `border-accent bg-accent/5` replaces border/bg | Swap class on `dragover` |
| Drop zone icon | `div` | `w-12 h-12 rounded-xl bg-bg-raised flex items-center justify-center text-2xl` | Emoji `📄` |
| Drop zone label | `p` | `text-sm font-sans font-medium text-text-secondary` | "Drop your pitch deck here" |
| Drop zone sublabel | `p` | `text-xs font-mono text-text-faint mt-1` | "PDF only · Max 20MB" |
| Browse button | `label` wrapping `input[file]` | Primary button style from `design.md` 6.5 | `accept=".pdf"` on input |
| Trust signals row | `div` | `flex items-center gap-6 mt-8` | 3 items below drop zone |
| Trust signal item | `div` | `flex items-center gap-2 text-xs font-mono text-text-faint` | See trust signals below |

### Trust Signals (3 items below drop zone)

```
🔒 Private · never stored    ⚡ Results in ~10 min    🎯 5 investor questions
```

Each: `flex items-center gap-1.5 text-xs font-mono text-text-faint`

### States

**Idle:** Drop zone with dashed border, all elements visible.

**File selected (before upload):**
- Drop zone shows file name: `text-sm font-mono text-text-primary`
- File size: `text-xs font-mono text-text-faint`
- Browse button changes to "Analyse Deck" primary button
- Add remove `×` ghost button next to filename

**Uploading (after click):**
- Button shows spinner + "Uploading…" — disable pointer events
- Drop zone border pulses: `animate-pulse border-accent/50`
- Navigate to `/loading` immediately on upload success — do not wait for analysis

**Error (wrong file type or too large):**
- Drop zone border turns red: `border-verdict-red-bar`
- Error message below drop zone: `text-xs font-mono text-verdict-red-text mt-3`
- Message: "Only PDF files are supported" or "File exceeds 20MB limit"
- Auto-clears after 3 seconds

### Interactions

- `dragover` → swap border + bg classes instantly (no delay)
- `dragleave` → revert instantly
- `drop` → show filename, show Analyse button
- File input `change` → same as drop
- Click Analyse → optimistically navigate to `/loading` while upload happens in background

---

## Page 2 — Loading Page

**Route:** `/loading`
**Purpose:** Pipeline runs. Investor waits. Make every second feel productive.
**Layout:** Full screen centred — no sidebar, no nav.
**Shell:** `<LoadingState />` from `design.md` section 6.9

### The Perceived Performance Strategy

The backend takes ~60–120 seconds. The investor must never feel this.
Use this exact timing strategy:

```
Step 1 — Extracting claims        → show "done" after 4s  (real: ~5s)
Step 2 — Searching market reports → show "done" after 12s (real: ~15s)
Step 3 — Mapping competitors      → show "done" after 22s (real: ~25s)
Step 4 — Researching founders     → show "done" after 32s (real: ~35s)
Step 5 — Generating questions     → show "done" when API actually returns
```

Each step advances 2–3 seconds before the backend confirms it —
the investor sees progress, not waiting.

### Layout

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│   01 — ANALYSING DECK           [startup name]      │
│                                                     │
│   ✓  Extracting claims                              │
│   ●  Searching market reports    ← active (pulse)   │
│   ○  Mapping competitors                            │
│   ○  Researching founders                           │
│   ○  Generating questions                           │
│                                                     │
│   ════════════════════░░░░░░░  40%                  │
│                                                     │
│   [Rotating insight card]                           │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Element Spec

| Element | Tailwind classes | Notes |
|---|---|---|
| Page bg | `min-h-screen bg-bg-base flex flex-col items-center justify-center px-6` | |
| Eyebrow | `text-[10px] font-mono uppercase tracking-[0.14em] text-accent-light mb-2` | "01 — Analysing Deck" |
| Startup name | `text-base font-sans font-semibold text-text-primary mb-8` | From upload filename or extracted name |
| Steps container | `w-full max-w-sm space-y-3 mb-8` | |
| Step done | `flex items-center gap-3` | Dot: `w-5 h-5 rounded-full bg-verdict-green-bg text-verdict-green-text text-[10px] font-mono flex items-center justify-center` showing `✓` |
| Step active | same | Dot: `bg-accent/20 text-accent-light animate-pulse` showing step number |
| Step pending | same | Dot: `bg-bg-raised text-text-faint` showing step number |
| Step label done | `text-sm font-sans text-text-muted line-through` | |
| Step label active | `text-sm font-sans font-medium text-text-primary` | |
| Step label pending | `text-sm font-sans text-text-faint` | |
| Progress bar track | `w-full max-w-sm h-1 rounded-full bg-score-track mb-2` | |
| Progress bar fill | `h-1 rounded-full bg-accent transition-all duration-1000 ease-out` | Width = percentage, animate smoothly |
| Progress label | `text-xs font-mono text-text-muted text-right` | "40%" |

### Rotating Insight Card

Below the progress bar, show a rotating card every 8 seconds.
Content: real investor facts that prime the investor for the report.

```jsx
const INSIGHTS = [
  "Most founders cite total industry size — not their actual addressable market.",
  "Day-30 retention is the single metric that can't be faked.",
  "The team slide is read first by 67% of experienced VCs.",
  "A moat that can be copied in 6 months is a feature, not a moat.",
  "Hockey-stick projections without an inflection explanation are always a flag.",
];
```

```
┌─────────────────────────────────┐
│  💡  Investor insight           │
│                                 │
│  "Most founders cite total      │
│   industry size — not their     │
│   actual addressable market."   │
└─────────────────────────────────┘
```

| Element | Tailwind classes |
|---|---|
| Card | `w-full max-w-sm rounded-xl bg-bg-surface shadow-card p-4 mt-8` |
| Eyebrow | `text-[10px] font-mono uppercase tracking-widest text-accent-light mb-2` — "💡 Investor insight" |
| Text | `text-sm font-sans text-text-secondary leading-relaxed italic` |
| Transition | `transition-opacity duration-500` — fade out old, fade in new |

### On completion

When backend returns the full report JSON:
- Progress bar fills to 100% instantly
- All steps show `✓`
- After 600ms delay → navigate to `/report/:id`
- Do not show a "Report ready" screen — go directly

---

## Page 3 — Report Page

**Route:** `/report/:id`
**Purpose:** Display the full investment brief across 5 sections.
**Layout:** Sidebar (fixed left) + scrollable main content area.
**Navigation:** Long scroll. Sidebar links jump to section anchors and
highlight the currently visible section as the investor scrolls.

### Shell Structure

```jsx
<div className="min-h-screen bg-bg-base flex">
  <ReportSidebar active={activeSection} />
  <main className="ml-56 flex-1 px-8 py-8">
    <ReportHeader startup={report.scorecard.startup_name} file={report.file_name} />
    <div className="max-w-4xl mx-auto space-y-8 mt-6">
      <Section1Scorecard    id="scorecard"   data={report.scorecard} />
      <Section2Founder      id="founder"     data={report.founder} />
      <Section3Claims       id="claims"      data={report.claims} />
      <Section4Competitors  id="competitors" data={report.competitors} />
      <Section5Questions    id="questions"   data={report.questions} />
    </div>
  </main>
</div>
```

### Report Header (above all sections)

```
DealLens                    ziple-deck.pdf · Analysed just now · Overall: 4.5/10
```

| Element | Tailwind classes | Notes |
|---|---|---|
| Header wrapper | `flex items-center justify-between mb-6 max-w-4xl mx-auto` | |
| Startup name | `text-2xl font-sans font-semibold text-text-primary` | From `report.scorecard.startup_name` |
| Meta row | `flex items-center gap-4` | |
| File name | `text-xs font-mono text-text-faint` | |
| Separator | `text-text-faint` — `·` | |
| Time | `text-xs font-mono text-text-faint` | "Analysed just now" |
| Overall score badge | `px-3 py-1 rounded-full font-mono text-sm font-medium` + verdict colour | Score from `report.scorecard.overall` |

### Sidebar — `ReportSidebar`

```
┌──────────────┐
│  DealLens    │
├──────────────┤
│  01          │
│  Deal        │
│  Scorecard   │ ← active (accent left border)
│              │
│  02          │
│  Founder     │
│  Card        │
│              │
│  03          │
│  Claim       │
│  Verify...   │
│              │
│  04          │
│  Competitor  │
│  Map         │
│              │
│  05          │
│  Investor    │
│  Questions   │
├──────────────┤
│  ziple.pdf   │
│  just now    │
└──────────────┘
```

Full sidebar spec in `design.md` section 6.7. Active section detected via
`IntersectionObserver` — whichever section's top is within 100px of viewport
top is considered active.

```jsx
// Intersection observer setup
useEffect(() => {
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) setActiveSection(entry.target.id);
      });
    },
    { rootMargin: '-10% 0px -80% 0px' }
  );
  ['scorecard','founder','claims','competitors','questions']
    .forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
  return () => observer.disconnect();
}, []);
```

---

## Report Section 1 — Deal Scorecard

**Anchor:** `id="scorecard"`
**Data:** `report.scorecard`
**Renders first** — highest priority. Show skeleton immediately, replace with data.

### Layout

```
┌─────────────────────────────────────────────────────┐
│  01 — SCORECARD                                     │
│  Deal Scorecard                                     │
├─────────────┬─────────────┬─────────────────────────┤
│  4.5 / 10   │  3 Flags    │  2 Strengths            │
│  Overall    │  Found      │  Identified             │
├─────────────┴─────────────┴─────────────────────────┤
│  Founder Credibility    6/10  ████████░░░░░░░░       │
│  Market Validity        5/10  ██████░░░░░░░░░░       │
│  Competitive Moat       3/10  ████░░░░░░░░░░░░       │
│  Traction Quality       5/10  ██████░░░░░░░░░░       │
│  Financial Soundness    4/10  █████░░░░░░░░░░░       │
├─────────────────────────────────────────────────────┤
│  TOP FLAGS                                          │
│  🔴  TAM inflated 8x — total grocery vs q-commerce  │
│  🔴  Moat claim unsubstantiated — no infra exists   │
│  🟡  No retention data alongside user count claim   │
├─────────────────────────────────────────────────────┤
│  STRENGTHS                                          │
│  🟢  Founder has relevant domain experience         │
│  🟢  Funding ask is appropriate for stage           │
└─────────────────────────────────────────────────────┘
```

### Element Spec

**Card wrapper:** `ReportCard` component with `eyebrow="01 — Scorecard"` and `title="Deal Scorecard"`

**Stat row (3 cards):**

```jsx
<div className="grid grid-cols-3 gap-3 mb-6">
  <StatCard label="Overall Score"   value={`${overall}/10`} variant={scoreVariant(overall)} />
  <StatCard label="Flags Found"     value={flags.length}    variant="red" subtext="Need attention" />
  <StatCard label="Strengths"       value={strengths.length} variant="green" subtext="Identified" />
</div>
```

**Score bars (5 dimensions):**

```jsx
<div className="space-y-4 mb-6">
  <ScoreBar label="Founder Credibility"  score={scorecard.dimensions.founder_credibility} />
  <ScoreBar label="Market Validity"      score={scorecard.dimensions.market_validity} />
  <ScoreBar label="Competitive Moat"     score={scorecard.dimensions.competitive_moat} />
  <ScoreBar label="Traction Quality"     score={scorecard.dimensions.traction_quality} />
  <ScoreBar label="Financial Soundness"  score={scorecard.dimensions.financial_soundness} />
</div>
```

**Flags list:**

```
Header: text-[10px] font-mono uppercase tracking-widest text-text-muted mb-3 — "TOP FLAGS"
```

Each flag row:
```jsx
<div className="flex items-start gap-3 py-2.5 border-b border-white/5 last:border-0">
  <div className="w-1.5 h-1.5 rounded-full bg-verdict-red-bar mt-1.5 flex-shrink-0" />
  <p className="text-sm font-sans text-text-secondary leading-snug">{flag}</p>
</div>
```
Amber flags use `bg-verdict-amber-bar` dot. Red flags use `bg-verdict-red-bar`.

**Strengths list:**

Same structure as flags but `bg-verdict-green-bar` dot and separated by a
`border-t border-white/5 pt-4 mt-4` divider with eyebrow "STRENGTHS".

### Skeleton State

```jsx
// Show this while scorecard data loads
<div className="space-y-4">
  <div className="grid grid-cols-3 gap-3">
    {[1,2,3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}
  </div>
  <div className="space-y-4">
    {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-8 rounded-md" />)}
  </div>
</div>
```

### Optimistic behaviour

Score bars animate their fill from 0% to final value on mount:
`transition-all duration-700 ease-out` with a 100ms stagger per bar.

```jsx
// Stagger score bar animations
const [animate, setAnimate] = useState(false);
useEffect(() => {
  const t = setTimeout(() => setAnimate(true), 100);
  return () => clearTimeout(t);
}, []);

// In ScoreBar: width = animate ? `${pct}%` : '0%'
```

---

## Report Section 2 — Founder Intelligence Card

**Anchor:** `id="founder"`
**Data:** `report.founder`

### Layout

```
┌─────────────────────────────────────────────────────┐
│  02 — FOUNDER                                       │
│  Founder Intelligence                               │
├────────────────────────┬────────────────────────────┤
│                        │  DOMAIN FIT                │
│  [Avatar placeholder]  │  Medium-High               │
│  Founder Name          │                            │
│  Role · Company        │  First-time founder,       │
│                        │  strong domain background, │
│                        │  no public controversies.  │
├────────────────────────┴────────────────────────────┤
│  PAST VENTURES          CREDIBILITY SIGNALS         │
│  ─ No prior startups    ✓ 2yr Swiggy ops exp        │
│    on record            ✓ Relevant supply chain     │
│                         ✗ No prior exit history     │
├─────────────────────────────────────────────────────┤
│  PUBLIC INTELLIGENCE    [Tavily + Crunchbase]        │
│  No news mentions of controversy found.             │
│  LinkedIn shows 2 years at Swiggy in dark store     │
│  operations — directly relevant domain experience.  │
└─────────────────────────────────────────────────────┘
```

### Element Spec

**Card wrapper:** `ReportCard` with `eyebrow="02 — Founder"` `title="Founder Intelligence"`

**Top row (2 columns):**

```jsx
<div className="grid grid-cols-3 gap-6 mb-6">
  {/* Left col — avatar + identity */}
  <div className="col-span-1 flex flex-col items-center gap-3">
    {/* Avatar placeholder */}
    <div className="w-16 h-16 rounded-full bg-bg-raised flex items-center justify-center text-2xl font-sans font-semibold text-text-muted border border-white/10">
      {founder.name[0]}
    </div>
    <div className="text-center">
      <p className="text-sm font-sans font-semibold text-text-primary">{founder.name}</p>
      <p className="text-xs font-mono text-text-faint">{founder.role}</p>
    </div>
  </div>

  {/* Right col — domain fit verdict */}
  <div className="col-span-2">
    <p className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-1">
      Domain Fit
    </p>
    <p className={`text-lg font-mono font-medium mb-3 ${domainFitColour}`}>
      {founder.domain_fit}
    </p>
    <p className="text-sm font-sans text-text-secondary leading-relaxed">
      {founder.verdict}
    </p>
  </div>
</div>
```

**Domain fit colour mapping:**
- `HIGH` → `text-verdict-green-text`
- `MEDIUM-HIGH` or `MEDIUM` → `text-verdict-amber-text`
- `LOW` → `text-verdict-red-text`

**Past ventures + credibility signals (2 columns):**

```jsx
<div className="grid grid-cols-2 gap-6 mb-6 pt-4 border-t border-white/5">
  {/* Past ventures */}
  <div>
    <p className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-3">Past Ventures</p>
    {founder.past_ventures.length === 0
      ? <p className="text-xs font-mono text-text-faint">— No prior startups on record</p>
      : founder.past_ventures.map(v =>
          <p key={v} className="text-sm text-text-secondary mb-1">{v}</p>
        )
    }
  </div>
  {/* Credibility signals */}
  <div>
    <p className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-3">Credibility Signals</p>
    {founder.credibility_signals.map(s =>
      <div key={s} className="flex items-start gap-2 mb-1.5">
        <span className="text-verdict-green-text text-xs mt-0.5">✓</span>
        <p className="text-sm text-text-secondary">{s}</p>
      </div>
    )}
    {founder.red_flags.map(f =>
      <div key={f} className="flex items-start gap-2 mb-1.5">
        <span className="text-verdict-red-text text-xs mt-0.5">✗</span>
        <p className="text-sm text-text-secondary">{f}</p>
      </div>
    )}
  </div>
</div>
```

**Public intelligence block:**

```jsx
<div className="bg-bg-base rounded-lg p-4 border border-white/5">
  <div className="flex items-center justify-between mb-2">
    <p className="text-[10px] font-mono uppercase tracking-widest text-text-muted">
      Public Intelligence
    </p>
    <p className="text-[10px] font-mono text-text-faint">
      Tavily · Crunchbase
    </p>
  </div>
  <p className="text-sm font-sans text-text-secondary leading-relaxed">
    {founder.public_summary}
  </p>
</div>
```

### Skeleton State

```jsx
<div className="space-y-4">
  <div className="grid grid-cols-3 gap-6">
    <div className="flex flex-col items-center gap-3">
      <Skeleton className="w-16 h-16 rounded-full" />
      <Skeleton className="h-4 w-24 rounded" />
    </div>
    <div className="col-span-2 space-y-2">
      <Skeleton className="h-3 w-16 rounded" />
      <Skeleton className="h-6 w-32 rounded" />
      <Skeleton className="h-12 w-full rounded" />
    </div>
  </div>
  <Skeleton className="h-24 w-full rounded-lg" />
</div>
```

---

## Report Section 3 — Claim Verification Table

**Anchor:** `id="claims"`
**Data:** `report.claims`

### Layout

```
┌─────────────────────────────────────────────────────┐
│  03 — CLAIMS                                        │
│  Claim Verification                                 │
│                                                     │
│  [Filter: All | Inflated | Unsubstantiated | ...]   │
│                                                     │
│  CLAIM                          VERDICT    ▼        │
│  ─────────────────────────────────────────────────  │
│  TAM of ₹2.5 lakh crore         INFLATED   ▼        │
│  ▼ [expanded — evidence, source, question]          │
│  ─────────────────────────────────────────────────  │
│  30% faster than Zepto          UNSUBSTANTIATED ▼   │
│  ─────────────────────────────────────────────────  │
│  10,000 active users            PARTIAL     ▼       │
│  ─────────────────────────────────────────────────  │
│  Ex-Swiggy ops experience       VERIFIED    ▼       │
└─────────────────────────────────────────────────────┘
```

### Filter Bar

```jsx
const FILTERS = ['All', 'Inflated', 'Unsubstantiated', 'Partial', 'Verified'];

<div className="flex items-center gap-2 mb-4 flex-wrap">
  {FILTERS.map(f => (
    <button
      key={f}
      onClick={() => setFilter(f)}
      className={`
        px-3 py-1 rounded-full text-xs font-mono font-medium
        transition-colors duration-100 border
        ${filter === f
          ? 'bg-accent/10 text-accent-light border-accent/30'
          : 'bg-transparent text-text-muted border-white/10 hover:border-white/20'
        }
      `}
    >
      {f}
    </button>
  ))}
</div>
```

### Table

Use `ExpandableRow` component from `design.md` section 6.5. Each row:

| Column | Width | Content |
|---|---|---|
| Claim | `w-auto flex-1` | `text-sm font-sans text-text-secondary` — the claim text |
| Verdict | `w-32` | `<VerdictBadge variant={...} />` |
| Toggle | `w-8 text-right` | `▼` / `▲` in `text-xs font-mono text-text-faint` |

Expanded row content (from `design.md` 6.5):
- Evidence paragraph
- Source (font-mono, text-faint)
- Question to ask (accent left border)

### Optimistic behaviour

Claims table renders row by row as data arrives, not all at once.
If only 3 of 7 claims have been processed, show those 3 with real data
and 4 skeleton rows below. Never show a blank screen.

```jsx
// Interleave real rows and skeleton rows
{[...realClaims, ...Array(pendingCount).fill(null)].map((claim, i) =>
  claim
    ? <ExpandableRow key={i} {...claim} />
    : <SkeletonRow key={`sk-${i}`} />
)}
```

**Skeleton row:**
```jsx
function SkeletonRow() {
  return (
    <tr className="border-b border-white/5">
      <td className="px-4 py-3"><Skeleton className="h-4 w-3/4 rounded" /></td>
      <td className="px-4 py-3"><Skeleton className="h-5 w-24 rounded-full" /></td>
      <td className="px-4 py-3 text-right"><Skeleton className="h-3 w-4 rounded ml-auto" /></td>
    </tr>
  );
}
```

---

## Report Section 4 — Competitor Map

**Anchor:** `id="competitors"`
**Data:** `report.competitors`

### Layout

```
┌─────────────────────────────────────────────────────┐
│  04 — COMPETITORS                                   │
│  Competitor Map                                     │
│                                                     │
│  [Moat verdict banner]                              │
│  ┌────────────────────────────────────────────────┐ │
│  │ WEAK — "30% speed advantage" is unsubstantiated│ │
│  │ against 3 well-funded incumbents               │ │
│  └────────────────────────────────────────────────┘ │
│                                                     │
│  NAME       BACKING         SCALE     THREAT        │
│  ──────────────────────────────────────────────── │
│  Blinkit    Zomato $800M+   1,000+    CRITICAL     │
│  Zepto      $1.4B raised    700+      CRITICAL     │
│  Swiggy     Listed          600+      CRITICAL     │
│  Flipkart   Walmart         150+      HIGH         │
│  Amazon     Amazon          Piloting  HIGH         │
└─────────────────────────────────────────────────────┘
```

### Moat Verdict Banner

Appears above the table. Colour matches moat verdict.

```jsx
const MOAT_STYLES = {
  STRONG:          { bg: 'bg-verdict-green-bg', border: 'border-verdict-green-border', text: 'text-verdict-green-text', label: 'STRONG' },
  WEAK:            { bg: 'bg-verdict-amber-bg', border: 'border-verdict-amber-border', text: 'text-verdict-amber-text', label: 'WEAK'   },
  UNSUBSTANTIATED: { bg: 'bg-verdict-red-bg',   border: 'border-verdict-red-border',   text: 'text-verdict-red-text',   label: 'UNSUBSTANTIATED' },
};

<div className={`rounded-lg border p-4 mb-4 ${style.bg} ${style.border}`}>
  <div className="flex items-start gap-3">
    <span className={`text-xs font-mono font-medium uppercase tracking-wide ${style.text} flex-shrink-0 mt-0.5`}>
      {style.label}
    </span>
    <p className={`text-sm font-sans ${style.text} leading-relaxed`}>
      {claims.moat.explanation}
    </p>
  </div>
</div>
```

### Competitor Table

Uses `DataTable` from `design.md` section 6.4 with these columns:

```js
const columns = [
  { key: 'name',    label: 'Name'    },
  { key: 'backing', label: 'Backing' },
  { key: 'scale',   label: 'Scale'   },
  { key: 'threat',  label: 'Threat'  },
];
```

`threat` column renders `<ThreatCell level={row.threat_level} />` from `design.md` 6.4.

`name` column: `text-sm font-sans font-medium text-text-primary`
`backing` column: `text-sm font-mono text-text-secondary`
`scale` column: `text-sm font-mono text-text-muted`

### Skeleton State

```jsx
<div className="space-y-3">
  <Skeleton className="h-14 w-full rounded-lg" /> {/* Banner */}
  <div className="rounded-xl overflow-hidden shadow-card">
    {[1,2,3,4,5].map(i => (
      <div key={i} className="flex gap-4 px-4 py-3 border-b border-white/5">
        <Skeleton className="h-4 w-24 rounded" />
        <Skeleton className="h-4 w-32 rounded" />
        <Skeleton className="h-4 w-16 rounded" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
    ))}
  </div>
</div>
```

---

## Report Section 5 — Investor Questions

**Anchor:** `id="questions"`
**Data:** `report.questions`
**Priority:** Highest visual impact. This is the section investors screenshot.

### Layout

```
┌─────────────────────────────────────────────────────┐
│  05 — QUESTIONS                                     │
│  5 Questions to Ask This Founder                    │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │  01  [Market] [HIGH]                        │   │
│  │  Your deck cites ₹2.5L Cr TAM — total       │   │
│  │  grocery. Walk me through your actual        │   │
│  │  quick commerce SAM bottom-up.              │   │
│  │                              ▼              │   │
│  └─────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────┐   │
│  │  02  [Moat] [HIGH]                          │   │
│  │  You claim 30% faster than Zepto...         │   │
│  └─────────────────────────────────────────────┘   │
│  ... (3 more)                                       │
│                                                     │
│  [Copy all questions btn]                           │
└─────────────────────────────────────────────────────┘
```

### Element Spec

**Section card:** `ReportCard` with `eyebrow="05 — Questions"` `title="5 Questions to Ask This Founder"`

**Questions list:**

```jsx
<div className="flex flex-col gap-4">
  {questions.map(q => (
    <QuestionCard key={q.rank} {...q} />
  ))}
</div>
```

Use `QuestionCard` from `design.md` section 6.10. Exactly as specified there.

**Copy all button** — below the questions list:

```jsx
<div className="flex justify-end mt-4 pt-4 border-t border-white/5">
  <button
    onClick={() => copyAllQuestions(questions)}
    className="flex items-center gap-2 px-4 py-2 rounded-md bg-transparent border border-white/10 hover:bg-bg-raised text-sm font-sans font-medium text-text-secondary hover:text-text-primary transition-colors"
  >
    <span className="text-xs">📋</span>
    Copy all questions
  </button>
</div>
```

Copy format (plain text, for pasting into notes):

```
Q1 [Market — HIGH]
Your deck cites ₹2.5L Cr TAM — total grocery. Walk me through your actual quick commerce SAM bottom-up.
Strong answer: Founder should build from unit economics — orders/day × basket size × market share.

Q2 [Moat — HIGH]
...
```

### Optimistic behaviour

Questions render one by one with a 150ms stagger as they arrive:

```jsx
{questions.map((q, i) => (
  <div
    key={q.rank}
    className="animate-fadeIn"
    style={{ animationDelay: `${i * 150}ms` }}
  >
    <QuestionCard {...q} />
  </div>
))}
```

Add to `tailwind.config.js`:
```js
// animation
fadeIn: 'fadeIn 0.3s ease-out both',
// keyframes
fadeIn: { '0%': { opacity: 0, transform: 'translateY(8px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } }
```

### Skeleton State

```jsx
{[1,2,3,4,5].map(i => (
  <Skeleton key={i} className="h-20 w-full rounded-xl" />
))}
```

---

## Empty States

Every section must handle missing or empty data gracefully.
Never show a blank card. Never show a JavaScript error.

| Section | Empty condition | What to show |
|---|---|---|
| Scorecard | `overall` is null | Skeleton (still loading) |
| Founder | `founder` is null | "No public founder data found. Founder may have a limited public footprint." |
| Claims | `claims` array empty | "No verifiable claims extracted from this deck." |
| Competitors | `competitors` array empty | "No funded competitors found in this category." |
| Questions | `questions` array empty | "Questions could not be generated. Check the claims data." |

Empty state style:

```jsx
<div className="flex flex-col items-center justify-center py-12 text-center">
  <p className="text-text-faint text-sm font-mono">—</p>
  <p className="text-text-faint text-xs font-mono mt-2">{message}</p>
</div>
```

---

## Global Interaction Patterns

### Scroll behaviour

```js
// Sidebar link click → smooth scroll to section
document.getElementById(sectionId).scrollIntoView({ behavior: 'smooth' });
```

### Error boundary

Every report section is wrapped in an error boundary.
If a section crashes, show a contained error — do not crash the whole page.

```jsx
<ErrorBoundary fallback={<SectionError section="Scorecard" />}>
  <Section1Scorecard ... />
</ErrorBoundary>

function SectionError({ section }) {
  return (
    <div className="rounded-xl bg-verdict-red-bg border border-verdict-red-border p-5">
      <p className="text-xs font-mono uppercase tracking-widest text-verdict-red-text mb-1">
        Error
      </p>
      <p className="text-sm font-sans text-text-secondary">
        {section} could not be rendered. The data may be malformed.
      </p>
    </div>
  );
}
```

### Copy feedback

Any "copy" button shows instant feedback:

```jsx
const [copied, setCopied] = useState(false);

function handleCopy() {
  navigator.clipboard.writeText(text);
  setCopied(true);
  setTimeout(() => setCopied(false), 2000);
}

// Button label
{copied ? '✓ Copied' : 'Copy all questions'}
```

---

## Route Summary

| Route | Component | Auth | Notes |
|---|---|---|---|
| `/` | `UploadPage` | None | Entry point |
| `/loading` | `LoadingPage` | None | Redirect to `/report/:id` on complete |
| `/report/:id` | `ReportPage` | None | Fetch report by id from Supabase on mount |
| `*` | `NotFound` | None | Simple: "Report not found." dark page |

### 404 / Not Found

```jsx
function NotFound() {
  return (
    <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center gap-4">
      <p className="text-4xl font-mono text-text-faint">404</p>
      <p className="text-sm font-sans text-text-muted">Report not found.</p>
      <a href="/" className="text-sm font-mono text-accent-light hover:underline">
        ← Analyse a new deck
      </a>
    </div>
  );
}
```

---

*DealLens Page Specification · v1.0 · Bower School of Entrepreneurship Hackathon*
