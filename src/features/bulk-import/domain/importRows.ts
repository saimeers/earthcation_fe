import type { ConfirmImportResponseDto, ImportRowDto } from '@/shared/api/types'

export type ImportRow = ImportRowDto
export type ImportResult = ConfirmImportResponseDto

/** Campos que el admin puede corregir en la vista previa. */
export type EditableField = 'cedula' | 'first_name' | 'last_name' | 'email' | 'organization_name' | 'location_municipality' | 'location_department'

export type StatusTone = 'ok' | 'warning' | 'error' | 'none'

const STATUS: Record<string, { text: string, tone: StatusTone }> = {
  ok: { text: 'Listo', tone: 'ok' },
  duplicate_in_file: { text: 'Repetido en archivo', tone: 'warning' },
  duplicate_in_db: { text: 'Ya existe', tone: 'warning' },
  missing_required: { text: 'Falta información', tone: 'error' },
}

/** Estado de una fila en español (un estado desconocido se muestra tal cual). */
export const rowStatus = (status: string): { text: string, tone: StatusTone } => STATUS[status] ?? { text: status, tone: 'none' }

export interface ImportCounts { ok: number, duplicate: number, missing: number }

export const countRows = (rows: ImportRow[]): ImportCounts => ({
  ok: rows.filter(r => r.status === 'ok').length,
  duplicate: rows.filter(r => r.status === 'duplicate_in_file' || r.status === 'duplicate_in_db').length,
  missing: rows.filter(r => r.status === 'missing_required').length,
})

/** Al leer el archivo quedan seleccionadas solo las filas listas. */
export const initialSelection = (rows: ImportRow[]): Set<number> =>
  new Set(rows.map((_, i) => i).filter(i => rows[i].status === 'ok'))

export function toggleIndex(selected: Set<number>, index: number): Set<number> {
  const next = new Set(selected)
  if (next.has(index)) next.delete(index)
  else next.add(index)
  return next
}

/** Seleccionar todo, o nada si ya estaban todas. */
export const toggleAll = (selected: Set<number>, total: number): Set<number> =>
  (selected.size === total ? new Set() : new Set(Array.from({ length: total }, (_, i) => i)))

export const editRow = (rows: ImportRow[], index: number, field: EditableField, value: string): ImportRow[] =>
  rows.map((r, i) => (i === index ? { ...r, [field]: value } : r))

export const selectedRows = (rows: ImportRow[], selected: Set<number>): ImportRow[] => rows.filter((_, i) => selected.has(i))

const unique = (values: (string | null | undefined)[]): string[] => [...new Set(values.filter((v): v is string => !!v))]

/** Lo que la carga creó por el camino y conviene revisar (organizaciones, localidades, sin coincidencia). */
export const importSideEffects = (result: ImportResult) => ({
  newOrgs: unique(result.created.map(r => r.organization_created)),
  newLocations: unique(result.created.map(r => r.location_created)),
  noMatchLocations: unique(result.created.map(r => r.location_no_match)),
})
