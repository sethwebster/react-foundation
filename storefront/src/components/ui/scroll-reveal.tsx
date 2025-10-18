"use client";

import type { ReactNode } from "react";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  animation?: "fade" | "fade-up" | "fade-down" | "scale" | "slide-left" | "slide-right";
  delay?: number;
  threshold?: number;
  triggerOnce?: boolean;
}

const animations = {
  fade: {
    initial: "opacity-0",
    animate: "opacity-100",
    transition: "transition-opacity duration-1000 ease-out",
  },
  "fade-up": {
    initial: "opacity-0 translate-y-8",
    animate: "opacity-100 translate-y-0",
    transition: "transition-all duration-1000 ease-out",
  },
  "fade-down": {
    initial: "opacity-0 -translate-y-8",
    animate: "opacity-100 translate-y-0",
    transition: "transition-all duration-1000 ease-out",
  },
  scale: {
    initial: "opacity-0 scale-95",
    animate: "opacity-100 scale-100",
    transition: "transition-all duration-1000 ease-out",
  },
  "slide-left": {
    initial: "opacity-0 translate-x-8",
    animate: "opacity-100 translate-x-0",
    transition: "transition-all duration-1000 ease-out",
  },
  "slide-right": {
    initial: "opacity-0 -translate-x-8",
    animate: "opacity-100 translate-x-0",
    transition: "transition-all duration-1000 ease-out",
  },
};

export function ScrollReveal({
  children,
  className = "",
  animation = "fade-up",
  delay = 0,
  threshold = 0.1,
  triggerOnce = true,
}: ScrollRevealProps) {
  const { ref, isVisible } = useScrollReveal({ threshold, triggerOnce });
  const anim = animations[animation];

  return (
    <div
      ref={ref}
      className={`${anim.transition} ${isVisible ? anim.animate : anim.initial} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
