import type { IsoDate, PersonDto, Uuid, VarkProfileDto } from './common'

/** GET /api/analytics/overview */
export interface AnalyticsOverviewDto {
  users: { total: number, players: number, instructors: number }
  sessions: { total: number, active: number }
  progress: { total_attempts: number, total_mitigated: number, global_percentage: number, history_results?: number, level_attempts?: number }
  vark_distribution: { style: string, count: number }[]
  progress_by_level: { level: string, percentage: number, mitigated: number, total: number }[]
  riesgos_mas_fallados: { risk_id: string, name: string, category: string, total_attempts: number, failed: number, fail_rate: number, avg_mistakes: number }[]
  tendencia_temporal: { week: IsoDate, total: number, mitigated: number, percentage: number }[]
}

/** GET /api/vark/all */
export interface VarkEntryDto extends VarkProfileDto {
  user_id: Uuid
  user?: (PersonDto & { profile?: { organization?: { name: string } | null } | null }) | null
}

/** GET /api/analytics/map: una organización ubicada. */
export interface MineDto {
  id: Uuid
  name: string
  municipality: string | null
  department: string
  lat?: number | null
  lng?: number | null
  location_exact?: boolean
  player_count: number
  results?: number | null
  percentage: number
}

/** GET /api/analytics/organization/:id: desempeño de cada jugador de la organización. */
export interface OrganizationPlayerDto {
  user?: PersonDto | null
  dominant_style: string | null
  percentage: number
  mitigated: number
  total_attempts: number
}
