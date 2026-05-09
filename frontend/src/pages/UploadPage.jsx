import React, { useState, useEffect, useRef, useCallback } from 'react';

/* ─── Animated Counter ─── */
function AnimatedNumber({ target, duration = 2000, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const start = performance.now();
        const step = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
          setCount(Math.round(eased * target));
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

/* ─── Animated Score Bar (for preview) ─── */
function PreviewBar({ label, score, delay = 0 }) {
  const [width, setWidth] = useState(0);
  const pct = (score / 10) * 100;
  const color = score >= 7 ? 'bg-verdict-green-bar' : score >= 4 ? 'bg-verdict-amber-bar' : 'bg-verdict-red-bar';

  useEffect(() => {
    const timer = setTimeout(() => setWidth(pct), 800 + delay);
    return () => clearTimeout(timer);
  }, [pct, delay]);

  return (
    <div className="flex items-center gap-3">
      <span className="text-[10px] font-mono text-gray-400 w-16 text-right uppercase tracking-wider">{label}</span>
      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-1000 ease-out ${color}`} style={{ width: `${width}%` }} />
      </div>
      <span className="text-[10px] font-mono text-gray-300 w-6 font-semibold">{score}/10</span>
    </div>
  );
}

/* ─── Mini Radar for Preview ─── */
function MiniRadar() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 600);
    return () => clearTimeout(timer);
  }, []);

  const size = 100;
  const cx = size / 2;
  const cy = size / 2;
  const r = 35;
  const scores = [7, 5, 4, 6, 5];
  const angleStep = (2 * Math.PI) / 5;

  const points = scores.map((s, i) => {
    const angle = angleStep * i - Math.PI / 2;
    const dist = (s / 10) * r;
    return `${cx + dist * Math.cos(angle)},${cy + dist * Math.sin(angle)}`;
  }).join(' ');

  const rings = [0.25, 0.5, 0.75, 1].map(scale => {
    const ringPoints = Array.from({ length: 5 }, (_, i) => {
      const angle = angleStep * i - Math.PI / 2;
      return `${cx + r * scale * Math.cos(angle)},${cy + r * scale * Math.sin(angle)}`;
    }).join(' ');
    return <polygon key={scale} points={ringPoints} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />;
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {rings}
      <polygon
        points={points}
        fill="rgba(113,112,255,0.15)"
        stroke="rgba(113,112,255,0.6)"
        strokeWidth="1.5"
        className={`transition-all duration-1000 ease-out ${visible ? 'opacity-100' : 'opacity-0'}`}
        style={{ transformOrigin: `${cx}px ${cy}px`, transform: visible ? 'scale(1)' : 'scale(0)' }}
      />
    </svg>
  );
}

/* ─── Main Upload Page ─── */
export default function UploadPage({ onUpload, error }) {
  const [dragging, setDragging] = useState(false);
  const [localError, setLocalError] = useState(error);
  const handleIncomingFile = useCallback((incomingFile) => {
    if (!incomingFile) return;
    onUpload(incomingFile);
  }, [onUpload]);

  useEffect(() => {
    if (error) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocalError(error);
      const timer = setTimeout(() => setLocalError(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Global DnD guard: dropping a file anywhere on this page starts upload
  // instead of letting the browser perform default file navigation.
  useEffect(() => {
    const hasFiles = (event) => Array.from(event?.dataTransfer?.types || []).includes('Files');

    const onWindowDragOver = (event) => {
      if (!hasFiles(event)) return;
      event.preventDefault();
      setDragging(true);
    };

    const onWindowDragLeave = (event) => {
      if (event.relatedTarget == null) {
        setDragging(false);
      }
    };

    const onWindowDrop = (event) => {
      if (!hasFiles(event)) return;
      event.preventDefault();
      setDragging(false);
      const dropped = event.dataTransfer?.files?.[0];
      handleIncomingFile(dropped);
    };

    window.addEventListener('dragover', onWindowDragOver);
    window.addEventListener('dragleave', onWindowDragLeave);
    window.addEventListener('drop', onWindowDrop);

    return () => {
      window.removeEventListener('dragover', onWindowDragOver);
      window.removeEventListener('dragleave', onWindowDragLeave);
      window.removeEventListener('drop', onWindowDrop);
    };
  }, [handleIncomingFile]);

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-bg-base">
      
      {/* Subtle premium background glow — intensifies on drag */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none transition-all duration-700 ease-out ${
        dragging 
          ? 'w-[1000px] h-[800px] bg-accent/25 blur-[180px]' 
          : 'w-[800px] h-[600px] bg-accent/10 blur-[150px]'
      }`} />

      {/* ── BACKGROUND FLOATING CARDS ── */}
      
      {/* Card 1: Left Middle (Scorecard) — reacts to drag */}
      <div className={`hidden lg:flex absolute left-[-4%] top-1/2 -translate-y-1/2 transition-all duration-700 ease-out shadow-[0_10px_40px_rgba(0,0,0,0.8),_0_0_20px_rgba(113,112,255,0.1)] rounded-xl bg-[#13141a]/90 border border-white/10 p-6 flex-col w-[320px] backdrop-blur-xl ${dragging ? '-rotate-[14deg] opacity-30 scale-90 blur-[2px]' : '-rotate-[8deg] opacity-70 hover:opacity-100 hover:rotate-0 hover:z-50 hover:scale-105 animate-floatTilt'}`}>
        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
          <span className="text-[10px] font-mono text-accent-light uppercase tracking-widest font-semibold">01</span>
          <span className="text-[10px] font-mono text-gray-300 uppercase tracking-widest">Deal Scorecard</span>
        </div>
        <div className="flex items-center gap-4">
          <MiniRadar />
          <div className="flex-1 space-y-2">
            <PreviewBar label="Founder" score={7} delay={0} />
            <PreviewBar label="Market" score={5} delay={100} />
            <PreviewBar label="Moat" score={4} delay={200} />
          </div>
        </div>
      </div>

      {/* Card 2: Top Right (Claim Verification) — reacts to drag */}
      <div className={`hidden lg:flex absolute right-[-2%] top-[12%] transition-all duration-700 ease-out shadow-[0_10px_40px_rgba(0,0,0,0.8),_0_0_20px_rgba(113,112,255,0.1)] rounded-xl bg-[#13141a]/90 border border-white/10 p-6 flex-col w-[340px] backdrop-blur-xl ${dragging ? 'rotate-[14deg] opacity-25 scale-90 blur-[2px]' : 'rotate-[8deg] opacity-65 hover:opacity-100 hover:rotate-0 hover:z-50 hover:scale-105 animate-floatSlow'}`}>
        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
          <span className="text-[10px] font-mono text-accent-light uppercase tracking-widest font-semibold">02</span>
          <span className="text-[10px] font-mono text-gray-300 uppercase tracking-widest">Claim Verification</span>
        </div>
        <div className="space-y-3">
          {[
            { claim: '"$4.7B TAM"', verdict: 'INFLATED', color: 'text-verdict-amber-text bg-verdict-amber-bg border-verdict-amber-border' },
            { claim: '"3x growth"', verdict: 'VERIFIED', color: 'text-verdict-green-text bg-verdict-green-bg border-verdict-green-border' }
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between pb-2 border-b border-white/5 last:border-0 last:pb-0">
              <span className="text-[13px] font-sans text-gray-100">{item.claim}</span>
              <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${item.color}`}>
                {item.verdict}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Card 3: Bottom Right (Investor Questions) — reacts to drag */}
      <div className={`hidden lg:flex absolute right-[2%] bottom-[8%] transition-all duration-700 ease-out shadow-[0_10px_40px_rgba(0,0,0,0.8),_0_0_20px_rgba(113,112,255,0.1)] rounded-xl bg-[#13141a]/90 border border-white/10 p-6 flex-col w-[360px] backdrop-blur-xl ${dragging ? '-rotate-[12deg] opacity-30 scale-90 blur-[2px]' : '-rotate-[6deg] opacity-75 hover:opacity-100 hover:rotate-0 hover:z-50 hover:scale-105 animate-floatTilt'}`}>
        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
          <span className="text-[10px] font-mono text-accent-light uppercase tracking-widest font-semibold">03</span>
          <span className="text-[10px] font-mono text-gray-300 uppercase tracking-widest">Investor Questions</span>
        </div>
        <div className="space-y-3">
          {[
            "What's the bottoms-up basis for the $4.7B TAM figure?",
            "Can you share audited financials supporting the 3x growth?",
          ].map((q, i) => (
            <div key={i} className="flex gap-3">
              <span className="text-[10px] font-mono text-accent-light font-bold mt-0.5">{String(i + 1).padStart(2, '0')}</span>
              <p className="text-[13px] font-sans text-gray-100 leading-snug">{q}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── CENTRAL HERO CONTENT ── */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-4xl px-6">
        
        {/* Brand */}
        <div className="mb-6">
          <h1 className="text-2xl font-sans font-semibold tracking-tight text-text-primary">
            Deal<span className="text-accent-light">Lens</span>
          </h1>
        </div>

        {/* Headline */}
        <div className="text-center max-w-3xl mb-12">
          <h2 className="text-5xl md:text-[64px] font-sans font-bold tracking-[-0.02em] text-white leading-[1.05] mb-6">
            Due diligence on any pitch deck,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-light to-white/60">in minutes.</span>
          </h2>
          <p className="text-lg font-sans text-text-secondary leading-relaxed max-w-xl mx-auto">
            DealLens reads, verifies, and scores startup pitch decks using AI — so you walk into every meeting prepared.
          </p>
        </div>

        {/* Animated Stats Row */}
        <div className="flex items-center gap-10 mb-12">
          <div className="text-center">
            <p className="text-3xl font-mono font-semibold text-text-primary">
              <AnimatedNumber target={5} duration={1500} />
            </p>
            <p className="text-[10px] font-mono uppercase tracking-widest text-text-faint mt-1">Dimensions scored</p>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="text-center">
            <p className="text-3xl font-mono font-semibold text-text-primary">
              <AnimatedNumber target={3} duration={1500} />
            </p>
            <p className="text-[10px] font-mono uppercase tracking-widest text-text-faint mt-1">Intel sources</p>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="text-center">
            <p className="text-3xl font-mono font-semibold text-accent-light">
              &lt;<AnimatedNumber target={10} duration={2000} />
            </p>
            <p className="text-[10px] font-mono uppercase tracking-widest text-text-faint mt-1">Minutes</p>
          </div>
        </div>

        {/* Drop zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { 
            e.preventDefault(); 
            setDragging(false); 
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              handleIncomingFile(e.dataTransfer.files[0]);
            }
          }}
          className={`
            w-full max-w-md rounded-2xl border-2 backdrop-blur-md
            flex flex-col items-center justify-center gap-5 py-12 px-8
            transition-all duration-500 ease-out cursor-pointer group z-20 relative
            ${localError 
              ? 'border-verdict-red-border bg-verdict-red-bg/10 shadow-[0_0_30px_rgba(255,77,77,0.15)]' 
              : dragging
                ? 'border-accent bg-accent/15 scale-[1.04] shadow-[0_0_60px_rgba(113,112,255,0.4),_0_0_120px_rgba(113,112,255,0.15)]'
                : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.05] hover:border-white/20 shadow-2xl animate-pulseGlow'
            }
          `}
        >
          {/* Animated Upload Icon */}
          <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 ${
            dragging 
              ? 'bg-accent/30 scale-110 shadow-[0_0_25px_rgba(113,112,255,0.4)]' 
              : 'bg-white/5 group-hover:bg-accent/20'
          }`}>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`w-6 h-6 transition-all duration-500 ${
                dragging ? 'text-accent-light -translate-y-1' : 'text-text-muted group-hover:text-accent-light'
              }`} 
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
            </svg>
          </div>

          <div className="text-center">
            <p className={`text-base font-sans font-medium mb-1 transition-colors duration-300 ${
              dragging ? 'text-accent-light' : 'text-white'
            }`}>
              {localError 
                ? <span className="text-verdict-red-text">{localError}</span> 
                : dragging 
                  ? "Release to analyse" 
                  : "Drop your pitch deck here"
              }
            </p>
            <p className="text-xs font-mono text-gray-400">
              {localError ? "Please try again." : "PDF format · Max 20 MB"}
            </p>
          </div>
          <label className={`cursor-pointer mt-1 transition-all duration-500 ${dragging ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}`}>
            <span className="px-6 py-3 rounded-lg bg-accent hover:bg-accent-hover text-white text-sm font-sans font-semibold transition-all shadow-[0_0_20px_rgba(113,112,255,0.2)] hover:shadow-[0_0_30px_rgba(113,112,255,0.4)] active:scale-95 flex items-center gap-2">
              Upload pitch deck
            </span>
            <input 
              type="file" 
              accept=".pdf" 
              className="hidden" 
              onChange={e => {
                if (e.target.files && e.target.files[0]) {
                  handleIncomingFile(e.target.files[0]);
                }
              }} 
            />
          </label>
        </div>

        {/* Trust signals */}
        <div className="flex items-center justify-center gap-6 mt-6">
          <span className="flex items-center gap-1.5 text-[11px] font-mono text-text-faint">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            Private · never stored
          </span>
          <span className="flex items-center gap-1.5 text-[11px] font-mono text-text-faint">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            AI-verified claims
          </span>
        </div>

      </div>
    </div>
  );
}
