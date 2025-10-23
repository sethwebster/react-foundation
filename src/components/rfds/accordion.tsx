/**
 * Accordion Component - Smooth height-animated collapsible content
 * Based on proven animation techniques with cubic-bezier easing
 */

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';

export interface AccordionContentProps {
  isOpen: boolean;
  children: React.ReactNode;
  className?: string;
  duration?: number;
}

export function AccordionContent({
  isOpen,
  children,
  className,
  duration = 300,
}: AccordionContentProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  // Measure content height whenever it changes
  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [children, isOpen]);

  // Re-measure on window resize
  useEffect(() => {
    const handleResize = () => {
      if (contentRef.current) {
        setContentHeight(contentRef.current.scrollHeight);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div
      className={cn("overflow-hidden motion-reduce:transition-none", className)}
      style={{
        height: isOpen ? `${contentHeight}px` : '0px',
        transition: `height ${duration}ms cubic-bezier(0.2, 0.8, 0.2, 1)`,
      }}
    >
      <div ref={contentRef}>
        {children}
      </div>
    </div>
  );
}
