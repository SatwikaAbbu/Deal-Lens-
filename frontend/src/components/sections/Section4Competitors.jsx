import React from 'react';
import ReportCard from '../shared/ReportCard';
import Skeleton from '../shared/Skeleton';

export default function Section4Competitors({ competitors, moat }) {
  if (!competitors || !moat) {
    return (
      <ReportCard eyebrow="04 — Competitors" title="Competitor Map">
        <div className="space-y-4">
          <Skeleton className="h-14 w-full rounded-lg" />
          <div className="rounded-xl overflow-hidden shadow-card border border-white/5">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex gap-4 px-4 py-4 border-b border-white/5 last:border-0 bg-bg-surface">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-4 w-32 rounded" />
                <Skeleton className="h-4 w-16 rounded" />
                <Skeleton className="h-5 w-16 rounded-full ml-auto" />
              </div>
            ))}
          </div>
        </div>
      </ReportCard>
    );
  }

  const getMoatStyle = (verdict) => {
    switch (verdict) {
      case 'STRONG':
      case 'VERIFIED':
        return 'bg-verdict-green-bg/50 border-verdict-green-border text-verdict-green-text';
      case 'WEAK':
      case 'PARTIAL':
        return 'bg-verdict-amber-bg/50 border-verdict-amber-border text-verdict-amber-text';
      case 'UNSUBSTANTIATED':
      case 'INFLATED':
        return 'bg-verdict-red-bg/50 border-verdict-red-border text-verdict-red-text';
      default:
        return 'bg-bg-raised/50 border-white/5 text-text-muted';
    }
  };

  return (
    <ReportCard eyebrow="04" title="Competitor Map">
      <div className="space-y-6">
        {/* Moat Verdict Banner */}
        <div className={`p-4 rounded-xl border ${getMoatStyle(moat.verdict)}`}>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 mt-1">
              <span className="text-[10px] font-mono font-medium uppercase tracking-widest px-2 py-0.5 bg-current/10 rounded-full border border-current/20">
                {moat.verdict}
              </span>
            </div>
            <div>
              <p className="text-xs font-mono uppercase tracking-widest opacity-60 mb-1">Moat Verdict</p>
              <p className="text-sm font-sans leading-relaxed text-text-primary">
                {moat.explanation || "No detailed moat analysis available."}
              </p>
            </div>
          </div>
        </div>

        {/* Competitor List */}
        {competitors && competitors.length > 0 ? (
          <div className="rounded-xl overflow-hidden shadow-card border border-white/5 bg-bg-surface">
            {/* Table Header */}
            <div className="grid grid-cols-12 px-4 py-3 bg-bg-raised border-b border-white/5 text-[10px] font-mono font-medium uppercase tracking-widest text-text-muted">
              <div className="col-span-1">#</div>
              <div className="col-span-3">Name</div>
              <div className="col-span-3">Backing</div>
              <div className="col-span-3">Scale</div>
              <div className="col-span-2 text-right">Threat</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-white/5">
              {competitors.map((comp, i) => {
                const threatStyles = {
                  CRITICAL: 'bg-red-500/10 border-red-500/20 text-red-400',
                  HIGH: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
                  MEDIUM: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
                  LOW: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
                };
                const style = threatStyles[comp.threat_level] || threatStyles.LOW;

                return (
                  <div key={i} className="grid grid-cols-12 px-4 py-4 items-center gap-3 hover:bg-bg-raised transition-colors group">
                    <div className="col-span-1 text-[10px] font-mono text-text-faint">{String(i + 1).padStart(2, '0')}</div>
                    <div className="col-span-3 text-sm font-sans font-medium text-text-primary">{comp.name}</div>
                    <div className="col-span-3 text-xs font-sans text-text-secondary truncate pr-2" title={comp.backing}>{comp.backing}</div>
                    <div className="col-span-3 text-xs font-sans text-text-secondary">{comp.scale}</div>
                    <div className="col-span-2 text-right">
                      <span className={`inline-block text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${style}`}>
                        {comp.threat_level}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="text-sm text-text-muted italic px-2">No funded competitors identified in this category.</p>
        )}
      </div>
    </ReportCard>
  );
}
