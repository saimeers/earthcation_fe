import type { IsoDate, LocationDto, PersonDto, Uuid } from './common'
import type { UserDto } from './users'

export type SessionStatus = 'waiting' | 'active' | 'finished'
export type PerformanceBand = 'destacado' | 'en_progreso' | 'refuerzo' | 'sin_datos'
export type AttemptOutcome = 'completed' | 'failed' | 'abandoned' | 'in_progress'

export interface SessionDto {
  id: Uuid
  name: string
  code: string | null
  status: SessionStatus
  is_free_play: boolean
  instructor_id?: Uuid | null
  location_id?: Uuid | null
  started_at: IsoDate | null
  ended_at: IsoDate | null
  created_at?: IsoDate
  instructor?: PersonDto | null
  location?: LocationDto | null
  participants?: { id: Uuid, user_id: Uuid, session_id?: Uuid, joined_at?: IsoDate }[]
}

export interface CreateSessionDto { name: string, location_id: Uuid }

export interface AttemptSummaryDto {
  id: Uuid
  level_key: string
  attempt_number: number
  outcome: AttemptOutcome
  fail_reason: string | null
  fail_stage: string | null
  duration_ms: number | null
}

export interface ParticipantRiskDto {
  risk_id: string
  risk_name: string
  category: string
  level_name: string
  results: number
  mitigated: number
  failed: number
  mitigation_rate: number | null
  mistakes_total: number
  avg_reaction_ms: number | null
  last_result: 'mitigated' | 'failed'
}

export interface ParticipantLevelDto {
  level_key: string
  attempts?: number
  attempts_until_first_completion: number | null
  best_time_ms: number | null
  total_time_ms: number | null
}

export interface ParticipantTelemetryDto {
  attempts: number
  completed: number
  failed: number
  abandoned: number
  best_time_ms: number | null
  journeys: Record<string, AttemptSummaryDto[]>
  levels: ParticipantLevelDto[]
  top_fail_reason: { reason: string, count: number } | null
}

export interface SessionParticipantDto {
  user: PersonDto
  organization: string | null
  dominant_style: string | null
  band: PerformanceBand
  percentage: number
  mitigated: number
  total_attempts: number
  mistakes_total: number
  avg_reaction_ms: number | null
  weakest_risk: ParticipantRiskDto | null
  risks: ParticipantRiskDto[]
  telemetry: ParticipantTelemetryDto
}

export interface SessionSummaryDto {
  participants: number
  with_data: number
  avg_percentage: number | null
  risk_mitigated: number
  risk_results: number
  completion_rate: number | null
  level_completed: number
  level_attempts: number
  avg_reaction_ms: number | null
  bands: Record<PerformanceBand, number>
}

export interface SessionRiskDto {
  risk_id: string
  risk_name: string
  category: string
  level_name: string
  results: number
  failed: number
  fail_rate: number | null
  mitigation_rate: number | null
}

export interface SessionLevelDto {
  level_key: string
  attempts: number
  best_time_ms: number | null
  completed: number
  failed: number
  abandoned: number
  fail_stages?: Record<string, number>
}

export interface FailReasonDto {
  fail_reason: string
  fail_stage?: string | null
  level_key: string
  count: number
}

/** GET /api/v1/sessions/:id */
export interface SessionProgressDto {
  session: SessionDto
  summary: SessionSummaryDto
  participants: SessionParticipantDto[]
  risks: SessionRiskDto[]
  levels: SessionLevelDto[]
  fail_reasons: FailReasonDto[]
}

export interface GroupRiskDto { mitigation_rate: number | null, avg_reaction_ms: number | null }
export interface GroupLevelDto { avg_attempts_until_first_completion: number | null }

/** GET /api/v1/sessions/:id/participants/:userId/analysis */
export interface ParticipantAnalysisDto {
  session: SessionDto
  user: UserDto
  participant: SessionParticipantDto
  group: {
    participants: number
    rank: number | null
    avg_percentage: number | null
    avg_reaction_ms: number | null
    avg_mistakes_per_result: number | null
    risks?: Record<string, GroupRiskDto>
    levels?: Record<string, GroupLevelDto>
  }
  navigation: { index: number, total: number, prev: Uuid | null, next: Uuid | null }
  reading: { avg_read_ms: number | null, group_avg_read_ms: number | null, panels: number }
  summary_counters: Record<string, number | null> | null
  attempts: AttemptSummaryDto[]
}
