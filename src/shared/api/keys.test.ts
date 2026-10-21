import { describe, expect, it } from 'vitest'
import { camelKeys, snakeKeys } from './keys'

describe('claves de la API v1', () => {
  it('pasa de camelCase a snake_case en objetos y listas anidadas', () => {
    expect(snakeKeys({ firstName: 'Ana', sessions: [{ startedAt: 'x', isFreePlay: false }], location: { isActive: true } }))
      .toEqual({ first_name: 'Ana', sessions: [{ started_at: 'x', is_free_play: false }], location: { is_active: true } })
  })

  it('pasa de snake_case a camelCase', () => {
    expect(camelKeys({ size_bytes: 10, rows: [{ first_name: 'Ana', location_municipality: 'Cúcuta' }] }))
      .toEqual({ sizeBytes: 10, rows: [{ firstName: 'Ana', locationMunicipality: 'Cúcuta' }] })
  })

  it('deja intactas las claves de un diccionario ya en snake_case y el contenido libre de un evento', () => {
    expect(snakeKeys({ failReasons: { gas_leak: 2 }, payload: { someKey: 1, other_key: 2 } }))
      .toEqual({ fail_reasons: { gas_leak: 2 }, payload: { someKey: 1, other_key: 2 } })
  })

  it('no toca valores: textos, nulos, fechas ni números', () => {
    expect(snakeKeys({ createdAt: '2026-10-21T00:00:00.000Z', deletedAt: null, camelValue: 'someValue', n: 3 }))
      .toEqual({ created_at: '2026-10-21T00:00:00.000Z', deleted_at: null, camel_value: 'someValue', n: 3 })
  })

  it('deja pasar un archivo o un formulario tal cual', () => {
    const form = new FormData()
    expect(camelKeys(form)).toBe(form)
  })
})
