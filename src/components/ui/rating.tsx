import type { CSSProperties } from "react";

import { cn } from "@/lib/cn";

type RatingProps = {
  value: number;
  max?: number;
  count?: number;
  size?: "sm" | "md";
  className?: string;
};

const sizeMap: Record<NonNullable<RatingProps["size"]>, number> = {
  sm: 16,
  md: 20,
};

export function Rating({
  value,
  max = 5,
  count,
  size = "sm",
  className,
}: RatingProps) {
  const dimension = sizeMap[size];
  const ratingGold = "var(--color-ratings-gold, #F6C65B)";
  const maskStyle: CSSProperties = {
    width: dimension,
    height: dimension,
    backgroundColor: ratingGold,
    WebkitMaskImage: "url('/react-logo.svg')",
    maskImage: "url('/react-logo.svg')",
    WebkitMaskPosition: "center",
    maskPosition: "center",
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskSize: "contain",
    maskSize: "contain",
  };
  const clampedValue = Math.max(0, Math.min(value, max));
  const formattedValue = Number.isInteger(clampedValue)
    ? clampedValue.toFixed(0)
    : clampedValue.toFixed(1);
  const formattedCount =
    typeof count === "number" ? count.toLocaleString("en-US") : null;

  // Don't show stars if there are no reviews
  if (count === 0) {
    return (
      <div
        className={cn("flex items-center gap-2 text-xs text-muted-foreground", className)}
      >
        <span className="text-[11px] uppercase tracking-[0.2em]">
          No reviews yet
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn("flex items-center gap-2 text-xs text-foreground/50", className)}
      aria-label={`Rated ${formattedValue} out of ${max}`}
    >
      <div className="flex items-center gap-1">
        {Array.from({ length: max }, (_, index) => {
          const fillAmount = Math.min(
            1,
            Math.max(0, clampedValue - index),
          );
          const fillPercentage = Math.max(0, Math.min(fillAmount * 100, 100));
          const clipRight = (100 - fillPercentage).toFixed(3);
          return (
            <span
              key={index}
              className="relative inline-flex"
              aria-hidden="true"
              style={{ width: dimension, height: dimension }}
            >
              <span
                className="block opacity-20"
                style={maskStyle}
              />
              {fillAmount > 0 ? (
                <span
                  className="absolute inset-0 overflow-hidden"
                  style={{
                    clipPath: `inset(0 ${clipRight}% 0 0)`,
                  }}
                >
                  <span
                    className="block"
                    style={maskStyle}
                  />
                </span>
              ) : null}
            </span>
          );
        })}
      </div>
      {typeof count === "number" ? (
        <span className="text-[11px] uppercase tracking-[0.2em]">
          {formattedCount} reviews
        </span>
      ) : null}
    </div>
  );
}
