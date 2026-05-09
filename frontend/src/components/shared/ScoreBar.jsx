import React, { useState, useEffect } from 'react';

/**
 * Score bar with animated fill. Colour derived from score value.
 * 7–10 → green, 4–6 → amber, 1–3 → red
 */
export default function ScoreBar({ label, score, maxScore = 10, delay = 0 }) {
  const [width, setWidth] = useState(0);
  const pct = (score / maxScore) * 100;

  useEffect(() => {
    const timer = setTimeout(() => {
      setWidth(pct);
    }, delay);
    return () => clearTimeout(timer);
  }, [pct, delay]);

  const colour =
    score >= 7 ? 'bg-verdict-green-bar'  :
    score >= 4 ? 'bg-verdict-amber-bar'  :
                 'bg-verdict-red-bar';

  const textColour =
    score >= 7 ? 'text-verdict-green-text'  :
    score >= 4 ? 'text-verdict-amber-text'  :
                 'text-verdict-red-text';

  const bgTint =
    score >= 7 ? 'bg-verdict-green-bg/30'  :
    score >= 4 ? 'bg-verdict-amber-bg/30'  :
                 'bg-verdict-red-bg/30';

  return (
    <div className={`flex items-center gap-4 rounded-lg px-4 py-3 ${bgTint} border border-white/[0.03]`}>
      {/* Label */}
      <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-text-muted w-40 flex-shrink-0">
        {label}
      </span>
      {/* Track */}
      <div className="flex-1 h-2.5 rounded-full bg-score-track overflow-hidden">
        {/* Fill */}
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${colour}`}
          style={{ width: `${width}%` }}
        />
      </div>
      {/* Score Value */}
      <span className={`font-mono font-bold text-base tabular-nums w-12 text-right ${textColour}`}>
        {score}<span className="text-text-faint text-xs font-normal">/{maxScore}</span>
      </span>
    </div>
  );
}
