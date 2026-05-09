import React, { useEffect, useLayoutEffect, useMemo, useReducer, useRef, useState } from 'react';

const STEPS = [
  { id: 1, label: 'Extracting claims from deck', short: 'Extract' },
  { id: 2, label: 'Searching market reports', short: 'Search' },
  { id: 3, label: 'Building competitor map', short: 'Competitor Map' },
  { id: 4, label: 'Researching founders', short: 'Research' },
  { id: 5, label: 'Generating investor questions', short: 'Generate' },
];

const INSIGHTS = [
  'Most founders cite total industry size, not their actual addressable market.',
  'Day-30 retention is the single metric that cannot be faked.',
  'A moat that can be copied in 6 months is a feature, not a moat.',
  'Hockey-stick projections without assumptions are always a flag.',
];

const TOTAL_STEPS = 5;

// Scene-space coordinates (px)
// Wider scene and extra right padding prevent step 5 clipping on narrower viewports.
const NODE_X = [210, 520, 830, 1140, 1450];
const NODE_Y = 260;
const SCENE_W = 1720;
const SCENE_H = 460;
const SCENE_SAFE_LEFT = 0;
const SCENE_SAFE_RIGHT = 260;

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(Boolean(media.matches));
    onChange();

    if (media.addEventListener) media.addEventListener('change', onChange);
    else media.addListener(onChange);

    return () => {
      if (media.removeEventListener) media.removeEventListener('change', onChange);
      else media.removeListener(onChange);
    };
  }, []);

  return reduced;
}

