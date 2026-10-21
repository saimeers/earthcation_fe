/** Filtro de habilitados/deshabilitados de los catálogos (localidades, organizaciones). */
export type StatusFilter = 'all' | 'active' | 'inactive'

export const matchesStatus = (isActive: boolean, filter: StatusFilter): boolean =>
  filter === 'all' ? true : filter === 'active' ? isActive : !isActive

/** ¿Contiene `text` la búsqueda (sin distinguir mayúsculas)? */
export const includesQuery = (text: string, query: string): boolean => text.toLowerCase().includes(query.toLowerCase())
