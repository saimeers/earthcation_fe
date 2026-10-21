import { describe, it, expect } from 'vitest'
import { STRATA, currentStratum, stratum } from './content'

describe('estratos', () => {
  it('bajan en orden: cada sección es más profunda que la anterior', () => {
    const depths = STRATA.map((s) => s.depth)
    expect(depths).toEqual([...depths].sort((a, b) => a - b))
    expect(new Set(depths).size).toBe(depths.length)
  })

  it('currentStratum devuelve el último estrato alcanzado', () => {
    expect(currentStratum(0).id).toBe('superficie')
    expect(currentStratum(39).id).toBe('superficie')
    expect(currentStratum(40).id).toBe('como-funciona')
    expect(currentStratum(199).id).toBe('protocolos')
    expect(currentStratum(250).id).toBe('instructores')
  })

  it('stratum busca por id', () => {
    expect(stratum('protocolos').depth).toBe(120)
  })
})
