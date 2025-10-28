/**
 * Table of Contents - Design System Component
 * Based on reference implementation with proper sticky behavior
 *
 * Features:
 * - Auto-detects headings from content
 * - Sticky positioning that actually works
 * - Scroll spy with IntersectionObserver
 * - Smooth scroll navigation
 * - Mobile support with collapsible drawer
 * - Semantic theming
 */

'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ListTree, ChevronRight, Search, PanelRightOpen, PanelRightClose, ArrowUp } from 'lucide-react';

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

/** Utility: class name merger */
function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(' ');
}

/** Hook: observe headings and return the ID of the currently active one */
function useScrollSpy(ids: string[], rootMargin = '-40% 0px -55% 0px') {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (!ids.length) return;
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        } else {
          // Fallback: choose the one nearest to top
          const above = entries
            .map((e) => e.target)
            .filter((el) => el.getBoundingClientRect().top <= 100)
            .sort((a, b) => b.getBoundingClientRect().top - a.getBoundingClientRect().top);
          if (above[0]) setActiveId(above[0].id);
        }
      },
      { rootMargin, threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ids, rootMargin]);

  return activeId;
}

function TOCInner({
  title,
  headings,
  activeId,
  onItemClick,
  setQuery,
  query,
}: {
  title: string;
  headings: TOCSection[];
  activeId: string | null;
  onItemClick: (id: string) => void;
  setQuery?: (q: string) => void;
  query?: string;
}) {
  return (
    <div className="relative">
      {/* Header */}
      <div className="mb-3 flex items-center gap-2">
        <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary/50 to-accent/50 ring-1 ring-border">
          <ListTree className="h-5 w-5 text-primary-foreground drop-shadow" />
          <div className="absolute inset-0 rounded-xl bg-background/10" />
        </div>
        <div>
          <h2 className="text-sm font-semibold tracking-wide text-foreground">{title}</h2>
          <p className="text-xs text-muted-foreground">Jump to any section</p>
        </div>
      </div>

      {/* Search */}
      {setQuery && (
        <label className="group relative mb-3 block">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery?.(e.target.value)}
            placeholder="Filter sections…"
            className="w-full rounded-xl border border-border bg-input px-9 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50"
          />
        </label>
      )}

      {/* List */}
      <nav className="relative">
        {/* Decorative gradient spine */}
        <div className="pointer-events-none absolute left-3 top-0 h-full w-px bg-gradient-to-b from-transparent via-border to-transparent" aria-hidden="true" />

        <ul className="max-h-[60vh] space-y-1 overflow-y-auto pr-2">
          {headings.map((h) => {
            const isActive = h.id === activeId;
            return (
              <li key={h.id}>
                <button
                  onClick={() => onItemClick(h.id)}
                  className={cn(
                    'group relative w-full text-left',
                    h.level === 1 ? 'pl-6' : h.level === 2 ? 'pl-10' : 'pl-14'
                  )}
                  aria-current={isActive ? 'location' : undefined}
                >
                  {/* Bullet + animated active halo */}
                  <span className="absolute left-1.5 top-2.5 inline-flex h-2.5 w-2.5 items-center justify-center">
                    <span
                      className={cn(
                        'h-1.5 w-1.5 rounded-full transition-all',
                        isActive ? 'bg-primary' : 'bg-muted-foreground/40'
                      )}
                    />
                    {isActive && (
                      <span className="absolute inset-0 -m-1 rounded-full bg-primary/30 blur-[6px]" />
                    )}
                  </span>

                  <span
                    className={cn(
                      'block rounded-lg px-2 py-1.5 text-[13px] leading-snug transition',
                      isActive
                        ? 'bg-primary/10 text-primary ring-1 ring-primary/30'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <span className={cn('font-medium', h.level === 1 ? '' : 'opacity-90')}>
                      {h.title}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

export function TableOfContents({
  sections,
  title = 'On this page',
  className = '',
}: TableOfContentsProps) {
  const ids = useMemo(() => sections.map((h) => h.id), [sections]);
  const activeId = useScrollSpy(ids);
  const [open, setOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query) return sections;
    return sections.filter((h) => h.title.toLowerCase().includes(query.toLowerCase()));
  }, [sections, query]);

  const handleClick = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    // Offset for sticky headers
    const y = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top: y, behavior: 'smooth' });
  };

  return (
    <>
      {/* Floating mobile dock */}
      <div className="fixed bottom-4 right-4 z-40 lg:hidden">
        <button
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? 'Close table of contents' : 'Open table of contents'}
          className="group inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 backdrop-blur-xl shadow-lg ring-1 ring-border hover:bg-muted active:scale-[0.98] transition"
        >
          {mobileOpen ? (
            <PanelRightClose className="h-5 w-5 text-foreground" />
          ) : (
            <PanelRightOpen className="h-5 w-5 text-foreground" />
          )}
          <span className="text-sm font-medium text-foreground">Contents</span>
        </button>
      </div>

      {/* Mobile overlay drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: 320 }}
            animate={{ x: 0 }}
            exit={{ x: 320 }}
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
            className="fixed bottom-0 right-0 top-0 z-50 w-[84%] max-w-sm bg-card backdrop-blur-xl ring-1 ring-border p-4 overflow-y-auto lg:hidden"
          >
            <TOCInner
              title={title}
              headings={filtered}
              activeId={activeId}
              setQuery={setQuery}
              query={query}
              onItemClick={(id) => {
                handleClick(id);
                setMobileOpen(false);
              }}
            />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop sticky panel */}
      <aside
        className={cn('hidden lg:block lg:sticky lg:top-6 lg:self-start z-20', className)}
      >
        <div className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl ring-1 ring-border/10 shadow-lg">
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Collapse' : 'Expand'}
            className="absolute right-3 top-3 rounded-full p-2 hover:bg-muted transition"
          >
            <ChevronRight
              className={cn('h-4 w-4 transition-transform text-muted-foreground', open ? 'rotate-90' : 'rotate-0')}
            />
          </button>

          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                key="toc"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="p-4"
              >
                <TOCInner
                  title={title}
                  headings={filtered}
                  activeId={activeId}
                  setQuery={setQuery}
                  query={query}
                  onItemClick={handleClick}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </aside>

      {/* Back to top button */}
      <BackToTop />
    </>
  );
}

function BackToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible((window.scrollY || 0) > 600);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-4 left-4 z-40 inline-flex items-center gap-2 rounded-full border border-border bg-card/90 px-3 py-2 text-sm font-medium text-foreground backdrop-blur-xl shadow-lg ring-1 ring-border hover:bg-card transition"
          aria-label="Back to top"
        >
          <ArrowUp className="h-4 w-4" /> Top
        </motion.button>
      )}
    </AnimatePresence>
  );
}
