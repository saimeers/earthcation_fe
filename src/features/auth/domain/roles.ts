import type { AuthUserDto, Role } from '@/shared/api/types'

export type AuthUser = AuthUserDto
export type { Role }

/** Ruta base de cada panel. El jugador no tiene panel: entra solo al juego. */
export type PanelBase = '/admin' | '/instructor' | '/developer'

const HOME: Partial<Record<Role, PanelBase>> = {
  admin: '/admin',
  instructor: '/instructor',
  developer: '/developer',
}

/** El panel es solo para el personal (instructores, administradores y soporte). */
export const isStaff = (role: Role): boolean => role in HOME

/** Panel al que entra cada rol después de iniciar sesión (null = sin acceso). */
export const homeFor = (role: Role): PanelBase | null => HOME[role] ?? null

/**
 * Panel en el que se está según la URL. Las pantallas de sesiones, usuarios y analíticas se
 * comparten entre roles, así que sus enlaces se arman con esta base.
 */
export function panelFromPath(pathname: string): PanelBase {
  if (pathname.startsWith('/instructor')) return '/instructor'
  if (pathname.startsWith('/developer')) return '/developer'
  return '/admin'
}

/**
 * El desarrollador consulta el panel en modo lectura: se ocultan crear, editar, deshabilitar,
 * iniciar/finalizar (el backend igual responde 403 a cualquier escritura suya).
 */
export const canEditIn = (base: PanelBase): boolean => base !== '/developer'

/** ¿Puede este rol abrir una ruta protegida para `allowed`? Sin rol conocido no se bloquea (como antes). */
export const roleAllowed = (role: Role | null | undefined, allowed: readonly Role[] | undefined): boolean =>
  !allowed || !role || allowed.includes(role)