function StepMicroAnim({ stepId }) {
  if (stepId === 1) {
    return (
      <div className="relative w-20 h-16 rounded-lg bg-bg-raised/35 border border-white/10 overflow-hidden">
        <div className="absolute inset-0 p-2">
          <div className="h-2 w-11 rounded bg-white/10 mb-2" />
          <div className="h-1.5 w-16 rounded bg-white/10 mb-1.5" />
          <div className="h-1.5 w-14 rounded bg-white/10 mb-1.5" />
          <div className="h-1.5 w-12 rounded bg-white/10" />
        </div>
        <div className="absolute left-2 right-2 top-2 h-4 bg-accent/15 blur-[0.2px] rounded animate-scanY" />
      </div>
    );
  }

  if (stepId === 2) {
    return (
      <div className="relative w-20 h-16 rounded-lg bg-bg-raised/35 border border-white/10 overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 opacity-70">
          <div className="absolute left-3 top-3 w-8 h-8 rounded-full border-2 border-accent/35" />
          <div className="absolute left-[38px] top-[38px] w-6 h-2 bg-accent/35 rotate-45 rounded" />
        </div>
        <div className="flex items-center gap-1.5 mt-8">
          {[0, 1, 2].map(i => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-accent-light/80 animate-dotPulse"
              style={{ animationDelay: `${i * 120}ms` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (stepId === 3) {
    return (
      <div className="relative w-20 h-16 rounded-lg bg-bg-raised/35 border border-white/10 overflow-hidden flex items-center justify-center">
        <svg width="72" height="44" viewBox="0 0 72 44" className="opacity-90">
          <path d="M10 30 L26 16 L44 26 L62 12" stroke="rgba(255,255,255,0.20)" strokeWidth="2" fill="none" />
          <circle cx="10" cy="30" r="4" fill="rgba(255,255,255,0.16)" stroke="rgba(255,255,255,0.25)" />
          <circle cx="26" cy="16" r="4" fill="rgba(255,255,255,0.16)" stroke="rgba(255,255,255,0.25)" />
          <circle cx="44" cy="26" r="4" fill="rgba(255,255,255,0.16)" stroke="rgba(255,255,255,0.25)" />
          <circle cx="62" cy="12" r="4" fill="rgba(255,255,255,0.16)" stroke="rgba(255,255,255,0.25)" />
        </svg>
        <div className="absolute left-[10px] top-[28px] w-2 h-2 rounded-full bg-accent-light animate-travelX" />
      </div>
    );
  }

  if (stepId === 4) {
    return (
      <div className="relative w-20 h-16 rounded-lg bg-bg-raised/35 border border-white/10 overflow-hidden p-2">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-full bg-white/10 border border-white/10" />
          <div className="h-2 w-9 rounded bg-white/10" />
        </div>
        <div className="space-y-1.5">
          <div className="h-1.5 w-full rounded bg-gradient-to-r from-white/5 via-white/15 to-white/5 bg-[length:200%_100%] animate-revealWipe" />
          <div
            className="h-1.5 w-5/6 rounded bg-gradient-to-r from-white/5 via-white/15 to-white/5 bg-[length:200%_100%] animate-revealWipe"
            style={{ animationDelay: '120ms' }}
          />
          <div
            className="h-1.5 w-2/3 rounded bg-gradient-to-r from-white/5 via-white/15 to-white/5 bg-[length:200%_100%] animate-revealWipe"
            style={{ animationDelay: '240ms' }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-20 h-16 rounded-lg bg-bg-raised/35 border border-white/10 overflow-hidden flex items-center justify-center">
      <div className="absolute top-3 left-3 right-3 bottom-7 rounded-lg border border-white/10 bg-white/5" />
      <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-1.5">
        {[0, 1, 2].map(i => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-white/40 animate-dotPulse"
            style={{ animationDelay: `${i * 140}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

function TypewriterText({ text, start = true, minDurationMs = 900, maxDurationMs = 1400 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const full = String(text || '');
    if (!start || !full) return;

    // Keep it readable: duration grows with length but is clamped.
    const duration = clamp(full.length * 26, minDurationMs, maxDurationMs);
    const stepMs = Math.max(14, Math.floor(duration / full.length));

    let i = 0;
    const t = setInterval(() => {
      i += 1;
      setCount(i);
      if (i >= full.length) clearInterval(t);
    }, stepMs);

    return () => clearInterval(t);
  }, [text, start, minDurationMs, maxDurationMs]);

  const shown = String(text || '').slice(0, count);

  return (
    <span className="relative">
      {shown}
      {start && count < String(text || '').length && (
        <span className="inline-block w-[8px] translate-y-[1px] ml-0.5 opacity-70 animate-caretBlink">|</span>
      )}
    </span>
  );
}

const INITIAL_MACHINE = {
  mode: 'demo',
  targetStep: 1,
  displayStep: 1,
  phase: 'intro', // intro | card_open | card_close | travel | settle | outro
  cardStep: 1,
};

function loadingReducer(state, action) {
  switch (action.type) {
    case 'SET_LIVE_TARGET': {
      if (action.step <= 1) return state;
      if (state.mode === 'live' && state.targetStep === action.step) return state;
      return {
        ...state,
        mode: 'live',
        targetStep: action.step,
      };
    }

    case 'BEGIN_INTRO_FOCUS':
      if (state.phase !== 'intro') return state;
      return {
        ...state,
        displayStep: 1,
        phase: 'settle',
      };

    case 'OPEN_CARD':
      if (state.phase === 'card_open') return state;
      return {
        ...state,
        phase: 'card_open',
        cardStep: state.displayStep,
      };

    case 'SET_TARGET_AND_CLOSE':
      return {
        ...state,
        targetStep: action.step,
        phase: 'card_close',
      };

    case 'CLOSE_CARD':
      if (state.phase !== 'card_open') return state;
      return {
        ...state,
        phase: 'card_close',
      };

    case 'BEGIN_TRAVEL':
      return {
        ...state,
        phase: 'travel',
        displayStep: state.targetStep,
      };

    case 'FINISH_TRAVEL':
      if (state.phase !== 'travel') return state;
      return {
        ...state,
        phase: 'settle',
      };

    case 'START_OUTRO':
      return {
        ...state,
        phase: 'outro',
      };

    case 'RESET_DEMO':
      return INITIAL_MACHINE;

    case 'JUMP_REDUCED': {
      if (
        state.mode === action.mode &&
        state.targetStep === action.step &&
        state.displayStep === action.step &&
        state.phase === 'card_open' &&
        state.cardStep === action.step
      ) {
        return state;
      }

      return {
        mode: action.mode,
        targetStep: action.step,
        displayStep: action.step,
        phase: 'card_open',
        cardStep: action.step,
      };
    }

    default:
      return state;
  }
}

export default function LoadingPage({ currentStep }) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const viewportRef = useRef(null);

  const [viewport, setViewport] = useState({ w: 0, h: 0 });
  const [insightIndex, setInsightIndex] = useState(0);
  const [machine, dispatch] = useReducer(loadingReducer, INITIAL_MACHINE);

  const externalStep = clamp(Number(currentStep || 1), 1, TOTAL_STEPS);
  const cardVisible = machine.phase === 'card_open';
  const typeOn = machine.phase === 'card_open';
  const step = clamp(machine.targetStep, 1, TOTAL_STEPS);
  const pct = Math.round((Math.min(machine.targetStep, TOTAL_STEPS) / TOTAL_STEPS) * 100);
  const activeStepLabel = STEPS[step - 1]?.label ?? 'Running analysis';
  const showFiveAgentDone = step === TOTAL_STEPS;

  useEffect(() => {
    const interval = setInterval(() => {
      setInsightIndex(prev => (prev + 1) % INSIGHTS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (externalStep > 1) {
      dispatch({ type: 'SET_LIVE_TARGET', step: externalStep });
    }
  }, [externalStep]);

  // Seed viewport size immediately (so camera math never gets stuck at scale 1),
  // then keep it updated via ResizeObserver.
  useLayoutEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const seed = () => {
      const rect = el.getBoundingClientRect();
      const w = rect.width || 900;
      const h = rect.height || 460;
      setViewport({ w, h });
    };
    const raf = requestAnimationFrame(seed);

    if (typeof ResizeObserver === 'undefined') {
      return () => cancelAnimationFrame(raf);
    }

    const ro = new ResizeObserver(entries => {
      const rect = entries[0]?.contentRect;
      if (!rect) return;
      setViewport({ w: rect.width || 900, h: rect.height || 460 });
    });
    ro.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  const camera = useMemo(() => {
    const w = viewport.w || 900;
    const h = viewport.h || 460;
    const isFinalFrame =
      machine.displayStep === TOTAL_STEPS &&
      ['card_open', 'card_close', 'settle', 'outro'].includes(machine.phase);

    const scaleOverview = 1.0;
    const scaleStep = isFinalFrame ? 1.03 : 1.58;
    const scaleTravel = 1.3;

    const midX = (NODE_X[0] + NODE_X[4]) / 2;
    // During the final stage, center the whole pipeline so all 5 stages are visible.
    const focusX = isFinalFrame ? w * 0.5 : w * 0.5;
    const focusY = h * 0.64;
    const phaseLocal = prefersReducedMotion ? 'overview' : machine.phase;

    const scale =
      phaseLocal === 'overview' ? scaleOverview :
      phaseLocal === 'travel' ? scaleTravel :
      phaseLocal === 'outro' ? scaleOverview :
      scaleStep;

    const nodeX =
      (phaseLocal === 'overview' || phaseLocal === 'outro' || isFinalFrame) ? midX : NODE_X[machine.displayStep - 1];
    const nodeY = NODE_Y;

    const rawTx = focusX / scale - nodeX;
    const ty = focusY / scale - nodeY;
    const minBoundTx = SCENE_SAFE_LEFT;
    const maxBoundTx = (w / scale) - (SCENE_W + SCENE_SAFE_RIGHT);
    const tx = clamp(rawTx, maxBoundTx, minBoundTx);

    const rotateY = phaseLocal === 'travel' ? '-3deg' : '0deg';

    const transition =
      prefersReducedMotion ? 'none' :
      phaseLocal === 'settle' ? 'transform 200ms cubic-bezier(0.2, 0.9, 0.2, 1)' :
      phaseLocal === 'travel' ? 'transform 900ms cubic-bezier(0.18, 0.86, 0.22, 1)' :
      phaseLocal === 'intro' ? 'transform 900ms cubic-bezier(0.18, 0.86, 0.22, 1)' :
      phaseLocal === 'outro' ? 'transform 1500ms cubic-bezier(0.2, 0.85, 0.2, 1)' :
      'transform 900ms cubic-bezier(0.18, 0.86, 0.22, 1)';

    return { tx, ty, scale, rotateY, transition };
  }, [viewport.w, viewport.h, machine.displayStep, machine.phase, prefersReducedMotion]);

  useEffect(() => {
    if (!prefersReducedMotion) return () => {};

    dispatch({
      type: 'JUMP_REDUCED',
      step,
      mode: machine.mode,
    });

    return () => {};
  }, [prefersReducedMotion, step, machine.mode]);

  useEffect(() => {
    if (prefersReducedMotion) return () => {};

    let timer;

    switch (machine.phase) {
      case 'intro':
        timer = setTimeout(() => {
          dispatch({ type: 'BEGIN_INTRO_FOCUS' });
        }, 220);
        break;

      case 'settle':
        timer = setTimeout(() => {
          dispatch({ type: 'OPEN_CARD' });
        }, 180);
        break;

      case 'card_open':
        if (machine.mode === 'demo') {
          if (machine.displayStep < TOTAL_STEPS) {
            timer = setTimeout(() => {
              dispatch({
                type: 'SET_TARGET_AND_CLOSE',
                step: machine.displayStep + 1,
              });
            }, 1500);
          } else {
            timer = setTimeout(() => {
              dispatch({ type: 'CLOSE_CARD' });
            }, 1300);
          }
        } else if (machine.targetStep !== machine.displayStep) {
          timer = setTimeout(() => {
            dispatch({ type: 'CLOSE_CARD' });
          }, 60);
        } else if (machine.displayStep === TOTAL_STEPS) {
          timer = setTimeout(() => {
            dispatch({ type: 'CLOSE_CARD' });
          }, 1250);
        }
        break;

      case 'card_close':
        if (machine.targetStep !== machine.displayStep) {
          timer = setTimeout(() => {
            dispatch({ type: 'BEGIN_TRAVEL' });
          }, 260);
        } else if (machine.displayStep === TOTAL_STEPS) {
          timer = setTimeout(() => {
            dispatch({ type: 'START_OUTRO' });
          }, 260);
        }
        break;

      case 'travel':
        timer = setTimeout(() => {
          dispatch({ type: 'FINISH_TRAVEL' });
        }, 900);
        break;

      case 'outro':
        if (machine.mode === 'demo') {
          timer = setTimeout(() => {
            dispatch({ type: 'RESET_DEMO' });
          }, 1650);
        }
        break;

      default:
        break;
    }

    return () => clearTimeout(timer);
  }, [machine, prefersReducedMotion]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden bg-bg-base">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[620px] h-[620px] bg-accent/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="w-full max-w-[1400px] relative z-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 mb-3 animate-pulse">
            <svg className="w-5 h-5 text-accent-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <h2 className="text-2xl font-sans font-semibold text-text-primary tracking-tight">Analysing Pitch Deck</h2>
          <p className="text-sm font-mono text-text-faint">Running multi-source intelligence pipeline...</p>
        </div>

        <div
          ref={viewportRef}
          className="w-full h-[460px] rounded-3xl bg-gradient-to-b from-bg-surface/30 via-bg-panel/20 to-bg-base/40 border border-white/[0.06] shadow-card overflow-hidden relative"
        >
          {/* Atmosphere layer */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-28 left-10 w-[520px] h-[520px] bg-accent/10 blur-[120px] rounded-full" />
            <div className="absolute -bottom-40 right-[-80px] w-[640px] h-[640px] bg-verdict-blue-text/10 blur-[150px] rounded-full" />
            <div className="absolute inset-0 bg-[radial-gradient(60%_55%_at_50%_55%,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.02)_38%,rgba(0,0,0,0)_70%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_40%,rgba(0,0,0,0)_0%,rgba(0,0,0,0.45)_78%,rgba(0,0,0,0.70)_100%)]" />
          </div>

          <div className="absolute top-5 right-5 z-20 flex items-center gap-3">
            <div className="px-3 py-2 rounded-xl bg-bg-panel/70 border border-white/[0.08] backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
              <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-text-faint">Progress</span>
              <div className="mt-0.5 flex items-end gap-1">
                <span className="text-2xl font-mono font-semibold text-text-primary tabular-nums">{pct}</span>
                <span className="text-sm font-mono text-text-faint mb-0.5">%</span>
              </div>
            </div>
          </div>

          <div
            className="absolute left-0 top-0 will-change-transform transform-gpu"
            style={{
              width: `${SCENE_W}px`,
              height: `${SCENE_H}px`,
              transformOrigin: '0 0',
              transform: `perspective(1100px) translate3d(${camera.tx}px, ${camera.ty}px, 0) scale(${camera.scale}) rotateY(${camera.rotateY})`,
              transition: camera.transition,
            }}
          >
            <svg width={SCENE_W} height={SCENE_H} viewBox={`0 0 ${SCENE_W} ${SCENE_H}`} className="absolute inset-0">
              <defs>
                <linearGradient id="pipelineActive" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="rgba(113,112,255,0.42)" />
                  <stop offset="35%" stopColor="rgba(138,156,255,0.95)" />
                  <stop offset="100%" stopColor="rgba(94,106,210,0.88)" />
                </linearGradient>
                <filter id="pipelineGlow" x="-30%" y="-200%" width="160%" height="520%">
                  <feGaussianBlur stdDeviation="3.5" result="blur" />
                  <feColorMatrix
                    in="blur"
                    type="matrix"
                    values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.55 0"
                    result="glow"
                  />
                  <feMerge>
                    <feMergeNode in="glow" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <line x1={NODE_X[0]} y1={NODE_Y} x2={NODE_X[4]} y2={NODE_Y} stroke="rgba(255,255,255,0.10)" strokeWidth="4" strokeLinecap="round" />
              <line
                x1={NODE_X[0]}
                y1={NODE_Y}
                x2={machine.displayStep === 1 ? NODE_X[0] + 10 : NODE_X[machine.displayStep - 1] - 8}
                y2={NODE_Y}
                stroke="url(#pipelineActive)"
                strokeWidth="3.25"
                strokeLinecap="round"
                filter="url(#pipelineGlow)"
                style={{ transition: prefersReducedMotion ? 'none' : 'all 700ms ease-out' }}
              />
            </svg>

            {STEPS.map((s, i) => {
              const idx = i + 1;
              const status = idx < machine.displayStep ? 'done' : idx === machine.displayStep ? 'active' : 'pending';
              const left = NODE_X[i] - 22;
              const top = NODE_Y - 22;
              const labelTransform = idx === TOTAL_STEPS ? 'translateX(-90%)' : 'translateX(-50%)';
              const labelWidth = idx === TOTAL_STEPS ? '150px' : '190px';

              const ring =
                status === 'done'
                  ? 'border-verdict-green-border bg-verdict-green-bg/20 shadow-[0_0_0_1px_rgba(42,194,106,0.06)]'
                  : status === 'active'
                  ? 'border-accent/70 bg-accent/12 shadow-[0_0_0_1px_rgba(113,112,255,0.14),0_0_26px_rgba(113,112,255,0.16)]'
                  : 'border-white/12 bg-white/5';

              const inner =
                status === 'done'
                  ? 'text-verdict-green-text'
                  : status === 'active'
                  ? 'text-accent-light'
                  : 'text-text-faint';

              return (
                <div key={s.id} className="absolute" style={{ left: `${left}px`, top: `${top}px` }}>
                  {status === 'active' && !prefersReducedMotion && (
                    <div className="absolute inset-0 -m-3 rounded-full border border-accent/35 animate-ping" />
                  )}
                  <div className={`w-11 h-11 rounded-full border flex items-center justify-center ${ring}`}>
                    <span className={`text-sm font-mono font-semibold ${inner}`}>{idx}</span>
                  </div>
                  <div
                    className="absolute top-[52px] w-[190px] text-center"
                    style={{ left: '50%', transform: labelTransform, width: labelWidth }}
                  >
                    <p className={`text-[10px] font-mono uppercase tracking-[0.08em] ${
                      status === 'active' ? 'text-text-primary' : status === 'done' ? 'text-text-muted' : 'text-text-faint'
                    }`}>
                      {s.short}
                    </p>
                  </div>
                </div>
              );
            })}

            <div
              className={`absolute w-2.5 h-2.5 rounded-full bg-gradient-to-br from-white/80 via-accent-light/90 to-accent/90 shadow-[0_0_22px_rgba(113,112,255,0.45)] ${
                prefersReducedMotion ? '' : 'animate-bob'
              }`}
              style={{
                left: `${NODE_X[machine.displayStep - 1] - 5}px`,
                top: `${NODE_Y - 40}px`,
                transition: prefersReducedMotion
                  ? 'none'
                  : 'left 900ms cubic-bezier(0.18, 0.86, 0.22, 1), top 900ms cubic-bezier(0.18, 0.86, 0.22, 1)',
              }}
            />

          </div>

          {/* Big HUD card overlay (never clipped by camera transforms) */}
          <div className="absolute left-0 right-0 top-5 z-30 flex justify-center pointer-events-none">
            <div
              key={`${machine.cardStep}-${machine.phase}`}
              className={`pointer-events-none w-[min(92vw,460px)] rounded-2xl shadow-[0_18px_70px_rgba(0,0,0,0.55)] bg-gradient-to-b from-bg-surface/90 to-bg-panel/80 border border-white/[0.10] backdrop-blur-xl overflow-hidden transition-all duration-300 ease-out ${
                cardVisible
                  ? 'opacity-100 translate-y-0 scale-100'
                  : 'opacity-0 translate-y-2 scale-[0.985]'
              }`}
              style={{
                transitionProperty: 'opacity, transform',
              }}
            >
              <div className="h-px w-full bg-gradient-to-r from-transparent via-accent-light/60 to-transparent" />
              <div className="p-4 flex items-start gap-4">
                <div className="flex-shrink-0 mt-0.5">
                  <StepMicroAnim stepId={machine.cardStep} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-mono uppercase tracking-[0.14em] text-accent-light mb-1">
                    Step {machine.cardStep} of {TOTAL_STEPS}
                  </p>
                  <p className="text-base font-sans font-semibold text-text-primary leading-snug">
                    {STEPS[machine.cardStep - 1]?.label}
                  </p>
                  <p className="text-sm font-sans text-text-secondary leading-relaxed mt-2">
                    <TypewriterText
                      key={`${machine.cardStep}-${machine.phase}`}
                      start={typeOn && cardVisible}
                      text={
                        machine.cardStep === 1 ? 'Parsing the deck and extracting verifiable claims.' :
                        machine.cardStep === 2 ? 'Pulling market evidence from trusted web sources.' :
                        machine.cardStep === 3 ? 'Building a competitor map from incumbents and funded rivals.' :
                        machine.cardStep === 4 ? 'Building a founder brief from public footprint signals.' :
                        'Synthesizing red flags into sharp investor questions.'
                      }
                    />
                  </p>
                </div>
              </div>
              <div className="h-px w-full bg-white/[0.07]" />
              <div className="px-4 py-3 flex items-center justify-between bg-white/[0.02]">
                <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-text-faint">Now running</span>
                <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-text-muted">{STEPS[machine.cardStep - 1]?.short}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-bg-panel/45 backdrop-blur-sm px-4 py-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-mono uppercase tracking-[0.14em] text-text-faint">Current Stage</p>
            <p className="text-sm font-sans text-text-primary truncate">{activeStepLabel}</p>
            {showFiveAgentDone && (
              <p className="text-[11px] font-mono text-verdict-green-text mt-1">
                All 5 agent analyses completed.
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {STEPS.map((s) => {
              const done = s.id < step;
              const active = s.id === step;
              return (
                <span
                  key={s.id}
                  className={`w-2 h-2 rounded-full ${
                    done ? 'bg-verdict-green-text' : active ? 'bg-accent-light shadow-[0_0_8px_rgba(113,112,255,0.7)]' : 'bg-white/20'
                  }`}
                  title={s.label}
                />
              );
            })}
          </div>
        </div>

        <div className="pt-1">
          <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-text-muted mb-3 text-center">
            Analyst Insight
          </p>
          <div className="h-16 relative flex justify-center">
            {INSIGHTS.map((insight, idx) => (
              <p
                key={idx}
                className={`text-[13px] font-sans text-text-secondary text-center italic max-w-md absolute transition-all duration-700 ease-in-out ${
                  idx === insightIndex ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
                }`}
              >
                "{insight}"
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
