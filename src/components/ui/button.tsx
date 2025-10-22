import Link from "next/link";
import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ComponentPropsWithoutRef,
} from "react";

import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "tertiary" | "glass" | "ghost" | "link";
type ButtonSize = "xs" | "sm" | "md" | "lg";

const baseClasses =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-60";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-primary via-primary/80 to-primary/60 text-primary-foreground shadow-lg shadow-primary/30 hover:from-primary/90 hover:via-primary/70 hover:to-primary/50",
  secondary:
    "border border-border bg-card/40 text-card-foreground hover:border-border/60 hover:bg-card/60",
  tertiary:
    "border border-success/30 bg-success/10 text-success hover:border-success/50 hover:bg-success/20 hover:text-success/80",
  glass:
    "border border-border/15 bg-background/10 text-foreground shadow-lg shadow-primary/10 backdrop-blur hover:border-border/25 hover:bg-background/15",
  ghost: "text-muted-foreground hover:text-foreground",
  link: "text-primary underline-offset-4 hover:text-primary/80 hover:underline",
};

const sizeClasses: Record<ButtonSize, string> = {
  xs: "px-3 py-1 text-xs",
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-4 text-base",
};

export function buttonVariants({
  variant = "primary",
  size = "md",
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
} = {}): string {
  return cn(baseClasses, variantClasses[variant], sizeClasses[size]);
}

type ButtonBaseProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

type ButtonProps = ButtonBaseProps & ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";

type ButtonLinkProps = ButtonBaseProps &
  ComponentPropsWithoutRef<typeof Link> & { className?: string };

export const ButtonLink = forwardRef<HTMLAnchorElement, ButtonLinkProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <Link
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);

ButtonLink.displayName = "ButtonLink";
