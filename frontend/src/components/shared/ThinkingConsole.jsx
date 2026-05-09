import React, { useState, useEffect } from 'react';

const THOUGHTS = [
  'Parsing pitch deck structure...',
  'Extracting founder background...',
  'Cross-referencing market data...',
  'Verifying financial claims...',
  'Searching Crunchbase for competitors...',
  'Analysing moats and barriers...',
  'Generating investor questions...',
  'Finalising deal scorecard...',
  'Intelligence sync complete.',
];

/**
 * Animated "Thinking" console that simulates AI background work.
 * Adds a sense of "Live Intelligence" to the UI.
 */
export default function ThinkingConsole() {
  const [index, setIndex] = useState(0);
  const [dots, setDots] = useState('');

  useEffect(() => {
    const thoughtInterval = setInterval(() => {
      setIndex((prev) => (prev + 1) % THOUGHTS.length);
    }, 4000);

    const dotsInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);

    return () => {
      clearInterval(thoughtInterval);
      clearInterval(dotsInterval);
    };
  }, []);

  return (
    <div className="px-5 py-4 border-t border-white/5 bg-black/20">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-1.5 h-1.5 rounded-full bg-accent-light animate-pulse" />
        <span className="text-[10px] font-mono font-medium uppercase tracking-[0.2em] text-text-faint">
          Live Intelligence
        </span>
      </div>
      <div className="font-mono text-[10px] text-accent-light/70 leading-relaxed min-h-[2.5em]">
        <span className="text-text-faint mr-1">{'>'}</span>
        {THOUGHTS[index]}
        <span className="inline-block w-2">{dots}</span>
      </div>
    </div>
  );
}
