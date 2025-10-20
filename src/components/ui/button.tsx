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
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300 disabled:pointer-events-none disabled:opacity-60";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30 hover:from-sky-300 hover:via-indigo-400 hover:to-purple-400",
  secondary:
    "border border-white/25 bg-slate-950/40 text-white hover:border-white/40 hover:bg-white/10",
  tertiary:
    "border border-emerald-400/30 bg-emerald-500/10 text-emerald-300 hover:border-emerald-400/50 hover:bg-emerald-500/20 hover:text-emerald-200",
  glass:
    "border border-white/15 bg-white/10 text-white shadow-lg shadow-indigo-500/10 backdrop-blur hover:border-white/25 hover:bg-white/15",
  ghost: "text-indigo-100 hover:text-white",
  link: "text-indigo-100 underline-offset-4 hover:text-white hover:underline",
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
