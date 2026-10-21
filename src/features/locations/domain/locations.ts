import type { LocationDto, Uuid } from '@/shared/api/types'
import { includesQuery, matchesStatus, type StatusFilter } from '@/shared/lib/filters'
import { normalizeText } from '@/shared/lib/format'

export type Location = LocationDto

export interface LocationInput {
  municipality: string
  department: string
  country: string
}

export const EMPTY_LOCATION: LocationInput = { municipality: '', department: '', country: 'Colombia' }

export const toLocationInput = (l: Location): LocationInput =>
  ({ municipality: l.municipality, department: l.department, country: l.country })

/** Lista de la página de localidades: búsqueda por municipio, departamento o país + estado. */
export const filterLocations = (list: Location[], search: string, status: StatusFilter): Location[] =>
  list.filter(l => includesQuery(`${l.municipality} ${l.department} ${l.country}`, search) && matchesStatus(l.is_active, status))

const MAX_RESULTS = 80

/**
 * Búsqueda del selector de municipio: solo habilitados, sin tildes, primero los municipios que
 * empiezan con lo escrito. Devuelve como mucho 80.
 */
export function searchLocations(list: Location[], query: string): Location[] {
  const q = normalizeText(query)
  const active = list.filter(l => l.is_active !== false)
  const found = q ? active.filter(l => normalizeText(`${l.municipality} ${l.department}`).includes(q)) : active
  const rank = (l: Location) => (normalizeText(l.municipality).startsWith(q) ? 0 : 1)
  return [...found].sort((a, b) => (q ? rank(a) - rank(b) : 0)).slice(0, MAX_RESULTS)
}

export const findLocation = (list: Location[] | undefined, id: Uuid | null | undefined): Location | null =>
  (list ?? []).find(l => l.id === id) ?? null
