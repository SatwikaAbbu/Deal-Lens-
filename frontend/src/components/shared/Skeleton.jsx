import React from 'react';

/**
 * Reusable loader for the application with a shimmer animation.
 */
export default function Skeleton({ className = "" }) {
  return (
    <div className={`
      animate-pulse rounded bg-gradient-to-r
      from-bg-raised via-bg-surface to-bg-raised
      bg-[length:200%_100%] animate-shimmer
      ${className}
    `} />
  );
}
