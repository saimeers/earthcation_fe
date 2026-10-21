import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { tintBg } from '@/shared/lib/color'

interface StatTileProps {
  label: ReactNode
  value: ReactNode
  sub?: ReactNode
  icon?: LucideIcon
  accent?: string
  children?: ReactNode
  className?: string
}

/** Indicador: rótulo, valor grande y una línea de contexto. */
export function StatTile({ label, value, sub, icon: Icon, accent = 'var(--primary)', children, className }: StatTileProps) {
  return (
    <div className={cn('rounded-xl border bg-card p-4 flex flex-col gap-2 min-w-0', className)}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-muted-foreground leading-tight">{label}</p>
        {Icon && (
          <span className="flex h-7 w-7 items-center justify-center rounded-lg shrink-0" style={{ backgroundColor: tintBg(accent, 14) }}>
            <Icon className="h-3.5 w-3.5" style={{ color: accent }} />
          </span>
        )}
      </div>
      <p className="text-2xl font-bold tracking-tight leading-none">{value}</p>
      {sub && <p className="text-xs text-muted-foreground leading-snug">{sub}</p>}
      {children}
    </div>
  )
}
