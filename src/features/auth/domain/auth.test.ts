import { describe, it, expect } from 'vitest'
import { canEditIn, homeFor, isStaff, panelFromPath, roleAllowed } from './roles'
import { firstFailedRule, isValidEmail } from './password'
import { dismissGuide, guideSeen, resetGuides } from './onboarding'

describe('roles y paneles', () => {
  it('solo el personal tiene panel', () => {
    expect(homeFor('admin')).toBe('/admin')
    expect(homeFor('instructor')).toBe('/instructor')
    expect(homeFor('developer')).toBe('/developer')
    expect(homeFor('player')).toBeNull()
    expect(isStaff('player')).toBe(false)
  })

  it('el panel sale de la URL y el de soporte es de solo lectura', () => {
    expect(panelFromPath('/instructor/sessions/1')).toBe('/instructor')
    expect(panelFromPath('/developer/users')).toBe('/developer')
    expect(panelFromPath('/admin/users')).toBe('/admin')
    expect(canEditIn('/developer')).toBe(false)
    expect(canEditIn('/admin')).toBe(true)
  })

  it('rutas protegidas por rol', () => {
    expect(roleAllowed('instructor', ['admin'])).toBe(false)
    expect(roleAllowed('admin', ['developer', 'admin'])).toBe(true)
    expect(roleAllowed(undefined, ['admin'])).toBe(true)
  })
})

describe('contraseña y correo', () => {
  it('reglas de la nueva contraseña', () => {
    expect(firstFailedRule('corta')?.label).toBe('Mínimo 8 caracteres')
    expect(firstFailedRule('sinmayuscula1')?.label).toBe('Al menos una mayúscula')
    expect(firstFailedRule('SinNumeros')?.label).toBe('Al menos un número')
    expect(firstFailedRule('Segura123')).toBeNull()
  })

  it('formato de correo', () => {
    expect(isValidEmail('ana@empresa.com')).toBe(true)
    expect(isValidEmail('ana@empresa')).toBe(false)
  })
})

describe('guías de bienvenida', () => {
  it('la de analíticas usa su bandera propia', () => {
    const state = resetGuides()
    expect(guideSeen({ ...state, ...dismissGuide(state, 'dashboard') }, 'dashboard')).toBe(true)
    const next = { ...state, ...dismissGuide(state, 'users') }
    expect(guideSeen(next, 'users')).toBe(true)
    expect(guideSeen(next, 'sessions')).toBe(false)
  })
})
