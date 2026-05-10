import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDeals, updateDealStatus, analyseFullDeal, deleteDeal } from '../api/dashboard';
import PreferencesModal from './PreferencesModal';

const SIDEBAR_VIEWS = [
  { key: 'inbox', label: 'Inbox', icon: 'Inbox' },
  { key: 'favourite', label: 'Favourites', icon: 'Star' },
  { key: 'accepted', label: 'Accepted', icon: 'CheckCircle2' },
  { key: 'rejected', label: 'Rejected', icon: 'XCircle' },
  { key: 'disqualified', label: 'Disqualified', icon: 'Ban' },
];

function Icon({ name, className }) {
  // Simple inline SVG icons for the dashboard to avoid external dependencies
  const icons = {
    Inbox: <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>,
    Star: <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>,
    CheckCircle2: <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    XCircle: <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    Ban: <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>,
    Trash2: <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
    BarChart3: <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M18 20V10m-6 10V4m-6 16v-8" /></svg>,
    Settings: <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    Link: <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>,
    Upload: <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>,
    RefreshCw: <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
    Loader2: <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>,
    Mail: <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
    FileText: <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
  };
  return icons[name] || null;
}

function StatCard({ label, count, iconName, active, statKey, onClick }) {
  // Animated counter
  const [displayCount, setDisplayCount] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const end = count;
    if (start === end) return;
    
    const duration = 800; // ms
    const incrementTime = 20; // ms
    const steps = duration / incrementTime;
    const stepValue = end / steps;
    
    const timer = setInterval(() => {
      start += stepValue;
      if (start >= end) {
        setDisplayCount(end);
        clearInterval(timer);
      } else {
        setDisplayCount(Math.ceil(start));
      }
    }, incrementTime);
    
    return () => clearInterval(timer);
  }, [count]);

  return (
    <button
      onClick={onClick}
      className={`stat-card flex-1 min-w-[140px] text-left animate-scaleIn ${active ? 'active' : ''} stat-glow-${statKey}`}
    >
      <div className="flex justify-between items-start mb-2">
        <span className={`p-2 rounded-lg ${active ? 'bg-accent/20 text-accent-light' : 'bg-bg-raised text-text-muted'}`}>
          <Icon name={iconName} className="w-5 h-5" />
        </span>
        {active && (
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-light"></span>
          </span>
        )}
      </div>
      <div className="text-3xl font-mono font-bold text-text-primary tracking-tight">
        {displayCount}
      </div>
      <div className="text-xs font-sans text-text-muted mt-1 uppercase tracking-wider font-medium">
        {label}
      </div>
    </button>
  );
}

function ScoreRing({ score }) {
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - ((score || 0) / 10) * circumference;
  
  let colorClass = 'stroke-border-strong';
  if (score >= 7) colorClass = 'stroke-verdict-green-text';
  else if (score >= 4) colorClass = 'stroke-verdict-amber-text';
  else if (score > 0) colorClass = 'stroke-verdict-red-text';

  return (
    <div className="relative flex items-center justify-center w-12 h-12 shrink-0">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 40 40">
        <circle
          cx="20"
          cy="20"
          r={radius}
          className="score-ring-track"
          strokeWidth="4"
        />
        {score > 0 && (
          <circle
            cx="20"
            cy="20"
            r={radius}
            className={`score-ring-fill ${colorClass}`}
            strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
        )}
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-[13px] font-mono font-bold text-text-primary leading-none">
          {score ? score.toFixed(1) : '-'}
        </span>
      </div>
    </div>
  );
}

