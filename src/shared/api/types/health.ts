export interface MinuteTrafficDto { minute: string, requests: number, errors: number }
export interface RouteMetricsDto { route: string, requests: number, errors: number, p50_ms: number, p95_ms: number }

/** GET /api/v1/health/details */
export interface HealthDto {
  status: string
  version: string
  uptime_s: number | null
  memory_mb: number
  database?: {
    ok: boolean
    ms?: number
    error?: string
    pool?: { size?: number, available: number, using: number, waiting: number, max: number }
  }
  redis?: { ok: boolean | null, ms?: number, error?: string, mode?: string }
  metrics?: {
    window_minutes?: number
    requests?: number
    errors?: number
    p50_ms?: number | null
    p95_ms?: number | null
    per_minute?: MinuteTrafficDto[]
    routes?: RouteMetricsDto[]
  }
}
