import { describe, it, expect } from 'vitest'
import {
  bandFor, describeChallengeRound, failReasonLabel, formatDuration, formatPct, fullName, initials, levelLabel,
} from './format'

describe('format', () => {
  it('duraciones y porcentajes', () => {
    expect(formatDuration(154321)).toBe('2:34')
    expect(formatDuration(null)).toBe('—')
    expect(formatPct(79.6)).toBe('80%')
    expect(formatPct(undefined)).toBe('—')
  })

  it('nombres', () => {
    expect(fullName({ first_name: 'Ana', last_name: 'Ruiz' })).toBe('Ana Ruiz')
    expect(fullName({ username: '1090' })).toBe('1090')
    expect(initials({ first_name: 'ana', last_name: 'ruiz' })).toBe('AR')
  })

  it('niveles y retos', () => {
    expect(levelLabel('level2')).toBe('Nivel 2')
    expect(levelLabel('reto_memoria')).toBe('Reto de memoria')
  })

  it('causas de fallo en español', () => {
    expect(failReasonLabel('intoxicacion_metano')).toBe('Intoxicación por metano')
    expect(failReasonLabel(null)).toBe('—')
  })

  // Mismos cortes que el backend (session.service.js#performanceBand)
  it('bandas de desempeño', () => {
    expect(bandFor(80)).toBe('destacado')
    expect(bandFor(79)).toBe('en_progreso')
    expect(bandFor(40)).toBe('en_progreso')
    expect(bandFor(39)).toBe('refuerzo')
    expect(bandFor(100, false)).toBe('sin_datos')
  })

  it('rondas de reto', () => {
    expect(describeChallengeRound('Reaccion', { passed: true, avg_ms: 420, best_ms: 300 }))
      .toBe('Ronda superada: reacción media 420 ms (mejor 300 ms), 0 falsas alarmas, 0 omisiones')
  })
})
