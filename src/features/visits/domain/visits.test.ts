import { describe, it, expect } from 'vitest'
import { countryName, fillDays, pct, placeLabel, sumCount } from './visits'

describe('visitas', () => {
  it('porcentaje sobre un total', () => {
    expect(pct(0, 0)).toBe('')
    expect(pct(25, 100)).toBe('25%')
    expect(pct(1, 3)).toBe('33%')
  })

  it('suma conteos', () => {
    expect(sumCount([{ count: 2 }, { count: 3 }])).toBe(5)
    expect(sumCount([])).toBe(0)
  })

  it('nombre del país y etiqueta del lugar', () => {
    expect(countryName('CO')).toBe('Colombia')
    expect(countryName('XX')).toBe('XX')
    expect(placeLabel({ country: 'CO', region: 'Norte de Santander', count: 5 })).toBe('Norte de Santander')
    expect(placeLabel({ country: 'VE', region: 'Táchira', count: 2 })).toBe('Táchira (Venezuela)')
  })

  it('rellena los días sin visitas para que la escala de tiempo sea real', () => {
    const since = '2026-01-01T00:00:00.000Z'
    const series = fillDays([{ day: '2026-01-02', visits: 4, unique: 3 }], 3, since)
    expect(series.map(d => d.day)).toEqual(['2026-01-01', '2026-01-02', '2026-01-03'])
    expect(series.map(d => d.visits)).toEqual([0, 4, 0])
  })
})
