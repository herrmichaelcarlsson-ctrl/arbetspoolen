import * as React from "react";
import { cn } from "./cn";
import { Button } from "./Button";

export function Modal({
  open,
  title,
  description,
  onClose,
  children,
}: {
  open: boolean;
  title?: string;
  description?: string;
  onClose: () => void;
  children?: React.ReactNode;
}) {
  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title ?? "Dialog"}
    >
      <button
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Stäng"
      />
      <div
        className={cn(
          "relative w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl"
        )}
      >
        <div className="p-6">
          {(title || description) && (
            <div className="mb-4">
              {title && (
                <div className="text-lg font-extrabold text-white tracking-tight">
                  {title}
                </div>
              )}
              {description && (
                <div className="mt-1 text-sm text-slate-300">{description}</div>
              )}
            </div>
          )}
          {children}
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-slate-800 p-4">
          <Button variant="secondary" onClick={onClose}>
            Stäng
          </Button>
        </div>
      </div>
    </div>
  );
}

