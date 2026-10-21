import type { Role, UserDto, UserWriteDto } from '@/shared/api/types'

export type User = UserDto
export type { Role }

export const ROLES: readonly { value: Role, label: string }[] = [
  { value: 'player', label: 'Jugador' },
  { value: 'instructor', label: 'Instructor' },
  { value: 'admin', label: 'Admin' },
  { value: 'developer', label: 'Desarrollador' },
]

export const roleLabel = (role: string | null | undefined): string => ROLES.find(r => r.value === role)?.label ?? role ?? ''

/** Rótulos más largos del formulario de usuario. */
export const ROLE_TITLES: Record<Role, string> = {
  player: 'Jugador', instructor: 'Instructor', admin: 'Administrador', developer: 'Desarrollador',
}

export type RoleFilter = 'all' | Role

export const filterByRole = (users: User[], role: RoleFilter): User[] =>
  (role === 'all' ? users : users.filter(u => u.role === role))

/** Confirmaciones de la tabla (sin formulario detrás): deshabilitar, habilitar o cambiar el rol. */
export type UserAction =
  | { type: 'disable', user: User }
  | { type: 'enable', user: User }
  | { type: 'role', user: User, newRole: Role }

// ── Formulario de crear/editar ─────────────────────────────────────────────

export interface UserForm {
  first_name: string
  last_name: string
  cedula: string
  email: string
  username: string
  role: Role
  age: string | number
  organization_id: string
  location_id: string
}

export const EMPTY_USER_FORM: UserForm = {
  first_name: '', last_name: '', cedula: '', email: '', username: '', role: 'player', age: '', organization_id: '', location_id: '',
}

export const toUserForm = (u: User): UserForm => ({
  first_name: u.first_name ?? '',
  last_name: u.last_name ?? '',
  cedula: u.cedula ?? '',
  email: u.email ?? '',
  username: u.username ?? '',
  role: u.role ?? 'player',
  age: u.age ?? '',
  organization_id: u.profile?.organization_id ?? '',
  location_id: u.profile?.location_id ?? '',
})

/** El personal entra al panel con contraseña: su correo es obligatorio (ahí le llega el enlace). */
export const isStaffRole = (role: Role): boolean => role !== 'player'

/**
 * Cuerpo para la API: los opcionales vacíos van como null (nunca ''), el usuario por defecto es la
 * cédula al crear y en edición no se toca si quedó vacío.
 */
export const toUserPayload = (form: UserForm, isEdit: boolean): UserWriteDto => ({
  ...form,
  email: form.email?.trim() || null,
  username: form.username?.trim() || (isEdit ? undefined : form.cedula.trim()),
  age: form.age === '' || form.age == null ? null : Number(form.age),
  organization_id: form.organization_id || null,
  location_id: form.location_id || null,
})

/** Texto del aviso tras crear: el jugador entra con su cédula; al personal le llega un correo. */
export function createdMessage(role: Role, emailSent: boolean | undefined): string {
  if (role === 'player') return 'Ya puede entrar al juego con su cédula.'
  return emailSent
    ? 'Le enviamos un correo para que defina su contraseña.'
    : 'No se pudo enviar el correo — usa "¿Olvidaste tu contraseña?" para que defina una.'
}

export const CEDULA_PATTERN = /^\d{5,15}$/
export const EMAIL_PATTERN = /^\S+@\S+\.\S+$/
