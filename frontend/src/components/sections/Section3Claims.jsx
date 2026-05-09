import React, { useState } from 'react';
import ReportCard from '../shared/ReportCard';
import ExpandableRow from '../shared/ExpandableRow';
import Skeleton from '../shared/Skeleton';

export default function Section3Claims({ claims }) {
  const [filter, setFilter] = useState('All');

  if (!claims) {
    return (
      <ReportCard eyebrow="03 — Claims" title="Claim Verification">
        <div className="w-full rounded-xl shadow-card bg-bg-surface overflow-hidden">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 bg-bg-raised/30">
            <Skeleton className="h-3 w-32 rounded" />
            <Skeleton className="h-3 w-16 rounded" />
          </div>
          {/* Row Skeletons */}
          <div className="divide-y divide-white/5">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={`sk-${i}`} className="flex justify-between items-center px-5 py-5">
                <Skeleton className="h-4 w-3/4 rounded" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </ReportCard>
    );
  }

  const FILTERS = ['All', 'Inflated', 'Unsubstantiated', 'Verified'];

  const formatClaimName = (key, data) => {
    const titles = {
      tam: 'Total Addressable Market',
      traction: 'Historical Traction',
      moat: 'Competitive Moat',
      financials: 'Financial Projections'
    };
    return data[`claimed_${key}`] || titles[key] || key;
  };

  const filteredClaims = Object.entries(claims).filter(([, data]) => {
    if (filter === 'All') return true;
    return data.verdict === filter.toUpperCase();
  });

  return (
    <ReportCard eyebrow="03" title="Claim Verification">
      
      {/* ── FILTER CHIPS ── */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-wrap items-center gap-2">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`
                px-4 py-1.5 rounded-full text-[10px] font-mono font-semibold uppercase tracking-[0.15em]
                transition-all duration-200 border
                ${filter === f
                  ? 'bg-accent text-white border-accent shadow-[0_0_15px_rgba(113,112,255,0.3)]'
                  : 'bg-white/[0.02] text-text-muted border-white/5 hover:bg-white/[0.04] hover:text-text-secondary hover:border-white/10'
                }
              `}
            >
              {f}
            </button>
          ))}
        </div>
        <span className="hidden sm:block text-[10px] font-mono uppercase tracking-[0.15em] text-text-faint">
          {filteredClaims.length} Claim{filteredClaims.length !== 1 ? 's' : ''} Found
        </span>
      </div>

      {/* ── CLAIMS DOSSIER LIST ── */}
      <div className="w-full rounded-xl shadow-card bg-bg-surface overflow-hidden border border-white/[0.03]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 bg-bg-raised/30">
          <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.15em] text-text-muted">Claim Analyzed</span>
          <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.15em] text-text-muted pr-20">Verdict</span>
        </div>
        
        {/* Rows */}
        <div className="flex flex-col">
          {filteredClaims.length > 0 ? (
            filteredClaims.map(([key, data]) => {
              if (!data.verdict) return null;
              return (
                <ExpandableRow
                  key={key}
                  claim={formatClaimName(key, data)}
                  verdict={data.verdict}
                  evidence={data.explanation}
                  source={data.source}
                  question={data.investor_question}
                />
              );
            })
          ) : (
            <div className="px-5 py-16 text-center flex flex-col items-center justify-center">
              <span className="text-3xl mb-3">🔍</span>
              <p className="text-sm font-sans text-text-muted">
                No claims found with the "{filter}" verdict.
              </p>
            </div>
          )}
        </div>
      </div>
    </ReportCard>
  );
}
