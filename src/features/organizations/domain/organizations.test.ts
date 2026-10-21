import { describe, it, expect } from 'vitest'
import { filterOrganizations, selectableOrganizations, toOrganizationInput, type Organization } from './organizations'

const org = (id: string, name: string, type: string | null, is_active = true): Organization => ({ id, name, type, is_active })
const LIST = [org('1', 'Mina La Prueba', 'empresa'), org('2', 'Coomineros', 'cooperativa', false), org('3', 'SENA', null)]

describe('organizaciones', () => {
  it('busca por nombre o tipo y filtra por estado', () => {
    expect(filterOrganizations(LIST, 'COOP', 'all').map(o => o.id)).toEqual(['2'])
    expect(filterOrganizations(LIST, '', 'active').map(o => o.id)).toEqual(['1', '3'])
    expect(filterOrganizations(LIST, '', 'inactive').map(o => o.id)).toEqual(['2'])
  })

  it('el selector conserva la organización elegida aunque esté deshabilitada', () => {
    expect(selectableOrganizations(LIST, '2').map(o => o.id)).toEqual(['1', '2', '3'])
    expect(selectableOrganizations(LIST, '').map(o => o.id)).toEqual(['1', '3'])
  })

  it('formulario vacío o con los datos de la organización', () => {
    expect(toOrganizationInput(null)).toEqual({ name: '', type: '' })
    expect(toOrganizationInput(LIST[2])).toEqual({ name: 'SENA', type: '' })
  })
})
