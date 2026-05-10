import React, { useState } from 'react';
import Sidebar from '../components/layout/Sidebar';
import Button from '../components/shared/Button';
import ErrorBoundary from '../components/shared/ErrorBoundary';
import { useScrollSpy } from '../hooks/useScrollSpy';

import Section1Scorecard from '../components/sections/Section1Scorecard';
import Section2Founder from '../components/sections/Section2Founder';
import Section3Claims from '../components/sections/Section3Claims';
import Section4Competitors from '../components/sections/Section4Competitors';
import Section5Questions from '../components/sections/Section5Questions';

import DealChat from '../components/Report/DealChat';

function computeTraceabilityMetrics(report) {
  const claimsObj = report?.claims && typeof report.claims === 'object' ? report.claims : null;
  const claimKeys = claimsObj ? Object.keys(claimsObj) : [];

  let sourceCount = 0;
  let verdictCount = 0;
  for (const key of claimKeys) {
    const claim = claimsObj[key];
    if (!claim || typeof claim !== 'object') continue;
    if (typeof claim.verdict === 'string' && claim.verdict.trim()) verdictCount += 1;
    if (typeof claim.source === 'string' && claim.source.trim().toLowerCase().startsWith('http')) sourceCount += 1;
  }

  const questions = Array.isArray(report?.questions) ? report.questions : [];
  const anchoredQuestions = questions.filter(q => {
    return q && typeof q === 'object' && typeof q.targets_claim === 'string' && q.targets_claim.trim().length > 0;
  }).length;

  return {
    claimCount: claimKeys.length,
    verdictCount,
    sourceCount,
    questionCount: questions.length,
    anchoredQuestions,
  };
}

export default function ReportPage({ report, reportId, filename, onNavigate }) {
  const [inviting, setInviting] = useState(false);
  const [inviteSent, setInviteSent] = useState(false);
  const [inviteError, setInviteError] = useState(null);
  
  // Array of section IDs that match the <section id="..."> tags
  const sectionIds = ['scorecard', 'founder', 'claims', 'competitors', 'questions'];
  const activeSection = useScrollSpy(sectionIds, 100);

  const overall =
    report?.scorecard?.overall ??
    report?.scorecard?.overall_score?.value ??
    0;

  const trace = computeTraceabilityMetrics(report);

  const handleExportPDF = () => {
    window.print();
  };

  const handleMeetingInvite = async () => {
    if (!reportId || inviting || inviteSent) return;
    setInviting(true);
    setInviteError(null);
    try {
      const { sendMeetingInvite } = await import('../api/dashboard');
      await sendMeetingInvite(reportId);
      setInviteSent(true);
    } catch (err) {
      setInviteError(err.response?.data?.detail || 'Failed to send invite.');
    } finally {
      setInviting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-base flex">
      <Sidebar active={activeSection} onNavigate={onNavigate} filename={filename} />
      
      <main className="ml-56 flex-1 px-8 py-8 h-screen overflow-y-auto relative">
        <div className="absolute top-24 right-20 w-[360px] h-[360px] bg-accent/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="max-w-4xl mx-auto space-y-10 pb-32 relative z-10">
          
          {/* Header */}
          <div className="flex items-start justify-between border border-white/[0.08] bg-bg-panel/45 backdrop-blur-md rounded-2xl px-6 py-6 shadow-card">
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <h1 className="text-3xl font-sans font-semibold tracking-tight text-text-primary">
                  {report.scorecard?.startup_name || "Unknown Startup"}
                </h1>
                <span className="px-2.5 py-1 rounded bg-accent/10 border border-accent/20 text-[10px] font-mono text-accent-light uppercase tracking-widest">
                  Intelligence Report
                </span>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-[11px] font-mono text-text-faint tracking-wide">{filename}</p>
                <span className="text-text-faint/30 text-[10px]">|</span>
                <p className="text-[10px] font-mono text-text-faint uppercase tracking-wider">Analysed just now</p>
              </div>
            </div>
            
            <div className="flex items-center gap-8">
              {/* Overall Score Badge */}
              <div className="flex flex-col items-end">
                <p className="text-[10px] font-mono text-text-muted uppercase tracking-widest mb-1">Overall Verdict</p>
                <div className="flex items-center gap-3">
                  <div className={`text-4xl font-mono font-semibold tracking-tighter ${
                    overall >= 7 ? 'text-verdict-green-text' :
                    overall >= 4 ? 'text-verdict-amber-text' :
                                   'text-verdict-red-text'
                  }`}>
                    {overall}<span className="text-lg text-text-faint">/10</span>
                  </div>
                </div>
              </div>

              <div className="w-px h-12 bg-white/10" />

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <Button
                  variant="primary"
                  onClick={handleMeetingInvite}
                  disabled={inviting || inviteSent}
                >
                  {inviteSent ? '✓ Invite Sent' : inviting ? 'Sending...' : 'Request Meeting'}
                </Button>
                {inviteError && (
                  <p className="text-[10px] font-mono text-verdict-red-text">{inviteError}</p>
                )}
                <Button variant="ghost" onClick={handleExportPDF}>
                  Export PDF
                </Button>
              </div>
            </div>
          </div>

          {/* 01: Deal Scorecard */}
          <section id="scorecard" className="scroll-mt-8">
            <ErrorBoundary eyebrow="01" title="Deal Scorecard">
              <Section1Scorecard scorecard={report.scorecard} />
            </ErrorBoundary>
          </section>

          {/* 02: Founder Card */}
          <section id="founder" className="scroll-mt-8">
            <ErrorBoundary eyebrow="02" title="Founder Intelligence">
              <Section2Founder founder={report.founder} />
            </ErrorBoundary>
          </section>

          {/* 03: Claim Verification */}
          <section id="claims" className="scroll-mt-8">
            <ErrorBoundary eyebrow="03" title="Claim Verification">
              <Section3Claims claims={report.claims} />
            </ErrorBoundary>
          </section>

          {/* 04: Competitor Map */}
          <section id="competitors" className="scroll-mt-8">
            <ErrorBoundary eyebrow="04" title="Competitor Map">
              <Section4Competitors
                competitors={report.competitors}
                moat={report.claims.moat}
                startupName={report?.scorecard?.startup_name}
              />
            </ErrorBoundary>
          </section>

          {/* 05: Investor Questions */}
          <section id="questions" className="scroll-mt-8">
            <ErrorBoundary eyebrow="05" title="Investor Questions">
              <Section5Questions questions={report.questions} />
            </ErrorBoundary>
          </section>

        </div>
        
        {/* Chat with Deal */}
        {report.raw_text && <DealChat rawText={report.raw_text} />}
      </main>
    </div>
  );
}
