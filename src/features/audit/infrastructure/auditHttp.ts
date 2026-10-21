import { v1 } from '@/shared/api/v1'
import type { AuditEntryDto } from '@/shared/api/types'
import type { AuditGateway } from '../application/ports'
import { toQuery } from '../domain/audit'

const PAGE_SIZE = 25

export const auditHttp: AuditGateway = {
  list: (filters, page) => v1.page<AuditEntryDto>('/audit-logs', { ...toQuery(filters), page, limit: PAGE_SIZE }),
  exportCsv: (filters) => v1.getBlob('/audit-logs/export', toQuery(filters)),
}
