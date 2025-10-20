"use client";

import { useEffect, useState } from "react";

interface ParallaxOptions {
  speed?: number; // Multiplier for scroll speed (0.5 = half speed, 2 = double speed)
  direction?: "up" | "down";
}

export function useParallax({ speed = 0.5, direction = "up" }: ParallaxOptions = {}) {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const directionMultiplier = direction === "up" ? -1 : 1;
      setOffset(scrolled * speed * directionMultiplier);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initialize

    return () => window.removeEventListener("scroll", handleScroll);
  }, [speed, direction]);

  return offset;
}
