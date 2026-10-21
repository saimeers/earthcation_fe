import { cn } from '@/shared/lib/utils'
import { STRATA, currentStratum } from '../../domain/content'
import { BOTTOM_DEPTH, formatDepth } from '../../domain/depth'

const position = (meters: number) => ({ top: `${(meters / BOTTOM_DEPTH) * 100}%` })

/**
 * Medidor de profundidad fijo al costado (solo en pantallas anchas). Es compacto para caber en el margen: muestra la
 * lectura, el nombre del tramo actual y una escala con una marca por tramo (cada marca lleva a su sección). Va sobre
 * una placa del color del tramo (clara sobre la caliza, oscura sobre el carbón) para leerse en cualquier sección.
 */
export function DepthGauge({ depth }: { depth: number }) {
  const active = currentStratum(depth)
  const dark = active.tone === 'dark'
  return (
    <nav
      aria-label="Profundidad"
      className={cn(
        'l-mono fixed top-1/2 right-4 z-30 hidden w-24 -translate-y-1/2 border px-2.5 py-3 text-[10px] backdrop-blur transition-colors duration-500 xl:block',
        dark
          ? 'border-(--l-paper)/15 bg-(--l-coal)/85 text-(--l-paper)'
          : 'border-(--l-ink)/15 bg-(--l-limestone)/90 text-(--l-ink)',
      )}>
      <p className="text-right">
        <span className="bg-(--l-amber) px-1.5 py-0.5 text-[11px] font-semibold text-(--l-ink) tabular-nums">{formatDepth(depth)}</span>
      </p>
      <p className="mt-2 min-h-[2.5em] text-right leading-tight tracking-[0.08em] uppercase" aria-live="polite">{active.name}</p>
      <div className="relative mt-2 ml-auto h-48 w-6">
        <span aria-hidden="true" className="absolute top-0 right-0 h-full w-px bg-current opacity-60" />
        {STRATA.map((s) => (
          <a
            key={s.id} href={`#${s.id}`} style={position(s.depth)} title={s.name}
            aria-label={`Ir a ${s.name}`} aria-current={s.id === active.id ? 'location' : undefined}
            className="l-focus absolute right-0 flex h-4 w-6 -translate-y-1/2 items-center justify-end">
            <span aria-hidden="true" className={cn('h-px bg-current', s.id === active.id ? 'w-5' : 'w-3 opacity-60')} />
          </a>
        ))}
        <span
          aria-hidden="true" style={position(depth)}
          className="absolute -right-1.5 h-0.5 w-3 -translate-y-1/2 bg-(--l-amber) transition-[top] duration-150 ease-out" />
      </div>
    </nav>
  )
}
