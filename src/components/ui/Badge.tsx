import * as React from "react";
import { cn } from "./cn";

type BadgeVariant = "neutral" | "brand" | "premium";

const variants: Record<BadgeVariant, string> = {
  neutral: "bg-[var(--surface)] border-[var(--border)] text-[var(--muted)]",
  brand: "bg-[#eaf3fb] border-[var(--border-strong)] text-[var(--brand)]",
  premium: "bg-[#fff8ec] border-[#fde68a] text-[#d97706]",
};

export function Badge({
  className,
  variant = "neutral",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
