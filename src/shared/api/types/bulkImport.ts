export type ImportRowStatus = 'ok' | 'duplicate_in_file' | 'duplicate_in_db' | 'missing_required'

/** Fila del Excel ANM ya leída por la API (POST /api/users/bulk-import/parse). */
export interface ImportRowDto {
  cedula: string
  first_name: string
  last_name: string
  email: string
  organization_name: string
  location_municipality: string
  location_department: string
  status: ImportRowStatus | (string & {})
  message?: string | null
}

export interface ParseImportResponseDto { rows: ImportRowDto[] }

export interface ImportCreatedDto {
  organization_created?: string | null
  location_created?: string | null
  location_no_match?: string | null
}

/** POST /api/users/bulk-import/confirm */
export interface ConfirmImportResponseDto {
  created: ImportCreatedDto[]
  skipped: unknown[]
}
