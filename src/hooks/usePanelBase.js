import { useLocation } from 'react-router-dom'

// Ruta base del panel en el que se está: '/instructor' o '/admin'. Las pantallas de sesiones se
// comparten entre los dos roles, así que sus enlaces se arman con esta base.
export function usePanelBase() {
  const { pathname } = useLocation()
  return pathname.startsWith('/instructor') ? '/instructor' : '/admin'
}
