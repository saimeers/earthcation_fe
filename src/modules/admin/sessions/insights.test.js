import { describe, it, expect } from 'vitest'
import { sessionInsights } from './insights'

describe('sessionInsights', () => {
  it('sin datos no inventa conclusiones', () => {
    expect(sessionInsights(null)).toEqual([])
    expect(sessionInsights({ summary: { participants: 2 } }).map(i => i.title)).toEqual(['Esperando resultados'])
  })

  it('prioriza el riesgo más difícil, la causa de fallo y quién necesita refuerzo', () => {
    const titles = sessionInsights({
      summary: { participants: 2, with_data: 2 },
      risks: [{ risk_name: 'Derrumbe', failed: 3, results: 4, fail_rate: 75 }],
      fail_reasons: [{ fail_reason: 'derrumbe', count: 2, level_key: 'level1' }],
      participants: [
        { band: 'refuerzo', percentage: 20, total_attempts: 1, user: { first_name: 'Luis' } },
        { band: 'destacado', percentage: 90, total_attempts: 1, user: { first_name: 'Ana', last_name: 'Ruiz' } },
      ],
    }).map(i => i.title)
    expect(titles).toEqual([
      'Riesgo más difícil: Derrumbe',
      'Causa de fallo más común: Derrumbe',
      '1 participante necesita refuerzo',
      'Mejor desempeño: Ana Ruiz',
    ])
  })
})
