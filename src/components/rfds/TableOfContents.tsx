/**
 * Table of Contents - Design System Component
 * Auto-generates navigation from page sections with active tracking
 *
 * Features:
 * - Sticky positioning with scroll tracking
 * - Intersection Observer for active section detection
 * - Smooth scroll navigation
 * - Keyboard accessible
 * - Semantic theming
 * - Visual active indicator
 * - Support for 3 heading levels
 */

'use client';

import { useEffect, useState, useCallback } from 'react';

export interface TOCSection {
  id: string;
  title: string;
  level: 1 | 2 | 3;
}

interface TableOfContentsProps {
  sections: TOCSection[];
  title?: string;
  className?: string;
}

export function TableOfContents({
  sections,
  title = "On this page",
  className = ""
}: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    // Track which sections are currently visible
    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      // Find all intersecting entries
      const intersectingEntries = entries.filter(entry => entry.isIntersecting);

      if (intersectingEntries.length > 0) {
        // Find the entry closest to the top of the viewport
        const topEntry = intersectingEntries.reduce((closest, entry) => {
          const closestTop = Math.abs(closest.boundingClientRect.top);
          const entryTop = Math.abs(entry.boundingClientRect.top);
          return entryTop < closestTop ? entry : closest;
        });

        setActiveId(topEntry.target.id);
      }
    };

    const observer = new IntersectionObserver(observerCallback, {
      // Trigger when section enters top 20% of viewport
      rootMargin: '-20% 0px -70% 0px',
      threshold: [0, 0.25, 0.5, 0.75, 1],
    });

    // Observe all sections
    const elements = sections
      .map((section) => document.getElementById(section.id))
      .filter((el): el is HTMLElement => el !== null);

    elements.forEach((element) => observer.observe(element));

    // Set initial active section
    if (elements.length > 0 && !activeId) {
      setActiveId(elements[0].id);
    }

    return () => observer.disconnect();
  }, [sections, activeId]);

  const handleClick = useCallback((id: string, event: React.MouseEvent | React.KeyboardEvent) => {
    event.preventDefault();

    const element = document.getElementById(id);
    if (element) {
      // Offset for fixed header
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });

      // Update active state immediately for better UX
      setActiveId(id);

      // Update URL hash without jumping
      history.replaceState(null, '', `#${id}`);
    }
  }, []);

  const handleKeyDown = useCallback((id: string, event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      handleClick(id, event);
    }
  }, [handleClick]);

  if (sections.length === 0) {
    return null;
  }

  return (
    <nav
      className={`sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto space-y-3 ${className}`}
      aria-label="Table of contents"
    >
      <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
        {title}
      </h3>
      <ul className="space-y-1 border-l-2 border-border relative">
        {/* Active indicator bar */}
        {activeId && (
          <div
            className="absolute left-0 w-0.5 bg-primary transition-all duration-300 ease-out"
            style={{
              top: `${sections.findIndex(s => s.id === activeId) * 32}px`,
              height: '32px'
            }}
            aria-hidden="true"
          />
        )}

        {sections.map((section) => {
          const isActive = activeId === section.id;
          const paddingLeft = section.level === 1
            ? 'pl-4'
            : section.level === 2
            ? 'pl-6'
            : 'pl-8';

          return (
            <li
              key={section.id}
              className={paddingLeft}
            >
              <button
                onClick={(e) => handleClick(section.id, e)}
                onKeyDown={(e) => handleKeyDown(section.id, e)}
                aria-current={isActive ? 'location' : undefined}
                className={`
                  w-full text-left text-sm py-1.5 transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background
                  rounded-sm -ml-1 pl-1
                  ${isActive
                    ? 'font-semibold text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                  }
                `}
              >
                {section.title}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
