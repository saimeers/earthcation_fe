import { describe, it, expect } from 'vitest'
import type { Polygon } from 'geojson'
import {
  completionTotals, levelOutcomes, organizationRanking, searchVark, topFailReasons, trendDelta, varkDistribution, varkScores,
  type VarkEntry,
} from './overview'
import {
  anchorFor, buildMarkers, insideRing, levenshtein, matchDept, minesByDepartment, mitigationLevel, playersByDepartment,
  sequentialStep, type Mine,
} from './minesMap'

describe('resumen de analíticas', () => {
  it('agrupa los intentos por nivel y calcula la tasa de completados', () => {
    const outcomes = levelOutcomes([
      { level_key: 'level2', outcome: 'completed', count: 1 },
      { level_key: 'level1', outcome: 'failed', count: 2 },
      { level_key: 'level1', outcome: 'completed', count: 1 },
      { level_key: 'level1', outcome: 'in_progress', count: 5 },
    ])
    expect(outcomes.map(l => l.level_key)).toEqual(['level1', 'level2'])
    expect(outcomes[0]).toMatchObject({ completed: 1, failed: 2, in_progress: 5 })
    expect(completionTotals(outcomes)).toEqual({ completed: 2, finished: 4 })
  })

  it('causas de fallo, tendencia y VARK', () => {
    expect(topFailReasons([{ level_key: 'level1', fail_reason: null, count: 2 }, { level_key: 'level1', fail_reason: 'derrumbe', count: 3 }]))
      .toEqual([{ key: 'derrumbe', value: 3 }, { key: 'desconocido', value: 2 }])
    expect(trendDelta([{ week: 'a', total: 1, mitigated: 1, percentage: 50 }, { week: 'b', total: 1, mitigated: 1, percentage: 62 }])).toBe(12)
    expect(trendDelta([])).toBeNull()
    expect(varkDistribution([{ style: 'Visual', count: 3 }, { style: 'Auditivo', count: 0 }])).toEqual({ styles: [{ style: 'Visual', count: 3 }], total: 3 })
  })

  it('ranking de una organización y tabla VARK', () => {
    const { rows, avg } = organizationRanking([
      { percentage: 40, mitigated: 2, total_attempts: 5, dominant_style: null },
      { percentage: 90, mitigated: 9, total_attempts: 10, dominant_style: 'Visual' },
    ])
    expect(rows.map(r => r.percentage)).toEqual([90, 40])
    expect(avg).toBe(65)
    expect(organizationRanking([]).avg).toBeNull()

    const entry: VarkEntry = { user_id: 'u', visual_score: 4, auditory_score: null, reading_score: 2, dominant_style: 'Visual', user: { id: 'u', first_name: 'Ana', last_name: 'Ruiz', cedula: '1090', profile: { organization: { name: 'Mina' } } } }
    expect(searchVark([entry], 'mina')).toHaveLength(1)
    expect(searchVark([entry], 'pedro')).toHaveLength(0)
    expect(varkScores(entry).total).toBe(6)
  })
})

describe('mapa de minas', () => {
  const square: Polygon = { type: 'Polygon', coordinates: [[[-73, 7], [-72, 7], [-72, 8], [-73, 8], [-73, 7]]] }

  it('empareja departamentos con typos y alias', () => {
    const names = ['NORTE DE SANTANDER', 'BOGOTÁ, D.C.', 'ANTIOQUIA']
    expect(levenshtein('ANTIOQIA', 'ANTIOQUIA')).toBe(1)
    expect(matchDept('Norte de Santnder', names)).toBe('NORTE DE SANTANDER')
    expect(matchDept('Bogota', names)).toBe('BOGOTÁ, D.C.')
    expect(matchDept('Amazonas', names)).toBeNull()
  })

  it('el ancla cae dentro del departamento', () => {
    const anchor = anchorFor(square)
    expect(anchor).not.toBeNull()
    expect(insideRing(anchor!, square.coordinates[0])).toBe(true)
  })

  it('un punto por municipio, repartidos dentro del departamento', () => {
    const mine = (id: string, municipality: string, percentage: number, extra: Partial<Mine> = {}): Mine =>
      ({ id, name: id, municipality, department: 'Norte de Santander', player_count: 2, results: 1, percentage, ...extra })
    const grouped = minesByDepartment([mine('a', 'Cúcuta', 100), mine('b', 'Cúcuta', 50), mine('c', 'Sardinata', 20, { lat: 8.08, lng: -72.8 })], ['NORTE DE SANTANDER'])
    expect(playersByDepartment(grouped)).toEqual({ 'NORTE DE SANTANDER': 6 })
    const markers = buildMarkers([{ name: 'NORTE DE SANTANDER', geometry: square }], grouped)
    expect(markers.map(m => [m.municipality, m.pct, m.players])).toEqual([['Cúcuta', 75, 4], ['Sardinata', 20, 2]])
    expect(insideRing(markers[0].position, square.coordinates[0])).toBe(true)
    expect(markers[1].position).toEqual([8.08, -72.8])
  })

  it('escalas de color', () => {
    expect(sequentialStep(0, 10, 5)).toBeNull()
    expect(sequentialStep(10, 10, 5)).toBe(4)
    expect(sequentialStep(1, 10, 5)).toBe(0)
    expect(mitigationLevel(80)).toBe('high')
    expect(mitigationLevel(40)).toBe('mid')
    expect(mitigationLevel(39)).toBe('low')
  })
})
