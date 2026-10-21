import type { PageMetaDto } from '@/shared/api/types'
import { definePort } from '@/shared/lib/ports'
import type { AuditEntry, AuditFilters } from '../domain/audit'

export interface AuditPage { items: AuditEntry[], meta: PageMetaDto }

/** GET /api/v1/audit-logs y /api/v1/audit-logs/export (CSV). */
export interface AuditGateway {
  list(filters: AuditFilters, page: number): Promise<AuditPage>
  exportCsv(filters: AuditFilters): Promise<Blob>
}

export const auditPort = definePort<AuditGateway>('audit')

export const auditKeys = {
  list: (filters: AuditFilters, page: number) => ['audit', 'list', filters, page] as const,
}
