"use client";

import type { ReactNode } from "react";
import { useParallax } from "@/hooks/use-parallax";

interface ParallaxProps {
  children: ReactNode;
  speed?: number;
  direction?: "up" | "down";
  className?: string;
}

export function Parallax({ children, speed = 0.5, direction = "up", className = "" }: ParallaxProps) {
  const offset = useParallax({ speed, direction });

  return (
    <div
      className={className}
      style={{
        transform: `translateY(${offset}px)`,
        willChange: "transform",
      }}
    >
      {children}
    </div>
  );
}
