import type { AuditEntryDto } from '@/shared/api/types'

export type AuditEntry = AuditEntryDto

export interface AuditFilters {
  action: string
  /** AAAA-MM-DD, desde el inicio de ese día (hora local). */
  from: string
  /** AAAA-MM-DD, hasta el final de ese día (hora local). */
  to: string
}

export const NO_FILTERS: AuditFilters = { action: '', from: '', to: '' }

export const ACTION_LABEL: Readonly<Record<string, string>> = {
  'auth.login_succeeded': 'Inicio de sesión',
  'auth.login_failed': 'Inicio de sesión fallido',
  'auth.password_reset_requested': 'Restablecimiento solicitado',
  'auth.password_reset_completed': 'Contraseña restablecida',
  'user.created': 'Usuario creado',
  'user.updated': 'Usuario editado',
  'user.enabled': 'Usuario habilitado',
  'user.disabled': 'Usuario deshabilitado',
  'user.imported': 'Usuarios importados',
  'user.anonymized': 'Usuario anonimizado',
  'organization.created': 'Organización creada',
  'organization.updated': 'Organización editada',
  'organization.enabled': 'Organización habilitada',
  'organization.disabled': 'Organización deshabilitada',
  'location.created': 'Localidad creada',
  'location.updated': 'Localidad editada',
  'location.enabled': 'Localidad habilitada',
  'location.disabled': 'Localidad deshabilitada',
  'session.started': 'Sesión iniciada',
  'session.ended': 'Sesión finalizada',
  'session.exported': 'Sesión exportada',
  'game_version.created': 'Versión creada',
  'game_version.completed': 'Versión subida',
  'game_version.activated': 'Versión activada',
  'game_version.removed': 'Versión eliminada',
}

/** Las acciones en el orden del filtro. */
export const ACTIONS: readonly string[] = Object.keys(ACTION_LABEL)

const ROLE_LABEL: Readonly<Record<string, string>> = {
  admin: 'Administrador', instructor: 'Instructor', developer: 'Soporte', player: 'Jugador',
}

const FIELD_LABEL: Readonly<Record<string, string>> = {
  firstName: 'nombre', lastName: 'apellido', age: 'edad', email: 'correo', cedula: 'cédula', username: 'usuario', role: 'rol',
  organizationId: 'organización', locationId: 'localidad', name: 'nombre', type: 'tipo', municipality: 'municipio',
  department: 'departamento', country: 'país', label: 'etiqueta', notes: 'notas',
}

const CHANGE_LABEL: Readonly<Record<string, string>> = {
  created: 'creados', skipped: 'omitidos', errors: 'errores', role: 'rol', isActive: 'activo', name: 'nombre', type: 'tipo',
  municipality: 'municipio', department: 'departamento', label: 'etiqueta',
}

export const actionLabel = (action: string): string => ACTION_LABEL[action] ?? action
export const roleLabel = (role: string | null): string => (role ? (ROLE_LABEL[role] ?? role) : 'Sin sesión')

const fieldName = (f: unknown): string => FIELD_LABEL[String(f)] ?? String(f)

/** Qué cambió, en una línea: "Campos: nombre, edad" o "creados 3 · errores 0". */
export function describeChanges(changes: Record<string, unknown>): string {
  const parts = Object.entries(changes).map(([key, value]) => {
    if (key === 'fields' && Array.isArray(value)) return `Campos: ${value.map(fieldName).join(', ')}`
    if (value !== null && typeof value === 'object') return ''
    return `${CHANGE_LABEL[key] ?? key} ${String(value)}`
  })
  return parts.filter(Boolean).join(' · ')
}

/** Los filtros como los espera la API: fechas completas en la zona del navegador. */
export function toQuery(filters: AuditFilters): Record<string, string> {
  const query: Record<string, string> = {}
  if (filters.action) query.action = filters.action
  if (filters.from) query.from = new Date(`${filters.from}T00:00:00`).toISOString()
  if (filters.to) query.to = new Date(`${filters.to}T23:59:59.999`).toISOString()
  return query
}

export const hasFilters = (filters: AuditFilters): boolean => Object.values(filters).some(Boolean)
