import * as React from "react"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

interface AccordionItemProps {
  title: React.ReactNode
  badge?: React.ReactNode
  defaultOpen?: boolean
  className?: string
  children: React.ReactNode
}

/**
 * Lightweight, dependency-free accordion item. Used to group PARA deposits
 * (Proyectos/Áreas/Recursos/Archivo) so the browser doesn't render every
 * node at once — reduces visual/cognitive load vs. an infinite flat list.
 */
function AccordionItem({ title, badge, defaultOpen = false, className, children }: AccordionItemProps) {
  const [open, setOpen] = React.useState(defaultOpen)
  const contentId = React.useId()

  return (
    <div data-slot="accordion-item" className={cn("rounded-xl ring-1 ring-foreground/10 bg-card", className)}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={contentId}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2 min-w-0">
          <span className="font-medium text-sm truncate">{title}</span>
          {badge}
        </span>
        <ChevronDown
          className={cn("size-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")}
        />
      </button>
      {open && (
        <div id={contentId} data-slot="accordion-content" className="px-4 pb-4">
          {children}
        </div>
      )}
    </div>
  )
}

function Accordion({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div data-slot="accordion" className={cn("space-y-2", className)}>
      {children}
    </div>
  )
}

export { Accordion, AccordionItem }
