import { describe, it, expect } from 'vitest'
import type { Participant, Session } from './sessions'
import {
  attemptsByLevel, canEnd, canStart, challengeSummary, eventCountItems, exportFileName, failCountsByStage, failReasonItems,
  filterParticipants, filterSessions, selectedAttemptId, sessionDuration, showsRoomQr, stageFailItems,
} from './sessions'
import { bandFor, bandForAverage, rateTone } from './bands'
import { attemptText, describeChallengeRound, describeEvent, eventTone, failReasonLabel, levelLabel, presentCounters, stageLabel } from './telemetry'
import { roomLink } from './roomLink'
import type { Attempt, GameEvent } from './telemetry'

const session = (data: Partial<Session>): Session => ({ id: 's', name: 'Sala', code: '123', status: 'waiting', is_free_play: false, started_at: null, ended_at: null, ...data })
const participant = (name: string, data: object): Participant =>
  ({ user: { id: name, first_name: name, last_name: null, cedula: '1' }, organization: null, telemetry: { attempts: 0 }, ...data }) as unknown as Participant
const attempt = (id: string, level_key: string, outcome: Attempt['outcome'], fail_stage: string | null = null): Attempt =>
  ({ id, level_key, attempt_number: 1, outcome, fail_reason: outcome === 'failed' ? 'derrumbe' : null, fail_stage, duration_ms: 90000 })

describe('bandas de desempeño (mismos cortes que el backend)', () => {
  it('cortes en 80 y 40', () => {
    expect(bandFor(80)).toBe('destacado')
    expect(bandFor(79)).toBe('en_progreso')
    expect(bandFor(40)).toBe('en_progreso')
    expect(bandFor(39)).toBe('refuerzo')
    expect(bandFor(100, false)).toBe('sin_datos')
    expect(bandForAverage(null)).toBe('sin_datos')
  })

  it('tono del dominio de un riesgo', () => {
    expect(rateTone(85)).toBe('good')
    expect(rateTone(50)).toBe('warning')
    expect(rateTone(10)).toBe('critical')
    expect(rateTone(null)).toBe('neutral')
  })
})

describe('vocabulario del juego', () => {
  it('niveles, retos, etapas y causas en español', () => {
    expect(levelLabel('level2')).toBe('Nivel 2')
    expect(levelLabel('reto_memoria')).toBe('Reto de memoria')
    expect(stageLabel('Methane1')).toBe('Metano 1')
    expect(failReasonLabel('intoxicacion_metano')).toBe('Intoxicación por metano')
    expect(failReasonLabel(null)).toBe('—')
  })

  it('rondas de reto', () => {
    expect(describeChallengeRound('Reaccion', { passed: true, avg_ms: 420, best_ms: 300 }))
      .toBe('Ronda superada: reacción media 420 ms (mejor 300 ms), 0 falsas alarmas, 0 omisiones')
  })

  it('eventos legibles y su tono', () => {
    const e = (event_type: string, payload: Record<string, unknown> = {}, extra: Partial<GameEvent> = {}): GameEvent =>
      ({ id: 1, event_type, stage: null, risk_id: null, t_ms: 0, health: 100, payload, ...extra })
    expect(describeEvent(e('gas_alarm', { reading_lel: 25 }))).toBe('Suena la alarma de gas (25% LEL)')
    expect(describeEvent(e('risk_mitigated', { reaction_ms: 1500 }, { risk_id: 'CR-04' }))).toBe('Mitiga CR-04 en 1,5 s')
    expect(describeEvent(e('evento_nuevo'))).toBe('evento_nuevo')
    expect(eventTone('challenge_round', { passed: false })).toBe('bad')
    expect(eventTone('gas_alarm')).toBe('warn')
    expect(eventTone('stage_enter')).toBe('info')
  })

  it('resumen de un intento y contadores presentes', () => {
    expect(attemptText(attempt('a', 'level1', 'failed', 'Support1'))).toBe('Intento 1: Fallido · Derrumbe en «Sostenimiento 1» · 1:30')
    expect(presentCounters({ hose_hit: 2, coal_collected: 3, desconocido: 1 }).map(([k]) => k)).toEqual(['coal_collected', 'hose_hit'])
  })
})

