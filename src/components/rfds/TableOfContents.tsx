/**
 * Table of Contents - Design System Component
 * Auto-generates navigation from page sections with active tracking
 */

'use client';

import { useEffect, useState } from 'react';

export interface TOCSection {
  id: string;
  title: string;
  level: 1 | 2 | 3;
}

interface TableOfContentsProps {
  sections: TOCSection[];
  title?: string;
}

export function TableOfContents({ sections, title = "On this page" }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    // Observe section visibility for active tracking
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-100px 0px -66%',
        threshold: 0,
      }
    );

    // Observe all sections
    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [sections]);

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -80; // Offset for fixed header
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <nav className="lg:sticky lg:top-24 space-y-3">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <ul className="space-y-2 border-l-2 border-border">
        {sections.map((section) => {
          const isActive = activeId === section.id;
          return (
            <li
              key={section.id}
              className={`${
                section.level === 1
                  ? 'pl-4'
                  : section.level === 2
                  ? 'pl-6'
                  : 'pl-8'
              }`}
            >
              <button
                onClick={() => handleClick(section.id)}
                className={`text-left text-sm transition-colors ${
                  isActive
                    ? 'font-medium text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
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
