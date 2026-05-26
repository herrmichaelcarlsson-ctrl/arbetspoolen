import * as React from "react";
import { cn } from "./cn";

export function Spinner({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "h-5 w-5 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--brand)]",
        className
      )}
      {...props}
    />
  );
}
