import * as React from "react";
import { cn } from "./cn";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-[10px] border border-[var(--border)] bg-[var(--surface)] px-4 text-sm text-[var(--brand-navy)] placeholder:text-[#9ca3af]",
        "focus-visible:outline-none focus-visible:border-[var(--brand)] focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-[var(--brand)]/15",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        className
      )}
      {...props}
    />
  );
}
