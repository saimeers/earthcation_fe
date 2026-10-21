import { describe, it, expect } from 'vitest'
import { errorRatePct, fillMinutes, formatUptime, latencyTone } from './health'

describe('salud del servicio', () => {
  it('formatea el tiempo en línea', () => {
    expect(formatUptime(null)).toBe('—')
    expect(formatUptime(90)).toBe('1 min')
    expect(formatUptime(3661)).toBe('1 h 1 min')
    expect(formatUptime(93784)).toBe('1 d 2 h')
  })

  it('semáforo de latencia', () => {
    expect(latencyTone(null)).toBe('var(--status-neutral)')
    expect(latencyTone(120)).toBe('var(--status-good)')
    expect(latencyTone(500)).toBe('var(--status-warning)')
    expect(latencyTone(1500)).toBe('var(--status-critical)')
  })

  it('tasa de error', () => {
    expect(errorRatePct(undefined, undefined)).toBe(0)
    expect(errorRatePct(0, 0)).toBe(0)
    expect(errorRatePct(200, 2)).toBe(1)
  })

  it('rellena los minutos sin tráfico para que la escala de tiempo sea real', () => {
    const until = new Date('2026-01-01T00:04:30Z').getTime()
    const series = fillMinutes([{ minute: '2026-01-01T00:02:00.000Z', requests: 5, errors: 1 }], 5, until)
    expect(series).toHaveLength(5)
    expect(series.map(d => d.requests)).toEqual([0, 0, 5, 0, 0])
    expect(series[series.length - 1].minute).toBe('2026-01-01T00:04:00.000Z')
  })
})
