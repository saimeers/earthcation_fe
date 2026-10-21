import { describe, it, expect } from 'vitest'
import { depthAt, formatDepth } from './depth'

const anchors = [
  { offset: 0, depth: 0 },
  { offset: 1000, depth: 40 },
  { offset: 2000, depth: 120 },
]

describe('depthAt', () => {
  it('antes de la primera ancla marca la profundidad de la superficie', () => {
    expect(depthAt(-50, anchors)).toBe(0)
  })

  it('interpola entre dos estratos y redondea al metro', () => {
    expect(depthAt(500, anchors)).toBe(20)
    expect(depthAt(1500, anchors)).toBe(80)
    expect(depthAt(1333, anchors)).toBe(67)
  })

  it('en la ancla exacta marca su profundidad', () => {
    expect(depthAt(1000, anchors)).toBe(40)
  })

  it('pasado el último estrato se queda en el fondo', () => {
    expect(depthAt(5000, anchors)).toBe(120)
  })

  it('dos anclas en la misma posición no dividen por cero', () => {
    expect(depthAt(1000, [{ offset: 1000, depth: 40 }, { offset: 1000, depth: 120 }])).toBe(40)
    expect(depthAt(1000, [{ offset: 0, depth: 0 }, { offset: 1000, depth: 40 }, { offset: 1000, depth: 120 }])).toBe(40)
  })

  it('sin anclas marca la superficie', () => {
    expect(depthAt(300, [])).toBe(0)
  })
})

describe('formatDepth', () => {
  it('usa el signo menos tipográfico bajo tierra', () => {
    expect(formatDepth(0)).toBe('0 m')
    expect(formatDepth(120)).toBe('−120 m')
  })
})
