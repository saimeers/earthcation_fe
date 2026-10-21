import { cn } from '@/shared/lib/utils'
import { tintBg } from '@/shared/lib/color'
import type { PerformanceBand } from '../../domain/bands'
import { bandMeta } from '../meta'

interface BandPillProps {
  band: PerformanceBand | null | undefined
  size?: 'sm' | 'lg'
  className?: string
}

/** Banda de desempeño con ícono, texto y color. */
export function BandPill({ band, size = 'sm', className }: BandPillProps) {
  const meta = bandMeta(band)
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
