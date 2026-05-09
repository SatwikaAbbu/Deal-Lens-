# DealLens — Design System

> **For the agent:** Read this file completely before writing any UI code.
> Every design decision is defined here. When in doubt, refer back to this file.
> Do not invent values. Do not use Tailwind defaults that conflict with this spec.

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [Color System](#2-color-system)
3. [Typography](#3-typography)
4. [Spacing & Layout](#4-spacing--layout)
5. [Border & Shadow System](#5-border--shadow-system)
6. [Component Library](#6-component-library)
7. [Semantic Color Rules](#7-semantic-color-rules)
8. [Responsive Rules](#8-responsive-rules)
9. [Do Not Rules](#9-do-not-rules)

---

## 1. Design Philosophy

DealLens is a **professional investor intelligence tool**, not a marketing website or consumer app. Every design decision serves one goal: **helping an investor scan, understand, and act on data in the least amount of time possible**.

Three principles govern every component:

**Clarity over decoration.** If an element does not help the user understand data faster, it does not exist. No gradients for visual interest. No illustrations. No decorative icons.

**Data is the design.** The report content — scores, verdicts, competitor tables, investor questions — is what the user came to see. The UI chrome exists only to frame it. Background, borders, and typography create hierarchy without competing with content.

**Trust through precision.** Monospace fonts for numbers. Tight spacing for data density. Consistent verdict colours that never vary. An investor must feel they are reading a rigorous analytical brief, not a startup's marketing output.

---

## 2. Color System

### Setup — `tailwind.config.js`

Add these to your Tailwind config under `theme.extend.colors`. Every component in this spec uses these token names, not raw hex values.

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // --- Backgrounds ---
        'bg-base':      '#08090a', // Deepest canvas — page background
        'bg-panel':     '#0f1011', // Sidebar, nav background
        'bg-surface':   '#191a1b', // Cards, containers, elevated surfaces
        'bg-raised':    '#222326', // Hover states, slightly elevated elements

        // --- Text ---
        'text-primary':   '#f7f8f8', // Headings, primary content
        'text-secondary': '#d0d6e0', // Body text, descriptions
        'text-muted':     '#8a8f98', // Labels, metadata, placeholders
        'text-faint':     '#62666d', // Timestamps, disabled, de-emphasised

        // --- Borders ---
        'border-subtle':   'rgba(255,255,255,0.05)', // Default — whisper border
        'border-standard': 'rgba(255,255,255,0.08)', // Cards, inputs, containers
        'border-strong':   'rgba(255,255,255,0.12)', // Focused or highlighted elements

        // --- Brand Accent ---
        'accent':       '#5e6ad2', // Primary CTA buttons only
        'accent-light': '#7170ff', // Links, active states
        'accent-hover': '#828fff', // Hover on accent elements

        // --- Verdict: Green (Verified / Strong / Pass) ---
        'verdict-green-bg':     '#0d2b1e', // Badge / row background
        'verdict-green-border': 'rgba(26,107,60,0.3)',
        'verdict-green-text':   '#2ac26a', // Badge text
        'verdict-green-bar':    '#1a6b3c', // Score bar fill

        // --- Verdict: Amber (Partial / Weak / Warning) ---
        'verdict-amber-bg':     '#2a1f08',
        'verdict-amber-border': 'rgba(138,82,0,0.3)',
        'verdict-amber-text':   '#f5a623',
        'verdict-amber-bar':    '#8a5200',

        // --- Verdict: Red (Inflated / Unsubstantiated / Flag) ---
        'verdict-red-bg':     '#2b0d0d',
        'verdict-red-border': 'rgba(138,26,26,0.3)',
        'verdict-red-text':   '#e24b4a',
        'verdict-red-bar':    '#8a1a1a',

        // --- Verdict: Blue (Informational / Neutral data) ---
        'verdict-blue-bg':     '#0d1a2b',
        'verdict-blue-border': 'rgba(12,59,122,0.3)',
        'verdict-blue-text':   '#5b9cf6',
        'verdict-blue-bar':    '#0c3b7a',

        // --- Score bar track ---
        'score-track': '#1f2023',
      },
      fontFamily: {
        sans:  ['Geist', 'Inter', 'system-ui', 'sans-serif'],
        mono:  ['Geist Mono', 'Berkeley Mono', 'ui-monospace', 'monospace'],
      },
    },
  },
}
```

### Color Role Reference

| Token | Hex / Value | Use | Never use for |
|---|---|---|---|
| `bg-base` | `#08090a` | Page background | Text, borders |
| `bg-panel` | `#0f1011` | Sidebar, top nav | Card backgrounds |
| `bg-surface` | `#191a1b` | Cards, report sections | Page background |
| `bg-raised` | `#222326` | Hover states, dropdowns | Primary surfaces |
| `text-primary` | `#f7f8f8` | H1–H3, key data labels | Body paragraphs |
| `text-secondary` | `#d0d6e0` | Body text, descriptions | Headings |
| `text-muted` | `#8a8f98` | Labels, metadata, tags | Primary content |
| `text-faint` | `#62666d` | Timestamps, disabled | Anything important |
| `accent` | `#5e6ad2` | Primary CTA only | Decorative use |
| `accent-light` | `#7170ff` | Links, active nav | Backgrounds |

---

## 3. Typography

### Font Loading — `index.html` or global CSS

```html
<link
  href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@400;500&display=swap"
  rel="stylesheet"
/>
```

```css
/* globals.css */
* {
  font-feature-settings: "liga" 1, "calt" 1;
  -webkit-font-smoothing: antialiased;
}
```

### Type Scale

All sizes below are defined as Tailwind classes. Use only these — do not use arbitrary sizes unless explicitly marked `[custom]`.

| Role | When to use | Tailwind classes |
|---|---|---|
| **Page title** | Report name, startup name at top of report | `text-3xl font-sans font-semibold tracking-tight text-text-primary` |
| **Section heading** | "Deal Scorecard", "Founder Intelligence" — screen titles | `text-xl font-sans font-semibold tracking-tight text-text-primary` |
| **Card title** | Title inside a card or panel | `text-base font-sans font-semibold text-text-primary` |
| **Body** | Descriptive paragraphs, explanations | `text-sm font-sans font-normal text-text-secondary leading-relaxed` |
| **Label** | Form labels, section eyebrows, tag text | `text-xs font-sans font-medium text-text-muted uppercase tracking-widest` |
| **Data number** | Scores (4.5/10), percentages, counts | `font-mono font-medium text-text-primary` |
| **Data label** | The text next to a data number | `text-xs font-mono font-normal text-text-muted` |
| **Verdict text** | VERIFIED, INFLATED, WEAK — badge labels | `text-xs font-mono font-medium uppercase tracking-wide` |
| **Question text** | The 5 investor questions | `text-sm font-sans font-normal text-text-secondary leading-relaxed` |
| **Source / citation** | URLs, report names under claims | `text-xs font-mono text-text-faint` |
| **Nav item** | Sidebar nav labels | `text-sm font-sans font-medium text-text-muted` |
| **Eyebrow** | "01 — SCORECARD" style labels above sections | `text-[10px] font-mono font-medium uppercase tracking-[0.14em] text-accent-light` |

### Typography Rules for the Agent

- **All numerical data** (scores, percentages, currency, counts) → always `font-mono`. Never `font-sans` for numbers.
- **Headings never exceed** `font-semibold` (600). Do not use `font-bold` (700) anywhere.
- **Body text is always** `text-text-secondary`, never `text-text-primary` — primary is reserved for headings and key labels only.
- **Uppercase text** always pairs with `tracking-widest` or `tracking-[0.14em]`. Never uppercase without letter-spacing.
- **Line height**: headings use `leading-tight`, body uses `leading-relaxed`, data labels use `leading-none`.

---

## 4. Spacing & Layout

### Base Unit

All spacing is a multiple of **4px**. Tailwind's default spacing scale maps directly: `p-1 = 4px`, `p-2 = 8px`, `p-4 = 16px`, `p-6 = 24px`, `p-8 = 32px`.

### Spacing Scale in Use

| Purpose | Tailwind class | px value |
|---|---|---|
| Between icon and label | `gap-1.5` | 6px |
| Inside badge / pill | `px-2 py-0.5` | 8px × 2px |
| Inside small button | `px-3 py-1.5` | 12px × 6px |
| Inside primary button | `px-4 py-2` | 16px × 8px |
| Inside card (padding) | `p-4` or `p-5` | 16px or 20px |
| Between card sections | `gap-3` | 12px |
| Between cards in a grid | `gap-4` | 16px |
| Between major sections | `gap-8` or `mb-8` | 32px |
| Page horizontal padding | `px-6` (mobile) / `px-8` (desktop) | 24px / 32px |
| Page top padding | `pt-8` | 32px |

### Layout Structure

```
┌─────────────────────────────────────────────────────┐
│  TOP NAV  bg-panel  h-14  px-6                      │
├──────────┬──────────────────────────────────────────┤
│          │                                          │
│ SIDEBAR  │  MAIN CONTENT AREA                       │
│ bg-panel │  bg-base                                 │
│ w-56     │  max-w-4xl  mx-auto  px-6  py-8          │
│ fixed    │                                          │
│          │  ┌──────────────────────────────────┐    │
│          │  │  REPORT SECTION CARD             │    │
│          │  │  bg-surface  rounded-xl  p-5     │    │
│          │  └──────────────────────────────────┘    │
│          │                                          │
└──────────┴──────────────────────────────────────────┘
```

```jsx
// Page shell — use this exact structure for every report screen
<div className="min-h-screen bg-bg-base flex">
  <Sidebar />                          {/* w-56 fixed left-0 top-0 h-full bg-bg-panel */}
  <main className="ml-56 flex-1 px-8 py-8">
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Report sections go here */}
    </div>
  </main>
</div>
```

### Grid System

| Context | Tailwind class |
|---|---|
| 2-column equal | `grid grid-cols-2 gap-4` |
| 2-column (1/3 + 2/3) | `grid grid-cols-3 gap-4` → left `col-span-1`, right `col-span-2` |
| Score dimension grid | `grid grid-cols-1 gap-3` (always single column, stacked) |
| Competitor table | `w-full` table, not a CSS grid |
| 5 questions | `flex flex-col gap-4` |

---

## 5. Border & Shadow System

### The Core Technique — Shadow as Border

DealLens uses Vercel's **shadow-as-border** technique for all cards and containers. Do not use `border` CSS property for cards. Use `shadow` only.

```css
/* Add to globals.css */
.shadow-card {
  box-shadow:
    0px 0px 0px 1px rgba(255,255,255,0.06),
    0px 2px 4px rgba(0,0,0,0.3),
    0px 8px 16px rgba(0,0,0,0.2);
}

.shadow-card-hover {
  box-shadow:
    0px 0px 0px 1px rgba(255,255,255,0.10),
    0px 4px 8px rgba(0,0,0,0.4),
    0px 12px 24px rgba(0,0,0,0.25);
}

.shadow-inset {
  box-shadow: inset 0px 0px 0px 1px rgba(255,255,255,0.06);
}
```

```jsx
// Use in JSX
<div className="shadow-card rounded-xl bg-bg-surface">
```

### When to use actual Tailwind borders

**Use `border` (not shadow) only for:**
- Table row dividers: `border-b border-white/5`
- Sidebar dividers: `border-b border-white/5`
- Input fields: `border border-white/10`
- Active nav item indicator: `border-l-2 border-accent-light`
- Verdict-coloured card borders: `border border-verdict-green-border` etc.

### Border Radius Scale

| Context | Tailwind class | px |
|---|---|---|
| Badges, pills, tags | `rounded-full` | 9999px |
| Buttons | `rounded-md` | 6px |
| Input fields | `rounded-md` | 6px |
| Small cards, dropdown items | `rounded-lg` | 8px |
| Report section cards | `rounded-xl` | 12px |
| Upload drop zone | `rounded-2xl` | 16px |
| Score bar track and fill | `rounded-full` | 9999px |

---

## 6. Component Library

### 6.1 Score Bar

Used in the Deal Scorecard screen to show dimension scores (1–10).

**Anatomy:**
```
[Dimension label]              [Score value]
[━━━━━━━━━━━━░░░░░░░░░░░░░░] ← filled track
```

**Score to colour mapping:**
- 7–10 → green: fill `bg-verdict-green-bar`, value text `text-verdict-green-text`
- 4–6 → amber: fill `bg-verdict-amber-bar`, value text `text-verdict-amber-text`
- 1–3 → red: fill `bg-verdict-red-bar`, value text `text-verdict-red-text`

```jsx
// ScoreBar.jsx
function ScoreBar({ label, score, maxScore = 10 }) {
  const pct = (score / maxScore) * 100;

  const colour =
    score >= 7 ? 'bg-verdict-green-bar'  :
    score >= 4 ? 'bg-verdict-amber-bar'  :
                 'bg-verdict-red-bar';

  const textColour =
    score >= 7 ? 'text-verdict-green-text'  :
    score >= 4 ? 'text-verdict-amber-text'  :
                 'text-verdict-red-text';

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-sans font-medium text-text-secondary">
          {label}
        </span>
        <span className={`font-mono font-medium text-sm ${textColour}`}>
          {score}<span className="text-text-faint text-xs"> / {maxScore}</span>
        </span>
      </div>
      {/* Track */}
      <div className="h-1.5 w-full rounded-full bg-score-track">
        {/* Fill */}
        <div
          className={`h-1.5 rounded-full transition-all duration-500 ${colour}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
```

**Usage:**
```jsx
<ScoreBar label="Competitive Moat"     score={3} />
<ScoreBar label="Market Validity"      score={5} />
<ScoreBar label="Founder Credibility"  score={7} />
```

---

### 6.2 Verdict Badge

Used in the Claim Verification Table and wherever a claim needs a quick verdict label.

**Four variants:**

| Variant | When to use | Background | Text | Border |
|---|---|---|---|---|
| `verified` | Claim checked and holds up | `bg-verdict-green-bg` | `text-verdict-green-text` | `border-verdict-green-border` |
| `inflated` | Claim is exaggerated vs real data | `bg-verdict-amber-bg` | `text-verdict-amber-text` | `border-verdict-amber-border` |
| `unsubstantiated` | No evidence found to support claim | `bg-verdict-red-bg` | `text-verdict-red-text` | `border-verdict-red-border` |
| `partial` | Claim is partly true | `bg-verdict-blue-bg` | `text-verdict-blue-text` | `border-verdict-blue-border` |

```jsx
// VerdictBadge.jsx
const VARIANTS = {
  verified:        { bg: 'bg-verdict-green-bg',  text: 'text-verdict-green-text',  border: 'border-verdict-green-border',  label: 'Verified'        },
  inflated:        { bg: 'bg-verdict-amber-bg',  text: 'text-verdict-amber-text',  border: 'border-verdict-amber-border',  label: 'Inflated'        },
  unsubstantiated: { bg: 'bg-verdict-red-bg',    text: 'text-verdict-red-text',    border: 'border-verdict-red-border',    label: 'Unsubstantiated' },
  partial:         { bg: 'bg-verdict-blue-bg',   text: 'text-verdict-blue-text',   border: 'border-verdict-blue-border',   label: 'Partial'         },
};

function VerdictBadge({ variant }) {
  const v = VARIANTS[variant];
  return (
    <span className={`
      inline-flex items-center px-2 py-0.5 rounded-full
      text-xs font-mono font-medium uppercase tracking-wide
      border ${v.bg} ${v.text} ${v.border}
    `}>
      {v.label}
    </span>
  );
}
```

**Usage:**
```jsx
<VerdictBadge variant="inflated" />
<VerdictBadge variant="verified" />
```

---

### 6.3 Cards

Two card types. Use the correct one — do not mix.

**Report Section Card** — wraps an entire report module (scorecard, founder card, etc.)

```jsx
// ReportCard.jsx
function ReportCard({ eyebrow, title, children }) {
  return (
    <div className="shadow-card rounded-xl bg-bg-surface">
      {/* Card header */}
      <div className="px-5 py-4 border-b border-white/5">
        {eyebrow && (
          <p className="text-[10px] font-mono font-medium uppercase tracking-[0.14em] text-accent-light mb-1">
            {eyebrow}
          </p>
        )}
        <h2 className="text-base font-sans font-semibold text-text-primary">
          {title}
        </h2>
      </div>
      {/* Card body */}
      <div className="p-5">
        {children}
      </div>
    </div>
  );
}
```

**Stat Card** — small card for a single metric (used in scorecard overview row)

```jsx
// StatCard.jsx
function StatCard({ label, value, subtext, variant = 'neutral' }) {
  // variant: 'green' | 'amber' | 'red' | 'neutral'
  const valueColour = {
    green:   'text-verdict-green-text',
    amber:   'text-verdict-amber-text',
    red:     'text-verdict-red-text',
    neutral: 'text-text-primary',
  }[variant];

  return (
    <div className="shadow-card rounded-xl bg-bg-surface p-4 flex flex-col gap-1">
      <p className="text-xs font-mono font-medium uppercase tracking-widest text-text-muted">
        {label}
      </p>
      <p className={`text-2xl font-mono font-medium ${valueColour}`}>
        {value}
      </p>
      {subtext && (
        <p className="text-xs font-sans text-text-faint leading-snug">
          {subtext}
        </p>
      )}
    </div>
  );
}
```

**Usage:**
```jsx
<StatCard label="Overall Score"   value="4.5 / 10" variant="amber" />
<StatCard label="Flags Found"     value="3"         variant="red"   subtext="High severity" />
<StatCard label="Claims Verified" value="2 / 7"     variant="amber" />
```

---

### 6.4 Data Tables

Used in Claim Verification Table and Competitor Map.

**Table structure rules:**
- `bg-bg-surface` table background
- `border-b border-white/5` on every row — no full border box
- Header row: `bg-bg-raised` — one step darker than surface
- Alternating rows: **do not use** alternating row colours. Use hover state instead.
- Hover state on rows: `hover:bg-bg-raised`
- Column alignment: text-left for all text, `text-right font-mono` for numbers

```jsx
// DataTable.jsx
function DataTable({ columns, rows }) {
  return (
    <div className="w-full overflow-hidden rounded-xl shadow-card">
      <table className="w-full text-sm">
        {/* Header */}
        <thead>
          <tr className="bg-bg-raised border-b border-white/5">
            {columns.map(col => (
              <th
                key={col.key}
                className="px-4 py-3 text-left text-[10px] font-mono font-medium
                           uppercase tracking-[0.1em] text-text-muted whitespace-nowrap"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        {/* Body */}
        <tbody className="bg-bg-surface divide-y divide-white/5">
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-bg-raised transition-colors duration-100">
              {columns.map(col => (
                <td key={col.key} className="px-4 py-3 text-text-secondary">
                  {row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

**Threat level cell** — special cell for competitor threat column:

```jsx
// ThreatCell.jsx
const THREAT = {
  CRITICAL: { bg: 'bg-verdict-red-bg',   text: 'text-verdict-red-text',   label: 'Critical' },
  HIGH:     { bg: 'bg-verdict-amber-bg', text: 'text-verdict-amber-text', label: 'High'     },
  MEDIUM:   { bg: 'bg-verdict-blue-bg',  text: 'text-verdict-blue-text',  label: 'Medium'   },
  LOW:      { bg: 'bg-bg-raised',        text: 'text-text-muted',         label: 'Low'      },
};

function ThreatCell({ level }) {
  const t = THREAT[level];
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-medium ${t.bg} ${t.text}`}>
      {t.label}
    </span>
  );
}
```

---

### 6.5 Expandable Row

Used in Claim Verification Table. Click a row → reveals evidence, source, and investor question.

```jsx
// ExpandableRow.jsx
function ExpandableRow({ claim, verdict, evidence, source, question }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Main row */}
      <tr
        className="hover:bg-bg-raised transition-colors cursor-pointer border-b border-white/5"
        onClick={() => setOpen(!open)}
      >
        <td className="px-4 py-3 text-text-secondary text-sm">{claim}</td>
        <td className="px-4 py-3">
          <VerdictBadge variant={verdict} />
        </td>
        <td className="px-4 py-3 text-text-faint text-xs font-mono text-right">
          {open ? '▲' : '▼'}
        </td>
      </tr>

      {/* Expanded detail row */}
      {open && (
        <tr className="bg-bg-base border-b border-white/5">
          <td colSpan={3} className="px-4 py-4">
            <div className="space-y-3">
              {/* Evidence */}
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-1">
                  Evidence
                </p>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {evidence}
                </p>
              </div>
              {/* Source */}
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-1">
                  Source
                </p>
                <p className="text-xs font-mono text-text-faint">{source}</p>
              </div>
              {/* Question */}
              <div className="border-l-2 border-accent pl-3">
                <p className="text-[10px] font-mono uppercase tracking-widest text-accent-light mb-1">
                  Question to ask
                </p>
                <p className="text-sm text-text-secondary italic leading-relaxed">
                  {question}
                </p>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
```

---

### 6.6 Buttons

Three button types. Use only these — do not create variants.

**Primary** — Upload action, main CTA only

```jsx
<button className="
  px-5 py-2.5 rounded-md
  bg-accent hover:bg-accent-hover
  text-white text-sm font-sans font-medium
  transition-colors duration-150
  focus:outline-none focus:ring-2 focus:ring-accent/50
">
  Analyse Deck
</button>
```

**Secondary** — Download report, secondary actions

```jsx
<button className="
  px-4 py-2 rounded-md
  bg-transparent hover:bg-bg-raised
  text-text-secondary hover:text-text-primary
  text-sm font-sans font-medium
  border border-white/10
  transition-colors duration-150
">
  Download Report
</button>
```

**Ghost** — Subtle actions, navigation links, expand triggers

```jsx
<button className="
  px-3 py-1.5 rounded-md
  bg-transparent hover:bg-bg-raised
  text-text-muted hover:text-text-secondary
  text-sm font-sans font-medium
  transition-colors duration-150
">
  View Source
</button>
```

---

### 6.7 Navigation — Sidebar

Fixed left sidebar. Houses the 5 report screen links.

```jsx
// Sidebar.jsx
const NAV_ITEMS = [
  { id: 'scorecard',   label: 'Deal Scorecard',    eyebrow: '01' },
  { id: 'founder',     label: 'Founder Card',       eyebrow: '02' },
  { id: 'claims',      label: 'Claim Verification', eyebrow: '03' },
  { id: 'competitors', label: 'Competitor Map',      eyebrow: '04' },
  { id: 'questions',   label: 'Investor Questions',  eyebrow: '05' },
];

function Sidebar({ active, onNavigate }) {
  return (
    <aside className="fixed left-0 top-0 h-full w-56 bg-bg-panel border-r border-white/5 flex flex-col">
      {/* Brand */}
      <div className="px-5 py-4 border-b border-white/5">
        <span className="text-base font-sans font-semibold text-text-primary">
          Deal<span className="text-accent-light">Lens</span>
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-2 py-4 space-y-0.5">
        {NAV_ITEMS.map(item => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left
                transition-colors duration-100
                ${isActive
                  ? 'bg-bg-raised text-text-primary border-l-2 border-accent-light'
                  : 'text-text-muted hover:bg-bg-raised hover:text-text-secondary border-l-2 border-transparent'
                }
              `}
            >
              <span className="text-[10px] font-mono text-text-faint w-4">{item.eyebrow}</span>
              <span className="text-sm font-sans font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer — startup info */}
      <div className="px-5 py-4 border-t border-white/5">
        <p className="text-xs font-mono text-text-faint truncate">ziple-deck.pdf</p>
        <p className="text-[10px] font-mono text-text-faint mt-0.5">Analysed just now</p>
      </div>
    </aside>
  );
}
```

---

### 6.8 Upload Page

The first screen the investor sees. Full-page, centred, minimal.

```jsx
// UploadPage.jsx
function UploadPage({ onUpload, loading }) {
  const [dragging, setDragging] = useState(false);

  return (
    <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center px-6">
      {/* Logo */}
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-sans font-semibold text-text-primary">
          Deal<span className="text-accent-light">Lens</span>
        </h1>
        <p className="text-sm font-sans text-text-muted mt-2">
          AI-powered due diligence in under 10 minutes
        </p>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); onUpload(e.dataTransfer.files[0]); }}
        className={`
          w-full max-w-lg rounded-2xl border-2 border-dashed
          flex flex-col items-center justify-center gap-4 py-16 px-8
          transition-colors duration-150 cursor-pointer
          ${dragging
            ? 'border-accent bg-accent/5'
            : 'border-white/10 hover:border-white/20 bg-bg-surface'
          }
        `}
      >
        <div className="w-12 h-12 rounded-xl bg-bg-raised flex items-center justify-center">
          <span className="text-2xl">📄</span>
        </div>
        <div className="text-center">
          <p className="text-sm font-sans font-medium text-text-secondary">
            Drop your pitch deck here
          </p>
          <p className="text-xs font-mono text-text-faint mt-1">
            PDF only · Max 20MB
          </p>
        </div>
        <label className="cursor-pointer">
          <span className="px-4 py-2 rounded-md bg-transparent border border-white/10 hover:bg-bg-raised text-sm font-sans font-medium text-text-secondary transition-colors">
            Browse file
          </span>
          <input type="file" accept=".pdf" className="hidden" onChange={e => onUpload(e.target.files[0])} />
        </label>
      </div>
    </div>
  );
}
```

---

### 6.9 Loading State

Shown while the backend pipeline runs (~60–120 seconds).

```jsx
// LoadingState.jsx
const STEPS = [
  { id: 1, label: 'Extracting claims from deck',       status: 'done'    },
  { id: 2, label: 'Searching market reports',           status: 'active'  },
  { id: 3, label: 'Mapping competitors',                status: 'pending' },
  { id: 4, label: 'Researching founders',               status: 'pending' },
  { id: 5, label: 'Generating investor questions',      status: 'pending' },
];

function LoadingState({ currentStep }) {
  return (
    <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-3">
        <p className="text-[10px] font-mono uppercase tracking-[0.14em] text-accent-light mb-6">
          Analysing deck
        </p>
        {STEPS.map((step, i) => {
          const status = i + 1 < currentStep ? 'done' : i + 1 === currentStep ? 'active' : 'pending';
          return (
            <div key={step.id} className="flex items-center gap-3">
              {/* Step indicator */}
              <div className={`
                w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0
                text-[10px] font-mono font-medium
                ${status === 'done'    ? 'bg-verdict-green-bg text-verdict-green-text'   : ''}
                ${status === 'active'  ? 'bg-accent/20 text-accent-light animate-pulse'   : ''}
                ${status === 'pending' ? 'bg-bg-raised text-text-faint'                   : ''}
              `}>
                {status === 'done' ? '✓' : step.id}
              </div>
              {/* Label */}
              <span className={`
                text-sm font-sans
                ${status === 'done'    ? 'text-text-muted line-through'  : ''}
                ${status === 'active'  ? 'text-text-primary font-medium' : ''}
                ${status === 'pending' ? 'text-text-faint'               : ''}
              `}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

---

### 6.10 Investor Question Card

Used in Screen 5. Each of the 5 questions gets its own card.

```jsx
// QuestionCard.jsx
function QuestionCard({ rank, category, severity, question, targetsClaim, gapFound, strongAnswer }) {
  const [open, setOpen] = useState(false);

  const severityColour = severity === 'HIGH'
    ? 'text-verdict-red-text bg-verdict-red-bg border-verdict-red-border'
    : 'text-verdict-amber-text bg-verdict-amber-bg border-verdict-amber-border';

  return (
    <div className="shadow-card rounded-xl bg-bg-surface overflow-hidden">
      {/* Header */}
      <div
        className="px-5 py-4 flex items-start gap-4 cursor-pointer hover:bg-bg-raised transition-colors"
        onClick={() => setOpen(!open)}
      >
        {/* Rank */}
        <span className="text-2xl font-mono font-medium text-text-faint w-8 flex-shrink-0">
          {String(rank).padStart(2, '0')}
        </span>
        {/* Question + badges */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-[10px] font-mono uppercase tracking-wide text-text-muted px-2 py-0.5 rounded-full border border-white/10">
              {category}
            </span>
            <span className={`text-[10px] font-mono uppercase tracking-wide px-2 py-0.5 rounded-full border ${severityColour}`}>
              {severity}
            </span>
          </div>
          <p className="text-sm font-sans text-text-secondary leading-relaxed">
            {question}
          </p>
        </div>
        {/* Toggle */}
        <span className="text-text-faint text-xs font-mono flex-shrink-0 mt-1">
          {open ? '▲' : '▼'}
        </span>
      </div>

      {/* Expanded detail */}
      {open && (
        <div className="border-t border-white/5 px-5 py-4 space-y-4 bg-bg-base">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-1">Targets claim</p>
            <p className="text-xs font-mono text-text-faint italic">{targetsClaim}</p>
          </div>
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-1">Gap found</p>
            <p className="text-sm text-text-secondary leading-relaxed">{gapFound}</p>
          </div>
          <div className="border-l-2 border-verdict-green-bar pl-3">
            <p className="text-[10px] font-mono uppercase tracking-widest text-verdict-green-text mb-1">Strong answer looks like</p>
            <p className="text-sm text-text-secondary italic leading-relaxed">{strongAnswer}</p>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 7. Semantic Color Rules

These rules override the base color system in specific data contexts. The agent must follow these exactly — never use verdict colours for decorative purposes.

### The Rule Table

| Situation | Colour to use | Tailwind tokens |
|---|---|---|
| Claim is verified against real data | Green | `bg-verdict-green-bg text-verdict-green-text border-verdict-green-border` |
| TAM is inflated | Amber | `bg-verdict-amber-bg text-verdict-amber-text border-verdict-amber-border` |
| Claim has no evidence | Red | `bg-verdict-red-bg text-verdict-red-text border-verdict-red-border` |
| Claim is partially true | Blue | `bg-verdict-blue-bg text-verdict-blue-text border-verdict-blue-border` |
| Moat is STRONG | Green | Same as verified |
| Moat is WEAK | Amber | Same as inflated |
| Moat is UNSUBSTANTIATED | Red | Same as no evidence |
| Score 7–10 | Green bar | `bg-verdict-green-bar` |
| Score 4–6 | Amber bar | `bg-verdict-amber-bar` |
| Score 1–3 | Red bar | `bg-verdict-red-bar` |
| Competitor threat CRITICAL | Red badge | |
| Competitor threat HIGH | Amber badge | |
| Competitor threat MEDIUM | Blue badge | |
| Competitor threat LOW | Neutral | `bg-bg-raised text-text-muted` |
| Question severity HIGH | Red badge | |
| Question severity MEDIUM | Amber badge | |

### Non-negotiable semantic rules

1. **Green never appears** for anything below a score of 7 or a verdict of "verified/strong". If it appears elsewhere, it misleads the investor.
2. **Red is reserved for flags** — never use it for branding, decoration, or active states.
3. **Amber is not neutral** — it means "something needs attention." Do not use it for disabled states or secondary text.
4. **Blue (informational)** is not a success colour — it means "neutral data, no strong verdict either way."

---

## 8. Responsive Rules

DealLens is a **desktop-first** tool. Investors use laptops. Mobile is a nice-to-have, not a priority. Design at 1280px width. Make it not break at 768px. Do not optimise below 768px for this hackathon.

### Breakpoints

| Name | Width | Tailwind prefix |
|---|---|---|
| Mobile (do not optimise) | < 768px | default |
| Tablet (minimum viable) | 768px | `md:` |
| Desktop (primary target) | 1024px+ | `lg:` |
| Large desktop | 1280px+ | `xl:` |

### What collapses at `md:` (768px)

| Element | Desktop | Tablet (md) |
|---|---|---|
| Sidebar | `w-56 fixed` | Hidden — use hamburger |
| Main content | `ml-56` | `ml-0` |
| 2-col grids | `grid-cols-2` | `grid-cols-1` |
| Stat card row | `grid-cols-3` | `grid-cols-1` |
| Table | Horizontal scroll | `overflow-x-auto` |
| Score bars | Full width | Full width (no change) |

### What never collapses

- Score bars always full width — they are readable at any size
- Verdict badges always inline — never stack or break
- Question cards always full width — reading comfort is critical
- Typography sizes do not change between desktop and tablet

---

## 9. Do Not Rules

These are explicit prohibitions. The agent must never do any of the following, regardless of context.

### Color prohibitions
- **Do not use** `#ffffff` pure white for backgrounds — use `bg-bg-surface` or `bg-bg-base`
- **Do not use** `bg-white` anywhere — DealLens is dark-mode only
- **Do not use** the accent colour (`accent`, `accent-light`) for anything other than CTAs, active nav states, and eyebrow labels
- **Do not use** green, amber, or red for decorative elements — these are strictly semantic
- **Do not use** arbitrary colour values — use only tokens defined in section 2

### Typography prohibitions
- **Do not use** `font-bold` (700) — maximum weight is `font-semibold` (600)
- **Do not use** `font-sans` for numbers, scores, or data values — always `font-mono`
- **Do not use** uppercase without `tracking-widest` or `tracking-[0.14em]`
- **Do not use** `text-white` — use `text-text-primary` (`#f7f8f8`)
- **Do not use** arbitrary font sizes — use only the scale defined in section 3

### Component prohibitions
- **Do not use** `border` CSS for card outlines — use `shadow-card` class
- **Do not use** alternating row colours in tables — use hover state only
- **Do not use** `border-radius` larger than `rounded-xl` (12px) except for upload drop zone and pill badges
- **Do not use** animations on data content — only on loading states and transitions
- **Do not create** new button variants — use only Primary, Secondary, or Ghost from section 6.5
- **Do not use** gradient backgrounds anywhere in the app

### Layout prohibitions
- **Do not use** more than `max-w-4xl` for the main content area
- **Do not use** `justify-center` for data tables — tables are always left-aligned
- **Do not use** `text-center` for body text — only for upload page and empty states
- **Do not nest** cards inside cards — maximum one level of card nesting

### Data display prohibitions
- **Do not display** a score without its `/10` denominator
- **Do not display** a verdict badge without a colour — always use the semantic variant
- **Do not display** a percentage without `%` and `font-mono`
- **Do not use** placeholder text like "N/A" for missing data — use `text-text-faint` with `—` (em dash)

---

*DealLens Design System · v1.0 · Bower School of Entrepreneurship Hackathon*
