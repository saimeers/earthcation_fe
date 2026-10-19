import { describe, it, expect } from 'vitest'
import { latestAttemptsByLevel } from './attempts'

const row = (attempt_id, recorded_at, is_mitigated) => ({
  attempt_id, recorded_at, is_mitigated, risk: { level_id: 1, level: { id: 1, name: 'Nivel 1' } },
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
