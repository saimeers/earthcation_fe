import type { LucideIcon } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

export interface Segment<K extends string = string> {
  key: K
  label: string
  value: number
  color: string
  icon?: LucideIcon
}

interface StackedBarProps<K extends string> {
  segments: Segment<K>[]
  height?: number
  className?: string
  showLegend?: boolean
  onSegmentClick?: (key: K) => void
  active?: K | null
}

// Barra 100% apilada con brecha de 2px entre segmentos + leyenda (identidad nunca solo por color)
export function StackedBar<K extends string>({ segments, height = 14, className, showLegend = true, onSegmentClick, active }: StackedBarProps<K>) {
  const total = segments.reduce((a, s) => a + s.value, 0)
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex w-full gap-[2px]" style={{ height }}>
        {total === 0 && <div className="flex-1 rounded-full bg-muted" />}
        {segments.filter(s => s.value > 0).map((s, i, arr) => (
          <button
            key={s.key}
            type="button"
            title={`${s.label}: ${s.value}`}
            onClick={() => onSegmentClick?.(s.key)}
            className={cn(
              'h-full transition-opacity',
              i === 0 && 'rounded-l-full', i === arr.length - 1 && 'rounded-r-full',
              onSegmentClick ? 'cursor-pointer hover:opacity-80' : 'cursor-default',
              active && active !== s.key && 'opacity-35',
            )}
            style={{ width: `${(s.value / total) * 100}%`, backgroundColor: s.color }}
          />
        ))}
      </div>
      {showLegend && (
        <div className="flex flex-wrap gap-x-4 gap-y-1.5">
          {segments.map(s => {
            const Icon = s.icon
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => onSegmentClick?.(s.key)}
                className={cn(
                  'inline-flex items-center gap-1.5 text-xs rounded-md px-1.5 py-0.5 -mx-1.5 transition-colors',
                  onSegmentClick && 'hover:bg-muted', active === s.key && 'bg-muted ring-1 ring-border',
                )}>
                {Icon ? <Icon className="h-3.5 w-3.5" style={{ color: s.color }} /> : <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />}
                <span className="text-muted-foreground">{s.label}</span>
                <span className="font-semibold tabular-nums">{s.value}</span>
                {total > 0 && <span className="text-muted-foreground tabular-nums">({Math.round((s.value / total) * 100)}%)</span>}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
