import React from 'react';

/**
 * Small metric card for a single data point.
 * Matches design.md §6.3 StatCard spec.
 */
export default function StatCard({ label, value, subtext, variant = 'neutral' }) {
  const valueColour = {
    green:   'text-verdict-green-text',
    amber:   'text-verdict-amber-text',
    red:     'text-verdict-red-text',
    neutral: 'text-text-primary',
  }[variant];

  return (
    <div className="shadow-card rounded-xl bg-bg-surface p-4 flex flex-col gap-1">
      <p className="text-[10px] font-mono font-medium uppercase tracking-widest text-text-muted">
        {label}
      </p>
      <p className={`text-3xl font-mono font-semibold ${valueColour}`}>
        {String(value)}
      </p>
      {subtext && (
        <p className="text-xs font-sans text-text-faint leading-snug">
          {subtext}
        </p>
      )}
    </div>
  );
}
