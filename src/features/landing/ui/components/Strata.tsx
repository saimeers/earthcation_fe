import type { ReactNode } from 'react'
import type { Stratum } from '../../domain/content'
import { formatDepth } from '../../domain/depth'

/**
 * Borde irregular entre dos estratos: se dibuja arriba de una sección con el color de la anterior,
 * para que el cambio de fondo se lea como una capa de roca y no como una línea recta.
 */
export function StrataEdge({ color }: { color: string }) {
  return (
    <svg
      aria-hidden="true" focusable="false" viewBox="0 0 1200 40" preserveAspectRatio="none"
      className="pointer-events-none absolute inset-x-0 top-0 h-6 w-full sm:h-10">
      <path
        d="M0 0 H1200 V14 C1120 30 1040 10 940 22 S760 36 640 18 S420 4 300 24 S110 32 0 16 Z"
        fill={color} />
    </svg>
  )
}

/** Rótulo de profundidad de una sección: "−120 m · Frente". */
export function StratumLabel({ stratum, children }: { stratum: Stratum, children: ReactNode }) {
  return (
    <p className="l-mono mb-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs tracking-[0.2em] uppercase">
      <span className="bg-(--l-amber) px-1.5 py-0.5 font-semibold text-(--l-ink)">{formatDepth(stratum.depth)}</span>
      <span>{stratum.name}</span>
      <span aria-hidden="true" className="opacity-50">/</span>
      <span className="opacity-70">{children}</span>
    </p>
  )
}
