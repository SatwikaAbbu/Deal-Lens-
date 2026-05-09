import React, { useState } from 'react';

/**
 * Investor Question Card — used in the Investor Questions screen.
 * Redesigned for Bloomberg-grade readability and quick scanning.
 */
export default function QuestionCard({ rank, category, severity, question, targetsClaim, gapFound, strongAnswer }) {
  const [open, setOpen] = useState(false);

  const isHigh = severity === 'HIGH';
  const severityColor = isHigh
    ? 'text-verdict-red-text bg-verdict-red-bg border-verdict-red-border'
    : 'text-verdict-amber-text bg-verdict-amber-bg border-verdict-amber-border';

  const leftBorder = isHigh
    ? 'border-l-verdict-red-bar'
    : 'border-l-verdict-amber-bar';

  return (
    <div className={`shadow-card rounded-xl bg-bg-surface overflow-hidden border-l-[3px] ${leftBorder}`}>
      {/* Header */}
      <div
        className="px-5 py-4 flex items-start gap-5 cursor-pointer hover:bg-bg-raised/50 transition-colors"
        onClick={() => setOpen(!open)}
      >
        {/* Rank */}
        <div className="flex flex-col items-center gap-1 flex-shrink-0 pt-0.5">
          <span className="text-3xl font-mono font-bold text-text-faint/60 leading-none tabular-nums">
            {String(rank).padStart(2, '0')}
          </span>
        </div>
        {/* Question + badges */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2.5 flex-wrap">
            <span className="text-[10px] font-mono font-medium uppercase tracking-wider text-text-muted px-2 py-0.5 rounded border border-white/10 bg-white/[0.02]">
              {category}
            </span>
            <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${severityColor}`}>
              {severity}
            </span>
          </div>
          <p className="text-[15px] font-sans font-medium text-white leading-relaxed">
            {question}
          </p>
        </div>
        {/* Toggle */}
        <span className="text-text-faint/40 text-[10px] font-mono flex-shrink-0 mt-2 uppercase tracking-wider">
          {open ? '— LESS' : '+ MORE'}
        </span>
      </div>

      {/* Expanded detail */}
      {open && (
        <div className="border-t border-white/5 px-5 py-5 space-y-4 bg-bg-base/60">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg bg-bg-surface/50 px-4 py-3 border border-white/[0.03]">
              <p className="text-[10px] font-mono font-semibold uppercase tracking-[0.15em] text-text-muted mb-1.5">Targets Claim</p>
              <p className="text-sm font-sans text-text-secondary leading-relaxed">{targetsClaim}</p>
            </div>
            <div className="rounded-lg bg-bg-surface/50 px-4 py-3 border border-white/[0.03]">
              <p className="text-[10px] font-mono font-semibold uppercase tracking-[0.15em] text-text-muted mb-1.5">Gap Found</p>
              <p className="text-sm font-sans text-text-secondary leading-relaxed">{gapFound}</p>
            </div>
          </div>
          <div className="rounded-lg border-l-2 border-l-verdict-green-bar bg-verdict-green-bg/20 px-4 py-3">
            <p className="text-[10px] font-mono font-semibold uppercase tracking-[0.15em] text-verdict-green-text mb-1.5">Strong Answer Looks Like</p>
            <p className="text-sm text-text-secondary leading-relaxed">{strongAnswer}</p>
          </div>
        </div>
      )}
    </div>
  );
}
