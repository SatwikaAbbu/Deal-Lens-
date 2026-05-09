import React from 'react';
import ReportCard from '../shared/ReportCard';
import Skeleton from '../shared/Skeleton';

export default function Section2Founder({ founder }) {
  if (!founder) {
    return (
      <ReportCard eyebrow="02 — Founder" title="Founder Intelligence">
        <div className="p-5 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center gap-3">
              <Skeleton className="w-24 h-24 rounded-full" />
              <Skeleton className="h-5 w-32 rounded" />
              <Skeleton className="h-4 w-20 rounded" />
            </div>
            <div className="md:col-span-2 space-y-3 pt-2">
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-6 w-full rounded" />
              <Skeleton className="h-6 w-3/4 rounded" />
            </div>
          </div>
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </ReportCard>
    );
  }

  const initials = founder.name ? founder.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'F';
  const isHighFit = founder.domain_fit === 'HIGH';

  return (
    <ReportCard eyebrow="02" title="Founder Intelligence">
      <div className="space-y-8">
        
        {/* ── Profile & Domain Fit ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* Avatar & Name */}
          <div className="md:col-span-1 flex flex-col items-center text-center p-6 rounded-xl bg-bg-surface/50 border border-white/[0.03]">
            <div className="relative mb-4">
              <div className="w-24 h-24 rounded-full bg-bg-raised border border-white/10 flex items-center justify-center text-4xl font-sans font-bold text-white shadow-inner">
                {initials}
              </div>
              <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest border shadow-lg ${
                isHighFit 
                  ? 'bg-verdict-green-bg text-verdict-green-text border-verdict-green-border shadow-verdict-green-bg/20' 
                  : 'bg-verdict-amber-bg text-verdict-amber-text border-verdict-amber-border shadow-verdict-amber-bg/20'
              }`}>
                {founder.domain_fit} FIT
              </div>
            </div>
            <p className="text-xl font-sans font-bold text-white tracking-tight">{founder.name}</p>
            <p className="text-[11px] font-mono uppercase tracking-widest text-text-muted mt-1">{founder.role || "Founder"}</p>
          </div>

          {/* Domain Fit Analysis */}
          <div className="md:col-span-2 pt-2">
            <h3 className="text-[10px] font-mono font-semibold uppercase tracking-[0.15em] text-text-muted mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-light" />
              Executive Summary
            </h3>
            <p className="text-[15px] font-sans text-text-secondary leading-relaxed">
              {founder.verdict || founder.explanation}
            </p>
          </div>
        </div>

        {/* ── Signals & Flags (2-Column Grid) ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Credibility Signals */}
          <div className="rounded-xl border border-white/[0.03] bg-bg-surface/30 p-5 border-l-[3px] border-l-verdict-green-bar">
            <h3 className="text-[10px] font-mono font-semibold uppercase tracking-[0.15em] text-verdict-green-text mb-4">
              Verified Credibility Signals
            </h3>
            <ul className="space-y-3">
              {founder.credibility_signals?.map((sig, i) => (
                <li key={i} className="flex items-start gap-3 text-sm font-sans text-white leading-relaxed">
                  <span className="text-verdict-green-text font-mono text-[10px] font-bold mt-1 flex-shrink-0">✓</span>
                  <span>{sig}</span>
                </li>
              ))}
              {(!founder.credibility_signals || founder.credibility_signals.length === 0) && (
                <li className="text-sm font-sans text-text-faint italic">No strong domain signals detected in public data.</li>
              )}
            </ul>
          </div>

          {/* Potential Risks */}
          <div className="rounded-xl border border-white/[0.03] bg-bg-surface/30 p-5 border-l-[3px] border-l-verdict-red-bar">
            <h3 className="text-[10px] font-mono font-semibold uppercase tracking-[0.15em] text-verdict-red-text mb-4">
              Potential Risks / Flags
            </h3>
            <ul className="space-y-3">
              {founder.red_flags?.map((flag, i) => (
                <li key={i} className="flex items-start gap-3 text-sm font-sans text-white leading-relaxed">
                  <span className="text-verdict-red-text font-mono text-[10px] font-bold mt-1 flex-shrink-0">✗</span>
                  <span>{flag}</span>
                </li>
              ))}
              {(!founder.red_flags || founder.red_flags.length === 0) && (
                <li className="text-sm font-sans text-text-faint italic">No major risks or controversies found in public records.</li>
              )}
            </ul>
          </div>
        </div>

        {/* ── Public Intelligence Feed ── */}
        <div className="rounded-xl bg-accent/5 border border-accent/10 p-5">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
            <h3 className="text-[10px] font-mono font-semibold uppercase tracking-[0.15em] text-accent-light flex items-center gap-2">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              Automated Intelligence Report
            </h3>
            <div className="flex gap-2">
              <span className="text-[9px] font-mono text-accent-light/70 uppercase tracking-widest px-2 py-0.5 rounded border border-accent/20 bg-accent/10">TAVILY WEB</span>
              <span className="text-[9px] font-mono text-accent-light/70 uppercase tracking-widest px-2 py-0.5 rounded border border-accent/20 bg-accent/10">CRUNCHBASE</span>
            </div>
          </div>
          <p className="text-[13px] font-sans text-text-secondary leading-relaxed border-l-2 border-accent/30 pl-4 py-1">
            {founder.public_summary || "No public intelligence available for this profile."}
          </p>
        </div>

      </div>
    </ReportCard>
  );
}
