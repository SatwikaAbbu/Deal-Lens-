import React, { useState } from 'react';
import VerdictBadge from './VerdictBadge';

/**
 * Expandable Row for Claims.
 * Designed as a structured briefing card rather than a simple table row.
 */
export default function ExpandableRow({ claim, verdict, evidence, source, question }) {
  const [open, setOpen] = useState(false);

  const getVariant = (v) => {
    const map = {
      'VERIFIED': 'verified',
      'INFLATED': 'inflated',
      'UNSUBSTANTIATED': 'unsubstantiated',
      'PARTIAL': 'partial'
    };
    return map[v] || 'partial';
  };

  const isWarning = verdict === 'INFLATED' || verdict === 'UNSUBSTANTIATED';
  const leftBorderColor = isWarning 
    ? 'border-l-verdict-red-bar' 
    : verdict === 'PARTIAL' 
      ? 'border-l-verdict-amber-bar' 
      : 'border-l-verdict-green-bar';

  return (
    <div className="border-b border-white/[0.03] last:border-0">
      {/* ── ROW HEADER ── */}
      <div 
        className="group flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-bg-raised/50 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-4 flex-1 pr-6">
          <span className={`text-[10px] font-mono text-text-faint transition-transform duration-300 ${open ? 'rotate-180' : ''}`}>
            ▼
          </span>
          <span className="text-[14px] font-sans font-medium text-white leading-snug">
            "{claim}"
          </span>
        </div>
        
        <div className="flex items-center gap-6 flex-shrink-0">
          <VerdictBadge variant={getVariant(verdict)} />
          <span className="text-[10px] font-mono uppercase tracking-wider text-accent-light opacity-0 group-hover:opacity-100 transition-opacity w-24 text-right">
            {open ? 'Hide details' : 'View evidence'}
          </span>
        </div>
      </div>

      {/* ── EXPANDED DOSSIER ── */}
      {open && (
        <div className={`bg-bg-base/40 px-5 py-6 border-l-2 ${leftBorderColor} ml-[18px] mb-4 mt-1 rounded-r-xl mr-5 animate-fadeIn`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Left Column: Evidence & Source */}
            <div className="md:col-span-2 space-y-5">
              <div>
                <p className="text-[10px] font-mono font-semibold uppercase tracking-[0.15em] text-text-muted mb-2">
                  Analysis & Evidence
                </p>
                <p className="text-[13px] font-sans text-text-secondary leading-relaxed pl-3 border-l border-white/10">
                  {evidence || "No detailed evidence provided for this claim."}
                </p>
              </div>

              {source && (
                <div>
                  <p className="text-[10px] font-mono font-semibold uppercase tracking-[0.15em] text-text-muted mb-2">
                    Primary Source
                  </p>
                  {source.startsWith('http') ? (
                    <a 
                      href={source} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[11px] font-mono text-accent-light bg-accent/10 border border-accent/20 px-2.5 py-1 rounded inline-flex items-center gap-2 hover:bg-accent/20 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {source}
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                      </svg>
                    </a>
                  ) : (
                    <p className="text-[11px] font-mono text-accent-light bg-accent/10 border border-accent/20 px-2.5 py-1 rounded inline-block">
                      {source}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Right Column: Suggested Question */}
            <div className="md:col-span-1">
              {question ? (
                <div className="h-full rounded-lg bg-bg-surface/60 border border-white/[0.03] p-4 flex flex-col justify-center">
                  <p className="text-[10px] font-mono font-semibold uppercase tracking-[0.15em] text-text-primary mb-2 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-light" />
                    Investor Question
                  </p>
                  <p className="text-[13px] font-sans text-text-secondary italic leading-relaxed">
                    "{question}"
                  </p>
                </div>
              ) : (
                <div className="h-full rounded-lg border border-white/[0.02] border-dashed flex items-center justify-center p-4">
                   <p className="text-[10px] font-mono uppercase tracking-widest text-text-faint text-center">
                    No follow-up required
                  </p>
                </div>
              )}
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}