describe('sesiones', () => {
  it('filtra por texto, estado y localidad', () => {
    const list = [
      session({ id: '1', name: 'Mañana', status: 'active', location_id: 'L1' }),
      session({ id: '2', name: 'Tarde', status: 'finished', location: { id: 'L2', municipality: '', department: '', country: '', is_active: true } }),
    ]
    expect(filterSessions(list, { search: 'tar', status: 'all', locationId: 'all' }).map(s => s.id)).toEqual(['2'])
    expect(filterSessions(list, { search: '', status: 'active', locationId: 'all' }).map(s => s.id)).toEqual(['1'])
    expect(filterSessions(list, { search: '', status: 'all', locationId: 'L2' }).map(s => s.id)).toEqual(['2'])
  })

  it('acciones según el estado y duración', () => {
    expect(canStart(session({ status: 'waiting' }))).toBe(true)
    expect(canStart(session({ status: 'waiting', is_free_play: true }))).toBe(false)
    expect(canEnd(session({ status: 'active' }))).toBe(true)
    expect(showsRoomQr(session({ status: 'finished' }))).toBe(false)
    expect(sessionDuration(session({ started_at: '2026-10-20T10:00:00Z', ended_at: '2026-10-20T10:45:00Z' }))).toBe(45)
    expect(sessionDuration(session({ started_at: '2026-10-20T10:00:00Z' }))).toBeNull()
    expect(sessionDuration(session({ started_at: '2026-10-20T10:00:00Z' }), new Date('2026-10-20T10:10:00Z'))).toBe(10)
    expect(exportFileName('927', new Date('2026-10-20T12:00:00Z'))).toBe('sesion-927-2026-10-20.xlsx')
    expect(roomLink('https://play.test', '9 27')).toBe('https://play.test/?sala=9%2027')
  })

  it('filtra y ordena participantes', () => {
    const list = [
      participant('Ana', { band: 'destacado', percentage: 90, total_attempts: 2 }),
      participant('Luis', { band: 'refuerzo', percentage: 20, total_attempts: 2 }),
      participant('Sin', { band: 'sin_datos', percentage: 0, total_attempts: 0 }),
    ]
    expect(filterParticipants(list, { search: '', band: null, sort: 'pct_asc' }).map(p => p.user.first_name)).toEqual(['Luis', 'Ana', 'Sin'])
    expect(filterParticipants(list, { search: 'ana', band: null, sort: 'name' }).map(p => p.user.first_name)).toEqual(['Ana'])
    expect(filterParticipants(list, { search: '', band: 'refuerzo', sort: 'pct_desc' })).toHaveLength(1)
  })

  it('agregados de telemetría', () => {
    expect(failReasonItems([{ fail_reason: 'derrumbe', count: 1 }, { fail_reason: 'fatiga', count: 3 }, { fail_reason: 'derrumbe', count: 1 }]))
      .toEqual([{ key: 'fatiga', label: 'Lesión por fatiga', value: 3 }, { key: 'derrumbe', label: 'Derrumbe', value: 2 }])
    expect(stageFailItems([{ level_key: 'level1', attempts: 2, best_time_ms: null, completed: 0, failed: 2, abandoned: 0, fail_stages: { Support1: 2 } }]))
      .toEqual([{ key: 'level1-Support1', label: 'Nivel 1 · Sostenimiento 1', value: 2 }])
    expect(eventCountItems({ event_counts: [{ event_type: 'gas_alarm', count: 4 }, { event_type: 'level_started', count: 9 }] }))
      .toEqual([{ key: 'gas_alarm', label: 'Alarmas de gas', value: 4 }])
  })

  it('intentos de un participante', () => {
    const attempts = [attempt('a1', 'level1', 'failed', 'Support1'), attempt('a2', 'level1', 'completed'), attempt('r1', 'reto_memoria', 'failed')]
    expect(Object.keys(attemptsByLevel(attempts))).toEqual(['level1', 'reto_memoria'])
    expect(selectedAttemptId(attempts, null)).toBe('r1')
    expect(selectedAttemptId(attempts, 'a1')).toBe('a1')
    expect(selectedAttemptId(attempts, 'borrado')).toBe('r1')
    expect(failCountsByStage(attempts)).toEqual({ Support1: 1 })
    expect(challengeSummary(attempts.slice(0, 2))).toMatchObject({ passed: 1, total: 2, lastText: 'superado' })
  })
})
