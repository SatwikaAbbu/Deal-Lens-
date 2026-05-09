import React from 'react';

/**
 * Threat level badge for competitor table cells.
 * Matches design.md §6.4 ThreatCell spec.
 */
const THREAT = {
  CRITICAL: { bg: 'bg-verdict-red-bg',   text: 'text-verdict-red-text',   label: 'Critical' },
  HIGH:     { bg: 'bg-verdict-amber-bg',  text: 'text-verdict-amber-text', label: 'High'     },
  MEDIUM:   { bg: 'bg-verdict-blue-bg',   text: 'text-verdict-blue-text',  label: 'Medium'   },
  LOW:      { bg: 'bg-bg-raised',         text: 'text-text-muted',         label: 'Low'      },
};

export default function ThreatCell({ level }) {
  const t = THREAT[level] || THREAT.MEDIUM;
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-medium ${t.bg} ${t.text}`}>
      {t.label}
    </span>
  );
}
