import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { tintBg } from '@/shared/lib/color'

interface PanelProps {
  title: ReactNode
  description?: ReactNode
  icon?: LucideIcon
  action?: ReactNode
  children?: ReactNode
  className?: string
  accent?: string
}

/** Tarjeta con encabezado (ícono, título, descripción y acción opcional). */
export function Panel({ title, description, icon: Icon, action, children, className, accent = 'var(--primary)' }: PanelProps) {
  return (
    <section className={cn('rounded-xl border bg-card p-4 sm:p-5 space-y-4 min-w-0', className)}>
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0">
          {Icon && (
            <span className="flex h-8 w-8 items-center justify-center rounded-lg shrink-0" style={{ backgroundColor: tintBg(accent, 14) }}>
              <Icon className="h-4 w-4" style={{ color: accent }} />
            </span>
          )}
          <div className="min-w-0">
            <h3 className="text-sm font-semibold leading-tight">{title}</h3>
            {description && <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{description}</p>}
          </div>
        </div>
        {action}
      </header>
      {children}
    </section>
  )
}
