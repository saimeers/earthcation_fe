import { useLocation } from 'react-router-dom'
import { canEditIn, panelFromPath, type PanelBase } from '../domain/roles'
import { guideSeen } from '../domain/onboarding'
import { useAuthStore } from './authStore'

/** Ruta base del panel en el que se está: '/admin', '/instructor' o '/developer'. */
export function usePanelBase(): PanelBase {
  return panelFromPath(useLocation().pathname)
}

/** false en el panel de soporte, que consulta en modo lectura. */
export function useCanEdit(): boolean {
  return canEditIn(usePanelBase())
}

/** Estado de una guía de bienvenida y la acción para descartarla. */
export function useGuide(key: string) {
  const seen = useAuthStore(s => guideSeen(s, key))
  const dismiss = useAuthStore(s => s.dismissGuide)
  return { seen, dismiss: () => dismiss(key) }
}
