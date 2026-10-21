import { cn } from '@/shared/lib/utils'
import { STRATA, currentStratum } from '../../domain/content'
import { BOTTOM_DEPTH, formatDepth } from '../../domain/depth'

const position = (meters: number) => ({ top: `${(meters / BOTTOM_DEPTH) * 100}%` })

/**
 * Medidor de profundidad fijo al costado (solo en pantallas anchas): la lectura actual arriba, una
 * escala con los estratos y un cursor ámbar que baja con el scroll. Cada marca lleva a su sección.
 * `mix-blend-difference` lo mantiene legible tanto sobre la caliza clara como sobre el carbón.
 */
export function DepthGauge({ depth }: { depth: number }) {
  const active = currentStratum(depth)
  return (
    <nav aria-label="Profundidad" className="l-mono fixed top-1/2 right-6 z-30 hidden -translate-y-1/2 text-[11px] xl:block">
      <p className="mb-4 text-right">
        <span className="block tracking-[0.18em] text-white/60 uppercase mix-blend-difference">Prof.</span>
        <span className="bg-(--l-amber) px-1.5 py-0.5 font-semibold text-(--l-ink) tabular-nums">{formatDepth(depth)}</span>
      </p>
      <div className="relative h-64 w-28">
        <span aria-hidden="true" className="absolute top-0 right-0 h-full w-px bg-white/70 mix-blend-difference" />
        {STRATA.map((s) => (
          <a
            key={s.id} href={`#${s.id}`} style={position(s.depth)}
            aria-current={s.id === active.id ? 'location' : undefined}
            className={cn(
              'l-focus absolute right-0 flex -translate-y-1/2 items-center gap-2 tracking-[0.15em] uppercase mix-blend-difference',
              s.id === active.id ? 'text-white' : 'text-white/70 hover:text-white',
            )}>
            {s.name}
            <span aria-hidden="true" className="h-px w-3 bg-current" />
          </a>
        ))}
        <span
          aria-hidden="true" style={position(depth)}
          className="absolute -right-1.5 h-0.5 w-3 -translate-y-1/2 bg-(--l-amber) transition-[top] duration-150 ease-out" />
      </div>
    </nav>
  )
}
