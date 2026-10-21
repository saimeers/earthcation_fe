import type { OrganizationDto } from '@/shared/api/types'
import { includesQuery, matchesStatus, type StatusFilter } from '@/shared/lib/filters'

export type Organization = OrganizationDto

export const ORG_TYPES = ['empresa', 'institución', 'cooperativa', 'fundación', 'otra'] as const

export interface OrganizationInput {
  name: string
  type: string
}

export const toOrganizationInput = (o: Organization | null): OrganizationInput =>
  (o ? { name: o.name, type: o.type ?? '' } : { name: '', type: '' })

export const filterOrganizations = (list: Organization[], search: string, status: StatusFilter): Organization[] =>
  list.filter(o => includesQuery(`${o.name} ${o.type ?? ''}`, search) && matchesStatus(o.is_active, status))

/** Opciones de un selector: las habilitadas y, si ya estaba elegida, también esa aunque esté deshabilitada. */
export const selectableOrganizations = (list: Organization[], selectedId: string | null | undefined): Organization[] =>
  list.filter(o => o.is_active !== false || o.id === selectedId)
