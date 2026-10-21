// Medidor de profundidad de la portada: la página se recorre como un descenso a la mina. Cada
// estrato (sección) marca una profundidad en su posición de scroll y entre dos estratos se interpola.

/** Profundidad que marca el medidor al llegar al final de la página. */
export const BOTTOM_DEPTH = 250

/** Una posición de scroll (px) con la profundidad (m) que le corresponde. Ordenadas por `offset`. */
export interface DepthAnchor {
  offset: number
  depth: number
}

/** Profundidad en metros para una posición de scroll, interpolando entre anclas vecinas. */
export function depthAt(position: number, anchors: readonly DepthAnchor[]): number {
  let previous: DepthAnchor | undefined
  for (const anchor of anchors) {
    if (position <= anchor.offset) return previous ? interpolate(previous, anchor, position) : anchor.depth
    previous = anchor
  }
  return previous?.depth ?? 0
}

function interpolate(from: DepthAnchor, to: DepthAnchor, position: number): number {
  const span = to.offset - from.offset
  const progress = span > 0 ? (position - from.offset) / span : 1
  return Math.round(from.depth + progress * (to.depth - from.depth))
}

/** "0 m" en superficie; bajo tierra con signo menos tipográfico: "−120 m". */
export function formatDepth(meters: number): string {
  return meters === 0 ? '0 m' : `−${meters} m`
}
