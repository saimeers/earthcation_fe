import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

export interface HBarItem {
  key?: string | number
  label: ReactNode
  value: number
  sub?: string
  title?: string
  icon?: LucideIcon
  color?: string
}

interface HBarListProps {
  items: HBarItem[] | null | undefined
  max?: number
  format?: (v: number) => ReactNode
  color?: string
  empty?: string
}

// Lista de barras horizontales (magnitud, un solo color) con valor al final de la barra.
// Barras de 10px con extremo redondeado de 4px, ancladas a la izquierda.
export function HBarList({ items, max, format = (v) => v, color = 'var(--chart-1)', empty = 'Sin datos todavía.' }: HBarListProps) {
  if (!items?.length) return <p className="text-sm text-muted-foreground py-6 text-center">{empty}</p>
  const top = max ?? Math.max(...items.map(i => i.value), 1)
  return (
    <ul className="space-y-3">
      {items.map(item => (
        <li key={item.key ?? String(item.label)} className="min-w-0" title={item.title}>
          <div className="flex items-baseline justify-between gap-3 mb-1">
            <span className="text-xs font-medium truncate flex items-center gap-1.5">
              {item.icon && <item.icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
              {item.label}
            </span>
            <span className="text-xs tabular-nums text-muted-foreground shrink-0">
              <span className="font-semibold text-foreground">{format(item.value)}</span>{item.sub ? ` · ${item.sub}` : ''}
            </span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-r-[4px] transition-[width] duration-700"
              style={{ width: `${Math.max(2, (item.value / top) * 100)}%`, backgroundColor: item.color ?? color }}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}
