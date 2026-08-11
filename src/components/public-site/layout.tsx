import type { HTMLAttributes, ReactNode } from "react";

import { Footer } from "@/components/layout/footer";
import { cn } from "@/lib/cn";

type Measure = "reading" | "standard" | "wide" | "full";

const measureClasses: Record<Measure, string> = {
  reading: "foundation-measure-reading",
  standard: "foundation-measure-standard",
  wide: "foundation-measure-wide",
  full: "max-w-none",
};

/**
 * Eyebrow — the single section-label voice across the site. Geist Mono, tracked
 * uppercase caps in React teal. Replaces the ad-hoc `text-sm font-semibold
 * text-primary` labels that were hand-written across pages.
 */
export function Eyebrow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={cn("foundation-eyebrow text-primary", className)}>{children}</p>
  );
}

export function PublicPageShell({
  children,
  className,
  footer = true,
}: {
  children: ReactNode;
  className?: string;
  footer?: boolean;
}) {
  return (
    <div
      className={cn(
        "min-h-screen bg-background pt-[var(--foundation-header-height)] text-foreground",
        className,
      )}
    >
      {children}
      {footer ? <Footer /> : null}
    </div>
  );
}

export function Section({
  children,
  className,
  measure = "reading",
  as: Component = "section",
  ...props
}: HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  measure?: Measure;
  as?: "section" | "div" | "main";
}) {
  return (
    <Component
      className={cn(
        "mx-auto w-full px-[var(--foundation-page-gutter)]",
        measureClasses[measure],
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

export function PageIntro({
  title,
  description,
  eyebrow,
  actions,
  align = "center",
  className,
  titleClassName,
  descriptionClassName,
}: {
  title: ReactNode;
  description?: ReactNode;
  eyebrow?: ReactNode;
  actions?: ReactNode;
  align?: "center" | "left";
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
}) {
  return (
    <div
      className={cn(
        "animate-page-appear",
        align === "center" ? "mx-auto text-center" : "text-left",
        className,
      )}
    >
      {eyebrow ? <Eyebrow className="mb-5">{eyebrow}</Eyebrow> : null}
      <h1
        className={cn(
          "text-title font-semibold leading-[1.04] tracking-[-0.03em] text-foreground",
          titleClassName,
        )}
      >
        {title}
      </h1>
      {description ? (
        <p
          className={cn(
            "mt-6 text-base leading-7 text-muted-foreground sm:text-[1.0625rem]",
            align === "center" && "mx-auto max-w-[35rem]",
            descriptionClassName,
          )}
        >
          {description}
        </p>
      ) : null}
      {actions ? (
        <div
          className={cn(
            "mt-8 flex flex-wrap gap-3",
            align === "center" && "justify-center",
          )}
        >
          {actions}
        </div>
      ) : null}
    </div>
  );
}

export function Surface({
  children,
  className,
  tone = "raised",
  radius = "panel",
  elevation = "card",
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  tone?: "raised" | "subtle" | "plain";
  radius?: "card" | "panel";
  elevation?: "none" | "card" | "soft";
}) {
  return (
    <div
      className={cn(
        "border border-border",
        radius === "card" ? "rounded-card" : "rounded-panel",
        tone === "raised" && "bg-surface-raised",
        tone === "subtle" && "bg-surface-subtle",
        tone === "plain" && "bg-transparent",
        elevation === "card" && "shadow-card",
        elevation === "soft" && "shadow-soft",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
