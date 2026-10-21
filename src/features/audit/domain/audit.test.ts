import { describe, expect, it } from 'vitest'
import { ACTIONS, actionLabel, describeChanges, hasFilters, NO_FILTERS, roleLabel, toQuery } from './audit'

describe('auditoría', () => {
  it('nombra cada acción y deja pasar una desconocida', () => {
    expect(actionLabel('session.started')).toBe('Sesión iniciada')
    expect(actionLabel('algo.nuevo')).toBe('algo.nuevo')
    expect(ACTIONS).toContain('user.anonymized')
  })

  it('nombra el rol y el actor ausente', () => {
    expect(roleLabel('developer')).toBe('Soporte')
    expect(roleLabel(null)).toBe('Sin sesión')
  })

  it('describe los campos cambiados y los conteos', () => {
    expect(describeChanges({ fields: ['age', 'firstName'] })).toBe('Campos: edad, nombre')
    expect(describeChanges({ errors: 0, created: 3, skipped: 1 })).toBe('errores 0 · creados 3 · omitidos 1')
    expect(describeChanges({})).toBe('')
  })

  it('arma la consulta: acción y días completos en hora local', () => {
    expect(toQuery(NO_FILTERS)).toEqual({})
    const query = toQuery({ action: 'user.created', from: '2026-10-01', to: '2026-10-02' })
    expect(query.action).toBe('user.created')
    expect(new Date(query.from).getHours()).toBe(0)
    expect(new Date(query.to).getHours()).toBe(23)
  })

  it('sabe si hay filtros puestos', () => {
    expect(hasFilters(NO_FILTERS)).toBe(false)
    expect(hasFilters({ ...NO_FILTERS, from: '2026-10-01' })).toBe(true)
  })
})
