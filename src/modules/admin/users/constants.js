export const ROLES = [
  { value: 'player',     label: 'Jugador',    variant: 'primary' },
  { value: 'instructor', label: 'Instructor', variant: 'primary'   },
  { value: 'admin',      label: 'Admin',      variant: 'primary'   },
  { value: 'developer',  label: 'Desarrollador', variant: 'primary' },
]

export const roleLabel   = Object.fromEntries(ROLES.map(r => [r.value, r.label]))
export const roleVariant = Object.fromEntries(ROLES.map(r => [r.value, r.variant]))