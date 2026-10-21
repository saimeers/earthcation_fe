import { describe, it, expect } from 'vitest'
import type { ParticipantAnalysisDto, SessionProgressDto } from '@/shared/api/types'
import { participantInsights, sessionInsights } from './insights'

// Las pruebas arman solo los campos que lee cada regla
const session = (data: object) => data as Partial<SessionProgressDto>
const analysis = (data: object) => data as ParticipantAnalysisDto

describe('sessionInsights', () => {
  it('sin datos no inventa conclusiones', () => {
    expect(sessionInsights(null)).toEqual([])
    expect(sessionInsights(session({ summary: { participants: 2 } })).map(i => i.title)).toEqual(['Esperando resultados'])
  })

  it('prioriza el riesgo más difícil, la causa de fallo y quién necesita refuerzo', () => {
    const titles = sessionInsights(session({
      summary: { participants: 2, with_data: 2 },
      risks: [{ risk_name: 'Derrumbe', failed: 3, results: 4, fail_rate: 75 }],
      fail_reasons: [{ fail_reason: 'derrumbe', count: 2, level_key: 'level1' }],
      participants: [
        { band: 'refuerzo', percentage: 20, total_attempts: 1, user: { first_name: 'Luis' } },
        { band: 'destacado', percentage: 90, total_attempts: 1, user: { first_name: 'Ana', last_name: 'Ruiz' } },
      ],
    })).map(i => i.title)
    expect(titles).toEqual([
      'Riesgo más difícil: Derrumbe',
      'Causa de fallo más común: Derrumbe',
      '1 participante necesita refuerzo',
      'Mejor desempeño: Ana Ruiz',
    ])
  })

  it('si nadie quedó en refuerzo lo dice', () => {
    const [first] = sessionInsights(session({ summary: { participants: 1, with_data: 1 }, participants: [] }))
    expect(first).toMatchObject({ icon: 'nobody_behind', tone: 'good' })
  })
})

describe('participantInsights', () => {
  const base = {
    participant: {
      risks: [{ risk_id: 'CR-01', risk_name: 'Vibración', results: 4, mitigated: 4, failed: 0, mitigation_rate: 100 }],
      weakest_risk: { risk_id: 'CR-04', risk_name: 'Derrumbe', results: 2, failed: 2 },
      avg_reaction_ms: 900,
      telemetry: { attempts: 2, failed: 1, levels: [{ level_key: 'level1', attempts_until_first_completion: 2 }], top_fail_reason: { reason: 'derrumbe', count: 1 } },
    },
    group: { avg_reaction_ms: 2000, risks: { 'CR-04': { mitigation_rate: 50 } }, levels: { level1: { avg_attempts_until_first_completion: 1.5 } } },
    reading: { avg_read_ms: 1000, group_avg_read_ms: 4000, panels: 3 },
    summary_counters: { exits_uncalibrated: 2, calibrations_invalid: 0 },
  }

  it('arma fortaleza, punto débil, reintentos, causa, reacción, detector y lectura', () => {
    const result = participantInsights(analysis(base))
    expect(result.map(i => i.icon)).toEqual(['strength', 'weakness', 'retries', 'fail_cause', 'reaction', 'detector'])
    expect(result[1].body).toBe('Falló 2 de 2 veces — el grupo lo mitiga el 50% de las veces.')
    expect(result[2]).toMatchObject({ tone: 'warn', title: 'Superó el Nivel 1 en el 2.º intento' })
    expect(result[4].title).toBe('Reacciona 1,1 s más rápido que el grupo')
    expect(result[5].body).toBe('Avanzó sin calibrar 2 veces.')
  })

  it('sin niveles completados avisa cuántos intentos lleva', () => {
    const data = analysis({ ...base, participant: { ...base.participant, risks: [], weakest_risk: null, avg_reaction_ms: null, telemetry: { ...base.participant.telemetry, levels: [{ level_key: 'level1', attempts_until_first_completion: null }], top_fail_reason: null } }, summary_counters: {} })
    expect(participantInsights(data).map(i => i.title)).toEqual(['Aún no completa ningún nivel', 'Lee poco los paneles informativos'])
  })
})
