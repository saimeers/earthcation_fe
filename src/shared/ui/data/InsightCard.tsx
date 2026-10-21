import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { tintBg } from '@/shared/lib/color'

export type InsightTone = 'good' | 'bad' | 'warn' | 'info'

const TONE: Record<InsightTone, string> = {
  good: 'var(--status-good)',
  bad: 'var(--status-critical)',
  warn: 'var(--status-warning)',
  info: 'var(--primary)',
}

interface InsightCardProps {
  icon?: LucideIcon
  tone?: InsightTone
  title: ReactNode
  children?: ReactNode
}

/** Conclusión en lenguaje claro con el tono a la izquierda. */
export function InsightCard({ icon: Icon, tone = 'info', title, children }: InsightCardProps) {
  const color = TONE[tone]
  return (
    <div className="relative overflow-hidden rounded-xl border bg-card p-4 flex gap-3 min-w-0">
      <span className="absolute inset-y-0 left-0 w-1" style={{ backgroundColor: color }} />
      {Icon && (
        <span className="flex h-9 w-9 items-center justify-center rounded-lg shrink-0" style={{ backgroundColor: tintBg(color, 14) }}>
          <Icon className="h-4 w-4" style={{ color }} />
        </span>
      )}
      <div className="min-w-0">
        <p className="text-sm font-semibold leading-snug">{title}</p>
        {children && <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{children}</p>}
      </div>
    </div>
  )
}
