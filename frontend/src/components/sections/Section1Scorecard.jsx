import React from 'react';
import ReportCard from '../shared/ReportCard';
import ScoreBar from '../shared/ScoreBar';
import ScoreRadar from '../shared/ScoreRadar';
import Skeleton from '../shared/Skeleton';
import StatCard from '../shared/StatCard';

export default function Section1Scorecard({ scorecard, trace, onTraceabilityClick }) {
  if (!scorecard) {
    return (
      <ReportCard eyebrow="01 — Scorecard" title="Deal Scorecard">
        <div className="space-y-6 p-5">
          {/* Score hero skeleton */}
          <div className="flex items-center gap-8">
            <Skeleton className="h-24 w-24 rounded-2xl" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-5 w-48 rounded" />
              <Skeleton className="h-4 w-64 rounded" />
            </div>
          </div>
          {/* Bars skeleton */}
          <div className="space-y-4 pt-4 border-t border-white/5">
            {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-10 rounded-md" />)}
          </div>
        </div>
      </ReportCard>
    );
  }

  const overallColor =
    scorecard.overall >= 7 ? 'verdict-green' :
    scorecard.overall >= 4 ? 'verdict-amber' :
                             'verdict-red';

  const overallLabel =
    scorecard.overall >= 7 ? 'STRONG' :
    scorecard.overall >= 4 ? 'MODERATE' :
                             'WEAK';

  return (
    <ReportCard eyebrow="01" title="Deal Scorecard">
      
      {/* ── SCORE HERO ── */}
      <div className="flex items-start gap-6 mb-8 pb-8 border-b border-white/5">
        {/* Big Score Number */}
        <div className={`flex flex-col items-center justify-center w-28 h-28 rounded-2xl border bg-${overallColor}-bg border-${overallColor}-border`}>
          <span className={`text-5xl font-mono font-bold tracking-tight text-${overallColor}-text leading-none`}>
            {scorecard.overall}
          </span>
          <span className="text-[10px] font-mono text-text-muted mt-1 uppercase tracking-widest">/ 10</span>
        </div>
        {/* Score Context */}
        <div className="flex-1 pt-1">
          <div className="flex items-center gap-3 mb-3">
            <span className={`text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-1 rounded border bg-${overallColor}-bg text-${overallColor}-text border-${overallColor}-border`}>
              {overallLabel}
            </span>
            <span className="text-[10px] font-mono text-text-faint uppercase tracking-wider">
              {scorecard.top_flags.length} flag{scorecard.top_flags.length !== 1 ? 's' : ''} · {scorecard.strengths.length} strength{scorecard.strengths.length !== 1 ? 's' : ''}
            </span>
          </div>
          <p className="text-sm font-sans text-text-secondary leading-relaxed max-w-xl">
            {scorecard.overall >= 7
              ? 'This deal demonstrates strong fundamentals across key dimensions. Proceed with standard diligence.'
              : scorecard.overall >= 4
              ? 'This deal shows mixed signals. Targeted due diligence recommended on flagged dimensions.'
              : 'This deal presents significant risk across multiple dimensions. Deep investigation recommended before proceeding.'}
          </p>
        </div>
      </div>

      {/* ── DEAL PROFILE + DIMENSION BREAKDOWN ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-8">
        {/* Radar Chart — 2 columns */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div>
            <h3 className="text-[10px] font-mono font-semibold uppercase tracking-[0.15em] text-text-muted mb-4 flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-accent-light" />
              Deal Profile
            </h3>
            <div className="rounded-xl bg-bg-raised/30 border border-white/5 p-2">
              <ScoreRadar dimensions={scorecard.dimensions} />
            </div>
          </div>
          
          {trace && (
            <div className="cursor-pointer transition-transform hover:-translate-y-1" onClick={onTraceabilityClick}>
              <StatCard 
                label="Traceability" 
                value={`${trace.sourceCount}/${trace.claimCount}`} 
                subtext="Claims verified against external sources. Click to view evidence." 
                variant="neutral"
              />
            </div>
          )}
        </div>

        {/* Score Bars — 3 columns */}
        <div className="lg:col-span-3">
          <h3 className="text-[10px] font-mono font-semibold uppercase tracking-[0.15em] text-text-muted mb-4 flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-accent-light" />
            Dimension Breakdown
          </h3>
          <div className="space-y-5 pt-1">
            <ScoreBar label="Founder Credibility" score={scorecard.dimensions.founder_credibility} delay={100} />
            <ScoreBar label="Market Validity" score={scorecard.dimensions.market_validity} delay={200} />
            <ScoreBar label="Competitive Moat" score={scorecard.dimensions.competitive_moat} delay={300} />
            <ScoreBar label="Traction Quality" score={scorecard.dimensions.traction_quality} delay={400} />
            <ScoreBar label="Financial Soundness" score={scorecard.dimensions.financial_soundness} delay={500} />
          </div>
        </div>
      </div>

      {/* ── FLAGS & STRENGTHS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 border-t border-white/5 pt-6">
        {/* Flags */}
        <div>
          <h3 className="text-[10px] font-mono font-semibold uppercase tracking-[0.15em] text-verdict-red-text mb-4 flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-verdict-red-text" />
            Critical Flags
          </h3>
          <ul className="space-y-2.5">
            {scorecard.top_flags.map((flag, i) => (
              <li key={i} className="text-sm text-text-secondary flex items-start gap-3 rounded-lg px-3 py-2.5 bg-verdict-red-bg/40 border border-verdict-red-border/40">
                <span className="text-verdict-red-text font-mono text-[10px] font-bold mt-0.5 flex-shrink-0">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="leading-relaxed">{flag}</span>
              </li>
            ))}
            {scorecard.top_flags.length === 0 && (
              <li className="text-sm text-text-muted italic px-3 py-2.5">No critical flags detected.</li>
            )}
          </ul>
        </div>

        {/* Strengths */}
        <div>
          <h3 className="text-[10px] font-mono font-semibold uppercase tracking-[0.15em] text-verdict-green-text mb-4 flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-verdict-green-text" />
            Key Strengths
          </h3>
          <ul className="space-y-2.5">
            {scorecard.strengths.map((str, i) => (
              <li key={i} className="text-sm text-text-secondary flex items-start gap-3 rounded-lg px-3 py-2.5 bg-verdict-green-bg/40 border border-verdict-green-border/40">
                <span className="text-verdict-green-text font-mono text-[10px] font-bold mt-0.5 flex-shrink-0">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="leading-relaxed">{str}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </ReportCard>
  );
}
