import type { ProgressRowDto } from '@/shared/api/types'

export type ProgressRow = ProgressRowDto

// Igual que el backend (earthcation_be/src/utils/attempt.utils.js): el % de éxito de un jugador en
// un nivel es el de su ÚLTIMO intento; reintentar reemplaza el %, no lo promedia con lo anterior.
const dayOf = (date: string | null | undefined) => (date ? new Date(date).toISOString().slice(0, 10) : '')
const attemptKey = (r: ProgressRow) => r.attempt_id ?? `sin-intento:${r.session_id ?? ''}:${dayOf(r.recorded_at)}`
const levelOf = (r: ProgressRow) => r.risk?.level_id ?? r.risk?.level?.id ?? null

export interface LevelResult {
  level_id: number | string | null
  level_name: string
  attempts: number
  rows: ProgressRow[]
  total: number
  mitigated: number
  percentage: number
}

/** Por nivel: filas del último intento y cuántas veces se intentó. */
export function latestAttemptsByLevel(progress: ProgressRow[] = []): LevelResult[] {
  const byLevel = new Map<LevelResult['level_id'], Map<string, { rows: ProgressRow[], last: number }>>()
  for (const row of progress) {
    const level = levelOf(row)
    if (!byLevel.has(level)) byLevel.set(level, new Map())
    const attempts = byLevel.get(level)!
    const key = attemptKey(row)
    if (!attempts.has(key)) attempts.set(key, { rows: [], last: 0 })
    const a = attempts.get(key)!
    a.rows.push(row)
    a.last = Math.max(a.last, new Date(row.recorded_at).getTime() || 0)
  }
  return [...byLevel.entries()].map(([level_id, attempts]) => {
    const list = [...attempts.values()].sort((a, b) => a.last - b.last)
    const rows = list[list.length - 1].rows
    const mitigated = rows.filter(r => r.is_mitigated).length
    return {
      level_id,
      level_name: rows[0]?.risk?.level?.name ?? 'Sin nivel',
      attempts: list.length,
      rows,
      total: rows.length,
      mitigated,
      percentage: rows.length ? Math.round((mitigated / rows.length) * 100) : 0,
    }
  })
}

export interface ProgressStats {
  /** Riesgos enfrentados en el último intento de cada nivel. */
  totalAttempts: number
  mitigated: number
  percentage: number
  /** Promedio de todas las filas con tiempo de reacción (null si ninguna). */
  avgReactionMs: number | null
}

/** Resumen del detalle de un jugador: % del último intento de cada nivel y reacción promedio. */
export function progressStats(progress: ProgressRow[]): ProgressStats {
  const latest = latestAttemptsByLevel(progress)
  const totalAttempts = latest.reduce((a, l) => a + l.total, 0)
  const mitigated = latest.reduce((a, l) => a + l.mitigated, 0)
  const withTime = progress.filter(p => p.reaction_time_ms)
  return {
    totalAttempts,
    mitigated,
    percentage: totalAttempts > 0 ? Math.round((mitigated / totalAttempts) * 100) : 0,
    avgReactionMs: withTime.length ? withTime.reduce((a, p) => a + (p.reaction_time_ms ?? 0), 0) / withTime.length : null,
  }
}

/** 1234 → "1.2s" (formato histórico del detalle de usuario). */
export const shortSeconds = (ms: number | null | undefined): string => (ms ? `${(ms / 1000).toFixed(1)}s` : '—')
