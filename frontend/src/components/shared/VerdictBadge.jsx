import React from 'react';

/**
 * Verdict badge with semantic colours.
 * Maps verdict strings from the API to the design system palette.
 */
const VARIANTS = {
  verified:        { bg: 'bg-verdict-green-bg',  text: 'text-verdict-green-text',  border: 'border-verdict-green-border',  shadow: 'shadow-[0_0_10px_rgba(42,194,106,0.2)]',  label: 'Verified'        },
  strong:          { bg: 'bg-verdict-green-bg',  text: 'text-verdict-green-text',  border: 'border-verdict-green-border',  shadow: 'shadow-[0_0_10px_rgba(42,194,106,0.2)]',  label: 'Strong'          },
  inflated:        { bg: 'bg-verdict-amber-bg',  text: 'text-verdict-amber-text',  border: 'border-verdict-amber-border',  shadow: 'shadow-[0_0_10px_rgba(217,145,21,0.2)]',  label: 'Inflated'        },
  weak:            { bg: 'bg-verdict-amber-bg',  text: 'text-verdict-amber-text',  border: 'border-verdict-amber-border',  shadow: 'shadow-[0_0_10px_rgba(217,145,21,0.2)]',  label: 'Weak'            },
  unsubstantiated: { bg: 'bg-verdict-red-bg',    text: 'text-verdict-red-text',    border: 'border-verdict-red-border',    shadow: 'shadow-[0_0_10px_rgba(255,85,85,0.2)]',   label: 'Unsubstantiated' },
  partial:         { bg: 'bg-verdict-blue-bg',   text: 'text-verdict-blue-text',   border: 'border-verdict-blue-border',   shadow: 'shadow-[0_0_10px_rgba(85,170,255,0.2)]',  label: 'Partial'         },
};

export default function VerdictBadge({ verdict }) {
  const key = verdict?.toLowerCase() || 'partial';
  const v = VARIANTS[key] || VARIANTS.partial;
  return (
    <span className={`
      inline-flex items-center px-2.5 py-1 rounded-sm
      text-[10px] font-mono font-bold uppercase tracking-widest
      border ${v.bg} ${v.text} ${v.border} ${v.shadow}
      backdrop-blur-sm shadow-sm
    `}>
      {v.label}
    </span>
  );
}
