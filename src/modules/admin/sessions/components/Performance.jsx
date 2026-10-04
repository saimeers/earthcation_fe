import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BAND_META, tintBg } from '../bands'

export function BandPill({ band, size = 'sm', className }) {
  const meta = BAND_META[band] ?? BAND_META.sin_datos
  const Icon = meta.icon
  return (
    <span
      title={meta.hint}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap text-foreground',
        size === 'lg' ? 'px-3 py-1 text-sm' : 'px-2 py-0.5 text-[11px]',
        className,
      )}
      style={{ backgroundColor: tintBg(meta.color, 16), boxShadow: `inset 0 0 0 1px ${tintBg(meta.color, 35)}` }}>
      <Icon className={size === 'lg' ? 'h-4 w-4' : 'h-3 w-3'} style={{ color: meta.color }} />
      {size === 'lg' ? meta.label : meta.short}
    </span>
  )
}

// Diferencia contra el promedio del grupo. `higherIsBetter=false` para tiempos y errores.
export function DeltaChip({ value, format = (v) => v, higherIsBetter = true, suffix = 'vs. grupo', className }) {
  if (value == null || Number.isNaN(value)) return null
  const neutral = Math.abs(value) < 0.05
  const good = neutral ? null : (value > 0) === higherIsBetter
  const Icon = neutral ? Minus : value > 0 ? ArrowUpRight : ArrowDownRight
  const color = neutral ? 'var(--status-neutral)' : good ? 'var(--status-good)' : 'var(--status-critical)'
  return (
    <span className={cn('inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground whitespace-nowrap', className)}>
      <span className="inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-foreground" style={{ backgroundColor: tintBg(color, 16) }}>
        <Icon className="h-3 w-3" style={{ color }} />
        {neutral ? 'igual' : `${value > 0 ? '+' : '−'}${format(Math.abs(value))}`}
      </span>
      {suffix}
    </span>
  )
}

// Medidor circular 0–100 con marca opcional del promedio del grupo
export function RadialGauge({ value, groupValue, color, size = 132, stroke = 12, label, sublabel }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const v = Math.max(0, Math.min(100, value ?? 0))
  const angle = groupValue != null ? (groupValue / 100) * 2 * Math.PI - Math.PI / 2 : null
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" role="img" aria-label={`${Math.round(v)}%`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--muted)" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={`${(v / 100) * c} ${c}`}
          style={{ transition: 'stroke-dasharray 700ms cubic-bezier(.2,.8,.2,1)' }}
        />
      </svg>
      {angle != null && (
        <span
          title={`Promedio del grupo: ${Math.round(groupValue)}%`}
          className="absolute h-[18px] w-[3px] rounded-full bg-foreground ring-2 ring-background"
          style={{
            left: size / 2 + Math.cos(angle) * r - 1.5,
            top: size / 2 + Math.sin(angle) * r - 9,
            transform: `rotate(${angle + Math.PI / 2}rad)`,
          }}
        />
      )}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-3xl font-bold tracking-tight leading-none">{value == null ? '—' : `${Math.round(v)}%`}</span>
        {label && <span className="mt-1 text-[11px] text-muted-foreground leading-tight px-4">{label}</span>}
        {sublabel}
      </div>
    </div>
  )
}

export function StatTile({ label, value, sub, icon: Icon, accent = 'var(--primary)', children, className }) {
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

const TONE = {
  good: 'var(--status-good)',
  bad:  'var(--status-critical)',
  warn: 'var(--status-warning)',
  info: 'var(--primary)',
}

export function InsightCard({ icon: Icon, tone = 'info', title, children }) {
  const color = TONE[tone] ?? TONE.info
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

// Barra segmentada mitigados / fallidos con brecha de 2px entre segmentos
export function SplitBar({ good = 0, bad = 0, height = 8, className, marker }) {
  const total = good + bad
  if (!total) return <div className={cn('rounded-full bg-muted', className)} style={{ height }} />
  return (
    <div className={cn('relative flex gap-[2px] w-full', className)} style={{ height }}>
      {good > 0 && <div className="rounded-l-full first:rounded-l-full last:rounded-r-full" style={{ width: `${(good / total) * 100}%`, backgroundColor: 'var(--status-good)' }} />}
      {bad > 0 && <div className="rounded-r-full first:rounded-l-full" style={{ width: `${(bad / total) * 100}%`, backgroundColor: 'var(--status-critical)' }} />}
      {marker != null && (
        <span title={`Grupo: ${Math.round(marker)}%`} className="absolute -top-1 -bottom-1 w-[2px] rounded-full bg-foreground ring-2 ring-card" style={{ left: `calc(${marker}% - 1px)` }} />
      )}
    </div>
  )
}

export function Avatar({ text, color, size = 40, className }) {
  return (
    <span
      className={cn('inline-flex items-center justify-center rounded-full font-semibold shrink-0 bg-card text-foreground', className)}
      style={{ width: size, height: size, fontSize: size * 0.36, boxShadow: `0 0 0 2px var(--card), 0 0 0 ${size > 48 ? 5 : 4}px ${color}` }}>
      {text}
    </span>
  )
}
