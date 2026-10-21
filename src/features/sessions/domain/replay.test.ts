import { describe, it, expect } from 'vitest'
import { replaySeries } from './replay'
import type { GameEvent } from './telemetry'

const ev = (id: number, event_type: string, t_ms: number | null, health: number | null, stage: string | null = null): GameEvent =>
  ({ id, event_type, t_ms, health, stage, risk_id: null, payload: {} })

describe('replaySeries', () => {
  it('arma la curva de vida, las bandas de etapa y las marcas', () => {
    const events = [
      ev(1, 'stage_enter', 0, 100, 'PickingMuro1'),
      ev(2, 'gas_alarm', 1000, 90),
      ev(3, 'stage_enter', 2000, 90, 'Support1'),
      ev(4, 'risk_info_shown', null, null),
      ev(5, 'level_complete', 5000, 80),
    ]
    const { points, stages, marks, feed } = replaySeries(events)
    expect(points.map(p => p.id)).toEqual([1, 2, 3, 5])
    expect(stages).toEqual([{ stage: 'PickingMuro1', from: 0, to: 2000 }, { stage: 'Support1', from: 2000, to: 5000 }])
    expect(marks.map(m => m.id)).toEqual([2, 5])
    expect(feed).toHaveLength(5)
  })

  it('sin eventos no hay nada que dibujar', () => {
    expect(replaySeries([])).toEqual({ points: [], stages: [], marks: [], feed: [] })
  })
})
