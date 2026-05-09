import React from 'react';
import VerdictBadge from '../shared/VerdictBadge';

export default function VerificationSidebar({ references = [], isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed top-0 right-0 w-[380px] h-screen bg-bg-panel border-l border-white/5 shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-out translate-x-0">
      
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/5">
        <h2 className="text-[10px] font-mono font-semibold tracking-[0.15em] uppercase text-text-muted">
          Verification Sidebar
        </h2>
        <button 
          onClick={onClose}
          className="text-text-faint hover:text-text-primary transition-colors text-sm"
          aria-label="Close sidebar"
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {references.length === 0 ? (
          <p className="text-sm font-sans text-text-faint italic">No verified claims found.</p>
        ) : (
          references.map((ref, idx) => (
            <div key={idx} className="bg-bg-surface rounded-xl p-4 border border-white/5 flex flex-col gap-3 shadow-card">
              <div className="flex items-start justify-between gap-3">
                <span className="text-[10px] font-mono font-bold text-text-faint mt-1 shrink-0">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <p className="text-sm font-sans text-text-primary leading-relaxed flex-1">
                  "{ref.claim}"
                </p>
              </div>
              
              <div className="flex items-center justify-between mt-1">
                <VerdictBadge verdict={ref.verdict} />
                {ref.slide_number && (
                  <span className="text-[10px] font-mono text-text-faint uppercase tracking-wider">
                    Slide {ref.slide_number}
                  </span>
                )}
              </div>

              <div className="pt-3 border-t border-white/5">
                {ref.source_url ? (
                  <a 
                    href={ref.source_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[11px] font-mono text-accent-light hover:text-accent hover:underline truncate block"
                  >
                    {ref.source_url}
                  </a>
                ) : (
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-mono text-text-faint">
                      No source found
                    </span>
                    {ref.search_query && (
                      <span className="text-[9px] font-mono text-text-muted/60 truncate" title={ref.search_query}>
                        Query: {ref.search_query}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
