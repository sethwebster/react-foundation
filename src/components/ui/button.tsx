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
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full font-semibold transition cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-60 [-webkit-font-smoothing:antialiased] [-moz-osx-font-smoothing:grayscale]";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-foreground hover:bg-primary/88",
  secondary:
    "bg-secondary text-secondary-foreground hover:bg-secondary/75",
  tertiary:
    "border border-border bg-background text-foreground hover:border-border-strong hover:bg-muted",
  glass:
    "border border-border/80 bg-background/75 text-foreground backdrop-blur hover:bg-muted",
  ghost: "text-muted-foreground hover:text-foreground",
  link: "text-primary underline-offset-4 hover:text-primary/80 hover:underline",
};

const sizeClasses: Record<ButtonSize, string> = {
  xs: "px-3 py-1 text-xs",
  sm: "px-4 py-2 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
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
