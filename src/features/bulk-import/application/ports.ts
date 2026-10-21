import { definePort } from '@/shared/lib/ports'
import type { ImportResult, ImportRow } from '../domain/importRows'

/** Carga masiva en dos pasos: la API lee el Excel ANM y luego crea las filas confirmadas. */
export interface BulkImportGateway {
  parse(file: File): Promise<ImportRow[]>
  confirm(rows: ImportRow[]): Promise<ImportResult>
}

export const bulkImportPort = definePort<BulkImportGateway>('bulk-import')
