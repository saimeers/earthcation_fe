import { describe, it, expect } from 'vitest'
import { capitalize, formatBytes, formatDuration, formatNumber, formatPct, formatSeconds, fullName, initials, minutesBetween, normalizeText, times } from './format'

describe('format', () => {
  it('duraciones y porcentajes', () => {
    expect(formatDuration(154321)).toBe('2:34')
    expect(formatDuration(null)).toBe('—')
    expect(formatSeconds(8123)).toBe('8,1 s')
    expect(formatPct(79.6)).toBe('80%')
    expect(formatPct(undefined)).toBe('—')
    expect(formatNumber(1234.56, 1)).toBe('1.234,6')
  })

  it('nombres', () => {
    expect(fullName({ first_name: 'Ana', last_name: 'Ruiz' })).toBe('Ana Ruiz')
    expect(fullName({ username: '1090' })).toBe('1090')
    expect(initials({ first_name: 'ana', last_name: 'ruiz' })).toBe('AR')
    expect(initials(null, 'U')).toBe('U')
  })

  it('texto, fechas y tamaños', () => {
    expect(normalizeText('  Cúcuta ')).toBe('cucuta')
    expect(capitalize('lunes')).toBe('Lunes')
    expect(times(1)).toBe('1 vez')
    expect(times(3)).toBe('3 veces')
    expect(minutesBetween('2026-10-20T10:00:00Z', '2026-10-20T10:30:00Z')).toBe(30)
    expect(minutesBetween(null, '2026-10-20T10:30:00Z')).toBeNull()
    expect(formatBytes(3 * 1048576)).toBe('3.0 MB')
    expect(formatBytes(100)).toBe('1 KB')
  })
})
