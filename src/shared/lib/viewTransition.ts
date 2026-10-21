import { flushSync } from 'react-dom'

/** Sentido de la transición: bajar hacia el acceso (`down`) o volver a la portada (`up`). La lee index.css. */
export type TransitionDirection = 'down' | 'up'

type ViewTransitionDocument = Document & { startViewTransition?: (update: () => void) => { finished: Promise<void> } }

const reducedMotion = (): boolean => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Ejecuta un cambio de pantalla dentro de una View Transition (la API del navegador anima entre la captura de antes
 * y la de después). Sin soporte o con movimiento reducido, cambia de pantalla directamente.
 */
export function withViewTransition(update: () => void, direction: TransitionDirection = 'down'): void {
  const doc = document as ViewTransitionDocument
  if (!doc.startViewTransition || reducedMotion()) {
    update()
    return
  }
  document.documentElement.dataset.transition = direction
  const transition = doc.startViewTransition(() => { flushSync(update) })
  void transition.finished.finally(() => { delete document.documentElement.dataset.transition })
}
