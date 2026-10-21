import type { AttemptOutcome } from './sessions'

/** GET /api/telemetry/overview[?session_id=] */
export interface TelemetryOverviewDto {
  levels: { level_key: string, outcome: AttemptOutcome, count: number, avg_duration_ms?: number | null, players?: number }[]
  fail_reasons: { level_key: string, fail_reason: string | null, fail_risk_id?: string | null, fail_stage?: string | null, count: number }[]
  retries?: { level_key: string, avg_attempt_number: number, max_attempt_number: number }[]
  gas_brands?: { gas_brand: string, attempts: number, calibrated: number }[]
  risks?: { risk_id: string, risk_name: string, category: string, results: number, mitigated: number, failed: number, fail_rate: number, mistakes_total: number, avg_reaction_ms: number | null }[]
  event_counts?: { event_type: string, count: number }[]
}

export interface TelemetryOverviewParams { session_id?: string }

/** Evento del juego dentro de un intento. `payload` depende de `event_type` (docs/TELEMETRY.md del backend). */
export interface GameEventDto {
  id: string | number
  event_type: string
  stage: string | null
  risk_id: string | null
  t_ms: number | null
  health: number | null
  payload: Record<string, unknown> | null
}

/** GET /api/telemetry/attempts/:id */
export interface AttemptDetailDto {
  events: GameEventDto[]
}
