import { describe, it, expect } from 'vitest'
import { filterLocations, searchLocations, findLocation } from './locations'
import type { Location } from './locations'

const loc = (id: string, municipality: string, department: string, is_active = true): Location =>
  ({ id, municipality, department, country: 'Colombia', is_active })

const LIST = [
  loc('1', 'Cúcuta', 'Norte de Santander'),
  loc('2', 'Sardinata', 'Norte de Santander'),
  loc('3', 'Santa Marta', 'Magdalena', false),
  loc('4', 'El Zulia', 'Norte de Santander'),
]

describe('localidades', () => {
  it('busca sin tildes y pone primero los municipios que empiezan con lo escrito', () => {
    expect(searchLocations(LIST, 'cucuta').map(l => l.id)).toEqual(['1'])
    expect(searchLocations(LIST, 'sa').map(l => l.id)).toEqual(['2', '1', '4'])
  })

  it('el selector no ofrece localidades deshabilitadas', () => {
    expect(searchLocations(LIST, 'santa').map(l => l.id)).toEqual(['1', '2', '4'])
    expect(searchLocations(LIST, '')).toHaveLength(3)
  })

  it('filtra la lista por texto y estado', () => {
    expect(filterLocations(LIST, 'magdalena', 'all').map(l => l.id)).toEqual(['3'])
    expect(filterLocations(LIST, '', 'inactive').map(l => l.id)).toEqual(['3'])
    expect(filterLocations(LIST, 'norte', 'active')).toHaveLength(3)
  })

  it('encuentra por id', () => {
    expect(findLocation(LIST, '4')?.municipality).toBe('El Zulia')
    expect(findLocation(undefined, '4')).toBeNull()
  })
})
