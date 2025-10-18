"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
} from "react";

import type { ProductImage } from "@/lib/products";

type ProductGalleryProps = {
  images: ProductImage[];
  className?: string;
};

export function ProductGallery({ images, className }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const frameRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const targetOrigin = useRef<{ x: number; y: number }>({ x: 50, y: 50 });

  const activeImage = useMemo(() => {
    if (images.length === 0) {
      return null;
    }
    return images[Math.min(activeIndex, images.length - 1)];
  }, [activeIndex, images]);

  const applyTransformOrigin = useCallback(() => {
    if (!imageRef.current) {
      return;
    }
    const { x, y } = targetOrigin.current;
    imageRef.current.style.transformOrigin = `${x}% ${y}%`;
    rafRef.current = null;
  }, []);

  const scheduleUpdate = useCallback(() => {
    if (rafRef.current !== null) {
      return;
    }
    rafRef.current = requestAnimationFrame(applyTransformOrigin);
  }, [applyTransformOrigin]);

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!frameRef.current) {
        return;
      }
      const bounds = frameRef.current.getBoundingClientRect();
      const x = ((event.clientX - bounds.left) / bounds.width) * 100;
      const y = ((event.clientY - bounds.top) / bounds.height) * 100;
      targetOrigin.current = {
        x: Math.min(100, Math.max(0, x)),
        y: Math.min(100, Math.max(0, y)),
      };
      scheduleUpdate();
    },
    [scheduleUpdate],
  );

  const handlePointerLeave = useCallback(() => {
    targetOrigin.current = { x: 50, y: 50 };
    scheduleUpdate();
  }, [scheduleUpdate]);

  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (images.length <= 1) {
        return;
      }

      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((prev) => (prev + 1) % images.length);
      } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((prev) => {
          const next = prev - 1;
          return next < 0 ? images.length - 1 : next;
        });
      }
    },
    [images.length],
  );

  useEffect(() => {
    targetOrigin.current = { x: 50, y: 50 };
    scheduleUpdate();
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [activeImage, scheduleUpdate]);

  if (!activeImage) {
    return null;
  }

  const containerClasses = className
    ? `focus:outline-none ${className}`
    : "focus:outline-none";

  return (
    <div
      className={containerClasses}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      role="group"
      aria-label="Product gallery"
    >
      <div
        ref={frameRef}
        className="group relative aspect-square overflow-hidden rounded-2xl border border-white/10 bg-slate-900"
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        <Image
          ref={imageRef}
          src={activeImage.src}
          alt={activeImage.alt}
          fill
          sizes="(min-width: 1024px) 520px, 90vw"
          className="object-cover transition-transform duration-500 will-change-transform group-hover:scale-[1.25]"
          style={{
            objectPosition: `${activeImage.centerOffset.x} ${activeImage.centerOffset.y}`,
          }}
          priority
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-white/[0.03] via-transparent to-transparent" />
      </div>
      {images.length > 1 ? (
        <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
          {images.map((image, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={image.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-white/15 transition data-[active=true]:border-white/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
                data-active={isActive}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="80px"
                  className="object-cover"
                  style={{
                    objectPosition: `${image.centerOffset.x} ${image.centerOffset.y}`,
                  }}
                />
                <span
                  className="pointer-events-none absolute inset-0 rounded-xl border-2 border-sky-300 opacity-0 transition-opacity data-[active=true]:opacity-100"
                  data-active={isActive}
                />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
