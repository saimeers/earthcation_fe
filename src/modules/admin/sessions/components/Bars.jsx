import { cn } from '@/lib/utils'
import { tintBg } from '../bands'

// Lista de barras horizontales (magnitud, un solo color) con valor al final de la barra.
// Barras de 10px con extremo redondeado de 4px, ancladas a la izquierda.
export function HBarList({ items, max, format = (v) => v, color = 'var(--chart-1)', empty = 'Sin datos todavía.' }) {
  if (!items?.length) return <p className="text-sm text-muted-foreground py-6 text-center">{empty}</p>
  const top = max ?? Math.max(...items.map(i => i.value), 1)
  return (
    <ul className="space-y-3">
      {items.map(item => (
        <li key={item.key ?? item.label} className="min-w-0" title={item.title}>
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

// Barra 100% apilada con brecha de 2px entre segmentos + leyenda (identidad nunca solo por color)
export function StackedBar({ segments, height = 14, className, showLegend = true, onSegmentClick, active }) {
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

export function Panel({ title, description, icon: Icon, action, children, className, accent = 'var(--primary)' }) {
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
