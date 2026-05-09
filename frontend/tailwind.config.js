/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
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
        sans:  ['Geist Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono:  ['Geist Mono', 'ui-monospace', 'monospace'],
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' }
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
        ,
        cardIn: {
          '0%': { opacity: '0', transform: 'translateY(14px) scale(0.96)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        scanY: {
          '0%': { transform: 'translateY(-22px)', opacity: '0' },
          '15%': { opacity: '1' },
          '85%': { opacity: '1' },
          '100%': { transform: 'translateY(68px)', opacity: '0' },
        },
        dotPulse: {
          '0%, 100%': { transform: 'translateY(0px)', opacity: '0.35' },
          '50%': { transform: 'translateY(-3px)', opacity: '1' },
        },
        travelX: {
          '0%': { transform: 'translateX(0px)', opacity: '0.25' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { transform: 'translateX(62px)', opacity: '0.25' },
        },
        revealWipe: {
          '0%': { backgroundPosition: '200% 0', opacity: '0.65' },
          '100%': { backgroundPosition: '-200% 0', opacity: '0.9' },
        },
        bob: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        caretBlink: {
          '0%, 45%': { opacity: '0.15' },
          '46%, 100%': { opacity: '0.85' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        floatTilt: {
          '0%, 100%': { transform: 'translateY(0px) rotate(-1deg)' },
          '50%': { transform: 'translateY(-8px) rotate(1deg)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 rgba(113,112,255,0.0)' },
          '50%': { boxShadow: '0 0 28px rgba(113,112,255,0.22)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.92)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite',
        fadeIn: 'fadeIn 0.5s ease-out both',
        cardIn: 'cardIn 420ms cubic-bezier(0.2, 0.9, 0.2, 1) both',
        scanY: 'scanY 1.2s cubic-bezier(0.2, 0.9, 0.2, 1) infinite',
        dotPulse: 'dotPulse 900ms ease-in-out infinite',
        travelX: 'travelX 1.1s ease-in-out infinite',
        revealWipe: 'revealWipe 1.6s linear infinite',
        bob: 'bob 1.2s ease-in-out infinite',
        caretBlink: 'caretBlink 900ms steps(1, end) infinite',
        floatSlow: 'floatSlow 5.5s ease-in-out infinite',
        floatTilt: 'floatTilt 6.5s ease-in-out infinite',
        pulseGlow: 'pulseGlow 3s ease-in-out infinite',
        scaleIn: 'scaleIn 0.4s cubic-bezier(0.2, 0.9, 0.2, 1) both',
        slideInLeft: 'slideInLeft 0.4s cubic-bezier(0.2, 0.9, 0.2, 1) both',
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
