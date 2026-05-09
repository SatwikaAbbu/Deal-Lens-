import React, { useEffect, useRef, useState } from 'react';

/**
 * Report section card — wraps an entire report module.
 * Uses shadow-card technique per design.md §5.
 * Now includes a subtle scroll-reveal entrance animation.
 */
export default function ReportCard({ eyebrow, title, children }) {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={cardRef}
      className={`shadow-card rounded-xl bg-bg-surface transition-all duration-700 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      {/* Card header */}
      <div className="px-5 py-4 border-b border-white/5">
        {eyebrow && (
          <p className="text-[10px] font-mono font-medium uppercase tracking-[0.14em] text-accent-light mb-1">
            {eyebrow}
          </p>
        )}
        <h2 className="text-base font-sans font-semibold text-text-primary">
          {title}
        </h2>
      </div>
      {/* Card body */}
      <div className="p-5">
        {children}
      </div>
    </div>
  );
}
