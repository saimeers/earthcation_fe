import { describe, it, expect } from 'vitest'
import { latestAttemptsByLevel, progressStats, shortSeconds, type ProgressRow } from './attempts'

const row = (attempt_id: string | null, recorded_at: string, is_mitigated: boolean, reaction_time_ms: number | null = null): ProgressRow => ({
  id: `${attempt_id}-${recorded_at}`, risk_id: 'CR-01', attempt_id, recorded_at, is_mitigated, reaction_time_ms,
  risk: { level_id: 1, level: { id: 1, name: 'Nivel 1' } },
})

describe('latestAttemptsByLevel', () => {
  it('el % es el del último intento, no el promedio', () => {
    const [level] = latestAttemptsByLevel([
      row('a1', '2026-10-01T10:00:00Z', false),
      row('a1', '2026-10-01T10:01:00Z', false),
      row('a2', '2026-10-02T10:00:00Z', true),
      row('a2', '2026-10-02T10:01:00Z', true),
    ])
    expect(level).toMatchObject({ level_id: 1, level_name: 'Nivel 1', attempts: 2, total: 2, mitigated: 2, percentage: 100 })
  })

  it('filas sin intento se agrupan por día', () => {
    const [level] = latestAttemptsByLevel([row(null, '2026-10-01T10:00:00Z', true), row(null, '2026-10-01T11:00:00Z', false)])
    expect(level).toMatchObject({ attempts: 1, total: 2, percentage: 50 })
  })

  it('sin progreso no hay niveles', () => expect(latestAttemptsByLevel()).toEqual([]))
})

describe('progressStats', () => {
  it('resume el % del último intento y la reacción promedio de todas las filas', () => {
    const stats = progressStats([
      row('a1', '2026-10-01T10:00:00Z', false, 1000),
      row('a2', '2026-10-02T10:00:00Z', true, 3000),
    ])
    expect(stats).toEqual({ totalAttempts: 1, mitigated: 1, percentage: 100, avgReactionMs: 2000 })
    expect(shortSeconds(stats.avgReactionMs)).toBe('2.0s')
  })

  it('sin datos', () => {
    expect(progressStats([])).toEqual({ totalAttempts: 0, mitigated: 0, percentage: 0, avgReactionMs: null })
    expect(shortSeconds(null)).toBe('—')
  })
})
