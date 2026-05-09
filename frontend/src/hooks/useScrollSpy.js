import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook to highlight the active section in the sidebar as the user scrolls.
 * Uses IntersectionObserver to detect which section is currently mostly visible.
 */
export function useScrollSpy(sectionIds, offset = 100) {
  const [activeSection, setActiveSection] = useState(sectionIds[0] || '');
  const observer = useRef(null);

  useEffect(() => {
    // If no sections are defined, do nothing
    if (!sectionIds || sectionIds.length === 0) return;

    // Disconnect previous observer
    if (observer.current) {
      observer.current.disconnect();
    }

    // Configure the observer
    observer.current = new IntersectionObserver(
      (entries) => {
        // Find all intersecting entries
        const intersectingEntries = entries.filter(entry => entry.isIntersecting);
        
        if (intersectingEntries.length > 0) {
          // If multiple sections are visible, sort by which takes up the most screen real estate
          // or just pick the first one. For simple scroll spy, usually the one with the 
          // largest intersection ratio is the "active" one.
          intersectingEntries.sort((a, b) => b.intersectionRatio - a.intersectionRatio);
          setActiveSection(intersectingEntries[0].target.id);
        }
      },
      {
        root: null, // Use the viewport
        rootMargin: `-${offset}px 0px -40% 0px`, // Adjust active window to the top half of the screen
        threshold: [0, 0.25, 0.5, 0.75, 1.0], // Trigger at multiple visibility thresholds
      }
    );

    // Observe all section elements
    sectionIds.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        observer.current.observe(element);
      }
    });

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [sectionIds, offset]);

  return activeSection;
}
