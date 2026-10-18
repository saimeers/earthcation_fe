import { useLocation } from 'react-router-dom'

// Ruta base del panel en el que se está: '/admin', '/instructor' o '/developer'. Las pantallas
// (sesiones, usuarios, analíticas) se comparten entre roles, así que sus enlaces se arman con esta base.
export function usePanelBase() {
  const { pathname } = useLocation()
  if (pathname.startsWith('/instructor')) return '/instructor'
  if (pathname.startsWith('/developer')) return '/developer'
  return '/admin'
}

// El desarrollador consulta el panel en modo lectura: se ocultan crear, editar, deshabilitar,
// iniciar/finalizar (el backend igual responde 403 a cualquier escritura suya)
export function useCanEdit() {
  return usePanelBase() !== '/developer'
}
