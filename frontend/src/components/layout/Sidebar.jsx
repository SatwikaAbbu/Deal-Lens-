import React from 'react';

/**
 * Main navigation sidebar.
 * Clean, professional — no gimmicks.
 */
const NAV_ITEMS = [
  { id: 'scorecard',   label: 'Deal Scorecard',     eyebrow: '01' },
  { id: 'founder',     label: 'Founder Card',       eyebrow: '02' },
  { id: 'claims',      label: 'Claim Verification', eyebrow: '03' },
  { id: 'competitors', label: 'Competitor Map',     eyebrow: '04' },
  { id: 'questions',   label: 'Investor Questions', eyebrow: '05' },
];

export default function Sidebar({ active, onNavigate, filename = 'deck.pdf' }) {
  return (
    <aside className="fixed left-0 top-0 h-full w-56 glass-panel flex flex-col z-40">
      {/* Brand */}
      <div className="px-5 py-4 border-b border-white/5">
        <span className="text-base font-sans font-semibold text-text-primary">
          Deal<span className="text-accent-light">Lens</span>
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-2 py-4 space-y-0.5">
        {NAV_ITEMS.map(item => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left
                transition-colors duration-100
                ${isActive
                  ? 'bg-bg-raised text-text-primary border-l-2 border-accent-light'
                  : 'text-text-muted hover:bg-bg-raised hover:text-text-secondary border-l-2 border-transparent'
                }
              `}
            >
              <span className="text-[10px] font-mono text-text-faint w-4">{item.eyebrow}</span>
              <span className="text-sm font-sans font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-white/5">
        <p className="text-xs font-mono text-text-faint truncate">{filename}</p>
        <p className="text-[10px] font-mono text-text-faint mt-0.5">Analysed just now</p>
      </div>
    </aside>
  );
}
