import * as React from "react";
import Link from "next/link";
import { cn } from "./cn";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "premium"
  | "danger";
type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]/40 " +
  "disabled:opacity-60 disabled:pointer-events-none";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--brand)] text-white hover:bg-[var(--brand-hover)] border border-[var(--brand)]",
  secondary:
    "bg-[var(--surface)] text-[var(--brand-navy)] hover:bg-[#eaf3fb] border border-[var(--border)]",
  outline:
    "bg-transparent text-[var(--brand-navy)] hover:bg-[#eaf3fb] border border-[var(--border-strong)]",
  ghost:
    "bg-transparent text-[var(--brand-navy)] hover:bg-[#eaf3fb] border border-transparent",
  premium:
    "bg-[var(--brand-orange)] text-white hover:bg-[var(--brand-orange-hover)] border border-[var(--brand-orange)]",
  danger:
    "bg-red-600 text-white hover:bg-red-500 border border-red-500",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-[13px]",
  md: "h-10 px-5 text-sm",
  lg: "h-12 px-7 text-[15px]",
};

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  type,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type ?? "button"}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  );
}

type LinkButtonProps = React.ComponentProps<typeof Link> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
};

export function LinkButton({
  className,
  variant = "primary",
  size = "md",
  ...props
}: LinkButtonProps) {
  return (
    <Link
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  );
}
