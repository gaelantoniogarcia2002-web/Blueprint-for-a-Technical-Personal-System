import * as React from "react"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

interface ModalProps {
  open: boolean
  onClose: () => void
  title: React.ReactNode
  className?: string
  children: React.ReactNode
}

/** Minimal dependency-free modal: backdrop + Escape + close button. */
function Modal({ open, onClose, title, className, children }: ModalProps) {
  React.useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === "string" ? title : undefined}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "w-full max-w-md max-h-[85vh] overflow-y-auto rounded-t-xl sm:rounded-xl bg-card text-card-foreground ring-1 ring-foreground/10 p-4 space-y-3",
          className,
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-base font-semibold">{title}</h2>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={onClose}
            className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export { Modal }
