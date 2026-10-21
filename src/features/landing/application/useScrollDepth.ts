import { useEffect, useState } from 'react'
import { BOTTOM_DEPTH, depthAt, type DepthAnchor } from '../domain/depth'
import { STRATA } from '../domain/content'

// Un estrato "empieza" cuando su borde superior pasa por este punto de la ventana (40 % desde arriba)
const READING_LINE = 0.4

function measureAnchors(): DepthAnchor[] {
  const end = document.documentElement.scrollHeight - window.innerHeight
  const anchors = STRATA.flatMap(({ id, depth }) => {
    const section = document.getElementById(id)
    if (!section) return []
    const offset = section.getBoundingClientRect().top + window.scrollY - window.innerHeight * READING_LINE
    return [{ offset: Math.min(Math.max(offset, 0), end), depth }]
  })
  return [...anchors, { offset: end, depth: BOTTOM_DEPTH }]
}

/** Profundidad (m) que marca el medidor según el scroll, recalculada una vez por frame. */
export function useScrollDepth(): number {
  const [depth, setDepth] = useState(0)

  useEffect(() => {
    let frame = 0
    const measure = () => {
      frame = 0
      setDepth(depthAt(window.scrollY, measureAnchors()))
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure)
    }
    measure()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [])

  return depth
}
