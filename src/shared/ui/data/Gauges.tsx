import type { ReactNode } from 'react'
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { tintBg } from '@/shared/lib/color'

interface DeltaChipProps {
  value: number | null | undefined
  format?: (v: number) => ReactNode
  higherIsBetter?: boolean
  suffix?: string
  className?: string
}

// Diferencia contra el promedio del grupo. `higherIsBetter=false` para tiempos y errores.
export function DeltaChip({ value, format = (v) => v, higherIsBetter = true, suffix = 'vs. grupo', className }: DeltaChipProps) {
  if (value == null || Number.isNaN(value)) return null
  const neutral = Math.abs(value) < 0.05
  const good = neutral ? null : (value > 0) === higherIsBetter
  const Icon = neutral ? Minus : value > 0 ? ArrowUpRight : ArrowDownRight
  const color = neutral ? 'var(--status-neutral)' : good ? 'var(--status-good)' : 'var(--status-critical)'
  return (
    <span className={cn('inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground whitespace-nowrap', className)}>
      <span className="inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-foreground" style={{ backgroundColor: tintBg(color, 16) }}>
        <Icon className="h-3 w-3" style={{ color }} />
        {neutral ? 'igual' : <>{value > 0 ? '+' : '−'}{format(Math.abs(value))}</>}
      </span>
      {suffix}
    </span>
  )
}

interface RadialGaugeProps {
  value: number | null | undefined
  groupValue?: number | null
  color: string
  size?: number
  stroke?: number
  label?: ReactNode
  sublabel?: ReactNode
}

// Medidor circular 0–100 con marca opcional del promedio del grupo
export function RadialGauge({ value, groupValue, color, size = 132, stroke = 12, label, sublabel }: RadialGaugeProps) {
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
      {angle != null && groupValue != null && (
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

interface SplitBarProps {
  good?: number
  bad?: number
  height?: number
  className?: string
  marker?: number | null
}

// Barra segmentada mitigados / fallidos con brecha de 2px entre segmentos
export function SplitBar({ good = 0, bad = 0, height = 8, className, marker }: SplitBarProps) {
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

interface AvatarProps {
  text: string
  color?: string
  size?: number
  className?: string
}

/** Iniciales en un círculo con anillo de color. */
export function Avatar({ text, color, size = 40, className }: AvatarProps) {
  return (
    <span
      className={cn('inline-flex items-center justify-center rounded-full font-semibold shrink-0 bg-card text-foreground', className)}
      style={{ width: size, height: size, fontSize: size * 0.36, boxShadow: `0 0 0 2px var(--card), 0 0 0 ${size > 48 ? 5 : 4}px ${color}` }}>
      {text}
    </span>
  )
}
