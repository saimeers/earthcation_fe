import type { IsoDate, Uuid } from './common'

/** Un registro de GET /api/v1/audit-logs. */
export interface AuditEntryDto {
  id: Uuid
  occurred_at: IsoDate
  actor_id: Uuid | null
  actor_role: string | null
  action: string
  target_type: string
  target_id: string | null
  /** Qué cambió, sin datos personales (nombres de campos, el rol, conteos). */
  changes: Record<string, unknown>
  ip_hash: string | null
  user_agent: string | null
}

export interface PageMetaDto { page: number, limit: number, total: number, total_pages: number }