function DealCard({ deal, onStatusChange, onDetailedReport, analyzing, index, onDelete }) {
  const categoryColors = {
    'EdTech': 'text-verdict-blue-text border-verdict-blue-border bg-verdict-blue-bg/30',
    'FinTech': 'text-verdict-green-text border-verdict-green-border bg-verdict-green-bg/30',
    'HealthTech': 'text-verdict-green-text border-verdict-green-border bg-verdict-green-bg/30',
    'Crypto': 'text-verdict-red-text border-verdict-red-border bg-verdict-red-bg/30',
    'AI/ML': 'text-accent-light border-accent/30 bg-accent/10',
  };

  const catStyle = categoryColors[deal.category] || 'text-text-muted border-border-strong bg-bg-raised/50';
  const delayClass = `stagger-${(index % 8) + 1}`;

  return (
    <div className={`deal-card animate-cardIn ${delayClass} flex flex-col h-full`}>
      {/* Top Section: Title & Score */}
      <div className="flex gap-4 items-start mb-4 relative z-10">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`category-badge ${catStyle}`}>
              {deal.category || 'Unknown'}
            </span>
            <span className="text-[10px] font-mono text-text-faint">
              {new Date(deal.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
            </span>
          </div>
          <h3 className="text-lg font-sans font-semibold text-text-primary truncate">
            {deal.startup_name}
          </h3>
        </div>
        <div className="flex items-start gap-3">
          <ScoreRing score={deal.overall_score} />
          <button 
            onClick={() => onDelete(deal.id)}
            className="text-text-faint hover:text-verdict-red-text transition-colors p-1 mt-1"
            title="Permanently Delete"
          >
            <Icon name="Trash2" className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 relative z-10">
        {deal.short_description ? (
          <p className="text-sm font-sans text-text-secondary leading-relaxed line-clamp-3 mb-4">
            {deal.short_description}
          </p>
        ) : (
          <p className="text-sm font-sans text-text-faint italic mb-4">No description provided.</p>
        )}

        {deal.founder_email && (
          <div className="flex items-center gap-2 text-xs font-mono text-text-muted bg-bg-base/50 p-2 rounded-lg border border-border-subtle w-max max-w-full">
            <Icon name="Mail" className="w-3.5 h-3.5 shrink-0 text-text-faint" />
            <span className="truncate">{deal.founder_email}</span>
          </div>
        )}
      </div>

      {/* Actions Section */}
      <div className="mt-5 pt-4 border-t border-border-subtle flex items-center gap-1.5 relative z-10">
        {deal.status !== 'accepted' && (
          <button
            onClick={() => onStatusChange(deal.id, 'accepted')}
            className="action-btn action-btn-accept flex-1 whitespace-nowrap"
            title="Accept"
          >
            <Icon name="CheckCircle2" className="w-4 h-4" />
            <span className="hidden sm:inline">Accept</span>
          </button>
        )}
        {deal.status !== 'rejected' && (
          <button
            onClick={() => onStatusChange(deal.id, 'rejected')}
            className="action-btn action-btn-reject flex-1 whitespace-nowrap"
            title="Reject"
          >
            <Icon name="XCircle" className="w-4 h-4" />
            <span className="hidden sm:inline">Reject</span>
          </button>
        )}
        {deal.status !== 'favourite' && (
          <button
            onClick={() => onStatusChange(deal.id, 'favourite')}
            className="action-btn action-btn-favourite flex-1 whitespace-nowrap"
            title="Favourite"
          >
            <Icon name="Star" className="w-4 h-4" />
            <span className="hidden sm:inline">Fav</span>
          </button>
        )}
        <button
          onClick={() => onDetailedReport(deal.id)}
          disabled={analyzing === deal.id}
          className="action-btn action-btn-primary flex-[1.5] whitespace-nowrap"
        >
          {analyzing === deal.id ? (
            <>
              <Icon name="Loader2" className="w-4 h-4 animate-spin" />
              <span className="text-[10px]">Analyzing</span>
            </>
          ) : (
            <>
              <Icon name="FileText" className="w-4 h-4" />
              <span>Report</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [deals, setDeals] = useState([]);
  const [activeView, setActiveView] = useState('inbox');
  const [loading, setLoading] = useState(true);
  const [showPrefs, setShowPrefs] = useState(false);
  const [analyzing, setAnalyzing] = useState(null);

  const fetchDeals = useCallback(async () => {
    try {
      const data = await getDeals();
      setDeals(data.deals || []);
    } catch (err) {
      console.error('Failed to fetch deals:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDelete = async (dealId) => {
    if (!window.confirm("Are you sure you want to permanently delete this deal? This action cannot be undone.")) return;
    try {
      await deleteDeal(dealId);
      await fetchDeals();
    } catch (error) {
      console.error('Failed to delete deal:', error);
      alert('Failed to delete deal. Please try again.');
    }
  };

  useEffect(() => {
    fetchDeals();
    const interval = setInterval(fetchDeals, 15000);
    return () => clearInterval(interval);
  }, [fetchDeals]);

  const handleStatusChange = async (dealId, newStatus) => {
    try {
      await updateDealStatus(dealId, newStatus);
      setDeals((prev) =>
        prev.map((d) => (d.id === dealId ? { ...d, status: newStatus } : d))
      );
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleDetailedReport = async (dealId) => {
    setAnalyzing(dealId);
    try {
      await analyseFullDeal(dealId);
      navigate(`/report/${dealId}`);
    } catch (err) {
      console.error('Full analysis failed:', err);
      alert('Analysis failed. Please try again.');
    } finally {
      setAnalyzing(null);
    }
  };

  // Compute stats
  const favouriteCount = deals.filter((d) => d.status === 'favourite').length;
  const acceptedCount = deals.filter((d) => d.status === 'accepted').length;
  const rejectedCount = deals.filter((d) => d.status === 'rejected').length;
  const disqualifiedCount = deals.filter((d) => d.status === 'disqualified').length;
  const inboxCount = deals.length - (favouriteCount + acceptedCount + rejectedCount + disqualifiedCount);

  const stats = {
    total: deals.length,
    inbox: inboxCount,
    favourite: favouriteCount,
    accepted: acceptedCount,
    rejected: rejectedCount,
    disqualified: disqualifiedCount,
  };

  // Filter and Sort deals
  const filteredDeals = deals.filter((d) => {
    if (activeView === 'all') return true;
    if (activeView === 'inbox') return d.status !== 'favourite' && d.status !== 'accepted' && d.status !== 'rejected' && d.status !== 'disqualified';
    return d.status === activeView;
  }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); // New to old

  return (
    <div className="h-screen bg-bg-base flex overflow-hidden font-sans">
      {/* ── Sidebar ── */}
      <aside className="w-[260px] glass-sidebar flex flex-col shrink-0 relative z-20 animate-slideInLeft">
        {/* Brand */}
        <div className="px-6 py-8 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-xl font-sans font-bold tracking-tight text-text-primary leading-none">
                Deal<span className="text-accent-light">Lens</span>
              </h1>
              <p className="text-[10px] font-mono text-text-muted uppercase tracking-wider mt-1.5">Investor CRM</p>
            </div>
          </div>
        </div>

        {/* Views */}
        <div className="flex-1 overflow-y-auto custom-scroll py-6 px-4">
          <div className="text-xs font-sans font-semibold text-text-faint uppercase tracking-wider mb-3 px-2">
            Pipeline
          </div>
          <nav className="space-y-1">
            <button
              onClick={() => setActiveView('all')}
              className={`nav-item ${activeView === 'all' ? 'active' : ''}`}
            >
              <Icon name="BarChart3" className="w-5 h-5 shrink-0" />
              <span className="flex-1">Total Submissions</span>
              <span className={`text-xs font-mono font-bold ${activeView === 'all' ? 'text-accent-light' : 'text-text-faint'}`}>
                {stats.total}
              </span>
            </button>

            {SIDEBAR_VIEWS.map((view) => (
              <button
                key={view.key}
                onClick={() => setActiveView(view.key)}
                className={`nav-item ${activeView === view.key ? 'active' : ''}`}
              >
                <Icon name={view.icon} className="w-5 h-5 shrink-0" />
                <span className="flex-1">{view.label}</span>
                <span className={`text-xs font-mono font-bold ${
                  activeView === view.key ? 'text-accent-light' : 'text-text-faint'
                }`}>
                  {stats[view.key] || 0}
                </span>
              </button>
            ))}
          </nav>

          <div className="mt-8 mb-3 px-2 flex items-center justify-between">
             <div className="text-xs font-sans font-semibold text-text-faint uppercase tracking-wider">
               Tools
             </div>
          </div>
          <nav className="space-y-1">
            <button
              onClick={() => navigate('/submit')}
              className="nav-item"
            >
              <Icon name="Link" className="w-5 h-5 shrink-0" />
              <span>Public Submission Link</span>
            </button>
            <button
              onClick={() => navigate('/')}
              className="nav-item"
            >
              <Icon name="Upload" className="w-5 h-5 shrink-0" />
              <span>Manual Deck Upload</span>
            </button>
          </nav>
        </div>

        {/* User / Settings Footer */}
        <div className="p-4 border-t border-white/5 bg-black/20">
          <button
            onClick={() => setShowPrefs(true)}
            className="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-white/5 transition-colors text-left group"
          >
            <div className="w-8 h-8 rounded-full bg-bg-raised border border-border-standard flex items-center justify-center shrink-0">
              <Icon name="Settings" className="w-4 h-4 text-text-muted group-hover:text-text-primary transition-colors" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-text-primary truncate">Preferences</div>
              <div className="text-xs text-text-muted truncate">Manage triage filters</div>
            </div>
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 flex flex-col min-w-0 relative z-10 bg-[url('/grid.svg')] bg-center bg-fixed">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-bg-base pointer-events-none" />
        
        {/* Top Header / Stats Row */}
        <header className="px-8 pt-8 pb-6 border-b border-border-subtle bg-bg-panel/40 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-text-primary flex items-center gap-3">
                <Icon name={activeView === 'all' ? 'BarChart3' : SIDEBAR_VIEWS.find(v => v.key === activeView)?.icon || 'BarChart3'} className="w-6 h-6 text-accent-light" />
                {activeView === 'all' ? 'Total Submissions' : SIDEBAR_VIEWS.find(v => v.key === activeView)?.label || 'Overview'}
              </h2>
              <p className="text-sm text-text-muted mt-1">
                Viewing {filteredDeals.length} deals in this stage
              </p>
            </div>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2 custom-scroll">
            <StatCard label="Total Submissions" count={stats.total} iconName="BarChart3" active={activeView === 'all'} statKey="total" onClick={() => setActiveView('all')} />
            {SIDEBAR_VIEWS.map((view) => (
              <StatCard
                key={view.key}
                label={view.label}
                count={stats[view.key] || 0}
                iconName={view.icon}
                active={activeView === view.key}
                statKey={view.key}
                onClick={() => setActiveView(view.key)}
              />
            ))}
          </div>
        </header>

        {/* Deal Grid */}
        <div className="flex-1 overflow-y-auto custom-scroll p-8 relative z-10">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-text-muted">
              <Icon name="Loader2" className="w-8 h-8 animate-spin text-accent-light mb-4" />
              <p className="font-mono text-sm uppercase tracking-wider">Loading pipeline...</p>
            </div>
          ) : filteredDeals.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto text-center animate-fadeIn">
              <div className="w-24 h-24 bg-bg-raised rounded-full flex items-center justify-center mb-6 border border-border-standard shadow-card">
                <Icon name={SIDEBAR_VIEWS.find(v => v.key === activeView)?.icon || 'Inbox'} className="w-10 h-10 text-text-muted" />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-2">
                Your {activeView} is empty
              </h3>
              <p className="text-text-secondary mb-8 leading-relaxed">
                {activeView === 'inbox' 
                  ? "You don't have any pending pitch decks right now. Share your submission link to start receiving deal flow."
                  : `No deals have been moved to the ${activeView} stage yet.`}
              </p>
              {activeView === 'inbox' && (
                <button
                  onClick={() => navigate('/submit')}
                  className="px-6 py-3 rounded-xl bg-accent text-white font-semibold shadow-[0_0_20px_rgba(113,112,255,0.3)] hover:bg-accent-hover transition-colors flex items-center gap-2"
                >
                  <Icon name="Link" className="w-5 h-5" />
                  Copy Submission Link
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 pb-12">
              {filteredDeals.map((deal, i) => (
                <DealCard
                  key={deal.id}
                  deal={deal}
                  index={i}
                  onStatusChange={handleStatusChange}
                  onDetailedReport={handleDetailedReport}
                  analyzing={analyzing}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <PreferencesModal
        isOpen={showPrefs}
        onClose={() => setShowPrefs(false)}
        onSaved={() => fetchDeals()}
      />
    </div>
  );
}
